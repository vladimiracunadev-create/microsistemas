# System Architect Studio

Plataforma modular de ingeniería para **clasificar, dimensionar, especificar y proyectar
la evolución** de sistemas informáticos. Parte de la suite [Microsistemas](../../README.md).

Microsistema del entorno Microsistemas: **no declara versión propia**, se versiona con la suite.
Contrato de configuración: `sas.config.v1`

## Qué es

Un motor de ingeniería de sistemas con interfaz web. Se describe un sistema mediante un
formulario de 18 secciones y la herramienta produce, de forma determinista:

- Clasificación según nueve dimensiones independientes y un catálogo de 127 tipos de sistema.
- Requisitos funcionales, no funcionales (sobre ISO/IEC 25010) y de cumplimiento, con
  criterio de aceptación y método de verificación.
- Hallazgos de compatibilidad: 39 reglas que advierten incompatibilidades reales sin
  prohibir combinaciones técnicamente válidas.
- Dimensionamiento de capacidad, donde **cada resultado declara su fórmula, sus unidades,
  sus entradas y los supuestos usados**.
- Plan de evolución temporal de horizonte libre, con etapas, hitos por condición
  observable, veinte dimensiones de análisis y plan de revisión arquitectónica.
- Arquitectura propuesta con componentes, contratos, dependencias críticas, estrategia de
  migración, gestión de obsolescencia y condiciones de rediseño.
- Entre 20 y 22 prompts por disciplina, específicos de ese sistema.
- Especificación, plan de arquitectura, plan de escalabilidad, hoja de ruta, plan de
  pruebas y un paquete ZIP con manifiesto reproducible.
- Opcionalmente: una skill reutilizable, definiciones de agentes y de sistema multiagente,
  una especificación de harness y una especificación de adaptador MCP.

**No consume tokens ni requiere servicios de IA**: la generación es determinista y
reproducible. Funciona localmente y sin Internet.

## Qué problemas resuelve

- Pasar de una idea a una especificación estructurada sin perder los supuestos por el camino.
- Dimensionar capacidad sin confundir usuarios registrados, activos y concurrentes.
- Obligar a que todo sistema tenga análisis de evolución, no solo de su carga inicial.
- Producir prompts de implementación que no sean genéricos.
- Dejar registro explícito de lo que no está decidido y de lo que no está verificado.

## Cómo se usa

### Interfaz web

La aplicación lee sus catálogos con `fetch`, por lo que necesita servirse por HTTP. Abrirla
como archivo local (`file://`) muestra un aviso y no carga los catálogos.

```bash
docker-compose up -d
```

Luego abra `http://localhost:8080/apps/SystemArchitectStudio/` (el puerto es el que
declare `docker-compose.yml`), o entre desde la tarjeta del dashboard.

Cualquier servidor estático sirve igual:

```bash
python -m http.server 8000
```

Flujo de trabajo: cargue un ejemplo del selector, recorra las secciones, observe el panel
de resultado que se recalcula con cada cambio, y exporte desde la pestaña **Exportar**.

### Línea de comandos

El mismo núcleo, sin navegador. Desde la raíz del repositorio:

```bash
node apps/SystemArchitectStudio/adapters/cli/sas.mjs ayuda
```

```bash
node apps/SystemArchitectStudio/adapters/cli/sas.mjs doctor
```

```bash
node apps/SystemArchitectStudio/adapters/cli/sas.mjs paquete apps/SystemArchitectStudio/templates/systems/c-psicometrico-educativo.json --salida=salida --zip
```

Comandos: `familias`, `tipos`, `buscar`, `tipo`, `dimensiones`, `doctor`, `ejemplos`,
`validar`, `compatibilidad`, `capacidad`, `evolucion`, `arquitectura`, `prompts`,
`especificacion`, `paquete`, `resumen`, `ayuda`. Con `--json` la salida es estructurada;
con `--fecha=<iso>` el resultado es reproducible bit a bit.

### Pruebas

```bash
node --test "apps/SystemArchitectStudio/tests/*.test.mjs"
```

## Estructura

```
apps/SystemArchitectStudio/
├── app.manifest.yml          Manifiesto que detecta el Hub
├── index.html                Interfaz
├── package.json              Módulos ES, sin dependencias externas
├── ui/                       Presentación: estilos, esquema de formulario, aplicación
├── core/                     Motor determinista, independiente de la interfaz
│   ├── schema/               Contrato sas.config.v1, migraciones, huella
│   ├── catalog/              Carga e índice del catálogo, integridad
│   ├── validation/           Validación y saneamiento de entradas
│   ├── compatibility/        Motor de reglas declarativas
│   ├── capacity/             Dimensionamiento con fórmulas y supuestos
│   ├── evolution/            Proyección temporal y plan de revisión
│   ├── architecture/         Componentes, contratos, condiciones de rediseño
│   ├── requirements/         Requisitos funcionales, no funcionales y de cumplimiento
│   ├── prompts/              Motor de prompts y generadores de artefactos
│   ├── export/               Documentos, paquete y escritor de ZIP propio
│   └── engine.js             Orquestador: único punto de entrada de los adaptadores
├── adapters/
│   ├── web/                  fetch, descargas, portapapeles, persistencia local
│   └── cli/                  sistema de archivos y salida de consola
├── data/                     Catálogos versionados en JSON
│   ├── systems/              Una familia por archivo, extensible
│   ├── dimensions.json       Dimensiones de clasificación
│   └── rules.json            Reglas de compatibilidad
├── templates/                Plantillas versionadas
│   ├── prompts/              Catálogo de disciplinas
│   ├── skills/ agents/ harness/
│   └── systems/              12 configuraciones de ejemplo (escenarios A–L)
├── tests/                    Pruebas con node --test
└── docs/                     Documentación extendida
```

El núcleo no conoce el DOM, el sistema de archivos ni la red: una configuración
equivalente produce resultados funcionalmente equivalentes en web y en CLI.

## Estado de las capacidades

### Implementado y probado

Catálogo de 127 tipos en 12 familias con pruebas de integridad y referencias cruzadas ·
9 dimensiones de clasificación · 39 reglas de compatibilidad · validación y saneamiento de
entradas · dimensionamiento con fórmulas, supuestos, rangos y cuellos de botella ·
evolución temporal con horizonte libre y escenarios sin término conocido · arquitectura
con contratos y condiciones de rediseño · requisitos sobre ISO/IEC 25010 · 22 plantillas
de prompt · cinco documentos · paquete ZIP con manifiesto reproducible · formulario
dinámico con búsqueda, campos condicionales, completitud, modo claro y oscuro,
navegación por teclado y adaptación móvil · adaptador CLI con 17 comandos · generadores
de skill, agentes, harness y especificación MCP.

### Implementado sin validar completamente

La interfaz se verificó manualmente en un navegador basado en Chromium. No hay pruebas
automatizadas de navegador: las pruebas de interfaz cubren el esquema de formulario, la
ausencia de recursos externos y la ausencia de inserción de HTML, no la interacción real.

### No implementado

- **Servidor MCP.** Existe su especificación, generada por el motor. No hay servidor.
- **Runtime de agentes.** Existen las definiciones de agente y de sistema multiagente. No
  hay ejecución.
- **Ejecución de harness.** Existe la especificación. No hay ejecución.
- **API HTTP y SDK.** Solo contratos descritos en `docs/contratos.md`.
- **Operación multiusuario.** Sin cuentas, sin organizaciones, sin persistencia central.

### Planificado

Ver [docs/roadmap.md](docs/roadmap.md).

## Limitaciones

- Las cifras de capacidad son **escenarios con supuestos declarados**, no capacidad
  verificada. Convertirlas en capacidad medida exige pruebas de carga sobre la
  implementación real.
- Las referencias a estándares son de encuadre conceptual y **no constituyen declaración
  de conformidad ni certificación**.
- **Seleccionar una jurisdicción no otorga cumplimiento legal.** Las obligaciones
  concretas requieren análisis jurídico propio.
- La herramienta no valida instrumentos psicométricos: implementar una prueba no equivale
  a validarla científicamente, y usar instrumentos protegidos requiere licencia del titular.
- La aplicación necesita HTTP para leer sus catálogos; con `file://` el navegador lo bloquea.
- Las configuraciones guardadas viven en el almacenamiento del navegador: no salen del
  equipo y no se sincronizan entre dispositivos.
- El catálogo es extensible pero no exhaustivo: para dominios no cubiertos existe la
  entrada de extensión, que no aporta capacidades ni estándares.

Detalle completo en [docs/limitaciones.md](docs/limitaciones.md).

## Documentación

| Documento | Contenido |
| --- | --- |
| [arquitectura.md](docs/arquitectura.md) | Separación de capas y responsabilidades del núcleo |
| [taxonomia.md](docs/taxonomia.md) | Modelo de taxonomías y cómo agregar tipos y familias |
| [capacidad.md](docs/capacidad.md) | Variables, fórmulas y supuestos del dimensionamiento |
| [evolucion.md](docs/evolucion.md) | Horizontes, modelos de crecimiento, etapas e hitos |
| [prompts.md](docs/prompts.md) | Motor de prompts y disciplinas cubiertas |
| [contratos.md](docs/contratos.md) | Contrato JSON, versionado y migraciones |
| [skill-agentes-mcp-harness.md](docs/skill-agentes-mcp-harness.md) | Qué es cada capa y qué no |
| [seguridad.md](docs/seguridad.md) | Tratamiento de entradas, defensas y privacidad |
| [pruebas.md](docs/pruebas.md) | Cobertura, cómo ejecutarlas y qué no cubren |
| [limitaciones.md](docs/limitaciones.md) | Lo que la herramienta no hace |
| [roadmap.md](docs/roadmap.md) | Evolución prevista |
| [ejemplos.md](docs/ejemplos.md) | Los doce escenarios de aceptación |

La skill reutilizable está en [`skills/system-architect/`](../../skills/system-architect/).

## Licencia

MIT, como el resto de la suite. Ver [LICENSE](../../LICENSE).
