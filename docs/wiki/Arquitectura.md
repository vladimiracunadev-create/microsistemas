# Arquitectura del Sistema 🏗️

Microsistemas está construido bajo una filosofía modular y desacoplada, permitiendo que cada herramienta funcione de forma independiente compartiendo un núcleo mínimo.

## 🗺️ Diagrama de Componentes

```mermaid
graph TD
    User([Usuario]) --> WebUI[Dashboard Principal]
    User --> CLI[Hub CLI / Makefile]
    
    subgraph "Core Layer"
        WebUI --> Router[index.php / Router]
        CLI --> HubEngine[hub.py Engine]
    end
    
    subgraph "Application Layer (apps/)"
        Router --> App1[Conversor]
        Router --> App2[SQL Viewer]
        HubEngine --> App1
        HubEngine --> App2
    end
    
    subgraph "Infra Layer"
        App1 --> Docker[Docker Compose]
        App2 --> MySQL[(Base de Datos)]
    end
```

## 🔐 Decisiones de Diseño

1.  **Aislamiento**: Cada aplicación vive en su propia subcarpeta dentro de `apps/`.
2.  **Configuración**: Uso extensivo de archivos `.env` para evitar credenciales en código.
3.  **Portabilidad**: Wrapper universal `hub.py` (ejecutable vía PHP, Bash o Powershell).
4.  **Modernización**: Integración de PSR-4 via Composer para una carga de clases eficiente.

---
📖 Explora el **[Catálogo de Sistemas](Catalogo-de-Sistemas)** para ver el detalle de cada módulo.
