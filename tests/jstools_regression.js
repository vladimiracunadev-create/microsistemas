"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const scriptPath = path.join(root, "apps", "JsTools", "hj.js");
const htmlPath = path.join(root, "apps", "JsTools", "herramientas_javascript.html");

const source = fs.readFileSync(scriptPath, "utf8");
const html = fs.readFileSync(htmlPath, "utf8");
const api = {};

const context = {
  window: { __JSTOOLS_TEST__: api },
  document: {
    readyState: "loading",
    addEventListener() {}
  },
  TextEncoder,
  TextDecoder,
  Uint8Array,
  btoa,
  atob,
  console,
  setTimeout,
  clearTimeout
};

vm.runInNewContext(source, context, { filename: scriptPath });

assert.match(html, /<link rel="stylesheet" href="hj\.css"/);
assert.match(html, /<script src="hj\.js\?v=20261027-issue1" defer><\/script>/);
assert.equal((html.match(/<script[^>]+src=/g) || []).length, 1);
assert.equal((html.match(/<script[^>]+defer/g) || []).length, 1);
assert.doesNotMatch(html, /<script[^>]+src="https?:\/\//);

const compact = api.collapseWhitespace("const  answer =\n 42;");
assert.equal(compact, "const answer = 42;");

const pretty = api.beautifyLocally("function demo(){const value=1;return value;}");
assert.match(pretty, /function demo\(\) \{\n  const value=1;/);
assert.match(pretty, /return value;/);

assert.match(api.lintLocally("const ok = true;"), /0 error\(es\)/);
assert.match(api.lintLocally("const = ;"), /1 error\(es\)/);

const obfuscated = api.obfuscateLocally("globalThis.__jstoolsValue = 7;");
assert.notEqual(obfuscated, "globalThis.__jstoolsValue = 7;");
const obfuscationContext = { TextDecoder, Uint8Array, atob };
vm.runInNewContext(obfuscated, obfuscationContext);
assert.equal(obfuscationContext.__jstoolsValue, 7);

const transpiled = api.transpileLocally("const sum = (a, b) => a + b;");
assert.match(transpiled, /var sum = function\(a, b\)/);
assert.doesNotMatch(transpiled, /=>|\bconst\b/);

const sandboxHtml = api.buildSandboxHtml(
  "console.log('ok'); </script><script>console.warn('seguro')</script>",
  "token-prueba"
);
assert.equal((sandboxHtml.match(/<\/script>/g) || []).length, 3);
assert.match(sandboxHtml, /<\\\/script>/);

assert.equal(api.stripComments("const a = 1; // quitar\n/* quitar */ const b = 2;"), "const a = 1; \n const b = 2;");

api.doMinify("// comentario\nconst answer = 42;").then((result) => {
  assert.equal(result, "const answer = 42;");
  console.log("OK: regresion JsTools (estructura y respaldos locales)");
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
