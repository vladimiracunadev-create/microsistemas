# Referencia de la API Core

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

## 🛠️ Cómo Extender la API

Si deseas añadir una nueva utilidad global (ej: un sistema de manejo de archivos), sigue estos pasos:

1. Crea la clase en `src/Utils/MiClase.php`.
2. Asigna el namespace `Microsistemas\Utils`.
3. Invócala en cualquier módulo mediante:
   ```php
   use Microsistemas\Utils\MiClase;
   $util = new MiClase();
   ```
