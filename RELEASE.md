# Estrategia de Versionado y Entrega (RELEASE)

Este documento define el proceso para empacar, versionar y publicar cambios en la suite **Microsistemas**. Dada su naturaleza de "Ecosistema / Showcase", el versionado ayuda a reclutadores, desarrolladores y operadores a visualizar la madurez y trazabilidad de la plataforma.

## 1. Patron de Versionado

El repositorio sigue un esquema de versionado semantico **[Semantic Versioning 2.0.0](https://semver.org/)** (`MAJOR.MINOR.PATCH`).

- **MAJOR (1.x.x):** Cambios estructurales masivos, cambio absoluto de arquitectura base (Core v2), o migracion de lenguajes base que rompan compatibilidad con despliegues anteriores.
- **MINOR (x.1.x):** Inclusion de una nueva Micro-App en `apps/` o adicion sustancial de funcionalidad al Hub Manager.
- **PATCH (x.x.1):** Solucion de bugs dentro de una Micro-App existente, actualizaciones menores de interfaz, o parches de vulnerabilidades (dependencias).

## 2. Flujo de Release

Al publicar una nueva version, se deben seguir los siguientes pasos:

### 2.1. Preparacion Local

1. Asegurate de estar en la rama `main` y con el directorio limpio.
2. Ejecuta los flujos de validacion locales:

   ```bash
   make test   # si existen suites activas
   make smoke
   ```

3. Comprueba el analisis estatico o linters si aplicasen (e.g. validaciones PHPSTAN, markdown lint).

### 2.2. Actualizacion Ciclica

1. Actualiza obligatoriamente el archivo `CHANGELOG.md` documentando los cambios en los apartados `Add`, `Fix`, `Change`.
2. Opcional: Actualiza la referencia de version en el README (badge URL) si estuviera harcodeado.

### 2.3. Tag y Push

```bash
git add CHANGELOG.md
git commit -m "chore: prepare release v1.4.0"
git tag -a v1.4.0 -m "Release v1.4.0: Anadida nueva app de monitoreo y mejoras en AWS Generator"
git push origin main --tags
```

### 2.4. Automatizacion CI/CD

Tras empujar un Tag a `main`, GitHub Actions (`.github/workflows/docker-publish.yml`) interceptara el evento asumiendo la responsabilidad de:

1. Ejecutar tests estandarizados en pipeline.
2. Construir la imagen Docker final (Multi-Stage Build).
3. Etiquetar la imagen tanto con el identificador semantico (`v1.4.0`) como con `latest`.
4. Pushear el resultado a GitHub Container Registry (GHCR).

## 3. Checklist Pre-Release Obligatorio

Antes de aprobar la publicacion o crear un Tag:

- [ ] El Hub CLI puede listar todas las aplicaciones nuevas?
- [ ] La variable `.env.example` contiene los nuevos requerimientos y tokens?
- [ ] Los manifiestos de Kubernetes `k8s/` continuan siendo compatibles?
- [ ] La suite levanta sin errores por consola via `make up` tras un purge total de imagenes locales?
- [ ] No se estan filtrando tokens o claves privadas a nivel de repositorio de la nueva feature?

## 4. Breaking Changes

Si un cambio requiere la reconstruccion manual de la base de datos o modificar comandos fundamentales de Makefile, se catalogara inmediatamente como **MAJOR** y dicho cambio debera anunciarse en mayusculas bajo un bloque de `🚨 BREAKING CHANGES` al inicio de las notas del release en GitHub Releases y el `CHANGELOG.md`.
