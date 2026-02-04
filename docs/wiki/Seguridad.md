# Seguridad

La seguridad es el pilar fundamental de **Microsistemas Suite**. Este repositorio contiene herramientas orientadas a productividad y soporte técnico que, por diseño, manejan información sensible.

---

## 🛡️ Protocolos de Protección y Hardening

Este proyecto ha pasado por un proceso de **hardening** para mitigar riesgos:

### 1. Gestión de Secretos (12-Factor App)
Nunca guardamos credenciales en el código fuente. Toda la información sensible se inyecta en tiempo de ejecución mediante:
- Archivos `.env` (excluidos de Git).
- Secretos de Docker o variables de entorno del servidor.
- **Secret Scanning**: Integración de TruffleHog y pre-commit (detect-secrets).

### 2. Docker & Aislamiento
Al utilizar Docker, cada herramienta se ejecuta en un entorno aislado.
- **No-Root**: Los procesos corren bajo usuarios con privilegios limitados (`www-data`).
- **SecurityContext**: En entornos K8s, se deshabilita la escalada de privilegios.
- **NetworkPolicies**: Aislamiento de red para tráfico interno.

### 3. Principio de Menor Privilegio
Recomendamos que el usuario de base de datos configurado tenga permisos mínimos (ej: solo `SELECT`). **Evite usar credenciales de producción**.

---

## 📝 Reporte Responsable de Vulnerabilidades

Si descubre un fallo de seguridad, **por favor no abra un Issue público**.

1. **Canal sugerido**: Contacte directamente al mantenedor o cree un issue marcado como "security" **sin datos sensibles** solicitando contacto privado.
2. Proporcione una prueba de concepto (PoC).
3. Especifique el microsistema afectado y el archivo.

Nos comprometemos a acusar recibo en **menos de 24 horas** y proporcionar un parche según la severidad.

---

## 🚫 Despliegue en Entornos Públicos

**ADVERTENCIA**: Esta suite no incluye por defecto un sistema de gestión de usuarios complejo (RBAC). 
**No exponer estos microsistemas directamente a Internet.**

Si planea cargarlos en un servidor público, es **obligatorio**:
1. Utilizar **HTTPS**.
2. Configurar un **Proxy Inverso** (Nginx/Traefik).
3. Añadir una capa de **autenticación externa** (ej: Authelia o Auth Básico).
4. Usar una **lista blanca (whitelist)** de rutas y archivos permitidos para evitar ataques de *Path Traversal*.
