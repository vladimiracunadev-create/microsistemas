# Costos y seguridad

## Regla de oro
Si un comando crea compute (EC2/ECS/RDS), asume costo si queda encendido.

## Budgets
**Budgets normalmente solo avisa** (email/SNS). No corta servicios por sí solo.

## Riesgos típicos
- **Alto**: IAM, delete, terminate, policies públicas, `--force`, `--delete`, `rm --recursive`.
- **Medio**: despliegues (ECS/Lambda/CFN), cambios de config.
- **Bajo**: list/describe/get/metrics/logs.

## Recomendaciones para tu caso (free tier + créditos)
- Usa perfiles separados: `dev` y `prod`.
- Activa alertas: Budgets + Cost Explorer.
- Revisa identidad antes de ejecutar:
  - `aws sts get-caller-identity`
