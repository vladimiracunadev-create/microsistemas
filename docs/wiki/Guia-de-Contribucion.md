# Guia de Contribucion (CONTRIBUTING)

Gracias por querer mejorar **Microsistemas Suite**! Para mantener la calidad de un paquete profesional, seguimos estos estandares.

## =� Proceso de Pull Request

1. **Fork** el repositorio y crea una rama para tu cambio (ej: `feature/nueva-app` o `fix/error-db`).
2. Implementa tus cambios siguiendo los **Estandares de Codigo**.
3. Asegurate de que el sistema pase los chequeos de Docker (o usa `make up` para probar localmente).
4. Documenta cualquier cambio en la interfaz o configuracion en el `README.md` del modulo.
5. Abre un Pull Request describiendo claramente el proposito del cambio.

## <� Etiquetas (Labels)

Usamos etiquetas para organizar el trabajo. Si eres nuevo, busca estas:

- `good first issue`: Ideal para empezar.
- `help wanted`: Necesitamos apoyo extra aqui.
- `bug`: Errores confirmados que necesitan solucion.
- `docs`: Mejoras en la documentacion.

## =� Configuracion de Seguridad y Revision

Para garantizar la estabilidad del proyecto, la rama `main` tiene las siguientes protecciones:

- **PR Obligatorio**: No se permiten commits directos a `main`.
- **Revision**: Cada cambio requiere al menos una aprobacion de un mantenedor.
- **Checks de CI**: Los tests automatizados deben pasar antes de fusionar.

---

## =� Estandares de Codigo

Para asegurar que el proyecto se mantenga profesional y legible:

### PHP (PSR-12)

- Usa **Namespaces** (`Microsistemas\Core\..`) si anades logica al core.
- Declara tipos en las funciones siempre que sea posible.
- Evita el uso de `include` manual; utiliza el **Autoloader** de Composer.

### JavaScript (ES6+)

- Usa `const` y `let` en lugar de `var`.
- Prefiere Funciones de Flecha (`=>`) para callbacks.
- Comenta la logica compleja de manipulacion del DOM.

### CSS

- Utiliza **Variables CSS** definidas en `index.php` para mantener la consistencia visual.
- Nomenclatura BEM o clases semanticas descriptivas.

---

## <� Como anadir un Nuevo Microsistema

Usa el **Skill de Integracion** incluido en el repo:

```bash
cat skills/integrar-microsistema/skill.md
```

El skill cubre 6 pasos: Preflight � Carpeta � Dashboard � Docs � Chequeos � Evidencia.
Incluye plantillas en `skills/integrar-microsistema/templates/` y un `referencia.txt` con inputs de ejemplo.

> Antes de hacer push, ejecuta `make lint-md` para validar Markdown localmente.

---

## =� Estilo de Mensajes Git

Seguimos la convencion de **Conventional Commits**:

- `feat:` Una nueva caracteristica para el usuario.
- `fix:` Correccion de un error.
- `docs:` Cambios solo en la documentacion.
- `style:` Cambios que no afectan el significado del codigo (espacios, formato).
- `refactor:` Cambio de codigo que no corrige un error ni anade funcionalidad.
- `chore:` Tareas de mantenimiento (actualizar dependencias, configurar CI).

---

## � Codigo de Conducta

Se amable, profesional y constructivo. Estamos aqui para aprender y construir mejores herramientas juntos.
