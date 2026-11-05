/**
 * Motor de generación de prompts.
 *
 * Determinista: la misma configuración, el mismo catálogo y las mismas
 * plantillas producen exactamente el mismo texto. No consume servicios de IA
 * ni tokens para generar.
 *
 * Cada prompt declara repositorio objetivo, objetivo, alcance, contexto,
 * requisitos, restricciones, tecnologías, supuestos, decisiones pendientes,
 * entregables, pruebas, criterios de aceptación y evidencia de finalización.
 */

import { selectTemplates } from '../../templates/prompts/prompt-catalog.js';
import { configFingerprint } from '../schema/config-schema.js';

const BULLET = '- ';

function lines(...parts) {
  return parts.filter((p) => p !== null && p !== undefined && p !== '').join('\n');
}

function bullets(items, fallback = '_No declarado._') {
  const arr = (items || []).filter((i) => i !== null && i !== undefined && String(i).trim() !== '');
  if (!arr.length) return fallback;
  return arr.map((i) => BULLET + String(i)).join('\n');
}

function numbered(items, fallback = '_No declarado._') {
  const arr = (items || []).filter(Boolean);
  if (!arr.length) return fallback;
  return arr.map((i, idx) => `${idx + 1}. ${i}`).join('\n');
}

function joinOr(values, fallback = 'no declarado') {
  const arr = (values || []).filter(Boolean);
  return arr.length ? arr.join(', ') : fallback;
}

/**
 * Construye el bloque de contexto compartido por todos los prompts.
 * Todos los prompts de una misma generación comparten este contexto, que es
 * lo que garantiza su coherencia entre sí.
 */
export function buildPromptContext(bundle) {
  const { config, catalog, capacity, evolution, architecture, requirements, compatibility } = bundle;

  const typeDescriptions = (config.classification.systemTypes || []).map((id) => {
    const s = catalog.getSystem(id);
    if (!s) return `- ${id} (no está en el catálogo cargado)`;
    return `- **${s.acronym} — ${s.canonicalName}** (${catalog.getFamily(s.family)?.name || s.family}): ${s.formalDescription}`;
  });

  const customTypes = (config.classification.customTypes || []).map(
    (t) => `- **${t.name}** (tipo personalizado, dominio: ${t.domain || 'no declarado'}): ${(t.capabilities || []).join('; ') || 'capacidades no declaradas'}`
  );

  const catalogConstraints = [];
  for (const id of config.classification.systemTypes || []) {
    const s = catalog.getSystem(id);
    for (const c of s?.constraints || []) catalogConstraints.push(`${s.acronym}: ${c}`);
  }

  const catalogStandards = new Set();
  for (const id of config.classification.systemTypes || []) {
    for (const std of catalog.getSystem(id)?.standards || []) catalogStandards.add(std);
  }

  const capacityLines = (capacity?.results || []).map(
    (r) => `- ${r.label}: **${r.value} ${r.unit}** — fórmula: \`${r.formula}\`${r.range ? ` — rango ${r.range.low}–${r.range.high}` : ''}`
  );

  const assumptionLines = [
    ...(capacity?.assumptions || []).map((a) => `${a.text} (${a.because})`),
    ...(evolution?.assumptions || []).map((a) => `${a.text} (${a.because})`),
    ...(config.decisions?.assumptions || [])
  ];

  const pendingLines = [
    ...(config.decisions?.pending || []),
    ...(compatibility?.bySeverity?.error || []).map((f) => `${f.title}: ${f.message} → ${f.recommendation}`),
    ...(compatibility?.bySeverity?.warning || []).map((f) => `${f.title}: ${f.message} → ${f.recommendation}`)
  ];

  const evolutionStageLines = (evolution?.stages || []).map(
    (s) => `- **${s.name}** (${s.label}): ${Number(s.projectedUsers).toLocaleString('es')} usuarios, ${s.projectedPeakRps} req/s en pico. Foco: ${s.focus} Condición de salida: ${s.exitCondition}`
  );

  const milestoneLines = (evolution?.milestones || []).map(
    (m) => `- ${m.name} — ${m.expression}${m.action ? ` → ${m.action}` : ''} _(${m.origin})_`
  );

  return {
    fingerprint: configFingerprint(config),
    generatedFor: config.identity.name || '(sistema sin nombre)',
    repository: resolveRepository(config),
    mode: config.identity.mode,
    header: {
      systemName: config.identity.name || '(sin nombre)',
      purpose: config.identity.purpose || 'no declarada',
      audience: config.identity.audience || 'no declarada',
      owner: config.identity.owner || 'no declarado'
    },
    blocks: {
      systemTypes: lines(bullets(typeDescriptions, '_Sin tipos del catálogo._'), customTypes.length ? customTypes.join('\n') : ''),
      classification: bullets([
        `Modelo de servicio: ${joinOr(namesOf(catalog, 'serviceModel', config.classification.serviceModel))}`,
        `Arquitectura declarada: ${joinOr(namesOf(catalog, 'architecture', config.classification.architecture))}`,
        `Despliegue: ${joinOr(namesOf(catalog, 'deployment', config.classification.deployment))}`,
        `Aislamiento: ${config.classification.tenancy ? catalog.optionName('tenancy', config.classification.tenancy) : 'no declarado'}`,
        `Plataformas: ${joinOr(namesOf(catalog, 'platforms', config.classification.platforms))}`,
        `Licencia: ${config.classification.licensing ? catalog.optionName('licensing', config.classification.licensing) : 'no declarada'}`,
        `Comercialización: ${joinOr(namesOf(catalog, 'monetization', config.classification.monetization))}`,
        `Sensibilidad de datos: ${joinOr(namesOf(catalog, 'dataSensitivity', config.classification.dataSensitivity))}`,
        `Estilo de integración: ${joinOr(namesOf(catalog, 'integrationStyle', config.classification.integrationStyle))}`
      ]),
      functional: bullets([
        ...(config.functional.capabilities || []).map((c) => `Capacidad: ${c}`),
        ...(config.functional.processes || []).map((p) => `Proceso: ${p}`),
        ...(config.functional.roles || []).map((r) => `Rol: ${typeof r === 'string' ? r : `${r.name} (${(r.permissions || []).join(', ') || 'permisos por definir'})`}`),
        ...(config.functional.integrations || []).map((i) => `Integración: ${i.name} — ${i.direction || 'dirección no declarada'}, ${i.style || 'estilo no declarado'}, criticidad ${i.criticality || 'no declarada'}`)
      ]),
      technologies: bullets([
        `Lenguajes: ${joinOr(config.technology.languages)}`,
        `Frameworks: ${joinOr(config.technology.frameworks)}`,
        `Motores de datos: ${(config.technology.databases || []).map((d) => `${d.engine || '?'} (${d.purpose || 'propósito no declarado'})`).join('; ') || 'no declarados'}`,
        `Infraestructura: ${joinOr(config.technology.infrastructure)}`,
        `Soporte offline: ${config.technology.offlineSupport ? 'requerido' : 'no requerido'}`,
        `Integridad transaccional: ${config.technology.transactionalIntegrity ? 'exigida' : 'no declarada'}`,
        `Estrategia de consistencia: ${config.technology.consistencyStrategy || 'no declarada'}`,
        `Uso de IA: ${config.technology.aiUsage?.enabled ? `sí — ${config.technology.aiUsage.purpose || 'propósito no declarado'} (proveedor: ${config.technology.aiUsage.provider || 'no declarado'})` : 'no'}`
      ]),
      capacity: lines(
        capacityLines.length ? capacityLines.join('\n') : '_Sin magnitudes de uso declaradas: no hay dimensionamiento._',
        '',
        `> ${capacity?.disclaimer || ''}`
      ),
      bottlenecks: bullets((capacity?.bottlenecks || []).map((b) => `**${b.component}**: ${b.reason} Mitigación: ${b.mitigation} Validación: ${b.validation}`), '_Sin cuellos de botella identificados con los datos declarados._'),
      architecture: lines(
        `Estilo recomendado por el motor: **${architecture?.style?.label || 'no determinado'}**`,
        bullets(architecture?.style?.reasons),
        architecture?.divergence ? `\n> ${architecture.divergence.message}` : '',
        '',
        '**Componentes y límites**',
        bullets((architecture?.components || []).map((c) => `**${c.name}** — ${c.responsibility} Límite: ${c.boundary} Escalado: ${c.scaling}`)),
        '',
        '**Contratos**',
        bullets((architecture?.contracts || []).map((c) => `${c.id} (${c.kind}): ${c.description} Versionado: ${c.versioning}`)),
        '',
        '**Dependencias críticas**',
        bullets((architecture?.criticalDependencies || []).map((d) => `${d.name} — ${d.why} Aislamiento: ${d.isolation} Degradado: ${d.degraded}`))
      ),
      evolution: lines(
        `Horizonte: ${evolution?.horizon?.openEnded ? `sin término conocido (ventana de planificación de ${evolution.horizon.months} meses)` : `${evolution?.horizon?.months || 0} meses`}`,
        `Modelo de crecimiento: ${evolution?.modelName || 'no declarado'} — tasas anuales: conservador ${evolution?.scenarioRates?.conservative ?? 0}%, esperado ${evolution?.scenarioRates?.expected ?? 0}%, exigente ${evolution?.scenarioRates?.demanding ?? 0}%`,
        '',
        '**Etapas**',
        evolutionStageLines.length ? evolutionStageLines.join('\n') : '_Sin etapas: no hay horizonte declarado._',
        '',
        '**Hitos**',
        milestoneLines.length ? milestoneLines.join('\n') : '_Sin hitos declarados._',
        '',
        `> ${evolution?.disclaimer || ''}`
      ),
      requirementsSummary: lines(
        `Requisitos funcionales derivados: ${requirements?.counts?.functional ?? 0}`,
        `Requisitos no funcionales: ${requirements?.counts?.nonFunctional ?? 0}`,
        `Requisitos de cumplimiento: ${requirements?.counts?.compliance ?? 0}`,
        '',
        '**Requisitos no funcionales medibles**',
        bullets((requirements?.nonFunctional || []).map((r) => `[${r.id}] ${r.name}: ${r.statement} _Aceptación:_ ${r.acceptance}`))
      ),
      constraints: bullets([
        ...catalogConstraints,
        ...(config.identity.mode === 'existing' ? ['El sistema existe en producción: no destruir funcionalidades ni cambiar contratos públicos sin justificación.'] : []),
        ...(config.identity.existingSystem?.knownConstraints ? [config.identity.existingSystem.knownConstraints] : []),
        ...(config.compliance.dataResidency ? [`Residencia de datos exigida: ${config.compliance.dataResidency}`] : []),
        ...(config.compliance.auditRequirements ? [`Requisitos de auditoría: ${config.compliance.auditRequirements}`] : [])
      ], '_Sin restricciones registradas._'),
      compliance: bullets([
        `Jurisdicciones: ${joinOr(config.compliance.jurisdictions)}`,
        `Obligaciones identificadas: ${joinOr(config.compliance.regulations)}`,
        `Estándares declarados: ${joinOr(config.compliance.standards)}`,
        `Estándares sugeridos por el catálogo: ${[...catalogStandards].join('; ') || 'ninguno'}`,
        'Seleccionar una jurisdicción no otorga cumplimiento legal: cada obligación debe verificarse con asesoría propia.'
      ]),
      security: bullets([
        `Múltiples factores de autenticación: ${config.security.mfa ? 'sí' : 'no declarado'}`,
        `Cifrado en reposo: ${config.security.encryptionAtRest ? 'sí' : 'no declarado'}`,
        `Cifrado en tránsito: ${config.security.encryptionInTransit ? 'sí' : 'no declarado'}`,
        `Autorización a nivel de registro: ${config.security.rowLevelAuthorization ? 'sí' : 'no declarado'}`,
        `Registro de auditoría: ${config.security.auditTrail ? 'sí' : 'no declarado'}`,
        `Gestión de consentimiento: ${config.security.consentManagement ? 'sí' : 'no declarado'}`,
        `Gestión de secretos: ${config.security.secretsManagement ? 'sí' : 'no declarado'}`,
        `Modelado de amenazas: ${config.security.threatModel ? 'sí' : 'no declarado'}`
      ]),
      assumptions: bullets(assumptionLines, '_Sin supuestos: todas las magnitudes fueron declaradas._'),
      pending: bullets(pendingLines, '_Sin decisiones pendientes registradas._'),
      operations: bullets([
        `Equipo: ${config.operations.teamSize || 'no declarado'} personas`,
        `Turnos de guardia: ${config.operations.onCall ? 'sí' : 'no declarados'}`,
        `Observabilidad: ${config.operations.observability ? 'sí' : 'no declarada'}`,
        `Pruebas de carga previstas: ${config.operations.loadTesting ? 'sí' : 'no declaradas'}`,
        `Ambientes: ${joinOr(config.operations.environments)}`,
        `Horario de soporte: ${config.operations.supportHours || 'no declarado'}`,
        `Presupuesto mensual: ${config.operations.monthlyBudgetUsd ? `${config.operations.monthlyBudgetUsd} USD` : 'no declarado'}`
      ])
    }
  };
}

function namesOf(catalog, dimensionId, ids) {
  return (ids || []).map((id) => catalog.optionName(dimensionId, id));
}

function resolveRepository(config) {
  if (config.identity.mode === 'existing' && config.identity.existingSystem?.repository) {
    return config.identity.existingSystem.repository;
  }
  return config.identity.existingSystem?.repository || '(repositorio objetivo por definir)';
}

/** Genera un prompt a partir de una plantilla y el contexto compartido. */
export function renderPrompt(template, ctx) {
  const b = ctx.blocks;
  const modeBlock = ctx.mode === 'existing'
    ? lines(
      '### Modo: sistema existente',
      '',
      'Antes de escribir una sola línea de código:',
      '',
      numbered([
        'Inspeccione el repositorio y registre su estructura real.',
        'Identifique el propósito original del sistema.',
        'Analice el código y la documentación existentes.',
        'Detecte las funcionalidades actuales en operación.',
        'Estudie las dependencias y sus versiones.',
        'Identifique las restricciones técnicas y de negocio vigentes.',
        'Evalúe el impacto del cambio sobre lo existente.',
        'Diseñe la ampliación respetando los patrones del repositorio.',
        'Implemente de forma incremental y verificable.',
        'Verifique que no haya regresiones, ejecutando la suite antes y después.'
      ]),
      '',
      'Prohibido: eliminar funcionalidades, renombrar lo que está en uso, sustituir tecnologías por preferencia, reestructurar globalmente sin necesidad y sobrescribir cambios ajenos.'
    )
    : lines(
      '### Modo: sistema nuevo',
      '',
      'Diseñe desde cero la arquitectura, las especificaciones y las fases, con el alcance mínimo verificable en la primera entrega y los puntos de extensión declarados para las etapas siguientes.'
    );

  return lines(
    `# ${template.name} — ${ctx.header.systemName}`,
    '',
    `> Generado por System Architect Studio, microsistema de la suite Microsistemas · huella de configuración \`${ctx.fingerprint}\``,
    `> Disciplina: ${template.discipline}`,
    '',
    '## Repositorio objetivo',
    '',
    `\`${ctx.repository}\``,
    '',
    '## Objetivo',
    '',
    template.objective,
    '',
    '## Alcance',
    '',
    '**Incluido**',
    '',
    bullets(template.scopeIn),
    '',
    '**Excluido**',
    '',
    bullets(template.scopeOut),
    '',
    '## Contexto del sistema',
    '',
    `**Nombre:** ${ctx.header.systemName}`,
    `**Finalidad:** ${ctx.header.purpose}`,
    `**Usuarios objetivo:** ${ctx.header.audience}`,
    `**Responsable:** ${ctx.header.owner}`,
    '',
    '### Tipos de sistema',
    '',
    b.systemTypes,
    '',
    '### Clasificación',
    '',
    b.classification,
    '',
    modeBlock,
    '',
    '## Requisitos',
    '',
    '### Alcance funcional declarado',
    '',
    b.functional,
    '',
    '### Requisitos no funcionales',
    '',
    b.requirementsSummary,
    '',
    '### Cumplimiento',
    '',
    b.compliance,
    '',
    '## Restricciones',
    '',
    b.constraints,
    '',
    '### Controles de seguridad declarados',
    '',
    b.security,
    '',
    '## Tecnologías elegidas',
    '',
    b.technologies,
    '',
    '## Arquitectura de referencia',
    '',
    b.architecture,
    '',
    '## Dimensionamiento',
    '',
    b.capacity,
    '',
    '### Cuellos de botella potenciales',
    '',
    b.bottlenecks,
    '',
    '## Evolución temporal',
    '',
    b.evolution,
    '',
    '## Operación',
    '',
    b.operations,
    '',
    '## Supuestos',
    '',
    b.assumptions,
    '',
    '## Decisiones pendientes',
    '',
    b.pending,
    '',
    '## Instrucciones específicas de la disciplina',
    '',
    bullets(template.guidance),
    '',
    '## Entregables',
    '',
    numbered(template.deliverables),
    '',
    '## Pruebas exigidas',
    '',
    numbered(template.tests),
    '',
    '## Criterios de aceptación',
    '',
    numbered(template.acceptance),
    '',
    '## Evidencia de finalización',
    '',
    bullets(template.evidence),
    '',
    '## Reglas de honestidad del informe',
    '',
    bullets([
      'Diferencie explícitamente: implementado y probado / implementado sin validar completamente / parcialmente implementado / planificado / no implementado.',
      'No declare pruebas aprobadas sin ejecutarlas; adjunte la salida real.',
      'No use respuestas simuladas para aparentar que una integración funciona.',
      'Informe cualquier comando que no se pudo ejecutar y por qué.',
      'No publique versiones ni despliegue a producción de forma automática.'
    ]),
    ''
  );
}

/** Genera todos los prompts aplicables. */
export function generatePrompts(bundle, requestedIds) {
  const ctx = buildPromptContext(bundle);
  const templates = selectTemplates(bundle.config, requestedIds);
  return {
    context: ctx,
    prompts: templates.map((t) => ({
      id: t.id,
      name: t.name,
      discipline: t.discipline,
      order: t.order,
      filename: `prompt-${String(t.order).padStart(2, '0')}-${t.id}.md`,
      markdown: renderPrompt(t, ctx)
    }))
  };
}
