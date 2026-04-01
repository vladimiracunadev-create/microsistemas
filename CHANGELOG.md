# Historial de Cambios (CHANGELOG)

Todos los cambios notables en este proyecto serán documentados en este archivo. El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Añadido

- **Servidor MCP Local (AI Context Layer)**: Integración "sidecar" de *Model Context Protocol* escrita en `FastMCP` de Python, orquestando una API de Solo Lectura exclusiva para clientes de Inteligencia Artificial locales (Claude Desktop, Cursor).
- **Tools MCP**: Inclusión de herramientas diagnósticas harcodeadas (`run_hub_list`, `run_hub_doctor`, `run_smoke`, `find_ports`, `read_manifest`, `read_doc`, `read_skill`) para analizar la infraestructura dockerizada, puertos o componentes del "Hub CLI", prohibiendo inyecciones con Whitelists rigurosas y mitigación de Path Traversals.
- **Resources & Prompts MCP**: Rutas pre-cocidas (`repo://`) y asistentes sistémicos (`integrar-microapp`, `auditar-manifest`, `diagnosticar-entorno`, `preparar-release-docs`) que otorgan "Memoria Institucional" estandarizada sobre la arquitectura `Microsistemas` sin sacrificar la inmutabilidad de los repositorios.

## [2.3.0] - 2026-03-05

### Añadido

- **Gobernanza Profesional y Metadatos**: Generación de archivos esenciales no-MD (`.github/CODEOWNERS`, `CITATION.cff`, `.editorconfig`, `.gitattributes`) para estandarizar la colaboración y citación académica del repositorio.
- **Escaneo de Dependencias (SecOps)**: Activación oficial de **Dependabot** (`.github/dependabot.yml`) para auditar proactivamente el ecosistema. Creación automatizada de Pull Requests para vulnerabilidades en Composer, Docker y GitHub Actions.
- **Plantillas de Issues (YAML)**: Modernización de los canales de reporte (`bug_report.yml`, `feature_request.yml`, `question.yml`, `config.yml`) para asegurar métricas y entornos consistentes en cada ticket.
- **Skills System (`skills/`)**: Sistema de playbooks reutilizables para automatizar tareas complejas de desarrollo.
  - `skills/integrar-microsistema/` → Skill de 6 pasos para integrar cualquier app nueva con coherencia total (dashboard, manifest, docs, wiki, chequeos).
  - Plantillas incluidas: `app.manifest.yml.tpl`, `dashboard-card.html.tpl`, `wiki-entry.md.tpl`.
  - Archivo `referencia.txt` con ejemplo de inputs para rápida invocación.

### Corregido

- **CI/CD Seguridad (Trivy)**: El scanner de vulnerabilidades Trivy se reemplazó por instalación directa vía `apt-get` desde el repositorio oficial de Aqua Security, resolviendo el fallo persistente de descarga del binario en el runner Ubuntu.
- **Markdown Lint**: Corregidos 31 errores de formato (MD022/MD032 — espacios en encabezados y listas) en `apps/KatasMultiLang/README.md`, `README-INTEGRACION.md`, `scripts/notes.md` y `VERSIONS_AUDIT.md`.

## [2.2.0] - 2026-03-05

### Añadido (Katas MultiLang Redesign)

- **UI Premium Glassmorphism**: Rediseño total de la interfaz con estética Slate Dark, efectos de desenfoque gaussianos y bordes translúcidos.
- **Layout Inteligente (Anti-Staggering)**: Implementación de sistema de rejilla flexible que asegura que los snippets ocupen todo el ancho disponible en una columna vertical limpia.
- **Sidebar de Control Avanzado**: Nuevo panel lateral para selección de lenguajes con indicadores de estado de alto contraste (Blue Glow).
- **Catálogo Curado (195 Casos)**: Deduplicación masiva y auditoría profunda de la base de datos de Katas, eliminando redundancias y asegurando integridad (IDS C0001-C0702 curados).

### Mejorado

- **Visibilidad Políglota**: Mejorada la distinción visual entre lenguajes activos e inactivos mediante sombreados dinámicos y tipografía de alto peso.
- **Documentación General**: Actualización completa de `RECRUITER.md`, `USER_MANUAL.md`, `SYSTEMS_CATALOG.md` y `README.md` con la nueva realidad del microsistema.

## [2.1.0] - 2026-02-18

### Añadido (AWS Assistant Pro)

- **Evolución "Pro"**: Re-branding total de `AwsGenerator` a **AWS Assistant Pro**, enfocándose en la experiencia del usuario novato.
- **Selector de Intenciones (Guided Flow)**: Nueva navegación basada en objetivos de negocio que simplifica la selección de recetas entre más de 500 opciones.
- **GlassCode Syntax Highlighting**: Resaltado de sintaxis dinámico y colorido para comandos de AWS CLI en tiempo real.
- **Semáforo de Impacto Operativo**: Indicadores visuales dinámicos de riesgo (Rojo/Amarillo/Verde) con explicaciones en lenguaje natural.
- **EduIcons (Tooltips Contextuales)**: Ayuda técnica integrada (`ⓘ`) en parámetros para facilitar el aprendizaje de la arquitectura cloud.
- **Onboarding Premium v2.0**: Nuevo modal de bienvenida con estética Glassmorphic y tutorial interactivo de 3 pasos.

### Mejorado

- **Cascada de Filtros**: Lógica inteligente que coordina Intenciones, Servicios y Categorías de forma no destructiva.
- **Dashboard de Accesos Rápidos**: Ampliación a más de 10 atajos para las tareas más frecuentes de S3, EC2, Lambda, ECS, RDS y más.
- **Documentación Completa**: Auditoría y actualización de todos los manuales (`USER_MANUAL`, `SYSTEMS_CATALOG`, `README`) para reflejar el nuevo estándar v2.1.0.

## [1.3.0] - 2026-02-18

## [1.2.2] - 2026-02-15

### Añadido

- **CicdLibrary (Nuevo Microsistema)**: Biblioteca técnica interactiva para la generación y consulta de matrices CI/CD (192 escenarios disponibles).
- **Interfaz DevOps Pro**: Implementación de un catálogo visual con búsqueda en tiempo real, modales de detalle y previsualización de código generado.
- **Automatización de Blueprints**: Motor de renderizado basado en templates Mustache para configuraciones de GitHub Actions, GitLab CI y Jenkins.

### Mejorado

- **Estructura de Carpetas**: Refactorización y limpieza de la suite de herramientas DevOps.
- **Scripts de Generación**: Actualización de la sintaxis de importación de Node.js (JSON imports via `with`) para compatibilidad con versiones modernas.

## [1.2.1] - 2026-02-11

### Añadido

- **Estándar de Salud y Monitoreo**: Implementación de endpoints `/health` (liveness) y `/ready` (readiness) en todas las micro-apps para diagnóstico operativo.
- **Hub Doctor Extendido**: Validación ampliada de puertos (8000, 8080), archivos de configuración (`.env`, `vendor`) y estado de contenedores Docker.
- **Comando `make smoke`**: Verificación rápida del ciclo completo de arranque y health check del sistema.

### Mejorado

- **Docker Compose**: Agregadas políticas de reinicio (`restart: unless-stopped`), límites de recursos (CPU/memoria) y healthchecks nativos.
- **Documentación Técnica**: Actualización de `TECHNICAL_SPECS.md`, `HUB.md` y `README.md` con el nuevo estándar de salud y procedimientos de diagnóstico.
- **Resiliencia Operativa**: Detección proactiva de contenedores "zombie" y recuperación automática de servicios fallidos.

## [1.2.0] - 2026-02-04

### Añadido

- **Microsistemas Hub (Capa de Gestión CLI)**: Nueva capa centralizada para administración de micro-apps vía línea de comandos. Implementado inicialmente en Python y migrado a Shell/Makefile para eliminar dependencias de runtime adicionales.
- **Hub CLI - Comandos**: Implementación de `list`, `run`, `up` y `doctor` mediante scripts nativos (`hub.sh`, `hub.ps1`) y detector de OS en `Makefile`.
- **Manifiestos de App**: Integración de archivos `app.manifest.yml` en todas las micro-apps para registro automático en el Hub.
- **Seguridad - Escaneo de Secretos**: Implementación de `TruffleHog` en GitHub Actions para detectar credenciales expuestas.
- **Seguridad - Pre-commit Hooks**: Configuración de `detect-secrets` y hooks de limpieza de código locales.
- **Kubernetes (K8s)**: Añadido soporte inicial para despliegue en K8s con manifiestos demo en `k8s/demo/`.

### Mejorado

- **Makefile**: Añadidos comandos para interactuar con el Hub (`make hub-*`) y K8s (`make k8s-apply`).
- **Estabilidad CI/CD**: Actualización de GitHub Actions a `v4` y correcciones en el flujo de escaneo de seguridad.
- **Documentación**: Nueva guía detallada del Hub (`docs/HUB.md`) y actualización del `README.md`.

## [1.1.0] - 2026-01-19

### Añadido

- **CapacitySim Pro - Simulación de Costos**: Estimación de costos mensuales aproximados basados en proveedores cloud seleccionados (AWS, GCP, Azure, On-Premise).
- **CapacitySim Pro - Modo Comparativo**: Funcionalidad para guardar y cargar dos escenarios distintos ("Escenario A" y "Escenario B") para análisis comparativo.
- **CapacitySim Pro - Exportación Avanzada**: Generación de reportes técnicos en formatos JSON y PDF para documentación y presentaciones.
- **CapacitySim - Selector de Proveedor Cloud**: Nuevo control UI para seleccionar proveedor de nube y calcular costos estimados.
- **CapacitySim - Botones de Gestión de Escenarios**: Controles para guardar/cargar escenarios A y B, facilitando comparaciones.
- **CapacitySim - Datos de Pricing**: Actualización de `baselines.json` con información de costos por núcleo/hora para diferentes proveedores cloud.

### Mejorado

- **CapacitySim - Interfaz de Usuario**: Diseño mejorado con controles profesionales para planificación de capacidad empresarial.
- **CapacitySim - Lógica de Cálculo**: Funciones extendidas en `logic.js` para soportar simulación de costos y gestión de escenarios.
- **CapacitySim - Estilos de Impresión**: CSS específico para generación de reportes PDF con formato profesional.

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
