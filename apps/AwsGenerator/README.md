# AWS Assistant Pro (Expert Recipes for AWS CLI)

![Version](https://img.shields.io/badge/version-2.1.0-blue)

**AWS Assistant Pro** es un asistente inteligente disenado para simplificar la gestion de infraestructura en la nube. A diferencia de un simple generador, guia al usuario a traves de un flujo intuitivo basado en intenciones reales de negocio.

## Caracteristicas Destacadas (v2.1.0) =�

- **Navegacion Guiada**: Selector de intenciones (Consultar, Gestionar, Seguridad) que filtra automaticamente los servicios relevantes.
- **GlassCode Syntax Highlighting**: Resaltado de sintaxis en tiempo real para comandos de AWS CLI.
- **Semaforo de Impacto**: Indicadores visuales de riesgo operativo (Rojo/Amarillo/Verde) con explicaciones en lenguaje natural.
- **EduIcons**: Ayuda contextual (`�`) en parametros tecnicos para facilitar el aprendizaje.
- **Seguridad**: Bloqueo inteligente de comandos peligrosos en perfiles de produccion y Modo Simulado (Dry-run).
- **Favoritos + Historial**: Gestion de recetas preferidas y rastro de comandos previos.
- **Exportacion Multi-plataforma**: Generacion de scripts `.sh` (Bash) y `.ps1` (PowerShell) listos para produccion.

---

## Ejecutar localmente (recomendado)

### VS Code Live Server

1. Abre `index.html`
2. Click derecho � **Open with Live Server**

### Python

```bash
python -m http.server 8080
```

Luego abre `http://localhost:8080`

> Nota: abrir con `file://` puede bloquear `fetch()` por seguridad del navegador.

---

## Como usar

1. Define `Profile` y `Region`
2. Busca por palabra clave (ej: `ecr list-images`, `ecs force`, `s3 sync`)
3. Completa parametros
4. Ejecuta **Prechecks**, luego **Comando**
5. Si fue prueba: ejecuta **Cleanup**
6. Si necesitas un script reutilizable: Exporta `.sh` o `.ps1`

---

## Seguridad / costos (importante)

- Recetas con **riesgo alto** requieren confirmacion.
- Activa Bloquear peligrosos en prod y usa perfiles separados (`dev`, `prod`).
- Lee `docs/costos-y-seguridad.md`.

---

## Validacion (CI)

En GitHub Actions se ejecuta:

```bash
python scripts/validate.py
```

Valida:

- ids unicos
- campos requeridos
- `risk.level` valido
- variables `{{ }}` definidas (globales o params)

---

## Estructura

- `index.html`
- `assets/` (UI)
- `data/aws.commands.json` (recetas)
- `data/schema.aws.commands.json`
- `docs/`
- `scripts/validate.py`

---

## Licencia

MIT
