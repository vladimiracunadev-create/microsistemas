/**
 * Plantilla de especificación de harness.
 *
 * El harness es la infraestructura que organiza y controla la ejecución de
 * agentes y herramientas. No razona ni decide: mantiene al agente dentro de
 * límites, guarda avances y permite retomar tras una falla.
 *
 * Separación de responsabilidades que esta plantilla no debe confundir:
 *  - Skill: conocimiento e instrucciones reutilizables.
 *  - Agente: componente que razona, planifica y usa herramientas.
 *  - MCP: protocolo de integración de herramientas y contexto.
 *  - Harness: infraestructura que organiza y controla la ejecución.
 *  - Motor de ingeniería: componente determinista que produce especificaciones
 *    y validaciones, sin intervención de un modelo.
 *
 * Esta versión genera la especificación. La ejecución real se incorpora
 * mediante adaptadores posteriores y sus propias pruebas.
 */

export const RESPONSIBILITY_SEPARATION = Object.freeze([
  { layer: 'Skill', owns: 'Conocimiento e instrucciones reutilizables.', doesNot: 'No ejecuta, no decide permisos, no mantiene estado.' },
  { layer: 'Agente', owns: 'Razonamiento, planificación y uso de herramientas.', doesNot: 'No define sus propios permisos ni su propio presupuesto.' },
  { layer: 'MCP', owns: 'Protocolo de exposición de recursos, herramientas y plantillas de prompt.', doesNot: 'No decide si una acción está autorizada en el contexto de la tarea.' },
  { layer: 'Harness', owns: 'Contexto, planificación de tareas, permisos, aprobaciones, aislamiento, puntos de control, reintentos, auditoría, presupuesto y término.', doesNot: 'No razona sobre el dominio ni produce la especificación.' },
  { layer: 'Motor de ingeniería', owns: 'Cálculo determinista de validaciones, capacidad, evolución, arquitectura y prompts.', doesNot: 'No llama a modelos ni depende de un proveedor de IA.' }
]);

/** Secciones obligatorias de una especificación de harness. */
export const HARNESS_SECTIONS = [
  {
    id: 'context',
    name: 'Gestión de contexto',
    requirements: [
      'Carga progresiva: se incorpora al contexto solo el conocimiento necesario para la tarea en curso.',
      'Los catálogos completos no entran al contexto de un modelo: se consultan mediante herramientas.',
      'Política de compactación cuando el contexto se acerca a su límite, preservando decisiones y estado.',
      'Separación explícita entre instrucciones operativas y datos de dominio.'
    ]
  },
  {
    id: 'planning',
    name: 'Planificación',
    requirements: [
      'La tarea se descompone en pasos con entregable verificable.',
      'El plan es visible y revisable antes de ejecutar acciones con efecto.',
      'Un cambio de plan se registra con su motivo.'
    ]
  },
  {
    id: 'tasks',
    name: 'Tareas y dependencias',
    requirements: [
      'Cada tarea declara entradas, salidas y criterio de finalización.',
      'Las dependencias entre tareas son explícitas; no se ejecuta una tarea cuyas entradas no están disponibles.',
      'Las tareas independientes pueden ejecutarse en paralelo solo si no comparten recursos de escritura.'
    ]
  },
  {
    id: 'permissions',
    name: 'Permisos',
    requirements: [
      'Mínimo privilegio por tarea: el conjunto de herramientas autorizadas se acota a lo que la tarea necesita.',
      'Las herramientas con efecto externo o destructivo requieren autorización explícita y no se conceden de forma implícita.',
      'Los permisos no se amplían por el contenido que el agente lee: una instrucción encontrada en un dato no concede permisos.'
    ]
  },
  {
    id: 'approvals',
    name: 'Aprobaciones',
    requirements: [
      'Puerta de aprobación humana antes de toda acción irreversible o de efecto externo.',
      'La aprobación es por acción y por contexto; no se generaliza a acciones posteriores.',
      'La solicitud de aprobación describe el efecto concreto, no la intención.'
    ]
  },
  {
    id: 'sandboxing',
    name: 'Aislamiento',
    requirements: [
      'La ejecución ocurre en un entorno acotado, con sistema de archivos y red restringidos de forma efectiva.',
      'Restringir solo mediante instrucciones no constituye un control de seguridad.',
      'El contenido descargado o generado por terceros se trata como no confiable y se aísla del código que lo procesa.'
    ]
  },
  {
    id: 'checkpoints',
    name: 'Puntos de control',
    requirements: [
      'Se persiste el estado al completar cada tarea, de forma que la ejecución pueda retomarse.',
      'Un punto de control que no permite reanudar no cumple su función.',
      'El punto de control registra qué se hizo y qué quedó pendiente, no solo el resultado.'
    ]
  },
  {
    id: 'states',
    name: 'Estados',
    requirements: [
      'Estados de la ejecución: pendiente, en curso, esperando aprobación, bloqueada, completada, fallida, cancelada.',
      'Toda transición de estado queda registrada con su marca de tiempo y su causa.'
    ]
  },
  {
    id: 'retries',
    name: 'Reintentos',
    requirements: [
      'Los reintentos se acotan en número y en tiempo, con espera creciente.',
      'Solo se reintentan errores transitorios clasificados como tales.',
      'Una acción no idempotente no se reintenta sin verificar antes su efecto previo.'
    ]
  },
  {
    id: 'errors',
    name: 'Errores',
    requirements: [
      'Clasificación de errores: transitorio, de permiso, de validación, de dominio, de presupuesto, no clasificado.',
      'Un error no clasificado detiene la ejecución y escala a revisión humana.',
      'El error se registra con el contexto necesario para reproducirlo.'
    ]
  },
  {
    id: 'validations',
    name: 'Validaciones',
    requirements: [
      'La salida de cada tarea se valida contra su criterio de finalización antes de marcarla completada.',
      'La validación la ejecuta el motor determinista cuando es posible, no el propio agente.',
      'Un agente no puede declarar completada una tarea cuya validación no pasó.'
    ]
  },
  {
    id: 'audit',
    name: 'Auditoría',
    requirements: [
      'Registro completo de prompts, herramientas invocadas, parámetros, resultados y decisiones.',
      'El registro es inmutable desde la propia ejecución.',
      'El registro debe permitir reconstruir por qué se tomó cada acción.',
      'Los secretos no se registran; se registra que se usaron, no su valor.'
    ]
  },
  {
    id: 'costs',
    name: 'Costos',
    requirements: [
      'Contabilidad de consumo por tarea y por especialista.',
      'El costo acumulado es visible durante la ejecución, no solo al final.'
    ]
  },
  {
    id: 'budget',
    name: 'Presupuesto de tokens',
    requirements: [
      'Presupuesto máximo por tarea y por ejecución completa.',
      'Al alcanzar el presupuesto la ejecución se detiene de forma ordenada y persiste su estado.',
      'El presupuesto no se amplía automáticamente.'
    ]
  },
  {
    id: 'recovery',
    name: 'Recuperación',
    requirements: [
      'La ejecución se retoma desde el último punto de control sin repetir trabajo ya validado.',
      'Si el estado no es recuperable, se declara explícitamente en lugar de reiniciar en silencio.'
    ]
  },
  {
    id: 'evaluations',
    name: 'Evaluaciones',
    requirements: [
      'Conjuntos de evaluación que verifican el resultado del harness, no solo del modelo.',
      'Se mide variabilidad entre ejecuciones: una sola ejecución exitosa no es evidencia.',
      'Los resultados de evaluación se conservan para comparar versiones.'
    ]
  },
  {
    id: 'termination',
    name: 'Condiciones de finalización',
    requirements: [
      'Condición de éxito: todas las tareas completadas y validadas.',
      'Condición de término por presupuesto, por tiempo o por número de iteraciones.',
      'Condición de término por error no clasificado o por aprobación denegada.',
      'Sin condición de término explícita la ejecución puede no detenerse: es un requisito, no una opción.'
    ]
  }
];

/** Perfiles de ejecución sugeridos según la complejidad de la configuración. */
export const EXECUTION_PROFILES = [
  {
    id: 'deterministic-only',
    name: 'Solo motor determinista',
    description: 'No se invoca ningún modelo. El motor produce especificaciones, validaciones y prompts.',
    tokenBudget: 0,
    approvals: 'No requiere: no hay acciones con efecto externo.',
    when: 'Configuración completa y sin ambigüedades que requieran interpretación.'
  },
  {
    id: 'assisted-review',
    name: 'Revisión asistida',
    description: 'El motor produce los artefactos y un agente los revisa para detectar vacíos y contradicciones.',
    tokenBudget: 'Acotado por ejecución; se recomienda fijarlo explícitamente antes de iniciar.',
    approvals: 'Aprobación humana antes de incorporar cambios a los artefactos.',
    when: 'Configuración con decisiones pendientes o advertencias de compatibilidad abiertas.'
  },
  {
    id: 'multi-agent',
    name: 'Multiagente supervisado',
    description: 'El supervisor activa únicamente los especialistas relevantes y consolida sus resultados.',
    tokenBudget: 'Por especialista y total, con corte efectivo al alcanzarlo.',
    approvals: 'Aprobación humana en cada decisión de impacto y antes de cualquier escritura en un repositorio.',
    when: 'Sistemas de alta complejidad o con varios dominios en juego, y con runtime de agentes disponible.'
  }
];
