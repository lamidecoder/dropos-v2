/**
 * Force Vercel to deploy by making an empty commit + deploying directly
 * Run from: dropos-v2/ directory
 */
const { execSync } = require('child_process');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

// 1. Empty commit to trigger any git-based hooks
run('git commit --allow-empty -m "chore: force Vercel redeploy"');
run('git push origin main');

// 2. Deploy directly from CLI — bypasses Vercel's git integration entirely
console.log('\nDeploying directly to Vercel...');
process.chdir('frontend');
run('vercel --prod --force');

console.log('\n✅ Done — droposhq.com should be live in ~2 minutes');
