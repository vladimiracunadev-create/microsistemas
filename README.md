# Microsistemas a€" Developer Productivity Suite

![Version](https://img.shields.io/github/v/tag/vladimiracunadev-create/microsistemas?label=version&color=blue)
![Build Status](https://img.shields.io/github/actions/workflow/status/vladimiracunadev-create/microsistemas/docker-publish.yml?branch=main&label=build&logo=github)
![License](https://img.shields.io/badge/license-MIT-green)
![Packages](https://img.shields.io/badge/container-ghcr.io-orange?logo=docker)

**Microsistemas** es una suite profesional de herramientas web modulares disenada para desarrolladores y administradores de sistemas. Ofrece soluciones rapidas para tareas de diagnostico, conversion de datos, gestion de bases de datos y modernizacion de codigo PHP.

## Landing del Producto

Se agrego una landing page estatica y aislada para presentar Microsistemas como producto, sin tocar el dashboard PHP actual ni la estructura funcional del repositorio. Tambien quedo preparada para publicarse con GitHub Pages.

- **Vista HTML**: [landing/index.html](landing/index.html)
- **Guia en Markdown**: [docs/LANDING_PAGE.md](docs/LANDING_PAGE.md)
- **Preview local**: `http://localhost/microsistemas/landing/` o `http://localhost:8080/landing/`
- **GitHub Pages esperada**: `https://vladimiracunadev-create.github.io/microsistemas/`

## ðŸ"‹ Requisitos del Sistema

Para ver el detalle completo de hardware y software (PHP, extensiones, etc.), consulta:

ðŸ'‰ **[Requisitos del Sistema (REQUIREMENTS.md)](docs/REQUIREMENTS.md)**

## Inicio Rapido con Makefile

Este proyecto incluye un `Makefile` para simplificar las tareas comunes. Asegurate de tener `make` instalado (ej: via Chocolatey `choco install make` en Windows o preinstalado en Linux).

```bash
# Instalar dependencias PHP
make install

# Levantar la aplicacion con Docker
make up

# Iniciar servidor PHP embebido (localhost:8000)
make serve

# Ver todos los comandos disponibles
make help
```

---

## ðŸ› i¸ Microsistemas Hub (CLI)

Hemos anadido una capa de gestion centralizada llamada **Hub**. Esta herramienta permite listar, ejecutar y diagnosticar todas las micro-apps de forma estandarizada.

### Uso Rapido del Hub:

```bash
# Listar todas las aplicaciones
make hub-list

# Ejecutar una aplicacion localmente (ej: Conversor)
make hub-run APP=Conversor

# Levantar una aplicacion con su propio Docker Compose
make hub-up APP=CapacitySim

# Chequeo de salud del entorno (ahora con validacion de puertos y Docker)
make hub-doctor

# Verificacion rapida (Smoke Test)
make smoke
```

Para mas detalles, consulta la ðŸ"- **[Guia del Hub (docs/HUB.md)](docs/HUB.md)**.

---

## ðŸ¤- Servidor MCP Local (Para IA)

Microsistemas integra un **Servidor Model Context Protocol (MCP)** en Python (`mcp/`) disenado para exponer de forma local, estandarizada y segura todos los manifiestos, configuraciones y documentaciones del Hub a asistentes de Inteligencia Artificial (ej: Claude Desktop).

> **Aviso de Seguridad:** La implementacion V1 es estrictamente de **Solo Lectura**. El servidor MCP expone herramientas de diagnostico (`run_hub_doctor`, `run_smoke`) y lectura de archivos mediante listas blancas, imposibilitando inyecciones, mutaciones no autorizadas o modificaciones destructivas en tu infraestructura.

Para conectar tu cliente MCP preferido, revisa la configuracion en:
ðŸ§  **[Servidor MCP Local (V1)](mcp/README.md)**

---

## aš Inicio Inmediato

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

## ðŸš€ Caracteristicas Principales

<table align="center">
  <tr>
    <td align="center"><b>ðŸ› i¸ Modular</b><br>Apps independientes en <code>apps/</code></td>
    <td align="center"><b>ðŸ"¦ Composer</b><br>Autoloading PSR-4</td>
    <td align="center"><b>ðŸ›i¸ Seguro</b><br>Variables de entorno .env</td>
  </tr>
  <tr>
    <td align="center"><b>ðŸ³ Docker Ready</b><br>Infraestructura inmutable</td>
    <td align="center"><b>ðŸŽ¨ Modern UI</b><br>Dashboard Dark Mode</td>
    <td align="center"><b>e‡ªåŠ¨åŒ- CI/CD</b><br>GitHub Packages auto-deploy</td>
  </tr>
</table>

---

Estas evaluando este proyecto como parte de un proceso de seleccion? Consulta nuestra **[Guia para Reclutadores](docs/RECRUITER.md)** que incluye:

- Contexto de negocio y valor agregado
- Decisiones arquitectonicas clave
- Tour guiado de casos de uso destacados
- Stack tecnologico y patrones aplicados

---

## ðŸ"‚ Catalogo de Herramientas

<!-- CATALOG_START -->

| Herramienta | Tecnologia | Proposito |
| :--- | :--- | :--- |
| **[AWS Assistant Pro](apps/AwsGenerator)** | ![DevOps](https://img.shields.io/badge/-DevOps-2496ED?logo=docker&logoColor=white) | Asistente inteligente (v2.1.0) para AWS CLI con navegacion por intenciones, semaforo de riesgo y resaltado de sintaxis. |
| **[CapacitySim](apps/CapacitySim)** | ![DevOps](https://img.shields.io/badge/-DevOps-2496ED?logo=docker&logoColor=white) | Simulador heuristico de capacidad y RPS para infraestructuras con estimacion de costos. |
| **[CicdLibrary](apps/CicdLibrary)** | ![DevOps](https://img.shields.io/badge/-DevOps-2496ED?logo=docker&logoColor=white) | Biblioteca tecnica interactiva con 192 combinaciones de CI/CD para GitHub, GitLab y Jenkins. |
| **[Conversor](apps/Conversor)** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | Herramienta de sanitizacion y codificacion segura de texto. |
| **[GitTrainer](apps/GitTrainer)** | ![JS](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=black) | Biblioteca interactiva de comandos Git y aprendizaje visual. |
| **[JsTools](apps/JsTools)** | ![JS](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=black) | Coleccion de herramientas y utilidades JavaScript para productividad. |
| **[KatasMultiLang](apps/KatasMultiLang)** | ![JS](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=black) | Comparador visual (195 katas) estructurado en UI Glassmorphism Premium, con soporte Multi-JSON para 67 tecnologias side-by-side. |
| **[LogViewer](apps/LogViewer)** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | Auditoria segura y visualizacion de logs del sistema en tiempo real. |
| **[PhpMigrator](apps/PhpMigrator)** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | Modernizacion de codigo PHP legacy (5.x) a estandares modernos (8.x). |
| **[SqlViewer](apps/SqlViewer)** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | Inspeccion y gestion de bases de datos sin necesidad de clientes pesados. |
| **[YmlGenerator](apps/YmlGenerator)** | ![JS](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=black) | Generador visual de configuraciones YAML para Docker y Kubernetes. |

<!-- CATALOG_END -->

---

## ðŸ"- Documentacion Avanzada

Explora nuestras guias detalladas para convertirte en un experto de la suite:

- ðŸ" **[Referencia de Archivos](docs/FILES_REFERENCE.md)**: Explicacion detallada de cada archivo del sistema con su importancia.
- ðŸ¤- **[Skills / Playbooks](skills/integrar-microsistema/skill.md)**: Flujos reutilizables para automatizar tareas complejas (integracion de apps, actualizacion de docs, CI checks).
- 🌐 **[Landing del Producto](docs/LANDING_PAGE.md)**: Resumen visual y documental de Microsistemas como suite, con implementacion aislada en `landing/` y despliegue preparado para GitHub Pages.
- ðŸ§  **[Servidor MCP Local (V1)](mcp/README.md)**: Integracion segura y de solo lectura de Model Context Protocol para proveer contexto instantaneo a Asistentes de Inteligencia Artificial.
- ðŸ"- **[Guia para Principiantes](docs/BEGINNERS_GUIDE.md)**: Eres nuevo? Empieza aqui para entender las carpetas.
- ðŸ"- **[Manual de Usuario](docs/USER_MANUAL.md)**: Como sacar el maximo provecho a cada herramienta.
- ðŸš€ **[Guia de Instalacion](docs/INSTALL.md)**: Despliegue en Docker, Linux y XAMPP.
- ðŸ-i¸ **[Arquitectura](docs/ARCHITECTURE.md)**: Diagramas Mermaid y detalles del Core.
- ðŸ"œ **[Catalogo de Sistemas](docs/SYSTEMS_CATALOG.md)**: Detalles tecnicos de cada micro-app.
- ðŸ"Œ **[Referencia de API](docs/API.md)**: Como interactuar con el core y extensiones.
- ðŸ›i¸ **[Seguridad](docs/SECURITY.md)**: Politicas de proteccion y reporte.
- ðŸ› i¸ **[Specs Tecnicas](docs/TECHNICAL_SPECS.md)**: Stack, estandares y normas de mantencion.
- ðŸ§'a€ðŸ'" **[Guia de Mantenedores](docs/MAINTAINERS.md)**: Informacion critica para administradores del proyecto.
- aš-i¸ **[Codigo de Conducta](CODE_OF_CONDUCT.md)**: Normas para una comunidad saludable.
- ðŸ•' **[Historial de Cambios](CHANGELOG.md)**: Registro detallado de versiones y mejoras.

---

## ðŸ¤ Comunidad y Colaboracion

Este proyecto esta abierto a **Cooperacion Real**! Queremos que contribuir sea lo mas facil y seguro posible.

### ðŸŒŸ Como ayudar?

- **Reporta Errores**: Usa nuestra [plantilla de errores](https://github.com/vladimiracunadev-create/microsistemas/issues/new?template=bug_report.md) para ayudarnos a mejorar.
- **Sugiere Funciones**: Tenemos una [plantilla para nuevas ideas](https://github.com/vladimiracunadev-create/microsistemas/issues/new?template=feature_request.md).
- **Resuelve Issues**: Busca etiquetas como `good first issue` o `help wanted` para empezar.

### ðŸ›i¸ Contribuciones Seguras

Para mantener la calidad y estabilidad, implementamos:

- **Proteccion de Rama**: Los cambios en `main` requieren un **Pull Request** y al menos una **revision**.
- **Checks Automaticos**: El CI valida que todo funcione de manera segura antes de integrar.
- **Auditoria Autonoma**: Integracion de **Dependabot** para escaneo continuo de dependencias y secretos, creando Pull Requests automaticos ante vulnerabilidades (CVEs).
- **Plantillas Estandar**: Facilitamos la comunicacion mediante estructuras predefinidas para Issues y PRs.

---

## aš-i¸ Licencia

Este proyecto esta bajo la **Licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para mas detalles.

---

Desarrollado con a¤i¸ por **[Vladimir Acuna Valdebenito](https://www.linkedin.com/in/vladimir-acu%C3%B1a-valdebenito-11924a29/)** para la comunidad de desarrolladores.

## ðŸ"š Centro de Documentacion y Gobernanza

El proyecto adopta un enfoque de **documentacion como codigo** orientado a mantener estandares y facilitar la vida de desarrolladores, operadores y evaluadores de talento. Toda la documentacion tecnica esta categorizada para su rapido acceso.

### ðŸ"‹ Operaciones, Arquitectura y Configuracion

- [ðŸ-i¸ Arquitectura Inicial y Contexto (ADR-0001)](docs/adr/0001-contexto-y-decisiones-iniciales.md)
- [ðŸ"§ Manual de Operacion y Diagnostico (RUNBOOK)](RUNBOOK.md)
- [ðŸ§© Matriz de Compatibilidad y Ambientes (COMPATIBILITY)](COMPATIBILITY.md)
- [ðŸ"€ Casos y Modos de Ejecucion (OPERATING-MODES)](OPERATING-MODES.md)
- [ðŸŽ¯ Estrategia de Versionado y Entrega (RELEASE)](RELEASE.md)
- [ðŸ"œ Historial de Cambios (CHANGELOG)](CHANGELOG.md)
- [ðŸ"˜ Guia Rapida de Instalacion (INSTALL)](docs/INSTALL.md)

### ðŸ¤ Soporte, Comunidad y Gobernanza

- [ðŸ'¬ Politicas de Asistencia y Soporte (SUPPORT)](SUPPORT.md)
- [ðŸ'" Guia Directa para Reclutadores Tecnicos](docs/RECRUITER.md)
- [ðŸ¤ Guia Oficial de Contribucion](CONTRIBUTING.md)
- [ðŸ›i¸ Politica de Seguridad y Reportes](SECURITY.md)
- [aš-i¸ Codigo de Conducta de la Comunidad](CODE_OF_CONDUCT.md)

### aš™i¸ Configuracion Estrategica (Metadata / No-MD)

Ademas del contenido legible, el repositorio contiene archivos de gobernanza ocultos que definen su calidad profesional para ser auditados:

- [ðŸ" Metadatos de Citacion del Software (`CITATION.cff`)](CITATION.cff)
- [ðŸ'¥ Asignacion de Responsabilidades (`CODEOWNERS`)](.github/CODEOWNERS)
- [ðŸ"Œ Formularios y Plantillas de Issues (`.github/ISSUE_TEMPLATE/`)](.github/ISSUE_TEMPLATE/)
- [ðŸ¤- Auditoria Automatica de Dependencias (`dependabot.yml`)](.github/dependabot.yml)
- [aœ¨ Reglas Globales de Formateo (`.editorconfig`)](.editorconfig)
