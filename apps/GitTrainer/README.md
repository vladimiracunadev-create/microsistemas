# Git Trainer - Micro-App

## Descripcion

Una biblioteca interactiva disenada para aprender y practicar los comandos de Git mas utilizados en entornos reales de desarrollo.

## Funcionalidades

- **Buscador Inteligente**: Encuentra comandos por accion (ej: "eliminar rama").
- **Explicaciones Contextuales**: Que hace el comando? y Cuando usarlo?.
- **Casos de Uso**: Basado en el archivo `cases.json` con mas de 1000 escenarios.

## Instalacion y Requisitos

Esta herramienta utiliza `fetch()` para cargar los datos. **Requiere ser servida por un servidor web** (Apache, Nginx o Docker). No funcionara si se abre el archivo `.html` directamente desde el explorador.

## Detalles Tecnicos

- **Tecnologia**: JavaScript ES6, CSS Grid.
- **Fuentes**: Google Fonts (Inter).

## Endpoints de Monitoreo

Esta aplicacion implementa los siguientes endpoints de diagnostico:

- **/health**: Verifica que la aplicacion esta corriendo (liveness check). Retorna JSON con estado `ok`.
- **/ready**: Verifica que la aplicacion esta lista para recibir trafico (readiness check). Retorna JSON con estado de dependencias.

Para mas informacion, consulta [TECHNICAL_SPECS.md](../../docs/TECHNICAL_SPECS.md).
