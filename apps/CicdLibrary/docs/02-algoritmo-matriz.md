# Algoritmo para generar `matrix.json` y `matrix-full.json`

## Entradas

- `axes.json`: espacio de combinaciones
- `param-schema.json`: defaults y significado de parámetros
- `presets.json`: baseline realista (ej: private-ssh)
- `templates/`: plantillas por orquestador

## Matriz ligera (matrix.json)

1) Recorrer producto cartesiano de ejes.
2) Crear config con defaults + preset.
3) Aplicar overrides del combo.
4) Normalizar parámetros por estrategia (ssh/docker/s3).
5) Evaluar:
   - requirements (inputs obligatorios)
   - requiredSecrets
   - nonYamlSettings
6) Guardar key, descripción, outputs esperados.

## Matriz full (matrix-full.json)

1) Renderizar YAML por combo.
2) Generar BLUEPRINT.md por combo.
3) Guardar contenido renderizado en JSON.
