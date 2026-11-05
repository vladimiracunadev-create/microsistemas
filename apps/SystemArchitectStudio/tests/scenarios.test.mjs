/**
 * Escenarios de aceptación A–L.
 *
 * Cada escenario debe producir artefactos verificables: configuración válida,
 * dimensionamiento o declaración explícita de su ausencia, plan de evolución,
 * arquitectura con justificación, prompts específicos y paquete coherente.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { analyze, bundleFiles, summarize } from '../core/engine.js';
import { loadCatalogForCli } from '../adapters/cli/sas.mjs';
import { readExample, listExamples } from './helpers.mjs';

const catalog = await loadCatalogForCli();
const examples = await listExamples();
const FIXED_DATE = '2026-11-04T12:00:00.000Z';

async function run(file) {
  return analyze(await readExample(file), catalog, { now: FIXED_DATE });
}

test('los doce escenarios de aceptación están declarados', () => {
  const scenarios = examples.map((e) => e.scenario).sort();
  assert.deepEqual(scenarios, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']);
});

for (const example of examples) {
  test(`escenario ${example.scenario}: ${example.name}`, async () => {
    const bundle = await run(example.file);
    const s = summarize(bundle);

    assert.equal(bundle.validation.ok, true, `validación: ${JSON.stringify(bundle.validation.errors)}`);
    assert.equal(bundle.compatibility.counts.error, 0, `errores de compatibilidad: ${JSON.stringify(bundle.compatibility.bySeverity.error)}`);
    assert.ok(bundle.config.identity.name, 'sin nombre de sistema');
    assert.ok(bundle.config.identity.purpose, 'sin finalidad');
    assert.ok(s.systemTypes.length > 0, 'sin tipos de sistema');

    // Evolución obligatoria para todo sistema.
    assert.ok(bundle.evolution.horizon.months > 0, 'sin horizonte proyectado');
    assert.equal(bundle.evolution.dimensions.length, 20);
    assert.ok(bundle.evolution.stages.length === 6);
    assert.ok(bundle.evolution.milestones.length > 0);
    assert.ok(bundle.evolution.reviewPlan.indicators.length > 0);

    // Arquitectura con justificación.
    assert.ok(bundle.architecture.style.reasons.length > 0);
    assert.ok(bundle.architecture.components.length >= 3);
    assert.ok(bundle.architecture.contracts.length >= 2);
    assert.ok(bundle.architecture.redesignConditions.length >= 4);

    // Requisitos.
    assert.ok(bundle.requirements.counts.functional > 0);
    assert.equal(bundle.requirements.counts.nonFunctional, 16);

    // Prompts específicos del sistema.
    assert.ok(bundle.prompts.prompts.length > 0);
    for (const prompt of bundle.prompts.prompts) {
      assert.ok(prompt.markdown.includes(bundle.config.identity.name), `el prompt ${prompt.id} no menciona el sistema`);
      assert.ok(prompt.markdown.includes('## Criterios de aceptación'));
      assert.ok(prompt.markdown.includes('## Evidencia de finalización'));
      assert.ok(prompt.markdown.includes('## Repositorio objetivo'));
      assert.ok(prompt.markdown.includes(bundle.fingerprint));
    }

    // Paquete coherente.
    const files = bundleFiles(bundle);
    assert.ok(Object.keys(files).length >= 8);
    assert.ok(files['manifest.json']);
  });
}

test('A: el CRM pequeño no recibe una arquitectura sobredimensionada', async () => {
  const bundle = await run('a-crm-50-usuarios.json');
  assert.equal(bundle.architecture.style.recommended, 'modular-monolith');
  assert.ok(bundle.capacity.derived.instances <= 2);
});

test('B: el ERP cubre varias áreas y exige integridad transaccional', async () => {
  const bundle = await run('b-erp-5000-usuarios.json');
  assert.ok(bundle.config.classification.systemTypes.length >= 4);
  const nfr = bundle.requirements.nonFunctional.find((r) => r.attribute === 'reliability');
  assert.ok(nfr.statement.includes('idempotentes'));
  assert.ok(bundle.capacity.derived.peakRps > 10);
  assert.ok(bundle.capacity.resultsById.seasonalPeakRps, 'debe proyectar pico estacional');
});

test('C: el sistema psicométrico separa aplicación, puntuación, estadística y baremos', async () => {
  const bundle = await run('c-psicometrico-educativo.json');
  const types = bundle.config.classification.systemTypes;
  for (const id of ['assessment-management', 'item-bank', 'cbt', 'scoring-engine', 'psychometric-analysis', 'norms-management', 'assessment-reporting']) {
    assert.ok(types.includes(id), `falta ${id}`);
  }
  // Advertencia obligatoria sobre licenciamiento de instrumentos.
  assert.ok(bundle.compatibility.findings.some((f) => f.id === 'R-PSY-004'));
  // La ventana de aplicación concentrada debe aparecer como cuello de botella.
  assert.ok(bundle.capacity.bottlenecks.some((b) => b.id === 'concentrated-window'));
  // Accesibilidad con acomodaciones.
  const accessibility = bundle.requirements.nonFunctional.find((r) => r.attribute === 'accessibility');
  assert.ok(accessibility.statement.includes('WCAG'));
  assert.ok(bundle.capacity.derived.peakConcurrency >= 25000);
});

test('D: el comercio electrónico proyecta el pico estacional por encima del diario', async () => {
  const bundle = await run('d-ecommerce-estacional.json');
  const seasonal = bundle.capacity.resultsById.seasonalPeakRps;
  assert.ok(seasonal);
  assert.ok(seasonal.value > bundle.capacity.derived.peakRps);
  assert.ok(bundle.capacity.bottlenecks.some((b) => b.id === 'seasonal-peak'));
  assert.ok(bundle.capacity.bottlenecks.some((b) => b.id === 'read-amplification'));
});

test('E: el núcleo bancario exige integridad, auditoría y alta disponibilidad', async () => {
  const bundle = await run('e-banco-core.json');
  assert.ok(bundle.capacity.availability.downtimeMinutesPerMonth < 10);
  assert.ok(bundle.architecture.components.some((c) => c.id === 'audit'));
  assert.ok(bundle.capacity.bottlenecks.some((b) => b.id === 'transactional-integrity'));
  assert.equal(bundle.evolution.horizon.openEnded, true);
  assert.equal(bundle.evolution.reviewPlan.openEnded, true);
});

test('F: el sistema industrial mantiene el control local', async () => {
  const bundle = await run('f-industrial-telemetria.json');
  assert.equal(bundle.architecture.style.recommended, 'distributed');
  assert.ok(bundle.architecture.style.reasons.some((r) => r.includes('determinismo')));
  assert.ok(bundle.architecture.components.some((c) => c.id === 'async'));
});

test('G: el sistema multiagente activa especialistas de forma selectiva', async () => {
  const bundle = await run('g-multiagente.json');
  assert.ok(bundle.agents, 'debe generar definiciones de agentes');
  assert.ok(bundle.harness, 'debe generar especificación de harness');
  assert.ok(bundle.mcp, 'debe generar especificación de adaptador MCP');
  assert.ok(bundle.agents.activated.includes('ai-systems-architect'));
  // Esta configuración es deliberadamente rica, así que activa a todos los
  // especialistas. La activación selectiva se verifica con una configuración
  // mínima, donde los especialistas no pertinentes quedan fuera.
  const lean = analyze(
    { schemaVersion: 'sas.config.v1', identity: { name: 'Mínimo', purpose: 'Probar activación selectiva.', mode: 'new' }, classification: { systemTypes: ['crm'], deployment: ['local'] }, evolution: { horizon: { unit: 'months', value: 12 } }, deliverables: { includeAgents: true } },
    catalog, { now: FIXED_DATE }
  );
  assert.ok(lean.agents.activated.length < bundle.agents.activated.length,
    'una configuración mínima debe activar menos especialistas que una rica');
  assert.ok(!lean.agents.activated.includes('ai-systems-architect'));
  assert.ok(!lean.agents.activated.includes('security-architect'));
  const multi = bundle.agents.files['sistema-multiagente.md'];
  assert.ok(multi.includes('Herramientas autorizadas'));
  assert.ok(multi.includes('Control de duplicación y de costo'));
  const harness = bundle.harness.files['harness.md'];
  assert.ok(harness.includes('Presupuesto de tokens'));
  assert.ok(harness.includes('Condiciones de finalización'));
  assert.ok(harness.includes('No implementado'));
  assert.ok(bundle.mcp.tools.every((t) => t.effect === 'solo lectura'));
  // El prompt de ingeniería de IA debe aparecer porque hay uso de IA declarado.
  assert.ok(bundle.prompts.prompts.some((p) => p.id === 'ai-engineering'));
});

test('H: el sistema existente exige inspección previa y no destruir lo anterior', async () => {
  const bundle = await run('h-sistema-existente.json');
  const legacy = bundle.prompts.prompts.find((p) => p.id === 'legacy-integration');
  assert.ok(legacy, 'debe generarse el prompt de ampliación de sistema existente');
  assert.ok(legacy.markdown.includes('Inspeccione el repositorio'));
  assert.ok(legacy.markdown.includes('No destruya funcionalidades preexistentes'));
  assert.ok(legacy.markdown.includes('Refactorizar no es reescribir'));
  assert.ok(legacy.markdown.includes('vladimiracunadev-create/microsistemas'));
  for (const prompt of bundle.prompts.prompts) {
    assert.ok(prompt.markdown.includes('### Modo: sistema existente'));
  }
});

test('I: la skill generada aplica carga progresiva y declara restricciones', async () => {
  const bundle = await run('i-skill-especializada.json');
  assert.ok(bundle.skill);
  const skillMd = bundle.skill.files['SKILL.md'];
  assert.ok(skillMd.startsWith('---'), 'debe tener frontmatter');
  assert.ok(skillMd.includes('name: arquitecto-'));
  assert.ok(skillMd.includes('description:'));
  assert.ok(skillMd.includes('## Referencias (carga progresiva)'));
  assert.ok(skillMd.includes('## Restricciones'));
  assert.ok(skillMd.includes('## Criterios de validación'));
  assert.ok(skillMd.includes('No cargue las referencias completas'));
  for (const path of ['references/dominio.md', 'references/capacidad.md', 'references/evolucion.md', 'references/arquitectura.md', 'references/casos-de-uso.md']) {
    assert.ok(bundle.skill.files[path], `falta ${path}`);
    assert.ok(bundle.skill.files[path].length > 200, `${path} parece vacío`);
  }
});

test('J: el harness separa responsabilidades y define término', async () => {
  const bundle = await run('j-harness.json');
  assert.ok(bundle.harness);
  const md = bundle.harness.files['harness.md'];
  for (const layer of ['Skill', 'Agente', 'MCP', 'Harness', 'Motor de ingeniería']) {
    assert.ok(md.includes(`| ${layer} |`), `la tabla de responsabilidades no incluye ${layer}`);
  }
  for (const section of ['Gestión de contexto', 'Permisos', 'Aprobaciones', 'Aislamiento', 'Puntos de control', 'Reintentos', 'Auditoría', 'Presupuesto de tokens', 'Recuperación', 'Evaluaciones', 'Condiciones de finalización']) {
    assert.ok(md.includes(`### ${section}`), `falta la sección ${section}`);
  }
  assert.ok(['multi-agent', 'assisted-review', 'deterministic-only'].includes(bundle.harness.profile));
});

test('K: el mismo sistema se proyecta por etapas con justificación de cada cambio', async () => {
  const bundle = await run('k-evolucion-temporal.json');
  const stages = bundle.evolution.stages;
  assert.equal(stages.length, 6);
  for (let i = 1; i < stages.length; i += 1) {
    assert.ok(stages[i].month >= stages[i - 1].month, 'las etapas deben estar ordenadas en el tiempo');
    assert.ok(stages[i].justification.length > 40, 'cada etapa necesita justificación');
  }
  const expected = bundle.evolution.scenarios.find((s) => s.id === 'expected');
  const first = expected.points[0];
  const last = expected.points[expected.points.length - 1];
  assert.ok(last.users > first.users, 'el escenario esperado debe crecer');
  assert.ok(bundle.evolution.milestones.filter((m) => m.origin === 'declarado').length >= 6);
});

test('L: la alta escala declara supuestos y exige validación empírica', async () => {
  const bundle = await run('l-alta-escala.json');
  assert.ok(bundle.capacity.derived.peakRps > 10000);
  assert.match(bundle.capacity.disclaimer, /no capacidad verificada/);
  const cpuNote = bundle.capacity.resultsById.vcpu.note;
  assert.match(cpuNote, /supuesto del motor/);
  assert.ok(bundle.config.decisions.pending.some((p) => p.includes('pruebas de carga')));
  assert.ok(bundle.capacity.cost, 'debe estimar costo con los precios declarados');
  assert.ok(bundle.capacity.bottlenecks.length >= 4);
  const scalability = bundle.prompts.prompts.find((p) => p.id === 'scalability');
  assert.ok(scalability.markdown.includes('hipótesis hasta que se miden'));
});

test('todos los escenarios producen artefactos verificables y distintos entre sí', async () => {
  const fingerprints = new Set();
  for (const example of examples) {
    const bundle = await run(example.file);
    assert.ok(!fingerprints.has(bundle.fingerprint), `huella repetida en ${example.file}`);
    fingerprints.add(bundle.fingerprint);
  }
  assert.equal(fingerprints.size, examples.length);
});

test('los prompts no son genéricos: difieren entre sistemas distintos', async () => {
  const crm = await run('a-crm-50-usuarios.json');
  const banco = await run('e-banco-core.json');
  const promptOf = (bundle, id) => bundle.prompts.prompts.find((p) => p.id === id).markdown;
  assert.notEqual(promptOf(crm, 'architecture'), promptOf(banco, 'architecture'));
  assert.ok(promptOf(banco, 'architecture').includes('ISO 20022'));
  assert.ok(!promptOf(crm, 'architecture').includes('ISO 20022'));
});
