# Referencia de la API Core (API.md)

Este documento detalla los metodos y clases disponibles en el paquete `Microsistemas\Core` para desarrolladores que deseen extender la suite.

## `Microsistemas\Core\Config`

La clase de configuracion utiliza el patron **Singleton** para asegurar una unica instancia durante la ejecucion.

### Metodos

#### `getInstance(): self`

Obtiene la instancia unica de la clase.

#### `get(string $key, mixed $default = null): mixed`

Recupera un valor de configuracion de las variables de entorno o del archivo `.env`.

- **$key**: Nombre de la variable (ej: `DB_HOST`).
- **$default**: Valor a retornar si la variable no existe.

---

## `Microsistemas\Core\Database`

Gestiona la conexion centralizada a la base de datos MySQL.

### Metodos

#### `getConnection(): mysqli`

Retorna una instancia activa de `mysqli`.

- **Lanza**: `\Exception` si la conexion falla.
- **Nota**: Las credenciales se inyectan automaticamente desde `Config`.

#### `close(): void`

Cierra la conexion activa si existe.

---

## 🤖 API de Asistencia IA (Servidor MCP Local)

Ademas de la API Core en PHP, Microsistemas incluye un Servidor Model Context Protocol (MCP) en Python (`/mcp`) que actua como API de Solo Lectura para agentes de IA (ej: Claude Desktop, Cursor).

Esta capa estandariza el acceso al "conocimiento tribal" del repositorio (arquitectura documental, manifiestos del Hub, recetas constructivas) sin exponer variables de entorno reales, endpoints sensibles ni ejecucion de comandos mutables.

### Resources Expuestos (Pre-cargados)

- `repo://architecture`: Detalle arquitectonico.
- `repo://apps/manifests`: Coleccion de manifiestos unificados.
- `repo://hub`, `repo://readme`, `repo://maintainers`, `repo://security`.
- `repo://skills/integrar-microsistema`: Directivas completas para el onboarding de codigo nuevo.

### Tools Expuestos (Diagnostico Seguro)

- `run_hub_list()`, `run_hub_doctor()`, `run_smoke()`: Wrapper seguro sobre el `Makefile` canonico.
- `read_manifest(app_name)`: Interfaz curada para consumir el `app.manifest.yml`.
- `read_skill(skill_name)`: Lector de playbooks.
- `find_ports()`: RegEx seguro sobre el `docker-compose.yml`.

### Prompts de Sistema

- `integrar-microapp`: Agente experto en el onboarding de una nueva app basado en nuestras _Skills_.
- `auditar-manifest`: Auditor automatico del contrato visual.
- `diagnosticar-entorno`: Rol de SRE utilizando _hub doctor / smoke_.
- `preparar-release-docs`: Asistente enfocado en Release Notes y validacion documental previa a lanzamientos.

_El Servidor MCP V1 esta estrictamente limitado por diseno para prevenir mutaciones indeseadas inducidas por IA en el codigo base. Ninguna tool otorga acceso a re-escritura ni terminal expuesta._

---

## 🛠️ Como Extender la API Core

Si deseas anadir una nueva utilidad global (ej: un sistema de manejo de archivos), sigue estos pasos:

1. Crea la clase en `src/Utils/MiClase.php`.
2. Asigna el namespace `Microsistemas\Utils`.
3. Invocala en cualquier modulo mediante:

```php
   use Microsistemas\Utils\MiClase;
   $util = new MiClase();
   ```
