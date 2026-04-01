# Landing Page de Microsistemas

Esta landing se agregó para presentar **Microsistemas** como producto, sin reemplazar ni modificar el dashboard PHP principal del repositorio.

## Objetivo

- Mostrar el valor del proyecto como suite.
- Resumir la propuesta de producto en un formato visual.
- Mantener la implementación separada del runtime actual.
- Dejar la publicación preparada para GitHub Pages.
- Dejar una referencia documental enlazada desde el `README.md` principal.

## Ubicación

- Vista HTML: [`landing/index.html`](../landing/index.html)
- Estilos: [`landing/assets/styles.css`](../landing/assets/styles.css)
- JS ligero: [`landing/assets/app.js`](../landing/assets/app.js)

## Cómo verla

Si estás usando el proyecto en local, la landing queda disponible en la carpeta `landing/`.

- XAMPP: `http://localhost/microsistemas/landing/`
- Docker Compose: `http://localhost:8080/landing/`
- PHP embebido: `http://localhost:8000/landing/`

## Publicación con GitHub Pages

La landing quedó preparada para publicarse como sitio estático del repositorio, usando el workflow:

- [`.github/workflows/pages.yml`](../.github/workflows/pages.yml)

Este workflow publica el contenido de `landing/` como artefacto de GitHub Pages en cada push a `main` cuando cambian archivos relacionados con la landing o su documentación.

URL esperada si GitHub Pages queda habilitado para este repositorio:

- `https://vladimiracunadev-create.github.io/microsistemas/`

Si GitHub todavía no activa Pages automáticamente, puede ser necesario dejar en la configuración del repositorio:

- `Settings > Pages > Build and deployment > Source: GitHub Actions`

## Criterio de implementación

La landing se hizo como página estática para no interferir con:

- [`index.php`](../index.php), que sigue siendo el dashboard principal.
- Las microapps dentro de [`apps/`](../apps).
- La documentación existente en [`docs/`](../docs).

## Mensaje que comunica

La página presenta a Microsistemas como una suite modular enfocada en:

- diagnóstico técnico y soporte,
- modernización de código PHP,
- automatización DevOps,
- aprendizaje y onboarding,
- documentación y contexto para IA mediante MCP.

## Nota de despliegue

Como la landing es estática, queda mejor preparada para escenarios de presentación documental o publicación web simple. El runtime principal del proyecto sigue dependiendo del stack local del repositorio.
