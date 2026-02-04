# Especificaciones Técnicas

Este documento detalla la arquitectura, tecnologías y estándares utilizados en el proyecto para asegurar su escalabilidad y mantenibilidad.

## 🛠️ Stack Tecnológico

### Backend
- **PHP 8.2+**: Lenguaje principal para el dashboard y utilidades de servidor.
- **MySQL 8.0**: Motor de base de datos para el SQL Viewer (soporta MariaDB).
- **Composer**: Gestión de dependencias y Autoloading (PSR-4 compatible).

### Frontend
- **Vanilla JavaScript (ES6+)**: Lógica de cliente sin frameworks pesados para maximizar la velocidad.
- **CSS3 Moderno**: Uso de Variables CSS (Custom Properties), Grid Layout y Flexbox.
- **Inter Font Family**: Tipografía optimizada para lectura de código.

---

## 🏗️ Arquitectura de Software

El sistema sigue una **Arquitectura de Módulos Independientes (Micro-Apps)**.

### Características Principales:
1.  **Aislamiento de Aplicaciones**: Cada carpeta en `apps/` es un ecosistema cerrado. No comparten dependencias críticas, lo que permite actualizar una herramienta sin afectar a las otras.
2.  **Configuración via Entorno**: Implementación del patrón *12-Factor App* mediante el uso de variables de entorno (`.env`).
3.  **Portabilidad Docker**: Orquestación mediante `docker-compose` que garantiza paridad total entre el entorno de desarrollo y producción.

---

## 🔒 Seguridad e Integridad

- **Sanitización de Entradas**: Todas las herramientas que procesan texto (Conversor, Migrador) utilizan `htmlspecialchars()` y filtros de expresión regular para prevenir ataques XSS.
- **Whitelist de Archivos**: El `LogViewer` utiliza una lista blanca estricta de archivos permitidos, impidiendo la navegación arbitraria por el sistema de archivos del servidor.
- **Confirmación de Acciones Destructivas**: El `SQL Viewer` incluye disparadores de JavaScript para confirmar operaciones de escritura (`DELETE`, `DROP`, `ALTER`).

---

## 📈 Estándares de Código

- **PSR-12**: Guía de estilo de codificación PHP.
- **CamelCase**: Nomenclatura para funciones y variables en JavaScript.
- **Kebab-Case**: Nomenclatura para archivos y clases CSS.

## Mantenimiento
Para añadir un nuevo microsistema:
1. Crear carpeta en `apps/MyNewApp`.
2. Incluir `index.php` o `index.html`.
3. Registrar la aplicación en el Dashboard principal (`/index.php`).
