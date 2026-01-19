# Ambiente Inteligente de Métricas · Planificación de Capacidad

**Objetivo:** Estimar, comparar y validar la **capacidad de usuarios concurrentes** y **límite de RPS** (requests per second) de una arquitectura dada, mediante selectores (OS, servidor web, runtime backend, base de datos, contenedor, orquestador, caché, CDN, TLS) y parámetros operativos (núcleos CPU, RAM, ancho de banda, payload promedio, complejidad del endpoint, etc.).

## ✨ Características Pro (v1.1.0)

- 💰 **Simulación de Costos**: Estimación de costos mensuales aproximados según proveedor cloud (AWS, GCP, Azure, On-Premise).
- 🔄 **Modo Comparativo**: Guarda y compara dos escenarios (A vs B) para análisis de decisiones.
- 📄 **Exportación Avanzada**: Genera reportes técnicos en JSON y PDF para documentación profesional.
- ☁️ **Multi-Cloud**: Soporte para diferentes proveedores con pricing actualizado.

## 🎯 Capacidades Core

- 🧮 **Cálculo rápido:** Fórmulas heurísticas reproducibles (CPU/DB/Red) → `RPS_cap` y `Usuarios_concurrentes`.
- 🧪 **Validación:** Scripts de carga (k6, Locust) y guías de estrés/spike/soak.
- 📊 **Observabilidad:** Dashboards base (Prometheus/Grafana) y alertas de saturación.
- 🧰 **DevOps:** Dockerfile, ejemplo Kubernetes, CI de validación, presets listos.
- ⚠️ **Nota:** Los valores son **heurísticos**; valide siempre con pruebas en su entorno.

> Última actualización: 2026-01-19

## 🔎 Importante: esto es un **SIMULADOR** (no instala tecnologías)

Este repositorio **no instala** Nginx, Kubernetes, Postgres, etc.  
Su propósito es **didáctico**: modelar combinaciones de tecnologías (por SELECT) y entregar **estimaciones** de:

- Límite aproximado de RPS (CPU / DB / Red)  
- Usuarios concurrentes estimados  
- Cuello de botella probable  
- Supuestos y multiplicadores usados  

Para llevarlo “a la vida real”, debes **calibrar** con pruebas de carga y métricas (se incluye guía).

---



## 1) Cómo usar

### Opción A: UI Web (estática)
1. Abra `index.html` en un navegador (o sirva la carpeta raíz del microsistema con cualquier servidor estático).
2. Seleccione **stack** y parámetros; obtendrá:
   - `RPS_cpu`, `RPS_db`, `RPS_red`, `RPS_cap` (mínimo entre límites).
   - `Usuarios_concurrentes ≈ RPS_cap × latencia_promedio (s)`.
   - Detalle de multiplicadores por componente y supuestos.

### Opción B: CLI (Python)
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

## 2) Características Pro (v1.1.0)

### 💰 Simulación de Costos

Selecciona un proveedor cloud en el selector **"Proveedor de Nube (Costos)"** para obtener:
- Costo estimado mensual basado en núcleos totales (App + DB)
- Pricing por hora/núcleo según proveedor:
  - **AWS**: $0.046/core/hour (EC2/RDS estándar)
  - **GCP**: $0.038/core/hour (n2-standard con descuentos)
  - **Azure**: $0.042/core/hour (serie D-v5)
  - **On-Premise**: $0.015/core/hour (energía + mantenimiento, excluye CAPEX)

**Uso**: Ideal para presupuestos iniciales y comparación de TCO entre proveedores.

### 🔄 Modo Comparativo (Escenarios A/B)

Compara dos configuraciones diferentes guardando escenarios:

1. **Configurar Escenario A**: Ajusta selectores y parámetros → Click **"Guardar A"**
2. **Configurar Escenario B**: Modifica configuración → Click **"Guardar B"**
3. **Comparar**: Alterna entre **"Cargar A"** y **"Cargar B"** para ver diferencias en:
   - RPS y usuarios concurrentes
   - Costos estimados
   - Cuellos de botella
   - Sugerencias de optimización

**Casos de uso**:
- Comparar arquitecturas (monolito vs microservicios)
- Evaluar proveedores cloud (AWS vs GCP vs Azure)
- Analizar estrategias de escalado (vertical vs horizontal)

### 📄 Exportación de Reportes

Genera documentación profesional para stakeholders:

- **Exportar JSON**: Descarga configuración completa y resultados en formato estructurado
  - Útil para versionado, auditoría y automatización
  - Incluye todos los parámetros, multiplicadores y cálculos
  
- **Reporte PDF**: Genera documento imprimible con:
  - Resumen ejecutivo de capacidad
  - Desglose técnico de límites (CPU/DB/Red)
  - Configuración completa del stack
  - Sugerencias de optimización
  - Gráficos de salud del sistema

**Uso**: Presenta resultados a equipos de arquitectura, finanzas o management.

---

## 3) Importante: esto es un **SIMULADOR** (no instala tecnologías)

Este repositorio **no instala** Nginx, Kubernetes, Postgres, etc.  
Su propósito es **didáctico**: modelar combinaciones de tecnologías (por SELECT) y entregar **estimaciones** de:

- Límite aproximado de RPS (CPU / DB / Red)  
- Usuarios concurrentes estimados  
- Cuello de botella probable  
- Supuestos y multiplicadores usados  

Para llevarlo “a la vida real”, debes **calibrar** con pruebas de carga y métricas (se incluye guía).

---
