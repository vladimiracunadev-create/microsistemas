/**
 * Cargador e índice del catálogo de conocimientos.
 *
 * El núcleo no conoce el medio de lectura: recibe un `readJson(relativePath)`
 * que resuelve cada archivo del directorio `data/`. El adaptador web lo
 * implementa con `fetch`, el adaptador CLI con el sistema de archivos. Así el
 * mismo catálogo alimenta todas las interfaces sin duplicar datos.
 *
 * Carga progresiva: `loadCatalog` trae el índice y las familias solicitadas.
 * `loadCatalog({ families: ['ai'] })` evita traer las 12 familias cuando solo
 * se necesita una, que es lo que usa la skill para no inflar el contexto.
 */

export const CATALOG_SCHEMA_VERSION = 'sas.catalog.v1';

const REQUIRED_SYSTEM_FIELDS = [
  'id',
  'canonicalName',
  'acronym',
  'synonyms',
  'subdomain',
  'formalDescription',
  'pedagogicalDescription',
  'capabilities',
  'relations',
  'dependencies',
  'constraints',
  'standards',
  'sources',
  'entryVersion',
  'updatedAt'
];

/**
 * @param {(path: string) => Promise<any>} readJson
 * @param {{ families?: string[] }} [options]
 */
export async function loadCatalog(readJson, options = {}) {
  if (typeof readJson !== 'function') {
    throw new TypeError('loadCatalog requiere una función readJson(path).');
  }

  const index = await readJson('systems/index.json');
  const dimensionsDoc = await readJson('dimensions.json');
  const rulesDoc = await readJson('rules.json');

  const wanted = Array.isArray(options.families) && options.families.length
    ? new Set(options.families)
    : null;

  const families = [];
  const systems = [];
  const loadedFiles = [];

  for (const file of index.files) {
    const familyId = file.replace(/\.json$/i, '');
    if (wanted && !wanted.has(familyId)) continue;
    const doc = await readJson(`systems/${file}`);
    families.push(doc.family);
    loadedFiles.push(file);
    for (const system of doc.systems) {
      systems.push({ ...system, family: doc.family.id });
    }
  }

  return buildCatalog({
    index,
    families,
    systems,
    dimensions: dimensionsDoc.dimensions,
    rules: rulesDoc.rules,
    versions: {
      catalogIndex: index.catalogVersion,
      dimensions: dimensionsDoc.catalogVersion,
      rules: rulesDoc.catalogVersion,
      updatedAt: index.updatedAt
    },
    loadedFiles,
    partial: Boolean(wanted)
  });
}

/** Construye el índice en memoria a partir de los documentos ya leídos. */
export function buildCatalog(raw) {
  const systemsById = new Map();
  for (const system of raw.systems) systemsById.set(system.id, system);

  const familiesById = new Map();
  for (const family of raw.families) familiesById.set(family.id, family);

  const dimensionsById = new Map();
  for (const dimension of raw.dimensions) {
    const optionsById = new Map();
    for (const option of dimension.options) optionsById.set(option.id, option);
    dimensionsById.set(dimension.id, { ...dimension, optionsById });
  }

  const rulesById = new Map();
  for (const rule of raw.rules) rulesById.set(rule.id, rule);

  const searchIndex = raw.systems.map((s) => ({
    id: s.id,
    family: s.family,
    haystack: [
      s.id,
      s.canonicalName,
      s.acronym,
      s.subdomain,
      ...(s.synonyms || []),
      ...(s.capabilities || [])
    ].join(' \u0001 ').toLowerCase()
  }));

  return {
    schemaVersion: CATALOG_SCHEMA_VERSION,
    versions: raw.versions,
    loadedFiles: raw.loadedFiles || [],
    partial: Boolean(raw.partial),
    families: raw.families,
    systems: raw.systems,
    dimensions: raw.dimensions,
    rules: raw.rules,
    familiesById,
    systemsById,
    dimensionsById,
    rulesById,

    /** Devuelve la definición completa de un tipo de sistema. */
    getSystem(id) {
      return systemsById.get(id) || null;
    },

    /** Devuelve la familia de un sistema. */
    getFamily(id) {
      return familiesById.get(id) || null;
    },

    /** Devuelve una dimensión de clasificación con sus opciones. */
    getDimension(id) {
      return dimensionsById.get(id) || null;
    },

    /** Resuelve el nombre legible de una opción de dimensión. */
    optionName(dimensionId, optionId) {
      const dim = dimensionsById.get(dimensionId);
      if (!dim) return optionId;
      const opt = dim.optionsById.get(optionId);
      return opt ? opt.name : optionId;
    },

    /** Búsqueda por texto sobre nombre, sigla, sinónimos y capacidades. */
    search(query, limit = 25) {
      const q = String(query || '').trim().toLowerCase();
      if (!q) return [];
      const terms = q.split(/\s+/).filter(Boolean);
      const hits = [];
      for (const entry of searchIndex) {
        let score = 0;
        let matchedAll = true;
        for (const term of terms) {
          const pos = entry.haystack.indexOf(term);
          if (pos === -1) { matchedAll = false; break; }
          score += pos === 0 ? 3 : 1;
        }
        if (matchedAll) hits.push({ id: entry.id, score });
      }
      hits.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
      return hits.slice(0, limit).map((h) => systemsById.get(h.id));
    },

    /** Sistemas de una familia. */
    byFamily(familyId) {
      return raw.systems.filter((s) => s.family === familyId);
    },

    /** Dependencias declaradas por los tipos elegidos que no están incluidas. */
    missingDependencies(selectedIds) {
      const selected = new Set(selectedIds);
      const missing = [];
      for (const id of selectedIds) {
        const system = systemsById.get(id);
        if (!system) continue;
        for (const dep of system.dependencies || []) {
          if (!selected.has(dep)) {
            missing.push({ from: id, dependency: dep, dependencyName: systemsById.get(dep)?.canonicalName || dep });
          }
        }
      }
      return missing;
    },

    /** Relaciones sugeridas (no obligatorias) entre los tipos elegidos. */
    suggestedRelations(selectedIds) {
      const selected = new Set(selectedIds);
      const seen = new Set();
      const out = [];
      for (const id of selectedIds) {
        const system = systemsById.get(id);
        if (!system) continue;
        for (const rel of system.relations || []) {
          if (selected.has(rel) || seen.has(rel)) continue;
          const target = systemsById.get(rel);
          if (!target) continue;
          seen.add(rel);
          out.push({ id: rel, name: target.canonicalName, acronym: target.acronym, from: id });
        }
      }
      return out;
    }
  };
}

/**
 * Verifica la integridad del catálogo: campos obligatorios, identificadores
 * únicos, familias declaradas y referencias cruzadas resolubles.
 * Devuelve una lista de problemas; vacía significa catálogo íntegro.
 */
export function validateCatalogIntegrity(catalog) {
  const problems = [];
  const ids = new Set();

  for (const system of catalog.systems) {
    for (const field of REQUIRED_SYSTEM_FIELDS) {
      if (system[field] === undefined || system[field] === null || system[field] === '') {
        problems.push({ level: 'error', scope: system.id || '(sin id)', message: `Falta el campo obligatorio "${field}".` });
      }
    }
    if (ids.has(system.id)) {
      problems.push({ level: 'error', scope: system.id, message: 'Identificador duplicado en el catálogo.' });
    }
    ids.add(system.id);

    if (!catalog.familiesById.has(system.family)) {
      problems.push({ level: 'error', scope: system.id, message: `La familia "${system.family}" no está declarada.` });
    }
    if (!/^\d+\.\d+\.\d+$/.test(String(system.entryVersion || ''))) {
      problems.push({ level: 'error', scope: system.id, message: `entryVersion "${system.entryVersion}" no sigue el formato x.y.z.` });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(system.updatedAt || ''))) {
      problems.push({ level: 'error', scope: system.id, message: `updatedAt "${system.updatedAt}" no sigue el formato AAAA-MM-DD.` });
    }
    for (const key of ['synonyms', 'capabilities', 'relations', 'dependencies', 'constraints', 'standards', 'sources']) {
      if (!Array.isArray(system[key])) {
        problems.push({ level: 'error', scope: system.id, message: `El campo "${key}" debe ser una lista.` });
      }
    }
  }

  // Referencias cruzadas: solo se verifican si el catálogo está completo.
  if (!catalog.partial) {
    for (const system of catalog.systems) {
      for (const rel of system.relations || []) {
        if (!catalog.systemsById.has(rel)) {
          problems.push({ level: 'error', scope: system.id, message: `Relación "${rel}" no existe en el catálogo.` });
        }
      }
      for (const dep of system.dependencies || []) {
        if (!catalog.systemsById.has(dep)) {
          problems.push({ level: 'error', scope: system.id, message: `Dependencia "${dep}" no existe en el catálogo.` });
        }
        if (dep === system.id) {
          problems.push({ level: 'error', scope: system.id, message: 'Un sistema no puede depender de sí mismo.' });
        }
      }
    }
  }

  for (const dimension of catalog.dimensions) {
    const seen = new Set();
    for (const option of dimension.options) {
      if (seen.has(option.id)) {
        problems.push({ level: 'error', scope: `dimension:${dimension.id}`, message: `Opción duplicada "${option.id}".` });
      }
      seen.add(option.id);
      if (!option.name || !option.description) {
        problems.push({ level: 'error', scope: `dimension:${dimension.id}`, message: `La opción "${option.id}" necesita nombre y descripción.` });
      }
    }
  }

  const ruleIds = new Set();
  for (const rule of catalog.rules) {
    if (ruleIds.has(rule.id)) {
      problems.push({ level: 'error', scope: rule.id, message: 'Identificador de regla duplicado.' });
    }
    ruleIds.add(rule.id);
    if (!['error', 'warning', 'info'].includes(rule.severity)) {
      problems.push({ level: 'error', scope: rule.id, message: `Severidad "${rule.severity}" no permitida.` });
    }
    for (const field of ['title', 'message', 'rationale', 'recommendation']) {
      if (!rule[field]) {
        problems.push({ level: 'error', scope: rule.id, message: `La regla necesita el campo "${field}".` });
      }
    }
    if (!Array.isArray(rule.conditions) || rule.conditions.length === 0) {
      problems.push({ level: 'error', scope: rule.id, message: 'La regla necesita al menos una condición.' });
    }
  }

  return problems;
}

export { REQUIRED_SYSTEM_FIELDS };
