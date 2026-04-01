# SQL Viewer - Micro-App Multi-Motor

## Descripcion

Un cliente ligero de base de datos multiplataforma disenado para inspeccion rapida y ejecucion de consultas SQL. Soporta multiples motores de base de datos populares.

## Funcionalidades

- **Soporte Multi-Motor**: Compatible con MySQL, MariaDB, PostgreSQL y SQLite.
- **Explorador de Esquemas**: Visualiza tablas y vistas segun el motor seleccionado.
- **Consola de Consultas**: Ejecucion directa de SQL con resaltado de resultados.
- **Conectividad Dinamica**: Cambia de servidor o base de datos directamente desde la interfaz.

## Configuracion

Utiliza las variables de entorno por defecto definidas en el nucleo (`.env`), pero permite personalizacion en tiempo de ejecucion:

- `DB_DRIVER`: Motor por defecto (`mysql`, `pgsql`, `sqlite`).
- `DB_HOST`: Host o ruta del archivo de base de datos.
- `DB_USER`: Usuario (si aplica).
- `DB_PASS`: Contrasena (si aplica).

## Detalles Tecnicos

- **Tecnologia**: PHP 8.x, PDO (PHP Data Objects).
- **Core**: Utiliza `Microsistemas\Core\Database::getPDO()` para una gestion unificada y segura de conexiones.
- **Seguridad**: Prevencion de inyeccion SQL mediante el uso de PDO y sanitizacion de salida.

## Endpoints de Monitoreo

Esta aplicacion implementa los siguientes endpoints de diagnostico:

- **/health**: Verifica que la aplicacion esta corriendo (liveness check). Retorna JSON con estado `ok`.
- **/ready**: Verifica que la aplicacion esta lista para recibir trafico (readiness check). Retorna JSON con estado de dependencias.

Para mas informacion, consulta [TECHNICAL_SPECS.md](../../docs/TECHNICAL_SPECS.md).
