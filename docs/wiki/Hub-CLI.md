# Hub CLI (Gestión Centralizada) 🛠️

El **Microsistemas Hub** es nuestro motor de gestión centralizada. Permite interactuar con todas las micro-apps mediante comandos estandarizados, facilitando enormemente el flujo de trabajo tanto en desarrollo como en producción.

## 🚀 Comandos Principales (Makefile)

Hemos integrado el Hub directamente en el `Makefile` raíz para tu comodidad:

*   `make hub-list`: Lista todas las aplicaciones instaladas y su estado.
*   `make hub-run APP=Nombre`: Ejecuta el servidor local para una aplicación específica.
*   `make hub-up APP=Nombre`: Levanta una aplicación con su propio contenedor Docker.
*   `make hub-doctor`: Realiza un diagnóstico del sistema y verifica requisitos.

## 📂 Manifiesto de Aplicación

Cada aplicación en `apps/` tiene su propio `app.manifest.yml`. Este archivo define:
*   Nombre y descripción.
*   Comandos de ejecución e instalación.
*   Variables de entorno requeridas.
*   Rutas de Docker Compose.

## 💻 Script de Wrapper (Powershell/Bash)

Para usuarios que no utilicen `make`, disponemos de scripts directos:
*   En Windows: `./hub.ps1 list`
*   En Linux/Mac: `./hub.sh list`

---
📖 Para más detalles técnicos, consulta la **[Arquitectura](Arquitectura)**.
