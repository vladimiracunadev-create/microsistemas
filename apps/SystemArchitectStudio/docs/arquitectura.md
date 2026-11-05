# Arquitectura interna

## Separación estricta de capas

La aplicación se divide en tres capas que no se mezclan:

```
Interfaz (ui/, index.html)
        │ solo presenta y recoge datos
        ▼
Adaptadores (adapters/web, adapters/cli)
        │ únicos que conocen fetch, Blob, portapapeles o sistema de archivos
        ▼
Núcleo (core/)
        │ funciones puras: entra configuración, sale estructura de datos
        ▼
Catálogos (data/) y plantillas (templates/)
```

El **núcleo** no conoce el DOM, la red ni el sistema de archivos. Recibe el catálogo ya
cargado y devuelve objetos. Esa es la razón por la que una configuración equivalente
produce resultados funcionalmente equivalentes desde la interfaz web, desde el adaptador
de línea de comandos y desde cualquier adaptador que se agregue después.

## Componentes del núcleo

| Módulo | Responsabilidad | Límite |
| --- | --- | --- |
| `schema/config-schema.js` | Contrato `sas.config.v1`, normalización, migraciones, huella determinista | No valida contra el catálogo |
| `catalog/catalog.js` | Carga progresiva, índice, búsqueda, integridad | No conoce el medio de lectura: recibe un `readJson` |
| `validation/validator.js` | Saneamiento de entradas, límites, validación semántica, completitud | No aplica reglas de dominio |
| `compatibility/compatibility.js` | Motor de reglas declarativas y comprobaciones derivadas del catálogo | No prohíbe: advierte |
| `capacity/capacity.js` | Dimensionamiento con fórmula, unidades, entradas y supuestos | No decide arquitectura |
| `evolution/evolution.js` | Horizonte, escenarios, etapas, hitos, plan de revisión | No recalcula capacidad: la recibe |
| `architecture/architecture.js` | Estilo, componentes, contratos, migraciones, rediseño | No implementa nada |
| `requirements/requirements.js` | Requisitos funcionales, no funcionales y de cumplimiento | No prioriza por su cuenta |
| `prompts/prompt-engine.js` | Contexto compartido y composición de prompts | No consume servicios de IA |
| `prompts/artifacts.js` | Skill, agentes, harness y especificación MCP | Genera especificaciones, no ejecuta |
| `export/export.js` | Documentos, paquete y manifiesto | No escribe en disco: devuelve contenido |
| `export/zip.js` | Escritor de ZIP sin dependencias (método almacenado) | No comprime |
| `engine.js` | Orquestador y único punto de entrada de los adaptadores | No formatea para una interfaz concreta |

## Secuencia de ejecución

`engine.analyze(config, catalog)` ejecuta siempre en este orden, porque cada paso consume
el resultado del anterior:

1. `migrateConfig` → normaliza y migra a la versión vigente del esquema.
2. `validateConfig` → errores, advertencias, informativos y completitud por sección.
3. `evaluateCompatibility` → reglas declarativas más comprobaciones derivadas del catálogo.
4. `computeCapacity` → dimensionamiento y supuestos.
5. `projectEvolution` → escenarios, etapas, hitos y plan de revisión (usa capacidad).
6. `proposeArchitecture` → estilo y componentes (usa capacidad y catálogo).
7. `deriveRequirements` → requisitos (usa capacidad y catálogo).
8. `generatePrompts` → contexto compartido y prompts por disciplina (usa todo lo anterior).
9. Artefactos opcionales: skill, agentes, harness, especificación MCP.

Que todos los prompts se construyan desde un **único contexto compartido** es lo que
garantiza que no se contradigan entre sí.

## Determinismo y reproducibilidad

- No hay llamadas a servicios externos ni a modelos.
- La huella (`configFingerprint`) se calcula sobre una serialización canónica con claves
  ordenadas, excluyendo las fechas, de modo que el mismo contenido produce la misma huella.
- Con `--fecha=<iso>` el paquete ZIP es idéntico byte a byte entre ejecuciones; la prueba
  `export.test.mjs` lo verifica comparando los bytes.
- Las versiones del catálogo, de las plantillas y del generador quedan selladas en el
  manifiesto del paquete.

## Carga progresiva del catálogo

`loadCatalog(readJson, { families })` permite traer solo las familias necesarias. La
interfaz web carga las doce; la skill y los agentes consultan por familia o por
identificador para no inflar el contexto de un modelo con 127 definiciones extensas.

## Extensión

- **Agregar un tipo de sistema o una familia:** ver [taxonomia.md](taxonomia.md). No
  requiere cambios de código.
- **Agregar una regla de compatibilidad:** una entrada en `data/rules.json` con sus
  condiciones declarativas. Tampoco requiere código.
- **Agregar un campo al formulario:** una entrada en `ui/form-schema.js` y, si es nuevo,
  su lugar en `core/schema/config-schema.js`.
- **Agregar una disciplina de prompt:** una entrada en `templates/prompts/prompt-catalog.js`.
- **Agregar un adaptador (MCP, API HTTP, SDK):** implementar un `readJson` y llamar a
  `engine.analyze`. El núcleo no cambia.

## Decisiones técnicas y por qué

| Decisión | Motivo |
| --- | --- |
| JavaScript con módulos ES, sin dependencias | El repositorio ya usa JavaScript sin dependencias en sus herramientas estáticas; evita cadena de suministro y mantiene el arranque instantáneo |
| Un solo motor en JavaScript, no replicado en PHP ni Python | Replicar el motor garantiza divergencia; el adaptador CLI usa Node sobre el mismo código |
| Catálogos en JSON, una familia por archivo | Permite agregar un sector sin tocar código ni reescribir un archivo monolítico |
| Reglas declarativas con operadores acotados | Se pueden auditar y probar; no requieren evaluar texto del usuario |
| Escritor de ZIP propio, método almacenado | Evita una dependencia externa; el método almacenado es parte del formato y lo lee cualquier herramienta |
| `fetch` para los catálogos | Mantiene los datos como datos; el costo es que la página necesita HTTP |
| Construcción del DOM con `textContent` | El contenido del usuario nunca se interpreta como HTML |
