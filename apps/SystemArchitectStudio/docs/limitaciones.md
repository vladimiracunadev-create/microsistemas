# Limitaciones

Este documento existe para que nadie tenga que descubrirlas usando la herramienta.

## Estado de cada capacidad

### Implementado y probado

Catálogo de 127 tipos en 12 familias, 9 dimensiones y 39 reglas · validación y saneamiento
de entradas · motor de compatibilidad · motor de capacidad con fórmulas, supuestos, rangos
y cuellos de botella · motor de evolución con horizonte libre · motor de arquitectura ·
motor de requisitos sobre ISO/IEC 25010 · 22 plantillas de prompt · cinco documentos ·
paquete ZIP con manifiesto reproducible · generadores de skill, agentes, harness y
especificación MCP · formulario dinámico de 18 secciones · adaptador de línea de comandos
con 17 comandos.

### Implementado sin validar completamente

**La interfaz.** Se verificó manualmente en un navegador basado en Chromium: carga de
catálogos, carga de ejemplos, recorrido de las 18 secciones, recálculo del panel de
resultado, las diez pestañas, exportaciones y descarga del ZIP. No hay pruebas
automatizadas de navegador, así que la interacción no está cubierta por regresión
automática. No se verificó en Firefox ni en Safari.

**La adaptación móvil.** Los estilos declaran puntos de quiebre y se revisaron a ancho
reducido, pero no se probó en dispositivos reales.

**La accesibilidad.** La interfaz usa etiquetas asociadas, roles, `aria-pressed`,
`aria-current`, `aria-selected`, enlace de salto y navegación por teclado, y respeta
`prefers-reduced-motion`. No se ejecutó una auditoría formal de accesibilidad ni se probó
con lectores de pantalla.

### No implementado

| Capacidad | Qué existe | Qué falta |
| --- | --- | --- |
| **Servidor MCP** | La especificación generada por el motor, con recursos, herramientas de solo lectura y plantillas | El servidor. No hay integración con el servidor MCP del repositorio |
| **Runtime de agentes** | Las definiciones de agente especializado y de sistema multiagente, con límites y criterios | La ejecución. Ningún agente corre |
| **Ejecución de harness** | La especificación con sus diecisiete secciones | La ejecución, los adaptadores de runtime y sus pruebas |
| **API HTTP** | El contrato descrito en `contratos.md` | La implementación |
| **SDK** | El contrato descrito | La implementación |
| **Operación multiusuario** | Los contratos de evolución del propio producto | Cuentas, organizaciones, permisos, persistencia central, colas, cuotas |
| **Integración CI** | La descripción de cómo invocar el CLI | Los workflows |

### Planificado

Ver [roadmap.md](roadmap.md). Lo planificado **no bloquea** esta entrega y está
diferenciado de lo implementado en todos los artefactos.

## Limitaciones de fondo

### Las cifras de capacidad no son capacidad verificada

Son escenarios derivados de supuestos declarados. El supuesto que más las distorsiona —el
costo de CPU por solicitud— es un valor por omisión del motor, y el propio resultado lo
dice en su nota. Convertir una estimación en capacidad medida requiere pruebas de carga
sobre la implementación real; el plan de pruebas generado las detalla.

### Las referencias a estándares no son conformidad

Citar ISO/IEC 25010, ISO/IEC 27001, PCI DSS, HL7 FHIR, WCAG 2.2 o cualquier otro estándar
es encuadre conceptual. La herramienta **no certifica nada** y lo declara en la
especificación, en los requisitos de cumplimiento y en el pie de la interfaz.

### Seleccionar una jurisdicción no otorga cumplimiento legal

El motor registra las obligaciones que usted declare y sugiere los estándares del dominio.
Identificar qué aplica, y verificar que se cumple, requiere asesoría jurídica propia. La
regla `R-PRIV-001` lo advierte cuando se declara una jurisdicción sin obligaciones
concretas.

### La herramienta no valida instrumentos psicométricos

Implementar una prueba no equivale a validarla científicamente. La herramienta separa
administración, construcción, aplicación, puntuación, estadística, baremos, validez,
confiabilidad, interpretación, informes y seguimiento longitudinal como componentes
distintos, y advierte cuando falta uno. Pero:

- No produce evidencia de validez: eso requiere estudio empírico.
- No calibra ítems: requiere pilotaje con muestra suficiente.
- No construye baremos: requiere una muestra de normalización documentada.
- No autoriza el uso de instrumentos protegidos: eso requiere licencia del titular, y el
  contenido de los ítems es además un activo confidencial.

### El catálogo es extensible, no exhaustivo

127 tipos cubren los dominios más frecuentes, pero ningún catálogo agota la realidad. Para
lo no cubierto existe la entrada de extensión `custom-domain` y los tipos personalizados,
que **no aportan** capacidades, relaciones ni estándares: lo que no declare queda vacío.
Agregar un tipo propio no requiere código (ver [taxonomia.md](taxonomia.md)).

El contenido del catálogo es una afirmación de dominio sujeta a revisión: las pruebas
verifican su estructura, no la exactitud de cada capacidad atribuida.

### La aplicación necesita HTTP

Lee sus catálogos con `fetch`. Abrirla como `file://` muestra un aviso explícito y no
carga los catálogos. Es una consecuencia de mantener los datos como datos en lugar de
incrustarlos en el código.

### La persistencia es local y sin cifrar

Las configuraciones guardadas viven en el `localStorage` de ese navegador: no salen del
equipo, no se sincronizan, no se cifran y pueden desaparecer si se limpian los datos del
sitio. En modo privado puede no guardarse nada, y la aplicación lo informa. Para custodia
real, exporte el JSON.

### El motor advierte, no decide

Respeta la elección del usuario incluso cuando difiere de su recomendación: registra la
divergencia como decisión a confirmar. No prohíbe combinaciones técnicamente válidas. Las
decisiones de arquitectura, de alcance y de cumplimiento son humanas.

### Sin medición no hay recomendación fuerte

Casi todas las salidas del motor terminan con la misma estructura: una hipótesis ordenada
y la prueba que la confirmaría. Eso es deliberado, pero significa que la herramienta **no
sustituye** el perfilado, las pruebas de carga, el ensayo de restauración ni la revisión
profesional.
