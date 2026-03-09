import os
import re
from pathlib import Path

# --- Rutas Base del Repositorio Parent ---
MCP_DIR = Path(__file__).parent.absolute()
REPO_ROOT = MCP_DIR.parent

# --- Whitelists Rigurosas de Seguridad (Solo Lectura) ---

# Documentos centrales permitidos para lectura
ALLOWED_DOCS = [
    "README.md",
    "ARCHITECTURE.md",
    "HUB.md",
    "API.md",
    "SECURITY.md",
    "INSTALL.md",
    "MAINTAINERS.md",
    "USER_MANUAL.md",
    "FILES_REFERENCE.md",
    "SYSTEMS_CATALOG.md",
    "BEGINNERS_GUIDE.md"
]

# Base de nombres de aplicaciones válidas (Regex para validación de directorios)
VALID_APP_NAME_PATTERN = re.compile(r"^[a-zA-Z0-9_-]+$")

# --- Funciones de Sanitización y Validación ---

def sanitize_doc_name(doc_name: str) -> Path | None:
    """Previene Path Traversal. Solo permite lectura si el doc está en el root o en docs/ y explicitamente en la whitelist"""
    if doc_name not in ALLOWED_DOCS:
        return None
    
    # Try root first
    root_path = REPO_ROOT / doc_name
    if root_path.exists() and root_path.is_file():
        return root_path
        
    # Then try docs/
    docs_path = REPO_ROOT / "docs" / doc_name
    if docs_path.exists() and docs_path.is_file():
        return docs_path
        
    return None

def get_app_path(app_name: str) -> Path | None:
    """Valida el nombre de la app y devuelve su path si existe en apps/"""
    if not VALID_APP_NAME_PATTERN.match(app_name):
        return None
        
    app_dir = REPO_ROOT / "apps" / app_name
    if app_dir.exists() and app_dir.is_dir():
        return app_dir
        
    return None

def get_skill_path(skill_name: str) -> Path | None:
    """Valida y obtiene la ruta de un skill"""
    if not VALID_APP_NAME_PATTERN.match(skill_name):
        return None
        
    skill_dir = REPO_ROOT / "skills" / skill_name
    if skill_dir.exists() and skill_dir.is_dir():
        return skill_dir
        
    return None
