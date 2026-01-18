<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use Microsistemas\Core\Database;
use Microsistemas\Core\Config;

try {
    $conn = Database::getConnection();
} catch (\Exception $e) {
    die('<div style="color:white;background:red;padding:20px;border-radius:8px;font-family:sans-serif;">
            <h2>🚨 Error Crítico de Conexión</h2>
            <p>' . $e->getMessage() . '</p>
            <p>Verifica tu archivo <code>.env</code> o configuración de sistema.</p>
         </div>');
}

$host = Config::getInstance()->get('DB_HOST', 'localhost');
$user = Config::getInstance()->get('DB_USER', 'root');


// Forzamos charset (opcional pero recomendable)
mysqli_set_charset($conn, 'utf8');

// 1) OBTENER LISTA DE BASES DE DATOS
$databases = [];
$resDB = mysqli_query($conn, "SHOW DATABASES");
while ($row = mysqli_fetch_row($resDB)) {
$databases[] = $row[0];
}

// 2) DETERMINAR BD SELECCIONADA (GET o POST)
$database = '';
if (isset($_REQUEST['db']) && in_array($_REQUEST['db'], $databases, true)) {
$database = $_REQUEST['db'];
} elseif (!empty($databases)) {
// Si no viene nada, uso la primera BD como defecto
$database = $databases[0];
}

// 3) SELECCIONAR BD Y OBTENER TABLAS / VISTAS
$tables = [];
$views = [];

if ($database !== '') {
if (!mysqli_select_db($conn, $database)) {
die('No se pudo seleccionar la base de datos: ' . mysqli_error($conn));
}

// Tablas
$resTables = mysqli_query($conn, "SHOW TABLES");
while ($row = mysqli_fetch_row($resTables)) {
$tables[] = $row[0];
}

// Vistas
$resViews = mysqli_query($conn, "SHOW FULL TABLES WHERE Table_type = 'VIEW'");
while ($row = mysqli_fetch_row($resViews)) {
$views[] = $row[0];
}
}

// 4) EJECUCIÓN DE CONSULTA (POST)
$queryResultHtml = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['query'])) {
$query = trim($_POST['query']);

if ($query !== '') {
$result = mysqli_query($conn, $query);

if ($result instanceof mysqli_result) {
// SELECT u otra consulta que devuelve filas
ob_start();
echo "<table>
    <thead>
        <tr>";
            $fields = mysqli_num_fields($result);
            for ($i = 0; $i < $fields; $i++) { $fieldInfo=mysqli_fetch_field_direct($result, $i); echo "<th>" .
                htmlspecialchars($fieldInfo->name) . "</th>";
                }
                echo "</tr>
    </thead>
    <tbody>";

        while ($row = mysqli_fetch_assoc($result)) {
        echo "<tr>";
            foreach ($row as $value) {
            echo "<td>" . htmlspecialchars((string)$value) . "</td>";
            }
            echo "</tr>";
        }
        echo "</tbody>
</table>";
$queryResultHtml = ob_get_clean();
} elseif ($result === true) {
// INSERT, UPDATE, DELETE, etc.
$affected = mysqli_affected_rows($conn);
$queryResultHtml = "Consulta ejecutada con éxito. Filas afectadas: " . $affected . ".";
} else {
$queryResultHtml = "Error en la consulta: " . htmlspecialchars(mysqli_error($conn));
}
} else {
$queryResultHtml = "No se ha enviado ninguna consulta.";
}
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>
        Mini PhpMyAdmin - BD: <?php echo htmlspecialchars($database); ?>
        - Tablas (<?php echo count($tables); ?>)
        - Vistas (<?php echo count($views); ?>)
    </title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        body {
            display: flex;
            font-family: Arial, sans-serif;
            height: 100vh;
            margin: 0;
        }

        #sidebar {
            width: 20%;
            border-right: 1px solid #ccc;
            padding: 10px;
            height: 100%;
            overflow-y: auto;
            background-color: #f8f9fa;
            box-sizing: border-box;
        }

        #tables-section,
        #views-section {
            margin-bottom: 20px;
        }

        #content {
            width: 80%;
            display: flex;
            flex-direction: column;
            padding: 10px;
            background-color: #ffffff;
            box-sizing: border-box;
        }

        #db-info {
            background-color: #e9ecef;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 5px;
        }

        #query-execution {
            background-color: #e9ecef;
            padding: 10px;
            border-radius: 5px;
        }

        .table-item,
        .view-item {
            cursor: pointer;
            padding: 5px;
            margin-bottom: 5px;
            border-radius: 3px;
        }

        .table-item:hover,
        .view-item:hover {
            background-color: #f0f0f0;
        }

        textarea {
            width: 100%;
            height: 150px;
            margin-bottom: 10px;
            border-radius: 5px;
            border: 1px solid #ccc;
            padding: 5px;
            box-sizing: border-box;
        }

        button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 5px;
            cursor: pointer;
        }

        button:hover {
            background-color: #0056b3;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        table,
        th,
        td {
            border: 1px solid #000;
        }

        th,
        td {
            padding: 8px;
            text-align: left;
        }

        select {
            padding: 4px;
        }
    </style>
</head>

<body>
    <div id="sidebar">
        <!-- Selector de Base de Datos -->
        <form method="GET" id="db-form">
            <label for="db-select"><strong>Base de datos:</strong></label><br>
            <select name="db" id="db-select" onchange="document.getElementById('db-form').submit();">
                <?php foreach ($databases as $dbName): ?>
                    <option value="<?php echo htmlspecialchars($dbName); ?>" <?php echo ($dbName === $database) ? 'selected' : ''; ?>>
                        <?php echo htmlspecialchars($dbName); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </form>

        <hr>

        <div id="tables-section">
            <h3>Tablas (<?php echo count($tables); ?>)</h3>
            <?php if (!empty($tables)): ?>
                <?php foreach ($tables as $table): ?>
                    <div class="table-item" onclick="showTable('<?php echo htmlspecialchars($table); ?>')">
                        <?php echo htmlspecialchars($table); ?>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <p>Sin tablas.</p>
            <?php endif; ?>
        </div>

        <div id="views-section">
            <h3>Vistas (<?php echo count($views); ?>)</h3>
            <?php if (!empty($views)): ?>
                <?php foreach ($views as $view): ?>
                    <div class="view-item" onclick="showTable('<?php echo htmlspecialchars($view); ?>')">
                        <?php echo htmlspecialchars($view); ?>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <p>Sin vistas.</p>
            <?php endif; ?>
        </div>
    </div>

    <div id="content">
        <div id="db-info">
            <h3>Información de la Base de Datos</h3>
            <p>
                Servidor: <strong><?php echo htmlspecialchars($host); ?></strong><br>
                Usuario: <strong><?php echo htmlspecialchars($user); ?></strong><br>
                Conectado a: <strong><?php echo htmlspecialchars($database); ?></strong><br>
                Tablas: <strong><?php echo count($tables); ?></strong> |
                Vistas: <strong><?php echo count($views); ?></strong>
            </p>
        </div>

        <div id="query-execution">
            <h3>Ejecutar Query</h3>
            <form method="POST" onsubmit="return confirmQuery();">
                <!-- Mantener la BD seleccionada en el POST -->
                <input type="hidden" name="db" value="<?php echo htmlspecialchars($database); ?>">
                <textarea name="query" placeholder="Escriba su consulta SQL aquí..."><?php
                echo isset($_POST['query']) ? htmlspecialchars($_POST['query']) : '';
                ?></textarea><br>
                <button type="submit">Ejecutar</button>
            </form>
        </div>

        <div id="result">
            <?php echo $queryResultHtml; ?>
        </div>
    </div>

    <script>
        function showTable(tableName) {
            const textarea = document.querySelector('textarea[name="query"]');
            textarea.value = 'SELECT * FROM `' + tableName + '` LIMIT 100;';
        }

        function confirmQuery() {
            const textarea = document.querySelector('textarea[name="query"]');
            const query = textarea.value.trim().toUpperCase();

            if (query.startsWith('INSERT') ||
                query.startsWith('UPDATE') ||
                query.startsWith('DELETE') ||
                query.startsWith('DROP') ||
                query.startsWith('TRUNCATE') ||
                query.startsWith('ALTER')) {

                return confirm('Esta consulta puede modificar datos.\n¿Está seguro de que desea ejecutarla?');
            }
            return true;
        }
    </script>
</body>

</html>
<?php
mysqli_close($conn);
?>