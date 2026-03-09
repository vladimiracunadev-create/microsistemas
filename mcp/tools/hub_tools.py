import subprocess
from pathlib import Path

from mcp.config import REPO_ROOT

def _run_make_command(command: str, app_name: str | None = None) -> str:
    """Ejecuta un comando make predefinido de forma segura"""
    cmd = ["make", command]
    if app_name:
        cmd.append(f"APP={app_name}")
        
    try:
        # cwd ensures we run it from the repo root
        result = subprocess.run(
            cmd, 
            cwd=str(REPO_ROOT),
            capture_output=True, 
            text=True, 
            timeout=15
        )
        if result.returncode != 0:
            return f"Hub Error ({result.returncode}):\n{result.stderr}\n{result.stdout}"
        return result.stdout
    except subprocess.TimeoutExpired:
        return "Error: Command timed out after 15 seconds."
    except Exception as e:
        return f"Error executing hub command: {str(e)}"

def run_hub_list() -> str:
    """
    Ejecuta el comando 'make hub-list' para listar todas las micro-apps detectadas por el Hub.
    Retorna la salida estandar del comando, mostrando el status de registro.
    """
    return _run_make_command("hub-list")

def run_hub_doctor(app_name: str | None = None) -> str:
    """
    Ejecuta 'make hub-doctor' para diagnosticar el estado de los puertos y contenedores.
    Si se provee app_name, audita solo esa aplicacion.
    """
    if app_name:
        # Sanitización extra: el nombre no debe contener espacios ni inyecciones de shell
        import re
        if not re.match(r"^[a-zA-Z0-9_-]+$", app_name):
            return "Error: Invalid app name format."
            
    return _run_make_command("hub-doctor", app_name)

def run_smoke() -> str:
    """
    Ejecuta 'make smoke', una prueba tecnica predefinida que levanta contenedores, espera por salud y los apaga.
    Es útil para validar que la infraestructura base de Docker funciona sin errores.
    """
    return _run_make_command("smoke")

def find_ports() -> str:
    """
    Analiza de forma segura el archivo docker-compose.yml buscando puertos expuestos
    usando expresiones regulares en lugar de comandos de red del sistema operativo.
    """
    compose_path = REPO_ROOT / "docker-compose.yml"
    if not compose_path.exists():
        return "Error: docker-compose.yml not found in repository root."
        
    import re
    ports_found = []
    
    with open(compose_path, 'r', encoding='utf-8') as f:
        # Buscamos lineas como: - "8080:80" o - 8000:80
        port_pattern = re.compile(r'^\s*-\s*"?(\d+):(\d+)"?')
        service_pattern = re.compile(r'^  ([a-zA-Z0-9_-]+):')
        
        current_service = "Unknown"
        for line in f:
            svc_match = service_pattern.match(line)
            if svc_match:
                current_service = svc_match.group(1)
                
            port_match = port_pattern.match(line)
            if port_match:
                host_port = port_match.group(1)
                container_port = port_match.group(2)
                ports_found.append(f"Service '{current_service}': Host {host_port} -> Container {container_port}")
                
    if not ports_found:
        return "No exposed ports found in docker-compose.yml"
        
    return "\n".join(ports_found)
