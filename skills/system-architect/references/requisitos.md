# Del enunciado al requisito verificable

## Regla general

Un requisito sin criterio de aceptación medible no es un requisito: es una intención.
Cada requisito debe poder responder "cómo sabremos que está cumplido" con algo que alguien
pueda ejecutar o medir.

## Requisitos funcionales

El motor deriva requisitos funcionales de tres orígenes, y los marca:

- **Del catálogo**: capacidades habituales del tipo de sistema elegido. Son candidatas a
  alcance, no alcance comprometido. Deben confirmarse con el responsable funcional.
- **Del usuario**: capacidades, procesos, roles e integraciones declaradas en la
  configuración.
- **De los roles**: cada rol genera un requisito de autorización con prueba de acceso
  permitido y de acceso denegado.

Formato: enunciado en positivo, criterio de aceptación ejecutable, origen y prioridad.
Si la prioridad no está declarada, dice "por confirmar"; no se inventa.

## Requisitos no funcionales

Se generan dieciséis, uno por atributo de calidad: rendimiento, disponibilidad,
fiabilidad, seguridad, privacidad, accesibilidad, mantenibilidad, modificabilidad,
portabilidad, interoperabilidad, observabilidad, recuperabilidad, testabilidad,
usabilidad, evolutividad y eficiencia económica. Los catorce primeros se encuadran en
ISO/IEC 25010; los dos últimos son extensiones explícitas.

Cada uno lleva magnitud, unidad, criterio de aceptación y método de verificación. Si la
configuración no declara el objetivo, el requisito dice que debe declararse, en lugar de
inventar un número.

Ejemplos de la diferencia:

- Mal: "el sistema debe ser rápido".
- Bien: "el percentil 95 del tiempo de respuesta de las operaciones interactivas no debe
  exceder 300 ms a 180 req/s en pico, verificado con una prueba de carga de 30 minutos y
  tasa de error inferior a 0,1%".

- Mal: "el sistema debe ser seguro".
- Bien: "sin hallazgos críticos abiertos en el análisis de dependencias, sin secretos en
  el repositorio ni en su historial, y con prueba de acceso denegado por cada operación
  sensible; la cobertura real del análisis queda declarada".

## Requisitos de cumplimiento

Se generan desde las obligaciones y los estándares declarados, y desde los estándares que
el catálogo sugiere por el tipo de sistema. Siempre con la misma advertencia: declarar un
estándar no constituye conformidad, y seleccionar una jurisdicción no otorga cumplimiento.
La verificación legal es externa y humana.

## Ambigüedades

Cuando el enunciado no alcanza, no complete: formule la pregunta concreta y el responsable
sugerido. Preguntas que suelen faltar:

- ¿Cuántos usuarios concurrentes se esperan en el pico, no en el promedio?
- ¿Cuál es el plazo de conservación exigido por categoría de dato?
- ¿Qué pasa cuando la integración crítica no responde: se encola, se rechaza o se continúa?
- ¿Quién puede ver cada resultado, y desde cuándo?
- ¿La disponibilidad declarada incluye o excluye las ventanas de mantenimiento?
- ¿Qué decisión se toma si el sistema supera el escenario exigente?

## Trazabilidad

Todo requisito debe poder seguirse hasta una prueba y hasta un entregable. El plan de
pruebas que genera el motor incluye la matriz requisito a criterio de aceptación; úsela
como control de completitud, no como adorno.
