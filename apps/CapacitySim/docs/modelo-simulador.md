# Modelo del simulador (como se calcula)

Este documento explica **que significa** cada selector y como se transforma en una estimacion de capacidad.

## 1) Que entrega el simulador

Para una combinacion (stack) calcula tres limites:

1) **Limite por CPU/App (`RPS_cpu`)**
2) **Limite por Base de Datos (`RPS_db`)**
3) **Limite por Red (`RPS_red`)**

Luego:

- **`RPS_cap = min(RPS_cpu, RPS_db, RPS_red) � safety_factor`**
- **Usuarios concurrentes H `RPS_cap � latencia_endpoint`** (en segundos)

> No representa usuarios totales del dia, sino simultaneidad aproximada bajo la latencia elegida.

## 2) Que modela cada selector

- **OS**: eficiencia/overhead del sistema.
- **Servidor web**: manejo de conexiones, keep-alive, proxy, TLS.
- **Runtime**: baseline de RPS por core (heuristico).
- **DB**: latencia tipica + conexiones por core (heuristico).
- **Contenedor / Orquestador**: overhead leve + posibilidad de escalar (operacional).
- **Cache / CDN / TLS**: efectos tipicos en latencia/carga.

## 3) Que NO hace

- No instala ni despliega stacks reales.
- No reemplaza pruebas de carga.
- No modela efectos complejos (GC, locks, hot partitions, etc.).

## 4) Como calibrarlo (recomendado)

1. Ejecuta pruebas (k6/Locust) en tu app real.
2. Mide RPS sostenido con p95 aceptable y errores bajos.
3. Ajusta `app/data/baselines.json` (baselines/latencias/multiplicadores).
4. Repite hasta acercarte.

## 5) Uso didactico

Cambia **una variable a la vez** y observa cuando el cuello de botella cambia (CPU/DB/Red).

## 6) Nuevos selectores

### Perfil de carga

- CPU-bound: limite suele ser CPU.
- I/O-bound: limite suele ser dependencias externas.
- DB-bound: DB es el cuello.
- Red-bound: payload/ancho de banda.

### Patron de arquitectura

- Monolito: menos hops.
- 3 capas: separacion clasica.
- Microservicios: mas hops, mejor escalado por servicio.
- Serverless: autoescalado, posible cold start.

## 7) Estrategia de escalado (nuevo)

- **Vertical**: aumentas recursos en 1 instancia.
- **Horizontal**: aumentas replicas; requiere LB; leve overhead.
- **Auto-scaling**: ajusta replicas segun carga; puede tener latencia de reaccion.

## 8) Read replicas DB (nuevo)

- Modo `read_replicas` aumenta **capacidad de lectura**.
- La capacidad total queda limitada por el mix: **lecturas (%)** y **escrituras (%)**.
- Formula usada: si total RPS = X, reads=X�r, writes=X�(1-r)
  - reads <= readCap (primaria + replicas)
  - writes <= writeCap (primaria)
  - X_max = min(readCap/r, writeCap/(1-r))

## 9) LB / Service Mesh (nuevo)

- Agrega un hop y overhead, pero habilita balanceo, politicas, observabilidad.
- En el simulador: suma latencia y reduce levemente RPS.

## 10) Pool de conexiones (nuevo)

Este es un cuello de botella muy comun:

- Cada instancia tiene un `pool_per_instance` de conexiones a DB.
- La DB tiene un `db_conn_hard_limit`.
- Con varias replicas de app, el total es `pool_per_instance � replicas_app`.
- Conns efectivas = min(pool_total_app, hard_limit_db)
- Limite por pool: `RPS_pool_limit = conns_efectivas / lat_db`.
- La capacidad DB final es `RPS_db = min(cap_consultas, cap_pool_limit)`.
