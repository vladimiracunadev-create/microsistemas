# Modelo del simulador (cómo se calcula)

Este documento explica **qué significa** cada selector y cómo se transforma en una estimación de capacidad.

## 1) Qué entrega el simulador

Para una combinación (stack) calcula tres límites:

1) **Límite por CPU/App (`RPS_cpu`)**
2) **Límite por Base de Datos (`RPS_db`)**
3) **Límite por Red (`RPS_red`)**

Luego:

- **`RPS_cap = min(RPS_cpu, RPS_db, RPS_red) × safety_factor`**
- **Usuarios concurrentes ≈ `RPS_cap × latencia_endpoint`** (en segundos)

> No representa “usuarios totales del día”, sino simultaneidad aproximada bajo la latencia elegida.

## 2) Qué modela cada selector

- **OS**: eficiencia/overhead del sistema.
- **Servidor web**: manejo de conexiones, keep-alive, proxy, TLS.
- **Runtime**: baseline de RPS por core (heurístico).
- **DB**: latencia típica + conexiones por core (heurístico).
- **Contenedor / Orquestador**: overhead leve + posibilidad de escalar (operacional).
- **Caché / CDN / TLS**: efectos típicos en latencia/carga.

## 3) Qué NO hace

- No instala ni despliega stacks reales.
- No reemplaza pruebas de carga.
- No modela efectos complejos (GC, locks, hot partitions, etc.).

## 4) Cómo calibrarlo (recomendado)

1. Ejecuta pruebas (k6/Locust) en tu app real.
2. Mide RPS sostenido con p95 aceptable y errores bajos.
3. Ajusta `app/data/baselines.json` (baselines/latencias/multiplicadores).
4. Repite hasta acercarte.

## 5) Uso didáctico

Cambia **una variable a la vez** y observa cuándo el cuello de botella cambia (CPU/DB/Red).

## 6) Nuevos selectores

### Perfil de carga

- CPU-bound: límite suele ser CPU.
- I/O-bound: límite suele ser dependencias externas.
- DB-bound: DB es el cuello.
- Red-bound: payload/ancho de banda.

### Patrón de arquitectura

- Monolito: menos hops.
- 3 capas: separación clásica.
- Microservicios: más hops, mejor escalado por servicio.
- Serverless: autoescalado, posible cold start.

## 7) Estrategia de escalado (nuevo)

- **Vertical**: aumentas recursos en 1 instancia.
- **Horizontal**: aumentas réplicas; requiere LB; leve overhead.
- **Auto-scaling**: ajusta réplicas según carga; puede tener latencia de reacción.

## 8) Read replicas DB (nuevo)

- Modo `read_replicas` aumenta **capacidad de lectura**.
- La capacidad total queda limitada por el mix: **lecturas (%)** y **escrituras (%)**.
- Fórmula usada: si total RPS = X, reads=X·r, writes=X·(1-r)
  - reads <= readCap (primaria + réplicas)
  - writes <= writeCap (primaria)
  - X_max = min(readCap/r, writeCap/(1-r))

## 9) LB / Service Mesh (nuevo)

- Agrega un hop y overhead, pero habilita balanceo, políticas, observabilidad.
- En el simulador: suma latencia y reduce levemente RPS.

## 10) Pool de conexiones (nuevo)

Este es un cuello de botella muy común:

- Cada instancia tiene un `pool_per_instance` de conexiones a DB.
- La DB tiene un `db_conn_hard_limit`.
- Con varias réplicas de app, el total es `pool_per_instance × replicas_app`.
- Conns efectivas = min(pool_total_app, hard_limit_db)
- Límite por pool: `RPS_pool_limit = conns_efectivas / lat_db`.
- La capacidad DB final es `RPS_db = min(cap_consultas, cap_pool_limit)`.
