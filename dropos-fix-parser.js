const { execSync } = require('child_process');
try {
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('\n✅ Pushed. Deploying in ~2 minutes.');
} catch(e) { console.log('Error:', e.message); }
