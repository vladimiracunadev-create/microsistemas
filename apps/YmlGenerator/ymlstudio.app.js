/* global YAML_STUDIO_CATEGORIES, YAML_STUDIO_TEMPLATES, jsyaml */

const tabsEl = document.getElementById("tabs");
const listEl = document.getElementById("templateList");
const searchEl = document.getElementById("search");

const tplTitleEl = document.getElementById("tplTitle");
const tplPathHintEl = document.getElementById("tplPathHint");
const fieldsEl = document.getElementById("fields");

const btnPickRepo = document.getElementById("btnPickRepo");
const repoStatus = document.getElementById("repoStatus");

const btnGenerate = document.getElementById("btnGenerate");
const btnCopy = document.getElementById("btnCopy");
const btnDownload = document.getElementById("btnDownload");
const btnSave = document.getElementById("btnSave");

const fileSelector = document.getElementById("fileSelector");
const fileMeta = document.getElementById("fileMeta");
const previewEl = document.getElementById("preview");
const noteEl = document.getElementById("note");

/**
 * Estado global de la aplicación.
 * Mantiene la categoría activa, la plantilla seleccionada y los archivos generados.
 */
let activeCategory = YAML_STUDIO_CATEGORIES[0]?.id || "cicd";
let activeTemplateId = null;

let repoHandle = null; // DirectoryHandle
let generatedFiles = []; // [{path, content, language}]

init();

function init() {
  renderTabs();
  renderList();

  searchEl.addEventListener("input", renderList);

  btnPickRepo.addEventListener("click", pickRepoFolder);

  btnGenerate.addEventListener("click", () => {
    if (!activeTemplateId) return toast("Selecciona una plantilla primero.");
    generate();
  });

  btnCopy.addEventListener("click", copyCurrent);
  btnDownload.addEventListener("click", downloadAll);
  btnSave.addEventListener("click", saveAllToRepo);

  fileSelector.addEventListener("change", () => {
    const idx = Number(fileSelector.value || 0);
    showPreview(idx);
  });

  updateSaveSupport();
  toast("Tip: abre en http://localhost para guardar directo en carpetas.");
}

/**
 * Renderiza las pestañas de categorías disponibles.
 */
function renderTabs() {
  tabsEl.innerHTML = "";
  for (const cat of YAML_STUDIO_CATEGORIES) {
    const b = document.createElement("div");
    b.className = "tab" + (cat.id === activeCategory ? " active" : "");
    b.textContent = cat.name;
    b.addEventListener("click", () => {
      activeCategory = cat.id;
      activeTemplateId = null;
      generatedFiles = [];
      previewEl.textContent = "Elige una plantilla y presiona “Generar”.";
      fileSelector.innerHTML = "";
      fileMeta.textContent = "";
      tplTitleEl.textContent = "Selecciona una plantilla";
      tplPathHintEl.textContent = "";
      fieldsEl.innerHTML = "";
      renderTabs();
      renderList();
    });
    tabsEl.appendChild(b);
  }
}

function renderList() {
  const q = (searchEl.value || "").trim().toLowerCase();
  const items = YAML_STUDIO_TEMPLATES.filter(t => {
    if (t.category !== activeCategory) return false;
    if (!q) return true;
    return (t.title + " " + t.description + " " + t.id).toLowerCase().includes(q);
  });

  listEl.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.textContent = "No hay plantillas para esa búsqueda.";
    listEl.appendChild(empty);
    return;
  }

  for (const t of items) {
    const div = document.createElement("div");
    div.className = "item" + (t.id === activeTemplateId ? " active" : "");
    div.innerHTML = `
      <div class="name">${escapeHtml(t.title)}</div>
      <div class="desc">${escapeHtml(t.description)}</div>
      <div class="badge">ID: ${escapeHtml(t.id)}</div>
    `;
    div.addEventListener("click", () => {
      activeTemplateId = t.id;
      generatedFiles = [];
      fileSelector.innerHTML = "";
      fileMeta.textContent = "";
      previewEl.textContent = "Presiona “Generar”.";
      renderList();
      renderFields(t);
    });
    listEl.appendChild(div);
  }
}

function renderFields(tpl) {
  tplTitleEl.textContent = tpl.title;
  tplPathHintEl.textContent = "Genera 1+ archivo(s) y guárdalos en la ruta sugerida automáticamente.";

  fieldsEl.innerHTML = "";
  for (const f of tpl.fields) {
    const wrap = document.createElement("div");
    wrap.className = "field";
    const label = document.createElement("label");
    label.textContent = f.label;

    let input;
    if (f.type === "multiline") {
      input = document.createElement("textarea");
      input.value = f.default ?? "";
    } else if (f.type === "boolean") {
      input = document.createElement("input");
      input.type = "checkbox";
      input.checked = Boolean(f.default);
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.value = f.default ?? "";
    }

    input.dataset.fieldId = f.id;
    wrap.appendChild(label);
    wrap.appendChild(input);
    fieldsEl.appendChild(wrap);
  }

  toast("Listo: edita parámetros y presiona “Generar”.");
}

function getValues() {
  const values = {};
  for (const el of fieldsEl.querySelectorAll("[data-field-id]")) {
    const id = el.dataset.fieldId;
    if (el.type === "checkbox") values[id] = el.checked;
    else values[id] = el.value;
  }
  return values;
}

function getActiveTemplate() {
  return YAML_STUDIO_TEMPLATES.find(t => t.id === activeTemplateId) || null;
}

/**
 * Genera los archivos basados en la plantilla seleccionada y los valores del formulario.
 */
function generate() {
  const tpl = getActiveTemplate();
  if (!tpl) return;

  let files = [];
  try {
    files = tpl.output(getValues());
  } catch (e) {
    generatedFiles = [];
    previewEl.textContent = "Error generando: " + String(e);
    fileSelector.innerHTML = "";
    fileMeta.textContent = "";
    return;
  }

  generatedFiles = (files || []).map(f => ({
    path: String(f.path || "").replace(/^\/+/, ""),
    content: String(f.content || ""),
    language: f.language || "yaml"
  })).filter(f => f.path);

  if (!generatedFiles.length) {
    previewEl.textContent = "La plantilla no generó archivos.";
    return;
  }

  fileSelector.innerHTML = "";
  generatedFiles.forEach((f, idx) => {
    const opt = document.createElement("option");
    opt.value = String(idx);
    opt.textContent = f.path;
    fileSelector.appendChild(opt);
  });

  showPreview(0);
  toast(`Generado ✅ (${generatedFiles.length} archivo(s))`);
}

function showPreview(index) {
  const f = generatedFiles[index];
  if (!f) {
    previewEl.textContent = "Sin archivos.";
    fileMeta.textContent = "";
    return;
  }
  previewEl.textContent = f.content;
  fileMeta.textContent = `Archivo: ${f.path} (${Math.max(1, Math.round(f.content.length / 1024))} KB aprox.)`;
}

async function copyCurrent() {
  if (!generatedFiles.length) {
    toast("Primero genera un YAML.");
    return;
  }
  const idx = Number(fileSelector.value || 0);
  const f = generatedFiles[idx] || generatedFiles[0];
  try {
    await navigator.clipboard.writeText(f.content);
    toast("Copiado ✅");
  } catch {
    toast("No se pudo copiar (usa Descargar).");
  }
}

function downloadAll() {
  if (!generatedFiles.length) {
    toast("Primero genera archivos.");
    return;
  }
  // descarga uno por uno
  for (const f of generatedFiles) {
    const fileName = f.path.split("/").pop() || "config.yml";
    const blob = new Blob([f.content], { type: "text/yaml;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  toast(`Descargados ✅ (${generatedFiles.length})`);
}

function updateSaveSupport() {
  const supported = typeof window.showDirectoryPicker === "function";
  btnSave.disabled = !supported;
  if (!supported) {
    noteEl.textContent = "Tu navegador no soporta guardar directo en carpetas. Usa “Descargar” y mueve manualmente los archivos al repo.";
  } else {
    noteEl.textContent = "Guardar en repo: selecciona la carpeta raíz del repo (una vez) y YAML Studio creará las carpetas necesarias y escribirá los archivos.";
  }
}

async function pickRepoFolder() {
  if (typeof window.showDirectoryPicker !== "function") {
    toast("No soportado en este navegador.");
    return;
  }
  try {
    repoHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    repoStatus.textContent = "Repo: seleccionado ✅";
    toast("Repo seleccionado ✅");
  } catch (e) {
    toast("Cancelado.");
  }
}

async function saveAllToRepo() {
  if (!generatedFiles.length) {
    toast("Primero genera archivos.");
    return;
  }
  if (typeof window.showDirectoryPicker !== "function") {
    toast("No soportado en este navegador.");
    return;
  }
  try {
    if (!repoHandle) {
      await pickRepoFolder();
      if (!repoHandle) return;
    }

    for (const f of generatedFiles) {
      await writeFileByPath(repoHandle, f.path, f.content);
    }
    toast(`Guardado en repo ✅ (${generatedFiles.length})`);
  } catch (e) {
    toast("Error guardando: " + String(e));
  }
}

async function writeFileByPath(rootDirHandle, path, content) {
  const parts = String(path).split("/").filter(Boolean);
  const fileName = parts.pop();
  let dir = rootDirHandle;

  for (const p of parts) {
    dir = await dir.getDirectoryHandle(p, { create: true });
  }

  const fileHandle = await dir.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

function toast(msg) {
  noteEl.textContent = msg;
  // no hacemos auto-clear para que quede el estado visible
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}
