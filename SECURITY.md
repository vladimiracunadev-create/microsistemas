# Seguridad (SECURITY)

Este repositorio contiene microsistemas orientados a productividad y soporte técnico.  
Algunos de ellos (por diseño) trabajan con **archivos locales**, **logs** y/o **consultas a base de datos**, por lo que deben usarse con criterios de seguridad.

## Versiones soportadas

Este repositorio se mantiene como laboratorio/portafolio.  
Se recomienda usar siempre la versión más reciente disponible en la rama principal.

## Reporte responsable de vulnerabilidades

Si encuentras una vulnerabilidad, por favor **no la publiques como issue**.

- Describe el problema con pasos para reproducir.
- Indica el microsistema afectado y el archivo.
- Adjunta evidencia mínima (capturas, logs) sin exponer datos sensibles.

**Canal sugerido:** crear un issue marcado como “security” **sin datos sensibles** y solicitar contacto privado, o comunicarlo por el canal directo que definas en tu perfil.

## Guía de uso seguro (recomendaciones)

### 1) No exponer estos microsistemas a Internet

Estos microsistemas están pensados para uso local (XAMPP/MAMP/LAMP) o redes controladas.

✅ Recomendado: `http://localhost/...`
❌ Evitar: servidor público accesible desde Internet.

### 2) Principio de “mínimo privilegio”

- Si un microsistema requiere credenciales de BD, usar un usuario con permisos mínimos (idealmente solo `SELECT`).
- Evitar credenciales de producción.

### 3) Microsistema 2 (PhpMyAdmin Acotado)

- Mantener `SELECT` como modo por defecto.
- Si se habilitan `INSERT/UPDATE/DELETE`, hacerlo solo con confirmaciones explícitas y en entornos controlados.

### 4) Microsistema 3 (Visor de Logs y Configuración)

- Debe operar en modo **solo lectura**.
- Usar whitelist de rutas/archivos permitidos.
- Bloquear traversal (`../`) y rutas absolutas fuera del scope permitido.

### 5) Datos sensibles

Nunca guardar:

- Passwords, tokens, keys, secrets en el repositorio.
- Dumps productivos o logs con datos personales.

Usar variables de entorno y archivos fuera del repo si aplica.

## Hardening Aplicado

Este repositorio ha pasado por un proceso de hardening para mitigar riesgos:

### 🛡️ Docker & Contenedores

- **Imágenes Específicas**: No se usan tags `latest`, se fijan versiones estables.
- **No-Root**: Los procesos principales corren bajo usuarios con privilegios limitados (`www-data`).
- **Healthchecks**: Monitoreo nativo del estado de salud de los servicios.
- **Capas Mínimas**: Limpieza de caché de apt y archivos temporales.

### 🛡️ Kubernetes (K8s)

- **SecurityContext**: Se obliga a la ejecución como no-root y se deshabilitan escaladas de privilegios.
- **Resource Limits**: Configuración de cuotas de CPU y Memoria para evitar DoS por agotamiento de recursos.
- **NetworkPolicies**: Aislamiento de red para tráfico este-oeste (demo).

### 🛡️ HUB CLI & Aplicaciones

- **Input Sanitization**: Validación estricta de IDs de aplicación.
- **Path Traversal Prevention**: Validación de rutas usando `abspath` para asegurar el scope en `apps/`.
- **Allowed Commands**: Lista blanca de ejecutables permitidos (`php`, `python`, `node`, etc).

### 🛡️ CI/CD & Automatización
- **CicdLibrary**: Los patrones generados siguen el estándar de "mínimo privilegio" (ej: uso de OIDC o llaves SSH acotadas).
- **Hardened Templates**: Las plantillas de GitHub/GitLab incluyen pasos de validación de seguridad por defecto.

### 🛡️ Desarrollo & CI/CD

- **Secret Scanning**: Integración de TruffleHog y pre-commit (detect-secrets).
- **Dependency Scanning**: Flujo de CI para detección de vulnerabilidades en librerías.
