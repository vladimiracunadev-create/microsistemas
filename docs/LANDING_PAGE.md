�# Landing Page de Microsistemas

Esta landing se agrego para presentar **Microsistemas** como producto, sin reemplazar ni modificar el dashboard PHP principal del repositorio.

## Objetivo

- Mostrar el valor del proyecto como suite.
- Resumir la propuesta de producto en un formato visual.
- Mantener la implementacion separada del runtime actual.
- Dejar la publicacion preparada para GitHub Pages.
- Dejar una referencia documental enlazada desde el `README.md` principal.

## Ubicacion

- Vista HTML: [`landing/index.html`](../landing/index.html)
- Estilos: [`landing/assets/styles.css`](../landing/assets/styles.css)
- JS ligero: [`landing/assets/app.js`](../landing/assets/app.js)

## Como verla

Si estas usando el proyecto en local, la landing queda disponible en la carpeta `landing/`.

- XAMPP: `http://localhost/microsistemas/landing/`
- Docker Compose: `http://localhost:8080/landing/`
- PHP embebido: `http://localhost:8000/landing/`

## Publicacion con GitHub Pages

La landing quedo preparada para publicarse como sitio estatico del repositorio, usando el workflow:

- [`.github/workflows/pages.yml`](../.github/workflows/pages.yml)

Este workflow publica el contenido de `landing/` como artefacto de GitHub Pages en cada push a `main` cuando cambian archivos relacionados con la landing o su documentacion.

URL esperada si GitHub Pages queda habilitado para este repositorio:

- `https://vladimiracunadev-create.github.io/microsistemas/`

Si GitHub todavia no activa Pages automaticamente, puede ser necesario dejar en la configuracion del repositorio:

- `Settings > Pages > Build and deployment > Source: GitHub Actions`

## Criterio de implementacion

La landing se hizo como pagina estatica para no interferir con:

- [`index.php`](../index.php), que sigue siendo el dashboard principal.
- Las microapps dentro de [`apps/`](../apps).
- La documentacion existente en [`docs/`](../docs).

## Mensaje que comunica

La pagina presenta a Microsistemas como una suite modular enfocada en:

- diagnostico tecnico y soporte,
- modernizacion de codigo PHP,
- automatizacion DevOps,
- aprendizaje y onboarding,
- documentacion y contexto para IA mediante MCP.

## Nota de despliegue

Como la landing es estatica, queda mejor preparada para escenarios de presentacion documental o publicacion web simple. El runtime principal del proyecto sigue dependiendo del stack local del repositorio.
