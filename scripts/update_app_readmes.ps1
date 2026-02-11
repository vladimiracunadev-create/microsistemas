$apps = Get-ChildItem apps -Directory
foreach ($app in $apps) {
    $readme = Join-Path $app.FullName 'README.md'
    if (Test-Path $readme) {
        $content = Get-Content $readme -Raw
        
        # Check if already has monitoring section
        if ($content -notmatch "Endpoints de Monitoreo") {
            $healthSection = @"

## Endpoints de Monitoreo

Esta aplicación implementa los siguientes endpoints de diagnóstico:

- **`/health`**: Verifica que la aplicación está corriendo (liveness check). Retorna JSON con estado ``ok``.
- **`/ready`**: Verifica que la aplicación está lista para recibir tráfico (readiness check). Retorna JSON con estado de dependencias.

Para más información, consulta [TECHNICAL_SPECS.md](../../docs/TECHNICAL_SPECS.md).
"@
            Add-Content -Path $readme -Value $healthSection
            Write-Host "Updated $($app.Name)/README.md"
        } else {
            Write-Host "Skipped $($app.Name)/README.md (already has monitoring section)"
        }
    }
}
