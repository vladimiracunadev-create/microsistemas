/**
 * Motor de evolución temporal y escalabilidad.
 *
 * Obligatorio para todo sistema. No fija un horizonte: acepta cualquier plazo
 * declarado por el usuario y también escenarios sin término conocido.
 * La escalabilidad se trata como una capacidad sometida a medición continua:
 * cada proyección declara su modelo de crecimiento y sus supuestos, y el
 * resultado incluye un plan de revisión con indicadores y umbrales.
 */

/** Modelos de crecimiento admitidos. */
export const GROWTH_MODELS = Object.freeze([
  { id: 'linear', name: 'Crecimiento constante', description: 'Se incorpora cada año la misma cantidad absoluta que el primer año.' },
  { id: 'percent', name: 'Crecimiento porcentual', description: 'Crecimiento compuesto sobre la base del periodo anterior.' },
  { id: 'accelerated', name: 'Crecimiento acelerado', description: 'La tasa misma aumenta con el tiempo (efecto de red o expansión comercial).' },
  { id: 'seasonal', name: 'Estacional', description: 'Crecimiento compuesto con oscilación periódica dentro del año.' },
  { id: 'step', name: 'Variación abrupta', description: 'Saltos discretos al incorporarse organizaciones o mercados completos.' },
  { id: 'stagnation', name: 'Estancamiento', description: 'La base se mantiene; el trabajo se desplaza a eficiencia y costo.' },
  { id: 'decline', name: 'Disminución', description: 'Contracción sostenida de la demanda.' }
]);

/** Etapas de referencia. Son hitos configurables, no un calendario obligatorio. */
export const STAGES = Object.freeze([
  { id: 'initial', name: 'Estado inicial', fraction: 0 },
  { id: 'early-growth', name: 'Crecimiento temprano', fraction: 0.15 },
  { id: 'expansion', name: 'Expansión', fraction: 0.4 },
  { id: 'consolidation', name: 'Consolidación', fraction: 0.65 },
  { id: 'modernization', name: 'Modernización', fraction: 0.85 },
  { id: 'long-run', name: 'Evolución prolongada', fraction: 1 }
]);

/** Las veinte dimensiones de evolución que todo plan debe cubrir. */
export const EVOLUTION_DIMENSIONS = Object.freeze([
  'userGrowth', 'dataGrowth', 'operationGrowth', 'newModules', 'newRoles',
  'newCountries', 'newRegulations', 'newChannels', 'newIntegrations', 'componentReplacement',
  'technologyUpdates', 'databaseMigration', 'infrastructureChange', 'demandShift', 'operatingCosts',
  'maintainability', 'observability', 'security', 'continuity', 'sustainability'
]);

const DEFAULT_SCENARIO_FACTORS = Object.freeze({ conservative: 0.5, expected: 1, demanding: 2 });

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function round(v, d = 2) {
  if (!Number.isFinite(v)) return 0;
  const f = 10 ** d;
  return Math.round(v * f) / f;
}

/**
 * Multiplicador de crecimiento para un mes dado.
 * @param {string} model
 * @param {number} annualRatePercent
 * @param {number} month
 */
export function growthMultiplier(model, annualRatePercent, month, options = {}) {
  const years = month / 12;
  const r = annualRatePercent / 100;

  switch (model) {
    case 'linear':
      return 1 + r * years;
    case 'percent':
      return (1 + r) ** years;
    case 'accelerated':
      return (1 + r) ** (years ** 1.3);
    case 'seasonal': {
      const base = (1 + r) ** years;
      const amplitude = options.seasonalAmplitude ?? 0.3;
      const phase = Math.sin((2 * Math.PI * month) / 12);
      return base * (1 + amplitude * phase);
    }
    case 'step': {
      const stepMonths = options.stepEveryMonths ?? 12;
      const steps = Math.floor(month / stepMonths);
      return 1 + r * steps;
    }
    case 'stagnation':
      return 1;
    case 'decline':
      return Math.max((1 - r) ** years, 0);
    default:
      return (1 + r) ** years;
  }
}

/** Resuelve el horizonte efectivo en meses y los puntos de proyección. */
export function resolveHorizon(config) {
  const h = (config.evolution && config.evolution.horizon) || {};
  const assumptions = [];
  let months = num(h.value);
  const unit = h.unit || 'months';
  if (unit === 'years') months *= 12;
  if (unit === 'quarters') months *= 3;

  const openEnded = Boolean(h.openEnded);
  if (openEnded) {
    const planningWindow = months > 0 ? months : 60;
    assumptions.push({
      id: 'openEndedHorizon',
      text: `El escenario se declaró sin fecha de término conocida. Se proyecta una ventana de planificación de ${planningWindow} meses y el plan de revisión queda indefinido en el tiempo.`,
      because: 'Un sistema sin término conocido no se analiza con un plazo final, sino con revisiones periódicas que no caducan.'
    });
    return { months: planningWindow, openEnded: true, assumptions, declaredUnit: unit };
  }

  if (!(months > 0)) {
    assumptions.push({
      id: 'missingHorizon',
      text: 'No se declaró horizonte: no se proyecta evolución temporal.',
      because: 'El horizonte es una decisión del usuario y el motor no lo inventa.'
    });
    return { months: 0, openEnded: false, assumptions, declaredUnit: unit };
  }

  return { months, openEnded: false, assumptions, declaredUnit: unit };
}

/** Puntos de muestreo de la proyección: etapas más los meses de los hitos. */
function projectionMonths(horizonMonths, milestones) {
  const set = new Set([0]);
  for (const stage of STAGES) set.add(Math.round(horizonMonths * stage.fraction));
  for (const m of milestones) {
    if (m.kind === 'time' && num(m.atMonth) >= 0 && num(m.atMonth) <= horizonMonths) set.add(Math.round(num(m.atMonth)));
  }
  return [...set].filter((m) => m >= 0 && m <= horizonMonths).sort((a, b) => a - b);
}

/**
 * Proyecta la evolución del sistema.
 * @param {object} config
 * @param {object} capacity resultado de computeCapacity
 */
export function projectEvolution(config, capacity) {
  const ev = config.evolution || {};
  const horizon = resolveHorizon(config);
  const assumptions = [...horizon.assumptions];

  const model = ev.growthModel || 'percent';
  if (!ev.growthModel) {
    assumptions.push({
      id: 'growthModel',
      text: 'Se asume crecimiento porcentual compuesto.',
      because: 'No se declaró el modelo de crecimiento. El modelo cambia radicalmente el resultado a largo plazo y debe elegirse de forma explícita.'
    });
  }

  let expectedRate = num(ev.growthRatePercent);
  if (!expectedRate && model !== 'stagnation') {
    expectedRate = 0;
    assumptions.push({
      id: 'growthRate',
      text: 'No se declaró tasa de crecimiento: la proyección se mantiene plana en el escenario esperado.',
      because: 'El motor no inventa una tasa de crecimiento. Sin ella no hay proyección de demanda, solo el estado inicial.'
    });
  }

  const declared = ev.scenarios || {};
  const scenarioRates = {
    conservative: num(declared.conservative?.ratePercent) || expectedRate * DEFAULT_SCENARIO_FACTORS.conservative,
    expected: expectedRate,
    demanding: num(declared.demanding?.ratePercent) || expectedRate * DEFAULT_SCENARIO_FACTORS.demanding
  };
  if (!num(declared.conservative?.ratePercent) || !num(declared.demanding?.ratePercent)) {
    assumptions.push({
      id: 'scenarioRates',
      text: `Escenarios derivados de la tasa esperada: conservador ${round(scenarioRates.conservative, 1)}%, esperado ${round(scenarioRates.expected, 1)}%, exigente ${round(scenarioRates.demanding, 1)}% anual.`,
      because: 'No se declararon tasas propias por escenario. Los factores aplicados (mitad y doble) son editables y deben reemplazarse por los supuestos del negocio.'
    });
  }

  const baseUsers = num(config.capacity?.registeredUsers) || num(config.capacity?.dau);
  const baseRps = capacity?.derived?.peakRps || 0;
  const baseStorageMonthly = capacity?.derived?.totalGbPerMonth || 0;
  const baseCost = capacity?.cost?.monthlyUsd || 0;

  const milestones = Array.isArray(ev.milestones) ? ev.milestones : [];
  const months = horizon.months > 0 ? projectionMonths(horizon.months, milestones) : [0];

  const scenarios = Object.entries(scenarioRates).map(([id, rate]) => {
    let cumulativeStorage = 0;
    let previousMonth = 0;
    const points = months.map((month) => {
      const mult = growthMultiplier(model, rate, month, {
        seasonalAmplitude: 0.3,
        stepEveryMonths: 12
      });
      const monthlyStorage = baseStorageMonthly * mult;
      const span = month - previousMonth;
      cumulativeStorage += monthlyStorage * span;
      previousMonth = month;
      return {
        month,
        multiplier: round(mult, 3),
        users: round(baseUsers * mult, 0),
        peakRps: round(baseRps * mult, 2),
        storageGbPerMonth: round(monthlyStorage, 2),
        cumulativeStorageGb: round(cumulativeStorage, 2),
        monthlyCostUsd: baseCost ? round(baseCost * mult, 2) : null
      };
    });
    return {
      id,
      name: { conservative: 'Conservador', expected: 'Esperado', demanding: 'Exigente' }[id],
      annualRatePercent: round(rate, 2),
      note: declared[id]?.note || '',
      points,
      finalMultiplier: points.length ? points[points.length - 1].multiplier : 1
    };
  });

  const stages = horizon.months > 0 ? buildStages(config, horizon, scenarios, capacity) : [];
  const resolvedMilestones = resolveMilestones(config, capacity, horizon);
  const dimensions = analyzeDimensions(config, capacity, scenarios, horizon);
  const reviewPlan = buildReviewPlan(config, capacity, scenarios, horizon);

  return {
    horizon,
    model,
    modelName: (GROWTH_MODELS.find((m) => m.id === model) || {}).name || model,
    scenarioRates,
    scenarios,
    stages,
    milestones: resolvedMilestones,
    dimensions,
    reviewPlan,
    assumptions,
    disclaimer: 'Las proyecciones son escenarios con supuestos editables, no predicciones. Ninguna arquitectura es infinitamente escalable: cada etapa declara el límite que la obliga a cambiar.'
  };
}

/** Construye las etapas con su justificación arquitectónica. */
function buildStages(config, horizon, scenarios, capacity) {
  const expected = scenarios.find((s) => s.id === 'expected') || scenarios[0];
  const arch = config.classification?.architecture || [];
  const types = config.classification?.systemTypes || [];

  const guidance = {
    initial: {
      focus: 'Poner en servicio el alcance mínimo verificable con el menor número de piezas móviles.',
      architecture: arch.length ? `Se mantiene lo declarado: ${arch.join(', ')}.` : 'Monolito modular con límites de módulo explícitos y contratos internos documentados.',
      avoid: 'No se adelanta infraestructura para necesidades no demostradas: ni particionado, ni microservicios, ni multi-región.'
    },
    'early-growth': {
      focus: 'Instrumentar antes de optimizar: indicadores de nivel de servicio, trazas y presupuesto de error.',
      architecture: 'Separación de lecturas, caché del conjunto caliente y extracción del primer proceso asíncrono.',
      avoid: 'No se extraen servicios por estética: solo si hay un límite de equipo o de escalado que lo exija.'
    },
    expansion: {
      focus: 'Escalar los componentes que la medición identificó como contención, no todos.',
      architecture: 'Particionado del almacén más cargado, colas para los procesos de larga duración y extracción de los módulos con escalado o ciclo de cambio divergente.',
      avoid: 'No se migra el motor de datos sin haber agotado índices, consultas y particionado.'
    },
    consolidation: {
      focus: 'Reducir costo unitario y variabilidad operacional sobre una base ya estable.',
      architecture: 'Consolidación de servicios redundantes, revisión de contratos y retiro de componentes duplicados.',
      avoid: 'No se agregan tecnologías nuevas sin retirar las que reemplazan.'
    },
    modernization: {
      focus: 'Sustituir componentes cuyo soporte termina o cuyo costo de mantención ya supera su beneficio.',
      architecture: 'Reemplazo por detrás de contratos estables, con compatibilidad retroactiva y migración por fases reversibles.',
      avoid: 'No se reescribe completo lo que puede sustituirse por partes: refactorizar no es reescribir.'
    },
    'long-run': {
      focus: 'Sostenibilidad: costo, conocimiento del equipo, obsolescencia y continuidad.',
      architecture: 'Arquitectura evolutiva con componentes sustituibles, versionado de contratos y gestión explícita de obsolescencia.',
      avoid: 'No se asume que la arquitectura inicial sigue siendo adecuada: la condición de rediseño debe estar escrita.'
    }
  };

  return STAGES.map((stage) => {
    const month = Math.round(horizon.months * stage.fraction);
    const point = expected.points.find((p) => p.month === month) || expected.points[expected.points.length - 1];
    const g = guidance[stage.id];
    return {
      id: stage.id,
      name: stage.name,
      month,
      label: horizon.openEnded && stage.id === 'long-run'
        ? `Mes ${month} y siguientes (sin término conocido)`
        : `Mes ${month}`,
      projectedUsers: point?.users ?? 0,
      projectedPeakRps: point?.peakRps ?? 0,
      projectedCumulativeStorageGb: point?.cumulativeStorageGb ?? 0,
      focus: g.focus,
      architecture: g.architecture,
      avoid: g.avoid,
      justification: buildStageJustification(stage.id, point, capacity, types),
      exitCondition: buildStageExitCondition(stage.id, point, capacity)
    };
  });
}

function buildStageJustification(stageId, point, capacity, types) {
  const rps = point?.peakRps ?? 0;
  const base = capacity?.derived?.peakRps ?? 0;
  const factor = base > 0 ? round(rps / base, 2) : 1;
  const parts = [];
  parts.push(`Carga proyectada ${rps} req/s en pico (${factor}× la inicial) con ${Number(point?.users || 0).toLocaleString('es')} usuarios.`);
  if (stageId === 'initial') {
    parts.push('El cambio arquitectónico se justifica por una contención medida, no por la cifra de usuarios.');
  } else if (factor >= 4) {
    parts.push('Un crecimiento de cuatro veces o más sobre la línea base invalida los supuestos de dimensionamiento iniciales: corresponde volver a medir antes de decidir.');
  } else {
    parts.push('El crecimiento aún cabe en la arquitectura de la etapa anterior si las mediciones lo confirman.');
  }
  if (types.some((t) => ['cbt', 'assessment-management', 'sis', 'tax-administration', 'utility-billing'].includes(t))) {
    parts.push('Este dominio concentra la carga en ventanas: dimensione por la ventana máxima, no por el promedio del periodo.');
  }
  return parts.join(' ');
}

function buildStageExitCondition(stageId, point, capacity) {
  const latency = capacity?.inputs?.latencyTargetMs || 0;
  const conditions = {
    initial: latency
      ? `Salir cuando el percentil ${capacity?.inputs?.latencyPercentile || 95} supere ${latency} ms de forma sostenida o la utilización de CPU exceda 60% en el pico habitual.`
      : 'Salir cuando la latencia por percentil se degrade de forma sostenida o la utilización de CPU exceda 60% en el pico habitual.',
    'early-growth': 'Salir cuando una sola tabla, servicio o proceso concentre la contención y el escalado vertical deje de ser económico.',
    expansion: 'Salir cuando el costo por operación deje de bajar al agregar capacidad, señal de que el límite es de diseño y no de recursos.',
    consolidation: 'Salir cuando una dependencia crítica anuncie fin de soporte o el costo de mantención supere el de sustitución.',
    modernization: 'Salir cuando los componentes sustituidos estén retirados y los contratos nuevos estén estables en producción.',
    'long-run': 'Revisión permanente: no hay salida, hay ciclos de revisión con umbrales definidos.'
  };
  return conditions[stageId];
}

/** Hitos del usuario más hitos derivados por condición observable. */
function resolveMilestones(config, capacity, horizon) {
  const out = [];
  const declared = Array.isArray(config.evolution?.milestones) ? config.evolution.milestones : [];

  for (const m of declared) {
    out.push({
      id: m.id || `user-${out.length + 1}`,
      name: m.name || '(sin nombre)',
      kind: m.kind,
      atMonth: m.kind === 'time' ? num(m.atMonth) : null,
      condition: m.kind === 'condition' ? m.condition : null,
      origin: 'declarado',
      expression: m.kind === 'time'
        ? `Mes ${num(m.atMonth)}`
        : `Cuando: ${m.condition}`
    });
  }

  // Hitos por condición observable derivados del dimensionamiento.
  const d = capacity?.derived || {};
  const inputs = capacity?.inputs || {};
  const derived = [];

  if (d.peakConcurrency > 0) {
    derived.push({
      id: 'cond-concurrency',
      name: 'Concurrencia duplicada respecto de la línea base',
      condition: `Las sesiones concurrentes en pico superan ${Math.round(d.peakConcurrency * 2).toLocaleString('es')}`,
      action: 'Revisar el dimensionamiento completo y volver a ejecutar las pruebas de carga: los supuestos de concurrencia dejaron de ser válidos.'
    });
  }
  if (d.retainedGb > 0) {
    derived.push({
      id: 'cond-storage',
      name: 'Umbral de almacenamiento',
      condition: `El almacenamiento conservado supera ${Math.round(d.retainedGb * 1.5).toLocaleString('es')} GB`,
      action: 'Activar particionado temporal, archivado por capas y revisión de la política de purga.'
    });
  }
  if (inputs.latencyTargetMs > 0) {
    derived.push({
      id: 'cond-latency',
      name: 'Objetivo de latencia sobrepasado',
      condition: `El percentil ${inputs.latencyPercentile} excede ${inputs.latencyTargetMs} ms durante dos semanas consecutivas`,
      action: 'Abrir revisión arquitectónica: identificar el componente de contención antes de agregar capacidad.'
    });
  }
  if (capacity?.cost?.monthlyUsd) {
    derived.push({
      id: 'cond-cost',
      name: 'Costo operacional desalineado',
      condition: `El costo mensual de infraestructura supera ${Math.round(capacity.cost.monthlyUsd * 1.5).toLocaleString('es')} USD sin crecimiento equivalente de uso`,
      action: 'Auditar costo por operación y revisar dimensionamiento, retención y transferencia.'
    });
  }
  if ((config.capacity?.regions || []).length) {
    derived.push({
      id: 'cond-jurisdiction',
      name: 'Nueva jurisdicción incorporada',
      condition: 'Se incorpora un territorio con requisitos propios de residencia o tratamiento de datos',
      action: 'Reevaluar residencia, base legal, contratos de encargado y estrategia de replicación antes de habilitar el servicio.'
    });
  }
  derived.push({
    id: 'cond-eol',
    name: 'Fin de soporte de una dependencia',
    condition: 'Una dependencia crítica (lenguaje, motor de datos, servicio administrado) anuncia fin de soporte',
    action: 'Planificar la sustitución detrás del contrato existente, con ventana de compatibilidad y plan de reversión.'
  });

  for (const c of derived) {
    out.push({
      id: c.id,
      name: c.name,
      kind: 'condition',
      atMonth: null,
      condition: c.condition,
      action: c.action,
      origin: 'derivado',
      expression: `Cuando: ${c.condition}`
    });
  }

  return out;
}

/** Análisis de las veinte dimensiones de evolución, con contenido derivado. */
function analyzeDimensions(config, capacity, scenarios, horizon) {
  const c = config;
  const d = capacity?.derived || {};
  const expected = scenarios.find((s) => s.id === 'expected') || scenarios[0];
  const last = expected?.points?.[expected.points.length - 1];
  const types = c.classification?.systemTypes || [];
  const list = (arr) => (Array.isArray(arr) && arr.length ? arr.join(', ') : 'no declarado');

  const defs = {
    userGrowth: {
      name: 'Crecimiento de usuarios',
      analysis: last
        ? `De ${Number(c.capacity?.registeredUsers || 0).toLocaleString('es')} a ${Number(last.users || 0).toLocaleString('es')} usuarios en el escenario esperado (${last.multiplier}× en ${last.month} meses).`
        : 'Sin proyección: no se declararon usuarios ni horizonte.',
      watch: 'Razón de activos diarios sobre mensuales y concurrencia en pico.',
      action: 'Revalidar el dimensionamiento cada vez que la base se duplique.'
    },
    dataGrowth: {
      name: 'Crecimiento de datos',
      analysis: last
        ? `Acumulado proyectado de ${Number(last.cumulativeStorageGb || 0).toLocaleString('es')} GB al final del horizonte, con ${d.totalGbPerMonth || 0} GB/mes iniciales.`
        : 'Sin proyección de datos.',
      watch: 'GB por mes, tamaño de las tablas mayores y duración de las copias de respaldo.',
      action: 'Definir particionado y archivado antes de que la migración de esquema deje de caber en una ventana de mantenimiento.'
    },
    operationGrowth: {
      name: 'Crecimiento de operaciones',
      analysis: `Pico inicial de ${d.peakRps || 0} req/s con ${d.writesPerSecond || 0} escrituras/s; proyección a ${last?.peakRps ?? 0} req/s.`,
      watch: 'Escrituras por segundo y latencia del camino de escritura.',
      action: 'Separar ingesta de transacción cuando la escritura se acerque al límite medido del primario.'
    },
    newModules: {
      name: 'Nuevos módulos funcionales',
      analysis: c.evolution?.plannedChanges?.length
        ? `Cambios previstos declarados: ${list(c.evolution.plannedChanges)}.`
        : 'No se declararon módulos futuros: el diseño debe dejar puntos de extensión sin anticipar funcionalidad concreta.',
      watch: 'Acoplamiento entre módulos y frecuencia de cambios que cruzan límites.',
      action: 'Mantener límites de módulo y contratos internos versionados para permitir extracción posterior.'
    },
    newRoles: {
      name: 'Nuevos roles y organizaciones',
      analysis: `${(c.functional?.roles || []).length} roles declarados; modelo organizacional: ${c.functional?.organizations?.model || 'no declarado'}.`,
      watch: 'Proliferación de permisos puntuales y excepciones por cliente.',
      action: 'Modelo de autorización basado en roles con permisos declarativos, evitando condiciones codificadas por cliente.'
    },
    newCountries: {
      name: 'Nuevos países',
      analysis: (c.compliance?.jurisdictions || []).length
        ? `Jurisdicciones declaradas: ${list(c.compliance.jurisdictions)}. Regiones de despliegue: ${list(c.capacity?.regions)}.`
        : 'Sin jurisdicciones declaradas. Incorporar un país nuevo afecta residencia, idioma, moneda, impuestos y plazos legales.',
      watch: 'Requisitos de residencia y de idioma por territorio.',
      action: 'Externalizar idioma, moneda, zona horaria y reglas fiscales desde el inicio; no codificar supuestos de un solo país.'
    },
    newRegulations: {
      name: 'Nuevas normativas',
      analysis: (c.compliance?.regulations || []).length
        ? `Obligaciones identificadas: ${list(c.compliance.regulations)}.`
        : 'No se identificaron obligaciones concretas. Seleccionar una jurisdicción no otorga cumplimiento automático.',
      watch: 'Cambios normativos con efecto retroactivo y nuevos plazos de conservación.',
      action: 'Versionar las reglas con vigencia temporal, de modo que un periodo pasado pueda recalcularse con las reglas de su época.'
    },
    newChannels: {
      name: 'Nuevos canales',
      analysis: `Plataformas declaradas: ${list(c.classification?.platforms)}.`,
      watch: 'Duplicación de lógica entre canales.',
      action: 'Mantener la lógica de dominio detrás de una API propia, de forma que cada canal nuevo sea un cliente y no una copia.'
    },
    newIntegrations: {
      name: 'Nuevas integraciones',
      analysis: `${(c.functional?.integrations || []).length} integraciones declaradas; estilos: ${list(c.classification?.integrationStyle)}.`,
      watch: 'Dependencias sincrónicas con terceros en la ruta crítica.',
      action: 'Aislar cada integración detrás de un adaptador propio con tiempo de espera, reintento y comportamiento degradado definido.'
    },
    componentReplacement: {
      name: 'Sustitución de componentes',
      analysis: `Tecnologías declaradas: ${list(c.technology?.languages)} / ${list(c.technology?.frameworks)}.`,
      watch: 'Componentes sin reemplazo conocido y sin contrato que los aísle.',
      action: 'Marcar explícitamente qué componentes son sustituibles y cuál es su contrato de reemplazo.'
    },
    technologyUpdates: {
      name: 'Actualizaciones tecnológicas',
      analysis: 'Las versiones de lenguaje, dependencias y servicios administrados tienen ciclo de soporte propio, independiente del proyecto.',
      watch: 'Fechas de fin de soporte y vulnerabilidades sin parche disponible.',
      action: 'Fijar versiones con archivo de bloqueo, mantener ventana de actualización periódica y probar la actualización en un ambiente equivalente.'
    },
    databaseMigration: {
      name: 'Migración de bases de datos',
      analysis: (c.technology?.databases || []).length
        ? `Motores declarados: ${c.technology.databases.map((db) => `${db.engine || '?'} (${db.purpose || 'sin propósito'})`).join('; ')}.`
        : 'Sin motor declarado: la estrategia de migración no puede evaluarse.',
      watch: 'Duración de las migraciones de esquema y tamaño de las tablas mayores.',
      action: 'Migraciones compatibles hacia atrás en dos fases (expandir y luego contraer), ejecutadas por lotes y reversibles.'
    },
    infrastructureChange: {
      name: 'Cambios de infraestructura',
      analysis: `Despliegue declarado: ${list(c.classification?.deployment)}; regiones: ${list(c.capacity?.regions)}.`,
      watch: 'Dependencias de servicios propietarios sin equivalente en otro proveedor.',
      action: 'Describir la infraestructura como código y aislar los servicios propietarios detrás de interfaces propias.'
    },
    demandShift: {
      name: 'Expansión o reducción de demanda',
      analysis: `Modelo de crecimiento: ${c.evolution?.growthModel || 'no declarado'}. El plan contempla también estancamiento y disminución, no solo crecimiento.`,
      watch: 'Desviación entre la demanda real y los tres escenarios.',
      action: 'Mantener capacidad elástica en ambos sentidos: poder reducir es tan importante como poder crecer.'
    },
    operatingCosts: {
      name: 'Costos operacionales',
      analysis: capacity?.cost
        ? `Costo inicial estimado ${capacity.cost.monthlyUsd} USD/mes; proyección a ${last?.monthlyCostUsd ?? 'sin dato'} USD/mes.`
        : 'Sin precios unitarios declarados: no hay estimación de costo.',
      watch: 'Costo por operación y por usuario activo, no solo el total.',
      action: 'Revisar el costo unitario en cada etapa; un costo total creciente con costo unitario decreciente es sano.'
    },
    maintainability: {
      name: 'Mantenibilidad',
      analysis: `Equipo declarado: ${num(c.operations?.teamSize) || 'no declarado'} personas. La arquitectura debe caber en la capacidad real de mantención.`,
      watch: 'Tiempo de incorporación de una persona nueva y tiempo de resolución de defectos.',
      action: 'Limitar el número de tecnologías y servicios a lo que el equipo puede operar de forma sostenida.'
    },
    observability: {
      name: 'Observabilidad',
      analysis: c.operations?.observability
        ? 'Declarada. Debe crecer con el sistema: cada componente nuevo nace instrumentado.'
        : 'No declarada. Sin observabilidad no se puede verificar ningún objetivo de nivel de servicio ni detectar degradación.',
      watch: 'Cobertura de instrumentación y costo de la telemetría.',
      action: 'Definir indicadores de nivel de servicio por capacidad de negocio y presupuesto de error asociado.'
    },
    security: {
      name: 'Seguridad',
      analysis: `Sensibilidad declarada: ${list(c.classification?.dataSensitivity)}. Controles declarados: ${[
        c.security?.mfa && 'MFA',
        c.security?.encryptionAtRest && 'cifrado en reposo',
        c.security?.auditTrail && 'registro de auditoría',
        c.security?.secretsManagement && 'gestión de secretos'
      ].filter(Boolean).join(', ') || 'ninguno'}.`,
      watch: 'Vulnerabilidades con explotación activa conocida y permisos acumulados.',
      action: 'Revisión periódica de accesos, análisis de dependencias en cada construcción y modelado de amenazas al cambiar la arquitectura.'
    },
    continuity: {
      name: 'Continuidad',
      analysis: num(c.quality?.rtoMinutes) || num(c.quality?.rpoMinutes)
        ? `Objetivos declarados: RTO ${num(c.quality.rtoMinutes)} min, RPO ${num(c.quality.rpoMinutes)} min.`
        : 'Sin objetivos de recuperación declarados: no es posible diseñar la estrategia de respaldo ni verificarla.',
      watch: 'Resultado de los ensayos de restauración y su duración real.',
      action: 'Ensayar la restauración completa de forma periódica y cronometrada; un respaldo no probado no es un respaldo.'
    },
    sustainability: {
      name: 'Sostenibilidad a largo plazo',
      analysis: horizon.openEnded
        ? 'Escenario sin término conocido: la sostenibilidad se gestiona por ciclos de revisión indefinidos.'
        : `Horizonte declarado de ${horizon.months} meses. Al final del horizonte debe existir una decisión explícita: continuar, rediseñar o retirar.`,
      watch: 'Deuda técnica acumulada, rotación del equipo y concentración de conocimiento en pocas personas.',
      action: 'Mantener documentación viva, pruebas que permitan cambiar sin miedo y un registro de decisiones arquitectónicas.'
    }
  };

  return EVOLUTION_DIMENSIONS.map((id, index) => {
    const def = defs[id];
    return {
      id,
      order: index + 1,
      name: def?.name || id,
      analysis: def?.analysis || 'Sin análisis disponible.',
      watch: def?.watch || '',
      action: def?.action || ''
    };
  });
}

/** Plan de revisión arquitectónica con indicadores, umbrales y decisiones. */
function buildReviewPlan(config, capacity, scenarios, horizon) {
  const d = capacity?.derived || {};
  const inputs = capacity?.inputs || {};
  let frequency = num(config.evolution?.reviewFrequencyMonths);
  const assumptions = [];
  if (!frequency) {
    frequency = horizon.months >= 36 ? 6 : 3;
    assumptions.push(`No se declaró frecuencia de revisión: se propone cada ${frequency} meses, proporcional al horizonte declarado.`);
  }

  const indicators = [];
  const add = (name, metric, threshold, source) => indicators.push({ name, metric, threshold, source });

  if (inputs.latencyTargetMs > 0) {
    add('Latencia', `Percentil ${inputs.latencyPercentile} del tiempo de respuesta`, `${inputs.latencyTargetMs} ms`, 'Objetivo declarado por el usuario');
  } else {
    add('Latencia', 'Percentil 95 del tiempo de respuesta', 'Pendiente de definir', 'No se declaró objetivo de latencia');
  }
  if (inputs.slaAvailability > 0) {
    add('Disponibilidad', 'Porcentaje mensual de disponibilidad', `${inputs.slaAvailability}% (${capacity?.availability?.downtimeMinutesPerMonth} min/mes)`, 'Objetivo declarado');
  }
  if (d.peakConcurrency > 0) {
    add('Concurrencia', 'Sesiones concurrentes en pico', `Alerta al superar ${Math.round(d.peakConcurrency * 1.5).toLocaleString('es')}`, 'Derivado del dimensionamiento');
  }
  if (d.writesPerSecond > 0) {
    add('Escrituras', 'Escrituras por segundo en pico', `Alerta al superar ${Math.round(d.writesPerSecond * 1.5)}`, 'Derivado del dimensionamiento');
  }
  if (d.totalGbPerMonth > 0) {
    add('Crecimiento de datos', 'GB incorporados por mes', `Alerta al superar ${round(d.totalGbPerMonth * 1.5, 1)} GB/mes`, 'Derivado del dimensionamiento');
  }
  if (capacity?.cost?.monthlyUsd) {
    add('Costo', 'Costo mensual de infraestructura por usuario activo', 'Alerta si el costo unitario crece dos periodos seguidos', 'Derivado de los precios unitarios declarados');
  }
  add('Errores', 'Tasa de error de las operaciones críticas', 'Definir presupuesto de error por capacidad de negocio', 'Práctica de ingeniería de confiabilidad');
  add('Deuda técnica', 'Tiempo de ciclo de un cambio pequeño en producción', 'Alerta si crece de forma sostenida', 'Indicador de mantenibilidad');

  return {
    frequencyMonths: frequency,
    openEnded: horizon.openEnded,
    indicators,
    risks: [
      { risk: 'Los supuestos de dimensionamiento no se validan con mediciones reales', impact: 'Alto', mitigation: 'Pruebas de carga con criterios de aceptación antes de cada etapa de crecimiento.' },
      { risk: 'Crecimiento por encima del escenario exigente', impact: 'Alto', mitigation: 'Admisión controlada y degradación funcional planificada mientras se aprovisiona.' },
      { risk: 'Crecimiento por debajo del conservador', impact: 'Medio', mitigation: 'Capacidad reducible y revisión de compromisos de costo fijo.' },
      { risk: 'Fin de soporte de una dependencia crítica', impact: 'Medio', mitigation: 'Inventario de componentes con fechas de soporte y contrato de aislamiento.' },
      { risk: 'Concentración de conocimiento en pocas personas', impact: 'Medio', mitigation: 'Registro de decisiones, documentación viva y rotación de responsabilidades.' },
      { risk: 'Cambio normativo con efecto retroactivo', impact: 'Variable', mitigation: 'Reglas versionadas con vigencia temporal y capacidad de recálculo histórico.' }
    ],
    decisions: [
      'Mantener la arquitectura actual, con ajustes de capacidad.',
      'Escalar selectivamente el componente con contención medida.',
      'Extraer un módulo como servicio independiente.',
      'Sustituir un componente detrás de su contrato.',
      'Rediseñar un subsistema, declarando la condición que lo obliga.',
      'Retirar funcionalidad o el sistema completo.'
    ],
    alternatives: [
      'Escalado vertical antes que horizontal cuando el costo de coordinación supera el beneficio.',
      'Caché y réplicas de lectura antes de particionar.',
      'Particionado antes de cambiar de motor de datos.',
      'Monolito modular con módulos extraíbles antes que microservicios.',
      'Procesamiento asíncrono antes de aumentar la capacidad sincrónica.'
    ],
    requiredTests: [
      'Prueba de carga al nivel del escenario exigente de la etapa siguiente.',
      'Prueba de resistencia sostenida para detectar fugas y degradación acumulada.',
      'Prueba de saturación hasta el rechazo, verificando degradación controlada.',
      'Ensayo de restauración desde respaldo, cronometrado.',
      'Prueba de migración de esquema sobre volumen equivalente al productivo.',
      'Inyección de fallas en las dependencias externas declaradas.'
    ],
    costEstimation: capacity?.cost
      ? `Cada revisión debe comparar el costo real con la proyección del escenario esperado (${capacity.cost.monthlyUsd} USD/mes inicial) y explicar la desviación.`
      : 'Sin precios unitarios declarados no hay base de comparación de costo: declare los precios para habilitar el seguimiento.',
    migrationCriteria: [
      'Existe una contención medida, no supuesta, en un componente identificado.',
      'Se agotaron las opciones de menor costo (índices, consultas, caché, particionado).',
      'El beneficio esperado está cuantificado en el indicador que motiva el cambio.',
      'Existe plan de reversión probado y ventana de compatibilidad definida.',
      'El equipo tiene capacidad de operar la tecnología destino de forma sostenida.'
    ],
    assumptions
  };
}
