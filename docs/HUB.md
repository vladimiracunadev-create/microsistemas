# Microsistemas Hub (HUB CLI)

El **Hub** es la capa de gestión centralizada de Microsistemas que permite interactuar con todas las micro-aplicaciones de forma unificada desde la línea de comandos.

## 🚀 Concepto

A diferencia del Dashboard web, el Hub está diseñado para automatización y gestión rápida de infraestructura. Cada aplicación en `apps/` se registra automáticamente si contiene un archivo `app.manifest.yml`.

## 🛠️ Comandos Principales

### 1. Listar Aplicaciones
Muestra un resumen de todas las herramientas instaladas, su tipo y puertos.
```bash
python hub/main.py list
# O vía Makefile
make hub-list
```

### 2. Ejecutar Localmente
Inicia el proceso de la aplicación (ej. servidor PHP integrado) directamente en tu consola.
```bash
python hub/main.py run [APP_ID]
# Ejemplo:
make hub-run APP=Conversor
```

### 3. Levantar con Docker
Si la aplicación define un `compose_file` en su manifiesto, el Hub puede gestionarla independientemente.
```bash
python hub/main.py up [APP_ID]
# Ejemplo:
make hub-up APP=CapacitySim
```

### 4. Diagnóstico (Doctor)
Verifica que las dependencias críticas (Docker, Git, Python) estén instaladas correctamente.
```bash
python hub/main.py doctor
# O vía Makefile
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
