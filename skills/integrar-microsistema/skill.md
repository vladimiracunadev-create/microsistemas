# Skill: Integracion limpia de microsistema (apps/*) en repo "microsistemas"

## Objetivo

Integrar un microsistema nuevo en `apps/<Nombre>/` de forma **limpia, minima, coherente y verificable**, actualizando:

- Dashboard (`index.php`) → tarjeta nueva
- Manifest (`apps/<Nombre>/app.manifest.yml`) → detectable por Hub
- Documentacion del repo (README + docs/*)
- Wiki (docs/wiki/*) → preparado para sync
- Chequeos (make validate/test/catalog/hub-list)

> **💡 IA Context Layer**: Si un Asistente de IA esta liderando la integracion, puede consultar esta skill con la Tool `read_skill("integrar-microsistema")` y automatizar tareas de redaccion con el Prompt `integrar-microapp`.

## Entrada (Inputs)

- `APP_NAME`: nombre del microsistema (ej: `KatasMultiLang`)
- `APP_DIR`: ruta destino (ej: `apps/KatasMultiLang/`)
- `APP_TYPE`: `static` | `php` | `node` | `python` (por defecto `static`)
- `APP_DESC`: descripcion corta (1 linea)
- `APP_LINK`: link relativo (por defecto `apps/<Nombre>/`)
- `ZIP_SOURCE` (opcional): zip a extraer con estructura `apps/<Nombre>/...`
- `DOCS_SCOPE`: `minimo` | `completo` (por defecto `completo`)

## Salida (Deliverables)

1) Carpeta `apps/<Nombre>/` con `index.html` (si es static) y `app.manifest.yml`
2) `index.php` con tarjeta nueva (sin romper layout)
3) README principal actualizado (preferente via generador `make catalog`)
4) docs/* actualizados (segun existan)
5) docs/wiki/* actualizados (segun existan)
6) Evidencia de checks: `make validate`, `make test`, `make hub-list`

## Reglas de oro (no negociables)

- NO romper rutas existentes, NO renombrar apps existentes.
- NO agregar dependencias globales nuevas "porque si".
- NO tocar CSS global salvo que sea estrictamente necesario.
- NO reordenar tarjetas existentes: solo insertar 1 nueva donde calce.
- Preferir automatizaciones existentes del repo (Makefile/scripts).

---

## Flujo paso a paso

### Paso 0 — Preflight (no tocar nada todavia)

- Confirmar que existe repo `microsistemas/` y su estructura base.
- Buscar archivos clave:
  - `index.php`
  - `apps/`
  - `Makefile`
  - `docs/`
  - `docs/wiki/`
- Registrar si existen (si/no). Si no existen, NO inventar jerarquias; usar minimo viable.

### Paso 1 — Integrar carpeta del microsistema

1. Si `ZIP_SOURCE` existe, extraer y verificar que queda en:
   - `apps/<APP_NAME>/...`
2. Validar:
   - Si `APP_TYPE=static`, debe existir `apps/<APP_NAME>/index.html`.
3. Si falta `app.manifest.yml`, crear uno usando plantilla.

### Paso 2 — Dashboard (`index.php`) (Punto 2)

1. Encontrar el grid/listado de tarjetas:
   - Buscar `class="card"` o patron repetido de tarjetas.
2. Insertar 1 tarjeta NUEVA:
   - badge coherente (ej: `HTML + JS`)
   - titulo: `APP_NAME`
   - descripcion: `APP_DESC`
   - boton: "Abrir Herramienta"
   - link: `APP_LINK`
3. Ubicacion:
   - Cerca de apps similares (JS/estaticas o "referencia/estudio").
4. No reordenar otras tarjetas.

### Paso 3 — Hub detecta la app

1. Ejecutar `make hub-list`.
2. Confirmar que aparece `APP_NAME`.
3. Si no aparece:
   - revisar `app.manifest.yml` (key fields)
   - revisar carpeta y nombre (case-sensitive)

### Paso 4 — Documentacion "TOTAL" (segun existan archivos)

#### 4.1 README principal

- Ejecutar: `make catalog` (si existe)
- Verificar que aparece la app en el catalogo generado.
- Si no hay catalogo automatico:
  - agregar 1 bullet/link bajo seccion "Herramientas/Apps".

#### 4.2 docs/*

Actualizar solo si existen:

- `docs/SYSTEMS_CATALOG.md` → entrada nueva
- `docs/USER_MANUAL.md` → como usar (modo, copiar, nota file://)
- `docs/RECRUITER.md` → valor para reclutadores (3 bullets)
- `docs/FILES_REFERENCE.md` (si aplica) → estructura menciona app

#### 4.3 docs/wiki/*

Actualizar solo si existe `docs/wiki/`:

- `docs/wiki/Home.md` → referencia de la app + version/nota
- `docs/wiki/Catalogo-de-Sistemas.md` → entrada
- `docs/wiki/Manual-de-Usuario.md` → guia breve
- `docs/wiki/_Sidebar.md` → link a la pagina si corresponde

> Regla: docs/ y docs/wiki deben contar "lo mismo", con distinta profundidad.

### Paso 5 — Chequeos

Ejecutar en orden:

1) `make hub-list`
2) `make catalog`
3) `make validate`
4) `make test`

Si falla algo:

- corregir con cambios minimos
- documentar en el commit/PR que se corrigio

### Paso 6 — Evidencia y cierre

Entregar:

- lista de archivos modificados
- diff (o resumen) de:
  - `index.php` (tarjeta)
  - README + docs + wiki
- outputs de `make validate/test`
- confirmacion manual:
  - dashboard muestra tarjeta
  - click abre `apps/<APP_NAME>/`
  - si `file://` bloquea fetch → recomendar servidor local

---

## Plantillas

Usar archivos en `templates/` para consistencia.
