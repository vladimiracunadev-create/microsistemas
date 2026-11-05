/**
 * Interfaz web de System Architect Studio.
 *
 * Esta capa solo presenta y recoge datos: todo cálculo ocurre en el núcleo
 * (`core/`), que es el mismo que usa el adaptador de línea de comandos. Nada
 * del contenido que escribe la persona se inserta como HTML: se usa
 * `textContent` y creación de nodos, de modo que el texto nunca se interpreta.
 */

import { defaultConfig, normalizeConfig, getPath, setPath, CONFIG_SCHEMA_VERSION } from '../core/schema/config-schema.js';
import { analyze, documents, zipBundle, summarize } from '../core/engine.js';
import { parseConfigJson } from '../core/validation/validator.js';
import { loadCatalogForWeb, isFileProtocol, downloadText, downloadBytes, copyText, listSavedConfigs, saveConfig, readUploadedFile } from '../adapters/web/web-adapter.js';
import { FORM_SECTIONS, QUALITY_ATTRIBUTES, flattenFields } from './form-schema.js';
import { PROMPT_CATALOG, CONDITIONAL_PROMPTS } from '../templates/prompts/prompt-catalog.js';

/* ------------------------------------------------------------------ */
/* Utilidades de DOM                                                   */
/* ------------------------------------------------------------------ */

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = String(value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (value === true) node.setAttribute(key, '');
    else node.setAttribute(key, String(value));
  }
  const items = Array.isArray(children) ? children : [children];
  for (const child of items) {
    if (child === null || child === undefined || child === false) continue;
    node.appendChild(typeof child === 'string' || typeof child === 'number'
      ? document.createTextNode(String(child))
      : child);
  }
  return node;
}

function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function fmt(value, decimals = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('es', { maximumFractionDigits: decimals });
}

function table(headers, rows, emptyText = 'Sin datos.') {
  if (!rows.length) return el('p', { class: 'muted', text: emptyText });
  return el('div', { class: 'table-scroll' }, [
    el('table', { class: 'data' }, [
      el('thead', {}, el('tr', {}, headers.map((h) => el('th', { text: h })))),
      el('tbody', {}, rows.map((row) => el('tr', {}, row.map((cell) => {
        const isNum = typeof cell === 'number';
        return el('td', { class: isNum ? 'num' : null, text: isNum ? fmt(cell, 2) : String(cell ?? '—') });
      }))))
    ])
  ]);
}

function list(items, emptyText = 'Sin datos.') {
  if (!items || !items.length) return el('p', { class: 'muted', text: emptyText });
  return el('ul', {}, items.map((i) => el('li', { text: String(i) })));
}

function stat(label, value) {
  return el('div', { class: 'stat' }, [
    el('span', { class: 'label', text: label }),
    el('span', { class: 'value', text: String(value) })
  ]);
}

/* ------------------------------------------------------------------ */
/* Estado                                                              */
/* ------------------------------------------------------------------ */

const state = {
  catalog: null,
  config: defaultConfig(),
  bundle: null,
  analysisError: null,
  activeSection: FORM_SECTIONS[0].id,
  activeTab: 'resumen',
  examples: [],
  searchTerms: {}
};

const PROMPT_IDS = [...PROMPT_CATALOG, ...CONDITIONAL_PROMPTS].sort((a, b) => a.order - b.order);

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'validacion', label: 'Validación' },
  { id: 'compatibilidad', label: 'Compatibilidad' },
  { id: 'capacidad', label: 'Capacidad' },
  { id: 'evolucion', label: 'Evolución' },
  { id: 'arquitectura', label: 'Arquitectura' },
  { id: 'requisitos', label: 'Requisitos' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'glosario', label: 'Glosario' },
  { id: 'exportar', label: 'Exportar' }
];

let toastTimer = null;

function toast(message, kind = 'ok') {
  const node = document.getElementById('toast');
  node.className = kind;
  node.textContent = message;
  node.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { node.hidden = true; }, 5000);
}

function showLoadError(message) {
  const node = document.getElementById('load-error');
  node.textContent = message;
  node.hidden = false;
}

/* ------------------------------------------------------------------ */
/* Arranque                                                            */
/* ------------------------------------------------------------------ */

async function init() {
  // El microsistema no declara versión propia: es una aplicación más del
  // entorno. Lo único que se muestra es el contrato de configuración, que sí es
  // un versionado técnico propio de esta herramienta.
  document.getElementById('version-badge').textContent = CONFIG_SCHEMA_VERSION;

  if (isFileProtocol()) {
    const notice = document.getElementById('file-notice');
    notice.textContent = 'La página se abrió como archivo local (file://). El navegador bloquea la lectura de los catálogos en ese modo. Sirva el repositorio por HTTP, por ejemplo con el contenedor del proyecto o un servidor local, y vuelva a abrir esta página.';
    notice.hidden = false;
  }

  restoreTheme();
  wireToolbar();

  try {
    state.catalog = await loadCatalogForWeb();
  } catch (err) {
    showLoadError(`No se pudo cargar el catálogo. ${err.message}`);
    return;
  }

  try {
    const response = await fetch('./templates/systems/index.json', { cache: 'no-cache' });
    if (response.ok) {
      const index = await response.json();
      state.examples = index.examples || [];
      const select = document.getElementById('example-select');
      for (const ex of state.examples) {
        select.appendChild(el('option', { value: ex.file, text: `${ex.scenario}. ${ex.name}` }));
      }
    }
  } catch (err) {
    // Los ejemplos son opcionales: la aplicación funciona sin ellos.
  }

  refreshSavedList();
  renderTabs();
  renderNav();
  renderSection();
  recompute();
}

function restoreTheme() {
  let theme = 'dark';
  try {
    theme = window.localStorage.getItem('sas.theme')
      || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  } catch (err) {
    theme = 'dark';
  }
  applyTheme(theme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const button = document.getElementById('btn-theme');
  button.textContent = theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
  button.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
  try { window.localStorage.setItem('sas.theme', theme); } catch (err) { /* sin persistencia */ }
}

function wireToolbar() {
  document.getElementById('btn-theme').addEventListener('click', () => {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!window.confirm('Se descartará la configuración actual del formulario. Las configuraciones guardadas no se eliminan. ¿Continuar?')) return;
    state.config = defaultConfig();
    renderSection();
    recompute();
    toast('Formulario restablecido.');
  });

  document.getElementById('btn-import').addEventListener('click', () => document.getElementById('file-input').click());

  document.getElementById('file-input').addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      const text = await readUploadedFile(file);
      const parsed = parseConfigJson(text);
      if (!parsed.ok) {
        toast(`No se pudo importar: ${parsed.errors[0]}`, 'error');
        return;
      }
      for (const warning of parsed.warnings) toast(warning);
      state.config = normalizeConfig(parsed.config);
      renderSection();
      recompute();
      toast(`Configuración importada: ${state.config.identity.name || 'sin nombre'}.`);
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  document.getElementById('example-select').addEventListener('change', async (event) => {
    const file = event.target.value;
    event.target.value = '';
    if (!file) return;
    try {
      const response = await fetch(`./templates/systems/${encodeURIComponent(file)}`, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const parsed = parseConfigJson(await response.text());
      if (!parsed.ok) throw new Error(parsed.errors[0]);
      state.config = normalizeConfig(parsed.config);
      renderSection();
      recompute();
      toast(`Ejemplo cargado: ${state.config.identity.name}.`);
    } catch (err) {
      toast(`No se pudo cargar el ejemplo: ${err.message}`, 'error');
    }
  });

  document.getElementById('btn-save').addEventListener('click', () => {
    const suggested = state.config.identity.name || 'Configuración sin nombre';
    const name = window.prompt('Nombre con el que se guardará en este navegador:', suggested);
    if (!name) return;
    const result = saveConfig(name.trim().slice(0, 120), state.config);
    if (result.ok) {
      refreshSavedList();
      toast('Guardada en este navegador. No sale del equipo.');
    } else {
      toast(result.error || 'No se pudo guardar.', 'error');
    }
  });

  document.getElementById('saved-select').addEventListener('change', (event) => {
    const name = event.target.value;
    event.target.value = '';
    if (!name) return;
    const entry = listSavedConfigs().find((item) => item.name === name);
    if (!entry) { toast('No se encontró la configuración guardada.', 'error'); return; }
    state.config = normalizeConfig(entry.config);
    renderSection();
    recompute();
    toast(`Cargada: ${name}.`);
  });

  document.getElementById('btn-prev').addEventListener('click', () => moveSection(-1));
  document.getElementById('btn-next').addEventListener('click', () => moveSection(1));
  document.getElementById('field-search').addEventListener('input', (event) => renderFieldSearch(event.target.value));
}

function refreshSavedList() {
  const select = document.getElementById('saved-select');
  clear(select);
  select.appendChild(el('option', { value: '', text: 'Guardadas…' }));
  for (const item of listSavedConfigs()) {
    select.appendChild(el('option', { value: item.name, text: item.name }));
  }
}

function moveSection(delta) {
  const index = FORM_SECTIONS.findIndex((s) => s.id === state.activeSection);
  const next = FORM_SECTIONS[Math.min(Math.max(index + delta, 0), FORM_SECTIONS.length - 1)];
  state.activeSection = next.id;
  renderNav();
  renderSection();
  document.getElementById('form-panel').focus();
}

/* ------------------------------------------------------------------ */
/* Navegación y búsqueda de campos                                     */
/* ------------------------------------------------------------------ */

function renderNav() {
  const container = document.getElementById('section-list');
  clear(container);
  const sectionStats = state.bundle ? state.bundle.validation.completeness.sections : [];

  for (const section of FORM_SECTIONS) {
    const stats = sectionStats.find((s) => s.id === section.id);
    const button = el('button', {
      type: 'button',
      'aria-current': section.id === state.activeSection ? 'true' : 'false',
      onclick: () => { state.activeSection = section.id; renderNav(); renderSection(); }
    }, [
      el('span', { text: `${section.number}. ${section.title}` }),
      stats ? el('span', { class: 'pct', text: `${stats.percent}%` }) : null
    ]);
    container.appendChild(el('li', {}, button));
  }
}

function renderFieldSearch(term) {
  const container = document.getElementById('search-results');
  const query = String(term || '').trim().toLowerCase();
  clear(container);
  if (query.length < 2) { container.hidden = true; return; }

  const hits = flattenFields().filter((f) => f.label.toLowerCase().includes(query)
    || f.path.toLowerCase().includes(query)
    || (f.help || '').toLowerCase().includes(query)).slice(0, 12);

  container.hidden = false;
  if (!hits.length) {
    container.appendChild(el('p', { class: 'muted', text: 'Ningún campo coincide.' }));
    return;
  }
  container.appendChild(el('p', { class: 'muted', text: `${hits.length} campo(s):` }));
  const ul = el('ul', {});
  for (const hit of hits) {
    ul.appendChild(el('li', {}, el('button', {
      type: 'button',
      class: 'small ghost',
      onclick: () => {
        state.activeSection = hit.section;
        document.getElementById('field-search').value = '';
        container.hidden = true;
        renderNav();
        renderSection();
      }
    }, `${hit.label} — ${hit.sectionTitle}`)));
  }
  container.appendChild(ul);
}

/* ------------------------------------------------------------------ */
/* Formulario                                                          */
/* ------------------------------------------------------------------ */

function renderSection() {
  const section = FORM_SECTIONS.find((s) => s.id === state.activeSection) || FORM_SECTIONS[0];
  document.getElementById('section-title').textContent = `${section.number}. ${section.title}`;
  document.getElementById('section-help').textContent = section.help || '';

  const form = document.getElementById('dynamic-form');
  clear(form);
  for (const field of section.fields) {
    if (typeof field.showIf === 'function' && !field.showIf(state.config)) continue;
    form.appendChild(renderField(field));
  }

  const index = FORM_SECTIONS.findIndex((s) => s.id === section.id);
  document.getElementById('btn-prev').disabled = index === 0;
  document.getElementById('btn-next').disabled = index === FORM_SECTIONS.length - 1;
}

function fieldId(path) {
  return `f-${path.replace(/[^a-zA-Z0-9]/g, '-')}`;
}

function labelFor(field, id) {
  return el('label', { for: id }, [
    field.label,
    field.required ? el('span', { class: 'req', text: '*', title: 'Obligatorio' }) : null
  ]);
}

function helpNode(field) {
  return field.help ? el('p', { class: 'help', id: `${fieldId(field.path)}-help`, text: field.help }) : null;
}

function onFieldChange(path, value) {
  setPath(state.config, path, value);
  recompute();
}

function renderField(field) {
  const id = fieldId(field.path);
  const value = getPath(state.config, field.path);

  switch (field.type) {
    case 'text':
    case 'textarea': {
      const input = field.type === 'textarea'
        ? el('textarea', { id, rows: field.rows || 3, 'aria-describedby': field.help ? `${id}-help` : null })
        : el('input', { type: 'text', id, placeholder: field.placeholder || '', 'aria-describedby': field.help ? `${id}-help` : null });
      input.value = value || '';
      input.addEventListener('change', (e) => onFieldChange(field.path, e.target.value));
      return el('div', { class: 'field' }, [labelFor(field, id), input, helpNode(field)]);
    }

    case 'number': {
      const input = el('input', {
        type: 'number', id, min: field.min ?? null, max: field.max ?? null, step: field.step || 1,
        'aria-describedby': field.help ? `${id}-help` : null
      });
      input.value = !value ? '' : String(value);
      input.addEventListener('change', (e) => {
        const raw = e.target.value.trim();
        onFieldChange(field.path, raw === '' ? 0 : Number(raw));
      });
      return el('div', { class: 'field' }, [labelFor(field, id), input, helpNode(field)]);
    }

    case 'boolean': {
      const input = el('input', { type: 'checkbox', id, 'aria-describedby': field.help ? `${id}-help` : null });
      input.checked = Boolean(value);
      input.addEventListener('change', (e) => { onFieldChange(field.path, e.target.checked); renderSection(); });
      return el('div', { class: 'field inline' }, [input, el('label', { for: id, text: field.label }), helpNode(field)]);
    }

    case 'select': {
      const select = el('select', { id, 'aria-describedby': field.help ? `${id}-help` : null });
      for (const option of field.options) {
        const opt = el('option', { value: String(option.id), text: option.name });
        if (String(option.id) === String(value)) opt.selected = true;
        select.appendChild(opt);
      }
      select.addEventListener('change', (e) => {
        onFieldChange(field.path, field.numeric ? Number(e.target.value) : e.target.value);
        renderSection();
      });
      const current = field.options.find((o) => String(o.id) === String(value));
      return el('div', { class: 'field' }, [
        labelFor(field, id),
        select,
        current && current.description ? el('p', { class: 'help', text: current.description }) : null,
        helpNode(field)
      ]);
    }

    case 'dimension': return renderDimensionField(field);
    case 'systems': return renderSystemsField(field);
    case 'tags': return renderTagsField(field);
    case 'repeater': return renderRepeaterField(field);
    case 'priorities': return renderPrioritiesField(field);
    case 'horizon': return renderHorizonField(field);
    case 'scenarios': return renderScenariosField(field);
    case 'prompts': return renderPromptsField(field);
    default: return el('p', { class: 'muted', text: `Tipo de campo no soportado: ${field.type}` });
  }
}

function dimensionOptions(field) {
  if (field.catalog === 'families') {
    return state.catalog.families.map((f) => ({ id: f.id, name: f.name, description: f.description }));
  }
  const dim = state.catalog.getDimension(field.catalog);
  return dim ? dim.options : [];
}

function renderDimensionField(field) {
  const options = dimensionOptions(field);
  const current = getPath(state.config, field.path);
  const id = fieldId(field.path);

  if (!field.multiple) {
    const select = el('select', { id });
    select.appendChild(el('option', { value: '', text: 'No declarado' }));
    for (const option of options) {
      const opt = el('option', { value: option.id, text: option.name });
      if (option.id === current) opt.selected = true;
      select.appendChild(opt);
    }
    select.addEventListener('change', (e) => { onFieldChange(field.path, e.target.value); renderSection(); });
    const chosen = options.find((o) => o.id === current);
    return el('div', { class: 'field' }, [
      labelFor(field, id),
      select,
      chosen ? el('p', { class: 'help', text: chosen.description }) : null,
      helpNode(field)
    ]);
  }

  const selected = Array.isArray(current) ? current : [];
  const box = el('div', { class: 'options', role: 'group', 'aria-label': field.label });
  for (const option of options) {
    const optId = `${id}-${option.id}`;
    const checkbox = el('input', { type: 'checkbox', id: optId });
    checkbox.checked = selected.includes(option.id);
    checkbox.addEventListener('change', (e) => {
      const next = new Set(getPath(state.config, field.path) || []);
      if (e.target.checked) next.add(option.id); else next.delete(option.id);
      setPath(state.config, field.path, [...next]);
      recompute();
      renderSection();
    });
    box.appendChild(el('div', { class: 'option' }, [
      checkbox,
      el('label', { for: optId }, [
        el('span', { class: 'name', text: option.name }),
        option.description ? el('span', { class: 'desc', text: ` ${option.description}` }) : null
      ])
    ]));
  }
  return el('div', { class: 'field' }, [el('span', { class: 'field-label', text: field.label }), box, helpNode(field)]);
}

function renderSystemsField(field) {
  const id = fieldId(field.path);
  const selected = getPath(state.config, field.path) || [];
  const term = state.searchTerms[field.path] || '';
  const familyFilter = state.searchTerms[`${field.path}:family`] || '';

  const search = el('input', { type: 'search', id, placeholder: 'Buscar tipo de sistema (nombre, sigla, sinónimo o capacidad)' });
  search.value = term;
  search.addEventListener('input', (e) => {
    state.searchTerms[field.path] = e.target.value;
    renderSection();
    const again = document.getElementById(id);
    if (again) { again.focus(); again.setSelectionRange(again.value.length, again.value.length); }
  });

  const familySelect = el('select', { 'aria-label': 'Filtrar por familia', style: 'max-width:220px' });
  familySelect.appendChild(el('option', { value: '', text: 'Todas las familias' }));
  for (const family of state.catalog.families) {
    const opt = el('option', { value: family.id, text: family.name });
    if (familyFilter === family.id) opt.selected = true;
    familySelect.appendChild(opt);
  }
  familySelect.addEventListener('change', (e) => {
    state.searchTerms[`${field.path}:family`] = e.target.value;
    renderSection();
  });

  let candidates = term.trim().length >= 2 ? state.catalog.search(term, 60) : state.catalog.systems;
  if (familyFilter) candidates = candidates.filter((s) => s.family === familyFilter);
  candidates = candidates.slice(0, 80);

  const box = el('div', { class: 'options', role: 'group', 'aria-label': 'Tipos de sistema disponibles' });
  for (const system of candidates) {
    const optId = `${id}-${system.id}`;
    const checkbox = el('input', { type: 'checkbox', id: optId });
    checkbox.checked = selected.includes(system.id);
    checkbox.addEventListener('change', (e) => {
      const next = new Set(getPath(state.config, field.path) || []);
      if (e.target.checked) next.add(system.id); else next.delete(system.id);
      setPath(state.config, field.path, [...next]);
      recompute();
      renderSection();
    });
    box.appendChild(el('div', { class: 'option' }, [
      checkbox,
      el('label', { for: optId }, [
        el('span', { class: 'name', text: `${system.acronym} — ${system.canonicalName}` }),
        el('span', { class: 'desc', text: ` ${state.catalog.getFamily(system.family)?.name || system.family}. ${system.pedagogicalDescription}` })
      ])
    ]));
  }

  const chips = el('div', { class: 'chips' });
  for (const sid of selected) {
    const system = state.catalog.getSystem(sid);
    chips.appendChild(el('span', { class: 'chip' }, [
      system ? system.acronym : sid,
      el('button', {
        type: 'button',
        'aria-label': `Quitar ${system ? system.canonicalName : sid}`,
        onclick: () => {
          setPath(state.config, field.path, (getPath(state.config, field.path) || []).filter((x) => x !== sid));
          recompute();
          renderSection();
        }
      }, '×')
    ]));
  }

  const suggestions = state.catalog.suggestedRelations(selected).slice(0, 8);
  const suggestionBox = suggestions.length
    ? el('details', {}, [
      el('summary', { text: `Sistemas relacionados sugeridos (${suggestions.length})` }),
      el('p', { class: 'muted', text: 'Sugerencias del catálogo según lo ya elegido. No son obligatorias.' }),
      el('div', { class: 'chips' }, suggestions.map((s) => el('button', {
        type: 'button', class: 'small',
        onclick: () => {
          const next = new Set(getPath(state.config, field.path) || []);
          next.add(s.id);
          setPath(state.config, field.path, [...next]);
          recompute();
          renderSection();
        }
      }, `+ ${s.acronym} — ${s.name}`)))
    ])
    : null;

  return el('div', { class: 'field' }, [
    labelFor(field, id),
    el('div', { class: 'search-row' }, [search, familySelect]),
    el('p', { class: 'help', text: `${candidates.length} de ${state.catalog.systems.length} tipos mostrados. ${selected.length} seleccionado(s).` }),
    box,
    chips.childNodes.length ? chips : null,
    suggestionBox,
    helpNode(field)
  ]);
}

function renderTagsField(field) {
  const id = fieldId(field.path);
  const values = getPath(state.config, field.path) || [];
  const area = el('textarea', { id, rows: Math.min(Math.max(values.length + 1, 3), 10), 'aria-describedby': `${id}-help` });
  area.value = values.join('\n');
  area.addEventListener('change', (e) => {
    const next = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 500);
    onFieldChange(field.path, next);
  });
  return el('div', { class: 'field' }, [
    labelFor(field, id),
    area,
    el('p', { class: 'help', id: `${id}-help`, text: field.help ? `${field.help} Un elemento por línea.` : 'Un elemento por línea.' })
  ]);
}

function renderRepeaterField(field) {
  const items = getPath(state.config, field.path) || [];
  const container = el('div', {});

  items.forEach((item, index) => {
    const body = el('div', { class: 'grid-2' });
    for (const sub of field.itemFields) {
      if (typeof sub.showIf === 'function' && !sub.showIf(item)) continue;
      const subId = `${fieldId(field.path)}-${index}-${sub.key}`;
      let input;
      if (sub.type === 'tags') {
        input = el('textarea', { id: subId, rows: 2 });
        input.value = (item[sub.key] || []).join('\n');
        input.addEventListener('change', (e) => {
          item[sub.key] = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean);
          recompute();
        });
      } else if (sub.type === 'select') {
        input = el('select', { id: subId });
        for (const option of sub.options) {
          const opt = el('option', { value: String(option.id), text: option.name });
          if (String(option.id) === String(item[sub.key] ?? '')) opt.selected = true;
          input.appendChild(opt);
        }
        input.addEventListener('change', (e) => { item[sub.key] = e.target.value; recompute(); renderSection(); });
      } else if (sub.type === 'number') {
        input = el('input', { type: 'number', id: subId, min: sub.min ?? null });
        input.value = item[sub.key] ?? '';
        input.addEventListener('change', (e) => { item[sub.key] = e.target.value === '' ? 0 : Number(e.target.value); recompute(); });
      } else {
        input = el('input', { type: 'text', id: subId });
        input.value = item[sub.key] ?? '';
        input.addEventListener('change', (e) => { item[sub.key] = e.target.value; recompute(); });
      }
      body.appendChild(el('div', { class: 'field' }, [el('label', { for: subId, text: sub.label }), input]));
    }

    container.appendChild(el('div', { class: 'repeater-item' }, [
      el('header', {}, [
        el('span', { text: `${field.itemLabel || 'elemento'} ${index + 1}` }),
        el('button', {
          type: 'button', class: 'small danger',
          onclick: () => {
            const next = (getPath(state.config, field.path) || []).slice();
            next.splice(index, 1);
            setPath(state.config, field.path, next);
            recompute();
            renderSection();
          }
        }, 'Quitar')
      ]),
      body
    ]));
  });

  container.appendChild(el('button', {
    type: 'button',
    onclick: () => {
      const next = (getPath(state.config, field.path) || []).slice();
      next.push({ ...(field.itemDefaults || {}) });
      setPath(state.config, field.path, next);
      recompute();
      renderSection();
    }
  }, `Agregar ${field.itemLabel || 'elemento'}`));

  return el('div', { class: 'field' }, [
    el('span', { class: 'field-label', text: field.label }),
    helpNode(field),
    container
  ]);
}

function renderPrioritiesField(field) {
  const priorities = getPath(state.config, field.path) || {};
  const rows = QUALITY_ATTRIBUTES.map((attr) => {
    const buttons = el('div', { class: 'priority-buttons', role: 'group', 'aria-label': `Prioridad de ${attr.name}` });
    for (const level of [1, 2, 3, 4, 5]) {
      buttons.appendChild(el('button', {
        type: 'button',
        'aria-pressed': Number(priorities[attr.id]) === level ? 'true' : 'false',
        onclick: () => {
          const next = { ...(getPath(state.config, field.path) || {}) };
          if (Number(next[attr.id]) === level) delete next[attr.id];
          else next[attr.id] = level;
          setPath(state.config, field.path, next);
          recompute();
          renderSection();
        }
      }, String(level)));
    }
    return el('div', { class: 'priority-row' }, [
      el('div', {}, [
        el('span', { text: attr.name }),
        el('span', { class: 'iso', text: `ISO/IEC 25010: ${attr.iso}` })
      ]),
      buttons
    ]);
  });

  return el('div', { class: 'field' }, [
    el('span', { class: 'field-label', text: field.label }),
    el('p', { class: 'help', text: 'Pulse de nuevo el mismo número para dejar el atributo sin declarar. Lo no declarado no se inventa.' }),
    el('div', {}, rows)
  ]);
}

function renderHorizonField(field) {
  const horizon = getPath(state.config, field.path) || { unit: 'months', value: 0, openEnded: false };
  const idValue = `${fieldId(field.path)}-value`;
  const idUnit = `${fieldId(field.path)}-unit`;
  const idOpen = `${fieldId(field.path)}-open`;

  const value = el('input', { type: 'number', id: idValue, min: 0 });
  value.value = horizon.value ? String(horizon.value) : '';
  value.addEventListener('change', (e) => {
    horizon.value = e.target.value === '' ? 0 : Number(e.target.value);
    recompute();
  });

  const unit = el('select', { id: idUnit });
  for (const option of [{ id: 'months', name: 'meses' }, { id: 'quarters', name: 'trimestres' }, { id: 'years', name: 'años' }]) {
    const opt = el('option', { value: option.id, text: option.name });
    if (option.id === horizon.unit) opt.selected = true;
    unit.appendChild(opt);
  }
  unit.addEventListener('change', (e) => { horizon.unit = e.target.value; recompute(); });

  const open = el('input', { type: 'checkbox', id: idOpen });
  open.checked = Boolean(horizon.openEnded);
  open.addEventListener('change', (e) => { horizon.openEnded = e.target.checked; recompute(); renderSection(); });

  return el('div', { class: 'field' }, [
    el('span', { class: 'field-label' }, [field.label, el('span', { class: 'req', text: '*' })]),
    el('div', { class: 'grid-2' }, [
      el('div', { class: 'field' }, [el('label', { for: idValue, text: 'Duración' }), value]),
      el('div', { class: 'field' }, [el('label', { for: idUnit, text: 'Unidad' }), unit])
    ]),
    el('div', { class: 'field inline' }, [open, el('label', { for: idOpen, text: 'Sin fecha de término conocida' })]),
    el('p', {
      class: 'help',
      text: horizon.openEnded
        ? 'Se proyecta una ventana de planificación y el plan de revisión queda indefinido en el tiempo.'
        : 'Puede ser cualquier plazo. El análisis de evolución es obligatorio para todo sistema.'
    })
  ]);
}

function renderScenariosField(field) {
  const scenarios = getPath(state.config, field.path) || {};
  const rows = [
    { key: 'conservative', label: 'Conservador' },
    { key: 'expected', label: 'Esperado' },
    { key: 'demanding', label: 'Exigente' }
  ].map(({ key, label }) => {
    if (!scenarios[key]) scenarios[key] = { ratePercent: 0, note: '' };
    const rateId = `${fieldId(field.path)}-${key}-rate`;
    const noteId = `${fieldId(field.path)}-${key}-note`;

    const rate = el('input', { type: 'number', id: rateId, min: 0, step: 0.1 });
    rate.value = scenarios[key].ratePercent ? String(scenarios[key].ratePercent) : '';
    rate.addEventListener('change', (e) => {
      scenarios[key].ratePercent = e.target.value === '' ? 0 : Number(e.target.value);
      recompute();
    });

    const note = el('input', { type: 'text', id: noteId, placeholder: 'Supuesto del escenario' });
    note.value = scenarios[key].note || '';
    note.addEventListener('change', (e) => { scenarios[key].note = e.target.value; recompute(); });

    return el('div', { class: 'grid-2' }, [
      el('div', { class: 'field' }, [el('label', { for: rateId, text: `${label}: tasa anual (%)` }), rate]),
      el('div', { class: 'field' }, [el('label', { for: noteId, text: `${label}: supuesto` }), note])
    ]);
  });

  return el('div', { class: 'field' }, [
    el('span', { class: 'field-label', text: field.label }),
    helpNode(field),
    el('div', {}, rows)
  ]);
}

function renderPromptsField(field) {
  const selected = getPath(state.config, field.path) || [];
  const box = el('div', { class: 'options', role: 'group', 'aria-label': 'Prompts a generar' });
  for (const template of PROMPT_IDS) {
    const applicable = typeof template.appliesWhen !== 'function' || template.appliesWhen(state.config);
    const optId = `${fieldId(field.path)}-${template.id}`;
    const checkbox = el('input', { type: 'checkbox', id: optId, disabled: !applicable });
    checkbox.checked = selected.includes(template.id);
    checkbox.addEventListener('change', (e) => {
      const next = new Set(getPath(state.config, field.path) || []);
      if (e.target.checked) next.add(template.id); else next.delete(template.id);
      setPath(state.config, field.path, [...next]);
      recompute();
      renderSection();
    });
    box.appendChild(el('div', { class: 'option' }, [
      checkbox,
      el('label', { for: optId }, [
        el('span', { class: 'name', text: `${template.order}. ${template.name}` }),
        el('span', { class: 'desc', text: applicable ? ` ${template.discipline}` : ` ${template.discipline} — no aplica a esta configuración.` })
      ])
    ]));
  }
  return el('div', { class: 'field' }, [
    el('span', { class: 'field-label', text: field.label }),
    helpNode(field),
    box,
    el('div', { class: 'toolbar', style: 'margin-top:8px' }, [
      el('button', {
        type: 'button', class: 'small',
        onclick: () => { setPath(state.config, field.path, []); recompute(); renderSection(); }
      }, 'Todos los aplicables')
    ])
  ]);
}

/* ------------------------------------------------------------------ */
/* Cálculo y resultados                                                */
/* ------------------------------------------------------------------ */

function recompute() {
  if (!state.catalog) return;
  try {
    state.bundle = analyze(state.config, state.catalog);
    state.analysisError = null;
  } catch (err) {
    state.bundle = null;
    state.analysisError = err.message;
  }
  renderNav();
  renderCompleteness();
  renderResults();
}

function renderCompleteness() {
  const percent = state.bundle ? state.bundle.validation.completeness.percent : 0;
  document.getElementById('completeness-bar').style.width = `${percent}%`;
  document.getElementById('completeness-label').textContent = `${percent}% declarado`;
}

function renderTabs() {
  const container = document.getElementById('result-tabs');
  clear(container);
  for (const tab of TABS) {
    container.appendChild(el('button', {
      type: 'button',
      role: 'tab',
      id: `tab-${tab.id}`,
      'aria-selected': tab.id === state.activeTab ? 'true' : 'false',
      onclick: () => { state.activeTab = tab.id; renderTabs(); renderResults(); }
    }, tab.label));
  }
}

function renderResults() {
  const body = document.getElementById('result-body');
  clear(body);

  if (state.analysisError) {
    body.appendChild(el('p', { class: 'notice error', text: `No se pudo calcular: ${state.analysisError}` }));
    return;
  }
  if (!state.bundle) {
    body.appendChild(el('p', { class: 'muted', text: 'Complete la configuración para ver el resultado.' }));
    return;
  }

  const renderers = {
    resumen: renderSummaryTab,
    validacion: renderValidationTab,
    compatibilidad: renderCompatibilityTab,
    capacidad: renderCapacityTab,
    evolucion: renderEvolutionTab,
    arquitectura: renderArchitectureTab,
    requisitos: renderRequirementsTab,
    prompts: renderPromptsTab,
    glosario: renderGlossaryTab,
    exportar: renderExportTab
  };
  (renderers[state.activeTab] || renderSummaryTab)(body, state.bundle);
}

function renderSummaryTab(body, bundle) {
  const s = summarize(bundle);
  body.appendChild(el('div', { class: 'summary-grid' }, [
    stat('Completitud', `${s.completeness}%`),
    stat('Errores', s.errors + s.findings.error),
    stat('Advertencias', s.warnings + s.findings.warning),
    stat('Tipos de sistema', s.systemTypes.length),
    stat('Requisitos', s.requirements.functional + s.requirements.nonFunctional + s.requirements.compliance),
    stat('Prompts', s.prompts.length),
    stat('Supuestos', s.assumptions),
    stat('Huella', s.fingerprint)
  ]));

  body.appendChild(el('h3', { text: 'Clasificación' }));
  body.appendChild(table(['Dimensión', 'Valor'], [
    ['Tipos de sistema', s.systemTypes.map((id) => state.catalog.getSystem(id)?.acronym || id).join(', ') || 'no declarado'],
    ['Modo', s.mode === 'existing' ? 'Ampliación de sistema existente' : 'Sistema nuevo'],
    ['Estilo recomendado por el motor', bundle.architecture.style.label],
    ['Estilo declarado', (bundle.config.classification.architecture || []).map((a) => state.catalog.optionName('architecture', a)).join(', ') || 'no declarado'],
    ['Horizonte', s.openEnded ? `sin término conocido (ventana de ${s.horizonMonths} meses)` : `${s.horizonMonths} meses`]
  ]));

  if (bundle.architecture.divergence) {
    body.appendChild(el('p', { class: 'disclaimer', text: bundle.architecture.divergence.message }));
  }

  if (s.capacity) {
    body.appendChild(el('h3', { text: 'Dimensionamiento inicial' }));
    body.appendChild(el('div', { class: 'summary-grid' }, [
      stat('Pico de solicitudes', `${fmt(s.capacity.peakRps, 1)} req/s`),
      stat('Concurrencia en pico', fmt(s.capacity.peakConcurrency)),
      stat('Escrituras en pico', `${fmt(s.capacity.writesPerSecond, 1)}/s`),
      stat('vCPU estimadas', fmt(s.capacity.vcpu, 1)),
      stat('Datos por mes', `${fmt(s.capacity.totalGbPerMonth, 1)} GB`),
      stat('Acumulado', `${fmt(s.capacity.retainedGb)} GB`)
    ]));
  } else {
    body.appendChild(el('p', { class: 'muted', text: 'Sin magnitudes de uso declaradas: no hay dimensionamiento. Indique al menos usuarios registrados o activos diarios.' }));
  }

  body.appendChild(el('p', { class: 'disclaimer', text: bundle.capacity.disclaimer }));
}

function renderValidationTab(body, bundle) {
  const v = bundle.validation;
  body.appendChild(el('p', {
    text: v.ok ? 'La configuración pasa la validación.' : `La configuración tiene ${v.errors.length} error(es) que deben corregirse.`
  }));

  const group = (title, items, kind) => {
    if (!items.length) return;
    body.appendChild(el('h3', { text: `${title} (${items.length})` }));
    for (const item of items) {
      body.appendChild(el('div', { class: `finding ${kind}` }, [
        el('h4', { text: item.path }),
        el('p', { text: item.message })
      ]));
    }
  };
  group('Errores', v.errors, 'error');
  group('Advertencias', v.warnings, 'warning');
  group('Informativos', v.info, 'info');

  body.appendChild(el('h3', { text: 'Completitud por sección' }));
  body.appendChild(table(['Sección', 'Declarado', '%'], v.completeness.sections.map((s) => [s.label, `${s.declared}/${s.total}`, s.percent])));

  if (bundle.migration.warnings.length) {
    body.appendChild(el('h3', { text: 'Migración del esquema' }));
    body.appendChild(list(bundle.migration.warnings));
  }
}

function renderCompatibilityTab(body, bundle) {
  const c = bundle.compatibility;
  body.appendChild(el('p', { class: 'muted', text: `${c.rulesEvaluated} reglas evaluadas. El motor advierte incompatibilidades reales, pero no prohíbe combinaciones técnicamente válidas.` }));
  body.appendChild(el('div', { class: 'summary-grid' }, [
    stat('Errores', c.counts.error),
    stat('Advertencias', c.counts.warning),
    stat('Informativos', c.counts.info)
  ]));

  const titles = { error: 'Errores', warning: 'Advertencias', info: 'Informativos y restricciones del dominio' };
  for (const kind of ['error', 'warning', 'info']) {
    const items = c.bySeverity[kind] || [];
    if (!items.length) continue;
    body.appendChild(el('h3', { text: `${titles[kind]} (${items.length})` }));
    for (const f of items) {
      body.appendChild(el('div', { class: `finding ${kind}` }, [
        el('h4', { text: f.title }),
        el('p', { text: f.message }),
        el('p', { class: 'why', text: `Por qué: ${f.rationale}` }),
        el('p', { class: 'fix', text: `Recomendación: ${f.recommendation}` })
      ]));
    }
  }

  if (c.suggestedRelations.length) {
    body.appendChild(el('h3', { text: 'Sistemas relacionados sugeridos' }));
    body.appendChild(list(c.suggestedRelations.map((r) => `${r.acronym} — ${r.name} (sugerido por ${r.from})`)));
  }
}

function renderCapacityTab(body, bundle) {
  const cap = bundle.capacity;
  if (!cap.hasDemand) {
    body.appendChild(el('p', { class: 'muted', text: cap.disclaimer }));
    return;
  }

  body.appendChild(el('h3', { text: 'Resultados' }));
  body.appendChild(table(['Resultado', 'Valor', 'Unidad', 'Fórmula', 'Rango'],
    cap.results.map((r) => [r.label, r.value, r.unit, r.formula, r.range ? `${fmt(r.range.low, 1)} – ${fmt(r.range.high, 1)}` : '—'])));

  const withNotes = cap.results.filter((r) => r.note);
  if (withNotes.length) {
    body.appendChild(el('h3', { text: 'Notas de los resultados' }));
    for (const r of withNotes) {
      body.appendChild(el('details', {}, [el('summary', { text: r.label }), el('p', { text: r.note })]));
    }
  }

  body.appendChild(el('h3', { text: `Supuestos del motor (${cap.assumptions.length})` }));
  if (cap.assumptions.length) {
    for (const a of cap.assumptions) {
      body.appendChild(el('div', { class: 'finding info' }, [
        el('h4', { text: a.text }),
        el('p', { class: 'why', text: a.because })
      ]));
    }
  } else {
    body.appendChild(el('p', { class: 'muted', text: 'Ninguno: todas las magnitudes usadas fueron declaradas.' }));
  }

  if (cap.availability) {
    body.appendChild(el('h3', { text: 'Disponibilidad' }));
    body.appendChild(table(['Objetivo', 'Indisponibilidad al mes', 'Al año'], [[
      `${cap.availability.target}%`,
      `${fmt(cap.availability.downtimeMinutesPerMonth, 1)} min`,
      `${fmt(cap.availability.downtimeMinutesPerYear, 1)} min`
    ]]));
    body.appendChild(el('p', { class: 'disclaimer', text: cap.availability.note }));
  }

  if (cap.cost) {
    body.appendChild(el('h3', { text: 'Costo estimado' }));
    body.appendChild(table(['Partida', 'Cantidad', 'Precio unitario', 'USD/mes'],
      cap.cost.lines.map((l) => [l.label, l.quantity, `${l.unitPrice} ${l.unitLabel}`, l.monthlyUsd])));
    body.appendChild(el('p', { text: `Total: ${fmt(cap.cost.monthlyUsd, 2)} USD/mes (rango ${fmt(cap.cost.range.low, 2)} – ${fmt(cap.cost.range.high, 2)}). Anual: ${fmt(cap.cost.annualUsd, 2)} USD.` }));
    if (cap.cost.budgetNote) body.appendChild(el('p', { class: 'disclaimer', text: cap.cost.budgetNote }));
    body.appendChild(el('p', { class: 'muted', text: cap.cost.note }));
  }

  body.appendChild(el('h3', { text: `Cuellos de botella potenciales (${cap.bottlenecks.length})` }));
  for (const b of cap.bottlenecks) {
    body.appendChild(el('div', { class: 'finding warning' }, [
      el('h4', { text: b.component }),
      el('p', { text: b.reason }),
      el('p', { class: 'fix', text: `Mitigación: ${b.mitigation}` }),
      el('p', { class: 'why', text: `Validación: ${b.validation}` })
    ]));
  }
  if (!cap.bottlenecks.length) body.appendChild(el('p', { class: 'muted', text: 'Ninguno identificado con los datos declarados.' }));

  body.appendChild(el('p', { class: 'disclaimer', text: cap.disclaimer }));
}

function renderEvolutionTab(body, bundle) {
  const ev = bundle.evolution;
  body.appendChild(el('p', {
    text: `Horizonte: ${ev.horizon.openEnded ? `sin término conocido, con ventana de planificación de ${ev.horizon.months} meses` : `${ev.horizon.months} meses`}. Modelo: ${ev.modelName}.`
  }));

  body.appendChild(el('h3', { text: 'Escenarios' }));
  const rows = [];
  for (const scenario of ev.scenarios) {
    for (const p of scenario.points) {
      rows.push([scenario.name, `${scenario.annualRatePercent}%`, p.month, p.users, p.peakRps, p.storageGbPerMonth, p.cumulativeStorageGb, p.monthlyCostUsd ?? '—']);
    }
  }
  body.appendChild(table(['Escenario', 'Tasa anual', 'Mes', 'Usuarios', 'Pico req/s', 'GB/mes', 'GB acumulados', 'USD/mes'], rows, 'Sin proyección: declare un horizonte.'));

  body.appendChild(el('h3', { text: 'Etapas' }));
  for (const s of ev.stages) {
    body.appendChild(el('details', {}, [
      el('summary', { text: `${s.name} — ${s.label}` }),
      el('p', { text: `Foco: ${s.focus}` }),
      el('p', { text: `Arquitectura: ${s.architecture}` }),
      el('p', { class: 'muted', text: `Lo que no se hace aquí: ${s.avoid}` }),
      el('p', { class: 'why', text: `Justificación: ${s.justification}` }),
      el('p', { class: 'fix', text: `Condición de salida: ${s.exitCondition}` })
    ]));
  }
  if (!ev.stages.length) body.appendChild(el('p', { class: 'muted', text: 'Declare un horizonte para proyectar etapas.' }));

  body.appendChild(el('h3', { text: 'Hitos' }));
  body.appendChild(table(['Hito', 'Tipo', 'Expresión', 'Acción', 'Origen'],
    ev.milestones.map((m) => [m.name, m.kind === 'time' ? 'por tiempo' : 'por condición', m.expression, m.action || '—', m.origin])));

  body.appendChild(el('h3', { text: 'Dimensiones de evolución' }));
  for (const d of ev.dimensions) {
    body.appendChild(el('details', {}, [
      el('summary', { text: `${d.order}. ${d.name}` }),
      el('p', { text: d.analysis }),
      d.watch ? el('p', { class: 'muted', text: `Qué vigilar: ${d.watch}` }) : null,
      d.action ? el('p', { class: 'fix', text: `Acción: ${d.action}` }) : null
    ]));
  }

  body.appendChild(el('h3', { text: 'Plan de revisión arquitectónica' }));
  body.appendChild(el('p', { text: `Frecuencia: cada ${ev.reviewPlan.frequencyMonths} meses${ev.reviewPlan.openEnded ? ' (indefinida)' : ''}.` }));
  body.appendChild(table(['Indicador', 'Métrica', 'Umbral', 'Origen'], ev.reviewPlan.indicators.map((i) => [i.name, i.metric, i.threshold, i.source])));
  body.appendChild(el('h4', { text: 'Riesgos' }));
  body.appendChild(table(['Riesgo', 'Impacto', 'Mitigación'], ev.reviewPlan.risks.map((r) => [r.risk, r.impact, r.mitigation])));
  body.appendChild(el('h4', { text: 'Criterios de migración' }));
  body.appendChild(list(ev.reviewPlan.migrationCriteria));

  if (ev.assumptions.length) {
    body.appendChild(el('h3', { text: 'Supuestos' }));
    for (const a of ev.assumptions) {
      body.appendChild(el('div', { class: 'finding info' }, [
        el('h4', { text: a.text }),
        el('p', { class: 'why', text: a.because })
      ]));
    }
  }

  body.appendChild(el('p', { class: 'disclaimer', text: ev.disclaimer }));
}

function renderArchitectureTab(body, bundle) {
  const a = bundle.architecture;
  body.appendChild(el('h3', { text: `Estilo: ${a.style.label}` }));
  body.appendChild(list(a.style.reasons));
  if (a.divergence) body.appendChild(el('p', { class: 'disclaimer', text: a.divergence.message }));

  body.appendChild(el('h3', { text: 'Componentes y límites' }));
  body.appendChild(table(['Componente', 'Responsabilidad', 'Límite', 'Escalado'],
    a.components.map((c) => [c.name, c.responsibility, c.boundary, c.scaling])));

  body.appendChild(el('h3', { text: 'Contratos' }));
  body.appendChild(table(['Contrato', 'Tipo', 'Descripción', 'Versionado'],
    a.contracts.map((c) => [c.id, c.kind, c.description, c.versioning])));

  body.appendChild(el('h3', { text: 'Dependencias críticas' }));
  body.appendChild(table(['Dependencia', 'Por qué', 'Aislamiento', 'Degradado'],
    a.criticalDependencies.map((d) => [d.name, d.why, d.isolation, d.degraded])));

  body.appendChild(el('h3', { text: 'Migraciones y versionado' }));
  body.appendChild(list(Object.values(a.migrationStrategy)));
  body.appendChild(list(Object.values(a.versioning)));

  body.appendChild(el('h3', { text: 'Obsolescencia y recuperación' }));
  body.appendChild(list(Object.values(a.obsolescence)));
  body.appendChild(list([`RPO: ${a.recovery.rpo}`, `RTO: ${a.recovery.rto}`, ...a.recovery.procedures, a.recovery.note]));

  body.appendChild(el('h3', { text: 'Condiciones para rediseñar' }));
  body.appendChild(list(a.redesignConditions));
}

function renderRequirementsTab(body, bundle) {
  const r = bundle.requirements;
  body.appendChild(el('div', { class: 'summary-grid' }, [
    stat('Funcionales', r.counts.functional),
    stat('No funcionales', r.counts.nonFunctional),
    stat('Cumplimiento', r.counts.compliance)
  ]));
  body.appendChild(el('p', { class: 'muted', text: r.note }));

  body.appendChild(el('h3', { text: 'No funcionales' }));
  body.appendChild(table(['ID', 'Atributo', 'Requisito', 'Aceptación', 'Verificación', 'Prioridad'],
    r.nonFunctional.map((x) => [x.id, x.name, x.statement, x.acceptance, x.verification, x.priority])));

  body.appendChild(el('h3', { text: 'Funcionales' }));
  body.appendChild(table(['ID', 'Área', 'Requisito', 'Aceptación', 'Origen'],
    r.functional.map((x) => [x.id, x.area, x.statement, x.acceptance, x.source])));

  body.appendChild(el('h3', { text: 'Cumplimiento' }));
  body.appendChild(table(['ID', 'Origen', 'Requisito', 'Criterio'],
    r.compliance.map((x) => [x.id, x.source, x.statement, x.acceptance])));
}

function renderPromptsTab(body, bundle) {
  const prompts = bundle.prompts.prompts;
  body.appendChild(el('p', { class: 'muted', text: `${prompts.length} prompt(s) generados de forma determinista a partir de esta configuración. Sin consumo de tokens.` }));

  for (const prompt of prompts) {
    body.appendChild(el('details', {}, [
      el('summary', { text: `${prompt.order}. ${prompt.name} (${prompt.discipline})` }),
      el('div', { class: 'toolbar', style: 'margin:8px 0' }, [
        el('button', {
          type: 'button', class: 'small',
          onclick: async () => {
            const result = await copyText(prompt.markdown);
            toast(result.ok ? `Prompt "${prompt.name}" copiado.` : 'El navegador no permitió copiar. Use la descarga.', result.ok ? 'ok' : 'error');
          }
        }, 'Copiar'),
        el('button', {
          type: 'button', class: 'small',
          onclick: () => { downloadText(prompt.filename, prompt.markdown); toast(`Descargado ${prompt.filename}.`); }
        }, 'Descargar Markdown')
      ]),
      el('pre', { class: 'preview', text: prompt.markdown })
    ]));
  }
}

function renderGlossaryTab(body, bundle) {
  body.appendChild(el('p', { class: 'muted', text: 'Definiciones de los tipos elegidos, en lenguaje técnico y pedagógico, más la separación de conceptos que la herramienta no confunde.' }));

  const types = bundle.config.classification.systemTypes || [];
  if (types.length) {
    body.appendChild(el('h3', { text: 'Tipos de sistema elegidos' }));
    for (const id of types) {
      const s = state.catalog.getSystem(id);
      if (!s) continue;
      body.appendChild(el('details', {}, [
        el('summary', { text: `${s.acronym} — ${s.canonicalName}` }),
        el('p', { text: s.formalDescription }),
        el('p', { class: 'muted', text: `En términos simples: ${s.pedagogicalDescription}` }),
        el('p', { text: `Familia: ${state.catalog.getFamily(s.family)?.name} · Subdominio: ${s.subdomain} · Entrada ${s.entryVersion} (${s.updatedAt})` }),
        el('h4', { text: 'Sinónimos' }), list(s.synonyms),
        el('h4', { text: 'Capacidades habituales' }), list(s.capabilities),
        el('h4', { text: 'Restricciones conocidas' }), list(s.constraints),
        el('h4', { text: 'Estándares de referencia' }), list(s.standards),
        el('h4', { text: 'Fuentes' }), list(s.sources)
      ]));
    }
  } else {
    body.appendChild(el('p', { class: 'muted', text: 'Elija tipos de sistema para ver su definición aquí.' }));
  }

  body.appendChild(el('h3', { text: 'Conceptos que no son lo mismo' }));
  body.appendChild(table(['Concepto', 'Qué es'], [
    ['Tipo funcional', 'Qué hace el sistema: ERP, CRM, LMS, SIEM. No dice cómo se construye ni cómo se vende.'],
    ['Modelo de servicio', 'Cómo se entrega: SaaS, PaaS, producto instalable. Independiente del tipo funcional.'],
    ['Arquitectura', 'Cómo se organiza el software: monolito modular, microservicios, orientada a eventos.'],
    ['Despliegue', 'Dónde se ejecuta: local, on-premise, nube, híbrido, edge.'],
    ['Aislamiento', 'Cómo se separan los clientes: single-tenant, multi-tenant compartido o por esquema.'],
    ['Usuarios registrados', 'Cuentas existentes. No implica uso.'],
    ['Usuarios activos', 'Quienes usaron el sistema en un periodo. Diarios ≤ mensuales ≤ registrados.'],
    ['Usuarios concurrentes', 'Sesiones simultáneas en el mismo instante. Es la magnitud que dimensiona la capacidad.'],
    ['Skill', 'Conocimiento e instrucciones reutilizables. No ejecuta ni decide permisos.'],
    ['Agente', 'Componente que razona, planifica y usa herramientas.'],
    ['MCP', 'Protocolo de integración de herramientas y contexto.'],
    ['Harness', 'Infraestructura que organiza y controla la ejecución del agente.'],
    ['Motor de ingeniería', 'Componente determinista que produce especificaciones y validaciones, sin modelos de IA.'],
    ['Confiabilidad de una prueba', 'Consistencia de la medición. No garantiza que mida lo que dice medir.'],
    ['Validez de una prueba', 'Evidencia de que mide el constructo declarado. Implementar un instrumento no lo valida.']
  ]));
}

function renderExportTab(body, bundle) {
  body.appendChild(el('p', { class: 'muted', text: `Todas las exportaciones son locales: nada se envía a ningún servicio. Huella de configuración: ${bundle.fingerprint}.` }));

  const docs = documents(bundle);
  const actions = [
    ['Descargar configuración (JSON)', () => downloadText('configuracion.json', `${JSON.stringify(bundle.config, null, 2)}\n`, 'application/json;charset=utf-8')],
    ['Descargar especificación', () => downloadText('especificacion.md', docs['especificacion.md'])],
    ['Descargar plan de arquitectura', () => downloadText('plan-arquitectura.md', docs['plan-arquitectura.md'])],
    ['Descargar plan de escalabilidad', () => downloadText('plan-escalabilidad.md', docs['plan-escalabilidad.md'])],
    ['Descargar hoja de ruta', () => downloadText('roadmap.md', docs['roadmap.md'])],
    ['Descargar plan de pruebas', () => downloadText('plan-pruebas.md', docs['plan-pruebas.md'])],
    ['Copiar prompt maestro', async () => {
      const master = bundle.prompts.prompts.find((p) => p.id === 'master') || bundle.prompts.prompts[0];
      if (!master) { toast('No hay prompts generados.', 'error'); return; }
      const result = await copyText(master.markdown);
      toast(result.ok ? 'Prompt maestro copiado.' : 'El navegador no permitió copiar. Use la descarga.', result.ok ? 'ok' : 'error');
    }],
    ['Descargar todos los prompts', () => {
      for (const prompt of bundle.prompts.prompts) downloadText(prompt.filename, prompt.markdown);
      toast(`${bundle.prompts.prompts.length} prompts descargados.`);
    }]
  ];

  const grid = el('div', { class: 'export-grid' });
  for (const [label, action] of actions) {
    grid.appendChild(el('button', { type: 'button', onclick: action }, label));
  }
  grid.appendChild(el('button', {
    type: 'button', class: 'primary',
    onclick: () => {
      try {
        const zip = zipBundle(bundle);
        downloadBytes(zip.filename, zip.bytes);
        toast(`Paquete generado: ${zip.filename} (${Object.keys(zip.files).length} archivos).`);
      } catch (err) {
        toast(`No se pudo generar el paquete: ${err.message}`, 'error');
      }
    }
  }, 'Descargar paquete ZIP integral'));
  body.appendChild(grid);

  body.appendChild(el('h3', { text: 'Contenido del paquete' }));
  let fileNames = [];
  try {
    fileNames = Object.keys(zipBundle(bundle).files);
  } catch (err) {
    fileNames = [];
  }
  body.appendChild(list(fileNames, 'No se pudo calcular el contenido del paquete.'));

  body.appendChild(el('h3', { text: 'Vista previa de la especificación' }));
  body.appendChild(el('pre', { class: 'preview', text: docs['especificacion.md'] }));
}

/* ------------------------------------------------------------------ */

init().catch((err) => showLoadError(`Error al iniciar la aplicación: ${err.message}`));
