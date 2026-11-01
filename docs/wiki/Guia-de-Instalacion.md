# Guia de instalacion y despliegue

La guia vigente esta en [`docs/INSTALL.md`](../INSTALL.md). Los modos soportados
son Docker y PHP CLI oficial para desarrollo local; para produccion se admite un
servidor Apache/Nginx administrado con una version segura de PHP.

XAMPP fue retirado como dependencia soportada. Antes de eliminar una instalacion
existente, exporte bases de datos y copie configuracion/archivos locales siguiendo
la seccion **Migracion desde XAMPP sin romper la instalacion** de la guia canonica.

## Inicio rapido

```powershell
Copy-Item .env.example .env
composer install
.\hub.ps1 doctor
.\hub.ps1 serve
```

Abra `http://127.0.0.1:8000`. En Linux o macOS use `cp`, `bash hub.sh doctor` y
`bash hub.sh serve`. Para Docker use `docker compose up -d --build` y abra
`http://localhost:8080`.

<!-- Contenido historico retirado: la guia canonica mantiene todos los pasos. -->

- **Herramientas de Consola (Opcional - Hub CLI)**:
  - **Bash o PowerShell**: Requerido para ejecutar el Hub CLI (`hub.sh` o `hub.ps1`).
  - **Make (opcional)**: Para usar los comandos abreviados del Makefile.

---

## 🐳 Opcion 1: Docker (Recomendada)

La forma mas rapida y limpia de ejecutar el sistema sin instalar dependencias en su maquina.

### Pasos

1. **Instalar Docker**: Descargue e instale [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. **Abrir Terminal**: Navegue a la carpeta del proyecto.

   ```powershell
   cd camino/a/microsistemas/Microsistemas
   ```

3. **Levantar Entorno**:

   ```bash
   docker-compose up -d
   # O use el atajo: make up
   ```

   *El flag `-d` ejecuta el proceso en segundo plano.*

4. **Acceder**: Abra su navegador en [http://localhost:8080](http://localhost:8080).

---

## ✅ Verificacion de la Instalacion

Una vez instalado, puede verificar la integridad del sistema:

1. **Doctor CLI**:

   ```bash
   make hub-doctor
   ```

2. **Smoke Test**:

   ```bash
   make smoke
   ```

### Gestion

- **Detener servidor**: `docker-compose down`
- **Ver logs**: `docker-compose logs -f`

---

## Opcion 2: Windows con PHP CLI

Para desarrollo local sin Docker.

### Pasos

1. Instale una version PHP admitida desde
   [windows.php.net](https://windows.php.net/download/) y agreguela a `PATH`.
2. Ejecute `composer install` desde la raiz del repositorio.
3. Ejecute `.\hub.ps1 doctor` y `.\hub.ps1 serve`.
4. Acceda a [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## 🐧 Opcion 3: Linux (Ubuntu/Debian)

### Pasos

1. **Instalar Apache y PHP**:

   ```bash
   sudo apt update
   sudo apt install apache2 php libapache2-mod-php php-mysql
   ```

2. **Clonar Repositorio**:

   ```bash
   cd /var/www/html
   sudo git clone https://github.com/tu-usuario/microsistemas.git
   ```

3. **Permisos**:

   Asegurese de que Apache pueda leer los archivos.

   ```bash
   sudo chown -R www-data:www-data /var/www/html/microsistemas
   ```

4. **Acceder**: [http://localhost/microsistemas](http://localhost/microsistemas).

---

## ⚠️ Solucion de Problemas Comunes

### Error: "No se encuentra `cases.json`" en Git Trainer

- **Causa**: Esta intentando abrir el archivo `.html` directamente con doble clic (`file://`).
- **Solucion**: Debe acceder siempre a traves de `http://localhost/...`. Los navegadores bloquean la carga de archivos JSON locales por seguridad (CORS).

### Error: "500 Internal Server Error" en Docker

- **Causa**: El archivo `.env` no existe o tiene permisos incorrectos.
- **Solucion**: Ejecute `cp .env.example .env` y asegurese de que el archivo es legible por el contenedor.

### Error: Credenciales de Base de Datos

- Las herramientas estan configuradas por defecto para usar los valores del archivo `.env`.
- Si usas Docker, el host **DEBE** ser `db`, no `localhost`.

---

## 💡 Tips de Rendimiento y Produccion

1. **Optimizacion de Composer**: En tu servidor final, ejecuta `composer install --no-dev --optimize-autoloader` para una carga de clases ultra-rapida.
2. **Cache de Apache**: Habilita `mod_expires` en Apache para que los archivos estaticos de herramientas como *Git Trainer* se carguen instantaneamente desde la cache del navegador.
3. **Seguridad**: Si despliegas en un servidor publico, utiliza un archivo `.htpasswd` para proteger el acceso a la carpeta `microsistemas`.

---

## Preguntas Frecuentes (FAQ)

**Puedo anadir mis propios archivos de log al Log Viewer?**

Si, edita el array `$logFiles` en `apps/LogViewer/index.php` o utiliza una variable de entorno `LOG_PATH_[NOMBRE]`.

**El SQL Viewer es seguro para PHPMyAdmin?**

Es una alternativa ligera. Para gestion masiva, PHPMyAdmin es superior. Para consultas rapidas de depuracion, SQL Viewer es mas agil.
