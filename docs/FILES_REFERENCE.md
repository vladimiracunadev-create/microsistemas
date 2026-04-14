# 📁 Referencia Completa de Archivos - Microsistemas

Guia detallada de **cada archivo y directorio** del proyecto. Cada entrada incluye su proposito, como funciona internamente y su nivel de importancia para el sistema.

> **Leyenda de Importancia:**
> 🔴 **Critico** - El sistema no funciona sin este archivo.
> 🟡 **Importante** - Afecta la calidad, seguridad o experiencia de desarrollo.
> 🟢 **Complementario** - Mejora el proyecto pero no es indispensable para ejecutarlo.

---

## 1. Puntos de Entrada (Entry Points)

### 🔴 `index.php` - Dashboard Principal

| Atributo       | Valor                          |
| :------------- | :----------------------------- |
| **Ubicacion**  | `/index.php`                   |
| **Tecnologia** | PHP + HTML/CSS inline          |
| **Importancia**| 🔴 Critico                     |

**Que hace?**
Es la **pagina principal** de la suite. Cuando un usuario accede a `http://localhost/microsistemas/` o `http://localhost:8080`, este archivo es lo primero que ve.

**Como funciona internamente?**

1. Carga el autoloader de Composer (`vendor/autoload.php`) para habilitar las clases del Core.
2. Renderiza un **grid responsivo** con tarjetas (cards) para cada una de las 12 micro-aplicaciones.
3. Usa un **diseno Dark Mode** con variables CSS personalizadas (`--bg-color`, `--card-bg`, `--accent`).
4. Cada tarjeta muestra: badge de tecnologia (PHP/JS/DevOps), nombre, descripcion y un boton "Abrir Herramienta".
5. Incluye enlaces en el header a la documentacion del usuario y la guia de instalacion via `doc.php`.

**Por que es critico?**
Sin este archivo, no existe punto de acceso visual al sistema. Es la **fachada** que conecta al usuario con todas las herramientas.

---

### 🔴 `doc.php` - Visor de Documentacion Markdown

| Atributo       | Valor                                  |
| :------------- | :------------------------------------- |
| **Ubicacion**  | `/doc.php`                             |
| **Tecnologia** | PHP + Marked.js (CDN)                  |
| **Importancia**| 🔴 Critico                             |

**Que hace?**
Renderiza cualquier archivo `.md` del proyecto como una pagina web estilizada con Dark Mode. Se accede mediante `doc.php?file=NOMBRE.md`.

**Como funciona internamente?**

1. Recibe el parametro `file` por GET (ej: `?file=USER_MANUAL.md`).
2. Busca el archivo primero en `docs/`, luego en la raiz del proyecto.
3. Usa `basename()` como **medida de seguridad** para evitar path traversal.
4. Carga el contenido con `file_get_contents()` y lo inyecta en el HTML como JSON.
5. La libreria **Marked.js** (cargada desde CDN) convierte el Markdown a HTML en el navegador.
6. Aplica estilos premium: tipografia Inter/JetBrains Mono, bloques de codigo con fondo oscuro, tablas estilizadas.

**Por que es critico?**
Permite navegar toda la documentacion directamente desde el navegador sin necesidad de herramientas externas como GitHub.

---

## 2. Core del Sistema (`src/`)

### 🔴 `src/Core/Config.php` - Gestion de Configuracion

| Atributo       | Valor                            |
| :------------- | :------------------------------- |
| **Ubicacion**  | `/src/Core/Config.php`           |
| **Namespace**  | `Microsistemas\Core`             |
| **Patron**     | Singleton                        |
| **Importancia**| 🔴 Critico                       |

**Que hace?**
Centraliza la carga y lectura de variables de entorno (`.env`) para todo el sistema.

**Como funciona internamente?**

1. Usa el patron **Singleton** (`getInstance()`) para garantizar una sola instancia en memoria.
2. En el constructor, carga el `.env` mediante `vlucas/phpdotenv` con `createImmutable()` - las variables del entorno del SO no se sobrescriben.
3. Si el `.env` no existe (ej: en produccion con Docker/ECS), **falla silenciosamente** y asume que las variables vienen del sistema operativo.
4. El metodo `get($key, $default)` busca primero en `$_ENV`, luego en `getenv()`, y finalmente retorna el valor por defecto.

**Por que es critico?**
Toda la configuracion del sistema (credenciales de BD, hosts, drivers) pasa por esta clase. Sin ella, ninguna micro-app puede conectarse a servicios externos.

---

### 🔴 `src/Core/Database.php` - Conexion a Base de Datos

| Atributo       | Valor                            |
| :------------- | :------------------------------- |
| **Ubicacion**  | `/src/Core/Database.php`         |
| **Namespace**  | `Microsistemas\Core`             |
| **Patron**     | Singleton                        |
| **Importancia**| 🔴 Critico                       |

**Que hace?**
Centraliza las conexiones a bases de datos con soporte para **MySQLi** y **PDO** (MySQL, PostgreSQL, SQLite).

**Como funciona internamente?**

1. **`getConnection()`**: Retorna una conexion MySQLi (mantenida por compatibilidad con codigo legacy). Usa `Config::getInstance()` para obtener credenciales.
2. **`getPDO()`**: Retorna una conexion PDO con soporte multi-driver. Acepta parametros opcionales para override (util en tests).
3. Configura atributos de seguridad:
   - `ERRMODE_EXCEPTION`: Los errores SQL lanzan excepciones en lugar de warnings silenciosos.
   - `FETCH_ASSOC`: Retorna arrays asociativos por defecto.
   - `MYSQL_ATTR_FOUND_ROWS`: `rowCount()` refleja filas encontradas, no solo modificadas.
4. **`close()`**: Cierra ambas conexiones y libera recursos.

**Por que es critico?**
Es la puerta de entrada a cualquier operacion de base de datos en las micro-apps (SqlViewer, LogViewer, etc.).

---

## 3. Infraestructura y Contenedores

### 🔴 `Dockerfile` - Imagen Docker de Produccion

| Atributo       | Valor                            |
| :------------- | :------------------------------- |
| **Ubicacion**  | `/Dockerfile`                    |
| **Base**       | `php:8.2.27-apache-bookworm`     |
| **Importancia**| 🔴 Critico                       |

**Que hace?**
Define la imagen Docker que empaqueta toda la suite para despliegue inmutable.

**Como funciona internamente?**

1. Parte de la imagen oficial PHP con Apache sobre Debian Bookworm.
2. Instala extensiones: `gd` (imagenes), `mysqli`, `pdo`, `pdo_mysql`.
3. Habilita `mod_rewrite` de Apache para URLs limpias.
4. Usa la config `php.ini-production` para rendimiento y seguridad.
5. Instala Composer y ejecuta `composer install --no-dev` como usuario `www-data` (no-root).
6. Aplica permisos granulares: directorios `755`, archivos `644`.
7. Incluye un **HEALTHCHECK** que verifica `curl -f http://localhost/` cada 30 segundos.

**Por que es critico?**
Sin este archivo no es posible el despliegue con Docker, que es el metodo recomendado de produccion.

---

### 🔴 `docker-compose.yml` - Orquestacion Multi-Contenedor

| Atributo       | Valor                            |
| :------------- | :------------------------------- |
| **Ubicacion**  | `/docker-compose.yml`            |
| **Servicios**  | `web` (Apache/PHP), `db` (MySQL) |
| **Importancia**| 🔴 Critico                       |

**Que hace?**
Levanta el ecosistema completo (web + base de datos) con un solo comando `docker-compose up -d`.

**Detalles tecnicos:**

- **Servicio `web`**: Mapea puerto `8080:80`, monta el codigo fuente como volumen, depende de `db` con `service_healthy`.
- **Servicio `db`**: MySQL 8.0.40, con volumen persistente `db-data`, healthcheck con `mysqladmin ping`.
- **Limites de recursos**: Cada servicio esta limitado a 1 CPU y 512MB RAM.
- **Red**: Red bridge aislada `microsistemas-net`.
- **Variables**: Lee credenciales desde `.env` con fallback a valores por defecto.

---

### 🟡 `.dockerignore` - Exclusiones de Build Docker

| Atributo       | Valor                |
| :------------- | :------------------- |
| **Importancia**| 🟡 Importante        |

**Que hace?**
Excluye archivos innecesarios del contexto de build de Docker, reduciendo el tamano de la imagen y evitando filtrar secretos.

**Archivos excluidos:** `.git`, `vendor`, `node_modules`, `.env`, `docs`, `README.md`, logs, y el propio `Dockerfile`.

---

### 🟡 `k8s/demo/` - Manifiestos de Kubernetes

| Archivo               | Proposito                                                        |
| :-------------------- | :--------------------------------------------------------------- |
| `deployment.yaml`     | Define el Deployment con replicas, imagen y probes de salud.     |
| `service.yaml`        | Expone el Deployment internamente en el cluster (ClusterIP).     |
| `network-policy.yaml` | Restringe trafico de red al namespace (Zero Trust).              |
| `kustomization.yaml`  | Orquesta los manifiestos con Kustomize (`kubectl apply -k`).     |

**Importancia:** 🟢 Complementario - Demuestra preparacion para orquestacion en la nube, pero no es requerido para desarrollo local.

---

## 4. Automatizacion y CLI

### 🟡 `Makefile` - Interfaz de Comandos Simplificada

| Atributo       | Valor                       |
| :------------- | :-------------------------- |
| **Importancia**| 🟡 Importante               |

**Que hace?**
Provee **atajos estandarizados** para las tareas mas comunes del proyecto.

**Comandos clave:**

| Comando          | Accion                                              |
| :--------------- | :-------------------------------------------------- |
| `make install`   | Instala dependencias PHP con Composer.               |
| `make serve`     | Inicia servidor PHP embebido en `localhost:8000`.     |
| `make up / down` | Levanta/detiene contenedores Docker.                 |
| `make hub-list`  | Lista todas las micro-apps disponibles.              |
| `make hub-run`   | Ejecuta una app localmente.                          |
| `make hub-doctor`| Diagnostico del entorno (puertos, Docker, archivos). |
| `make validate`  | Ejecuta linters PHP y Markdown.                      |
| `make smoke`     | Smoke test: levanta Docker, verifica salud, apaga.   |
| `make catalog`   | Regenera la tabla de catalogo en el README.          |
| `make k8s-apply` | Aplica manifiestos Kubernetes con Kustomize.         |

**Detalle interno:** Detecta automaticamente el SO (Windows/Linux) para elegir entre `hub.ps1` y `hub.sh`.

---

### 🟡 `hub.sh` - Hub CLI (Linux/Mac)

| Atributo       | Valor                       |
| :------------- | :-------------------------- |
| **Ubicacion**  | `/hub.sh`                   |
| **Importancia**| 🟡 Importante               |

**Que hace?**
Herramienta CLI en Bash para gestionar todas las micro-apps de forma centralizada.

**Comandos:**

- **`list`**: Escanea `apps/*/app.manifest.yml` y muestra una tabla con ID, nombre, tipo y puertos.
- **`run <id>`**: Lee `run_cmd` del manifiesto y lo ejecuta en el directorio de la app.
- **`up <id>`**: Lee `compose_file` del manifiesto y ejecuta `docker compose up -d`.
- **`doctor`**: Diagnostico completo: verifica Docker, Git, PHP, `.env`, `vendor/`, puertos 8000/8080 y estado de contenedores.

---

### 🟡 `hub.ps1` - Hub CLI (Windows PowerShell)

| Atributo       | Valor                       |
| :------------- | :-------------------------- |
| **Ubicacion**  | `/hub.ps1`                  |
| **Importancia**| 🟡 Importante               |

Equivalente a `hub.sh` pero escrito en PowerShell para compatibilidad con Windows. Mismas funcionalidades: `list`, `run`, `up`, `doctor`.

---

## 5. Scripts de Desarrollo (`scripts/`)

### 🟡 `scripts/dev.sh` - Script de Desarrollo (Bash)

| Atributo       | Valor                             |
| :------------- | :-------------------------------- |
| **Importancia**| 🟡 Importante                     |

**Comandos:**

| Subcomando  | Accion                                                    |
| :---------- | :-------------------------------------------------------- |
| `listar`    | Alias de `hub.sh list`.                                    |
| `revisar`   | Ejecuta PHP CS-Fixer (dry-run), PHPStan y markdownlint.   |
| `probar`    | Ejecuta validacion de manifiestos con el script Python.    |
| `catalogo`  | Regenera el catalogo del README via `generate_catalog.py`. |

---

### 🟡 `scripts/dev.ps1` - Script de Desarrollo (PowerShell)

Equivalente a `dev.sh` para Windows. Misma funcionalidad.

---

### 🟡 `scripts/generate_catalog.py` - Generador Automatico de Catalogo

| Atributo       | Valor                              |
| :------------- | :--------------------------------- |
| **Tecnologia** | Python 3 + PyYAML                  |
| **Importancia**| 🟡 Importante                      |

**Que hace?**
Lee todos los archivos `app.manifest.yml` dentro de `apps/` y genera automaticamente la tabla Markdown del catalogo en el `README.md`.

**Como funciona?**

1. Escanea `apps/*/app.manifest.yml`.
2. Extrae `name`, `type` y `description` de cada manifiesto.
3. Mapea tipos a badges de Shields.io (PHP, JS, DevOps, Python).
4. Busca los marcadores `<!-- CATALOG_START -->` y `<!-- CATALOG_END -->` en el README.
5. Reemplaza el contenido entre los marcadores con la tabla actualizada.

---

### 🟢 `scripts/update_app_readmes.ps1` - Actualizador de READMEs de Apps

Script PowerShell auxiliar para mantener los README individuales de cada micro-app actualizados.

---

## 6. Configuracion del Proyecto

### 🔴 `composer.json` - Dependencias PHP

| Atributo       | Valor                              |
| :------------- | :--------------------------------- |
| **Importancia**| 🔴 Critico                         |

**Contenido clave:**

- **Nombre**: `vladimir/microsistemas`
- **PHP requerido**: `>=8.0`
- **Dependencias de produccion**: `vlucas/phpdotenv ^5.6` (carga de `.env`).
- **Dependencias de desarrollo**: `php-cs-fixer ^3.0` (formateo), `phpstan ^1.0` (analisis estatico).
- **Autoloading PSR-4**: Mapea `Microsistemas\` al directorio `src/`.
- **Optimizaciones**: `optimize-autoloader: true`, `sort-packages: true`.

---

### 🔴 `.env.example` - Plantilla de Variables de Entorno

| Atributo       | Valor                              |
| :------------- | :--------------------------------- |
| **Importancia**| 🔴 Critico                         |

**Variables documentadas:**

```env
DB_DRIVER=mysql       # Driver de BD: mysql, pgsql, sqlite
DB_HOST=localhost      # En Docker: db
DB_USER=root
DB_PASS=              # En Docker: root
DB_NAME=portal_portafolio
```

**Por que es critico?**
Sin copiar este archivo a `.env`, la clase `Config.php` no puede cargar las credenciales de la base de datos en entorno local.

---

### 🟡 `phpstan.neon` - Configuracion de Analisis Estatico

| Atributo       | Valor                              |
| :------------- | :--------------------------------- |
| **Importancia**| 🟡 Importante                      |

Configura PHPStan a **nivel 5** (de 10). Analiza los directorios `apps/` y `src/`, excluye `vendor/`, y usa el autoloader de Composer como bootstrap.

---

### 🟡 `.php-cs-fixer.dist.php` - Reglas de Estilo de Codigo PHP

| Atributo       | Valor                              |
| :------------- | :--------------------------------- |
| **Importancia**| 🟡 Importante                      |

**Reglas aplicadas:**

- Estandar **PSR-12** como base.
- Sintaxis corta de arrays (`[]` en vez de `array()`).
- Imports ordenados alfabeticamente.
- Eliminacion de imports no usados.
- Trailing commas en multiline.
- Separacion de metodos con una linea en blanco.

**Alcance:** Solo archivos `.php` dentro de `apps/` y `src/`.

---

### 🟡 `.pre-commit-config.yaml` - Hooks de Pre-commit

| Atributo       | Valor                              |
| :------------- | :--------------------------------- |
| **Importancia**| 🟡 Importante                      |

**Hooks configurados:**

| Hook                      | Que previene                                      |
| :------------------------ | :------------------------------------------------ |
| `trailing-whitespace`     | Espacios en blanco al final de las lineas.         |
| `end-of-file-fixer`       | Archivos sin newline final.                        |
| `check-yaml`              | YAML con sintaxis invalida.                        |
| `check-added-large-files` | Archivos binarios grandes accidentalmente anadidos.|
| `detect-secrets`          | Claves, tokens o passwords hardcodeados en el codigo.|

---

### 🟢 `.markdownlint.json` - Reglas de Linting Markdown

Desactiva reglas estrictas que no aplican al estilo del proyecto: longitud de linea (`MD013`), HTML inline (`MD033`), primer heading H1 (`MD041`), y otras.

---

### 🟢 `.gitignore` - Exclusiones de Git

Excluye del repositorio: `.env`, `vendor/`, `.vscode/`, `.idea/`, archivos de secretos (`*.pem`, `*.key`), cache de Python (`__pycache__`), y logs.

---

### 🟢 `.gitattributes` - Normalizacion de Fin de Linea

Configura `* text=auto` para que Git normalice automaticamente los finales de linea (LF en Linux, CRLF en Windows) evitando conflictos entre sistemas operativos.

---

## 7. CI/CD y GitHub (`.github/`)

### 🟡 `.github/workflows/ci.yml` - Pipeline de Integracion Continua

El pipeline principal. Ejecuta linters, analisis estatico, validacion de manifiestos y smoke tests en cada push/PR.

### 🟡 `.github/workflows/docker-publish.yml` - Publicacion de Imagen Docker

Construye y publica la imagen Docker en **GitHub Container Registry** (`ghcr.io`) automaticamente al crear un tag o merge a `main`.

### 🟡 `.github/workflows/secret-scanning.yml` - Escaneo de Secretos

Ejecuta `detect-secrets` como paso CI para prevenir la filtracion de credenciales en el codigo.

### 🟢 `.github/workflows/wiki-sync.yml` - Sincronizacion de Wiki

Sincroniza automaticamente el contenido de `docs/wiki/` con la Wiki de GitHub del repositorio.

### 🟢 `.github/CODEOWNERS` - Propietarios del Codigo

Define quienes son los revisores requeridos para PRs que toquen ciertas areas del proyecto.

### 🟢 `.github/PULL_REQUEST_TEMPLATE.md` - Plantilla de Pull Requests

Estructura predefinida para que cada PR incluya: descripcion, tipo de cambio, checklist de revision y screenshots.

### 🟢 `.github/ISSUE_TEMPLATE/` - Plantillas de Issues

Contiene 4 archivos (`.md` y `.yml`) con formularios predefinidos para reportar bugs y solicitar features de forma estandarizada.

---

## 8. Documentacion del Proyecto

### 📂 Directorio `docs/`

| Archivo                  | Proposito                                                              | Importancia |
| :----------------------- | :--------------------------------------------------------------------- | :---------- |
| `ARCHITECTURE.md`        | Diagramas Mermaid y explicacion de la arquitectura del sistema.         | 🟡          |
| `API.md`                 | Referencia de la API interna del Core y puntos de extension.            | 🟡          |
| `BEGINNERS_GUIDE.md`     | Guia de onboarding para desarrolladores nuevos.                         | 🟢          |
| `HUB.md`                 | Documentacion completa del Hub CLI.                                     | 🟡          |
| `INSTALL.md`             | Guia paso a paso de instalacion (Docker, XAMPP, Linux).                 | 🔴          |
| `MAINTAINERS.md`         | Informacion para administradores del proyecto.                          | 🟢          |
| `RECRUITER.md`           | Guia ejecutiva para reclutadores y evaluadores tecnicos.                | 🟢          |
| `REQUIREMENTS.md`        | Requisitos de hardware y software (PHP, extensiones, etc.).             | 🟡          |
| `SECURITY.md`            | Politicas de seguridad y proceso de reporte de vulnerabilidades.        | 🟡          |
| `SYSTEMS_CATALOG.md`     | Catalogo detallado con ficha tecnica de cada micro-app.                 | 🟡          |
| `TECHNICAL_SPECS.md`     | Stack tecnologico, estandares de codigo y normas de mantenimiento.      | 🟡          |
| `USER_MANUAL.md`         | Manual de usuario final para cada herramienta.                          | 🟡          |

### 📂 `docs/wiki/` - Contenido de la Wiki

Contiene 15 paginas en formato Markdown que se sincronizan automaticamente con la Wiki de GitHub mediante el workflow `wiki-sync.yml`.

---

## 9. Archivos Raiz del Repositorio

| Archivo              | Proposito                                                           | Importancia |
| :------------------- | :------------------------------------------------------------------ | :---------- |
| `README.md`          | Pagina principal del repositorio en GitHub/GitLab.                   | 🔴          |
| `CHANGELOG.md`       | Registro cronologico de versiones, cambios y mejoras.                | 🟡          |
| `ROADMAP.md`         | Plan de funcionalidades futuras y evolucion del proyecto.            | 🟢          |
| `CONTRIBUTING.md`    | Guia para contribuidores: como hacer PRs, reportar bugs, etc.       | 🟢          |
| `CODE_OF_CONDUCT.md` | Codigo de conducta de la comunidad.                                  | 🟢          |
| `SECURITY.md`        | Politica de seguridad y reporte responsable de vulnerabilidades.     | 🟡          |
| `LICENSE`            | Licencia MIT del proyecto.                                           | 🟡          |
| `NOTICE`             | Atribuciones legales y creditos de dependencias de terceros.         | 🟢          |
| `llms.txt`           | Metadatos estructurados para consumo por modelos de IA/LLM.         | 🟢          |

---

## 10. Directorio de Aplicaciones (`apps/`)

Cada subdirectorio dentro de `apps/` es una **micro-aplicacion independiente** con su propio codigo, assets y manifiesto. Todas las apps contienen un archivo `app.manifest.yml` que define su nombre, tipo, comando de ejecucion y puertos.

| App                | Tecnologia | Proposito                                                       |
| :----------------- | :--------- | :-------------------------------------------------------------- |
| `AwsGenerator/`    | DevOps     | Asistente inteligente para AWS CLI con semaforo de riesgo.       |
| `CapacitySim/`     | DevOps     | Simulador heuristico de capacidad y costos de infraestructura.   |
| `CicdLibrary/`     | DevOps     | Biblioteca de 192 combinaciones CI/CD (GitHub, GitLab, Jenkins). |
| `Conversor/`       | PHP        | Sanitizacion y codificacion segura de texto.                     |
| `GitTrainer/`      | JS         | Biblioteca interactiva de comandos Git con 1000+ ejemplos.       |
| `JsTools/`         | JS         | Suite de utilidades JavaScript (minificador, linter, formatter). |
| `KatasMultiLang/`  | JS         | Comparador visual premium de codigo con 195 katas (Glassmorphism).|
| `LogViewer/`       | PHP        | Visualizacion segura de logs del sistema en tiempo real.         |
| `PhpMigrator/`     | PHP        | Guia de migracion de PHP 5.x a 8.x con deteccion de obsoletos.  |
| `PythonEval3000/`  | JS         | Evaluador y explorador de 3000 preguntas de Python y Data Science. |
| `SqlViewer/`       | PHP        | Inspector de bases de datos desde el navegador.                  |
| `YmlGenerator/`    | JS         | Generador visual de YAML para Docker y Kubernetes.               |

---

## Mapa Visual de la Estructura

```text
Microsistemas/
├── 🔴 index.php              ← Dashboard principal
├── 🔴 doc.php                ← Visor de documentacion
├── 🔴 composer.json          ← Dependencias PHP
├── 🔴 .env.example           ← Plantilla de variables
├── 🔴 Dockerfile             ← Imagen de produccion
├── 🔴 docker-compose.yml     ← Orquestacion de servicios
├── 🟡 Makefile               ← Atajos de comandos
├── 🟡 hub.sh / hub.ps1       ← CLI multiplataforma
│
├── src/Core/
│   ├── 🔴 Config.php         ← Singleton de configuracion
│   └── 🔴 Database.php       ← Singleton de conexion a BD
│
├── apps/                      ← 12 micro-aplicaciones
│   ├── AwsGenerator/
│   ├── CapacitySim/
│   ├── CicdLibrary/
│   ├── Conversor/
│   ├── GitTrainer/
│   ├── JsTools/
│   ├── KatasMultiLang/
│   ├── LogViewer/
│   ├── PhpMigrator/
│   ├── PythonEval3000/
│   ├── SqlViewer/
│   └── YmlGenerator/
│
├── scripts/                   ← Automatizacion
│   ├── 🟡 dev.sh / dev.ps1
│   └── 🟡 generate_catalog.py
│
├── mcp/                       ← Servidor MCP (Protocolo de IA)
│   ├── 🔴 server.py          ← Entrypoint del "Sidecar" 
│   ├── 🔴 config.py          ← Hardening y AllowLists
│   ├── 🟡 tools/             ← Scripts de CLI Hub wrappers
│   ├── 🟡 prompts/           ← Comportamientos IA estaticos
│   └── 🟢 resources/         ← Mapeo de Documentacion
│
├── docs/                      ← 12 documentos tecnicos + wiki
├── k8s/demo/                  ← Manifiestos Kubernetes
├── .github/                   ← CI/CD + plantillas de Issues/PRs
│
├── 🟡 phpstan.neon            ← Analisis estatico
├── 🟡 .php-cs-fixer.dist.php ← Estilo de codigo
├── 🟡 .pre-commit-config.yaml← Hooks de calidad
├── 🟢 .gitignore
├── 🟢 .gitattributes
├── 🟢 .dockerignore
├── 🟢 .markdownlint.json
├── 🟢 llms.txt
├── 🟡 CHANGELOG.md
├── 🟢 ROADMAP.md
├── 🟢 CONTRIBUTING.md
├── 🟢 CODE_OF_CONDUCT.md
├── 🟡 SECURITY.md
├── 🟡 LICENSE
└── 🟢 NOTICE
```

---

## 🤖 Skills / Playbooks (`skills/`)

El directorio `skills/` contiene flujos de trabajo reutilizables (playbooks) que guian la ejecucion de tareas complejas y repetitivas en el repositorio.

### 🟡 `skills/integrar-microsistema/` - Skill de Integracion

| Atributo        | Valor                                        |
| :-------------- | :------------------------------------------- |
| **Ubicacion**   | `/skills/integrar-microsistema/`             |
| **Tipo**        | Playbook de 6 pasos                          |
| **Importancia** | 🟡 Importante                                |

**Que hace?**

Guia la integracion de cualquier nueva micro-app en el repositorio de forma coherente, cubriendo todos los puntos de impacto: dashboard, manifest, docs, wiki y chequeos de validacion.

**Archivos incluidos:**

- `skill.md` - Playbook principal. Define los 6 pasos, reglas de oro, lista de inputs/outputs y flujo completo.
- `referencia.txt` - Ejemplo de invocacion con valores de inputs reales.
- `templates/app.manifest.yml.tpl` - Plantilla para el manifiesto de la app.
- `templates/dashboard-card.html.tpl` - Plantilla para la tarjeta del Dashboard.
- `templates/wiki-entry.md.tpl` - Plantilla para la entrada de Wiki.

---

*Documento generado para la suite Microsistemas. Para volver al dashboard, visita [index.php](../index.php).*
