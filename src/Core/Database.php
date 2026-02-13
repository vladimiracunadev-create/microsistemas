<?php

namespace Microsistemas\Core;

/**
 * Clase Database
 * 
 * Centraliza la gestión de conexiones MySQL utilizando el patrón Singleton
 * y la configuración cargada desde el Core.
 * 
 * @package Microsistemas\Core
 */
class Database
{
    /** @var \mysqli|null Conexión activa a la base de datos MySQLi */
    private static $conn = null;

    /** @var \PDO|null Conexión activa a la base de datos PDO */
    private static $pdo = null;

    /**
     * Obtiene una conexión activa a MySQL utilizando MySQLi.
     * (Mantenido por compatibilidad)
     * 
     * @throws \Exception Si la conexión falla.
     * @return \mysqli Instancia de conexión MySQLi.
     */
    public static function getConnection()
    {
        if (self::$conn === null) {
            $config = Config::getInstance();
            $host = $config->get('DB_HOST', 'localhost');
            $user = $config->get('DB_USER', 'root');
            $pass = $config->get('DB_PASS', '');

            self::$conn = @mysqli_connect($host, $user, $pass);
            if (!self::$conn) {
                throw new \Exception("Error de conexión MySQLi: " . mysqli_connect_error());
            }
            mysqli_set_charset(self::$conn, 'utf8');
        }
        return self::$conn;
    }

    /**
     * Obtiene una conexión activa utilizando PDO.
     * 
     * @param string|null $driver Driver (mysql, pgsql, sqlite)
     * Establece y retorna una conexión PDO a la base de datos.
     * 
     * Implementa el patrón Singleton para reutilizar la misma conexión durante el script.
     * Soporta múltiples drivers (MySQL, PostgreSQL, SQLite) y configura opciones críticas de seguridad
     * y manejo de errores (ERRMODE_EXCEPTION).
     * 
     * @param string|null $driver Driver de BD (mysql, pgsql, sqlite). Si es null, usa configuración.
     * @param string|null $host Host del servidor de BD.
     * @param string|null $user Usuario de conexión.
     * @param string|null $pass Contraseña de conexión.
     * @param string|null $db_selected Nombre de la base de datos (o ruta archivo para SQLite).
     * @return \PDO Instancia de conexión activa.
     * @throws \Exception Si falla la conexión.
     */
    public static function getPDO($driver = null, $host = null, $user = null, $pass = null, $db_selected = null)
    {
        // Si ya existen parámetros override, forzamos nueva conexión (poco común, útil para tests)
        // De lo contrario, retornamos la instancia singleton existente.
        if (self::$pdo === null || $driver !== null || $host !== null || $user !== null || $pass !== null || $db_selected !== null) {
            $config = Config::getInstance();

            // Obtener configuración o usar valores por defecto
            $driver = $driver ?? $config->get('DB_DRIVER', 'mysql');
            $host = $host ?? $config->get('DB_HOST', 'localhost');
            $user = $user ?? $config->get('DB_USER', 'root');
            $pass = $pass ?? $config->get('DB_PASS', '');
            $db = $db_selected ?? $config->get('DB_NAME', ''); // Usar $db_selected para el nombre de la BD

            try {
                if ($driver === 'sqlite') {
                    // SQLite usa una ruta de archivo en lugar de host/puerto estándar
                    $dsn = "sqlite:$host";
                    self::$pdo = new \PDO($dsn);
                } else {
                    $dsn = "$driver:host=$host;dbname=$db_selected";
                    self::$pdo = new \PDO($dsn, $user, $pass);
                }

                // --------------------------------------------------------------------------
                // CONFIGURACIÓN DE SEGURIDAD Y COMPORTAMIENTO
                // --------------------------------------------------------------------------
                // ERRMODE_EXCEPTION: Es vital para que los errores de SQL lancen excepciones
                // capturables en lugar de fallos silenciosos o warnings de PHP.
                self::$pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);

                // FETCH_ASSOC: Por defecto, devolvemos arrays asociativos para menor consumo de memoria
                // y código más limpio ($row['campo'] en vez de $row[0] o $row->campo).
                self::$pdo->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);

                // MYSQL_ATTR_FOUND_ROWS: Asegura que rowCount() retorne filas encontradas/afectadas
                // incluso si no cambiaron valores en un UPDATE.
                if ($driver === 'mysql') {
                    self::$pdo->setAttribute(\PDO::MYSQL_ATTR_FOUND_ROWS, true);
                }
            } catch (\PDOException $e) {
                // Relanzamos excepción genérica para no exponer detalles internos del driver si no es deseado
                throw new \Exception("Error de conexión a la base de datos: " . $e->getMessage());
            }
        }
        return self::$pdo;
    }

    /**
     * Cierra las conexiones activas.
     */
    public static function close()
    {
        if (self::$conn) {
            mysqli_close(self::$conn);
            self::$conn = null;
        }
        self::$pdo = null;
    }
}
