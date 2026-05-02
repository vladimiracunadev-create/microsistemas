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

Suite modular de **12 herramientas web** para diagnostico, soporte, DevOps, aprendizaje y modernizacion PHP.<br>
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

**🧩 12 microapps**<br>
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

**🔐 Hardening en tres fases**<br>
Infraestructura, aplicacion y cadena de suministro. CSRF, rate limiting, supply-chain scan.

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
| [PythonEval3000](apps/PythonEval3000) | `Aprendizaje` | Evaluador y explorador de 3000 preguntas de Python y Data Science con modo quiz y explorador filtrable |

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

### Fase 3 — CI / cadena de suministro

| Control | Estado | Detalle |
| :--- | :---: | :--- |
| `composer audit` en CI | ✅ | Escanea `composer.lock` contra PHP Security Advisories + GitHub Advisory DB |
| Supply chain scan — Trojan Source | ✅ | Detecta Unicode bidi (CVE-2021-42574) en todo el codigo fuente |
| Supply chain scan — ofuscacion | ✅ | Detecta `eval/base64`, `shell_exec($_`, `system($_REQUEST` y similares |
| Integridad de `composer.lock` | ✅ | Valida que el archivo de bloqueo este presente en cada build |

### Fase 3 — Aplicacion (SqlViewer)

| Control | Estado | Detalle |
| :--- | :---: | :--- |
| CSRF en SqlViewer | ✅ | Token por sesion (`random_bytes`) validado con `hash_equals` en cada POST |
| Rate limiting | ✅ | Max `SQLVIEWER_RATE_LIMIT` queries/min por sesion (default: 30) |
| Whitelist de host | ✅ | `SQLVIEWER_ALLOWED_HOSTS` en `.env` — rechaza hosts no autorizados |
| Autenticacion basica | ✅ | Bloque `.htpasswd` listo en `.htaccess` — activar descomentando 3 lineas |

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
| GitHub Pages | [vladimiracunadev-create.github.io/microsistemas](https://vladimiracunadev-create.github.io/microsistemas/) |

---

## 📚 Documentacion de Usuario

| Documento | Descripcion |
| :--- | :--- |
| [Guia de Instalacion](docs/INSTALL.md) | Instalacion detallada en Docker, XAMPP y Linux |
| [Manual de Usuario](docs/USER_MANUAL.md) | Como sacar el maximo provecho a cada herramienta |
| [Guia del Hub CLI](docs/HUB.md) | Referencia completa de comandos del Hub |
| [Guia para Principiantes](docs/BEGINNERS_GUIDE.md) | Estructura del proyecto explicada desde cero |
| [Guia para Reclutadores](docs/RECRUITER.md) | Tour tecnico guiado: decisiones, stack y demos |
| [Catalogo de Sistemas](docs/SYSTEMS_CATALOG.md) | Detalles tecnicos de cada micro-app |
| [Referencia de Archivos](docs/FILES_REFERENCE.md) | Explicacion de cada archivo del repositorio |
| [Referencia de API](docs/API.md) | Como interactuar con el Core y extensiones |
| [Skills / Playbooks](skills/integrar-microsistema/skill.md) | Flujos reutilizables para automatizar tareas |
| [Servidor MCP Local](mcp/README.md) | Configuracion del servidor de contexto para IA |
| [Landing del Producto](docs/LANDING_PAGE.md) | Documentacion de la pagina de presentacion |

---

## 🗂️ Centro de Documentacion y Gobernanza

### Operaciones, Arquitectura y Configuracion

| Documento | Descripcion |
| :--- | :--- |
| [ADR-0001](docs/adr/0001-contexto-y-decisiones-iniciales.md) | Arquitectura inicial y decisiones de diseno |
| [Arquitectura](docs/ARCHITECTURE.md) | Diagramas Mermaid y detalles del Core |
| [Specs Tecnicas](docs/TECHNICAL_SPECS.md) | Stack, estandares y normas de mantencion |
| [Requisitos del Sistema](docs/REQUIREMENTS.md) | Hardware, software y dependencias |
| [Modos de Ejecucion](OPERATING-MODES.md) | Docker, XAMPP, PHP built-in y Hub local |
| [Migracion a AWS ☁️](docs/AWS_MIGRATION.md) | Guia completa de despliegue en la nube AWS: 3 estrategias, costos, diagramas y paso a paso |
| [Matriz de Compatibilidad](COMPATIBILITY.md) | Entornos y versiones soportadas |
| [Manual de Operacion](RUNBOOK.md) | Diagnostico, arranque y recuperacion |
| [Estrategia de Versionado](RELEASE.md) | Proceso de release y Semantic Versioning |
| [Historial de Cambios](CHANGELOG.md) | Registro completo de versiones y mejoras |

### Soporte, Comunidad y Gobernanza

| Documento | Descripcion |
| :--- | :--- |
| [Politica de Soporte](SUPPORT.md) | Canales de asistencia y niveles de soporte |
| [Guia de Contribucion](CONTRIBUTING.md) | Como contribuir al proyecto |
| [Seguridad](SECURITY.md) | Modelo de amenaza, hardening Fase 1/2/3 y reporte de vulnerabilidades |
| [Guia de Mantenedores](docs/MAINTAINERS.md) | Informacion critica para administradores |
| [Codigo de Conducta](CODE_OF_CONDUCT.md) | Normas para una comunidad saludable |

### Configuracion Estrategica

Archivos de gobernanza que definen la calidad profesional del repositorio:

| Archivo | Descripcion |
| :--- | :--- |
| [CITATION.cff](CITATION.cff) | Metadatos de citacion academica del software |
| [CODEOWNERS](.github/CODEOWNERS) | Asignacion de responsabilidades por area |
| [dependabot.yml](.github/dependabot.yml) | Auditoria automatica de dependencias |
| [Plantillas de Issues](.github/ISSUE_TEMPLATE/) | Formularios estandar para bugs y features |
| [.editorconfig](.editorconfig) | Reglas globales de formateo para editores |

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
