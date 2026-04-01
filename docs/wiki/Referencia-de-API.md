# Referencia de la API Core (API.md)

Este documento detalla los metodos y clases disponibles en el paquete `Microsistemas\Core` para desarrolladores que deseen extender la suite.

---

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

## =� Como Extender la API

Si deseas anadir una nueva utilidad global (ej: un sistema de manejo de archivos), sigue estos pasos:

1. Crea la clase en `src/Utils/MiClase.php`.
2. Asigna el namespace `Microsistemas\Utils`.
3. Invocala en cualquier modulo mediante:

   ```php
   use Microsistemas\Utils\MiClase;
   $util = new MiClase();
   ```
