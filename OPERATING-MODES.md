# Modos de Operacion (OPERATING MODES)

El ecosistema **Microsistemas** ha sido disenado con pragmatismo para poder ejecutarse bajo distintas aproximaciones segun la meta del desarrollador, operador o revisor. En este documento sintetizamos que modos existen, cuando utilizar cada uno, y su respectivo nivel de fidelidad en comparacion a produccion.

## 1. Modo Estandar Containerizado (Docker & Docker Compose)

**Este es el modo oficial y recomendado para la evaluacion del proyecto o despliegue en un VPS.**

- **El Como:** Funciona a traves de los archivos `Dockerfile` y `docker-compose.yml`. Se ejecuta de forma abstracta usando el binario Make (`make up`) o directamente con `docker-compose up -d`.
- **Ventajas:**
  - Infraestructura inmutable. Garantiza las versiones de PHP (8.1) y Base de Datos.
  - El enrutamiento local y el healthcheck vienen auto-configurados.
  - Reduccion total de friccion en la instalacion (No importa Windows, Mac o Linux, el contexto de ejecucion sera identico dentro del contenedor).
- **Limites:** Consumo de recursos un poco mas elevado (requiere la maquina virtual o demonio local de Docker).

## 2. Modo Desarrollo Veloz (PHP Built-in Web Server)

**Ideal para desarrolladores haciendo cambios incrementales en el frontend o analizando el core.**

- **El Como:** Invoca el servidor web interno de PHP mediante `make serve`. (Requiere tener PHP instalado de manera nativa en tu ordenador).
- **Ventajas:**
  - Levanta instantaneamente en `http://localhost:8000`.
  - Perfecto si no deseas consumir recursos con Docker u otras VM locales.
- **Limites:**
  - No incorpora o expone una base de datos local asociada de forma predeterminada (las aplicaciones del repositorio que persisten informacion o conectan a SQL (ej: SqlViewer) mostraran fallos de conexion salvo se apunte el `.env` a un MySQL accesible de manera externa o paralela).

## 3. Modo Legacy / Hibrido (XAMPP, WAMP, LAMP)

**Ideal para flujos de despliegue sobre sistemas compartidos de hace 10 anos, demostrando resiliencia y fuerte compatibilidad hacia atras.**

- **El Como:** Se clona el contenido del repositorio directamente en el sub-directorio publico por defecto (ej. `C:\xampp\htdocs\microsistemas\`).
- **Ventajas:**
  - Permite levantar sistemas que asumen las rutas con la raiz del nombre de carpeta (`http://localhost/microsistemas/`).
  - Uso extendido en academias o empresas tradicionales sin acceso a arquitecturas efimeras o Docker.
- **Limites:**
  - Podrian surgir problemas de resolucion de rutas relativas o variables de entorno `DOCUMENT_ROOT` si el sistema no esta configurado como host virtual independiente (VirtualHost en Apache). Sin embargo, el "Core" de microsistemas esta codificado para adaptarse en la medida de lo posible a los subdirectorios.

## 4. Modo Desacoplado por Aplicacion Individual (Hub Local)

**Cuando solo precisas una pieza de toda la maquinaria.**

- **El Como:** En ocasiones es innecesario levantar el "Dashboard Web", en su lugar se usa la interfaz CLI (Hub). Se accesa o se prueba la microaplicacion sola (ej: `make hub-run APP=YmlGenerator`).
- **Ventajas:** Aisla el diagnostico tecnico por completo, evaluando scripts puntuales sin ruido web.
