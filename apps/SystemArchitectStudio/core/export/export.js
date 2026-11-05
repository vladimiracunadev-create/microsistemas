/**
 * Motor de generación documental y exportadores.
 *
 * Produce la especificación, el plan de arquitectura, el plan de escalabilidad,
 * la hoja de ruta y el plan de pruebas, más el paquete integral con todos los
 * artefactos y un manifiesto reproducible.
 *
 * El paquete es coherente y reproducible: la misma configuración produce el
 * mismo contenido, y el manifiesto sella la huella de la configuración, las
 * versiones del catálogo y las versiones de las plantillas.
 */

import { CONFIG_SCHEMA_VERSION, canonicalJson } from '../schema/config-schema.js';
import { createZip } from './zip.js';

function bullets(items, fallback = '_No declarado._') {
  const arr = (items || []).filter((i) => i !== null && i !== undefined && String(i).trim() !== '');
  return arr.length ? arr.map((i) => `- ${i}`).join('\n') : fallback;
}

function numbered(items, fallback = '_No declarado._') {
  const arr = (items || []).filter(Boolean);
  return arr.length ? arr.map((i, idx) => `${idx + 1}. ${i}`).join('\n') : fallback;
}

function lines(...parts) {
  return parts.filter((p) => p !== null && p !== undefined && p !== '').join('\n');
}

function table(headers, rows, emptyMessage = '_Sin datos._') {
  if (!rows.length) return emptyMessage;
  return lines(
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((r) => `| ${r.map((cell) => String(cell ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`)
  );
}

function docHeader(title, bundle) {
  const { config, fingerprint } = bundle;
  return lines(
    `# ${title}`,
    '',
    `**Sistema:** ${config.identity.name || '(sin nombre)'}`,
    `**Versión de la configuración:** ${config.meta.configVersion || '0.1.0'}`,
    `**Esquema:** \`${CONFIG_SCHEMA_VERSION}\` · **Huella:** \`${fingerprint}\``,
    `**Generado:** ${bundle.generatedAt}`,
    ''
  );
}

/* ------------------------------------------------------------------ */
/* Documentos                                                          */
/* ------------------------------------------------------------------ */

export function renderSpecification(bundle) {
  const { config, catalog, requirements, compatibility, capacity, evolution, architecture, validation } = bundle;

  const typeRows = (config.classification.systemTypes || []).map((id) => {
    const s = catalog.getSystem(id);
    return s
      ? [s.acronym, s.canonicalName, catalog.getFamily(s.family)?.name || s.family, s.subdomain]
      : [id, '(no está en el catálogo)', '—', '—'];
  });

  return lines(
    docHeader('Especificación del sistema', bundle),
    '## 1. Identidad y finalidad',
    '',
    bullets([
      `Nombre: ${config.identity.name || 'no declarado'}`,
      `Finalidad: ${config.identity.purpose || 'no declarada'}`,
      `Usuarios objetivo: ${config.identity.audience || 'no declarados'}`,
      `Responsable: ${config.identity.owner || 'no declarado'}`,
      `Modo: ${config.identity.mode === 'existing' ? 'ampliación de un sistema existente' : 'sistema nuevo'}`,
      config.identity.mode === 'existing' ? `Repositorio: ${config.identity.existingSystem.repository || 'no declarado'}` : null,
      config.identity.mode === 'existing' ? `Tecnologías actuales: ${config.identity.existingSystem.currentStack || 'no declaradas'}` : null
    ]),
    '',
    '## 2. Clasificación',
    '',
    '### Tipos de sistema',
    '',
    table(['Sigla', 'Nombre canónico', 'Familia', 'Subdominio'], typeRows, '_Sin tipos del catálogo._'),
    '',
    (config.classification.customTypes || []).length
      ? lines('### Tipos personalizados', '', bullets(config.classification.customTypes.map((t) => `**${t.name}** (${t.domain || 'dominio no declarado'}): ${(t.capabilities || []).join('; ') || 'capacidades no declaradas'}`)), '')
      : '',
    '### Dimensiones independientes',
    '',
    table(['Dimensión', 'Valor declarado'], [
      ['Modelo de servicio', names(catalog, 'serviceModel', config.classification.serviceModel)],
      ['Arquitectura', names(catalog, 'architecture', config.classification.architecture)],
      ['Despliegue', names(catalog, 'deployment', config.classification.deployment)],
      ['Aislamiento', config.classification.tenancy ? catalog.optionName('tenancy', config.classification.tenancy) : 'no declarado'],
      ['Plataformas', names(catalog, 'platforms', config.classification.platforms)],
      ['Licencia', config.classification.licensing ? catalog.optionName('licensing', config.classification.licensing) : 'no declarada'],
      ['Comercialización', names(catalog, 'monetization', config.classification.monetization)],
      ['Sensibilidad de datos', names(catalog, 'dataSensitivity', config.classification.dataSensitivity)],
      ['Estilo de integración', names(catalog, 'integrationStyle', config.classification.integrationStyle)]
    ]),
    '',
    '## 3. Requisitos funcionales',
    '',
    table(['ID', 'Área', 'Requisito', 'Criterio de aceptación', 'Origen'],
      requirements.functional.map((r) => [r.id, r.area, r.statement, r.acceptance, r.source]),
      '_Sin requisitos funcionales derivados._'),
    '',
    `> ${requirements.note}`,
    '',
    '## 4. Requisitos no funcionales',
    '',
    table(['ID', 'Atributo', 'Referencia ISO/IEC 25010', 'Requisito', 'Criterio de aceptación', 'Verificación', 'Prioridad'],
      requirements.nonFunctional.map((r) => [r.id, r.name, r.iso, r.statement, r.acceptance, r.verification, r.priority])),
    '',
    'La referencia a ISO/IEC 25010 y a otros estándares es de encuadre conceptual. No constituye declaración de conformidad ni de certificación.',
    '',
    '## 5. Requisitos de cumplimiento',
    '',
    table(['ID', 'Origen', 'Requisito', 'Criterio'],
      requirements.compliance.map((r) => [r.id, r.source, r.statement, r.acceptance]),
      '_Sin requisitos de cumplimiento declarados._'),
    '',
    '## 6. Compatibilidad y advertencias',
    '',
    `Reglas evaluadas: ${compatibility.rulesEvaluated}. Errores: ${compatibility.counts.error}. Advertencias: ${compatibility.counts.warning}. Informativos: ${compatibility.counts.info}.`,
    '',
    table(['Severidad', 'Hallazgo', 'Detalle', 'Justificación', 'Recomendación'],
      compatibility.findings.map((f) => [f.severity, f.title, f.message, f.rationale, f.recommendation]),
      '_Sin hallazgos._'),
    '',
    '## 7. Dimensionamiento',
    '',
    table(['Resultado', 'Valor', 'Unidad', 'Fórmula', 'Rango'],
      capacity.results.map((r) => [r.label, r.value, r.unit, `\`${r.formula}\``, r.range ? `${r.range.low} – ${r.range.high}` : '—'])),
    '',
    '### Supuestos del dimensionamiento',
    '',
    bullets(capacity.assumptions.map((a) => `${a.text} _(${a.because})_`), '_Sin supuestos: todas las magnitudes fueron declaradas._'),
    '',
    `> ${capacity.disclaimer}`,
    '',
    '## 8. Arquitectura',
    '',
    `Estilo recomendado: **${architecture.style.label}**`,
    '',
    bullets(architecture.style.reasons),
    '',
    architecture.divergence ? `> ${architecture.divergence.message}\n` : '',
    '### Componentes',
    '',
    table(['Componente', 'Responsabilidad', 'Límite', 'Escalado'],
      architecture.components.map((c) => [c.name, c.responsibility, c.boundary, c.scaling])),
    '',
    '### Contratos',
    '',
    table(['Contrato', 'Tipo', 'Descripción', 'Versionado'],
      architecture.contracts.map((c) => [c.id, c.kind, c.description, c.versioning])),
    '',
    '## 9. Evolución temporal',
    '',
    `Horizonte: ${evolution.horizon.openEnded ? `sin término conocido (ventana de planificación de ${evolution.horizon.months} meses)` : `${evolution.horizon.months} meses`}. Modelo: ${evolution.modelName}.`,
    '',
    table(['Etapa', 'Momento', 'Usuarios proyectados', 'Pico proyectado', 'Foco'],
      evolution.stages.map((s) => [s.name, s.label, Number(s.projectedUsers).toLocaleString('es'), `${s.projectedPeakRps} req/s`, s.focus]),
      '_Sin etapas: no hay horizonte declarado._'),
    '',
    '## 10. Completitud de la configuración',
    '',
    `Completitud global: **${validation.completeness.percent}%** (${validation.completeness.declared} de ${validation.completeness.total} campos de referencia declarados).`,
    '',
    table(['Sección', 'Declarado', 'Completitud'],
      validation.completeness.sections.map((s) => [s.label, `${s.declared}/${s.total}`, `${s.percent}%`])),
    '',
    'No se exige completar campos irrelevantes para el sistema. Lo no declarado queda registrado como decisión pendiente.',
    '',
    '## 11. Supuestos y decisiones pendientes',
    '',
    '### Supuestos',
    '',
    bullets([...(config.decisions.assumptions || []), ...capacity.assumptions.map((a) => a.text), ...evolution.assumptions.map((a) => a.text)]),
    '',
    '### Decisiones pendientes',
    '',
    bullets([
      ...(config.decisions.pending || []),
      ...compatibility.bySeverity.error.map((f) => `${f.title}: ${f.recommendation}`),
      ...compatibility.bySeverity.warning.map((f) => `${f.title}: ${f.recommendation}`)
    ], '_Sin decisiones pendientes registradas._'),
    '',
    '## 12. Estado de la especificación',
    '',
    bullets([
      '**Generado de forma determinista:** clasificación, requisitos, compatibilidad, dimensionamiento, arquitectura y evolución.',
      '**Pendiente de validación humana:** las decisiones pendientes listadas y toda obligación normativa.',
      '**No verificado empíricamente:** las cifras de capacidad, hasta que existan pruebas de carga sobre la implementación real.'
    ]),
    ''
  );
}

function names(catalog, dimensionId, ids) {
  const arr = (ids || []).map((id) => catalog.optionName(dimensionId, id));
  return arr.length ? arr.join(', ') : 'no declarado';
}

export function renderArchitecturePlan(bundle) {
  const { architecture, capacity } = bundle;
  return lines(
    docHeader('Plan de arquitectura', bundle),
    '## Estilo y justificación',
    '',
    `**${architecture.style.label}**`,
    '',
    bullets(architecture.style.reasons),
    '',
    architecture.divergence ? `> ${architecture.divergence.message}\n` : '',
    '## Componentes y límites',
    '',
    table(['Componente', 'Responsabilidad', 'Límite', 'Escalado'],
      architecture.components.map((c) => [c.name, c.responsibility, c.boundary, c.scaling])),
    '',
    '## Contratos de interfaz',
    '',
    table(['Contrato', 'Origen', 'Destino', 'Tipo', 'Descripción', 'Versionado'],
      architecture.contracts.map((c) => [c.id, c.from, c.to, c.kind, c.description, c.versioning])),
    '',
    '## Dependencias críticas',
    '',
    table(['Dependencia', 'Por qué es crítica', 'Aislamiento', 'Comportamiento degradado'],
      architecture.criticalDependencies.map((d) => [d.name, d.why, d.isolation, d.degraded])),
    '',
    '## Componentes sustituibles',
    '',
    table(['Componente', 'Contrato de sustitución', 'Motivo'],
      architecture.replaceableComponents.map((c) => [c.name, c.contract, c.reason]),
      '_No se identificaron componentes de infraestructura sustituibles con la configuración declarada._'),
    '',
    '## Estrategia de migraciones',
    '',
    bullets([
      `Esquema: ${architecture.migrationStrategy.schema}`,
      `Datos: ${architecture.migrationStrategy.data}`,
      `Despliegue: ${architecture.migrationStrategy.rollout}`,
      `Compatibilidad retroactiva: ${architecture.migrationStrategy.backwardCompatibility}`,
      `Reversibilidad: ${architecture.migrationStrategy.reversibility}`
    ]),
    '',
    '## Versionado',
    '',
    bullets(Object.entries(architecture.versioning).map(([k, v]) => `${k}: ${v}`)),
    '',
    '## Gestión de obsolescencia',
    '',
    bullets(Object.values(architecture.obsolescence)),
    '',
    '## Procedimientos de recuperación',
    '',
    bullets([
      `RPO: ${architecture.recovery.rpo}`,
      `RTO: ${architecture.recovery.rto}`,
      ...architecture.recovery.procedures,
      architecture.recovery.note
    ]),
    '',
    '## Cuellos de botella identificados',
    '',
    table(['Componente', 'Motivo', 'Mitigación', 'Validación'],
      capacity.bottlenecks.map((b) => [b.component, b.reason, b.mitigation, b.validation]),
      '_Sin cuellos de botella identificados con los datos declarados._'),
    '',
    '## Condiciones para rediseñar',
    '',
    numbered(architecture.redesignConditions),
    ''
  );
}

export function renderScalabilityPlan(bundle) {
  const { capacity, evolution } = bundle;
  const scenarioRows = [];
  for (const scenario of evolution.scenarios) {
    for (const p of scenario.points) {
      scenarioRows.push([
        scenario.name,
        `${scenario.annualRatePercent}%`,
        `mes ${p.month}`,
        Number(p.users).toLocaleString('es'),
        p.peakRps,
        p.storageGbPerMonth,
        p.cumulativeStorageGb,
        p.monthlyCostUsd ?? '—'
      ]);
    }
  }

  return lines(
    docHeader('Plan de escalabilidad y evolución', bundle),
    '## Dimensionamiento inicial',
    '',
    table(['Resultado', 'Valor', 'Unidad', 'Fórmula', 'Entradas', 'Nota'],
      capacity.results.map((r) => [r.label, r.value, r.unit, `\`${r.formula}\``, Object.entries(r.inputs || {}).map(([k, v]) => `${k}=${v}`).join(', '), r.note || '—'])),
    '',
    '### Supuestos',
    '',
    bullets(capacity.assumptions.map((a) => `${a.text} _(${a.because})_`), '_Sin supuestos._'),
    '',
    capacity.cost
      ? lines('### Costo estimado', '',
        table(['Partida', 'Cantidad', 'Precio unitario', 'Costo mensual'],
          capacity.cost.lines.map((l) => [l.label, l.quantity, `${l.unitPrice} ${l.unitLabel}`, `${l.monthlyUsd} USD`])),
        '',
        `Total mensual estimado: **${capacity.cost.monthlyUsd} USD** (rango ${capacity.cost.range.low} – ${capacity.cost.range.high}). Anual: ${capacity.cost.annualUsd} USD.`,
        '',
        capacity.cost.budgetNote ? `> ${capacity.cost.budgetNote}` : '',
        `> ${capacity.cost.note}`,
        '')
      : '### Costo estimado\n\n_No se declararon precios unitarios: no hay estimación de costo._\n',
    '## Escenarios de crecimiento',
    '',
    `Modelo: **${evolution.modelName}**. Horizonte: ${evolution.horizon.openEnded ? `sin término conocido (ventana de ${evolution.horizon.months} meses)` : `${evolution.horizon.months} meses`}.`,
    '',
    table(['Escenario', 'Tasa anual', 'Momento', 'Usuarios', 'Pico req/s', 'GB/mes', 'GB acumulados', 'Costo USD/mes'], scenarioRows,
      '_Sin proyección: no hay horizonte declarado._'),
    '',
    '## Dimensiones de evolución',
    '',
    table(['#', 'Dimensión', 'Análisis', 'Qué vigilar', 'Acción'],
      evolution.dimensions.map((d) => [d.order, d.name, d.analysis, d.watch, d.action])),
    '',
    '## Etapas',
    '',
    ...evolution.stages.map((s) => lines(
      `### ${s.name} — ${s.label}`,
      '',
      bullets([
        `Usuarios proyectados: ${Number(s.projectedUsers).toLocaleString('es')}`,
        `Pico proyectado: ${s.projectedPeakRps} req/s`,
        `Almacenamiento acumulado proyectado: ${Number(s.projectedCumulativeStorageGb).toLocaleString('es')} GB`,
        `Foco: ${s.focus}`,
        `Arquitectura: ${s.architecture}`,
        `Lo que no se hace en esta etapa: ${s.avoid}`,
        `Justificación: ${s.justification}`,
        `Condición de salida: ${s.exitCondition}`
      ]),
      ''
    )),
    '## Hitos',
    '',
    table(['Hito', 'Tipo', 'Expresión', 'Acción', 'Origen'],
      evolution.milestones.map((m) => [m.name, m.kind === 'time' ? 'por tiempo' : 'por condición', m.expression, m.action || '—', m.origin])),
    '',
    '## Plan de revisión arquitectónica',
    '',
    `Frecuencia: cada ${evolution.reviewPlan.frequencyMonths} meses${evolution.reviewPlan.openEnded ? ' (revisión indefinida: el escenario no tiene término conocido)' : ''}.`,
    '',
    '### Indicadores y umbrales',
    '',
    table(['Indicador', 'Métrica', 'Umbral', 'Origen'],
      evolution.reviewPlan.indicators.map((i) => [i.name, i.metric, i.threshold, i.source])),
    '',
    '### Riesgos',
    '',
    table(['Riesgo', 'Impacto', 'Mitigación'],
      evolution.reviewPlan.risks.map((r) => [r.risk, r.impact, r.mitigation])),
    '',
    '### Decisiones posibles en cada revisión',
    '',
    bullets(evolution.reviewPlan.decisions),
    '',
    '### Alternativas por orden de preferencia',
    '',
    numbered(evolution.reviewPlan.alternatives),
    '',
    '### Pruebas necesarias',
    '',
    numbered(evolution.reviewPlan.requiredTests),
    '',
    '### Costos',
    '',
    evolution.reviewPlan.costEstimation,
    '',
    '### Criterios de migración',
    '',
    numbered(evolution.reviewPlan.migrationCriteria),
    '',
    `> ${evolution.disclaimer}`,
    ''
  );
}

export function renderRoadmap(bundle) {
  const { config, evolution, compatibility, requirements } = bundle;
  const blockers = compatibility.bySeverity.error;

  return lines(
    docHeader('Hoja de ruta de implementación', bundle),
    '## Fase 1 — Análisis',
    '',
    numbered([
      config.identity.mode === 'existing'
        ? 'Auditar el repositorio existente: estructura, convenciones, dependencias, pruebas y funcionalidades en operación.'
        : 'Auditar el repositorio objetivo y sus convenciones antes de crear estructura nueva.',
      'Confirmar los requisitos derivados con el responsable funcional y cerrar las ambigüedades registradas.',
      'Definir el modelo de dominio y los contratos de datos.',
      'Definir el plan de pruebas y los criterios de aceptación.',
      blockers.length ? `Resolver los ${blockers.length} hallazgo(s) de severidad error antes de continuar.` : 'Sin hallazgos de severidad error pendientes.'
    ]),
    '',
    '**Criterio de salida:** requisitos confirmados con criterio de aceptación y contratos de datos definidos.',
    '',
    '## Fase 2 — Núcleo',
    '',
    numbered([
      'Implementar el núcleo de dominio con sus invariantes y pruebas sin infraestructura.',
      'Implementar la persistencia autoritativa con sus restricciones de integridad en el motor de datos.',
      'Implementar la validación de entrada y el manejo uniforme de errores.',
      'Implementar la autorización por operación con pruebas de acceso denegado.',
      'Instrumentar métricas, registro y trazas desde el inicio.'
    ]),
    '',
    '**Criterio de salida:** la suite del dominio se ejecuta sin base de datos ni red, y los flujos principales funcionan de extremo a extremo.',
    '',
    '## Fase 3 — Capacidad y evolución',
    '',
    numbered([
      'Ejecutar pruebas de carga al nivel del pico proyectado y registrar los resultados por percentil.',
      'Identificar el cuello de botella real y compararlo con los previstos.',
      'Implementar la degradación controlada y la admisión limitada.',
      'Instrumentar los indicadores del plan de revisión con sus umbrales.',
      'Dejar registrados los puntos de extensión declarados y sus contratos.'
    ]),
    '',
    '**Criterio de salida:** el objetivo de latencia se cumple a la carga proyectada y el límite del sistema está medido.',
    '',
    '## Fase 4 — Artefactos especializados',
    '',
    numbered([
      'Generar y revisar los prompts por disciplina.',
      config.deliverables.includeSkill ? 'Publicar la skill generada y validar sus criterios.' : 'Skill: no solicitada en esta configuración.',
      config.deliverables.includeAgents ? 'Publicar las definiciones de agentes y verificar sus límites.' : 'Agentes: no solicitados en esta configuración.',
      config.deliverables.includeHarness ? 'Publicar la especificación de harness.' : 'Harness: no solicitado en esta configuración.',
      config.deliverables.includeMcp ? 'Publicar la especificación del adaptador MCP.' : 'Adaptador MCP: no solicitado en esta configuración.'
    ]),
    '',
    '**Criterio de salida:** los artefactos solicitados existen, son coherentes entre sí y declaran su estado de implementación.',
    '',
    '## Fase 5 — Integración',
    '',
    numbered([
      'Integrar con los sistemas externos declarados, con simuladores para pruebas.',
      'Completar la documentación de instalación, uso y limitaciones.',
      'Verificar la automatización de construcción y despliegue.',
      'Ejecutar las verificaciones del repositorio objetivo.'
    ]),
    '',
    '**Criterio de salida:** ninguna integración puede provocar la caída del sistema completo, y la documentación coincide con lo implementado.',
    '',
    '## Fase 6 — Verificación y entrega',
    '',
    numbered([
      'Ejecutar la suite completa y adjuntar su salida.',
      'Ejecutar las verificaciones manuales de los flujos principales.',
      'Revisar seguridad: dependencias, secretos, autorización y validación de entrada.',
      'Registrar las limitaciones conocidas y lo que quedó fuera.',
      'Preparar la versión sin publicarla: la publicación requiere autorización explícita.'
    ]),
    '',
    `**Criterio de salida:** los ${requirements.counts.functional} requisitos funcionales del alcance tienen prueba o verificación documentada, y no hay regresiones conocidas.`,
    '',
    '## Evolución posterior',
    '',
    bullets([
      ...(config.evolution.plannedChanges || []),
      `Revisión arquitectónica cada ${evolution.reviewPlan.frequencyMonths} meses con los indicadores definidos.`,
      'Las funcionalidades planificadas quedan diferenciadas de las implementadas y no bloquean la entrega inicial.'
    ]),
    ''
  );
}

export function renderTestPlan(bundle) {
  const { config, requirements, capacity, catalog } = bundle;
  const types = config.classification.systemTypes || [];
  const domainTests = [];
  for (const id of types) {
    const s = catalog.getSystem(id);
    for (const c of s?.constraints || []) {
      domainTests.push([`${s.acronym}`, c, 'Prueba que verifique explícitamente esta restricción del dominio.']);
    }
  }

  return lines(
    docHeader('Plan de pruebas', bundle),
    '## Principio',
    '',
    'No se declara ninguna prueba aprobada sin ejecutarla, y no se usan resultados simulados como evidencia de rendimiento real. Lo que no se probó se declara como no verificado, no como aprobado.',
    '',
    '## Niveles de prueba',
    '',
    table(['Nivel', 'Alcance', 'Criterio de aceptación'], [
      ['Unitaria', 'Núcleo de dominio sin infraestructura', 'La suite se ejecuta sin base de datos ni red'],
      ['Integración', 'API y persistencia con motor real de prueba', 'Cada endpoint con caso correcto, de validación y de acceso denegado'],
      ['Contrato', 'Interfaces propias y de terceros', 'Validación contra el esquema publicado en ambas direcciones'],
      ['Extremo a extremo', 'Flujos críticos completos', 'Cada flujo crítico recorrido con datos representativos'],
      ['Carga', 'Pico proyectado y pico estacional', `Percentil ${config.capacity.latencyPercentile || 95} bajo ${config.capacity.latencyTargetMs || '(objetivo no declarado)'} ms a ${capacity.derived.peakRps} req/s`],
      ['Resistencia', 'Carga sostenida prolongada', 'Sin degradación acumulada ni fugas de recursos'],
      ['Saturación', 'Hasta el rechazo', 'Degradación controlada, sin caída total'],
      ['Seguridad', 'Autorización, entrada hostil, dependencias y secretos', 'Sin hallazgos críticos abiertos; cobertura del análisis declarada'],
      ['Accesibilidad', 'Flujos principales de la interfaz', config.quality.accessibilityTarget || 'Objetivo no declarado: debe definirse'],
      ['Recuperación', 'Restauración desde respaldo', `Dentro del RTO declarado (${config.quality.rtoMinutes || 'no declarado'} min)`],
      ['Migración', 'Esquema y datos sobre volumen representativo', 'Completa dentro de la ventana y reversible']
    ]),
    '',
    '## Matriz de cardinalidad',
    '',
    'Cada entidad con volumen debe probarse en tres cardinalidades, distinguiendo cantidad de elementos de tamaño en bytes.',
    '',
    table(['Caso', 'Qué se prueba', 'Qué se busca'], [
      ['Vacío', 'Cero elementos', 'Estado vacío correcto, sin errores ni pantallas en blanco'],
      ['Típico', 'Volumen declarado habitual', 'Comportamiento y latencia esperados'],
      ['Muy grande (cantidad)', 'Muchos elementos pequeños', 'Paginación, índices y memoria'],
      ['Muy grande (tamaño)', 'Pocos elementos muy grandes', 'Límites de carga, tiempos de espera y transferencia']
    ]),
    '',
    '## Casos obligatorios de entrada',
    '',
    bullets([
      'Campos ausentes y valores nulos.',
      'Valores inválidos: tipo incorrecto, fuera de rango, negativos donde no corresponde.',
      'Caracteres Unicode: acentos, emoji, texto de derecha a izquierda, caracteres combinantes.',
      'Entradas en el límite exacto del tamaño permitido y un byte por encima.',
      'Entradas hostiles: etiquetas HTML, sintaxis de consulta, rutas con `..`, contenido con instrucciones embebidas.',
      'Importación de archivos malformados, truncados o con estructura anidada excesiva.'
    ]),
    '',
    '## Restricciones de dominio que exigen prueba',
    '',
    table(['Tipo', 'Restricción', 'Prueba exigida'], domainTests,
      '_Sin restricciones de dominio del catálogo: no se seleccionaron tipos catalogados._'),
    '',
    '## Trazabilidad',
    '',
    table(['ID requisito', 'Requisito', 'Criterio de aceptación'],
      requirements.functional.slice(0, 200).map((r) => [r.id, r.statement, r.acceptance]),
      '_Sin requisitos funcionales._'),
    '',
    requirements.functional.length > 200
      ? `_Se muestran los primeros 200 de ${requirements.functional.length} requisitos; el resto está en la especificación completa._\n`
      : '',
    '## Requisitos no funcionales y su verificación',
    '',
    table(['ID', 'Atributo', 'Criterio de aceptación', 'Método de verificación'],
      requirements.nonFunctional.map((r) => [r.id, r.name, r.acceptance, r.verification])),
    '',
    '## Evidencia exigida',
    '',
    bullets([
      'Salida completa de la ejecución de la suite automatizada.',
      'Informe de pruebas de carga con el perfil de carga declarado y los datos crudos.',
      'Resultado del ensayo de restauración con su duración.',
      'Informes de análisis de seguridad con su cobertura real declarada.',
      'Lista explícita de lo que no se pudo ejecutar y por qué.'
    ]),
    ''
  );
}

/* ------------------------------------------------------------------ */
/* Paquete                                                             */
/* ------------------------------------------------------------------ */

/** Construye el conjunto de archivos del paquete integral. */
export function buildBundleFiles(bundle) {
  const { config, prompts, skill, agents, harness, mcp, catalog } = bundle;
  const files = {};

  files['README.md'] = renderBundleReadme(bundle);
  files['configuracion.json'] = `${JSON.stringify(config, null, 2)}\n`;
  files['especificacion.md'] = renderSpecification(bundle);
  files['plan-arquitectura.md'] = renderArchitecturePlan(bundle);
  files['plan-escalabilidad.md'] = renderScalabilityPlan(bundle);
  files['roadmap.md'] = renderRoadmap(bundle);
  files['plan-pruebas.md'] = renderTestPlan(bundle);

  for (const prompt of prompts.prompts) {
    files[`prompts/${prompt.filename}`] = prompt.markdown;
  }

  if (skill) {
    for (const [path, content] of Object.entries(skill.files)) {
      files[`skills/${skill.name}/${path}`] = content;
    }
  }
  if (agents) {
    for (const [path, content] of Object.entries(agents.files)) {
      files[`agentes/${path}`] = content;
    }
  }
  if (harness) {
    for (const [path, content] of Object.entries(harness.files)) {
      files[`harness/${path}`] = content;
    }
  }
  if (mcp) {
    for (const [path, content] of Object.entries(mcp.files)) {
      files[`mcp/${path}`] = content;
    }
  }

  files['manifest.json'] = `${JSON.stringify(buildManifest(bundle, Object.keys(files)), null, 2)}\n`;
  return files;
}

/** Manifiesto reproducible del paquete. */
export function buildManifest(bundle, fileList) {
  const { config, catalog, prompts, fingerprint, generatedAt } = bundle;
  return {
    artifact: 'system-architect-studio-bundle',
    bundleVersion: '1',
    configSchemaVersion: CONFIG_SCHEMA_VERSION,
    catalogVersions: catalog.versions,
    configFingerprint: fingerprint,
    configVersion: config.meta.configVersion || '0.1.0',
    systemName: config.identity.name || null,
    generatedAt,
    reproducibility: 'La misma configuración, con las mismas versiones de catálogo y de plantillas, produce el mismo contenido. Los campos de fecha no participan de la huella.',
    files: fileList.sort()
  };
}

function renderBundleReadme(bundle) {
  const { config, prompts, skill, agents, harness, mcp, validation, compatibility } = bundle;
  return lines(
    `# Paquete de ingeniería — ${config.identity.name || '(sistema sin nombre)'}`,
    '',
    docHeader('Contenido del paquete', bundle).split('\n').slice(2).join('\n'),
    '## Archivos',
    '',
    bullets([
      '`especificacion.md` — especificación completa del sistema.',
      '`plan-arquitectura.md` — componentes, contratos, migraciones y condiciones de rediseño.',
      '`plan-escalabilidad.md` — dimensionamiento, escenarios, etapas y plan de revisión.',
      '`roadmap.md` — fases de implementación con criterios de salida.',
      '`plan-pruebas.md` — niveles, casos obligatorios y trazabilidad.',
      `\`prompts/\` — ${prompts.prompts.length} prompts por disciplina.`,
      skill ? `\`skills/${skill.name}/\` — skill generada con carga progresiva de contexto.` : null,
      agents ? '`agentes/` — definición del agente especializado y del sistema multiagente.' : null,
      harness ? '`harness/` — especificación de harness.' : null,
      mcp ? '`mcp/` — especificación del adaptador MCP.' : null,
      '`configuracion.json` — configuración de origen, reimportable.',
      '`manifest.json` — manifiesto con versiones y huella de reproducibilidad.'
    ]),
    '',
    '## Estado',
    '',
    bullets([
      `Completitud de la configuración: ${validation.completeness.percent}%`,
      `Hallazgos de compatibilidad: ${compatibility.counts.error} errores, ${compatibility.counts.warning} advertencias, ${compatibility.counts.info} informativos.`,
      validation.ok ? 'La configuración pasó la validación.' : `La configuración tiene ${validation.errors.length} error(es) de validación.`
    ]),
    '',
    '## Advertencia',
    '',
    bullets([
      'Las cifras de capacidad son escenarios con supuestos declarados, no capacidad verificada.',
      'Las referencias a estándares son de encuadre y no constituyen declaración de conformidad ni certificación.',
      'Seleccionar una jurisdicción no otorga cumplimiento legal.',
      'Los artefactos de skill, agentes, harness y MCP son especificaciones: su ejecución requiere los adaptadores correspondientes.'
    ]),
    ''
  );
}

/** Documentos individuales descargables. */
export function buildDocuments(bundle) {
  return {
    'especificacion.md': renderSpecification(bundle),
    'plan-arquitectura.md': renderArchitecturePlan(bundle),
    'plan-escalabilidad.md': renderScalabilityPlan(bundle),
    'roadmap.md': renderRoadmap(bundle),
    'plan-pruebas.md': renderTestPlan(bundle)
  };
}

/** Crea el ZIP integral. */
export function buildZip(bundle) {
  const files = buildBundleFiles(bundle);
  return { files, bytes: createZip(files, { date: new Date(bundle.generatedAt) }) };
}

/** Nombre de archivo sugerido para el paquete. */
export function bundleFilename(bundle) {
  const slug = String(bundle.config.identity.name || 'sistema')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'sistema';
  return `sas-${slug}-${bundle.fingerprint}.zip`;
}

/** Serialización canónica, útil para verificar reproducibilidad en pruebas. */
export function canonicalConfig(config) {
  return canonicalJson(config);
}
