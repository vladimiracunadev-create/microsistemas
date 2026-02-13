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
        // --------------------------------------------------------------------------
        // CARGA DE VARIABLES DE ENTORNO
        // --------------------------------------------------------------------------
        // Se intenta cargar el archivo .env ubicado en la raíz del proyecto.
        // La librería vlucas/phpdotenv (createImmutable) asegura que las variables
        // no sobrescriban las ya existentes en el entorno ($_SERVER o $_ENV) si son inmutables,
        // protegiendo variables críticas del servidor.
        $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
        try {
            $dotenv->load();
        } catch (\Exception $e) {
            // SILENCIO INTENCIONAL:
            // Si el archivo .env no existe, asumimos que estamos en un entorno
            // de producción (como ECS o Docker) donde las variables se inyectan
            // directamente al nivel del sistema operativo. No se debe detener la ejecución.
        }
    }

    /**
     * Obtiene la instancia única de la configuración (Patrón Singleton).
     * 
     * Este método asegura que solo exista una copia de la configuración en memoria
     * durante todo el ciclo de vida de la solicitud, evitando recargas innecesarias
     * del archivo .env y conflictos de estado.
     * 
     * @return self La instancia única de Config.
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
