# Manual de Usuario Final (USER_MANUAL)

Bienvenido a la guía oficial de **Microsistemas Suite**. Este documento le ayudará a dominar cada herramienta para maximizar su productividad.

---

## 🧭 Introducción al Ecosistema

La suite se organiza en un **Dashboard Central** que actúa como puerta de enlace a aplicaciones modulares. Cada herramienta en `apps/` es independiente pero comparte la misma estética y estándares de seguridad.

---

## 🛠️ Guía Detallada de Herramientas

### 📦 Gestión de Datos y Bases de Datos

#### SQL Viewer

* **Propósito**: Inspección ágil y depuración de bases de datos.
* **Workflow Pro**: Use la columna izquierda para explorar esquemas; el resaltado de sintaxis le ayudará a escribir consultas complejas.
* **Seguridad**: El sistema bloquea ejecuciones accidentales mediante diálogos de confirmación persistentes.

#### Log Viewer

* **Propósito**: Auditoría y diagnóstico de errores en tiempo real.
* **Workflow Pro**: Filtre las líneas por severidad (`ERROR`, `WARNING`) usando las funciones del navegador (`Ctrl + F`) sobre la vista estilo consola.

---

### 💻 Modernización y Desarrollo

#### PHP Migrator

* **Propósito**: Salto tecnológico de PHP 5.x a 8.2+.
* **Workflow Pro**: Pegue clases enteras; la herramienta detectará ineficiencias y ofrecerá alternativas basadas en la documentación oficial de PHP.

#### Git Trainer

* **Propósito**: Dominio interactivo de flujos Git.
* **Workflow Pro**: Busque por "dolores de cabeza" comunes (ej: "olvidé añadir un archivo al último commit") para encontrar soluciones elegantes.

---

### 🔧 Utilidades de Configuración

#### YAML Studio

* **Propósito**: Ingeniería de configuración impecable.
* **Workflow Pro**: Utilice las plantillas integradas para generar archivos `docker-compose.yml` base en segundos.

#### Conversor & JS Tools

* **Propósito**: Sanitización y optimización de código.
* **Workflow Pro**: Integre estos pasos antes de subir sus archivos a producción para reducir el tamaño de carga y evitar ataques de inyección de caracteres.

---

### 🚀 DevOps e Infraestructura Pro

#### Capacity Simulator

* **Propósito**: Planificación estratégica de recursos y costos cloud.
* **Workflow Pro**: Guarde el "Escenario A" (actual) y compárelo con el "Escenario B" (propuesta de migración) para generar un reporte de impacto financiero.

#### CI/CD Library

* **Propósito**: Consulta y generación de arquitecturas de despliegue.
* **Workflow Pro**: Use el buscador para encontrar su stack (ej: "node ssh") y abra el modal de detalle para obtener el código YAML y la lista de secretos necesarios.

#### AWS Assistant Pro

* **Propósito**: Asistente inteligente para administración de AWS CLI (v2.1.0).
* **Workflow Pro**: Use el **Selector de Intenciones**, observe el **Semáforo de Impacto** y valide con el **Modo Simulado** antes de ejecutar acciones reales.

---

### 🌐 Estudio y Aprendizaje

#### Katas MultiLang

* **Propósito**: Comparador visual de 195 katas de código en 67 lenguajes/frameworks.
* **Workflow Pro**: Seleccione dos lenguajes en el panel lateral y active el modo "Comparar Caso" para ver la solución lado a lado. Use el botón copiar para transferir snippets al instante.

---

## ❓ Preguntas Frecuentes (FAQ)

### ¿Cómo añado mis propias herramientas?

Usa el **Skill de Integración** del repo: `skills/integrar-microsistema/skill.md`.
Flujo de 6 pasos con plantillas. Consulta también la [Guía de Contribución](Guia-de-Contribucion).

### ¿Es seguro habilitar el SQL Viewer en servidores de producción?

**Solo si** el acceso está protegido por un VPN o un archivo `.htpasswd`. Por defecto, está diseñado para ser usado en entornos de red protegidos.

### He perdido la conexión con la base de datos.

Asegúrese de que el servicio `db` de Docker esté en ejecución o que las credenciales en su archivo `.env` coincidan con las de su servidor MySQL local.
