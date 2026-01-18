<?php

namespace Microsistemas\Core;

class Database
{
    private static $conn = null;

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

    public static function close()
    {
        if (self::$conn) {
            mysqli_close(self::$conn);
            self::$conn = null;
        }
    }
}
