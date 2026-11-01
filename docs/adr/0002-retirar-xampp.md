# ADR-0002: Retirar XAMPP como runtime soportado

- **Estado:** Aceptada
- **Fecha:** 2026-10-26
- **Decision relacionada:** remediacion de CVE-2026-109618 y CVE-2026-109619
- **Supersede:** la opcion XAMPP descrita en ADR-0001; ADR-0001 se conserva
  como registro historico.

## Contexto

La suite usaba XAMPP para pruebas locales. Ese acoplamiento hacia dificil
garantizar que el PHP incluido recibiera un parche de seguridad a tiempo. Una
instalacion encontrada durante la revision ejecutaba PHP 8.2.12, inferior a
8.2.35 y, por tanto, no cumplia el minimo fijado tras los avisos criticos de
octubre de 2026.

## Decision

1. Docker es el modo recomendado y usa una imagen con version PHP fijada.
2. PHP CLI oficial reemplaza XAMPP para desarrollo local mediante
   `hub.ps1 serve`, `bash hub.sh serve` o `make serve`.
3. El Hub valida la rama y el parche con `scripts/check_php_runtime.php` antes
   de arrancar y deshabilita `session.upload_progress.enabled`.
4. XAMPP no forma parte de los requisitos, pruebas ni soporte del proyecto.
5. Apache/Nginx siguen siendo validos en produccion si son administrados por el
   operador y usan un PHP admitido.

## Continuidad funcional

| Necesidad anterior | Sustitucion | Resultado |
|---|---|---|
| Servir PHP localmente | PHP CLI en `127.0.0.1:8000` | Mismas rutas `apps/...` |
| Entorno reproducible | Docker en `127.0.0.1:8080` | PHP y configuracion fijados |
| Base MySQL local | Servicio existente o Compose | SQL Viewer conserva PDO |
| Extensiones PHP | `php.ini` del binario oficial | Configuracion explicita |
| Reglas Apache | Docker o servidor administrado | No se prometen en PHP CLI |

## Migracion y recuperacion

El cambio no elimina programas ni datos. Antes de desinstalar el runtime
anterior se deben exportar bases de datos, copiar `.env` y archivos locales,
registrar extensiones activas y validar todas las aplicaciones con el modo
nuevo. Si falla, el operador puede conservar temporalmente la instalacion
anterior fuera del flujo soportado mientras corrige la migracion, sin exponerla
a red.

## Consecuencias

- Se reduce el riesgo de ejecutar un PHP atrasado por el ciclo de un paquete.
- La URL local pasa a `http://127.0.0.1:8000`.
- PHP CLI no procesa `.htaccess` y no es apto para produccion.
- La base de datos deja de estar implicita; debe configurarse o iniciarse con
  Compose.
