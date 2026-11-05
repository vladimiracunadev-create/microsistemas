# Evolución temporal y escalabilidad

## Principio

La escalabilidad es una capacidad sometida a medición continua, no una declaración
comercial. Ninguna arquitectura es infinitamente escalable: toda propuesta debe escribir
su límite conocido y la condición que obligaría a cambiarla.

El análisis de evolución es obligatorio para todo sistema, cualquiera sea su tamaño.

## Horizonte

El horizonte es el que declare el usuario: meses, trimestres o años, sin tope. También se
admite un escenario **sin fecha de término conocida**, que es lo habitual en sistemas de
registro oficial, bancarios o industriales: en ese caso se proyecta una ventana de
planificación y el plan de revisión queda indefinido en el tiempo.

No hay horizontes privilegiados. No asuma 24 meses, 5 años ni 10 años.

## Modelos de crecimiento

| Modelo | Comportamiento | Cuándo corresponde |
| --- | --- | --- |
| Constante | Se incorpora cada año la misma cantidad absoluta | Base instalada madura |
| Porcentual | Compuesto sobre el periodo anterior | Crecimiento orgánico |
| Acelerado | La tasa misma aumenta | Efecto de red, expansión comercial |
| Estacional | Compuesto con oscilación anual | Retail, educación, tributario |
| Por pasos | Saltos discretos | Incorporación de organizaciones o mercados completos |
| Estancamiento | La base se mantiene | El trabajo pasa a eficiencia y costo |
| Disminución | Contracción sostenida | Producto en retirada o mercado en baja |

Los escenarios conservador, esperado y exigente tienen tasas editables. Si no se declaran,
se derivan de la esperada (mitad y doble) y queda registrado como supuesto.

Un plan que solo contempla crecimiento está incompleto: incluya también estancamiento y
disminución, porque poder reducir capacidad es tan importante como poder aumentarla.

## Etapas

Seis etapas de referencia, proporcionales al horizonte declarado: estado inicial,
crecimiento temprano, expansión, consolidación, modernización y evolución prolongada.
Cada una declara foco, arquitectura, lo que **no** se hace en ella, justificación y
condición de salida.

La regla que gobierna las etapas: **no construya hoy la arquitectura de la etapa final;
construya los contratos que permitan llegar a ella.** Adelantar particionado,
microservicios o multi-región sin contención medida añade costo operacional sin beneficio.

## Hitos

Los hitos se expresan por tiempo o por **condición observable**. Los segundos envejecen
mucho mejor. Ejemplos de condición:

- Las sesiones concurrentes en pico superan un umbral.
- El almacenamiento conservado supera una cifra.
- El percentil de latencia excede el objetivo durante dos semanas consecutivas.
- El costo mensual crece sin crecimiento equivalente de uso.
- Se incorpora una jurisdicción nueva.
- Una dependencia crítica anuncia fin de soporte.

El motor agrega hitos derivados del dimensionamiento, cada uno con la acción asociada.

## Las veinte dimensiones

Todo plan debe cubrirlas: crecimiento de usuarios, de datos y de operaciones; nuevos
módulos, roles y organizaciones; nuevos países, normativas, canales e integraciones;
sustitución de componentes, actualizaciones tecnológicas, migración de bases de datos y
cambios de infraestructura; expansión o reducción de demanda; costos operacionales,
mantenibilidad, observabilidad, seguridad, continuidad y sostenibilidad a largo plazo.

La escalabilidad no es solo usuarios e infraestructura: es también funcional,
tecnológica, organizacional, operacional, geográfica y económica.

## Plan de revisión

Indicadores con umbral y origen, frecuencia de revisión, riesgos con impacto y mitigación,
decisiones posibles, alternativas ordenadas por preferencia, pruebas necesarias,
estimación de costo y criterios de migración.

Las alternativas, en el orden que conviene intentar:

1. Escalado vertical, cuando el costo de coordinación supera el beneficio.
2. Caché y réplicas de lectura.
3. Particionado.
4. Cambio de motor de datos.
5. Extracción de módulos como servicios.

Los criterios de migración son acumulativos: contención medida y no supuesta, opciones de
menor costo agotadas, beneficio cuantificado en el indicador que motiva el cambio, plan de
reversión probado, y capacidad real del equipo para operar la tecnología destino.
