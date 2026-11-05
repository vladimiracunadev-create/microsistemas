/**
 * Exportaciones: documentos, paquete, ZIP y reproducibilidad.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { analyze, documents, bundleFiles, zipBundle } from '../core/engine.js';
import { createZip, crc32 } from '../core/export/zip.js';
import { loadCatalogForCli } from '../adapters/cli/sas.mjs';
import { readExample } from './helpers.mjs';

const execFileAsync = promisify(execFile);
const catalog = await loadCatalogForCli();
const FIXED_DATE = '2026-11-04T12:00:00.000Z';

async function analyzeExample(file, overrides = {}) {
  const config = { ...await readExample(file), ...overrides };
  return analyze(config, catalog, { now: FIXED_DATE });
}

test('los cinco documentos se generan con contenido', async () => {
  const bundle = await analyzeExample('a-crm-50-usuarios.json');
  const docs = documents(bundle);
  const expected = ['especificacion.md', 'plan-arquitectura.md', 'plan-escalabilidad.md', 'roadmap.md', 'plan-pruebas.md'];
  assert.deepEqual(Object.keys(docs).sort(), expected.slice().sort());
  for (const [name, content] of Object.entries(docs)) {
    assert.ok(content.length > 1500, `${name} parece vacío (${content.length} caracteres)`);
    assert.ok(content.startsWith('# '), `${name} no empieza con un título`);
    assert.ok(content.includes('CRM Comercial Andes'), `${name} no menciona el sistema`);
  }
});

test('la especificación incluye todas las secciones exigidas', async () => {
  const bundle = await analyzeExample('c-psicometrico-educativo.json');
  const spec = documents(bundle)['especificacion.md'];
  for (const heading of [
    '## 1. Identidad y finalidad',
    '## 2. Clasificación',
    '## 3. Requisitos funcionales',
    '## 4. Requisitos no funcionales',
    '## 5. Requisitos de cumplimiento',
    '## 6. Compatibilidad y advertencias',
    '## 7. Dimensionamiento',
    '## 8. Arquitectura',
    '## 9. Evolución temporal',
    '## 10. Completitud de la configuración',
    '## 11. Supuestos y decisiones pendientes',
    '## 12. Estado de la especificación'
  ]) {
    assert.ok(spec.includes(heading), `la especificación no incluye "${heading}"`);
  }
  assert.ok(spec.includes('ISO/IEC 25010'));
  assert.ok(spec.includes('No constituye declaración de conformidad'));
});

test('el plan de escalabilidad declara fórmulas y las veinte dimensiones', async () => {
  const bundle = await analyzeExample('l-alta-escala.json');
  const plan = documents(bundle)['plan-escalabilidad.md'];
  assert.ok(plan.includes('RPS_pico = RPS_medio × factor_pico'));
  assert.ok(plan.includes('## Dimensiones de evolución'));
  assert.ok(plan.includes('## Plan de revisión arquitectónica'));
  assert.ok(plan.includes('### Criterios de migración'));
  for (let i = 1; i <= 20; i += 1) assert.ok(plan.includes(`| ${i} |`), `falta la dimensión ${i}`);
});

test('el plan de pruebas exige evidencia y prohíbe declarar sin ejecutar', async () => {
  const bundle = await analyzeExample('b-erp-5000-usuarios.json');
  const plan = documents(bundle)['plan-pruebas.md'];
  assert.ok(plan.includes('No se declara ninguna prueba aprobada sin ejecutarla'));
  assert.ok(plan.includes('## Matriz de cardinalidad'));
  assert.ok(plan.includes('Caracteres Unicode') || plan.includes('caracteres Unicode'));
  assert.ok(plan.includes('## Evidencia exigida'));
});

test('el paquete incluye todos los artefactos solicitados', async () => {
  const bundle = await analyzeExample('g-multiagente.json');
  const files = bundleFiles(bundle);
  const names = Object.keys(files);
  assert.ok(names.includes('README.md'));
  assert.ok(names.includes('manifest.json'));
  assert.ok(names.includes('configuracion.json'));
  assert.ok(names.includes('especificacion.md'));
  assert.ok(names.some((n) => n.startsWith('prompts/')));
  assert.ok(names.some((n) => n.startsWith('skills/')));
  assert.ok(names.some((n) => n.startsWith('agentes/')));
  assert.ok(names.some((n) => n.startsWith('harness/')));
  assert.ok(names.some((n) => n.startsWith('mcp/')));
  for (const [name, content] of Object.entries(files)) {
    assert.ok(content && content.length > 0, `${name} está vacío`);
  }
});

test('el paquete omite los artefactos no solicitados', async () => {
  const bundle = await analyzeExample('a-crm-50-usuarios.json');
  const names = Object.keys(bundleFiles(bundle));
  assert.ok(!names.some((n) => n.startsWith('skills/')));
  assert.ok(!names.some((n) => n.startsWith('harness/')));
  assert.ok(!names.some((n) => n.startsWith('agentes/')));
});

test('el manifiesto sella versiones, huella y lista de archivos', async () => {
  const bundle = await analyzeExample('a-crm-50-usuarios.json');
  const files = bundleFiles(bundle);
  const manifest = JSON.parse(files['manifest.json']);
  assert.equal(manifest.artifact, 'system-architect-studio-bundle');
  assert.equal(manifest.configSchemaVersion, 'sas.config.v1');
  assert.equal(manifest.configFingerprint, bundle.fingerprint);
  assert.equal(manifest.generatorVersion, undefined, 'el paquete no sella una versión de producto');
  assert.equal(manifest.promptTemplatesVersion, undefined, 'las plantillas no tienen versión propia');
  assert.ok(manifest.catalogVersions.catalogIndex, 'sí se sella la versión de los catálogos de datos');
  assert.deepEqual(manifest.files, manifest.files.slice().sort());
  for (const name of Object.keys(files)) {
    if (name === 'manifest.json') continue;
    assert.ok(manifest.files.includes(name), `el manifiesto no lista ${name}`);
  }
});

test('la generación es reproducible con la misma configuración', async () => {
  const first = await analyzeExample('b-erp-5000-usuarios.json');
  const second = await analyzeExample('b-erp-5000-usuarios.json');
  assert.equal(first.fingerprint, second.fingerprint);
  assert.deepEqual(Object.keys(bundleFiles(first)), Object.keys(bundleFiles(second)));
  assert.equal(bundleFiles(first)['especificacion.md'], bundleFiles(second)['especificacion.md']);
  const zipA = zipBundle(first);
  const zipB = zipBundle(second);
  assert.equal(zipA.filename, zipB.filename);
  assert.equal(Buffer.compare(Buffer.from(zipA.bytes), Buffer.from(zipB.bytes)), 0);
});

test('un cambio en la configuración cambia la huella y el nombre del paquete', async () => {
  const base = await analyzeExample('a-crm-50-usuarios.json');
  const changed = await analyzeExample('a-crm-50-usuarios.json', { identity: { ...(await readExample('a-crm-50-usuarios.json')).identity, name: 'Otro sistema' } });
  assert.notEqual(base.fingerprint, changed.fingerprint);
  assert.notEqual(zipBundle(base).filename, zipBundle(changed).filename);
});

test('el ZIP generado es válido y legible por una herramienta externa', async () => {
  const bundle = await analyzeExample('g-multiagente.json');
  const zip = zipBundle(bundle);
  const dir = await mkdtemp(join(tmpdir(), 'sas-zip-'));
  try {
    const path = join(dir, zip.filename);
    await writeFile(path, zip.bytes);
    const script = [
      'import zipfile, sys, json',
      'z = zipfile.ZipFile(sys.argv[1])',
      'assert z.testzip() is None, "archivo corrupto"',
      'names = z.namelist()',
      'data = z.read("manifest.json").decode("utf-8")',
      'json.loads(data)',
      'print(len(names))'
    ].join('\n');
    const { stdout } = await execFileAsync('python', ['-c', script, path]);
    assert.equal(Number(stdout.trim()), Object.keys(zip.files).length);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('el escritor de ZIP calcula CRC-32 correctamente', () => {
  // Valor conocido de CRC-32 para la cadena "123456789".
  const bytes = new TextEncoder().encode('123456789');
  assert.equal(crc32(bytes).toString(16), 'cbf43926');
});

test('el ZIP conserva contenido Unicode intacto', async () => {
  const content = 'Evaluación psicométrica · ñandú · 漢字 · 🚀';
  const bytes = createZip({ 'prueba.md': content }, { date: new Date(FIXED_DATE) });
  const dir = await mkdtemp(join(tmpdir(), 'sas-zip-uni-'));
  try {
    const path = join(dir, 'u.zip');
    await writeFile(path, bytes);
    const script = 'import zipfile,sys;print(zipfile.ZipFile(sys.argv[1]).read("prueba.md").decode("utf-8"))';
    const { stdout } = await execFileAsync('python', ['-X', 'utf8', '-c', script, path], {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });
    assert.equal(stdout.trim(), content);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('el escritor de ZIP rechaza rutas peligrosas', () => {
  assert.throws(() => createZip({ '../fuera.md': 'x' }), /no válida/i);
  assert.throws(() => createZip({ '': 'x' }), /no válida/i);
});

test('los nombres de archivo del paquete son seguros y relativos', async () => {
  const bundle = await analyzeExample('c-psicometrico-educativo.json');
  for (const name of Object.keys(bundleFiles(bundle))) {
    assert.ok(!name.startsWith('/'), `${name} es absoluto`);
    assert.ok(!name.includes('..'), `${name} contiene salto de directorio`);
    assert.ok(!/[<>:"|?*\u0000-\u001f]/.test(name), `${name} tiene caracteres no válidos`);
  }
});
