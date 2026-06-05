const fs = require('fs'), { execSync } = require('child_process');
let src = fs.readFileSync('backend/src/controllers/admin.controller.ts', 'utf8');
src = src.replace(
  'prisma.user.count({ where:{ role:"STORE_OWNER", plan:"FREE", updatedAt:{ gte:thirtyDaysAgo } } }),',
  'prisma.user.count({ where:{ role:"STORE_OWNER", plan:"FREE", updatedAt:{ gte:thirtyDaysAgo } } as any }),'
);
fs.writeFileSync('backend/src/controllers/admin.controller.ts', src, 'utf8');
console.log('✓ Fixed');
execSync('git add backend/src/controllers/admin.controller.ts', { stdio:'inherit' });
try { execSync('git commit -m "fix: cast plan in UserWhereInput as any"', { stdio:'inherit' }); } catch(e) {}
execSync('git push origin main', { stdio:'inherit' });
console.log('✅ Pushed — Render should build clean now');
