# Guia Detallada para Principiantes: Recorrido por el Taller 🐣

Si quieres entender exactamente que hay dentro de cada "cajon" de este proyecto, este manual es para ti. Vamos a abrir cada carpeta y explicar que piezas tiene dentro y por que son importantes.

---

## 📂 1. La carpeta `apps/` (Las Herramientas)

Esta es la zona de trabajo. Aqui es donde estan los programas que tu abres y usas.

* **Que hay dentro?**: Una carpeta por cada herramienta (ej. `AwsGenerator/`, `CapacitySim/`, `CicdLibrary/`, `Conversor/`).
* **En cada subcarpeta encontraras**:
  * `index.php` o `index.html`: El archivo principal de la herramienta.
  * `README.md`: Las instrucciones especificas de esa herramienta.
* **Para el novato**: Piensa en esto como una galeria de mini-sitios web que viven juntos pero no se molestan entre si.

---

## 📂 2. La carpeta `src/` (El Motor Central)

Aqui es donde vive el "ingenio" que hace que todo funcione de forma moderna.

* **Subcarpeta `Core/`**:
  * `Config.php`: El encargado de leer tus contrasenas y ajustes.
  * `Database.php`: El encargado de hablar con MySQL.
* **Para el novato**: Es como la sala de maquinas de un barco. Los pasajeros (las apps) no la ven, pero sin ella el barco no se mueve.

---

## 📂 3. La carpeta `docs/` (La Biblioteca)

Aqui guardamos el conocimiento del proyecto para que no se pierda.

* **`ARCHITECTURE.md`**: El mapa tecnico de como se conectan las piezas.
* **`INSTALL.md`**: El paso a paso para que el sistema funcione en tu PC.
* **`USER_MANUAL.md`**: La guia de uso para aprender a usar los programas.
* **`SYSTEMS_CATALOG.md`**: Una lista detallada de que hace cada herramienta.
* **Para el novato**: Es el estante donde tienes todos los manuales de instrucciones guardados en un solo lugar.

---

## 📂 4. La carpeta `vendor/` (Piezas de Fabrica)

Esta carpeta es automatica. La crea un programa llamado *Composer*.

* **Que hay dentro?**: Librerias externas (codigo hecho por otras personas) que nosotros usamos para que el sistema sea mas potente (ej: el sistema que gestiona los archivos `.env`).
* **Para el novato**: Es como si compraras un mueble de IKEA y esta carpeta fuera la caja de tornillos y llaves Allen que vienen de fabrica. **No necesitas tocarla.** Recuerda: esta carpeta se borra y se crea sola. Si alguna vez el sistema falla porque "falta una pieza", lo mas probable es que necesites que *Composer* rellene esta carpeta de nuevo.

---

## 📂 5. La carpeta `.github/` (La Automatizacion)

Esta carpeta conecta tu codigo con los servidores de GitHub.

* **Subcarpeta `workflows/`**:
  * `ci.yml`: El robot que revisa que todo funcione antes de aceptar cambios.
  * `wiki-sync.yml`: El robot que mantiene la Wiki actualizada.
  * `docker-publish.yml`: El robot que fabrica tu paquete oficial.
* **Archivo `dependabot.yml`**: Un robot auditor que lee constantemente tus herramientas prestadas (`vendor/`) y te avisa muy amablemente (haciendo un "Pull Request") cuando alguna pieza se volvio vieja o insegura.
* **Para el novato**: Es como tener un equipo de robots invisibles que limpian, organizan y vigilan tu proyecto cada vez que tu terminas de trabajar.

---

## 📄 Archivos clave en la raiz (Los Controles)

* **`index.php`**: El menu principal que ves al principio.
* **`.env`**: Donde escribes los datos de tu base de datos.
* **`composer.json`**: El "Inventario" de piezas externas.
* **`Dockerfile`**: El "Molde" para crear la burbuja de Docker.
* **`Makefile`**: Control remoto con botones rapidos para tareas comunes.

---

## 💡 Consejo para el Principiante

Si quieres aprender, empieza explorando las carpetas dentro de **`apps/`**. Ahi veras como se hace una pagina web sencilla. Luego, cuando te sientas valiente, asomate a **`src/Core/`** para ver como la magia de PHP conecta todo.

**Diviertete explorando! El orden es tu mejor amigo.** 🚀✨
