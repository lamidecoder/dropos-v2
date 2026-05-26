const{execSync}=require('child_process');
try{
  execSync('git push origin main',{stdio:'inherit'});
  console.log('\n✅ Pushed! Now run:\ncd frontend && vercel --prod --force');
}catch(e){console.error('Push failed:',e.message);}
