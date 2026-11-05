/**
 * Integración con Microsistemas y requisitos transversales:
 * manifiesto detectable por el Hub, tarjeta en el dashboard, funcionamiento
 * sin Internet, ausencia de ejecución dinámica de texto e integridad
 * documental.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';

import { APP_ROOT, REPO_ROOT, walk, listExamples } from './helpers.mjs';

const readText = (path) => readFile(path, 'utf8');

/* --- Integración con el repositorio ------------------------------------ */

test('el manifiesto existe y declara los campos que lee el Hub', async () => {
  const manifest = await readText(join(APP_ROOT, 'app.manifest.yml'));
  assert.match(manifest, /^name:\s*SystemArchitectStudio$/m);
  assert.match(manifest, /^type:\s*static$/m);
  assert.match(manifest, /^description:\s*.{20,}$/m);
  assert.match(manifest, /^healthcheck:\s*\//m);
  assert.match(manifest, /^ports:/m);
});

test('existe index.html, que es lo que exige el tipo static', async () => {
  await access(join(APP_ROOT, 'index.html'));
});

test('el dashboard del repositorio tiene la tarjeta de la aplicación', async () => {
  const dashboard = await readText(join(REPO_ROOT, 'index.php'));
  assert.ok(dashboard.includes('apps/SystemArchitectStudio/'), 'falta el enlace en index.php');
  assert.ok(dashboard.includes('System Architect Studio'), 'falta el título de la tarjeta');
});

test('el dashboard conserva las tarjetas de las aplicaciones preexistentes', async () => {
  const dashboard = await readText(join(REPO_ROOT, 'index.php'));
  const existing = [
    'apps/Conversor/', 'apps/SqlViewer/', 'apps/GitTrainer/', 'apps/JsTools/',
    'apps/KatasMultiLang/', 'apps/PythonEval3000/', 'apps/YmlGenerator/',
    'apps/LogViewer/', 'apps/PhpMigrator/', 'apps/CapacitySim/',
    'apps/CicdLibrary/', 'apps/AwsGenerator/'
  ];
  for (const link of existing) {
    assert.ok(dashboard.includes(link), `se perdió la tarjeta de ${link}`);
  }
});

test('el catálogo del README incluye la aplicación', async () => {
  const readme = await readText(join(REPO_ROOT, 'README.md'));
  assert.ok(readme.includes('apps/SystemArchitectStudio'), 'el catálogo del README no incluye la aplicación');
});

test('el CHANGELOG registra la incorporación bajo [Unreleased]', async () => {
  const changelog = await readText(join(REPO_ROOT, 'CHANGELOG.md'));
  assert.ok(changelog.includes('## [Unreleased]'), 'falta la sección [Unreleased]');
  const section = changelog.split('## [Unreleased]')[1].split('## [3.1.0]')[0];
  assert.ok(section.includes('System Architect Studio'), '[Unreleased] no menciona la aplicación');
  assert.ok(changelog.includes('## [3.1.0]'), 'se perdió el historial anterior');
});

test('la aplicación no declara versión propia', async () => {
  const pkg = JSON.parse(await readText(join(APP_ROOT, 'package.json')));
  assert.equal(pkg.version, undefined, 'el microsistema se versiona con la suite, no por su cuenta');
  assert.equal(pkg.type, 'module', 'el paquete debe declarar módulos ES');

  const skill = await readText(join(REPO_ROOT, 'skills', 'system-architect', 'SKILL.md'));
  assert.ok(!/^version:/m.test(skill), 'la skill no debe declarar versión propia');

  // Ninguna otra microapp muestra un número de versión de producto en su interfaz.
  const html = await readText(join(APP_ROOT, 'index.html'));
  assert.ok(!/v\d+\.\d+\.\d+/.test(html), 'la interfaz no debe mostrar un número de versión de producto');

  // Tampoco deben quedar constantes de versión de producto en el código.
  const files = await walk(APP_ROOT, (p) => /\.(js|mjs)$/i.test(p) && !p.includes('tests'));
  for (const file of files) {
    const content = await readText(file);
    assert.ok(!/GENERATOR_VERSION|SUITE_VERSION|TEMPLATES?_VERSION/.test(content),
      `${file} declara una versión de producto propia`);
  }
});

test('la navegación de retorno sigue el patrón del resto de las microapps', async () => {
  const html = await readText(join(APP_ROOT, 'index.html'));
  assert.match(html, /<a class="back-link" href="\.\.\/\.\.\/index\.php">/,
    'falta el enlace de retorno al dashboard en la parte superior');
  assert.ok(html.includes('Volver al Dashboard'), 'el enlace debe usar el mismo texto del resto de la suite');
  assert.ok(html.includes('class="footer-nav"'), 'falta la navegación del entorno en el pie');
  assert.ok(html.includes('doc.php?file=USER_MANUAL.md'), 'el pie debe enlazar el manual del entorno');

  const css = await readText(join(APP_ROOT, 'ui', 'styles.css'));
  assert.ok(css.includes('.back-link'), 'el enlace de retorno necesita su estilo');
});

test('la aplicación está registrada en la landing de GitHub Pages', async () => {
  const landing = await readText(join(REPO_ROOT, 'landing', 'index.html'));
  assert.ok(landing.includes('System Architect Studio'), 'la landing no menciona la aplicación');
  assert.ok(landing.includes('SystemArchitectStudio'), 'la landing no nombra el directorio de la aplicación');
  assert.ok(landing.includes('<code>Arquitectura</code>'), 'falta la capa de arquitectura en la tabla de capas');
});

test('la skill reutilizable del repositorio existe con su frontmatter', async () => {
  const skill = await readText(join(REPO_ROOT, 'skills', 'system-architect', 'SKILL.md'));
  assert.ok(skill.startsWith('---'), 'la skill debe empezar con frontmatter');
  assert.match(skill, /^name:\s*system-architect$/m);
  assert.match(skill, /^description:\s*.{40,}/m);
  for (const heading of ['## Objetivos', '## Instrucciones', '## Referencias', '## Restricciones', '## Contratos', '## Casos de uso', '## Criterios de validación']) {
    assert.ok(skill.includes(heading), `la skill no incluye "${heading}"`);
  }
});

test('las referencias de la skill existen y no están vacías', async () => {
  const skill = await readText(join(REPO_ROOT, 'skills', 'system-architect', 'SKILL.md'));
  const referenced = [...skill.matchAll(/references\/([a-z0-9-]+\.md)/g)].map((m) => m[1]);
  assert.ok(referenced.length >= 4, 'la skill debe nombrar varias referencias');
  for (const file of new Set(referenced)) {
    const content = await readText(join(REPO_ROOT, 'skills', 'system-architect', 'references', file));
    assert.ok(content.length > 400, `${file} parece vacío`);
  }
});

test('la skill de integración del repositorio sigue intacta', async () => {
  const skill = await readText(join(REPO_ROOT, 'skills', 'integrar-microsistema', 'skill.md'));
  assert.ok(skill.includes('Integracion limpia de microsistema'));
});

/* --- Funcionamiento sin Internet --------------------------------------- */

test('la aplicación no referencia recursos externos', async () => {
  const files = await walk(APP_ROOT, (p) => /\.(html|css|js|mjs)$/i.test(p));
  assert.ok(files.length > 10);
  for (const file of files) {
    const content = await readText(file);
    const matches = [...content.matchAll(/https?:\/\/[^\s'"`)]+/g)].map((m) => m[0]);
    const offenders = matches.filter((url) => !/^https?:\/\/(localhost|127\.0\.0\.1)/.test(url));
    assert.deepEqual(offenders, [], `${file} referencia recursos externos: ${offenders.join(', ')}`);
  }
});

test('el HTML no carga scripts ni hojas de estilo remotas', async () => {
  const html = await readText(join(APP_ROOT, 'index.html'));
  assert.ok(!/<script[^>]+src="https?:/i.test(html));
  assert.ok(!/<link[^>]+href="https?:/i.test(html));
  assert.match(html, /<script type="module" src="ui\/app\.js">/);
  assert.match(html, /<link rel="stylesheet" href="ui\/styles\.css">/);
});

test('el núcleo no depende de paquetes externos', async () => {
  const pkg = JSON.parse(await readText(join(APP_ROOT, 'package.json')));
  assert.equal(pkg.dependencies, undefined, 'el microsistema no debe declarar dependencias');
  assert.equal(pkg.devDependencies, undefined, 'el microsistema no debe declarar dependencias de desarrollo');

  const files = await walk(APP_ROOT, (p) => /\.(js|mjs)$/i.test(p));
  for (const file of files) {
    const content = await readText(file);
    for (const match of content.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      const specifier = match[1];
      const allowed = specifier.startsWith('.') || specifier.startsWith('node:');
      assert.ok(allowed, `${file} importa el paquete externo "${specifier}"`);
    }
  }
});

/* --- Seguridad transversal --------------------------------------------- */

test('no se usa evaluación dinámica de texto en ninguna parte', async () => {
  const files = await walk(APP_ROOT, (p) => /\.(js|mjs|html)$/i.test(p));
  for (const file of files) {
    const content = await readText(file);
    assert.ok(!/\beval\s*\(/.test(content), `${file} usa eval`);
    assert.ok(!/new\s+Function\s*\(/.test(content), `${file} construye funciones desde texto`);
    assert.ok(!/\bsetTimeout\s*\(\s*['"`]/.test(content), `${file} pasa texto a setTimeout`);
    assert.ok(!/\bsetInterval\s*\(\s*['"`]/.test(content), `${file} pasa texto a setInterval`);
  }
});

test('la interfaz no inserta contenido como HTML', async () => {
  for (const file of ['ui/app.js', 'ui/form-schema.js', 'adapters/web/web-adapter.js']) {
    const content = await readText(join(APP_ROOT, file));
    assert.ok(!/\.innerHTML\s*=/.test(content), `${file} asigna innerHTML`);
    assert.ok(!/\.outerHTML\s*=/.test(content), `${file} asigna outerHTML`);
    assert.ok(!/insertAdjacentHTML/.test(content), `${file} usa insertAdjacentHTML`);
    assert.ok(!/document\.write/.test(content), `${file} usa document.write`);
  }
});

test('la interfaz pinta el contenido con textContent', async () => {
  const app = await readText(join(APP_ROOT, 'ui', 'app.js'));
  assert.ok(app.includes('node.textContent = String(value)'));
});

/* --- Integridad documental --------------------------------------------- */

test('la documentación obligatoria existe y cubre los temas exigidos', async () => {
  const required = {
    'README.md': ['Qué es', 'Cómo se usa', 'Limitaciones'],
    'docs/arquitectura.md': ['Separación', 'núcleo'],
    'docs/taxonomia.md': ['familias', 'Cómo agregar'],
    'docs/capacidad.md': ['fórmula', 'supuesto'],
    'docs/evolucion.md': ['horizonte', 'hitos'],
    'docs/prompts.md': ['disciplina'],
    'docs/contratos.md': ['sas.config.v1', 'migraci'],
    'docs/skill-agentes-mcp-harness.md': ['Harness', 'MCP', 'Skill', 'Agente'],
    'docs/seguridad.md': ['entradas'],
    'docs/pruebas.md': ['node --test'],
    'docs/limitaciones.md': ['No implementado'],
    'docs/roadmap.md': ['CLI'],
    'docs/ejemplos.md': ['escenario']
  };
  for (const [file, needles] of Object.entries(required)) {
    const content = await readText(join(APP_ROOT, file));
    assert.ok(content.length > 600, `${file} parece demasiado breve`);
    for (const needle of needles) {
      assert.ok(content.toLowerCase().includes(needle.toLowerCase()), `${file} no menciona "${needle}"`);
    }
  }
});

test('el README de la aplicación diferencia el estado de cada capacidad', async () => {
  const readme = await readText(join(APP_ROOT, 'README.md'));
  for (const label of ['Implementado y probado', 'No implementado', 'Planificado']) {
    assert.ok(readme.includes(label), `el README no declara el estado "${label}"`);
  }
  assert.match(readme, /no consume tokens|sin consumo de tokens/i);
});

test('los ejemplos declarados en el índice existen y son JSON válido', async () => {
  const examples = await listExamples();
  for (const example of examples) {
    const content = await readText(join(APP_ROOT, 'templates', 'systems', example.file));
    const parsed = JSON.parse(content);
    assert.equal(parsed.schemaVersion, 'sas.config.v1', `${example.file} no declara el esquema`);
    assert.ok(parsed.identity && parsed.identity.name, `${example.file} no declara nombre`);
  }
});

test('no quedan archivos vacíos ni directorios de relleno en la aplicación', async () => {
  const files = await walk(APP_ROOT, () => true);
  for (const file of files) {
    const content = await readFile(file);
    assert.ok(content.length > 0, `${file} está vacío`);
  }
});

test('el adaptador de línea de comandos documenta sus comandos', async () => {
  const cli = await readText(join(APP_ROOT, 'adapters', 'cli', 'sas.mjs'));
  for (const command of ['familias', 'tipos', 'buscar', 'tipo', 'dimensiones', 'doctor', 'ejemplos', 'validar', 'compatibilidad', 'capacidad', 'evolucion', 'arquitectura', 'prompts', 'especificacion', 'paquete', 'resumen']) {
    assert.ok(cli.includes(` *   ${command}`) || cli.includes(` *   ${command} `), `el comando ${command} no está documentado en la ayuda`);
  }
});
