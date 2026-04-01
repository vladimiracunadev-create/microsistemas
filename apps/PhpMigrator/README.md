# PHP Migrator - Micro-App

## Descripcion

Herramienta de analisis estatico disenada para ayudar en la transicion de proyectos antiguos (PHP 5.4 - 7.x) hacia versiones modernas (PHP 8.2+).

## Funcionalidades

- **Deteccion de Funciones Obsoletas**: Encuentra `mysql_query`, `ereg`, etc.
- **Sugerencias Automaticas**: Propone equivalentes modernos (`mysqli`, `preg_replace`).
- **Refactorizacion de Sintaxis**: Convierte `array()` a `[]` y otras mejoras de estilo.

## Uso

Pega tu bloque de codigo antiguo en el area de texto y obten instantaneamente una version sugerida compatible con PHP 8.

## Advertencia

Esta herramienta es un asistente y no sustituye el testing manual. Siempre revisa los cambios sugeridos antes de aplicarlos en produccion.

## Endpoints de Monitoreo

Esta aplicacion implementa los siguientes endpoints de diagnostico:

- **/health**: Verifica que la aplicacion esta corriendo (liveness check). Retorna JSON con estado `ok`.
- **/ready**: Verifica que la aplicacion esta lista para recibir trafico (readiness check). Retorna JSON con estado de dependencias.

Para mas informacion, consulta [TECHNICAL_SPECS.md](../../docs/TECHNICAL_SPECS.md).
