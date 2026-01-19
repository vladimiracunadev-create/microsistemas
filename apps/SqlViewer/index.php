<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use Microsistemas\Core\Database;
use Microsistemas\Core\Config;

// 1) OBTENER CONFIGURACIÓN INICIAL
$config = Config::getInstance();
$drivers = [
    'mysql' => 'MySQL / MariaDB',
    'pgsql' => 'PostgreSQL',
    'sqlite' => 'SQLite'
];

$driver = $_REQUEST['driver'] ?? $config->get('DB_DRIVER', 'mysql');
$host = $_REQUEST['host'] ?? $config->get('DB_HOST', 'localhost');
$user = $_REQUEST['user'] ?? $config->get('DB_USER', 'root');
$pass = $_REQUEST['pass'] ?? $config->get('DB_PASS', '');
$db_selected = $_REQUEST['db'] ?? $config->get('DB_NAME', '');

$conn = null;
$error = null;

try {
    $conn = Database::getPDO($driver, $host, $user, $pass, $db_selected);
} catch (\Exception $e) {
    $error = $e->getMessage();
    if (strpos($error, 'could not find driver') !== false) {
        $error = "🚨 El motor <strong>" . strtoupper($driver) . "</strong> no está habilitado en tu servidor PHP. <br><br> 
                  Para arreglarlo: <br>
                  1. Abre tu archivo <code>php.ini</code> (en XAMPP suele estar en C:\\xampp\\php\\php.ini). <br>
                  2. Busca la línea <code>;extension=pdo_$driver</code> y quítale el punto y coma inicial. <br>
                  3. Reinicia Apache desde el Panel de Control de XAMPP.";
    }
}

// 2) OBTENER LISTA DE BASES DE DATOS (Solo para MySQL/Postgres)
$databases = [];
if ($conn && $driver !== 'sqlite') {
    try {
        if ($driver === 'mysql') {
            $stmt = $conn->query("SHOW DATABASES");
            $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);
        } elseif ($driver === 'pgsql') {
            $stmt = $conn->query("SELECT datname FROM pg_database WHERE datistemplate = false");
            $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);
        }
    } catch (\Exception $e) {
        // Silencioso o log error
    }
}

// 3) OBTENER TABLAS Y VISTAS
$tables = [];
$views = [];

if ($conn) {
    try {
        if ($driver === 'mysql' || $driver === 'mariadb') {
            $stmt = $conn->query("SHOW FULL TABLES");
            while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
                if ($row[1] === 'VIEW') {
                    $views[] = $row[0];
                } else {
                    $tables[] = $row[0];
                }
            }
        } elseif ($driver === 'pgsql') {
            $stmt = $conn->query("SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public'");
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                if ($row['table_type'] === 'VIEW') {
                    $views[] = $row['table_name'];
                } else {
                    $tables[] = $row['table_name'];
                }
            }
        } elseif ($driver === 'sqlite') {
            $stmt = $conn->query("SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'");
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                if ($row['type'] === 'view') {
                    $views[] = $row['name'];
                } else {
                    $tables[] = $row['name'];
                }
            }
        }
    } catch (\Exception $e) {
        $error = "Error al listar tablas: " . $e->getMessage();
    }
}

// 4) EJECUCIÓN DE CONSULTA
$queryResultHtml = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['query']) && $conn) {
    $query = trim($_POST['query']);
    if ($query !== '') {
        try {
            $stmt = $conn->query($query);
            if ($stmt->columnCount() > 0) {
                // Es un SELECT u otra consulta con resultados
                ob_start();
                echo "<table><thead><tr>";
                for ($i = 0; $i < $stmt->columnCount(); $i++) {
                    $col = $stmt->getColumnMeta($i);
                    echo "<th>" . htmlspecialchars($col['name']) . "</th>";
                }
                echo "</tr></thead><tbody>";
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    echo "<tr>";
                    foreach ($row as $value) {
                        echo "<td>" . htmlspecialchars((string) $value) . "</td>";
                    }
                    echo "</tr>";
                }
                echo "</tbody></table>";
                $queryResultHtml = ob_get_clean();
            } else {
                $affected = $stmt->rowCount();
                $queryResultHtml = "<div class='success'>Consulta ejecutada con éxito. Filas afectadas: $affected.</div>";
            }
        } catch (\PDOException $e) {
            $queryResultHtml = "<div class='error'>Error en la consulta: " . htmlspecialchars($e->getMessage()) . "</div>";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SqlViewer Multi-Motor</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        :root {
            --primary: #007bff;
            --sidebar-bg: #f8f9fa;
            --border: #dee2e6;
        }

        body {
            display: flex;
            font-family: 'Segoe UI', sans-serif;
            height: 100vh;
            margin: 0;
            color: #333;
        }

        #sidebar {
            width: 280px;
            border-right: 1px solid var(--border);
            padding: 15px;
            height: 100%;
            overflow-y: auto;
            background: var(--sidebar-bg);
        }

        #content {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 20px;
            overflow-y: auto;
        }

        .config-group {
            margin-bottom: 15px;
        }

        .config-group label {
            display: block;
            font-weight: bold;
            font-size: 0.85rem;
            margin-bottom: 4px;
        }

        input,
        select,
        textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid var(--border);
            border-radius: 4px;
            box-sizing: border-box;
        }

        textarea {
            height: 120px;
            font-family: monospace;
        }

        button {
            background: var(--primary);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }

        button:hover {
            background: #0056b3;
        }

        .item {
            padding: 6px;
            cursor: pointer;
            border-radius: 4px;
            border-bottom: 1px solid #eee;
            font-size: 0.9rem;
        }

        .item:hover {
            background: #e9ecef;
        }

        .item i {
            margin-right: 8px;
            color: #666;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 0.9rem;
        }

        th,
        td {
            border: 1px solid var(--border);
            padding: 10px;
            text-align: left;
        }

        th {
            background: #f1f3f5;
        }

        tr:nth-child(even) {
            background: #f8f9fa;
        }

        .error {
            color: #721c24;
            background: #f8d7da;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 10px;
            border: 1px solid #f5c6cb;
        }

        .success {
            color: #155724;
            background: #d4edda;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 10px;
            border: 1px solid #c3e6cb;
        }

        .badge {
            font-size: 0.75rem;
            padding: 2px 6px;
            border-radius: 10px;
            background: #e9ecef;
            float: right;
        }
    </style>
</head>

<body>
    <div id="sidebar">
        <div style="margin-bottom: 20px;">
            <a href="../../index.php" style="text-decoration: none; color: #666; font-weight: bold; font-size: 0.9rem;">
                <i class="fas fa-arrow-left"></i> Volver al Dashboard
            </a>
        </div>
        <h3><i class="fas fa-database"></i> SqlViewer</h3>

        <?php if ($error): ?>
            <div class="error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <form method="GET">
            <div class="config-group">
                <label>Motor</label>
                <select name="driver" onchange="this.form.submit()">
                    <?php foreach ($drivers as $val => $lbl): ?>
                        <option value="<?php echo $val; ?>" <?php echo ($driver === $val) ? 'selected' : ''; ?>>
                            <?php echo $lbl; ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <?php if ($driver !== 'sqlite'): ?>
                <div class="config-group">
                    <label>Host</label>
                    <input type="text" name="host" value="<?php echo htmlspecialchars($host); ?>">
                </div>
                <div class="config-group">
                    <label>Usuario</label>
                    <input type="text" name="user" value="<?php echo htmlspecialchars($user); ?>">
                </div>
                <div class="config-group">
                    <label>Password</label>
                    <input type="password" name="pass" value="<?php echo htmlspecialchars($pass); ?>">
                </div>
                <div class="config-group">
                    <label>Base de Datos</label>
                    <?php if (!empty($databases)): ?>
                        <select name="db" onchange="this.form.submit()">
                            <option value="">-- Seleccionar --</option>
                            <?php foreach ($databases as $dbName): ?>
                                <option value="<?php echo htmlspecialchars($dbName); ?>" <?php echo ($dbName === $db_selected) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($dbName); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    <?php else: ?>
                        <input type="text" name="db" value="<?php echo htmlspecialchars($db_selected); ?>">
                    <?php endif; ?>
                </div>
            <?php else: ?>
                <div class="config-group">
                    <label>Ruta Archivo SQLite</label>
                    <input type="text" name="host" value="<?php echo htmlspecialchars($host); ?>" placeholder="db.sqlite">
                    <small>Usa ruta absoluta o relativa al core.</small>
                </div>
            <?php endif; ?>

            <button type="submit" style="width: 100%">Conectar / Refrescar</button>
        </form>

        <hr>

        <h4>Tablas <span class="badge"><?php echo count($tables); ?></span></h4>
        <?php foreach ($tables as $t): ?>
            <div class="item" onclick="setQuery('<?php echo $t; ?>')"><i class="fas fa-table"></i>
                <?php echo htmlspecialchars($t); ?></div>
        <?php endforeach; ?>

        <h4>Vistas <span class="badge"><?php echo count($views); ?></span></h4>
        <?php foreach ($views as $v): ?>
            <div class="item" onclick="setQuery('<?php echo $v; ?>')"><i class="fas fa-eye"></i>
                <?php echo htmlspecialchars($v); ?></div>
        <?php endforeach; ?>
    </div>

    <div id="content">
        <form method="POST">
            <input type="hidden" name="driver" value="<?php echo htmlspecialchars($driver); ?>">
            <input type="hidden" name="host" value="<?php echo htmlspecialchars($host); ?>">
            <input type="hidden" name="user" value="<?php echo htmlspecialchars($user); ?>">
            <input type="hidden" name="pass" value="<?php echo htmlspecialchars($pass); ?>">
            <input type="hidden" name="db" value="<?php echo htmlspecialchars($db_selected); ?>">

            <h3>Ejecutar SQL (<?php echo strtoupper($driver); ?>)</h3>
            <textarea name="query"
                placeholder="SELECT * FROM ..."><?php echo isset($_POST['query']) ? htmlspecialchars($_POST['query']) : ''; ?></textarea>
            <br><br>
            <button type="submit"><i class="fas fa-play"></i> Ejecutar Consulta</button>
        </form>

        <div id="results">
            <?php echo $queryResultHtml; ?>
        </div>
    </div>

    <script>
        function setQuery(table) {
            const driver = "<?php echo $driver; ?>";
            let q = "";
            if (driver === 'pgsql') {
                q = 'SELECT * FROM "public"."' + table + '" LIMIT 100;';
            } else if (driver === 'sqlite' || driver === 'mysql') {
                q = 'SELECT * FROM `' + table + '` LIMIT 100;';
            }
            document.querySelector('textarea').value = q;
        }
    </script>
</body>

</html>
<?php
Database::close();
?>