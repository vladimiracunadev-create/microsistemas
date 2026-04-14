# Historial de Cambios (CHANGELOG)

Todos los cambios notables en este proyecto seran documentados en este archivo. El formato esta basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.1.0] - 2026-04-14

### Anadido — PythonEval3000 (Nuevo Microsistema)

- **PythonEval3000**: Microsistema estatico de evaluacion y estudio para Python y Data Science.
  - Banco local de **3000 preguntas** en `data/questions.quiz.json` con 4 alternativas por pregunta.
  - **Modo Evaluacion**: Lanza preguntas en orden aleatorio (seeded shuffle), marca la correcta al responder y muestra retroalimentacion contextual.
  - **Modo Explorador**: Vista paginada (15/25/50 por pagina) con revelar-respuesta, bloque de codigo y boton "Llevar a evaluacion".
  - **Filtros combinables**: Seccion, Nivel (Basica/Intermedia/Avanzada), Tipo y busqueda libre por texto normalizando acentos.
  - **Atajos de teclado**: 1–4 responden alternativa, Enter avanza, / enfoca busqueda.
  - **Persistencia**: Progreso (aciertos, errores, deck) almacenado en `localStorage` entre sesiones.
  - Tecnologia: HTML + CSS + JavaScript ES6 + JSON local. Sin framework ni backend adicional.
  - Endpoints de diagnostico: `health/` (liveness) y `ready/` (readiness).
- **Snippet de dashboard**: `snippets/dashboard-card-python-eval-3000.html` movido a la raiz del repo (ruta canonica correcta segun `INTEGRACION.md`).

### Actualizado

- `index.php`: Tarjeta de PythonEval3000 agregada al dashboard principal (capa Aprendizaje).
- `README.md`: Contador de herramientas 11 → 12; PythonEval3000 en la tabla de apps.
- `docs/SYSTEMS_CATALOG.md`: Ficha tecnica de PythonEval3000; eliminada entrada duplicada de KatasMultiLang.
- `docs/FILES_REFERENCE.md`: Tabla de apps y mapa visual actualizados (12 apps).
- `docs/USER_MANUAL.md`: Seccion de uso de PythonEval3000 con nota sobre `file://` vs servidor web.
- `docs/wiki/Catalogo-de-Sistemas.md`: Entrada nueva de PythonEval3000.
- `docs/wiki/Manual-de-Usuario.md`: Guia de uso de PythonEval3000.
- `docs/wiki/Home.md`: Version v3.1.0 en historial de la Wiki.



### Anadido — Seguridad Fase 2 y Fase 3 (hardening completo)

**Infraestructura Docker:**

- **Apache no-root**: Dockerfile configura Apache en puerto interno 8080
  (`Listen 8080`). El proceso corre como `www-data` sin necesitar root.
  Mapeo externo sin cambios: `http://localhost:8080`.
- **`docker/init-db.sh`**: Script de inicializacion opcional que crea un
  usuario MySQL con permisos minimos (`SELECT/INSERT/UPDATE/DELETE`) si se
  definen `DB_APP_USER` y `DB_APP_PASS` en `.env`.
- **`composer.lock` en repositorio**: Fija versiones exactas y hashes SHA
  de dependencias PHP, garantizando reproducibilidad y detectabilidad de
  tamperado en cadena de suministro.

**Seguridad HTTP:**

- **`.htaccess` con security headers**: `X-Frame-Options SAMEORIGIN`,
  `X-Content-Type-Options nosniff`, `Referrer-Policy`, `Permissions-Policy`
  y `Content-Security-Policy` aplicados en todas las rutas via `mod_headers`.
- **`AllowOverride All`**: Habilitado en VirtualHost del Dockerfile para que
  `.htaccess` sea procesado correctamente en Docker.
- **Autenticacion basica opcional**: Bloque `.htpasswd` comentado en
  `.htaccess` con instrucciones paso a paso para activarlo.

**SqlViewer — controles de aplicacion:**

- **CSRF**: Token por sesion generado con `bin2hex(random_bytes(32))`,
  validado con `hash_equals()` en cada POST.
- **Rate limiting**: Maximo `SQLVIEWER_RATE_LIMIT` queries por minuto por
  sesion (default: 30). Reinicio automatico del contador cada 60 segundos.
  La UI avisa cuando quedan 5 o menos consultas disponibles.
- **Modo solo lectura**: `SQLVIEWER_READONLY=true` bloquea INSERT, UPDATE,
  DELETE, DROP, ALTER, TRUNCATE y CREATE. Badge visible en la UI.
- **Whitelist de hosts**: Parametro `host` validado contra
  `SQLVIEWER_ALLOWED_HOSTS` en `.env` (default: `localhost,db,127.0.0.1`).

**CI/CD — cadena de suministro:**

- **`composer audit`**: Paso en el job `lint-php` que escanea `composer.lock`
  contra PHP Security Advisories DB y GitHub Advisory DB. Falla el build ante
  CVEs en dependencias de produccion.
- **`supply-chain-scan` (job nuevo)**: Tres controles en cada push:
  validacion de `composer.lock`, deteccion de Unicode bidi (Trojan Source,
  CVE-2021-42574) y deteccion de patrones de ofuscacion PHP/JS.

**Variables de entorno nuevas:**

- `SQLVIEWER_READONLY` (default `true`)
- `SQLVIEWER_ALLOWED_HOSTS` (default `localhost,db,127.0.0.1`)
- `SQLVIEWER_RATE_LIMIT` (default `30`)
- `DB_APP_USER` / `DB_APP_PASS` (opcionales, usuario MySQL minimo)

### Anadido — Servidor MCP Local

- **Servidor MCP Local (AI Context Layer)**: Integracion "sidecar" de
  *Model Context Protocol* escrita en `FastMCP` de Python, orquestando una
  API de Solo Lectura exclusiva para clientes de IA locales (Claude Desktop,
  Cursor). Tools: `run_hub_list`, `run_hub_doctor`, `run_smoke`,
  `find_ports`, `read_manifest`, `read_doc`, `read_skill`.
- **Resources & Prompts MCP**: Rutas pre-cocidas (`repo://`) y asistentes
  sistemicos para contexto institucional sin sacrificar inmutabilidad.

### Corregido

- **`.gitignore`**: Removidas exclusiones incorrectas de `composer.lock`
  (debe estar en repo para aplicaciones) y `.env.example` (es plantilla publica).
- **`AllowOverride None`** (default Apache): El `.htaccess` era ignorado
  completamente en Docker. Corregido via `sed` en Dockerfile.
- **`curl` ausente en imagen**: Agregado a `apt-get install` para que el
  HEALTHCHECK no falle silenciosamente.
- **`/var/lock/apache2`**: Removido del `chown` (directorio inexistente en
  imagen base). Reemplazado por `mkdir -p` sobre rutas seguras.
- **`init-db.sh` CRLF**: Agregado `*.sh text eol=lf` en `.gitattributes`
  para evitar error `bad interpreter: /bin/bash^M` en contenedores Linux.
- **MD029 en SECURITY.md**: Renumeradas listas ordenadas para cumplir
  regla de markdownlint (cada lista reinicia desde 1).

## [2.3.0] - 2026-03-05

### Anadido

- **Gobernanza Profesional y Metadatos**: Generacion de archivos esenciales no-MD (`.github/CODEOWNERS`, `CITATION.cff`, `.editorconfig`, `.gitattributes`) para estandarizar la colaboracion y citacion academica del repositorio.
- **Escaneo de Dependencias (SecOps)**: Activacion oficial de **Dependabot** (`.github/dependabot.yml`) para auditar proactivamente el ecosistema. Creacion automatizada de Pull Requests para vulnerabilidades en Composer, Docker y GitHub Actions.
- **Plantillas de Issues (YAML)**: Modernizacion de los canales de reporte (`bug_report.yml`, `feature_request.yml`, `question.yml`, `config.yml`) para asegurar metricas y entornos consistentes en cada ticket.
- **Skills System (`skills/`)**: Sistema de playbooks reutilizables para automatizar tareas complejas de desarrollo.
  - `skills/integrar-microsistema/` → Skill de 6 pasos para integrar cualquier app nueva con coherencia total (dashboard, manifest, docs, wiki, chequeos).
  - Plantillas incluidas: `app.manifest.yml.tpl`, `dashboard-card.html.tpl`, `wiki-entry.md.tpl`.
  - Archivo `referencia.txt` con ejemplo de inputs para rapida invocacion.

### Corregido

- **CI/CD Seguridad (Trivy)**: El scanner de vulnerabilidades Trivy se reemplazo por instalacion directa via `apt-get` desde el repositorio oficial de Aqua Security, resolviendo el fallo persistente de descarga del binario en el runner Ubuntu.
- **Markdown Lint**: Corregidos 31 errores de formato (MD022/MD032 - espacios en encabezados y listas) en `apps/KatasMultiLang/README.md`, `README-INTEGRACION.md`, `scripts/notes.md` y `VERSIONS_AUDIT.md`.

## [2.2.0] - 2026-03-05

### Anadido (Katas MultiLang Redesign)

- **UI Premium Glassmorphism**: Rediseno total de la interfaz con estetica Slate Dark, efectos de desenfoque gaussianos y bordes translucidos.
- **Layout Inteligente (Anti-Staggering)**: Implementacion de sistema de rejilla flexible que asegura que los snippets ocupen todo el ancho disponible en una columna vertical limpia.
- **Sidebar de Control Avanzado**: Nuevo panel lateral para seleccion de lenguajes con indicadores de estado de alto contraste (Blue Glow).
- **Catalogo Curado (195 Casos)**: Deduplicacion masiva y auditoria profunda de la base de datos de Katas, eliminando redundancias y asegurando integridad (IDS C0001-C0702 curados).

### Mejorado

- **Visibilidad Poliglota**: Mejorada la distincion visual entre lenguajes activos e inactivos mediante sombreados dinamicos y tipografia de alto peso.
- **Documentacion General**: Actualizacion completa de `RECRUITER.md`, `USER_MANUAL.md`, `SYSTEMS_CATALOG.md` y `README.md` con la nueva realidad del microsistema.

## [2.1.0] - 2026-02-18

### Anadido (AWS Assistant Pro)

- **Evolucion "Pro"**: Re-branding total de `AwsGenerator` a **AWS Assistant Pro**, enfocandose en la experiencia del usuario novato.
- **Selector de Intenciones (Guided Flow)**: Nueva navegacion basada en objetivos de negocio que simplifica la seleccion de recetas entre mas de 500 opciones.
- **GlassCode Syntax Highlighting**: Resaltado de sintaxis dinamico y colorido para comandos de AWS CLI en tiempo real.
- **Semaforo de Impacto Operativo**: Indicadores visuales dinamicos de riesgo (Rojo/Amarillo/Verde) con explicaciones en lenguaje natural.
- **EduIcons (Tooltips Contextuales)**: Ayuda tecnica integrada (`ⓘ`) en parametros para facilitar el aprendizaje de la arquitectura cloud.
- **Onboarding Premium v2.0**: Nuevo modal de bienvenida con estetica Glassmorphic y tutorial interactivo de 3 pasos.

### Mejorado

- **Cascada de Filtros**: Logica inteligente que coordina Intenciones, Servicios y Categorias de forma no destructiva.
- **Dashboard de Accesos Rapidos**: Ampliacion a mas de 10 atajos para las tareas mas frecuentes de S3, EC2, Lambda, ECS, RDS y mas.
- **Documentacion Completa**: Auditoria y actualizacion de todos los manuales (`USER_MANUAL`, `SYSTEMS_CATALOG`, `README`) para reflejar el nuevo estandar v2.1.0.

## [1.3.0] - 2026-02-18

## [1.2.2] - 2026-02-15

### Anadido

- **CicdLibrary (Nuevo Microsistema)**: Biblioteca tecnica interactiva para la generacion y consulta de matrices CI/CD (192 escenarios disponibles).
- **Interfaz DevOps Pro**: Implementacion de un catalogo visual con busqueda en tiempo real, modales de detalle y previsualizacion de codigo generado.
- **Automatizacion de Blueprints**: Motor de renderizado basado en templates Mustache para configuraciones de GitHub Actions, GitLab CI y Jenkins.

### Mejorado

- **Estructura de Carpetas**: Refactorizacion y limpieza de la suite de herramientas DevOps.
- **Scripts de Generacion**: Actualizacion de la sintaxis de importacion de Node.js (JSON imports via `with`) para compatibilidad con versiones modernas.

## [1.2.1] - 2026-02-11

### Anadido

- **Estandar de Salud y Monitoreo**: Implementacion de endpoints `/health` (liveness) y `/ready` (readiness) en todas las micro-apps para diagnostico operativo.
- **Hub Doctor Extendido**: Validacion ampliada de puertos (8000, 8080), archivos de configuracion (`.env`, `vendor`) y estado de contenedores Docker.
- **Comando `make smoke`**: Verificacion rapida del ciclo completo de arranque y health check del sistema.

### Mejorado

- **Docker Compose**: Agregadas politicas de reinicio (`restart: unless-stopped`), limites de recursos (CPU/memoria) y healthchecks nativos.
- **Documentacion Tecnica**: Actualizacion de `TECHNICAL_SPECS.md`, `HUB.md` y `README.md` con el nuevo estandar de salud y procedimientos de diagnostico.
- **Resiliencia Operativa**: Deteccion proactiva de contenedores "zombie" y recuperacion automatica de servicios fallidos.

## [1.2.0] - 2026-02-04

### Anadido

- **Microsistemas Hub (Capa de Gestion CLI)**: Nueva capa centralizada para administracion de micro-apps via linea de comandos. Implementado inicialmente en Python y migrado a Shell/Makefile para eliminar dependencias de runtime adicionales.
- **Hub CLI - Comandos**: Implementacion de `list`, `run`, `up` y `doctor` mediante scripts nativos (`hub.sh`, `hub.ps1`) y detector de OS en `Makefile`.
- **Manifiestos de App**: Integracion de archivos `app.manifest.yml` en todas las micro-apps para registro automatico en el Hub.
- **Seguridad - Escaneo de Secretos**: Implementacion de `TruffleHog` en GitHub Actions para detectar credenciales expuestas.
- **Seguridad - Pre-commit Hooks**: Configuracion de `detect-secrets` y hooks de limpieza de codigo locales.
- **Kubernetes (K8s)**: Anadido soporte inicial para despliegue en K8s con manifiestos demo en `k8s/demo/`.

### Mejorado

- **Makefile**: Anadidos comandos para interactuar con el Hub (`make hub-*`) y K8s (`make k8s-apply`).
- **Estabilidad CI/CD**: Actualizacion de GitHub Actions a `v4` y correcciones en el flujo de escaneo de seguridad.
- **Documentacion**: Nueva guia detallada del Hub (`docs/HUB.md`) y actualizacion del `README.md`.

## [1.1.0] - 2026-01-19

### Anadido

- **CapacitySim Pro - Simulacion de Costos**: Estimacion de costos mensuales aproximados basados en proveedores cloud seleccionados (AWS, GCP, Azure, On-Premise).
- **CapacitySim Pro - Modo Comparativo**: Funcionalidad para guardar y cargar dos escenarios distintos ("Escenario A" y "Escenario B") para analisis comparativo.
- **CapacitySim Pro - Exportacion Avanzada**: Generacion de reportes tecnicos en formatos JSON y PDF para documentacion y presentaciones.
- **CapacitySim - Selector de Proveedor Cloud**: Nuevo control UI para seleccionar proveedor de nube y calcular costos estimados.
- **CapacitySim - Botones de Gestion de Escenarios**: Controles para guardar/cargar escenarios A y B, facilitando comparaciones.
- **CapacitySim - Datos de Pricing**: Actualizacion de `baselines.json` con informacion de costos por nucleo/hora para diferentes proveedores cloud.

### Mejorado

- **CapacitySim - Interfaz de Usuario**: Diseno mejorado con controles profesionales para planificacion de capacidad empresarial.
- **CapacitySim - Logica de Calculo**: Funciones extendidas en `logic.js` para soportar simulacion de costos y gestion de escenarios.
- **CapacitySim - Estilos de Impresion**: CSS especifico para generacion de reportes PDF con formato profesional.

## [1.0.1] - 2026-01-17

### Anadido

- **Infraestructura CI/CD**: Flujo de GitHub Actions para publicar imagenes Docker automaticamente.
- **Dockerfile**: Receta oficial para empaquetado y distribucion del sistema.
- **Documentacion Micro-App**: Archivos README individuales para cada herramienta en `apps/`.
- **.dockerignore**: Optimizacion de la construccion de imagenes.

### Corregido

- Error de sintaxis en el flujo de publicacion de Docker (`steps.meta`).

## [1.0.0] - 2026-01-17

### Anadido

- **Arquitectura Modular**: Migracion completa de estructura plana a carpetas organizadas en `apps/`.
- **Paquete PHP con Composer**: Integracion de Autoloading PSR-4 y gestion de dependencias.
- **Micro-Apps**: Conversor, SQL Viewer, Git Trainer, Log Viewer, PHP Migrator, JS Tools y YML Generator.
- **Dashboard Profesional**: Nuevo portal de entrada con diseno Dark Mode y tipografia Inter.
- **Configuracion Core**: Clases `Database` y `Config` centralizadas en `src/`.
- **Soporte .env**: Implementacion de variables de entorno para seguridad de produccion.
- **Documentacion Enterprise**: Inclusion de `ARCHITECTURE.md`, `INSTALL.md`, `USER_MANUAL.md` y `SECURITY.md`.
- **Gobernanza**: Adicion de `LICENSE` (MIT) y `CONTRIBUTING.md`.

## [0.1.0] - 2026-01-13

### Inicial

- Primera coleccion de scripts PHP y herramientas JS dispersas en la raiz.
- Estructura basica de herramientas funcionales pero sin arquitectura modular.

---

*Nota: Las versiones anteriores a la 1.0.0 se consideran prototipos tecnicos.*
