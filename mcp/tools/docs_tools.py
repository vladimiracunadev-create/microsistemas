from mcp.config import sanitize_doc_name

def read_doc(doc_name: str) -> str:
    """
    Lee un documento Markdown oficial del repositorio para obtener contexto.
    Actúa como una barrera de seguridad contra lectura de archivos arbitrarios.
    Solo admite documentos en la whitelist (ej: README.md, ARCHITECTURE.md, SECURITY.md).
    """
    doc_path = sanitize_doc_name(doc_name)
    if not doc_path:
        return f"Error: Document '{doc_name}' is not authorized or does not exist. Please request an approved document."
        
    try:
        return doc_path.read_text(encoding="utf-8")
    except Exception as e:
        return f"Error reading document: {str(e)}"
