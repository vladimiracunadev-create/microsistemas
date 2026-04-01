# Seguridad (SECURITY)

Este repositorio contiene microsistemas orientados a productividad y soporte tecnico.  
Algunos de ellos (por diseno) trabajan con **archivos locales**, **logs** y/o **consultas a base de datos**, por lo que deben usarse con criterios de seguridad.

## Versiones soportadas

Este repositorio se mantiene como laboratorio/portafolio.  
Se recomienda usar siempre la version mas reciente disponible en la rama principal.

## Reporte responsable de vulnerabilidades

Si encuentras una vulnerabilidad, por favor **no la publiques como issue**.

- Describe el problema con pasos para reproducir.
- Indica el microsistema afectado y el archivo.
- Adjunta evidencia minima (capturas, logs) sin exponer datos sensibles.

**Canal sugerido:** crear un issue marcado como “security” **sin datos sensibles** y solicitar contacto privado, o comunicarlo por el canal directo que definas en tu perfil.

## Guia de uso seguro (recomendaciones)

### 1) No exponer estos microsistemas a Internet

Estos microsistemas estan pensados para uso local (XAMPP/MAMP/LAMP) o redes controladas.

✅ Recomendado: `http://localhost/...`
❌ Evitar: servidor publico accesible desde Internet.

### 2) Principio de “minimo privilegio”

- Si un microsistema requiere credenciales de BD, usar un usuario con permisos minimos (idealmente solo `SELECT`).
- Evitar credenciales de produccion.

### 3) Microsistema 2 (PhpMyAdmin Acotado)

- Mantener `SELECT` como modo por defecto.
- Si se habilitan `INSERT/UPDATE/DELETE`, hacerlo solo con confirmaciones explicitas y en entornos controlados.

### 4) Microsistema 3 (Visor de Logs y Configuracion)

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

- **Imagenes Especificas**: No se usan tags `latest`, se fijan versiones estables.
- **No-Root**: Los procesos principales corren bajo usuarios con privilegios limitados (`www-data`).
- **Healthchecks**: Monitoreo nativo del estado de salud de los servicios.
- **Capas Minimas**: Limpieza de cache de apt y archivos temporales.

### 🛡️ Kubernetes (K8s)

- **SecurityContext**: Se obliga a la ejecucion como no-root y se deshabilitan escaladas de privilegios.
- **Resource Limits**: Configuracion de cuotas de CPU y Memoria para evitar DoS por agotamiento de recursos.
- **NetworkPolicies**: Aislamiento de red para trafico este-oeste (demo).

### 🛡️ HUB CLI & Aplicaciones

- **Input Sanitization**: Validacion estricta de IDs de aplicacion.
- **Path Traversal Prevention**: Validacion de rutas usando `abspath` para asegurar el scope en `apps/`.

### 🛡️ Servidor MCP (IA Context Layer)

- **Solo Lectura V1**: El servidor expone explicitamente herramientas que imitan un "Sidecar" pasivo (`read_doc`, `read_manifest`, `run_hub_list`). Todo esta restringido por diseno para evitar "Prompt Injections" sobre comandos destructables.
- **Prevencion de Path Traversal**: La lectura de documentos/skills se restringe via Whitelists estrictas (ej. arreglo de nombres permitidos en configuracion). Se prohibe explicitamente la lectura de archivos confidenciales ocultos, credenciales, la DB local o tokens.
- **Sanitizacion Nativa**: Los sub-comandos ejecutados (hub doctor o listeo) estan harcodeados y no aceptan secuencias de terminal arbitrarias provenientes de un LLM.

### 🛡️ CI/CD & Automatizacion

- **CicdLibrary**: Los patrones generados siguen el estandar de "minimo privilegio" (ej: uso de OIDC o llaves SSH acotadas).
- **Hardened Templates**: Las plantillas de GitHub/GitLab incluyen pasos de validacion de seguridad por defecto.

### 🛡️ Desarrollo & CI/CD

- **Secret Scanning**: Integracion de TruffleHog y pre-commit (detect-secrets).
- **Dependency Scanning (Dependabot)**: Flujo autonomo de CI configurado en `.github/dependabot.yml` para auditar paquetes de Composer, contenedores Docker y flujos de GitHub Actions. Ante vulnerabilidades (CVEs), el bot crea silenciosamente ramas `dependabot/*` y propone Pull Requests aislados que no rompen `main` hasta que los Tests (Status Checks) validen su idoneidad, garantizando una postura de seguridad proactiva.
