# Mapa de carpetas (diseño del laboratorio)

## Objetivo

Separar:

- **datos (schema/presets/axes)**,
- **reglas (requirements/secrets/non-yaml)**,
- **templates (outputs)**,
- **engine (generación)**

## Estructura

- `schemas/axes.json`: dimensiones soportadas (orchestrator/stack/cdStrategy/runner/envModel)
- `schemas/param-schema.json`: catálogo de parámetros (descripción + defaults)
- `presets/presets.json`: escenarios recomendados
- `templates/`: plantillas Mustache por orquestador
- `engine/`:
  - `utils.js`: deepGet/deepSet + defaults
  - `rules.js`: requirements + secrets + non-yaml settings
  - `vm.js`: view-model + render
  - `generate-matrix.js`: genera matrix.json / matrix-full.json
