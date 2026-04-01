# Soporte y Ayuda (SUPPORT)

Gracias por tu interes en **Microsistemas**. Dada la naturaleza de este proyecto, es importante dejar constancia de la forma en que gestionamos la ayuda, los reportes de bugs, y las contribuciones por parte de la comunidad, usuarios, o evaluadores en procesos de portafolio y reclutamiento.

## 1. Alcance y Naturaleza del Proyecto

Este ecosistema opera como un **Laboratorio Avanzado, Showcase Profesional y Herramienta de Productividad Open Source**.
Por consiguiente, el autor mantiene la plataforma en la medida en que el tiempo y las prioridades se lo permiten; **NO existen Acuerdos de Nivel de Servicio (SLA)** formales, de urgencia comercial y no hay soporte oficial garantizado para el despliegue de esta suite en intranets empresariales cerradas.

## 2. Lo que SI Atendemos

- Errores graves del "Core" o "Hub" que prevean el levantamiento de la aplicacion (ej: Fallos en Dockerfiles, errores fatales 500 universales).
- Problemas de vulnerabilidades o problemas de seguridad. (Para esto revisar el documento `SECURITY.md`).
- Solicitudes de incorporacion (Pull Requests) que anadan micro-apps utiles o expandan la documentacion y flujos operativos (previa discusion tecnica).
- Problemas tipograficos, gramaticales en la herramienta o en la documentacion tecnica que confundan o deterioren la percepcion del sistema.

## 3. Lo que NO Atendemos

- Configuraciones especificas a nivel de red, configuraciones Proxy reversas personalizadas en entornos empresariales.
- Migraciones nativas o porte a frameworks pesados si no estan fundamentados o destruyen los principios del proyecto.
- Asesoria tecnica individual para "Aprender Docker", "Aprender PHP" o de uso general si recaen en tecnologias estandarizadas, mas alla del proposito expreso en nuestra Wiki.

## 4. Canales Oficiales

Si tienes un problema, solicitud o duda y tras haber leido exhaustivamente los documentos de la carpeta `docs/` no hallaste tu respuesta, comunicate mediante:

### 🐛 Para Errores (Bugs)

Registra el fallo directamente a traves del gestor de Issues Oficial de Github:
👉 **[Abrir un Issue por Bug](https://github.com/vladimiracunadev-create/microsistemas/issues/new?template=bug_report.md)**

*Informacion requerida minima:*

- Sistema Operativo host (ej. Ubuntu 22.04, Windows 11 + WSL2 Docker).
- Comandos ejecutados (ej: `make up` o `docker compose up`).
- Adjunta las lineas de log arrojadas (puedes sacarlas con `docker-compose logs web`).
- En que micro-app detectaste el bug (ej: CapacitySim o Conversor).

### 💡 Para Sugerencias e Ideas de Modulos

Si quieres proponer una nueva micro-aplicacion o refactor a una existente:
👉 **[Sugerir una Funcionalidad](https://github.com/vladimiracunadev-create/microsistemas/issues/new?template=feature_request.md)**

### 🤔 Consultas Estructurales o de Reclutamiento

Si evaluas el repositorio en calidad de Head Hunter, Tech Recruiter, o ingeniero de plataforma revisando metodologias y deseas charlar sobre la arquitectura general del proyecto, el contacto debe ser directo a traves de los enlaces personales estipulados en el `README.md` (LinkedIn / Redes Directas del Desarrollador).
