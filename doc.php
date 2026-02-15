<?php
/**
 * Micorsistemas Doc Viewer
 * Simple Markdown renderer using Marked.js via CDN for a premium experience.
 */

$file = $_GET['file'] ?? 'README.md';
$docPath = __DIR__ . '/docs/' . basename($file);

// Si no está en docs, buscar en raíz (como README.md)
if (!file_exists($docPath)) {
    $docPath = __DIR__ . '/' . basename($file);
}

if (!file_exists($docPath)) {
    die("Error: Documento no encontrado ($file).");
}

$content = file_get_contents($docPath);
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>
        <?php echo htmlspecialchars($file); ?> | Documentación Microsistemas
    </title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono&display=swap"
        rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <style>
        :root {
            --bg: #0f172a;
            --container-bg: #1e293b;
            --text: #f8fafc;
            --text-muted: #94a3b8;
            --accent: #3b82f6;
            --border: rgba(255, 255, 255, 0.08);
            --code-bg: #011627;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg);
            color: var(--text);
            line-height: 1.6;
            margin: 0;
            padding: 40px 20px;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            background: var(--container-bg);
            padding: 40px;
            border-radius: 16px;
            border: 1px solid var(--border);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        header {
            margin-bottom: 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border);
            padding-bottom: 20px;
        }

        .back-link {
            text-decoration: none;
            color: var(--accent);
            font-weight: 600;
            font-size: 0.9rem;
        }

        /* Markdown Styling */
        #content h1 {
            color: #fff;
            font-size: 2.2rem;
            margin-top: 0;
        }

        #content h2 {
            border-bottom: 1px solid var(--border);
            padding-bottom: 10px;
            margin-top: 40px;
            color: #60a5fa;
        }

        #content h3 {
            color: #a78bfa;
            margin-top: 30px;
        }

        #content a {
            color: var(--accent);
            text-decoration: none;
        }

        #content a:hover {
            text-decoration: underline;
        }

        #content code {
            background: rgba(255, 255, 255, 0.05);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9em;
            color: #d1d1d1;
        }

        #content pre {
            background: var(--code-bg);
            padding: 20px;
            border-radius: 10px;
            overflow-x: auto;
            border: 1px solid var(--border);
        }

        #content pre code {
            background: transparent;
            padding: 0;
            color: #fff;
        }

        #content blockquote {
            border-left: 4px solid var(--accent);
            margin: 20px 0;
            padding: 10px 20px;
            background: rgba(59, 130, 246, 0.05);
            color: var(--text-muted);
            font-style: italic;
        }

        #content img {
            max-width: 100%;
            border-radius: 8px;
        }

        #content table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        #content th,
        #content td {
            padding: 12px;
            border-bottom: 1px solid var(--border);
            text-align: left;
        }

        #content th {
            color: var(--accent);
        }
    </style>
</head>

<body>
    <div class="container">
        <header>
            <a href="index.php" class="back-link">← Volver al Dashboard</a>
            <span style="color: var(--text-muted); font-size: 0.8rem;">
                <?php echo htmlspecialchars($file); ?>
            </span>
        </header>

        <div id="content"></div>
    </div>

    <script>
        const markdown = <?php echo json_encode($content); ?>;
        document.getElementById('content').innerHTML = marked.parse(markdown);
    </script>
</body>

</html>