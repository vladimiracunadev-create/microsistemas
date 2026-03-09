# Política de Seguridad (SECURITY.md)

La seguridad es el pilar fundamental de **Microsistemas Suite**. Este documento define nuestra postura oficial y los protocolos de protección de datos.

---

## 🛡️ Protocolos de Protección de Datos

### 1. Gestión de Secretos (12-Factor App)

Nunca guardamos credenciales en el código fuente. Toda la información sensible se inyecta en tiempo de ejecución mediante:

- Archivos `.env` (excluidos de Git).
- Secretos de Docker o variables de entorno del servidor.

### 2. Aislamiento de Procesos

Al utilizar Docker, cada herramienta se ejecuta en un entorno aislado. Esto previene que una posible vulnerabilidad en un módulo (ej: Conversor) afecte a la integridad del sistema operativo anfitrión o de la base de datos central.

### 3. Principio de Menor Privilegio

Recomendamos encarecidamente que el usuario de base de datos configurado en `SQL Viewer` tenga permisos limitados (ej: solo `SELECT`, `INSERT`, `UPDATE`) y no permisos de administrador global (`SUPER`).

### 4. Auditoría Automática (Dependabot)

El repositorio está protegido por Dependabot, un agente que escanea ininterrumpidamente las dependencias de Composer, Docker y GitHub Actions en busca de vulnerabilidades conocidas (CVEs), abriendo Pull Requests automáticos para su mitigación inmediata.

### 5. Interfaz de IA Segura (Servidor MCP)

El servidor MCP integrado en este repositorio (`/mcp`) está restringido por diseño (Hardcoded) a **solo lectura**. Implementa protecciones Anti-Path-Traversal mediante Regex estandarizadas y Whitelists absolutas, imposibilitando que un asistente de IA exfiltre variables del `.env` o ejecute comandos mutacionales sobre el host.

## 📝 Reporte de Vulnerabilidades

Valoramos enormemente el trabajo de los investigadores de seguridad. Si descubre un fallo:

1. **No abra un Issue público**.
2. Contacte directamente a través de **[vladimiracunadev-create]** mediante un mensaje privado o correo electrónico directo.
3. Proporcione una prueba de concepto (PoC).

Nos comprometemos a:

- Acusar recibo en **menos de 24 horas**.
- Proporcionar un parche de seguridad en el menor tiempo posible según la severidad.

---

## 🚫 Despliegue en Entornos Públicos

**ADVERTENCIA**: Esta suite no incluye por defecto un sistema de gestión de usuarios complejo (RBAC).

Si planea exponer estas herramientas a la web pública, es **obligatorio**:

1. Utilizar **HTTPS** (certificados SSL).
2. Configurar un **Proxy Inverso** (Nginx/Traefik).
3. Añadir una capa de autenticación externa (ej: Authelia o Auth Básico de Apache).
