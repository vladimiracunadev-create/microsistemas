#!/usr/bin/env node
/**
 * Adaptador de línea de comandos.
 *
 * Reutiliza el mismo núcleo que la interfaz web mediante un lector de JSON
 * basado en el sistema de archivos. No duplica el motor en otro lenguaje.
 *
 * Uso:
 *   node adapters/cli/sas.mjs <comando> [argumentos]
 *
 * Comandos:
 *   familias                      Lista las familias del catálogo
 *   tipos [--familia=<id>]        Lista los tipos de sistema
 *   buscar <texto>                Busca tipos por nombre, sigla o capacidad
 *   tipo <id>                     Muestra la definición completa de un tipo
 *   dimensiones                   Lista las dimensiones de clasificación
 *   doctor                        Verifica la integridad del catálogo
 *   ejemplos                      Lista las configuraciones de ejemplo
 *   validar <config.json>         Valida una configuración
 *   compatibilidad <config.json>  Evalúa reglas de compatibilidad
 *   capacidad <config.json>       Calcula el dimensionamiento
 *   evolucion <config.json>       Proyecta la evolución temporal
 *   arquitectura <config.json>    Propone la arquitectura
 *   prompts <config.json> [--id=<id>] [--salida=<dir>]
 *   especificacion <config.json> [--salida=<dir>]
 *   paquete <config.json> --salida=<dir>
 *   resumen <config.json>         Resumen compacto en JSON
 *
 * Opciones generales:
 *   --json        Imprime el resultado como JSON
 *   --fecha=<iso> Fija la marca de tiempo, para resultados reproducibles
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadCatalog, validateCatalogIntegrity } from '../../core/catalog/catalog.js';
import { analyze, documents, summarize, zipBundle, bundleFiles } from '../../core/engine.js';
import { parseConfigJson } from '../../core/validation/validator.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(HERE, '../..');
const DATA_DIR = join(APP_ROOT, 'data');
const EXAMPLES_DIR = join(APP_ROOT, 'templates', 'systems');

/** Lector de JSON desde el sistema de archivos, con rutas acotadas a `data/`. */
export function createFsReader(baseDir = DATA_DIR) {
  return async function readJson(relativePath) {
    if (relativePath.includes('..')) {
      throw new Error(`Ruta no permitida: ${relativePath}`);
    }
    const full = join(baseDir, relativePath);
    const text = await readFile(full, 'utf8');
    return JSON.parse(text);
  };
}

export async function loadCatalogForCli(options = {}) {
  return loadCatalog(createFsReader(options.baseDir), options);
}

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (const arg of argv) {
    if (arg.startsWith('--')) {
      const [key, ...rest] = arg.slice(2).split('=');
      flags[key] = rest.length ? rest.join('=') : true;
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

async function readConfigFile(path) {
  if (!path) throw new Error('Falta la ruta del archivo de configuración.');
  const text = await readFile(resolve(process.cwd(), path), 'utf8');
  const parsed = parseConfigJson(text);
  if (!parsed.ok) {
    throw new Error(`Configuración no válida:\n${parsed.errors.map((e) => `  - ${e}`).join('\n')}`);
  }
  for (const warning of parsed.warnings) {
    process.stderr.write(`Aviso: ${warning}\n`);
  }
  return parsed.config;
}

function out(text) {
  process.stdout.write(`${text}\n`);
}

function asJson(value) {
  return JSON.stringify(value, null, 2);
}

async function writeFiles(targetDir, files) {
  const base = resolve(process.cwd(), targetDir);
  const written = [];
  for (const [relative, content] of Object.entries(files)) {
    if (relative.includes('..')) throw new Error(`Ruta de salida no permitida: ${relative}`);
    const full = join(base, relative);
    await mkdir(dirname(full), { recursive: true });
    if (content instanceof Uint8Array) await writeFile(full, content);
    else await writeFile(full, content, 'utf8');
    written.push(full);
  }
  return written;
}

const COMMANDS = {
  async familias(_args, flags) {
    const catalog = await loadCatalogForCli();
    if (flags.json) return out(asJson(catalog.families));
    out(`Familias del catálogo (versión ${catalog.versions.catalogIndex}, actualizado ${catalog.versions.updatedAt})\n`);
    for (const family of catalog.families) {
      out(`  ${family.id.padEnd(12)} ${String(catalog.byFamily(family.id).length).padStart(3)} tipos  ${family.name}`);
    }
    out(`\nTotal: ${catalog.systems.length} tipos de sistema en ${catalog.families.length} familias.`);
  },

  async tipos(_args, flags) {
    const families = flags.familia ? [String(flags.familia)] : undefined;
    const catalog = await loadCatalogForCli({ families });
    const rows = catalog.systems.map((s) => ({ id: s.id, acronym: s.acronym, name: s.canonicalName, family: s.family }));
    if (flags.json) return out(asJson(rows));
    for (const r of rows) {
      out(`  ${r.id.padEnd(24)} ${r.acronym.padEnd(10)} ${r.family.padEnd(12)} ${r.name}`);
    }
    out(`\n${rows.length} tipo(s).`);
  },

  async buscar(args, flags) {
    const query = args.join(' ');
    if (!query) throw new Error('Indique el texto a buscar.');
    const catalog = await loadCatalogForCli();
    const hits = catalog.search(query);
    if (flags.json) return out(asJson(hits.map((h) => ({ id: h.id, acronym: h.acronym, name: h.canonicalName }))));
    if (!hits.length) return out('Sin resultados.');
    for (const h of hits) out(`  ${h.id.padEnd(24)} ${h.acronym.padEnd(10)} ${h.canonicalName}`);
  },

  async tipo(args, flags) {
    const id = args[0];
    if (!id) throw new Error('Indique el identificador del tipo.');
    const catalog = await loadCatalogForCli();
    const system = catalog.getSystem(id);
    if (!system) throw new Error(`El tipo "${id}" no existe en el catálogo.`);
    if (flags.json) return out(asJson(system));
    out(`${system.acronym} — ${system.canonicalName}`);
    out(`Familia: ${catalog.getFamily(system.family)?.name} / ${system.subdomain}`);
    out(`Versión de la entrada: ${system.entryVersion} (${system.updatedAt})\n`);
    out(`${system.formalDescription}\n`);
    out(`En términos simples: ${system.pedagogicalDescription}\n`);
    const section = (title, items) => {
      out(title);
      for (const i of items || []) out(`  - ${i}`);
      out('');
    };
    section('Sinónimos:', system.synonyms);
    section('Capacidades habituales:', system.capabilities);
    section('Relaciones:', system.relations);
    section('Dependencias:', system.dependencies);
    section('Restricciones:', system.constraints);
    section('Estándares:', system.standards);
    section('Fuentes:', system.sources);
  },

  async dimensiones(_args, flags) {
    const catalog = await loadCatalogForCli();
    if (flags.json) return out(asJson(catalog.dimensions));
    for (const dim of catalog.dimensions) {
      out(`\n${dim.name} (${dim.id})${dim.multiple ? ' — selección múltiple' : ' — selección única'}`);
      out(`  ${dim.description}`);
      for (const opt of dim.options) out(`    ${opt.id.padEnd(22)} ${opt.name}`);
    }
  },

  async doctor(_args, flags) {
    const catalog = await loadCatalogForCli();
    const problems = validateCatalogIntegrity(catalog);
    if (flags.json) return out(asJson({ ok: problems.length === 0, problems, systems: catalog.systems.length }));
    out(`Catálogo: ${catalog.systems.length} tipos, ${catalog.families.length} familias, ${catalog.dimensions.length} dimensiones, ${catalog.rules.length} reglas.`);
    if (!problems.length) {
      out('Integridad del catálogo: sin problemas.');
      return;
    }
    out(`\n${problems.length} problema(s):`);
    for (const p of problems) out(`  [${p.level}] ${p.scope}: ${p.message}`);
    process.exitCode = 1;
  },

  async ejemplos(_args, flags) {
    const index = JSON.parse(await readFile(join(EXAMPLES_DIR, 'index.json'), 'utf8'));
    if (flags.json) return out(asJson(index));
    out(`Configuraciones de ejemplo (${index.examples.length}):\n`);
    for (const ex of index.examples) {
      out(`  ${ex.id.padEnd(28)} ${ex.file.padEnd(34)} ${ex.name}`);
    }
    out('\nUso: node adapters/cli/sas.mjs resumen apps/SystemArchitectStudio/templates/systems/<archivo>');
  },

  async validar(args, flags) {
    const config = await readConfigFile(args[0]);
    const catalog = await loadCatalogForCli();
    const bundle = analyze(config, catalog, { now: flags.fecha });
    if (flags.json) return out(asJson(bundle.validation));
    const v = bundle.validation;
    out(`Configuración: ${config.identity.name || '(sin nombre)'}`);
    out(`Esquema: ${config.schemaVersion} · huella: ${bundle.fingerprint}`);
    out(`Válida: ${v.ok ? 'sí' : 'no'} · completitud ${v.completeness.percent}%\n`);
    for (const e of v.errors) out(`  [error]   ${e.path}: ${e.message}`);
    for (const w of v.warnings) out(`  [aviso]   ${w.path}: ${w.message}`);
    for (const i of v.info) out(`  [info]    ${i.path}: ${i.message}`);
    out('\nCompletitud por sección:');
    for (const s of v.completeness.sections) out(`  ${s.label.padEnd(28)} ${String(s.percent).padStart(3)}%  (${s.declared}/${s.total})`);
    if (!v.ok) process.exitCode = 1;
  },

  async compatibilidad(args, flags) {
    const config = await readConfigFile(args[0]);
    const catalog = await loadCatalogForCli();
    const bundle = analyze(config, catalog, { now: flags.fecha });
    if (flags.json) return out(asJson(bundle.compatibility));
    const c = bundle.compatibility;
    out(`Reglas evaluadas: ${c.rulesEvaluated}`);
    out(`Errores: ${c.counts.error} · Advertencias: ${c.counts.warning} · Informativos: ${c.counts.info}\n`);
    for (const f of c.findings) {
      out(`[${f.severity}] ${f.id} — ${f.title}`);
      out(`  ${f.message}`);
      out(`  Por qué: ${f.rationale}`);
      out(`  Recomendación: ${f.recommendation}\n`);
    }
    if (c.counts.error > 0) process.exitCode = 1;
  },

  async capacidad(args, flags) {
    const config = await readConfigFile(args[0]);
    const catalog = await loadCatalogForCli();
    const bundle = analyze(config, catalog, { now: flags.fecha });
    if (flags.json) return out(asJson(bundle.capacity));
    const cap = bundle.capacity;
    out(`Dimensionamiento de ${config.identity.name || '(sin nombre)'}\n`);
    for (const r of cap.results) {
      out(`  ${r.label}: ${r.value} ${r.unit}`);
      out(`    fórmula: ${r.formula}`);
      if (r.range) out(`    rango: ${r.range.low} – ${r.range.high}`);
      if (r.note) out(`    nota: ${r.note}`);
    }
    if (cap.assumptions.length) {
      out('\nSupuestos del motor:');
      for (const a of cap.assumptions) out(`  - ${a.text}\n      ${a.because}`);
    }
    if (cap.bottlenecks.length) {
      out('\nCuellos de botella potenciales:');
      for (const b of cap.bottlenecks) out(`  - ${b.component}: ${b.reason}\n      Mitigación: ${b.mitigation}\n      Validación: ${b.validation}`);
    }
    if (cap.cost) {
      out(`\nCosto mensual estimado: ${cap.cost.monthlyUsd} USD (rango ${cap.cost.range.low} – ${cap.cost.range.high})`);
      if (cap.cost.budgetNote) out(`  ${cap.cost.budgetNote}`);
    }
    out(`\n${cap.disclaimer}`);
  },

  async evolucion(args, flags) {
    const config = await readConfigFile(args[0]);
    const catalog = await loadCatalogForCli();
    const bundle = analyze(config, catalog, { now: flags.fecha });
    if (flags.json) return out(asJson(bundle.evolution));
    const ev = bundle.evolution;
    out(`Horizonte: ${ev.horizon.openEnded ? `sin término conocido (ventana ${ev.horizon.months} meses)` : `${ev.horizon.months} meses`}`);
    out(`Modelo: ${ev.modelName}\n`);
    for (const s of ev.scenarios) {
      out(`Escenario ${s.name} (${s.annualRatePercent}% anual):`);
      for (const p of s.points) {
        out(`  mes ${String(p.month).padStart(3)}: ${String(p.users).padStart(12)} usuarios · ${String(p.peakRps).padStart(10)} req/s · ${String(p.cumulativeStorageGb).padStart(10)} GB acum.`);
      }
      out('');
    }
    out('Etapas:');
    for (const s of ev.stages) out(`  ${s.name} (${s.label}): ${s.focus}\n      Salida: ${s.exitCondition}`);
    out('\nHitos:');
    for (const m of ev.milestones) out(`  - ${m.name} — ${m.expression} [${m.origin}]`);
    out(`\nRevisión arquitectónica cada ${ev.reviewPlan.frequencyMonths} meses.`);
    out(`\n${ev.disclaimer}`);
  },

  async arquitectura(args, flags) {
    const config = await readConfigFile(args[0]);
    const catalog = await loadCatalogForCli();
    const bundle = analyze(config, catalog, { now: flags.fecha });
    if (flags.json) return out(asJson(bundle.architecture));
    const a = bundle.architecture;
    out(`Estilo recomendado: ${a.style.label} (${a.style.recommended})`);
    for (const r of a.style.reasons) out(`  - ${r}`);
    if (a.divergence) out(`\nAviso: ${a.divergence.message}`);
    out('\nComponentes:');
    for (const c of a.components) out(`  ${c.name}\n      ${c.responsibility}\n      Límite: ${c.boundary}`);
    out('\nContratos:');
    for (const c of a.contracts) out(`  ${c.id} (${c.kind}): ${c.description}`);
    out('\nCondiciones para rediseñar:');
    for (const c of a.redesignConditions) out(`  - ${c}`);
  },

  async prompts(args, flags) {
    const config = await readConfigFile(args[0]);
    const catalog = await loadCatalogForCli();
    const ids = flags.id ? String(flags.id).split(',') : undefined;
    const bundle = analyze(config, catalog, { now: flags.fecha, promptIds: ids });
    if (flags.salida) {
      const files = {};
      for (const p of bundle.prompts.prompts) files[p.filename] = p.markdown;
      const written = await writeFiles(String(flags.salida), files);
      out(`${written.length} prompt(s) escrito(s) en ${resolve(process.cwd(), String(flags.salida))}`);
      return;
    }
    if (flags.json) {
      return out(asJson(bundle.prompts.prompts.map((p) => ({ id: p.id, name: p.name, filename: p.filename, length: p.markdown.length }))));
    }
    if (ids && ids.length === 1) {
      const prompt = bundle.prompts.prompts[0];
      if (!prompt) throw new Error(`No hay prompt con identificador "${ids[0]}" aplicable a esta configuración.`);
      return out(prompt.markdown);
    }
    out(`${bundle.prompts.prompts.length} prompt(s) aplicables:\n`);
    for (const p of bundle.prompts.prompts) out(`  ${p.id.padEnd(22)} ${p.name}`);
    out('\nUse --id=<id> para imprimir uno, o --salida=<dir> para escribirlos todos.');
  },

  async especificacion(args, flags) {
    const config = await readConfigFile(args[0]);
    const catalog = await loadCatalogForCli();
    const bundle = analyze(config, catalog, { now: flags.fecha });
    const docs = documents(bundle);
    if (flags.salida) {
      const written = await writeFiles(String(flags.salida), docs);
      out(`${written.length} documento(s) escrito(s) en ${resolve(process.cwd(), String(flags.salida))}`);
      return;
    }
    out(docs['especificacion.md']);
  },

  async paquete(args, flags) {
    const config = await readConfigFile(args[0]);
    const catalog = await loadCatalogForCli();
    const bundle = analyze(config, catalog, { now: flags.fecha });
    if (!flags.salida) throw new Error('Indique el directorio de salida con --salida=<dir>.');
    const files = bundleFiles(bundle);
    const written = await writeFiles(String(flags.salida), files);
    if (flags.zip) {
      const zip = zipBundle(bundle);
      await writeFiles(String(flags.salida), { [zip.filename]: zip.bytes });
      out(`Paquete ZIP: ${zip.filename}`);
    }
    out(`${written.length} archivo(s) escrito(s) en ${resolve(process.cwd(), String(flags.salida))}`);
    out(`Huella de configuración: ${bundle.fingerprint}`);
  },

  async resumen(args, flags) {
    const config = await readConfigFile(args[0]);
    const catalog = await loadCatalogForCli();
    const bundle = analyze(config, catalog, { now: flags.fecha });
    out(asJson(summarize(bundle)));
  },

  async ayuda() {
    const text = await readFile(fileURLToPath(import.meta.url), 'utf8');
    const block = text.split('/**')[1].split('*/')[0];
    out(block.replace(/^\s*\*\s?/gm, '').trim());
    out('\nSystem Architect Studio — microsistema de la suite Microsistemas.');
  }
};

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const command = positional.shift() || 'ayuda';
  const handler = COMMANDS[command] || (flags.help ? COMMANDS.ayuda : null);
  if (!handler) {
    process.stderr.write(`Comando desconocido: ${command}\nUse "ayuda" para ver los comandos disponibles.\n`);
    process.exitCode = 2;
    return;
  }
  await handler(positional, flags);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main().catch((err) => {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exitCode = 1;
  });
}

export { COMMANDS, parseArgs, main };
