# Clasificación de sistemas

## Dimensiones independientes

No mezcle estas dimensiones. Un sistema tiene un valor en cada una, y combinarlas es
normal: un ERP puede ser SaaS, multi-tenant, de arquitectura modular y desplegado en nube.

| Dimensión | Qué responde | Ejemplos |
| --- | --- | --- |
| Tipo funcional | Qué hace el sistema | ERP, CRM, LMS, SIEM, HIS, SCADA |
| Modelo de servicio | Cómo se entrega | SaaS, PaaS, IaaS, FaaS, DBaaS, producto instalable |
| Arquitectura | Cómo se organiza el software | monolito modular, microservicios, orientada a eventos, serverless, pipeline |
| Despliegue | Dónde se ejecuta | local, on-premise, nube, nube privada, híbrido, edge, red aislada |
| Aislamiento | Cómo se separan los clientes | monousuario, single-tenant, multi-tenant compartido o por esquema |
| Plataformas | Dónde corre el cliente | web, PWA, Windows, Linux, macOS, Android, iOS, CLI, embebido |
| Licenciamiento | Bajo qué licencia se distribuye | MIT, Apache-2.0, GPL-3.0, AGPL-3.0, propietaria, uso interno |
| Comercialización | Cómo se cobra | suscripción, pago por uso, licencia perpetua, freemium, white-label |
| Sensibilidad de datos | Qué categorías trata | públicos, internos, personales, sensibles, financieros, de tarjeta, de menores, psicométricos |
| Estilo de integración | Cómo se comunica | REST, GraphQL, gRPC, SOAP, webhooks, colas, lotes, CDC, protocolos de dominio, MCP |

El error más frecuente es responder "es un SaaS" cuando se pregunta el tipo funcional, o
"es microservicios" cuando se pregunta el modelo de servicio.

## Familias del catálogo

Doce familias, con 127 tipos de sistema en total. Consúltelas con
`node apps/SystemArchitectStudio/adapters/cli/sas.mjs familias`.

| Familia | Qué agrupa |
| --- | --- |
| `enterprise` | ERP, CRM, SCM, SRM, HCM, POS, OMS, PIM, CPQ, CLM, EPM, PPM, PSA, GRC, comercio electrónico, BI, MDM |
| `automation` | BPMS, workflow, RPA, iPaaS, ESB, minería de procesos, gestión de casos, motores de reglas, gestión documental |
| `education` | LMS, LCMS, LXP, SIS, administración de evaluaciones, banco de ítems, aplicación de pruebas, puntuación, análisis psicométrico, baremos, informes, analítica del aprendizaje, orientación vocacional, sociometría |
| `finance` | núcleo bancario, pagos, pasarela, libro contable, tesorería, créditos, KYC, AML, antifraude, pólizas, siniestros |
| `health` | HIS, EHR, LIS, RIS, PACS, apoyo a la decisión clínica, telemedicina, farmacia |
| `industry` | MES, MRP, WMS, WCS, TMS, SCADA, DCS, IoT, IIoT, CMMS, EAM |
| `science` | simulación, datos de investigación, laboratorio, cómputo de alto rendimiento, telemetría y control de misión, geoespacial, bioinformática, robótica |
| `government` | tramitación digital, archivo público, justicia, policial, emergencias, tributario, identidad ciudadana |
| `software` | ITSM, ITAM, observabilidad, CI/CD, infraestructura como código, plataforma de contenedores, API gateway, plataforma de datos, orquestación de datos, mesa de ayuda, gestión de pruebas |
| `ai` | plataforma de aprendizaje automático, MLOps, LLMOps, RAG, base vectorial, agentes, multiagente, MCP, harness, inferencia, evaluación, gobierno de IA, AIOps |
| `security` | IAM, PAM, SIEM, SOAR, EDR, NDR, DLP, CNAPP, CSPM, vulnerabilidades, forense, seguridad del desarrollo |
| `other` | medios, gestión de contenidos, reservas, facturación de servicios, gestión social, y la entrada de extensión `custom-domain` |

## Qué aporta cada entrada del catálogo

Cada tipo declara identificador, nombre canónico, sigla, sinónimos, dominio y subdominio,
descripción formal y pedagógica, capacidades habituales, relaciones, dependencias,
restricciones conocidas, estándares aplicables, fuentes, versión de la entrada y fecha.

Las **restricciones** son lo más valioso: son los modos de falla conocidos del dominio.
Un sistema de aplicación de pruebas no puede perder una respuesta ya emitida; un libro
contable no puede editar un asiento histórico; una planta industrial no puede detenerse
porque cayó un enlace de red. Incorpórelas al plan de pruebas de forma explícita.

Las **dependencias** señalan capacidades sin las cuales el tipo no produce su resultado
completo (un ERP depende de un libro contable). Las **relaciones** son sugerencias, no
obligaciones.

## Tipos no catalogados

Si el dominio no está en el catálogo, use la entrada `custom-domain` o declare un tipo
personalizado. En ese caso el motor no aporta capacidades, relaciones ni estándares: todo
lo que no se declare queda vacío y debe registrarse como decisión del usuario. Si el mismo
dominio reaparece en varios proyectos, conviene incorporarlo como entrada propia del
catálogo (`data/systems/<familia>.json`) en lugar de repetir el tipo personalizado.

## No normalizar lo que no está normalizado

No invente siglas. No trate una denominación comercial de un proveedor como si fuera un
tipo de sistema universalmente reconocido. Cuando una sigla es ambigua, dígalo: por
ejemplo, "CMS" puede ser gestión de contenidos o gestión de casos, y conviene desambiguar
antes de clasificar.
