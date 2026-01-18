# Guía de Instalación y Despliegue

Este documento detalla los pasos para instalar y ejecutar la suite **Microsistemas** en diferentes entornos.

---

## Requisitos Previos

- **Navegador Web Moderno**: Chrome, Firefox, Edge o Safari.
- **Entorno de Ejecución**:
  - **Opción A (Moderna)**: Docker Desktop.
  - **Opción B (Clásica)**: Servidor Web (Apache/Nginx) con PHP 8.x instalado (ej: XAMPP, WAMP, MAMP).

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
   ```
   *El flag `-d` ejecuta el proceso en segundo plano.*

4. **Acceder**: Abra su navegador en [http://localhost:8080](http://localhost:8080).

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
3. **Iniciar Servicios**:
   - Abra el **XAMPP Control Panel**.
   - Inicie **Apache** (Start).
   - Inicie **MySQL** (Start) *solo si usará el SQL Viewer*.
4. **Acceder**: Abra su navegador en [http://localhost/microsistemas](http://localhost/microsistemas).

---

## 🐧 Opción 3: Linux (Ubuntu/Debian)

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
   Asegúrese de que Apache pueda leer los archivos.
   ```bash
   sudo chown -R www-data:www-data /var/www/html/microsistemas
   ```
4. **Acceder**: [http://localhost/microsistemas](http://localhost/microsistemas).

---

## ⚠️ Solución de Problemas Comunes

### Error: "No se encuentra `cases.json`" en Git Trainer
- **Causa**: Está intentando abrir el archivo `.html` directamente con doble clic (`file://`).
- **Solución**: Debe acceder siempre a través de `http://localhost/...`. Los navegadores bloquean la carga de archivos JSON locales por seguridad (CORS).

### Error: Credenciales de Base de Datos
- Las herramientas están configuradas por defecto para usar:
  - Host: `localhost` (o `db` en Docker)
  - User: `root`
  - Pass: `` (vacío) o `root` en Docker
- Si su configuración es diferente, deberá ajustar el archivo de conexión en `apps/SqlViewer/index.php`.

---

## Soporte
Para reportar errores, por favor abra un Issue en el repositorio o contacte al administrador del sistema.
