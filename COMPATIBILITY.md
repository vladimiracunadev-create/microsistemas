# Matriz de Compatibilidad (COMPATIBILITY)

El objetivo de **Microsistemas** es mantener un umbral lo mas universal posible reduciendo la dependencia de componentes de servidor pesados, sin sacrificar metodologias modernas.

A continuacion se detalla el nivel de compatibilidad documentado y evidenciado a traves de nuestra automatizacion y pruebas empiricas.

## 1. Modos de Ejecucion soportados

| Modo | Nivel de Soporte | Descripcion |
| :--- | :--- | :--- |
| **Docker Engine (Local/Nube)** | =� Primario / Probado | El metodo oficial de operacion inmutable (mediante `docker-compose.yml` incluido).|
| **XAMPP / Servidores Legacy** | =� Esperado / Testeado Parcial | Capaz de correr como carpeta dentro de `htdocs` en setups Apache clasicos (Windows/Linux/Mac). |
| **PHP Built-in Server** | =� Local Dev / Probado | Lanzado a traves de `make serve` para pruebas UI locales super rapidas sin base de datos compleja. |
| **Kubernetes** | =� Experimental | Despliegue mediante los manifiestos `k8s/`. Esta preparado arquitectonicamente, pero requiere ajustes de ingress del usuario. |

## 2. Lenguajes y Runtimes Base

| Componente | Versiones Soportadas | Notas |
| :--- | :--- | :--- |
| **PHP** | `8.1`, `8.2`, `8.3` | Requerido al menos `8.1` (uso de features de tipado robusto, enums, etc). PHP 7.x esta **No Soportado**. |
| **Node.js / npm** | N/A | Frontends operan mediante Vanilla JS, eliminando Node.js del runtime list. |
| **Base de Datos** | MySQL `8.0+`, MariaDB `10.5+` | Para las tools que persistan estado. Las herramientas *stateless* (ej. Conversor) funcionan sin conectividad SQL. |

## 3. Infraestructura Operativa

### Sistemas Operativos Host (para `Make` & Docker Local)

- **Linux (Ubuntu/Debian/Alpine):** Nativo y Probado exhaustivamente.
- **Windows (WSL2):** Ampliamente Probado. Se recomienda operar el CLI mediante distribuciones de WSL. Los scripts `hub.ps1` dan compatibilidad en Powershell nativo.
- **MacOS (Intel & Apple Silicon):** Esperado. Imagenes base PHP multi-arquitectura aseguran su funcionamiento de forma transparente.

### Navegadores Cliente Requeridos

El ecosistema utiliza propiedades modernas de interfaz grafica (CSS Grid, Variables, Glassmorphism, ES6+ JavaScript), por tanto se exige:

- **Google Chrome** v100+
- **Mozilla Firefox** v100+
- **Apple Safari** v15+
- **Microsoft Edge** (Chromium) v100+

*No existe compatibilidad pensada para Internet Explorer 11 u obsoletos navegadores WebKit heredados.*

## 4. Dependencias Cloud (Herramientas Especificas)

Algunas micro-aplicaciones integradas intentan emular comportamientos o generar directivas para entornos externos. Su compatibilidad teorica es:

- **AWS Generator:** Orientado a generar politicas formadas para AWS CLI v2.
- **Kubernetes / Docker YAMLs:** Plantillas ajustadas a especificaciones `apps/v1` de K8S, y Compose v3+.

## 5. Restricciones Conocidas

- **Limitaciones del OS:** Correr la Suite bajo **Windows puro** (sin WSL2 o sin Docker) podria causar problemas en el script de arranque `hub.sh` o en algunas utilidades Make que invocan dependencias bash/grep posix, obligando al usuario a utilizar el port de Powershell `hub.ps1` el cual podria tener menor paridad de features.
