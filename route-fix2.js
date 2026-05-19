// Route Fix — node route-fix2.js
const fs=require('fs'),path=require('path'),{execSync}=require('child_process');
// Delete the conflicting (kiro-app) directory
const d=path.join(process.cwd(),'frontend','src','app','(kiro-app)');
try{fs.rmSync(d,{recursive:true,force:true});console.log('Deleted:',d);}catch(e){console.log('Already gone')}
const F={"fix.js": "﻿const fs = require('fs');\nconst path = require('path');\n\nfunction fixFile(filePath) {\n  let content = fs.readFileSync(filePath, 'utf8');\n  const original = content;\n  content = content.replace(\n    /qc\\.invalidateQueries\\((\\{[^}]+\\})\\s*,\\s*\\n(\\s*onError[^\\n]+\\)\\);)/g,\n    function(match, queryPart, onErrorPart) {\n      return 'qc.invalidateQueries(' + queryPart + ');\\n' + onErrorPart.slice(0, -1);\n    }\n  );\n  if (content !== original) {\n    fs.writeFileSync(filePath, content, 'utf8');\n    console.log('Fixed: ' + filePath);\n  }\n}\n\nfunction walk(dir) {\n  fs.readdirSync(dir).forEach(function(f) {\n    const full = path.join(dir, f);\n    if (fs.statSync(full).isDirectory() && f !== 'node_modules') walk(full);\n    else if (f.endsWith('.tsx') || f.endsWith('.ts')) fixFile(full);\n  });\n}\n\nwalk('./src');\nconsole.log('Done!');\n"};
for(const[r,c] of Object.entries(F)){const p=path.join(process.cwd(),r.replace(/\//g,path.sep));fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,c,'utf8');}
try{
  execSync('git add -A',{stdio:'inherit'});
  execSync('git commit -m "fix: remove (kiro-app) route conflict"',{stdio:'inherit'});
  execSync('git push origin main',{stdio:'inherit'});
  console.log('\n✅ Done.');
}catch(e){console.log('Run: git push origin main');}