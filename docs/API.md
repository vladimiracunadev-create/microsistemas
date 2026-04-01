# Referencia de la API Core (API.md)

Este documento detalla los métodos y clases disponibles en el paquete `Microsistemas\Core` para desarrolladores que deseen extender la suite.

## `Microsistemas\Core\Config`

La clase de configuración utiliza el patrón **Singleton** para asegurar una única instancia durante la ejecución.

### Métodos

#### `getInstance(): self`

Obtiene la instancia única de la clase.

#### `get(string $key, mixed $default = null): mixed`

Recupera un valor de configuración de las variables de entorno o del archivo `.env`.

- **$key**: Nombre de la variable (ej: `DB_HOST`).
- **$default**: Valor a retornar si la variable no existe.

---

## `Microsistemas\Core\Database`

Gestiona la conexión centralizada a la base de datos MySQL.

### Métodos

#### `getConnection(): mysqli`

Retorna una instancia activa de `mysqli`.

- **Lanza**: `\Exception` si la conexión falla.
- **Nota**: Las credenciales se inyectan automáticamente desde `Config`.

#### `close(): void`

Cierra la conexión activa si existe.

---

## 🤖 API de Asistencia IA (Servidor MCP Local)

Además de la API Core en PHP, Microsistemas incluye un Servidor Model Context Protocol (MCP) en Python (`/mcp`) que actúa como API de Solo Lectura para agentes de IA (ej: Claude Desktop, Cursor).

Esta capa estandariza el acceso al "conocimiento tribal" del repositorio (arquitectura documental, manifiestos del Hub, recetas constructivas) sin exponer variables de entorno reales, endpoints sensibles ni ejecución de comandos mutables.

### Resources Expuestos (Pre-cargados)

- `repo://architecture`: Detalle arquitectónico.
- `repo://apps/manifests`: Colección de manifiestos unificados.
- `repo://hub`, `repo://readme`, `repo://maintainers`, `repo://security`.
- `repo://skills/integrar-microsistema`: Directivas completas para el onboarding de código nuevo.

### Tools Expuestos (Diagnóstico Seguro)

- `run_hub_list()`, `run_hub_doctor()`, `run_smoke()`: Wrapper seguro sobre el `Makefile` canónico.
- `read_manifest(app_name)`: Interfaz curada para consumir el `app.manifest.yml`.
- `read_skill(skill_name)`: Lector de playbooks.
- `find_ports()`: RegEx seguro sobre el `docker-compose.yml`.

### Prompts de Sistema

- `integrar-microapp`: Agente experto en el onboarding de una nueva app basado en nuestras _Skills_.
- `auditar-manifest`: Auditor automático del contrato visual.
- `diagnosticar-entorno`: Rol de SRE utilizando _hub doctor / smoke_.
- `preparar-release-docs`: Asistente enfocado en Release Notes y validación documental previa a lanzamientos.

_El Servidor MCP V1 está estrictamente limitado por diseño para prevenir mutaciones indeseadas inducidas por IA en el código base. Ninguna tool otorga acceso a re-escritura ni terminal expuesta._

---

## 🛠️ Cómo Extender la API Core

Si deseas añadir una nueva utilidad global (ej: un sistema de manejo de archivos), sigue estos pasos:

1. Crea la clase en `src/Utils/MiClase.php`.
2. Asigna el namespace `Microsistemas\Utils`.
3. Invócala en cualquier módulo mediante:

```php
   use Microsistemas\Utils\MiClase;
   $util = new MiClase();
   ```
