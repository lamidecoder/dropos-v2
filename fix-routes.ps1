# fix-routes.ps1
# Removes requireAdmin and requireOwner from all route files
# since they no longer exist in the new auth middleware

Write-Host "Fixing all route files..." -ForegroundColor Cyan

$routesDir = "backend\src\routes"
$files = Get-ChildItem -Path $routesDir -Filter "*.ts"

foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw
  $original = $content

  # Remove requireAdmin and requireOwner from imports
  $content = $content -replace ",\s*requireAdmin", ""
  $content = $content -replace ",\s*requireOwner", ""
  $content = $content -replace "requireAdmin,\s*", ""
  $content = $content -replace "requireOwner,\s*", ""

  # Remove requireAdmin and requireOwner from route handlers
  $content = $content -replace ",\s*requireAdmin\b", ""
  $content = $content -replace ",\s*requireOwner\b", ""

  if ($content -ne $original) {
    Set-Content $file.FullName $content -NoNewline
    Write-Host "  Fixed: $($file.Name)" -ForegroundColor Green
  }
}

# Also fix controllers folder
$controllersDir = "backend\src\controllers"
$cfiles = Get-ChildItem -Path $controllersDir -Filter "*.ts"

foreach ($file in $cfiles) {
  $content = Get-Content $file.FullName -Raw
  $original = $content

  $content = $content -replace ",\s*requireAdmin", ""
  $content = $content -replace ",\s*requireOwner", ""
  $content = $content -replace "requireAdmin,\s*", ""
  $content = $content -replace "requireOwner,\s*", ""
  $content = $content -replace ",\s*requireAdmin\b", ""
  $content = $content -replace ",\s*requireOwner\b", ""

  if ($content -ne $original) {
    Set-Content $file.FullName $content -NoNewline
    Write-Host "  Fixed controller: $($file.Name)" -ForegroundColor Green
  }
}

Write-Host ""
Write-Host "All route files fixed!" -ForegroundColor Green
Write-Host "The server should auto-restart now." -ForegroundColor Cyan
