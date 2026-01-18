# SQL Viewer - Micro-App

## Descripción
Un cliente ligero de base de datos MySQL/MariaDB diseñado para inspección rápida y ejecución de consultas SQL sin salir del navegador.

## Funcionalidades
- **Explorador de Esquemas**: Visualiza bases de datos, tablas y vistas.
- **Consola de Consultas**: Ejecución directa de SQL.
- **Seguridad Integrada**: Sistema de confirmación para sentencias destructivas (`DELETE`, `DROP`).

## Configuración
Utiliza las variables de entorno definidas en el núcleo del sistema (`.env`).
- `DB_HOST`: Host de la base de datos (ej: `db` en Docker).
- `DB_USER`: Usuario (ej: `root`).
- `DB_PASS`: Contraseña.

## Detalles Técnicos
- **Tecnología**: PHP 8.x, MySQLi.
- **Core**: Utiliza `Microsistemas\Core\Database` para la gestión de conexiones.
