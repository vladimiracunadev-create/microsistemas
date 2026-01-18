# Microsistemas – Suite de Herramientas de Desarrollo

> [!NOTE]
> **Repositorio Reorganizado**: Este proyecto ha evolucionado hacia una arquitectura modular. Cada herramienta reside ahora en su propia carpeta bajo `apps/`.

Colección de **microsistemas web autocontenidos**, orientados a facilitar tareas recurrentes de **desarrollo, mantención, diagnóstico y modernización de sistemas**.

## 🚀 Inicio Rápido

### Opción A: Docker (Recomendada)
Si tienes Docker instalado, despliega todo el entorno con un solo comando:

```bash
docker-compose up -d
```
Accede al dashboard en: **`http://localhost:8080`**

### Opción B: XAMPP / Apache Manual
Si prefieres usar un servidor local tradicional:
1. Copia la carpeta del proyecto a `C:\xampp\htdocs\microsistemas\`.
2. Inicia Apache (y MySQL si usas el SQL Viewer).
3. Accede a: **`http://localhost/microsistemas/`**

---

## 📂 Catálogo de Herramientas

Cada herramienta se encuentra aislada en el directorio `apps/`, garantizando su independencia.

| Herramienta | Ruta Local (XAMPP) | Descripción |
| :--- | :--- | :--- |
| **Conversor** | `/apps/Conversor/` | Sanitización de textos y codificación HTML/Unicode. |
| **SQL Viewer** | `/apps/SqlViewer/` | Cliente ligero MySQL para consultas rápidas. |
| **Git Command** | `/apps/GitTrainer/` | Guía interactiva de casos de uso Git. |
| **JS Tools** | `/apps/JsTools/` | Minificador, Linter y Formatter de JavaScript. |
| **YML Gen** | `/apps/YmlGenerator/` | Creador visual de archivos YAML. |
| **Log Viewer** | `/apps/LogViewer/` | Visor seguro de logs y configuraciones. |
| **PHP Migrator** | `/apps/PhpMigrator/` | Asistente de migración PHP 5.x -> 8.x. |

---

## 🛠️ Estructura del Proyecto

```text
microsistemas/
├── apps/                  # Módulos independientes
│   ├── Conversor/         # Lógica encapsulada
│   ├── GitTrainer/        # + Assets propios
│   └── ...
├── docker-compose.yml     # Orquestación de contenedores
├── index.php              # Dashboard principal
└── README.md              # Documentación
```

## 🤝 Contribuir
Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para guías de estilo y flujo de trabajo.

## 📄 Licencia
Este proyecto se distribuye bajo los términos indicados en los archivos `LICENSE` y `NOTICE`.
