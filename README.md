<div align="center">

# Microsistemas

### Developer Productivity Suite

[![Build](https://img.shields.io/github/actions/workflow/status/vladimiracunadev-create/microsistemas/docker-publish.yml?branch=main&label=build&logo=github&logoColor=white)](https://github.com/vladimiracunadev-create/microsistemas/actions)
[![Version](https://img.shields.io/github/v/tag/vladimiracunadev-create/microsistemas?label=version&color=0ea5e9)](https://github.com/vladimiracunadev-create/microsistemas/releases)
[![License](https://img.shields.io/badge/license-MIT-22c55e)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.1%2B-777BB4?logo=php&logoColor=white)](https://php.net)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![Security](https://img.shields.io/badge/security-hardened-brightgreen?logo=shieldsdotio&logoColor=white)](SECURITY.md)
[![MCP](https://img.shields.io/badge/MCP-local-0ea5e9)](mcp/)
[![Pages](https://img.shields.io/badge/GitHub%20Pages-live-181717?logo=github&logoColor=white)](https://vladimiracunadev-create.github.io/microsistemas/)

<br>

Suite modular de **11 herramientas web** para diagnostico, soporte, DevOps, aprendizaje y modernizacion PHP.<br>
Unifica microapps, Hub CLI, Docker, XAMPP y servidor MCP local en una sola base de codigo.

<br>

[Ver landing](https://vladimiracunadev-create.github.io/microsistemas/) &nbsp;·&nbsp;
[Documentacion](docs/INSTALL.md) &nbsp;·&nbsp;
[Seguridad](SECURITY.md) &nbsp;·&nbsp;
[Contribuir](CONTRIBUTING.md)

</div>

---

## ⚡ Caracteristicas

<table>
<tr>
<td width="33%">

**🧩 11 microapps**<br>
Soporte, DevOps, aprendizaje y modernizacion PHP agrupadas por capa funcional.

</td>
<td width="33%">

**⌨ Hub CLI unificado**<br>
Listar, ejecutar y diagnosticar cualquier app desde una sola entrada operativa.

</td>
<td width="33%">

**🐳 Docker + XAMPP**<br>
Dos modos de uso: contenedor aislado listo en 30 segundos o servidor local sin configuracion extra.

</td>
</tr>
<tr>
<td>

**🔐 Hardening en dos fases**<br>
Puertos loopback, headers HTTP, modo solo lectura en SqlViewer, Apache no-root.

</td>
<td>

**🤖 MCP local (IA)**<br>
Servidor de contexto de solo lectura para Claude Desktop y otros asistentes.

</td>
<td>

**📦 CI/CD completo**<br>
TruffleHog, Trivy, Dependabot y markdownlint en cada push. SBOM en cada release.

</td>
</tr>
</table>

---

## 🚀 Inicio rapido

### Con Docker (recomendado)

```bash
# 1. Configura credenciales
cp .env.example .env
#    Edita .env -- cambia DB_PASS por un valor propio

# 2. Levanta el stack
make up

# 3. Abre el dashboard
#    http://localhost:8080
```

### Con XAMPP

```bash
# 1. Clona dentro de htdocs
git clone https://github.com/vladimiracunadev-create/microsistemas.git htdocs/microsistemas
cd htdocs/microsistemas

# 2. Configura entorno
cp .env.example .env
#    Ajusta DB_HOST=localhost y DB_PASS

# 3. Instala dependencias PHP
composer install

# Accede: http://localhost/microsistemas/
```

> **Nota:** El stack Docker usa el puerto interno 8080 (Apache no-root).
> La URL externa **no cambia**: `http://localhost:8080`.
> Consulta [SECURITY.md](SECURITY.md) para el modelo de amenaza completo.

---

## ⌨ Hub CLI

```bash
make hub-list                  # Lista todas las apps con su estado
make hub-run APP=SqlViewer     # Ejecuta una app en el navegador
make hub-doctor                # Diagnostico completo del entorno
make smoke                     # Verificacion rapida (smoke test)
make help                      # Todos los comandos disponibles
```

---

## 📦 Aplicaciones

| App | Capa | Descripcion |
| :--- | :---: | :--- |
| [AWS Assistant Pro](apps/AwsGenerator) | `DevOps` | Recetas guiadas para AWS CLI con semaforo de riesgo y resaltado de sintaxis |
| [CapacitySim](apps/CapacitySim) | `DevOps` | Simulador heuristico de capacidad, RPS y costos de infraestructura |
| [CicdLibrary](apps/CicdLibrary) | `DevOps` | Biblioteca de 192 combinaciones CI/CD para GitHub, GitLab y Jenkins |
| [SqlViewer](apps/SqlViewer) | `Soporte` | Inspector de BD sin clientes pesados — modo solo lectura por defecto |
| [LogViewer](apps/LogViewer) | `Soporte` | Visor de logs en tiempo real con whitelist de rutas y proteccion anti-traversal |
| [Conversor](apps/Conversor) | `Soporte` | Sanitizacion y codificacion segura de texto |
| [PhpMigrator](apps/PhpMigrator) | `Legacy` | Modernizacion de codigo PHP 5.x a estandares 8.x |
| [GitTrainer](apps/GitTrainer) | `Aprendizaje` | Biblioteca interactiva de comandos Git con guia visual |
| [KatasMultiLang](apps/KatasMultiLang) | `Aprendizaje` | Comparador side-by-side de 195 katas en 67 tecnologias |
| [JsTools](apps/JsTools) | `Aprendizaje` | Coleccion de utilidades JavaScript para productividad |
| [YmlGenerator](apps/YmlGenerator) | `Aprendizaje` | Generador visual de configuraciones YAML para Docker y Kubernetes |

---

## 🔐 Seguridad

> **Solo uso local.** Este stack no esta disenado para exposicion publica sin proxy inverso, HTTPS y autenticacion. Ver [SECURITY.md](SECURITY.md).

### Fase 1 — Infraestructura

| Control | Estado | Detalle |
| :--- | :---: | :--- |
| Puertos loopback | ✅ | MySQL y Apache vinculados a `127.0.0.1` — inaccesibles desde la red |
| Credenciales obligatorias | ✅ | Fail-fast si `DB_PASS` no esta definido — sin fallback hardcodeado |
| Secret scanning | ✅ | TruffleHog en CI + `detect-secrets` pre-commit |
| Dependency scanning | ✅ | Dependabot + Trivy en cada build |
| Versiones fijas | ✅ | Sin tags `latest` en imagenes Docker |

### Fase 2 — Aplicacion

| Control | Estado | Detalle |
| :--- | :---: | :--- |
| HTTP security headers | ✅ | X-Frame-Options, CSP, nosniff, Referrer-Policy via `.htaccess` |
| SqlViewer solo lectura | ✅ | `SQLVIEWER_READONLY=true` bloquea INSERT/UPDATE/DELETE/DROP |
| Apache no-root | ✅ | Puerto 8080 interno, proceso corre como `www-data` |
| Usuario MySQL minimo | ✅ | `docker/init-db.sh` crea usuario con permisos minimos (opcional) |

### Fase 3 — Pendiente

| Control | Estado | Detalle |
| :--- | :---: | :--- |
| CSRF en SqlViewer | ⏳ | Formulario POST sin token CSRF — pendiente en entornos expuestos |
| `composer audit` en CI | ⏳ | Auditoria de dependencias PHP no incluida en el pipeline aun |
| Rate limiting | ⏳ | Sin limite de peticiones en ejecucion de queries |
| Validacion de host (SqlViewer) | ⏳ | Parametro `host` acepta cualquier valor — podria apuntar a hosts externos |
| Autenticacion basica | ⏳ | `.htpasswd` opcional para exponer en red local controlada |

**Variables de entorno relevantes**

```bash
DB_PASS=               # Obligatorio — el contenedor falla si no esta definido
SQLVIEWER_READONLY=true  # Bloquea escritura en SqlViewer (activo por defecto)
DB_APP_USER=           # Opcional — usuario MySQL con permisos minimos
DB_APP_PASS=           # Obligatorio si DB_APP_USER esta definido
```

---

## 🤖 Servidor MCP local

El servidor en `mcp/` expone documentacion y manifiestos del Hub a asistentes de IA
(Claude Desktop, Cursor, etc.) de forma segura y de solo lectura.

Ver [mcp/README.md](mcp/README.md) para configuracion del cliente.

---

## 🌐 Landing del producto

Pagina estatica en `landing/` publicada en GitHub Pages.

| Entorno | URL |
| :--- | :--- |
| Local | `http://localhost:8080/landing/` |
| GitHub Pages | https://vladimiracunadev-create.github.io/microsistemas/ |

---

## 📚 Documentacion

<details>
<summary><strong>Operacion y arquitectura</strong></summary>

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

</details>

<details>
<summary><strong>Para desarrolladores y reclutadores</strong></summary>

| Documento | Descripcion |
| :--- | :--- |
| [SECURITY.md](SECURITY.md) | Politica de seguridad y modelo de amenaza completo |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guia de contribucion |
| [RECRUITER.md](docs/RECRUITER.md) | Tour guiado para reclutadores tecnicos |
| [BEGINNERS_GUIDE.md](docs/BEGINNERS_GUIDE.md) | Guia para nuevos colaboradores |
| [USER_MANUAL.md](docs/USER_MANUAL.md) | Manual de usuario |
| [SYSTEMS_CATALOG.md](docs/SYSTEMS_CATALOG.md) | Catalogo tecnico de cada micro-app |
| [API.md](docs/API.md) | Referencia de la API del core |
| [TECHNICAL_SPECS.md](docs/TECHNICAL_SPECS.md) | Stack y estandares tecnicos |
| [MAINTAINERS.md](docs/MAINTAINERS.md) | Guia para mantenedores |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Codigo de conducta |
| [ADR-0001](docs/adr/0001-contexto-y-decisiones-iniciales.md) | Decisiones arquitectonicas iniciales |

</details>

---

## 🤝 Contribuir

- **Reportar errores** — [plantilla de bug](https://github.com/vladimiracunadev-create/microsistemas/issues/new?template=bug_report.md)
- **Sugerir funciones** — [plantilla de feature](https://github.com/vladimiracunadev-create/microsistemas/issues/new?template=feature_request.md)
- **Resolver issues** — busca etiquetas `good first issue` o `help wanted`

Los cambios en `main` requieren Pull Request con revision. El CI valida build,
lint, secretos y vulnerabilidades antes de integrar.

---

<div align="center">

MIT &nbsp;·&nbsp; Desarrollado por [Vladimir Acuna Valdebenito](https://www.linkedin.com/in/vladimir-acu%C3%B1a-valdebenito-11924a29/)

</div>
