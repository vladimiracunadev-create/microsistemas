# Conversor de Texto - Micro-App

## Descripción

Esta herramienta permite transformar textos con caracteres especiales o acentos en formatos compatibles con la web, evitando errores de visualización de caracteres (mojibake).

## Funcionalidades

- **HTML Numérico**: Convierte caracteres en entidades como `&#225;`.
- **HTML Nominativo**: Convierte caracteres en entidades con nombre como `&aacute;`.
- **Unicode JS**: Formatea el texto para su uso directo en scripts JavaScript (`\u00E1`).

## Uso

1. Abre el Dashboard principal.
2. Selecciona **Conversor**.
3. Pega tu texto y haz clic en **Transformar**.

## Detalles Técnicos

- **Tecnología**: HTML5 / JavaScript (Vanilla).
- **Aislamiento**: No requiere base de datos ni procesamiento de servidor complejo.

## Endpoints de Monitoreo

Esta aplicación implementa los siguientes endpoints de diagnóstico:

- **/health**: Verifica que la aplicación está corriendo (liveness check). Retorna JSON con estado `ok`.
- **/ready**: Verifica que la aplicación está lista para recibir tráfico (readiness check). Retorna JSON con estado de dependencias.

Para más información, consulta [TECHNICAL_SPECS.md](../../docs/TECHNICAL_SPECS.md).
