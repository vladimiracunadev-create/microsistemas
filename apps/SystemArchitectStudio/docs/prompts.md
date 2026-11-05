# Motor de prompts

## Determinista y sin tokens

El generador no llama a ningún modelo. Combina la configuración, el catálogo, las reglas y
las plantillas versionadas, y produce texto. La misma entrada produce exactamente la misma
salida, y el costo es cero.

Las plantillas están en `templates/prompts/prompt-catalog.js` y llevan su propia versión
(`PROMPT_TEMPLATES_VERSION`), sellada en cada prompt generado junto con la huella de la
configuración.

## Disciplinas cubiertas

Veinte base, siempre aplicables, más dos condicionales:

| # | Prompt | Disciplina |
| --- | --- | --- |
| 1 | Prompt maestro integral | Integración de todas las disciplinas |
| 2 | Análisis de requisitos | Ingeniería de requisitos |
| 3 | Arquitectura | Arquitectura de software |
| 4 | Modelado de datos | Ingeniería de datos |
| 5 | Backend | Desarrollo backend |
| 6 | Frontend | Desarrollo frontend |
| 7 | APIs e integraciones | Integración de sistemas |
| 8 | Seguridad | Ciberseguridad |
| 9 | Privacidad | Protección de datos |
| 10 | Escalabilidad | Rendimiento y capacidad |
| 11 | Evolución temporal | Arquitectura evolutiva |
| 12 | Infraestructura | Infraestructura y plataforma |
| 13 | Integración y entrega continua | DevOps |
| 14 | Observabilidad | Ingeniería de confiabilidad |
| 15 | Testing | Aseguramiento de calidad |
| 16 | Documentación | Documentación técnica |
| 17 | Migraciones | Migración de datos y esquemas |
| 18 | Operación y soporte | Operación |
| 19 | Auditoría | Auditoría y cumplimiento |
| 20 | Mantenimiento | Mantenimiento y sostenibilidad |
| 21 | Ingeniería de IA | Solo si `technology.aiUsage.enabled` |
| 22 | Ampliación de sistema existente | Solo si `identity.mode` es `existing` |

## Contexto compartido

Todos los prompts de una generación se construyen desde un **único bloque de contexto**
(`buildPromptContext`), derivado de la misma configuración y del mismo resultado del motor.
Esa es la razón estructural por la que el prompt de datos y el de backend no pueden
contradecirse: leen la misma arquitectura, el mismo dimensionamiento y los mismos
requisitos.

El contexto incluye: identidad y finalidad, tipos de sistema con su descripción formal,
clasificación en las nueve dimensiones, alcance funcional declarado, requisitos no
funcionales medibles, cumplimiento, restricciones (incluidas las del catálogo), controles
de seguridad declarados, tecnologías, arquitectura de referencia con componentes y
contratos, dimensionamiento con fórmulas, cuellos de botella, evolución con etapas e
hitos, operación, supuestos y decisiones pendientes.

## Estructura de cada prompt

Cada prompt generado contiene, en este orden:

repositorio objetivo · objetivo · alcance incluido · alcance excluido · contexto del
sistema · tipos de sistema · clasificación · bloque de modo (nuevo o existente) ·
requisitos · cumplimiento · restricciones · controles de seguridad · tecnologías ·
arquitectura de referencia · dimensionamiento · cuellos de botella · evolución temporal ·
operación · supuestos · decisiones pendientes · instrucciones específicas de la disciplina
· entregables · pruebas exigidas · criterios de aceptación · evidencia de finalización ·
reglas de honestidad del informe.

La prueba de escenarios verifica que cada prompt mencione el nombre del sistema, incluya
las secciones de criterios de aceptación, evidencia y repositorio objetivo, y lleve la
huella de la configuración. También verifica que dos sistemas distintos no produzcan el
mismo prompt de arquitectura.

## Modo sistema nuevo y modo sistema existente

En modo **nuevo**, el prompt pide diseñar desde cero con el alcance mínimo verificable en
la primera entrega y los puntos de extensión declarados.

En modo **existente**, todos los prompts incorporan la secuencia obligatoria de inspección
previa: inspeccionar el repositorio y registrar su estructura real, identificar el
propósito original, analizar código y documentación, detectar funcionalidades en operación,
estudiar dependencias, identificar restricciones, evaluar impacto, diseñar la ampliación
respetando los patrones existentes, implementar de forma incremental y verificar
regresiones ejecutando la suite antes y después.

Más la prohibición explícita: no eliminar funcionalidades, no renombrar lo que está en uso,
no sustituir tecnologías por preferencia, no reestructurar globalmente sin necesidad, no
sobrescribir cambios ajenos y no confundir refactorización con reescritura.

## Reglas de honestidad

Todo prompt termina imponiendo al ejecutor:

- Diferenciar implementado y probado / implementado sin validar completamente /
  parcialmente implementado / planificado / no implementado.
- No declarar pruebas aprobadas sin ejecutarlas; adjuntar la salida real.
- No usar respuestas simuladas para aparentar que una integración funciona.
- Informar cualquier comando que no se pudo ejecutar, y por qué.
- No publicar versiones ni desplegar a producción de forma automática.

## Selección

`deliverables.prompts` limita qué prompts se generan; vacío significa todos los
aplicables. En la interfaz, la sección 17 permite elegirlos, y marca como no disponibles
los que no aplican a la configuración.

```bash
node apps/SystemArchitectStudio/adapters/cli/sas.mjs prompts config.json --id=architecture
node apps/SystemArchitectStudio/adapters/cli/sas.mjs prompts config.json --salida=salida/prompts
```

## Agregar una disciplina

Una entrada en `PROMPT_CATALOG` con `id`, `order`, `name`, `discipline`, `objective`,
`scopeIn`, `scopeOut`, `guidance`, `deliverables`, `tests`, `acceptance` y `evidence`. Si
solo aplica en ciertos casos, agregue `appliesWhen(config)` y declárela en
`CONDITIONAL_PROMPTS`. No hay que tocar el motor.
