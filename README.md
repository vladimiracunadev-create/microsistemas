# Microsistemas – Developer Productivity Suite

![Version](https://img.shields.io/github/v/tag/vladimiracunadev-create/microsistemas?label=version&color=blue)
![Build Status](https://img.shields.io/github/actions/workflow/status/vladimiracunadev-create/microsistemas/docker-publish.yml?branch=main&label=build&logo=github)
![License](https://img.shields.io/github/license/vladimiracunadev-create/microsistemas?color=green)
![Packages](https://img.shields.io/badge/container-ghcr.io-orange?logo=docker)

**Microsistemas** es una suite profesional de herramientas web modulares diseñada para desarrolladores y administradores de sistemas. Ofrece soluciones rápidas para tareas de diagnóstico, conversión de datos, gestión de bases de datos y modernización de código PHP.

## Quick Start with Makefile

This project includes a `Makefile` to simplify common tasks. Ensure you have `make` installed (e.g., via Chocolatey `choco install make` or GnuWin32).

```bash
# Install dependencies
make install

# Start the application (Docker)
make up

# Start the application (PHP Built-in Server)
make serve

# View all commands
make help
```

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

## 📂 Catálogo de Herramientas

| Herramienta | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Conversor** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | Sanitización y codificación segura de texto. |
| **SQL Viewer** | ![SQL](https://img.shields.io/badge/-MySQL-4479A1?logo=mysql&logoColor=white) | Inspección de DB sin clientes pesados. |
| **Git Trainer** | ![JS](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=black) | Biblioteca interactiva de comandos Git. |
| **Log Viewer** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | Auditoría segura de logs del sistema. |
| **PHP Migrator** | ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white) | Modernización de código PHP 5.x a 8.x. |
| **YML Gen** | ![JS](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=black) | Generador visual de configuraciones YAML. |
| **Capacity Sim** | ![JS](https://img.shields.io/badge/-DevOps-2496ED?logo=docker&logoColor=white) | Simulador heurístico de capacidad y RPS para infraestructuras. **Pro**: Simulación de costos multi-cloud, modo comparativo A/B, exportación JSON/PDF. |

---

## 📖 Documentación Avanzada

Explora nuestras guías detalladas para convertirte en un experto de la suite:


*   📖 **[Guía para Principiantes](docs/BEGINNERS_GUIDE.md)**: ¿Eres nuevo? Empieza aquí para entender las carpetas.
*   📖 **[Manual de Usuario](docs/USER_MANUAL.md)**: Cómo sacar el máximo provecho a cada herramienta.
*   🚀 **[Guía de Instalación](docs/INSTALL.md)**: Despliegue en Docker, Linux y XAMPP.
*   🏗️ **[Arquitectura](docs/ARCHITECTURE.md)**: Diagramas Mermaid y detalles del Core.
*   📜 **[Catálogo de Sistemas](docs/SYSTEMS_CATALOG.md)**: Detalles técnicos de cada micro-app.
*   🔌 **[Referencia de API](docs/API.md)**: Cómo interactuar con el core y extensiones.
*   🛡️ **[Seguridad](docs/SECURITY.md)**: Políticas de protección y reporte.
*   🛠️ **[Specs Técnicas](docs/TECHNICAL_SPECS.md)**: Stack, estándares y normas de mantención.
*   🧑‍💻 **[Guía de Mantenedores](docs/MAINTAINERS.md)**: Información crítica para administradores del proyecto.
*   ⚖️ **[Código de Conducta](CODE_OF_CONDUCT.md)**: Normas para una comunidad saludable.
*   🕒 **[Historial de Cambios](CHANGELOG.md)**: Registro detallado de versiones y mejoras.


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

Para más detalles, consulta la **[Guía de Contribución](CONTRIBUTING.md)** y nuestro **[Roadmap de Futuro](ROADMAP.md)**.



Desarrollado con ❤️ por **[Vladimir Acuña Valdebenito](https://www.linkedin.com/in/vladimir-acu%C3%B1a-valdebenito-11924a29/)** para la comunidad de desarrolladores.

