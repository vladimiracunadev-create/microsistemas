<?php

/**
 * Verifica que el interprete PHP pertenezca a una rama y nivel de parche
 * corregidos para CVE-2026-109618 y CVE-2026-109619.
 */

$minimumByBranch = [
    '8.2' => '8.2.35',
    '8.3' => '8.3.36',
    '8.4' => '8.4.27',
    '8.5' => '8.5.12',
];

$branch = PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION;
$minimum = $minimumByBranch[$branch] ?? null;

if ($minimum === null || version_compare(PHP_VERSION, $minimum, '<')) {
    fwrite(
        STDERR,
        sprintf(
            "ERROR: PHP %s no esta soportado. Usa 8.2.35+, 8.3.36+, 8.4.27+ "
            . "o 8.5.12+ dentro de la rama elegida.\n",
            PHP_VERSION
        )
    );
    fwrite(
        STDERR,
        "Motivo: CVE-2026-109618 y CVE-2026-109619 permiten RCE en runtimes anteriores.\n"
    );
    exit(1);
}

printf("OK: PHP %s cumple el piso seguro de la rama %s.\n", PHP_VERSION, $branch);
