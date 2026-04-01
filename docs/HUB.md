# Microsistemas Hub (HUB CLI)

El **Hub** es la capa de gestion centralizada de Microsistemas que permite interactuar con todas las micro-aplicaciones de forma unificada desde la linea de comandos.

## 🚀 Concepto

A diferencia del Dashboard web, el Hub esta disenado para automatizacion y gestion rapida de infraestructura. Cada aplicacion en `apps/` se registra automaticamente si contiene un archivo `app.manifest.yml`.

> **Multiples Interfaces**:
>
> 1. **Para Productores (Humanos)**: El Hub CLI es la unica herramienta oficial para modificar, levantar y diagnosticar el entorno.
> 2. **Para Asistentes (IA)**: El Servidor MCP (`/mcp`) provee una API de contexto ("sidecar" pasivo) que expone comandos de `Solo Lectura` (`make hub-list`, `make hub-doctor`) y manifiestos para que agentes de Inteligencia Artificial puedan auditar la arquitectura e infraestructura instalada sin riesgo a romper o mutar nada.

## 🛠️ Comandos Principales

### 1. Listar Aplicaciones

Muestra un resumen de todas las herramientas instaladas, su tipo y puertos.

```bash
# En Linux/macOS/Git Bash
./hub.sh list

# En Windows (PowerShell)
.\hub.ps1 list

# O via Makefile (Universal)
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

Inicia el proceso de la aplicacion (ej. servidor PHP integrado) directamente en tu consola.

```bash
# Ejemplo via Makefile:
make hub-run APP=Conversor
```

### 3. Levantar con Docker

Si la aplicacion define un `compose_file` en su manifiesto, el Hub puede gestionarla independientemente.

```bash
# Ejemplo via Makefile:
make hub-up APP=CapacitySim
```

### 4. Diagnostico (Doctor)

Verifica la salud integral del entorno de desarrollo. Ahora incluye validaciones extendidas:

1. **Herramientas Base**: Docker, Git, PHP.
2. **Configuracion**: Existencia de archivo `.env` y carpeta `vendor`.
3. **Red**: Disponibilidad de puertos criticos (8000, 8080).
4. **Contenedores**: Estado de salud (`healthy`) de los servicios Docker (si estan corriendo).

```bash
# Via Makefile
make hub-doctor
```

## 📝 Manifiesto de Aplicacion (`app.manifest.yml`)

Para que una aplicacion sea reconocida por el Hub, debe tener un manifiesto con la siguiente estructura:

```yaml
name: "Nombre de la App"
type: "static" | "php" | "js"
run_cmd: "comando para iniciar"
ports: [8080]
compose_file: "docker-compose.yml" # Opcional
```

- **Validacion de Input**: Sanitizacion estricta de IDs de aplicacion.

### Lista de Aplicaciones Permitidas (Security Allowlist)

El Hub solo gestiona herramientas que contienen un `app.manifest.yml` valido en el directorio `apps/`. Actualmente incluye:

- Conversor, SQL Viewer, Git Trainer, JS Toolkit, YAML Generator, Log Viewer, PHP Migrator, Capacity Simulator, CI/CD Library, Katas MultiLang.

Para mas detalles sobre politicas de seguridad, consulta [SECURITY.md](../SECURITY.md).
