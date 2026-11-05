# Ingeniería de capacidad

## Por qué existe este módulo

Dimensionar mal un sistema tiene dos costos simétricos: pagar infraestructura que nadie
usa, o descubrir el límite en producción durante el momento de mayor demanda. Este módulo
no evita ninguno de los dos por sí solo; lo que hace es dejar **visible de dónde sale cada
cifra**, para que la discusión sea sobre los supuestos y no sobre los números.

## Las tres magnitudes que no son equivalentes

```
concurrentes ≤ activos diarios ≤ activos mensuales ≤ registrados
```

Un ejemplo concreto del escenario psicométrico incluido: 100.000 estudiantes registrados,
85.000 activos en el mes, 12.000 en un día cualquiera y **25.000 concurrentes** durante los
veinte minutos de una aplicación censal. El cuarto número es el que dimensiona la
capacidad, y no se deduce de los otros tres: depende de cómo se concentra el uso.

El motor valida esta cadena y marca como error que la concurrencia supere a los
registrados, y como advertencia que los diarios superen a los mensuales.

## Variables consideradas

**Demanda:** usuarios registrados, activos mensuales, activos diarios, concurrentes en
pico, sesiones por usuario y día, solicitudes por sesión, duración media de sesión.

**Mezcla de operaciones:** lecturas por cada escritura, tamaño medio de registro, tamaño
medio de respuesta, archivos por usuario y mes, tamaño medio de archivo.

**Distribución:** organizaciones, clientes por organización, regiones, factor de pico sobre
la media, factor de pico estacional, tareas en segundo plano por día, concurrencia sobre el
recurso crítico declarado.

**Objetivos:** plazo de conservación, disponibilidad objetivo, latencia objetivo con su
percentil, uso de IA con tokens por operación y operaciones por día.

**Costos:** precios unitarios de vCPU, memoria, almacenamiento, transferencia y tokens, más
el presupuesto mensual.

## Fórmulas

Cada resultado de la aplicación muestra su fórmula, sus entradas y su rango. Estas son las
que usa el motor:

**Concurrencia (ley de Little).** `L = λ × W`, con `λ = DAU × sesiones_por_día / 86400` y
`W` la duración de sesión en segundos. El pico es `L × factor_pico`.

Por qué la ley de Little: relaciona la tasa de llegada con el tiempo de permanencia, que es
exactamente lo que determina cuántas sesiones coexisten. Si llegan 10 sesiones por segundo
y cada una dura 60 segundos, hay 600 sesiones abiertas en régimen estacionario.

**Throughput.** `RPS_medio = DAU × sesiones_por_día × solicitudes_por_sesión / 86400`.
El pico es `RPS_medio × factor_pico`, y el estacional multiplica otra vez.

**Mezcla.** `escrituras_s = RPS_pico / (relación + 1)` y `lecturas_s = RPS_pico −
escrituras_s`. Separarlas importa porque las réplicas de lectura no alivian la escritura:
el nodo primario es el límite duro.

**Cómputo.** `vCPU = (RPS_pico × CPU_ms_por_solicitud / 1000) / utilización_objetivo`.
La utilización objetivo (60%) deja margen para el pico dentro del pico.

**Memoria.** `concurrencia × MB_por_sesión + instancias × MB_base`.

**Almacenamiento.** `GB_mes = escrituras_s × 86400 × 30 × KB_por_registro / 1048576`, más
los archivos. El acumulado multiplica por los meses de conservación.

**Transferencia.** `Mbps = RPS_pico × KB_por_respuesta × 8 / 1000`.

**Caché.** `MB = lecturas_s × ventana_s × KB_por_registro × fracción_caliente / 1024`.

**Asíncrono.** `trabajadores = techo((tareas_s × segundos_por_tarea) / utilización)`.

**Disponibilidad.** `indisponibilidad_mensual_min = (1 − objetivo/100) × 43200`. Así,
99,9% son 43 minutos al mes; 99,95%, 22 minutos; 99,99%, poco más de 4.

## Supuestos: qué pasa cuando falta un dato

El motor nunca deja un hueco silencioso. Si una entrada no se declara, aplica un valor por
omisión y lo registra en `assumptions` con su texto y su justificación, y lo muestra en la
pestaña de capacidad. Los valores por omisión están en `DEFAULTS`
(`core/capacity/capacity.js`) y son editables en un solo lugar.

Los cuatro supuestos que más distorsionan el resultado, en orden:

1. **CPU por solicitud: 50 ms.** Gobierna vCPU e instancias. Es el primer número que
   conviene reemplazar por perfilado real; el resultado lo dice explícitamente en su nota.
2. **Factor de pico: 3×.** En ventanas concentradas puede ser 10 o más. El escenario
   psicométrico declara 12.
3. **Fracción caliente de la caché: 20%.** La distribución real de accesos debe medirse.
4. **Razón de activos: 10% de registrados, 20% de mensuales.** Varía enormemente por
   producto.

Cuando todas las magnitudes están declaradas, la lista de supuestos queda vacía, y eso
también se informa.

## Rangos en lugar de certezas

Los resultados estimados llevan un rango (0,6× a 1,8× del valor esperado). No es un
intervalo de confianza estadístico: es un recordatorio operativo de que una estimación
derivada de supuestos no es una medición. Para escenarios con poca información, el rango
es la cifra útil; el valor central solo lo es cuando los supuestos están medidos.

## Cuellos de botella

El motor identifica candidatos con motivo, mitigación y **la prueba que lo validaría**:

| Candidato | Se activa cuando |
| --- | --- |
| Nodo primario de escritura | más de 500 escrituras/s en pico |
| Camino de lectura | relación de 20 lecturas o más por escritura |
| Pool de conexiones | más de 10.000 sesiones concurrentes |
| Crecimiento del almacenamiento | más de 5.000 GB conservados |
| Transferencia de salida | más de 1.000 Mbps en pico |
| Coordinación distribuida | arquitectura de microservicios o de eventos |
| Elasticidad estacional | factor estacional mayor que 3 |
| Ventana concentrada | tipos de aplicación de pruebas o inscripción académica |
| Camino transaccional | libro contable, núcleo bancario o pagos |
| Recurso crítico | el usuario declaró uno |

Un cuello de botella identificado es una hipótesis ordenada por probabilidad, no un
diagnóstico. La medición decide cuál es el real.

## Costos

Solo se estiman si se declaran precios unitarios. El resultado detalla cada partida con su
cantidad, su precio y su fórmula, y compara con el presupuesto si está declarado. No
incluye licencias, soporte, personas, respaldos, ambientes no productivos ni tráfico entre
zonas, y lo dice.

## Lo que este módulo no hace

No mide. No ejecuta pruebas de carga. No sustituye el perfilado. Produce el escenario y el
plan de validación; la verificación empírica es la fase siguiente, y el plan de pruebas
generado la detalla.
