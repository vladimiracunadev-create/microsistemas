# AwsGenerator (recetas reales para AWS CLI)

Microsistema tipo “generador de comandos” similar al de Git, pero para **AWS CLI**.

Incluye:
- Base de recetas en JSON (`data/aws.commands.json`) con **recetas reales** (comandos existentes en AWS CLI).
- UI estática (HTML/CSS/JS): búsqueda, filtros, parámetros.
- ⭐ Favoritos + 🕘 Historial (localStorage).
- Exportación de scripts: **.sh** y **.ps1** (incluye prechecks + comando + cleanup).
- Seguridad: confirmación para recetas **alto riesgo**, y bloqueo opcional si el perfil parece `prod`.
- Validación automática (CI): `.github/workflows/validate.yml` + `scripts/validate.py`.

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
