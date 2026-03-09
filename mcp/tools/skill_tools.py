from mcp.config import get_skill_path

def read_skill(skill_name: str) -> str:
    """
    Lee la documentación o directivas de un playbook/skill específico.
    Los skills contienen instrucciones complejas para automatizar el repositorio.
    """
    skill_path = get_skill_path(skill_name)
    if not skill_path:
        return f"Error: Skill '{skill_name}' not found or invalid."
        
    skill_doc = skill_path / "skill.md"
    if not skill_doc.exists():
        skill_doc = skill_path / "README.md"
        
    if not skill_doc.exists():
        return f"Error: Documentation not found for skill '{skill_name}'."
        
    try:
        return skill_doc.read_text(encoding="utf-8")
    except Exception as e:
        return f"Error reading skill doc: {str(e)}"
