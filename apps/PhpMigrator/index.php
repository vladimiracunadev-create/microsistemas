<?php
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/migrator.php';
?>
<!DOCTYPE html>
<html lang="es">
<!--
    Convertidor de Código PHP
    Herramienta que facilita la migración de código legado (PHP 5.4) a versiones modernas (PHP 8.3).
    Aplica una serie de reglas de reemplazo (regex y str_replace) para actualizar sintaxis obsoleta.
-->

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Convertidor de Código PHP</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Roboto', sans-serif;
            background-color: #f3f4f6;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }

        .container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 80%;
            max-width: 800px;
        }

        textarea {
            width: 100%;
            height: 200px;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #ccc;
            font-size: 16px;
            resize: none;
        }

        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            margin-top: 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }

        button:hover {
            background-color: #45a049;
        }
    </style>
</head>

<body>
    <div class="container">
        <a href="../../index.php"
            style="text-decoration: none; color: #666; font-size: 0.9rem; margin-bottom: 15px; display: inline-block;">&larr;
            Volver al Dashboard</a>
        <h2>Convertidor de Código PHP 5.4 a PHP 8.3</h2>
        <form action="" method="post">
            <label for="php54">Introduce el código PHP 5.4:</label>
            <textarea id="php54" name="php54_code"></textarea>
            <button type="submit">Convertir a PHP 8.3</button>
        </form>
        <h3>Código Convertido:</h3>
        <textarea readonly>
<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['php54_code'])) {
    $inputCode = $_POST['php54_code'];
    echo htmlspecialchars(migratePhpLegacyCode($inputCode), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
?>
        </textarea>
    </div>
</body>

</html>
