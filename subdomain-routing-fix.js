// dropos-final-mw.js
const fs=require('fs');const path=require('path');const{execSync}=require('child_process');
const files={"frontend/middleware.ts":"import { NextResponse } from \"next/server\";\nimport type { NextRequest } from \"next/server\";\n\nconst ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || \"droposhq.com\";\n\nexport const config = {\n  matcher: [\"/((?!_next/|_static/|_vercel|[\\\\w-]+\\\\.\\\\w+).*)\"],\n};\n\nexport async function middleware(req: NextRequest) {\n  const url    = req.nextUrl;\n  const host   = req.headers.get(\"host\") || \"\";\n\n  // Get hostname without port\n  const hostname = host\n    .replace(\":3000\", \"\")\n    .replace(\":443\", \"\")\n    .replace(\":80\", \"\");\n\n  // Skip Vercel preview/system domains\n  if (\n    hostname === \"localhost\" ||\n    hostname.endsWith(\".vercel.app\") ||\n    hostname === ROOT_DOMAIN ||\n    hostname === `www.${ROOT_DOMAIN}`\n  ) {\n    return NextResponse.next();\n  }\n\n  // It's a subdomain like midelymah320.droposhq.com\n  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {\n    const subdomain = hostname.replace(`.${ROOT_DOMAIN}`, \"\");\n\n    // Build new URL — rewrite internally to /store/[subdomain]\n    const newUrl = new URL(\n      `/store/${subdomain}${url.pathname === \"/\" ? \"\" : url.pathname}${url.search}`,\n      req.url\n    );\n\n    // CRITICAL: set the host back to root domain so Vercel routes it correctly\n    newUrl.host = ROOT_DOMAIN;\n\n    return NextResponse.rewrite(newUrl);\n  }\n\n  return NextResponse.next();\n}\n","frontend/next.config.js":"/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  eslint:     { ignoreDuringBuilds: true },\n  typescript: { ignoreBuildErrors: true },\n  images: {\n    remotePatterns: [\n      { protocol: \"http\",  hostname: \"localhost\" },\n      { protocol: \"https\", hostname: \"res.cloudinary.com\" },\n      { protocol: \"https\", hostname: \"**\" },\n    ],\n  },\n  webpack: (config) => {\n    config.resolve.fallback = { ...config.resolve.fallback, fs: false };\n    return config;\n  },\n};\n\nmodule.exports = nextConfig;\n"};
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
    execSync('git commit -m "fix: middleware rewrite sets host to ROOT_DOMAIN, clean next.config"',{stdio:'inherit'});
    execSync('git push origin main',{stdio:'inherit'});
    console.log('Pushed. 3 mins then test.');
  }else{console.log('Nothing new.');}
}catch(e){console.log('Git error:',e.message);}
