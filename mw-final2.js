// mw-final2.js
const fs=require('fs');const path=require('path');const{execSync}=require('child_process');
const p='frontend'+path.sep+'middleware.ts';
fs.writeFileSync(p,"import { NextResponse } from \"next/server\";\nimport type { NextRequest } from \"next/server\";\n\nconst ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || \"droposhq.com\";\n\nexport const config = {\n  matcher: [\n    \"/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)\",\n  ],\n};\n\nexport async function middleware(req: NextRequest) {\n  const hostname = req.headers.get(\"host\") || \"\";\n  const path     = req.nextUrl.pathname;\n\n  // Skip Vercel system / preview domains\n  if (\n    hostname.includes(\"vercel.app\") ||\n    hostname.includes(\"localhost\")\n  ) {\n    return NextResponse.next();\n  }\n\n  // Root domain — serve normally\n  if (\n    hostname === ROOT_DOMAIN ||\n    hostname === `www.${ROOT_DOMAIN}`\n  ) {\n    return NextResponse.next();\n  }\n\n  // Subdomain — e.g. midelymah320.droposhq.com\n  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {\n    const slug = hostname.replace(`.${ROOT_DOMAIN}`, \"\");\n\n    // Rewrite the URL path only — keep same host\n    // This is the correct Vercel pattern\n    return NextResponse.rewrite(\n      new URL(`/store/${slug}${path === \"/\" ? \"\" : path}`, req.url)\n    );\n  }\n\n  return NextResponse.next();\n}\n",'utf8');
console.log('OK middleware.ts');
try{
  execSync('git add .',{stdio:'inherit'});
  const st=execSync('git status --short',{encoding:'utf8'}).trim();
  if(st){
    execSync('git commit -m "fix: middleware uses req.url as base, no host override — correct Vercel pattern"',{stdio:'inherit'});
    execSync('git push origin main',{stdio:'inherit'});
    console.log('Pushed.');
  }else{console.log('Nothing new.');}
}catch(e){console.log('Git error:',e.message);}
