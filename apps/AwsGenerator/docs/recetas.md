# Estructura de Recetas (JSON)

Las recetas se gestionan en `data/aws.commands.json`. Cada entrada sigue este esquema técnico:

- `command`: Plantilla AWS CLI con placeholders `{{var}}`.
- `params[]`: Configuración de inputs (soporta `type`, `label`, `default` y `required`).
- `help`: (Opcional) Texto de ayuda contextual que se muestra vía **EduIcons** (`ⓘ`).
- `intent`: Categoría lógica (consultar, gestionar, etc.) que alimenta el **Selector de Intenciones**.
- `prechecks[]` / `cleanup[]`: Comandos auxiliares para asegurar el entorno.
- `risk.level`: bajo | medio | alto (Activa el **Semáforo**).
- `supports_dryrun`: Habilita la flag `--dryrun` dinámica si la receta lo permite.

Tip: si quieres “recetas por dominio” (deploy web estática, pipeline, etc.), crea recetas tipo **workflow** con varios pasos en prechecks y cleanup.
