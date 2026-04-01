# Conversor de Texto - Micro-App

## Descripcion

Esta herramienta permite transformar textos con caracteres especiales o acentos en formatos compatibles con la web, evitando errores de visualizacion de caracteres (mojibake).

## Funcionalidades

- **HTML Numerico**: Convierte caracteres en entidades como `&#225;`.
- **HTML Nominativo**: Convierte caracteres en entidades con nombre como `&aacute;`.
- **Unicode JS**: Formatea el texto para su uso directo en scripts JavaScript (`\u00E1`).

## Uso

1. Abre el Dashboard principal.
2. Selecciona **Conversor**.
3. Pega tu texto y haz clic en **Transformar**.

## Detalles Tecnicos

- **Tecnologia**: HTML5 / JavaScript (Vanilla).
- **Aislamiento**: No requiere base de datos ni procesamiento de servidor complejo.

## Endpoints de Monitoreo

Esta aplicacion implementa los siguientes endpoints de diagnostico:

- **/health**: Verifica que la aplicacion esta corriendo (liveness check). Retorna JSON con estado `ok`.
- **/ready**: Verifica que la aplicacion esta lista para recibir trafico (readiness check). Retorna JSON con estado de dependencias.

Para mas informacion, consulta [TECHNICAL_SPECS.md](../../docs/TECHNICAL_SPECS.md).
