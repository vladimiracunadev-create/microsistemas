# Guía de Instalación 🚀

Para desplegar **Microsistemas** de forma exitosa, elige el método que mejor se adapte a tu entorno.

## 🐳 Método Recomendado: Docker

El despliegue con Docker es el más rápido (menos de 30 segundos) y garantiza que todas las dependencias estén presentes.

```bash
docker-compose up -d
```
*   **Dashboard**: `http://localhost:8080`
*   **Beneficios**: Infraestructura inmutable, sin necesidad de instalar PHP o extensiones localmente.

## 🐘 Instalación con XAMPP (Windows)

1.  Clona el repositorio en tu carpeta `htdocs`:
    ```bash
    git clone https://github.com/vladimiracunadev-create/microsistemas.git
    ```
2.  Configura el entorno:
    *   Renombra `.env.example` a `.env`.
    *   Ejecuta `composer install` si tienes Composer instalado.
3.  Accede vía: `http://localhost/microsistemas/`

## 🐧 Instalación en Linux (Apache/Nginx)

1.  Asegúrate de cumplir con los **[Requisitos del Sistema](Requisitos-del-Sistema)**.
2.  Configura los permisos de carpeta:
    ```bash
    chmod -R 755 .
    chown -R www-data:www-data .
    ```
3.  Configura tu VirtualHost apuntando al directorio raíz.

---
👉 **Próximo paso**: Consulta el **[Manual de Usuario](Manual-de-Usuario)**.
