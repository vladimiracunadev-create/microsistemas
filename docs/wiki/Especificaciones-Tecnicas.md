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

## 📐 Diseño y Arquitectura

El sistema sigue una **Arquitectura de Módulos Independientes (Micro-Apps)**.

### Características Principales

1. **Aislamiento de Aplicaciones**: Cada carpeta en `apps/` es un ecosistema cerrado. No comparten dependencias críticas, lo que permite actualizar una herramienta sin afectar a las otras.
2. **Configuración via Entorno**: Implementación del patrón *12-Factor App* mediante el uso de variables de entorno (`.env`).
3. **Portabilidad Docker**: Orquestación mediante `docker-compose` que garantiza paridad total entre el entorno de desarrollo y producción.

---

## 🛠️ Estándares de Código

Para mantener la calidad profesional, el repositorio implementa:

- **PHP PSR-12**: Estándar de estilo de código automatizado vía `PHP-CS-Fixer`.
- **PascalCase**: Nomenclatura para nombres de aplicaciones en `apps/` (ej: `AwsGenerator`, `SqlViewer`).
- **Static Analysis**: Uso de `PHPStan` (Nivel 5) para prevenir errores de lógica antes de ejecución.
- **Markdown Lint**: Validación de consistencia en la documentación.

---

## 🏥 Estándar de Salud y Monitoreo

Para garantizar la **Resiliencia Operativa**, todas las micro-apps deben implementar el siguiente contrato de diagnóstico:

### 1. Endpoint de Liveness (`/health`)

- **Propósito**: Confirmar que la aplicación está corriendo.
- **Respuesta**: JSON 200 OK.

### 2. Endpoint de Readiness (`/ready`)

- **Propósito**: Confirmar que la aplicación tiene todo listo para funcionar (DB conectada, etc.).
- **Respuesta**: JSON 200 OK o 503 Service Unavailable.

---

## 🔄 Proceso de Mantenimiento

Para añadir un microsistema, usa el **Skill de Integración**:

```bash
cat skills/integrar-microsistema/skill.md
```

Pasos: Preflight → Carpeta → Dashboard → Docs → Chequeos → Evidencia.
Plantillas disponibles en `skills/integrar-microsistema/templates/`.

---

## 🔐 Seguridad CI/CD

- **Trivy**: Instalado vía `apt-get` desde repositorio oficial de Aqua Security. Genera reporte SARIF subido al Security Tab de GitHub.
- **TruffleHog**: Detecta credenciales expuestas en cada push.
- **Markdown Lint**: `make lint-md` + pre-push hook en `scripts/hooks/pre-push` evitan errores de formato antes de llegar al CI.
