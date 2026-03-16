const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  content = content.replace(
    /qc\.invalidateQueries\((\{[^}]+\})\s*,\s*\n(\s*onError[^\n]+\)\);)/g,
    function(match, queryPart, onErrorPart) {
      return 'qc.invalidateQueries(' + queryPart + ');\n' + onErrorPart.slice(0, -1);
    }
  );
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed: ' + filePath);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(function(f) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory() && f !== 'node_modules') walk(full);
    else if (f.endsWith('.tsx') || f.endsWith('.ts')) fixFile(full);
  });
}

walk('./src');
console.log('Done!');
