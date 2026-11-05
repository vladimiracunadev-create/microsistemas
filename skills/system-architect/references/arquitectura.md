# Selección y revisión de arquitectura

## Criterio de decisión

Una decisión arquitectónica se justifica con un requisito o una magnitud medida, nunca con
preferencia personal ni con la popularidad de una tecnología. Si no puede nombrar el
requisito que la motiva, la decisión no está tomada: está adoptada por inercia.

La cantidad de usuarios por sí sola no determina el estilo. Lo determinan la contención
medida, el acoplamiento del dominio, la capacidad real del equipo que va a operarlo y las
restricciones duras del dominio.

## Cómo decide el motor

1. **Restricción dura de dominio primero.** Si hay control de proceso o de equipos físicos
   (SCADA, DCS, control de almacén automatizado, robótica, telemetría de misión), el
   estilo es control local distribuido con supervisión central, con independencia de la
   carga: la planta no puede detenerse porque cayó un enlace.
2. **Dominio predominante de datos.** Si el sistema que define el conjunto es de flujos de
   alto volumen (plataforma de datos, orquestación, IoT industrial, bioinformática), la
   organización natural es por etapas de transformación.
3. **Carga y equipo.** Con concurrencia alta y equipo suficiente para operar servicios
   independientes, hay base para microservicios. Con carga alta y equipo pequeño, la
   recomendación es monolito modular escalado horizontalmente con los módulos de mayor
   carga preparados para extracción: el costo operacional de los servicios recaería en
   muy pocas personas.
4. **Por omisión.** Monolito modular con límites de módulo explícitos y contratos internos
   documentados. Es el punto de partida que menos cierra puertas.

Si el usuario declaró un estilo distinto del recomendado, el motor **respeta su elección**
en todos los artefactos y registra la divergencia como decisión a confirmar, con el motivo.

## Qué debe declarar toda propuesta

- Arquitectura inicial justificada, con el requisito o la magnitud que la motiva.
- Componentes, con responsabilidad única y límite explícito.
- Contratos de interfaz, internos y públicos, con su política de versionado.
- Dependencias críticas, su estrategia de aislamiento y su comportamiento degradado.
- Componentes sustituibles y el contrato detrás del cual se sustituyen.
- Estrategia de migraciones de esquema y de datos, reversible.
- Versionado del código, de los contratos públicos, de los esquemas y de los catálogos.
- Gestión de obsolescencia: inventario con fechas de soporte y decisión previa.
- Procedimientos de recuperación, con RPO y RTO declarados y ensayados.
- Condiciones observables que obligarían a rediseñar.

## Migraciones

Esquema en dos fases: **expandir** (agregar lo nuevo sin romper lo anterior), **migrar**
los datos por lotes con punto de control reanudable, y **contraer** (retirar lo antiguo
cuando nadie lo usa). Nunca las tres cosas en el mismo despliegue.

Toda fase debe ser reversible por sí misma. Si una fase no lo es, declárelo antes de
ejecutarla y obtenga aprobación explícita. Una migración sin plan de reversión probado no
se ejecuta.

## Condiciones de rediseño

- Existe una contención medida que no se resuelve con capacidad ni con cambios locales.
- El costo por operación crece al agregar capacidad: el límite es de diseño, no de recursos.
- El tiempo de ciclo de un cambio pequeño crece de forma sostenida.
- Un requisito nuevo contradice un invariante estructural del diseño actual.
- Una dependencia estructural pierde soporte sin reemplazo compatible.
- La carga real supera de forma sostenida el escenario exigente proyectado.

## Antipatrones frecuentes

- Microservicios con un equipo que no puede operarlos: traslada complejidad sin resolver nada.
- Multi-tenancy sin aislamiento de datos verificado por pruebas de autorización.
- Caché sin invalidación explícita, que convierte datos obsoletos en errores silenciosos.
- Integración sincrónica con un tercero en la ruta crítica, sin comportamiento degradado.
- Lógica de negocio migrada a la capa de integración, donde queda invisible para los equipos.
- Multi-región sin decidir qué datos son regionales y qué datos son globales.
- Reescritura completa presentada como refactorización.
