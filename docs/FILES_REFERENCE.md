# 📁 Referencia Completa de Archivos – Microsistemas

Guía detallada de **cada archivo y directorio** del proyecto. Cada entrada incluye su propósito, cómo funciona internamente y su nivel de importancia para el sistema.

> **Leyenda de Importancia:**
> 🔴 **Crítico** – El sistema no funciona sin este archivo.
> 🟡 **Importante** – Afecta la calidad, seguridad o experiencia de desarrollo.
> 🟢 **Complementario** – Mejora el proyecto pero no es indispensable para ejecutarlo.

---

## 1. Puntos de Entrada (Entry Points)

### 🔴 `index.php` — Dashboard Principal

| Atributo       | Valor                          |
| :------------- | :----------------------------- |
| **Ubicación**  | `/index.php`                   |
| **Tecnología** | PHP + HTML/CSS inline          |
| **Importancia**| 🔴 Crítico                     |

**¿Qué hace?**
Es la **página principal** de la suite. Cuando un usuario accede a `http://localhost/microsistemas/` o `http://localhost:8080`, este archivo es lo primero que ve.

**¿Cómo funciona internamente?**

1. Carga el autoloader de Composer (`vendor/autoload.php`) para habilitar las clases del Core.
2. Renderiza un **grid responsivo** con tarjetas (cards) para cada una de las 10 micro-aplicaciones.
3. Usa un **diseño Dark Mode** con variables CSS personalizadas (`--bg-color`, `--card-bg`, `--accent`).
4. Cada tarjeta muestra: badge de tecnología (PHP/JS/DevOps), nombre, descripción y un botón "Abrir Herramienta".
5. Incluye enlaces en el header a la documentación del usuario y la guía de instalación vía `doc.php`.

**¿Por qué es crítico?**
Sin este archivo, no existe punto de acceso visual al sistema. Es la **fachada** que conecta al usuario con todas las herramientas.

---

### 🔴 `doc.php` — Visor de Documentación Markdown

| Atributo       | Valor                                  |
| :------------- | :------------------------------------- |
| **Ubicación**  | `/doc.php`                             |
| **Tecnología** | PHP + Marked.js (CDN)                  |
| **Importancia**| 🔴 Crítico                             |

**¿Qué hace?**
Renderiza cualquier archivo `.md` del proyecto como una página web estilizada con Dark Mode. Se accede mediante `doc.php?file=NOMBRE.md`.

**¿Cómo funciona internamente?**

1. Recibe el parámetro `file` por GET (ej: `?file=USER_MANUAL.md`).
2. Busca el archivo primero en `docs/`, luego en la raíz del proyecto.
3. Usa `basename()` como **medida de seguridad** para evitar path traversal.
4. Carga el contenido con `file_get_contents()` y lo inyecta en el HTML como JSON.
5. La librería **Marked.js** (cargada desde CDN) convierte el Markdown a HTML en el navegador.
6. Aplica estilos premium: tipografía Inter/JetBrains Mono, bloques de código con fondo oscuro, tablas estilizadas.

**¿Por qué es crítico?**
Permite navegar toda la documentación directamente desde el navegador sin necesidad de herramientas externas como GitHub.

---

## 2. Core del Sistema (`src/`)

### 🔴 `src/Core/Config.php` — Gestión de Configuración

| Atributo       | Valor                            |
| :------------- | :------------------------------- |
| **Ubicación**  | `/src/Core/Config.php`           |
| **Namespace**  | `Microsistemas\Core`             |
| **Patrón**     | Singleton                        |
| **Importancia**| 🔴 Crítico                       |

**¿Qué hace?**
Centraliza la carga y lectura de variables de entorno (`.env`) para todo el sistema.

**¿Cómo funciona internamente?**

1. Usa el patrón **Singleton** (`getInstance()`) para garantizar una sola instancia en memoria.
2. En el constructor, carga el `.env` mediante `vlucas/phpdotenv` con `createImmutable()` — las variables del entorno del SO no se sobrescriben.
3. Si el `.env` no existe (ej: en producción con Docker/ECS), **falla silenciosamente** y asume que las variables vienen del sistema operativo.
4. El método `get($key, $default)` busca primero en `$_ENV`, luego en `getenv()`, y finalmente retorna el valor por defecto.

**¿Por qué es crítico?**
Toda la configuración del sistema (credenciales de BD, hosts, drivers) pasa por esta clase. Sin ella, ninguna micro-app puede conectarse a servicios externos.

---

### 🔴 `src/Core/Database.php` — Conexión a Base de Datos

| Atributo       | Valor                            |
| :------------- | :------------------------------- |
| **Ubicación**  | `/src/Core/Database.php`         |
| **Namespace**  | `Microsistemas\Core`             |
| **Patrón**     | Singleton                        |
| **Importancia**| 🔴 Crítico                       |

**¿Qué hace?**
Centraliza las conexiones a bases de datos con soporte para **MySQLi** y **PDO** (MySQL, PostgreSQL, SQLite).

**¿Cómo funciona internamente?**

1. **`getConnection()`**: Retorna una conexión MySQLi (mantenida por compatibilidad con código legacy). Usa `Config::getInstance()` para obtener credenciales.
2. **`getPDO()`**: Retorna una conexión PDO con soporte multi-driver. Acepta parámetros opcionales para override (útil en tests).
3. Configura atributos de seguridad:
   - `ERRMODE_EXCEPTION`: Los errores SQL lanzan excepciones en lugar de warnings silenciosos.
   - `FETCH_ASSOC`: Retorna arrays asociativos por defecto.
   - `MYSQL_ATTR_FOUND_ROWS`: `rowCount()` refleja filas encontradas, no solo modificadas.
4. **`close()`**: Cierra ambas conexiones y libera recursos.

**¿Por qué es crítico?**
Es la puerta de entrada a cualquier operación de base de datos en las micro-apps (SqlViewer, LogViewer, etc.).

---

## 3. Infraestructura y Contenedores

### 🔴 `Dockerfile` — Imagen Docker de Producción

| Atributo       | Valor                            |
| :------------- | :------------------------------- |
| **Ubicación**  | `/Dockerfile`                    |
| **Base**       | `php:8.2.27-apache-bookworm`     |
| **Importancia**| 🔴 Crítico                       |

**¿Qué hace?**
Define la imagen Docker que empaqueta toda la suite para despliegue inmutable.

**¿Cómo funciona internamente?**

1. Parte de la imagen oficial PHP con Apache sobre Debian Bookworm.
2. Instala extensiones: `gd` (imágenes), `mysqli`, `pdo`, `pdo_mysql`.
3. Habilita `mod_rewrite` de Apache para URLs limpias.
4. Usa la config `php.ini-production` para rendimiento y seguridad.
5. Instala Composer y ejecuta `composer install --no-dev` como usuario `www-data` (no-root).
6. Aplica permisos granulares: directorios `755`, archivos `644`.
7. Incluye un **HEALTHCHECK** que verifica `curl -f http://localhost/` cada 30 segundos.

**¿Por qué es crítico?**
Sin este archivo no es posible el despliegue con Docker, que es el método recomendado de producción.

---

### 🔴 `docker-compose.yml` — Orquestación Multi-Contenedor

| Atributo       | Valor                            |
| :------------- | :------------------------------- |
| **Ubicación**  | `/docker-compose.yml`            |
| **Servicios**  | `web` (Apache/PHP), `db` (MySQL) |
| **Importancia**| 🔴 Crítico                       |

**¿Qué hace?**
Levanta el ecosistema completo (web + base de datos) con un solo comando `docker-compose up -d`.

**Detalles técnicos:**

- **Servicio `web`**: Mapea puerto `8080:80`, monta el código fuente como volumen, depende de `db` con `service_healthy`.
- **Servicio `db`**: MySQL 8.0.40, con volumen persistente `db-data`, healthcheck con `mysqladmin ping`.
- **Límites de recursos**: Cada servicio está limitado a 1 CPU y 512MB RAM.
- **Red**: Red bridge aislada `microsistemas-net`.
- **Variables**: Lee credenciales desde `.env` con fallback a valores por defecto.

---

### 🟡 `.dockerignore` — Exclusiones de Build Docker

| Atributo       | Valor                |
| :------------- | :------------------- |
| **Importancia**| 🟡 Importante        |

**¿Qué hace?**
Excluye archivos innecesarios del contexto de build de Docker, reduciendo el tamaño de la imagen y evitando filtrar secretos.

**Archivos excluidos:** `.git`, `vendor`, `node_modules`, `.env`, `docs`, `README.md`, logs, y el propio `Dockerfile`.

---

### 🟡 `k8s/demo/` — Manifiestos de Kubernetes

| Archivo               | Propósito                                                        |
| :-------------------- | :--------------------------------------------------------------- |
| `deployment.yaml`     | Define el Deployment con réplicas, imagen y probes de salud.     |
| `service.yaml`        | Expone el Deployment internamente en el clúster (ClusterIP).     |
| `network-policy.yaml` | Restringe tráfico de red al namespace (Zero Trust).              |
| `kustomization.yaml`  | Orquesta los manifiestos con Kustomize (`kubectl apply -k`).     |

**Importancia:** 🟢 Complementario — Demuestra preparación para orquestación en la nube, pero no es requerido para desarrollo local.

---

## 4. Automatización y CLI

### 🟡 `Makefile` — Interfaz de Comandos Simplificada

| Atributo       | Valor                       |
| :------------- | :-------------------------- |
| **Importancia**| 🟡 Importante               |

**¿Qué hace?**
Provee **atajos estandarizados** para las tareas más comunes del proyecto.

**Comandos clave:**

| Comando          | Acción                                              |
| :--------------- | :-------------------------------------------------- |
| `make install`   | Instala dependencias PHP con Composer.               |
| `make serve`     | Inicia servidor PHP embebido en `localhost:8000`.     |
| `make up / down` | Levanta/detiene contenedores Docker.                 |
| `make hub-list`  | Lista todas las micro-apps disponibles.              |
| `make hub-run`   | Ejecuta una app localmente.                          |
| `make hub-doctor`| Diagnóstico del entorno (puertos, Docker, archivos). |
| `make validate`  | Ejecuta linters PHP y Markdown.                      |
| `make smoke`     | Smoke test: levanta Docker, verifica salud, apaga.   |
| `make catalog`   | Regenera la tabla de catálogo en el README.          |
| `make k8s-apply` | Aplica manifiestos Kubernetes con Kustomize.         |

**Detalle interno:** Detecta automáticamente el SO (Windows/Linux) para elegir entre `hub.ps1` y `hub.sh`.

---

### 🟡 `hub.sh` — Hub CLI (Linux/Mac)

| Atributo       | Valor                       |
| :------------- | :-------------------------- |
| **Ubicación**  | `/hub.sh`                   |
| **Importancia**| 🟡 Importante               |

**¿Qué hace?**
Herramienta CLI en Bash para gestionar todas las micro-apps de forma centralizada.

**Comandos:**

- **`list`**: Escanea `apps/*/app.manifest.yml` y muestra una tabla con ID, nombre, tipo y puertos.
- **`run <id>`**: Lee `run_cmd` del manifiesto y lo ejecuta en el directorio de la app.
- **`up <id>`**: Lee `compose_file` del manifiesto y ejecuta `docker compose up -d`.
- **`doctor`**: Diagnóstico completo: verifica Docker, Git, PHP, `.env`, `vendor/`, puertos 8000/8080 y estado de contenedores.

---

### 🟡 `hub.ps1` — Hub CLI (Windows PowerShell)

| Atributo       | Valor                       |
| :------------- | :-------------------------- |
| **Ubicación**  | `/hub.ps1`                  |
| **Importancia**| 🟡 Importante               |

Equivalente a `hub.sh` pero escrito en PowerShell para compatibilidad con Windows. Mismas funcionalidades: `list`, `run`, `up`, `doctor`.

---

## 5. Scripts de Desarrollo (`scripts/`)

### 🟡 `scripts/dev.sh` — Script de Desarrollo (Bash)

| Atributo       | Valor                             |
| :------------- | :-------------------------------- |
| **Importancia**| 🟡 Importante                     |

**Comandos:**

| Subcomando  | Acción                                                    |
| :---------- | :-------------------------------------------------------- |
| `listar`    | Alias de `hub.sh list`.                                    |
| `revisar`   | Ejecuta PHP CS-Fixer (dry-run), PHPStan y markdownlint.   |
| `probar`    | Ejecuta validación de manifiestos con el script Python.    |
| `catalogo`  | Regenera el catálogo del README vía `generate_catalog.py`. |

---

### 🟡 `scripts/dev.ps1` — Script de Desarrollo (PowerShell)

Equivalente a `dev.sh` para Windows. Misma funcionalidad.

---

### 🟡 `scripts/generate_catalog.py` — Generador Automático de Catálogo

| Atributo       | Valor                              |
| :------------- | :--------------------------------- |
| **Tecnología** | Python 3 + PyYAML                  |
| **Importancia**| 🟡 Importante                      |

**¿Qué hace?**
Lee todos los archivos `app.manifest.yml` dentro de `apps/` y genera automáticamente la tabla Markdown del catálogo en el `README.md`.

**¿Cómo funciona?**

1. Escanea `apps/*/app.manifest.yml`.
2. Extrae `name`, `type` y `description` de cada manifiesto.
3. Mapea tipos a badges de Shields.io (PHP, JS, DevOps, Python).
4. Busca los marcadores `<!-- CATALOG_START -->` y `<!-- CATALOG_END -->` en el README.
5. Reemplaza el contenido entre los marcadores con la tabla actualizada.

---

### 🟢 `scripts/update_app_readmes.ps1` — Actualizador de READMEs de Apps

Script PowerShell auxiliar para mantener los README individuales de cada micro-app actualizados.

---

## 6. Configuración del Proyecto

### 🔴 `composer.json` — Dependencias PHP

| Atributo       | Valor                              |
| :------------- | :--------------------------------- |
| **Importancia**| 🔴 Crítico                         |

**Contenido clave:**

- **Nombre**: `vladimir/microsistemas`
- **PHP requerido**: `>=8.0`
- **Dependencias de producción**: `vlucas/phpdotenv ^5.6` (carga de `.env`).
- **Dependencias de desarrollo**: `php-cs-fixer ^3.0` (formateo), `phpstan ^1.0` (análisis estático).
- **Autoloading PSR-4**: Mapea `Microsistemas\` al directorio `src/`.
- **Optimizaciones**: `optimize-autoloader: true`, `sort-packages: true`.

---

### 🔴 `.env.example` — Plantilla de Variables de Entorno

| Atributo       | Valor                              |
| :------------- | :--------------------------------- |
| **Importancia**| 🔴 Crítico                         |

**Variables documentadas:**

```env
DB_DRIVER=mysql       # Driver de BD: mysql, pgsql, sqlite
DB_HOST=localhost      # En Docker: db
DB_USER=root
DB_PASS=              # En Docker: root
DB_NAME=portal_portafolio
```

**¿Por qué es crítico?**
Sin copiar este archivo a `.env`, la clase `Config.php` no puede cargar las credenciales de la base de datos en entorno local.

---

### 🟡 `phpstan.neon` — Configuración de Análisis Estático

| Atributo       | Valor                              |
| :------------- | :--------------------------------- |
| **Importancia**| 🟡 Importante                      |

Configura PHPStan a **nivel 5** (de 10). Analiza los directorios `apps/` y `src/`, excluye `vendor/`, y usa el autoloader de Composer como bootstrap.

---

### 🟡 `.php-cs-fixer.dist.php` — Reglas de Estilo de Código PHP

| Atributo       | Valor                              |
| :------------- | :--------------------------------- |
| **Importancia**| 🟡 Importante                      |

**Reglas aplicadas:**

- Estándar **PSR-12** como base.
- Sintaxis corta de arrays (`[]` en vez de `array()`).
- Imports ordenados alfabéticamente.
- Eliminación de imports no usados.
- Trailing commas en multiline.
- Separación de métodos con una línea en blanco.

**Alcance:** Solo archivos `.php` dentro de `apps/` y `src/`.

---

### 🟡 `.pre-commit-config.yaml` — Hooks de Pre-commit

| Atributo       | Valor                              |
| :------------- | :--------------------------------- |
| **Importancia**| 🟡 Importante                      |

**Hooks configurados:**

| Hook                      | Qué previene                                      |
| :------------------------ | :------------------------------------------------ |
| `trailing-whitespace`     | Espacios en blanco al final de las líneas.         |
| `end-of-file-fixer`       | Archivos sin newline final.                        |
| `check-yaml`              | YAML con sintaxis inválida.                        |
| `check-added-large-files` | Archivos binarios grandes accidentalmente añadidos.|
| `detect-secrets`          | Claves, tokens o passwords hardcodeados en el código.|

---

### 🟢 `.markdownlint.json` — Reglas de Linting Markdown

Desactiva reglas estrictas que no aplican al estilo del proyecto: longitud de línea (`MD013`), HTML inline (`MD033`), primer heading H1 (`MD041`), y otras.

---

### 🟢 `.gitignore` — Exclusiones de Git

Excluye del repositorio: `.env`, `vendor/`, `.vscode/`, `.idea/`, archivos de secretos (`*.pem`, `*.key`), caché de Python (`__pycache__`), y logs.

---

### 🟢 `.gitattributes` — Normalización de Fin de Línea

Configura `* text=auto` para que Git normalice automáticamente los finales de línea (LF en Linux, CRLF en Windows) evitando conflictos entre sistemas operativos.

---

## 7. CI/CD y GitHub (`.github/`)

### 🟡 `.github/workflows/ci.yml` — Pipeline de Integración Continua

El pipeline principal. Ejecuta linters, análisis estático, validación de manifiestos y smoke tests en cada push/PR.

### 🟡 `.github/workflows/docker-publish.yml` — Publicación de Imagen Docker

Construye y publica la imagen Docker en **GitHub Container Registry** (`ghcr.io`) automáticamente al crear un tag o merge a `main`.

### 🟡 `.github/workflows/secret-scanning.yml` — Escaneo de Secretos

Ejecuta `detect-secrets` como paso CI para prevenir la filtración de credenciales en el código.

### 🟢 `.github/workflows/wiki-sync.yml` — Sincronización de Wiki

Sincroniza automáticamente el contenido de `docs/wiki/` con la Wiki de GitHub del repositorio.

### 🟢 `.github/CODEOWNERS` — Propietarios del Código

Define quiénes son los revisores requeridos para PRs que toquen ciertas áreas del proyecto.

### 🟢 `.github/PULL_REQUEST_TEMPLATE.md` — Plantilla de Pull Requests

Estructura predefinida para que cada PR incluya: descripción, tipo de cambio, checklist de revisión y screenshots.

### 🟢 `.github/ISSUE_TEMPLATE/` — Plantillas de Issues

Contiene 4 archivos (`.md` y `.yml`) con formularios predefinidos para reportar bugs y solicitar features de forma estandarizada.

---

## 8. Documentación del Proyecto

### 📂 Directorio `docs/`

| Archivo                  | Propósito                                                              | Importancia |
| :----------------------- | :--------------------------------------------------------------------- | :---------- |
| `ARCHITECTURE.md`        | Diagramas Mermaid y explicación de la arquitectura del sistema.         | 🟡          |
| `API.md`                 | Referencia de la API interna del Core y puntos de extensión.            | 🟡          |
| `BEGINNERS_GUIDE.md`     | Guía de onboarding para desarrolladores nuevos.                         | 🟢          |
| `HUB.md`                 | Documentación completa del Hub CLI.                                     | 🟡          |
| `INSTALL.md`             | Guía paso a paso de instalación (Docker, XAMPP, Linux).                 | 🔴          |
| `MAINTAINERS.md`         | Información para administradores del proyecto.                          | 🟢          |
| `RECRUITER.md`           | Guía ejecutiva para reclutadores y evaluadores técnicos.                | 🟢          |
| `REQUIREMENTS.md`        | Requisitos de hardware y software (PHP, extensiones, etc.).             | 🟡          |
| `SECURITY.md`            | Políticas de seguridad y proceso de reporte de vulnerabilidades.        | 🟡          |
| `SYSTEMS_CATALOG.md`     | Catálogo detallado con ficha técnica de cada micro-app.                 | 🟡          |
| `TECHNICAL_SPECS.md`     | Stack tecnológico, estándares de código y normas de mantenimiento.      | 🟡          |
| `USER_MANUAL.md`         | Manual de usuario final para cada herramienta.                          | 🟡          |

### 📂 `docs/wiki/` — Contenido de la Wiki

Contiene 15 páginas en formato Markdown que se sincronizan automáticamente con la Wiki de GitHub mediante el workflow `wiki-sync.yml`.

---

## 9. Archivos Raíz del Repositorio

| Archivo              | Propósito                                                           | Importancia |
| :------------------- | :------------------------------------------------------------------ | :---------- |
| `README.md`          | Página principal del repositorio en GitHub/GitLab.                   | 🔴          |
| `CHANGELOG.md`       | Registro cronológico de versiones, cambios y mejoras.                | 🟡          |
| `ROADMAP.md`         | Plan de funcionalidades futuras y evolución del proyecto.            | 🟢          |
| `CONTRIBUTING.md`    | Guía para contribuidores: cómo hacer PRs, reportar bugs, etc.       | 🟢          |
| `CODE_OF_CONDUCT.md` | Código de conducta de la comunidad.                                  | 🟢          |
| `SECURITY.md`        | Política de seguridad y reporte responsable de vulnerabilidades.     | 🟡          |
| `LICENSE`            | Licencia MIT del proyecto.                                           | 🟡          |
| `NOTICE`             | Atribuciones legales y créditos de dependencias de terceros.         | 🟢          |
| `llms.txt`           | Metadatos estructurados para consumo por modelos de IA/LLM.         | 🟢          |

---

## 10. Directorio de Aplicaciones (`apps/`)

Cada subdirectorio dentro de `apps/` es una **micro-aplicación independiente** con su propio código, assets y manifiesto. Todas las apps contienen un archivo `app.manifest.yml` que define su nombre, tipo, comando de ejecución y puertos.

| App                | Tecnología | Propósito                                                       |
| :----------------- | :--------- | :-------------------------------------------------------------- |
| `AwsGenerator/`    | DevOps     | Asistente inteligente para AWS CLI con semáforo de riesgo.       |
| `CapacitySim/`     | DevOps     | Simulador heurístico de capacidad y costos de infraestructura.   |
| `CicdLibrary/`     | DevOps     | Biblioteca de 192 combinaciones CI/CD (GitHub, GitLab, Jenkins). |
| `Conversor/`       | PHP        | Sanitización y codificación segura de texto.                     |
| `GitTrainer/`      | JS         | Biblioteca interactiva de comandos Git con 1000+ ejemplos.       |
| `JsTools/`         | JS         | Suite de utilidades JavaScript (minificador, linter, formatter). |
| `LogViewer/`       | PHP        | Visualización segura de logs del sistema en tiempo real.         |
| `PhpMigrator/`     | PHP        | Guía de migración de PHP 5.x a 8.x con detección de obsoletos.  |
| `SqlViewer/`       | PHP        | Inspector de bases de datos desde el navegador.                  |
| `YmlGenerator/`    | JS         | Generador visual de YAML para Docker y Kubernetes.               |

---

## Mapa Visual de la Estructura

```text
Microsistemas/
├── 🔴 index.php              ← Dashboard principal
├── 🔴 doc.php                ← Visor de documentación
├── 🔴 composer.json          ← Dependencias PHP
├── 🔴 .env.example           ← Plantilla de variables
├── 🔴 Dockerfile             ← Imagen de producción
├── 🔴 docker-compose.yml     ← Orquestación de servicios
├── 🟡 Makefile               ← Atajos de comandos
├── 🟡 hub.sh / hub.ps1       ← CLI multiplataforma
│
├── src/Core/
│   ├── 🔴 Config.php         ← Singleton de configuración
│   └── 🔴 Database.php       ← Singleton de conexión a BD
│
├── apps/                      ← 10 micro-aplicaciones
│   ├── AwsGenerator/
│   ├── CapacitySim/
│   ├── CicdLibrary/
│   ├── Conversor/
│   ├── GitTrainer/
│   ├── JsTools/
│   ├── LogViewer/
│   ├── PhpMigrator/
│   ├── SqlViewer/
│   └── YmlGenerator/
│
├── scripts/                   ← Automatización
│   ├── 🟡 dev.sh / dev.ps1
│   └── 🟡 generate_catalog.py
│
├── docs/                      ← 12 documentos técnicos + wiki
├── k8s/demo/                  ← Manifiestos Kubernetes
├── .github/                   ← CI/CD + plantillas de Issues/PRs
│
├── 🟡 phpstan.neon            ← Análisis estático
├── 🟡 .php-cs-fixer.dist.php ← Estilo de código
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

*Documento generado para la suite Microsistemas. Para volver al dashboard, visita [index.php](../index.php).*
