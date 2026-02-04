# Seguridad del Hub - Microsistemas

Este documento define las políticas de seguridad para la capa HUB.

## Lista de Aplicaciones Permitidas (Allowlist)
Solo las aplicaciones presentes en el directorio `apps/` con un archivo `app.manifest.yml` válido pueden ser gestionadas por el Hub.

- CapacitySim
- Conversor
- GitTrainer
- JsTools
- LogViewer
- PhpMigrator
- SqlViewer
- YmlGenerator

## Restricciones de Ejecución
- El Hub solo puede ejecutar comandos definidos en `run_cmd` de los manifiestos.
- No se permiten rutas absolutas fuera de la raíz del repositorio en los comandos de ejecución.
- Límites de recursos: Se recomienda ejecutar el Hub en entornos con límites de CPU y Memoria (Docker/k8s).

## Bloqueo de Rutas
El Hub valida que todas las operaciones se realicen dentro de `c:/xampp/htdocs/microsistemas/Microsistemas/apps/`. Cualquier intento de acceder a archivos fuera de esta ruta será bloqueado.
