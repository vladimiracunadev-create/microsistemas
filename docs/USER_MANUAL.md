# Manual de Usuario Final (USER_MANUAL)

Bienvenido a la guia oficial de **Microsistemas Suite**. Este documento le ayudara a dominar cada herramienta para maximizar su productividad.

---

## 🧭 Introduccion al Ecosistema

La suite se organiza en un **Dashboard Central** que actua como puerta de enlace a aplicaciones modulares. Cada herramienta en `apps/` es independiente pero comparte la misma estetica y estandares de seguridad.

---

## 🛠️ Guia Detallada de Herramientas

### 📦 Gestion de Datos y Bases de Datos

#### SQL Viewer

* **Proposito**: Inspeccion agil y depuracion de bases de datos.
* **Workflow Pro**: Use la columna izquierda para explorar esquemas; el resaltado de sintaxis le ayudara a escribir consultas complejas.
* **Seguridad**: El sistema bloquea ejecuciones accidentales mediante dialogos de confirmacion persistentes.

#### Log Viewer

* **Proposito**: Auditoria y diagnostico de errores en tiempo real.
* **Workflow Pro**: Filtre las lineas por severidad (`ERROR`, `WARNING`) usando las funciones del navegador (`Ctrl + F`) sobre la vista estilo consola.

---

### 💻 Modernizacion y Desarrollo

#### PHP Migrator

* **Proposito**: Salto tecnologico de PHP 5.x a 8.2+.
* **Workflow Pro**: Pegue clases enteras; la herramienta detectara ineficiencias y ofrecera alternativas basadas en la documentacion oficial de PHP.

#### Git Trainer

* **Proposito**: Dominio interactivo de flujos Git.
* **Workflow Pro**: Busque por "dolores de cabeza" comunes (ej: "olvide anadir un archivo al ultimo commit") para encontrar soluciones elegantes.

#### Katas MultiLang

* **Proposito**: Comparador visual de codigo para dominar multiples lenguajes o frameworks.
* **Workflow Pro**: Cambie al modo "Comparar Caso", seleccione dos lenguajes (ej: Python y JavaScript) en el panel izquierdo (con diseno UI Premium), y explore como se resuelve un mismo problema lado a lado en distintas tecnologias para acelerar su aprendizaje.

---

### 🔧 Utilidades de Configuracion

#### YAML Studio

* **Proposito**: Ingenieria de configuracion impecable.
* **Workflow Pro**: Utilice las plantillas integradas para generar archivos `docker-compose.yml` base en segundos.

#### Conversor & JS Tools

* **Proposito**: Sanitizacion y optimizacion de codigo.
* **Workflow Pro**: Integre estos pasos antes de subir sus archivos a produccion para reducir el tamano de carga y evitar ataques de inyeccion de caracteres.

---

### 🚀 DevOps e Infraestructura Pro

#### Capacity Simulator

* **Proposito**: Planificacion estrategica de recursos y costos cloud.
* **Workflow Pro**: Guarde el "Escenario A" (actual) y comparelo con el "Escenario B" (propuesta de migracion) para generar un reporte de impacto financiero.

#### CI/CD Library

* **Proposito**: Consulta y generacion de arquitecturas de despliegue.
* **Workflow Pro**: Use el buscador para encontrar su stack (ej: "node ssh") y abra el modal de detalle para obtener el codigo YAML y la lista de secretos necesarios.

#### AWS Assistant Pro

* **Proposito**: Asistente inteligente para administracion de AWS CLI (v2.1.0).
* **Workflow Pro**:
  1. Use el **Selector de Intenciones** para definir su objetivo (ej: "Gestionar S3").
  2. Observe el **Semaforo de Impacto** para entender el riesgo operativo.
  3. Use los **EduIcons** (ⓘ) para aprender el detalle de los parametros tecnicos.
  4. Valide con el **Modo Simulado** antes de ejecutar acciones reales.
* **Seguridad**: Bloqueo automatico en perfiles de produccion y alertas visuales para comandos criticos.

---

## ❓ Preguntas Frecuentes (FAQ)

### Como anado mis propias herramientas?

Utiliza el **Skill de Integracion** incluido en el repositorio: `skills/integrar-microsistema/skill.md`.

Es un flujo de 6 pasos que garantiza integracion coherente (dashboard, manifest, docs, wiki, chequeos automaticos). Incluye plantillas listas para copiar y un archivo `referencia.txt` con ejemplo de inputs.

Consulta tambien la [Guia de Contribucion](../CONTRIBUTING.md#como-anadir-un-nuevo-microsistema).

### Es seguro habilitar el SQL Viewer en servidores de produccion?

**Solo si** el acceso esta protegido por un VPN o un archivo `.htpasswd`. Por defecto, esta disenado para ser usado en entornos de red protegidos.

### He perdido la conexion con la base de datos.

Asegurese de que el servicio `db` de Docker este en ejecucion o que las credenciales en su archivo `.env` coincidan con las de su servidor MySQL local.
