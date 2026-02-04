# Requisitos del Sistema 📋

Para asegurar el correcto funcionamiento de toda la suite, tu entorno debe cumplir con lo siguiente.

## 💻 Stack de Software

*   **PHP**: 8.1 o superior (recomendado 8.2).
*   **Servidor Web**: Apache 2.4+ (con `mod_rewrite`) o Nginx.
*   **Base de Datos**: MySQL 8.0+ / MariaDB 10.6+ (para micro-apps que lo requieran).
*   **Docker**: 24.0.0+ y **Docker Compose** v2.

## 🧩 Extensiones de PHP Obligatorias

Asegúrate de tener habilitadas estas extensiones en tu `php.ini`:
*   `mbstring` (Manipulación de texto)
*   `pdo_mysql` (Conectividad DB)
*   `curl` (Peticiones externas)
*   `json` (Manejo de datos)
*   `openssl` (Seguridad)

## 📦 Dependencias de Herramientas
*   **Git**: Para clonar y gestionar versiones.
*   **Composer**: Gestión de librerías PHP.
*   **Node.js / NPM** (Opcional): Requerido solo para ciertas micro-apps de frontend (ej: Git Trainer).

---
👉 **¿Listo?** Ve a la **[Guía de Instalación](Guia-de-Instalacion)**.
