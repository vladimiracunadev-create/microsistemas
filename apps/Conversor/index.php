<?php require_once __DIR__ . '/../../vendor/autoload.php'; ?>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Codificador de Texto</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f0f2f5;
      margin: 0;
      padding: 20px;
    }

    .container {
      max-width: 800px;
      margin: auto;
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 20px;
    }

    textarea {
      width: 100%;
      height: 150px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      resize: vertical;
      font-size: 14px;
    }

    .buttons {
      margin-top: 10px;
      display: flex;
      gap: 10px;
    }

    .buttons button {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      color: #fff;
    }

    #encodeBtn {
      background: #4CAF50;
    }

    #clearBtn {
      background: #f44336;
    }

    .output {
      margin-top: 20px;
    }

    .output-section {
      margin-bottom: 20px;
    }

    .output-section h2 {
      margin-bottom: 5px;
      color: #555;
    }

    .output-section pre {
      background: #efefef;
      padding: 10px;
      border-radius: 4px;
      white-space: pre-wrap;
      word-wrap: break-word;
      max-height: 180px;
      overflow: auto;
      font-size: 14px;
    }

    .copy-btn {
      margin-top: 5px;
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: #2196F3;
      color: #fff;
      font-size: 14px;
    }
  </style>
</head>

<body>
  <div class="container">
    <h1>Codificador de Texto</h1>
    <textarea id="inputText" placeholder="Escribe tu texto aquí…"></textarea>
    <div class="buttons">
      <button id="encodeBtn">Transformar</button>
      <button id="clearBtn">Limpiar</button>
    </div>
    <div class="output">
      <div class="output-section">
        <h2>HTML Num&eacute;rico</h2>
        <pre id="htmlNumericOutput"></pre>
        <button class="copy-btn" data-target="htmlNumericOutput">
          Copiar HTML num&eacute;rico
        </button>
      </div>
      <div class="output-section">
        <h2>HTML Nominativo</h2>
        <pre id="htmlNamedOutput"></pre>
        <button class="copy-btn" data-target="htmlNamedOutput">
          Copiar HTML nominativo
        </button>
      </div>
      <div class="output-section">
        <h2>Unicode JavaScript</h2>
        <pre id="jsOutput"></pre>
        <button class="copy-btn" data-target="jsOutput">
          Copiar Unicode
        </button>
      </div>
    </div>
  </div>

  <script>
    // 1) HTML numérico: todo char >127 a &#NNN;
    function htmlNumericEncode(str) {
      const basicMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return Array.from(str).map(ch => {
        if (basicMap[ch]) return basicMap[ch];
        const code = ch.charCodeAt(0);
        return code > 127 ? '&#' + code + ';' : ch;
      }).join('');
    }

    // 2) HTML nominativo: entidades con nombre + fallback numérico
    function htmlNamedEncode(str) {
      const namedMap = {
        '&': '&amp;', '<': '&lt;', '>': '&gt;',
        '"': '&quot;', "'": '&#039;',
        '\u00A0': '&nbsp;',
        '\u00C1': '&Aacute;', '\u00E1': '&aacute;',
        '\u00C9': '&Eacute;', '\u00E9': '&eacute;',
        '\u00CD': '&Iacute;', '\u00ED': '&iacute;',
        '\u00D3': '&Oacute;', '\u00F3': '&oacute;',
        '\u00DA': '&Uacute;', '\u00FA': '&uacute;',
        '\u00D1': '&Ntilde;', '\u00F1': '&ntilde;',
        '\u00A1': '&iexcl;', '\u00BF': '&iquest;'
      };
      return Array.from(str).map(ch => {
        if (namedMap[ch]) return namedMap[ch];
        const code = ch.charCodeAt(0);
        return code > 127 ? '&#' + code + ';' : ch;
      }).join('');
    }

    // 3) Unicode JS: chars >127 a \uXXXX
    function jsUnicodeEncode(str) {
      return Array.from(str).map(ch => {
        const code = ch.charCodeAt(0);
        return code > 127
          ? '\\u' + code.toString(16).padStart(4, '0')
          : ch;
      }).join('');
    }

    // Al hacer clic en "Transformar"
    document.getElementById('encodeBtn').addEventListener('click', () => {
      const txt = document.getElementById('inputText').value;
      document.getElementById('htmlNumericOutput').textContent = htmlNumericEncode(txt);
      document.getElementById('htmlNamedOutput').textContent = htmlNamedEncode(txt);
      document.getElementById('jsOutput').textContent = jsUnicodeEncode(txt);
    });

    // Al hacer clic en "Limpiar"
    document.getElementById('clearBtn').addEventListener('click', () => {
      document.getElementById('inputText').value = '';
      ['htmlNumericOutput', 'htmlNamedOutput', 'jsOutput'].forEach(id =>
        document.getElementById(id).textContent = ''
      );
    });

    // Botones de copiar al portapapeles
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const tgt = e.currentTarget.getAttribute('data-target');
        const text = document.getElementById(tgt).textContent;
        if (!text) return alert('Nada para copiar.');
        navigator.clipboard.writeText(text)
          .then(() => alert('Copiado al portapapeles!'))
          .catch(err => alert('Error copiando: ' + err));
      });
    });
  </script>
</body>

</html>