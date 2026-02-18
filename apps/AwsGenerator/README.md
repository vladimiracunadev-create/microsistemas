# AWS Assistant Pro (Expert Recipes for AWS CLI)

![Version](https://img.shields.io/badge/version-2.1.0-blue)

**AWS Assistant Pro** es un asistente inteligente diseñado para simplificar la gestión de infraestructura en la nube. A diferencia de un simple generador, guía al usuario a través de un flujo intuitivo basado en intenciones reales de negocio.

## Características Destacadas (v2.1.0) 🚀

- **Navegación Guiada**: Selector de intenciones (Consultar, Gestionar, Seguridad) que filtra automáticamente los servicios relevantes.
- **GlassCode Syntax Highlighting**: Resaltado de sintaxis en tiempo real para comandos de AWS CLI.
- **Semáforo de Impacto**: Indicadores visuales de riesgo operativo (Rojo/Amarillo/Verde) con explicaciones en lenguaje natural.
- **EduIcons**: Ayuda contextual (`ⓘ`) en parámetros técnicos para facilitar el aprendizaje.
- **Seguridad**: Bloqueo inteligente de comandos peligrosos en perfiles de producción y Modo Simulado (Dry-run).
- **Favoritos + Historial**: Gestión de recetas preferidas y rastro de comandos previos.
- **Exportación Multi-plataforma**: Generación de scripts `.sh` (Bash) y `.ps1` (PowerShell) listos para producción.

---

## Ejecutar localmente (recomendado)

### VS Code Live Server

1. Abre `index.html`
2. Click derecho → **Open with Live Server**

### Python

```bash
python -m http.server 8080
```

Luego abre `http://localhost:8080`

> Nota: abrir con `file://` puede bloquear `fetch()` por seguridad del navegador.

---

## Cómo usar

1. Define `Profile` y `Region`
2. Busca por palabra clave (ej: `ecr list-images`, `ecs force`, `s3 sync`)
3. Completa parámetros
4. Ejecuta **Prechecks**, luego **Comando**
5. Si fue prueba: ejecuta **Cleanup**
6. Si necesitas un script reutilizable: Exporta `.sh` o `.ps1`

---

## Seguridad / costos (importante)

- Recetas con **riesgo alto** requieren confirmación.
- Activa “Bloquear peligrosos en prod” y usa perfiles separados (`dev`, `prod`).
- Lee `docs/costos-y-seguridad.md`.

---

## Validación (CI)

En GitHub Actions se ejecuta:

```bash
python scripts/validate.py
```

Valida:

- ids únicos
- campos requeridos
- `risk.level` válido
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
