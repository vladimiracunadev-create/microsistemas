# Historial de Cambios (CHANGELOG)

Todos los cambios notables en este proyecto serán documentados en este archivo. El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-01-17
### Añadido
- **Infraestructura CI/CD**: Flujo de GitHub Actions para publicar imágenes Docker automáticamente.
- **Dockerfile**: Receta oficial para empaquetado y distribución del sistema.
- **Documentación Micro-App**: Archivos README individuales para cada herramienta en `apps/`.
- **.dockerignore**: Optimización de la construcción de imágenes.

### Corregido
- Error de sintaxis en el flujo de publicación de Docker (`steps.meta`).

## [1.0.0] - 2026-01-17
### Añadido
- **Arquitectura Modular**: Migración completa de estructura plana a carpetas organizadas en `apps/`.
- **Paquete PHP con Composer**: Integración de Autoloading PSR-4 y gestión de dependencias.
- **Micro-Apps**: Conversor, SQL Viewer, Git Trainer, Log Viewer, PHP Migrator, JS Tools y YML Generator.
- **Dashboard Profesional**: Nuevo portal de entrada con diseño Dark Mode y tipografía Inter.
- **Configuración Core**: Clases `Database` y `Config` centralizadas en `src/`.
- **Soporte .env**: Implementación de variables de entorno para seguridad de producción.
- **Documentación Enterprise**: Inclusión de `ARCHITECTURE.md`, `INSTALL.md`, `USER_MANUAL.md` y `SECURITY.md`.
- **Gobernanza**: Adición de `LICENSE` (MIT) y `CONTRIBUTING.md`.

## [0.1.0] - 2026-01-13
### Inicial
- Primera colección de scripts PHP y herramientas JS dispersas en la raíz.
- Estructura básica de herramientas funcionales pero sin arquitectura modular.

---
*Nota: Las versiones anteriores a la 1.0.0 se consideran prototipos técnicos.*
