# Requisitos del Sistema (System Requirements)

Este documento define las especificaciones técnicas de hardware y software necesarias para ejecutar **Microsistemas** de manera óptima.

---

## 🖥️ Hardware

### Mínimo (Entorno Local / Pruebas)

- **CPU**: 1 Core (2.0 GHz+)
- **RAM**: 512 MB (XAMPP Clásico) / 2 GB (Docker Desktop)
- **Almacenamiento**: 100 MB libres para el código base.
- **Pantalla**: Resolución 1024x768.

### Recomendado (Producción / AWS)

- **CPU**: 2 Cores
- **RAM**: 2 GB+
- **Almacenamiento**: 5 GB+ (dependiendo del volumen de logs y bases de datos).
- **Red**: Conexión estable para descarga de dependencias y tiempos de respuesta bajos (<100ms).

---

## 💾 Software

### Sistema Operativo

- **Windows**: 10/11 (Compatible con WSL2 para Docker).
- **Linux**: Ubuntu 20.04+, Debian 11+, CentOS 8+ (Recomendado para servidores).
- **macOS**: Catalina 10.15+ (Chip Intel o Apple Silicon).

### Stack de Servidor (Backend)

- **PHP**: Versión **8.0** o superior (Probado hasta 8.3).
  - Extensiones requeridas: `bcmath`, `ctype`, `fileinfo`, `json`, `mbstring`, `pdo`, `xml`.
- **Servidor Web**:
  - **Apache 2.4+** (con `mod_rewrite` habilitado).
  - **Nginx 1.18+**.
- **Base de Datos**:
  - **MySQL 8.0+** o **MariaDB 10.5+**.
- **Composer**: Versión **2.0+**.

### Herramientas de Desarrollo (Opcionales)

- **Docker**: Motor 20.10+ y Docker Compose 1.29+.
- **Make**: GNU Make 3.8+ (para usar el `Makefile`).
- **Git**: 2.30+.

---

## 🌐 Cliente (Navegadores Soportados)

El sistema utiliza *Vanilla JS* y CSS moderno, compatible con:

| Navegador | Versión Mínima | Estado |
| :--- | :--- | :--- |
| **Google Chrome** | 90+ | ✅ Soportado |
| **Mozilla Firefox** | 88+ | ✅ Soportado |
| **Microsoft Edge** | 90+ | ✅ Soportado |
| **Safari** | 14+ | ✅ Soportado |
| Internet Explorer | 11 | ❌ No Soportado |

---

## 📡 Red y Puertos

Si despliega en un entorno con firewall restringido, asegúrese de liberar los siguientes puertos:

| Puerto | Protocolo | Uso | Notas |
| :--- | :--- | :--- | :--- |
| **80 / 443** | TCP | Tráfico Web HTTP/HTTPS | Estándar para acceso de usuarios. |
| **8080** | TCP | Contenedor Web Alternativo | Puerto por defecto en `docker-compose`. |
| **3306** | TCP | MySQL Database | Solo si se requiere acceso externo a la DB. |

---

## 📋 Matriz de Compatibilidad

| Característica | Local (XAMPP) | Docker | Cloud (AWS/GCP) |
| :--- | :---: | :---: | :---: |
| Dashboard | ✅ | ✅ | ✅ |
| SQL Viewer | ✅ | ✅ | ✅ |
| Git Trainer | ✅ | ✅ | ✅ |
| CapacitySim | ✅ | ✅ | ✅ |
| KatasMultiLang | ✅ | ✅ | ✅ |
| CicdLibrary | ✅ | ✅ | ✅ |
| AWS Assistant Pro | ✅ | ✅ | ✅ |
| **Make commands** | ⚠️ (Requiere install) | ✅ | ✅ |
| **make lint-md** | ⚠️ (Requiere npx) | ✅ | ✅ (CI automático) |
| **Skills Playbooks** | ✅ | ✅ | ✅ |

> **Nota**: Para entornos de producción, se recomienda encarecidamente deshabilitar las herramientas de depuración como *SQL Viewer* o protegerlas tras una VPN.
