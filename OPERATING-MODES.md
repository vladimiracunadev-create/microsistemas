# Modos de Operación (OPERATING MODES)

El ecosistema **Microsistemas** ha sido diseñado con pragmatismo para poder ejecutarse bajo distintas aproximaciones según la meta del desarrollador, operador o revisor. En este documento sintetizamos qué modos existen, cuándo utilizar cada uno, y su respectivo nivel de fidelidad en comparación a producción.

## 1. Modo Estándar Containerizado (Docker & Docker Compose)

**Este es el modo oficial y recomendado para la evaluación del proyecto o despliegue en un VPS.**

- **El Cómo:** Funciona a través de los archivos `Dockerfile` y `docker-compose.yml`. Se ejecuta de forma abstracta usando el binario Make (`make up`) o directamente con `docker-compose up -d`.
- **Ventajas:**
  - Infraestructura inmutable. Garantiza las versiones de PHP (8.1) y Base de Datos.
  - El enrutamiento local y el healthcheck vienen auto-configurados.
  - Reducción total de fricción en la instalación (No importa Windows, Mac o Linux, el contexto de ejecución será idéntico dentro del contenedor).
- **Límites:** Consumo de recursos un poco más elevado (requiere la máquina virtual o demonio local de Docker).

## 2. Modo Desarrollo Veloz (PHP Built-in Web Server)

**Ideal para desarrolladores haciendo cambios incrementales en el frontend o analizando el core.**

- **El Cómo:** Invoca el servidor web interno de PHP mediante `make serve`. (Requiere tener PHP instalado de manera nativa en tu ordenador).
- **Ventajas:**
  - Levanta instantáneamente en `http://localhost:8000`.
  - Perfecto si no deseas consumir recursos con Docker u otras VM locales.
- **Límites:**
  - No incorpora o expone una base de datos local asociada de forma predeterminada (las aplicaciones del repositorio que persisten información o conectan a SQL (ej: SqlViewer) mostrarán fallos de conexión salvo se apunte el `.env` a un MySQL accesible de manera externa o paralela).

## 3. Modo Legacy / Híbrido (XAMPP, WAMP, LAMP)

**Ideal para flujos de despliegue sobre sistemas compartidos de hace 10 años, demostrando resiliencia y fuerte compatibilidad hacia atrás.**

- **El Cómo:** Se clona el contenido del repositorio directamente en el sub-directorio público por defecto (ej. `C:\xampp\htdocs\microsistemas\`).
- **Ventajas:**
  - Permite levantar sistemas que asumen las rutas con la raíz del nombre de carpeta (`http://localhost/microsistemas/`).
  - Uso extendido en academias o empresas tradicionales sin acceso a arquitecturas efímeras o Docker.
- **Límites:**
  - Podrían surgir problemas de resolución de rutas relativas o variables de entorno `DOCUMENT_ROOT` si el sistema no está configurado como host virtual independiente (VirtualHost en Apache). Sin embargo, el "Core" de microsistemas está codificado para adaptarse en la medida de lo posible a los subdirectorios.

## 4. Modo Desacoplado por Aplicación Individual (Hub Local)

**Cuando solo precisas una pieza de toda la maquinaria.**

- **El Cómo:** En ocasiones es innecesario levantar el "Dashboard Web", en su lugar se usa la interfaz CLI (Hub). Se accesa o se prueba la microaplicacion sola (ej: `make hub-run APP=YmlGenerator`).
- **Ventajas:** Aísla el diagnóstico técnico por completo, evaluando scripts puntuales sin ruido web.
