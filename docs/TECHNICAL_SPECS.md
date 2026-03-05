# Especificaciones Técnicas - Microsistemas Suite

Este documento detalla la arquitectura, tecnologías y estándares utilizados en el proyecto para asegurar su escalabilidad y mantenibilidad.

## 🛠️ Stack Tecnológico

### Backend

- **PHP 8.2+**: Lenguaje principal para el dashboard y utilidades de servidor.
- **MySQL 8.0**: Motor de base de datos para el SQL Viewer (soporta MariaDB).
- **Composer**: Gestión de dependencias y Autoloading (PSR-4 compatible).

### Frontend

- **Vanilla JavaScript (ES6+)**: Lógica de cliente sin frameworks pesados para maximizar la velocidad.
- **CSS3 Moderno**: Uso de Variables CSS (Custom Properties), Grid Layout y Flexbox.
- **Inter Font Family**: Tipografía optimizada para lectura de código.

---

## 🏗️ Arquitectura de Software

El sistema sigue una **Arquitectura de Módulos Independientes (Micro-Apps)**.

### Características Principales

1. **Aislamiento de Aplicaciones**: Cada carpeta en `apps/` es un ecosistema cerrado. No comparten dependencias críticas, lo que permite actualizar una herramienta sin afectar a las otras.
2. **Configuración via Entorno**: Implementación del patrón *12-Factor App* mediante el uso de variables de entorno (`.env`).
3. **Portabilidad Docker**: Orquestación mediante `docker-compose` que garantiza paridad total entre el entorno de desarrollo y producción.

---

## 🏥 Estándar de Salud y Monitoreo

Para garantizar la **Resiliencia Operativa**, todas las micro-apps deben implementar el siguiente contrato de diagnóstico:

### 1. Endpoint de Liveness (`/health`)

- **Propósito**: Confirmar que la aplicación está corriendo y puede recibir peticiones HTTP.
- **Ruta**: `apps/{NombreApp}/health/` (se debe crear `index.php`).
- **Respuesta**: JSON 200 OK.
- **Contenido**:

  ```json
  {
    "status": "ok",
    "app": "NombreApp",
    "timestamp": "2023-10-27T10:00:00Z"
  }
  ```

- **Requisito**: Debe ser ultrarrápido (<50ms) y NO tener dependencias externas (no verificar DB aquí).

### 2. Endpoint de Readiness (`/ready`)

- **Propósito**: Confirmar que la aplicación tiene todo listo para funcionar (DB conectada, archivos críticos, etc.).
- **Ruta**: `apps/{NombreApp}/ready/` (se debe crear `index.php`).
- **Respuesta**: JSON 200 OK (si todo bien) o 503 Service Unavailable (si falla).
- **Contenido**:

  ```json
  {
    "status": "ready",
    "checks": {
      "database": "ok",
      "filesystem": "ok"
    }
  }
  ```

---

## 🔒 Seguridad e Integridad

- **Sanitización de Entradas**: Todas las herramientas que procesan texto (Conversor, Migrador) utilizan `htmlspecialchars()` y filtros de expresión regular para prevenir ataques XSS.
- **Whitelist de Archivos**: El `LogViewer` utiliza una lista blanca estricta de archivos permitidos, impidiendo la navegación arbitraria por el sistema de archivos del servidor.
- **Confirmación de Acciones Destructivas**: El `SQL Viewer` incluye disparadores de JavaScript para confirmar operaciones de escritura (`DELETE`, `DROP`, `ALTER`).

---

## 📈 Estándares de Código

- **PSR-12**: Guía de estilo de codificación PHP.
- **CamelCase**: Nomenclatura para funciones y variables en JavaScript.
- **Kebab-Case**: Nomenclatura para archivos y clases CSS.
- **PascalCase**: Nomenclatura para nombres de aplicaciones en `apps/` (ej: `AwsGenerator`, `SqlViewer`).
- **Calidad Automatizada**: Cada cambio es validado por un pipeline de CI que detecta cambios selectivos por ruta.
- **Seguridad Docker**: Imágenes escaneadas con **Trivy** y generación de **SBOM**.

## 🛠️ Mantenimiento y Extensiones

Para añadir un nuevo microsistema de forma profesional, utiliza el **Skill de Integración**:

```bash
# Leer el playbook completo de 6 pasos:
cat skills/integrar-microsistema/skill.md
```

Flujo resumido (ver skill para detalle):

1. **Preflight**: Verificar estructura del repo.
2. **Carpeta**: Crear `apps/<NombreApp>/` con `app.manifest.yml`.
3. **Dashboard**: Insertar tarjeta en `index.php` usando la plantilla.
4. **Docs**: Actualizar README + docs/* + docs/wiki/* según existan.
5. **Chequeos**: `make hub-list`, `make catalog`, `make validate`, `make test`.
6. **Evidencia**: Reportar archivos modificados y outputs de checks.

Plantillas disponibles en `skills/integrar-microsistema/templates/`.

---

## 🔐 Seguridad CI/CD

- **Scanner de Vulnerabilidades Trivy**: Instalado directamente vía `apt-get` desde el repositorio oficial de Aqua Security (`aquasecurity.github.io/trivy-repo`), saltando el `trivy-action` que presentaba fallos de descarga de binario en runners Ubuntu. El resultado SARIF se sube al Security Tab de GitHub.
- **Secret Scanning (TruffleHog)**: Detecta credenciales expuestas en cada push (`.github/workflows/secret-scanning.yml`).
- **Image SBOM**: Se genera el Software Bill of Materials de la imagen Docker tras cada build exitoso.
