<?php

declare(strict_types=1);

/**
 * Applies only transformations that can be expressed conservatively.
 *
 * Database APIs that need a connection or a design decision are commented out
 * and marked for manual migration instead of being rewritten into executable
 * but incorrect code.
 */
function migratePhpLegacyCode(string $inputCode): string
{
    $convertedCode = $inputCode;

    // while (list($key, $value) = each($items)) -> foreach ($items as ...)
    $convertedCode = preg_replace_callback(
        '/while\s*\(\s*list\s*\(\s*(\$[A-Za-z_]\w*)\s*,\s*(\$[A-Za-z_]\w*)\s*\)'
        . '\s*=\s*each\s*\(\s*([^)]+?)\s*\)\s*\)/i',
        static fn (array $match): string => sprintf(
            'foreach (%s as %s => %s)',
            trim($match[3]),
            $match[1],
            $match[2]
        ),
        $convertedCode
    ) ?? $convertedCode;

    // Simple array literals. Nested expressions are deliberately left alone.
    $convertedCode = preg_replace(
        '/\barray\s*\(([^()]*?)\)/i',
        '[$1]',
        $convertedCode
    ) ?? $convertedCode;

    // PHP 4 property declarations.
    $convertedCode = preg_replace(
        '/^(\s*)var\s+(\$[A-Za-z_]\w*\s*(?:=[^;]+)?;)/mi',
        '$1public $2',
        $convertedCode
    ) ?? $convertedCode;

    $convertedCode = preg_replace('/^\s*#/m', '//', $convertedCode) ?? $convertedCode;
    $convertedCode = preg_replace(
        '/error_reporting\s*\(E_ALL\s*\^\s*E_NOTICE\)/i',
        'error_reporting(E_ALL & ~E_NOTICE)',
        $convertedCode
    ) ?? $convertedCode;

    // mysql_* cannot be converted safely without an explicit PDO/mysqli
    // connection. Preserve the original statement as a comment and make the
    // required manual work visible.
    $convertedCode = preg_replace_callback(
        '/^([ \t]*)(.*\bmysql_(?:connect|query|select_db|fetch_array|fetch_assoc|fetch_row|fetch_object|num_rows|real_escape_string)'
        . '\s*\([^;\r\n]*\)\s*;.*)$/mi',
        static function (array $match): string {
            $indent = $match[1];
            $legacy = trim($match[2]);

            return $indent . '// TODO: migrar mysql_* a PDO o mysqli con una conexion explicita.'
                . PHP_EOL . $indent . '// LEGACY: ' . $legacy;
        },
        $convertedCode
    ) ?? $convertedCode;

    return $convertedCode;
}
