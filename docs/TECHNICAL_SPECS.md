# Especificaciones Tecnicas - Microsistemas Suite

Este documento detalla la arquitectura, tecnologias y estandares utilizados en el proyecto para asegurar su escalabilidad y mantenibilidad.

## 🛠️ Stack Tecnologico

### Backend

- **PHP 8.2+**: Lenguaje principal para el dashboard y utilidades de servidor.
- **MySQL 8.0**: Motor de base de datos para el SQL Viewer (soporta MariaDB).
- **Composer**: Gestion de dependencias y Autoloading (PSR-4 compatible).

### Frontend

- **Vanilla JavaScript (ES6+)**: Logica de cliente sin frameworks pesados para maximizar la velocidad.
- **CSS3 Moderno**: Uso de Variables CSS (Custom Properties), Grid Layout y Flexbox.
- **Inter Font Family**: Tipografia optimizada para lectura de codigo.

---

## 🏗️ Arquitectura de Software

El sistema sigue una **Arquitectura de Modulos Independientes (Micro-Apps)**.

### Caracteristicas Principales

1. **Aislamiento de Aplicaciones**: Cada carpeta en `apps/` es un ecosistema cerrado. No comparten dependencias criticas, lo que permite actualizar una herramienta sin afectar a las otras.
2. **Configuracion via Entorno**: Implementacion del patron *12-Factor App* mediante el uso de variables de entorno (`.env`).
3. **Portabilidad Docker**: Orquestacion mediante `docker-compose` que garantiza paridad total entre el entorno de desarrollo y produccion.

---

## 🏥 Estandar de Salud y Monitoreo

Para garantizar la **Resiliencia Operativa**, todas las micro-apps deben implementar el siguiente contrato de diagnostico:

### 1. Endpoint de Liveness (`/health`)

- **Proposito**: Confirmar que la aplicacion esta corriendo y puede recibir peticiones HTTP.
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

- **Requisito**: Debe ser ultrarrapido (<50ms) y NO tener dependencias externas (no verificar DB aqui).

### 2. Endpoint de Readiness (`/ready`)

- **Proposito**: Confirmar que la aplicacion tiene todo listo para funcionar (DB conectada, archivos criticos, etc.).
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

- **Sanitizacion de Entradas**: Todas las herramientas que procesan texto (Conversor, Migrador) utilizan `htmlspecialchars()` y filtros de expresion regular para prevenir ataques XSS.
- **Whitelist de Archivos**: El `LogViewer` utiliza una lista blanca estricta de archivos permitidos, impidiendo la navegacion arbitraria por el sistema de archivos del servidor.
- **Confirmacion de Acciones Destructivas**: El `SQL Viewer` incluye disparadores de JavaScript para confirmar operaciones de escritura (`DELETE`, `DROP`, `ALTER`).

---

## 📈 Estandares de Codigo

- **PSR-12**: Guia de estilo de codificacion PHP.
- **CamelCase**: Nomenclatura para funciones y variables en JavaScript.
- **Kebab-Case**: Nomenclatura para archivos y clases CSS.
- **PascalCase**: Nomenclatura para nombres de aplicaciones en `apps/` (ej: `AwsGenerator`, `SqlViewer`).
- **Calidad Automatizada**: Cada cambio es validado por un pipeline de CI que detecta cambios selectivos por ruta.
- **Seguridad Docker**: Imagenes escaneadas con **Trivy** y generacion de **SBOM**.

## 🛠️ Mantenimiento y Extensiones

Para anadir un nuevo microsistema de forma profesional, utiliza el **Skill de Integracion**:

```bash
# Leer el playbook completo de 6 pasos:
cat skills/integrar-microsistema/skill.md
```

Flujo resumido (ver skill para detalle):

1. **Preflight**: Verificar estructura del repo.
2. **Carpeta**: Crear `apps/<NombreApp>/` con `app.manifest.yml`.
3. **Dashboard**: Insertar tarjeta en `index.php` usando la plantilla.
4. **Docs**: Actualizar README, docs/\*, docs/wiki/\* segun existan.
5. **Chequeos**: `make hub-list`, `make catalog`, `make validate`, `make test`.
6. **Evidencia**: Reportar archivos modificados y outputs de checks.

Plantillas disponibles en `skills/integrar-microsistema/templates/`.

---

## 🔐 Seguridad CI/CD

- **Scanner de Vulnerabilidades Trivy**: Instalado directamente via `apt-get` desde el repositorio oficial de Aqua Security (`aquasecurity.github.io/trivy-repo`), saltando el `trivy-action` que presentaba fallos de descarga de binario en runners Ubuntu. El resultado SARIF se sube al Security Tab de GitHub.
- **Secret Scanning (TruffleHog)**: Detecta credenciales expuestas en cada push (`.github/workflows/secret-scanning.yml`).
- **Image SBOM**: Se genera el Software Bill of Materials de la imagen Docker tras cada build exitoso.
