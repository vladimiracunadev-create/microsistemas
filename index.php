<?php require_once __DIR__ . '/vendor/autoload.php'; ?>
<!--
    Dashboard Principal de Microsistemas
    Punto de entrada para acceder a todas las aplicaciones del sistema.
    Maneja la carga de configuraciones y la presentación visual del menú.
-->
<!DOCTYPE html>
<html lang="es">
<!--
    Microsistemas - Dashboard Principal
    Este archivo sirve como punto de entrada para acceder a todas las herramientas
    disponibles en la suite. Utiliza un diseño moderno y responsive.
-->

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Microsistemas | Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0f172a;
            --card-bg: #1e293b;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent: #3b82f6;
            --hover: #2563eb;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-primary);
            margin: 0;
            padding: 40px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        header {
            text-align: center;
            margin-bottom: 60px;
        }

        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(90deg, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        p.subtitle {
            color: var(--text-secondary);
            font-size: 1.1rem;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            max-width: 1200px;
            width: 100%;
        }

        .card {
            background-color: var(--card-bg);
            border-radius: 12px;
            padding: 25px;
            transition: transform 0.2s, box-shadow 0.2s;
            border: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
            border-color: var(--accent);
        }

        .card h2 {
            margin-top: 0;
            font-size: 1.4rem;
            color: white;
        }

        .card p {
            color: var(--text-secondary);
            line-height: 1.5;
            flex-grow: 1;
        }

        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .badge.php {
            background-color: #4f5b93;
            color: white;
        }

        .badge.js {
            background-color: #f7df1e;
            color: black;
        }

        .btn {
            display: inline-block;
            background-color: var(--accent);
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 6px;
            text-align: center;
            font-weight: 600;
            margin-top: 20px;
            transition: background-color 0.2s;
        }

        .btn:hover {
            background-color: var(--hover);
        }
    </style>
</head>

<body>

    <header>
        <h1>Microsistemas</h1>
        <p class="subtitle">Suite de herramientas de desarrollo y productividad</p>
        <div style="margin-top: 20px;">
            <a href="doc.php?file=USER_MANUAL.md"
                style="color: var(--accent); text-decoration: none; font-size: 0.9rem; margin: 0 10px;">📖 Manual de
                Usuario</a>
            <a href="doc.php?file=INSTALL.md"
                style="color: var(--accent); text-decoration: none; font-size: 0.9rem; margin: 0 10px;">🚀 Guía de
                Instalación</a>
        </div>
    </header>

    <div class="grid">
        <!-- Tarjeta 1 -->
        <div class="card">
            <div>
                <span class="badge php">PHP</span>
                <h2>Conversor de Texto</h2>
                <p>Transforma caracteres especiales a entidades HTML, Unicode JS y formatos seguros.</p>
            </div>
            <a href="apps/Conversor/" class="btn">Abrir Herramienta</a>
        </div>

        <!-- Tarjeta 2 -->
        <div class="card">
            <div>
                <span class="badge php">PHP + SQL</span>
                <h2>SQL Viewer</h2>
                <p>Cliente ligero de base de datos para consultas rápidas y seguras en entornos restringidos.</p>
            </div>
            <a href="apps/SqlViewer/" class="btn">Abrir Herramienta</a>
        </div>

        <!-- Tarjeta 3 -->
        <div class="card">
            <div>
                <span class="badge js">HTML + JS</span>
                <h2>Git Trainer</h2>
                <p>Guía interactiva de comandos Git con más de 1000 casos de uso y ejemplos reales.</p>
            </div>
            <a href="apps/GitTrainer/" class="btn">Abrir Herramienta</a>
        </div>

        <!-- Tarjeta 4 -->
        <div class="card">
            <div>
                <span class="badge js">JS Tools</span>
                <h2>JS Toolkit</h2>
                <p>Minificador, ofuscador, linter y formatter de JavaScript todo en uno.</p>
            </div>
            <a href="apps/JsTools/" class="btn">Abrir Herramienta</a>
        </div>

        <!-- Tarjeta KatasMultiLang -->
        <div class="card">
            <div>
                <span class="badge js">HTML + JS</span>
                <h2>Katas MultiLang</h2>
                <p>Comparador visual de soluciones por caso en múltiples lenguajes y frameworks (copiar rápido + filtros).</p>
            </div>
            <a href="apps/KatasMultiLang/" class="btn">Abrir Herramienta</a>
        </div>

        <!-- Tarjeta PythonEval3000 -->
        <div class="card">
            <div>
                <span class="badge js">HTML + JS</span>
                <h2>Python Eval 3000</h2>
                <p>Evaluador y explorador de 3000 preguntas de Python y Data Science con 4 alternativas, bloques de código y respuestas.</p>
            </div>
            <a href="apps/PythonEval3000/" class="btn">Abrir Herramienta</a>
        </div>

        <!-- Tarjeta 5 -->
        <div class="card">
            <div>
                <span class="badge js">HTML + JS</span>
                <h2>generador YAML</h2>
                <p>Creador visual de archivos de configuración YAML con plantillas predefinidas.</p>
            </div>
            <a href="apps/YmlGenerator/" class="btn">Abrir Herramienta</a>
        </div>

        <!-- Tarjeta 6 -->
        <div class="card">
            <div>
                <span class="badge php">PHP</span>
                <h2>Log Viewer</h2>
                <p>Visor seguro de archivos de log y configuraciones del servidor en modo solo lectura.</p>
            </div>
            <a href="apps/LogViewer/" class="btn">Abrir Herramienta</a>
        </div>

        <!-- Tarjeta 7 -->
        <div class="card">
            <div>
                <span class="badge php">PHP</span>
                <h2>PHP Migrator</h2>
                <p>Asistente para detectar sintaxis obsoleta y facilitar la migración de PHP 5.4 a 8.x.</p>
            </div>
            <a href="apps/PhpMigrator/" class="btn">Abrir Herramienta</a>
        </div>

        <!-- Tarjeta 8 -->
        <div class="card">
            <div>
                <span class="badge js">DevOps</span>
                <h2>Capacity Simulator</h2>
                <p>Simulador heurístico para estimar RPS, usuarios concurrentes y cuellos de botella en
                    infraestructuras.</p>
            </div>
            <a href="apps/CapacitySim/" class="btn">Abrir Herramienta</a>
        </div>

        <!-- Tarjeta 9 -->
        <div class="card">
            <div>
                <span class="badge js">DevOps</span>
                <h2>CI/CD Lab Engine</h2>
                <p>Motor de generación de matrices CI/CD. Renderiza configuraciones para GitHub, GitLab y Jenkins.</p>
            </div>
            <a href="apps/CicdLibrary/" class="btn">Abrir Motor</a>
        </div>

        <!-- Tarjeta 10 -->
        <div class="card">
            <div>
                <span class="badge js">DevOps</span>
                <h2>AWS CLI Generator</h2>
                <p>Generador de comandos AWS CLI basado en recetas reales con validación de seguridad y exportación de scripts.</p>
            </div>
            <a href="apps/AwsGenerator/" class="btn">Abrir Herramienta</a>
        </div>
    </div>

</body>

</html>