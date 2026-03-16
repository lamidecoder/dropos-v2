const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/abandoned-carts/page.tsx', 'utf8');
// Find the missing closing brace before return statement
content = content.replace(
  /(\s+\},\n  \];\n\n  return)/,
  '\n  ];\n\n  return'
);
fs.writeFileSync('src/app/dashboard/abandoned-carts/page.tsx', content);
console.log('Done');
