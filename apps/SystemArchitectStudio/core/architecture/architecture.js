/**
 * Motor de arquitectura.
 *
 * Propone una arquitectura inicial justificada, con límites de componentes,
 * contratos de interfaz, dependencias críticas, componentes sustituibles,
 * estrategia de migraciones, versionado, gestión de obsolescencia,
 * procedimientos de recuperación y condiciones para rediseñar.
 *
 * La propuesta se deriva del catálogo y del dimensionamiento. No se adelanta
 * complejidad para necesidades no demostradas: cuando el motor recomienda algo
 * más simple que lo declarado por el usuario, lo dice y explica por qué.
 */

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Selecciona el estilo arquitectónico inicial recomendado. */
export function recommendStyle(config, capacity) {
  const declared = config.classification?.architecture || [];
  const types = config.classification?.systemTypes || [];
  const peak = capacity?.derived?.peakConcurrency || 0;
  const rps = capacity?.derived?.peakRps || 0;
  const team = num(config.operations?.teamSize);
  const reasons = [];

  // Dominios con determinismo o tiempo real: el estilo lo impone el dominio,
  // pero solo cuando ese dominio es el que define el sistema. Un componente
  // analítico dentro de un sistema mayor no cambia el estilo del conjunto.
  const dominates = (group) => {
    if (!types.length) return false;
    const matches = types.filter((t) => group.includes(t));
    if (!matches.length) return false;
    return group.includes(types[0]) || matches.length * 2 > types.length;
  };

  // El control de proceso es una restricción dura: su presencia determina el
  // estilo aunque no sea el tipo predominante, porque la planta no puede
  // detenerse por la caída de un enlace.
  if (types.some((t) => ['scada', 'dcs', 'wcs', 'robotics', 'telemetry-space'].includes(t))) {
    reasons.push('Hay control de proceso o de equipos físicos en el alcance: exige determinismo y continuidad local, con independencia de la carga declarada.');
    return { recommended: 'distributed', label: 'Control local distribuido con supervisión central', reasons };
  }
  if (dominates(['iot', 'iiot', 'data-platform', 'etl-platform', 'bioinformatics'])) {
    reasons.push('El sistema predominante procesa flujos de datos de alto volumen: la organización natural es por etapas de transformación.');
    return { recommended: 'pipeline', label: 'Pipeline de datos con etapas desacopladas', reasons };
  }

  if (declared.length) {
    reasons.push(`Estilo declarado por el usuario: ${declared.join(', ')}.`);
  }

  if (rps === 0 && peak === 0) {
    reasons.push('Sin magnitudes de uso declaradas no hay base para justificar un estilo distribuido.');
    return { recommended: 'modular-monolith', label: 'Monolito modular', reasons };
  }

  if (peak > 5000 || rps > 2000) {
    if (team >= 10) {
      reasons.push(`Carga alta (${Math.round(peak)} sesiones concurrentes, ${rps} req/s) y equipo de ${team} personas: hay base para autonomía de despliegue por capacidad.`);
      return { recommended: 'microservices', label: 'Servicios por capacidad de negocio', reasons };
    }
    reasons.push(`Carga alta (${rps} req/s) pero equipo de ${team || 'tamaño no declarado'}: el costo operacional de servicios independientes recaería en muy pocas personas.`);
    reasons.push('Se recomienda monolito modular escalado horizontalmente, con los módulos de mayor carga preparados para extracción.');
    return { recommended: 'modular-monolith', label: 'Monolito modular escalado horizontalmente', reasons };
  }

  reasons.push(`Carga inicial moderada (${rps} req/s en pico): un desplegable único con límites de módulo explícitos reduce el costo operacional sin cerrar la puerta a extraer servicios después.`);
  return { recommended: 'modular-monolith', label: 'Monolito modular', reasons };
}

/** Componentes derivados de los tipos de sistema y del dimensionamiento. */
export function deriveComponents(config, catalog, capacity) {
  const components = [];
  const types = config.classification?.systemTypes || [];
  const d = capacity?.derived || {};

  components.push({
    id: 'interface',
    name: 'Capa de interfaz',
    responsibility: 'Presentación, validación de entrada y traducción al contrato del dominio.',
    boundary: 'No contiene reglas de negocio ni accede directamente a la persistencia.',
    scaling: 'Horizontal, sin estado.'
  });

  components.push({
    id: 'domain',
    name: 'Núcleo de dominio',
    responsibility: 'Reglas de negocio, invariantes y casos de uso.',
    boundary: 'No conoce el medio de entrada ni el motor de persistencia; se prueba sin infraestructura.',
    scaling: 'Horizontal si no mantiene estado en memoria.'
  });

  components.push({
    id: 'persistence',
    name: 'Persistencia autoritativa',
    responsibility: 'Almacenar el estado del sistema con las garantías de consistencia requeridas.',
    boundary: 'Único propietario del esquema; nadie más escribe directamente en él.',
    scaling: `Vertical primero; particionado cuando la escritura (${d.writesPerSecond || 0}/s estimadas) se acerque al límite medido.`
  });

  if ((d.readsPerSecond || 0) > 50 || (capacity?.inputs?.readWriteRatio || 0) >= 10) {
    components.push({
      id: 'cache',
      name: 'Caché de lectura',
      responsibility: 'Servir el conjunto caliente de consultas repetidas.',
      boundary: 'Invalidación explícita desde el dominio; nunca es fuente de verdad.',
      scaling: `Memoria estimada ${d.cacheMb || 0} MB; aumentar solo si la tasa de acierto lo justifica.`
    });
  }

  if (num(config.capacity?.backgroundJobsPerDay) > 0 || types.some((t) => ['etl-platform', 'mlops', 'llmops', 'utility-billing', 'scoring-engine'].includes(t))) {
    components.push({
      id: 'async',
      name: 'Procesamiento asíncrono',
      responsibility: 'Ejecutar trabajo diferido, por lotes o de larga duración fuera de la ruta de solicitud.',
      boundary: 'Consumidores idempotentes; cola de mensajes fallidos obligatoria.',
      scaling: 'Por número de trabajadores según profundidad de cola.'
    });
  }

  if ((config.functional?.integrations || []).length || (config.classification?.integrationStyle || []).length) {
    components.push({
      id: 'integration',
      name: 'Adaptadores de integración',
      responsibility: 'Traducir entre el contrato propio y el de cada sistema externo.',
      boundary: 'Un adaptador por contraparte, con tiempo de espera, reintento y comportamiento degradado propios.',
      scaling: 'Independiente por adaptador; una contraparte lenta no debe bloquear las demás.'
    });
  }

  if (config.security?.auditTrail || types.some((t) => ['ledger', 'core-banking', 'judicial', 'ehr', 'public-records', 'law-enforcement', 'tax-administration'].includes(t))) {
    components.push({
      id: 'audit',
      name: 'Registro de auditoría',
      responsibility: 'Registrar de forma inmutable quién hizo qué, cuándo y sobre qué dato.',
      boundary: 'Solo escritura desde el dominio; su borrado no está disponible para la aplicación.',
      scaling: 'Almacenamiento de solo anexado, con retención propia independiente del dato operacional.'
    });
  }

  if (config.technology?.aiUsage?.enabled) {
    components.push({
      id: 'ai-gateway',
      name: 'Pasarela de modelos',
      responsibility: 'Mediar el acceso a modelos: plantillas versionadas, límites de presupuesto, barreras de entrada y salida, trazas.',
      boundary: 'Único punto de salida hacia proveedores de inferencia; el dominio no habla directamente con el modelo.',
      scaling: `Presupuesto diario estimado ${d.tokensPerDay || 0} tokens; límite por usuario y por operación obligatorio.`
    });
  }

  if ((config.capacity?.regions || []).length > 1) {
    components.push({
      id: 'regional-routing',
      name: 'Enrutamiento regional',
      responsibility: 'Dirigir cada solicitud a la región que corresponde según residencia del dato y cercanía.',
      boundary: 'La decisión de región es explícita y auditable; no se infiere de la red.',
      scaling: 'Por región, con capacidad independiente.'
    });
  }

  // Componentes propios de los tipos elegidos, derivados del catálogo.
  for (const id of types) {
    const system = catalog?.getSystem?.(id);
    if (!system) continue;
    components.push({
      id: `domain-${id}`,
      name: `Módulo ${system.acronym} — ${system.canonicalName}`,
      responsibility: (system.capabilities || []).slice(0, 5).join('; ') || 'Capacidades declaradas por el usuario.',
      boundary: `Expone su contrato propio; las restricciones conocidas del tipo (${(system.constraints || []).length}) deben verificarse en pruebas.`,
      scaling: 'Según la carga de su propio camino crítico, no la del sistema completo.'
    });
  }

  return components;
}

/** Contratos de interfaz entre componentes. */
export function deriveContracts(config, components) {
  const styles = config.classification?.integrationStyle || [];
  const contracts = [];

  contracts.push({
    id: 'interface-domain',
    from: 'interface',
    to: 'domain',
    kind: 'interno',
    description: 'Casos de uso con entrada validada y salida tipada. Sin tipos del framework de presentación.',
    versioning: 'Cambios compatibles hacia atrás dentro de una misma versión mayor del módulo.'
  });

  contracts.push({
    id: 'domain-persistence',
    from: 'domain',
    to: 'persistence',
    kind: 'interno',
    description: 'Repositorios con operaciones de dominio. El dominio no conoce dialectos de consulta.',
    versioning: 'Las migraciones de esquema son compatibles hacia atrás en dos fases: expandir y luego contraer.'
  });

  if (styles.includes('rest') || styles.length === 0) {
    contracts.push({
      id: 'public-api',
      from: 'clientes externos',
      to: 'interface',
      kind: 'público',
      description: 'API HTTP descrita en OpenAPI, con errores en formato estructurado (RFC 9457) y paginación explícita.',
      versioning: 'Versión en la ruta o en el encabezado; se mantiene la versión anterior durante la ventana de compatibilidad declarada.'
    });
  }
  if (styles.includes('graphql')) {
    contracts.push({
      id: 'graphql-api', from: 'clientes externos', to: 'interface', kind: 'público',
      description: 'Esquema GraphQL con límites de profundidad y complejidad por consulta.',
      versioning: 'Evolución por adición; los campos retirados pasan primero por marcado de obsolescencia.'
    });
  }
  if (styles.includes('message-queue') || styles.includes('cdc')) {
    contracts.push({
      id: 'event-contract', from: 'productores', to: 'consumidores', kind: 'asincrónico',
      description: 'Eventos con esquema declarado, identificador de evento para idempotencia y marca de tiempo del hecho.',
      versioning: 'Esquema versionado con compatibilidad hacia adelante; los consumidores ignoran campos desconocidos.'
    });
  }
  if (styles.includes('webhooks')) {
    contracts.push({
      id: 'webhook-contract', from: 'sistema', to: 'suscriptores', kind: 'asincrónico',
      description: 'Entrega al menos una vez, con firma del mensaje y reintentos con espera creciente.',
      versioning: 'Versión declarada en el propio evento; el suscriptor debe tolerar duplicados y desorden.'
    });
  }
  if (styles.includes('file-batch')) {
    contracts.push({
      id: 'batch-contract', from: 'contraparte', to: 'sistema', kind: 'por lote',
      description: 'Formato de archivo, ventana de entrega, archivo de control con totales y procedimiento de rechazo.',
      versioning: 'Versión en el nombre o en la cabecera del archivo; se acepta la versión anterior durante la transición.'
    });
  }
  if (config.technology?.aiUsage?.enabled) {
    contracts.push({
      id: 'model-contract', from: 'dominio', to: 'ai-gateway', kind: 'interno',
      description: 'Operación con plantilla identificada por versión, límite de tokens, resultado estructurado y marca de la versión de modelo aplicada.',
      versioning: 'Plantillas versionadas y evaluadas antes de promoverse; la versión usada queda registrada en cada resultado.'
    });
  }

  return contracts;
}

/** Dependencias críticas y su estrategia de aislamiento. */
export function deriveCriticalDependencies(config, capacity) {
  const out = [];
  const types = config.classification?.systemTypes || [];

  out.push({
    name: 'Motor de datos autoritativo',
    why: 'Su indisponibilidad detiene el registro de operaciones.',
    isolation: 'Repositorios detrás de interfaces de dominio; sin dialectos propietarios en la lógica de negocio.',
    degraded: 'Modo de solo lectura desde réplica cuando el primario no está disponible, si el dominio lo admite.'
  });

  for (const integration of config.functional?.integrations || []) {
    out.push({
      name: integration.name || 'Integración sin nombre',
      why: integration.criticality ? `Criticidad declarada: ${integration.criticality}.` : 'Dependencia externa declarada.',
      isolation: 'Adaptador propio con tiempo de espera, reintento acotado y cortacircuito.',
      degraded: integration.notes || 'Definir el comportamiento cuando la contraparte no responde: encolar, rechazar o continuar con valor por omisión.'
    });
  }

  if (config.technology?.aiUsage?.enabled && config.technology.aiUsage.provider !== 'local') {
    out.push({
      name: `Proveedor de inferencia (${config.technology.aiUsage.provider || 'no declarado'})`,
      why: 'Servicio externo con disponibilidad, latencia, cuotas y versiones fuera de control propio.',
      isolation: 'Pasarela de modelos propia, con contrato estable y posibilidad de cambiar de proveedor o de modelo.',
      degraded: 'La función asistida por modelo no debe estar en la ruta crítica sin un camino alternativo determinista.'
    });
  }

  if (types.includes('identity-provider') || types.includes('iam')) {
    out.push({
      name: 'Proveedor de identidad',
      why: 'Sin autenticación no hay acceso a ninguna funcionalidad.',
      isolation: 'Protocolo estándar (OpenID Connect o SAML) en lugar de integración propietaria.',
      degraded: 'Sesiones existentes siguen válidas durante una caída del proveedor; definir la duración máxima aceptable.'
    });
  }

  if ((capacity?.inputs?.regions || []).length > 1) {
    out.push({
      name: 'Enlace entre regiones',
      why: 'La replicación y la coherencia entre regiones dependen de él.',
      isolation: 'Operación autónoma por región con reconciliación posterior.',
      degraded: 'Definir qué operaciones se permiten cuando una región queda aislada.'
    });
  }

  return out;
}

/** Arquitectura completa. */
export function proposeArchitecture(config, catalog, capacity) {
  const style = recommendStyle(config, capacity);
  const components = deriveComponents(config, catalog, capacity);
  const contracts = deriveContracts(config, components);
  const criticalDependencies = deriveCriticalDependencies(config, capacity);
  const declared = config.classification?.architecture || [];

  const divergence = declared.length && !declared.includes(style.recommended)
    ? {
      declared,
      recommended: style.recommended,
      message: `El usuario declaró ${declared.join(', ')} y el motor recomienda ${style.recommended} para la carga y el equipo declarados. La elección del usuario se respeta en los artefactos; esta observación queda registrada como decisión a confirmar.`
    }
    : null;

  return {
    style,
    effectiveStyle: declared.length ? declared : [style.recommended],
    divergence,
    components,
    contracts,
    criticalDependencies,
    replaceableComponents: components
      .filter((c) => ['cache', 'async', 'integration', 'ai-gateway', 'regional-routing'].includes(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        contract: `Se sustituye detrás de su contrato sin cambios en el dominio.`,
        reason: 'Componente de infraestructura: su implementación concreta no debe filtrarse al núcleo.'
      })),
    migrationStrategy: {
      schema: 'Migraciones en dos fases (expandir y contraer): primero se agrega lo nuevo sin romper lo anterior, se migran los datos por lotes, y solo cuando nadie usa el campo antiguo se retira.',
      data: 'Migración por lotes con punto de control reanudable, verificación de conteos y posibilidad de ejecutar en paralelo con el sistema en servicio.',
      rollout: 'Despliegue progresivo con posibilidad de reversión en cada paso; una migración sin plan de reversión probado no se ejecuta.',
      backwardCompatibility: 'Se mantiene durante la ventana declarada para los contratos públicos. Para contratos internos, mientras exista un consumidor en una versión anterior.',
      reversibility: 'Cada fase debe ser reversible por sí misma; si una fase no lo es, debe declararse explícitamente y aprobarse antes de ejecutarse.'
    },
    versioning: {
      code: 'Versionado semántico del sistema completo.',
      publicContracts: 'Versión mayor para cambios incompatibles; la versión anterior se mantiene durante la ventana de compatibilidad.',
      schemas: 'Esquema de configuración y de eventos versionado con migraciones registradas.',
      catalogs: 'Catálogos y plantillas versionados de forma independiente del código que los consume.'
    },
    obsolescence: {
      policy: 'Todo componente con fecha de fin de soporte conocida entra en el inventario con esa fecha y una decisión asociada antes de alcanzarla.',
      deprecation: 'El retiro de una capacidad pasa por marcado de obsolescencia, aviso a consumidores, periodo de convivencia y retiro verificado.',
      inventory: 'Inventario de componentes (lenguaje, dependencias, servicios administrados) con versión fijada y fecha de soporte.'
    },
    recovery: {
      rpo: num(config.quality?.rpoMinutes) ? `${num(config.quality.rpoMinutes)} minutos declarados.` : 'No declarado: debe definirse antes de diseñar la estrategia de respaldo.',
      rto: num(config.quality?.rtoMinutes) ? `${num(config.quality.rtoMinutes)} minutos declarados.` : 'No declarado: sin objetivo no es posible verificar el procedimiento.',
      procedures: [
        'Respaldo con verificación automática de integridad.',
        'Ensayo de restauración completa, periódico y cronometrado.',
        'Procedimiento de reversión de despliegue documentado y probado.',
        'Plan de contingencia para operación degradada, incluido el procedimiento manual si el dominio lo exige.'
      ],
      note: 'Un respaldo que nunca se restauró no es un respaldo verificado.'
    },
    redesignConditions: [
      'Existe una contención medida que no se resuelve con capacidad ni con cambios locales.',
      'El costo por operación crece al agregar capacidad, señal de límite de diseño.',
      'El tiempo de ciclo de un cambio pequeño crece de forma sostenida.',
      'Un requisito nuevo contradice un invariante estructural del diseño actual.',
      'Una dependencia estructural pierde soporte sin reemplazo compatible.',
      'La carga real supera de forma sostenida el escenario exigente proyectado.'
    ]
  };
}
