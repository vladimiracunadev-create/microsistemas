# Guía de Contribución (CONTRIBUTING)

¡Gracias por querer mejorar **Microsistemas Suite**! Para mantener la calidad de un paquete profesional, seguimos estos estándares.

## 📋 Proceso de Pull Request

1. **Fork** el repositorio y crea una rama para tu cambio (ej: `feature/nueva-app` o `fix/error-db`).
2. Implementa tus cambios siguiendo los **Estándares de Código**.
3. Asegúrate de que el sistema pase los chequeos de Docker (o usa `make up` para probar localmente).
4. Documenta cualquier cambio en la interfaz o configuración en el `README.md` del módulo.
5. Abre un Pull Request describiendo claramente el propósito del cambio.

## 🏷️ Etiquetas (Labels)

Usamos etiquetas para organizar el trabajo. Si eres nuevo, busca estas:

- `good first issue`: Ideal para empezar.
- `help wanted`: Necesitamos apoyo extra aquí.
- `bug`: Errores confirmados que necesitan solución.
- `docs`: Mejoras en la documentación.

## 🛡️ Configuración de Seguridad y Revisión

Para garantizar la estabilidad del proyecto, la rama `main` tiene las siguientes protecciones:

- **PR Obligatorio**: No se permiten commits directos a `main`.
- **Revisión**: Cada cambio requiere al menos una aprobación de un mantenedor.
- **Checks de CI**: Los tests automatizados deben pasar antes de fusionar.

---

## 🛠️ Estándares de Código

Para asegurar que el proyecto se mantenga profesional y legible:

### PHP (PSR-12)

- Usa **Namespaces** (`Microsistemas\Core\..`) si añades lógica al core.
- Declara tipos en las funciones siempre que sea posible.
- Evita el uso de `include` manual; utiliza el **Autoloader** de Composer.

### JavaScript (ES6+)

- Usa `const` y `let` en lugar de `var`.
- Prefiere Funciones de Flecha (`=>`) para callbacks.
- Comenta la lógica compleja de manipulación del DOM.

### CSS

- Utiliza **Variables CSS** definidas en `index.php` para mantener la consistencia visual.
- Nomenclatura BEM o clases semánticas descriptivas.

---

## 🏗️ Cómo añadir un Nuevo Microsistema

Usa el **Skill de Integración** incluido en el repo:

```bash
cat skills/integrar-microsistema/skill.md
```

El skill cubre 6 pasos: Preflight → Carpeta → Dashboard → Docs → Chequeos → Evidencia.
Incluye plantillas en `skills/integrar-microsistema/templates/` y un `referencia.txt` con inputs de ejemplo.

> Antes de hacer push, ejecuta `make lint-md` para validar Markdown localmente.

---

## 💬 Estilo de Mensajes Git

Seguimos la convención de **Conventional Commits**:

- `feat:` Una nueva característica para el usuario.
- `fix:` Corrección de un error.
- `docs:` Cambios solo en la documentación.
- `style:` Cambios que no afectan el significado del código (espacios, formato).
- `refactor:` Cambio de código que no corrige un error ni añade funcionalidad.
- `chore:` Tareas de mantenimiento (actualizar dependencias, configurar CI).

---

## ⚖️ Código de Conducta

Sé amable, profesional y constructivo. Estamos aquí para aprender y construir mejores herramientas juntos.
