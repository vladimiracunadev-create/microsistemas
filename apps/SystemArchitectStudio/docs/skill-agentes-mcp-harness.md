# Skill, Agente, MCP, Harness y motor de ingeniería

## Cinco cosas distintas

Confundir estas capas produce diseños inmanejables. La herramienta las separa de forma
explícita y lo repite en cada artefacto que genera.

| Capa | Qué es | Qué le corresponde | Qué **no** le corresponde |
| --- | --- | --- | --- |
| **Skill** | Conocimiento e instrucciones reutilizables | Orientar: qué mirar, en qué orden, con qué límites | No ejecuta, no decide permisos, no mantiene estado |
| **Agente** | Componente que razona, planifica y usa herramientas | Interpretar, planificar, invocar herramientas, proponer | No define sus propios permisos ni su propio presupuesto |
| **MCP** | Protocolo de integración de herramientas y contexto | Exponer recursos, herramientas y plantillas de prompt | No decide si una acción está autorizada en el contexto de la tarea |
| **Harness** | Infraestructura que organiza y controla la ejecución | Contexto, tareas, permisos, aprobaciones, aislamiento, puntos de control, reintentos, auditoría, presupuesto, término | No razona sobre el dominio ni produce la especificación |
| **Motor de ingeniería** | Componente determinista | Calcular validaciones, capacidad, evolución, arquitectura y prompts | No llama a modelos ni depende de un proveedor de IA |

La aplicación **es** el motor de ingeniería. Las otras cuatro capas las **genera como
artefactos**, y de tres de ellas genera especificación, no implementación.

## Skill

Hay dos skills distintas y conviene no confundirlas:

1. **`skills/system-architect/`** (en el repositorio): skill reutilizable que orienta a un
   agente a usar esta herramienta. Está implementada y validada por pruebas: frontmatter,
   secciones obligatorias y referencias existentes y no vacías.
2. **Skill generada** (opcional, por configuración): una skill específica del sistema que
   se está diseñando, producida por `generateSkill`. Lleva su propio `SKILL.md` con
   frontmatter y cinco referencias.

Ambas aplican **carga progresiva de contexto**: el `SKILL.md` contiene solo instrucciones
operativas y una tabla que dice qué referencia abrir para cada tarea. El conocimiento de
dominio vive en las referencias, que se leen de forma independiente. Nunca se cargan los
127 tipos de sistema al contexto de un modelo.

Separación que la plantilla impone: **instrucciones operativas** en `SKILL.md`,
**conocimiento** en `references/`. Mezclarlos es lo que hace que una skill crezca hasta
ser inutilizable.

## Agente especializado y sistema multiagente

`generateAgents` produce dos documentos:

- **Agente especializado**: responsabilidades, herramientas autorizadas con su efecto
  declarado, límites y criterios de evaluación. El agente usa el **motor compartido**: no
  recalcula por su cuenta, de modo que sus cifras son las del motor y no inferencias.
- **Sistema multiagente**: trece especialistas posibles (Requirements Analyst, Business
  Domain Architect, Solution Architect, Data Architect, Capacity Engineer, Performance
  Engineer, Security Architect, Evolution Architect, DevOps Architect, AI Systems
  Architect, Implementation Planner, QA Reviewer, Documentation Specialist) más un
  supervisor.

Cada especialista declara responsabilidades, entradas, salidas, herramientas autorizadas,
límites y criterios de evaluación. Y cada uno tiene un **criterio de activación**: el Data
Architect solo se activa si hay motores de datos o magnitudes declaradas; el Security
Architect solo si hay sensibilidad de datos declarada; el AI Systems Architect solo si hay
uso de IA o tipos de IA en el alcance.

La activación es selectiva por diseño: ejecutar a los trece por defecto multiplica el costo
sin mejorar el resultado. La prueba de escenarios verifica que una configuración mínima
active menos especialistas que una rica.

El supervisor coordina, evita duplicación (cada artefacto tiene un único responsable),
consolida resultados, detiene la ejecución al alcanzar el presupuesto y eleva a revisión
humana las decisiones de impacto. Requiere un runtime de agentes compatible: **sin él,
esta definición es una especificación ejecutable por una persona o por un harness
externo.**

## Adaptador MCP

`generateMcpSpec` produce la especificación del adaptador, diferenciando las tres cosas
que el protocolo distingue y que suelen mezclarse:

- **Recursos**: contenido de lectura que el cliente puede incorporar al contexto
  (`sas://catalog/families`, `sas://catalog/systems/{id}`, `sas://catalog/dimensions`,
  `sas://catalog/rules`, `sas://schema/config`).
- **Herramientas**: operaciones con esquema de entrada declarado y resultado verificable
  (`sas_list_system_types`, `sas_get_system_type`, `sas_validate_config`,
  `sas_evaluate_compatibility`, `sas_compute_capacity`, `sas_propose_architecture`,
  `sas_project_evolution`, `sas_generate_prompts`, `sas_generate_specification`).
- **Plantillas de prompt**: guiones de conversación que el cliente ofrece al usuario y que
  no ejecutan nada por sí mismas.

Política de permisos, heredada del servidor MCP existente del repositorio: **todas las
herramientas son de solo lectura**. No se exponen herramientas destructivas ni de
escritura, y los permisos no se amplían de forma implícita. La compatibilidad con un
cliente concreto debe verificarse antes de declararla; esta especificación no la declara.

**Estado: no implementado.** Existe la especificación. El núcleo que esas operaciones
invocarían sí está implementado y probado.

## Harness

`generateHarness` produce la especificación de la capa de ejecución, con diecisiete
secciones obligatorias: gestión de contexto, planificación, tareas y dependencias,
permisos, aprobaciones, aislamiento, puntos de control, estados, reintentos, errores,
validaciones, auditoría, costos, presupuesto de tokens, recuperación, evaluaciones y
condiciones de finalización.

Requisitos que la plantilla no negocia:

- **Los permisos no se amplían por el contenido que el agente lee.** Una instrucción
  encontrada en un dato no concede permisos.
- **Restringir solo mediante instrucciones no es un control de seguridad.** El aislamiento
  debe ser efectivo.
- **Un punto de control que no permite reanudar no cumple su función.**
- **La validación la ejecuta el motor determinista, no el propio agente.** Un agente no
  puede declarar completada una tarea cuya validación no pasó.
- **Sin condición de término explícita la ejecución puede no detenerse.** Es un requisito,
  no una opción.
- **Los secretos no se registran**: se registra que se usaron, no su valor.

El perfil de ejecución se recomienda según la configuración: solo motor determinista (sin
tokens) cuando la configuración está completa; revisión asistida cuando hay hallazgos
abiertos; multiagente supervisado en sistemas de alta complejidad y con runtime disponible.

**Estado: no implementado.** Esta versión genera especificaciones de harness. La ejecución
real se incorporaría mediante adaptadores posteriores con sus propias pruebas. No se
desarrolla un framework de agentes completo si existen alternativas adecuadas.

## Cómo pedir estos artefactos

En la sección 17 del formulario, o en la configuración:

```json
"deliverables": {
  "includeSkill": true,
  "includeAgents": true,
  "includeHarness": true,
  "includeMcp": true
}
```

Aparecen en el paquete ZIP bajo `skills/`, `agentes/`, `harness/` y `mcp/`. El escenario de
aceptación G (`templates/systems/g-multiagente.json`) los solicita todos.
