# Seguridad (SECURITY)

Este repositorio contiene microsistemas orientados a productividad y soporte técnico.  
Algunos de ellos (por diseño) trabajan con **archivos locales**, **logs** y/o **consultas a base de datos**, por lo que deben usarse con criterios de seguridad.

## Versiones soportadas

Este repositorio se mantiene como laboratorio/portafolio.  
Se recomienda usar siempre la versión más reciente disponible en la rama principal.

## Reporte responsable de vulnerabilidades

Si encuentras una vulnerabilidad, por favor **no la publiques como issue**.

- Describe el problema con pasos para reproducir.
- Indica el microsistema afectado y el archivo.
- Adjunta evidencia mínima (capturas, logs) sin exponer datos sensibles.

**Canal sugerido:** crear un issue marcado como “security” **sin datos sensibles** y solicitar contacto privado, o comunicarlo por el canal directo que definas en tu perfil.

## Guía de uso seguro (recomendaciones)

### 1) No exponer estos microsistemas a Internet
Estos microsistemas están pensados para uso local (XAMPP/MAMP/LAMP) o redes controladas.

✅ Recomendado: `http://localhost/...`  
❌ Evitar: servidor público accesible desde Internet.

### 2) Principio de “mínimo privilegio”
- Si un microsistema requiere credenciales de BD, usar un usuario con permisos mínimos (idealmente solo `SELECT`).
- Evitar credenciales de producción.

### 3) Microsistema 2 (PhpMyAdmin Acotado)
- Mantener `SELECT` como modo por defecto.
- Si se habilitan `INSERT/UPDATE/DELETE`, hacerlo solo con confirmaciones explícitas y en entornos controlados.

### 4) Microsistema 3 (Visor de Logs y Configuración)
- Debe operar en modo **solo lectura**.
- Usar whitelist de rutas/archivos permitidos.
- Bloquear traversal (`../`) y rutas absolutas fuera del scope permitido.

### 5) Datos sensibles
Nunca guardar:
- Passwords, tokens, keys, secrets en el repositorio.
- Dumps productivos o logs con datos personales.

Usar variables de entorno y archivos fuera del repo si aplica.

## Alcance
Este documento define lineamientos de seguridad y buenas prácticas de uso.  
La responsabilidad final de despliegue y exposición del entorno es del usuario/operador.
