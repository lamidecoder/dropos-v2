// mw3.js
const fs=require('fs');const path=require('path');const{execSync}=require('child_process');
fs.writeFileSync('frontend'+path.sep+'middleware.ts',"import { NextResponse } from \"next/server\";\nimport type { NextRequest } from \"next/server\";\n\nconst ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || \"droposhq.com\";\n\nexport const config = {\n  matcher: [\n    \"/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)\",\n  ],\n};\n\nexport async function middleware(req: NextRequest) {\n  const hostname = req.headers.get(\"host\") || \"\";\n  const path     = req.nextUrl.pathname;\n  const search   = req.nextUrl.search;\n\n  // Skip system domains\n  if (\n    hostname.includes(\"vercel.app\") ||\n    hostname.includes(\"localhost\")\n  ) {\n    return NextResponse.next();\n  }\n\n  // Root domain\n  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) {\n    return NextResponse.next();\n  }\n\n  // Subdomain e.g. midelymah320.droposhq.com\n  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {\n    const slug = hostname.replace(`.${ROOT_DOMAIN}`, \"\");\n\n    // Rewrite to root domain so Vercel serves the /store/[slug] route\n    const url = req.nextUrl.clone();\n    url.hostname = ROOT_DOMAIN;\n    url.pathname = `/store/${slug}${path === \"/\" ? \"\" : path}`;\n\n    return NextResponse.rewrite(url);\n  }\n\n  return NextResponse.next();\n}\n",'utf8');
console.log('OK middleware.ts');
try{
  execSync('git add .',{stdio:'inherit'});
  const st=execSync('git status --short',{encoding:'utf8'}).trim();
  if(st){
    execSync('git commit -m "fix: middleware clones nextUrl and sets hostname to ROOT_DOMAIN for correct Vercel routing"',{stdio:'inherit'});
    execSync('git push origin main',{stdio:'inherit'});
    console.log('Pushed. Run: cd frontend && vercel --prod');
  }else{console.log('Nothing new.');}
}catch(e){console.log('Git error:',e.message);}
