import os
import yaml

def generate_catalog():
    apps_dir = "apps"
    catalog_start_marker = "<!-- CATALOG_START -->"
    catalog_end_marker = "<!-- CATALOG_END -->"
    
    apps = []
    
    if not os.path.exists(apps_dir):
        print(f"Directorio {apps_dir} no encontrado.")
        return

    for app_id in sorted(os.listdir(apps_dir)):
        app_path = os.path.join(apps_dir, app_id)
        manifest_path = os.path.join(app_path, "app.manifest.yml")
        
        if os.path.isdir(app_path) and os.path.exists(manifest_path):
            with open(manifest_path, 'r', encoding='utf-8') as f:
                try:
                    manifest = yaml.safe_load(f)
                    apps.append({
                        "id": app_id,
                        "name": manifest.get("name", app_id),
                        "type": manifest.get("type", "desconocido"),
                        "ports": ", ".join(map(str, manifest.get("ports", []))),
                        "run_cmd": manifest.get("run_cmd", "N/A"),
                        "path": f"apps/{app_id}"
                    })
                except Exception as e:
                    print(f"Error parseando {manifest_path}: {e}")

    # Generar tabla Markdown
    table = "| Aplicación | Stack | Comando de Inicio | Puertos | Directorio |\n"
    table += "| :--- | :--- | :--- | :--- | :--- |\n"
    
    for app in apps:
        run_cmd = f"`{app['run_cmd']}`" if app['run_cmd'] else "N/A"
        table += f"| **{app['name']}** | {app['type']} | {run_cmd} | {app['ports']} | [{app['id']}]({app['path']}) |\n"

    # Actualizar README.md
    readme_path = "README.md"
    if os.path.exists(readme_path):
        with open(readme_path, 'r', encoding='utf-8') as f:
            content = f.read()

        if catalog_start_marker in content and catalog_end_marker in content:
            new_content = (
                content.split(catalog_start_marker)[0] + 
                catalog_start_marker + "\n\n" + 
                table + "\n" + 
                catalog_end_marker + 
                content.split(catalog_end_marker)[1]
            )
            with open(readme_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print("README.md actualizado con el catálogo.")
        else:
            print("Marcadores de catálogo no encontrados en README.md. Por favor, añade <!-- CATALOG_START --> y <!-- CATALOG_END -->.")
    else:
        print("README.md no encontrado.")

if __name__ == "__main__":
    generate_catalog()
