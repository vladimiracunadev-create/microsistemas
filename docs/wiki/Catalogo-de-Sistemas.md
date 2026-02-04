# Catálogo General de Sistemas y Arquitectura

Este manual proporciona una visión profunda de cada componente de la suite **Microsistemas**, explicando su propósito, importancia y la justificación técnica detrás de su creación.

---

## 🏛️ La Nueva Arquitectura Core (El "Motor")

Antes de detallar las aplicaciones, es fundamental entender los cambios estructurales realizados para transformar este proyecto en un **Paquete PHP Profesional**.

### 1. Sistema de Autoloading PSR-4
- **Qué es**: Un estándar moderno de carga automática de clases.
- **Por qué**: Elimina la necesidad de `include` o `require` manuales, reduciendo errores de "archivo no encontrado" y permitiendo que el sistema escale infinitamente sin desorden.
- **Importancia**: Garantiza que el proyecto funcione como una librería estándar de la industria, permitiendo la integración de cualquier paquete de terceros vía Composer.

### 2. Capa Core (Config & Database)
- **Qué es**: Clases centralizadas en `src/Core/` que gestionan la "inteligencia" compartida.
- **Por qué**: Aplicamos el patrón **Singleton** para la base de datos (una sola conexión para todo el sistema) y el patrón **12-Factor App** para la configuración (mediante archivos `.env`).
- **Importancia**: Separa la lógica de negocio de la configuración sensible. Si cambias de servidor o de base de datos, solo tocas un archivo, no todo el código.

### 3. Contenedores Docker e Infraestructura Inmutable
- **Qué es**: El sistema se empaqueta en una "caja" (contenedor) que incluye Apache, PHP y todas sus extensiones.
- **Por qué**: Para evitar el clásico error "en mi máquina funciona".
- **Importancia**: Permite que un nuevo desarrollador o un servidor de producción levante el sistema en segundos con una configuración idéntica a la original.

---

## 🛠️ Catálogo de Microsistemas (apps/)

### 📊 SQL Viewer (El Inspector de Datos)
- **¿Qué hace?**: Permite explorar bases de datos MySQL, ver tablas y ejecutar consultas SQL desde el navegador.
- **¿Para qué?**: Para evitar abrir herramientas pesadas como phpMyAdmin o clientes de escritorio para tareas rápidas de diagnóstico.
- **Importancia**: Es la herramienta de "primera respuesta". Permite verificar datos en tiempo real de forma segura gracias a sus avisos de confirmación en borrados.

### 📖 Git Trainer (La Biblioteca de Comandos)
- **¿Qué hace?**: Un buscador interactivo de comandos Git con explicaciones detalladas.
- **¿Para qué?**: Para servir como guía de referencia rápida ante escenarios complejos de Git que un desarrollador no recuerda de memoria.
- **Importancia**: Reduce errores humanos en el control de versiones, proporcionando comandos probados y seguros para el flujo de trabajo diario.

### 🐘 PHP Migrator (El Modernizador)
- **¿Qué hace?**: Analiza código PHP antiguo y sugiere cambios para versiones modernas (PHP 8.2+).
- **¿Para qué?**: Para facilitar la actualización de sistemas "legacy" (antiguos) que corren riesgo de seguridad por usar funciones obsoletas.
- **Importancia**: Da una segunda vida al software antiguo, transformando código de hace 10 años en código moderno y eficiente de forma guiada.

### 📝 Log Viewer (El Auditor Seguro)
- **¿Qué hace?**: Permite leer archivos de registro del servidor sin necesidad de acceder a la consola del sistema.
- **¿Para qué?**: Para diagnosticar por qué algo falló sin tener conocimientos avanzados de administración de servidores Linux.
- **Importancia**: Seguridad. Al usar una lista blanca de archivos, permite que un programador audite errores sin tener permisos de root o acceso a archivos sensibles del sistema operativo.

### 🔀 Conversor de Texto (El Sanitizador)
- **¿Qué hace?**: Codifica textos especiales en HTML o Unicode.
- **¿Para qué?**: Para asegurar que los textos con tildes o caracteres especiales no se "rompan" al enviarlos a una base de datos o mostrarlos en un sitio web.
- **Importancia**: Previene el *mojibake* (caracteres extraños) y asegura que tu aplicación sea compatible con estándares internacionales de codificación.

### 🛠️ JS Tools (El Optimizador)
- **¿Qué hace?**: Minifica, formatea y protege código JavaScript.
- **¿Para qué?**: Para preparar el código antes de subirlo a producción, haciéndolo más ligero y difícil de copiar por terceros.
- **Importancia**: Rendimiento y Propiedad Intelectual. Menos peso de archivo significa que tu web carga más rápido.

### 📄 YAML Studio (El Ingeniero de Configuración)
- **¿Qué hace?**: Generador visual de archivos de configuración YAML.
- **¿Para qué?**: Para crear archivos de Docker o CI/CD (como los que usa este propio proyecto) sin errores de indentación.
- **Importancia**: El formato YAML es estricto y un espacio de más puede romper todo. Esta herramienta elimina ese riesgo mediante la generación visual validada.

---

## 🚀 Conclusión: ¿Por qué creamos todo esto?

Este proyecto nació para convertir el desarrollo individual en un **proceso industrial**. 
- Cada sistema creado resuelve un **"dolor de cabeza"** específico del día a día de un programador.
- La unión de todos estos microsistemas bajo una arquitectura profesional (**Composer + Docker + CI/CD**) significa que ahora tienes una herramienta que no solo es útil, sino que es **robusta, escalable y digna de un entorno de ingeniería senior**.
