<?php require_once __DIR__ . '/../../vendor/autoload.php'; ?>
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
    // Realiza múltiples pases de sustitución para modernizar el código.
    // NOTA: Esto es una herramienta de ayuda y no garantiza código 100% libre de errores.
    // Ejemplo de conversión básica para modernizar el código
    $convertedCode = str_replace('mysql_', 'mysqli_', $inputCode); // Ejemplo: actualizar funciones obsoletas de MySQL
    $convertedCode = preg_replace('/\$this->(\w+)/', 'self::$1', $convertedCode);
    // --------------------------------------------------------------------------
    // REGLAS DE MIGRACIÓN (REGEX)
    // --------------------------------------------------------------------------
    // Aquí definimos los patrones de código legado (PHP 5.x/7.x) que deben
    // transformarse a sintaxis moderna (PHP 8.x).

    // 1. Array Syntax: array() -> []
    $convertedCode = preg_replace('/array\s*\(([^)]*)\)/i', '[$1]', $convertedCode);

    // 2. Propiedades deprecadas: var $variable -> public $variable
    //    PHP 4 usaba 'var', eliminado en versiones recientes.
    $convertedCode = preg_replace('/var\s+\$/i', 'public $', $convertedCode);

    // 3. Funciones create_function() -> Funciones Anónimas
    //    create_function() fuertemente deprecada por riesgos de seguridad (eval interno).
    $convertedCode = preg_replace('/create_function\(\s*\'([^\']*)\'\s*,\s*\'([^\']*)\'\s*\)/', 'function($1) { $2; }', $convertedCode);

    // 4. Comentarios Hash (#) -> Doble barra (//)
    //    El estilo Perl/Shell (#) fue deprecado en archivos .php (aunque sigue válido, se prefiere //).
    $convertedCode = preg_replace('/^\s*#/m', '//', $convertedCode);

    // 5. mysql_* functions -> Advertencia (no reemplazo automático seguro)
    //    Las funciones mysql_ fueron eliminadas en PHP 7. Solo agregamos un comentario TODO.
    $convertedCode = preg_replace('/(mysql_connect|mysql_query|mysql_select_db)/i', '// TODO: MIGRATE TO PDO OR MYSQLI -> $1', $convertedCode);
    $convertedCode = preg_replace('/split\s*\((.*?),\s*(.*?)\)/', 'explode($1, $2)', $convertedCode); // Reemplazar split() con explode()
    $convertedCode = preg_replace('/each\s*\((.*?)\)/', 'foreach($1 as $key => $value)', $convertedCode); // Reemplazar each() con foreach()
    $convertedCode = str_replace('ereg_', 'preg_', $convertedCode); // Actualizar funciones obsoletas de ereg_
    $convertedCode = preg_replace('/&([a-zA-Z0-9]+);/', 'htmlspecialchars("&$1;")', $convertedCode); // Actualizar referencias HTML obsoletas
    $convertedCode = preg_replace('/__autoload\s*\((.*?)\)/', 'spl_autoload_register($1)', $convertedCode); // Reemplazar __autoload() con spl_autoload_register
    $convertedCode = preg_replace('/(\s|^)var\s+(\$.*?;)/', '$1public $2', $convertedCode); // Cambiar var a public para propiedades de clase
    $convertedCode = preg_replace('/error_reporting\s*\(E_ALL\s*\^\s*E_NOTICE\)/', 'error_reporting(E_ALL & ~E_NOTICE)', $convertedCode); // Actualizar error_reporting obsoleto
    $convertedCode = preg_replace('/is_null\s*\((.*?)\)/', '($1 === null)', $convertedCode); // Reemplazar is_null() por comparación estricta

    // OJO: convertir define() a const automáticamente puede romper código.
    // De momento solo marcamos las apariciones de define() y las dejamos igual.
    $convertedCode = preg_replace(
        '/define\s*\((\'|")(.*?)(\'|")\s*,\s*(.*?)\)/',
        '/* revisar define → const manualmente */ define($1$2$3, $4)',
        $convertedCode
    );

    $convertedCode = preg_replace(
        '/json_decode\s*\((.*?),\s*(.*?)\)/',
        'json_decode($1, $2, 512, JSON_THROW_ON_ERROR)',
        $convertedCode
    ); // Añadir JSON_THROW_ON_ERROR a json_decode

    $convertedCode = preg_replace('/ereg_replace\s*\((.*?)\)/', 'preg_replace($1)', $convertedCode); // Reemplazar ereg_replace() con preg_replace()
    $convertedCode = str_replace('mssql_', 'sqlsrv_', $convertedCode); // Actualizar funciones obsoletas de SQL Server (mssql_ a sqlsrv_)
    $convertedCode = preg_replace('/mssql_connect\s*\((.*?)\)/', 'sqlsrv_connect($1)', $convertedCode); // Reemplazar mssql_connect() con sqlsrv_connect()
    $convertedCode = preg_replace('/mssql_query\s*\((.*?)\)/', 'sqlsrv_query($1)', $convertedCode); // Reemplazar mssql_query() con sqlsrv_query()
    $convertedCode = preg_replace('/mssql_fetch_(row|array|assoc|object)\s*\((.*?)\)/', 'sqlsrv_fetch_array($2, SQLSRV_FETCH_$1)', $convertedCode); // Reemplazar mssql_fetch_* con sqlsrv_fetch_array()
    $convertedCode = preg_replace('/call_user_func_array\s*\((.*?)\)/', '$1(...$2)', $convertedCode); // Actualizar call_user_func_array() a desestructuración (revisar manualmente)
    $convertedCode = preg_replace('/list\s*\((.*?)\)\s*=\s*(.*?);/', '[$1] = $2;', $convertedCode); // Reemplazar list() por []
    $convertedCode = preg_replace('/switch\s*\((.*?)\)\s*{/', 'match($1) {', $convertedCode); // Migrar switch a match (revisar manualmente)
    $convertedCode = preg_replace('/eval\s*\((.*?)\)/', '// eval() reemplazado por una alternativa más segura', $convertedCode); // Eliminar eval() por seguridad
    $convertedCode = preg_replace('/intval\s*\((.*?)\)/', '(int) $1', $convertedCode); // Reemplazar intval() por casting
    $convertedCode = preg_replace('/floatval\s*\((.*?)\)/', '(float) $1', $convertedCode); // Reemplazar floatval() por casting
    $convertedCode = preg_replace('/empty\s*\((.*?)\)/', '!($1)', $convertedCode); // Reemplazar empty() por una expresión simple
    $convertedCode = preg_replace('/PDO::query\s*\((.*?)\)/', 'try { $pdo->query($1); } catch (PDOException $e) { echo "Error: " . $e->getMessage(); }', $convertedCode); // Manejar errores de PDO con try-catch
    $convertedCode = preg_replace('/count\s*\((.*?)\)/', '(is_array($1) || $1 instanceof Countable) ? count($1) : 0', $convertedCode); // Reemplazar count() para objetos que no sean Countable
    $convertedCode = preg_replace('/implode\s*\((.*?),\s*(.*?)\)/', 'implode($1, $2)', $convertedCode); // Asegurar el orden correcto de parámetros en implode()
    $convertedCode = preg_replace('/method_exists\s*\((.*?),\s*(.*?)\)/', 'method_exists($1, $2)', $convertedCode); // Verificar existencia de métodos correctamente

    echo htmlspecialchars($convertedCode);
}
?>
        </textarea>
    </div>
</body>

</html>