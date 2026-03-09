import json
from mcp.config import get_app_path, REPO_ROOT, VALID_APP_NAME_PATTERN

def list_apps() -> str:
    """
    Retorna una lista en formato JSON de todas las micro-aplicaciones 
    disponibles físicamente en la carpeta 'apps/'.
    """
    apps_dir = REPO_ROOT / "apps"
    if not apps_dir.exists():
        return "Error: 'apps/' directory not found."
        
    apps = []
    for item in apps_dir.iterdir():
        if item.is_dir() and VALID_APP_NAME_PATTERN.match(item.name):
            has_manifest = (item / "app.manifest.yml").exists()
            apps.append({
                "name": item.name,
                "has_manifest": has_manifest
            })
            
    return json.dumps({"installed_apps": apps}, indent=2)

def read_manifest(app_name: str) -> str:
    """
    Lee y parsea la configuración de una micro-aplicación desde su app.manifest.yml.
    Proporciona información sobre stack, tipo y dependencias de la app.
    """
    app_path = get_app_path(app_name)
    if not app_path:
        return f"Error: Application '{app_name}' not found or invalid."
        
    manifest_path = app_path / "app.manifest.yml"
    if not manifest_path.exists():
        return f"Error: Application '{app_name}' does not have an app.manifest.yml file."
        
    try:
        content = manifest_path.read_text(encoding="utf-8")
        return f"=== Manifest of {app_name} ===\n{content}"
    except Exception as e:
        return f"Error reading manifest: {str(e)}"
