# Guia de Contribucion (CONTRIBUTING)

Gracias por querer mejorar **Microsistemas Suite**! Para mantener la calidad de un paquete profesional, seguimos estos estandares.

## 📋 Proceso de Pull Request

1. **Fork** el repositorio y crea una rama para tu cambio (ej: `feature/nueva-app` o `fix/error-db`).
2. Implementa tus cambios siguiendo los **Estandares de Codigo**.
3. Asegurate de que el sistema pase los chequeos de Docker (o usa `make up` para probar localmente).
4. Documenta cualquier cambio en la interfaz o configuracion en el `README.md` del modulo.
5. Abre un Pull Request describiendo claramente el proposito del cambio.

## 🏷️ Etiquetas (Labels)

Usamos etiquetas para organizar el trabajo. Si eres nuevo, busca estas:

- `good first issue`: Ideal para empezar.
- `help wanted`: Necesitamos apoyo extra aqui.
- `bug`: Errores confirmados que necesitan solucion.
- `docs`: Mejoras en la documentacion.

## 🛡️ Configuracion de Seguridad y Revision

Para garantizar la estabilidad del proyecto, la rama `main` tiene las siguientes protecciones:

- **PR Obligatorio**: No se permiten commits directos a `main`.
- **Revision**: Cada cambio requiere al menos una aprobacion de un mantenedor.
- **Checks de CI**: Los tests automatizados deben pasar antes de fusionar.

### Interaccion con Automatizaciones y Bots (Dependabot)

- Para mantener la salud del codigo, este repositorio recibe auditorias semanales de **Dependabot** para `Composer`, `Docker` y `GitHub Actions`.
- Los **Mantenedores** deben revisar los Pull Requests (PRs) autogenerados por el bot.
- **Regla Estricta:** Nunca hacer "Merge" de un PR del bot si los Status Checks de CI/CD (linting, build, trivy) no estan en **verde**. El bot se encarga de crear el PR y el Humano aprueba solo cuando la auditoria automatica valida que el sistema no colapsara.

---

## 🛠️ Estandares de Codigo

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

## 🏗️ Como anadir un Nuevo Microsistema

Este repositorio incluye un **Skill de Integracion** que automatiza y estandariza el proceso completo. Es el camino recomendado para cualquier colaborador.

**Usar el playbook:**

```bash
cat skills/integrar-microsistema/skill.md
```

El skill cubre 6 pasos con reglas claras y plantillas listas:

1. **Preflight** — verificar estructura del repo.
2. **Carpeta** — crear `apps/<NombreApp>/` con `app.manifest.yml` (usa `skills/integrar-microsistema/templates/app.manifest.yml.tpl`).
3. **Dashboard** — insertar tarjeta en `index.php` (usa `templates/dashboard-card.html.tpl`).
4. **Docs** — actualizar README, `docs/*` y `docs/wiki/*` segun existan.
5. **Chequeos** — `make hub-list`, `make catalog`, `make validate`, `make test`.
6. **Evidencia** — reportar archivos modificados y outputs de los checks.

> Antes de hacer push, corre `make lint-md` para evitar errores de Markdown en CI.

---

## 💬 Estilo de Mensajes Git

Seguimos la convencion de **Conventional Commits**:

- `feat:` Una nueva caracteristica para el usuario.
- `fix:` Correccion de un error.
- `docs:` Cambios solo en la documentacion.
- `style:` Cambios que no afectan el significado del codigo (espacios, formato).
- `refactor:` Cambio de codigo que no corrige un error ni anade funcionalidad.
- `chore:` Tareas de mantenimiento (actualizar dependencias, configurar CI).

---

## ⚖️ Codigo de Conducta

Se amable, profesional y constructivo. Estamos aqui para aprender y construir mejores herramientas juntos.
