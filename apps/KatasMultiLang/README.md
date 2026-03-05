# Katas MultiLang (Microsistema)

Microsistema para **estudiar y comparar** cómo se resuelven problemas (“katas/casos”) en **muchos lenguajes y frameworks**, desde una sola interfaz `index.html`.

- **714 casos** (incluye pack de frameworks web **C0683–C0702**)
- **67 lenguajes/frameworks**
- **Datos en JSON por lenguaje**, cargados **bajo demanda** (no revienta el navegador)
- Cada bloque tiene botón **Copiar** y resaltado de sintaxis (Prism)

## Nombre sugerido para tu repo “microsistemas”
- **Nombre del microsistema:** `katas-multilang`
- **Carpeta simple (dentro de microsistemas):** `katas-multilang/`

## Qué hace
1. Mantiene un catálogo de casos en `data/meta.json` (id, nombre, nivel, categoría, descripción).
2. Mantiene un JSON por lenguaje en `data/lang/<lenguaje>.json` con:
   - metadata del lenguaje (versión, url oficial, keywords, operadores, etc.)
   - snippets por caso (o **herencia** + overrides para no inflar tamaños)
3. `index.html` + `assets/app.js` renderizan dos modos:
   - **Comparar por caso:** eliges un caso y se muestran soluciones en múltiples lenguajes.
   - **Explorar por lenguaje:** eliges un lenguaje y navegas casos de *simple → complejo*.
4. La UI guarda el estado en la URL (para compartir): `?mode=...&case=...&langs=...&cat=...&lvl=...`

## Cómo usar (local)
- Abrir `index.html` en el navegador.

> Nota: algunos navegadores bloquean `fetch()` desde `file://`. Si pasa:
- Usa un servidor estático local (recomendado):
  - Python: `python -m http.server 8080`
  - Node: `npx serve .`
  - Luego abre: `http://localhost:8080`

## Cómo publicar en GitHub Pages
1. Sube esta carpeta a tu repositorio.
2. En GitHub: **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: `main` y folder `/ (root)` o el folder donde esté el microsistema.
5. Abre la URL que te entrega Pages.

## Estructura
- `index.html` – UI
- `assets/` – JS y CSS
  - `assets/app.js` – lógica (carga JSON por lenguaje, filtros, copia, URL state)
  - `assets/styles.css` – estilos
- `data/meta.json` – catálogo de casos + lista de lenguajes
- `data/languages.json` – índice de lenguajes (para poblar selects)
- `data/lang/*.json` – 1 archivo por lenguaje/framework
  - Formato soportado:
    - **Completo:** `{ language: {...}, snippets: { C0001: "...", ... } }`
    - **Herencia:** `{ language: {...}, extends: "javascript", overrides: { C0683: "...", ... } }`
- `scripts/validate_repo.py` – validador de integridad

## Agregar un caso nuevo
1. Añade el caso en `data/meta.json` (en `casos[]`).
2. Añade el snippet del caso para cada lenguaje:
   - si el lenguaje tiene `snippets`, agrega `CXXXX` en su diccionario
   - si el lenguaje usa `extends`, agrega el snippet en `overrides` (solo si cambia respecto al base)
3. Ejecuta el validador:
   - `python scripts/validate_repo.py`

## Agregar un lenguaje/framework nuevo
1. Crea `data/lang/<key>.json`.
2. Incluye `language.key`, `language.name`, `official_url`, etc.
3. Agrega el lenguaje a `data/meta.json` en `meta.lenguajes[]`.
4. (Opcional) Si es un framework “parecido” a un base, usa `extends` + `overrides` para mantener el tamaño bajo control.
5. Ejecuta `python scripts/validate_repo.py`.

## Packs útiles incluidos
- **Pack Web Frameworks (C0683–C0702):**
  routing, CRUD, middleware, CORS, JWT/sesión, validación, errores, rate limit, uploads, static, SSR/templates, ORM+migraciones, websockets, jobs, health checks, tests, env config.

---

Licencia: puedes agregar la que uses en tu repositorio de microsistemas (MIT recomendado).
