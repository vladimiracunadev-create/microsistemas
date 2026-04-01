# Estructura de Recetas (JSON)

Las recetas se gestionan en `data/aws.commands.json`. Cada entrada sigue este esquema tecnico:

- `command`: Plantilla AWS CLI con placeholders `{{var}}`.
- `params[]`: Configuracion de inputs (soporta `type`, `label`, `default` y `required`).
- `help`: (Opcional) Texto de ayuda contextual que se muestra via **EduIcons** (`ⓘ`).
- `intent`: Categoria logica (consultar, gestionar, etc.) que alimenta el **Selector de Intenciones**.
- `prechecks[]` / `cleanup[]`: Comandos auxiliares para asegurar el entorno.
- `risk.level`: bajo | medio | alto (Activa el **Semaforo**).
- `supports_dryrun`: Habilita la flag `--dryrun` dinamica si la receta lo permite.

Tip: si quieres "recetas por dominio" (deploy web estatica, pipeline, etc.), crea recetas tipo **workflow** con varios pasos en prechecks y cleanup.
