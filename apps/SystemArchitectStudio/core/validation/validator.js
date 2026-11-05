/**
 * Validación de la configuración y saneamiento de entradas.
 *
 * Toda entrada se trata como no confiable: se acotan tamaños, se verifica el
 * tipo y se rechazan estructuras inesperadas antes de que lleguen al motor.
 * La validación no usa `eval` ni construye funciones a partir del texto del
 * usuario, y no interpreta el contenido como instrucciones.
 */

import { CONFIG_SCHEMA_VERSION, getPath, normalizeConfig } from '../schema/config-schema.js';

/** Límites de tamaño aplicados a las entradas importadas. */
export const LIMITS = Object.freeze({
  maxJsonBytes: 2 * 1024 * 1024,
  maxStringLength: 8000,
  maxTextAreaLength: 40000,
  maxArrayItems: 500,
  maxArrayItemLength: 1000,
  maxObjectKeys: 200,
  maxDepth: 12,
  maxNumber: 1e15
});

/** Caracteres de control que se eliminan de cualquier texto entrante. */
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Normaliza y acota un texto. No escapa HTML: eso es tarea de la vista. */
export function sanitizeText(value, maxLength = LIMITS.maxStringLength) {
  if (value === undefined || value === null) return '';
  let text = String(value);
  text = text.replace(CONTROL_CHARS, '');
  text = text.replace(/\r\n/g, '\n');
  if (text.length > maxLength) text = text.slice(0, maxLength);
  return text;
}

/** Acota un número a un rango finito y no negativo cuando corresponde. */
export function sanitizeNumber(value, { min = 0, max = LIMITS.maxNumber } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(n, min), max);
}

/** Acota una lista de textos. */
export function sanitizeStringList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, LIMITS.maxArrayItems)
    .map((item) => sanitizeText(item, LIMITS.maxArrayItemLength))
    .filter((item) => item !== '');
}

/**
 * Comprueba que un valor decodificado desde JSON tenga una forma aceptable.
 * Rechaza profundidad excesiva, claves peligrosas y tipos no serializables.
 */
export function assertSafeStructure(value, path = '$', depth = 0) {
  const problems = [];
  if (depth > LIMITS.maxDepth) {
    problems.push(`${path}: profundidad mayor que ${LIMITS.maxDepth}.`);
    return problems;
  }
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return problems;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) problems.push(`${path}: número no finito.`);
    return problems;
  }
  if (Array.isArray(value)) {
    if (value.length > LIMITS.maxArrayItems) problems.push(`${path}: más de ${LIMITS.maxArrayItems} elementos.`);
    value.slice(0, LIMITS.maxArrayItems).forEach((item, i) => {
      problems.push(...assertSafeStructure(item, `${path}[${i}]`, depth + 1));
    });
    return problems;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length > LIMITS.maxObjectKeys) problems.push(`${path}: más de ${LIMITS.maxObjectKeys} claves.`);
    for (const key of keys) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        problems.push(`${path}.${key}: clave no permitida.`);
        continue;
      }
      problems.push(...assertSafeStructure(value[key], `${path}.${key}`, depth + 1));
    }
    return problems;
  }
  problems.push(`${path}: tipo no soportado (${typeof value}).`);
  return problems;
}

/**
 * Importa una configuración desde texto JSON con todas las defensas activas.
 * @returns {{ ok: boolean, config: object|null, errors: string[], warnings: string[] }}
 */
export function parseConfigJson(text) {
  const errors = [];
  const warnings = [];

  if (typeof text !== 'string' || text.trim() === '') {
    return { ok: false, config: null, errors: ['El contenido está vacío.'], warnings };
  }

  const byteLength = typeof TextEncoder === 'function'
    ? new TextEncoder().encode(text).length
    : Buffer.byteLength(text, 'utf8');

  if (byteLength > LIMITS.maxJsonBytes) {
    return {
      ok: false,
      config: null,
      errors: [`El archivo pesa ${Math.round(byteLength / 1024)} KB y el límite es ${LIMITS.maxJsonBytes / 1024} KB.`],
      warnings
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return { ok: false, config: null, errors: [`JSON inválido: ${err.message}`], warnings };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, config: null, errors: ['La configuración debe ser un objeto JSON.'], warnings };
  }

  const structural = assertSafeStructure(parsed);
  if (structural.length) {
    return { ok: false, config: null, errors: structural.slice(0, 20), warnings };
  }

  if (parsed.schemaVersion && parsed.schemaVersion !== CONFIG_SCHEMA_VERSION) {
    warnings.push(`La configuración declara "${parsed.schemaVersion}" y el esquema actual es "${CONFIG_SCHEMA_VERSION}". Se intentará migrar.`);
  }

  return { ok: true, config: parsed, errors, warnings };
}

/* ------------------------------------------------------------------ */
/* Validación semántica                                                */
/* ------------------------------------------------------------------ */

const REQUIRED_PATHS = [
  { path: 'identity.name', label: 'Nombre del sistema' },
  { path: 'identity.purpose', label: 'Finalidad del sistema' }
];

/** Secciones consideradas para el indicador de completitud. */
export const COMPLETENESS_SECTIONS = Object.freeze([
  { id: 'identity', label: 'Identidad y finalidad', paths: ['identity.name', 'identity.purpose', 'identity.audience'] },
  { id: 'classification', label: 'Clasificación', paths: ['classification.systemTypes', 'classification.architecture', 'classification.deployment', 'classification.tenancy', 'classification.platforms'] },
  { id: 'functional', label: 'Funcionalidades y roles', paths: ['functional.capabilities', 'functional.processes', 'functional.roles'] },
  { id: 'technology', label: 'Tecnologías y datos', paths: ['technology.languages', 'technology.databases', 'technology.infrastructure'] },
  { id: 'security', label: 'Seguridad y privacidad', paths: ['classification.dataSensitivity', 'security.encryptionAtRest', 'security.auditTrail'] },
  { id: 'compliance', label: 'Requisitos normativos', paths: ['compliance.jurisdictions', 'compliance.regulations', 'compliance.standards'] },
  { id: 'capacity', label: 'Capacidad', paths: ['capacity.registeredUsers', 'capacity.dau', 'capacity.peakConcurrentUsers', 'capacity.requestsPerSession'] },
  { id: 'evolution', label: 'Evolución temporal', paths: ['evolution.horizon.value', 'evolution.growthModel', 'evolution.milestones'] },
  { id: 'quality', label: 'Calidad no funcional', paths: ['quality.priorities', 'capacity.slaAvailability', 'capacity.latencyTargetMs'] },
  { id: 'operations', label: 'Operación', paths: ['operations.teamSize', 'operations.environments', 'operations.supportHours'] }
]);

function isDeclared(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'boolean') return value === true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return false;
}

/** Calcula completitud por sección. No obliga a completar campos irrelevantes. */
export function computeCompleteness(config) {
  const sections = COMPLETENESS_SECTIONS.map((section) => {
    const declared = section.paths.filter((p) => isDeclared(getPath(config, p)));
    return {
      id: section.id,
      label: section.label,
      declared: declared.length,
      total: section.paths.length,
      percent: Math.round((declared.length / section.paths.length) * 100),
      missing: section.paths.filter((p) => !isDeclared(getPath(config, p)))
    };
  });
  const declaredTotal = sections.reduce((acc, s) => acc + s.declared, 0);
  const total = sections.reduce((acc, s) => acc + s.total, 0);
  return {
    sections,
    percent: total ? Math.round((declaredTotal / total) * 100) : 0,
    declared: declaredTotal,
    total
  };
}

/**
 * Valida una configuración ya normalizada contra el catálogo.
 * @returns {{ ok, errors, warnings, info, completeness }}
 */
export function validateConfig(input, catalog) {
  const config = normalizeConfig(input);
  const errors = [];
  const warnings = [];
  const info = [];

  for (const req of REQUIRED_PATHS) {
    if (!isDeclared(getPath(config, req.path))) {
      errors.push({ path: req.path, message: `${req.label} es obligatorio.` });
    }
  }

  if (!['new', 'existing'].includes(config.identity.mode)) {
    errors.push({ path: 'identity.mode', message: 'El modo debe ser "new" o "existing".' });
  }

  // Identificadores contra el catálogo.
  if (catalog) {
    for (const id of config.classification.systemTypes) {
      if (!catalog.systemsById.has(id)) {
        errors.push({ path: 'classification.systemTypes', message: `El tipo de sistema "${id}" no existe en el catálogo.` });
      }
    }
    for (const id of config.classification.sectors) {
      if (!catalog.familiesById.has(id)) {
        warnings.push({ path: 'classification.sectors', message: `El sector "${id}" no existe en el catálogo.` });
      }
    }
    const dimensionFields = [
      ['serviceModel', 'classification.serviceModel', true],
      ['architecture', 'classification.architecture', true],
      ['deployment', 'classification.deployment', true],
      ['tenancy', 'classification.tenancy', false],
      ['platforms', 'classification.platforms', true],
      ['licensing', 'classification.licensing', false],
      ['monetization', 'classification.monetization', true],
      ['dataSensitivity', 'classification.dataSensitivity', true],
      ['integrationStyle', 'classification.integrationStyle', true]
    ];
    for (const [dimId, path, isList] of dimensionFields) {
      const dim = catalog.getDimension(dimId);
      if (!dim) continue;
      const raw = getPath(config, path);
      const values = isList ? (Array.isArray(raw) ? raw : []) : (raw ? [raw] : []);
      for (const v of values) {
        if (!dim.optionsById.has(v)) {
          errors.push({ path, message: `"${v}" no es una opción válida de ${dim.name}.` });
        }
      }
      if (!isList && Array.isArray(raw) && raw.length > 1) {
        errors.push({ path, message: `${dim.name} admite un solo valor.` });
      }
    }
  }

  // Coherencia numérica de las magnitudes de uso.
  const cap = config.capacity;
  if (cap.registeredUsers > 0 && cap.mau > cap.registeredUsers) {
    warnings.push({ path: 'capacity.mau', message: 'Los activos mensuales superan a los usuarios registrados.' });
  }
  if (cap.slaAvailability && (cap.slaAvailability <= 0 || cap.slaAvailability > 100)) {
    errors.push({ path: 'capacity.slaAvailability', message: 'La disponibilidad debe expresarse como porcentaje entre 0 y 100.' });
  }
  if (cap.latencyPercentile && ![50, 75, 90, 95, 99, 99.9].includes(Number(cap.latencyPercentile))) {
    warnings.push({ path: 'capacity.latencyPercentile', message: 'El percentil declarado no es uno de los habituales (50, 75, 90, 95, 99, 99.9).' });
  }
  if (cap.readWriteRatio < 0) {
    errors.push({ path: 'capacity.readWriteRatio', message: 'La relación lectura/escritura no puede ser negativa.' });
  }
  if (cap.peakFactor > 0 && cap.peakFactor < 1) {
    warnings.push({ path: 'capacity.peakFactor', message: 'Un factor de pico menor que 1 implica que el pico es menor que la media; revise el valor.' });
  }

  // Evolución.
  const horizon = config.evolution.horizon;
  if (!horizon.openEnded && !(horizon.value > 0)) {
    errors.push({ path: 'evolution.horizon.value', message: 'Defina un horizonte de evolución o marque que no tiene término conocido.' });
  }
  for (const [i, milestone] of config.evolution.milestones.entries()) {
    if (!milestone.name) {
      errors.push({ path: `evolution.milestones[${i}].name`, message: 'Cada hito necesita un nombre.' });
    }
    if (milestone.kind === 'time' && !(Number(milestone.atMonth) >= 0)) {
      errors.push({ path: `evolution.milestones[${i}].atMonth`, message: 'Un hito por tiempo necesita el mes en que ocurre.' });
    }
    if (milestone.kind === 'condition' && !milestone.condition) {
      errors.push({ path: `evolution.milestones[${i}].condition`, message: 'Un hito por condición necesita la condición observable.' });
    }
    if (!['time', 'condition'].includes(milestone.kind)) {
      errors.push({ path: `evolution.milestones[${i}].kind`, message: 'El tipo de hito debe ser "time" o "condition".' });
    }
  }

  // Calidad.
  for (const [attr, value] of Object.entries(config.quality.priorities || {})) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      errors.push({ path: `quality.priorities.${attr}`, message: 'La prioridad debe ser un entero de 1 a 5.' });
    }
  }

  // Avisos sobre supuestos no declarados.
  if (cap.registeredUsers > 0 && !cap.peakConcurrentUsers) {
    info.push({
      path: 'capacity.peakConcurrentUsers',
      message: 'Sin concurrencia declarada el motor la estimará a partir de los activos diarios y lo registrará como supuesto.'
    });
  }
  if (config.identity.mode === 'existing' && !config.identity.existingSystem.repository) {
    info.push({ path: 'identity.existingSystem.repository', message: 'Indique el repositorio para que los prompts exijan inspección previa del código.' });
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    info,
    completeness: computeCompleteness(config)
  };
}
