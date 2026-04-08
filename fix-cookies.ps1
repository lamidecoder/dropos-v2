# fix-cookies.ps1
# Run from project root: .\fix-cookies.ps1

Write-Host "Fixing cookie settings for localhost..." -ForegroundColor Cyan

$files = @(
  "backend\src\config\jwt.ts",
  "backend\src\services\session.service.ts"
)

foreach ($file in $files) {
  if (-not (Test-Path $file)) {
    Write-Host "  Not found: $file" -ForegroundColor Yellow
    continue
  }

  $content = Get-Content $file -Raw

  # Fix sameSite: 'none' or sameSite: "none" -> lax
  $content = $content -replace "sameSite:\s*['""]none['""]", "sameSite: 'lax'"
  $content = $content -replace "sameSite:\s*['""]None['""]", "sameSite: 'lax'"

  # Fix secure: true -> false (only for local dev)
  # We'll make it dynamic based on NODE_ENV
  $content = $content -replace "secure:\s*true", "secure: process.env.NODE_ENV === 'production'"

  # Fix httpOnly issues if any
  $content = $content -replace "secure:\s*process\.env\.NODE_ENV\s*===\s*['""]production['""]", "secure: process.env.NODE_ENV === 'production'"

  Set-Content $file $content -NoNewline
  Write-Host "  Fixed: $file" -ForegroundColor Green
}

Write-Host ""
Write-Host "Cookie settings fixed!" -ForegroundColor Green
Write-Host "Restart your backend: Ctrl+C then npm run dev" -ForegroundColor Cyan
