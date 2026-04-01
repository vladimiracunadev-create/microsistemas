# Politica de Seguridad (SECURITY.md)

La seguridad es el pilar fundamental de **Microsistemas Suite**. Este documento define nuestra postura oficial y los protocolos de proteccion de datos.

---

## 🛡️ Protocolos de Proteccion de Datos

### 1. Gestion de Secretos (12-Factor App)

Nunca guardamos credenciales en el codigo fuente. Toda la informacion sensible se inyecta en tiempo de ejecucion mediante:

- Archivos `.env` (excluidos de Git).
- Secretos de Docker o variables de entorno del servidor.

### 2. Aislamiento de Procesos

Al utilizar Docker, cada herramienta se ejecuta en un entorno aislado. Esto previene que una posible vulnerabilidad en un modulo (ej: Conversor) afecte a la integridad del sistema operativo anfitrion o de la base de datos central.

### 3. Principio de Menor Privilegio

Recomendamos encarecidamente que el usuario de base de datos configurado en `SQL Viewer` tenga permisos limitados (ej: solo `SELECT`, `INSERT`, `UPDATE`) y no permisos de administrador global (`SUPER`).

### 4. Auditoria Automatica (Dependabot)

El repositorio esta protegido por Dependabot, un agente que escanea ininterrumpidamente las dependencias de Composer, Docker y GitHub Actions en busca de vulnerabilidades conocidas (CVEs), abriendo Pull Requests automaticos para su mitigacion inmediata.

### 5. Interfaz de IA Segura (Servidor MCP)

El servidor MCP integrado en este repositorio (`/mcp`) esta restringido por diseno (Hardcoded) a **solo lectura**. Implementa protecciones Anti-Path-Traversal mediante Regex estandarizadas y Whitelists absolutas, imposibilitando que un asistente de IA exfiltre variables del `.env` o ejecute comandos mutacionales sobre el host.

## 📝 Reporte de Vulnerabilidades

Valoramos enormemente el trabajo de los investigadores de seguridad. Si descubre un fallo:

1. **No abra un Issue publico**.
2. Contacte directamente a traves de **[vladimiracunadev-create]** mediante un mensaje privado o correo electronico directo.
3. Proporcione una prueba de concepto (PoC).

Nos comprometemos a:

- Acusar recibo en **menos de 24 horas**.
- Proporcionar un parche de seguridad en el menor tiempo posible segun la severidad.

---

## 🚫 Despliegue en Entornos Publicos

**ADVERTENCIA**: Esta suite no incluye por defecto un sistema de gestion de usuarios complejo (RBAC).

Si planea exponer estas herramientas a la web publica, es **obligatorio**:

1. Utilizar **HTTPS** (certificados SSL).
2. Configurar un **Proxy Inverso** (Nginx/Traefik).
3. Anadir una capa de autenticacion externa (ej: Authelia o Auth Basico de Apache).
