const { execSync } = require('child_process');

console.log('Commits to push:');
try {
  const unpushed = execSync('git log origin/main..HEAD --oneline', { encoding: 'utf8' });
  console.log(unpushed || '  (none)');
} catch(e) {}

try {
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('\n✅ Pushed! Now run:\n  cd frontend && vercel --prod --force');
} catch(e) {
  console.error('Push failed:', e.message);
}
