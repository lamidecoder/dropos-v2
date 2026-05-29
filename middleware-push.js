// middleware-push.js
const fs=require('fs');const path=require('path');const{execSync}=require('child_process');
const files={"frontend/src/middleware.ts":"import { NextResponse } from \"next/server\";\nimport type { NextRequest } from \"next/server\";\n\nconst ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || \"droposhq.com\";\n\nexport function middleware(req: NextRequest) {\n  const hostname = req.headers.get(\"host\") || \"\";\n  const pathname = req.nextUrl.pathname;\n\n  // Strip port for local dev\n  const host = hostname.split(\":\")[0];\n\n  // If on root domain or www — serve normally\n  if (\n    host === ROOT_DOMAIN ||\n    host === `www.${ROOT_DOMAIN}` ||\n    host === \"localhost\" ||\n    host.endsWith(\".vercel.app\")\n  ) {\n    return NextResponse.next();\n  }\n\n  // If on a subdomain like midelymah320.droposhq.com\n  if (host.endsWith(`.${ROOT_DOMAIN}`)) {\n    const slug = host.replace(`.${ROOT_DOMAIN}`, \"\");\n\n    // Skip internal Next.js paths\n    if (\n      pathname.startsWith(\"/_next\") ||\n      pathname.startsWith(\"/api\") ||\n      pathname.startsWith(\"/static\") ||\n      pathname.includes(\".\")\n    ) {\n      return NextResponse.next();\n    }\n\n    // Rewrite to /store/[slug][pathname] — keeps URL as subdomain but serves store content\n    const url = req.nextUrl.clone();\n    url.pathname = `/store/${slug}${pathname === \"/\" ? \"\" : pathname}`;\n    return NextResponse.rewrite(url);\n  }\n\n  return NextResponse.next();\n}\n\nexport const config = {\n  matcher: [\n    // Match all paths except static files and API\n    \"/((?!_next/static|_next/image|favicon.ico).*)\",\n  ],\n};\n"};
for(const[rel,c]of Object.entries(files)){
  const p=rel.split('/').join(path.sep);
  fs.mkdirSync(path.dirname(p),{recursive:true});
  fs.writeFileSync(p,c,'utf8');
  console.log('✓',rel);
}
try{
  execSync('git add .',{stdio:'inherit'});
  const st=execSync('git status --short',{encoding:'utf8'}).trim();
  if(st){
    execSync('git commit -m "feat: Next.js middleware for subdomain store routing — midelymah320.droposhq.com → /store/midelymah320"',{stdio:'inherit'});
    execSync('git push origin main',{stdio:'inherit'});
    console.log('\n✅ Pushed!');
    console.log('\n⚠️  IMPORTANT: You must also add *.droposhq.com as a wildcard domain in Vercel:');
    console.log('   vercel.com → dropos-frontend1 → Settings → Domains → Add *.droposhq.com');
    console.log('   Then in your DNS (Cloudflare/Namecheap): CNAME * → cname.vercel-dns.com');
  }else{console.log('Nothing new.');}
}catch(e){console.log('Git:',e.message);}
