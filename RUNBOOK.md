# RUNBOOK - Operaciones y Mantenimiento

Este documento detalla los procedimientos operativos estandar para administrar, desplegar y solucionar problemas del ecosistema **Microsistemas**. Esta dirigido a operadores, mantenedores y evaluadores tecnicos que necesiten levantar o limpiar el sistema de forma confiable.

> **Importante:** Este sistema esta disenado como un laboratorio tecnico, showcase y suite de productividad. Las operaciones procuran ser automatizadas, pero requieren supervision si se conectan credenciales cloud reales a los generadores de la suite.

---

## <� 1. Requisitos Previos Generales

Asegurate de tener instalado:

- **Git** (para control de versiones y actualizaciones).
- **Make** (para uso de comandos simplificados).
- Opcionalmente, dependiendo del Modo de Operacion (`OPERATING-MODES.md`):
  - **Docker Desktop / Docker Engine + Compose** (Recomendado).
  - **PHP 8.1+** y **XAMPP/LAMP** (Para ejecucion nativa legacy).

---

## =� 2. Procedimientos de Arranque

### Arranque Rapido (Local Testing - Docker)

El metodo mas fiable que garantiza un entorno inmutable.

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

> **Verificacion Post-Arranque:** Accede a `http://localhost:8080/`. Debes ver el Dashboard principal cargado.

### Arranque Nativo (Servidor PHP Embebido)

Util para desarrollo rapido sin dependencias pesadas.

```bash
# Instalar dependencias
composer install

# Iniciar servidor local
make serve
# Estara disponible en http://localhost:8000
```

---

## =� 3. Operaciones Frecuentes

### Parar y Destruir Contenedores

Si necesitas bajar el sistema liberando recursos:

```bash
make down
# o: docker-compose down
```

### Limpieza Fuerte (Prune)

Si hay cambios grandes en Dockerfiles o corrupcion en la base de datos (elimina volumenes locales):

```bash
docker-compose down -v --rmi local
docker system prune -f
make up
```

### Gestion de Micro-Aplicaciones mediante el Hub CLI

El repositorio cuenta con una capa de orquestacion local:

```bash
# Listar todas las apps disponibles
make hub-list

# Diagnosticar puertos y contenedores de una app especifica (ej: CapacitySim)
make hub-doctor APP=CapacitySim

# Levantar una aplicacion en modo aislado con su propio compose (si aplica)
make hub-up APP=CapacitySim
```

### Inicializacion del Servidor MCP Local (Para IA)

Si deseas conectar el proyecto a clientes de IA como **Claude Desktop**, inicia el entorno pasivo "Sidecar":

```bash
# Iniciar el servidor MCP nativo expuesto por Standard IO
python -m mcp.server
```

### Mantenimiento de Dependencias (Dependabot PRs)

El mantenimiento preventivo de terceros es automatizado mediante Pull Requests de **Dependabot** (`.github/dependabot.yml`). El flujo operativo exigido para fusionarlos es:

1. **Alerta**: Dependabot levanta un PR con la actualizacion de un paquete en Composer, Docker o Actions.
2. **Status Checks**: El ingeniero debe visualizar que el Pipeline de GitHub Actions (Linting, Build, Seguridad) se encuentre en **Verde**. Si esta rojo, el PR se descarta o reconfigura porque introdujo un Breaking Change.
3. **Merge**: Solo una vez validados los checks, el mantenedor aprueba y fusiona el PR.

---

## >z 4. Monitorizacion y Diagnostico

### Revision de Logs

Al ser una plataforma contenida, la forma principal de diagnostico es la lectura de logs de los contenedores Docker:

```bash
# Logs continuos del servidor web/PHP
docker-compose logs -f web

# Logs de la base de datos local
docker-compose logs -f db
```

*Adicionalmente,* el ecosistema incluye la propia micro-app **`LogViewer`** para inspeccion visual de errores a traves de la interfaz web, asumiendo que el core pudo inicializar.

### Healthcheck

El contenedor web ya tiene un healthcheck interno hacia `/apps/CapacitySim/health/` (ref: `docker-compose.yml`). Para validar desde fuera:

```bash
docker ps
# Verificar que el estado del contenedor `microsistemas-web` indique (healthy).
```

---

## � 5. Fallas Frecuentes y Resoluciones

| Sintoma | Posible Causa | Solucion |
| :--- | :--- | :--- |
| **Error 500 al acceder a una micro-app** | Falta `vendor/` o dependencias rotas | Ejecutar localmente `make install` o dentro del contenedor `docker-compose exec web composer install`. |
| **Puerto 8080 en uso** | Otro servicio (ej. Jenkins o Tomcat) ocupa el puerto | Modificar la seccion `ports:` en `docker-compose.yml`, cambiando `"8080:80"` a `"8081:80"`. |
| **Base de datos rechaza conexion** | `DB_PASS` o `DB_USER` mal configurados en `.env` | Revisar `.env`, coincidir contrasenas y asegurarse de que el volumen MySQL no persistio una contrasena antigua (solucion: limpiar volumen base de datos). |
| **Cambios en codigo PHP o JS no se reflejan** | Cache del navegador o XDebug bloqueando | Usar Soft-Reload y verificar si los volumenes estan correctamente montados como `.:/var/www/html` en Compose. |

---

## � 6. Limitaciones Conocidas

- **Alta Disponibilidad:** Aunque se proveen manifiestos `k8s/`, el `docker-compose.yml` base no levanta replicas del servicio web automaticamente.
- **Persistencia Aislada:** Los estados de las herramientas (como simulaciones PDF o configuraciones del AWS Generator) no se persisten de manera remota compartida si se destruyen los contenedores base, salvo que se mapeen volumenes especificos.
