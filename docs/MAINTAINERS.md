# Mantenedores (MAINTAINERS)

Este documento enumera a las personas que tienen responsabilidad directa sobre el mantenimiento de este repositorio.

## Equipo de Core

- **Vladimir (@vladimiracunadev-create)** - Arquitecto y Lider del proyecto.

## Responsabilidades de los Mantenedores

1. **Revision de Issues**: Clasificar y responder a los reportes de errores en un plazo de 48-72 horas.
2. **Pull Requests de Comunidad**: Revisar y aprobar contribuciones que cumplan con los estandares PSR-12 definidos en `CONTRIBUTING.md`.
3. **Pull Requests Autonomos (Dependabot)**: Auditar, testear y ratificar (merge) sistematicamente las propuestas de actualizacion de dependencias de Composer y Docker creadas por los bots, asegurando que los checks de CI/CD validen el cambio sin romper `main`.
4. **Lanzamientos**: Gestionar el versionado SemVer y la publicacion de imagenes en GitHub Packages.
5. **Seguridad**: Atender de forma prioritaria cualquier vulnerabilidad reportada segun la `SECURITY.md`.
6. **Monitoreo de Salud**: Verificar periodicamente que los endpoints `/health` y `/ready` de todas las apps respondan correctamente. Usar `make hub-doctor` para diagnostico completo del entorno.
7. **Infraestructura IA (MCP)**: Auditar que las `tools` y `resources` definidos en `mcp/` mantengan siempre la barrera estricta de "Solo Lectura", sin exponer comandos destructables al LLM. Gestionar y actualizar prudencialmente las _AllowLists_ (Listas Blancas Documentales) centralizadas en la configuracion (`mcp/config.py`).

## Como Convertirse en Mantenedor

Buscamos personas comprometidas que hayan realizado al menos 5 contribuciones significativas (features o bugfixes) y que demuestren un profundo conocimiento del ecosistema Docker/PHP/Composer.
