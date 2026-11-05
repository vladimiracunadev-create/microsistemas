# Dimensionamiento de capacidad

## Las tres magnitudes que no son lo mismo

```
usuarios concurrentes ≤ usuarios activos diarios ≤ usuarios activos mensuales ≤ usuarios registrados
```

Confundirlas es el error más caro del dimensionamiento. Un sistema con 100.000 estudiantes
registrados puede tener 12.000 activos en un día y 25.000 concurrentes durante los veinte
minutos de una aplicación censal: la concurrencia en pico no se deriva del promedio.

## Variables de entrada

Demanda: usuarios registrados, activos mensuales, activos diarios, concurrentes en pico,
sesiones por usuario y día, solicitudes por sesión, duración media de sesión.

Mezcla de operaciones: lecturas por cada escritura, tamaño medio de registro, tamaño medio
de respuesta, archivos por usuario y mes, tamaño medio de archivo.

Distribución: organizaciones, regiones, factor de pico sobre la media, factor de pico
estacional, tareas en segundo plano por día, recurso crítico con concurrencia.

Objetivos y límites: plazo de conservación, disponibilidad objetivo, objetivo de latencia
con su percentil, uso de IA con tokens por operación y operaciones por día.

Costos: precio por vCPU/mes, por GB de RAM/mes, por GB de almacenamiento/mes, por GB de
salida y por millón de tokens, más el presupuesto mensual.

## Fórmulas

| Resultado | Fórmula |
| --- | --- |
| Sesiones concurrentes medias | `L = λ × W`, con `λ = DAU × sesiones_por_día / 86400` y `W = duración_sesión_s` (ley de Little) |
| Concurrencia en pico | `concurrencia_media × factor_pico` |
| Solicitudes por segundo (media) | `DAU × sesiones_por_día × solicitudes_por_sesión / 86400` |
| Solicitudes por segundo en pico | `RPS_medio × factor_pico` |
| Pico estacional | `RPS_pico × factor_estacional` |
| Escrituras por segundo | `RPS_pico / (relación_lectura_escritura + 1)` |
| Lecturas por segundo | `RPS_pico − escrituras_s` |
| vCPU | `(RPS_pico × CPU_ms_por_solicitud / 1000) / utilización_objetivo` |
| Instancias | `techo(vCPU / vCPU_por_instancia)` |
| Memoria | `concurrencia × MB_por_sesión + instancias × MB_base` |
| Datos por mes | `escrituras_s × 86400 × 30 × KB_por_registro / 1048576` |
| Almacenamiento acumulado | `GB_mes_total × meses_de_conservación` |
| Ancho de banda en pico | `RPS_pico × KB_por_respuesta × 8 / 1000` |
| Caché del conjunto caliente | `lecturas_s × ventana_s × KB_por_registro × fracción_caliente / 1024` |
| Trabajadores asíncronos | `techo((tareas_s × segundos_por_tarea) / utilización_objetivo)` |
| Presupuesto de indisponibilidad | `(1 − objetivo/100) × 43200` minutos al mes |

## Supuestos del motor

Cuando una entrada no se declara, el motor aplica un valor por omisión y lo registra como
supuesto con su justificación. Nunca lo presenta como dato. Los supuestos que más
distorsionan el resultado:

1. **CPU por solicitud (50 ms por omisión).** Domina el cálculo de vCPU y de instancias.
   Debe reemplazarse por perfilado real: es la primera medición que conviene hacer.
2. **Factor de pico (3× por omisión).** En sistemas con ventanas concentradas —
   inscripción académica, aplicación de pruebas, cierre contable, vencimiento tributario,
   ciclo de facturación — puede ser 10 o más.
3. **Fracción caliente de la caché (20%).** La distribución real de accesos debe medirse;
   una caché mal dimensionada degrada en lugar de ayudar.
4. **Razón de activos (10% de registrados, 20% de mensuales).** Varía enormemente por
   producto y debe obtenerse de datos reales.

## Qué no afirmar

- Las cifras son **escenarios**, no capacidad verificada. Solo las pruebas de carga sobre
  la implementación real las convierten en capacidad medida.
- El almacenamiento acumulado no incluye respaldos, índices ni réplicas: en conjunto
  suelen multiplicar la cifra por un factor de 2 a 4.
- Los resultados se calculan con la tasa de pico, por lo que son cota superior del
  crecimiento, no el valor esperado.
- El costo estimado cubre solo infraestructura con los precios declarados: no incluye
  licencias, soporte, personas, ambientes no productivos ni tráfico entre zonas.

## Cuellos de botella

El motor identifica candidatos con su motivo, su mitigación y la prueba que lo validaría:
nodo primario de escritura, camino de lectura, pool de conexiones, crecimiento del
almacenamiento, transferencia de salida, coordinación distribuida, elasticidad ante pico
estacional, ventana de aplicación concentrada, camino transaccional de registro y el
recurso crítico que el usuario haya declarado.

Un cuello de botella identificado es una hipótesis: la medición decide cuál es el real.
Escalar un componente sin contención medida gasta dinero sin mejorar nada.
