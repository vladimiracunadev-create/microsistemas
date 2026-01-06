# Contribuciones (CONTRIBUTING)

Gracias por tu interés en contribuir. Este repositorio es una colección de microsistemas autocontenidos, orientados a productividad, soporte y modernización.

## Filosofía del proyecto
- Microsistemas simples, claros y reutilizables.
- Preferencia por dependencias mínimas.
- Seguridad por defecto (especialmente en herramientas de BD y archivos).
- Compatibilidad con entornos antiguos y modernos (PHP 5.4 → 8.x según microsistema).

## Cómo proponer cambios
1) Haz un fork del repositorio.
2) Crea una rama:
   - `feat/<nombre>` para mejoras
   - `fix/<nombre>` para correcciones
   - `docs/<nombre>` para documentación
3) Mantén los cambios acotados (un objetivo por PR).
4) Abre un Pull Request explicando:
   - Qué problema resuelve
   - Cómo se prueba
   - Si afecta seguridad o compatibilidad

## Estándares mínimos
- No introducir credenciales o datos sensibles en commits.
- Documentar nuevos parámetros/archivos en el README del microsistema afectado.
- Mantener el microsistema autocontenido (sin romper su ejecución local).
- Evitar romper compatibilidad en PHP cuando el microsistema declara soporte legacy.

## Estilo de commits (sugerido)
- `feat: ...`
- `fix: ...`
- `docs: ...`
- `refactor: ...`
- `chore: ...`

## Pruebas manuales (mínimas)
Antes de PR:
- Abrir el microsistema en entorno local (XAMPP/Apache).
- Verificar que no haya errores en consola (para HTML/JS).
- Verificar que las rutas a recursos (`.css`, `.js`, `.json`) funcionen por `http://localhost/...` (no `file://`).

## Seguridad
Si un cambio afecta:
- lectura de archivos
- ejecución de SQL
- configuración sensible

Debe incluir:
- validaciones/whitelists
- modo seguro por defecto
- nota en `SECURITY.md` o README del microsistema

## Licencia
Al contribuir, aceptas que tu contribución se distribuya bajo los términos descritos en `LICENSE` y `NOTICE`.
