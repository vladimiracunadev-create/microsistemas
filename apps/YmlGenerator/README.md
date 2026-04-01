# YAML Studio - Micro-App

## Descripcion

Generador visual de archivos YAML orientado a la creacion acelerada de configuraciones para Docker, Nginx y flujos de CI/CD.

## Funcionalidades

- **Editor en Tiempo Real**: Ve el resultado YAML mientras completas el formulario.
- **Plantillas Predefinidas**: Bases para servicios comunes.
- **Validacion de Sintaxis**: Evita errores de indentacion tipicos del formato YAML.

## Detalles Tecnicos

- **Tecnologia**: JavaScript, CSS Flexbox.
- **Componentes**: `ymlstudio.templates.js` (Logica de plantillas), `ymlstudio.app.js` (Logica de UI).

## Endpoints de Monitoreo

Esta aplicacion implementa los siguientes endpoints de diagnostico:

- **/health**: Verifica que la aplicacion esta corriendo (liveness check). Retorna JSON con estado `ok`.
- **/ready**: Verifica que la aplicacion esta lista para recibir trafico (readiness check). Retorna JSON con estado de dependencias.

Para mas informacion, consulta [TECHNICAL_SPECS.md](../../docs/TECHNICAL_SPECS.md).
