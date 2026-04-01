# JS Tools - Micro-App

## Descripcion

Suite de utilidades para procesamiento de archivos JavaScript en tiempo de desarrollo.

## Funcionalidades

- **Minificador**: Reduce el tamano del codigo eliminando espacios y comentarios.
- **Beautifier**: Formatea codigo desordenado para hacerlo legible.
- **Ofuscador**: Protege la propiedad intelectual complicando la lectura del codigo.

## Detalles Tecnicos

- **Tecnologia**: JavaScript puro.
- **Rendimiento**: Todo el procesamiento se realiza localmente en el navegador del cliente.

## Endpoints de Monitoreo

Esta aplicacion implementa los siguientes endpoints de diagnostico:

- **/health**: Verifica que la aplicacion esta corriendo (liveness check). Retorna JSON con estado `ok`.
- **/ready**: Verifica que la aplicacion esta lista para recibir trafico (readiness check). Retorna JSON con estado de dependencias.

Para mas informacion, consulta [TECHNICAL_SPECS.md](../../docs/TECHNICAL_SPECS.md).
