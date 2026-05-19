// Route Fix — node route-fix.js
const fs=require('fs'),path=require('path'),{execSync}=require('child_process');
// Delete the conflicting file
const old = path.join(process.cwd(),'frontend','src','app','dashboard','kiro','page.tsx');
if(fs.existsSync(old)){fs.unlinkSync(old);console.log('Deleted:',old);}
// Remove empty dir
const dir = path.join(process.cwd(),'frontend','src','app','dashboard','kiro');
try{fs.rmdirSync(dir);console.log('Removed dir:',dir);}catch{}
try{
  execSync('git add -A',{stdio:'inherit'});
  execSync('git commit -m "fix: remove conflicting kiro route"',{stdio:'inherit'});
  execSync('git push origin main',{stdio:'inherit'});
  console.log('✅ Done.');
}catch(e){console.log('Run: git push origin main');}