# Roadmap (ROADMAP)

Este repositorio agrupa microsistemas orientados a productividad, soporte técnico y modernización progresiva.  
El objetivo es mantener herramientas pequeñas, autocontenidas y útiles en escenarios reales.

## Enfoque general
- Seguridad por defecto
- UX clara (no dejar dudas)
- Documentación breve pero completa
- Evolución incremental

---

## 0.x (Estabilización y coherencia)
- [ ] Estructura homogénea por microsistema (carpetas + README propio).
- [ ] `index.html` launcher para abrir los 7 microsistemas desde un menú.
- [ ] Estilos consistentes (tipografía, botones, layout simple).
- [ ] Mejorar mensajes de error/validación en herramientas sensibles.
- [ ] Revisión de seguridad básica (whitelists y bloqueos de rutas).

## 1.x (Portafolio sólido / “usable en serio”)
- [ ] Documentación por microsistema (objetivo, uso, ejemplos, limitaciones).
- [ ] Capturas o gifs cortos por herramienta (carpeta `/docs/img`).
- [ ] Configuración segura en microsistemas con BD/logs (modo lectura por defecto).
- [ ] Export/Import de presets cuando aplique (ej: YAML Studio).
- [ ] Versionado semántico + Releases (v1.0.0, v1.1.0…).

## 2.x (Integración y automatización)
- [ ] Presets compartidos entre microsistemas (ej: plantillas, snippets).
- [ ] Validaciones avanzadas (lint/format en JS donde aplique).
- [ ] Modo “demo” sin riesgos (datos de ejemplo, sandbox).
- [ ] Opcional: empaquetado para ejecución alternativa (Docker) **sin reemplazar** XAMPP.

## 3.x (Producto/laboratorio ampliado)
- [ ] Catálogo de herramientas con buscador global.
- [ ] “Modo aprendizaje” por niveles (básico → avanzado) en Git Trainer.
- [ ] Telemetría opcional local (sin datos personales) para entender uso.
- [ ] Documentación tipo guía (tutoriales cortos orientados a problemas reales).
