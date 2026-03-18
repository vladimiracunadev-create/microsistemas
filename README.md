# Microsistemas â€“ Developer Productivity Suite

![Version](https://img.shields.io/github/v/tag/vladimiracunadev-create/microsistemas?label=version&color=blue)
![Build Status](https://img.shields.io/github/actions/workflow/status/vladimiracunadev-create/microsistemas/docker-publish.yml?branch=main&label=build&logo=github)
![License](https://img.shields.io/badge/license-MIT-green)
![Packages](https://img.shields.io/badge/container-ghcr.io-orange?logo=docker)

**Microsistemas** es una suite profesional de herramientas web modulares diseÃ±ada para desarrolladores y administradores de sistemas. Ofrece soluciones rÃ¡pidas para tareas de diagnÃ³stico, conversiÃ³n de datos, gestiÃ³n de bases de datos y modernizaciÃ³n de cÃ³digo PHP.

## Landing del Producto

Se agregó una landing page estática y aislada para presentar Microsistemas como producto, sin tocar el dashboard PHP actual ni la estructura funcional del repositorio. También quedó preparada para publicarse con GitHub Pages.

- **Vista HTML**: [landing/index.html](landing/index.html)
- **Guía en Markdown**: [docs/LANDING_PAGE.md](docs/LANDING_PAGE.md)
- **Preview local**: `http://localhost/microsistemas/landing/` o `http://localhost:8080/landing/`
- **GitHub Pages esperada**: `https://vladimiracunadev-create.github.io/microsistemas/`

## ðŸ“‹ Requisitos del Sistema

Para ver el detalle completo de hardware y software (PHP, extensiones, etc.), consulta:

ðŸ‘‰ **[Requisitos del Sistema (REQUIREMENTS.md)](docs/REQUIREMENTS.md)**

## Inicio RÃ¡pido con Makefile

Este proyecto incluye un `Makefile` para simplificar las tareas comunes. AsegÃºrate de tener `make` instalado (ej: vÃ­a Chocolatey `choco install make` en Windows o preinstalado en Linux).

```bash
# Instalar dependencias PHP
make install

# Levantar la aplicaciÃ³n con Docker
make up

# Iniciar servidor PHP embebido (localhost:8000)
make serve

# Ver todos los comandos disponibles
make help
```

---

## ðŸ› ï¸ Microsistemas Hub (CLI)

Hemos aÃ±adido una capa de gestiÃ³n centralizada llamada **Hub**. Esta herramienta permite listar, ejecutar y diagnosticar todas las micro-apps de forma estandarizada.

### Uso RÃ¡pido del Hub:

```bash
# Listar todas las aplicaciones
make hub-list

# Ejecutar una aplicaciÃ³n localmente (ej: Conversor)
make hub-run APP=Conversor

# Levantar una aplicaciÃ³n con su propio Docker Compose
make hub-up APP=CapacitySim

# Chequeo de salud del entorno (ahora con validaciÃ³n de puertos y Docker)
make hub-doctor

# VerificaciÃ³n rÃ¡pida (Smoke Test)
make smoke
```

Para mÃ¡s detalles, consulta la ðŸ“– **[GuÃ­a del Hub (docs/HUB.md)](docs/HUB.md)**.

---

## ðŸ¤– Servidor MCP Local (Para IA)

Microsistemas integra un **Servidor Model Context Protocol (MCP)** en Python (`mcp/`) diseÃ±ado para exponer de forma local, estandarizada y segura todos los manifiestos, configuraciones y documentaciones del Hub a asistentes de Inteligencia Artificial (ej: Claude Desktop).

> **Aviso de Seguridad:** La implementaciÃ³n V1 es estrictamente de **Solo Lectura**. El servidor MCP expone herramientas de diagnÃ³stico (`run_hub_doctor`, `run_smoke`) y lectura de archivos mediante listas blancas, imposibilitando inyecciones, mutaciones no autorizadas o modificaciones destructivas en tu infraestructura.

Para conectar tu cliente MCP preferido, revisa la configuraciÃ³n en:
ðŸ§  **[Servidor MCP Local (V1)](mcp/README.md)**

---

## âš¡ Inicio Inmediato

### ðŸ³ Con Docker (Recomendado)

Levanta todo el ecosistema en menos de 30 segundos:

```bash
docker-compose up -d
```

ðŸŒ Dashboard: `http://localhost:8080`

### ðŸ˜ Con XAMPP

1. Clona en `htdocs/microsistemas`.
2. Renombra `.env.example` a `.env`.
3. Accede a `http://localhost/microsistemas/`.

---

## ðŸš€ CaracterÃ­sticas Principales

<table align="center">
  <tr>
    <td align="center"><b>ðŸ› ï¸ Modular</b><br>Apps independientes en <code>apps/</code></td>
    <td align="center"><b>ðŸ“¦ Composer</b><br>Autoloading PSR-4</td>
    <td align="center"><b>ðŸ›¡ï¸ Seguro</b><br>Variables de entorno .env</td>
  </tr>
  <tr>
    <td align="center"><b>ðŸ³ Docker Ready</b><br>Infraestructura inmutable</td>
    <td align="center"><b>ðŸŽ¨ Modern UI</b><br>Dashboard Dark Mode</td>
    <td align="center"><b>è‡ªåŠ¨åŒ– CI/CD</b><br>GitHub Packages auto-deploy</td>
  </tr>
</table>

---

Â¿EstÃ¡s evaluando este proyecto como parte de un proceso de selecciÃ³n? Consulta nuestra **[GuÃ­a para Reclutadores](docs/RECRUITER.md)** que incluye:

- Contexto de negocio y valor agregado
- Decisiones arquitectÃ³nicas clave
- Tour guiado de casos de uso destacados
- Stack tecnolÃ³gico y patrones aplicados

---

## ðŸ“‚ CatÃ¡logo de Herramientas

<!-- CATALOG_START -->

| Herramienta | TecnologÃ­a | PropÃ³sito |
| :--- | :--- | :--- |
| **[AWS Assistant Pro](apps/AwsGenerator)** | ![DevOps](https://img.shields.io/badge/-DevOps-2496ED?logo=docker&logoColor=white) | Asistente inteligente (v2.1.0) para AWS CLI con navegaciÃ³n por intenciones, semÃ¡foro de riesgo y resaltado de sintaxis. |
| **[CapacitySim](apps/CapacitySim)** | ![DevOps](https://img.shields.io/badge/-DevOps-2496ED?logo=docker&logoColor=white) | Simulador heurÃ­stico de capacidad y RPS para infraestructuras con estimaciÃ³n de costos. |
| **[CicdLibrary](apps/CicdLibrary)** | ![DevOps](https://img.shields.io/badge/-DevOps-2496ED?logo=docker&logoColor=white) | Biblioteca tÃ©cnica interactiva con 192 combinaciones de CI/CD para GitHub, GitLab y Jenkins. |
| **[Conversor](apps/Conversor)** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | Herramienta de sanitizaciÃ³n y codificaciÃ³n segura de texto. |
| **[GitTrainer](apps/GitTrainer)** | ![JS](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=black) | Biblioteca interactiva de comandos Git y aprendizaje visual. |
| **[JsTools](apps/JsTools)** | ![JS](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=black) | ColecciÃ³n de herramientas y utilidades JavaScript para productividad. |
| **[KatasMultiLang](apps/KatasMultiLang)** | ![JS](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=black) | Comparador visual (195 katas) estructurado en UI Glassmorphism Premium, con soporte Multi-JSON para 67 tecnologÃ­as side-by-side. |
| **[LogViewer](apps/LogViewer)** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | AuditorÃ­a segura y visualizaciÃ³n de logs del sistema en tiempo real. |
| **[PhpMigrator](apps/PhpMigrator)** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | ModernizaciÃ³n de cÃ³digo PHP legacy (5.x) a estÃ¡ndares modernos (8.x). |
| **[SqlViewer](apps/SqlViewer)** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | InspecciÃ³n y gestiÃ³n de bases de datos sin necesidad de clientes pesados. |
| **[YmlGenerator](apps/YmlGenerator)** | ![JS](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=black) | Generador visual de configuraciones YAML para Docker y Kubernetes. |

<!-- CATALOG_END -->

---

## ðŸ“– DocumentaciÃ³n Avanzada

Explora nuestras guÃ­as detalladas para convertirte en un experto de la suite:

- ðŸ“ **[Referencia de Archivos](docs/FILES_REFERENCE.md)**: ExplicaciÃ³n detallada de cada archivo del sistema con su importancia.
- ðŸ¤– **[Skills / Playbooks](skills/integrar-microsistema/skill.md)**: Flujos reutilizables para automatizar tareas complejas (integraciÃ³n de apps, actualizaciÃ³n de docs, CI checks).
- 🌐 **[Landing del Producto](docs/LANDING_PAGE.md)**: Resumen visual y documental de Microsistemas como suite, con implementación aislada en `landing/` y despliegue preparado para GitHub Pages.
- ðŸ§  **[Servidor MCP Local (V1)](mcp/README.md)**: IntegraciÃ³n segura y de solo lectura de Model Context Protocol para proveer contexto instantÃ¡neo a Asistentes de Inteligencia Artificial.
- ðŸ“– **[GuÃ­a para Principiantes](docs/BEGINNERS_GUIDE.md)**: Â¿Eres nuevo? Empieza aquÃ­ para entender las carpetas.
- ðŸ“– **[Manual de Usuario](docs/USER_MANUAL.md)**: CÃ³mo sacar el mÃ¡ximo provecho a cada herramienta.
- ðŸš€ **[GuÃ­a de InstalaciÃ³n](docs/INSTALL.md)**: Despliegue en Docker, Linux y XAMPP.
- ðŸ—ï¸ **[Arquitectura](docs/ARCHITECTURE.md)**: Diagramas Mermaid y detalles del Core.
- ðŸ“œ **[CatÃ¡logo de Sistemas](docs/SYSTEMS_CATALOG.md)**: Detalles tÃ©cnicos de cada micro-app.
- ðŸ”Œ **[Referencia de API](docs/API.md)**: CÃ³mo interactuar con el core y extensiones.
- ðŸ›¡ï¸ **[Seguridad](docs/SECURITY.md)**: PolÃ­ticas de protecciÃ³n y reporte.
- ðŸ› ï¸ **[Specs TÃ©cnicas](docs/TECHNICAL_SPECS.md)**: Stack, estÃ¡ndares y normas de mantenciÃ³n.
- ðŸ§‘â€ðŸ’» **[GuÃ­a de Mantenedores](docs/MAINTAINERS.md)**: InformaciÃ³n crÃ­tica para administradores del proyecto.
- âš–ï¸ **[CÃ³digo de Conducta](CODE_OF_CONDUCT.md)**: Normas para una comunidad saludable.
- ðŸ•’ **[Historial de Cambios](CHANGELOG.md)**: Registro detallado de versiones y mejoras.

---

## ðŸ¤ Comunidad y ColaboraciÃ³n

Â¡Este proyecto estÃ¡ abierto a **CooperaciÃ³n Real**! Queremos que contribuir sea lo mÃ¡s fÃ¡cil y seguro posible.

### ðŸŒŸ Â¿CÃ³mo ayudar?

- **Reporta Errores**: Usa nuestra [plantilla de errores](https://github.com/vladimiracunadev-create/microsistemas/issues/new?template=bug_report.md) para ayudarnos a mejorar.
- **Sugiere Funciones**: Tenemos una [plantilla para nuevas ideas](https://github.com/vladimiracunadev-create/microsistemas/issues/new?template=feature_request.md).
- **Resuelve Issues**: Busca etiquetas como `good first issue` o `help wanted` para empezar.

### ðŸ›¡ï¸ Contribuciones Seguras

Para mantener la calidad y estabilidad, implementamos:

- **ProtecciÃ³n de Rama**: Los cambios en `main` requieren un **Pull Request** y al menos una **revisiÃ³n**.
- **Checks AutomÃ¡ticos**: El CI valida que todo funcione de manera segura antes de integrar.
- **AuditorÃ­a AutÃ³noma**: IntegraciÃ³n de **Dependabot** para escaneo continuo de dependencias y secretos, creando Pull Requests automÃ¡ticos ante vulnerabilidades (CVEs).
- **Plantillas EstÃ¡ndar**: Facilitamos la comunicaciÃ³n mediante estructuras predefinidas para Issues y PRs.

---

## âš–ï¸ Licencia

Este proyecto estÃ¡ bajo la **Licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para mÃ¡s detalles.

---

Desarrollado con â¤ï¸ por **[Vladimir AcuÃ±a Valdebenito](https://www.linkedin.com/in/vladimir-acu%C3%B1a-valdebenito-11924a29/)** para la comunidad de desarrolladores.

## ðŸ“š Centro de DocumentaciÃ³n y Gobernanza

El proyecto adopta un enfoque de **documentaciÃ³n como cÃ³digo** orientado a mantener estÃ¡ndares y facilitar la vida de desarrolladores, operadores y evaluadores de talento. Toda la documentaciÃ³n tÃ©cnica estÃ¡ categorizada para su rÃ¡pido acceso.

### ðŸ“‹ Operaciones, Arquitectura y ConfiguraciÃ³n

- [ðŸ—ï¸ Arquitectura Inicial y Contexto (ADR-0001)](docs/adr/0001-contexto-y-decisiones-iniciales.md)
- [ðŸ”§ Manual de OperaciÃ³n y DiagnÃ³stico (RUNBOOK)](RUNBOOK.md)
- [ðŸ§© Matriz de Compatibilidad y Ambientes (COMPATIBILITY)](COMPATIBILITY.md)
- [ðŸ”€ Casos y Modos de EjecuciÃ³n (OPERATING-MODES)](OPERATING-MODES.md)
- [ðŸŽ¯ Estrategia de Versionado y Entrega (RELEASE)](RELEASE.md)
- [ðŸ“œ Historial de Cambios (CHANGELOG)](CHANGELOG.md)
- [ðŸ“˜ GuÃ­a RÃ¡pida de InstalaciÃ³n (INSTALL)](docs/INSTALL.md)

### ðŸ¤ Soporte, Comunidad y Gobernanza

- [ðŸ’¬ PolÃ­ticas de Asistencia y Soporte (SUPPORT)](SUPPORT.md)
- [ðŸ‘” GuÃ­a Directa para Reclutadores TÃ©cnicos](docs/RECRUITER.md)
- [ðŸ¤ GuÃ­a Oficial de ContribuciÃ³n](CONTRIBUTING.md)
- [ðŸ›¡ï¸ PolÃ­tica de Seguridad y Reportes](SECURITY.md)
- [âš–ï¸ CÃ³digo de Conducta de la Comunidad](CODE_OF_CONDUCT.md)

### âš™ï¸ ConfiguraciÃ³n EstratÃ©gica (Metadata / No-MD)

AdemÃ¡s del contenido legible, el repositorio contiene archivos de gobernanza ocultos que definen su calidad profesional para ser auditados:

- [ðŸ“ Metadatos de CitaciÃ³n del Software (`CITATION.cff`)](CITATION.cff)
- [ðŸ‘¥ AsignaciÃ³n de Responsabilidades (`CODEOWNERS`)](.github/CODEOWNERS)
- [ðŸ“Œ Formularios y Plantillas de Issues (`.github/ISSUE_TEMPLATE/`)](.github/ISSUE_TEMPLATE/)
- [ðŸ¤– AuditorÃ­a AutomÃ¡tica de Dependencias (`dependabot.yml`)](.github/dependabot.yml)
- [âœ¨ Reglas Globales de Formateo (`.editorconfig`)](.editorconfig)
