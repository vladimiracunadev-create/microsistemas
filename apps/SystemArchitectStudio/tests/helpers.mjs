/**
 * Utilidades compartidas por las pruebas.
 */

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const REPO_ROOT = resolve(APP_ROOT, '..', '..');
export const EXAMPLES_DIR = join(APP_ROOT, 'templates', 'systems');

/** Lee una configuración de ejemplo por nombre de archivo. */
export async function readExample(file) {
  return JSON.parse(await readFile(join(EXAMPLES_DIR, file), 'utf8'));
}

/** Devuelve el índice de ejemplos. */
export async function listExamples() {
  const index = JSON.parse(await readFile(join(EXAMPLES_DIR, 'index.json'), 'utf8'));
  return index.examples;
}

/** Configuración mínima válida, para pruebas que no dependen del contenido. */
export function minimalConfig(overrides = {}) {
  return {
    schemaVersion: 'sas.config.v1',
    identity: { name: 'Sistema de prueba', purpose: 'Verificar el motor.', mode: 'new' },
    classification: { systemTypes: ['crm'] },
    evolution: { horizon: { unit: 'months', value: 12, openEnded: false } },
    ...overrides
  };
}

/** Lista recursivamente los archivos de un directorio, con filtro opcional. */
export async function walk(dir, filter = () => true) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '__pycache__') continue;
      out.push(...await walk(full, filter));
    } else if (filter(full)) {
      out.push(full);
    }
  }
  return out;
}
