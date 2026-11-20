# Push pending Supabase migrations using the DB password from .env
# Usage: powershell -ExecutionPolicy Bypass -File scripts/push-migrations.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env"

if (-not (Test-Path $envFile)) {
  throw ".env not found at $envFile"
}

$line = Get-Content $envFile | Where-Object { $_ -match '^SUPABASE_DB_PASSWORD=' } | Select-Object -First 1
if (-not $line) {
  throw "SUPABASE_DB_PASSWORD is missing from .env"
}

$password = ($line -replace '^SUPABASE_DB_PASSWORD=', '').Trim()
if ($password.StartsWith('"') -and $password.EndsWith('"')) {
  $password = $password.Substring(1, $password.Length - 2)
}

$env:SUPABASE_DB_PASSWORD = $password

Push-Location $root
try {
  Write-Host "Pushing migrations to linked Supabase project..."
  supabase db push
} finally {
  Pop-Location
}
