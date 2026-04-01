# Catalogo de tecnologias (enfoque didactico)

Resumen de para que sirve cada opcion del simulador, cuando conviene y riesgos tipicos.

## OS

- Linux: comun en servidores y DevOps.
- Windows: frecuente en stacks .NET/IIS.

## Servidor web

- Nginx: reverse proxy, alto manejo de concurrencia.
- Apache: flexible; requiere tuning para alta concurrencia.
- IIS: integrado con Windows/.NET.
- Caddy: simple; TLS automatico en escenarios reales.

## Runtime backend

- Node.js: I/O no bloqueante, muy eficiente con muchas conexiones.
- PHP-FPM: clasico web; tuning de workers.
- Python+Gunicorn: potente; requiere tuning de workers.
- Java+Tomcat: robusto; tuning JVM.
- .NET: alto rendimiento; tuning del hosting.

## DB

- Postgres/MySQL: relacionales; escalan con replicas/sharding segun caso.
- SQL Server: enterprise; tuning/licencias.
- MongoDB: documento; cuidado con indices.
- Cassandra: distribuida; alta disponibilidad; modelado especifico.

## Cache/CDN/TLS

- Cache reduce lecturas repetidas; implica invalidacion.
- CDN descarga estaticos y acerca contenido.
- TLS cifra trafico; tiene costo computacional.

## Perfil de carga

CPU-bound · I/O-bound · DB-bound · Red-bound

## Patron de arquitectura

Monolito · 3 capas · Microservicios · Serverless

## Estrategia de escalado

- Vertical: scale-up.
- Horizontal: mas replicas.
- Auto-scaling: ajuste automatico.

## Read replicas (DB)

- Aumentan lecturas; escrituras siguen en primaria.
- Utiles si el sistema es mayoritariamente lectura.

## LB / Service Mesh

- LB (ALB/NLB): reparte trafico; overhead bajo.
- Service Mesh (Istio/Linkerd): mas control/seguridad/observabilidad; overhead mayor.

## Pool de conexiones

- Ajusta la concurrencia real hacia la DB.
- Un pool demasiado grande puede tumbar DB por conexiones; demasiado pequeno puede crear colas.
