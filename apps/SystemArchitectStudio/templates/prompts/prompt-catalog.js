/**
 * Catálogo de plantillas de prompt, versionado.
 *
 * Cada entrada describe una disciplina: su objetivo, lo que entra y lo que no
 * entra en el alcance, los entregables, las pruebas exigidas, los criterios de
 * aceptación y la evidencia de finalización. El motor de prompts combina esta
 * plantilla con la configuración concreta, de modo que el prompt resultante
 * no sea aplicable indistintamente a cualquier sistema.
 */

/**
 * `appliesWhen` decide si la disciplina corresponde a la configuración.
 * Si falta, la plantilla aplica siempre.
 */
export const PROMPT_CATALOG = [
  {
    id: 'master',
    order: 1,
    name: 'Prompt maestro integral',
    discipline: 'Integración de todas las disciplinas',
    objective: 'Entregar el sistema completo descrito en la especificación, en fases verificables, sin romper lo existente.',
    scopeIn: [
      'Construcción o ampliación del sistema según el alcance declarado.',
      'Todas las disciplinas: requisitos, arquitectura, datos, backend, frontend, seguridad, pruebas, documentación, operación.',
      'Plan de fases con criterios de salida por fase.'
    ],
    scopeOut: [
      'Funcionalidades marcadas como planificadas y no incluidas en esta versión.',
      'Despliegue a producción y publicación de versiones, que requieren autorización explícita.'
    ],
    guidance: [
      'Antes de escribir código, inspeccione el repositorio objetivo y registre su estructura real, convenciones y pruebas existentes.',
      'Diferencie en todo momento entre implementado y probado, implementado sin validar, parcialmente implementado, planificado y no implementado.',
      'No presente botones inactivos ni respuestas simuladas como funcionalidad implementada.',
      'Los datos ficticios solo se admiten en fixtures de prueba identificados como tales.'
    ],
    deliverables: [
      'Código fuente funcional en el repositorio objetivo.',
      'Pruebas automatizadas que se ejecutan en el entorno del repositorio.',
      'Documentación que describa lo implementado realmente.',
      'Registro de limitaciones y decisiones pendientes.'
    ],
    tests: [
      'Suite de pruebas del repositorio ejecutada completa, con salida adjunta.',
      'Pruebas de regresión de las funcionalidades preexistentes.',
      'Verificación manual de los flujos principales, con el detalle de lo verificado.'
    ],
    acceptance: [
      'Todos los requisitos funcionales del alcance tienen una prueba o una verificación manual documentada.',
      'No existen regresiones conocidas en funcionalidades preexistentes.',
      'La documentación coincide con lo implementado.'
    ],
    evidence: [
      'Salida de la ejecución de pruebas.',
      'Lista de archivos creados y modificados.',
      'Resumen de lo que quedó fuera y por qué.'
    ]
  },
  {
    id: 'requirements',
    order: 2,
    name: 'Análisis de requisitos',
    discipline: 'Ingeniería de requisitos',
    objective: 'Convertir la configuración en requisitos verificables, con ambigüedades resueltas o registradas.',
    scopeIn: [
      'Requisitos funcionales con criterio de aceptación.',
      'Requisitos no funcionales medibles.',
      'Reglas de negocio, actores, roles y permisos.',
      'Trazabilidad entre requisito, prueba y entregable.'
    ],
    scopeOut: ['Diseño técnico y elección de tecnologías.'],
    guidance: [
      'Marque cada requisito como confirmado, supuesto o pendiente. Un supuesto no declarado es un defecto de análisis.',
      'No invente reglas de negocio: si falta información, formule la pregunta concreta que debe responder el responsable funcional.',
      'Cada requisito no funcional necesita magnitud, unidad y método de medición.'
    ],
    deliverables: [
      'Catálogo de requisitos funcionales con identificador y criterio de aceptación.',
      'Catálogo de requisitos no funcionales con umbral y método de verificación.',
      'Matriz de trazabilidad requisito a prueba.',
      'Lista de preguntas abiertas con responsable sugerido.'
    ],
    tests: ['Revisión de completitud: cada requisito tiene criterio de aceptación y al menos una prueba asociada.'],
    acceptance: [
      'Ningún requisito queda sin criterio de aceptación.',
      'Las ambigüedades están resueltas o registradas como pregunta abierta con responsable.'
    ],
    evidence: ['Catálogos de requisitos y matriz de trazabilidad en el repositorio.']
  },
  {
    id: 'architecture',
    order: 3,
    name: 'Arquitectura',
    discipline: 'Arquitectura de software',
    objective: 'Definir la arquitectura inicial justificada, con límites, contratos y condiciones de cambio.',
    scopeIn: [
      'Estilo arquitectónico con justificación medible.',
      'Componentes, responsabilidades y límites.',
      'Contratos de interfaz y su versionado.',
      'Dependencias críticas y estrategia de aislamiento.',
      'Registro de decisiones arquitectónicas.'
    ],
    scopeOut: ['Implementación de los componentes.'],
    guidance: [
      'Justifique cada decisión con un requisito o una magnitud, no con preferencia personal.',
      'No adelante infraestructura para necesidades no demostradas.',
      'Declare qué componentes son sustituibles y detrás de qué contrato.',
      'Escriba la condición observable que obligaría a rediseñar.'
    ],
    deliverables: [
      'Documento de arquitectura con diagrama de componentes y de despliegue.',
      'Registros de decisión arquitectónica para las decisiones estructurales.',
      'Especificación de contratos internos y públicos.',
      'Condiciones de rediseño documentadas.'
    ],
    tests: ['Prueba de arquitectura automatizada que verifique que no existan dependencias prohibidas entre módulos.'],
    acceptance: [
      'Cada componente tiene responsabilidad única y límite explícito.',
      'Cada decisión estructural tiene justificación trazable a un requisito o una medición.'
    ],
    evidence: ['Documento de arquitectura y registros de decisión en el repositorio.']
  },
  {
    id: 'data-model',
    order: 4,
    name: 'Modelado de datos',
    discipline: 'Ingeniería de datos',
    objective: 'Definir el modelo de datos, sus invariantes, su evolución y su estrategia de migración.',
    scopeIn: [
      'Modelo conceptual, lógico y físico.',
      'Claves, índices y restricciones de integridad.',
      'Estrategia de particionado y retención.',
      'Migraciones versionadas y reversibles.',
      'Modelo de datos personales y su ciclo de vida.'
    ],
    scopeOut: ['Modelos analíticos derivados, salvo que estén en el alcance.'],
    guidance: [
      'Las restricciones de integridad van en el motor de datos, no solo en la aplicación.',
      'Toda migración debe ser compatible hacia atrás y ejecutable sin detener el servicio, o declarar explícitamente su ventana.',
      'Identifique qué tablas crecerán sin cota y decida su particionado antes de la primera versión.'
    ],
    deliverables: [
      'Esquema con comentarios y diagrama entidad-relación.',
      'Scripts de migración versionados con su reversión.',
      'Documento de retención y supresión por categoría de dato.',
      'Datos de prueba sintéticos, nunca copias de datos reales de personas.'
    ],
    tests: [
      'Pruebas de integridad referencial y de restricciones.',
      'Prueba de migración hacia adelante y hacia atrás sobre un volumen representativo.',
      'Pruebas de consulta con el volumen proyectado, no con diez registros.'
    ],
    acceptance: [
      'Las migraciones se aplican y revierten sin pérdida de datos.',
      'Las consultas del camino crítico cumplen el objetivo de latencia con el volumen proyectado.'
    ],
    evidence: ['Salida de las pruebas de migración y de consulta con volumen.']
  },
  {
    id: 'backend',
    order: 5,
    name: 'Backend',
    discipline: 'Desarrollo backend',
    objective: 'Implementar el dominio y la API con las garantías de consistencia declaradas.',
    scopeIn: [
      'Casos de uso del dominio.',
      'Validación de entrada y manejo de errores.',
      'Transacciones e idempotencia.',
      'Autorización por operación.',
      'Instrumentación de métricas, registro y trazas.'
    ],
    scopeOut: ['Interfaz de usuario.'],
    guidance: [
      'El dominio no debe depender del framework de entrada ni del motor de persistencia.',
      'Toda operación que pueda reintentarse debe ser idempotente por un identificador de operación provisto por el cliente.',
      'Trate cada entrada como no confiable: valide tipo, rango y tamaño en el borde.',
      'No registre secretos ni datos personales innecesarios en los registros.'
    ],
    deliverables: [
      'Implementación de los casos de uso con pruebas unitarias.',
      'API documentada con su contrato publicado.',
      'Manejo de errores uniforme y trazable.',
      'Migraciones y datos de arranque necesarios.'
    ],
    tests: [
      'Pruebas unitarias del dominio sin infraestructura.',
      'Pruebas de integración sobre la API con base de datos real de prueba.',
      'Pruebas de autorización que verifican acceso permitido y denegado.',
      'Prueba de idempotencia con solicitudes duplicadas.'
    ],
    acceptance: [
      'La suite del dominio se ejecuta sin base de datos ni red.',
      'Cada endpoint tiene prueba de caso correcto, de error de validación y de acceso no autorizado.'
    ],
    evidence: ['Salida de la suite de pruebas y contrato de API publicado.']
  },
  {
    id: 'frontend',
    order: 6,
    name: 'Frontend',
    discipline: 'Desarrollo frontend',
    objective: 'Implementar la interfaz de las plataformas declaradas, accesible y utilizable.',
    scopeIn: [
      'Flujos principales de la interfaz.',
      'Estados de carga, error, vacío y éxito.',
      'Accesibilidad por teclado y con tecnología asistiva.',
      'Diseño adaptable a las plataformas declaradas.'
    ],
    scopeOut: ['Lógica de negocio, que pertenece al dominio.'],
    guidance: [
      'No muestre controles que no hacen nada: un control visible debe ejecutar una acción real.',
      'Todo estado de error debe ser comprensible y accionable para la persona que lo ve.',
      'Nunca inserte contenido provisto por el usuario como HTML sin escapar.',
      'Verifique el recorrido completo con teclado antes de declarar el flujo terminado.'
    ],
    deliverables: [
      'Vistas y componentes de los flujos del alcance.',
      'Manejo explícito de los cuatro estados en cada vista con datos.',
      'Verificación de accesibilidad de los flujos principales.'
    ],
    tests: [
      'Pruebas de componente de los estados de cada vista.',
      'Recorrido completo por teclado de los flujos principales.',
      'Verificación de contraste y textos alternativos.',
      'Prueba en el ancho mínimo de pantalla declarado.'
    ],
    acceptance: [
      'Ningún control queda inactivo sin explicación visible.',
      'Los flujos principales se completan solo con teclado.'
    ],
    evidence: ['Capturas o grabaciones de los flujos y resultado de la verificación de accesibilidad.']
  },
  {
    id: 'api-integration',
    order: 7,
    name: 'APIs e integraciones',
    discipline: 'Integración de sistemas',
    objective: 'Definir e implementar los contratos con sistemas externos, con comportamiento degradado explícito.',
    scopeIn: [
      'Contrato por cada integración declarada.',
      'Tiempos de espera, reintentos, cortacircuitos y colas de mensajes fallidos.',
      'Idempotencia y conciliación.',
      'Simuladores de contraparte para pruebas.'
    ],
    scopeOut: ['Cambios en los sistemas de la contraparte.'],
    guidance: [
      'Para cada integración, escriba qué ocurre cuando la contraparte responde lento, responde error o no responde.',
      'Asuma entrega duplicada y desordenada en toda integración asincrónica.',
      'No ponga una dependencia externa en la ruta crítica sin camino alternativo o degradación aceptada.',
      'Nunca confíe en la entrada recibida de un tercero: valídela contra el esquema.'
    ],
    deliverables: [
      'Contratos publicados de las interfaces propias.',
      'Adaptadores por contraparte con política de fallo documentada.',
      'Simuladores para pruebas automatizadas.',
      'Procedimiento de conciliación.'
    ],
    tests: [
      'Pruebas de contrato contra el esquema.',
      'Pruebas con contraparte lenta, con error y no disponible.',
      'Prueba de entrega duplicada y fuera de orden.'
    ],
    acceptance: ['Ninguna integración puede provocar la caída del sistema completo.'],
    evidence: ['Resultado de las pruebas de fallo de dependencia.']
  },
  {
    id: 'security',
    order: 8,
    name: 'Seguridad',
    discipline: 'Ciberseguridad',
    objective: 'Implementar y verificar los controles de seguridad exigidos por la sensibilidad de los datos.',
    scopeIn: [
      'Autenticación y autorización.',
      'Gestión de secretos.',
      'Cifrado en tránsito y en reposo.',
      'Validación de entrada y protección frente a inyección y a ejecución de código.',
      'Registro de auditoría.',
      'Modelado de amenazas.'
    ],
    scopeOut: ['Pruebas de intrusión contratadas a terceros, si no están en el alcance.'],
    guidance: [
      'Mínimo privilegio en todos los accesos, incluidos los de servicio.',
      'Ningún secreto en el repositorio ni en su historial; un secreto filtrado se rota, no se borra.',
      'No use evaluación dinámica de texto provisto por el usuario bajo ninguna circunstancia.',
      'Declare qué quedó fuera del análisis: lo que no se revisó no está aprobado, está sin evaluar.'
    ],
    deliverables: [
      'Modelo de amenazas con controles asociados.',
      'Matriz de permisos por rol y operación.',
      'Controles implementados y verificados.',
      'Informe de análisis de dependencias y de secretos, con su cobertura real.'
    ],
    tests: [
      'Pruebas de autorización negativa por rol.',
      'Análisis estático y de dependencias en la construcción.',
      'Detección de secretos en el código y en el historial.',
      'Pruebas de validación de entrada con valores límite y hostiles.'
    ],
    acceptance: [
      'Sin hallazgos críticos abiertos ni secretos en el repositorio.',
      'Cada operación sensible tiene prueba de acceso denegado.'
    ],
    evidence: ['Informes de análisis con su alcance declarado y salida de las pruebas de autorización.']
  },
  {
    id: 'privacy',
    order: 9,
    name: 'Privacidad',
    discipline: 'Protección de datos',
    objective: 'Garantizar el tratamiento mínimo, justificado y limitado en el tiempo de los datos personales.',
    scopeIn: [
      'Inventario de datos personales con finalidad y base legal declarada.',
      'Minimización y seudonimización.',
      'Plazos de conservación y supresión.',
      'Derechos de las personas y su atención.',
      'Registro de consentimiento cuando corresponde.'
    ],
    scopeOut: ['Dictamen legal de cumplimiento, que requiere asesoría jurídica propia.'],
    guidance: [
      'Seleccionar una jurisdicción no otorga cumplimiento: registre cada obligación como verificable y pendiente de validación legal.',
      'No transmita datos a proveedores externos sin autorización explícita y registrada.',
      'La supresión debe alcanzar copias, respaldos, registros y cachés, o declarar explícitamente su límite.',
      'Si hay datos de menores o de categoría especial, el consentimiento y el resguardo son requisitos previos.'
    ],
    deliverables: [
      'Inventario de datos personales por categoría, finalidad y plazo.',
      'Procedimiento de supresión y anonimización verificado.',
      'Flujo de atención de derechos.',
      'Evaluación de impacto cuando el tratamiento lo requiera.'
    ],
    tests: [
      'Prueba funcional de supresión que verifica la eliminación efectiva en todos los almacenes.',
      'Verificación de que los registros de aplicación no contienen datos personales innecesarios.'
    ],
    acceptance: ['Cada categoría de dato personal tiene finalidad, base declarada y plazo de conservación.'],
    evidence: ['Inventario de datos y resultado de la prueba de supresión.']
  },
  {
    id: 'scalability',
    order: 10,
    name: 'Escalabilidad',
    discipline: 'Ingeniería de rendimiento y capacidad',
    objective: 'Verificar empíricamente la capacidad y preparar el escalado de los componentes con contención.',
    scopeIn: [
      'Pruebas de carga, resistencia y saturación.',
      'Identificación del cuello de botella real.',
      'Estrategia de escalado por componente.',
      'Degradación controlada y admisión limitada.'
    ],
    scopeOut: ['Escalado especulativo de componentes sin contención medida.'],
    guidance: [
      'Las cifras de dimensionamiento son hipótesis hasta que se miden: no las presente como capacidad verificada.',
      'Mida por percentiles, no por promedios.',
      'Pruebe hasta el rechazo para conocer el límite y verificar que la degradación sea controlada.',
      'Documente el perfil de carga usado: sin él los resultados no son comparables.'
    ],
    deliverables: [
      'Guiones de prueba de carga versionados en el repositorio.',
      'Informe con perfil de carga, resultados por percentil y límite encontrado.',
      'Plan de escalado por componente con su disparador.',
      'Mecanismo de degradación y de admisión controlada.'
    ],
    tests: [
      'Carga sostenida al nivel de pico proyectado.',
      'Resistencia prolongada para detectar degradación acumulada.',
      'Saturación hasta el rechazo.',
      'Prueba del pico estacional cuando exista.'
    ],
    acceptance: [
      'El objetivo de latencia por percentil se cumple a la carga de pico proyectada.',
      'Al superar el límite el sistema degrada de forma controlada y no cae por completo.'
    ],
    evidence: ['Informe de pruebas de carga con datos crudos y perfil de carga declarado.']
  },
  {
    id: 'evolution',
    order: 11,
    name: 'Evolución temporal',
    discipline: 'Arquitectura evolutiva',
    objective: 'Dejar el sistema preparado para los cambios proyectados sin anticipar complejidad innecesaria.',
    scopeIn: [
      'Plan de evolución por etapas con condiciones de entrada y salida.',
      'Puntos de extensión y componentes sustituibles.',
      'Plan de revisión arquitectónica con indicadores y umbrales.',
      'Gestión de obsolescencia.'
    ],
    scopeOut: ['Implementación de las etapas futuras.'],
    guidance: [
      'Cada etapa debe justificarse con una condición observable, no con una fecha arbitraria.',
      'No construya hoy la arquitectura de la etapa final: construya los contratos que permitan llegar a ella.',
      'Incluya los escenarios de estancamiento y de disminución, no solo de crecimiento.',
      'Ninguna arquitectura es infinitamente escalable: escriba su límite conocido.'
    ],
    deliverables: [
      'Plan de evolución con etapas, hitos y condiciones.',
      'Inventario de componentes con fecha de soporte.',
      'Plan de revisión arquitectónica con frecuencia e indicadores.',
      'Criterios de migración y de rediseño.'
    ],
    tests: ['Verificación de que cada punto de extensión declarado tiene un contrato real y una prueba que lo ejercita.'],
    acceptance: ['Cada hito tiene indicador, umbral y decisión asociada.'],
    evidence: ['Plan de evolución y plan de revisión en el repositorio.']
  },
  {
    id: 'infrastructure',
    order: 12,
    name: 'Infraestructura',
    discipline: 'Infraestructura y plataforma',
    objective: 'Describir y aprovisionar la infraestructura de forma reproducible y auditable.',
    scopeIn: [
      'Infraestructura como código para todos los ambientes.',
      'Redes, aislamiento y permisos.',
      'Gestión de secretos y de configuración.',
      'Respaldos y su verificación.'
    ],
    scopeOut: ['Aprovisionamiento manual no reproducible.'],
    guidance: [
      'Todo recurso debe estar descrito en código y versionado; el cambio manual en consola se detecta y se corrige.',
      'Fije versiones de imágenes y módulos: sin fijación la construcción no es reproducible.',
      'El estado de la infraestructura es un activo sensible: cifrado y con bloqueo.',
      'No declare compatibilidad con un entorno que no se verificó.'
    ],
    deliverables: [
      'Definiciones de infraestructura por ambiente.',
      'Procedimiento de aprovisionamiento desde cero.',
      'Política de respaldos con ensayo de restauración.',
      'Inventario de recursos y su costo estimado.'
    ],
    tests: [
      'Aprovisionamiento completo desde cero en un ambiente limpio.',
      'Detección de desvío de configuración.',
      'Ensayo de restauración desde respaldo, cronometrado.'
    ],
    acceptance: ['El ambiente se reconstruye completo desde el repositorio sin pasos manuales no documentados.'],
    evidence: ['Salida del aprovisionamiento y del ensayo de restauración.']
  },
  {
    id: 'cicd',
    order: 13,
    name: 'Integración y entrega continua',
    discipline: 'DevOps',
    objective: 'Automatizar construcción, prueba y despliegue con trazabilidad del artefacto.',
    scopeIn: [
      'Construcción reproducible.',
      'Ejecución de la suite de pruebas y de los controles de calidad.',
      'Despliegue por ambientes con aprobaciones.',
      'Reversión y procedencia del artefacto.'
    ],
    scopeOut: ['Despliegue automático a producción sin autorización explícita.'],
    guidance: [
      'La cadena de construcción es un objetivo de ataque de alto valor: mínimo privilegio y secretos de alcance acotado.',
      'Fije las versiones de las acciones y dependencias usadas en la automatización.',
      'Un control de calidad que se desactiva para avanzar deja de ser un control: ajústelo en lugar de saltarlo.',
      'No declare un flujo como funcionando sin haberlo ejecutado.'
    ],
    deliverables: [
      'Definición de la automatización en el repositorio.',
      'Controles de calidad obligatorios antes de la fusión.',
      'Procedimiento de reversión documentado.',
      'Inventario de componentes del artefacto.'
    ],
    tests: [
      'Ejecución completa de la automatización en una rama de prueba.',
      'Prueba de reversión a la versión anterior.'
    ],
    acceptance: ['Un cambio llega del repositorio al ambiente de prueba sin intervención manual, y puede revertirse.'],
    evidence: ['Registro de ejecución de la automatización.']
  },
  {
    id: 'observability',
    order: 14,
    name: 'Observabilidad',
    discipline: 'Ingeniería de confiabilidad',
    objective: 'Instrumentar el sistema para poder responder qué está ocurriendo y qué ocurrió.',
    scopeIn: [
      'Métricas, registro estructurado y trazas correlacionadas.',
      'Indicadores de nivel de servicio y presupuesto de error.',
      'Alertas accionables.',
      'Tableros operativos.'
    ],
    scopeOut: ['Alertas sin acción asociada.'],
    guidance: [
      'Cada alerta debe indicar qué hacer; una alerta no accionable entrena al equipo a ignorarlas.',
      'Depure datos personales y secretos antes de almacenar registros.',
      'Correlacione con un identificador único por operación de extremo a extremo.',
      'Defina el costo aceptable de la telemetría y la política de muestreo y retención.'
    ],
    deliverables: [
      'Instrumentación de las operaciones críticas.',
      'Definición de indicadores de nivel de servicio con su método de cálculo.',
      'Reglas de alerta con procedimiento de respuesta.',
      'Tableros de operación.'
    ],
    tests: [
      'Ejercicio de diagnóstico sobre un incidente simulado usando solo la telemetría.',
      'Verificación de que los registros no contienen secretos ni datos personales innecesarios.'
    ],
    acceptance: ['Una operación completa se reconstruye por su identificador de correlación.'],
    evidence: ['Resultado del ejercicio de diagnóstico.']
  },
  {
    id: 'testing',
    order: 15,
    name: 'Testing',
    discipline: 'Aseguramiento de calidad',
    objective: 'Construir una suite de pruebas que permita cambiar el sistema con confianza.',
    scopeIn: [
      'Pruebas unitarias, de integración y de extremo a extremo de los flujos críticos.',
      'Pruebas de casos límite, valores inválidos y caracteres Unicode.',
      'Datos de prueba sintéticos.',
      'Pruebas de regresión de los defectos corregidos.'
    ],
    scopeOut: ['Pruebas manuales exploratorias no documentadas como evidencia de aceptación.'],
    guidance: [
      'No declare pruebas aprobadas sin ejecutarlas: adjunte la salida.',
      'Una suite lenta o inestable deja de ejecutarse y pierde su función.',
      'Incluya pruebas de caso vacío, caso típico y caso muy grande, distinguiendo cantidad de elementos de tamaño en bytes.',
      'Los datos de prueba derivados de producción deben anonimizarse antes de usarse.'
    ],
    deliverables: [
      'Suite de pruebas automatizadas integrada en la automatización del repositorio.',
      'Fixtures sintéticos identificados como tales.',
      'Informe de cobertura declarando qué quedó fuera.',
      'Pruebas de regresión por cada defecto corregido.'
    ],
    tests: [
      'Ejecución completa de la suite con su salida adjunta.',
      'Verificación de que la suite falla cuando se introduce un defecto deliberado.'
    ],
    acceptance: [
      'Toda la suite pasa en el entorno del repositorio.',
      'Cada flujo crítico tiene al menos una prueba automatizada.'
    ],
    evidence: ['Salida completa de la ejecución de pruebas.']
  },
  {
    id: 'documentation',
    order: 16,
    name: 'Documentación',
    discipline: 'Documentación técnica',
    objective: 'Documentar lo implementado realmente, en lenguaje técnico y pedagógico.',
    scopeIn: [
      'Guía de instalación y ejecución local.',
      'Manual de uso de los flujos principales.',
      'Documentación de arquitectura y de contratos.',
      'Glosario y registro de limitaciones.'
    ],
    scopeOut: ['Documentar funcionalidades no implementadas como si existieran.'],
    guidance: [
      'La documentación debe reflejar el estado real: diferencie implementado, parcial y planificado.',
      'Incluya ejemplos progresivos, desde el caso más simple hasta uno complejo.',
      'Explique las fórmulas y los conceptos, no solo los parámetros.',
      'Verifique cada comando documentado ejecutándolo.'
    ],
    deliverables: [
      'README del componente con instalación, uso y limitaciones.',
      'Documentación de arquitectura y de contratos.',
      'Glosario de términos del dominio.',
      'Registro de limitaciones conocidas.'
    ],
    tests: ['Verificación de que los comandos y ejemplos documentados se ejecutan tal como están escritos.'],
    acceptance: ['Una persona que no participó del desarrollo instala y usa el sistema siguiendo solo la documentación.'],
    evidence: ['Resultado de la verificación de los comandos documentados.']
  },
  {
    id: 'migrations',
    order: 17,
    name: 'Migraciones',
    discipline: 'Migración de datos y esquemas',
    objective: 'Ejecutar migraciones reversibles y verificables sin pérdida de datos.',
    scopeIn: [
      'Migraciones de esquema en fases compatibles.',
      'Migración de datos por lotes con punto de control.',
      'Verificación de conteos e integridad posterior.',
      'Plan de reversión.'
    ],
    scopeOut: ['Migraciones destructivas sin respaldo verificado previo.'],
    guidance: [
      'Primero expandir, luego migrar, luego contraer: nunca los tres en el mismo despliegue.',
      'Toda migración por lotes debe ser reanudable desde el último punto de control.',
      'Verifique el resultado con conteos y muestreo, no solo con la ausencia de error.',
      'Si una fase no es reversible, declárelo antes de ejecutarla y obtenga aprobación.'
    ],
    deliverables: [
      'Scripts de migración y de reversión versionados.',
      'Procedimiento de ejecución con punto de control.',
      'Informe de verificación posterior.'
    ],
    tests: [
      'Migración completa sobre una copia de volumen representativo, cronometrada.',
      'Reversión verificada.',
      'Verificación de integridad y de conteos posterior a la migración.'
    ],
    acceptance: ['La migración se completa dentro de la ventana declarada y es reversible.'],
    evidence: ['Informe de ejecución con tiempos y conteos.']
  },
  {
    id: 'operations',
    order: 18,
    name: 'Operación y soporte',
    discipline: 'Operación',
    objective: 'Dejar el sistema operable por personas distintas de quienes lo construyeron.',
    scopeIn: [
      'Manual de operación con procedimientos.',
      'Respuesta a incidentes y escalamiento.',
      'Tareas periódicas y su automatización.',
      'Procedimiento de operación degradada.'
    ],
    scopeOut: ['Contratación de personal de operación.'],
    guidance: [
      'Cada alerta debe tener un procedimiento escrito asociado.',
      'Documente el procedimiento de contingencia, incluido el manual si el dominio lo exige.',
      'Registre los límites conocidos del sistema para que quien opera sepa cuándo escalar.'
    ],
    deliverables: [
      'Manual de operación con procedimientos paso a paso.',
      'Procedimientos de respuesta por tipo de alerta.',
      'Calendario de tareas periódicas.',
      'Plan de contingencia.'
    ],
    tests: ['Ejecución de un simulacro de incidente siguiendo únicamente el manual.'],
    acceptance: ['Una persona del equipo de operación resuelve un incidente simulado siguiendo el manual.'],
    evidence: ['Informe del simulacro.']
  },
  {
    id: 'audit',
    order: 19,
    name: 'Auditoría',
    discipline: 'Auditoría y cumplimiento',
    objective: 'Garantizar la trazabilidad de las acciones y de las decisiones del sistema.',
    scopeIn: [
      'Registro inmutable de acciones sobre datos sensibles.',
      'Trazabilidad de las decisiones automatizadas y de la versión de regla aplicada.',
      'Retención del registro de auditoría.',
      'Informes para auditoría.'
    ],
    scopeOut: ['Dictamen de auditoría externa.'],
    guidance: [
      'El registro de auditoría no debe poder modificarse desde la aplicación.',
      'Registre quién, qué, cuándo, sobre qué dato y con qué versión de regla.',
      'La retención del registro suele ser mayor que la del dato operacional.',
      'Registrar un control no demuestra que se ejecute: la evidencia es el objeto de valor.'
    ],
    deliverables: [
      'Registro de auditoría implementado con su retención.',
      'Informes de auditoría exportables.',
      'Documentación de qué se registra y qué no, y por qué.'
    ],
    tests: [
      'Verificación de que las acciones sensibles generan registro.',
      'Verificación de que el registro no puede alterarse desde la aplicación.'
    ],
    acceptance: ['Toda acción sobre datos sensibles es atribuible a una identidad y a un momento.'],
    evidence: ['Muestra del registro de auditoría y resultado de las pruebas de inmutabilidad.']
  },
  {
    id: 'maintenance',
    order: 20,
    name: 'Mantenimiento',
    discipline: 'Mantenimiento y sostenibilidad',
    objective: 'Sostener el sistema en el tiempo controlando deuda técnica y obsolescencia.',
    scopeIn: [
      'Política de actualización de dependencias.',
      'Gestión de deuda técnica registrada.',
      'Revisión periódica de arquitectura y de costo.',
      'Retiro de funcionalidad obsoleta.'
    ],
    scopeOut: ['Desarrollo de nuevas funcionalidades.'],
    guidance: [
      'Fije versiones y actualice en ventanas periódicas: ni versiones flotantes ni congelamiento indefinido.',
      'La deuda técnica no registrada no se paga: anótela con su costo y su riesgo.',
      'El retiro de una capacidad pasa por obsolescencia anunciada, convivencia y retiro verificado.'
    ],
    deliverables: [
      'Política de actualización con su calendario.',
      'Registro de deuda técnica priorizado.',
      'Calendario de revisión de arquitectura y de costo.',
      'Procedimiento de retiro de funcionalidad.'
    ],
    tests: ['Verificación de que la actualización de dependencias no rompe la suite de pruebas.'],
    acceptance: ['Existe un calendario de revisión con responsables y un registro de deuda técnica vigente.'],
    evidence: ['Registro de deuda técnica y calendario de revisión en el repositorio.']
  }
];

/** Prompts adicionales que solo aplican cuando la configuración lo justifica. */
export const CONDITIONAL_PROMPTS = [
  {
    id: 'ai-engineering',
    order: 21,
    name: 'Ingeniería de IA',
    discipline: 'Ingeniería de inteligencia artificial',
    appliesWhen: (config) => Boolean(config.technology?.aiUsage?.enabled),
    objective: 'Incorporar capacidades asistidas por modelos con evaluación, límites y trazabilidad.',
    scopeIn: [
      'Plantillas de instrucción versionadas.',
      'Conjuntos de evaluación y umbrales de aceptación.',
      'Límites de presupuesto y de iteraciones.',
      'Barreras de entrada y de salida.',
      'Trazas y registro de la versión de modelo aplicada.'
    ],
    scopeOut: ['Entrenamiento de modelos propios, si no está en el alcance.'],
    guidance: [
      'La salida no es determinista: valide con conjuntos de evaluación, no con casos anecdóticos.',
      'Trate todo contenido recuperado o provisto por terceros como entrada no confiable: puede contener instrucciones inyectadas.',
      'Nunca afirme que una herramienta se ejecutó sin la evidencia de su resultado real.',
      'La función asistida por modelo no debe quedar en la ruta crítica sin camino alternativo determinista.'
    ],
    deliverables: [
      'Plantillas versionadas con su historial de evaluación.',
      'Conjuntos de evaluación con métricas y variabilidad reportada.',
      'Controles de presupuesto y de iteraciones.',
      'Registro de trazas con la versión de modelo y de plantilla.'
    ],
    tests: [
      'Ejecución de los conjuntos de evaluación con reporte de métrica y variabilidad.',
      'Pruebas de inyección de instrucciones en el contenido de entrada.',
      'Verificación de los límites de presupuesto y de iteraciones.'
    ],
    acceptance: [
      'Existe una medición comparable entre versiones de plantilla o de modelo.',
      'Los límites de presupuesto y de iteraciones son efectivos y verificados.'
    ],
    evidence: ['Resultados de las evaluaciones con su variabilidad y registro de los límites aplicados.']
  },
  {
    id: 'legacy-integration',
    order: 22,
    name: 'Ampliación de sistema existente',
    discipline: 'Evolución de sistemas en producción',
    appliesWhen: (config) => config.identity?.mode === 'existing',
    objective: 'Ampliar un sistema en producción sin alterar su comportamiento previo.',
    scopeIn: [
      'Inspección del repositorio, del propósito original y de las funcionalidades actuales.',
      'Análisis de dependencias y de restricciones.',
      'Evaluación de impacto del cambio.',
      'Implementación incremental y verificación de regresiones.'
    ],
    scopeOut: [
      'Reescritura completa.',
      'Sustitución de tecnologías por preferencia.',
      'Reestructuración global no exigida por el cambio.'
    ],
    guidance: [
      'Antes de escribir código: inspeccione la estructura real, lea la documentación existente y ejecute las pruebas que ya existen.',
      'Identifique el propósito original del sistema y respételo.',
      'No destruya funcionalidades preexistentes ni renombre lo que ya está en uso.',
      'Refactorizar no es reescribir: cambie lo mínimo necesario y justifique cada cambio estructural.',
      'Reutilice los patrones y las convenciones del repositorio antes de introducir nuevos.',
      'Conserve los cambios no confirmados que encuentre y nunca sobrescriba trabajo ajeno.'
    ],
    deliverables: [
      'Diagnóstico del sistema actual: estructura, convenciones, dependencias y pruebas.',
      'Análisis de impacto del cambio propuesto.',
      'Implementación incremental con pruebas de regresión.',
      'Lista de archivos modificados con la justificación de cada cambio.'
    ],
    tests: [
      'Suite preexistente ejecutada antes y después del cambio, con ambas salidas.',
      'Pruebas de regresión de las funcionalidades que podrían verse afectadas.',
      'Verificación manual de los flujos preexistentes principales.'
    ],
    acceptance: [
      'La suite preexistente pasa igual o mejor que antes del cambio.',
      'No hay cambios en contratos públicos sin justificación declarada.',
      'Ninguna funcionalidad previa quedó inoperativa.'
    ],
    evidence: ['Salidas de la suite antes y después, y lista de archivos modificados con justificación.']
  }
];

/** Devuelve las plantillas aplicables a una configuración. */
export function selectTemplates(config, requestedIds) {
  const all = [...PROMPT_CATALOG, ...CONDITIONAL_PROMPTS];
  const applicable = all.filter((t) => (typeof t.appliesWhen === 'function' ? t.appliesWhen(config) : true));
  if (Array.isArray(requestedIds) && requestedIds.length) {
    const wanted = new Set(requestedIds);
    return applicable.filter((t) => wanted.has(t.id)).sort((a, b) => a.order - b.order);
  }
  return applicable.sort((a, b) => a.order - b.order);
}
