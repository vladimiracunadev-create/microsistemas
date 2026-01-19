# Instrucciones de Instalación - Microsistemas v1.1.0

## 📦 Contenido del Package

El archivo `microsistemas-v1.1.0.zip` contiene la versión completa de Microsistemas con todas las herramientas y la nueva funcionalidad de **CapacitySim Pro**.

---

## 🚀 Instalación Rápida

### Opción 1: Con XAMPP (Recomendado para desarrollo local)

1. **Descargar el package**:
   ```bash
   # El archivo microsistemas-v1.1.0.zip ya está disponible
   ```

2. **Extraer en htdocs**:
   ```bash
   # Extraer en C:\xampp\htdocs\
   # Resultado: C:\xampp\htdocs\microsistemas-v1.1.0\
   ```

3. **Configurar variables de entorno**:
   ```bash
   cd C:\xampp\htdocs\microsistemas-v1.1.0
   copy .env.example .env
   # Editar .env con tus credenciales de base de datos
   ```

4. **Instalar dependencias PHP**:
   ```bash
   composer install
   ```

5. **Acceder a la aplicación**:
   - Abrir navegador en: `http://localhost/microsistemas-v1.1.0/`
   - Dashboard principal: `http://localhost/microsistemas-v1.1.0/index.php`
   - CapacitySim Pro: `http://localhost/microsistemas-v1.1.0/apps/CapacitySim/`

---

### Opción 2: Con Docker (Producción)

1. **Descargar y extraer**:
   ```bash
   unzip microsistemas-v1.1.0.zip
   cd microsistemas-v1.1.0
   ```

2. **Configurar entorno**:
   ```bash
   cp .env.example .env
   # Editar .env según tu configuración
   ```

3. **Levantar con Docker Compose**:
   ```bash
   docker-compose up -d
   ```

4. **Acceder**:
   - Dashboard: `http://localhost:8080`
   - CapacitySim Pro: `http://localhost:8080/apps/CapacitySim/`

---

## 🔄 Actualización desde v1.0.x

Si ya tienes una versión anterior instalada:

### Método 1: Instalación limpia (Recomendado)

1. **Respaldar configuración actual**:
   ```bash
   copy .env .env.backup
   ```

2. **Extraer nueva versión en directorio diferente**:
   ```bash
   # Extraer microsistemas-v1.1.0.zip en nueva ubicación
   ```

3. **Copiar configuración**:
   ```bash
   copy .env.backup microsistemas-v1.1.0\.env
   ```

4. **Instalar dependencias**:
   ```bash
   cd microsistemas-v1.1.0
   composer install
   ```

### Método 2: Actualización in-place

1. **Respaldar archivos actuales**:
   ```bash
   # Crear backup completo de tu instalación actual
   ```

2. **Extraer sobre instalación existente**:
   ```bash
   # Extraer microsistemas-v1.1.0.zip sobre tu directorio actual
   # ADVERTENCIA: Esto sobrescribirá archivos
   ```

3. **Actualizar dependencias**:
   ```bash
   composer update
   ```

4. **Limpiar caché del navegador**:
   - Presionar `Ctrl+F5` para recargar assets

---

## ✨ Nuevas Características en v1.1.0

Después de la instalación, podrás usar:

### CapacitySim Pro
- **Simulación de Costos**: Selector de proveedor cloud (AWS/GCP/Azure/On-Premise)
- **Modo Comparativo**: Botones "Guardar A/B" y "Cargar A/B"
- **Exportación**: Botones "Exportar JSON" y "Reporte PDF"

Para más detalles, consulta:
- `RELEASE_NOTES_v1.1.0.md` - Notas de release completas
- `apps/CapacitySim/README.md` - Documentación de CapacitySim Pro
- `CHANGELOG.md` - Historial de cambios

---

## 🔧 Requisitos del Sistema

### Mínimos
- **PHP**: >= 8.0
- **Composer**: >= 2.0
- **Servidor Web**: Apache, Nginx, IIS o Caddy
- **Navegador**: Chrome, Firefox, Edge o Safari (últimas 2 versiones)

### Recomendados
- **PHP**: 8.1 o superior
- **Memoria**: 512MB RAM mínimo
- **Disco**: 100MB espacio libre

### Para Docker
- **Docker**: >= 20.10
- **Docker Compose**: >= 1.29

---

## 🛠️ Verificación de Instalación

1. **Verificar PHP**:
   ```bash
   php -v
   # Debe mostrar PHP 8.0 o superior
   ```

2. **Verificar Composer**:
   ```bash
   composer --version
   ```

3. **Verificar autoload**:
   ```bash
   composer dump-autoload
   ```

4. **Probar acceso**:
   - Abrir navegador en la URL correspondiente
   - Verificar que el dashboard carga correctamente
   - Abrir CapacitySim y probar las nuevas características

---

## 📚 Documentación Adicional

- **Guía para Principiantes**: `docs/BEGINNERS_GUIDE.md`
- **Manual de Usuario**: `docs/USER_MANUAL.md`
- **Arquitectura**: `docs/ARCHITECTURE.md`
- **Guía de Instalación Detallada**: `docs/INSTALL.md`
- **Seguridad**: `docs/SECURITY.md`

---

## 🐛 Solución de Problemas

### Error: "Class not found"
```bash
composer dump-autoload -o
```

### Error: "Permission denied"
```bash
# En Linux/Mac:
chmod -R 755 .
chmod -R 777 storage/

# En Windows: Verificar permisos de carpeta
```

### CapacitySim no carga assets
```bash
# Limpiar caché del navegador: Ctrl+F5
# Verificar que los archivos existen:
dir apps\CapacitySim\assets\
```

### Problemas con .env
```bash
# Verificar que .env existe y tiene permisos correctos
# Verificar sintaxis del archivo .env
```

---

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/vladimiracunadev-create/microsistemas/issues)
- **Documentación**: Ver carpeta `docs/`
- **Contacto**: [LinkedIn - Vladimir Acuña Valdebenito](https://www.linkedin.com/in/vladimir-acu%C3%B1a-valdebenito-11924a29/)

---

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

**¡Disfruta de Microsistemas v1.1.0!** 🚀
