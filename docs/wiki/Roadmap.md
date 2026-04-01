# Hoja de Ruta (ROADMAP)

Este documento traza el camino evolutivo de **Microsistemas Suite**. Nuestra visión es crear la navaja suiza definitiva para ingenieros de software.

---

## ✅ Hitos Alcanzados (2026)

- [x] **Modularización Pro**: Separación estricta de apps en `apps/`.
- [x] **Arquitectura Core**: Implementación de Paquete PHP con Autoloading PSR-4.
- [x] **Seguridad 12-Factor**: Gestión de secretos mediante variables de entorno `.env`.
- [x] **Dockerización Estandarizada**: Pipeline de construcción inmutable.
- [x] **Publicación Automática (CI/CD)**: Despliegue automático a GitHub Packages (v1.0.1).
- [x] **Documentación Nivel Enterprise**: Diagramas de arquitectura y manuales avanzados.

---

## 🚀 Fase 1: Portafolio de Élite (Actual)

*Enfoque: Refinamiento visual y robustez.*

- [x] **UI Unificada (Blueprint)**: Glassmorphism / Slate Dark implementado en KatasMultiLang como estándar de la suite.
- [x] **Skills System**: Playbooks reutilizables en `skills/` para integrar microsistemas con coherencia total.
- [x] **Guías para Desarrolladores**: `skills/integrar-microsistema/skill.md` — tutorial de 6 pasos + plantillas.
- [x] **CI/CD Hardening**: Trivy instalado vía APT directo; `make lint-md` + pre-push hook anti-regresión.
- [ ] **Localización (i18n)**: Soporte completo para Inglés y Español en todas las herramientas.

## 📦 Fase 2: Ecosistema Extensible

*Enfoque: Plugins y APIs.*

- [ ] **API Gateway**: Un punto de entrada JSON único para que los microsistemas se comuniquen entre sí.
- [ ] **Módulo de Autenticación**: Sistema ligero de login para proteger la suite en servidores públicos.
- [ ] **Marketplace Local**: Facilitar la instalación de nuevos microsistemas mediante un script de consola.

## 🔭 Fase 3: Inteligencia y Automatización

*Enfoque: IA y Diagnóstico Proactivo.*

- [ ] **Asistente IA**: Integración de LLMs locales para ayudar en la migración de código y diagnóstico de logs.
- [ ] **Monitorización en Tiempo Real**: Dashboards interactivos sobre el estado del servidor (CPU, RAM, Disco) integrados en el Log Viewer.

---

## Contribuciones al Roadmap

Si tienes una idea para una nueva fase o herramienta, abre un issue con la etiqueta `proposal`.
