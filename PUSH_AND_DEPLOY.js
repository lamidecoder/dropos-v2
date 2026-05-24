/**
 * DropOS — Master Deploy Script
 * Run from: dropos-v2/ directory
 * Command: node PUSH_AND_DEPLOY.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

function runCapture(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

console.log('\n🚀 DropOS Master Deploy\n');

// 1. Update vercel.json with fresh build ID
const vercelPath = 'frontend/vercel.json';
const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
vercel._buildId = Date.now();
fs.writeFileSync(vercelPath, JSON.stringify(vercel, null, 2));
console.log('✓ vercel.json updated');

// 2. Git commit and push
try {
  run('git add -A');
  const status = runCapture('git status --short');
  if (status) {
    run('git commit -m "deploy: force fresh Vercel build — all fixes included"');
    run('git push origin main');
    console.log('\n✅ Pushed to GitHub');
  } else {
    console.log('Nothing new to commit');
  }
} catch(e) {
  console.log('Git error:', e.message);
}

// 3. Deploy to Vercel
console.log('\n📦 Deploying to Vercel...');
try {
  process.chdir('frontend');
  run('vercel --prod --force');
  console.log('\n✅ Deployed! droposhq.com should be live in ~30 seconds');
} catch(e) {
  console.log('\n❌ Vercel deploy error:', e.message);
  console.log('\nTry manually:');
  console.log('  cd frontend');
  console.log('  vercel --prod --force');
}
