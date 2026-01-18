# PHP Migrator - Micro-App

## Descripción
Herramienta de análisis estático diseñada para ayudar en la transición de proyectos antiguos (PHP 5.4 - 7.x) hacia versiones modernas (PHP 8.2+).

## Funcionalidades
- **Detección de Funciones Obsoletas**: Encuentra `mysql_query`, `ereg`, etc.
- **Sugerencias Automáticas**: Propone equivalentes modernos (`mysqli`, `preg_replace`).
- **Refactorización de Sintaxis**: Convierte `array()` a `[]` y otras mejoras de estilo.

## Uso
Pega tu bloque de código antiguo en el área de texto y obtén instantáneamente una versión sugerida compatible con PHP 8.

## Advertencia
Esta herramienta es un asistente y no sustituye el testing manual. Siempre revisa los cambios sugeridos antes de aplicarlos en producción.
