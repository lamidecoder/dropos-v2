// dropos-emdash-kiro.js — node dropos-emdash-kiro.js
// Applies em-dash removal + /kiro route creation to your local repo
const fs=require('fs'),path=require('path'),{execSync}=require('child_process');

// Step 1: Remove em-dashes from all tsx/ts files
function walk(d){const out=[];for(const f of fs.readdirSync(d,{withFileTypes:true})){const full=path.join(d,f.name);if(f.isDirectory())out.push(...walk(full));else if(f.name.endsWith('.tsx')||f.name.endsWith('.ts'))out.push(full);}return out;}

let emFixed=0;
walk('frontend/src').forEach(fp=>{
  if(!fs.existsSync(fp))return;
  const orig=fs.readFileSync(fp,'utf8');
  let c=orig;
  c=c.replace(/ — /g,' - ');
  c=c.replace(/—/g,'-');
  c=c.replace(/ – /g,' - ');
  c=c.replace(/–/g,'-');
  if(c!==orig){fs.writeFileSync(fp,c,'utf8');emFixed++;}
});
console.log('Em-dashes removed from',emFixed,'files');

// Step 2: Rename /kai routes to /kiro in all files
let routeFixed=0;
walk('frontend/src').forEach(fp=>{
  if(fp.includes('/components/kai/')||fp.includes('/store/kai')||fp.includes('/types/kai'))return;
  const orig=fs.readFileSync(fp,'utf8');
  let c=orig;
  c=c.replace(/href="\/dashboard\/kai"/g,'href="/dashboard/kiro"');
  c=c.replace(/href='\/dashboard\/kai'/g,"href='/dashboard/kiro'");
  c=c.replace(/\/dashboard\/kai"/g,'/dashboard/kiro"');
  c=c.replace(/router\.push\('\/dashboard\/kai'\)/g,"router.push('/dashboard/kiro')");
  c=c.replace(/router\.push\("\/dashboard\/kai"\)/g,'router.push("/dashboard/kiro")');
  if(c!==orig){fs.writeFileSync(fp,c,'utf8');routeFixed++;}
});
console.log('Routes renamed in',routeFixed,'files');

// Step 3: Create /kiro pages
const kiroDir='frontend/src/app/dashboard/kiro';
const publicKiroDir='frontend/src/app/(public)/kiro';
fs.mkdirSync(kiroDir,{recursive:true});
fs.mkdirSync(publicKiroDir,{recursive:true});

const kaiPage='frontend/src/app/dashboard/kai/page.tsx';
const publicKaiPage='frontend/src/app/(public)/kai/page.tsx';

if(fs.existsSync(kaiPage)&&!fs.existsSync(kiroDir+'/page.tsx')){
  let c=fs.readFileSync(kaiPage,'utf8');
  c=c.replace(/\/dashboard\/kai/g,'/dashboard/kiro');
  fs.writeFileSync(kiroDir+'/page.tsx',c,'utf8');
  console.log('Created /dashboard/kiro/page.tsx');
}
if(fs.existsSync(publicKaiPage)&&!fs.existsSync(publicKiroDir+'/page.tsx')){
  let c=fs.readFileSync(publicKaiPage,'utf8');
  c=c.replace(/\/(public)\/kai/g,'/(public)/kiro');
  fs.writeFileSync(publicKiroDir+'/page.tsx',c,'utf8');
  console.log('Created /(public)/kiro/page.tsx');
}

// Step 4: Git push
try{
  execSync('git add .',{stdio:'inherit'});
  const st=execSync('git status --short',{encoding:'utf8'}).trim();
  if(st){
    execSync('git commit -m "fix: em-dash removal, /kiro routes, public kiro page"',{stdio:'inherit'});
    execSync('git push origin main',{stdio:'inherit'});
    console.log('\nPushed to GitHub.');
  } else {
    console.log('\nNothing new to push. Try: git push origin main');
  }
}catch(e){console.log('Git error:',e.message);}
