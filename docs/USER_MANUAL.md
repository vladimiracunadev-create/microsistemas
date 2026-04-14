# Manual de Usuario Final (USER_MANUAL)

Bienvenido a la guia oficial de **Microsistemas Suite**. Este documento le ayudara a dominar cada herramienta para maximizar su productividad.

---

## 🧭 Introduccion al Ecosistema

La suite se organiza en un **Dashboard Central** que actua como puerta de enlace a aplicaciones modulares. Cada herramienta en `apps/` es independiente pero comparte la misma estetica y estandares de seguridad.

---

## 🛠️ Guia Detallada de Herramientas

### 📦 Gestion de Datos y Bases de Datos

#### SQL Viewer

* **Proposito**: Inspeccion agil y depuracion de bases de datos sin instalar clientes pesados.
* **Workflow Pro**: Use la columna izquierda para explorar esquemas y tablas; haga clic en una tabla para autocompletar `SELECT * FROM tabla LIMIT 100` en el editor.
* **Controles de seguridad activos por defecto:**
  * **Modo solo lectura** (`SQLVIEWER_READONLY=true`): Bloquea INSERT, UPDATE,
    DELETE, DROP, ALTER y TRUNCATE. Un badge amarillo en la UI indica el modo activo.
    Para desactivarlo temporalmente en local, cambia a `false` en tu `.env`.
  * **Rate limiting**: Maximo 30 queries por minuto por sesion (configurable con
    `SQLVIEWER_RATE_LIMIT` en `.env`). La UI muestra un aviso cuando quedan 5 o
    menos consultas en la ventana actual.
  * **Whitelist de hosts**: Solo puede conectarse a hosts definidos en
    `SQLVIEWER_ALLOWED_HOSTS` (default: `localhost,db,127.0.0.1`). Para agregar
    un host adicional, editalo en tu `.env`.
  * **Proteccion CSRF**: Cada formulario lleva un token de sesion unico. Protege
    contra envios maliciosos desde otras pestanas o paginas locales.

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

#### Python Eval 3000

* **Proposito**: Evaluacion y estudio de Python y Data Science con banco de 3000 preguntas JSON.
* **Workflow Pro**:
  1. Use los **filtros de Seccion, Nivel y Tipo** en la barra superior para acotar a un tema especifico (ej: `pandas`, nivel `Avanzada`).
  2. Alterne entre **modo Evaluacion** (preguntas aleatorias con 4 alternativas) y **modo Explorador** (revision paginada con respuestas).
  3. Use las teclas **1–4** para responder y **Enter** para avanzar sin usar el raton.
  4. El progreso (aciertos, errores) se guarda en `localStorage` — persiste entre sesiones.
* **Nota tecnica**: Esta app usa `fetch()` para cargar el JSON local. **Debe abrirse desde un servidor web** (`http://`) — no funcionara con el protocolo `file://` del sistema de archivos. Con Docker o XAMPP, accede via `http://localhost/microsistemas/apps/PythonEval3000/`.

---

## ❓ Preguntas Frecuentes (FAQ)

### Como anado mis propias herramientas?

Utiliza el **Skill de Integracion** incluido en el repositorio: `skills/integrar-microsistema/skill.md`.

Es un flujo de 6 pasos que garantiza integracion coherente (dashboard, manifest, docs, wiki, chequeos automaticos). Incluye plantillas listas para copiar y un archivo `referencia.txt` con ejemplo de inputs.

Consulta tambien la [Guia de Contribucion](../CONTRIBUTING.md#como-anadir-un-nuevo-microsistema).

### Es seguro habilitar el SQL Viewer en servidores de produccion?

El SqlViewer corre en modo solo lectura por defecto y tiene CSRF, rate limiting y
whitelist de hosts activos. Aun asi, **no esta disenado para exposicion publica**.
Si necesitas acceso desde otra maquina en tu red local, activa la autenticacion
basica descomentando el bloque `.htpasswd` en `.htaccess` y generando el archivo
de usuarios con `htpasswd -c /ruta/fuera/del/repo/.htpasswd tu_usuario`.
Ver [SECURITY.md](../SECURITY.md) para el modelo de amenaza completo.

### He perdido la conexion con la base de datos.

Asegurese de que el servicio `db` de Docker este en ejecucion o que las credenciales en su archivo `.env` coincidan con las de su servidor MySQL local.
