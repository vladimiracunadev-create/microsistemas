�# Microsistemas a� Developer Productivity Suite

![Version](https://img.shields.io/github/v/tag/vladimiracunadev-create/microsistemas?label=version&color=blue)
![Build Status](https://img.shields.io/github/actions/workflow/status/vladimiracunadev-create/microsistemas/docker-publish.yml?branch=main&label=build&logo=github)
![License](https://img.shields.io/badge/license-MIT-green)
![Packages](https://img.shields.io/badge/container-ghcr.io-orange?logo=docker)

**Microsistemas** es una suite profesional de herramientas web modulares disenada para desarrolladores y administradores de sistemas. Ofrece soluciones r�pidas para tareas de diagnostico, conversion de datos, gestion de bases de datos y modernizacion de codigo PHP.

## Landing del Producto

Se agrego una landing page estatica y aislada para presentar Microsistemas como producto, sin tocar el dashboard PHP actual ni la estructura funcional del repositorio. Tambien quedo preparada para publicarse con GitHub Pages.

- **Vista HTML**: [landing/index.html](landing/index.html)
- **Guia en Markdown**: [docs/LANDING_PAGE.md](docs/LANDING_PAGE.md)
- **Preview local**: `http://localhost/microsistemas/landing/` o `http://localhost:8080/landing/`
- **GitHub Pages esperada**: `https://vladimiracunadev-create.github.io/microsistemas/`

## �x9 Requisitos del Sistema

Para ver el detalle completo de hardware y software (PHP, extensiones, etc.), consulta:

�x0 **[Requisitos del Sistema (REQUIREMENTS.md)](docs/REQUIREMENTS.md)**

## Inicio R�pido con Makefile

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

## �x:�i�� Microsistemas Hub (CLI)

Hemos anadido una capa de gestion centralizada llamada **Hub**. Esta herramienta permite listar, ejecutar y diagnosticar todas las micro-apps de forma estandarizada.

### Uso R�pido del Hub:

```bash
# Listar todas las aplicaciones
make hub-list

# Ejecutar una aplicacion localmente (ej: Conversor)
make hub-run APP=Conversor

# Levantar una aplicacion con su propio Docker Compose
make hub-up APP=CapacitySim

# Chequeo de salud del entorno (ahora con validacion de puertos y Docker)
make hub-doctor

# Verificacion r�pida (Smoke Test)
make smoke
```

Para m�s detalles, consulta la �x **[Guia del Hub (docs/HUB.md)](docs/HUB.md)**.

---

## �x� Servidor MCP Local (Para IA)

Microsistemas integra un **Servidor Model Context Protocol (MCP)** en Python (`mcp/`) disenado para exponer de forma local, estandarizada y segura todos los manifiestos, configuraciones y documentaciones del Hub a asistentes de Inteligencia Artificial (ej: Claude Desktop).

> **Aviso de Seguridad:** La implementacion V1 es estrictamente de **Solo Lectura**. El servidor MCP expone herramientas de diagnostico (`run_hub_doctor`, `run_smoke`) y lectura de archivos mediante listas blancas, imposibilitando inyecciones, mutaciones no autorizadas o modificaciones destructivas en tu infraestructura.

Para conectar tu cliente MCP preferido, revisa la configuracion en:
�x�� **[Servidor MCP Local (V1)](mcp/README.md)**

---

## aa Inicio Inmediato

### �x�� Con Docker (Recomendado)

Levanta todo el ecosistema en menos de 30 segundos:

```bash
docker-compose up -d
```

�xR� Dashboard: `http://localhost:8080`

### �x�� Con XAMPP

1. Clona en `htdocs/microsistemas`.
2. Renombra `.env.example` a `.env`.
3. Accede a `http://localhost/microsistemas/`.

---

## �xa� Caracteristicas Principales

<table align="center">
  <tr>
    <td align="center"><b>�x:�i�� Modular</b><br>Apps independientes en <code>apps/</code></td>
    <td align="center"><b>�x� Composer</b><br>Autoloading PSR-4</td>
    <td align="center"><b>�x:i�� Seguro</b><br>Variables de entorno .env</td>
  </tr>
  <tr>
    <td align="center"><b>�x�� Docker Ready</b><br>Infraestructura inmutable</td>
    <td align="center"><b>�x}� Modern UI</b><br>Dashboard Dark Mode</td>
    <td align="center"><b>e!��`��R CI/CD</b><br>GitHub Packages auto-deploy</td>
  </tr>
</table>

---

AEst�s evaluando este proyecto como parte de un proceso de seleccion? Consulta nuestra **[Guia para Reclutadores](docs/RECRUITER.md)** que incluye:

- Contexto de negocio y valor agregado
- Decisiones arquitectonicas clave
- Tour guiado de casos de uso destacados
- Stack tecnologico y patrones aplicados

---

## �x Cat�logo de Herramientas

<!-- CATALOG_START -->

| Herramienta | Tecnologia | Proposito |
| :--- | :--- | :--- |
| **[AWS Assistant Pro](apps/AwsGenerator)** | ![DevOps](https://img.shields.io/badge/-DevOps-2496ED?logo=docker&logoColor=white) | Asistente inteligente (v2.1.0) para AWS CLI con navegacion por intenciones, sem�foro de riesgo y resaltado de sintaxis. |
| **[CapacitySim](apps/CapacitySim)** | ![DevOps](https://img.shields.io/badge/-DevOps-2496ED?logo=docker&logoColor=white) | Simulador heuristico de capacidad y RPS para infraestructuras con estimacion de costos. |
| **[CicdLibrary](apps/CicdLibrary)** | ![DevOps](https://img.shields.io/badge/-DevOps-2496ED?logo=docker&logoColor=white) | Biblioteca tecnica interactiva con 192 combinaciones de CI/CD para GitHub, GitLab y Jenkins. |
| **[Conversor](apps/Conversor)** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | Herramienta de sanitizacion y codificacion segura de texto. |
| **[GitTrainer](apps/GitTrainer)** | ![JS](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=black) | Biblioteca interactiva de comandos Git y aprendizaje visual. |
| **[JsTools](apps/JsTools)** | ![JS](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=black) | Coleccion de herramientas y utilidades JavaScript para productividad. |
| **[KatasMultiLang](apps/KatasMultiLang)** | ![JS](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=black) | Comparador visual (195 katas) estructurado en UI Glassmorphism Premium, con soporte Multi-JSON para 67 tecnologias side-by-side. |
| **[LogViewer](apps/LogViewer)** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | Auditoria segura y visualizacion de logs del sistema en tiempo real. |
| **[PhpMigrator](apps/PhpMigrator)** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | Modernizacion de codigo PHP legacy (5.x) a est�ndares modernos (8.x). |
| **[SqlViewer](apps/SqlViewer)** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | Inspeccion y gestion de bases de datos sin necesidad de clientes pesados. |
| **[YmlGenerator](apps/YmlGenerator)** | ![JS](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=black) | Generador visual de configuraciones YAML para Docker y Kubernetes. |

<!-- CATALOG_END -->

---

## �x Documentacion Avanzada

Explora nuestras guias detalladas para convertirte en un experto de la suite:

- �x� **[Referencia de Archivos](docs/FILES_REFERENCE.md)**: Explicacion detallada de cada archivo del sistema con su importancia.
- �x� **[Skills / Playbooks](skills/integrar-microsistema/skill.md)**: Flujos reutilizables para automatizar tareas complejas (integracion de apps, actualizacion de docs, CI checks).
- < **[Landing del Producto](docs/LANDING_PAGE.md)**: Resumen visual y documental de Microsistemas como suite, con implementacion aislada en `landing/` y despliegue preparado para GitHub Pages.
- �x�� **[Servidor MCP Local (V1)](mcp/README.md)**: Integracion segura y de solo lectura de Model Context Protocol para proveer contexto instant�neo a Asistentes de Inteligencia Artificial.
- �x **[Guia para Principiantes](docs/BEGINNERS_GUIDE.md)**: AEres nuevo? Empieza aqui para entender las carpetas.
- �x **[Manual de Usuario](docs/USER_MANUAL.md)**: Como sacar el m�ximo provecho a cada herramienta.
- �xa� **[Guia de Instalacion](docs/INSTALL.md)**: Despliegue en Docker, Linux y XAMPP.
- �x�i�� **[Arquitectura](docs/ARCHITECTURE.md)**: Diagramas Mermaid y detalles del Core.
- �xS **[Cat�logo de Sistemas](docs/SYSTEMS_CATALOG.md)**: Detalles tecnicos de cada micro-app.
- �xR **[Referencia de API](docs/API.md)**: Como interactuar con el core y extensiones.
- �x:i�� **[Seguridad](docs/SECURITY.md)**: Politicas de proteccion y reporte.
- �x:�i�� **[Specs Tecnicas](docs/TECHNICAL_SPECS.md)**: Stack, est�ndares y normas de mantencion.
- �x�a���x� **[Guia de Mantenedores](docs/MAINTAINERS.md)**: Informacion critica para administradores del proyecto.
- aai�� **[Codigo de Conducta](CODE_OF_CONDUCT.md)**: Normas para una comunidad saludable.
- �x" **[Historial de Cambios](CHANGELOG.md)**: Registro detallado de versiones y mejoras.

---

## �x�� Comunidad y Colaboracion

AEste proyecto est� abierto a **Cooperacion Real**! Queremos que contribuir sea lo m�s f�cil y seguro posible.

### �xRx AComo ayudar?

- **Reporta Errores**: Usa nuestra [plantilla de errores](https://github.com/vladimiracunadev-create/microsistemas/issues/new?template=bug_report.md) para ayudarnos a mejorar.
- **Sugiere Funciones**: Tenemos una [plantilla para nuevas ideas](https://github.com/vladimiracunadev-create/microsistemas/issues/new?template=feature_request.md).
- **Resuelve Issues**: Busca etiquetas como `good first issue` o `help wanted` para empezar.

### �x:i�� Contribuciones Seguras

Para mantener la calidad y estabilidad, implementamos:

- **Proteccion de Rama**: Los cambios en `main` requieren un **Pull Request** y al menos una **revision**.
- **Checks Autom�ticos**: El CI valida que todo funcione de manera segura antes de integrar.
- **Auditoria Autonoma**: Integracion de **Dependabot** para escaneo continuo de dependencias y secretos, creando Pull Requests autom�ticos ante vulnerabilidades (CVEs).
- **Plantillas Est�ndar**: Facilitamos la comunicacion mediante estructuras predefinidas para Issues y PRs.

---

## aai�� Licencia

Este proyecto est� bajo la **Licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para m�s detalles.

---

Desarrollado con a��i�� por **[Vladimir Acuna Valdebenito](https://www.linkedin.com/in/vladimir-acu%C3%B1a-valdebenito-11924a29/)** para la comunidad de desarrolladores.

## �xa Centro de Documentacion y Gobernanza

El proyecto adopta un enfoque de **documentacion como codigo** orientado a mantener est�ndares y facilitar la vida de desarrolladores, operadores y evaluadores de talento. Toda la documentacion tecnica est� categorizada para su r�pido acceso.

### �x9 Operaciones, Arquitectura y Configuracion

- [�x�i�� Arquitectura Inicial y Contexto (ADR-0001)](docs/adr/0001-contexto-y-decisiones-iniciales.md)
- [�x� Manual de Operacion y Diagnostico (RUNBOOK)](RUNBOOK.md)
- [�x�� Matriz de Compatibilidad y Ambientes (COMPATIBILITY)](COMPATIBILITY.md)
- [�x� Casos y Modos de Ejecucion (OPERATING-MODES)](OPERATING-MODES.md)
- [�x}� Estrategia de Versionado y Entrega (RELEASE)](RELEASE.md)
- [�xS Historial de Cambios (CHANGELOG)](CHANGELOG.md)
- [�x� Guia R�pida de Instalacion (INSTALL)](docs/INSTALL.md)

### �x�� Soporte, Comunidad y Gobernanza

- [�x� Politicas de Asistencia y Soporte (SUPPORT)](SUPPORT.md)
- [�x Guia Directa para Reclutadores Tecnicos](docs/RECRUITER.md)
- [�x�� Guia Oficial de Contribucion](CONTRIBUTING.md)
- [�x:i�� Politica de Seguridad y Reportes](SECURITY.md)
- [aai�� Codigo de Conducta de la Comunidad](CODE_OF_CONDUCT.md)

### aa"i�� Configuracion Estrategica (Metadata / No-MD)

Adem�s del contenido legible, el repositorio contiene archivos de gobernanza ocultos que definen su calidad profesional para ser auditados:

- [�x� Metadatos de Citacion del Software (`CITATION.cff`)](CITATION.cff)
- [�x� Asignacion de Responsabilidades (`CODEOWNERS`)](.github/CODEOWNERS)
- [�xR Formularios y Plantillas de Issues (`.github/ISSUE_TEMPLATE/`)](.github/ISSUE_TEMPLATE/)
- [�x� Auditoria Autom�tica de Dependencias (`dependabot.yml`)](.github/dependabot.yml)
- [aS� Reglas Globales de Formateo (`.editorconfig`)](.editorconfig)
