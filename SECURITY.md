# Seguridad (SECURITY)

Este repositorio contiene microsistemas orientados a productividad y soporte tecnico.
Algunos de ellos (por diseno) trabajan con **archivos locales**, **logs** y/o
**consultas a base de datos**, por lo que deben usarse con criterios de seguridad.

---

## ADVERTENCIA: Solo para uso local

> **Este stack NO esta disenado para exposicion publica a Internet.**
> Usarlo en un servidor accesible desde Internet sin un proxy inverso, HTTPS y
> autenticacion es un riesgo de seguridad real. Ver seccion "Modelo de amenaza".

---

## Modelo de amenaza

### Que esta en scope (lo que este stack protege)

- Acceso no autorizado a la base de datos MySQL desde la red local o Internet.
- Lectura de credenciales a traves del servidor MCP por un asistente de IA.
- Inyeccion de comandos a traves del Hub CLI o el servidor MCP.
- Inclusion de secretos (tokens, passwords) en el historial de git.
- Vulnerabilidades conocidas en dependencias PHP, Docker o GitHub Actions.

### Que esta fuera de scope (lo que este stack NO protege sin configuracion adicional)

- Autenticacion de usuarios (no hay login en el dashboard).
- Cifrado en transito (no hay HTTPS por defecto en modo local).
- Control de acceso por rol (RBAC) — no implementado.
- Proteccion contra ataques desde Internet si los puertos estan expuestos publicamente.
- Aislamiento de datos entre sesiones o usuarios multiples.

### Perfil de uso seguro

```
[Desarrollador local] --> [localhost:8080] --> [Docker web container]
                                                     |
                                              [Docker db container]
                                              127.0.0.1:3306 (solo loopback)
```

El trafico nunca debe cruzar una red publica sin capa de autenticacion y HTTPS.

---

## Como ejecutar de forma local segura

1. **Copia `.env.example` a `.env`** y define `DB_PASS` con un valor propio.
   El contenedor Docker falla de forma explicita si `DB_PASS` no esta definida.

2. **No cambies los puertos** de `127.0.0.1:8080` ni `127.0.0.1:3306`.
   Si necesitas acceso desde otra maquina en tu red local, usa una VPN o
   tunel SSH en lugar de exponer los puertos a `0.0.0.0`.

3. **Usa credenciales de base de datos con permisos minimos.**
   Crea un usuario MySQL con solo `SELECT, INSERT, UPDATE` en vez de `root`.
   Root solo es necesario para el setup inicial.

4. **No expongas el stack a Internet** sin:
   - Proxy inverso (Nginx/Traefik) con HTTPS
   - Autenticacion (Basic Auth, OAuth, Authelia)
   - Firewall que bloquee acceso externo a los puertos 8080 y 3306

5. **Revisa `.gitignore`** antes de hacer commit. El archivo `.env` esta excluido,
   pero archivos como `docker-compose.override.yml` o configs locales tambien
   pueden contener secretos.

---

## Que esta protegido / que no

| Componente | Estado | Detalle |
|---|---|---|
| Puerto MySQL (3306) | Protegido | Bind a `127.0.0.1` — no accesible desde red |
| Puerto Web (8080) | Protegido | Bind a `127.0.0.1` — no accesible desde red |
| Credenciales en git | Protegido | `.env` en `.gitignore` + TruffleHog en CI |
| Secret scanning | Protegido | TruffleHog + pre-commit detect-secrets |
| Dependencias | Protegido | Dependabot + Trivy en CI |
| MCP server | Protegido | Solo lectura, whitelist estricta, sin .env accesible |
| Hub CLI | Protegido | Sanitizacion de input, comandos hardcodeados |
| Path traversal | Protegido | Validacion con `abspath` en MCP y Hub |
| Headers HTTP | Protegido | X-Frame-Options, CSP, nosniff, Referrer-Policy via .htaccess |
| SqlViewer escritura | Protegido | SQLVIEWER_READONLY=true bloquea INSERT/UPDATE/DELETE/DROP |
| Apache no-root | Protegido | Puerto 8080, proceso corre como www-data |
| Autenticacion web | SIN proteccion | No hay login — solo uso local |
| HTTPS | SIN proteccion | No configurado por defecto — solo local |
| RBAC | SIN proteccion | No implementado — herramienta personal/demo |
| Multi-usuario | SIN proteccion | No disenado para multiples usuarios |

---

## Versiones soportadas

Este repositorio se mantiene como laboratorio/portafolio.
Se recomienda usar siempre la version mas reciente disponible en la rama principal.

---

## Reporte responsable de vulnerabilidades

Si encuentras una vulnerabilidad, por favor **no la publiques como issue publico**.

- Describe el problema con pasos para reproducir.
- Indica el microsistema afectado y el archivo.
- Adjunta evidencia minima (capturas, logs) sin exponer datos sensibles.

**Canal sugerido:** crear un issue marcado como "security" **sin datos sensibles**
y solicitar contacto privado, o comunicarlo directamente.

---

## Guia de uso seguro (recomendaciones)

### 1) No exponer estos microsistemas a Internet

Estos microsistemas estan pensados para uso local (XAMPP/MAMP/LAMP) o redes controladas.

- Recomendado: `http://localhost/...`
- Evitar: servidor publico accesible desde Internet sin proxy + auth.

### 2) Principio de minimo privilegio

- Si un microsistema requiere credenciales de BD, usar un usuario con permisos minimos
  (idealmente solo `SELECT` para SqlViewer, `SELECT, INSERT, UPDATE` para otros).
- Evitar credenciales de produccion en entornos de desarrollo.

### 3) SqlViewer y acceso a base de datos

- Mantener `SELECT` como modo por defecto.
- Si se habilitan `INSERT/UPDATE/DELETE`, hacerlo solo con confirmaciones
  explicitas y en entornos controlados.

### 4) LogViewer

- Debe operar en modo **solo lectura**.
- Usar whitelist de rutas/archivos permitidos.
- Bloquear traversal (`../`) y rutas absolutas fuera del scope permitido.

### 5) Datos sensibles

Nunca guardar en el repositorio:

- Passwords, tokens, keys, secrets.
- Dumps productivos o logs con datos personales.

Usar variables de entorno (`.env`) y archivos fuera del repo.

---

## Hardening aplicado

### Docker y contenedores

- **Versiones fijas**: No se usan tags `latest`, se fijan versiones estables.
- **Puertos restringidos**: MySQL y web vinculados a `127.0.0.1` (loopback).
- **Sin fallback de contrasena**: El contenedor falla si `DB_PASS` no esta en `.env`.
- **Healthchecks**: Monitoreo nativo del estado de salud de los servicios.
- **Resource limits**: CPU y memoria acotados para evitar DoS por agotamiento.
- **Capas minimas**: Limpieza de cache de apt y archivos temporales en build.

### Kubernetes (demo)

- **SecurityContext**: Ejecucion como no-root, escalada de privilegios deshabilitada.
- **Resource Limits**: Cuotas de CPU y memoria.
- **NetworkPolicies**: Aislamiento de red para trafico este-oeste.

### Headers HTTP (Fase 2)

- **X-Frame-Options SAMEORIGIN**: Proteccion contra clickjacking.
- **X-Content-Type-Options nosniff**: Evita MIME sniffing.
- **Referrer-Policy**: Solo envia referrer a mismo origen.
- **Permissions-Policy**: Deshabilita geolocation, mic, camara y pagos.
- **Content-Security-Policy**: Restringe carga de recursos a origenes conocidos.

### SqlViewer (Fase 2)

- **Modo solo lectura por defecto**: `SQLVIEWER_READONLY=true` bloquea
  operaciones de escritura (INSERT/UPDATE/DELETE/DROP/ALTER/TRUNCATE).
- **Configurable via `.env`**: Se puede desactivar para uso local controlado.

### Apache (Fase 2)

- **Puerto no privilegiado**: Apache escucha en 8080 dentro del contenedor,
  no requiere root para el binding.
- **Ejecucion como www-data**: `apache2-foreground` corre como usuario no-root.

### Hub CLI y aplicaciones

- **Input sanitization**: Validacion estricta de IDs de aplicacion.
- **Path traversal prevention**: Validacion con `abspath` restringida a `apps/`.

### Servidor MCP (capa de contexto para IA)

- **Solo lectura V1**: Herramientas restringidas por diseno (`read_doc`, `read_manifest`,
  `run_hub_list`). Imposibilita "Prompt Injections" sobre comandos destructivos.
- **Whitelist estricta**: Lectura de documentos restringida a lista fija. El `.env`,
  credenciales y archivos sensibles estan explicitamente excluidos.
- **Sanitizacion nativa**: Sub-comandos hardcodeados, no aceptan secuencias arbitrarias.

### CI/CD y automatizacion

- **Secret scanning**: TruffleHog y pre-commit (detect-secrets).
- **Vulnerability scanning**: Trivy sobre imagenes Docker en cada build.
- **Dependabot**: Actualizaciones automaticas de Composer, Docker y GitHub Actions.
- **SBOM**: Generacion de Software Bill of Materials en cada release.

---

## Fase 2 — Hardening aplicado

Las siguientes mejoras fueron implementadas como segunda iteracion de seguridad:

1. **Usuario MySQL no-root (opcional)**: `docker/init-db.sh` montado en
   `/docker-entrypoint-initdb.d/`. Si se definen `DB_APP_USER` y `DB_APP_PASS`
   en `.env`, crea un usuario con solo `SELECT/INSERT/UPDATE/DELETE`.
   Ver `.env.example` para configuracion.

2. **Apache como no-root en puerto 8080**: Dockerfile cambia `Listen 80` a `Listen 8080`
   y ejecuta `apache2-foreground` como `www-data`. Elimina la necesidad de root
   para el binding de puerto. Mapeo Docker: `127.0.0.1:8080:8080`.

3. **Headers de seguridad HTTP**: `.htaccess` en la raiz del proyecto establece:
   `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
   `Permissions-Policy` y `Content-Security-Policy`.
   Requiere `mod_headers` (habilitado en Dockerfile via `a2enmod headers`).

4. **SqlViewer modo solo lectura**: variable de entorno `SQLVIEWER_READONLY=true`
   (activa por defecto) bloquea `INSERT/UPDATE/DELETE/DROP/ALTER/TRUNCATE/CREATE`.
   La UI muestra el modo activo. Configurable en `.env` y `docker-compose.yml`.

5. **Autenticacion basica opcional**: pendiente de evaluacion para casos donde
   se necesite exponer el stack en red local controlada con `.htpasswd`.

---

## Fase 3 — Hardening aplicado

Las siguientes mejoras fueron implementadas como tercera iteracion de seguridad
en el pipeline CI (`.github/workflows/ci.yml`):

1. **`composer audit` en CI**: Paso agregado al job `lint-php`. Compara
   `composer.lock` contra PHP Security Advisories DB, GitHub Advisory DB y
   FriendsOfPHP DB. Falla el build si detecta CVEs en dependencias de produccion.

2. **Escaneo de cadena de suministro (supply-chain-scan)**: Job dedicado con
   tres controles:
   - **Integridad de `composer.lock`**: Valida que el archivo de bloqueo este
     presente (sin el, las versiones no estan fijadas ni sus hashes verificados).
   - **Trojan Source (CVE-2021-42574)**: Detecta caracteres Unicode
     bidireccionales (LRE, RLE, RLO, LRI, etc.) en archivos `.php`, `.js`,
     `.py`, `.sh` y `.yml`. Estos caracteres invierten el orden visual del texto
     para camuflar codigo malicioso en editores.
   - **Patrones de ofuscacion**: Detecta `eval(base64_decode`, `shell_exec($_`,
     `system($_REQUEST`, `preg_replace/e` y otras tecnicas clasicas de inyeccion
     de codigo PHP oculto.

---

## Fase 3 — Hardening aplicado (aplicacion)

Las siguientes mejoras fueron implementadas en `apps/SqlViewer/index.php`,
`.htaccess`, `.env.example` y `docker-compose.yml`:

5. **CSRF en SqlViewer**: Se agrego `session_start()` y generacion de token con
   `bin2hex(random_bytes(32))`. El token se inserta como campo oculto en el
   formulario POST y se valida con `hash_equals()` antes de ejecutar cualquier
   query. Un token invalido devuelve error sin ejecutar nada.

6. **Rate limiting en SqlViewer**: Contador de queries por sesion almacenado en
   `$_SESSION['rl_count']`. Se reinicia cada 60 segundos. El limite es
   configurable via `SQLVIEWER_RATE_LIMIT` en `.env` (default: 30 queries/min).
   La UI muestra un aviso cuando quedan 5 o menos consultas disponibles.

7. **Whitelist de hosts en SqlViewer**: El parametro `host` se valida contra
   `SQLVIEWER_ALLOWED_HOSTS` en `.env` (default: `localhost,db,127.0.0.1`).
   Si el host solicitado no esta en la lista, se rechaza con mensaje claro y
   se usa el primer host autorizado como fallback seguro.

8. **Autenticacion basica opcional (.htpasswd)**: Bloque comentado agregado en
   `.htaccess` con instrucciones paso a paso para activar `AuthType Basic`.
   El archivo `.htpasswd` debe generarse con `htpasswd` y guardarse **fuera
   del repositorio**. No activo por defecto (solo uso local sin autenticacion).
