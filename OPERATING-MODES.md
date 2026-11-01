# Modos de operacion

Microsistemas ofrece dos modos soportados y una opcion de servidor administrado.
Todos deben usar PHP `8.2.35+`, `8.3.36+`, `8.4.27+` o `8.5.12+`.

## 1. Docker (recomendado)

Es el modo con mayor fidelidad y el recomendado para evaluacion y despliegue.

- Inicio: `docker compose up -d --build` o `make up`.
- URL: `http://localhost:8080`.
- Incluye PHP fijado, Apache, reglas `.htaccess`, healthcheck y una base de datos
  local opcional.
- Los puertos publicados se vinculan a loopback.

## 2. PHP CLI (desarrollo local)

Es el reemplazo ligero para las pruebas locales.

- Inicio Windows: `.\hub.ps1 serve`.
- Inicio Linux/macOS: `bash hub.sh serve` o `make serve`.
- URL: `http://127.0.0.1:8000`.
- Antes de iniciar, el Hub ejecuta `scripts/check_php_runtime.php` y rechaza una
  rama desconocida o una version inferior al parche seguro.
- El servidor escucha solo en loopback y deshabilita
  `session.upload_progress.enabled` como defensa adicional.

El servidor integrado de PHP es de desarrollo: no procesa `.htaccess`, no crea
una base de datos y no debe exponerse a Internet. SQL Viewer funciona si el
`.env` apunta a un MySQL/MariaDB accesible y `pdo_mysql` esta habilitado.

## 3. Apache/Nginx administrado (produccion)

Un operador puede publicar el repositorio con Apache + mod_php/PHP-FPM o Nginx +
PHP-FPM. Debe ejecutar el verificador de runtime, restringir herramientas
operativas, configurar TLS y traducir las reglas de `.htaccess` cuando use Nginx.

## Aplicacion individual

El Hub permite diagnosticar una sola microaplicacion con
`hub.ps1 run <App>` o `bash hub.sh run <App>`. Los manifiestos PHP usan el mismo
servidor CLI seguro en `127.0.0.1:8000`.

## Retiro de XAMPP

XAMPP ya no es un runtime soportado ni requerido. La funcionalidad se conserva
mediante Docker y PHP CLI, sin atar el repositorio al ciclo de actualizacion de
un paquete de terceros. La migracion de configuracion y bases de datos se detalla
en [`docs/INSTALL.md`](docs/INSTALL.md) y la decision en
[`ADR-0002`](docs/adr/0002-retirar-xampp.md).
