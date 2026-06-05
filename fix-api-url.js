const fs = require('fs'), { execSync } = require('child_process');

const RENDER = 'https://dropos-v2.onrender.com/api';
let src = fs.readFileSync('frontend/src/lib/api.ts', 'utf8');

// Replace ALL localhost fallbacks
const before = (src.match(/localhost/g)||[]).length;
src = src.replace(
  /process\.env\.NEXT_PUBLIC_API_URL \|\| "http:\/\/localhost:5000\/api"/g,
  `process.env.NEXT_PUBLIC_API_URL || "${RENDER}"`
);
const after = (src.match(/localhost/g)||[]).length;

fs.writeFileSync('frontend/src/lib/api.ts', src, 'utf8');
console.log(`✓ Replaced ${before - after} localhost references with Render URL`);

execSync('git add frontend/src/lib/api.ts', { stdio:'inherit' });
try {
  execSync('git commit -m "fix: use Render URL as fallback instead of localhost — fixes production data loading"', { stdio:'inherit' });
} catch(e) { console.log('(already committed)'); }
execSync('git push origin main', { stdio:'inherit' });
console.log('\n✅ Pushed to GitHub');
console.log('\n── Now do this in Vercel ──────────────────────────────');
console.log('1. vercel.com → your project → Settings → Environment Variables');
console.log('2. Add: NEXT_PUBLIC_API_URL = https://dropos-v2.onrender.com/api');
console.log('3. Deployments → Redeploy latest');
console.log('────────────────────────────────────────────────────────');

// Also try direct Vercel deploy
try {
  process.chdir('frontend');
  execSync('vercel --prod --force --yes', { stdio:'inherit' });
  console.log('\n🚀 Vercel deployed!');
} catch(e) {
  console.log('\n⚠ Run manually: cd frontend && vercel --prod --force');
}
