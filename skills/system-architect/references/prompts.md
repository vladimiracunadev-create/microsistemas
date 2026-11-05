# Prompts por disciplina

## Qué genera el motor

Veinte prompts base más dos condicionales, todos derivados de la misma configuración, lo
que garantiza que no se contradigan entre sí. La generación es determinista: la misma
configuración, el mismo catálogo y las mismas plantillas producen el mismo texto, y no
consume tokens.

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
| 21 | Ingeniería de IA | Solo si hay uso de IA declarado |
| 22 | Ampliación de sistema existente | Solo en modo existente |

## Estructura obligatoria de cada prompt

Repositorio objetivo · objetivo · alcance incluido y excluido · contexto del sistema con
sus tipos y su clasificación · modo (nuevo o existente) · requisitos funcionales y no
funcionales · cumplimiento · restricciones · controles de seguridad declarados ·
tecnologías elegidas · arquitectura de referencia con componentes y contratos ·
dimensionamiento con fórmulas · cuellos de botella · evolución temporal con etapas e
hitos · operación · supuestos · decisiones pendientes · instrucciones específicas de la
disciplina · entregables · pruebas exigidas · criterios de aceptación · evidencia de
finalización · reglas de honestidad del informe.

Un prompt que podría aplicarse indistintamente a cualquier sistema está mal generado: debe
llevar los tipos, las magnitudes y las restricciones de **este** sistema.

## Modo sistema existente

Cuando la configuración declara modo existente, todos los prompts incorporan el bloque de
inspección previa obligatoria, en este orden: inspeccionar el repositorio, identificar su
propósito original, analizar el código y la documentación, detectar las funcionalidades en
operación, estudiar dependencias, identificar restricciones, evaluar impacto, diseñar la
ampliación respetando los patrones existentes, implementar de forma incremental y verificar
que no haya regresiones ejecutando la suite antes y después.

Y la prohibición explícita: no eliminar funcionalidades, no renombrar lo que está en uso,
no sustituir tecnologías por preferencia, no reestructurar globalmente sin necesidad y no
sobrescribir cambios ajenos.

## Reglas de honestidad que todo prompt impone

- Diferenciar implementado y probado / implementado sin validar completamente /
  parcialmente implementado / planificado / no implementado.
- No declarar pruebas aprobadas sin ejecutarlas: adjuntar la salida real.
- No usar respuestas simuladas para aparentar que una integración funciona.
- Informar cualquier comando que no se pudo ejecutar, y por qué.
- No publicar versiones ni desplegar a producción de forma automática.

## Cómo usarlos

```bash
# Listar los prompts aplicables a una configuración
node apps/SystemArchitectStudio/adapters/cli/sas.mjs prompts mi-config.json

# Imprimir uno
node apps/SystemArchitectStudio/adapters/cli/sas.mjs prompts mi-config.json --id=architecture

# Escribirlos todos a un directorio
node apps/SystemArchitectStudio/adapters/cli/sas.mjs prompts mi-config.json --salida=salida/prompts
```

Para limitar qué prompts se generan, declare sus identificadores en
`deliverables.prompts` de la configuración. Vacío significa todos los aplicables.
