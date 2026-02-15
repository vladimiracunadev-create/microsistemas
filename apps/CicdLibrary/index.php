<?php
/**
 * CI/CD Lab Engine - Biblioteca Técnica Interactiva
 * Permite generar, visualizar y copiar configuraciones reales de CI/CD.
 */

$outDir = __DIR__ . '/out';
$matrixFile = $outDir . '/matrix.json';
$fullMatrixFile = $outDir . '/matrix-full.json';

// Manejo de acciones
$message = '';
if (isset($_POST['action'])) {
    if ($_POST['action'] === 'generate') {
        $output = shell_exec('powershell -ExecutionPolicy Bypass -Command "npm run matrix" 2>&1');
        $message = "Operación Finalizada:\n" . $output;
    } elseif ($_POST['action'] === 'generate_full') {
        $output = shell_exec('powershell -ExecutionPolicy Bypass -Command "npm run matrix:full" 2>&1');
        $message = "Operación Finalizada:\n" . $output;
    }
}

// Cargar datos
$matrixData = null;
if (file_exists($matrixFile)) {
    $matrixData = json_decode(file_get_contents($matrixFile), true);
}

// Cargar datos extendidos para el modal
$fullData = [];
if (file_exists($fullMatrixFile)) {
    $fullJson = json_decode(file_get_contents($fullMatrixFile), true);
    if (isset($fullJson['combinations'])) {
        foreach ($fullJson['combinations'] as $c) {
            $fullData[$c['key']] = $c;
        }
    }
}

$lastUpdate = file_exists($matrixFile) ? date("d/m/Y H:i", filemtime($matrixFile)) : 'Nunca';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CI/CD Lab Engine | Microsistemas</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono&display=swap"
        rel="stylesheet">
    <style>
        :root {
            --bg-color: #0b0f1a;
            --card-bg: #161e2e;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent: #3b82f6;
            --accent-success: #10b981;
            --border: rgba(255, 255, 255, 0.08);
            --code-bg: #011627;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-primary);
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border);
        }

        h1 {
            margin: 0;
            font-size: 1.8rem;
            background: linear-gradient(90deg, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .status-bar {
            background-color: var(--card-bg);
            padding: 15px 25px;
            border-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            border: 1px solid var(--border);
        }

        .btn {
            background-color: var(--accent);
            color: white;
            border: none;
            padding: 10px 18px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.85rem;
            transition: all 0.2s;
            text-decoration: none;
        }

        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-outline {
            background: transparent;
            border: 1px solid var(--accent);
            color: var(--accent);
        }

        .btn-success {
            background-color: var(--accent-success);
        }

        .search-container {
            margin-bottom: 20px;
            position: relative;
        }

        #searchInput {
            width: 100%;
            padding: 12px 20px;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 10px;
            color: white;
            font-size: 1rem;
            outline: none;
        }

        #searchInput:focus {
            border-color: var(--accent);
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 20px;
        }

        .case-card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px;
            transition: border-color 0.2s;
            cursor: pointer;
        }

        .case-card:hover {
            border-color: var(--accent);
        }

        .tag {
            font-size: 0.7rem;
            text-transform: uppercase;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.05);
            margin-right: 5px;
        }

        .tag-blue {
            color: #60a5fa;
            background: rgba(96, 165, 250, 0.1);
        }

        .tag-green {
            color: #34d399;
            background: rgba(52, 211, 153, 0.1);
        }

        /* Modal Styles */
        #modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            z-index: 1000;
            backdrop-filter: blur(5px);
            padding: 40px;
            box-sizing: border-box;
        }

        .modal-content {
            background: var(--bg-color);
            max-width: 1100px;
            margin: 0 auto;
            height: 100%;
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            border: 1px solid var(--border);
            overflow: hidden;
        }

        .modal-header {
            padding: 20px 30px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-body {
            padding: 30px;
            overflow-y: auto;
            flex-grow: 1;
        }

        pre {
            background: var(--code-bg);
            padding: 20px;
            border-radius: 10px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9rem;
            overflow-x: auto;
            color: #d1d1d1;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .spec-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }

        .spec-item h4 {
            margin: 0 0 10px 0;
            font-size: 0.9rem;
            color: var(--text-secondary);
            text-transform: uppercase;
        }

        .spec-item ul {
            margin: 0;
            padding-left: 20px;
            font-size: 0.95rem;
        }

        .terminal-mini {
            background: black;
            padding: 10px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 0.8rem;
            color: #0f0;
            margin-bottom: 20px;
        }
    </style>
</head>

<body>
    <div class="container">
        <header>
            <div>
                <h1>CI/CD Library</h1>
                <p style="color: var(--text-secondary); margin: 5px 0 0 0;">Catálogo interactivo de arquitecturas de
                    despliegue</p>
            </div>
            <a href="../../index.php" class="btn btn-outline">← Volver al Dashboard</a>
        </header>

        <div class="status-bar">
            <div>
                <span class="tag">Actualizado: <?php echo $lastUpdate; ?></span>
                <?php if ($matrixData): ?>
                    <span class="tag tag-blue"><?php echo $matrixData['meta']['counts']['total']; ?> Combinaciones</span>
                <?php endif; ?>
            </div>
            <form method="POST" style="display: flex; gap: 10px;">
                <button type="submit" name="action" value="generate" class="btn">Actualizar Índices</button>
                <button type="submit" name="action" value="generate_full" class="btn btn-success">Generar Biblioteca
                    Full</button>
            </form>
        </div>

        <?php if ($message): ?>
            <div class="terminal-mini"><?php echo nl2br(htmlspecialchars($message)); ?></div>
        <?php endif; ?>

        <div class="search-container">
            <input type="text" id="searchInput"
                placeholder="Filtrar por stack, orquestador o estrategia (ej: github node ssh)...">
        </div>

        <?php if ($matrixData): ?>
            <div class="grid" id="casesGrid">
                <?php foreach ($matrixData['combinations'] as $item): ?>
                    <div class="case-card" onclick="openModal('<?php echo $item['key']; ?>')"
                        data-search="<?php echo strtolower($item['key']); ?>">
                        <div style="margin-bottom: 12px;">
                            <span class="tag tag-blue"><?php echo $item['combo']['orchestrator']; ?></span>
                            <span class="tag tag-green"><?php echo $item['combo']['stack']; ?></span>
                        </div>
                        <h3 style="margin: 0; font-size: 1.1rem;"><?php echo $item['key']; ?></h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 10px 0 0 0;">
                            Envío vía <strong><?php echo $item['combo']['cdStrategy']; ?></strong> con runner
                            <strong><?php echo $item['combo']['runner']; ?></strong>.
                        </p>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php else: ?>
            <div style="text-align: center; padding: 60px;">
                <h2>Biblioteca vacía</h2>
                <p>Haz clic en "Generar Biblioteca Full" para crear todo el contenido técnico.</p>
            </div>
        <?php endif; ?>
    </div>

    <!-- Modal para Detalles -->
    <div id="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTitle" style="margin: 0;">Detalles del Caso</h2>
                <button onclick="closeModal()" class="btn btn-outline" style="padding: 5px 12px;">Cerrar ESC</button>
            </div>
            <div class="modal-body">
                <div class="spec-list">
                    <div class="spec-item">
                        <h4>Requisitos de Infraestructura</h4>
                        <ul id="reqList"></ul>
                    </div>
                    <div class="spec-item">
                        <h4>Secretos Necesarios</h4>
                        <ul id="secretList"></ul>
                    </div>
                </div>
                <h4>Código Generado (<span id="outPath">--</span>)</h4>
                <pre id="codePreview"></pre>

                <h4 style="margin-top: 30px;">Guía de Operación (Fuera de YAML)</h4>
                <ul id="nonYamlList"></ul>
            </div>
        </div>
    </div>

    <script>
        const fullData = <?php echo json_encode($fullData); ?>;
        const matrixData = <?php echo json_encode($matrixData ? $matrixData['combinations'] : []); ?>;

        // Buscador
        document.getElementById('searchInput').addEventListener('input', function (e) {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.case-card').forEach(card => {
                const search = card.getAttribute('data-search');
                card.style.display = search.includes(term) ? 'block' : 'none';
            });
        });

        function openModal(key) {
            const data = fullData[key];
            const meta = matrixData.find(m => m.key === key);

            if (!data) {
                alert("Datos extendidos no disponibles. Genera la 'Biblioteca Full' primero.");
                return;
            }

            document.getElementById('modalTitle').innerText = key;

            // Requisitos
            const reqs = meta.requirements || [];
            document.getElementById('reqList').innerHTML = reqs.map(r => `<li><code>${r}</code></li>`).join('') || "Ninguno";

            // Secretos
            const secrets = meta.requiredSecrets || [];
            document.getElementById('secretList').innerHTML = secrets.map(s => `<li><span style="color:#f43f5e">🔑 ${s}</span></li>`).join('') || "Ninguno";

            // Código
            const rendered = data.rendered.find(r => r.path !== 'BLUEPRINT.md');
            document.getElementById('outPath').innerText = rendered ? rendered.path : "N/A";
            document.getElementById('codePreview').innerText = rendered ? rendered.content : "No generado";

            // Non Yaml
            const nonYaml = meta.nonYamlSettings || [];
            document.getElementById('nonYamlList').innerHTML = nonYaml.map(n => `<li>${n}</li>`).join('') || "Ninguno";

            document.getElementById('modal').style.display = 'block';
        }

        function closeModal() {
            document.getElementById('modal').style.display = 'none';
        }

        window.onclick = function (event) {
            if (event.target == document.getElementById('modal')) closeModal();
        }

        document.addEventListener('keydown', e => { if (e.key === "Escape") closeModal(); });
    </script>
</body>

</html>