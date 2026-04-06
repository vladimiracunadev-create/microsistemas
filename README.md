# Microsistemas - Developer Productivity Suite

[![Build](https://img.shields.io/github/actions/workflow/status/vladimiracunadev-create/microsistemas/docker-publish.yml?branch=main&label=build&logo=github)](https://github.com/vladimiracunadev-create/microsistemas/actions)
[![Version](https://img.shields.io/github/v/tag/vladimiracunadev-create/microsistemas?label=version&color=blue)](https://github.com/vladimiracunadev-create/microsistemas/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.1%2B-777BB4?logo=php&logoColor=white)](https://php.net)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![Security](https://img.shields.io/badge/security-hardened-brightgreen?logo=shield)](SECURITY.md)

Suite modular de herramientas web para diagnostico, soporte, DevOps, aprendizaje y modernizacion PHP. Unifica 11 microapps, Hub CLI, Docker, XAMPP y un servidor MCP local en una sola base de codigo.

---

## Inicio rapido

### Con Docker (recomendado)

```bash
cp .env.example .env          # 1. Configura credenciales
# Edita .env y cambia DB_PASS

make up                        # 2. Levanta contenedores
# Dashboard: http://localhost:8080
```

### Con XAMPP

```bash
git clone https://github.com/vladimiracunadev-create/microsistemas.git htdocs/microsistemas
cd htdocs/microsistemas
cp .env.example .env           # Configura DB_HOST=localhost y DB_PASS
composer install
# Accede: http://localhost/microsistemas/
```

> **Nota de instalacion:** El stack Docker corre Apache en el puerto interno 8080
> (no-root). La URL externa no cambia: `http://localhost:8080`. Ver
> [SECURITY.md](SECURITY.md) para el modelo de amenaza completo.

---

## Hub CLI

```bash
make hub-list                  # Lista todas las apps con estado
make hub-run APP=SqlViewer     # Ejecuta una app
make hub-doctor                # Diagnostico del entorno
make smoke                     # Verificacion rapida (smoke test)
make help                      # Ver todos los comandos
```

---

## Aplicaciones

| App | Capa | Descripcion |
| :--- | :--- | :--- |
| [AWS Assistant Pro](apps/AwsGenerator) | DevOps | Recetas guiadas para AWS CLI con semaforo de riesgo y resaltado de sintaxis |
| [CapacitySim](apps/CapacitySim) | DevOps | Simulador heuristico de capacidad, RPS y costos de infraestructura |
| [CicdLibrary](apps/CicdLibrary) | DevOps | Biblioteca de 192 combinaciones CI/CD para GitHub, GitLab y Jenkins |
| [SqlViewer](apps/SqlViewer) | Soporte | Inspector de BD sin clientes pesados -- modo solo lectura por defecto |
| [LogViewer](apps/LogViewer) | Soporte | Visor de logs en tiempo real con whitelist de rutas |
| [Conversor](apps/Conversor) | Soporte | Sanitizacion y codificacion segura de texto |
| [PhpMigrator](apps/PhpMigrator) | Legacy | Modernizacion de codigo PHP 5.x a estandares 8.x |
| [GitTrainer](apps/GitTrainer) | Aprendizaje | Biblioteca interactiva de comandos Git |
| [KatasMultiLang](apps/KatasMultiLang) | Aprendizaje | Comparador side-by-side de 195 katas en 67 tecnologias |
| [JsTools](apps/JsTools) | Aprendizaje | Coleccion de utilidades JavaScript para productividad |
| [YmlGenerator](apps/YmlGenerator) | Aprendizaje | Generador visual de configuraciones YAML para Docker y Kubernetes |

---

## Seguridad

Este stack aplica dos fases de hardening. **Solo uso local** -- ver
[SECURITY.md](SECURITY.md) para el modelo de amenaza completo.

**Fase 1 (Infraestructura)**

- Puertos vinculados a `127.0.0.1` (loopback) -- no accesibles desde red
- Variables de entorno obligatorias con fail-fast (sin fallback hardcodeado)
- Secret scanning con TruffleHog y Dependabot en CI
- Scan de vulnerabilidades con Trivy en cada build

**Fase 2 (Aplicacion)**

- HTTP security headers via `.htaccess` (X-Frame-Options, CSP, nosniff, Referrer-Policy)
- `SqlViewer` en modo solo lectura por defecto (`SQLVIEWER_READONLY=true`)
- Apache corre como `www-data` en puerto no privilegiado (8080)
- Script de inicializacion opcional para usuario MySQL con permisos minimos

**Variables de entorno relevantes (`.env`)**

```
DB_PASS=          # Obligatorio -- el contenedor falla si no esta definido
SQLVIEWER_READONLY=true   # Bloquea INSERT/UPDATE/DELETE en SqlViewer
DB_APP_USER=      # Opcional -- usuario MySQL con permisos minimos
DB_APP_PASS=      # Obligatorio si DB_APP_USER esta definido
```

---

## Servidor MCP local (IA)

El servidor MCP en `mcp/` expone documentacion y manifiestos del Hub a asistentes
de IA (Claude Desktop, etc.) de forma segura y de solo lectura.

Ver [mcp/README.md](mcp/README.md) para configuracion.

---

## Landing del producto

Pagina estatica disponible en `landing/` y publicada en GitHub Pages.

- Preview local: `http://localhost:8080/landing/`
- GitHub Pages: `https://vladimiracunadev-create.github.io/microsistemas/`

---

## Documentacion

### Operacion y arquitectura

| Documento | Descripcion |
| :--- | :--- |
| [INSTALL.md](docs/INSTALL.md) | Guia de instalacion detallada (Docker, XAMPP, Linux) |
| [RUNBOOK.md](RUNBOOK.md) | Manual de operacion y diagnostico |
| [HUB.md](docs/HUB.md) | Referencia completa del Hub CLI |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Diagramas Mermaid y detalles del Core |
| [OPERATING-MODES.md](OPERATING-MODES.md) | Casos y modos de ejecucion |
| [REQUIREMENTS.md](docs/REQUIREMENTS.md) | Requisitos de hardware y software |
| [COMPATIBILITY.md](COMPATIBILITY.md) | Matriz de compatibilidad y ambientes |
| [CHANGELOG.md](CHANGELOG.md) | Historial de cambios |
| [RELEASE.md](RELEASE.md) | Estrategia de versionado y entrega |

### Para desarrolladores y colaboradores

| Documento | Descripcion |
| :--- | :--- |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guia de contribucion |
| [SECURITY.md](SECURITY.md) | Politica de seguridad y modelo de amenaza |
| [RECRUITER.md](docs/RECRUITER.md) | Guia para reclutadores tecnicos |
| [BEGINNERS_GUIDE.md](docs/BEGINNERS_GUIDE.md) | Guia para nuevos colaboradores |
| [USER_MANUAL.md](docs/USER_MANUAL.md) | Manual de usuario |
| [SYSTEMS_CATALOG.md](docs/SYSTEMS_CATALOG.md) | Catalogo tecnico de cada micro-app |
| [API.md](docs/API.md) | Referencia de la API del core |
| [TECHNICAL_SPECS.md](docs/TECHNICAL_SPECS.md) | Stack y estandares tecnicos |
| [MAINTAINERS.md](docs/MAINTAINERS.md) | Guia para mantenedores |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Codigo de conducta |
| [ADR-0001](docs/adr/0001-contexto-y-decisiones-iniciales.md) | Arquitectura inicial y contexto |

---

## Contribuir

- Reportar errores: [plantilla de bug](https://github.com/vladimiracunadev-create/microsistemas/issues/new?template=bug_report.md)
- Sugerir funciones: [plantilla de feature](https://github.com/vladimiracunadev-create/microsistemas/issues/new?template=feature_request.md)
- Issues disponibles: busca etiquetas `good first issue` o `help wanted`

Los cambios en `main` requieren Pull Request con revision. El CI valida build,
lint, secretos y vulnerabilidades antes de integrar.

---

## Licencia

MIT -- ver [LICENSE](LICENSE) para detalles.

Desarrollado por [Vladimir Acuna Valdebenito](https://www.linkedin.com/in/vladimir-acu%C3%B1a-valdebenito-11924a29/).
