# Guía Detallada para Principiantes: Recorrido por el Taller 🐣

Si quieres entender exactamente qué hay dentro de cada "cajón" de este proyecto, este manual es para ti. Vamos a abrir cada carpeta y explicar qué piezas tiene dentro y por qué son importantes.

---

## 📂 1. La carpeta `apps/` (Las Herramientas)

Esta es la zona de trabajo. Aquí es donde están los programas que tú abres y usas.

* **¿Qué hay dentro?**: Una carpeta por cada herramienta (ej. `AwsGenerator/`, `CapacitySim/`, `CicdLibrary/`, `Conversor/`).
* **En cada subcarpeta encontrarás**:
  * `index.php` o `index.html`: El archivo principal de la herramienta.
  * `README.md`: Las instrucciones específicas de esa herramienta.
* **Para el novato**: Piensa en esto como una galería de mini-sitios web que viven juntos pero no se molestan entre sí.

---

## 📂 2. La carpeta `src/` (El Motor Central)

Aquí es donde vive el "ingenio" que hace que todo funcione de forma moderna.

* **Subcarpeta `Core/`**:
  * `Config.php`: El encargado de leer tus contraseñas y ajustes.
  * `Database.php`: El encargado de hablar con MySQL.
* **Para el novato**: Es como la sala de máquinas de un barco. Los pasajeros (las apps) no la ven, pero sin ella el barco no se mueve.

---

## 📂 3. La carpeta `docs/` (La Biblioteca)

Aquí guardamos el conocimiento del proyecto para que no se pierda.

* **`ARCHITECTURE.md`**: El mapa técnico de cómo se conectan las piezas.
* **`INSTALL.md`**: El paso a paso para que el sistema funcione en tu PC.
* **`USER_MANUAL.md`**: La guía de uso para aprender a usar los programas.
* **`SYSTEMS_CATALOG.md`**: Una lista detallada de qué hace cada herramienta.
* **Para el novato**: Es el estante donde tienes todos los manuales de instrucciones guardados en un solo lugar.

---

## 📂 4. La carpeta `vendor/` (Piezas de Fábrica)

Esta carpeta es automática. La crea un programa llamado *Composer*.

* **¿Qué hay dentro?**: Librerías externas (código hecho por otras personas) que nosotros usamos para que el sistema sea más potente (ej: el sistema que gestiona los archivos `.env`).
* **Para el novato**: Es como si compraras un mueble de IKEA y esta carpeta fuera la caja de tornillos y llaves Allen que vienen de fábrica. **No necesitas tocarla.** Recuerda: esta carpeta se borra y se crea sola. Si alguna vez el sistema falla porque "falta una pieza", lo más probable es que necesites que *Composer* rellene esta carpeta de nuevo.

---

## 📂 5. La carpeta `.github/` (La Automatización)

Esta carpeta conecta tu código con los servidores de GitHub.

* **Subcarpeta `workflows/`**:
  * `ci.yml`: El robot que revisa que todo funcione antes de aceptar cambios.
  * `wiki-sync.yml`: El robot que mantiene la Wiki actualizada.
  * `docker-publish.yml`: El robot que fabrica tu paquete oficial.
* **Archivo `dependabot.yml`**: Un robot auditor que lee constantemente tus herramientas prestadas (`vendor/`) y te avisa muy amablemente (haciendo un "Pull Request") cuando alguna pieza se volvió vieja o insegura.
* **Para el novato**: Es como tener un equipo de robots invisibles que limpian, organizan y vigilan tu proyecto cada vez que tú terminas de trabajar.

---

## 📄 Archivos clave en la raíz (Los Controles)

* **`index.php`**: El menú principal que ves al principio.
* **`.env`**: Donde escribes los datos de tu base de datos.
* **`composer.json`**: El "Inventario" de piezas externas.
* **`Dockerfile`**: El "Molde" para crear la burbuja de Docker.
* **`Makefile`**: Control remoto con botones rápidos para tareas comunes.

---

## 💡 Consejo para el Principiante

Si quieres aprender, empieza explorando las carpetas dentro de **`apps/`**. Ahí verás cómo se hace una página web sencilla. Luego, cuando te sientas valiente, asómate a **`src/Core/`** para ver cómo la magia de PHP conecta todo.

**¡Diviértete explorando! El orden es tu mejor amigo.** 🚀✨
