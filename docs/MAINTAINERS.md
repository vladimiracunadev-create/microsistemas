# Mantenedores (MAINTAINERS)

Este documento enumera a las personas que tienen responsabilidad directa sobre el mantenimiento de este repositorio.

## Equipo de Core

- **Vladimir (@vladimiracunadev-create)** - Arquitecto y Líder del proyecto.

## Responsabilidades de los Mantenedores

1. **Revisión de Issues**: Clasificar y responder a los reportes de errores en un plazo de 48-72 horas.
2. **Pull Requests de Comunidad**: Revisar y aprobar contribuciones que cumplan con los estándares PSR-12 definidos en `CONTRIBUTING.md`.
3. **Pull Requests Autónomos (Dependabot)**: Auditar, testear y ratificar (merge) sistemáticamente las propuestas de actualización de dependencias de Composer y Docker creadas por los bots, asegurando que los checks de CI/CD validen el cambio sin romper `main`.
4. **Lanzamientos**: Gestionar el versionado SemVer y la publicación de imágenes en GitHub Packages.
5. **Seguridad**: Atender de forma prioritaria cualquier vulnerabilidad reportada según la `SECURITY.md`.
6. **Monitoreo de Salud**: Verificar periódicamente que los endpoints `/health` y `/ready` de todas las apps respondan correctamente. Usar `make hub-doctor` para diagnóstico completo del entorno.

## Cómo Convertirse en Mantenedor

Buscamos personas comprometidas que hayan realizado al menos 5 contribuciones significativas (features o bugfixes) y que demuestren un profundo conocimiento del ecosistema Docker/PHP/Composer.
