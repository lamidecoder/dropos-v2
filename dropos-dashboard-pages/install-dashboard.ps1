# install-dashboard.ps1
# Run from your project root:
# cd "C:\Users\USER\Downloads\dropos-v2-fixed (2)\dropos-v2"
# powershell -ExecutionPolicy Bypass -File install-dashboard.ps1

$root = Get-Location
$src  = Join-Path $root "dropos-dashboard-pages\frontend\src"
$dest = Join-Path $root "frontend\src"

Write-Host ""
Write-Host "DropOS Dashboard Installer" -ForegroundColor Magenta
Write-Host "==========================" -ForegroundColor Magenta
Write-Host ""

if (-not (Test-Path $src)) {
  Write-Host "ERROR: dropos-dashboard-pages folder not found in project root." -ForegroundColor Red
  Write-Host "Make sure you extracted the zip into your project root first." -ForegroundColor Yellow
  exit 1
}

# Create directories
$dirs = @(
  "components\layout",
  "app\dashboard",
  "app\dashboard\kai",
  "app\dashboard\stores",
  "app\dashboard\products",
  "app\dashboard\orders",
  "app\dashboard\customers",
  "app\dashboard\analytics",
  "app\dashboard\billing",
  "app\dashboard\settings",
  "app\dashboard\inventory",
  "app\dashboard\import",
  "app\dashboard\suppliers",
  "app\dashboard\shipping",
  "app\dashboard\coupons",
  "app\dashboard\flash-sales",
  "app\dashboard\affiliates",
  "app\dashboard\reviews",
  "app\dashboard\emails",
  "app\dashboard\abandoned-carts",
  "app\dashboard\top-products",
  "app\dashboard\notifications",
  "app\dashboard\support"
)

foreach ($d in $dirs) {
  $path = Join-Path $dest $d
  if (-not (Test-Path $path)) {
    New-Item -ItemType Directory -Path $path -Force | Out-Null
  }
}

Write-Host "Directories ready." -ForegroundColor Green

# Copy all files
$files = Get-ChildItem -Path $src -Recurse -Filter "*.tsx"

$count = 0
foreach ($file in $files) {
  $relative = $file.FullName.Substring($src.Length + 1)
  $destFile  = Join-Path $dest $relative
  $destDir   = Split-Path $destFile -Parent

  if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
  }

  Copy-Item $file.FullName -Destination $destFile -Force
  Write-Host "  Copied: $relative" -ForegroundColor DarkGray
  $count++
}

Write-Host ""
Write-Host "Installed $count files successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  git add ."
Write-Host "  git commit -m `"feat: world-class dashboard all pages`""
Write-Host "  git push origin main"
Write-Host ""
Write-Host "Then check Vercel for the deployment." -ForegroundColor Cyan
