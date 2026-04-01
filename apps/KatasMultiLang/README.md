# Katas MultiLang (Microsistema)

Microsistema para **estudiar y comparar** como se resuelven problemas ("katas/casos") en **muchos lenguajes y frameworks**, desde una sola interfaz `index.html`.

- **195 casos unicos** (catalogo curado y deduplicado, incluyendo pack web **C0683-C0702**)
- **67 lenguajes/frameworks** con carga dinamica.
- **UI Premium (Glassmorphism):** Diseno inmersivo estilo "Slate Dark" con efectos de transparencia y desenfoque.
- **Layout Side-by-Side:** Comparacion vertical limpia (Flex column) que evita el desorden visual.
- **Sidebar de Navegacion:** Acceso rapido a categorias y filtrado avanzado de tecnologias.
- Cada bloque tiene boton **Copiar** y resaltado de sintaxis (Prism).

## Nombre sugerido para tu repo "microsistemas"

- **Nombre del microsistema:** `katas-multilang`
- **Carpeta simple (dentro de microsistemas):** `katas-multilang/`

## Que hace

1. Mantiene un catalogo de casos en `data/meta.json` (id, nombre, nivel, categoria, descripcion).
2. Mantiene un JSON por lenguaje en `data/lang/<lenguaje>.json` con:
   - metadata del lenguaje (version, url oficial, keywords, operadores, etc.)
   - snippets por caso (o **herencia** + overrides para no inflar tamanos)
3. `index.html` + `assets/app.js` renderizan dos modos:
   - **Comparar por caso:** eliges un caso y se muestran soluciones en multiples lenguajes.
   - **Explorar por lenguaje:** eliges un lenguaje y navegas casos de *simple → complejo*.
4. La UI guarda el estado en la URL (para compartir): `?mode=...&case=...&langs=...&cat=...&lvl=...`

## Como usar (local)

- Abrir `index.html` en el navegador.

> Nota: algunos navegadores bloquean `fetch()` desde `file://`. Si pasa:

- Usa un servidor estatico local (recomendado):

  - Python: `python -m http.server 8080`
  - Node: `npx serve .`
  - Luego abre: `http://localhost:8080`

## Como publicar en GitHub Pages

1. Sube esta carpeta a tu repositorio.
2. En GitHub: **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: `main` y folder `/ (root)` o el folder donde este el microsistema.
5. Abre la URL que te entrega Pages.

## Estructura

- `index.html` - UI
- `assets/` - JS y CSS
  - `assets/app.js` - logica (carga JSON por lenguaje, filtros, copia, URL state)
  - `assets/styles.css` - estilos
- `data/meta.json` - catalogo de casos + lista de lenguajes
- `data/languages.json` - indice de lenguajes (para poblar selects)
- `data/lang/*.json` - 1 archivo por lenguaje/framework
  - Formato soportado:
    - **Completo:** `{ language: {...}, snippets: { C0001: "...", ... } }`
    - **Herencia:** `{ language: {...}, extends: "javascript", overrides: { C0683: "...", ... } }`
- `scripts/validate_repo.py` - validador de integridad

## Agregar un caso nuevo

1. Anade el caso en `data/meta.json` (en `casos[]`).
2. Anade el snippet del caso para cada lenguaje:
   - si el lenguaje tiene `snippets`, agrega `CXXXX` en su diccionario
   - si el lenguaje usa `extends`, agrega el snippet en `overrides` (solo si cambia respecto al base)
3. Ejecuta el validador:
   - `python scripts/validate_repo.py`

## Agregar un lenguaje/framework nuevo

1. Crea `data/lang/<key>.json`.
2. Incluye `language.key`, `language.name`, `official_url`, etc.
3. Agrega el lenguaje a `data/meta.json` en `meta.lenguajes[]`.
4. (Opcional) Si es un framework "parecido" a un base, usa `extends` + `overrides` para mantener el tamano bajo control.
5. Ejecuta `python scripts/validate_repo.py`.

## Packs utiles incluidos

- **Pack Web Frameworks (C0683-C0702):**
  routing, CRUD, middleware, CORS, JWT/sesion, validacion, errores, rate limit, uploads, static, SSR/templates, ORM+migraciones, websockets, jobs, health checks, tests, env config.

---

Licencia: puedes agregar la que uses en tu repositorio de microsistemas (MIT recomendado).
