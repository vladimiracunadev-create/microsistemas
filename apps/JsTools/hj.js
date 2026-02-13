(() => {
  "use strict";

  const el = (id) => document.getElementById(id);

  const ui = {
    input: null,
    output: null,
    inChars: null,
    inKb: null,
    outChars: null,
    outKb: null,
    statusText: null,
    statusMeta: null,
    fileInput: null,
    urlInput: null,
    actionSelect: null,
    captureSelect: null,
    applyBtn: null,
    downloadBtn: null,
    loadUrlBtn: null,
    pasteBtn: null,
    swapBtn: null,
    clearBtn: null,
    copyInBtn: null,
    copyOutBtn: null
  };

  /**
   * Convierte bytes a kilobytes con 2 o 3 decimales.
   */

  function bytesToKb(bytes) {
    return (bytes / 1024).toFixed(bytes >= 1024 ? 2 : 3);
  }

  function measureText(text) {
    const bytes = new TextEncoder().encode(text || "").length;
    return { chars: (text || "").length, bytes, kb: bytesToKb(bytes) };
  }

  function refreshStats() {
    const a = measureText(ui.input.value);
    const b = measureText(ui.output.value);
    ui.inChars.textContent = String(a.chars);
    ui.inKb.textContent = String(a.kb);
    ui.outChars.textContent = String(b.chars);
    ui.outKb.textContent = String(b.kb);
  }

  function setStatus(msg, meta = "") {
    ui.statusText.textContent = msg;
    ui.statusMeta.textContent = meta;
  }

  function safeGetInput() {
    const s = ui.input.value || "";
    if (!s.trim()) throw new Error("La entrada est\u00E1 vac\u00EDa. Pega o carga un archivo .js primero.");
    return s;
  }

  async function copyText(text) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }

  // --- Comentarios (seguro con strings/template literals) ---
  /**
   * Elimina comentarios de un string de código JS.
   * Maneja bloques, líneas y strings para no corromper el código.
   */
  function stripComments(code) {
    let out = "";
    let i = 0;

    let inStr = false;
    let strCh = "";
    let inLine = false;
    let inBlock = false;

    while (i < code.length) {
      const ch = code[i];
      const next = i + 1 < code.length ? code[i + 1] : "";

      if (inLine) {
        if (ch === "\n") {
          inLine = false;
          out += ch;
        }
        i += 1;
        continue;
      }

      if (inBlock) {
        if (ch === "*" && next === "/") {
          inBlock = false;
          i += 2;
          continue;
        }
        i += 1;
        continue;
      }

      if (inStr) {
        out += ch;
        if (ch === "\\" && next) {
          out += next;
          i += 2;
          continue;
        }
        if (ch === strCh) {
          inStr = false;
          strCh = "";
        }
        i += 1;
        continue;
      }

      if (ch === '"' || ch === "'" || ch === "`") {
        inStr = true;
        strCh = ch;
        out += ch;
        i += 1;
        continue;
      }

      if (ch === "/" && next === "/") {
        inLine = true;
        i += 2;
        continue;
      }

      if (ch === "/" && next === "*") {
        inBlock = true;
        i += 2;
        continue;
      }

      out += ch;
      i += 1;
    }

    return out;
  }

  function collapseWhitespace(code) {
    let out = "";
    let prevSpace = false;

    let inStr = false;
    let strCh = "";
    let i = 0;

    while (i < code.length) {
      const ch = code[i];
      const next = i + 1 < code.length ? code[i + 1] : "";

      if (inStr) {
        out += ch;
        if (ch === "\\" && next) {
          out += next;
          i += 2;
          continue;
        }
        if (ch === strCh) {
          inStr = false;
          strCh = "";
        }
        i += 1;
        continue;
      }

      if (ch === '"' || ch === "'" || ch === "`") {
        inStr = true;
        strCh = ch;
        out += ch;
        i += 1;
        continue;
      }

      const isWs =
        ch === " " || ch === "\n" || ch === "\t" || ch === "\r" || ch === "\f";

      if (isWs) {
        if (!prevSpace) out += " ";
        prevSpace = true;
        i += 1;
        continue;
      }

      prevSpace = false;
      out += ch;
      i += 1;
    }

    return out.trim();
  }

  async function doMinify(code) {
    if (window.Terser && typeof window.Terser.minify === "function") {
      const result = await window.Terser.minify(code, {
        compress: true,
        mangle: true,
        format: { comments: false }
      });
      if (result && result.code) return result.code;
      throw new Error("Terser no devolvi\u00F3 c\u00F3digo.");
    }
    return collapseWhitespace(stripComments(code));
  }

  function doBeautify(code) {
    if (window.js_beautify) {
      return window.js_beautify(code, {
        indent_size: 2,
        wrap_line_length: 100,
        end_with_newline: true
      });
    }
    return code;
  }

  function doObfuscate(code) {
    if (window.JavaScriptObfuscator) {
      const obf = window.JavaScriptObfuscator.obfuscate(code, {
        compact: true,
        simplify: true,
        stringArray: true,
        stringArrayThreshold: 0.75,
        renameGlobals: false
      });
      return obf.getObfuscatedCode();
    }
    return code;
  }

  function doTranspile(code) {
    if (window.Babel && typeof window.Babel.transform === "function") {
      const out = window.Babel.transform(code, {
        presets: [["env", { targets: { ie: "11" } }]]
      });
      return out && out.code ? out.code : code;
    }
    return code;
  }

  async function doLint(code) {
    const ESLintClass = window.ESLint && window.ESLint.ESLint ? window.ESLint.ESLint : null;
    if (!ESLintClass) return "ESLint no est\u00E1 disponible (fall\u00F3 la carga desde CDN).";

    const eslint = new ESLintClass({
      baseConfig: {
        env: { browser: true, es2021: true },
        parserOptions: { ecmaVersion: 2021, sourceType: "script" },
        rules: {
          "no-undef": "error",
          "no-unused-vars": ["warn", { args: "none" }],
          "no-redeclare": "error",
          "no-dupe-keys": "error",
          "no-dupe-args": "error",
          "no-unreachable": "error",
          "eqeqeq": ["warn", "smart"],
          "no-console": "off"
        }
      },
      useEslintrc: false
    });

    const results = await eslint.lintText(code);
    const r = results && results[0] ? results[0] : null;
    if (!r) return "Sin resultados.";

    const lines = [];
    const err = r.errorCount || 0;
    const warn = r.warningCount || 0;
    lines.push(`Resumen: ${err} error(es), ${warn} advertencia(s).`);

    if (r.messages && r.messages.length) {
      lines.push("");
      for (const m of r.messages.slice(0, 200)) {
        const sev = m.severity === 2 ? "ERROR" : "WARN";
        const rule = m.ruleId || "";
        lines.push(`${sev} L${m.line}:C${m.column} ${rule} ${m.message}`.trim());
      }
      if (r.messages.length > 200) lines.push("... (salida truncada)");
    } else {
      lines.push("Sin hallazgos.");
    }

    return lines.join("\n");
  }

  async function doRunSandbox(code, captureMs) {
    const safeCode = String(code).split("</").join("<\\/");

    const sandboxHtml =
      "<!doctype html><html><head><meta charset=\"utf-8\"></head><body>" +
      "<script>(function(){" +
      "const send=function(type,payload){parent.postMessage({__jsTool:true,type:type,payload:payload},\"*\")};" +
      "const hook=function(name){const orig=console[name];console[name]=function(){" +
      "try{send(name,Array.from(arguments).map(function(a){try{return typeof a===\"string\"?a:JSON.stringify(a)}catch(e){return String(a)}}).join(\" \"))}catch(e){}" +
      "return orig.apply(console,arguments)};};" +
      "hook(\"log\");hook(\"warn\");hook(\"error\");hook(\"info\");" +
      "window.onerror=function(msg,src,line,col){send(\"onerror\",String(msg)+\" (L\"+line+\":C\"+col+\")\")};" +
      "window.onunhandledrejection=function(e){try{send(\"rejection\",String(e.reason||e))}catch(_){}};" +
      "})();<\\/script>" +
      "<script>" + safeCode + "<\\/script>" +
      "</body></html>";

    return new Promise((resolve) => {
      const iframe = document.createElement("iframe");
      iframe.setAttribute("sandbox", "allow-scripts");
      iframe.style.display = "none";

      const logs = [];
      const handler = (ev) => {
        const d = ev.data;
        if (!d || !d.__jsTool) return;
        logs.push({ type: d.type, payload: d.payload });
      };

      window.addEventListener("message", handler);
      document.body.appendChild(iframe);
      iframe.srcdoc = sandboxHtml;

      setTimeout(() => {
        window.removeEventListener("message", handler);
        document.body.removeChild(iframe);

        const out = [];
        out.push("Sandbox:");
        out.push("");

        if (!logs.length) {
          out.push("Sin salida.");
          resolve(out.join("\n"));
          return;
        }

        for (const item of logs) {
          const tag = String(item.type || "").toUpperCase();
          out.push(`[${tag}] ${item.payload}`);
        }

        resolve(out.join("\n"));
      }, captureMs);
    });
  }

  /**
   * Sugiere un nombre de archivo para descargar basado en la acción realizada.
   */
  function suggestFilename(action) {
    const base = "codigo";
    if (action === "minify") return base + ".min.js";
    if (action === "beautify") return base + ".beautified.js";
    if (action === "obfuscate") return base + ".obf.js";
    if (action === "transpile") return base + ".es5.js";
    if (action === "stripComments") return base + ".nocomments.js";
    if (action === "escapeJson") return base + ".json.txt";
    if (action === "unescapeJson") return base + ".js";
    if (action === "lint") return base + ".lint.txt";
    if (action === "size") return base + ".size.txt";
    if (action === "run") return base + ".sandbox.txt";
    return base + ".out.txt";
  }

  async function applyAction() {
    const action = ui.actionSelect.value;
    const captureMs = Number(ui.captureSelect.value || 1000);

    ui.applyBtn.disabled = true;
    setStatus("Procesando...", "Acci\u00F3n: " + action);

    try {
      const code = safeGetInput();
      let out = "";

      if (action === "minify") out = await doMinify(code);
      else if (action === "beautify") out = doBeautify(code);
      else if (action === "lint") out = await doLint(code);
      else if (action === "obfuscate") out = doObfuscate(code);
      else if (action === "transpile") out = doTranspile(code);
      else if (action === "stripComments") out = stripComments(code);
      else if (action === "escapeJson") out = JSON.stringify(code);
      else if (action === "unescapeJson") out = JSON.parse(code.trim());
      else if (action === "size") {
        const a = measureText(code);
        const b = measureText(await doMinify(code));
        const deltaBytes = a.bytes - b.bytes;
        const pct = a.bytes ? ((deltaBytes / a.bytes) * 100).toFixed(2) : "0.00";
        out = [
          "Tama\u00F1o:",
          "",
          `Original: ${a.bytes} bytes (${a.kb} KB)`,
          `Minificado: ${b.bytes} bytes (${b.kb} KB)`,
          `Ahorro: ${deltaBytes} bytes (${pct}%)`
        ].join("\n");
      } else if (action === "run") {
        out = await doRunSandbox(code, captureMs);
      } else {
        out = code;
      }

      ui.output.value = out;
      refreshStats();
      setStatus("Listo.", "Salida generada.");
    } catch (e) {
      ui.output.value = "";
      refreshStats();
      setStatus("Error: " + (e && e.message ? e.message : String(e)));
    } finally {
      ui.applyBtn.disabled = false;
    }
  }

  function clearAll() {
    ui.input.value = "";
    ui.output.value = "";
    ui.urlInput.value = "";
    refreshStats();
    setStatus("Listo.");
  }

  function swapOutToIn() {
    const out = ui.output.value || "";
    if (!out.trim()) return;
    ui.input.value = out;
    refreshStats();
    setStatus("Salida copiada a Entrada.");
  }

  function downloadOutput() {
    const text = ui.output.value || "";
    if (!text.trim()) {
      alert("No hay salida para descargar.");
      return;
    }

    const action = ui.actionSelect.value;
    const filename = suggestFilename(action);

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
    setStatus("Descargado.", filename);
  }

  // --------------------------------------------------------------------------
  // UTILIDADES DE MANIPULACIÓN DE TEXTO
  // --------------------------------------------------------------------------

  /**
   * Escapa caracteres HTML para prevenir inyección XSS al mostrar código en el DOM.
   * Convierte &, <, >, " y ' en sus entidades HTML correspondientes.
   * @param {string} text - Texto sin escapar.
   * @returns {string} - Texto seguro para insertar en HTML.
   */
  function escapeHtml(text) {
    if (!text) return text;
    return text.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Copia el texto dado al portapapeles del sistema.
   * Utiliza la API moderna `navigator.clipboard.writeText`.
   * @param {string} text - Texto a copiar.
   * @returns {Promise<void>}
   */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Error al copiar: ', err);
      setStatus("Error al copiar al portapapeles.");
    }
  }

  /**
   * Lee el contenido de un archivo seleccionado por el usuario.
   * Retorna una Promesa que se resuelve con el contenido de texto del archivo.
   * @param {File} file - Objeto File del input.
   * @returns {Promise<string>}
   */
  function readFileToInput(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
      reader.readAsText(file);
    });
  }

  async function loadFromUrl() {
    const url = (ui.urlInput.value || "").trim();
    if (!url) return;

    ui.loadUrlBtn.disabled = true;
    setStatus("Cargando...", url);

    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const text = await res.text();

      ui.input.value = text;
      refreshStats();
      setStatus("Listo.", "Cargado desde URL.");
    } catch (e) {
      setStatus("Error al cargar URL: " + (e && e.message ? e.message : String(e)));
    } finally {
      ui.loadUrlBtn.disabled = false;
    }
  }

  async function pasteFromClipboard() {
    ui.pasteBtn.disabled = true;
    setStatus("Pegando desde portapapeles...");

    try {
      const text = await navigator.clipboard.readText();
      ui.input.value = text || "";
      refreshStats();
      setStatus("Listo.", "Pegado desde portapapeles.");
    } catch {
      setStatus("No se pudo leer el portapapeles (permisos del navegador).");
    } finally {
      ui.pasteBtn.disabled = false;
    }
  }



  /**
   * Inicialización de la UI y eventos.
   */
  function init() {
    ui.input = el("inputCode");
    ui.output = el("outputCode");
    ui.inChars = el("inChars");
    ui.inKb = el("inKb");
    ui.outChars = el("outChars");
    ui.outKb = el("outKb");
    ui.statusText = el("statusText");
    ui.statusMeta = el("statusMeta");
    ui.fileInput = el("fileInput");
    ui.urlInput = el("urlInput");
    ui.actionSelect = el("actionSelect");
    ui.captureSelect = el("captureSelect");
    ui.applyBtn = el("applyBtn");
    ui.downloadBtn = el("downloadBtn");
    ui.loadUrlBtn = el("loadUrlBtn");
    ui.pasteBtn = el("pasteBtn");
    ui.swapBtn = el("swapBtn");
    ui.clearBtn = el("clearBtn");
    ui.copyInBtn = el("copyInBtn");
    ui.copyOutBtn = el("copyOutBtn");

    ui.input.addEventListener("input", refreshStats);

    ui.fileInput.addEventListener("change", async (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;

      setStatus("Cargando archivo...", file.name);
      try {
        const text = await readFileToInput(file);
        ui.input.value = text;
        refreshStats();
        setStatus("Listo.", "Archivo cargado.");
      } catch (e) {
        setStatus("Error: " + (e && e.message ? e.message : String(e)));
      } finally {
        ui.fileInput.value = "";
      }
    });

    ui.applyBtn.addEventListener("click", applyAction);
    ui.loadUrlBtn.addEventListener("click", loadFromUrl);
    ui.pasteBtn.addEventListener("click", pasteFromClipboard);
    ui.swapBtn.addEventListener("click", swapOutToIn);
    ui.clearBtn.addEventListener("click", clearAll);

    ui.copyInBtn.addEventListener("click", () =>
      copyText(ui.input.value || "").then(() => setStatus("Entrada copiada."))
    );

    ui.copyOutBtn.addEventListener("click", () =>
      copyText(ui.output.value || "").then(() => setStatus("Salida copiada."))
    );

    ui.downloadBtn.addEventListener("click", downloadOutput);

    refreshStats();
    setStatus("Listo.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
