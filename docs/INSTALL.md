# Guia de instalacion y uso

Microsistemas se ejecuta con Docker o con el binario oficial de PHP. XAMPP se
retiro como dependencia soportada para impedir que un paquete desactualizado
mantenga activo un PHP afectado por CVE criticos.

## Versiones PHP admitidas

Use una de estas ramas con, al menos, la version indicada:

| Rama | Version minima segura |
|---|---:|
| PHP 8.2 | 8.2.35 |
| PHP 8.3 | 8.3.36 |
| PHP 8.4 | 8.4.27 |
| PHP 8.5 | 8.5.12 |

El comando `scripts/check_php_runtime.php` impide iniciar el servidor local con
una version anterior. Consulte el detalle en [PHP_SECURITY_2026-10.md](PHP_SECURITY_2026-10.md).

## Opcion 1: Docker (recomendada)

Requiere Docker Desktop o Docker Engine con Compose.

```powershell
git clone https://github.com/vladimiracunadev-create/microsistemas.git
cd microsistemas
Copy-Item .env.example .env
docker compose up -d --build
```

En Linux o macOS, sustituya `Copy-Item` por `cp`. Abra
[http://localhost:8080](http://localhost:8080). Para detener el entorno:

```bash
docker compose down
```

## Opcion 2: PHP CLI oficial (desarrollo local)

Este modo conserva las rutas y microaplicaciones PHP sin Apache. Es para
desarrollo y pruebas locales; el servidor integrado de PHP no debe exponerse a
Internet.

### Windows

1. Descargue un paquete PHP soportado desde
   [windows.php.net](https://windows.php.net/download/). Agregue su directorio a
   `PATH` y compruebe que `php --version` cumple la tabla anterior.
2. Instale Composer desde [getcomposer.org](https://getcomposer.org/download/).
3. Desde la raiz del repositorio, ejecute:

   ```powershell
   Copy-Item .env.example .env
   composer install
   .\hub.ps1 doctor
   .\hub.ps1 serve
   ```

4. Abra [http://127.0.0.1:8000](http://127.0.0.1:8000).

### Linux o macOS

Instale desde un repositorio que entregue una version admitida de PHP y las
extensiones `pdo`, `pdo_mysql`, `json` y `mbstring` cuando correspondan. Luego:

```bash
cp .env.example .env
composer install
bash hub.sh doctor
bash hub.sh serve
```

Abra [http://127.0.0.1:8000](http://127.0.0.1:8000). `make serve` es un atajo
equivalente.

El servidor escucha solo en loopback y arranca con
`session.upload_progress.enabled=0`. En este modo `.htaccess` no se procesa;
para produccion use la imagen Docker o configure Apache/Nginx con reglas
equivalentes.

## Migracion desde XAMPP sin romper la instalacion

El repositorio no desinstala XAMPP ni borra bases de datos. Migre primero y
retire el paquete anterior solo despues de validar:

1. Copie fuera del directorio del paquete cualquier `.env`, log o archivo local
   que no este versionado.
2. Si usaba MySQL/MariaDB, exporte cada base con `mysqldump` y conserve usuarios,
   permisos y puertos. Docker puede importar ese respaldo; PHP CLI tambien puede
   conectarse al servicio de base de datos que decida mantener.
3. Anote las extensiones habilitadas en el `php.ini` anterior. Active sus
   equivalentes en el PHP nuevo, en especial `pdo_mysql` para SQL Viewer.
4. Clone o mueva el repositorio a una ruta normal, por ejemplo
   `C:\dev\microsistemas`; ya no necesita una carpeta publica especial.
5. Ejecute `composer install`, `hub.ps1 doctor` y `hub.ps1 serve`. La URL cambia
   de una subruta del servidor anterior a `http://127.0.0.1:8000/`, pero las
   rutas internas `apps/...` se conservan.
6. Compruebe las aplicaciones y la conexion de base de datos. Solo entonces
   desinstale manualmente el paquete anterior si ya no aloja otros proyectos.

La decision y sus consecuencias estan registradas en
[ADR-0002](adr/0002-retirar-xampp.md).

## Servidor administrado de produccion

Puede publicar la raiz del repositorio con Apache o Nginx y PHP-FPM, siempre que
el PHP cumpla la version minima. Restrinja el acceso a herramientas operativas,
traslade las reglas de `.htaccess` si usa Nginx y ejecute:

```bash
composer install --no-dev --optimize-autoloader
php scripts/check_php_runtime.php
```

## Solucion de problemas

- Si una aplicacion que usa `fetch()` falla desde `file://`, inicie `hub serve`
  y acceda por HTTP.
- Si el verificador rechaza PHP, no lo omita: actualice el binario o use Docker.
- Si SQL Viewer informa que falta el controlador, revise `php --ini` y habilite
  `pdo_mysql` en el archivo cargado.
- En Docker, el host de base de datos es `db`; fuera de Docker normalmente sera
  `127.0.0.1` o el host configurado por usted.
