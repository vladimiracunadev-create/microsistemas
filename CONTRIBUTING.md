# Contribuciones (CONTRIBUTING)

Gracias por tu interés en contribuir. Este repositorio es una colección de microsistemas autocontenidos.

## Filosofía del proyecto
- **Modularidad**: Cada microsistema vive en su propia carpeta en `apps/`.
- **Independencia**: Los cambios en un módulo no deben romper a los demás.
- **Seguridad**: Especial cuidado con herramientas de BD.

## Estructura de Directorios
Si vas a añadir una nueva herramienta, crea una carpeta en `apps/NombreHerramienta/` que contenga:
- `index.php` o `index.html` (Punto de entrada).
- Sus propios assets (CSS/JS) o subcarpetas.
- Un `README.md` propio explicando su uso.

## Pruebas
Antes de enviar un Pull Request:

### Si usas Docker (Recomendado)
1. Levanta el entorno: `docker-compose up -d`
2. Verifica que tu módulo carga en `http://localhost:8080/apps/TuModulo/`
3. Verifica que no rompe el Dashboard principal.

### Si usas XAMPP
1. Asegúrate de que las rutas relativas funcionen fuera de la raíz.
2. Verifica que no haya errores de carga de recursos en la consola del navegador.

## Estilo de Commits
- `feat: Nueva herramienta de Regex`
- `fix: Corrección de bug en Conversor`
- `docs: Actualización de README`
- `refactor: Limpieza de código en SqlViewer`

## Licencia
Al contribuir, aceptas que tu contribución se distribuya bajo los términos descritos en `LICENSE` y `NOTICE`.
