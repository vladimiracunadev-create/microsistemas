# Ejemplos progresivos y escenarios de aceptación

Las doce configuraciones de `templates/systems/` son a la vez plantillas de la interfaz y
fixtures de las pruebas. Cubren los escenarios de aceptación A–L y están ordenadas, en esta
guía, de la más simple a la más compleja.

Los contenidos son originales. No reproducen instrumentos psicométricos, contenidos
editoriales ni datos reales de personas.

## Cómo usarlos

En la interfaz, selector **Cargar ejemplo…** de la barra superior. Desde la línea de
comandos:

```bash
node apps/SystemArchitectStudio/adapters/cli/sas.mjs ejemplos
node apps/SystemArchitectStudio/adapters/cli/sas.mjs resumen apps/SystemArchitectStudio/templates/systems/a-crm-50-usuarios.json
```

La forma recomendada de empezar una configuración propia es **copiar el ejemplo más
cercano** y modificarlo, en lugar de partir del formulario vacío.

## Nivel 1: configuración sencilla

### A — CRM con 50 usuarios (`a-crm-50-usuarios.json`)

Un equipo comercial, una organización, roles claros, dos integraciones. Qué muestra:

- Que el motor **no** recomienda una arquitectura sobredimensionada: con 15 concurrentes
  propone monolito modular y una instancia.
- Que con todas las magnitudes declaradas la lista de supuestos queda vacía.
- Que un sistema pequeño igual necesita plan de evolución: el hito "primera organización
  externa en modo servicio" anticipa el cambio de aislamiento.

### I — Skill especializada (`i-skill-especializada.json`)

Carga mínima, foco en los artefactos. Qué muestra:

- Cómo se genera una skill con `SKILL.md` y cinco referencias independientes.
- Que la activación de especialistas es selectiva: esta configuración activa menos que una
  rica.
- Uso de IA con proveedor local, que evita la advertencia de red aislada.

## Nivel 2: configuración intermedia

### H — Ampliación de un sistema existente (`h-sistema-existente.json`)

Describe la propia integración de este microsistema en Microsistemas. Qué muestra:

- Cómo cambia el modo `existing`: todos los prompts incorporan el bloque de inspección
  previa y la prohibición de destruir lo preexistente.
- Que una configuración puede ser válida con completitud parcial (82%) cuando los campos
  restantes son irrelevantes para el caso.
- Modelo de crecimiento `stagnation`, que desplaza el análisis hacia mantenibilidad.

### K — Evolución temporal (`k-evolucion-temporal.json`)

Una plataforma municipal proyectada de una comuna a una red de municipios. Qué muestra:

- Horizonte de 12 años con crecimiento por pasos: los municipios se incorporan en bloques,
  no de forma suave.
- Seis hitos declarados, cinco de ellos por condición observable.
- Cómo una retención de 360 meses (obligación de archivo) domina la proyección de
  almacenamiento por encima del crecimiento de usuarios.
- Licencia GPL-3.0 combinada con suscripción, una combinación válida que el motor no
  prohíbe.

### B — ERP con 5.000 usuarios (`b-erp-5000-usuarios.json`)

Múltiples áreas, seis organizaciones, tres integraciones de criticidad distinta. Qué
muestra:

- Pico estacional por sobre el pico diario (cierre contable).
- Integridad transaccional exigida y su efecto en los requisitos de fiabilidad.
- Una integración con protocolo SOAP heredado, declarada como tal.
- Decisiones pendientes que no bloquean la especificación.

## Nivel 3: configuración compleja

### F — Sistema industrial (`f-industrial-telemetria.json`)

Tres plantas, operación continua, sensores y controladores. Qué muestra:

- Que una **restricción dura de dominio** vence a la carga: con solo 3 req/s en pico, el
  motor recomienda control local distribuido, porque la planta no puede detenerse por la
  caída de un enlace.
- Horizonte sin término conocido por la vida útil de los activos físicos.
- Ocho millones de tareas en segundo plano al día (telemetría) frente a 360 usuarios.
- Operación sin conexión en los terminales de terreno.

### D — Comercio electrónico estacional (`d-ecommerce-estacional.json`)

Qué muestra:

- Factor estacional de 8× sobre el pico diario, y el cuello de botella de elasticidad que
  eso activa.
- Relación de 25 lecturas por escritura, y la amplificación de lectura que genera.
- Datos de tarjeta con PCI DSS declarado, que evita la advertencia correspondiente.
- Recurso crítico declarado: la última unidad de stock.

### C — Sistema psicométrico educativo (`c-psicometrico-educativo.json`)

El escenario más instructivo del conjunto. Qué muestra:

- La separación completa del dominio en ocho componentes distintos: administración de
  evaluaciones, banco de ítems, aplicación, puntuación, análisis psicométrico, baremos,
  informes y registro académico.
- 100.000 registrados, 12.000 activos diarios y **25.000 concurrentes**: la demostración de
  por qué las tres magnitudes no son equivalentes.
- Factor de pico 12, por la ventana de aplicación concentrada.
- RPO de cero minutos: perder una respuesta ya emitida es inaceptable.
- La advertencia obligatoria sobre licenciamiento de instrumentos protegidos.
- Accesibilidad con acomodaciones (tiempo extendido, ampliación, lector de pantalla) como
  requisito y no como extra.
- Divergencia de arquitectura: el usuario declaró monolito modular con eventos y el motor
  recomienda servicios por la concurrencia; el motor respeta la elección y lo registra.

### E — Núcleo bancario (`e-banco-core.json`)

Qué muestra:

- 99,99% de disponibilidad traducido a poco más de 4 minutos al mes, con su nota de que no
  se alcanza con operación en horario de oficina.
- Componente de auditoría inmutable derivado del dominio.
- Cuello de botella del camino transaccional de registro.
- Horizonte sin término conocido con revisión trimestral indefinida.

### G — Sistema multiagente (`g-multiagente.json`)

La configuración que solicita los cuatro artefactos opcionales. Qué muestra:

- Skill, agentes, harness y especificación MCP en un mismo paquete, con 39 archivos.
- Todas las herramientas MCP en solo lectura.
- Controles de presupuesto declarados, que evitan la advertencia `R-AI-001`.
- Autorización a nivel de documento en la recuperación, que evita `R-AI-002`.
- El prompt de ingeniería de IA, que solo aparece cuando hay uso de IA declarado.

### J — Harness (`j-harness.json`)

Qué muestra:

- Las diecisiete secciones de la especificación de harness.
- La tabla de separación de responsabilidades entre skill, agente, MCP, harness y motor.
- La declaración explícita de que la ejecución no está implementada.

### L — Alta escala (`l-alta-escala.json`)

Veinte millones de usuarios registrados, 600.000 concurrentes, tres regiones. Qué muestra:

- Que el motor produce cifras coherentes y finitas a esa escala, con rangos.
- Que los supuestos se declaran en lugar de ocultarse: el escenario registra
  explícitamente que ninguna cifra proviene de medición real.
- Decisión pendiente número uno: ejecutar pruebas de carga **antes** de comprometer
  presupuesto.
- Multi-región con estrategia de consistencia declarada, que evita `R-OPS-003`.
- Decisiones automatizadas de moderación con gobierno de IA en el alcance, que evita
  `R-AI-003`.
- Advertencia sobre la distribución desigual: el promedio no representa el caso crítico de
  las cuentas con muchos seguidores.

## Qué verifica la suite sobre cada escenario

Para los doce: configuración válida sin errores de compatibilidad, horizonte proyectado,
veinte dimensiones de evolución, seis etapas, hitos, plan de revisión con indicadores,
arquitectura con razones y contratos, requisitos (16 no funcionales siempre), prompts que
mencionan el sistema y llevan criterios de aceptación, evidencia y huella, y paquete con
manifiesto.

Además, cada escenario tiene su prueba específica, y una prueba final verifica que los doce
produzcan huellas distintas y que los prompts de dos sistemas diferentes no sean iguales.
