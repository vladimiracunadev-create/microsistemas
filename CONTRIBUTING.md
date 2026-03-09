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

### Interacción con Automatizaciones y Bots (Dependabot)

- Para mantener la salud del código, este repositorio recibe auditorías semanales de **Dependabot** para `Composer`, `Docker` y `GitHub Actions`.
- Los **Mantenedores** deben revisar los Pull Requests (PRs) autogenerados por el bot.
- **Regla Estricta:** Nunca hacer "Merge" de un PR del bot si los Status Checks de CI/CD (linting, build, trivy) no están en **verde**. El bot se encarga de crear el PR y el Humano aprueba sólo cuando la auditoría automática valida que el sistema no colapsará.

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

Este repositorio incluye un **Skill de Integración** que automatiza y estandariza el proceso completo. Es el camino recomendado para cualquier colaborador.

**Usar el playbook:**

```bash
cat skills/integrar-microsistema/skill.md
```

El skill cubre 6 pasos con reglas claras y plantillas listas:

1. **Preflight** — verificar estructura del repo.
2. **Carpeta** — crear `apps/<NombreApp>/` con `app.manifest.yml` (usa `skills/integrar-microsistema/templates/app.manifest.yml.tpl`).
3. **Dashboard** — insertar tarjeta en `index.php` (usa `templates/dashboard-card.html.tpl`).
4. **Docs** — actualizar README, `docs/*` y `docs/wiki/*` según existan.
5. **Chequeos** — `make hub-list`, `make catalog`, `make validate`, `make test`.
6. **Evidencia** — reportar archivos modificados y outputs de los checks.

> Antes de hacer push, corre `make lint-md` para evitar errores de Markdown en CI.

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
