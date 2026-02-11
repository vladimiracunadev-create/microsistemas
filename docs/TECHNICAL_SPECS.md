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
- **Calidad Automatizada**: Cada cambio es validado por un pipeline de CI que detecta cambios selectivos por ruta.
- **Seguridad Docker**: Imágenes escaneadas con **Trivy** y generación de **SBOM**.

## 🛠️ Mantenimiento y Extensiones

Para añadir un nuevo microsistema de forma profesional:

1. **Carpeta**: Crear carpeta en `apps/MiNuevaApp`.
2. **Manifiesto**: Crear `app.manifest.yml` con el nombre, tipo y **descripción**.
3. **Catálogo**: Ejecutar `make catalog` para actualizar el README.
4. **Validación**: Ejecutar `make validate` localmente antes de enviar el PR.
