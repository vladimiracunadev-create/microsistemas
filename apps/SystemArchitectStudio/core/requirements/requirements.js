/**
 * Motor de requisitos.
 *
 * Produce requisitos funcionales derivados del catálogo y requisitos no
 * funcionales evaluables sobre los atributos de ISO/IEC 25010, ampliados con
 * evolutividad y eficiencia económica.
 *
 * Cada requisito no funcional lleva criterio de aceptación medible y método de
 * verificación. Citar una norma no equivale a certificarla: el motor nunca
 * declara conformidad ni certificación alguna.
 */

import { QUALITY_ATTRIBUTES } from '../schema/config-schema.js';

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

let counter = 0;
function nextId(prefix) {
  counter += 1;
  return `${prefix}-${String(counter).padStart(3, '0')}`;
}

/** Requisitos funcionales derivados de los tipos de sistema y del formulario. */
export function deriveFunctionalRequirements(config, catalog) {
  counter = 0;
  const out = [];
  const types = config.classification?.systemTypes || [];

  for (const id of types) {
    const system = catalog?.getSystem?.(id);
    if (!system) continue;
    for (const capability of system.capabilities || []) {
      out.push({
        id: nextId('RF'),
        source: `catálogo:${system.id}`,
        area: `${system.acronym} — ${system.canonicalName}`,
        statement: `El sistema debe proveer: ${capability}.`,
        priority: 'por confirmar',
        acceptance: `Existe un caso de uso ejecutable que cubre "${capability}" con datos representativos y resultado verificable.`,
        note: 'Capacidad habitual del tipo de sistema. Confirme si está dentro del alcance de esta versión.'
      });
    }
  }

  for (const capability of config.functional?.capabilities || []) {
    out.push({
      id: nextId('RF'),
      source: 'usuario',
      area: 'Declarado en la configuración',
      statement: `El sistema debe proveer: ${capability}.`,
      priority: 'declarado por el usuario',
      acceptance: 'Criterio de aceptación por definir junto al responsable funcional.',
      note: ''
    });
  }

  for (const process of config.functional?.processes || []) {
    out.push({
      id: nextId('RF'),
      source: 'usuario',
      area: 'Procesos',
      statement: `El sistema debe soportar el proceso: ${process}.`,
      priority: 'declarado por el usuario',
      acceptance: 'El proceso se puede recorrer completo en un ambiente de prueba, incluidos sus caminos de excepción.',
      note: ''
    });
  }

  for (const role of config.functional?.roles || []) {
    const name = typeof role === 'string' ? role : role.name;
    const permissions = typeof role === 'string' ? [] : (role.permissions || []);
    out.push({
      id: nextId('RF'),
      source: 'usuario',
      area: 'Roles y permisos',
      statement: `El rol "${name}" debe tener acceso exclusivamente a: ${permissions.length ? permissions.join(', ') : '(permisos por definir)'}.`,
      priority: 'declarado por el usuario',
      acceptance: 'Pruebas de autorización que verifican tanto el acceso permitido como el acceso denegado.',
      note: permissions.length ? '' : 'Permisos sin declarar: queda registrado como decisión pendiente.'
    });
  }

  for (const integration of config.functional?.integrations || []) {
    out.push({
      id: nextId('RF'),
      source: 'usuario',
      area: 'Integraciones',
      statement: `El sistema debe integrarse con "${integration.name}" (${integration.direction || 'dirección no declarada'}, ${integration.style || 'estilo no declarado'}).`,
      priority: integration.criticality || 'por confirmar',
      acceptance: 'Prueba de contrato contra un simulador de la contraparte, incluidos los casos de error y de indisponibilidad.',
      note: integration.notes || ''
    });
  }

  return out;
}

/** Objetivos por defecto de cada atributo, parametrizados por la configuración. */
function buildAttributeRequirement(attr, config, capacity, catalog) {
  const cap = config.capacity || {};
  const sensitivity = config.classification?.dataSensitivity || [];
  const types = config.classification?.systemTypes || [];
  const priority = num(config.quality?.priorities?.[attr.id]) || null;

  const base = {
    id: nextId('RNF'),
    attribute: attr.id,
    name: attr.name,
    iso: attr.iso,
    priority: priority ? `${priority}/5 (declarada)` : 'no declarada'
  };

  switch (attr.id) {
    case 'performance':
      return {
        ...base,
        statement: cap.latencyTargetMs
          ? `El percentil ${cap.latencyPercentile || 95} del tiempo de respuesta de las operaciones interactivas no debe exceder ${cap.latencyTargetMs} ms bajo la carga de pico proyectada (${capacity?.derived?.peakRps || 0} req/s).`
          : 'Debe declararse un objetivo de tiempo de respuesta por percentil para las operaciones interactivas.',
        acceptance: cap.latencyTargetMs
          ? `Prueba de carga a ${capacity?.derived?.peakRps || 0} req/s durante al menos 30 minutos, con percentil ${cap.latencyPercentile || 95} bajo ${cap.latencyTargetMs} ms y tasa de error inferior a 0,1%.`
          : 'Pendiente: sin objetivo declarado no hay criterio de aceptación.',
        verification: 'Prueba de carga automatizada en ambiente equivalente al productivo.'
      };
    case 'availability':
      return {
        ...base,
        statement: cap.slaAvailability
          ? `La disponibilidad mensual debe ser al menos ${cap.slaAvailability}%, equivalente a un máximo de ${capacity?.availability?.downtimeMinutesPerMonth ?? '—'} minutos de indisponibilidad al mes.`
          : 'Debe declararse un objetivo de disponibilidad mensual y si incluye o excluye las ventanas de mantenimiento.',
        acceptance: 'Medición continua del indicador de disponibilidad por capacidad de negocio, con reporte mensual y presupuesto de error.',
        verification: 'Monitoreo externo de disponibilidad y revisión mensual del presupuesto de error.'
      };
    case 'reliability':
      return {
        ...base,
        statement: 'Las operaciones críticas deben ser idempotentes y no perder trabajo confirmado ante fallas parciales.',
        acceptance: 'Pruebas de reintento duplicado que no producen efectos duplicados, y pruebas de corte durante la operación que no dejan estado inconsistente.',
        verification: 'Inyección de fallas en pruebas automatizadas.'
      };
    case 'security':
      return {
        ...base,
        statement: `Controles mínimos exigidos: cifrado en tránsito${config.security?.encryptionAtRest ? ', cifrado en reposo' : ''}${config.security?.mfa ? ', múltiples factores de autenticación' : ''}, gestión de secretos fuera del código y mínimo privilegio en todos los accesos.`,
        acceptance: 'Análisis de dependencias y de código sin hallazgos críticos abiertos, ausencia de secretos en el repositorio y su historial, y revisión de permisos documentada.',
        verification: 'Análisis estático, análisis de dependencias y detección de secretos ejecutados en cada construcción; revisión manual de la matriz de permisos.'
      };
    case 'privacy':
      return {
        ...base,
        statement: sensitivity.length
          ? `Tratamiento de datos de categoría: ${sensitivity.join(', ')}. Debe aplicarse minimización, finalidad declarada, plazo de conservación (${cap.retentionMonths || 'no declarado'} meses) y procedimiento de supresión.`
          : 'Debe declararse qué categorías de datos se tratan para determinar las obligaciones aplicables.',
        acceptance: 'Inventario de datos personales con base legal y plazo por categoría; prueba de que el procedimiento de supresión elimina o anonimiza efectivamente, incluidas copias y respaldos.',
        verification: 'Revisión del inventario de datos y prueba funcional del derecho de supresión.',
        note: 'Seleccionar una jurisdicción no otorga cumplimiento legal: las obligaciones concretas requieren análisis propio.'
      };
    case 'accessibility':
      return {
        ...base,
        statement: config.quality?.accessibilityTarget
          ? `La interfaz debe cumplir ${config.quality.accessibilityTarget}.`
          : 'Debe declararse un nivel objetivo de accesibilidad (por ejemplo WCAG 2.2 AA) para las interfaces de usuario.',
        acceptance: 'Navegación completa por teclado, contraste verificado, textos alternativos presentes y uso verificado con lector de pantalla en los flujos principales.',
        verification: 'Revisión automatizada más verificación manual de los flujos críticos.',
        note: types.some((t) => ['e-government', 'lms', 'cbt', 'identity-provider'].includes(t))
          ? 'En servicios públicos y educativos la accesibilidad suele ser exigible por normativa, incluidas las acomodaciones en evaluaciones.'
          : ''
      };
    case 'maintainability':
      return {
        ...base,
        statement: 'El sistema debe poder modificarse por el equipo declarado sin conocimiento tácito no documentado.',
        acceptance: 'Una persona nueva ejecuta el sistema completo en local siguiendo la documentación, y realiza un cambio pequeño con pruebas en un plazo acordado.',
        verification: 'Ejercicio de incorporación documentado.'
      };
    case 'modifiability':
      return {
        ...base,
        statement: 'Los cambios previstos deben requerir modificación de un solo módulo cuando sea razonable.',
        acceptance: 'Para cada cambio previsto declarado, se identifica el módulo afectado y el contrato que lo aísla.',
        verification: 'Revisión de diseño contra la lista de cambios previstos.'
      };
    case 'portability':
      return {
        ...base,
        statement: `El sistema debe ejecutarse en los entornos declarados: ${(config.classification?.platforms || []).join(', ') || 'no declarados'}.`,
        acceptance: 'La construcción y las pruebas se ejecutan de forma reproducible en todos los entornos declarados.',
        verification: 'Matriz de construcción en integración continua.'
      };
    case 'interoperability':
      return {
        ...base,
        statement: `Las interfaces externas deben seguir contratos declarados y, cuando exista, el estándar del dominio: ${collectStandards(types, catalog).slice(0, 6).join('; ') || 'ninguno identificado'}.`,
        acceptance: 'Pruebas de contrato contra el esquema publicado, con validación de ejemplos en ambas direcciones.',
        verification: 'Pruebas de contrato automatizadas.',
        note: 'Declarar un estándar no implica conformidad certificada: debe verificarse contra una implementación de referencia.'
      };
    case 'observability':
      return {
        ...base,
        statement: 'Cada operación crítica debe emitir métricas, registro estructurado y traza correlacionable.',
        acceptance: 'Es posible reconstruir una operación completa de extremo a extremo a partir de su identificador de correlación.',
        verification: 'Ejercicio de diagnóstico sobre un incidente simulado.'
      };
    case 'recoverability':
      return {
        ...base,
        statement: `Objetivos declarados: RTO ${num(config.quality?.rtoMinutes) || 'no declarado'} min, RPO ${num(config.quality?.rpoMinutes) || 'no declarado'} min.`,
        acceptance: 'Ensayo de restauración completa dentro del RTO, con pérdida de datos no mayor al RPO.',
        verification: 'Ensayo periódico cronometrado, con informe de resultado.'
      };
    case 'testability':
      return {
        ...base,
        statement: 'El núcleo de dominio debe poder probarse sin infraestructura externa.',
        acceptance: 'La suite de pruebas del dominio se ejecuta sin base de datos ni red, en un tiempo que permita ejecutarla en cada cambio.',
        verification: 'Ejecución de la suite en integración continua con medición de duración.'
      };
    case 'usability':
      return {
        ...base,
        statement: 'Los flujos principales deben poder completarse sin capacitación previa por el perfil de usuario declarado.',
        acceptance: 'Pruebas con usuarios representativos: tasa de finalización y errores por tarea dentro de los umbrales acordados.',
        verification: 'Prueba de usabilidad con usuarios reales del perfil declarado.'
      };
    case 'evolvability':
      return {
        ...base,
        statement: 'La arquitectura debe admitir los cambios proyectados en el plan de evolución sin rediseño estructural.',
        acceptance: 'Cada hito del plan de evolución tiene identificado el componente que cambia y el contrato que lo aísla.',
        verification: 'Revisión arquitectónica en la frecuencia declarada en el plan.'
      };
    case 'costEfficiency':
      return {
        ...base,
        statement: capacity?.cost
          ? `El costo de infraestructura debe mantenerse dentro de ${capacity.cost.monthlyUsd} USD/mes para la carga inicial proyectada, con costo unitario por usuario activo decreciente a medida que crece el uso.`
          : 'Debe declararse el presupuesto y los precios unitarios para poder evaluar la eficiencia económica.',
        acceptance: 'Seguimiento mensual del costo total y del costo por operación, con explicación de desviaciones.',
        verification: 'Informe de costo por periodo contrastado con la proyección del escenario esperado.'
      };
    default:
      return { ...base, statement: 'Requisito por definir.', acceptance: 'Por definir.', verification: 'Por definir.' };
  }
}

function collectStandards(types, catalog) {
  const set = new Set();
  for (const id of types) {
    const system = catalog?.getSystem?.(id);
    for (const s of system?.standards || []) set.add(s);
  }
  return [...set];
}

/** Requisitos no funcionales completos. */
export function deriveNonFunctionalRequirements(config, capacity, catalog) {
  return QUALITY_ATTRIBUTES.map((attr) => buildAttributeRequirement(attr, config, capacity, catalog));
}

/** Requisitos de cumplimiento derivados de normativa y estándares declarados. */
export function deriveComplianceRequirements(config, catalog) {
  const out = [];
  const types = config.classification?.systemTypes || [];

  for (const regulation of config.compliance?.regulations || []) {
    out.push({
      id: nextId('RC'),
      source: 'usuario',
      statement: `Obligación declarada: ${regulation}.`,
      acceptance: 'Identificación del control que la satisface, su responsable y la evidencia que lo demuestra.',
      note: 'La verificación de cumplimiento requiere análisis legal propio: el motor solo registra la obligación declarada.'
    });
  }

  for (const standard of config.compliance?.standards || []) {
    out.push({
      id: nextId('RC'),
      source: 'usuario',
      statement: `Estándar declarado como aplicable: ${standard}.`,
      acceptance: 'Verificación contra los requisitos del estándar y registro de las desviaciones conocidas.',
      note: 'Declarar un estándar no constituye certificación ni conformidad verificada.'
    });
  }

  const catalogStandards = collectStandards(types, catalog);
  for (const standard of catalogStandards) {
    out.push({
      id: nextId('RC'),
      source: 'catálogo',
      statement: `Estándar habitual del dominio, a evaluar: ${standard}.`,
      acceptance: 'Decidir si aplica al alcance y, si aplica, definir cómo se verifica.',
      note: 'Sugerido por el catálogo según los tipos de sistema elegidos; no implica obligación.'
    });
  }

  return out;
}

/** Conjunto completo de requisitos. */
export function deriveRequirements(config, catalog, capacity) {
  counter = 0;
  const functional = deriveFunctionalRequirements(config, catalog);
  const nonFunctional = deriveNonFunctionalRequirements(config, capacity, catalog);
  const compliance = deriveComplianceRequirements(config, catalog);

  return {
    functional,
    nonFunctional,
    compliance,
    counts: {
      functional: functional.length,
      nonFunctional: nonFunctional.length,
      compliance: compliance.length
    },
    note: 'Los requisitos derivados del catálogo son capacidades habituales del tipo de sistema, no alcance comprometido. Deben confirmarse con el responsable funcional.'
  };
}
