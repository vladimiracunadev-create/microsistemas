/**
 * Motor de ingeniería de capacidad.
 *
 * Principios:
 *  - Cada resultado declara fórmula, unidades, entradas y supuestos usados.
 *  - Ningún valor por defecto se presenta como dato: si el motor lo supone,
 *    queda registrado en `assumptions` con su justificación.
 *  - Usuarios registrados, activos y concurrentes son magnitudes distintas y
 *    nunca se usan como equivalentes.
 *  - Cuando no hay mediciones suficientes, el resultado es un escenario con
 *    rango, no una cifra presentada como hecho.
 */

/** Valores por defecto del motor. Se aplican solo si el usuario no declara. */
export const DEFAULTS = Object.freeze({
  dauOverMau: 0.2,
  dauOverRegistered: 0.1,
  mauOverRegistered: 0.4,
  concurrencyOverDau: 0.1,
  sessionsPerUserPerDay: 1.5,
  requestsPerSession: 40,
  avgSessionMinutes: 10,
  peakFactor: 3,
  seasonalPeakFactor: 1,
  readWriteRatio: 9,
  avgRecordKb: 2,
  egressPerRequestKb: 50,
  retentionMonths: 36,
  cpuMsPerRequest: 50,
  targetCpuUtilization: 0.6,
  memoryPerConcurrentSessionMb: 2,
  baseMemoryPerInstanceMb: 1024,
  vcpuPerInstance: 2,
  cacheWindowSeconds: 300,
  cacheHotFraction: 0.2,
  avgJobSeconds: 2,
  targetWorkerUtilization: 0.7,
  rangeLowFactor: 0.6,
  rangeHighFactor: 1.8
});

const SECONDS_PER_DAY = 86400;
const MINUTES_PER_MONTH = 43200; // 30 días

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function round(value, decimals = 2) {
  if (!Number.isFinite(value)) return 0;
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/**
 * Resuelve las entradas base, registrando cada supuesto que el motor
 * necesita introducir porque el usuario no lo declaró.
 */
export function resolveInputs(config) {
  const cap = config.capacity || {};
  const assumptions = [];
  const assume = (id, text, because) => {
    assumptions.push({ id, text, because });
  };

  const registeredUsers = num(cap.registeredUsers);
  let mau = num(cap.mau);
  let dau = num(cap.dau);

  if (!mau && registeredUsers) {
    mau = registeredUsers * DEFAULTS.mauOverRegistered;
    assume('mau', `Activos mensuales estimados en ${round(DEFAULTS.mauOverRegistered * 100, 0)}% de los registrados (${Math.round(mau).toLocaleString('es')}).`,
      'No se declararon usuarios activos mensuales. La proporción entre registrados y activos varía mucho por producto: esta cifra es un punto de partida que debe medirse.');
  }
  if (!dau) {
    if (mau) {
      dau = mau * DEFAULTS.dauOverMau;
      assume('dau', `Activos diarios estimados en ${round(DEFAULTS.dauOverMau * 100, 0)}% de los activos mensuales (${Math.round(dau).toLocaleString('es')}).`,
        'No se declararon usuarios activos diarios. La razón diarios/mensuales mide la frecuencia de uso y debe obtenerse de datos reales.');
    } else if (registeredUsers) {
      dau = registeredUsers * DEFAULTS.dauOverRegistered;
      assume('dau', `Activos diarios estimados en ${round(DEFAULTS.dauOverRegistered * 100, 0)}% de los registrados (${Math.round(dau).toLocaleString('es')}).`,
        'No se declararon usuarios activos. Se deriva de los registrados como escenario inicial.');
    }
  }

  let sessionsPerUserPerDay = num(cap.sessionsPerUserPerDay);
  if (!sessionsPerUserPerDay) {
    sessionsPerUserPerDay = DEFAULTS.sessionsPerUserPerDay;
    assume('sessionsPerUserPerDay', `Se asumen ${sessionsPerUserPerDay} sesiones por usuario activo y por día.`,
      'No se declaró la frecuencia de sesiones.');
  }

  let requestsPerSession = num(cap.requestsPerSession);
  if (!requestsPerSession) {
    requestsPerSession = DEFAULTS.requestsPerSession;
    assume('requestsPerSession', `Se asumen ${requestsPerSession} solicitudes por sesión.`,
      'No se declaró el volumen de solicitudes por sesión. Depende fuertemente del tipo de interfaz.');
  }

  let avgSessionMinutes = num(cap.avgSessionMinutes);
  if (!avgSessionMinutes) {
    avgSessionMinutes = DEFAULTS.avgSessionMinutes;
    assume('avgSessionMinutes', `Se asume una duración media de sesión de ${avgSessionMinutes} minutos.`,
      'No se declaró la duración de sesión, necesaria para estimar concurrencia por la ley de Little.');
  }

  let peakFactor = num(cap.peakFactor);
  if (!peakFactor) {
    peakFactor = DEFAULTS.peakFactor;
    assume('peakFactor', `Se asume un factor de pico de ${peakFactor}x sobre la carga media horaria.`,
      'No se declaró el factor de pico. En sistemas con ventanas de uso concentradas (inscripciones, exámenes, cierres) puede ser mucho mayor.');
  }

  let seasonalPeakFactor = num(cap.seasonalPeakFactor);
  if (!seasonalPeakFactor) {
    seasonalPeakFactor = DEFAULTS.seasonalPeakFactor;
  }

  let readWriteRatio = Number(cap.readWriteRatio);
  if (!Number.isFinite(readWriteRatio) || readWriteRatio <= 0) {
    readWriteRatio = DEFAULTS.readWriteRatio;
    assume('readWriteRatio', `Se asume una relación de ${readWriteRatio} lecturas por cada escritura.`,
      'No se declaró la relación lectura/escritura, que determina la estrategia de caché y de réplicas.');
  }

  let avgRecordKb = num(cap.avgRecordKb);
  if (!avgRecordKb) {
    avgRecordKb = DEFAULTS.avgRecordKb;
    assume('avgRecordKb', `Se asume un tamaño medio de registro de ${avgRecordKb} KB.`,
      'No se declaró el tamaño del registro, necesario para proyectar almacenamiento.');
  }

  let egressPerRequestKb = num(cap.egressPerRequestKb);
  if (!egressPerRequestKb) {
    egressPerRequestKb = DEFAULTS.egressPerRequestKb;
    assume('egressPerRequestKb', `Se asume una respuesta media de ${egressPerRequestKb} KB por solicitud.`,
      'No se declaró el tamaño de respuesta, necesario para estimar transferencia de datos.');
  }

  let retentionMonths = num(cap.retentionMonths);
  if (!retentionMonths) {
    retentionMonths = DEFAULTS.retentionMonths;
    assume('retentionMonths', `Se asume una conservación de ${retentionMonths} meses.`,
      'No se declaró plazo de conservación. En sistemas regulados suele estar fijado por normativa y ser mucho mayor.');
  }

  const declaredConcurrency = num(cap.peakConcurrentUsers);

  return {
    assumptions,
    registeredUsers,
    mau,
    dau,
    declaredConcurrency,
    sessionsPerUserPerDay,
    requestsPerSession,
    avgSessionMinutes,
    peakFactor,
    seasonalPeakFactor,
    readWriteRatio,
    avgRecordKb,
    egressPerRequestKb,
    retentionMonths,
    organizations: num(cap.organizations),
    regions: Array.isArray(cap.regions) ? cap.regions : [],
    backgroundJobsPerDay: num(cap.backgroundJobsPerDay),
    filesPerUserPerMonth: num(cap.filesPerUserPerMonth),
    avgFileMb: num(cap.avgFileMb),
    slaAvailability: num(cap.slaAvailability),
    latencyTargetMs: num(cap.latencyTargetMs),
    latencyPercentile: num(cap.latencyPercentile) || 95,
    criticalResource: String(cap.criticalResource || '')
  };
}

/** Crea un resultado trazable. */
function result(id, label, value, unit, formula, inputs, extra = {}) {
  return {
    id,
    label,
    value: typeof value === 'number' ? round(value, extra.decimals ?? 2) : value,
    unit,
    formula,
    inputs,
    range: extra.range || null,
    note: extra.note || '',
    usesAssumptions: extra.usesAssumptions || []
  };
}

/** Rango conservador/exigente alrededor de un valor estimado. */
function rangeOf(value) {
  return {
    low: round(value * DEFAULTS.rangeLowFactor, 2),
    expected: round(value, 2),
    high: round(value * DEFAULTS.rangeHighFactor, 2)
  };
}

/**
 * Calcula el dimensionamiento completo.
 * @returns {{ inputs, assumptions, results, resultsById, bottlenecks, cost, availability }}
 */
export function computeCapacity(config) {
  const i = resolveInputs(config);
  const results = [];
  const hasDemand = i.dau > 0 || i.registeredUsers > 0;

  /* --- Concurrencia --------------------------------------------------- */
  const sessionsPerSecond = (i.dau * i.sessionsPerUserPerDay) / SECONDS_PER_DAY;
  const avgConcurrentSessions = sessionsPerSecond * (i.avgSessionMinutes * 60);
  const peakConcurrentModeled = avgConcurrentSessions * i.peakFactor;

  results.push(result(
    'avgConcurrentSessions',
    'Sesiones concurrentes medias',
    avgConcurrentSessions,
    'sesiones',
    'L = λ × W  (ley de Little); λ = DAU × sesiones_por_día / 86400; W = duración_sesión_s',
    { dau: i.dau, sessionsPerUserPerDay: i.sessionsPerUserPerDay, avgSessionMinutes: i.avgSessionMinutes },
    { usesAssumptions: ['dau', 'sessionsPerUserPerDay', 'avgSessionMinutes'], decimals: 1 }
  ));

  results.push(result(
    'peakConcurrentModeled',
    'Sesiones concurrentes en pico (modeladas)',
    peakConcurrentModeled,
    'sesiones',
    'concurrencia_pico = concurrencia_media × factor_pico',
    { avgConcurrentSessions: round(avgConcurrentSessions, 1), peakFactor: i.peakFactor },
    {
      range: rangeOf(peakConcurrentModeled),
      usesAssumptions: ['peakFactor'],
      note: i.declaredConcurrency
        ? `La concurrencia declarada es ${i.declaredConcurrency.toLocaleString('es')}. Si difiere mucho del modelo, revise la duración de sesión y el factor de pico antes de dimensionar.`
        : 'No se declaró concurrencia: este valor es una estimación derivada, no una medición.',
      decimals: 1
    }
  ));

  const peakConcurrency = i.declaredConcurrency || peakConcurrentModeled;

  /* --- Throughput ----------------------------------------------------- */
  const requestsPerDay = i.dau * i.sessionsPerUserPerDay * i.requestsPerSession;
  const avgRps = requestsPerDay / SECONDS_PER_DAY;
  const peakRps = avgRps * i.peakFactor;
  const seasonalPeakRps = peakRps * i.seasonalPeakFactor;

  results.push(result(
    'avgRps', 'Solicitudes por segundo (media diaria)', avgRps, 'req/s',
    'RPS_medio = DAU × sesiones_por_día × solicitudes_por_sesión / 86400',
    { dau: i.dau, sessionsPerUserPerDay: i.sessionsPerUserPerDay, requestsPerSession: i.requestsPerSession },
    { usesAssumptions: ['dau', 'sessionsPerUserPerDay', 'requestsPerSession'] }
  ));

  results.push(result(
    'peakRps', 'Solicitudes por segundo en pico', peakRps, 'req/s',
    'RPS_pico = RPS_medio × factor_pico',
    { avgRps: round(avgRps, 2), peakFactor: i.peakFactor },
    { range: rangeOf(peakRps), usesAssumptions: ['peakFactor'] }
  ));

  if (i.seasonalPeakFactor > 1) {
    results.push(result(
      'seasonalPeakRps', 'Solicitudes por segundo en pico estacional', seasonalPeakRps, 'req/s',
      'RPS_estacional = RPS_pico × factor_estacional',
      { peakRps: round(peakRps, 2), seasonalPeakFactor: i.seasonalPeakFactor },
      { range: rangeOf(seasonalPeakRps), note: 'Este es el valor que debe soportar la capacidad máxima aprovisionable, no la media.' }
    ));
  }

  const writesPerSecond = peakRps / (i.readWriteRatio + 1);
  const readsPerSecond = peakRps - writesPerSecond;

  results.push(result(
    'writesPerSecond', 'Escrituras por segundo en pico', writesPerSecond, 'escrituras/s',
    'escrituras_s = RPS_pico / (relación_lectura_escritura + 1)',
    { peakRps: round(peakRps, 2), readWriteRatio: i.readWriteRatio },
    { usesAssumptions: ['readWriteRatio'], note: 'Las escrituras dimensionan el nodo primario de datos y no se reparten con réplicas de lectura.' }
  ));

  results.push(result(
    'readsPerSecond', 'Lecturas por segundo en pico', readsPerSecond, 'lecturas/s',
    'lecturas_s = RPS_pico − escrituras_s',
    { peakRps: round(peakRps, 2), writesPerSecond: round(writesPerSecond, 2) },
    { usesAssumptions: ['readWriteRatio'] }
  ));

  /* --- Recursos iniciales --------------------------------------------- */
  const vcpu = (peakRps * DEFAULTS.cpuMsPerRequest / 1000) / DEFAULTS.targetCpuUtilization;
  const ramMb = peakConcurrency * DEFAULTS.memoryPerConcurrentSessionMb;
  const instances = Math.max(vcpu > 0 ? Math.ceil(vcpu / DEFAULTS.vcpuPerInstance) : 0, 0);
  const totalRamMb = ramMb + instances * DEFAULTS.baseMemoryPerInstanceMb;

  results.push(result(
    'vcpu', 'vCPU de cómputo de aplicación', vcpu, 'vCPU',
    'vCPU = (RPS_pico × CPU_ms_por_solicitud / 1000) / utilización_objetivo',
    { peakRps: round(peakRps, 2), cpuMsPerRequest: DEFAULTS.cpuMsPerRequest, targetUtilization: DEFAULTS.targetCpuUtilization },
    {
      range: rangeOf(vcpu),
      note: `El costo de CPU por solicitud (${DEFAULTS.cpuMsPerRequest} ms) es un supuesto del motor: debe reemplazarse por una medición de perfilado real. Es la entrada que más distorsiona el resultado.`
    }
  ));

  results.push(result(
    'instances', 'Instancias de aplicación', instances, 'instancias',
    'instancias = techo(vCPU / vCPU_por_instancia)',
    { vcpu: round(vcpu, 2), vcpuPerInstance: DEFAULTS.vcpuPerInstance },
    { note: 'Sin considerar redundancia. Para tolerar la pérdida de una instancia, sume al menos una más (N+1).', decimals: 0 }
  ));

  results.push(result(
    'memoryMb', 'Memoria total de aplicación', totalRamMb, 'MB',
    'RAM = concurrencia × MB_por_sesión + instancias × MB_base',
    {
      peakConcurrency: round(peakConcurrency, 1),
      memoryPerConcurrentSessionMb: DEFAULTS.memoryPerConcurrentSessionMb,
      instances,
      baseMemoryPerInstanceMb: DEFAULTS.baseMemoryPerInstanceMb
    },
    { range: rangeOf(totalRamMb), decimals: 0 }
  ));

  /* --- Almacenamiento -------------------------------------------------- */
  const recordsPerMonth = writesPerSecond * SECONDS_PER_DAY * 30;
  const dataGbPerMonth = (recordsPerMonth * i.avgRecordKb) / (1024 * 1024);
  const filesGbPerMonth = (i.registeredUsers * i.filesPerUserPerMonth * i.avgFileMb) / 1024;
  const totalGbPerMonth = dataGbPerMonth + filesGbPerMonth;
  const retainedGb = totalGbPerMonth * i.retentionMonths;

  results.push(result(
    'dataGbPerMonth', 'Crecimiento de datos estructurados', dataGbPerMonth, 'GB/mes',
    'GB_mes = escrituras_s × 86400 × 30 × KB_por_registro / 1048576',
    { writesPerSecond: round(writesPerSecond, 2), avgRecordKb: i.avgRecordKb },
    { range: rangeOf(dataGbPerMonth), usesAssumptions: ['avgRecordKb'], note: 'Se usa la tasa de escritura en pico: es una cota superior del crecimiento. La tasa media produce una cifra menor.' }
  ));

  if (filesGbPerMonth > 0) {
    results.push(result(
      'filesGbPerMonth', 'Crecimiento de archivos', filesGbPerMonth, 'GB/mes',
      'GB_mes = usuarios_registrados × archivos_por_usuario_mes × MB_por_archivo / 1024',
      { registeredUsers: i.registeredUsers, filesPerUserPerMonth: i.filesPerUserPerMonth, avgFileMb: i.avgFileMb }
    ));
  }

  results.push(result(
    'retainedGb', `Almacenamiento acumulado a ${i.retentionMonths} meses`, retainedGb, 'GB',
    'GB_acumulado = GB_mes_total × meses_de_conservación',
    { totalGbPerMonth: round(totalGbPerMonth, 2), retentionMonths: i.retentionMonths },
    {
      range: rangeOf(retainedGb),
      usesAssumptions: ['retentionMonths'],
      note: 'No incluye copias de respaldo, índices ni réplicas. Como referencia, la suma de respaldos e índices suele multiplicar esta cifra por un factor de 2 a 4.'
    }
  ));

  /* --- Transferencia --------------------------------------------------- */
  const egressMbps = (peakRps * i.egressPerRequestKb * 8) / 1000;
  const egressGbPerMonth = (avgRps * i.egressPerRequestKb * SECONDS_PER_DAY * 30) / (1024 * 1024);

  results.push(result(
    'egressMbps', 'Ancho de banda de salida en pico', egressMbps, 'Mbps',
    'Mbps = RPS_pico × KB_por_respuesta × 8 / 1000',
    { peakRps: round(peakRps, 2), egressPerRequestKb: i.egressPerRequestKb },
    { range: rangeOf(egressMbps), usesAssumptions: ['egressPerRequestKb'] }
  ));

  results.push(result(
    'egressGbPerMonth', 'Transferencia de salida mensual', egressGbPerMonth, 'GB/mes',
    'GB_mes = RPS_medio × KB_por_respuesta × 86400 × 30 / 1048576',
    { avgRps: round(avgRps, 2), egressPerRequestKb: i.egressPerRequestKb },
    { range: rangeOf(egressGbPerMonth) }
  ));

  /* --- Caché ----------------------------------------------------------- */
  const cacheWorkingSetMb = (readsPerSecond * DEFAULTS.cacheWindowSeconds * i.avgRecordKb * DEFAULTS.cacheHotFraction) / 1024;

  results.push(result(
    'cacheMb', 'Memoria de caché para el conjunto caliente', cacheWorkingSetMb, 'MB',
    'MB_caché = lecturas_s × ventana_s × KB_por_registro × fracción_caliente / 1024',
    {
      readsPerSecond: round(readsPerSecond, 2),
      cacheWindowSeconds: DEFAULTS.cacheWindowSeconds,
      avgRecordKb: i.avgRecordKb,
      cacheHotFraction: DEFAULTS.cacheHotFraction
    },
    {
      range: rangeOf(cacheWorkingSetMb),
      decimals: 0,
      note: 'La fracción caliente es un supuesto: la distribución real de accesos debe medirse. Una caché mal dimensionada degrada en lugar de ayudar.'
    }
  ));

  /* --- Procesamiento asíncrono ---------------------------------------- */
  if (i.backgroundJobsPerDay > 0) {
    const jobsPerSecond = i.backgroundJobsPerDay / SECONDS_PER_DAY;
    const workers = (jobsPerSecond * DEFAULTS.avgJobSeconds) / DEFAULTS.targetWorkerUtilization;
    results.push(result(
      'workers', 'Trabajadores para procesamiento en segundo plano', Math.ceil(workers), 'trabajadores',
      'trabajadores = techo((tareas_s × segundos_por_tarea) / utilización_objetivo)',
      {
        backgroundJobsPerDay: i.backgroundJobsPerDay,
        jobsPerSecond: round(jobsPerSecond, 4),
        avgJobSeconds: DEFAULTS.avgJobSeconds,
        targetWorkerUtilization: DEFAULTS.targetWorkerUtilization
      },
      { decimals: 0, note: 'Supone llegada uniforme. Si las tareas se concentran (cierres, facturación masiva, cálculo de resultados), dimensione por el lote mayor y su plazo.' }
    ));
  }

  /* --- IA --------------------------------------------------------------- */
  const ai = (config.technology && config.technology.aiUsage) || {};
  let tokensPerDay = 0;
  if (ai.enabled) {
    tokensPerDay = num(ai.tokensPerOperation) * num(ai.operationsPerDay);
    if (tokensPerDay > 0) {
      results.push(result(
        'tokensPerDay', 'Consumo de tokens', tokensPerDay, 'tokens/día',
        'tokens_día = tokens_por_operación × operaciones_por_día',
        { tokensPerOperation: num(ai.tokensPerOperation), operationsPerDay: num(ai.operationsPerDay) },
        { range: rangeOf(tokensPerDay), decimals: 0, note: 'El consumo real depende del tamaño de contexto efectivo, de los reintentos y de las iteraciones de agente. Trate esta cifra como piso.' }
      ));
    }
  }

  /* --- Disponibilidad --------------------------------------------------- */
  let availability = null;
  if (i.slaAvailability > 0) {
    const downtimeMinutesPerMonth = (1 - i.slaAvailability / 100) * MINUTES_PER_MONTH;
    availability = {
      target: i.slaAvailability,
      downtimeMinutesPerMonth: round(downtimeMinutesPerMonth, 1),
      downtimeMinutesPerYear: round(downtimeMinutesPerMonth * 12, 1),
      formula: 'indisponibilidad_mensual_min = (1 − objetivo/100) × 43200',
      note: downtimeMinutesPerMonth < 30
        ? 'Menos de 30 minutos al mes exige detección automática, respuesta permanente y despliegues sin interrupción. No se alcanza con operación en horario de oficina.'
        : 'Verifique que la ventana de mantenimiento planificada esté incluida o excluida del cómputo del objetivo.'
    };
    results.push(result(
      'downtimeBudget', 'Presupuesto de indisponibilidad', downtimeMinutesPerMonth, 'minutos/mes',
      availability.formula, { slaAvailability: i.slaAvailability }, { decimals: 1, note: availability.note }
    ));
  }

  /* --- Costos ----------------------------------------------------------- */
  const unit = (config.operations && config.operations.unitCosts) || {};
  let cost = null;
  const hasUnitCosts = ['vcpuMonthUsd', 'gbRamMonthUsd', 'gbStorageMonthUsd', 'gbEgressUsd', 'perMillionTokensUsd']
    .some((k) => num(unit[k]) > 0);

  if (hasUnitCosts) {
    const lines = [];
    const push = (label, qty, unitPrice, unitLabel, formula) => {
      if (!(qty > 0) || !(unitPrice > 0)) return;
      lines.push({ label, quantity: round(qty, 2), unitPrice, unitLabel, monthlyUsd: round(qty * unitPrice, 2), formula });
    };
    push('Cómputo', vcpu, num(unit.vcpuMonthUsd), 'USD/vCPU/mes', 'vCPU × precio_vCPU_mes');
    push('Memoria', totalRamMb / 1024, num(unit.gbRamMonthUsd), 'USD/GB/mes', '(RAM_MB / 1024) × precio_GB_mes');
    push('Almacenamiento', retainedGb, num(unit.gbStorageMonthUsd), 'USD/GB/mes', 'GB_acumulado × precio_GB_mes');
    push('Transferencia', egressGbPerMonth, num(unit.gbEgressUsd), 'USD/GB', 'GB_salida_mes × precio_GB');
    push('Tokens de IA', (tokensPerDay * 30) / 1e6, num(unit.perMillionTokensUsd), 'USD/millón', '(tokens_día × 30 / 1.000.000) × precio_millón');

    const monthlyUsd = lines.reduce((acc, l) => acc + l.monthlyUsd, 0);
    cost = {
      lines,
      monthlyUsd: round(monthlyUsd, 2),
      annualUsd: round(monthlyUsd * 12, 2),
      range: rangeOf(monthlyUsd),
      note: 'Solo costos de infraestructura con los precios unitarios declarados. No incluye licencias, soporte, personas, respaldos, ambientes no productivos ni tráfico entre zonas.'
    };
    const budget = num(config.operations && config.operations.monthlyBudgetUsd);
    if (budget > 0) {
      cost.budgetUsd = budget;
      cost.withinBudget = monthlyUsd <= budget;
      cost.budgetNote = monthlyUsd <= budget
        ? `La estimación cabe en el presupuesto declarado (${budget.toLocaleString('es')} USD/mes).`
        : `La estimación supera el presupuesto declarado en ${round(monthlyUsd - budget, 2).toLocaleString('es')} USD/mes. Revise el dimensionamiento o el objetivo de servicio.`;
    }
  }

  /* --- Cuellos de botella ------------------------------------------------ */
  const bottlenecks = detectBottlenecks({ i, peakRps, writesPerSecond, readsPerSecond, peakConcurrency, retainedGb, egressMbps, config });

  const resultsById = {};
  for (const r of results) resultsById[r.id] = r;

  return {
    hasDemand,
    inputs: i,
    assumptions: i.assumptions,
    results,
    resultsById,
    derived: {
      avgConcurrentSessions: round(avgConcurrentSessions, 1),
      peakConcurrency: round(peakConcurrency, 1),
      avgRps: round(avgRps, 2),
      peakRps: round(peakRps, 2),
      seasonalPeakRps: round(seasonalPeakRps, 2),
      writesPerSecond: round(writesPerSecond, 2),
      readsPerSecond: round(readsPerSecond, 2),
      vcpu: round(vcpu, 2),
      instances,
      memoryMb: round(totalRamMb, 0),
      totalGbPerMonth: round(totalGbPerMonth, 2),
      retainedGb: round(retainedGb, 2),
      egressMbps: round(egressMbps, 2),
      egressGbPerMonth: round(egressGbPerMonth, 2),
      cacheMb: round(cacheWorkingSetMb, 0),
      tokensPerDay: round(tokensPerDay, 0)
    },
    availability,
    cost,
    bottlenecks,
    disclaimer: hasDemand
      ? 'Las cifras son escenarios derivados de los supuestos declarados, no capacidad verificada. Solo las pruebas de carga sobre la implementación real convierten estos valores en capacidad medida.'
      : 'No se declararon magnitudes de uso: no hay dimensionamiento posible. Indique al menos usuarios registrados o activos diarios.'
  };
}

/** Heurísticas de identificación de cuellos de botella potenciales. */
export function detectBottlenecks(ctx) {
  const { i, peakRps, writesPerSecond, peakConcurrency, retainedGb, egressMbps, config } = ctx;
  const out = [];
  const types = (config.classification && config.classification.systemTypes) || [];
  const arch = (config.classification && config.classification.architecture) || [];

  if (writesPerSecond > 500) {
    out.push({
      id: 'write-primary',
      component: 'Nodo primario de escritura',
      reason: `Se estiman ${Math.round(writesPerSecond)} escrituras por segundo en pico. Las réplicas de lectura no alivian la escritura.`,
      mitigation: 'Evalúe particionado por tenant, región o rango de clave, agrupación de escrituras y separación del camino de ingesta del camino transaccional.',
      validation: 'Prueba de carga de escritura sostenida con el modelo de datos real y los índices definitivos.'
    });
  }
  if (i.readWriteRatio >= 20) {
    out.push({
      id: 'read-amplification',
      component: 'Camino de lectura',
      reason: `La relación declarada es ${i.readWriteRatio} lecturas por escritura: la lectura domina el consumo.`,
      mitigation: 'Caché de lectura con invalidación explícita y réplicas de lectura; mida la tasa de acierto antes de aumentar el tamaño.',
      validation: 'Medición de tasa de acierto de caché y de latencia por percentil con el conjunto de datos real.'
    });
  }
  if (peakConcurrency > 10000) {
    out.push({
      id: 'connection-pool',
      component: 'Pool de conexiones y gestión de sesiones',
      reason: `Con ${Math.round(peakConcurrency)} sesiones concurrentes el límite de conexiones del motor de datos se alcanza antes que la CPU.`,
      mitigation: 'Intermediario de conexiones, sesiones sin estado en el servidor y límites de concurrencia por instancia con cola explícita.',
      validation: 'Prueba de saturación hasta el rechazo, verificando que la degradación sea controlada y no una caída total.'
    });
  }
  if (retainedGb > 5000) {
    out.push({
      id: 'storage-growth',
      component: 'Crecimiento y mantención del almacenamiento',
      reason: `Se proyectan ${Math.round(retainedGb).toLocaleString('es')} GB conservados: los respaldos, los índices y las migraciones de esquema dejan de ser operaciones triviales.`,
      mitigation: 'Particionado temporal, archivado por capas de costo, política de purga por categoría de dato y migraciones en línea por lotes.',
      validation: 'Ensayo de restauración completa cronometrado y prueba de migración de esquema sobre un volumen equivalente.'
    });
  }
  if (egressMbps > 1000) {
    out.push({
      id: 'egress',
      component: 'Transferencia de salida',
      reason: `Se estiman ${Math.round(egressMbps)} Mbps en pico: la transferencia suele ser la partida de costo que crece más rápido.`,
      mitigation: 'Red de distribución de contenido, compresión, paginación y revisión del tamaño de las respuestas.',
      validation: 'Medición del tamaño real de respuesta por endpoint y de la tasa de acierto en el borde.'
    });
  }
  if (arch.includes('microservices') || arch.includes('event-driven')) {
    out.push({
      id: 'distributed-coordination',
      component: 'Coordinación distribuida',
      reason: 'Con servicios independientes o comunicación por eventos, la latencia agregada y las fallas parciales se vuelven el modo de falla dominante.',
      mitigation: 'Tiempos de espera y cortacircuitos en cada llamada, idempotencia en todos los consumidores, colas de mensajes fallidos y trazas distribuidas desde el primer día.',
      validation: 'Pruebas de inyección de fallas y de latencia entre servicios, verificando que una dependencia caída no propague la caída.'
    });
  }
  if (i.seasonalPeakFactor > 3) {
    out.push({
      id: 'seasonal-peak',
      component: 'Elasticidad ante pico estacional',
      reason: `El pico estacional multiplica la carga por ${i.seasonalPeakFactor}: el escalado reactivo puede llegar tarde.`,
      mitigation: 'Aprovisionamiento previo programado para las ventanas conocidas, colas de admisión y degradación funcional planificada.',
      validation: 'Ensayo de la ventana de pico con la carga objetivo antes de la temporada.'
    });
  }
  if (types.some((t) => ['cbt', 'assessment-management', 'sis'].includes(t))) {
    out.push({
      id: 'concentrated-window',
      component: 'Ventana de aplicación o inscripción concentrada',
      reason: 'En aplicación de pruebas e inscripción académica la carga se concentra en minutos y la pérdida de una respuesta ya emitida es inaceptable.',
      mitigation: 'Escritura confirmada antes de avanzar, reanudación de sesión interrumpida, aprovisionamiento previo de la ventana y sala de espera con admisión controlada.',
      validation: 'Simulación de la ventana completa con la concurrencia objetivo e inyección de cortes de red durante la aplicación.'
    });
  }
  if (types.some((t) => ['payment-systems', 'core-banking', 'ledger'].includes(t))) {
    out.push({
      id: 'transactional-integrity',
      component: 'Camino transaccional de registro',
      reason: 'La integridad contable impide relajar la consistencia en el camino de registro, lo que acota las opciones de escalado horizontal.',
      mitigation: 'Separe el registro autoritativo de la consulta analítica, use idempotencia por identificador de operación y particione por entidad contable.',
      validation: 'Pruebas de concurrencia con verificación del invariante de balance y pruebas de reintento duplicado.'
    });
  }

  if (i.criticalResource) {
    out.push({
      id: 'declared-critical-resource',
      component: `Recurso crítico declarado: ${i.criticalResource}`,
      reason: 'El usuario identificó este recurso como punto de contención sobre el que habrá concurrencia.',
      mitigation: 'Defina la estrategia de serialización o reserva (bloqueo optimista, cola, reserva con expiración) y el comportamiento cuando el recurso se agota.',
      validation: 'Prueba de concurrencia dirigida al recurso, verificando que no se produzca doble asignación.'
    });
  }

  return out;
}
