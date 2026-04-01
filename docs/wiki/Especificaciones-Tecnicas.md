# Especificaciones Tecnicas - Microsistemas Suite

Este documento detalla la arquitectura, tecnologias y estandares utilizados en el proyecto para asegurar su escalabilidad y mantenibilidad.

## =� Stack Tecnologico

### Backend

- **PHP 8.2+**: Lenguaje principal para el dashboard y utilidades de servidor.
- **MySQL 8.0**: Motor de base de datos para el SQL Viewer (soporta MariaDB).
- **Composer**: Gestion de dependencias y Autoloading (PSR-4 compatible).

### Frontend

- **Vanilla JavaScript (ES6+)**: Logica de cliente sin frameworks pesados para maximizar la velocidad.
- **CSS3 Moderno**: Uso de Variables CSS (Custom Properties), Grid Layout y Flexbox.
- **Inter Font Family**: Tipografia optimizada para lectura de codigo.

---

## =� Diseno y Arquitectura

El sistema sigue una **Arquitectura de Modulos Independientes (Micro-Apps)**.

### Caracteristicas Principales

1. **Aislamiento de Aplicaciones**: Cada carpeta en `apps/` es un ecosistema cerrado. No comparten dependencias criticas, lo que permite actualizar una herramienta sin afectar a las otras.
2. **Configuracion via Entorno**: Implementacion del patron *12-Factor App* mediante el uso de variables de entorno (`.env`).
3. **Portabilidad Docker**: Orquestacion mediante `docker-compose` que garantiza paridad total entre el entorno de desarrollo y produccion.

---

## =� Estandares de Codigo

Para mantener la calidad profesional, el repositorio implementa:

- **PHP PSR-12**: Estandar de estilo de codigo automatizado via `PHP-CS-Fixer`.
- **PascalCase**: Nomenclatura para nombres de aplicaciones en `apps/` (ej: `AwsGenerator`, `SqlViewer`).
- **Static Analysis**: Uso de `PHPStan` (Nivel 5) para prevenir errores de logica antes de ejecucion.
- **Markdown Lint**: Validacion de consistencia en la documentacion.

---

## <� Estandar de Salud y Monitoreo

Para garantizar la **Resiliencia Operativa**, todas las micro-apps deben implementar el siguiente contrato de diagnostico:

### 1. Endpoint de Liveness (`/health`)

- **Proposito**: Confirmar que la aplicacion esta corriendo.
- **Respuesta**: JSON 200 OK.

### 2. Endpoint de Readiness (`/ready`)

- **Proposito**: Confirmar que la aplicacion tiene todo listo para funcionar (DB conectada, etc.).
- **Respuesta**: JSON 200 OK o 503 Service Unavailable.

---

## = Proceso de Mantenimiento

Para anadir un microsistema, usa el **Skill de Integracion**:

```bash
cat skills/integrar-microsistema/skill.md
```

Pasos: Preflight � Carpeta � Dashboard � Docs � Chequeos � Evidencia.
Plantillas disponibles en `skills/integrar-microsistema/templates/`.

---

## = Seguridad CI/CD

- **Trivy**: Instalado via `apt-get` desde repositorio oficial de Aqua Security. Genera reporte SARIF subido al Security Tab de GitHub.
- **TruffleHog**: Detecta credenciales expuestas en cada push.
- **Markdown Lint**: `make lint-md` + pre-push hook en `scripts/hooks/pre-push` evitan errores de formato antes de llegar al CI.
