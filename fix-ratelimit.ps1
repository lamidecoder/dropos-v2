# fix-ratelimit.ps1
# Loosens rate limits for local development

Write-Host "Fixing rate limits for local dev..." -ForegroundColor Cyan

# Find rate limiter file
$files = Get-ChildItem -Path "backend\src" -Recurse -Filter "*.ts" | 
  Select-String -Pattern "rateLimit|rateLimiter|windowMs" |
  Select-Object -ExpandProperty Path -Unique

foreach ($file in $files) {
  $content = Get-Content $file -Raw
  $original = $content

  # Increase max attempts significantly for dev
  # Change max: 5 or max: 10 to max: 1000
  $content = $content -replace "max:\s*\d+", "max: 1000"
  
  # Increase window to 1 minute
  $content = $content -replace "windowMs:\s*[\d\s\*]+", "windowMs: 60 * 1000"

  if ($content -ne $original) {
    Set-Content $file $content -NoNewline
    Write-Host "  Fixed: $file" -ForegroundColor Green
  }
}

Write-Host ""
Write-Host "Rate limits loosened! Restart backend." -ForegroundColor Green
