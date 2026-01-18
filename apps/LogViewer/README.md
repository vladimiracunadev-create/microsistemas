# Log Viewer - Micro-App

## Descripción
Visor de registros (logs) del servidor diseñado para diagnósticos rápidos de errores de Apache, PHP o de la propia aplicación.

## Seguridad
- **Whitelist**: Solo se pueden leer archivos definidos explícitamente en el código o vía variables de entorno.
- **Solo Lectura**: No permite modificar ni borrar archivos.

## Configuración de Rutas
Puedes añadir rutas personalizadas mediante variables de entorno siguiendo el patrón:
`LOG_PATH_[NOMBRE_LOG]=/ruta/al/archivo.log`

## Detalles Técnicos
- **Tecnología**: PHP 8.x.
- **UI**: Diseño estilo consola oscura para mayor legibilidad.
