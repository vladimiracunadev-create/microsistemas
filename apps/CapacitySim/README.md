# Ambiente Inteligente de Metricas · Planificacion de Capacidad

**Objetivo:** Estimar, comparar y validar la **capacidad de usuarios concurrentes** y **limite de RPS** (requests per second) de una arquitectura dada, mediante selectores (OS, servidor web, runtime backend, base de datos, contenedor, orquestador, cache, CDN, TLS) y parametros operativos (nucleos CPU, RAM, ancho de banda, payload promedio, complejidad del endpoint, etc.).

## ✨ Caracteristicas Pro (v1.1.0)

- 💰 **Simulacion de Costos**: Estimacion de costos mensuales aproximados segun proveedor cloud (AWS, GCP, Azure, On-Premise).
- 🔄 **Modo Comparativo**: Guarda y compara dos escenarios (A vs B) para analisis de decisiones.
- 📄 **Exportacion Avanzada**: Genera reportes tecnicos en JSON y PDF para documentacion profesional.
- ☁️ **Multi-Cloud**: Soporte para diferentes proveedores con pricing actualizado.

## 🎯 Capacidades Core

- 🧮 **Calculo rapido:** Formulas heuristicas reproducibles (CPU/DB/Red) → `RPS_cap` y `Usuarios_concurrentes`.
- 🧪 **Validacion:** Scripts de carga (k6, Locust) y guias de estres/spike/soak.
- 📊 **Observabilidad:** Dashboards base (Prometheus/Grafana) y alertas de saturacion.
- 🧰 **DevOps:** Dockerfile, ejemplo Kubernetes, CI de validacion, presets listos.
- ⚠️ **Nota:** Los valores son **heuristicos**; valide siempre con pruebas en su entorno.

> Ultima actualizacion: 2026-01-19

## 🔎 Importante: esto es un **SIMULADOR** (no instala tecnologias)

Este repositorio **no instala** Nginx, Kubernetes, Postgres, etc.

Su proposito es **didactico**: modelar combinaciones de tecnologias (por SELECT) y entregar **estimaciones** de:

- Limite aproximado de RPS (CPU / DB / Red)
- Usuarios concurrentes estimados
- Cuello de botella probable
- Supuestos y multiplicadores usados

Para llevarlo “a la vida real”, debes **calibrar** con pruebas de carga y metricas (se incluye guia).

---

## 1) Como usar

### Opcion A: UI Web (estatica)

1. Abra `index.html` en un navegador (o sirva la carpeta raiz del microsistema con cualquier servidor estatico).
2. Seleccione **stack** y parametros; obtendra:
   - `RPS_cpu`, `RPS_db`, `RPS_red`, `RPS_cap` (minimo entre limites).
   - `Usuarios_concurrentes ≈ RPS_cap × latencia_promedio (s)`.
   - Detalle de multiplicadores por componente y supuestos.

### Opcion B: CLI (Python)

```bash
python3 scripts/capacity_calc.py --os linux --web nginx --runtime node --db postgres \
  --container docker --orchestrator kubernetes --cache redis --cdn on --tls on \
  --load_profile mixed --architecture microservices --scaling_strategy horizontal --lb_mesh alb_nlb --endpoint medium \
  --cores_per_instance 8 --app_replicas 3 \
  --db_cores_primary 8 --db_replication_mode read_replicas --db_read_replicas 2 --read_ratio_pct 90 \
  --connection_pool_profile default --pool_per_instance 50 --db_conn_hard_limit 800 \
  --bandwidth_mbps 1000 --payload_kb 100
```

---

## 2) Caracteristicas Pro (v1.1.0)

### 💰 Simulacion de Costos

Selecciona un proveedor cloud en el selector **"Proveedor de Nube (Costos)"** para obtener:

- Costo estimado mensual basado en nucleos totales (App + DB)
- Pricing por hora/nucleo segun proveedor:
  - **AWS**: $0.046/core/hour (EC2/RDS estandar)
  - **GCP**: $0.038/core/hour (n2-standard con descuentos)
  - **Azure**: $0.042/core/hour (serie D-v5)
  - **On-Premise**: $0.015/core/hour (energia + mantenimiento, excluye CAPEX)

**Uso**: Ideal para presupuestos iniciales y comparacion de TCO entre proveedores.

### 🔄 Modo Comparativo (Escenarios A/B)

Compara dos configuraciones diferentes guardando escenarios:

1. **Configurar Escenario A**: Ajusta selectores y parametros → Click **"Guardar A"**
2. **Configurar Escenario B**: Modifica configuracion → Click **"Guardar B"**
3. **Comparar**: Alterna entre **"Cargar A"** y **"Cargar B"** para ver diferencias en:
   - RPS y usuarios concurrentes
   - Costos estimados
   - Cuellos de botella
   - Sugerencias de optimizacion

- **Casos de uso**:

- Comparar arquitecturas (monolito vs microservicios)
- Evaluar proveedores cloud (AWS vs GCP vs Azure)
- Analizar estrategias de escalado (vertical vs horizontal)

### 📄 Exportacion de Reportes

Genera documentacion profesional para stakeholders:

- **Exportar JSON**: Descarga configuracion completa y resultados en formato estructurado
  - Util para versionado, auditoria y automatizacion
  - Incluye todos los parametros, multiplicadores y calculos

- **Reporte PDF**: Genera documento imprimible con:
  - Resumen ejecutivo de capacidad
  - Desglose tecnico de limites (CPU/DB/Red)
  - Configuracion completa del stack
  - Sugerencias de optimizacion
  - Graficos de salud del sistema

**Uso**: Presenta resultados a equipos de arquitectura, finanzas o management.

---

## Endpoints de Monitoreo

Esta aplicacion implementa los siguientes endpoints de diagnostico:

- **/health**: Verifica que la aplicacion esta corriendo (liveness check). Retorna JSON con estado `ok`.
- **/ready**: Verifica que la aplicacion esta lista para recibir trafico (readiness check). Retorna JSON con estado de dependencias.

Para mas informacion, consulta [TECHNICAL_SPECS.md](../../docs/TECHNICAL_SPECS.md).
