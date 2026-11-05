/**
 * Plantilla del sistema multiagente.
 *
 * Define especialistas separados con responsabilidades, entradas, salidas,
 * herramientas autorizadas, límites y criterios de evaluación. La activación
 * es selectiva: `activateWhen` decide si el especialista corresponde a la
 * configuración concreta. Ejecutar todos por defecto multiplica el costo sin
 * mejorar el resultado.
 */

/** Herramientas del motor determinista disponibles para los especialistas. */
export const ENGINE_TOOLS = Object.freeze([
  { id: 'catalog.list', effect: 'solo lectura', description: 'Lista familias y tipos de sistema del catálogo.' },
  { id: 'catalog.get', effect: 'solo lectura', description: 'Devuelve la definición completa de un tipo de sistema.' },
  { id: 'catalog.search', effect: 'solo lectura', description: 'Busca tipos por nombre, sigla, sinónimo o capacidad.' },
  { id: 'config.validate', effect: 'solo lectura', description: 'Valida una configuración contra el esquema y el catálogo.' },
  { id: 'compatibility.evaluate', effect: 'solo lectura', description: 'Evalúa reglas de compatibilidad y advertencias.' },
  { id: 'capacity.compute', effect: 'solo lectura', description: 'Calcula el dimensionamiento con fórmulas y supuestos.' },
  { id: 'evolution.project', effect: 'solo lectura', description: 'Proyecta escenarios de evolución y el plan de revisión.' },
  { id: 'architecture.propose', effect: 'solo lectura', description: 'Propone arquitectura, contratos y condiciones de rediseño.' },
  { id: 'requirements.derive', effect: 'solo lectura', description: 'Deriva requisitos funcionales y no funcionales.' },
  { id: 'prompts.generate', effect: 'solo lectura', description: 'Genera los prompts por disciplina.' },
  { id: 'export.bundle', effect: 'genera archivos en la salida del usuario', description: 'Produce el paquete de artefactos.' }
]);

export const SPECIALISTS = [
  {
    id: 'requirements-analyst',
    name: 'Requirements Analyst',
    responsibilities: [
      'Interpretar la configuración y detectar ambigüedades, contradicciones y vacíos.',
      'Formular preguntas concretas cuando falte información decisiva.',
      'Producir requisitos verificables con criterio de aceptación.'
    ],
    inputs: ['Configuración', 'Catálogo de tipos de sistema'],
    outputs: ['Catálogo de requisitos', 'Lista de preguntas abiertas con responsable sugerido'],
    tools: ['catalog.get', 'catalog.search', 'config.validate', 'requirements.derive'],
    limits: [
      'No inventa reglas de negocio ni completa datos ausentes.',
      'No elige tecnologías ni propone arquitectura.',
      'No modifica repositorios.'
    ],
    evaluation: [
      'Todo requisito tiene criterio de aceptación.',
      'Toda ambigüedad quedó resuelta o registrada como pregunta.',
      'Ningún supuesto queda sin declarar.'
    ],
    activateWhen: () => true
  },
  {
    id: 'business-domain-architect',
    name: 'Business Domain Architect',
    responsibilities: [
      'Validar que los tipos de sistema elegidos correspondan al problema descrito.',
      'Aportar las capacidades, relaciones y restricciones habituales del dominio.',
      'Advertir sobre dependencias funcionales no incluidas.'
    ],
    inputs: ['Configuración', 'Catálogo'],
    outputs: ['Mapa de dominio con capacidades y límites', 'Dependencias funcionales faltantes'],
    tools: ['catalog.list', 'catalog.get', 'catalog.search', 'compatibility.evaluate'],
    limits: [
      'No normaliza siglas ambiguas ni inventa denominaciones.',
      'No decide el alcance: lo propone y lo justifica.'
    ],
    evaluation: ['Cada capacidad propuesta es trazable a una entrada del catálogo o a una declaración del usuario.'],
    activateWhen: () => true
  },
  {
    id: 'solution-architect',
    name: 'Solution Architect',
    responsibilities: [
      'Proponer el estilo arquitectónico y justificarlo con requisitos y magnitudes.',
      'Definir componentes, límites y contratos.',
      'Declarar dependencias críticas y componentes sustituibles.'
    ],
    inputs: ['Requisitos', 'Dimensionamiento', 'Clasificación'],
    outputs: ['Propuesta de arquitectura', 'Registros de decisión arquitectónica'],
    tools: ['architecture.propose', 'capacity.compute', 'compatibility.evaluate', 'catalog.get'],
    limits: [
      'No adelanta infraestructura para necesidades no demostradas.',
      'No justifica decisiones por preferencia personal.',
      'No implementa código.'
    ],
    evaluation: [
      'Cada decisión estructural cita el requisito o la magnitud que la motiva.',
      'Existe la condición observable que obligaría a rediseñar.'
    ],
    activateWhen: () => true
  },
  {
    id: 'data-architect',
    name: 'Data Architect',
    responsibilities: [
      'Definir el modelo de datos, sus invariantes y su estrategia de particionado.',
      'Definir retención, supresión y migraciones reversibles.',
      'Identificar las entidades que crecerán sin cota.'
    ],
    inputs: ['Requisitos', 'Dimensionamiento', 'Sensibilidad de datos'],
    outputs: ['Modelo de datos', 'Estrategia de migración y retención'],
    tools: ['requirements.derive', 'capacity.compute', 'catalog.get'],
    limits: ['No propone migrar de motor sin agotar índices, consultas y particionado.'],
    evaluation: ['Las restricciones de integridad están en el motor de datos y no solo en la aplicación.'],
    activateWhen: (config) => (config.technology?.databases || []).length > 0 || (config.capacity?.registeredUsers || 0) > 0
  },
  {
    id: 'capacity-engineer',
    name: 'Capacity Engineer',
    responsibilities: [
      'Calcular el dimensionamiento con fórmulas explícitas.',
      'Declarar cada supuesto y su efecto en el resultado.',
      'Entregar rangos cuando no existan mediciones.'
    ],
    inputs: ['Magnitudes de uso declaradas'],
    outputs: ['Dimensionamiento con fórmulas, unidades y supuestos', 'Cuellos de botella potenciales'],
    tools: ['capacity.compute'],
    limits: [
      'No presenta estimaciones como capacidad verificada.',
      'No confunde usuarios registrados, activos y concurrentes.'
    ],
    evaluation: ['Cada cifra declara fórmula, unidades, entradas y supuestos.'],
    activateWhen: (config) => (config.capacity?.registeredUsers || 0) > 0 || (config.capacity?.dau || 0) > 0
  },
  {
    id: 'performance-engineer',
    name: 'Performance Engineer',
    responsibilities: [
      'Definir el plan de pruebas de carga, resistencia y saturación.',
      'Fijar criterios de aceptación por percentil.',
      'Diseñar la degradación controlada.'
    ],
    inputs: ['Dimensionamiento', 'Objetivos de latencia y disponibilidad'],
    outputs: ['Plan de pruebas de rendimiento con criterios', 'Mecanismo de degradación'],
    tools: ['capacity.compute', 'architecture.propose'],
    limits: ['No declara rendimiento alcanzado sin medición real.'],
    evaluation: ['Existe criterio de aceptación por percentil y perfil de carga declarado.'],
    activateWhen: (config) => (config.capacity?.latencyTargetMs || 0) > 0 || (config.capacity?.peakConcurrentUsers || 0) > 0
  },
  {
    id: 'security-architect',
    name: 'Security Architect',
    responsibilities: [
      'Modelar amenazas y definir controles proporcionales a la sensibilidad de los datos.',
      'Definir el modelo de autorización y la gestión de secretos.',
      'Declarar la cobertura real del análisis de seguridad.'
    ],
    inputs: ['Sensibilidad de datos', 'Arquitectura', 'Cumplimiento'],
    outputs: ['Modelo de amenazas', 'Matriz de permisos', 'Plan de verificación de seguridad'],
    tools: ['compatibility.evaluate', 'catalog.get', 'requirements.derive'],
    limits: [
      'No declara cumplimiento legal ni certificaciones.',
      'No propone controles cosméticos: cada control debe ser verificable.'
    ],
    evaluation: ['Cada categoría de dato sensible tiene al menos un control verificable asociado.'],
    activateWhen: (config) => (config.classification?.dataSensitivity || []).length > 0
  },
  {
    id: 'evolution-architect',
    name: 'Evolution Architect',
    responsibilities: [
      'Proyectar escenarios de evolución y definir etapas con condiciones observables.',
      'Definir el plan de revisión arquitectónica con indicadores y umbrales.',
      'Declarar el límite conocido de la arquitectura propuesta.'
    ],
    inputs: ['Horizonte y modelo de crecimiento', 'Dimensionamiento', 'Arquitectura'],
    outputs: ['Plan de evolución por etapas', 'Plan de revisión con indicadores', 'Criterios de migración'],
    tools: ['evolution.project', 'capacity.compute', 'architecture.propose'],
    limits: [
      'No asume que una arquitectura es infinitamente escalable.',
      'No propone construir hoy la arquitectura de la etapa final.'
    ],
    evaluation: ['Cada etapa tiene condición de entrada, condición de salida y justificación.'],
    activateWhen: () => true
  },
  {
    id: 'devops-architect',
    name: 'DevOps Architect',
    responsibilities: [
      'Definir la automatización de construcción, prueba y despliegue.',
      'Definir ambientes, infraestructura como código y gestión de secretos.',
      'Definir observabilidad y procedimientos de reversión.'
    ],
    inputs: ['Arquitectura', 'Despliegue declarado', 'Operación'],
    outputs: ['Plan de entrega continua', 'Definición de ambientes', 'Plan de observabilidad'],
    tools: ['architecture.propose', 'capacity.compute'],
    limits: ['No declara compatibilidad con un entorno sin verificarla.'],
    evaluation: ['El ambiente se reconstruye desde el repositorio sin pasos manuales no documentados.'],
    activateWhen: (config) => (config.classification?.deployment || []).some((d) => d !== 'local')
  },
  {
    id: 'ai-systems-architect',
    name: 'AI Systems Architect',
    responsibilities: [
      'Diseñar las capacidades asistidas por modelos con límites y evaluación.',
      'Definir barreras frente a inyección de instrucciones y contenido no confiable.',
      'Definir presupuesto de tokens, iteraciones y aprobaciones humanas.'
    ],
    inputs: ['Uso de IA declarado', 'Arquitectura', 'Sensibilidad de datos'],
    outputs: ['Diseño de la capa de modelos', 'Plan de evaluación', 'Controles de presupuesto y de permisos'],
    tools: ['catalog.get', 'compatibility.evaluate', 'capacity.compute'],
    limits: [
      'No afirma que ejecutó una herramienta sin evidencia del resultado.',
      'No deja una función asistida por modelo en la ruta crítica sin camino alternativo.',
      'No presenta salidas no deterministas como resultados verificados.'
    ],
    evaluation: ['Existen conjuntos de evaluación, umbrales y límites de presupuesto efectivos.'],
    activateWhen: (config) => Boolean(config.technology?.aiUsage?.enabled)
      || (config.classification?.systemTypes || []).some((t) => ['agent-platform', 'multi-agent', 'rag', 'llmops', 'mlops', 'harness', 'mcp-server'].includes(t))
  },
  {
    id: 'implementation-planner',
    name: 'Implementation Planner',
    responsibilities: [
      'Descomponer el trabajo en fases verificables con criterio de salida.',
      'Ordenar las fases por dependencia y por riesgo.',
      'Identificar lo que queda fuera de la primera entrega.'
    ],
    inputs: ['Requisitos', 'Arquitectura', 'Plan de evolución'],
    outputs: ['Plan de implementación por fases', 'Alcance explícito de la primera entrega'],
    tools: ['requirements.derive', 'architecture.propose', 'evolution.project'],
    limits: ['No bloquea la entrega inicial por funcionalidades futuras.'],
    evaluation: ['Cada fase tiene entregable y criterio de salida verificable.'],
    activateWhen: () => true
  },
  {
    id: 'qa-reviewer',
    name: 'QA Reviewer',
    responsibilities: [
      'Definir la estrategia de pruebas y los casos límite.',
      'Verificar la coherencia entre requisitos, pruebas y entregables.',
      'Revisar que nada se declare probado sin evidencia.'
    ],
    inputs: ['Requisitos', 'Arquitectura', 'Plan de implementación'],
    outputs: ['Plan de pruebas', 'Matriz de trazabilidad', 'Observaciones de coherencia'],
    tools: ['requirements.derive', 'config.validate', 'compatibility.evaluate'],
    limits: ['No aprueba entregables sin evidencia de ejecución.'],
    evaluation: ['Cada requisito del alcance tiene prueba o verificación documentada.'],
    activateWhen: () => true
  },
  {
    id: 'documentation-specialist',
    name: 'Documentation Specialist',
    responsibilities: [
      'Producir documentación técnica y pedagógica de lo realmente implementado.',
      'Mantener el glosario y el registro de limitaciones.',
      'Verificar que los ejemplos y comandos documentados funcionen.'
    ],
    inputs: ['Todos los artefactos producidos'],
    outputs: ['Documentación del sistema', 'Glosario', 'Registro de limitaciones'],
    tools: ['export.bundle'],
    limits: ['No documenta funcionalidades no implementadas como existentes.'],
    evaluation: ['Una persona ajena al desarrollo instala y usa el sistema siguiendo solo la documentación.'],
    activateWhen: () => true
  }
];

export const SUPERVISOR = {
  id: 'supervisor',
  name: 'System Architect Supervisor',
  responsibilities: [
    'Seleccionar únicamente los especialistas relevantes para la configuración.',
    'Repartir el trabajo evitando duplicación entre especialistas.',
    'Consolidar los resultados y resolver contradicciones entre ellos.',
    'Detener la ejecución cuando se alcanza el presupuesto o la condición de término.',
    'Elevar a revisión humana las decisiones de impacto.'
  ],
  inputs: ['Configuración', 'Resultado del motor determinista'],
  outputs: ['Especificación consolidada', 'Registro de decisiones y de contradicciones resueltas'],
  tools: ['config.validate', 'compatibility.evaluate', 'prompts.generate'],
  limits: [
    'No ejecuta todos los especialistas por defecto.',
    'No permite que dos especialistas produzcan el mismo artefacto.',
    'No sustituye la revisión humana de decisiones relevantes.',
    'No modifica repositorios sin autorización explícita.'
  ],
  evaluation: [
    'Solo se activaron especialistas con criterio de activación cumplido.',
    'No hay artefactos duplicados.',
    'Las decisiones de impacto quedaron marcadas para revisión humana.'
  ],
  requiresRuntime: 'Requiere un runtime de agentes compatible. Sin él, esta definición es una especificación ejecutable por una persona o por un harness externo.'
};

/** Selecciona los especialistas relevantes para una configuración. */
export function selectSpecialists(config) {
  return SPECIALISTS.filter((s) => (typeof s.activateWhen === 'function' ? s.activateWhen(config) : true));
}
