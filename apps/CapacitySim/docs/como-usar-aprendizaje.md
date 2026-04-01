# Como usarlo como herramienta de aprendizaje (metodo guiado)

1. Aplica un preset y calcula. Anota RPS_cap, usuarios concurrentes y bottleneck.

2. Cambia **solo 1 selector** (ej. Redis ON) y recalcula.

3. Repite con CDN/TLS/runtime/web-server.

4. Simula crecimiento: sube cores_app y cores_db.

5. Conclusion:

- Si DB limita: cache, indices, pool, replicas.
- Si CPU limita: profiling, optimizacion, mas instancias.
- Si red limita: compresion, CDN, payload menor.

---

## Descripciones por filtro (UI)

En la interfaz cada selector muestra una **descripcion debajo** indicando su uso y objetivo. Estas descripciones vienen de `app/data/baselines.json` (campo `desc`). Puedes editarlas para adaptar el simulador a tu contexto.
