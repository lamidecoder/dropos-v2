# fix-and-deploy.ps1
# Place in project root and run:
# powershell -ExecutionPolicy Bypass -File fix-and-deploy.ps1

Write-Host ""
Write-Host "DropOS - Fix Double Sidebar and Deploy" -ForegroundColor Magenta
Write-Host "=======================================" -ForegroundColor Magenta
Write-Host ""

$dashPath = Join-Path (Get-Location) "frontend\src\app\dashboard"
$files = Get-ChildItem -Path $dashPath -Recurse -Include "page.tsx"
$fixed = 0

foreach ($file in $files) {
  $lines = [System.IO.File]::ReadAllLines($file.FullName)
  $out = [System.Collections.Generic.List[string]]::new()
  $changed = $false

  foreach ($line in $lines) {
    # Skip import line
    if ($line -match "import\s+DashboardLayout") {
      $changed = $true
      continue
    }
    # Skip opening tag line
    if ($line -match "^\s*<DashboardLayout") {
      $changed = $true
      continue
    }
    # Skip closing tag line
    if ($line -match "^\s*</DashboardLayout>") {
      $changed = $true
      continue
    }
    $out.Add($line)
  }

  if ($changed) {
    [System.IO.File]::WriteAllLines($file.FullName, $out.ToArray())
    Write-Host "  Fixed: $($file.Directory.Name)" -ForegroundColor Green
    $fixed++
  }
}

Write-Host ""
Write-Host "$fixed files fixed." -ForegroundColor Green
Write-Host ""

# Check for any remaining
Write-Host "Checking for remaining references..." -ForegroundColor Yellow
$remaining = 0
foreach ($file in $files) {
  $content = Get-Content $file.FullName -ErrorAction SilentlyContinue
  if ($content -match "DashboardLayout") {
    Write-Host "  Still found in: $($file.Directory.Name)" -ForegroundColor Red
    $remaining++
  }
}

if ($remaining -eq 0) {
  Write-Host "All clean!" -ForegroundColor Green
}

Write-Host ""

# Git push
$status = git status --short 2>&1
if ($status) {
  Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
  git add .
  git commit -m "fix: remove all DashboardLayout double wrapping"
  git push origin main
  Write-Host ""
  Write-Host "Pushed! Check Vercel now." -ForegroundColor Cyan
} else {
  Write-Host "No changes to push - all already clean." -ForegroundColor Gray
  Write-Host "Trigger a Vercel redeploy manually from the dashboard." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Magenta
