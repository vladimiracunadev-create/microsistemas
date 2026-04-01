# CI/CD Lab Engine (modo amplio)

Este repo es un **motor** para generar:

- `out/matrix.json` � matriz ligera de combinaciones soportadas
- `out/matrix-full.json` � matriz completa con **YAML renderizado** + docs + secrets + cosas fuera de YAML

## Por que es amplio (no solo YAML)

El YAML describe jobs, pero CI/CD completo incluye:

- artefactos/registry (promocion)
- entornos (staging/prod) y aprobaciones
- branch protections / required checks (config fuera del YAML)
- seguridad (secrets, PR forks, OIDC)
- operacion (healthcheck, rollback)

## Estructura

- `schemas/axes.json` � dimensiones (orchestrator/stack/strategy/runner/envModel)
- `schemas/param-schema.json` � catalogo de parametros (descripcion + defaults)
- `presets/presets.json` � presets de escenarios
- `templates/` � plantillas Mustache por orquestador
- `engine/` � generador de matrices

## Uso

```bash
npm install
npm run matrix
npm run matrix:full
npm run example
```

Los archivos quedan en `out/`.

## Nota importante: fuera de YAML

- GitHub approvals: **Settings � Environments � production � Required reviewers**
- Branch protection / required checks: **Settings � Branches**
- Code owners: `CODEOWNERS` + reglas de revision
