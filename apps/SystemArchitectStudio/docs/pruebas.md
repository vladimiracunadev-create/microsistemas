# Pruebas

## Cómo ejecutarlas

Desde la raíz del repositorio:

```bash
node --test "apps/SystemArchitectStudio/tests/*.test.mjs"
```

O desde el directorio de la aplicación:

```bash
npm test
```

Requiere Node 20 o superior (se verificó con Node 24). Algunas pruebas de exportación
invocan `python` para abrir el ZIP generado con una herramienta independiente; si Python no
está disponible, esas pruebas fallan y hay que ejecutar el resto por archivo.

## Qué cubren

| Archivo | Cobertura |
| --- | --- |
| `catalog.test.mjs` | Integridad del catálogo, campos obligatorios, identificadores y siglas únicas, referencias cruzadas resolubles, familias mínimas, búsqueda por sigla, nombre, sinónimo y capacidad, dependencias faltantes, carga parcial por familia, rutas acotadas del lector |
| `validation.test.mjs` | Campos obligatorios, identificadores contra catálogo, opciones de dimensión, dimensión de valor único, rangos numéricos, hitos mal formados, prioridades, importación de JSON (tamaño, forma, profundidad, claves peligrosas, raíz), saneamiento de texto y números, Unicode, normalización, migración, huella determinista, serialización canónica, completitud |
| `compatibility.test.mjs` | Todos los operadores, negación, comparación entre campos, ausencia de operadores desconocidos en el catálogo, y la activación de las reglas de contradicción lógica, capacidad, arquitectura, seguridad, privacidad, psicometría, IA, operación, integración, licenciamiento, plataforma y datos |
| `capacity.test.mjs` | Fórmula de throughput, ley de Little, suma de lecturas y escrituras, prioridad de la concurrencia declarada, declaración de supuestos, almacenamiento por retención, disponibilidad, costos con y sin precios, tokens, trabajadores, escala mínima y masiva, valores extremos sin NaN ni Infinity, valores negativos, rangos, cuellos de botella, determinismo |
| `evolution.test.mjs` | Horizontes en meses, trimestres y años; horizontes de 1 a 600 meses; escenario sin término conocido; ausencia de horizonte; los siete modelos de crecimiento; composición del porcentual frente al lineal; estancamiento y disminución; escenarios derivados y declarados; monotonía del almacenamiento acumulado; las veinte dimensiones con contenido; etapas con justificación y condición de salida; hitos declarados y derivados; plan de revisión completo |
| `export.test.mjs` | Los cinco documentos con contenido, secciones de la especificación, fórmulas en el plan de escalabilidad, exigencias del plan de pruebas, artefactos solicitados y omitidos, manifiesto, reproducibilidad byte a byte del ZIP, validez del ZIP verificada con una herramienta externa, CRC-32 contra un valor conocido, Unicode dentro del ZIP, rechazo de rutas peligrosas |
| `scenarios.test.mjs` | Los doce escenarios de aceptación A–L, cada uno con validación, ausencia de errores de compatibilidad, evolución completa, arquitectura justificada, requisitos, prompts específicos y paquete coherente; más una prueba dedicada por escenario y la verificación de que los prompts no son genéricos |
| `integration.test.mjs` | Manifiesto detectable por el Hub, `index.html` presente, tarjeta en el dashboard, conservación de las doce tarjetas preexistentes, catálogo del README, entrada de CHANGELOG, coherencia de versiones, skill con frontmatter y referencias existentes, skill de integración intacta, ausencia de recursos externos y de dependencias, ausencia de `eval` y de inserción de HTML, documentación obligatoria, ejemplos válidos, ausencia de archivos vacíos, comandos del CLI documentados |

## Lo que las pruebas no cubren

- **No hay pruebas automatizadas de navegador.** No se instaló un entorno de automatización
  de navegador para no introducir dependencias en un repositorio que no las tiene. Las
  pruebas verifican el esquema de formulario, la ausencia de recursos externos y la
  ausencia de inserción de HTML, pero **no la interacción real**. La interfaz se verificó
  de forma manual.
- **No hay pruebas de rendimiento de la propia aplicación.** El motor es síncrono y opera
  sobre estructuras pequeñas; no se midió su tiempo de ejecución con catálogos mucho
  mayores.
- **No se verifica la exactitud técnica del contenido del catálogo** más allá de su
  estructura. Que una capacidad atribuida a un tipo de sistema sea la correcta es una
  afirmación de dominio sujeta a revisión humana, no algo que una prueba pueda comprobar.
- **No se verifica la calidad de los prompts generados**, solo su estructura, su
  especificidad respecto del sistema y la presencia de las secciones obligatorias.
- **No se prueba la ejecución de harness, de agentes ni del servidor MCP**, porque no
  están implementados: se prueba que sus especificaciones se generen con las secciones
  exigidas.

## Criterios de la suite

- Ninguna prueba usa resultados simulados como evidencia: el ZIP se abre con una
  herramienta externa, el CRC-32 se compara contra un valor conocido y la reproducibilidad
  se verifica comparando bytes.
- Los datos ficticios están solo en los ejemplos de `templates/systems/`, identificados
  como escenarios de aceptación.
- Las pruebas de valores extremos verifican que ningún resultado sea `NaN` ni `Infinity`,
  que es el modo de falla típico de un motor de cálculo con entradas inesperadas.
- Las pruebas de integración fallan si se rompe una aplicación preexistente del
  repositorio: la conservación de las doce tarjetas del dashboard es una prueba, no una
  revisión manual.

## Verificaciones del repositorio

Además de la suite propia:

```bash
make hub-list     # el Hub debe listar SystemArchitectStudio
make catalog      # regenera el catálogo del README desde los manifiestos
make validate     # linters y análisis estático del repositorio
make test         # verificación de manifiestos del repositorio
```

Los resultados de estas verificaciones, y cualquier comando que no se haya podido
ejecutar, se informan en el registro de la entrega.
