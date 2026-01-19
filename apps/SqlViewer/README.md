# SQL Viewer - Micro-App Multi-Motor

## Descripción
Un cliente ligero de base de datos multiplataforma diseñado para inspección rápida y ejecución de consultas SQL. Soporta múltiples motores de base de datos populares.

## Funcionalidades
- **Soporte Multi-Motor**: Compatible con MySQL, MariaDB, PostgreSQL y SQLite.
- **Explorador de Esquemas**: Visualiza tablas y vistas según el motor seleccionado.
- **Consola de Consultas**: Ejecución directa de SQL con resaltado de resultados.
- **Conectividad Dinámica**: Cambia de servidor o base de datos directamente desde la interfaz.

## Configuración
Utiliza las variables de entorno por defecto definidas en el núcleo (`.env`), pero permite personalización en tiempo de ejecución:
- `DB_DRIVER`: Motor por defecto (`mysql`, `pgsql`, `sqlite`).
- `DB_HOST`: Host o ruta del archivo de base de datos.
- `DB_USER`: Usuario (si aplica).
- `DB_PASS`: Contraseña (si aplica).

## Detalles Técnicos
- **Tecnología**: PHP 8.x, PDO (PHP Data Objects).
- **Core**: Utiliza `Microsistemas\Core\Database::getPDO()` para una gestión unificada y segura de conexiones.
- **Seguridad**: Prevención de inyección SQL mediante el uso de PDO y sanitización de salida.

