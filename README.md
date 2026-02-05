# Microsistemas – Developer Productivity Suite

![Version](https://img.shields.io/github/v/tag/vladimiracunadev-create/microsistemas?label=version&color=blue)
![Build Status](https://img.shields.io/github/actions/workflow/status/vladimiracunadev-create/microsistemas/docker-publish.yml?branch=main&label=build&logo=github)
![License](https://img.shields.io/github/license/vladimiracunadev-create/microsistemas?color=green)
![Packages](https://img.shields.io/badge/container-ghcr.io-orange?logo=docker)

**Microsistemas** es una suite profesional de herramientas web modulares diseñada para desarrolladores y administradores de sistemas. Ofrece soluciones rápidas para tareas de diagnóstico, conversión de datos, gestión de bases de datos y modernización de código PHP.

## 📋 Requisitos del Sistema

Para ver el detalle completo de hardware y software (PHP, extensiones, etc.), consulta:

👉 **[Requisitos del Sistema (REQUIREMENTS.md)](docs/REQUIREMENTS.md)**

## Inicio Rápido con Makefile

Este proyecto incluye un `Makefile` para simplificar las tareas comunes. Asegúrate de tener `make` instalado (ej: vía Chocolatey `choco install make` en Windows o preinstalado en Linux).

```bash
# Instalar dependencias PHP
make install

# Levantar la aplicación con Docker
make up

# Iniciar servidor PHP embebido (localhost:8000)
make serve

# Ver todos los comandos disponibles
make help
```

---

## 🛠️ Microsistemas Hub (CLI)

Hemos añadido una capa de gestión centralizada llamada **Hub**. Esta herramienta permite listar, ejecutar y diagnosticar todas las micro-apps de forma estandarizada.

### Uso Rápido del Hub:

```bash
# Listar todas las aplicaciones
make hub-list

# Ejecutar una aplicación localmente (ej: Conversor)
make hub-run APP=Conversor

# Levantar una aplicación con su propio Docker Compose
make hub-up APP=CapacitySim

# Chequeo de salud del entorno
make hub-doctor
```

Para más detalles, consulta la 📖 **[Guía del Hub (docs/HUB.md)](docs/HUB.md)**.

---

## ⚡ Inicio Inmediato

### 🐳 Con Docker (Recomendado)

Levanta todo el ecosistema en menos de 30 segundos:

```bash
docker-compose up -d
```

🌐 Dashboard: `http://localhost:8080`

### 🐘 Con XAMPP

1. Clona en `htdocs/microsistemas`.
2. Renombra `.env.example` a `.env`.
3. Accede a `http://localhost/microsistemas/`.

---

## 🚀 Características Principales

<table align="center">
  <tr>
    <td align="center"><b>🛠️ Modular</b><br>Apps independientes en <code>apps/</code></td>
    <td align="center"><b>📦 Composer</b><br>Autoloading PSR-4</td>
    <td align="center"><b>🛡️ Seguro</b><br>Variables de entorno .env</td>
  </tr>
  <tr>
    <td align="center"><b>🐳 Docker Ready</b><br>Infraestructura inmutable</td>
    <td align="center"><b>🎨 Modern UI</b><br>Dashboard Dark Mode</td>
    <td align="center"><b>自动化 CI/CD</b><br>GitHub Packages auto-deploy</td>
  </tr>
</table>

---

¿Estás evaluando este proyecto como parte de un proceso de selección? Consulta nuestra **[Guía para Reclutadores](docs/RECRUITER.md)** que incluye:

- Contexto de negocio y valor agregado
- Decisiones arquitectónicas clave
- Tour guiado de casos de uso destacados
- Stack tecnológico y patrones aplicados

---

## 📂 Catálogo de Herramientas

<!-- CATALOG_START -->

| Herramienta | Tecnología | Propósito |
| :--- | :--- | :--- |
| **[CapacitySim](apps/CapacitySim)** | ![DevOps](https://img.shields.io/badge/-DevOps-2496ED?logo=docker&logoColor=white) | Simulador heurístico de capacidad y RPS para infraestructuras con estimación de costos. |
| **[Conversor](apps/Conversor)** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | Herramienta de sanitización y codificación segura de texto. |
| **[GitTrainer](apps/GitTrainer)** | ![JS](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=black) | Biblioteca interactiva de comandos Git y aprendizaje visual. |
| **[JsTools](apps/JsTools)** | ![JS](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=black) | Colección de herramientas y utilidades JavaScript para productividad. |
| **[LogViewer](apps/LogViewer)** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | Auditoría segura y visualización de logs del sistema en tiempo real. |
| **[PhpMigrator](apps/PhpMigrator)** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | Modernización de código PHP legacy (5.x) a estándares modernos (8.x). |
| **[SqlViewer](apps/SqlViewer)** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | Inspección y gestión de bases de datos sin necesidad de clientes pesados. |
| **[YmlGenerator](apps/YmlGenerator)** | ![JS](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=black) | Generador visual de configuraciones YAML para Docker y Kubernetes. |

<!-- CATALOG_END -->

---

## 📖 Documentación Avanzada

Explora nuestras guías detalladas para convertirte en un experto de la suite:

- 📖 **[Guía para Principiantes](docs/BEGINNERS_GUIDE.md)**: ¿Eres nuevo? Empieza aquí para entender las carpetas.
- 📖 **[Manual de Usuario](docs/USER_MANUAL.md)**: Cómo sacar el máximo provecho a cada herramienta.
- 🚀 **[Guía de Instalación](docs/INSTALL.md)**: Despliegue en Docker, Linux y XAMPP.
- 🏗️ **[Arquitectura](docs/ARCHITECTURE.md)**: Diagramas Mermaid y detalles del Core.
- 📜 **[Catálogo de Sistemas](docs/SYSTEMS_CATALOG.md)**: Detalles técnicos de cada micro-app.
- 🔌 **[Referencia de API](docs/API.md)**: Cómo interactuar con el core y extensiones.
- 🛡️ **[Seguridad](docs/SECURITY.md)**: Políticas de protección y reporte.
- 🛠️ **[Specs Técnicas](docs/TECHNICAL_SPECS.md)**: Stack, estándares y normas de mantención.
- 🧑‍💻 **[Guía de Mantenedores](docs/MAINTAINERS.md)**: Información crítica para administradores del proyecto.
- ⚖️ **[Código de Conducta](CODE_OF_CONDUCT.md)**: Normas para una comunidad saludable.
- 🕒 **[Historial de Cambios](CHANGELOG.md)**: Registro detallado de versiones y mejoras.

---

## 🤝 Comunidad y Colaboración

¡Este proyecto está abierto a **Cooperación Real**! Queremos que contribuir sea lo más fácil y seguro posible.

### 🌟 ¿Cómo ayudar?

- **Reporta Errores**: Usa nuestra [plantilla de errores](https://github.com/vladimiracunadev-create/microsistemas/issues/new?template=bug_report.md) para ayudarnos a mejorar.
- **Sugiere Funciones**: Tenemos una [plantilla para nuevas ideas](https://github.com/vladimiracunadev-create/microsistemas/issues/new?template=feature_request.md).
- **Resuelve Issues**: Busca etiquetas como `good first issue` o `help wanted` para empezar.

### 🛡️ Contribuciones Seguras

Para mantener la calidad y estabilidad, implementamos:

- **Protección de Rama**: Los cambios en `main` requieren un **Pull Request** y al menos una **revisión**.
- **Checks Automáticos**: El CI valida que todo funcione antes de integrar.
- **Plantillas Estándar**: Facilitamos la comunicación mediante estructuras predefinidas para Issues y PRs.

---

Desarrollado con ❤️ por **[Vladimir Acuña Valdebenito](https://www.linkedin.com/in/vladimir-acu%C3%B1a-valdebenito-11924a29/)** para la comunidad de desarrolladores.
