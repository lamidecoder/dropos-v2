// dropos-fix.js  —  Full Project Pre-Deploy Fixer
// Scans ALL pages across the entire frontend
// Run: node dropos-fix.js

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SRC = path.join('frontend', 'src');

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) out.push(...walk(full));
    else if (f.name.endsWith('.tsx') || f.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

function read(f)       { try { return fs.readFileSync(f, 'utf8'); } catch { return null; } }
function write(f, txt) { try { fs.writeFileSync(f, txt, 'utf8'); return true; } catch { return false; } }
function rel(f)        { return path.relative(process.cwd(), f).replace(/\\/g, '/'); }
function git(cmd)      {
  try { return spawnSync('git', cmd.split(' '), { encoding: 'utf8', stdio: 'pipe' }).stdout.trim(); }
  catch { return ''; }
}

let totalFixed = 0;
function FIXED(msg) { console.log(`  OK  ${msg}`); totalFixed++; }
function OK(msg)    { console.log(`  --  ${msg}`); }

// ── FIX 1: UTF-8 corruption ──────────────────────────────────
function fix1(files) {
  console.log('\n[1] UTF-8 Encoding');
  let n = 0;
  for (const f of files) {
    try {
      const buf = fs.readFileSync(f);
      const str = buf.toString('utf8');
      if (/[\x80-\x9F]/.test(str) || str.includes('\uFFFD') || str.includes('â€')) {
        const clean = str
          .replace(/â€™/g, "'").replace(/â€œ/g, '"').replace(/â€/g, '"')
          .replace(/Â·/g, '·').replace(/[\x80-\x9F]/g, '').replace(/\uFFFD/g, '');
        write(f, clean);
        FIXED(`Encoding: ${rel(f)}`);
        n++;
      }
    } catch {}
  }
  if (!n) OK('All files valid UTF-8');
}

// ── FIX 2: Remove DashboardLayout from page files ────────────
function fix2(files) {
  console.log('\n[2] DashboardLayout in page files');
  let n = 0;
  for (const f of files) {
    const src = read(f);
    if (!src || !src.includes('DashboardLayout')) continue;
    let out = src;
    out = out.replace(/^[^\n]*import\s+DashboardLayout[^\n]*\n/gm, '');
    out = out.replace(/^\s*<DashboardLayout(?:\s[^>]*)?>[ \t]*\r?\n/gm, '');
    out = out.replace(/^\s*<\/DashboardLayout>[ \t]*\r?\n/gm, '');
    if (out !== src) { write(f, out); FIXED(`Removed: ${rel(f)}`); n++; }
  }
  if (!n) OK('None found');
}

// ── FIX 3: Orphan <> </> lines ───────────────────────────────
function fix3(files) {
  console.log('\n[3] Orphan fragment lines');
  let n = 0;
  for (const f of files) {
    const src = read(f);
    if (!src) continue;
    const lines    = src.split('\n');
    const filtered = lines.filter(l => { const t = l.trim(); return t !== '<>' && t !== '</>'; });
    if (filtered.length !== lines.length) { write(f, filtered.join('\n')); FIXED(`Cleaned: ${rel(f)}`); n++; }
  }
  if (!n) OK('None found');
}

// ── FIX 4: return() with no root wrapper ─────────────────────
// Handles: comment as first child, multiple roots, etc.
function fix4(files) {
  console.log('\n[4] Missing JSX root wrapper');
  let n = 0;

  for (const f of files) {
    const src = read(f);
    if (!src) continue;
    const lines = src.split('\n');

    // Find return (
    let returnIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*return\s*\(\s*$/.test(lines[i])) { returnIdx = i; break; }
    }
    if (returnIdx < 0) continue;

    // Find closing ) via paren depth
    let depth = 0, closeIdx = -1;
    for (let i = returnIdx + 1; i < lines.length; i++) {
      for (const ch of lines[i]) {
        if (ch === '(') depth++;
        if (ch === ')') { if (depth === 0) { closeIdx = i; break; } depth--; }
      }
      if (closeIdx >= 0) break;
    }
    if (closeIdx < 0) continue;

    const inner = lines.slice(returnIdx + 1, closeIdx);

    // Already has fragment wrapper?
    const firstContent = inner.find(l => l.trim().length > 0);
    if (!firstContent) continue;
    if (firstContent.trim() === '<>' || firstContent.trim().startsWith('<>')) continue;

    // Problem A: first content line is JSX comment — always multiple roots
    const startsWithComment = firstContent.trim().startsWith('{/*');

    // Problem B: multiple top-level JSX elements
    const baseIndent = firstContent.match(/^(\s*)/)[1];
    let topLevel = 0;
    let parenD = 0, braceD = 0;

    for (const line of inner) {
      if (!line.trim()) continue;
      const indent = line.match(/^(\s*)/)[1];
      const t      = line.trim();
      if (indent.length > baseIndent.length) continue;

      // Count JSX opening tags and JS expressions at root level
      if (t.startsWith('<') && !t.startsWith('</') && !t.startsWith('<!--')) topLevel++;
      if (t.startsWith('{') && !t.startsWith('{/') && !t.startsWith('{/*'))  topLevel++;
    }

    if (startsWithComment || topLevel > 1) {
      const newLines = [...lines];
      newLines.splice(returnIdx + 1, 0, `${baseIndent}<>`);
      newLines.splice(closeIdx + 1, 0, `${baseIndent}</>`);
      write(f, newLines.join('\n'));
      FIXED(`Wrapped: ${rel(f)}`);
      n++;
    }
  }
  if (!n) OK('All return blocks valid');
}

// ── FIX 5: Missing "use client" ──────────────────────────────
function fix5(files) {
  console.log('\n[5] Missing "use client"');
  const hooks = [
    'useState','useEffect','useRef','useCallback','useMemo',
    'useRouter','usePathname','useSearchParams',
    'useTheme','useToast','useConfirm','useAuthStore',
    'motion.','AnimatePresence','onClick','onChange',
  ];
  let n = 0;
  for (const f of files) {
    if (!f.endsWith('page.tsx')) continue;
    const src = read(f);
    if (!src || /^["']use client["']/m.test(src)) continue;
    if (hooks.some(h => src.includes(h))) {
      write(f, `"use client";\n${src}`);
      FIXED(`Directive added: ${rel(f)}`);
      n++;
    }
  }
  if (!n) OK('All pages have directive');
}

// ── FIX 6: Sub-layout files ───────────────────────────────────
function fix6() {
  console.log('\n[6] Sub-layout double wrapping');
  const DASH        = path.join(SRC, 'app', 'dashboard');
  const ROOT_LAYOUT = path.join(DASH, 'layout.tsx');
  const simple      = `export default function Layout({ children }: { children: React.ReactNode }) {\n  return <>{children}</>;\n}\n`;
  let n = 0;
  const layouts = walk(DASH).filter(f =>
    f.endsWith('layout.tsx') &&
    path.normalize(f) !== path.normalize(ROOT_LAYOUT)
  );
  for (const f of layouts) {
    const src = read(f);
    if (!src || !src.includes('DashboardLayout')) continue;
    write(f, simple);
    FIXED(`Sub-layout: ${rel(f)}`);
    n++;
  }
  if (!n) OK('All sub-layouts pass-through');
}

// ── FIX 7: Root dashboard layout ─────────────────────────────
function fix7() {
  console.log('\n[7] Root dashboard layout.tsx');
  const f = path.join(SRC, 'app', 'dashboard', 'layout.tsx');
  const correct = `"use client";\nimport DashboardLayout from "../../components/layout/DashboardLayout";\n\nexport default function DashboardRootLayout({ children }: { children: React.ReactNode }) {\n  return <DashboardLayout>{children}</DashboardLayout>;\n}\n`;
  const src = read(f);
  if (!src || !src.includes('<DashboardLayout>')) {
    write(f, correct);
    FIXED('Root layout corrected');
  } else {
    OK('Root layout correct');
  }
}

// ── FIX 8: .gitignore ────────────────────────────────────────
function fix8() {
  console.log('\n[8] .gitignore large files');
  let gi = fs.existsSync('.gitignore') ? fs.readFileSync('.gitignore', 'utf8') : '';
  const needed = ['*.zip','*.tar.gz','*.mp4','*.mov','*.dmg','*.exe','frontend.zip','.env.local'];
  let added = 0;
  for (const e of needed) { if (!gi.includes(e)) { gi += `\n${e}`; added++; } }
  if (added) { fs.writeFileSync('.gitignore', gi, 'utf8'); FIXED(`Added ${added} entries`); }
  else OK('.gitignore complete');
  const tracked = git('ls-files *.zip');
  if (tracked) {
    spawnSync('git', ['rm', '--cached', ...tracked.split('\n').filter(Boolean)], { stdio: 'pipe' });
    FIXED(`Removed from git: ${tracked}`);
  }
}

// ── FIX 9: next.config.js invalid keys ───────────────────────
function fix9() {
  console.log('\n[9] next.config.js');
  const configs = [
    path.join('frontend', 'next.config.js'),
    path.join('frontend', 'next.config.mjs'),
    path.join('frontend', 'next.config.ts'),
  ].filter(p => fs.existsSync(p));
  if (!configs.length) { OK('No next.config found'); return; }
  for (const f of configs) {
    const src = read(f);
    if (!src) continue;
    let out = src;
    // Remove invalid experimental keys
    out = out.replace(/\s*missingSuspenseWithCSRBailout\s*:\s*(true|false)\s*,?/g, '');
    // Remove empty experimental block
    out = out.replace(/,?\s*experimental\s*:\s*\{\s*\}/g, '');
    if (out !== src) { write(f, out); FIXED(`next.config fixed: ${rel(f)}`); }
    else OK(`next.config valid: ${rel(f)}`);
  }
}

// ── FIX 10: Duplicate imports ─────────────────────────────────
function fix10(files) {
  console.log('\n[10] Duplicate imports');
  let n = 0;
  for (const f of files) {
    const src = read(f);
    if (!src) continue;
    const lines = src.split('\n');
    const seen  = new Set();
    let changed = false;
    const out   = lines.filter(l => {
      if (/^import\s+/.test(l.trim())) {
        if (seen.has(l.trim())) { changed = true; return false; }
        seen.add(l.trim());
      }
      return true;
    });
    if (changed) { write(f, out.join('\n')); FIXED(`Deduped: ${rel(f)}`); n++; }
  }
  if (!n) OK('No duplicates found');
}

// ── RUN ───────────────────────────────────────────────────────
console.log('\n' + '='.repeat(52));
console.log('  DropOS — Pre-Deploy Fixer (Full Project)');
console.log('='.repeat(52));

if (!fs.existsSync(SRC)) {
  console.log('\nERROR: frontend/src not found. Run from project root.\n');
  process.exit(1);
}

const allFiles   = walk(SRC);
const pageFiles  = allFiles.filter(f => f.endsWith('page.tsx'));
const tsxFiles   = allFiles.filter(f => f.endsWith('.tsx'));

console.log(`\n  Pages found: ${pageFiles.length}`);
console.log(`  TSX files:   ${tsxFiles.length}`);

fix1(tsxFiles);
fix2(pageFiles);
fix3(pageFiles);
fix4(pageFiles);   // fixes marketing + auth + admin + dashboard pages
fix5(pageFiles);
fix6();
fix7();
fix8();
fix9();
fix10(tsxFiles);

console.log('\n' + '='.repeat(52));
console.log(`  TOTAL FIXES: ${totalFixed}`);
console.log('='.repeat(52) + '\n');

// Push
spawnSync('git', ['add', '.'], { stdio: 'inherit' });
const status = git('status --short');

if (status) {
  spawnSync('git', ['commit', '-m', 'fix: full pre-deploy auto-fix all pages'], { stdio: 'inherit' });
  console.log();
  const push = spawnSync('git', ['push', 'origin', 'main'], { stdio: 'inherit' });
  console.log(push.status === 0
    ? '\nPUSHED. Check Vercel now.\n'
    : '\nPush failed. Run: git push origin main\n'
  );
} else {
  console.log('Nothing to push. All clean.\n');
  console.log('If Vercel still fails: go to Vercel dashboard > Redeploy.\n');
}
