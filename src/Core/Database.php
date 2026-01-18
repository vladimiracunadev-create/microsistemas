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
    /** @var \mysqli|null Conexión activa a la base de datos */
    private static $conn = null;

    /**
     * Obtiene una conexión activa a MySQL.
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
                throw new \Exception("Error de conexión: " . mysqli_connect_error());
            }

            mysqli_set_charset(self::$conn, 'utf8');
        }

        return self::$conn;
    }

    /**
     * Cierra la conexión activa a la base de datos.
     * 
     * @return void
     */
    public static function close()
    {
        if (self::$conn) {
            mysqli_close(self::$conn);
            self::$conn = null;
        }
    }
}
