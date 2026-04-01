# ADR 0001: Contexto de Proyecto, Naturaleza y Decisiones de Arquitectura Core

## 1. Estado

**Aceptado**

## 2. Fecha

2026-03-09

## 3. Contexto y Naturaleza del Repositorio

El proyecto **Microsistemas** no es una aplicacion monolitica tradicional orientada a un solo fin de negocio, sino una **Suite Modular de Productividad para Desarrolladores**. Adicionalmente, este repositorio cumple una funcion hibrida en el ecosistema de su autor (Vladimir Acuna Dev):

1. **Laboratorio Tecnico y Showcase:** Demuestra capacidades reales en arquitectura de software, DevOps, orquestacion (Docker/K8s) y automatizacion (CI/CD).
2. **Portafolio Profesional Avanzado:** Evidencia madurez tecnica, estandares de codificacion seguros (OWASP) y calidad documental para procesos de reclutamiento o evaluacion de talento.
3. **Plataforma Util (Herramientas Reales):** Proporciona utilidades genuinamente utiles (generacion de AWS configs, YAMLs, simuladores de capacidad, migradores de codigo PHP) que reducen fricciones en el trabajo diario.

Dado este contexto, la arquitectura requiere ser extremadamente modular para permitir agregar, modificar o eliminar "micro-apps" sin afectar al resto del sistema, manteniendo al mismo tiempo una barrera de entrada y de operacion muy baja.

## 4. Problema

Se requiere estructurar un repositorio que aloje multiples herramientas web independientes (escritas en distintos lenguajes o frameworks, aunque predominan PHP y Vanilla JS) bajo una unica interfaz de acceso y con un flujo operativo cohesionado, asegure do que el despliegue tanto en entornos locales legacy (XAMPP) como en infraestructuras cloud nativas (Kubernetes/Docker) sea viable y consistente.

## 5. Decisiones Tomadas

Se han adoptado las siguientes decisiones arquitectonicas base:

### 5.1 Arquitectura Modular y "App Hub"

- **Decision:** Cada herramienta vivira en su propio directorio aislado bajo la carpeta `apps/` (ej. `apps/CapacitySim`, `apps/AwsGenerator`).
- **Justificacion:** Previene conflictos de dependencias entre herramientas, facilita la responsabilidad unica y permite realizar despliegues selectivos.
- **Mecanismo:** Se introduce una "Capa Hub" (`hub.sh`, `hub.ps1`, `make hub-*`) que orquesta el descubrimiento y gestion de cada modulo.

### 5.2 Stack Core: PHP 8.1+ y Vanilla JS

- **Decision:** Usar PHP 8.1+ para el backend core y generacion dinamica, y Vanilla JS (sin bundlers pesados) para el frontend.
- **Justificacion:** Garantiza maxima compatibilidad con entornos de hosting compartidos legacy y proporciona un rendimiento excelente sin el _overhead_ de configuraciones y transpilaciones complejas (como ocurriria con React o Vue para herramientas que no lo requieren). Refleja un entendimiento pragmatico de "usar la herramienta adecuada para el problema adecuado".

### 5.3 Infraestructura como Codigo (IaC) e Inmutabilidad

- **Decision:** Todo el sistema debe ser capaz de levantarse mediante un unico comando en un entorno aislado usando **Docker y Docker Compose**.
- **Justificacion:** Evita el sindrome "_funciona en mi maquina_". Provee un entorno de evaluacion fiable para evaluadores o usuarios descargando la suite. Permite definir limites precisos de recursos (CPU/RAM).

### 5.4 Automatizacion con Makefile

- **Decision:** Agrupar todos los flujos operativos (build, test, serve, deploy) en un `Makefile`.
- **Justificacion:** Proporciona un lenguaje coloquial y universalmente entendido por operadores e ingenieros para ejecutar flujos complejos sin necesidad de memorizar comandos largos de Docker o scripts nativos.

## 6. Consecuencias

### Positivas

- **Alta mantenibilidad:** El aislamiento permite actualizar una herramienta sin miedo a romper otras.
- **Onboarding rapido:** El sistema se levanta localmente con `make up` o `docker-compose up -d` en menos de un minuto.
- **Demostracion de Seniority:** Se evidencia que se pueden implementar patrones empresariales (Factory, Repository, Inyeccion de Dependencias) en stacks pragmaticos sin sobreingenieria.

### Trade-offs / Riesgos

- **Duplicacion de codigo:** Al ser independientes, las apps podrian eventualmente duplicar dependencias o librerias del frontend si no se gestionan desde un _core_ comun.
- **Mantenimiento del Hub:** La capa centralizada de registro de aplicaciones requiere mantenimiento continuo por cada app nueva que se suma.

## 7. Proximos ADRs Sugeridos

- ADR para la estrategia de testing centralizado vs aislado por app.
- ADR sobre la evolucion del Hub hacia una API robusta para la orquestacion distribuida (potenciales agentes de IA).
