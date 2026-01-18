# Guía para Principiantes: ¿Por qué tantas carpetas? 🐣

Si eres nuevo en el desarrollo o este es tu primer contacto con una arquitectura profesional, ¡no te asustes! Aunque veas muchas carpetas y archivos, todo tiene un orden pensado para que trabajar sea más fácil, no más difícil.

Imagina que este proyecto es un **Taller de Herramientas Organizado**. Aquí te explicamos qué hay en cada "cajón".

---

## 📂 Las Carpetas principales

### 🛠️ `apps/` (El Cuarto de Herramientas)
Aquí es donde viven los programas que realmente usas (el Conversor, el SQL Viewer, etc.).
- **Para qué sirve**: Para que cada herramienta esté en su propia "casa". 
- **Ventaja**: Si quieres cambiar algo en una herramienta, no rompes las demás por accidente. Todo está separado y ordenado.

### 🧠 `src/` (El "Cerebro" del Sistema)
Aquí está el código que todas las aplicaciones comparten.
- **Para qué sirve**: Para no repetir trabajo. Por ejemplo, la forma de conectarse a la base de datos se escribe una sola vez aquí, y todas las herramientas de la carpeta `apps/` la usan.
- **Ventaja**: Si cambias la contraseña de tu base de datos, solo la cambias en un lugar, no en siete.

### 📚 `docs/` (La Biblioteca de Manuales)
Es el estante donde guardamos los libros de ayuda.
- **Para qué sirve**: Para que el proyecto esté bien explicado (como esta misma guía).
- **Ventaja**: Al estar en su propia carpeta, los manuales no se mezclan con el código de programación.

### 📦 `vendor/` (Piezas de Repuesto de Fábrica)
Aquí se guardan herramientas que otros programadores ya hicieron y que nosotros aprovechamos. 
- **Importante**: **¡No toques nada aquí!** Esta carpeta la maneja automáticamente un programa llamado *Composer*.
- **Ventaja**: Nos permite usar piezas de alta calidad sin tener que fabricarlas nosotros desde cero.

### 🧪 `.github/` (La Fábrica Automática)
Contiene las instrucciones para que el sitio de GitHub trabaje por ti.
- **Para qué sirve**: Permite que, cada vez que subes un cambio, GitHub revise que todo esté bien y lo publique en internet automáticamente.

---

## 📄 Los Archivos sueltos (Los Interruptores)

*   **`index.php`**: Es la "Puerta de Entrada". Es lo primero que ves (el Dashboard) donde eliges qué herramienta usar.
*   **`.env`**: Es una "Nota Secreta". Aquí guardas datos sensibles como contraseñas de bases de datos. Es como el post-it que pegas en la nevera con claves importantes.
*   **`composer.json`**: Es la "Lista de la Compra". Le dice al sistema qué piezas de la carpeta `vendor/` necesitamos descargar.
*   **`Dockerfile`**: Son las "Instrucciones de Montaje". Permiten que el proyecto se meta en una burbuja protegida (llamada contenedor) para que funcione igual en cualquier computadora del mundo.

---

## 🎯 ¿Por qué es mejor así?

Aunque parezca que hay muchas cosas, esta estructura te da **Superpoderes**:
1.  **Orden total**: Sabes exactamente dónde buscar cada cosa.
2.  **Seguridad**: Tus contraseñas están protegidas en un archivo aparte.
3.  **Crecimiento**: Si mañana quieres añadir una herramienta nueva, solo creas una carpeta en `apps/` y listo.

**¡Felicidades!** Ahora ya conoces cómo funciona por dentro una suite de herramientas profesional. 🚀✨
