# Microsistemas – Recordatorio de herramientas para mejorar la productividad

Este directorio reúne una serie de **microsistemas web** desarrollados en PHP cuyo objetivo es facilitar tareas recurrentes de desarrollo, mantención y diagnóstico de sistemas.  
Son herramientas simples, autocontenidas y pensadas para trabajar con entornos desde **PHP 5.4** hacia versiones más recientes, ayudando especialmente en procesos de migración y soporte.

---

## Microsistema 1: Conversor de Acentos (`conversor.php`)

Herramienta para **transformar texto con acentos, ñ y símbolos especiales** en diferentes formatos útiles para desarrollo web:

- Conversión a entidades HTML (numéricas y nominativas).
- Conversión a representaciones compatibles con JavaScript (por ejemplo, secuencias Unicode).
- Ideal para preparar mensajes, textos dinámicos y cadenas que se insertarán en código PHP, HTML o JS sin perder caracteres especiales.

Este microsistema ayuda a evitar problemas de codificación y de visualización en navegadores y plantillas antiguas o mezcladas.

---

## Microsistema 2: Php My Admin Acotado (`phpmyadmin_especifico.php`)

Versión **simplificada y controlada** de un visor de bases de datos, inspirada en phpMyAdmin, pero acotada a un contexto específico:

- Panel izquierdo con listado de tablas (y vistas, según implementación).
- Panel derecho para ejecutar consultas SQL (principalmente `SELECT`) y ver los resultados en la misma página.
- Posibilidad de soportar operaciones `INSERT`, `UPDATE` y `DELETE` con confirmación, para minimizar errores.
- Pensado para entornos donde no se quiere o no se puede instalar phpMyAdmin completo, o donde se requiere un acceso más restringido.

Es especialmente útil como herramienta interna para revisión rápida de datos y pruebas controladas.

---

## Microsistema 3: Visor de Archivos de Configuración (`visor_logs.php`)

Microsistema orientado a **inspeccionar archivos de configuración y logs** desde el navegador:

- Permite visualizar archivos como:
  - Logs de aplicación o del servidor web.
  - Archivos de configuración relevantes (por ejemplo, `php.ini`, archivos `.conf` de Apache u otros).
- Muestra el contenido en uno o más `textarea` o áreas de lectura, facilitando la inspección sin necesidad de conectarse por SSH o abrir un editor en el servidor.
- Diseñado principalmente como visor (modo lectura), para disminuir el riesgo de modificaciones accidentales.

Ideal para diagnóstico rápido, revisión de errores y verificación de parámetros de configuración.

---

## Microsistema 4: Migrador Parcial de PHP 5.4 a PHP 8 (`cambiophp.php`)

Herramienta de apoyo para **modernizar código PHP antiguo** (por ejemplo, de PHP 5.4) hacia versiones más nuevas (PHP 8.x):

- Permite pegar código legacy en un `textarea` de entrada.
- Aplica una serie de transformaciones parciales y sugerencias, por ejemplo:
  - Ajustes de sintaxis obsoleta.
  - Primeros pasos para migrar funciones y extensiones antiguas a alternativas modernas.
  - Mejora de compatibilidad con PHP 8.x, manteniendo la referencia del código original.
- El objetivo es servir como **ayuda inicial de migración**, no como migrador automático completo, facilitando el trabajo del desarrollador al destacar áreas problemáticas y patrones repetitivos.

---

## Objetivo general del directorio

Estos microsistemas están pensados como un **laboratorio personal y caja de herramientas** para:

- Acelerar tareas de diagnóstico, revisión y migración.
- Documentar y demostrar capacidades técnicas en:
  - Manejo de encoding y caracteres especiales.
  - Trabajo con bases de datos desde PHP.
  - Lectura de logs y configuraciones de servidor.
  - Modernización de código desde PHP 5.4 a PHP 8.x.

Pueden utilizarse tanto como utilidades reales en entornos controlados, como **material demostrativo** de experiencia y buenas prácticas en desarrollo backend con PHP.
