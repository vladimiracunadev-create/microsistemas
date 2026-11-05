# Seguridad y privacidad

## Modelo de amenazas de la propia aplicación

La aplicación corre en el navegador de una persona, sin backend, sin cuentas y sin enviar
nada a ningún servicio. Eso elimina clases enteras de riesgo, pero deja tres superficies
reales:

1. **Entradas del formulario y archivos importados.** Texto arbitrario que luego se pinta
   en la interfaz y se incorpora a los documentos exportados.
2. **El propio navegador.** Almacenamiento local, portapapeles y descargas.
3. **Los catálogos.** Archivos JSON del repositorio que se leen al iniciar.

## Todas las entradas se tratan como no confiables

Incluso las que escribe la propia persona, porque un archivo importado puede venir de
cualquier parte.

| Defensa | Dónde | Qué hace |
| --- | --- | --- |
| Límite de tamaño | `parseConfigJson` | Rechaza por encima de 2 MB antes de parsear |
| Validación de forma | `assertSafeStructure` | Rechaza profundidad mayor que 12, más de 500 elementos por lista, más de 200 claves por objeto y tipos no serializables |
| Claves prohibidas | `assertSafeStructure` | Rechaza `__proto__`, `constructor` y `prototype`: evita contaminación de prototipo |
| Raíz obligatoria | `parseConfigJson` | Solo acepta un objeto JSON; rechaza arreglos y escalares |
| Saneamiento de texto | `sanitizeText` | Elimina caracteres de control, normaliza saltos de línea y acota longitud |
| Saneamiento numérico | `sanitizeNumber` | Descarta valores no finitos y acota al rango |
| Validación semántica | `validateConfig` | Verifica identificadores contra el catálogo y la coherencia de las magnitudes |
| Límite de archivo subido | `readUploadedFile` | Rechaza antes de leer, por tamaño |
| Rutas acotadas | `createFsReader`, `createZip` | Rechazan rutas con `..` |

Cada defensa tiene su prueba en `tests/validation.test.mjs`, incluida la verificación de
que una carga con `__proto__` no contamina `Object.prototype`.

## Codificación segura y protección frente a XSS

La interfaz **nunca** inserta contenido como HTML. Todo nodo se crea con
`document.createElement` y todo texto se asigna con `textContent`. El ayudante `el()` no
acepta una propiedad `html`, y las pruebas verifican que en `ui/` y `adapters/web/` no
exista ninguna asignación a `innerHTML`, `outerHTML`, `insertAdjacentHTML` ni
`document.write`.

Esto significa que si alguien escribe `<script>…</script>` en el nombre del sistema, se
muestra como texto y se exporta como texto: no se ejecuta en ningún punto.

## Protección contra ejecución de código

No se usa `eval`, no se construyen funciones desde texto, y no se pasa texto a
`setTimeout` ni a `setInterval`. Las reglas de compatibilidad son **declarativas**: una
lista acotada de operadores (`includes`, `gt`, `isEmpty`, …) aplicados a rutas de la
configuración. Un operador desconocido no hace que la regla se cumpla; simplemente no se
cumple y queda registrado.

La prueba `integration.test.mjs` recorre todos los archivos `.js`, `.mjs` y `.html` de la
aplicación y falla si encuentra alguna de esas construcciones.

## Sin dependencias y sin recursos externos

- `package.json` no declara dependencias ni dependencias de desarrollo, y la prueba lo
  verifica.
- Todo `import` apunta a una ruta relativa o a `node:`; la prueba falla ante cualquier
  paquete externo.
- Ningún archivo HTML, CSS o JavaScript referencia una URL externa: sin CDN, sin fuentes
  remotas, sin analítica. La prueba recorre los archivos y lo comprueba.
- El escritor de ZIP es propio, precisamente para no introducir una dependencia de
  terceros en la cadena de suministro por una funcionalidad de exportación.

Consecuencia práctica: la aplicación funciona sin Internet y no hay revisión de licencias
de terceros pendiente, porque no hay terceros.

## Privacidad de los datos de la persona

- **Nada sale del equipo.** No hay peticiones de red salvo la lectura de los catálogos del
  propio repositorio.
- **La persistencia es opcional y controlada.** Guardar una configuración ocurre solo
  cuando la persona pulsa Guardar, se almacena en `localStorage` de ese navegador, y hay
  función para eliminarla. Nunca se guarda de forma automática.
- **Las exportaciones son locales.** Se generan en memoria y se descargan como archivo.
- **El tema (claro u oscuro) es la única preferencia que se recuerda sin pedirlo.**
- Todos los accesos a `localStorage` están envueltos en `try/catch`: en modo privado o con
  el almacenamiento bloqueado la aplicación sigue funcionando y lo informa.

## Prompt injection en integraciones futuras

La aplicación no consume modelos, así que hoy no tiene esa superficie. Pero sí **genera**
artefactos para sistemas que sí los consumen, y ahí la herramienta es explícita:

- Las plantillas de prompt incluyen la instrucción de tratar todo contenido recuperado o
  provisto por terceros como entrada no confiable, que puede contener instrucciones
  inyectadas.
- La especificación de harness exige que los permisos **no** se amplíen por el contenido
  que el agente lee.
- La regla `R-AI-002` advierte cuando hay recuperación aumentada sin autorización a nivel
  de documento: sin ella el sistema puede exponer contenido al que la persona no tiene
  acceso en el repositorio de origen.
- La especificación MCP mantiene todas las herramientas en solo lectura.

## Lo que la aplicación no protege

- No cifra las configuraciones guardadas en el navegador. Si el equipo es compartido, no
  guarde información sensible: exporte el JSON y custódielo fuera.
- No controla qué hace la persona con los documentos exportados.
- No valida que las obligaciones normativas declaradas sean correctas: eso requiere
  análisis jurídico propio.
- No audita el sistema que usted está diseñando: produce sus requisitos de seguridad, no
  su verificación.

## Seguridad del sistema diseñado

Para el sistema que se está especificando, el motor:

- Genera requisitos de seguridad y privacidad con criterio de aceptación y método de
  verificación, proporcionales a la sensibilidad declarada.
- Advierte con reglas concretas: datos de tarjeta sin PCI declarado, datos sensibles sin
  cifrado en reposo, datos de menores sin gestión de consentimiento, sistemas de alto
  impacto sin segundo factor, red aislada con inferencia remota, retención no declarada
  sobre datos personales, integridad registral sin integridad transaccional.
- Traslada las restricciones del catálogo del dominio al plan de pruebas.
- Incluye el prompt de seguridad y el de privacidad, que exigen declarar la **cobertura
  real** del análisis: lo que no se revisó no está aprobado, está sin evaluar.
