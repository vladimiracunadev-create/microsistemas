# Git Trainer - Micro-App

## Descripción

Una biblioteca interactiva diseñada para aprender y practicar los comandos de Git más utilizados en entornos reales de desarrollo.

## Funcionalidades

- **Buscador Inteligente**: Encuentra comandos por acción (ej: "eliminar rama").
- **Explicaciones Contextuales**: ¿Qué hace el comando? y ¿Cuándo usarlo?.
- **Casos de Uso**: Basado en el archivo `cases.json` con más de 1000 escenarios.

## Instalación y Requisitos

Esta herramienta utiliza `fetch()` para cargar los datos. **Requiere ser servida por un servidor web** (Apache, Nginx o Docker). No funcionará si se abre el archivo `.html` directamente desde el explorador.

## Detalles Técnicos

- **Tecnología**: JavaScript ES6, CSS Grid.
- **Fuentes**: Google Fonts (Inter).

## Endpoints de Monitoreo

Esta aplicación implementa los siguientes endpoints de diagnóstico:

- **/health**: Verifica que la aplicación está corriendo (liveness check). Retorna JSON con estado `ok`.
- **/ready**: Verifica que la aplicación está lista para recibir tráfico (readiness check). Retorna JSON con estado de dependencias.

Para más información, consulta [TECHNICAL_SPECS.md](../../docs/TECHNICAL_SPECS.md).
