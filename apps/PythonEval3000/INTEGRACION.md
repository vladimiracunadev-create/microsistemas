# Integración sugerida en Microsistemas

## Carpeta objetivo
Copia esta carpeta completa dentro de:

`apps/PythonEval3000/`

## Tarjeta sugerida para el dashboard
Usa el archivo ubicado en la raiz del repositorio:

`snippets/dashboard-card-python-eval-3000.html`

> **Nota**: El snippet fue movido de `apps/PythonEval3000/snippets/` a la carpeta `snippets/` raiz del repo para alinearse con el estandar del proyecto.

o copia este bloque dentro del dashboard principal:

```html
<div class="card">
  <div>
    <span class="badge js">HTML + JS</span>
    <h2>Python Eval 3000</h2>
    <p>Evaluador y explorador de 3000 preguntas de Python y Data Science con 4 alternativas, código y respuestas.</p>
  </div>
  <a href="apps/PythonEval3000/" class="btn">Abrir Herramienta</a>
</div>
```

## Razón de esta integración
- Mantiene el patrón actual de microsistemas con carpeta autocontenida.
- No rompe apps existentes.
- Permite reemplazar el JSON sin tocar la UI.
- Sigue un enfoque `static app` similar a GitTrainer y KatasMultiLang.

## Qué puedes cambiar después
- nombre visible,
- badge de la tarjeta,
- cantidad de preguntas por página,
- colores,
- dataset JSON.
