/**
 * Validación de configuración, saneamiento de entradas y defensas de
 * importación. Las entradas se tratan como no confiables.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { parseConfigJson, validateConfig, sanitizeText, sanitizeNumber, assertSafeStructure, computeCompleteness, LIMITS } from '../core/validation/validator.js';
import { normalizeConfig, defaultConfig, migrateConfig, configFingerprint, canonicalJson, getPath, setPath, CONFIG_SCHEMA_VERSION } from '../core/schema/config-schema.js';
import { loadCatalogForCli } from '../adapters/cli/sas.mjs';
import { minimalConfig } from './helpers.mjs';

const catalog = await loadCatalogForCli();

test('una configuración mínima válida pasa la validación', () => {
  const result = validateConfig(minimalConfig(), catalog);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
});

test('faltan campos obligatorios', () => {
  const result = validateConfig({ schemaVersion: CONFIG_SCHEMA_VERSION }, catalog);
  assert.equal(result.ok, false);
  const paths = result.errors.map((e) => e.path);
  assert.ok(paths.includes('identity.name'));
  assert.ok(paths.includes('identity.purpose'));
  assert.ok(paths.includes('evolution.horizon.value'));
});

test('un tipo de sistema inexistente es error', () => {
  const result = validateConfig(minimalConfig({ classification: { systemTypes: ['no-existe'] } }), catalog);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.message.includes('no-existe')));
});

test('una opción de dimensión inválida es error', () => {
  const result = validateConfig(minimalConfig({
    classification: { systemTypes: ['crm'], architecture: ['monolith', 'inventada'] }
  }), catalog);
  assert.ok(result.errors.some((e) => e.message.includes('inventada')));
});

test('una dimensión de valor único no admite lista', () => {
  const result = validateConfig(minimalConfig({
    classification: { systemTypes: ['crm'], tenancy: ['single-tenant', 'multi-tenant-shared'] }
  }), catalog);
  assert.ok(result.errors.some((e) => e.path === 'classification.tenancy'));
});

test('la disponibilidad fuera de rango es error', () => {
  const result = validateConfig(minimalConfig({ capacity: { slaAvailability: 140 } }), catalog);
  assert.ok(result.errors.some((e) => e.path === 'capacity.slaAvailability'));
});

test('activos mensuales mayores que registrados es advertencia', () => {
  const result = validateConfig(minimalConfig({ capacity: { registeredUsers: 100, mau: 500 } }), catalog);
  assert.ok(result.warnings.some((w) => w.path === 'capacity.mau'));
});

test('un horizonte sin término conocido no exige duración', () => {
  const result = validateConfig(minimalConfig({
    evolution: { horizon: { unit: 'months', value: 0, openEnded: true } }
  }), catalog);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
});

test('un hito mal formado produce errores precisos', () => {
  const result = validateConfig(minimalConfig({
    evolution: {
      horizon: { unit: 'months', value: 12 },
      milestones: [
        { name: '', kind: 'time' },
        { name: 'Sin condición', kind: 'condition' },
        { name: 'Tipo inválido', kind: 'otro' }
      ]
    }
  }), catalog);
  const paths = result.errors.map((e) => e.path);
  assert.ok(paths.includes('evolution.milestones[0].name'));
  assert.ok(paths.includes('evolution.milestones[0].atMonth'));
  assert.ok(paths.includes('evolution.milestones[1].condition'));
  assert.ok(paths.includes('evolution.milestones[2].kind'));
});

test('las prioridades deben ser enteros de 1 a 5', () => {
  const result = validateConfig(minimalConfig({ quality: { priorities: { performance: 9, security: 2.5 } } }), catalog);
  assert.ok(result.errors.some((e) => e.path === 'quality.priorities.performance'));
  assert.ok(result.errors.some((e) => e.path === 'quality.priorities.security'));
});

/* --- Importación de JSON ------------------------------------------------ */

test('rechaza JSON inválido', () => {
  const result = parseConfigJson('{ esto no es json');
  assert.equal(result.ok, false);
  assert.match(result.errors[0], /JSON inválido/);
});

test('rechaza contenido vacío', () => {
  assert.equal(parseConfigJson('').ok, false);
  assert.equal(parseConfigJson('   ').ok, false);
  assert.equal(parseConfigJson(null).ok, false);
});

test('rechaza un arreglo o un escalar en la raíz', () => {
  assert.equal(parseConfigJson('[]').ok, false);
  assert.equal(parseConfigJson('"texto"').ok, false);
  assert.equal(parseConfigJson('42').ok, false);
});

test('rechaza archivos por encima del límite de tamaño', () => {
  const big = `{"relleno":"${'x'.repeat(LIMITS.maxJsonBytes + 100)}"}`;
  const result = parseConfigJson(big);
  assert.equal(result.ok, false);
  assert.match(result.errors[0], /límite/);
});

test('rechaza claves peligrosas de contaminación de prototipo', () => {
  const result = parseConfigJson('{"__proto__":{"contaminado":true}}');
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('no permitida')));
  assert.equal({}.contaminado, undefined);
});

test('rechaza estructuras demasiado profundas', () => {
  let payload = '{"a":1}';
  for (let i = 0; i < LIMITS.maxDepth + 3; i += 1) payload = `{"a":${payload}}`;
  const result = parseConfigJson(payload);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('profundidad')));
});

test('rechaza listas con demasiados elementos', () => {
  const problems = assertSafeStructure({ lista: new Array(LIMITS.maxArrayItems + 5).fill('x') });
  assert.ok(problems.some((p) => p.includes('elementos')));
});

test('avisa cuando la versión del esquema difiere', () => {
  const result = parseConfigJson(JSON.stringify({ schemaVersion: 'sas.config.v0', identity: {} }));
  assert.equal(result.ok, true);
  assert.ok(result.warnings.some((w) => w.includes('sas.config.v0')));
});

/* --- Saneamiento -------------------------------------------------------- */

test('el saneamiento de texto quita caracteres de control y acota', () => {
  assert.equal(sanitizeText('hola\u0000mundo'), 'holamundo');
  assert.equal(sanitizeText('a\r\nb'), 'a\nb');
  assert.equal(sanitizeText('x'.repeat(50), 10).length, 10);
  assert.equal(sanitizeText(null), '');
});

test('el saneamiento de texto conserva Unicode legítimo', () => {
  const texto = 'Evaluación psicométrica · ñandú · 漢字 · emoji 🚀 · عربى';
  assert.equal(sanitizeText(texto), texto);
});

test('el saneamiento numérico acota y descarta valores no finitos', () => {
  assert.equal(sanitizeNumber('abc'), 0);
  assert.equal(sanitizeNumber(-5), 0);
  assert.equal(sanitizeNumber(Infinity), 0, 'un valor no finito se trata como no declarado');
  assert.equal(sanitizeNumber(NaN), 0);
  assert.equal(sanitizeNumber(42), 42);
  assert.equal(sanitizeNumber(10, { max: 5 }), 5);
});

/* --- Esquema ------------------------------------------------------------ */

test('la normalización rellena la estructura sin inventar valores', () => {
  const config = normalizeConfig({ identity: { name: 'X' } });
  assert.equal(config.identity.name, 'X');
  assert.equal(config.identity.purpose, '');
  assert.equal(config.capacity.registeredUsers, 0);
  assert.deepEqual(config.classification.systemTypes, []);
  assert.equal(config.schemaVersion, CONFIG_SCHEMA_VERSION);
});

test('la migración avisa cuando no hay ruta desde una versión desconocida', () => {
  const result = migrateConfig({ schemaVersion: 'sas.config.v0' });
  assert.ok(result.warnings.some((w) => w.includes('No existe migración')));
  assert.equal(result.config.schemaVersion, CONFIG_SCHEMA_VERSION);
});

test('la migración avisa cuando falta la versión', () => {
  const result = migrateConfig({ identity: { name: 'X' } });
  assert.ok(result.warnings.some((w) => w.includes('no declara schemaVersion')));
});

test('la huella no depende de las fechas y sí del contenido', () => {
  const base = minimalConfig();
  const a = normalizeConfig(base);
  const b = normalizeConfig(base);
  a.meta.createdAt = '2026-01-01T00:00:00Z';
  b.meta.createdAt = '2030-12-31T00:00:00Z';
  b.meta.configId = 'otro';
  assert.equal(configFingerprint(a), configFingerprint(b));
  b.identity.name = 'Otro nombre';
  assert.notEqual(configFingerprint(a), configFingerprint(b));
});

test('la serialización canónica ordena las claves', () => {
  assert.equal(canonicalJson({ b: 1, a: 2 }), canonicalJson({ a: 2, b: 1 }));
  assert.equal(canonicalJson({ a: [1, { d: 1, c: 2 }] }), '{"a":[1,{"c":2,"d":1}]}');
});

test('getPath y setPath manejan rutas inexistentes', () => {
  const obj = {};
  setPath(obj, 'a.b.c', 5);
  assert.equal(getPath(obj, 'a.b.c'), 5);
  assert.equal(getPath(obj, 'a.x.y'), undefined);
  assert.equal(getPath(null, 'a'), undefined);
});

test('la completitud es 0 en una configuración vacía y sube al declarar', () => {
  const empty = computeCompleteness(defaultConfig());
  assert.equal(empty.percent, 0);
  const filled = computeCompleteness(normalizeConfig(minimalConfig()));
  assert.ok(filled.percent > 0);
  assert.ok(filled.sections.length >= 10);
});
