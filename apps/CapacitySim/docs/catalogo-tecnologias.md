# Catálogo de tecnologías (enfoque didáctico)

Resumen de para qué sirve cada opción del simulador, cuándo conviene y riesgos típicos.

## OS
- Linux: común en servidores y DevOps.
- Windows: frecuente en stacks .NET/IIS.

## Servidor web
- Nginx: reverse proxy, alto manejo de concurrencia.
- Apache: flexible; requiere tuning para alta concurrencia.
- IIS: integrado con Windows/.NET.
- Caddy: simple; TLS automático en escenarios reales.

## Runtime backend
- Node.js: I/O no bloqueante, muy eficiente con muchas conexiones.
- PHP-FPM: clásico web; tuning de workers.
- Python+Gunicorn: potente; requiere tuning de workers.
- Java+Tomcat: robusto; tuning JVM.
- .NET: alto rendimiento; tuning del hosting.

## DB
- Postgres/MySQL: relacionales; escalan con réplicas/sharding según caso.
- SQL Server: enterprise; tuning/licencias.
- MongoDB: documento; cuidado con índices.
- Cassandra: distribuida; alta disponibilidad; modelado específico.

## Cache/CDN/TLS
- Cache reduce lecturas repetidas; implica invalidación.
- CDN descarga estáticos y acerca contenido.
- TLS cifra tráfico; tiene costo computacional.


## Perfil de carga
CPU-bound · I/O-bound · DB-bound · Red-bound

## Patrón de arquitectura
Monolito · 3 capas · Microservicios · Serverless


## Estrategia de escalado
- Vertical: scale-up.
- Horizontal: más réplicas.
- Auto-scaling: ajuste automático.

## Read replicas (DB)
- Aumentan lecturas; escrituras siguen en primaria.
- Útiles si el sistema es mayoritariamente lectura.


## LB / Service Mesh
- LB (ALB/NLB): reparte tráfico; overhead bajo.
- Service Mesh (Istio/Linkerd): más control/seguridad/observabilidad; overhead mayor.

## Pool de conexiones
- Ajusta la concurrencia real hacia la DB.
- Un pool demasiado grande puede tumbar DB por conexiones; demasiado pequeño puede crear colas.
