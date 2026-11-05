/**
 * Motor de evolución temporal: horizontes, modelos de crecimiento, hitos,
 * dimensiones de evolución y plan de revisión.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { projectEvolution, growthMultiplier, resolveHorizon, EVOLUTION_DIMENSIONS, GROWTH_MODELS, STAGES } from '../core/evolution/evolution.js';
import { computeCapacity } from '../core/capacity/capacity.js';
import { normalizeConfig } from '../core/schema/config-schema.js';
import { minimalConfig } from './helpers.mjs';

function project(overrides) {
  const config = normalizeConfig(minimalConfig(overrides));
  return projectEvolution(config, computeCapacity(config));
}

test('acepta cualquier horizonte declarado, en meses, trimestres o años', () => {
  assert.equal(resolveHorizon(normalizeConfig(minimalConfig({ evolution: { horizon: { unit: 'months', value: 18 } } }))).months, 18);
  assert.equal(resolveHorizon(normalizeConfig(minimalConfig({ evolution: { horizon: { unit: 'years', value: 10 } } }))).months, 120);
  assert.equal(resolveHorizon(normalizeConfig(minimalConfig({ evolution: { horizon: { unit: 'quarters', value: 6 } } }))).months, 18);
});

test('no impone 24 meses ni 5 ni 10 años', () => {
  for (const months of [1, 7, 24, 60, 120, 240, 600]) {
    const result = project({ evolution: { horizon: { unit: 'months', value: months }, growthRatePercent: 10 } });
    assert.equal(result.horizon.months, months);
    assert.equal(result.stages.length, STAGES.length);
    assert.equal(result.stages[result.stages.length - 1].month, months);
  }
});

test('admite escenarios sin fecha de término conocida', () => {
  const result = project({ evolution: { horizon: { unit: 'months', value: 0, openEnded: true }, growthRatePercent: 10 } });
  assert.equal(result.horizon.openEnded, true);
  assert.ok(result.horizon.months > 0, 'debe existir una ventana de planificación');
  assert.ok(result.assumptions.some((a) => a.id === 'openEndedHorizon'));
  assert.equal(result.reviewPlan.openEnded, true);
  assert.match(result.stages[result.stages.length - 1].label, /sin término conocido/);
});

test('sin horizonte no se proyecta y se declara el motivo', () => {
  const result = project({ evolution: { horizon: { unit: 'months', value: 0, openEnded: false } } });
  assert.equal(result.horizon.months, 0);
  assert.deepEqual(result.stages, []);
  assert.ok(result.assumptions.some((a) => a.id === 'missingHorizon'));
});

test('todos los modelos de crecimiento producen multiplicadores finitos', () => {
  for (const model of GROWTH_MODELS) {
    for (const month of [0, 1, 6, 12, 60, 240]) {
      const value = growthMultiplier(model.id, 30, month);
      assert.ok(Number.isFinite(value), `${model.id} en el mes ${month} no es finito`);
      assert.ok(value >= 0, `${model.id} produjo un multiplicador negativo`);
    }
  }
});

test('el crecimiento porcentual compone y el lineal no', () => {
  assert.ok(Math.abs(growthMultiplier('percent', 100, 24) - 4) < 0.001);
  assert.ok(Math.abs(growthMultiplier('linear', 100, 24) - 3) < 0.001);
});

test('el estancamiento mantiene la base y la disminución la reduce', () => {
  assert.equal(growthMultiplier('stagnation', 50, 60), 1);
  assert.ok(growthMultiplier('decline', 20, 24) < 1);
  assert.ok(growthMultiplier('decline', 20, 24) > 0);
});

test('el crecimiento acelerado supera al porcentual a largo plazo', () => {
  assert.ok(growthMultiplier('accelerated', 40, 60) > growthMultiplier('percent', 40, 60));
});

test('el modelo estacional oscila dentro del año', () => {
  const base = growthMultiplier('seasonal', 0, 0);
  const quarter = growthMultiplier('seasonal', 0, 3);
  assert.notEqual(base, quarter);
});

test('el modelo por pasos solo cambia en los saltos', () => {
  assert.equal(growthMultiplier('step', 50, 6), growthMultiplier('step', 50, 11));
  assert.ok(growthMultiplier('step', 50, 12) > growthMultiplier('step', 50, 11));
});

test('los tres escenarios se derivan cuando no se declaran', () => {
  const result = project({ evolution: { horizon: { unit: 'months', value: 36 }, growthRatePercent: 40 } });
  assert.equal(result.scenarioRates.expected, 40);
  assert.equal(result.scenarioRates.conservative, 20);
  assert.equal(result.scenarioRates.demanding, 80);
  assert.ok(result.assumptions.some((a) => a.id === 'scenarioRates'));
});

test('los escenarios declarados por el usuario se respetan', () => {
  const result = project({
    evolution: {
      horizon: { unit: 'months', value: 24 },
      growthRatePercent: 30,
      scenarios: {
        conservative: { ratePercent: 5, note: 'a' },
        expected: { ratePercent: 30, note: 'b' },
        demanding: { ratePercent: 300, note: 'c' }
      }
    }
  });
  assert.equal(result.scenarioRates.conservative, 5);
  assert.equal(result.scenarioRates.demanding, 300);
  assert.ok(!result.assumptions.some((a) => a.id === 'scenarioRates'));
});

test('la proyección de usuarios crece con el escenario', () => {
  const result = project({
    capacity: { registeredUsers: 1000, dau: 400 },
    evolution: { horizon: { unit: 'months', value: 24 }, growthModel: 'percent', growthRatePercent: 50 }
  });
  const expected = result.scenarios.find((s) => s.id === 'expected');
  const demanding = result.scenarios.find((s) => s.id === 'demanding');
  const last = (s) => s.points[s.points.length - 1];
  assert.ok(last(expected).users > 1000);
  assert.ok(last(demanding).users > last(expected).users);
});

test('el almacenamiento acumulado es monótono creciente en el escenario esperado', () => {
  const result = project({
    capacity: { registeredUsers: 10000, dau: 4000, avgRecordKb: 3 },
    evolution: { horizon: { unit: 'months', value: 36 }, growthRatePercent: 20 }
  });
  const points = result.scenarios.find((s) => s.id === 'expected').points;
  for (let i = 1; i < points.length; i += 1) {
    assert.ok(points[i].cumulativeStorageGb >= points[i - 1].cumulativeStorageGb);
  }
});

test('las veinte dimensiones de evolución están cubiertas con contenido', () => {
  const result = project({ evolution: { horizon: { unit: 'months', value: 24 }, growthRatePercent: 10 } });
  assert.equal(result.dimensions.length, 20);
  assert.equal(EVOLUTION_DIMENSIONS.length, 20);
  for (const dimension of result.dimensions) {
    assert.ok(dimension.name, `${dimension.id} sin nombre`);
    assert.ok(dimension.analysis && dimension.analysis !== 'Sin análisis disponible.', `${dimension.id} sin análisis`);
    assert.ok(dimension.action, `${dimension.id} sin acción`);
  }
});

test('cada etapa tiene justificación y condición de salida', () => {
  const result = project({
    capacity: { registeredUsers: 5000, dau: 2000, peakConcurrentUsers: 300 },
    evolution: { horizon: { unit: 'months', value: 48 }, growthRatePercent: 25 }
  });
  for (const stage of result.stages) {
    assert.ok(stage.focus);
    assert.ok(stage.architecture);
    assert.ok(stage.avoid);
    assert.ok(stage.justification);
    assert.ok(stage.exitCondition);
  }
});

test('los hitos admiten tiempo y condición, y el motor agrega los derivados', () => {
  const result = project({
    capacity: { registeredUsers: 10000, dau: 3000, peakConcurrentUsers: 500, latencyTargetMs: 300 },
    evolution: {
      horizon: { unit: 'months', value: 36 },
      growthRatePercent: 20,
      milestones: [
        { id: 'u1', name: 'Hito por tiempo', kind: 'time', atMonth: 12 },
        { id: 'u2', name: 'Hito por condición', kind: 'condition', condition: 'Se supera el primer cliente externo' }
      ]
    }
  });
  const declared = result.milestones.filter((m) => m.origin === 'declarado');
  const derived = result.milestones.filter((m) => m.origin === 'derivado');
  assert.equal(declared.length, 2);
  assert.ok(derived.length >= 3);
  assert.ok(derived.every((m) => m.kind === 'condition' && m.condition && m.action));
  assert.ok(derived.some((m) => m.id === 'cond-latency'));
  assert.ok(derived.some((m) => m.id === 'cond-eol'));
});

test('los hitos declarados por tiempo se incluyen en los puntos de proyección', () => {
  const result = project({
    capacity: { registeredUsers: 1000, dau: 500 },
    evolution: {
      horizon: { unit: 'months', value: 24 },
      growthRatePercent: 10,
      milestones: [{ id: 'u1', name: 'Hito', kind: 'time', atMonth: 7 }]
    }
  });
  const months = result.scenarios[0].points.map((p) => p.month);
  assert.ok(months.includes(7));
});

test('el plan de revisión trae indicadores, umbrales, riesgos y criterios', () => {
  const result = project({
    capacity: { registeredUsers: 20000, dau: 8000, peakConcurrentUsers: 1200, slaAvailability: 99.9, latencyTargetMs: 400 },
    evolution: { horizon: { unit: 'months', value: 48 }, growthRatePercent: 30 }
  });
  const plan = result.reviewPlan;
  assert.ok(plan.frequencyMonths > 0);
  assert.ok(plan.indicators.length >= 5);
  for (const indicator of plan.indicators) {
    assert.ok(indicator.name && indicator.metric && indicator.threshold && indicator.source);
  }
  assert.ok(plan.risks.length >= 5);
  assert.ok(plan.decisions.length >= 5);
  assert.ok(plan.alternatives.length >= 4);
  assert.ok(plan.requiredTests.length >= 5);
  assert.ok(plan.migrationCriteria.length >= 4);
});

test('la frecuencia de revisión se deriva del horizonte cuando no se declara', () => {
  const corto = project({ evolution: { horizon: { unit: 'months', value: 12 }, growthRatePercent: 10 } });
  const largo = project({ evolution: { horizon: { unit: 'months', value: 60 }, growthRatePercent: 10 } });
  assert.equal(corto.reviewPlan.frequencyMonths, 3);
  assert.equal(largo.reviewPlan.frequencyMonths, 6);
  assert.ok(corto.reviewPlan.assumptions.length > 0);
});

test('el descargo deja claro que son escenarios y no predicciones', () => {
  const result = project({ evolution: { horizon: { unit: 'months', value: 24 }, growthRatePercent: 10 } });
  assert.match(result.disclaimer, /no predicciones/);
  assert.match(result.disclaimer, /Ninguna arquitectura es infinitamente escalable/);
});

test('sin tasa declarada la proyección se mantiene plana y lo declara', () => {
  const result = project({ evolution: { horizon: { unit: 'months', value: 24 } } });
  assert.ok(result.assumptions.some((a) => a.id === 'growthRate'));
  const expected = result.scenarios.find((s) => s.id === 'expected');
  assert.equal(expected.points[expected.points.length - 1].multiplier, 1);
});
