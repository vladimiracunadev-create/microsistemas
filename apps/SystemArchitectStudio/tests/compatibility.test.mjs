/**
 * Motor de reglas de compatibilidad.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateCompatibility, evaluateCondition, OPERATORS } from '../core/compatibility/compatibility.js';
import { normalizeConfig } from '../core/schema/config-schema.js';
import { loadCatalogForCli } from '../adapters/cli/sas.mjs';
import { minimalConfig } from './helpers.mjs';

const catalog = await loadCatalogForCli();

function evaluate(overrides) {
  return evaluateCompatibility(normalizeConfig(minimalConfig(overrides)), catalog);
}

function ids(result) {
  return result.findings.map((f) => f.id);
}

test('todos los operadores declarados funcionan', () => {
  assert.equal(OPERATORS.includes(['a', 'b'], 'A'), true);
  assert.equal(OPERATORS.notIncludes(['a'], 'b'), true);
  assert.equal(OPERATORS.includesAny(['a', 'b'], ['c', 'b']), true);
  assert.equal(OPERATORS.includesAll(['a', 'b'], ['a', 'b']), true);
  assert.equal(OPERATORS.includesAll(['a'], ['a', 'b']), false);
  assert.equal(OPERATORS.isEmpty([]), true);
  assert.equal(OPERATORS.isEmpty(''), true);
  assert.equal(OPERATORS.isEmpty(0), false);
  assert.equal(OPERATORS.notEmpty(['x']), true);
  assert.equal(OPERATORS.gt(5, 3), true);
  assert.equal(OPERATORS.lte(3, 3), true);
  assert.equal(OPERATORS.countGt(['a', 'b'], 1), true);
  assert.equal(OPERATORS.notIncludesSubstring(['ISO 27001'], 'PCI'), true);
  assert.equal(OPERATORS.includesSubstring(['PCI DSS'], 'pci'), true);
});

test('un operador desconocido no hace que la regla se cumpla', () => {
  const result = evaluateCondition({ a: 1 }, { path: 'a', op: 'operadorInexistente', value: 1 });
  assert.equal(result.ok, false);
  assert.equal(result.unknownOperator, 'operadorInexistente');
});

test('la negación de una condición funciona', () => {
  assert.equal(evaluateCondition({ a: 1 }, { path: 'a', op: 'equals', value: 1 }).ok, true);
  assert.equal(evaluateCondition({ a: 1 }, { path: 'a', op: 'equals', value: 1, negate: true }).ok, false);
});

test('comparación entre dos campos de la configuración', () => {
  const config = { capacity: { registeredUsers: 10, peakConcurrentUsers: 50 } };
  assert.equal(evaluateCondition(config, { path: 'capacity.peakConcurrentUsers', op: 'gtField', value: 'capacity.registeredUsers' }).ok, true);
  assert.equal(evaluateCondition(config, { path: 'capacity.registeredUsers', op: 'ltField', value: 'capacity.peakConcurrentUsers' }).ok, true);
});

test('no quedan operadores desconocidos en el catálogo de reglas', () => {
  const result = evaluate({});
  assert.deepEqual(result.unknownOperators, []);
});

test('multi-tenant con despliegue solo local es contradicción lógica', () => {
  const result = evaluate({
    classification: { systemTypes: ['crm'], deployment: ['local'], tenancy: 'multi-tenant-shared' }
  });
  assert.ok(ids(result).includes('R-LOGIC-001'));
  assert.equal(result.findings.find((f) => f.id === 'R-LOGIC-001').severity, 'error');
});

test('multi-tenant con despliegue en nube no genera la contradicción', () => {
  const result = evaluate({
    classification: { systemTypes: ['crm'], deployment: ['cloud', 'local'], tenancy: 'multi-tenant-shared' }
  });
  assert.ok(!ids(result).includes('R-LOGIC-001'));
});

test('SaaS sin despliegue de servidor es error', () => {
  const result = evaluate({
    classification: { systemTypes: ['crm'], serviceModel: ['saas'], deployment: ['local'] }
  });
  assert.ok(ids(result).includes('R-LOGIC-002'));
});

test('concurrencia mayor que usuarios registrados es error', () => {
  const result = evaluate({ capacity: { registeredUsers: 50, peakConcurrentUsers: 500 } });
  assert.ok(ids(result).includes('R-CAP-001'));
});

test('activos diarios mayores que mensuales es advertencia', () => {
  const result = evaluate({ capacity: { registeredUsers: 1000, mau: 100, dau: 500 } });
  assert.ok(ids(result).includes('R-CAP-002'));
});

test('microservicios con carga baja y equipo pequeño es advertencia', () => {
  const result = evaluate({
    classification: { systemTypes: ['crm'], architecture: ['microservices'] },
    capacity: { registeredUsers: 100, peakConcurrentUsers: 20 },
    operations: { teamSize: 3 }
  });
  assert.ok(ids(result).includes('R-ARCH-001'));
});

test('microservicios con carga alta no genera esa advertencia', () => {
  const result = evaluate({
    classification: { systemTypes: ['crm'], architecture: ['microservices'] },
    capacity: { registeredUsers: 500000, peakConcurrentUsers: 30000 },
    operations: { teamSize: 40 }
  });
  assert.ok(!ids(result).includes('R-ARCH-001'));
});

test('control industrial solo en nube pública es advertencia', () => {
  const result = evaluate({
    classification: { systemTypes: ['scada'], deployment: ['cloud'] }
  });
  assert.ok(ids(result).includes('R-ARCH-004'));
});

test('datos de tarjeta sin PCI declarado es advertencia', () => {
  const result = evaluate({
    classification: { systemTypes: ['ecommerce'], dataSensitivity: ['cardholder'] },
    compliance: { standards: ['ISO/IEC 27001'] }
  });
  assert.ok(ids(result).includes('R-SEC-001'));
});

test('declarar PCI DSS evita esa advertencia', () => {
  const result = evaluate({
    classification: { systemTypes: ['ecommerce'], dataSensitivity: ['cardholder'] },
    compliance: { standards: ['PCI DSS 4.0'] }
  });
  assert.ok(!ids(result).includes('R-SEC-001'));
});

test('datos sensibles sin cifrado en reposo es advertencia', () => {
  const result = evaluate({
    classification: { systemTypes: ['ehr'], dataSensitivity: ['sensitive-personal'] },
    security: { encryptionAtRest: false }
  });
  assert.ok(ids(result).includes('R-SEC-002'));
});

test('datos de menores sin consentimiento es advertencia', () => {
  const result = evaluate({
    classification: { systemTypes: ['lms'], dataSensitivity: ['minors'] }
  });
  assert.ok(ids(result).includes('R-SEC-003'));
});

test('aplicar pruebas sin puntuación ni baremos genera advertencias psicométricas', () => {
  const result = evaluate({ classification: { systemTypes: ['cbt'] } });
  const found = ids(result);
  assert.ok(found.includes('R-PSY-001'));
});

test('puntuación sin análisis psicométrico es advertencia', () => {
  const result = evaluate({ classification: { systemTypes: ['cbt', 'scoring-engine'] } });
  assert.ok(ids(result).includes('R-PSY-002'));
});

test('informes interpretativos sin baremos es advertencia', () => {
  const result = evaluate({ classification: { systemTypes: ['assessment-reporting'] } });
  assert.ok(ids(result).includes('R-PSY-003'));
});

test('resultados psicométricos siempre advierten sobre licencias de instrumentos', () => {
  const result = evaluate({
    classification: { systemTypes: ['psychometric-analysis'], dataSensitivity: ['psychometric'] }
  });
  assert.ok(ids(result).includes('R-PSY-004'));
});

test('agentes sin controles de presupuesto es advertencia', () => {
  const result = evaluate({
    classification: { systemTypes: ['agent-platform'] },
    technology: { aiUsage: { enabled: true, provider: 'externo' } }
  });
  assert.ok(ids(result).includes('R-AI-001'));
});

test('recuperación aumentada sin autorización por registro es advertencia', () => {
  const result = evaluate({ classification: { systemTypes: ['rag'] } });
  assert.ok(ids(result).includes('R-AI-002'));
});

test('decisiones automatizadas sin gobierno de IA es advertencia', () => {
  const result = evaluate({
    classification: { systemTypes: ['crm'] },
    technology: { aiUsage: { enabled: true, automatedDecisions: true, provider: 'externo' } }
  });
  assert.ok(ids(result).includes('R-AI-003'));
});

test('red aislada con inferencia remota es advertencia', () => {
  const result = evaluate({
    classification: { systemTypes: ['crm'], deployment: ['air-gapped'] },
    technology: { aiUsage: { enabled: true, provider: 'proveedor remoto' } }
  });
  assert.ok(ids(result).includes('R-SEC-005'));
});

test('inferencia local en red aislada no genera esa advertencia', () => {
  const result = evaluate({
    classification: { systemTypes: ['crm'], deployment: ['air-gapped'] },
    technology: { aiUsage: { enabled: true, provider: 'local' } }
  });
  assert.ok(!ids(result).includes('R-SEC-005'));
});

test('disponibilidad exigente sin guardia es advertencia', () => {
  const result = evaluate({ capacity: { slaAvailability: 99.99 }, operations: { onCall: false } });
  assert.ok(ids(result).includes('R-OPS-001'));
  assert.ok(ids(result).includes('R-OPS-002'));
});

test('multi-región sin estrategia de consistencia es advertencia', () => {
  const result = evaluate({ capacity: { regions: ['a', 'b'] } });
  assert.ok(ids(result).includes('R-OPS-003'));
});

test('alta escala sin pruebas de carga es informativo', () => {
  const result = evaluate({ capacity: { registeredUsers: 5000000, peakConcurrentUsers: 100000 }, operations: { loadTesting: false } });
  assert.ok(ids(result).includes('R-OPS-004'));
});

test('modo existente sin repositorio es advertencia', () => {
  const result = evaluate({ identity: { name: 'X', purpose: 'Y', mode: 'existing' } });
  assert.ok(ids(result).includes('R-INT-001'));
});

test('sistema público sin objetivo de accesibilidad es advertencia', () => {
  const result = evaluate({ classification: { systemTypes: ['e-government'] } });
  assert.ok(ids(result).includes('R-PLAT-002'));
});

test('datos personales sin plazo de conservación es advertencia', () => {
  const result = evaluate({
    classification: { systemTypes: ['crm'], dataSensitivity: ['personal'] },
    capacity: { retentionMonths: 0 }
  });
  assert.ok(ids(result).includes('R-DATA-001'));
});

test('integridad registral sin integridad transaccional es advertencia', () => {
  const result = evaluate({ classification: { systemTypes: ['ledger'] } });
  assert.ok(ids(result).includes('R-DATA-003'));
});

test('sin tipo de sistema el motor lo marca como error', () => {
  const result = evaluate({ classification: { systemTypes: [] } });
  assert.ok(ids(result).includes('D-NO-TYPE'));
});

test('las dependencias faltantes del catálogo aparecen como advertencia derivada', () => {
  const result = evaluate({ classification: { systemTypes: ['erp'] } });
  assert.ok(ids(result).some((id) => id.startsWith('D-DEP:erp:ledger')));
});

test('las restricciones del catálogo aparecen como informativos', () => {
  const result = evaluate({ classification: { systemTypes: ['core-banking'] } });
  assert.ok(ids(result).some((id) => id.startsWith('D-CONSTRAINT:core-banking')));
});

test('toda combinación de dimensiones técnicamente válida no produce errores', () => {
  const result = evaluate({
    classification: {
      systemTypes: ['erp', 'crm', 'workflow'],
      serviceModel: ['saas'],
      architecture: ['modular-monolith', 'event-driven'],
      deployment: ['cloud'],
      tenancy: 'multi-tenant-schema',
      platforms: ['web', 'android'],
      licensing: 'proprietary',
      monetization: ['subscription'],
      integrationStyle: ['rest', 'message-queue']
    },
    capacity: { registeredUsers: 5000, dau: 2000, peakConcurrentUsers: 300, retentionMonths: 60 },
    operations: { teamSize: 10 }
  });
  assert.equal(result.counts.error, 0, JSON.stringify(result.bySeverity.error, null, 2));
});

test('cada hallazgo trae justificación y recomendación', () => {
  const result = evaluate({ classification: { systemTypes: ['cbt'], deployment: ['local'], tenancy: 'multi-tenant-shared' } });
  for (const finding of result.findings) {
    assert.ok(finding.title, `${finding.id} sin título`);
    assert.ok(finding.message, `${finding.id} sin mensaje`);
    assert.ok(finding.rationale, `${finding.id} sin justificación`);
    assert.ok(finding.recommendation, `${finding.id} sin recomendación`);
    assert.ok(['error', 'warning', 'info'].includes(finding.severity));
  }
});
