from mcp.config import sanitize_doc_name, get_skill_path, get_app_path, REPO_ROOT

def get_resource_readme() -> str:
    return sanitize_doc_name("README.md").read_text(encoding="utf-8")

def get_resource_architecture() -> str:
    return sanitize_doc_name("ARCHITECTURE.md").read_text(encoding="utf-8")

def get_resource_hub() -> str:
    return sanitize_doc_name("HUB.md").read_text(encoding="utf-8")
    
def get_resource_security() -> str:
    return sanitize_doc_name("SECURITY.md").read_text(encoding="utf-8")

def get_resource_catalog() -> str:
    return sanitize_doc_name("SYSTEMS_CATALOG.md").read_text(encoding="utf-8")
    
def get_resource_api() -> str:
    return sanitize_doc_name("API.md").read_text(encoding="utf-8")
    
def get_resource_maintainers() -> str:
    return sanitize_doc_name("MAINTAINERS.md").read_text(encoding="utf-8")

def get_resource_skill_integrar() -> str:
    skill_doc = get_skill_path("integrar-microsistema") / "skill.md"
    return skill_doc.read_text(encoding="utf-8")
    
def get_resource_manifests() -> str:
    """Retorna un texto combinado de todos los manifests validos"""
    apps_dir = REPO_ROOT / "apps"
    output = []
    
    if apps_dir.exists():
        for item in apps_dir.iterdir():
            if item.is_dir():
                manifest_path = item / "app.manifest.yml"
                if manifest_path.exists():
                    output.append(f"--- Manifest: {item.name} ---")
                    output.append(manifest_path.read_text(encoding="utf-8"))
                    output.append("")
    
    if not output:
        return "No manifests found."
    return "\n".join(output)
