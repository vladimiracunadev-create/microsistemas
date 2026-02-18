# Recetas

Las recetas están en `data/aws.commands.json`.

Campos clave:
- `command`: comando AWS CLI con variables `{{var}}`
- `params[]`: genera el formulario
- `prechecks[]`: comandos recomendados previos
- `cleanup[]`: limpieza/rollback sugerido
- `risk.level`: bajo | medio | alto
- `dangerous`: fuerza confirmación
- `supports_dryrun`: habilita `--dryrun` global

Tip: si quieres “recetas por dominio” (deploy web estática, pipeline, etc.), crea recetas tipo **workflow** con varios pasos en prechecks y cleanup.
