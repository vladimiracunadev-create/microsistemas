# Cómo usarlo como herramienta de aprendizaje (método guiado)

1) Aplica un preset y calcula. Anota RPS_cap, usuarios concurrentes y bottleneck.
2) Cambia **solo 1 selector** (ej. Redis ON) y recalcula.
3) Repite con CDN/TLS/runtime/web-server.
4) Simula crecimiento: sube cores_app y cores_db.
5) Conclusión:
- Si DB limita: caché, índices, pool, réplicas.
- Si CPU limita: profiling, optimización, más instancias.
- Si red limita: compresión, CDN, payload menor.


## Descripciones por filtro (UI)
En la interfaz, cada selector muestra una **descripción debajo** indicando su uso y objetivo. Estas descripciones vienen de `app/data/baselines.json` (campo `desc`). Puedes editarlas para adaptar el simulador a tu contexto.
