# Roadmap

Lo planificado está diferenciado de lo implementado y **no bloquea** la entrega actual. El
orden responde a dependencias reales: cada etapa habilita la siguiente.

## Entregado en esta incorporación

Catálogo versionado, núcleo determinista, formulario dinámico, exportaciones, paquete ZIP
reproducible, adaptador CLI, skill reutilizable, generadores de skill, agentes, harness y
especificación MCP, doce escenarios de aceptación, suite de pruebas y documentación.

## Siguiente: CLI completa

El adaptador CLI ya cubre 17 comandos sobre el mismo núcleo. Lo que falta:

- Modo interactivo para construir una configuración desde cero sin editar JSON a mano.
- Comando de comparación entre dos configuraciones, que muestre el delta de capacidad y de
  evolución (útil para discutir un cambio de alcance).
- Salida en formato de informe para integrarla en una revisión.
- Código de salida diferenciado por severidad, para usarlo como control en una
  canalización de integración continua.

## Skill operativa en hosts compatibles

La skill `skills/system-architect/` está escrita con carga progresiva y validada por
pruebas estructurales. Lo pendiente es verificarla en ejecución con hosts concretos y
ajustar su descripción según cómo se active realmente, en lugar de declarar compatibilidad
sin comprobarla.

## Adaptador MCP

Existe la especificación. La implementación debería:

1. Integrarse con el servidor MCP existente del repositorio, **conservando** su política
   de solo lectura, en lugar de publicar un servidor paralelo.
2. Exponer los recursos del catálogo y las nueve herramientas de consulta y generación.
3. Validar toda entrada del cliente contra el esquema declarado.
4. Verificar la compatibilidad con un cliente concreto **antes** de declararla.
5. Agregar pruebas de contrato del servidor.

## Agente especializado

Con el adaptador MCP operativo, el agente definido puede ejecutarse de verdad: consulta el
catálogo por herramienta, calcula con el motor y no inventa cifras. Requiere:

- Conjuntos de evaluación con umbrales de aceptación antes de ponerlo en uso.
- Registro de qué herramientas invocó y con qué resultado.
- Límites de presupuesto efectivos, no declarados.

## Coordinación multiagente

Depende del agente individual y de un runtime compatible. La definición ya incluye
activación selectiva, control de duplicación y revisión humana de decisiones relevantes.
Lo que falta es medir si la coordinación mejora el resultado frente a un único agente, y
abandonarla si no lo hace.

## Integraciones con harness

Adaptadores de ejecución sobre la especificación generada, con sus propias pruebas:
aislamiento efectivo, puntos de control reanudables, corte por presupuesto verificado y
auditoría sin secretos. No se desarrollará un framework completo de agentes si existen
alternativas adecuadas.

## API HTTP y SDK

Un recurso por operación del motor, con cuerpo `sas.config.v1`, descripción en OpenAPI y
errores estructurados. El SDK sería un envoltorio sin lógica propia. Ambos están descritos
en [contratos.md](contratos.md).

Este es el punto donde la herramienta deja de ser una aplicación individual, y por eso es
también donde aparecen por primera vez los requisitos de autenticación, cuotas y límites de
tasa.

## Otras interfaces previstas

GitHub Actions y GitLab CI (invocando el CLI y publicando el paquete como artefacto),
plugins de IDE, generadores de código a partir de la especificación, y herramientas de
revisión arquitectónica. Ninguna depende del formulario: el formulario produce
configuraciones, no lógica.

## Operación multiusuario, si llega a requerirse

El proyecto **no asume** que esto vaya a ocurrir. Si ocurre, los contratos ya previstos
permiten incorporar: usuarios autenticados, organizaciones, proyectos, permisos,
multi-tenencia, persistencia, versionado, almacenamiento centralizado, caché, colas,
trabajadores, límites de tasa, cuotas, procesamiento concurrente, escalado horizontal,
observabilidad y facturación.

Hoy nada de eso está implementado, y el estado inicial es deliberadamente el contrario:
uso local, sin cuenta obligatoria, sin backend dedicado, catálogos en JSON, procesamiento
local, exportaciones locales y consumo cero de tokens.

## Evolución del catálogo

Independiente del código y con su propio versionado por entrada:

- Ampliar familias donde la cobertura es más delgada (salud, gobierno, ciencia).
- Agregar sectores no contemplados a medida que aparezcan casos reales.
- Revisar las fuentes de cada entrada y precisar las restricciones del dominio.
- Incorporar como entradas propias los tipos personalizados que se repitan entre proyectos.

## Mejoras pendientes de la propia herramienta

- Pruebas automatizadas de navegador, si se acepta la dependencia que implican.
- Auditoría formal de accesibilidad con lectores de pantalla.
- Comparación visual de escenarios dentro de la interfaz.
- Reemplazar el supuesto de CPU por solicitud por un perfil declarable por tipo de
  operación, que es la mejora que más precisión aportaría al dimensionamiento.
