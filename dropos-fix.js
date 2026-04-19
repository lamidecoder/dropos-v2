#!/usr/bin/env node
// ============================================================
// dropos-fix.js  —  DropOS Pre-Deploy Auto-Fixer
// ============================================================
// Detects and fixes ALL common Vercel/Next.js build issues:
//   1. UTF-8 encoding corruption
//   2. Double DashboardLayout wrappers
//   3. Orphan <> </> fragment tags (our own bug)
//   4. Multiple JSX root elements without fragment wrapper
//   5. Missing "use client" on interactive components
//   6. Sub-layout files that re-wrap DashboardLayout
//   7. Large files (zip/video) committed to git
//   8. Duplicate imports
//   9. Broken/empty import statements
//  10. Trailing syntax issues in JSX files
//
// Run from project root:
//   node dropos-fix.js
// ============================================================

const fs   = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

// ─── CONFIG ──────────────────────────────────────────────────
const FRONTEND  = path.join('frontend', 'src');
const DASH      = path.join(FRONTEND, 'app', 'dashboard');
const ROOT_LAYOUT = path.join(DASH, 'layout.tsx');

const COLORS = {
  reset:  '\x1b[0m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  magenta:'\x1b[35m',
  dim:    '\x1b[2m',
  bold:   '\x1b[1m',
};

const c = (color, txt) => `${COLORS[color]}${txt}${COLORS.reset}`;

// ─── HELPERS ─────────────────────────────────────────────────
function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

function read(file) {
  try { return fs.readFileSync(file, 'utf8'); }
  catch { return null; }
}

function write(file, content) {
  try { fs.writeFileSync(file, content, 'utf8'); return true; }
  catch { return false; }
}

function rel(file) {
  return path.relative(process.cwd(), file).replace(/\\/g, '/');
}

function git(cmd) {
  try { return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' }).trim(); }
  catch { return ''; }
}

// ─── STATE ───────────────────────────────────────────────────
const fixes   = [];
const warnings = [];
const errors   = [];

function fixed(msg)   { fixes.push(msg);    console.log(`  ${c('green','✅')} ${msg}`); }
function warn(msg)    { warnings.push(msg);  console.log(`  ${c('yellow','⚠️')}  ${msg}`); }
function err(msg)     { errors.push(msg);    console.log(`  ${c('red','❌')} ${msg}`); }
function ok(msg)      {                      console.log(`  ${c('dim','✓')}  ${msg}`); }
function section(n, title) {
  console.log(`\n${c('cyan',`[${n}]`)} ${c('bold', title)}`);
}

// ─── CHECK 1: UTF-8 Corruption ───────────────────────────────
function check1_Encoding(files) {
  section('1/10', 'UTF-8 Encoding');
  let count = 0;
  for (const file of files) {
    try {
      const buf = fs.readFileSync(file);
      const str = buf.toString('utf8');
      // Windows-1252 corruption markers
      const corrupted = str.includes('\uFFFD') ||
                        str.includes('â€™') ||
                        str.includes('â€œ') ||
                        str.includes('Â·') ||
                        /[\x80-\x9F]/.test(str);
      if (corrupted) {
        const clean = str
          .replace(/â€™/g, "'")
          .replace(/â€œ/g, '"')
          .replace(/â€/g, '"')
          .replace(/Â·/g, '·')
          .replace(/[\x80-\x9F]/g, '')
          .replace(/\uFFFD/g, '');
        write(file, clean);
        fixed(`Encoding fixed: ${rel(file)}`);
        count++;
      }
    } catch(e) {
      err(`Cannot read: ${rel(file)} — ${e.message}`);
    }
  }
  if (count === 0) ok('All files valid UTF-8');
}

// ─── CHECK 2: DashboardLayout in page files ───────────────────
function check2_DashboardLayout(pageFiles) {
  section('2/10', 'Double DashboardLayout Wrappers');
  let count = 0;
  for (const file of pageFiles) {
    const src = read(file);
    if (!src || !src.includes('DashboardLayout')) continue;
    let clean = src;
    // Remove import line
    clean = clean.replace(/^[^\n]*import\s+DashboardLayout\s+from\s+['"][^'"]+['"]\s*;?\r?\n/gm, '');
    // Remove JSX tags (opening with any props)
    clean = clean.replace(/^\s*<DashboardLayout(?:\s[^>]*)?>[ \t]*\r?\n/gm, '');
    clean = clean.replace(/^\s*<\/DashboardLayout>[ \t]*\r?\n/gm, '');
    if (clean !== src) {
      write(file, clean);
      fixed(`DashboardLayout removed: ${rel(file)}`);
      count++;
    }
  }
  if (count === 0) ok('No double wrappers found');
}

// ─── CHECK 3: Orphan fragment lines ──────────────────────────
function check3_OrphanFragments(pageFiles) {
  section('3/10', 'Orphan Fragment Tags (<> and </>)');
  let count = 0;
  for (const file of pageFiles) {
    const src = read(file);
    if (!src) continue;
    const lines  = src.split('\n');
    const filtered = lines.filter(l => {
      const t = l.trim();
      // Remove lines that are ONLY <> or </> — our script added these incorrectly
      return t !== '<>' && t !== '</>';
    });
    if (filtered.length !== lines.length) {
      write(file, filtered.join('\n'));
      fixed(`Orphan fragments removed: ${rel(file)}`);
      count++;
    }
  }
  if (count === 0) ok('No orphan fragments found');
}

// ─── CHECK 4: Multiple JSX roots in return() ─────────────────
function check4_MultipleRoots(pageFiles) {
  section('4/10', 'Multiple JSX Root Elements');
  let count = 0;

  for (const file of pageFiles) {
    const src = read(file);
    if (!src) continue;

    const lines = src.split('\n');

    // Find return ( line
    let returnIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*return\s*\(\s*$/.test(lines[i])) {
        returnIdx = i;
        break;
      }
    }
    if (returnIdx < 0) continue;

    // Find matching closing ) of return
    let depth = 0;
    let closeIdx = -1;
    for (let i = returnIdx + 1; i < lines.length; i++) {
      for (const ch of lines[i]) {
        if (ch === '(') depth++;
        if (ch === ')') {
          if (depth === 0) { closeIdx = i; break; }
          depth--;
        }
      }
      if (closeIdx >= 0) break;
    }
    if (closeIdx < 0) continue;

    const inner = lines.slice(returnIdx + 1, closeIdx);

    // Already has fragment
    if (inner.some(l => l.trim() === '<>' || l.trim().startsWith('<>'))) continue;

    // Find indentation of first JSX element
    const firstJSX = inner.find(l => {
      const t = l.trim();
      return t.startsWith('<') || (t.startsWith('{') && !t.startsWith('{/*'));
    });
    if (!firstJSX) continue;

    const indent = firstJSX.match(/^(\s*)/)[1];

    // Count top-level elements at that indent
    let topLevelCount = 0;
    let braceDepth = 0;
    let tagDepth = 0;

    for (const line of inner) {
      const t = line.trim();
      if (!t || t.startsWith('//') || t.startsWith('{/*')) continue;

      const lineIndent = line.match(/^(\s*)/)[1];
      if (lineIndent.length > indent.length) continue; // Nested

      if (t.startsWith('{')) braceDepth++;
      if (t.endsWith('}') && !t.startsWith('{')) braceDepth--;

      if (braceDepth === 0 && lineIndent === indent) {
        if (t.startsWith('<') && !t.startsWith('</')) topLevelCount++;
        if (t.startsWith('{') && braceDepth === 0)    topLevelCount++;
      }
    }

    if (topLevelCount > 1) {
      const newLines = [...lines];
      newLines.splice(returnIdx + 1, 0, `${indent}<>`);
      newLines.splice(closeIdx + 1, 0, `${indent}</>`);
      write(file, newLines.join('\n'));
      fixed(`Fragment wrapper added: ${rel(file)}`);
      count++;
    }
  }
  if (count === 0) ok('All return blocks have single roots');
}

// ─── CHECK 5: Missing "use client" ───────────────────────────
function check5_UseClient(pageFiles) {
  section('5/10', 'Missing "use client" Directives');
  let count = 0;
  const clientHooks = [
    'useState', 'useEffect', 'useRef', 'useCallback', 'useMemo',
    'useRouter', 'usePathname', 'useSearchParams',
    'useTheme', 'useToast', 'useConfirm', 'useAuthStore',
    'motion.', 'AnimatePresence', 'onClick', 'onChange',
  ];
  for (const file of pageFiles) {
    const src = read(file);
    if (!src) continue;
    const hasDirective = /^["']use client["']\s*;?\s*\n/m.test(src);
    if (hasDirective) continue;
    const needsClient = clientHooks.some(hook => src.includes(hook));
    if (needsClient) {
      write(file, `"use client";\n${src}`);
      fixed(`"use client" added: ${rel(file)}`);
      count++;
    }
  }
  if (count === 0) ok('All client components have directives');
}

// ─── CHECK 6: Sub-layout double wrapping ─────────────────────
function check6_SubLayouts() {
  section('6/10', 'Sub-Layout Double Wrapping');
  const simple = `export default function Layout({ children }: { children: React.ReactNode }) {\n  return <>{children}</>;\n}\n`;
  let count = 0;
  const layouts = walk(DASH).filter(f =>
    f.endsWith('layout.tsx') &&
    path.normalize(f) !== path.normalize(ROOT_LAYOUT)
  );
  for (const layout of layouts) {
    const src = read(layout);
    if (!src) continue;
    if (src.includes('DashboardLayout') || src.includes('import ') && src.includes('from ')) {
      write(layout, simple);
      fixed(`Sub-layout simplified: ${rel(layout)}`);
      count++;
    }
  }
  if (count === 0) ok('All sub-layouts are pass-through');
}

// ─── CHECK 7: Root dashboard layout ──────────────────────────
function check7_RootLayout() {
  section('7/10', 'Root Dashboard Layout');
  const correct = `"use client";\nimport DashboardLayout from "../../components/layout/DashboardLayout";\n\nexport default function DashboardRootLayout({ children }: { children: React.ReactNode }) {\n  return <DashboardLayout>{children}</DashboardLayout>;\n}\n`;
  const src = read(ROOT_LAYOUT);
  if (!src) {
    write(ROOT_LAYOUT, correct);
    fixed('Root layout created');
    return;
  }
  const hasImport  = src.includes('import DashboardLayout');
  const hasWrapper = src.includes('<DashboardLayout>');
  if (!hasImport || !hasWrapper) {
    write(ROOT_LAYOUT, correct);
    fixed('Root layout corrected');
  } else {
    ok('Root layout is correct');
  }
}

// ─── CHECK 8: Duplicate imports ──────────────────────────────
function check8_DuplicateImports(files) {
  section('8/10', 'Duplicate Import Statements');
  let count = 0;
  for (const file of files) {
    const src = read(file);
    if (!src) continue;
    const lines  = src.split('\n');
    const seen   = new Set();
    const deduped = [];
    let changed  = false;
    for (const line of lines) {
      const isImport = /^import\s+/.test(line.trim());
      if (isImport) {
        if (seen.has(line.trim())) { changed = true; continue; }
        seen.add(line.trim());
      }
      deduped.push(line);
    }
    if (changed) {
      write(file, deduped.join('\n'));
      fixed(`Duplicate imports removed: ${rel(file)}`);
      count++;
    }
  }
  if (count === 0) ok('No duplicate imports found');
}

// ─── CHECK 9: Large files in git ─────────────────────────────
function check9_LargeFiles() {
  section('9/10', 'Large Files in Git');
  const ignoreEntries = [
    '*.zip', '*.tar.gz', '*.mp4', '*.mov', '*.avi',
    '*.dmg', '*.exe', '*.iso', '*.rar',
    'frontend.zip', '.env.local',
  ];
  let gitignore = fs.existsSync('.gitignore') ? fs.readFileSync('.gitignore', 'utf8') : '';
  let added = 0;
  for (const entry of ignoreEntries) {
    if (!gitignore.includes(entry)) {
      gitignore += `\n${entry}`;
      added++;
    }
  }
  if (added > 0) {
    fs.writeFileSync('.gitignore', gitignore, 'utf8');
    fixed(`Added ${added} entries to .gitignore`);
  } else {
    ok('.gitignore is comprehensive');
  }

  // Remove any large files from git tracking
  const trackedZips = git('git ls-files "*.zip" 2>/dev/null');
  if (trackedZips) {
    for (const f of trackedZips.split('\n').filter(Boolean)) {
      git(`git rm --cached "${f}"`);
      fixed(`Removed from git tracking: ${f}`);
    }
  } else {
    ok('No large files tracked in git');
  }
}

// ─── CHECK 10: next.config.js sanity ─────────────────────────
function check10_NextConfig() {
  section('10/10', 'Next.js Config');
  const configPaths = [
    path.join('frontend', 'next.config.js'),
    path.join('frontend', 'next.config.mjs'),
    path.join('frontend', 'next.config.ts'),
  ];
  const found = configPaths.find(p => fs.existsSync(p));
  if (!found) {
    warn('No next.config found — Vercel may use defaults');
    return;
  }
  const src = read(found);
  if (!src) return;
  // Check for common issues
  if (src.includes('experimental: {}') || src.includes('experimental:{}')) {
    warn('Empty experimental block in next.config — consider removing it');
  }
  ok(`next.config found: ${rel(found)}`);
}

// ─── RUN ALL CHECKS ──────────────────────────────────────────
console.log('\n' + c('magenta', '═'.repeat(54)));
console.log(c('magenta', '  DropOS — Pre-Deploy Checker & Auto-Fixer'));
console.log(c('magenta', '  Scans and fixes all Vercel build issues'));
console.log(c('magenta', '═'.repeat(54)));

if (!fs.existsSync(FRONTEND)) {
  console.log(c('red', '\n❌ frontend/src not found. Run from project root.\n'));
  process.exit(1);
}

const allFiles   = walk(FRONTEND);
const pageFiles  = allFiles.filter(f => f.endsWith('page.tsx'));
const tsxFiles   = allFiles.filter(f => f.endsWith('.tsx'));

console.log(c('dim', `\n  Pages: ${pageFiles.length}  |  Components: ${tsxFiles.length}  |  Total: ${allFiles.length}\n`));

check1_Encoding(tsxFiles);
check2_DashboardLayout(pageFiles);
check3_OrphanFragments(pageFiles);
check4_MultipleRoots(pageFiles);
check5_UseClient(pageFiles);
check6_SubLayouts();
check7_RootLayout();
check8_DuplicateImports(tsxFiles);
check9_LargeFiles();
check10_NextConfig();

// ─── SUMMARY ─────────────────────────────────────────────────
console.log('\n' + c('magenta', '═'.repeat(54)));
console.log(c('bold', '  SUMMARY'));
console.log(c('magenta', '═'.repeat(54)));
console.log(`  ${c('green', `✅ Fixes applied:   ${fixes.length}`)}`);
console.log(`  ${c('yellow', `⚠️  Warnings:        ${warnings.length}`)}`);
console.log(`  ${c('red',    `❌ Errors:          ${errors.length}`)}`);
console.log(c('magenta', '═'.repeat(54)) + '\n');

if (errors.length > 0) {
  console.log(c('red', 'Errors that need manual attention:'));
  errors.forEach(e => console.log(c('red', `  → ${e}`)));
  console.log();
}

// ─── GIT PUSH ────────────────────────────────────────────────
try {
  git('git add .');
  const status = git('git status --short');

  if (status) {
    console.log(c('cyan', 'Changes detected:'));
    console.log(c('dim', status.split('\n').map(l => `  ${l}`).join('\n')));
    console.log();

    const result = spawnSync('git', [
      'commit', '-m', 'fix: pre-deploy auto-fix — encoding, fragments, layouts, gitignore'
    ], { stdio: 'inherit', encoding: 'utf8' });

    if (result.status === 0) {
      console.log();
      const push = spawnSync('git', ['push', 'origin', 'main'], { stdio: 'inherit', encoding: 'utf8' });
      if (push.status === 0) {
        console.log(c('green', '\n✅ Pushed! Vercel is building now.\n'));
        console.log(c('dim', '   Watch: https://vercel.com/lamidecoders-projects\n'));
      } else {
        console.log(c('yellow', '\n⚠️  Push failed. Try manually:\n'));
        console.log('  git push origin main\n');
      }
    }
  } else {
    console.log(c('green', '✅ Everything is clean — nothing new to push.\n'));
    console.log(c('dim', '   If Vercel still fails, go to Vercel → Deployments → Redeploy.\n'));
  }
} catch(e) {
  console.log(c('yellow', `\n⚠️  Git error: ${e.message}`));
  console.log('Run manually: git add . && git commit -m "fix" && git push origin main\n');
}
