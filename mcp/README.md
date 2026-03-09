# Microsistemas MCP Server (V1 - Solo Lectura)

## 📌 ¿Qué es esto?

Este módulo integra un Servidor **Model Context Protocol (MCP)** local, construido utilizando `FastMCP`. Su objetivo es actuar como un "sidecar" seguro y desacoplado para exponer la inteligencia arquitectónica, documental y operativa de la *Suite Microsistemas* hacia asistentes de Inteligencia Artificial locales o basados en la nube (como Claude Desktop, Cursor, etc.).

**No reemplaza al `Microsistemas Hub`**, interactúa con él de forma segura y controlada limitándose a diagnósticos visuales.

## 🛡️ Principios de Arquitectura (Security by Design)

1. **Cero mutaciones:** El servidor MCP está restringido a **solo lectura**. No incluye herramientas de escritura, commits, ejecución de Docker arbitrario ni modificaciones estructurales.
2. **Path Traversal Shield:** Las herramientas (`read_doc`, `read_manifest`, `read_skill`) están protegidas mediante validaciones Regex estrictas y Listas Blancas (Whitelists) para imposibilitar ataques de acceso a secretos (`.env`, `config.php`).
3. **Comandos Acotados:** La interacción con el Hub CLI está rigurosamente parseada a solo `make hub-list`, `make hub-doctor`, `make smoke`, y extracción controlada de `docker-compose.yml`. Ninguna herramienta acepta comandos libres o flags inseguras.

## 🚀 Guía de Uso Rápido

### Prerrequisitos

- **Python 3.11+**
- Un entorno virtual o `pip` disponible.

### Instalación

Se recomienda instalar las dependencias e iniciar el servidor desde el directorio raíz del repositorio:

```bash
# Navegar a la carpeta mcp
cd mcp

# Instalar dependencias definidas en pyproject.toml
pip install .

# O alternativamente, usar uv (si está disponible)
uv pip install -e .
```

### Inicialización Local

Para arrancar el servidor nativo y testearlo o exponerlo vía Standard IO (stdio) a un cliente MCP:

```bash
# Desde la raiz del REPOSITORIO
python -m mcp.server
```

> Nota: Cuando se inicializa desde Claude Desktop, el cliente se encarga automáticamente de invocar el comando python anterior mediante stdio.

### Integración en Claude Desktop (Ejemplo)

Añade esto a tu archivo `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "microsistemas_hub": {
      "command": "python",
      "args": ["-m", "mcp.server"],
      "cwd": "C:\\xampp\\htdocs\\microsistemas\\Microsistemas"
    }
  }
}
```

## 🧰 Capacidades Expuestas a la IA

### Tools (Herramientas Operativas)

- `list_apps()`: Escanea directorios en `/apps`.
- `read_manifest(app_name)`: Parsea `app.manifest.yml`.
- `read_doc(doc_name)`: Lee documentos oficiales permitidos (`README.md`, `ARCHITECTURE.md`, etc.).
- `read_skill(skill_name)`: Lee la documentación y playbooks de la carpeta `/skills`.
- `run_hub_list()`: Lanza `make hub-list` y captura resultados.
- `run_hub_doctor()`: Lanza `make hub-doctor` para comprobar contenedores y puertos.
- `run_smoke()`: Valida la estabilización de infraestructura base.
- `find_ports()`: Lee expresiones regulares cruzadas para los mapeos en `docker-compose.yml`.

### Resources (Contexto Instantáneo)

El servidor pre-carga un mapa de URI Resources bajo el esquema `repo://` permitiendo al IA devorar bibliografía completa instantáneamente (ej. `repo://architecture`, `repo://hub`, `repo://apps/manifests`, `repo://skills/integrar-microsistema`).

### Prompts (Comportamientos Pre-configurados)

- `integrar-microapp`: Inicia un flujo de agente especializado en conectar código nuevo al Hub.
- `auditar-manifest`: Valida si una aplicación sigue las reglas del proyecto.
- `diagnosticar-entorno`: Lanza al agente al rol de SRE buscando puertos muertos o contenedores caídos.

## ⚠️ Troubleshooting Básico

- **"Error: Document is not authorized"**: Si intentas leer un archivo nuevo, debes agregarlo manualmente a la lista `ALLOWED_DOCS` dentro de `mcp/config.py`.
- **El servidor no arranca**: Verifica que estás posicionado en la raíz de `Microsistemas` al lanzar `python -m mcp.server` para que los Paths relativos funcionen.

---
*Este MCP sienta las bases para futuras implementaciones de V2 con mutaciones controladas, pero en la V1 el pacto sagrado es mantener el repositorio 100% inalterado por la Inteligencia Artificial.*
