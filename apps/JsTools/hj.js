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

  /**
   * Implementaciones locales y deterministas. Los adaptadores conservan
   * compatibilidad con librerias inyectadas por una integracion existente,
   * pero la micro-app no las necesita ni las descarga desde CDN.
   */
  function beautifyLocally(code) {
    let out = "";
    let indent = 0;
    let inString = false;
    let stringChar = "";
    let escaped = false;
    let parenDepth = 0;
    let lineStart = true;

    const write = (value) => {
      if (lineStart) {
        out += "  ".repeat(indent);
        lineStart = false;
      }
      out += value;
    };

    const newLine = () => {
      out = out.trimEnd();
      if (!out.endsWith("\n")) out += "\n";
      lineStart = true;
    };

    for (let i = 0; i < code.length; i += 1) {
      const ch = code[i];
      const next = code[i + 1] || "";

      if (inString) {
        write(ch);
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === stringChar) inString = false;
        continue;
      }

      if (ch === '"' || ch === "'" || ch === "`") {
        inString = true;
        stringChar = ch;
        write(ch);
      } else if (/\s/.test(ch)) {
        if (!lineStart && !out.endsWith(" ") && !out.endsWith("\n")) out += " ";
      } else if (ch === "(") {
        parenDepth += 1;
        write(ch);
      } else if (ch === ")") {
        parenDepth = Math.max(0, parenDepth - 1);
        write(ch);
      } else if (ch === "{") {
        if (!lineStart && !out.endsWith(" ")) out += " ";
        write(ch);
        indent += 1;
        newLine();
      } else if (ch === "}") {
        if (!lineStart) newLine();
        indent = Math.max(0, indent - 1);
        write(ch);
        if (next !== ";" && next !== "," && next !== ")") newLine();
      } else if (ch === ";") {
        write(ch);
        if (parenDepth === 0) newLine();
        else write(" ");
      } else {
        write(ch);
      }
    }

    return out.trim();
  }

  function lintLocally(code) {
    const errors = [];
    const pairs = { ")": "(", "]": "[", "}": "{" };
    const stack = [];
    let stringChar = "";
    let escaped = false;
    let lineComment = false;
    let blockComment = false;

    for (let i = 0; i < code.length; i += 1) {
      const ch = code[i];
      const next = code[i + 1] || "";

      if (lineComment) {
        if (ch === "\n") lineComment = false;
        continue;
      }
      if (blockComment) {
        if (ch === "*" && next === "/") {
          blockComment = false;
          i += 1;
        }
        continue;
      }
      if (stringChar) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === stringChar) stringChar = "";
        continue;
      }
      if (ch === "/" && next === "/") {
        lineComment = true;
        i += 1;
      } else if (ch === "/" && next === "*") {
        blockComment = true;
        i += 1;
      } else if (ch === '"' || ch === "'" || ch === "`") {
        stringChar = ch;
      } else if (ch === "(" || ch === "[" || ch === "{") {
        stack.push(ch);
      } else if (pairs[ch]) {
        if (stack.pop() !== pairs[ch]) errors.push(`Delimitador inesperado: ${ch}.`);
      }
    }

    if (stringChar) errors.push("String sin cierre.");
    if (blockComment) errors.push("Comentario de bloque sin cierre.");
    if (stack.length) errors.push(`Delimitador sin cierre: ${stack[stack.length - 1]}.`);
    if (/\b(?:const|let|var)\s*(?:[=;,]|$)/m.test(code)) {
      errors.push("Declaracion de variable sin identificador.");
    }

    const warnings = [];
    if (/\bvar\s+[A-Za-z_$]/.test(code)) {
      warnings.push("WARN local prefer-const Usa let/const cuando sea posible.");
    }
    if (/(^|[^=!])==([^=]|$)/m.test(code)) {
      warnings.push("WARN local eqeqeq Prefiere === para evitar conversion implicita.");
    }

    return [
      `Resumen: ${errors.length} error(es), ${warnings.length} advertencia(s).`,
      "",
      ...errors.map((message) => `ERROR local sintaxis ${message}`),
      ...warnings,
      ...(!errors.length && !warnings.length ? ["Sin hallazgos."] : [])
    ].join("\n");
  }

  function obfuscateLocally(code) {
    const bytes = new TextEncoder().encode(code);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    const encoded = btoa(binary);

    return [
      "(() => {",
      `  const _payload = "${encoded}";`,
      "  const _bytes = Uint8Array.from(atob(_payload), (c) => c.charCodeAt(0));",
      "  return Function(new TextDecoder().decode(_bytes))();",
      "})();"
    ].join("\n");
  }

  function transpileLocally(code) {
    return code
      .replace(/\b(?:const|let)\b/g, "var")
      .replace(/\(([^()]*)\)\s*=>\s*\{([^{}]*)\}/g, "function($1) {$2}")
      .replace(/([A-Za-z_$][\w$]*)\s*=>\s*\{([^{}]*)\}/g, "function($1) {$2}")
      .replace(/\(([^()]*)\)\s*=>\s*([^;\n]+)/g, "function($1) { return $2; }")
      .replace(/([A-Za-z_$][\w$]*)\s*=>\s*([^;\n]+)/g, "function($1) { return $2; }");
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
    return beautifyLocally(code);
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
    return obfuscateLocally(code);
  }

  function doTranspile(code) {
    if (window.Babel && typeof window.Babel.transform === "function") {
      const out = window.Babel.transform(code, {
        presets: [["env", { targets: { ie: "11" } }]]
      });
      return out && out.code ? out.code : code;
    }
    return transpileLocally(code);
  }

  async function doLint(code) {
    const ESLintClass = window.ESLint && window.ESLint.ESLint ? window.ESLint.ESLint : null;
    if (!ESLintClass) return lintLocally(code);

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

  function buildSandboxHtml(code, token) {
    const safeCode = String(code).replace(/<\/script/gi, "<\\/script");
    return [
      "<!doctype html><html><head><meta charset=\"utf-8\"></head><body>",
      "<script>(function(){",
      `const token=${JSON.stringify(token)};`,
      "const send=(type,payload)=>parent.postMessage({__jsTool:true,token,type,payload},'*');",
      "const format=(value)=>{if(typeof value==='string')return value;try{return JSON.stringify(value)}catch(_){return String(value)}};",
      "['log','warn','error','info'].forEach((name)=>{console[name]=(...values)=>send(name,values.map(format).join(' '));});",
      "window.onerror=(message,source,line,column)=>{send('onerror',String(message)+' (L'+line+':C'+column+')');return true;};",
      "window.onunhandledrejection=(event)=>send('rejection',format(event.reason||event));",
      "})();</script>",
      `<script>${safeCode}</script>`,
      `<script>parent.postMessage({__jsTool:true,token:${JSON.stringify(token)},type:'done',payload:''},'*');</script>`,
      "</body></html>"
    ].join("");
  }

  async function doRunSandbox(code, captureMs) {
    const token = `jstools-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const sandboxHtml = buildSandboxHtml(code, token);

    return new Promise((resolve) => {
      const iframe = document.createElement("iframe");
      const logs = [];

      iframe.setAttribute("sandbox", "allow-scripts");
      iframe.setAttribute("aria-hidden", "true");
      iframe.style.display = "none";
      iframe.srcdoc = sandboxHtml;

      const handler = (event) => {
        const data = event.data;
        if (event.source !== iframe.contentWindow) return;
        if (!data || !data.__jsTool || data.token !== token || data.type === "done") return;
        logs.push({ type: data.type, payload: data.payload });
      };

      window.addEventListener("message", handler);
      document.body.appendChild(iframe);

      setTimeout(() => {
        window.removeEventListener("message", handler);
        iframe.remove();

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

  // Superficie cerrada de prueba: no se crea en produccion y evita exponer
  // helpers en window salvo cuando la regresion automatizada lo solicita.
  if (window.__JSTOOLS_TEST__) {
    Object.assign(window.__JSTOOLS_TEST__, {
      beautifyLocally,
      lintLocally,
      obfuscateLocally,
      transpileLocally,
      stripComments,
      collapseWhitespace,
      doMinify,
      buildSandboxHtml
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
