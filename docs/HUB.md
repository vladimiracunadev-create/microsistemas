# Microsistemas Hub (HUB CLI)

El **Hub** es la capa de gestión centralizada de Microsistemas que permite interactuar con todas las micro-aplicaciones de forma unificada desde la línea de comandos.

## 🚀 Concepto

A diferencia del Dashboard web, el Hub está diseñado para automatización y gestión rápida de infraestructura. Cada aplicación en `apps/` se registra automáticamente si contiene un archivo `app.manifest.yml`.

## 🛠️ Comandos Principales

### 1. Listar Aplicaciones

Muestra un resumen de todas las herramientas instaladas, su tipo y puertos.

```bash
# En Linux/macOS/Git Bash
./hub.sh list

# En Windows (PowerShell)
.\hub.ps1 list

# O vía Makefile (Universal)
make hub-list
```

Hemos unificado la experiencia de desarrollo mediante scripts de alto nivel que envuelven al Hub y a las herramientas de calidad:

```bash
# En Linux/macOS
./scripts/dev.sh catalogo   # Actualiza el README
./scripts/dev.sh revisar    # Ejecuta Lints/PHPStan

# En Windows (PowerShell)
.\scripts\dev.ps1 catalogo
.\scripts\dev.ps1 revisar
```

### 2. Ejecutar Localmente

Inicia el proceso de la aplicación (ej. servidor PHP integrado) directamente en tu consola.

```bash
# Ejemplo vía Makefile:
make hub-run APP=Conversor
```

### 3. Levantar con Docker

Si la aplicación define un `compose_file` en su manifiesto, el Hub puede gestionarla independientemente.

```bash
# Ejemplo vía Makefile:
make hub-up APP=CapacitySim
```

### 4. Diagnóstico (Doctor)

Verifica la salud integral del entorno de desarrollo. Ahora incluye validaciones extendidas:

1.  **Herramientas Base**: Docker, Git, PHP.
2.  **Configuración**: Existencia de archivo `.env` y carpeta `vendor`.
3.  **Red**: Disponibilidad de puertos críticos (8000, 8080).
4.  **Contenedores**: Estado de salud (`healthy`) de los servicios Docker (si están corriendo).

```bash
# Vía Makefile
make hub-doctor
```

## 📝 Manifiesto de Aplicación (`app.manifest.yml`)

Para que una aplicación sea reconocida por el Hub, debe tener un manifiesto con la siguiente estructura:

```yaml
name: "Nombre de la App"
type: "static" | "php" | "js"
run_cmd: "comando para iniciar"
ports: [8080]
compose_file: "docker-compose.yml" # Opcional
```

## 🛡️ Seguridad

El Hub implementa varias medidas de seguridad:

- **Prevención de Path Traversal**: Solo permite operaciones dentro del directorio `apps/`.
- **Allowlist**: Solo comandos pre-aprobados pueden ser ejecutados vía `run_cmd`.
- **Validación de Input**: Sanitización estricta de IDs de aplicación.

Para más detalles sobre políticas de seguridad, consulta [SECURITY.md](../SECURITY.md) y [killed.md](../killed.md).
