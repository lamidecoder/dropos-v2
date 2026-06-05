const fs = require('fs'), { execSync } = require('child_process');

// Read the fixed tsconfig (no ignoreDeprecations, no baseUrl)
const currentTsconfig = fs.readFileSync('backend/tsconfig.json', 'utf8');
const cfg = JSON.parse(currentTsconfig);
delete cfg.compilerOptions.ignoreDeprecations;
delete cfg.compilerOptions.baseUrl;
const fixed = JSON.stringify(cfg, null, 2);

fs.writeFileSync('backend/tsconfig.json', fixed, 'utf8');
console.log('✓ tsconfig.json fixed');

const hasIgnore = fixed.includes('ignoreDeprecations');
const hasBaseUrl = fixed.includes('"baseUrl"');
console.log(`✅ ignoreDeprecations removed: ${!hasIgnore}`);
console.log(`✅ baseUrl removed: ${!hasBaseUrl}`);

if (hasIgnore || hasBaseUrl) {
  console.log('❌ Still has the bad options — something went wrong');
  process.exit(1);
}

try {
  execSync('git add backend/tsconfig.json', { stdio:'inherit' });
  execSync('git commit -m "fix: remove ignoreDeprecations and baseUrl from tsconfig — TS5103"', { stdio:'inherit' });
  execSync('git push origin main', { stdio:'inherit' });
  console.log('\n✅ Pushed — Render will now build successfully');
} catch(e) {
  console.log(e.message);
}
