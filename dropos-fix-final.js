// dropos-fix-final.js
// Fixes EVERY file that has return( followed by {/* comment */} or multiple roots
// node dropos-fix-final.js

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SRC = path.join('frontend', 'src');

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) out.push(...walk(full));
    else if (f.name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

function fixFile(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');
  const original = src;

  // Step 1: Remove DashboardLayout import + tags
  src = src.replace(/^[^\n]*import\s+DashboardLayout[^\n]*\n/gm, '');
  src = src.replace(/^\s*<DashboardLayout[^>]*>[ \t]*\n/gm, '');
  src = src.replace(/^\s*<\/DashboardLayout>[ \t]*\n/gm, '');

  // Step 2: Remove orphan <> and </> lines our scripts added
  const lines = src.split('\n');
  const cleaned = lines.filter(l => l.trim() !== '<>' && l.trim() !== '</>');
  src = cleaned.join('\n');

  // Step 3: Find return ( and check what's inside
  const allLines = src.split('\n');
  let returnIdx = -1;
  for (let i = 0; i < allLines.length; i++) {
    if (/^\s*return\s*\(\s*$/.test(allLines[i])) {
      returnIdx = i;
      break;
    }
  }

  if (returnIdx >= 0) {
    // Find closing ) of return via paren depth
    let depth = 0;
    let closeIdx = -1;
    for (let i = returnIdx + 1; i < allLines.length; i++) {
      for (const ch of allLines[i]) {
        if (ch === '(') depth++;
        if (ch === ')') {
          if (depth === 0) { closeIdx = i; break; }
          depth--;
        }
      }
      if (closeIdx >= 0) break;
    }

    if (closeIdx > returnIdx) {
      const inner = allLines.slice(returnIdx + 1, closeIdx);

      // Find first non-empty line
      const firstLine = inner.find(l => l.trim().length > 0);

      if (firstLine) {
        const firstTrimmed = firstLine.trim();
        const alreadyWrapped = firstTrimmed === '<>' || firstTrimmed.startsWith('<>');

        // NEEDS WRAP if:
        // A) Starts with a JSX comment {/*
        // B) Multiple root elements at same indent level
        const startsWithComment = firstTrimmed.startsWith('{/*');
        const baseIndent = firstLine.match(/^(\s*)/)[1];

        // Count root-level elements
        let rootCount = 0;
        let pdepth = 0;
        let bdepth = 0;
        for (const line of inner) {
          if (!line.trim()) continue;
          const indent = line.match(/^(\s*)/)[1];
          if (indent.length > baseIndent.length) continue;
          const t = line.trim();
          // Opening JSX tag or JS expression at root level
          if ((t.startsWith('<') && !t.startsWith('</') && !t.startsWith('<!--')) ||
              (t.startsWith('{') && !t.startsWith('{/') && !t.startsWith('{/*'))) {
            rootCount++;
          }
        }

        const needsWrap = !alreadyWrapped && (startsWithComment || rootCount > 1);

        if (needsWrap) {
          const newLines = [...allLines];
          newLines.splice(returnIdx + 1, 0, `${baseIndent}<>`);
          newLines.splice(closeIdx + 1, 0, `${baseIndent}</>`);
          src = newLines.join('\n');
        }
      }
    }
  }

  if (src !== original) {
    fs.writeFileSync(filePath, src, 'utf8');
    return true;
  }
  return false;
}

// Run on all TSX files in entire frontend/src
console.log('\n DropOS Final Fix');
console.log('='.repeat(40));

if (!fs.existsSync(SRC)) {
  console.log('ERROR: frontend/src not found. Run from project root.');
  process.exit(1);
}

const files = walk(SRC).filter(f => f.endsWith('.tsx'));
console.log(`\nScanning ${files.length} files...\n`);

let fixed = 0;
for (const file of files) {
  try {
    const wasFixed = fixFile(file);
    if (wasFixed) {
      console.log(`  OK  ${path.relative(SRC, file)}`);
      fixed++;
    }
  } catch (e) {
    console.log(`  ERR ${path.relative(SRC, file)}: ${e.message}`);
  }
}

console.log(`\nFixed: ${fixed} files\n`);

// Push
spawnSync('git', ['add', '.'], { stdio: 'inherit' });
const status = spawnSync('git', ['status', '--short'], { encoding: 'utf8' }).stdout.trim();

if (status) {
  console.log('Pushing...\n');
  spawnSync('git', ['commit', '-m', 'fix: fragment wrappers for all broken pages'], { stdio: 'inherit' });
  const push = spawnSync('git', ['push', 'origin', 'main'], { stdio: 'inherit' });
  if (push.status === 0) {
    console.log('\nPUSHED. Watch Vercel build now.\n');
  } else {
    console.log('\nPush failed. Run: git push origin main\n');
  }
} else {
  console.log('Nothing to push. Already clean.\n');
}
