# fix-schema.ps1
# Run from project root: .\fix-schema.ps1

Write-Host "Fixing Prisma schema..." -ForegroundColor Cyan

$schemaPath = "backend\prisma\schema.prisma"

if (-not (Test-Path $schemaPath)) {
  Write-Host "ERROR: Cannot find $schemaPath" -ForegroundColor Red
  exit
}

$schema = Get-Content $schemaPath -Raw

# 1. Add integrations to Store model if missing
if ($schema -notmatch "integrations\s+StoreIntegration") {
  # Add the line right before the closing brace of Store model
  $schema = $schema -replace "(model Store \{(?:[^}]|\}(?![\s\S]*model ))*?)(\n\})", '$1  integrations    StoreIntegration[]$2'
  Write-Host "  Added integrations to Store model" -ForegroundColor Green
} else {
  Write-Host "  Store already has integrations (skipping)" -ForegroundColor Yellow
}

# 2. Add StoreIntegration model if missing
if ($schema -notmatch "model StoreIntegration") {
  $newModel = "`n`nmodel StoreIntegration {`n  id           String    @id @default(cuid())`n  storeId      String`n  store        Store     @relation(fields: [storeId], references: [id], onDelete: Cascade)`n  provider     String`n  email        String?`n  password     String?`n  accessToken  String?   @db.Text`n  refreshToken String?`n  expiresAt    DateTime?`n  isActive     Boolean   @default(true)`n  createdAt    DateTime  @default(now())`n  updatedAt    DateTime  @updatedAt`n`n  @@unique([storeId, provider], name: `"storeId_provider`")`n  @@index([storeId])`n}"
  $schema = $schema + $newModel
  Write-Host "  Added StoreIntegration model" -ForegroundColor Green
} else {
  Write-Host "  StoreIntegration already exists (skipping)" -ForegroundColor Yellow
}

# 3. Save schema
Set-Content $schemaPath $schema -NoNewline
Write-Host "  Schema saved" -ForegroundColor Green

# 4. Run migration
Write-Host ""
Write-Host "Running migration..." -ForegroundColor Cyan
Set-Location backend
npx prisma migrate dev --name add_store_integrations
npx prisma generate
Set-Location ..

Write-Host ""
Write-Host "ALL DONE - errors should be gone now!" -ForegroundColor Green
