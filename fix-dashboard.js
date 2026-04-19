// fix-dashboard.js
// Run from project root: node fix-dashboard.js
// Fixes all dashboard page.tsx files that have syntax errors after DashboardLayout removal

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DASH = path.join('frontend', 'src', 'app', 'dashboard');

console.log('\n🔧 DropOS — Dashboard Fix\n' + '='.repeat(40));

// Get all page.tsx files recursively
function getAllPages(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...getAllPages(full));
    } else if (item === 'page.tsx') {
      results.push(full);
    }
  }
  return results;
}

function fixFile(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Remove DashboardLayout import
  if (src.includes('DashboardLayout')) {
    src = src.replace(/^.*import\s+DashboardLayout\s+from\s+['"][^'"]+['"]\s*;?\r?\n/gm, '');
    // Remove opening tag
    src = src.replace(/^\s*<DashboardLayout[^>]*>\s*\r?\n/gm, '');
    // Remove closing tag
    src = src.replace(/^\s*<\/DashboardLayout>\s*\r?\n/gm, '');
    changed = true;
  }

  // 2. Fix multiple root elements — add fragment wrapper
  // Find: return ( then NON-fragment content
  const returnMatch = src.match(/return\s*\(\s*\n([\s\S]*)\n\s*\)\s*;?\s*\n?\}/);

  if (returnMatch) {
    const inner = returnMatch[1].trim();
    // Count top-level JSX elements — if inner has multiple roots, wrap
    const needsFragment = !inner.startsWith('<>') && !inner.startsWith('{/*');

    if (needsFragment) {
      // Replace return ( ... ) with return ( <> ... </> )
      src = src.replace(
        /(return\s*\()\s*\n([\s\S]*?)(\n\s*\);\s*\n\})/,
        (match, open, content, close) => {
          // Check if already has a single root element at top
          const lines = content.split('\n');
          const firstContentLine = lines.find(l => l.trim() && !l.trim().startsWith('//'));
          const lastContentLine = [...lines].reverse().find(l => l.trim() && !l.trim().startsWith('//'));

          // If multiple roots needed (has {condition && at root level)
          const hasConditionalAtRoot = lines.some(l =>
            l.match(/^\s*\{[^}]*&&/) ||
            l.match(/^\s*\{\/\*/)
          );

          if (hasConditionalAtRoot) {
            return `${open}\n    <>\n${content}\n    </>${close}`;
          }
          return match;
        }
      );
      changed = true;
    }
  }

  return { src, changed };
}

const pages = getAllPages(DASH);
let fixedCount = 0;

for (const page of pages) {
  try {
    const { src, changed } = fixFile(page);
    if (changed) {
      fs.writeFileSync(page, src, 'utf8');
      const rel = path.relative(DASH, path.dirname(page));
      console.log(`  ✅ Fixed: ${rel || 'overview'}`);
      fixedCount++;
    }
  } catch (e) {
    console.log(`  ⚠️  Skipped: ${page} (${e.message})`);
  }
}

console.log(`\n✅ ${fixedCount} files processed.\n`);

// Specifically patch known broken files
const knownBroken = [
  'api-keys', 'returns', 'webhooks', 'refunds',
  'subscriptions', 'discounts', 'gift-cards',
];

console.log('🔍 Patching known broken pages...\n');

for (const name of knownBroken) {
  const filePath = path.join(DASH, name, 'page.tsx');
  if (!fs.existsSync(filePath)) continue;

  let src = fs.readFileSync(filePath, 'utf8');
  const original = src;

  // Remove any leftover DashboardLayout
  src = src.replace(/^.*import\s+DashboardLayout.*\r?\n/gm, '');
  src = src.replace(/^\s*<DashboardLayout[^>]*>\s*\r?\n/gm, '');
  src = src.replace(/^\s*<\/DashboardLayout>\s*\r?\n/gm, '');

  // Check if return has multiple root-level elements
  // Simple heuristic: find return ( ... ) block and check for adjacent JSX roots
  const lines = src.split('\n');
  const returnIdx = lines.findIndex(l => /^\s*return\s*\(\s*$/.test(l));

  if (returnIdx >= 0) {
    // Find the closing ) of return
    let depth = 0;
    let closeIdx = -1;
    for (let i = returnIdx + 1; i < lines.length; i++) {
      const l = lines[i];
      // Count JSX parens/brackets depth (simplified)
      for (const ch of l) {
        if (ch === '(') depth++;
        if (ch === ')') {
          if (depth === 0) { closeIdx = i; break; }
          depth--;
        }
      }
      if (closeIdx >= 0) break;
    }

    if (closeIdx > returnIdx) {
      // Check if content between return ( and ) has a single root
      const contentLines = lines.slice(returnIdx + 1, closeIdx);
      const firstJSX = contentLines.find(l => l.trim().startsWith('<') && !l.trim().startsWith('</') && !l.trim().startsWith('<!--'));

      // Already has fragment
      if (firstJSX && firstJSX.trim().startsWith('<>')) {
        // Already wrapped
      } else {
        // Wrap with fragment
        lines.splice(returnIdx + 1, 0, '    <>');
        lines.splice(closeIdx + 1, 0, '    </>');
        src = lines.join('\n');
      }
    }
  }

  if (src !== original) {
    fs.writeFileSync(filePath, src, 'utf8');
    console.log(`  ✅ Patched: ${name}`);
  }
}

console.log('\n🚀 Pushing to GitHub...\n');

try {
  execSync('git add .', { stdio: 'inherit' });
  const status = execSync('git status --short').toString().trim();

  if (status) {
    execSync('git commit -m "fix: definitive dashboard page syntax fix"', { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('\n✅ Pushed! Vercel is building now.\n');
  } else {
    console.log('ℹ️  No changes to push.\n');
    console.log('Go to Vercel and click "Redeploy" on the latest commit.\n');
  }
} catch (e) {
  console.log('⚠️  Git error:', e.message);
}

console.log('Done! 🎉\n');
