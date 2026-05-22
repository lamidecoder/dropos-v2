// dropos-rewrite-fix.js — node dropos-rewrite-fix.js
const fs=require('fs');const path=require('path');const{execSync}=require('child_process');
const files={"frontend/next.config.js":"/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  eslint:     { ignoreDuringBuilds: true },\n  typescript: { ignoreBuildErrors: true },\n\n  images: {\n    remotePatterns: [\n      { protocol: \"http\",  hostname: \"localhost\" },\n      { protocol: \"https\", hostname: \"res.cloudinary.com\" },\n      { protocol: \"https\", hostname: \"**\" },\n    ],\n  },\n\n  webpack: (config) => {\n    config.resolve.fallback = { ...config.resolve.fallback, fs: false };\n    return config;\n  },\n\n  // Subdomain → store path rewrites\n  // Runs at CDN edge, no middleware needed\n  async rewrites() {\n    return {\n      beforeFiles: [\n        // midelymah320.droposhq.com/* → /store/midelymah320/*\n        // Vercel wildcard: :store matches the subdomain label\n        {\n          source: \"/:path*\",\n          has: [\n            {\n              type: \"host\",\n              value: \"(?<store>.+)\\\\.droposhq\\\\.com\",\n            },\n          ],\n          destination: \"/store/:store/:path*\",\n        },\n      ],\n    };\n  },\n};\n\nmodule.exports = nextConfig;\n","frontend/middleware.ts":"// Middleware kept minimal - rewrites handled by next.config.js\nimport { NextResponse } from \"next/server\";\nimport type { NextRequest } from \"next/server\";\n\nexport const config = {\n  matcher: [\"/((?!_next/static|_next/image|favicon.ico).*)\"],\n};\n\nexport async function middleware(req: NextRequest) {\n  // All subdomain routing is handled by next.config.js rewrites\n  // This middleware is intentionally a passthrough\n  return NextResponse.next();\n}\n"};
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
    execSync('git commit -m "fix: subdomain routing via next.config.js rewrites instead of middleware"',{stdio:'inherit'});
    execSync('git push origin main',{stdio:'inherit'});
    console.log('Pushed. Wait 3 mins then test https://midelymah320.droposhq.com');
  }else{console.log('Nothing new.');}
}catch(e){console.log('Git error:',e.message);}
