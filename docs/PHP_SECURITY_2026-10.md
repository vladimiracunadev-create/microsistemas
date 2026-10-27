# Actualizacion de seguridad PHP — octubre 2026

Fecha de revision: **2026-10-26**.

## Resumen

El 21 de octubre de 2026, el proyecto PHP publico correcciones para dos
vulnerabilidades criticas del runtime, ambas con CVSS v4.0 9.2:

| Vulnerabilidad | Descripcion | Versiones corregidas |
| :--- | :--- | :--- |
| [CVE-2026-109618](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w) | Corrupcion de memoria durante condiciones de falta de memoria, con posibilidad de RCE no autenticada. | `8.2.35`, `8.3.36`, `8.4.27`, `8.5.12` |
| [CVE-2026-109619](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp) | Uso de estado global obsoleto entre solicitudes, con posibilidad de RCE no autenticada. | `8.2.35`, `8.3.36`, `8.4.27`, `8.5.12` |

Son fallos de PHP Core, no de una dependencia Composer ni del codigo de una
microaplicacion. `composer audit` por si solo no demuestra que el interprete sea
seguro; por eso la remediacion fija y restringe tambien el runtime.

## Exposicion encontrada

Antes del cambio, las dos superficies ejecutables versionadas estaban afectadas:

| Superficie | Antes | Estado anterior | Despues |
| :--- | :--- | :--- | :--- |
| Imagen de produccion (`Dockerfile`) | `php:8.5.7-apache-bookworm` | Afectada | `php:8.5.12-apache-bookworm` |
| Demo Kubernetes (`k8s/demo/deployment.yaml`) | `php:8.2.27-apache-bookworm` | Afectada | `php:8.2.35-apache-bookworm` |

La aplicacion usa Apache y sesiones PHP en `SqlViewer`. El aviso oficial indica
que todos los SAPI que sirven solicitudes web estan en alcance y que el riesgo
es especialmente alto con `mod_php`, incluso antes de ejecutar codigo de la
aplicacion.

## Cambios aplicados

1. Se fijaron las imagenes oficiales en los niveles corregidos indicados arriba.
2. `composer.json` ahora exige una de estas ramas con su parche minimo:
   `~8.2.35 || ~8.3.36 || ~8.4.27 || ~8.5.12`.
3. CI ejecuta el analisis PHP sobre `8.2.35`, el menor runtime soportado.
4. `docker/php-security.ini` desactiva `session.upload_progress` antes del
   procesamiento de solicitudes. PHP recomienda esta defensa para reducir el
   vector de sesiones relacionado; no reemplaza la actualizacion del runtime.
5. Se sincronizaron la matriz de compatibilidad, requisitos, arquitectura,
   referencia de archivos, README, politica de seguridad y changelog.

## Revision de version del producto

El ultimo tag y el changelog establecen `v3.1.0` como version vigente. Se retiro
el campo manual `version` de `composer.json`: Composer recomienda obtener la
version desde Git y `validate --strict` advierte cuando el proyecto la duplica.
No se creo una release ni se modificaron entradas historicas del changelog.

## Operacion y verificacion

Reconstruir sin reutilizar la imagen vulnerable y verificar la version:

```bash
docker compose build --pull --no-cache web
docker compose run --rm web php -v
docker compose run --rm web php -r \
  "var_export((bool) ini_get('session.upload_progress.enabled'));"
```

El primer comando de version debe informar PHP `8.5.12`. El ultimo comando debe
imprimir `false`.

La imagen Docker no actualiza el PHP del host. En PHP CLI o servidores
administrados se debe instalar como minimo el nivel corregido correspondiente y
reiniciar todos los workers o servicios web. XAMPP fue retirado como runtime
soportado para no depender de la cadencia de actualizacion de un paquete. PHP
8.1 y anteriores quedan fuera del soporte regular upstream; este proyecto exige
migrar a una rama soportada.

## Referencias oficiales

- [Aviso general y versiones corregidas de PHP](https://www.php.net/archive/2026.php#2026-10-21-1)
- [GHSA-w8hw-w9fx-j79w / CVE-2026-109618](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w)
- [GHSA-6wmf-4rv5-p3rp / CVE-2026-109619](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp)
- [Aviso sobre progreso de carga de sesiones](https://www.php.net/archive/2026.php#2026-10-23-1)
