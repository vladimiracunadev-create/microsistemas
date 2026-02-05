<?php

namespace Microsistemas\Core;

use Dotenv\Dotenv;

/**
 * Clase Config
 * 
 * Gestiona la carga y recuperación de variables de entorno del sistema
 * utilizando el patrón Singleton. Integra soporte para archivos .env.
 * 
 * @package Microsistemas\Core
 */
class Config
{
    /** @var Config|null Instancia única de la clase */
    private static $instance = null;

    private function __construct()
    {
        // El archivo .env vive en la raíz del proyecto
        $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
        try {
            $dotenv->load();
        } catch (\Exception $e) {
            // Si no hay .env, cargamos las variables de entorno del sistema
        }
    }

    /**
     * Obtiene la instancia única de la configuración.
     * 
     * @return self
     */
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Recupera un valor de configuración por su clave.
     * 
     * @param string $key Clave de la variable (ej: DB_HOST).
     * @param mixed $default Valor por defecto si la clave no existe.
     * @return mixed
     */
    public function get(string $key, $default = null)
    {
        if (isset($_ENV[$key])) {
            return $_ENV[$key];
        }

        $value = getenv($key);
        return ($value !== false) ? $value : $default;
    }
}
