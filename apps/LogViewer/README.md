# Log Viewer - Micro-App

## Descripcion

Visor de registros (logs) del servidor disenado para diagnosticos rapidos de errores de Apache, PHP o de la propia aplicacion.

## Seguridad

- **Whitelist**: Solo se pueden leer archivos definidos explicitamente en el codigo o via variables de entorno.
- **Solo Lectura**: No permite modificar ni borrar archivos.

## Configuracion de Rutas

Puedes anadir rutas personalizadas mediante variables de entorno siguiendo el patron:

`LOG_PATH_[NOMBRE_LOG]=/ruta/al/archivo.log`

## Detalles Tecnicos

- **Tecnologia**: PHP 8.x.
- **UI**: Diseno estilo consola oscura para mayor legibilidad.

## Endpoints de Monitoreo

Esta aplicacion implementa los siguientes endpoints de diagnostico:

- **/health**: Verifica que la aplicacion esta corriendo (liveness check). Retorna JSON con estado `ok`.
- **/ready**: Verifica que la aplicacion esta lista para recibir trafico (readiness check). Retorna JSON con estado de dependencias.

Para mas informacion, consulta [TECHNICAL_SPECS.md](../../docs/TECHNICAL_SPECS.md).
