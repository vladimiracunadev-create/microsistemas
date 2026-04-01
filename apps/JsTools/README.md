# JS Tools - Micro-App

## Descripción

Suite de utilidades para procesamiento de archivos JavaScript en tiempo de desarrollo.

## Funcionalidades

- **Minificador**: Reduce el tamaño del código eliminando espacios y comentarios.
- **Beautifier**: Formatea código desordenado para hacerlo legible.
- **Ofuscador**: Protege la propiedad intelectual complicando la lectura del código.

## Detalles Técnicos

- **Tecnología**: JavaScript puro.
- **Rendimiento**: Todo el procesamiento se realiza localmente en el navegador del cliente.

## Endpoints de Monitoreo

Esta aplicación implementa los siguientes endpoints de diagnóstico:

- **/health**: Verifica que la aplicación está corriendo (liveness check). Retorna JSON con estado `ok`.
- **/ready**: Verifica que la aplicación está lista para recibir tráfico (readiness check). Retorna JSON con estado de dependencias.

Para más información, consulta [TECHNICAL_SPECS.md](../../docs/TECHNICAL_SPECS.md).
