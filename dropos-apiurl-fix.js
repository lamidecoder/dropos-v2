// dropos-apiurl-fix.js — node dropos-apiurl-fix.js
const fs=require('fs');const path=require('path');const{execSync}=require('child_process');
const files={"frontend/vercel.json":"{\n  \"framework\": \"nextjs\",\n  \"buildCommand\": \"npm run build\",\n  \"outputDirectory\": \".next\",\n  \"env\": {\n    \"NEXT_PUBLIC_API_URL\": \"https://dropos-v2.onrender.com/api\",\n    \"NEXT_PUBLIC_ROOT_DOMAIN\": \"droposhq.com\",\n    \"NEXT_PUBLIC_APP_URL\": \"https://droposhq.com\"\n  }\n}"};
for(const[rel,c]of Object.entries(files)){
  const p=rel.split('/').join(path.sep);
  fs.mkdirSync(path.dirname(p),{recursive:true});
  fs.writeFileSync(p,c,'utf8');
  console.log('OK',rel.split('/').pop());
}
try{
  execSync('git add .',{stdio:'inherit'});
  const st=execSync('git status --short',{encoding:'utf8'}).trim();
  if(st){
    execSync('git commit -m "fix: NEXT_PUBLIC_API_URL missing /api suffix — stores not loading on subdomains"',{stdio:'inherit'});
    execSync('git push origin main',{stdio:'inherit'});
    console.log('Pushed. Vercel deploying — 2 mins then test subdomain.');
  }else{console.log('Nothing new.');}
}catch(e){console.log('Git error:',e.message);}
