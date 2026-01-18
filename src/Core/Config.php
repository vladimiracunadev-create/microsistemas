<?php

namespace Microsistemas\Core;

use Dotenv\Dotenv;

class Config
{
    private static $instance = null;
    private $data = [];

    private function __construct()
    {
        // El archivo .env vive en la raíz del proyecto
        $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
        try {
            $this->data = $dotenv->load();
        } catch (\Exception $e) {
            // Si no hay .env, cargamos las variables de entorno del sistema
        }
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function get(string $key, $default = null)
    {
        return $_ENV[$key] ?? getenv($key) ?? $default;
    }
}
