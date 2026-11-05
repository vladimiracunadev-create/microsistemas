/**
 * Integridad del catálogo y comportamiento del índice.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { validateCatalogIntegrity, REQUIRED_SYSTEM_FIELDS } from '../core/catalog/catalog.js';
import { loadCatalogForCli, createFsReader } from '../adapters/cli/sas.mjs';
import { APP_ROOT } from './helpers.mjs';

const catalog = await loadCatalogForCli();

test('el catálogo no tiene problemas de integridad', () => {
  const problems = validateCatalogIntegrity(catalog);
  assert.deepEqual(problems, [], problems.map((p) => `${p.scope}: ${p.message}`).join('\n'));
});

test('hay al menos una familia por cada sector exigido', () => {
  const expected = [
    'enterprise', 'automation', 'education', 'finance', 'health',
    'industry', 'science', 'government', 'software', 'ai', 'security', 'other'
  ];
  const ids = catalog.families.map((f) => f.id);
  for (const id of expected) assert.ok(ids.includes(id), `falta la familia "${id}"`);
  assert.ok(catalog.systems.length >= 100, `se esperaban al menos 100 tipos y hay ${catalog.systems.length}`);
});

test('cada familia tiene al menos tres tipos de sistema', () => {
  for (const family of catalog.families) {
    assert.ok(catalog.byFamily(family.id).length >= 3, `la familia "${family.id}" tiene muy pocos tipos`);
  }
});

test('todos los campos obligatorios están presentes y no vacíos', () => {
  for (const system of catalog.systems) {
    for (const field of REQUIRED_SYSTEM_FIELDS) {
      const value = system[field];
      assert.ok(value !== undefined && value !== null && value !== '', `${system.id} no declara "${field}"`);
      if (Array.isArray(value) && ['capabilities', 'constraints', 'standards', 'sources'].includes(field)) {
        assert.ok(value.length > 0, `${system.id} tiene "${field}" vacío`);
      }
    }
  }
});

test('las siglas no se repiten entre tipos distintos', () => {
  const seen = new Map();
  for (const system of catalog.systems) {
    const previous = seen.get(system.acronym);
    assert.equal(previous, undefined, `la sigla "${system.acronym}" se repite en ${previous} y ${system.id}`);
    seen.set(system.acronym, system.id);
  }
});

test('la búsqueda encuentra por sigla, nombre, sinónimo y capacidad', () => {
  assert.ok(catalog.search('ERP').some((s) => s.id === 'erp'));
  assert.ok(catalog.search('banking').some((s) => s.id === 'core-banking'));
  assert.ok(catalog.search('aula virtual').some((s) => s.id === 'lms'));
  assert.ok(catalog.search('baremo').some((s) => s.id === 'norms-management'));
  assert.deepEqual(catalog.search(''), []);
  assert.deepEqual(catalog.search('   '), []);
});

test('la búsqueda respeta el límite solicitado', () => {
  assert.ok(catalog.search('sistema', 5).length <= 5);
});

test('las dependencias faltantes se detectan', () => {
  const missing = catalog.missingDependencies(['erp']);
  assert.ok(missing.some((m) => m.dependency === 'ledger'));
  assert.deepEqual(catalog.missingDependencies(['erp', 'ledger']), []);
});

test('las relaciones sugeridas excluyen lo ya seleccionado', () => {
  const suggestions = catalog.suggestedRelations(['crm']);
  assert.ok(suggestions.length > 0);
  assert.ok(!suggestions.some((s) => s.id === 'crm'));
});

test('la carga parcial por familia trae solo esa familia', async () => {
  const partial = await loadCatalogForCli({ families: ['ai'] });
  assert.equal(partial.families.length, 1);
  assert.equal(partial.families[0].id, 'ai');
  assert.ok(partial.partial);
  assert.ok(partial.systems.every((s) => s.family === 'ai'));
  assert.deepEqual(validateCatalogIntegrity(partial), []);
});

test('el índice de familias coincide con los archivos declarados', async () => {
  const index = JSON.parse(await readFile(join(APP_ROOT, 'data', 'systems', 'index.json'), 'utf8'));
  assert.equal(index.files.length, catalog.families.length);
  for (const file of index.files) {
    const doc = JSON.parse(await readFile(join(APP_ROOT, 'data', 'systems', file), 'utf8'));
    assert.ok(doc.family && doc.family.id, `${file} no declara familia`);
    assert.ok(Array.isArray(doc.systems), `${file} no declara systems`);
  }
});

test('las dimensiones de clasificación están completas', () => {
  const expected = ['serviceModel', 'architecture', 'deployment', 'tenancy', 'platforms', 'licensing', 'monetization', 'dataSensitivity', 'integrationStyle'];
  for (const id of expected) {
    const dim = catalog.getDimension(id);
    assert.ok(dim, `falta la dimensión "${id}"`);
    assert.ok(dim.options.length >= 4, `la dimensión "${id}" tiene muy pocas opciones`);
  }
  assert.equal(catalog.getDimension('tenancy').multiple, false);
  assert.equal(catalog.getDimension('architecture').multiple, true);
});

test('el lector del sistema de archivos rechaza rutas con salto de directorio', async () => {
  const read = createFsReader();
  await assert.rejects(() => read('../package.json'), /no permitida/i);
});

test('optionName devuelve el identificador cuando no conoce la opción', () => {
  assert.equal(catalog.optionName('architecture', 'monolith'), 'Monolítica');
  assert.equal(catalog.optionName('architecture', 'inexistente'), 'inexistente');
  assert.equal(catalog.optionName('dimension-inexistente', 'x'), 'x');
});
