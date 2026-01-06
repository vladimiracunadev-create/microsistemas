# Microsistemas – Caja de herramientas para productividad y modernización

Este directorio reúne una colección de **microsistemas web autocontenidos**, orientados a facilitar tareas recurrentes de **desarrollo, mantención, diagnóstico y modernización de sistemas**.

El foco principal está en:
- Productividad del desarrollador.
- Soporte y migración de sistemas legacy.
- Herramientas simples, claras y reutilizables.
- Compatibilidad con entornos antiguos y modernos.

Incluye microsistemas desarrollados en **PHP (desde 5.4 hasta 8.x)** y **HTML + JavaScript moderno**, pensados tanto para uso real como para **demostración técnica en portafolio**.

---

## Microsistema 1: Conversor de Acentos (`conversor.php`)

Herramienta para **transformar texto con acentos, ñ y símbolos especiales** en formatos útiles para desarrollo web:

- Conversión a entidades HTML (numéricas y nominativas).
- Conversión a formatos compatibles con JavaScript (Unicode / escapes).
- Preparación segura de textos para:
  - HTML
  - PHP
  - JavaScript
  - Plantillas antiguas o mixtas

Este microsistema ayuda a prevenir errores de encoding y problemas de visualización en navegadores, correos, PDFs o sistemas legacy.

---

## Microsistema 2: PhpMyAdmin Acotado (`phpmyadmin_especifico.php`)

Versión **simplificada y controlada** de un visor de bases de datos, inspirado en phpMyAdmin, pero diseñado para contextos restringidos:

- Panel izquierdo con listado de tablas y/o vistas.
- Panel derecho para ejecutar consultas SQL (principalmente `SELECT`).
- Posibilidad de habilitar `INSERT`, `UPDATE` y `DELETE` con confirmación explícita.
- Acceso limitado y más seguro que un phpMyAdmin completo.

Ideal para:
- Entornos productivos sensibles.
- Revisión rápida de datos.
- Soporte técnico sin exponer herramientas completas de administración.

---

## Microsistema 3: Visor de Logs y Configuración (`visor_logs.php`)

Herramienta orientada a la **inspección de archivos críticos desde el navegador**, en modo lectura:

- Visualización de:
  - Logs de aplicación.
  - Logs del servidor web.
  - Archivos de configuración (`php.ini`, `.conf`, etc.).
- Uso de `textarea` o vistas de solo lectura.
- Minimiza el riesgo de modificaciones accidentales.

Especialmente útil para:
- Diagnóstico rápido.
- Revisión de errores.
- Verificación de parámetros sin acceso SSH.

---

## Microsistema 4: Migrador Parcial PHP 5.4 → PHP 8.x (`cambiophp.php`)

Herramienta de apoyo para **modernización progresiva de código PHP legacy**:

- Entrada de código PHP antiguo vía `textarea`.
- Aplicación de transformaciones parciales y sugerencias:
  - Detección de sintaxis obsoleta.
  - Señalización de funciones incompatibles.
  - Recomendaciones de reemplazo.
- No reemplaza una migración completa, pero **acelera enormemente el trabajo manual**.

Pensado como:
- Asistente de migración.
- Detector de patrones repetitivos.
- Herramienta educativa para entender brechas entre PHP 5.x y 8.x.

---

## Microsistema 5: Herramientas JavaScript – Productividad Frontend (`herramientas_javascript.html`)

Aplicación web con diseño moderno tipo *developer tool*, orientada a trabajar directamente con código JavaScript.

### Archivos
- `herramientas_javascript.html` (interfaz principal)
- `hj.css` (estilos)
- `hj.js` (lógica JavaScript)

### Funcionalidades principales
- Entrada de código JavaScript mediante:
  - Pegado manual en textarea.
  - Carga de archivo `.js`.
  - Carga desde URL.
  - Pegado desde portapapeles.

### Acciones disponibles
- Minificar código (Terser).
- Formatear / Beautify (js-beautify).
- Validar / Lint (ESLint).
- Ofuscar código.
- Transpilar JavaScript moderno a ES5 (Babel).
- Eliminar comentarios (lineales y de bloque).
- Escapar / des-escapar como JSON string.
- Analizar tamaño (original vs minificado).
- Ejecutar código en sandbox (captura `log/warn/error/info` y errores).

### Extras de productividad
- Contadores de caracteres y tamaño en KB.
- Copiar entrada / salida.
- Usar salida como nueva entrada.
- Descarga automática del resultado con nombre sugerido.
- Interfaz responsive y clara.

---

## Microsistema 6: Generador de YAML / YML – Automatización de Configuración (`ymlstudio.html`)

Microsistema web **HTML + CSS + JavaScript** orientado a **crear archivos `.yml/.yaml` por formulario**, con plantillas listas para automatizar tareas comunes de desarrollo y despliegue.

### Objetivo
Reducir errores y tiempo al escribir YAML “a mano”, entregando:
- Formularios guiados por **plantillas** (casos de uso).
- **Vista previa** inmediata del YAML generado.
- Exportación por:
  - Descarga de archivo(s), y/o
  - Guardado en la ruta correcta dentro del repo (según soporte del navegador).
- Preparación del flujo local típico:
  1) Generar el YAML en el repo.
  2) `git add / commit / push`.
  3) La plataforma (por ejemplo GitHub Actions o Amplify) ejecuta la automatización.

### Casos de uso típicos (plantillas)
- **CI/CD (GitHub Actions)**:
  - CI (tests/lint/build) en push/PR.
  - Matrices por versiones (Node/PHP).
  - Deploy automatizado (por ejemplo SSH + `docker compose`).
  - GitHub Pages.
  - Tareas programadas (cron) y ejecución manual (workflow_dispatch).
- **Docker Compose**:
  - Stack mínimo (1 servicio).
  - Stack dev clásico (web + MySQL + Adminer).
  - Nginx + PHP-FPM + MySQL (base para migraciones).
- **AWS (ejemplos base)**:
  - `amplify.yml` para hosting con build automático.
  - `template.yml` de CloudFormation (infra como código).
  - `template.yml` de AWS SAM (serverless).
- **Kubernetes (base)**:
  - Deployment + Service, Ingress, ConfigMap, CronJob.
- **Mantenimiento de repo**:
  - Dependabot.
  - pre-commit.
- **Observabilidad / Config**:
  - Prometheus / OpenTelemetry (config básica).
  - Config de apps (ej: Spring) y documentación (ej: MkDocs).

### Notas importantes
- Un archivo `.yml/.yaml` **no ejecuta nada por sí mismo**: es una “receta” que interpreta una herramienta (GitHub Actions, Docker, Amplify, Kubernetes, etc.).
- Los **secrets** no deben quedar hardcodeados en el repo: se usan las secciones de secrets/variables del proveedor (por ejemplo, *GitHub Secrets*).

---

## Microsistema 7: Entrenador de Comandos Git – “Qué hace / Cuándo usarlo / Comandos” (`gitcommand.html`)

Microsistema web **HTML + CSS + JavaScript** orientado a **aprender y usar Git con claridad total**, mostrando para cada caso 3 secciones separadas:

1) **Qué hace** (explicación directa, sin relleno)  
2) **Cuándo usarlo** (contexto real, para no dudar)  
3) **Comandos** (bloque **editable y copiable**)  

El objetivo es que Git deje de ser “memoria de flags” y se convierta en una **biblioteca de recetas** navegable para:
- Aprendizaje progresivo (**simple → complejo**).
- Consulta rápida durante migraciones, soporte y trabajo diario.
- Evitar dudas típicas (“¿esto borra algo?”, “¿sirve en ramas compartidas?”).

### Archivos (en la MISMA carpeta)
- `gitcommand.html` (interfaz)
- `gitcommand.css` (estilos)
- `gitcommand-app.js` (lógica)
- `cases.json` (**base de datos de casos**, 1000+)

> Nota: el microsistema carga `cases.json` vía `fetch()`. Por seguridad del navegador, se recomienda abrirlo con un servidor local (no `file://`).

### Qué muestra al seleccionar un caso
- Panel: **Qué hace** (solo lectura)
- Panel: **Cuándo usarlo** (solo lectura)
- Panel: **Comandos** (editable)
  - Botón **Copiar**: copia **solo** el panel de comandos (no las explicaciones).

### Casos simples primero → complejos después
El archivo `cases.json` está ordenado para aprendizaje:
- Categorías en flujo pedagógico (inicio → config → add/commit → diff/log → ramas → remotos → integración → recovery → avanzado → AUTO).
- Dentro de cada categoría: **1 línea primero**, luego 2, 3… hasta recetas multi-línea.
- Incluye `nivel` (1–5) y `tema` (diff, log, branch, stash, rebase, etc.) para filtrar.

### Cómo ejecutarlo (recomendado)
Desde la carpeta donde está `gitcommand.html`:

```bash
python -m http.server 8000
