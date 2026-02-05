import os
import yaml

def generate_catalog():
    apps_dir = "apps"
    catalog_start_marker = "<!-- CATALOG_START -->"
    catalog_end_marker = "<!-- CATALOG_END -->"
    
    # Mapeo de tecnologías a badges de Shields.io
    tech_badges = {
        "php": "![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white)",
        "static": "![JS](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=black)",
        "python": "![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white)",
        "devops": "![DevOps](https://img.shields.io/badge/-DevOps-2496ED?logo=docker&logoColor=white)"
    }
    
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
                    app_type = manifest.get("type", "desconocido").lower()
                    
                    # Caso especial para CapacitySim que es DevOps/Static
                    if app_id == "CapacitySim":
                        badge = tech_badges.get("devops")
                    else:
                        badge = tech_badges.get(app_type, f"`{app_type}`")

                    apps.append({
                        "id": app_id,
                        "name": manifest.get("name", app_id),
                        "type_badge": badge,
                        "description": manifest.get("description", "Sin descripción disponible."),
                        "path": f"apps/{app_id}"
                    })
                except Exception as e:
                    print(f"Error parseando {manifest_path}: {e}")

    # Generar tabla Markdown estética
    table = "| Herramienta | Tecnología | Propósito |\n"
    table += "| :--- | :--- | :--- |\n"
    
    for app in apps:
        table += f"| **[{app['name']}]({app['path']})** | {app['type_badge']} | {app['description']} |\n"

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
            print("README.md actualizado con el catálogo mejorado visualmente.")
        else:
            print("Marcadores de catálogo no encontrados en README.md.")
    else:
        print("README.md no encontrado.")

if __name__ == "__main__":
    generate_catalog()
