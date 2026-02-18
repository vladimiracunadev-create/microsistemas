# Seguridad y Control de Impacto (AWS Assistant Pro)

## El Semáforo de Impacto 🚦
La herramienta clasifica cada acción según su riesgo operativo potencial:

- 🔴 **Riesgo Alto (Crítico)**: Acciones destructivas (`delete`, `terminate`), cambios en IAM o políticas públicas. Requieren doble confirmación.
- 🟡 **Riesgo Medio (Modificación)**: Actualizaciones de código, cambios de configuración en servicios activos o despliegues.
- 🟢 **Riesgo Bajo (Consulta)**: Comandos de lectura como `list`, `describe` o `get-metrics`.

## Regla de Oro
Si un comando crea recursos de cómputo (EC2/ECS/RDS), asume que generará costos inmediatamente si queda activo. Usa la sección de **Cost Hint** integrada en la receta.

## Recomendaciones para tu caso (free tier + créditos)
- Usa perfiles separados: `dev` y `prod`.
- Activa alertas: Budgets + Cost Explorer.
- Revisa identidad antes de ejecutar:
  - `aws sts get-caller-identity`
