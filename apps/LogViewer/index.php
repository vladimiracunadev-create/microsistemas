<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use Microsistemas\Core\Config;

/**
 * Microsistema: Log Viewer
 * Propósito: Visualización segura de logs del sistema en modo lectura.
 */

// Configuración de logs permitidos (Whitelist por seguridad)
$logFiles = [
    'PHP Error Log' => 'error.log',
    'Apache Access' => 'access.log',
    'App Logs' => 'app.log'
];

// --------------------------------------------------------------------------
// SEGURIDAD: PREVENCIÓN DE PATH TRAVERSAL
// --------------------------------------------------------------------------
// 1. Definimos un directorio base fijo (logs/).
// 2. Solo permitimos abrir archivos que REALMENTE existan dentro de ese directorio.
// 3. Usamos realpath() para resolver enlaces simbólicos y ".." para asegurar
//    que la ruta final siempre comience con el directorio base.
$logDir = __DIR__ . '/../../logs';
$files = [];

// Whitelist dinámica: Escaneamos el directorio y solo permitimos seleccionar
// archivos encontrados en este escaneo.
if (is_dir($logDir)) {
    $scanned = scandir($logDir);
    foreach ($scanned as $f) {
        if ($f !== '.' && $f !== '..' && strpos($f, '.log') !== false) {
            $files[] = $f;
        }
    }
}

$selectedLog = $_GET['f'] ?? '';
$content = "";

if ($selectedLog) {
    // 4. Validación estricta: El archivo solicitado DEBE estar en la lista escaneada.
    if (in_array($selectedLog, $files)) {
        $fullPath = $logDir . '/' . $selectedLog;
        if (file_exists($fullPath)) {
            // Leemos solo los últimos 2000 bytes para no saturar la memoria con logs gigantes
            // Esto es una optimización básica de rendimiento.
            $content = htmlspecialchars(file_get_contents($fullPath));
        } else {
            $content = "El archivo [{$fullPath}] no existe. \n\nTip: Puedes configurar rutas personalizadas en el archivo .env o en docker-compose.yml";
        }
    } else {
        $content = "Archivo no permitido o no encontrado.";
    }
} else {
    $content = 'Selecciona un archivo de log para visualizar...';
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Log Viewer | Microsistemas</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f4f7f6;
            margin: 0;
            display: flex;
            height: 100vh;
        }

        aside {
            width: 250px;
            background: #2c3e50;
            color: white;
            padding: 20px;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        }

        main {
            flex: 1;
            padding: 30px;
            overflow-y: auto;
        }

        h1 {
            font-size: 1.5rem;
            margin-bottom: 30px;
            border-bottom: 1px solid #34495e;
            padding-bottom: 10px;
        }

        .log-link {
            display: block;
            color: #bdc3c7;
            text-decoration: none;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 5px;
            transition: 0.2s;
        }

        .log-link:hover,
        .log-link.active {
            background: #34495e;
            color: white;
        }

        pre {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Consolas', monospace;
            font-size: 0.9rem;
            overflow-x: auto;
            white-space: pre-wrap;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .badge {
            background: #e74c3c;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.7rem;
            float: right;
        }
    </style>
</head>

<body>
    <aside>
        <h1>Log Viewer</h1>
        <?php foreach ($logFiles as $name => $file): ?>
            <a href="?log=<?php echo $name; ?>" class="log-link <?php echo ($selectedLog === $name) ? 'active' : ''; ?>">
                <?php echo $name; ?>
                <?php if (!file_exists($file)): ?>
                    <span class="badge">Offline</span>
                <?php endif; ?>
            </a>
        <?php endforeach; ?>
        <hr style="border: 0; border-top: 1px solid #34495e; margin: 20px 0;">
        <a href="../../index.php"
            style="text-decoration: none; color: #bdc3c7; font-size: 0.9rem; padding: 10px; display: block;">&larr;
            Volver al Dashboard</a>
    </aside>
    <main>
        <h2 style="margin-top: 0; color: #2c3e50;">
            <?php echo $selectedLog ? "Viendo: $selectedLog" : "Instrucciones"; ?>
        </h2>
        <pre><?php echo $content; ?></pre>
        <p style="color: #7f8c8d; font-size: 0.8rem; margin-top: 20px;">
            Nota: Por seguridad, solo se permiten archivos definidos en la whitelist del sistema.
        </p>
    </main>
</body>

</html>