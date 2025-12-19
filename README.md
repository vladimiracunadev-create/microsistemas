
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

Versión **simplificada y controlada** de un visor de bases de datos, inspirada en phpMyAdmin, pero diseñada para contextos restringidos:

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

Aplicación web **100% autocontenida (HTML + CSS + JS)** con diseño moderno tipo *developer tool*, orientada a trabajar directamente con código JavaScript.

### Funcionalidades principales

- **Entrada de código JavaScript** mediante:
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
- Ejecutar código en **sandbox seguro** (captura `console.log` y errores).

### Extras de productividad

- Contadores de caracteres y tamaño en KB.
- Copiar entrada / salida.
- Usar salida como nueva entrada.
- Descarga automática del resultado con nombre sugerido.
- Interfaz moderna, responsive y clara.

Este microsistema funciona como una **navaja suiza para JavaScript**, ideal para:
- Debug rápido.
- Preparación de código para producción.
- Análisis y pruebas sin depender de herramientas externas.

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
