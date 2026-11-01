<?php

declare(strict_types=1);

require_once __DIR__ . '/../apps/PhpMigrator/migrator.php';

$legacy = <<<'PHP'
<?php
$result = mysql_query('SELECT * FROM users');
while (list($k, $v) = each($items)) { echo $v; }
PHP;

$converted = migratePhpLegacyCode($legacy);
$checks = [
    'foreach conversion' => str_contains($converted, 'foreach ($items as $k => $v)'),
    'mysql requires manual migration' => str_contains($converted, 'TODO: migrar mysql_*'),
    'legacy mysql is not executable' => str_contains($converted, '// LEGACY: $result = mysql_query'),
    'no invalid each conversion' => !str_contains($converted, '= foreach('),
    'no implicit mysqli connection' => !str_contains($converted, 'mysqli_query'),
];

foreach ($checks as $name => $passed) {
    if (!$passed) {
        fwrite(STDERR, "FAIL: {$name}\n{$converted}\n");
        exit(1);
    }
}

$tmp = tempnam(sys_get_temp_dir(), 'php-migrator-');
if ($tmp === false) {
    fwrite(STDERR, "FAIL: no se pudo crear archivo temporal\n");
    exit(1);
}

file_put_contents($tmp, $converted);
exec(PHP_BINARY . ' -l ' . escapeshellarg($tmp), $lintOutput, $lintCode);
unlink($tmp);

if ($lintCode !== 0) {
    fwrite(STDERR, "FAIL: la salida convertida no es PHP valido\n" . implode("\n", $lintOutput) . "\n");
    exit(1);
}

echo "OK: PHP Migrator produce una salida conservadora y sintacticamente valida.\n";
