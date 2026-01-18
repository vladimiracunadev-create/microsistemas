# Roadmap (ROADMAP)

Este repositorio agrupa microsistemas orientados a productividad, soporte técnico y modernización progresiva.  
El objetivo es mantener herramientas pequeñas, autocontenidas y útiles en escenarios reales.

## Estado Actual
✅ **Fase de Modularización Completada**: Se ha migrado de una estructura plana a una modular (`apps/`).
✅ **Transformación en Paquete Profesional**: Integración de **Composer**, Autoloading (PSR-4) y gestión de dependencias.
✅ **Infraestructura**: Soporte Docker y variables de entorno completado.

---

## 0.x (Estabilización y coherencia)
- [x] Estructura homogénea por microsistema (carpetas `apps/`).
- [x] `index.php` launcher para abrir los 7 microsistemas desde un menú unificado.
- [ ] Estilos consistentes (tipografía, botones, layout simple) dentro de cada app.
- [ ] Mejorar mensajes de error/validación en herramientas sensibles.
- [ ] Revisión de seguridad básica (whitelists y bloqueos de rutas).

## 1.x (Portafolio sólido / “usable en serio”)
- [ ] Documentación por microsistema (README.md individual en cada carpeta).
- [ ] Capturas o gifs cortos por herramienta.
- [ ] Configuración segura en microsistemas con BD/logs (modo lectura por defecto).
- [ ] Export/Import de presets cuando aplique (ej: YAML Studio).

## 2.x (Integración y automatización)
- [x] Empaquetado para ejecución alternativa (Docker).
- [ ] Presets compartidos entre microsistemas (ej: plantillas, snippets).
- [ ] Validaciones avanzadas (lint/format en JS donde aplique).
- [ ] Modo “demo” sin riesgos (datos de ejemplo, sandbox).

## 3.x (Producto/laboratorio ampliado)
- [ ] Catálogo de herramientas con buscador global.
- [ ] “Modo aprendizaje” por niveles (básico → avanzado) en Git Trainer.
- [ ] Telemetría opcional local (sin datos personales).
