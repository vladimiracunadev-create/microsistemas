# JS Tools - Micro-App

Suite local de utilidades para inspeccionar y transformar JavaScript desde el
navegador. No requiere XAMPP, Node.js ni servicios externos durante el uso.

## Estructura

| Archivo | Responsabilidad |
| :--- | :--- |
| `herramientas_javascript.html` | Interfaz canonica y controles accesibles. |
| `hj.css` | Presentacion responsiva de la herramienta. |
| `hj.js` | Acciones, descarga y ejecucion aislada. Se carga con `defer`. |
| `index.html` | Entrada compatible; redirige a la interfaz canonica. |

La separacion evita depender del orden de bloques embebidos y conserva la ruta
historica `/apps/JsTools/` usada por el dashboard.

## Funciones

- Minificar y formatear codigo.
- Validar delimitadores, strings, comentarios y declaraciones basicas.
- Ofuscar y transpilar construcciones comunes a sintaxis ES5.
- Eliminar comentarios sin alterar strings ni plantillas.
- Escapar y des-escapar strings JSON.
- Medir bytes y KiB.
- Ejecutar codigo en un `iframe` con `sandbox="allow-scripts"`, sin acceso al
  origen del dashboard, y capturar `log`, `warn`, `error`, `info`, errores no
  controlados y rechazos de promesas.
- Descargar el resultado con una extension acorde a la accion.

Las operaciones tienen implementacion local y determinista. No se descargan
librerias desde CDN, por lo que la pagina sigue operativa sin Internet y no
genera errores de carga ni amplia la politica CSP del proyecto.

## Instalacion y uso

Desde la raiz del repositorio, la opcion recomendada es Docker:

```powershell
docker compose up --build
```

Abre `http://127.0.0.1:8080/apps/JsTools/`. Tambien puede usarse el flujo PHP
CLI oficial documentado en el README principal; XAMPP no forma parte del flujo
soportado.

Pega o carga un archivo `.js`, selecciona la accion y pulsa **Aplicar**. La
salida puede copiarse, reutilizarse como entrada o descargarse.

## Verificacion

La regresion local comprueba la separacion HTML/CSS/JS y los respaldos de las
acciones principales:

```powershell
node --check apps/JsTools/hj.js
node tests/jstools_regression.js
```

CI ejecuta ambas comprobaciones cuando cambia `apps/JsTools/`.

## Endpoints de monitoreo

- `/apps/JsTools/health/`: liveness, responde JSON con estado `ok`.
- `/apps/JsTools/ready/`: readiness del microsistema.

Consulta tambien [las especificaciones tecnicas](../../docs/TECHNICAL_SPECS.md).
