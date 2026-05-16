const { execSync } = require('child_process');
try {
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('\n✅ All KIRO Commerce OS features pushed. Render + Vercel deploying now.');
  console.log('\nWhat just deployed:');
  console.log('  • kai.brain.ts — Store Brain (momentum, events, risks, priorities, multi-step goals)');
  console.log('  • kai.actions.ts — Action intelligence (human descriptions, pre-validation, error translation)');
  console.log('  • kai.context.ts — Deep business context (8 DB tables, velocity scoring)');
  console.log('  • kai.intelligence.ts — Master prompt (brain data, growth playbooks, action orchestration)');
  console.log('  • kai.locale.ts — 14 countries with deep market intelligence');
} catch(e) {
  console.log('Push error:', e.message);
  console.log('\nRun manually: git push origin main');
}
