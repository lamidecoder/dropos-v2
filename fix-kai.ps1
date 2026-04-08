# ============================================================
# fix-kai.ps1
# Run this from your project root:
# C:\Users\USER\Downloads\dropos-v2-fixed (2)\dropos-v2
#
# What it does: copies files from each kai-* folder
# into the correct backend/src and frontend/src locations
# ============================================================

Write-Host "Starting DropOS KAI file fix..." -ForegroundColor Cyan

$root = Get-Location
$backend = "$root\backend\src"
$frontend = "$root\frontend\src"

# List of all extracted ZIP folders
$kaiFolders = @(
  "kai-complete",
  "kai-power",
  "kai-priority",
  "kai-final",
  "kai-supercharge",
  "kai-locale",
  "kai-bulletproof",
  "kai-agent",
  "store-editor",
  "kai-dropmagic",
  "kai-intelligence",
  "kai-autopilot",
  "kai-fulfillment-simple",
  "dropos-ux"
)

foreach ($folder in $kaiFolders) {
  $folderPath = "$root\$folder"

  if (-not (Test-Path $folderPath)) {
    Write-Host "  Skipping $folder (not found)" -ForegroundColor Yellow
    continue
  }

  Write-Host "  Processing $folder..." -ForegroundColor Green

  # Copy backend files if they exist
  $backendSrc = "$folderPath\backend\src"
  if (Test-Path $backendSrc) {
    Copy-Item -Path "$backendSrc\*" -Destination $backend -Recurse -Force
    Write-Host "    Backend files copied" -ForegroundColor DarkGreen
  }

  # Copy frontend files if they exist
  $frontendSrc = "$folderPath\frontend\src"
  if (Test-Path $frontendSrc) {
    Copy-Item -Path "$frontendSrc\*" -Destination $frontend -Recurse -Force
    Write-Host "    Frontend files copied" -ForegroundColor DarkGreen
  }

  # Also handle nested paths like kai-complete/backend/src/...
  # Some ZIPs have the folder name as an extra level
  $nestedBackend = "$folderPath\$folder\backend\src"
  if (Test-Path $nestedBackend) {
    Copy-Item -Path "$nestedBackend\*" -Destination $backend -Recurse -Force
    Write-Host "    Nested backend files copied" -ForegroundColor DarkGreen
  }

  $nestedFrontend = "$folderPath\$folder\frontend\src"
  if (Test-Path $nestedFrontend) {
    Copy-Item -Path "$nestedFrontend\*" -Destination $frontend -Recurse -Force
    Write-Host "    Nested frontend files copied" -ForegroundColor DarkGreen
  }
}

Write-Host ""
Write-Host "Done! Now run:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm install" -ForegroundColor White
Write-Host "  npx prisma generate" -ForegroundColor White
Write-Host "  npx prisma migrate dev --name kai_all" -ForegroundColor White
