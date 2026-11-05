/**
 * System Architect Studio - Contrato de configuración versionado.
 *
 * Este módulo es la única fuente de verdad del contrato compartido entre la
 * interfaz web, el adaptador CLI y cualquier adaptador futuro (MCP, API, SDK).
 * Una configuración equivalente debe producir resultados funcionalmente
 * equivalentes en cualquier adaptador, porque todos consumen este mismo
 * esquema y el mismo núcleo.
 *
 * Reglas de evolución del esquema:
 *  - CONFIG_SCHEMA_VERSION usa el formato `sas.config.vN`.
 *  - Toda versión anterior debe tener una migración registrada en MIGRATIONS.
 *  - Nunca se elimina un campo sin migración: se marca obsoleto y se traduce.
 */

export const CONFIG_SCHEMA_VERSION = 'sas.config.v1';

/**
 * Este microsistema no declara versión propia ni la de la suite.
 *
 * System Architect Studio es una aplicación más del entorno Microsistemas y se
 * versiona con él, igual que el resto de las microapps. La trazabilidad de un
 * artefacto generado se apoya en la huella de la configuración y en la fecha de
 * generación, no en un número de versión del producto.
 *
 * Lo que sí se versiona, porque es un contrato técnico propio, es el esquema de
 * configuración (CONFIG_SCHEMA_VERSION) y los catálogos de datos.
 */

/**
 * Configuración por defecto. Representa "nada declarado todavía":
 * ningún valor numérico se inventa y ninguna lista se prellena.
 */
export function defaultConfig() {
  return {
    schemaVersion: CONFIG_SCHEMA_VERSION,
    meta: {
      configId: '',
      title: '',
      configVersion: '0.1.0',
      createdAt: '',
      updatedAt: '',
    },
    identity: {
      name: '',
      purpose: '',
      mode: 'new', // 'new' | 'existing'
      audience: '',
      owner: '',
      existingSystem: {
        repository: '',
        currentStack: '',
        knownConstraints: '',
        hasTests: false,
        hasDocs: false
      }
    },
    classification: {
      systemTypes: [],
      sectors: [],
      customTypes: [], // [{ name, domain, capabilities[], constraints[] }]
      serviceModel: [],
      architecture: [],
      deployment: [],
      tenancy: '',
      platforms: [],
      licensing: '',
      monetization: [],
      dataSensitivity: [],
      integrationStyle: []
    },
    functional: {
      capabilities: [],
      processes: [],
      roles: [], // [{ name, description, permissions[] }]
      organizations: {
        model: '', // 'single' | 'multi'
        count: 0,
        usersPerOrg: 0
      },
      integrations: [] // [{ name, direction, style, criticality, notes }]
    },
    technology: {
      languages: [],
      frameworks: [],
      databases: [], // [{ engine, purpose }]
      infrastructure: [],
      offlineSupport: false,
      transactionalIntegrity: false,
      consistencyStrategy: '',
      aiUsage: {
        enabled: false,
        provider: '', // 'local' | nombre del proveedor
        purpose: '',
        automatedDecisions: false,
        budgetControls: false,
        tokensPerOperation: 0,
        operationsPerDay: 0
      }
    },
    security: {
      mfa: false,
      encryptionAtRest: false,
      encryptionInTransit: true,
      rowLevelAuthorization: false,
      auditTrail: false,
      consentManagement: false,
      secretsManagement: false,
      threatModel: false
    },
    compliance: {
      jurisdictions: [],
      regulations: [],
      standards: [],
      dataResidency: '',
      auditRequirements: ''
    },
    capacity: {
      registeredUsers: 0,
      dau: 0,
      mau: 0,
      peakConcurrentUsers: 0,
      sessionsPerUserPerDay: 0,
      requestsPerSession: 0,
      avgSessionMinutes: 0,
      readWriteRatio: 0, // lecturas por cada escritura
      writesPerUserPerDay: 0,
      avgRecordKb: 0,
      filesPerUserPerMonth: 0,
      avgFileMb: 0,
      organizations: 0,
      regions: [],
      peakFactor: 0, // multiplicador del pico diario sobre la media
      seasonalPeakFactor: 0, // multiplicador estacional sobre el pico diario
      backgroundJobsPerDay: 0,
      retentionMonths: 0,
      slaAvailability: 0, // porcentaje, p. ej. 99.9
      latencyTargetMs: 0,
      latencyPercentile: 95,
      criticalResource: '',
      egressPerRequestKb: 0
    },
    evolution: {
      horizon: { unit: 'months', value: 0, openEnded: false },
      growthModel: '', // linear | percent | accelerated | seasonal | step | stagnation | decline
      growthRatePercent: 0,
      scenarios: {
        conservative: { ratePercent: 0, note: '' },
        expected: { ratePercent: 0, note: '' },
        demanding: { ratePercent: 0, note: '' }
      },
      milestones: [], // [{ id, name, kind: 'time'|'condition', atMonth, condition }]
      plannedChanges: [], // texto libre: módulos, países, canales, integraciones
      reviewFrequencyMonths: 0
    },
    quality: {
      priorities: {}, // { performance: 1..5, ... } sobre los atributos ISO/IEC 25010
      accessibilityTarget: '',
      rpoMinutes: 0,
      rtoMinutes: 0,
      testStrategy: []
    },
    operations: {
      teamSize: 0,
      onCall: false,
      observability: false,
      loadTesting: false,
      environments: [],
      supportHours: '',
      monthlyBudgetUsd: 0,
      unitCosts: {
        vcpuMonthUsd: 0,
        gbRamMonthUsd: 0,
        gbStorageMonthUsd: 0,
        gbEgressUsd: 0,
        perMillionTokensUsd: 0
      }
    },
    deliverables: {
      prompts: [], // ids de core/prompts/catalog.js; vacío = todos
      includeSkill: false,
      includeAgents: false,
      includeHarness: false,
      includeMcp: false
    },
    decisions: {
      assumptions: [],
      pending: []
    },
    notes: ''
  };
}

/** Catálogo de campos con su tipo y ayuda, usado por la validación y la UI. */
export const FIELD_META = Object.freeze({
  'identity.name': { label: 'Nombre del sistema', type: 'string', required: true },
  'identity.purpose': { label: 'Finalidad', type: 'string', required: true },
  'identity.mode': { label: 'Modo', type: 'enum', values: ['new', 'existing'], required: true },
  'classification.systemTypes': { label: 'Tipos de sistema', type: 'idList', catalog: 'systems', required: true },
  'classification.sectors': { label: 'Sectores', type: 'idList', catalog: 'families' },
  'classification.serviceModel': { label: 'Modelo de servicio', type: 'idList', catalog: 'dimension:serviceModel' },
  'classification.architecture': { label: 'Arquitectura', type: 'idList', catalog: 'dimension:architecture' },
  'classification.deployment': { label: 'Despliegue', type: 'idList', catalog: 'dimension:deployment' },
  'classification.tenancy': { label: 'Aislamiento', type: 'id', catalog: 'dimension:tenancy' },
  'classification.platforms': { label: 'Plataformas', type: 'idList', catalog: 'dimension:platforms' },
  'classification.licensing': { label: 'Licencia', type: 'id', catalog: 'dimension:licensing' },
  'classification.monetization': { label: 'Comercialización', type: 'idList', catalog: 'dimension:monetization' },
  'classification.dataSensitivity': { label: 'Sensibilidad de datos', type: 'idList', catalog: 'dimension:dataSensitivity' },
  'classification.integrationStyle': { label: 'Estilo de integración', type: 'idList', catalog: 'dimension:integrationStyle' }
});

/** Atributos de calidad de ISO/IEC 25010 ampliados con evolutividad y eficiencia económica. */
export const QUALITY_ATTRIBUTES = Object.freeze([
  { id: 'performance', name: 'Rendimiento', iso: 'Eficiencia de desempeño' },
  { id: 'availability', name: 'Disponibilidad', iso: 'Fiabilidad / Disponibilidad' },
  { id: 'reliability', name: 'Fiabilidad', iso: 'Fiabilidad' },
  { id: 'security', name: 'Seguridad', iso: 'Seguridad' },
  { id: 'privacy', name: 'Privacidad', iso: 'Seguridad / Confidencialidad' },
  { id: 'accessibility', name: 'Accesibilidad', iso: 'Usabilidad / Accesibilidad' },
  { id: 'maintainability', name: 'Mantenibilidad', iso: 'Mantenibilidad' },
  { id: 'modifiability', name: 'Modificabilidad', iso: 'Mantenibilidad / Modificabilidad' },
  { id: 'portability', name: 'Portabilidad', iso: 'Portabilidad' },
  { id: 'interoperability', name: 'Interoperabilidad', iso: 'Compatibilidad / Interoperabilidad' },
  { id: 'observability', name: 'Observabilidad', iso: 'Mantenibilidad / Analizabilidad' },
  { id: 'recoverability', name: 'Recuperabilidad', iso: 'Fiabilidad / Recuperabilidad' },
  { id: 'testability', name: 'Testabilidad', iso: 'Mantenibilidad / Testabilidad' },
  { id: 'usability', name: 'Usabilidad', iso: 'Usabilidad' },
  { id: 'evolvability', name: 'Evolutividad', iso: 'Extensión de Mantenibilidad' },
  { id: 'costEfficiency', name: 'Eficiencia económica', iso: 'Extensión de Eficiencia' }
]);

/* ------------------------------------------------------------------ */
/* Acceso por ruta                                                     */
/* ------------------------------------------------------------------ */

/** Lee un valor por ruta con puntos. Devuelve undefined si la ruta no existe. */
export function getPath(obj, path) {
  if (!obj || typeof path !== 'string') return undefined;
  let cur = obj;
  for (const key of path.split('.')) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return undefined;
    cur = cur[key];
  }
  return cur;
}

/** Escribe un valor por ruta con puntos, creando los objetos intermedios. */
export function setPath(obj, path, value) {
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const k = keys[i];
    if (typeof cur[k] !== 'object' || cur[k] === null || Array.isArray(cur[k])) cur[k] = {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return obj;
}

/* ------------------------------------------------------------------ */
/* Normalización y migración                                           */
/* ------------------------------------------------------------------ */

function isPlainObject(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Mezcla la configuración entrante sobre la estructura por defecto.
 * No inventa valores: solo garantiza que todas las claves existan con un tipo
 * coherente, de modo que el núcleo nunca falle por un campo ausente.
 */
export function normalizeConfig(input) {
  const base = defaultConfig();
  const merge = (target, source) => {
    if (!isPlainObject(source)) return target;
    for (const key of Object.keys(source)) {
      const sv = source[key];
      const tv = target[key];
      if (isPlainObject(tv) && isPlainObject(sv)) merge(tv, sv);
      else if (Array.isArray(tv)) target[key] = Array.isArray(sv) ? sv.slice() : tv;
      else if (sv !== undefined && sv !== null) target[key] = sv;
    }
    return target;
  };
  const out = merge(base, input || {});
  out.schemaVersion = CONFIG_SCHEMA_VERSION;
  return out;
}

/**
 * Migraciones registradas. Cada entrada traduce desde una versión concreta a
 * la siguiente. Al agregar `sas.config.v2`, registre aquí `sas.config.v1`.
 */
export const MIGRATIONS = Object.freeze({
  // 'sas.config.v0': (cfg) => ({ ...cfg, schemaVersion: 'sas.config.v1' })
});

/** Lista ordenada de versiones soportadas, de la más antigua a la actual. */
export const SUPPORTED_SCHEMA_VERSIONS = Object.freeze([CONFIG_SCHEMA_VERSION]);

/**
 * Migra una configuración a la versión actual del esquema.
 * Devuelve { config, migrations: string[], warnings: string[] }.
 */
export function migrateConfig(input) {
  const warnings = [];
  const applied = [];
  let cfg = input && typeof input === 'object' ? { ...input } : {};
  let version = typeof cfg.schemaVersion === 'string' ? cfg.schemaVersion : null;

  if (!version) {
    warnings.push('La configuración no declara schemaVersion; se asume la versión actual y se normaliza.');
    version = CONFIG_SCHEMA_VERSION;
  }

  let guard = 0;
  while (version !== CONFIG_SCHEMA_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) {
      warnings.push(
        `No existe migración desde "${version}" hacia "${CONFIG_SCHEMA_VERSION}". ` +
        'La configuración se normaliza con los valores por defecto para los campos desconocidos; revise el resultado antes de usarlo.'
      );
      break;
    }
    cfg = step(cfg);
    applied.push(`${version} -> ${cfg.schemaVersion}`);
    version = cfg.schemaVersion;
    guard += 1;
    if (guard > 20) {
      warnings.push('Cadena de migración demasiado larga; se detuvo por seguridad.');
      break;
    }
  }

  return { config: normalizeConfig(cfg), migrations: applied, warnings };
}

/** Identificador determinista y estable para una configuración. */
export function configFingerprint(config) {
  const canonical = canonicalJson(stripVolatile(config));
  return fnv1a32(canonical);
}

/** Quita los campos que no deben afectar la reproducibilidad del resultado. */
function stripVolatile(config) {
  const clone = JSON.parse(JSON.stringify(config || {}));
  if (clone.meta) {
    delete clone.meta.createdAt;
    delete clone.meta.updatedAt;
    delete clone.meta.configId;
  }
  return clone;
}

/** Serialización JSON con claves ordenadas, para que el hash sea estable. */
export function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`;
}

/** Hash FNV-1a de 32 bits en hexadecimal. Determinista y sin dependencias. */
export function fnv1a32(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i) & 0xff;
    hash = Math.imul(hash, 0x01000193) >>> 0;
    if (str.charCodeAt(i) > 0xff) {
      hash ^= (str.charCodeAt(i) >> 8) & 0xff;
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
