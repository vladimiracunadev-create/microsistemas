import typer
import yaml
import os
import subprocess
from rich.console import Console
from rich.table import Table
from typing import Optional

app = typer.Typer(help="Hub CLI para Microsistemas")
console = Console()

APPS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "apps")

def get_apps():
    apps = []
    if not os.path.exists(APPS_DIR):
        return apps
    
    # Path Traversal Prevention: Ensure we are only reading from the apps directory
    base_path = os.path.abspath(APPS_DIR)
    
    for item in os.listdir(APPS_DIR):
        app_path = os.path.abspath(os.path.join(APPS_DIR, item))
        if not app_path.startswith(base_path):
            continue
            
        manifest_path = os.path.join(app_path, "app.manifest.yml")
        if os.path.isfile(manifest_path):
            with open(manifest_path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
                data["id"] = item
                apps.append(data)
    return apps

@app.command()
def list():
    """Lista todas las aplicaciones registradas."""
    apps = get_apps()
    table = Table(title="Aplicaciones en Microsistemas")
    table.add_column("ID", style="cyan")
    table.add_column("Nombre", style="magenta")
    table.add_column("Tipo", style="green")
    table.add_column("Puertos", style="yellow")

    for a in apps:
        table.add_row(
            a["id"],
            a.get("name", "N/A"),
            a.get("type", "N/A"),
            ", ".join(map(str, a.get("ports", [])))
        )
    console.print(table)

@app.command()
def run(app_id: str):
    """Ejecuta una aplicación localmente."""
    # Input Validation: Sanitize app_id
    if not app_id.isalnum() and "_" not in app_id and "-" not in app_id:
        console.print("[red]Error:[/red] ID de aplicación no válido.")
        raise typer.Exit(1)

    app_dir = os.path.join(APPS_DIR, app_id)
    manifest_path = os.path.join(app_dir, "app.manifest.yml")
    
    # Path Traversal Check
    if not os.path.abspath(app_dir).startswith(os.path.abspath(APPS_DIR)):
        console.print("[red]Error:[/red] Intento de acceso fuera del directorio de aplicaciones.")
        raise typer.Exit(1)

    if not os.path.exists(manifest_path):
        console.print(f"[red]Error:[/red] Aplicación '{app_id}' no encontrada o sin manifiesto.")
        raise typer.Exit(1)

    with open(manifest_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    run_cmd = data.get("run_cmd")
    if not run_cmd:
        if data.get("type") == "static":
            console.print(f"[yellow]Info:[/yellow] La aplicación '{app_id}' es estática. Ábrela en tu navegador.")
            return
        console.print(f"[red]Error:[/red] No se definió run_cmd para '{app_id}'.")
        raise typer.Exit(1)

    # RCE Prevention: Minimal command validation
    # Only allow common execution patterns
    allowed_starts = ("php ", "python ", "node ", "npm ", "serve ")
    if not any(run_cmd.startswith(start) for start in allowed_starts):
        console.print(f"[red]Error de Seguridad:[/red] Comando '{run_cmd}' no permitido.")
        raise typer.Exit(1)

    console.print(f"[green]Iniciando {app_id}...[/green]")
    try:
        # Ejecutar en el directorio de la app
        os.chdir(app_dir)
        # Use shell=False if possible for better security, but commands like 'php -S' need parsing
        # Here we trust the manifest content as it is part of the repo (Supply Chain Trust)
        subprocess.run(run_cmd, shell=True, check=True)
    except Exception as e:
        console.print(f"[red]Error al ejecutar:[/red] {e}")

@app.command()
def up(app_id: str):
    """Levanta una aplicación con Docker Compose si tiene compose_file."""
    manifest_path = os.path.join(APPS_DIR, app_id, "app.manifest.yml")
    if not os.path.exists(manifest_path):
        console.print(f"[red]Error:[/red] Aplicación '{app_id}' no encontrada.")
        raise typer.Exit(1)

    with open(manifest_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    compose_file = data.get("compose_file")
    if not compose_file:
        console.print(f"[yellow]Aviso:[/yellow] '{app_id}' no define un compose_file en su manifiesto.")
        return

    console.print(f"[green]Levantando {app_id} con Docker Compose...[/green]")
    try:
        os.chdir(os.path.join(APPS_DIR, app_id))
        subprocess.run(f"docker compose -f {compose_file} up -d", shell=True, check=True)
    except Exception as e:
        console.print(f"[red]Error docker compose:[/red] {e}")

@app.command()
def doctor():
    """Verifica el estado del entorno (Docker, puertos, permisos)."""
    console.print("[bold]Chequeo de salud del Hub...[/bold]")

    # Check Docker
    try:
        subprocess.run("docker --version", shell=True, check=True, capture_output=True)
        console.print("[green][OK][/green] Docker está instalado.")
    except:
        console.print("[red][ERR][/red] Docker no encontrado.")

    # Check Git
    try:
        subprocess.run("git --version", shell=True, check=True, capture_output=True)
        console.print("[green][OK][/green] Git está instalado.")
    except:
        console.print("[red][ERR][/red] Git no encontrado.")

    # Check Python
    console.print("[green][OK][/green] Python está instalado.")

    console.print("\n[base]Sugerencia:[/base] Asegúrate de tener los puertos 80/443 libres si vas a usar el proxy global.")

if __name__ == "__main__":
    app()
