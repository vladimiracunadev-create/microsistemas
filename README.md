# Microsistemas – Caja de herramientas para productividad y modernización

Este directorio reúne una colección de **microsistemas web autocontenidos**, orientados a facilitar tareas recurrentes de **desarrollo, mantención, diagnóstico y modernización de sistemas**.

El foco principal está en:
- Productividad del desarrollador.
- Soporte y migración de sistemas legacy.
- Herramientas simples, claras y reutilizables.
- Compatibilidad con entornos antiguos y modernos.

Incluye microsistemas desarrollados en **PHP (desde 5.4 hasta 8.x)** y **HTML + JavaScript moderno**, pensados tanto para uso real como para **demostración técnica en portafolio**.

---

## Cómo ejecutar los microsistemas (XAMPP / Apache + PHP)

Estos microsistemas están pensados para funcionar en un entorno local tipo **XAMPP** (Windows) o equivalente (**MAMP**, **LAMP**, etc.), es decir:

- Servidor **Apache**
- PHP (según corresponda al microsistema)

### Opción recomendada (XAMPP)
1) Instala XAMPP.
2) Copia este proyecto dentro de:
   - `C:\xampp\htdocs\microsistemas\` (ejemplo Windows)
3) Abre XAMPP Control Panel y levanta:
   - **Apache**
   - (opcional) **MySQL** si vas a usar microsistemas que consulten BD
4) Abre en navegador:
   - `http://localhost/microsistemas/`

> Importante: los microsistemas **HTML + JS** (como el de Git) cargan `cases.json` vía `fetch()`.  
> Por seguridad del navegador, **debe abrirse desde un servidor** (Apache), y no con `file://`.

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
- Exportación por descarga de archivos.
- Preparación del flujo local típico:
  1) Generar el YAML en el repo.
  2) `git add / commit / push`.
  3) La plataforma (GitHub Actions / Amplify / Kubernetes / etc.) ejecuta la automatización.

### Notas importantes
- Un archivo `.yml/.yaml` **no ejecuta nada por sí mismo**: es una “receta” que interpreta una herramienta.
- Los **secrets** no deben quedar hardcodeados en el repo: se usan secrets/variables del proveedor (por ejemplo, GitHub Secrets).

---

## Microsistema 7: Entrenador de Comandos Git – “Qué hace / Cuándo usarlo / Comandos” (`gitcommand.html`)

Microsistema web **HTML + CSS + JavaScript** orientado a **aprender y usar Git con claridad**, mostrando para cada caso 3 secciones separadas:

1) **Qué hace** (explicación directa)  
2) **Cuándo usarlo** (contexto real, para no dudar)  
3) **Comandos** (bloque **editable y copiable**)  

El objetivo es que Git deje de ser “memoria de flags” y se convierta en una **biblioteca de recetas** navegable.

### Archivos (en la MISMA carpeta)
- `gitcommand.html` (interfaz)
- `gitcommand.css` (estilos)
- `gitcommand-app.js` (lógica)
- `cases.json` (**base de datos de casos**, 1000+)

### Cómo ejecutarlo (XAMPP / Apache)
1) Copia el proyecto dentro de `htdocs` (ejemplo):
   - `C:\xampp\htdocs\microsistemas\`
2) Levanta **Apache** en XAMPP.
3) Abre:
   - `http://localhost/microsistemas/gitcommand.html`

> Nota: no abrir con doble click (file://). Debe ser por `http://localhost/...` para que `fetch('cases.json')` funcione.

---

## Licencia (uso y protección)

Este repositorio está pensado como **material técnico de portafolio** y **herramientas reutilizables**.

### Licencia recomendada: MIT + Restricción de marca/atribución (Portafolio)
- Puedes permitir uso del código (MIT) para aprendizaje y uso personal/comercial,
- pero protegerte de que te clonen el repo y lo presenten como propio sin atribución.

**Propuesta práctica (simple y clara):**
- Código bajo **MIT License** (libre uso).
- Requerimiento adicional (en README o NOTICE):
  - Mantener **atribución visible** al autor en el repo/documentación.
  - No usar tu nombre/marca para promocionar derivados sin permiso.

> Si quieres máxima protección contra “republicación tal cual” (sin atribución), se puede cambiar a una licencia más restrictiva (ej: “All Rights Reserved” o “Source-Available” personalizada).  
> Pero para portafolio, MIT + atribución suele ser un buen balance: se ve profesional y a la vez te protege del plagio descarado.

---

## Objetivo general del directorio

Este conjunto de microsistemas funciona como una **caja de herramientas personal y laboratorio técnico**, orientado a:

- Acelerar tareas de desarrollo y soporte.
- Facilitar procesos de migración tecnológica.
- Documentar experiencia real en:
  - Sistemas legacy.
  - Modernización progresiva.
  - Buenas prácticas.
  - Productividad del desarrollador.

Además, sirve como **material demostrativo de portafolio**, mostrando capacidad para:

- Diseñar herramientas útiles y reutilizables.
- Combinar tecnologías antiguas y modernas.
- Resolver problemas reales de mantenimiento de sistemas.

## Licencia
Este proyecto se distribuye bajo licencia MIT.  
Ver `LICENSE` y `NOTICE` (atribución y uso de marca).