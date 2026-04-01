# ADR 0001: Contexto de Proyecto, Naturaleza y Decisiones de Arquitectura Core

## 1. Estado

**Aceptado**

## 2. Fecha

2026-03-09

## 3. Contexto y Naturaleza del Repositorio

El proyecto **Microsistemas** no es una aplicación monolítica tradicional orientada a un solo fin de negocio, sino una **Suite Modular de Productividad para Desarrolladores**. Adicionalmente, este repositorio cumple una función híbrida en el ecosistema de su autor (Vladimir Acuña Dev):

1. **Laboratorio Técnico y Showcase:** Demuestra capacidades reales en arquitectura de software, DevOps, orquestación (Docker/K8s) y automatización (CI/CD).
2. **Portafolio Profesional Avanzado:** Evidencia madurez técnica, estándares de codificación seguros (OWASP) y calidad documental para procesos de reclutamiento o evaluación de talento.
3. **Plataforma Útil (Herramientas Reales):** Proporciona utilidades genuinamente útiles (generación de AWS configs, YAMLs, simuladores de capacidad, migradores de código PHP) que reducen fricciones en el trabajo diario.

Dado este contexto, la arquitectura requiere ser extremadamente modular para permitir agregar, modificar o eliminar "micro-apps" sin afectar al resto del sistema, manteniendo al mismo tiempo una barrera de entrada y de operación muy baja.

## 4. Problema

Se requiere estructurar un repositorio que aloje múltiples herramientas web independientes (escritas en distintos lenguajes o frameworks, aunque predominan PHP y Vanilla JS) bajo una única interfaz de acceso y con un flujo operativo cohesionado, asegure do que el despliegue tanto en entornos locales legacy (XAMPP) como en infraestructuras cloud nativas (Kubernetes/Docker) sea viable y consistente.

## 5. Decisiones Tomadas

Se han adoptado las siguientes decisiones arquitectónicas base:

### 5.1 Arquitectura Modular y "App Hub"

- **Decisión:** Cada herramienta vivirá en su propio directorio aislado bajo la carpeta `apps/` (ej. `apps/CapacitySim`, `apps/AwsGenerator`).
- **Justificación:** Previene conflictos de dependencias entre herramientas, facilita la responsabilidad única y permite realizar despliegues selectivos.
- **Mecanismo:** Se introduce una "Capa Hub" (`hub.sh`, `hub.ps1`, `make hub-*`) que orquesta el descubrimiento y gestión de cada módulo.

### 5.2 Stack Core: PHP 8.1+ y Vanilla JS

- **Decisión:** Usar PHP 8.1+ para el backend core y generación dinámica, y Vanilla JS (sin bundlers pesados) para el frontend.
- **Justificación:** Garantiza máxima compatibilidad con entornos de hosting compartidos legacy y proporciona un rendimiento excelente sin el _overhead_ de configuraciones y transpilaciones complejas (como ocurriría con React o Vue para herramientas que no lo requieren). Refleja un entendimiento pragmático de "usar la herramienta adecuada para el problema adecuado".

### 5.3 Infraestructura como Código (IaC) e Inmutabilidad

- **Decisión:** Todo el sistema debe ser capaz de levantarse mediante un único comando en un entorno aislado usando **Docker y Docker Compose**.
- **Justificación:** Evita el síndrome "_funciona en mi máquina_". Provee un entorno de evaluación fiable para evaluadores o usuarios descargando la suite. Permite definir límites precisos de recursos (CPU/RAM).

### 5.4 Automatización con Makefile

- **Decisión:** Agrupar todos los flujos operativos (build, test, serve, deploy) en un `Makefile`.
- **Justificación:** Proporciona un lenguaje coloquial y universalmente entendido por operadores e ingenieros para ejecutar flujos complejos sin necesidad de memorizar comandos largos de Docker o scripts nativos.

## 6. Consecuencias

### Positivas

- **Alta mantenibilidad:** El aislamiento permite actualizar una herramienta sin miedo a romper otras.
- **Onboarding rápido:** El sistema se levanta localmente con `make up` o `docker-compose up -d` en menos de un minuto.
- **Demostración de Seniority:** Se evidencia que se pueden implementar patrones empresariales (Factory, Repository, Inyección de Dependencias) en stacks pragmáticos sin sobreingeniería.

### Trade-offs / Riesgos

- **Duplicación de código:** Al ser independientes, las apps podrían eventualmente duplicar dependencias o librerías del frontend si no se gestionan desde un _core_ común.
- **Mantenimiento del Hub:** La capa centralizada de registro de aplicaciones requiere mantenimiento continuo por cada app nueva que se suma.

## 7. Próximos ADRs Sugeridos

- ADR para la estrategia de testing centralizado vs aislado por app.
- ADR sobre la evolución del Hub hacia una API robusta para la orquestación distribuida (potenciales agentes de IA).
