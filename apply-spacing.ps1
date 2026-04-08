# apply-spacing.ps1
# Run from project root

Write-Host "Applying dashboard spacing fix..." -ForegroundColor Cyan

# 1. Add .dash-page CSS to globals.css
$globalsPath = "frontend\src\app\globals.css"
if (Test-Path $globalsPath) {
    $globals = Get-Content $globalsPath -Raw
    if ($globals -notmatch "dash-page") {
        $css = @"

/* ── Dashboard page spacing ─────────────────────────────── */
.dash-page {
  padding: 32px 36px 48px;
  min-height: 100%;
  background: #07070e;
}
@media (max-width: 768px) {
  .dash-page { padding: 20px 16px 40px; }
}
"@
        Add-Content $globalsPath $css
        Write-Host "  Added .dash-page CSS to globals.css" -ForegroundColor Green
    } else {
        Write-Host "  globals.css already has .dash-page" -ForegroundColor Yellow
    }
} else {
    Write-Host "  globals.css not found — creating..." -ForegroundColor Yellow
    $css = ".dash-page { padding: 32px 36px 48px; min-height: 100%; background: #07070e; }"
    Set-Content $globalsPath $css
}

# 2. Function to add dash-page to a page file
function Fix-Page($srcFile, $destFile) {
    if (-not (Test-Path $srcFile)) { return }
    $content = Get-Content $srcFile -Raw
    
    # Skip if already fixed
    if ($content -match "dash-page") {
        Write-Host "  Already fixed: $(Split-Path $destFile -Leaf)" -ForegroundColor Yellow
        return
    }
    
    # Add dash-page class to first div after DashboardLayout
    $fixed = $content -replace '(<DashboardLayout[^>]*>\s*\r?\n\s*)(<div className=")', '$1<div className="dash-page '
    
    if ($fixed -ne $content) {
        # Ensure destination directory exists
        $dir = Split-Path $destFile -Parent
        if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
        Set-Content $destFile $fixed -NoNewline
        Write-Host "  Fixed: $(Split-Path $destFile -Leaf)" -ForegroundColor Green
    }
}

# 3. Copy all fixed page files
$outputsDir = "$env:USERPROFILE\Downloads"
$pages = @(
    @{ src="abandoned-carts-page.tsx";    dest="frontend\src\app\dashboard\abandoned-carts\page.tsx" },
    @{ src="affiliates-page.tsx";         dest="frontend\src\app\dashboard\affiliates\page.tsx" },
    @{ src="api-keys-page.tsx";           dest="frontend\src\app\dashboard\api-keys\page.tsx" },
    @{ src="coupons-page.tsx";            dest="frontend\src\app\dashboard\coupons\page.tsx" },
    @{ src="discounts-page.tsx";          dest="frontend\src\app\dashboard\discounts\page.tsx" },
    @{ src="flash-sales-page.tsx";        dest="frontend\src\app\dashboard\flash-sales\page.tsx" },
    @{ src="gift-cards-page.tsx";         dest="frontend\src\app\dashboard\gift-cards\page.tsx" },
    @{ src="group-buys-page.tsx";         dest="frontend\src\app\dashboard\group-buys\page.tsx" },
    @{ src="notifications-page.tsx";      dest="frontend\src\app\dashboard\notifications\page.tsx" },
    @{ src="reviews-page.tsx";            dest="frontend\src\app\dashboard\reviews\page.tsx" },
    @{ src="settings-page.tsx";           dest="frontend\src\app\dashboard\settings\page.tsx" },
    @{ src="shipping-page.tsx";           dest="frontend\src\app\dashboard\shipping\page.tsx" },
    @{ src="suppliers-page.tsx";          dest="frontend\src\app\dashboard\suppliers\page.tsx" },
    @{ src="supplier-assignment-page.tsx";dest="frontend\src\app\dashboard\supplier-assignment\page.tsx" },
    @{ src="webhooks-page.tsx";           dest="frontend\src\app\dashboard\webhooks\page.tsx" },
    @{ src="DashboardLayout.tsx";         dest="frontend\src\components\layout\DashboardLayout.tsx" }
)

foreach ($p in $pages) {
    # Try Downloads folder first, then current dir
    $srcPath = Join-Path $outputsDir $p.src
    if (-not (Test-Path $srcPath)) { $srcPath = $p.src }
    if (Test-Path $srcPath) {
        $dir = Split-Path $p.dest -Parent
        if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
        Copy-Item $srcPath $p.dest -Force
        Write-Host "  Copied: $($p.src)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Done! Restart frontend to see changes." -ForegroundColor Green
Write-Host "  cd frontend && npm run dev" -ForegroundColor White
