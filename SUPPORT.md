# Soporte y Ayuda (SUPPORT)

Gracias por tu interés en **Microsistemas**. Dada la naturaleza de este proyecto, es importante dejar constancia de la forma en que gestionamos la ayuda, los reportes de bugs, y las contribuciones por parte de la comunidad, usuarios, o evaluadores en procesos de portafolio y reclutamiento.

## 1. Alcance y Naturaleza del Proyecto

Este ecosistema opera como un **Laboratorio Avanzado, Showcase Profesional y Herramienta de Productividad Open Source**. 
Por consiguiente, el autor mantiene la plataforma en la medida en que el tiempo y las prioridades se lo permiten; **NO existen Acuerdos de Nivel de Servicio (SLA)** formales, de urgencia comercial y no hay soporte oficial garantizado para el despliegue de esta suite en intranets empresariales cerradas.

## 2. Lo que SÍ Atendemos

- Errores graves del "Core" o "Hub" que prevean el levantamiento de la aplicación (ej: Fallos en Dockerfiles, errores fatales 500 universales).
- Problemas de vulnerabilidades o problemas de seguridad. (Para esto revisar el documento `SECURITY.md`).
- Solicitudes de incorporación (Pull Requests) que añadan micro-apps útiles o expandan la documentación y flujos operativos (previa discusión técnica).
- Problemas tipográficos, gramaticales en la herramienta o en la documentación técnica que confundan o deterioren la percepción del sistema.

## 3. Lo que NO Atendemos

- Configuraciones específicas a nivel de red, configuraciones Proxy reversas personalizadas en entornos empresariales.
- Migraciones nativas o porte a frameworks pesados si no están fundamentados o destruyen los principios del proyecto.
- Asesoría técnica individual para "Aprender Docker", "Aprender PHP" o de uso general si recaen en tecnologías estandarizadas, más allá del propósito expreso en nuestra Wiki.

## 4. Canales Oficiales

Si tienes un problema, solicitud o duda y tras haber leído exhaustivamente los documentos de la carpeta `docs/` no hallaste tu respuesta, comunícate mediante:

### 🐛 Para Errores (Bugs)
Registra el fallo directamente a través del gestor de Issues Oficial de Github:
👉 **[Abrir un Issue por Bug](https://github.com/vladimiracunadev-create/microsistemas/issues/new?template=bug_report.md)**

*Información requerida mínima:*
- Sistema Operativo host (ej. Ubuntu 22.04, Windows 11 + WSL2 Docker).
- Comandos ejecutados (ej: `make up` o `docker compose up`).
- Adjunta las líneas de log arrojadas (puedes sacarlas con `docker-compose logs web`).
- En qué micro-app detectaste el bug (ej: CapacitySim o Conversor).

### 💡 Para Sugerencias e Ideas de Módulos
Si quieres proponer una nueva micro-aplicación o refactor a una existente:
👉 **[Sugerir una Funcionalidad](https://github.com/vladimiracunadev-create/microsistemas/issues/new?template=feature_request.md)**

### 🤔 Consultas Estructurales o de Reclutamiento
Si evalúas el repositorio en calidad de Head Hunter, Tech Recruiter, o ingeniero de plataforma revisando metodologías y deseas charlar sobre la arquitectura general del proyecto, el contacto debe ser directo a través de los enlaces personales estipulados en el `README.md` (LinkedIn / Redes Directas del Desarrollador).
