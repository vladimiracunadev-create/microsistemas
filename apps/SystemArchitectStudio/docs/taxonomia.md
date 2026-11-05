# Modelo de taxonomías

## Dos ejes que no se mezclan

1. **Tipo funcional**: qué hace el sistema. Es el catálogo jerárquico de familias y tipos.
2. **Dimensiones de clasificación**: modelo de servicio, arquitectura, despliegue,
   aislamiento, plataformas, licenciamiento, comercialización, sensibilidad de datos y
   estilo de integración.

Una configuración combina un valor (o varios) de cada eje. "ERP + CRM + Workflow + SaaS +
multi-tenant + arquitectura modular + despliegue en nube" es una combinación válida y
habitual. El motor comprueba dependencias y advierte incompatibilidades reales, pero no
prohíbe combinaciones técnicamente válidas.

## Familias

Doce familias, 127 tipos. Cada familia vive en su propio archivo
`data/systems/<familia>.json`:

| Archivo | Familia | Tipos |
| --- | --- | --- |
| `enterprise.json` | Sistemas empresariales | 17 |
| `automation.json` | Automatización y procesos | 9 |
| `education.json` | Sistemas educativos y psicométricos | 14 |
| `finance.json` | Finanzas, banca y seguros | 11 |
| `health.json` | Salud | 8 |
| `industry.json` | Industria y logística | 11 |
| `science.json` | Ciencia y tecnología | 8 |
| `government.json` | Gobierno, justicia y seguridad pública | 7 |
| `software.json` | Software e infraestructura | 11 |
| `ai.json` | Inteligencia artificial | 13 |
| `security.json` | Ciberseguridad | 12 |
| `other.json` | Otras familias y extensión | 6 |

No hay número máximo de sistemas. El catálogo es extensible por diseño y no pretende ser
exhaustivo.

## Estructura de una entrada

```json
{
  "id": "erp",
  "canonicalName": "Enterprise Resource Planning",
  "acronym": "ERP",
  "synonyms": ["Sistema de planificación de recursos empresariales"],
  "subdomain": "Gestión integral de recursos",
  "formalDescription": "Sistema transaccional integrado que …",
  "pedagogicalDescription": "Es la columna vertebral administrativa: …",
  "capabilities": ["Contabilidad general y libros auxiliares", "…"],
  "relations": ["crm", "scm"],
  "dependencies": ["ledger"],
  "constraints": ["Integridad transaccional estricta: …"],
  "standards": ["IFRS / NIIF para la presentación financiera"],
  "sources": ["Literatura de sistemas de información empresarial"],
  "entryVersion": "0.1.0",
  "updatedAt": "2026-11-04"
}
```

Todos los campos son obligatorios y la prueba de integridad los verifica. `entryVersion`
es la versión de **la entrada del catálogo**, independiente de la versión de la suite:
permite revisar y corregir una definición sin tocar las demás.

Significado de los campos que suelen confundirse:

- **`capabilities`**: lo que ese tipo de sistema suele hacer. El motor las convierte en
  requisitos funcionales candidatos, marcados como provenientes del catálogo: son
  candidatos a alcance, no alcance comprometido.
- **`dependencies`**: capacidades sin las cuales el tipo no produce su resultado completo.
  Si no están en la selección, el motor lo advierte.
- **`relations`**: sistemas con los que suele convivir. Son sugerencias, no obligaciones.
- **`constraints`**: modos de falla y restricciones conocidas del dominio. Son el campo más
  valioso: el motor las traslada a los informativos de compatibilidad y al plan de pruebas.
- **`standards`**: estándares aplicables al dominio. Se sugieren como requisitos de
  cumplimiento a evaluar. Declararlos no implica conformidad.

## Cómo agregar un tipo de sistema

1. Abra el archivo de la familia correspondiente en `data/systems/`.
2. Agregue la entrada con **todos** los campos. Use un identificador en minúsculas con
   guiones, único en todo el catálogo. La sigla también debe ser única.
3. Verifique que cada `relations` y cada `dependencies` apunte a un identificador que
   exista en el catálogo.
4. Ejecute la verificación:

   ```bash
   node apps/SystemArchitectStudio/adapters/cli/sas.mjs doctor
   ```

5. Ejecute las pruebas:

   ```bash
   node --test "apps/SystemArchitectStudio/tests/catalog.test.mjs"
   ```

No hay que tocar código: la interfaz, la búsqueda, el formulario y los generadores
recogen la entrada nueva automáticamente.

## Cómo agregar una familia (sector nuevo)

1. Cree `data/systems/<id>.json` con la estructura `{ family: { id, name, description },
   systems: [ … ] }`.
2. Añada el nombre del archivo al arreglo `files` de `data/systems/index.json`.
3. Ejecute `doctor` y las pruebas. La prueba exige al menos tres tipos por familia, para
   que una familia no quede como estructura vacía.

## Cómo agregar una opción de clasificación

Agregue la opción (con `id`, `name` y `description`) a la dimensión correspondiente en
`data/dimensions.json`. La prueba verifica que no haya identificadores duplicados y que
toda opción tenga nombre y descripción.

Para una dimensión completamente nueva hay que agregarla a `dimensions.json`, declarar su
campo en `core/schema/config-schema.js`, incluirla en la validación de dimensiones de
`core/validation/validator.js` y exponerla en `ui/form-schema.js`.

## Qué no hacer

- **No inventar siglas.** Si un dominio no tiene una sigla establecida, use el nombre.
- **No tratar denominaciones ambiguas como universalmente normalizadas.** "CMS" puede ser
  gestión de contenidos o gestión de casos; el catálogo las distingue como `cms` y
  `case-management` precisamente por eso.
- **No tratar un nombre comercial de un proveedor como tipo de sistema.**
- **No usar la entrada de extensión `custom-domain` de forma permanente.** Si un dominio
  se repite en varios proyectos, incorpórelo como entrada propia.
