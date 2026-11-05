/**
 * Definición declarativa del formulario dinámico.
 *
 * La interfaz no contiene lógica de dominio: se construye a partir de esta
 * descripción y escribe directamente en el contrato `sas.config.v1`. Agregar
 * un campo es agregar una entrada aquí.
 *
 * Tipos de campo:
 *   text, textarea, number, boolean, select, dimension, systems,
 *   tags, repeater, priorities, scenarios, horizon
 *
 * `showIf(config)` controla los campos condicionales: un campo que no
 * corresponde no se muestra y no se exige.
 */

import { QUALITY_ATTRIBUTES } from '../core/schema/config-schema.js';
import { GROWTH_MODELS } from '../core/evolution/evolution.js';

export const FORM_SECTIONS = [
  {
    id: 'identity',
    number: 1,
    title: 'Identidad y finalidad',
    help: 'Qué es el sistema y para qué existe. Si va a ampliar un sistema que ya está en producción, elija el modo correspondiente: los prompts generados exigirán inspeccionar el repositorio antes de escribir código.',
    fields: [
      { path: 'identity.name', label: 'Nombre del sistema', type: 'text', required: true, placeholder: 'Por ejemplo: Plataforma de Evaluación Altair', help: 'Nombre con el que se identificará el sistema en todos los artefactos.' },
      { path: 'identity.purpose', label: 'Finalidad', type: 'textarea', required: true, rows: 3, help: 'Qué problema resuelve y para quién. Una o dos frases concretas valen más que un párrafo genérico.' },
      { path: 'identity.audience', label: 'Usuarios objetivo', type: 'text', help: 'Perfiles de las personas que usarán el sistema.' },
      { path: 'identity.owner', label: 'Responsable', type: 'text', help: 'Área o persona que decide sobre el alcance.' },
      {
        path: 'identity.mode',
        label: 'Modo',
        type: 'select',
        options: [
          { id: 'new', name: 'Sistema nuevo', description: 'Se diseña desde cero.' },
          { id: 'existing', name: 'Sistema existente', description: 'Se amplía un sistema en operación sin alterar su comportamiento previo.' }
        ],
        help: 'En modo existente los prompts exigen inspección previa, análisis de impacto y verificación de regresiones.'
      },
      { path: 'identity.existingSystem.repository', label: 'Repositorio o ubicación del sistema actual', type: 'text', showIf: (c) => c.identity.mode === 'existing', help: 'Sin esta información no es posible exigir la inspección previa.' },
      { path: 'identity.existingSystem.currentStack', label: 'Tecnologías actuales', type: 'textarea', rows: 2, showIf: (c) => c.identity.mode === 'existing', help: 'Lo que ya existe condiciona lo que se puede cambiar.' },
      { path: 'identity.existingSystem.knownConstraints', label: 'Restricciones conocidas', type: 'textarea', rows: 2, showIf: (c) => c.identity.mode === 'existing', help: 'Qué no se puede tocar, renombrar ni reemplazar.' },
      { path: 'identity.existingSystem.hasTests', label: 'Tiene pruebas automatizadas', type: 'boolean', showIf: (c) => c.identity.mode === 'existing' },
      { path: 'identity.existingSystem.hasDocs', label: 'Tiene documentación', type: 'boolean', showIf: (c) => c.identity.mode === 'existing' }
    ]
  },
  {
    id: 'type',
    number: 2,
    title: 'Tipo de sistema',
    help: 'Elija uno o varios tipos del catálogo. El tipo funcional aporta capacidades, relaciones, restricciones y estándares. Es una dimensión independiente del modelo de servicio, de la arquitectura y de la tecnología: no las mezcle.',
    fields: [
      { path: 'classification.systemTypes', label: 'Tipos de sistema', type: 'systems', required: true, help: 'Busque por nombre, sigla, sinónimo o capacidad. Puede combinar varios, por ejemplo ERP + CRM + Workflow.' },
      {
        path: 'classification.customTypes',
        label: 'Tipos personalizados',
        type: 'repeater',
        itemLabel: 'tipo',
        help: 'Para dominios que el catálogo todavía no cubre. El motor no aporta capacidades ni estándares para un tipo personalizado: lo que declare aquí es todo lo que tendrá.',
        itemFields: [
          { key: 'name', label: 'Nombre', type: 'text' },
          { key: 'domain', label: 'Dominio', type: 'text' },
          { key: 'capabilities', label: 'Capacidades', type: 'tags' },
          { key: 'constraints', label: 'Restricciones', type: 'tags' }
        ]
      }
    ]
  },
  {
    id: 'sector',
    number: 3,
    title: 'Sector',
    help: 'Familias del catálogo a las que pertenece el sistema. Se usa para orientar la búsqueda y la documentación, no para restringir la selección.',
    fields: [
      { path: 'classification.sectors', label: 'Sectores', type: 'dimension', catalog: 'families', multiple: true }
    ]
  },
  {
    id: 'functional',
    number: 4,
    title: 'Funcionalidades y procesos',
    help: 'Lo que el sistema debe hacer, en sus palabras. Los tipos elegidos ya aportan las capacidades habituales: aquí agregue lo propio de este sistema.',
    fields: [
      { path: 'functional.capabilities', label: 'Capacidades específicas', type: 'tags', help: 'Una por línea. Se convierten en requisitos funcionales con criterio de aceptación.' },
      { path: 'functional.processes', label: 'Procesos de negocio', type: 'tags', help: 'Procesos completos de extremo a extremo, por ejemplo "orden de compra a pago".' }
    ]
  },
  {
    id: 'users',
    number: 5,
    title: 'Usuarios, organizaciones, roles y permisos',
    help: 'Quién usa el sistema y con qué alcance. El modelo de roles determina las pruebas de autorización exigidas.',
    fields: [
      {
        path: 'functional.organizations.model',
        label: 'Modelo organizacional',
        type: 'select',
        options: [
          { id: '', name: 'No declarado', description: '' },
          { id: 'single', name: 'Una sola organización', description: 'El sistema sirve a una organización.' },
          { id: 'multi', name: 'Varias organizaciones', description: 'El sistema sirve a varias organizaciones con datos separados.' }
        ]
      },
      { path: 'functional.organizations.count', label: 'Cantidad de organizaciones', type: 'number', min: 0, showIf: (c) => c.functional.organizations.model === 'multi' },
      { path: 'functional.organizations.usersPerOrg', label: 'Usuarios por organización', type: 'number', min: 0, showIf: (c) => c.functional.organizations.model === 'multi' },
      {
        path: 'functional.roles',
        label: 'Roles y permisos',
        type: 'repeater',
        itemLabel: 'rol',
        help: 'Cada rol genera un requisito de autorización con prueba de acceso permitido y denegado.',
        itemFields: [
          { key: 'name', label: 'Rol', type: 'text' },
          { key: 'description', label: 'Descripción', type: 'text' },
          { key: 'permissions', label: 'Permisos', type: 'tags' }
        ]
      }
    ]
  },
  {
    id: 'architecture',
    number: 6,
    title: 'Arquitectura y despliegue',
    help: 'Dimensiones independientes entre sí. Puede combinarlas. El motor advierte incompatibilidades reales, pero no prohíbe combinaciones técnicamente válidas.',
    fields: [
      { path: 'classification.serviceModel', label: 'Modelo de servicio', type: 'dimension', catalog: 'serviceModel', multiple: true },
      { path: 'classification.architecture', label: 'Estilo arquitectónico', type: 'dimension', catalog: 'architecture', multiple: true, help: 'Si lo deja vacío, el motor recomienda uno y explica por qué. Si lo declara, el motor respeta su elección y señala si difiere de su recomendación.' },
      { path: 'classification.deployment', label: 'Despliegue', type: 'dimension', catalog: 'deployment', multiple: true },
      { path: 'classification.tenancy', label: 'Aislamiento', type: 'dimension', catalog: 'tenancy', multiple: false },
      { path: 'classification.platforms', label: 'Plataformas objetivo', type: 'dimension', catalog: 'platforms', multiple: true }
    ]
  },
  {
    id: 'technology',
    number: 7,
    title: 'Tecnologías y bases de datos',
    help: 'Lo que ya está decidido. Lo que no declare queda como decisión pendiente, no como supuesto del motor.',
    fields: [
      { path: 'technology.languages', label: 'Lenguajes', type: 'tags' },
      { path: 'technology.frameworks', label: 'Frameworks', type: 'tags' },
      {
        path: 'technology.databases',
        label: 'Motores de datos',
        type: 'repeater',
        itemLabel: 'motor',
        help: 'Declare el propósito de cada almacén: transaccional, caché, búsqueda, series temporales, objetos.',
        itemFields: [
          { key: 'engine', label: 'Motor', type: 'text' },
          { key: 'purpose', label: 'Propósito', type: 'text' }
        ]
      },
      { path: 'technology.infrastructure', label: 'Infraestructura', type: 'tags' },
      { path: 'technology.offlineSupport', label: 'Requiere operación sin conexión', type: 'boolean', help: 'Necesario en trabajo de terreno, punto de venta y aplicación de pruebas.' },
      { path: 'technology.transactionalIntegrity', label: 'Exige integridad transaccional', type: 'boolean', help: 'Marque en registros contables, financieros y oficiales, donde un estado parcialmente aplicado es una falla grave.' },
      { path: 'technology.consistencyStrategy', label: 'Estrategia de consistencia', type: 'text', help: 'Obligatoria si hay más de una región.' }
    ]
  },
  {
    id: 'integrations',
    number: 8,
    title: 'Integraciones',
    help: 'Para cada integración debe quedar claro qué ocurre cuando la contraparte responde lento, responde error o no responde.',
    fields: [
      { path: 'classification.integrationStyle', label: 'Estilos de integración', type: 'dimension', catalog: 'integrationStyle', multiple: true },
      {
        path: 'functional.integrations',
        label: 'Integraciones concretas',
        type: 'repeater',
        itemLabel: 'integración',
        itemFields: [
          { key: 'name', label: 'Contraparte', type: 'text' },
          { key: 'direction', label: 'Dirección', type: 'select', options: [{ id: '', name: 'No declarada' }, { id: 'entrante', name: 'Entrante' }, { id: 'saliente', name: 'Saliente' }, { id: 'bidireccional', name: 'Bidireccional' }] },
          { key: 'style', label: 'Estilo', type: 'text' },
          { key: 'criticality', label: 'Criticidad', type: 'select', options: [{ id: '', name: 'No declarada' }, { id: 'baja', name: 'Baja' }, { id: 'media', name: 'Media' }, { id: 'alta', name: 'Alta' }, { id: 'crítica', name: 'Crítica' }] },
          { key: 'notes', label: 'Comportamiento ante falla', type: 'text' }
        ]
      }
    ]
  },
  {
    id: 'security',
    number: 9,
    title: 'Seguridad y privacidad',
    help: 'La sensibilidad de los datos determina los controles exigibles. Declararlos no los implementa: cada uno pasa a requisito verificable.',
    fields: [
      { path: 'classification.dataSensitivity', label: 'Sensibilidad de los datos', type: 'dimension', catalog: 'dataSensitivity', multiple: true },
      { path: 'security.mfa', label: 'Autenticación con múltiples factores', type: 'boolean' },
      { path: 'security.encryptionAtRest', label: 'Cifrado en reposo', type: 'boolean' },
      { path: 'security.encryptionInTransit', label: 'Cifrado en tránsito', type: 'boolean' },
      { path: 'security.rowLevelAuthorization', label: 'Autorización a nivel de registro o documento', type: 'boolean', help: 'Imprescindible en recuperación aumentada y en multi-tenancy compartido.' },
      { path: 'security.auditTrail', label: 'Registro de auditoría inmutable', type: 'boolean' },
      { path: 'security.consentManagement', label: 'Gestión de consentimiento', type: 'boolean', help: 'Requisito previo con datos de menores y de categoría especial.' },
      { path: 'security.secretsManagement', label: 'Gestión de secretos fuera del código', type: 'boolean' },
      { path: 'security.threatModel', label: 'Modelado de amenazas', type: 'boolean' }
    ]
  },
  {
    id: 'compliance',
    number: 10,
    title: 'Requisitos normativos',
    help: 'Seleccionar una jurisdicción no otorga cumplimiento legal. Las obligaciones concretas se identifican una por una y requieren validación propia.',
    fields: [
      { path: 'compliance.jurisdictions', label: 'Jurisdicciones', type: 'tags' },
      { path: 'compliance.regulations', label: 'Obligaciones identificadas', type: 'tags', help: 'Obligaciones concretas, no nombres de leyes sueltos.' },
      { path: 'compliance.standards', label: 'Estándares aplicables', type: 'tags', help: 'Los tipos elegidos ya sugieren estándares del dominio; aquí declare los que asume como exigibles.' },
      { path: 'compliance.dataResidency', label: 'Residencia de datos', type: 'text' },
      { path: 'compliance.auditRequirements', label: 'Requisitos de auditoría', type: 'textarea', rows: 2 }
    ]
  },
  {
    id: 'capacity',
    number: 11,
    title: 'Volumen, rendimiento y disponibilidad',
    help: 'Usuarios registrados, activos y concurrentes son magnitudes distintas: concurrentes ≤ activos diarios ≤ activos mensuales ≤ registrados. Lo que deje vacío el motor lo estima y lo declara como supuesto.',
    fields: [
      { path: 'capacity.registeredUsers', label: 'Usuarios registrados', type: 'number', min: 0 },
      { path: 'capacity.mau', label: 'Usuarios activos mensuales', type: 'number', min: 0 },
      { path: 'capacity.dau', label: 'Usuarios activos diarios', type: 'number', min: 0 },
      { path: 'capacity.peakConcurrentUsers', label: 'Usuarios concurrentes en pico', type: 'number', min: 0, help: 'Sesiones simultáneas en el momento de mayor uso.' },
      { path: 'capacity.sessionsPerUserPerDay', label: 'Sesiones por usuario y día', type: 'number', min: 0, step: 0.1 },
      { path: 'capacity.requestsPerSession', label: 'Solicitudes por sesión', type: 'number', min: 0 },
      { path: 'capacity.avgSessionMinutes', label: 'Duración media de sesión (minutos)', type: 'number', min: 0 },
      { path: 'capacity.readWriteRatio', label: 'Lecturas por cada escritura', type: 'number', min: 0, help: 'Determina la estrategia de caché y de réplicas de lectura.' },
      { path: 'capacity.avgRecordKb', label: 'Tamaño medio de registro (KB)', type: 'number', min: 0, step: 0.1 },
      { path: 'capacity.filesPerUserPerMonth', label: 'Archivos por usuario y mes', type: 'number', min: 0 },
      { path: 'capacity.avgFileMb', label: 'Tamaño medio de archivo (MB)', type: 'number', min: 0, step: 0.1 },
      { path: 'capacity.egressPerRequestKb', label: 'Respuesta media por solicitud (KB)', type: 'number', min: 0 },
      { path: 'capacity.organizations', label: 'Organizaciones atendidas', type: 'number', min: 0 },
      { path: 'capacity.regions', label: 'Regiones de despliegue', type: 'tags' },
      { path: 'capacity.peakFactor', label: 'Factor de pico sobre la media', type: 'number', min: 0, step: 0.1, help: 'Cuántas veces el pico horario supera la media. En ventanas concentradas puede ser 10 o más.' },
      { path: 'capacity.seasonalPeakFactor', label: 'Factor de pico estacional', type: 'number', min: 0, step: 0.1, help: 'Multiplicador adicional de la temporada alta sobre el pico diario.' },
      { path: 'capacity.backgroundJobsPerDay', label: 'Tareas en segundo plano por día', type: 'number', min: 0 },
      { path: 'capacity.retentionMonths', label: 'Conservación de datos (meses)', type: 'number', min: 0, help: 'En sistemas regulados suele estar fijada por normativa.' },
      { path: 'capacity.slaAvailability', label: 'Disponibilidad objetivo (%)', type: 'number', min: 0, max: 100, step: 0.01 },
      { path: 'capacity.latencyTargetMs', label: 'Objetivo de latencia (ms)', type: 'number', min: 0 },
      { path: 'capacity.latencyPercentile', label: 'Percentil del objetivo', type: 'select', options: [{ id: 50, name: 'p50' }, { id: 75, name: 'p75' }, { id: 90, name: 'p90' }, { id: 95, name: 'p95' }, { id: 99, name: 'p99' }, { id: 99.9, name: 'p99,9' }], numeric: true },
      { path: 'capacity.criticalResource', label: 'Recurso crítico con concurrencia', type: 'text', help: 'Por ejemplo: última unidad de stock, cupo de agenda, folio de documento, saldo de cuenta.' }
    ]
  },
  {
    id: 'ai',
    number: 12,
    title: 'Uso de inteligencia artificial',
    help: 'Opcional. La aplicación no necesita servicios de IA para funcionar: esta sección describe el uso de IA del sistema que usted está diseñando.',
    fields: [
      { path: 'technology.aiUsage.enabled', label: 'El sistema usará modelos de IA', type: 'boolean' },
      { path: 'technology.aiUsage.provider', label: 'Proveedor de inferencia', type: 'text', showIf: (c) => c.technology.aiUsage.enabled, help: 'Escriba "local" si la inferencia ocurre dentro del perímetro.' },
      { path: 'technology.aiUsage.purpose', label: 'Para qué se usa', type: 'textarea', rows: 2, showIf: (c) => c.technology.aiUsage.enabled },
      { path: 'technology.aiUsage.automatedDecisions', label: 'Habrá decisiones automatizadas que afecten a personas', type: 'boolean', showIf: (c) => c.technology.aiUsage.enabled },
      { path: 'technology.aiUsage.budgetControls', label: 'Hay controles de presupuesto e iteraciones', type: 'boolean', showIf: (c) => c.technology.aiUsage.enabled },
      { path: 'technology.aiUsage.tokensPerOperation', label: 'Tokens por operación', type: 'number', min: 0, showIf: (c) => c.technology.aiUsage.enabled },
      { path: 'technology.aiUsage.operationsPerDay', label: 'Operaciones por día', type: 'number', min: 0, showIf: (c) => c.technology.aiUsage.enabled }
    ]
  },
  {
    id: 'evolution',
    number: 13,
    title: 'Evolución temporal',
    help: 'Obligatoria para todo sistema. El horizonte es el que usted defina: meses, años, o sin fecha de término conocida. Los hitos pueden expresarse por tiempo o por condición observable.',
    fields: [
      { path: 'evolution.horizon', label: 'Horizonte', type: 'horizon', required: true },
      { path: 'evolution.growthModel', label: 'Modelo de crecimiento', type: 'select', options: [{ id: '', name: 'No declarado', description: 'Se asume crecimiento porcentual compuesto y queda registrado como supuesto.' }, ...GROWTH_MODELS] },
      { path: 'evolution.growthRatePercent', label: 'Tasa anual esperada (%)', type: 'number', min: 0, step: 0.1 },
      { path: 'evolution.scenarios', label: 'Escenarios', type: 'scenarios', help: 'Si no declara tasas por escenario, se derivan de la esperada (mitad y doble) y queda registrado como supuesto editable.' },
      {
        path: 'evolution.milestones',
        label: 'Hitos',
        type: 'repeater',
        itemLabel: 'hito',
        help: 'Un hito por condición observable envejece mejor que una fecha arbitraria.',
        itemFields: [
          { key: 'name', label: 'Nombre', type: 'text' },
          { key: 'kind', label: 'Tipo', type: 'select', options: [{ id: 'condition', name: 'Por condición observable' }, { id: 'time', name: 'Por tiempo' }] },
          { key: 'atMonth', label: 'Mes', type: 'number', min: 0, showIf: (item) => item.kind === 'time' },
          { key: 'condition', label: 'Condición', type: 'text', showIf: (item) => item.kind !== 'time' }
        ],
        itemDefaults: { kind: 'condition' }
      },
      { path: 'evolution.plannedChanges', label: 'Cambios previstos', type: 'tags', help: 'Módulos, países, canales, integraciones o sustituciones que ya se anticipan.' },
      { path: 'evolution.reviewFrequencyMonths', label: 'Frecuencia de revisión arquitectónica (meses)', type: 'number', min: 0 }
    ]
  },
  {
    id: 'quality',
    number: 14,
    title: 'Calidad no funcional',
    help: 'Prioridades sobre los atributos de ISO/IEC 25010, ampliados con evolutividad y eficiencia económica. Declarar una norma no implica conformidad ni certificación.',
    fields: [
      { path: 'quality.priorities', label: 'Prioridad por atributo (1 a 5)', type: 'priorities' },
      { path: 'quality.accessibilityTarget', label: 'Objetivo de accesibilidad', type: 'text', placeholder: 'Por ejemplo: WCAG 2.2 nivel AA' },
      { path: 'quality.rpoMinutes', label: 'RPO: pérdida de datos tolerable (minutos)', type: 'number', min: 0 },
      { path: 'quality.rtoMinutes', label: 'RTO: tiempo de recuperación tolerable (minutos)', type: 'number', min: 0 },
      { path: 'quality.testStrategy', label: 'Estrategia de pruebas', type: 'tags' }
    ]
  },
  {
    id: 'operations',
    number: 15,
    title: 'Operación y costos',
    help: 'El equipo que operará el sistema es una restricción de diseño, no un detalle administrativo. Sin precios unitarios no hay estimación de costo.',
    fields: [
      { path: 'operations.teamSize', label: 'Tamaño del equipo', type: 'number', min: 0 },
      { path: 'operations.onCall', label: 'Hay turnos de guardia', type: 'boolean' },
      { path: 'operations.observability', label: 'Hay observabilidad', type: 'boolean' },
      { path: 'operations.loadTesting', label: 'Hay pruebas de carga previstas', type: 'boolean' },
      { path: 'operations.environments', label: 'Ambientes', type: 'tags' },
      { path: 'operations.supportHours', label: 'Horario de soporte', type: 'text' },
      { path: 'operations.monthlyBudgetUsd', label: 'Presupuesto mensual (USD)', type: 'number', min: 0 },
      { path: 'operations.unitCosts.vcpuMonthUsd', label: 'Precio por vCPU/mes (USD)', type: 'number', min: 0, step: 0.01 },
      { path: 'operations.unitCosts.gbRamMonthUsd', label: 'Precio por GB RAM/mes (USD)', type: 'number', min: 0, step: 0.01 },
      { path: 'operations.unitCosts.gbStorageMonthUsd', label: 'Precio por GB almacenamiento/mes (USD)', type: 'number', min: 0, step: 0.001 },
      { path: 'operations.unitCosts.gbEgressUsd', label: 'Precio por GB de salida (USD)', type: 'number', min: 0, step: 0.001 },
      { path: 'operations.unitCosts.perMillionTokensUsd', label: 'Precio por millón de tokens (USD)', type: 'number', min: 0, step: 0.01, showIf: (c) => c.technology.aiUsage.enabled }
    ]
  },
  {
    id: 'licensing',
    number: 16,
    title: 'Licenciamiento y comercialización',
    help: 'La licencia condiciona la compatibilidad con las dependencias y el modelo de negocio posible.',
    fields: [
      { path: 'classification.licensing', label: 'Licencia', type: 'dimension', catalog: 'licensing', multiple: false },
      { path: 'classification.monetization', label: 'Comercialización', type: 'dimension', catalog: 'monetization', multiple: true }
    ]
  },
  {
    id: 'deliverables',
    number: 17,
    title: 'Entregables y modalidades de generación',
    help: 'Qué artefactos se generan. Los prompts siempre se generan; los demás son opcionales y se producen como especificación, diferenciada de la implementación.',
    fields: [
      { path: 'deliverables.prompts', label: 'Prompts a generar', type: 'prompts', help: 'Vacío significa todos los aplicables a esta configuración.' },
      { path: 'deliverables.includeSkill', label: 'Generar skill reutilizable', type: 'boolean' },
      { path: 'deliverables.includeAgents', label: 'Generar definiciones de agentes', type: 'boolean' },
      { path: 'deliverables.includeHarness', label: 'Generar especificación de harness', type: 'boolean' },
      { path: 'deliverables.includeMcp', label: 'Generar especificación de adaptador MCP', type: 'boolean' }
    ]
  },
  {
    id: 'decisions',
    number: 18,
    title: 'Supuestos y decisiones pendientes',
    help: 'Registrar lo que todavía no está decidido es parte del trabajo de ingeniería, no una deuda. Lo que quede aquí aparece en todos los artefactos.',
    fields: [
      { path: 'decisions.assumptions', label: 'Supuestos propios', type: 'tags' },
      { path: 'decisions.pending', label: 'Decisiones pendientes', type: 'tags' },
      { path: 'notes', label: 'Notas', type: 'textarea', rows: 3 }
    ]
  }
];

export { QUALITY_ATTRIBUTES };

/** Todos los campos con su sección, útil para búsqueda en el formulario. */
export function flattenFields() {
  const out = [];
  for (const section of FORM_SECTIONS) {
    for (const field of section.fields) {
      out.push({ section: section.id, sectionTitle: section.title, ...field });
    }
  }
  return out;
}
