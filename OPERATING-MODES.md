# Modos de Operacion (OPERATING MODES)

El ecosistema **Microsistemas** ha sido disenado con pragmatismo para poder ejecutarse bajo distintas aproximaciones segun la meta del desarrollador, operador o revisor. En este documento sintetizamos que modos existen, cuando utilizar cada uno, y su respectivo nivel de fidelidad en comparacion a produccion.

## 1. Modo Estandar Containerizado (Docker & Docker Compose)

**Este es el modo oficial y recomendado para la evaluacion del proyecto o despliegue en un VPS.**

- **El Como:** Funciona a traves de los archivos `Dockerfile` y `docker-compose.yml`. Se ejecuta de forma abstracta usando el binario Make (`make up`) o directamente con `docker-compose up -d`.
- **URL de acceso:** `http://localhost:8080` (Apache corre en puerto interno 8080,
  mapeado a loopback del host. Solo accesible desde la misma maquina.)
- **Seguridad aplicada en este modo:**
  - Apache corre como usuario `www-data` (no-root) en puerto no privilegiado.
  - HTTP security headers activos via `.htaccess` (`mod_headers`).
  - Puertos vinculados a `127.0.0.1` — no accesibles desde la red local.
  - SqlViewer en modo solo lectura, con CSRF, rate limiting y whitelist de hosts.
- **Ventajas:**
  - Infraestructura inmutable. Garantiza las versiones de PHP y base de datos.
  - El enrutamiento local y los healthchecks vienen auto-configurados.
  - Sin friccion en la instalacion: mismo contexto en Windows, Mac y Linux.
- **Limites:** Requiere Docker instalado. Consumo de recursos ligeramente mayor.

## 2. Modo Desarrollo Veloz (PHP Built-in Web Server)

**Ideal para desarrolladores haciendo cambios incrementales en el frontend o analizando el core.**

- **El Como:** Invoca el servidor web interno de PHP mediante `make serve`. (Requiere tener PHP instalado de manera nativa en tu ordenador).
- **Ventajas:**
  - Levanta instantaneamente en `http://localhost:8000`.
  - Perfecto si no deseas consumir recursos con Docker u otras VM locales.
- **Limites:**
  - No incorpora o expone una base de datos local asociada de forma predeterminada (las aplicaciones del repositorio que persisten informacion o conectan a SQL (ej: SqlViewer) mostraran fallos de conexion salvo se apunte el `.env` a un MySQL accesible de manera externa o paralela).

## 3. Modo Legacy / Hibrido (XAMPP, WAMP, LAMP)

**Ideal para flujos de despliegue sobre sistemas compartidos de hace 10 anos, demostrando resiliencia y fuerte compatibilidad hacia atras.**

- **El Como:** Se clona el contenido del repositorio directamente en el sub-directorio publico por defecto (ej. `C:\xampp\htdocs\microsistemas\`).
- **URL de acceso:** `http://localhost/microsistemas/` (Apache en puerto 80, el
  predeterminado de XAMPP. Diferente al modo Docker que usa el 8080.)
- **Seguridad en este modo:**
  - Los HTTP security headers del `.htaccess` funcionan igual (Apache lee `.htaccess` por defecto en XAMPP).
  - SqlViewer con CSRF, rate limiting y whitelist activos.
  - Los puertos NO estan restringidos a loopback como en Docker — todo el trafico de XAMPP es local por configuracion del sistema operativo.
- **Ventajas:**
  - Sin necesidad de Docker. Levanta en segundos con XAMPP ya instalado.
  - Acceso en `http://localhost/microsistemas/` sin configuracion adicional.
- **Limites:**
  - Podrian surgir problemas de resolucion de rutas si el sistema no tiene VirtualHost configurado. El Core esta codificado para adaptarse a subdirectorios.

## 4. Modo Desacoplado por Aplicacion Individual (Hub Local)

**Cuando solo precisas una pieza de toda la maquinaria.**

- **El Como:** En ocasiones es innecesario levantar el "Dashboard Web", en su lugar se usa la interfaz CLI (Hub). Se accesa o se prueba la microaplicacion sola (ej: `make hub-run APP=YmlGenerator`).
- **Ventajas:** Aisla el diagnostico tecnico por completo, evaluando scripts puntuales sin ruido web.
