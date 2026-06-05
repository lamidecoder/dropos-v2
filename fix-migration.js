const fs = require('fs'), path = require('path'), { execSync } = require('child_process');

// Create the missing migration
const dir = 'backend/prisma/migrations/20260605_add_bank_account_fields';
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'migration.sql'), `-- Add missing columns to stores table
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "bankName"          TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "bankCode"          TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "accountNumber"     TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "accountName"       TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "paystackSubCode"   TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "paystackPublicKey" TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "paystackSecretKey" TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "announcement"      TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "instagram"         TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "tiktok"            TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "facebook"          TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "twitter"           TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "templateId"        TEXT;
`);
console.log('✓ Migration file created');

execSync('git add backend/prisma/migrations/', { stdio: 'inherit' });
try {
  execSync('git commit -m "fix: add missing bank account migration — fixes stores 500 error"', { stdio: 'inherit' });
} catch(e) { console.log('(already committed)'); }
execSync('git push origin main', { stdio: 'inherit' });
console.log('\n✅ Pushed! Render will run the migration and redeploy.');
console.log('Wait ~2 minutes then refresh your dashboard.');
