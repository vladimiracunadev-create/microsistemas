#!/bin/bash

# Script de Desarrollo Microsistemas (Bash)

function mostrar_ayuda() {
    echo "Uso: ./scripts/dev.sh [comando]"
    echo ""
    echo "Comandos:"
    echo "  listar      Lista todas las micro-apps disponibles"
    echo "  revisar     Ejecuta linter/análisis estático (PHP, Python, MD)"
    echo "  probar      Ejecuta pruebas (si existen)"
    echo "  catalogo    Regenera el catálogo en el README.md"
    echo "  ayuda       Muestra este mensaje"
}

case "$1" in
    listar)
        ./hub.sh list
        ;;
    revisar)
        echo "--- Revisando PHP (CS-Fixer) ---"
        vendor/bin/php-cs-fixer fix --dry-run --diff
        echo "--- Revisando PHP (PHPStan) ---"
        vendor/bin/phpstan analyze
        echo "--- Revisando Markdown ---"
        # Asumiendo markdownlint-cli instalado
        if command -v markdownlint &> /dev/null; then
            markdownlint .
        else
            echo "Aviso: markdownlint no instalado."
        fi
        ;;
    probar)
        echo "Ejecutando pruebas..."
        # Por ahora solo salud de manifiestos
        python3 scripts/generate_catalog.py --check
        ;;
    catalogo)
        python3 scripts/generate_catalog.py
        ;;
    *)
        mostrar_ayuda
        exit 1
        ;;
esac
