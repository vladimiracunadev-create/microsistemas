/**
 * Motor de capacidad: fórmulas, supuestos, configuraciones extremas y costos.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { computeCapacity, resolveInputs, DEFAULTS } from '../core/capacity/capacity.js';
import { normalizeConfig } from '../core/schema/config-schema.js';
import { minimalConfig } from './helpers.mjs';

function compute(capacityOverrides = {}, rest = {}) {
  return computeCapacity(normalizeConfig(minimalConfig({ capacity: capacityOverrides, ...rest })));
}

test('sin magnitudes declaradas no hay dimensionamiento', () => {
  const result = compute({});
  assert.equal(result.hasDemand, false);
  assert.match(result.disclaimer, /no hay dimensionamiento posible/);
});

test('cada resultado declara fórmula, unidades y entradas', () => {
  const result = compute({ registeredUsers: 1000, dau: 400, peakConcurrentUsers: 50 });
  assert.ok(result.results.length >= 10);
  for (const r of result.results) {
    assert.ok(r.label, `${r.id} sin etiqueta`);
    assert.ok(r.unit, `${r.id} sin unidad`);
    assert.ok(r.formula, `${r.id} sin fórmula`);
    assert.ok(r.inputs && Object.keys(r.inputs).length > 0, `${r.id} sin entradas`);
    assert.equal(typeof r.value, 'number');
    assert.ok(Number.isFinite(r.value), `${r.id} con valor no finito`);
  }
});

test('el throughput sigue la fórmula declarada', () => {
  const result = compute({ dau: 86400, sessionsPerUserPerDay: 1, requestsPerSession: 1, peakFactor: 2 });
  assert.equal(result.derived.avgRps, 1);
  assert.equal(result.derived.peakRps, 2);
});

test('la concurrencia sigue la ley de Little', () => {
  // 86400 sesiones al día a 60 s cada una = 60 sesiones concurrentes medias.
  const result = compute({ dau: 86400, sessionsPerUserPerDay: 1, avgSessionMinutes: 1, peakFactor: 1 });
  assert.equal(result.derived.avgConcurrentSessions, 60);
});

test('lecturas y escrituras suman el total de solicitudes', () => {
  const result = compute({ dau: 100000, sessionsPerUserPerDay: 2, requestsPerSession: 50, readWriteRatio: 9 });
  const { peakRps, readsPerSecond, writesPerSecond } = result.derived;
  assert.ok(Math.abs((readsPerSecond + writesPerSecond) - peakRps) < 0.05);
  assert.ok(readsPerSecond > writesPerSecond * 8);
});

test('la concurrencia declarada tiene prioridad sobre la modelada', () => {
  const result = compute({ dau: 1000, peakConcurrentUsers: 777 });
  assert.equal(result.derived.peakConcurrency, 777);
  const modeled = result.resultsById.peakConcurrentModeled;
  assert.match(modeled.note, /777/);
});

test('sin concurrencia declarada la nota lo advierte explícitamente', () => {
  const result = compute({ dau: 1000 });
  assert.match(result.resultsById.peakConcurrentModeled.note, /no una medición/);
});

test('los supuestos del motor se declaran con su justificación', () => {
  const result = compute({ registeredUsers: 10000 });
  assert.ok(result.assumptions.length > 0);
  for (const assumption of result.assumptions) {
    assert.ok(assumption.id);
    assert.ok(assumption.text);
    assert.ok(assumption.because, `el supuesto ${assumption.id} no explica por qué`);
  }
  assert.ok(result.assumptions.some((a) => a.id === 'dau'));
});

test('no se introducen supuestos cuando todo está declarado', () => {
  const result = compute({
    registeredUsers: 1000, mau: 800, dau: 300, peakConcurrentUsers: 40,
    sessionsPerUserPerDay: 2, requestsPerSession: 40, avgSessionMinutes: 10,
    readWriteRatio: 9, avgRecordKb: 2, egressPerRequestKb: 50, peakFactor: 3, retentionMonths: 36
  });
  assert.deepEqual(result.assumptions, []);
});

test('los activos mensuales se derivan de los registrados cuando faltan', () => {
  const inputs = resolveInputs(normalizeConfig(minimalConfig({ capacity: { registeredUsers: 1000 } })));
  assert.equal(inputs.mau, 1000 * DEFAULTS.mauOverRegistered);
  assert.equal(inputs.dau, inputs.mau * DEFAULTS.dauOverMau);
});

test('el almacenamiento acumulado respeta el plazo de conservación', () => {
  const base = { dau: 100000, sessionsPerUserPerDay: 2, requestsPerSession: 50, avgRecordKb: 2, retentionMonths: 12 };
  const short = compute(base);
  const long = compute({ ...base, retentionMonths: 24 });
  assert.ok(Math.abs(long.derived.retainedGb - short.derived.retainedGb * 2) < 1);
});

test('la disponibilidad se traduce en minutos de indisponibilidad', () => {
  const result = compute({ dau: 100, slaAvailability: 99.9 });
  assert.ok(Math.abs(result.availability.downtimeMinutesPerMonth - 43.2) < 0.1);
  const strict = compute({ dau: 100, slaAvailability: 99.99 });
  assert.ok(strict.availability.downtimeMinutesPerMonth < 5);
  assert.match(strict.availability.note, /[Nn]o se alcanza con operación en horario de oficina/);
});

test('sin precios unitarios no se estima costo', () => {
  const result = compute({ dau: 1000 });
  assert.equal(result.cost, null);
});

test('con precios unitarios el costo detalla cada partida', () => {
  const result = compute(
    { dau: 100000, sessionsPerUserPerDay: 2, requestsPerSession: 50, retentionMonths: 12 },
    { operations: { monthlyBudgetUsd: 100, unitCosts: { vcpuMonthUsd: 20, gbRamMonthUsd: 5, gbStorageMonthUsd: 0.1, gbEgressUsd: 0.08 } } }
  );
  assert.ok(result.cost);
  assert.ok(result.cost.lines.length >= 3);
  for (const line of result.cost.lines) {
    assert.ok(line.formula);
    assert.ok(line.monthlyUsd > 0);
  }
  assert.equal(result.cost.budgetUsd, 100);
  assert.equal(result.cost.withinBudget, false);
  assert.match(result.cost.budgetNote, /supera el presupuesto/);
});

test('el consumo de tokens solo se calcula si hay uso de IA declarado', () => {
  const without = compute({ dau: 100 });
  assert.equal(without.resultsById.tokensPerDay, undefined);
  const withAi = compute({ dau: 100 }, {
    technology: { aiUsage: { enabled: true, provider: 'local', tokensPerOperation: 1000, operationsPerDay: 500 } }
  });
  assert.equal(withAi.derived.tokensPerDay, 500000);
});

test('los trabajadores asíncronos se dimensionan solo si hay tareas declaradas', () => {
  const none = compute({ dau: 100 });
  assert.equal(none.resultsById.workers, undefined);
  const some = compute({ dau: 100, backgroundJobsPerDay: 864000 });
  assert.ok(some.resultsById.workers.value >= 1);
});

test('escala pequeña: una instancia basta', () => {
  const result = compute({ registeredUsers: 1, dau: 1, peakConcurrentUsers: 1, requestsPerSession: 10 });
  assert.equal(result.derived.instances, 1);
  assert.ok(result.derived.peakRps < 1);
});

test('escala masiva: los números crecen de forma proporcional y finita', () => {
  const result = compute({
    registeredUsers: 20000000, dau: 4000000, peakConcurrentUsers: 600000,
    sessionsPerUserPerDay: 5, requestsPerSession: 80, peakFactor: 3.5, readWriteRatio: 40
  });
  assert.ok(result.derived.peakRps > 10000);
  assert.ok(Number.isFinite(result.derived.vcpu));
  assert.ok(result.derived.instances > 100);
  assert.ok(result.bottlenecks.length >= 3);
});

test('valores extremos no producen NaN ni Infinity', () => {
  const extremes = [
    { registeredUsers: Number.MAX_SAFE_INTEGER, dau: Number.MAX_SAFE_INTEGER },
    { registeredUsers: 0.00001, dau: 0.00001 },
    { registeredUsers: -100, dau: -5, readWriteRatio: -3 },
    { registeredUsers: 1000, avgSessionMinutes: 0, requestsPerSession: 0, peakFactor: 0 }
  ];
  for (const capacity of extremes) {
    const result = compute(capacity);
    for (const r of result.results) {
      assert.ok(Number.isFinite(r.value), `${r.id} no finito con ${JSON.stringify(capacity)}`);
    }
  }
});

test('valores negativos se tratan como no declarados', () => {
  const result = compute({ registeredUsers: -500, dau: -10 });
  assert.equal(result.hasDemand, false);
});

test('los rangos acompañan a los resultados estimados', () => {
  const result = compute({ dau: 10000 });
  const peak = result.resultsById.peakRps;
  assert.ok(peak.range);
  assert.ok(peak.range.low < peak.value);
  assert.ok(peak.range.high > peak.value);
});

test('los cuellos de botella identificados traen mitigación y validación', () => {
  const result = compute({
    dau: 2000000, sessionsPerUserPerDay: 4, requestsPerSession: 100, readWriteRatio: 2,
    peakConcurrentUsers: 50000, retentionMonths: 60, seasonalPeakFactor: 5, criticalResource: 'cupo de agenda'
  });
  assert.ok(result.bottlenecks.length >= 4);
  for (const b of result.bottlenecks) {
    assert.ok(b.component);
    assert.ok(b.reason);
    assert.ok(b.mitigation);
    assert.ok(b.validation);
  }
  assert.ok(result.bottlenecks.some((b) => b.id === 'declared-critical-resource'));
});

test('el dominio de aplicación de pruebas añade su cuello de botella propio', () => {
  const result = computeCapacity(normalizeConfig(minimalConfig({
    classification: { systemTypes: ['cbt'] },
    capacity: { dau: 50000, peakConcurrentUsers: 20000 }
  })));
  assert.ok(result.bottlenecks.some((b) => b.id === 'concentrated-window'));
});

test('el mismo cálculo es determinista', () => {
  const capacity = { registeredUsers: 5000, dau: 2000, peakConcurrentUsers: 300 };
  assert.deepEqual(compute(capacity).derived, compute(capacity).derived);
});
