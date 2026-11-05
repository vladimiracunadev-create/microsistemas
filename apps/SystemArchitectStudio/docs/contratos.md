# Contratos JSON, versionado y migraciones

## El contrato compartido

`sas.config.v1` es el contrato único entre la interfaz web, el adaptador de línea de
comandos y cualquier adaptador futuro. Está definido en
`core/schema/config-schema.js`, que es la única fuente de verdad: `defaultConfig()`
describe la estructura completa y `normalizeConfig()` garantiza que todas las claves
existan con un tipo coherente, sin inventar valores.

Esto es lo que hace cierta la afirmación "una configuración equivalente produce resultados
funcionalmente equivalentes desde web, CLI y cualquier adaptador": todos consumen el mismo
esquema y el mismo núcleo.

## Estructura de la configuración

```
schemaVersion                     "sas.config.v1"
meta                              configId, title, configVersion, createdAt, updatedAt, generatorVersion
identity                          name, purpose, mode, audience, owner, existingSystem{…}
classification                    systemTypes[], sectors[], customTypes[],
                                  serviceModel[], architecture[], deployment[], tenancy,
                                  platforms[], licensing, monetization[],
                                  dataSensitivity[], integrationStyle[]
functional                        capabilities[], processes[], roles[], organizations{…}, integrations[]
technology                        languages[], frameworks[], databases[], infrastructure[],
                                  offlineSupport, transactionalIntegrity, consistencyStrategy, aiUsage{…}
security                          mfa, encryptionAtRest, encryptionInTransit,
                                  rowLevelAuthorization, auditTrail, consentManagement,
                                  secretsManagement, threatModel
compliance                        jurisdictions[], regulations[], standards[], dataResidency, auditRequirements
capacity                          23 campos de demanda, mezcla, distribución y objetivos
evolution                         horizon{unit,value,openEnded}, growthModel, growthRatePercent,
                                  scenarios{conservative,expected,demanding}, milestones[],
                                  plannedChanges[], reviewFrequencyMonths
quality                           priorities{}, accessibilityTarget, rpoMinutes, rtoMinutes, testStrategy[]
operations                        teamSize, onCall, observability, loadTesting, environments[],
                                  supportHours, monthlyBudgetUsd, unitCosts{…}
deliverables                      prompts[], includeSkill, includeAgents, includeHarness, includeMcp
decisions                         assumptions[], pending[]
notes                             texto libre
```

Ninguna configuración necesita estar completa. Lo no declarado queda como decisión
pendiente o produce un supuesto declarado del motor, nunca un valor silencioso.

## Reglas de evolución del esquema

1. La versión usa el formato `sas.config.vN`.
2. Toda versión anterior debe tener una migración registrada en `MIGRATIONS`.
3. Nunca se elimina un campo sin migración: se marca obsoleto y se traduce.
4. `SUPPORTED_SCHEMA_VERSIONS` lista las versiones vigentes.

## Cómo publicar `sas.config.v2`

1. Cambie `CONFIG_SCHEMA_VERSION` a `'sas.config.v2'`.
2. Registre la migración:

   ```js
   export const MIGRATIONS = Object.freeze({
     'sas.config.v1': (cfg) => ({
       ...cfg,
       schemaVersion: 'sas.config.v2',
       // traducir aquí los campos que cambiaron
     })
   });
   ```

3. Actualice `defaultConfig()` y `FIELD_META`.
4. Agregue una prueba que tome una configuración v1 real (por ejemplo un ejemplo de
   `templates/systems/`) y verifique que migra sin pérdida.

`migrateConfig()` aplica la cadena de migraciones hasta la versión vigente, devuelve la
lista de migraciones aplicadas y, si no encuentra ruta desde una versión desconocida,
**avisa en lugar de fallar en silencio**: normaliza con los valores por defecto y pide
revisar el resultado.

## Compatibilidad de configuraciones entre versiones

Una configuración exportada con una versión anterior se puede volver a importar: el motor
la migra al abrirla. La interfaz muestra el aviso de migración en la pestaña de
validación. Lo que no se garantiza es que el **resultado** sea idéntico: si una versión
nueva corrige una fórmula o agrega una regla, el análisis cambia, y esa es la razón de que
el manifiesto del paquete sella la versión del generador, del catálogo y de las plantillas.

## Huella y reproducibilidad

`configFingerprint(config)` calcula un hash FNV-1a de 32 bits sobre una serialización
canónica con claves ordenadas, **excluyendo** `meta.createdAt`, `meta.updatedAt` y
`meta.configId`. Así, dos configuraciones con el mismo contenido tienen la misma huella
aunque se hayan guardado en momentos distintos.

La huella aparece en cada prompt, en cada documento, en el manifiesto del paquete y en el
nombre del archivo ZIP. Sirve para responder "¿este documento corresponde a esta
configuración?" sin comparar el contenido completo.

## Contratos de los catálogos

| Archivo | Versión | Contenido |
| --- | --- | --- |
| `data/systems/index.json` | `sas.catalog-index.v1` | Lista de archivos de familia |
| `data/systems/<familia>.json` | — | `{ family, systems[] }` |
| `data/dimensions.json` | `sas.dimensions.v1` | Dimensiones y sus opciones |
| `data/rules.json` | `sas.rules.v1` | Reglas declarativas |
| `templates/systems/index.json` | `sas.examples.v1` | Índice de ejemplos |

Los catálogos se versionan de forma independiente del código que los consume, para poder
corregir una definición sin publicar una versión del motor.

## Contratos para interfaces futuras

Estos contratos están **descritos, no implementados**:

- **API HTTP.** Un recurso por operación del motor (`/validate`, `/compatibility`,
  `/capacity`, `/evolution`, `/architecture`, `/prompts`, `/specification`), todas con
  cuerpo `sas.config.v1` y respuesta JSON equivalente a la salida del núcleo. Descripción
  en OpenAPI, errores en formato estructurado.
- **SDK.** Envoltorio del núcleo con el mismo `analyze(config, catalog)`; no agrega
  lógica, solo resuelve la carga del catálogo.
- **MCP.** Recursos de solo lectura y herramientas sin efecto, detalladas en
  [skill-agentes-mcp-harness.md](skill-agentes-mcp-harness.md).
- **GitHub Actions / GitLab CI.** Invocación del adaptador CLI con `--json` y publicación
  del paquete como artefacto de la ejecución.
- **Plugins e IDE.** Consumo del núcleo como módulo ES, con el mismo contrato.

Ninguna de estas capacidades depende del formulario: el formulario es un productor de
configuraciones, no el origen de la lógica.
