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
     * @param string|null $host Host o ruta de archivo
     * @param string|null $user Usuario
     * @param string|null $pass Contraseña
     * @param string|null $db Nombre de la base de datos
     * @return \PDO Instancia de conexión PDO.
     */
    public static function getPDO($driver = null, $host = null, $user = null, $pass = null, $db = null)
    {
        if (self::$pdo === null || $driver !== null) {
            $config = Config::getInstance();
            
            $driver = $driver ?? $config->get('DB_DRIVER', 'mysql');
            $host = $host ?? $config->get('DB_HOST', 'localhost');
            $user = $user ?? $config->get('DB_USER', 'root');
            $pass = $pass ?? $config->get('DB_PASS', '');
            $db = $db ?? $config->get('DB_NAME', '');

            try {
                if ($driver === 'sqlite') {
                    $dsn = "sqlite:$host";
                    self::$pdo = new \PDO($dsn);
                } else {
                    $dsn = "$driver:host=$host;dbname=$db;charset=utf8";
                    self::$pdo = new \PDO($dsn, $user, $pass);
                }
                self::$pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
                self::$pdo->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);
            } catch (\PDOException $e) {
                throw new \Exception("Error de conexión PDO: " . $e->getMessage());
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
