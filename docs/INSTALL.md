# Guía de Instalación y Despliegue

Este documento detalla los pasos para instalar y ejecutar la suite **Microsistemas** en diferentes entornos.

---

## Requisitos Previos

- **Navegador Web Moderno**: Chrome, Firefox, Edge o Safari.
- **Entorno de Ejecución**:
  - **Opción A (Moderna)**: Docker Desktop.
  - **Opción B (Clásica)**: Servidor Web (Apache/Nginx) con PHP 8.x instalado (ej: XAMPP, WAMP, MAMP).

- **Herramientas de Consola (Opcional - Hub CLI)**:

  - **Bash o PowerShell**: Requerido para ejecutar el Hub CLI (`hub.sh` o `hub.ps1`).
  - **Make (opcional)**: Para usar los comandos abreviados del Makefile.

---

## 🐳 Opción 1: Docker (Recomendada)

La forma más rápida y limpia de ejecutar el sistema sin instalar dependencias en su máquina.

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

5. **Verificar Salud** (Opcional):

   ```bash
   # Verificar diagnóstico del sistema
   make hub-doctor
   
   # O directamente con PowerShell
   powershell -ExecutionPolicy Bypass -File hub.ps1 doctor
   ```

### Gestión

- **Detener servidor**: `docker-compose down`
- **Ver logs**: `docker-compose logs -f`

---

## 🐘 Opción 2: Windows con XAMPP

Para usuarios que prefieren un entorno local tradicional.

### Pasos

1. **Instalar XAMPP**: Descargue desde [apachefriends.org](https://www.apachefriends.org/es/index.html).
2. **Ubicar Archivos**:

- Vaya a la carpeta de instalación (usualmente `C:\xampp`).
- Entre en la carpeta `htdocs`.
- Cree una carpeta llamada `microsistemas`.
- Copie todo el contenido de este repositorio dentro de `C:\xampp\htdocs\microsistemas`.

1. **Iniciar Servicios**:

   - Abra el **XAMPP Control Panel**.
   - Inicie **Apache** (Start).
   - Inicie **MySQL** (Start) *solo si usará el SQL Viewer*.

1. **Acceder**: Abra su navegador en [http://localhost/microsistemas](http://localhost/microsistemas).

---

## 🐧 Opción 3: Linux (Ubuntu/Debian)

### Pasos

1. **Instalar Apache y PHP**:

```bash
sudo apt update
sudo apt install apache2 php libapache2-mod-php php-mysql
```

1. **Clonar Repositorio**:

   ```bash
   cd /var/www/html
   sudo git clone https://github.com/tu-usuario/microsistemas.git
   ```

1. **Permisos**:

   Asegúrese de que Apache pueda leer los archivos.

   ```bash
   sudo chown -R www-data:www-data /var/www/html/microsistemas
   ```

1. **Acceder**: [http://localhost/microsistemas](http://localhost/microsistemas).

---

## ⚠️ Solución de Problemas Comunes

### Error: "No se encuentra `cases.json`" en Git Trainer

- **Causa**: Está intentando abrir el archivo `.html` directamente con doble clic (`file://`).
- **Solución**: Debe acceder siempre a través de `http://localhost/...`. Los navegadores bloquean la carga de archivos JSON locales por seguridad (CORS).

### Error: "500 Internal Server Error" en Docker

- **Causa**: El archivo `.env` no existe o tiene permisos incorrectos.
- **Solución**: Ejecute `cp .env.example .env` y asegúrese de que el archivo es legible por el contenedor.

### Error: Credenciales de Base de Datos

- Las herramientas están configuradas por defecto para usar los valores del archivo `.env`.
- Si usas Docker, el host **DEBE** ser `db`, no `localhost`.

---

## 💡 Tips de Rendimiento y Producción

1. **Optimización de Composer**: En tu servidor final, ejecuta `composer install --no-dev --optimize-autoloader` para una carga de clases ultra-rápida.
2. **Caché de Apache**: Habilita `mod_expires` en Apache para que los archivos estáticos de herramientas como *Git Trainer* se carguen instantáneamente desde la caché del navegador.
3. **Seguridad**: Si despliegas en un servidor público, utiliza un archivo `.htpasswd` para proteger el acceso a la carpeta `microsistemas`.

---

## Preguntas Frecuentes (FAQ)

**¿Puedo añadir mis propios archivos de log al Log Viewer?**
Sí, edita el array `$logFiles` en `apps/LogViewer/index.php` o utiliza una variable de entorno `LOG_PATH_[NOMBRE]`.

**¿El SQL Viewer es seguro para PHPMyAdmin?**
Es una alternativa ligera. Para gestión masiva, PHPMyAdmin es superior. Para consultas rápidas de depuración, SQL Viewer es más ágil.
