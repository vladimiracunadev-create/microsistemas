# Python Eval 3000 — Micro-App

## Descripción
Microsistema estático de evaluación y estudio para Python y Data Science basado en un banco local de 3000 preguntas en JSON.

## Qué resuelve
- Lanza una pregunta al azar con **4 alternativas**.
- Al responder, indica la **correcta** y deja pasar a la siguiente.
- Incluye **modo explorador** para revisar preguntas, respuestas y bloques de código.
- Funciona con **HTML + CSS + JavaScript + JSON**, sin framework ni backend adicional.

## Estructura
- `index.html`: interfaz principal.
- `python-eval.css`: estilos del microsistema.
- `python-eval-app.js`: lógica de evaluación, filtros y explorador.
- `data/questions.quiz.json`: banco de preguntas y alternativas.
- `app.manifest.yml`: manifest alineado con otras apps de Microsistemas.
- `health/` y `ready/`: endpoints simples de diagnóstico.

## Requisitos
Esta herramienta usa `fetch()` para cargar JSON local.
**Debe abrirse desde un servidor web** (`http://`), no con `file://`.

## Integración limpia con Microsistemas
1. Copia la carpeta `apps/PythonEval3000/` dentro del repositorio.
2. Agrega una tarjeta al dashboard raíz (`index.php`) usando el snippet incluido en `../../snippets/dashboard-card-python-eval-3000.html`.
3. Opcional: ajusta descripciones o badges según tu taxonomía de capas.

## Detalles técnicos
- Tecnología: JavaScript ES6, CSS moderno, JSON local.
- Estado: liviano, estático, sin dependencias de build.
- Persistencia: `localStorage` para métricas simples de uso.

## Diagnóstico
- `/health/`: liveness simple.
- `/ready/`: readiness simple.

## Nota
El contenido del cuestionario proviene de un banco previo. Este microsistema se enfoca en la experiencia de evaluación y estudio; si más adelante depuras preguntas concretas, solo necesitas reemplazar el JSON.
