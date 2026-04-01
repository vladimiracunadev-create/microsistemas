# Seguridad y Control de Impacto (AWS Assistant Pro)

## El Semaforo de Impacto =�

La herramienta clasifica cada accion segun su riesgo operativo potencial:

- =4 **Riesgo Alto (Critico)**: Acciones destructivas (`delete`, `terminate`), cambios en IAM o politicas publicas. Requieren doble confirmacion.
- =� **Riesgo Medio (Modificacion)**: Actualizaciones de codigo, cambios de configuracion en servicios activos o despliegues.
- =� **Riesgo Bajo (Consulta)**: Comandos de lectura como `list`, `describe` o `get-metrics`.

## Regla de Oro

Si un comando crea recursos de computo (EC2/ECS/RDS), asume que generara costos inmediatamente si queda activo. Usa la seccion de **Cost Hint** integrada en la receta.

## Recomendaciones para tu caso (free tier + creditos)

- Usa perfiles separados: `dev` y `prod`.
- Activa alertas: Budgets + Cost Explorer.
- Revisa identidad antes de ejecutar:
  - `aws sts get-caller-identity`
