# Manual de Usuario - Microsistemas

## Introducción
**Microsistemas** es una suite de utilidades diseñada para desarrolladores. Este manual explica cómo navegar por el Dashboard principal y acceder a cada herramienta.

## Dashboard Principal
Al acceder a la aplicación, verá el **Panel de Control**.
- **Tarjetas**: Cada herramienta está representada por una tarjeta.
- **Etiquetas**: Permiten identificar rápidamente la tecnología (PHP, JS, SQL).
- **Botón "Abrir"**: Lanza la herramienta en una nueva pestaña o en la misma ventana (según configuración).

## Herramientas Disponibles

### 1. Conversor de Texto
**Uso**: Limpiar y codificar textos para web.
- Pegue el texto con caracteres especiales (tildes, ñ) en el área de entrada.
- Haga clic en "Transformar".
- Copie el resultado en formato HTML (`&aacute;`) o Unicode (`\u00E1`) según necesite.

### 2. SQL Viewer
**Uso**: Consultas rápidas a base de datos.
- Seleccione la base de datos en el menú izquierdo.
- Haga clic en una tabla para ver un `SELECT * LIMIT 100` automático.
- Escriba consultas SQL personalizadas en el editor derecho.
- **Precaución**: Las consultas `DELETE` o `DROP` pedirán confirmación.

### 3. Git Trainer
**Uso**: Aprender comandos de Git.
- Use el buscador para encontrar una acción (ej: "borrar rama").
- Lea la explicación "¿Qué hace?" y "¿Cuándo usarlo?".
- Copie el comando generado y péguelo en su terminal.

### 4. JS Tools
**Uso**: Manipulación de código JavaScript.
- Minificar: Reduce el tamaño del archivo para producción.
- Beautify: Ordena código desordenado para hacerlo legible.
- Ofuscar: Protege el código haciéndolo ilegible.

### 5. Generador YAML
**Uso**: Crear configuraciones sin errores de sintaxis.
- Llene el formulario visual.
- Vea cómo se genera el YAML automáticamente a la derecha.
- Descargue el archivo `.yml` listo para usar.

### 6. Log Viewer
**Uso**: Auditoría de sistema.
- Permite leer archivos de log (`error.log`, `access.log`) sin necesidad de entrar por consola SSH.
- Solo lectura para evitar borrar evidencias accidentalmente.

### 7. PHP Migrator
**Uso**: Modernización de código.
- Pegue código antiguo (PHP 5.x).
- La herramienta resaltará funciones obsoletas (`mysql_query`, etc.) y sugerirá sus equivalentes modernos (`mysqli`, `PDO`).

---

## Preguntas Frecuentes

**¿Puedo usar esto en mi servidor de producción?**
Algunas herramientas como el **SQL Viewer** y **Log Viewer** son poderosas y sensibles. Se recomienda usarlas solo en entornos de desarrollo o proteger el acceso con contraseña (`.htaccess` o similar) si se despliegan en producción.

**¿Cómo actualizo las herramientas?**
Si usa Docker, simplemente haga `git pull` y luego `docker-compose restart`.
