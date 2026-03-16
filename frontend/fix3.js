const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix pattern 1: invalidateQueries({...}); \n    onError: ...)) },
  // Remove the extra )) before },
  content = content.replace(
    /qc\.invalidateQueries\((\{[^}]+\})\);\n(\s*onError[^)]+\)\)) \},/g,
    function(m, q, onErr) {
      return 'qc.invalidateQueries(' + q + ');\n    },\n    ' + onErr.replace(/\)\)$/, ')') + ',';
    }
  );

  // Fix pattern 2: same but with extra content after onError
  content = content.replace(
    /qc\.invalidateQueries\((\{[^}]+\})\);\n(\s*onError[^)]+\)\))(.*)\},/g,
    function(m, q, onErr, extra) {
      return 'qc.invalidateQueries(' + q + ');' + extra + '\n    },\n    ' + onErr.replace(/\)\)$/, ')') + ',';
    }
  );

  // Fix abandoned-carts: missing closing brace for last array item
  content = content.replace(
    /("rgba\(167,139,250,0\.08\)"[^}]*),\n(\s*\];)/,
    '\n    },\n'
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
