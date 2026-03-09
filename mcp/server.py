from fastmcp import FastMCP
from pathlib import Path

# Configuracion y whitelists
from mcp.config import REPO_ROOT

# Importar tools
from mcp.tools import hub_tools
from mcp.tools import docs_tools
from mcp.tools import manifest_tools
from mcp.tools import skill_tools

# Importar resources
from mcp.resources import resource_map

# Inicializar FastMCP Server
mcp = FastMCP("Microsistemas Hub MCP", dependencies=["pydantic"])

# --- REGISTRO DE TOOLS ---
# Hub Tools
mcp.tool()(hub_tools.run_hub_list)
mcp.tool()(hub_tools.run_hub_doctor)
mcp.tool()(hub_tools.run_smoke)
mcp.tool()(hub_tools.find_ports)

# Docs Tools
mcp.tool()(docs_tools.read_doc)

# Manifest Tools
mcp.tool()(manifest_tools.list_apps)
mcp.tool()(manifest_tools.read_manifest)

# Skill Tools
mcp.tool()(skill_tools.read_skill)


# --- REGISTRO DE RESOURCES ---
mcp.resource("repo://readme")(resource_map.get_resource_readme)
mcp.resource("repo://architecture")(resource_map.get_resource_architecture)
mcp.resource("repo://hub")(resource_map.get_resource_hub)
mcp.resource("repo://security")(resource_map.get_resource_security)
mcp.resource("repo://catalog")(resource_map.get_resource_catalog)
mcp.resource("repo://maintainers")(resource_map.get_resource_maintainers)
mcp.resource("repo://api-reference")(resource_map.get_resource_api)
mcp.resource("repo://apps/manifests")(resource_map.get_resource_manifests)
mcp.resource("repo://skills/integrar-microsistema")(resource_map.get_resource_skill_integrar)


# --- REGISTRO DE PROMPTS ESTÁTICOS ---
def _load_prompt(filename: str) -> str:
    prompt_path = REPO_ROOT / "mcp" / "prompts" / filename
    if prompt_path.exists():
        return prompt_path.read_text(encoding="utf-8")
    return f"Prompt no encontrado: {filename}"

@mcp.prompt("integrar-microapp")
def prompt_integrar_microapp() -> str:
    """Asistente enfocado en la integracion completa de micro-apps a la suite."""
    return _load_prompt("integrar_microapp.md")

@mcp.prompt("auditar-manifest")
def prompt_auditar_manifest() -> str:
    """Validador tecnico de la declaracion app.manifest.yml de una app particular."""
    return _load_prompt("auditar_manifest.md")

@mcp.prompt("diagnosticar-entorno")
def prompt_diagnosticar_entorno() -> str:
    """Investigador de fallos de puertos y contenedores utilizando el hub list, doctor y smoke."""
    return _load_prompt("diagnosticar_entorno.md")

@mcp.prompt("revisar-documentacion")
def prompt_revisar_documentacion() -> str:
    """Asistente para revision integral."""
    return "Revisa y asegura que la documentacion tecnica (ARCHITECTURE, README, SECURITY) este sincronizada y correcta."

@mcp.prompt("preparar-release-docs")
def prompt_preparar_release_docs() -> str:
    """Asistente enfocado en preparar notas de versión y revisar que la documentación esté lista para un lanzamiento."""
    return _load_prompt("preparar_release_docs.md")


# --- ENTRYPOINT ---
def main():
    """Ejecucion estandar via stdio para clientes Claude/Cursor."""
    # FastMCP maneja el loop asyncio por debajo, exponemos directamente run()
    mcp.run(transport='stdio')

if __name__ == "__main__":
    main()
