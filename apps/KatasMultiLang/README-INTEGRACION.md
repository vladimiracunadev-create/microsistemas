# Integracion en tu repo `microsistemas`

## 1) Copiar carpeta

Copia esta carpeta completa a:

- `microsistemas/apps/KatasMultiLang/`

## 2) (Opcional) Agregar tarjeta en `index.php`

Busca el grid de tarjetas y agrega algo como:

```html
<div class="card">
  <div>
    <span class="badge js">HTML + JS</span>
    <h2>Katas MultiLang</h2>
    <p>Comparador visual de soluciones por caso en multiples lenguajes y frameworks. Boton copiar + filtros.</p>
  </div>
  <a href="apps/KatasMultiLang/" class="btn">Abrir Herramienta</a>
</div>
```

## 3) (Opcional) Catalogo

- Agrega una linea en `docs/SYSTEMS_CATALOG.md` o en el README principal apuntando a `apps/KatasMultiLang/`.

## 4) GitHub Pages / fetch()

Si abres por `file://` y el navegador bloquea `fetch()`, sirve el repo con un server:

- `python -m http.server 8080`
- abrir `http://localhost:8080/apps/KatasMultiLang/`
