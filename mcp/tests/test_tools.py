import pytest
from pathlib import Path
from mcp.config import sanitize_doc_name, get_app_path, get_skill_path

def test_sanitize_doc_name_success():
    """Prueba que documentos en la whitelist sean resueltos correctamente"""
    path = sanitize_doc_name("README.md")
    assert path is not None
    assert path.name == "README.md"
    assert path.exists()

def test_sanitize_doc_name_rejection():
    """Prueba rigurosa de Path Traversal. No debe permitir salir del repo ni leer secretos"""
    # Intentos de leer wp-config, .env, o salir del root
    assert sanitize_doc_name("../../../Windows/System32/cmd.exe") is None
    assert sanitize_doc_name(".env") is None
    assert sanitize_doc_name(".git/config") is None
    assert sanitize_doc_name("index.php") is None # Not in whitelist

def test_get_app_path_validation():
    """Valida que get_app_path prevenga inyecciones en el nombre de la app"""
    assert get_app_path("Conversor") is not None
    assert get_app_path("ValidApp-123") is None # Doesn't exist, but valid format
    assert get_app_path("../../../") is None # Invalid format
    assert get_app_path("App Name With Spaces") is None # Invalid format

def test_get_skill_path_validation():
    """Valida los nombres de playbooks/skills"""
    assert get_skill_path("integrar-microsistema") is not None
    assert get_skill_path("sudo rm -rf") is None
