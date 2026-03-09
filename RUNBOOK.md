# RUNBOOK - Operaciones y Mantenimiento

Este documento detalla los procedimientos operativos estándar para administrar, desplegar y solucionar problemas del ecosistema **Microsistemas**. Está dirigido a operadores, mantenedores y evaluadores técnicos que necesiten levantar o limpiar el sistema de forma confiable.

> **Importante:** Este sistema está diseñado como un laboratorio técnico, showcase y suite de productividad. Las operaciones procuran ser automatizadas, pero requieren supervisión si se conectan credenciales cloud reales a los generadores de la suite.

---

## 🏗️ 1. Requisitos Previos Generales

Asegúrate de tener instalado:

- **Git** (para control de versiones y actualizaciones).
- **Make** (para uso de comandos simplificados).
- Opcionalmente, dependiendo del Modo de Operación (`OPERATING-MODES.md`):
  - **Docker Desktop / Docker Engine + Compose** (Recomendado).
  - **PHP 8.1+** y **XAMPP/LAMP** (Para ejecución nativa legacy).

---

## 🚀 2. Procedimientos de Arranque

### Arranque Rápido (Local Testing - Docker)

El método más fiable que garantiza un entorno inmutable.

```bash
# 1. Clonar el repositorio y entrar
git clone https://github.com/vladimiracunadev-create/microsistemas.git
cd microsistemas

# 2. Configurar el entorno
cp .env.example .env

# 3. Levantar la suite en background
make up
# o directamente: docker-compose up -d

# 4. Verificar el estado
make hub-doctor
```

> **Verificación Post-Arranque:** Accede a `http://localhost:8080/`. Debes ver el Dashboard principal cargado.

### Arranque Nativo (Servidor PHP Embebido)

Útil para desarrollo rápido sin dependencias pesadas.

```bash
# Instalar dependencias
composer install

# Iniciar servidor local
make serve
# Estará disponible en http://localhost:8000
```

---

## 🛠️ 3. Operaciones Frecuentes

### Parar y Destruir Contenedores

Si necesitas bajar el sistema liberando recursos:

```bash
make down
# o: docker-compose down
```

### Limpieza Fuerte (Prune)

Si hay cambios grandes en Dockerfiles o corrupción en la base de datos (elimina volúmenes locales):

```bash
docker-compose down -v --rmi local
docker system prune -f
make up
```

### Gestión de Micro-Aplicaciones mediante el Hub CLI

El repositorio cuenta con una capa de orquestación local:

```bash
# Listar todas las apps disponibles
make hub-list

# Diagnosticar puertos y contenedores de una app específica (ej: CapacitySim)
make hub-doctor APP=CapacitySim

# Levantar una aplicación en modo aislado con su propio compose (si aplica)
make hub-up APP=CapacitySim
```

---

## 🩺 4. Monitorización y Diagnóstico

### Revisión de Logs

Al ser una plataforma contenida, la forma principal de diagnóstico es la lectura de logs de los contenedores Docker:

```bash
# Logs continuos del servidor web/PHP
docker-compose logs -f web

# Logs de la base de datos local
docker-compose logs -f db
```

*Adicionalmente,* el ecosistema incluye la propia micro-app **`LogViewer`** para inspección visual de errores a través de la interfaz web, asumiendo que el core pudo inicializar.

### Healthcheck

El contenedor web ya tiene un healthcheck interno hacia `/apps/CapacitySim/health/` (ref: `docker-compose.yml`). Para validar desde fuera:

```bash
docker ps
# Verificar que el estado del contenedor `microsistemas-web` indique (healthy).
```

---

## ⚠️ 5. Fallas Frecuentes y Resoluciones

| Síntoma | Posible Causa | Solución |
| :--- | :--- | :--- |
| **Error 500 al acceder a una micro-app** | Falta `vendor/` o dependencias rotas | Ejecutar localmente `make install` o dentro del contenedor `docker-compose exec web composer install`. |
| **Puerto 8080 en uso** | Otro servicio (ej. Jenkins o Tomcat) ocupa el puerto | Modificar la sección `ports:` en `docker-compose.yml`, cambiando `"8080:80"` a `"8081:80"`. |
| **Base de datos rechaza conexión** | `DB_PASS` o `DB_USER` mal configurados en `.env` | Revisar `.env`, coincidir contraseñas y asegurarse de que el volumen MySQL no persistió una contraseña antigua (solución: limpiar volumen base de datos). |
| **Cambios en código PHP o JS no se reflejan** | Caché del navegador o XDebug bloqueando | Usar Soft-Reload y verificar si los volúmenes están correctamente montados como `.:/var/www/html` en Compose. |

---

## ⛔ 6. Limitaciones Conocidas

- **Alta Disponibilidad:** Aunque se proveen manifiestos `k8s/`, el `docker-compose.yml` base no levanta réplicas del servicio web automáticamente.
- **Persistencia Aislada:** Los estados de las herramientas (como simulaciones PDF o configuraciones del AWS Generator) no se persisten de manera remota compartida si se destruyen los contenedores base, salvo que se mapeen volúmenes específicos.
