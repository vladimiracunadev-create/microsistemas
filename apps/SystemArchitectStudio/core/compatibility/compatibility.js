/**
 * Motor de reglas y compatibilidad.
 *
 * Evalúa las reglas declarativas de `data/rules.json` sobre una configuración
 * y añade comprobaciones derivadas del catálogo (dependencias no incluidas,
 * relaciones sugeridas). El motor advierte; no prohíbe combinaciones
 * técnicamente válidas. Solo las contradicciones lógicas son errores.
 */

import { getPath } from '../schema/config-schema.js';

/** Operadores soportados por el lenguaje de condiciones de las reglas. */
export const OPERATORS = {
  equals: (value, expected) => normalize(value) === normalize(expected),
  notEquals: (value, expected) => normalize(value) !== normalize(expected),
  includes: (value, expected) => toArray(value).map(normalize).includes(normalize(expected)),
  notIncludes: (value, expected) => !toArray(value).map(normalize).includes(normalize(expected)),
  includesAny: (value, expected) => {
    const have = toArray(value).map(normalize);
    return toArray(expected).map(normalize).some((e) => have.includes(e));
  },
  includesAll: (value, expected) => {
    const have = toArray(value).map(normalize);
    return toArray(expected).map(normalize).every((e) => have.includes(e));
  },
  notIncludesSubstring: (value, expected) => {
    const needle = String(expected).toLowerCase();
    return !toArray(value).some((v) => String(v).toLowerCase().includes(needle));
  },
  includesSubstring: (value, expected) => {
    const needle = String(expected).toLowerCase();
    return toArray(value).some((v) => String(v).toLowerCase().includes(needle));
  },
  gt: (value, expected) => toNumber(value) > toNumber(expected),
  gte: (value, expected) => toNumber(value) >= toNumber(expected),
  lt: (value, expected) => toNumber(value) < toNumber(expected),
  lte: (value, expected) => toNumber(value) <= toNumber(expected),
  truthy: (value) => Boolean(value),
  falsy: (value) => !value,
  isEmpty: (value) => isEmptyValue(value),
  notEmpty: (value) => !isEmptyValue(value),
  countGt: (value, expected) => toArray(value).length > toNumber(expected),
  countLt: (value, expected) => toArray(value).length < toNumber(expected)
};

function normalize(v) {
  return typeof v === 'string' ? v.trim().toLowerCase() : v;
}

function toArray(v) {
  if (Array.isArray(v)) return v;
  if (v === undefined || v === null || v === '') return [];
  return [v];
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function isEmptyValue(v) {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') return Object.keys(v).length === 0;
  return false;
}

/** Evalúa una condición individual. Operadores desconocidos no se cumplen. */
export function evaluateCondition(config, condition) {
  const value = getPath(config, condition.path);
  let result;

  if (condition.op === 'gtField') {
    result = toNumber(value) > toNumber(getPath(config, condition.value));
  } else if (condition.op === 'ltField') {
    result = toNumber(value) < toNumber(getPath(config, condition.value));
  } else {
    const fn = OPERATORS[condition.op];
    if (typeof fn !== 'function') {
      return { ok: false, unknownOperator: condition.op };
    }
    result = fn(value, condition.value);
  }

  if (condition.negate) result = !result;
  return { ok: Boolean(result) };
}

/**
 * Evalúa todas las reglas del catálogo sobre la configuración.
 * @returns {{ findings: Array, bySeverity: object, unknownOperators: string[] }}
 */
export function evaluateRules(config, catalog) {
  const findings = [];
  const unknownOperators = new Set();

  for (const rule of catalog.rules) {
    let matched = true;
    for (const condition of rule.conditions) {
      const res = evaluateCondition(config, condition);
      if (res.unknownOperator) unknownOperators.add(`${rule.id}:${res.unknownOperator}`);
      if (!res.ok) { matched = false; break; }
    }
    if (matched) {
      findings.push({
        id: rule.id,
        source: 'rule',
        severity: rule.severity,
        title: rule.title,
        message: rule.message,
        rationale: rule.rationale,
        recommendation: rule.recommendation
      });
    }
  }

  return { findings, unknownOperators: [...unknownOperators] };
}

/**
 * Comprobaciones derivadas del catálogo que no se expresan bien como reglas
 * declarativas, porque dependen del grafo de tipos seleccionados.
 */
export function evaluateCatalogDerived(config, catalog) {
  const findings = [];
  const selected = config.classification.systemTypes || [];

  for (const id of selected) {
    if (!catalog.systemsById.has(id)) {
      findings.push({
        id: `D-UNKNOWN-TYPE:${id}`,
        source: 'catalog',
        severity: 'error',
        title: 'Tipo de sistema desconocido',
        message: `El tipo "${id}" no existe en el catálogo cargado.`,
        rationale: 'El motor no puede aportar capacidades, restricciones ni estándares para un tipo que no conoce.',
        recommendation: 'Elija un tipo del catálogo o declárelo como tipo personalizado en la configuración.'
      });
    }
  }

  for (const missing of catalog.missingDependencies(selected)) {
    const from = catalog.getSystem(missing.from);
    findings.push({
      id: `D-DEP:${missing.from}:${missing.dependency}`,
      source: 'catalog',
      severity: 'warning',
      title: 'Dependencia funcional no incluida',
      message: `${from?.acronym || missing.from} declara una dependencia de ${missing.dependencyName} que no está en la selección.`,
      rationale: 'Las dependencias del catálogo señalan capacidades sin las cuales el tipo elegido no produce su resultado completo.',
      recommendation: `Incluya "${missing.dependency}" en los tipos de sistema, o declare explícitamente que esa capacidad la provee un sistema externo ya existente.`
    });
  }

  // Restricciones del catálogo que deben quedar visibles en la especificación.
  for (const id of selected) {
    const system = catalog.getSystem(id);
    if (!system) continue;
    for (const [i, constraint] of (system.constraints || []).entries()) {
      findings.push({
        id: `D-CONSTRAINT:${id}:${i}`,
        source: 'catalog',
        severity: 'info',
        title: `Restricción conocida de ${system.acronym}`,
        message: constraint,
        rationale: `Restricción documentada en el catálogo para ${system.canonicalName}.`,
        recommendation: 'Verifique que la arquitectura y el plan de pruebas la contemplen de forma explícita.'
      });
    }
  }

  if (!selected.length && !(config.classification.customTypes || []).length) {
    findings.push({
      id: 'D-NO-TYPE',
      source: 'catalog',
      severity: 'error',
      title: 'Sin tipo de sistema',
      message: 'No se seleccionó ningún tipo de sistema ni se declaró un tipo personalizado.',
      rationale: 'El tipo funcional es la dimensión que determina capacidades, restricciones y estándares aplicables.',
      recommendation: 'Seleccione al menos un tipo del catálogo o describa un tipo personalizado.'
    });
  }

  return findings;
}

/** Ejecuta reglas y comprobaciones derivadas, y agrupa por severidad. */
export function evaluateCompatibility(config, catalog) {
  const ruleResult = evaluateRules(config, catalog);
  const derived = evaluateCatalogDerived(config, catalog);
  const findings = [...ruleResult.findings, ...derived];

  const bySeverity = { error: [], warning: [], info: [] };
  for (const f of findings) {
    (bySeverity[f.severity] || (bySeverity[f.severity] = [])).push(f);
  }

  return {
    findings,
    bySeverity,
    counts: {
      error: bySeverity.error.length,
      warning: bySeverity.warning.length,
      info: bySeverity.info.length
    },
    unknownOperators: ruleResult.unknownOperators,
    rulesEvaluated: catalog.rules.length,
    suggestedRelations: catalog.suggestedRelations(config.classification.systemTypes || [])
  };
}
