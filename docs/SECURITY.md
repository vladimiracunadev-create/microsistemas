# Política de Seguridad (SECURITY)

## Compromiso de Seguridad
Nos tomamos muy en serio la seguridad de las herramientas incluidas en esta suite. Al ser microsistemas orientados a la gestión de servidores y bases de datos, la integridad es nuestra prioridad.

## Reporte de Vulnerabilidades
Si encuentras alguna vulnerabilidad de seguridad, por favor **no la publiques en un issue abierto**. Sigue este proceso:
1. Envía un correo electrónico a `seguridad@tu-dominio.com` (o el canal de contacto definido).
2. Proporciona detalles técnicos, pasos para reproducir y el impacto potencial.
3. Te responderemos en un plazo de 48 horas para confirmar la recepción.

## Alcance
Esta política cubre:
- El Dashboard principal.
- Todos los microsistemas dentro de `apps/`.
- La configuración de Docker proporcionada.

## Versiones Soportadas
Solo se proporcionarán parches de seguridad para la versión más reciente en la rama `main`. Recomendamos mantener siempre el repositorio actualizado mediante `git pull`.

---

## Recomendaciones de Despliegue Seguro
1.  **Protección de Firewall**: No expongas el puerto 8080 (Docker) o 80 (Apache) directamente a internet sin un proxy inverso (Nginx) y autenticación básica.
2.  **Archivos Sensibles**: Asegúrate de que el archivo `.env` nunca sea accesible públicamente (está incluido en `.gitignore` por defecto).
3.  **Modo Solo Lectura**: Siempre que sea posible, configura las bases de datos del SQL Viewer con un usuario de "solo lectura" para tareas de inspección.
