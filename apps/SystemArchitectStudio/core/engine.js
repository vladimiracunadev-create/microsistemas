/**
 * Orquestador del núcleo.
 *
 * Es el único punto de entrada que necesitan los adaptadores: web, CLI, y
 * cualquiera que se agregue después (MCP, API HTTP, SDK). Al concentrar aquí
 * la secuencia de ejecución, una configuración equivalente produce resultados
 * funcionalmente equivalentes desde cualquier interfaz.
 *
 * El núcleo no conoce el DOM, el sistema de archivos ni la red: recibe el
 * catálogo ya cargado y devuelve estructuras de datos puras.
 */

import { migrateConfig, configFingerprint, CONFIG_SCHEMA_VERSION } from './schema/config-schema.js';
import { validateConfig } from './validation/validator.js';
import { evaluateCompatibility } from './compatibility/compatibility.js';
import { computeCapacity } from './capacity/capacity.js';
import { projectEvolution } from './evolution/evolution.js';
import { proposeArchitecture } from './architecture/architecture.js';
import { deriveRequirements } from './requirements/requirements.js';
import { generatePrompts } from './prompts/prompt-engine.js';
import { generateSkill, generateAgents, generateHarness, generateMcpSpec } from './prompts/artifacts.js';
import { buildDocuments, buildBundleFiles, buildZip, bundleFilename } from './export/export.js';

export { CONFIG_SCHEMA_VERSION };

/**
 * Ejecuta el análisis completo.
 *
 * @param {object} rawConfig configuración en cualquier versión soportada
 * @param {object} catalog catálogo cargado con loadCatalog o buildCatalog
 * @param {{ now?: string, promptIds?: string[] }} [options]
 */
export function analyze(rawConfig, catalog, options = {}) {
  if (!catalog || typeof catalog.getSystem !== 'function') {
    throw new TypeError('analyze requiere un catálogo construido con loadCatalog o buildCatalog.');
  }

  const migration = migrateConfig(rawConfig);
  const config = migration.config;
  const generatedAt = options.now || new Date().toISOString();

  const validation = validateConfig(config, catalog);
  const compatibility = evaluateCompatibility(config, catalog);
  const capacity = computeCapacity(config);
  const evolution = projectEvolution(config, capacity);
  const architecture = proposeArchitecture(config, catalog, capacity);
  const requirements = deriveRequirements(config, catalog, capacity);

  const bundle = {
    config,
    catalog,
    validation,
    compatibility,
    capacity,
    evolution,
    architecture,
    requirements,
    migration: { applied: migration.migrations, warnings: migration.warnings },
    fingerprint: configFingerprint(config),
    generatedAt
  };

  bundle.prompts = generatePrompts(bundle, options.promptIds || config.deliverables?.prompts);

  if (config.deliverables?.includeSkill) bundle.skill = generateSkill(bundle);
  if (config.deliverables?.includeAgents) bundle.agents = generateAgents(bundle);
  if (config.deliverables?.includeHarness) bundle.harness = generateHarness(bundle);
  if (config.deliverables?.includeMcp) bundle.mcp = generateMcpSpec(bundle);

  return bundle;
}

/** Documentos individuales de un resultado ya analizado. */
export function documents(bundle) {
  return buildDocuments(bundle);
}

/** Archivos del paquete integral. */
export function bundleFiles(bundle) {
  return buildBundleFiles(bundle);
}

/** Paquete ZIP con su nombre sugerido. */
export function zipBundle(bundle) {
  const { files, bytes } = buildZip(bundle);
  return { filename: bundleFilename(bundle), files, bytes };
}

/**
 * Resumen compacto, pensado para la vista previa de la interfaz y para
 * respuestas de adaptadores que no necesitan el resultado completo.
 */
export function summarize(bundle) {
  const { config, validation, compatibility, capacity, evolution, architecture, requirements, prompts } = bundle;
  return {
    system: config.identity.name || null,
    mode: config.identity.mode,
    fingerprint: bundle.fingerprint,
    valid: validation.ok,
    completeness: validation.completeness.percent,
    errors: validation.errors.length,
    warnings: validation.warnings.length,
    findings: compatibility.counts,
    systemTypes: config.classification.systemTypes,
    recommendedStyle: architecture.style.recommended,
    styleDivergence: Boolean(architecture.divergence),
    capacity: capacity.hasDemand ? capacity.derived : null,
    assumptions: capacity.assumptions.length + evolution.assumptions.length,
    horizonMonths: evolution.horizon.months,
    openEnded: evolution.horizon.openEnded,
    stages: evolution.stages.length,
    milestones: evolution.milestones.length,
    requirements: requirements.counts,
    prompts: prompts.prompts.map((p) => ({ id: p.id, name: p.name })),
    artifacts: {
      skill: Boolean(bundle.skill),
      agents: Boolean(bundle.agents),
      harness: Boolean(bundle.harness),
      mcp: Boolean(bundle.mcp)
    }
  };
}
