# Evolución temporal y escalabilidad

## Obligatorio para todo sistema

No hay configuración válida sin análisis de evolución. El horizonte puede ser cualquiera,
pero debe declararse: el motor marca como error que no haya ni duración ni la casilla de
"sin fecha de término conocida".

La razón es simple: un sistema sin análisis de evolución se diseña solo para su carga
inicial, y la decisión de qué hacer cuando crezca queda para cuando ya sea caro tomarla.

## Horizonte libre

Se admite cualquier duración en meses, trimestres o años, sin tope. No hay horizontes
privilegiados: no se asume 24 meses, ni 5 años, ni 10. La prueba de regresión verifica
horizontes de 1, 7, 24, 60, 120, 240 y 600 meses.

También se admite el escenario **sin término conocido**, habitual en sistemas de registro
oficial, bancarios e industriales, donde la vida útil excede la del propio software. En ese
caso el motor proyecta una ventana de planificación (60 meses si no se declara otra), lo
registra como supuesto, y marca el plan de revisión como indefinido.

## Modelos de crecimiento

| Modelo | Multiplicador al mes `m` (tasa anual `r`) |
| --- | --- |
| Constante | `1 + r × m/12` |
| Porcentual | `(1 + r)^(m/12)` |
| Acelerado | `(1 + r)^((m/12)^1.3)` |
| Estacional | `(1 + r)^(m/12) × (1 + 0,3 × sen(2π m/12))` |
| Por pasos | `1 + r × piso(m / 12)` |
| Estancamiento | `1` |
| Disminución | `(1 − r)^(m/12)` |

La elección cambia el resultado de forma radical a largo plazo: con 40% anual a cinco
años, el modelo constante multiplica por 3 y el porcentual por algo más de 5. Por eso el
modelo se declara, y si no se declara el motor asume porcentual y lo registra como
supuesto.

El plan contempla estancamiento y disminución, no solo crecimiento. Poder reducir
capacidad es tan importante como poder aumentarla, y una arquitectura que solo escala hacia
arriba deja costo fijo cuando la demanda baja.

## Tres escenarios comparables

Conservador, esperado y exigente, cada uno con tasa y supuesto editables. Si no se
declaran, se derivan de la esperada (mitad y doble) y queda registrado como supuesto.

Cada escenario proyecta, en cada punto de muestreo: usuarios, solicitudes en pico,
almacenamiento mensual, almacenamiento acumulado y costo mensual (si hay precios
unitarios). Los puntos de muestreo son las seis etapas más los meses de los hitos
declarados por tiempo.

## Etapas

| Etapa | Foco | Lo que **no** se hace |
| --- | --- | --- |
| Estado inicial | Poner en servicio el alcance mínimo verificable | Adelantar infraestructura para necesidades no demostradas |
| Crecimiento temprano | Instrumentar antes de optimizar | Extraer servicios por estética |
| Expansión | Escalar lo que la medición señaló como contención | Migrar de motor sin agotar índices y particionado |
| Consolidación | Reducir costo unitario y variabilidad | Agregar tecnologías sin retirar las que reemplazan |
| Modernización | Sustituir lo que pierde soporte o cuesta más que reemplazar | Reescribir completo lo que puede sustituirse por partes |
| Evolución prolongada | Sostenibilidad: costo, conocimiento, obsolescencia | Asumir que la arquitectura inicial sigue siendo adecuada |

Cada etapa declara además su justificación cuantitativa (la carga proyectada y su factor
respecto de la línea base) y su **condición de salida** observable.

## Hitos por condición observable

Un hito por fecha envejece mal; un hito por condición sigue siendo válido aunque el
calendario se corra. El formulario admite ambos tipos, y el motor agrega hitos derivados
del dimensionamiento, cada uno con su acción:

- Concurrencia duplicada respecto de la línea base → revisar el dimensionamiento completo
  y repetir las pruebas de carga.
- Almacenamiento conservado 1,5 veces el proyectado → activar particionado temporal y
  archivado por capas.
- Percentil de latencia por sobre el objetivo dos semanas seguidas → abrir revisión
  arquitectónica antes de agregar capacidad.
- Costo mensual 1,5 veces el estimado sin crecimiento de uso equivalente → auditar costo
  por operación.
- Nueva jurisdicción → reevaluar residencia, base legal y replicación.
- Fin de soporte de una dependencia crítica → planificar sustitución detrás del contrato.

## Las veinte dimensiones

El motor produce análisis para las veinte, con contenido derivado de la configuración
concreta (no texto genérico), más qué vigilar y qué acción tomar:

crecimiento de usuarios · de datos · de operaciones · nuevos módulos funcionales · nuevos
roles y organizaciones · nuevos países · nuevas normativas · nuevos canales · nuevas
integraciones · sustitución de componentes · actualizaciones tecnológicas · migración de
bases de datos · cambios de infraestructura · expansión o reducción de demanda · costos
operacionales · mantenibilidad · observabilidad · seguridad · continuidad · sostenibilidad
a largo plazo.

La escalabilidad no se restringe a usuarios e infraestructura: también es funcional,
tecnológica, organizacional, operacional, geográfica y económica.

## Plan de revisión arquitectónica

Indicadores con umbral y origen (declarado por el usuario o derivado del dimensionamiento),
frecuencia, riesgos con impacto y mitigación, decisiones posibles, alternativas ordenadas
por preferencia, pruebas necesarias, seguimiento de costo y criterios de migración.

La frecuencia se declara; si no, se propone proporcional al horizonte (3 meses para
horizontes cortos, 6 para largos) y queda como supuesto.

Los criterios de migración son **acumulativos**: contención medida y no supuesta, opciones
de menor costo agotadas, beneficio cuantificado en el indicador que motiva el cambio, plan
de reversión probado, y capacidad real del equipo para operar la tecnología destino. Que
falte uno es razón suficiente para no migrar todavía.

## Lo que el módulo no afirma

Las proyecciones son escenarios con supuestos editables, no predicciones. Y ninguna
arquitectura es infinitamente escalable: cada etapa declara el límite que la obliga a
cambiar.
