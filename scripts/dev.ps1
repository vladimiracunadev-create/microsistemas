# Script de Desarrollo Microsistemas (PowerShell)

param (
    [Parameter(Mandatory=$false)]
    [string]$comando = "ayuda"
)

function Mostrar-Ayuda {
    Write-Host "Uso: .\scripts\dev.ps1 [comando]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Comandos:"
    Write-Host "  listar      Lista todas las micro-apps disponibles"
    Write-Host "  revisar     Ejecuta linter/análisis estático (PHP, Python, MD)"
    Write-Host "  probar      Ejecuta pruebas (si existen)"
    Write-Host "  catalogo    Regenera el catálogo en el README.md"
    Write-Host "  ayuda       Muestra este mensaje"
}

switch ($comando) {
    "listar" {
        powershell -File .\hub.ps1 list
    }
    "revisar" {
        Write-Host "--- Revisando PHP (CS-Fixer) ---" -ForegroundColor Yellow
        if (Test-Path "vendor\bin\php-cs-fixer") {
            php vendor\bin\php-cs-fixer fix --dry-run --diff
        } else {
            Write-Host "Error: php-cs-fixer no encontrado. Ejecuta 'make install'." -ForegroundColor Red
        }

        Write-Host "--- Revisando PHP (PHPStan) ---" -ForegroundColor Yellow
        if (Test-Path "vendor\bin\phpstan") {
            php vendor\bin\phpstan analyze
        }

        Write-Host "--- Revisando Markdown ---" -ForegroundColor Yellow
        if (Get-Command "markdownlint" -ErrorAction SilentlyContinue) {
            markdownlint .
        } else {
            Write-Host "Aviso: markdownlint no instalado."
        }
    }
    "probar" {
        Write-Host "Ejecutando pruebas..." -ForegroundColor Green
        python scripts\generate_catalog.py
    }
    "catalogo" {
        python scripts\generate_catalog.py
    }
    default {
        Mostrar-Ayuda
    }
}
