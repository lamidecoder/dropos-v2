# setup-waitlist.ps1
# Run from project root: .\setup-waitlist.ps1

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
Write-Host ""
Write-Host "Setting up DropOS Waitlist..." -ForegroundColor Cyan
Write-Host ""

$dl = "$env:USERPROFILE\Downloads"

# 1. Backend controller
$dest = "backend\src\controllers\waitlist.controller.ts"
if (Test-Path "$dl\waitlist.controller.ts") {
    Copy-Item "$dl\waitlist.controller.ts" $dest -Force
    Write-Host "  [OK] waitlist.controller.ts" -ForegroundColor Green
} else { Write-Host "  [SKIP] waitlist.controller.ts not found in Downloads" -ForegroundColor Yellow }

# 2. Backend routes
$dest2 = "backend\src\routes\waitlist.routes.ts"
if (Test-Path "$dl\waitlist.routes.ts") {
    Copy-Item "$dl\waitlist.routes.ts" $dest2 -Force
    Write-Host "  [OK] waitlist.routes.ts" -ForegroundColor Green
} else { Write-Host "  [SKIP] waitlist.routes.ts not found in Downloads" -ForegroundColor Yellow }

# 3. Frontend waitlist page as HOMEPAGE
$dest3 = "frontend\src\app\page.tsx"
if (Test-Path "$dl\waitlist-page.tsx") {
    # Backup the original homepage first
    if (Test-Path $dest3) {
        Copy-Item $dest3 "frontend\src\app\page.tsx.bak" -Force
        Write-Host "  [OK] Backed up original page.tsx to page.tsx.bak" -ForegroundColor Gray
    }
    Copy-Item "$dl\waitlist-page.tsx" $dest3 -Force
    Write-Host "  [OK] waitlist-page.tsx → frontend/src/app/page.tsx (homepage)" -ForegroundColor Green
} else { Write-Host "  [SKIP] waitlist-page.tsx not found in Downloads" -ForegroundColor Yellow }

# 4. Admin waitlist page
New-Item -ItemType Directory -Force -Path "frontend\src\app\admin\waitlist" | Out-Null
if (Test-Path "$dl\admin-waitlist-page.tsx") {
    Copy-Item "$dl\admin-waitlist-page.tsx" "frontend\src\app\admin\waitlist\page.tsx" -Force
    Write-Host "  [OK] admin-waitlist-page.tsx" -ForegroundColor Green
}

Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Add to backend\prisma\schema.prisma (schema in waitlist-schema.prisma file)"
Write-Host "  2. Run: cd backend && npx prisma migrate dev --name add_waitlist"
Write-Host "  3. Add to backend\src\app.ts:"
Write-Host "       import waitlistRoutes from './routes/waitlist.routes';"
Write-Host "       app.use('/api/waitlist', waitlistRoutes);"
Write-Host "  4. Restart backend: npm run dev"
Write-Host "  5. Visit: http://localhost:3000"
Write-Host ""
Write-Host "Done!" -ForegroundColor Green
