# Hoja de Ruta (ROADMAP)

Este documento traza el camino evolutivo de **Microsistemas Suite**. Nuestra vision es crear la navaja suiza definitiva para ingenieros de software.

---

## ✅ Hitos Alcanzados (2026)

- [x] **Modularizacion Pro**: Separacion estricta de apps en `apps/`.
- [x] **Arquitectura Core**: Implementacion de Paquete PHP con Autoloading PSR-4.
- [x] **Seguridad 12-Factor**: Gestion de secretos mediante variables de entorno `.env`.
- [x] **Dockerizacion Estandarizada**: Pipeline de construccion inmutable.
- [x] **Publicacion Automatica (CI/CD)**: Despliegue automatico a GitHub Packages (v1.0.1).
- [x] **Documentacion Nivel Enterprise**: Diagramas de arquitectura y manuales avanzados.

---

## 🚀 Fase 1: Portafolio de Elite (Actual)

*Enfoque: Refinamiento visual y robustez.*

- [x] **UI Unificada (Blueprint)**: Glassmorphism / Slate Dark implementado en KatasMultiLang como estandar de la suite.
- [x] **Skills System**: Playbooks reutilizables en `skills/` para integrar microsistemas con coherencia total.
- [x] **Guias para Desarrolladores**: `skills/integrar-microsistema/skill.md` — tutorial de 6 pasos + plantillas.
- [x] **CI/CD Hardening**: Trivy instalado via APT directo; `make lint-md` + pre-push hook anti-regresion.
- [ ] **Localizacion (i18n)**: Soporte completo para Ingles y Espanol en todas las herramientas.

## 📦 Fase 2: Ecosistema Extensible

*Enfoque: Plugins y APIs.*

- [ ] **API Gateway**: Un punto de entrada JSON unico para que los microsistemas se comuniquen entre si.
- [ ] **Modulo de Autenticacion**: Sistema ligero de login para proteger la suite en servidores publicos.
- [ ] **Marketplace Local**: Facilitar la instalacion de nuevos microsistemas mediante un script de consola.

## 🔭 Fase 3: Inteligencia y Automatizacion

*Enfoque: IA y Diagnostico Proactivo.*

- [ ] **Asistente IA**: Integracion de LLMs locales para ayudar en la migracion de codigo y diagnostico de logs.
- [ ] **Monitorizacion en Tiempo Real**: Dashboards interactivos sobre el estado del servidor (CPU, RAM, Disco) integrados en el Log Viewer.

---

## Contribuciones al Roadmap

Si tienes una idea para una nueva fase o herramienta, abre un issue con la etiqueta `proposal`.
