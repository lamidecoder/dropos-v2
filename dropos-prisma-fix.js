// dropos-prisma-fix.js
const fs=require('fs');const path=require('path');const{execSync}=require('child_process');
const p='backend'+path.sep+'src'+path.sep+'routes'+path.sep+'store.routes.ts';
fs.writeFileSync(p,"// backend/src/routes/store.routes.ts\nimport { Router } from \"express\";\nimport { authenticate } from \"../middleware/auth\";\nimport prisma from \"../lib/prisma\";\nimport {\n  createStore, getMyStores, getStore,\n  updateStore, deleteStore, updateDomain,\n  getPublicStore,\n} from \"../controllers/store.controller\";\nimport {\n  createFlashSale, getFlashSales, updateFlashSale,\n  deleteFlashSale, getActiveFlashSales,\n} from \"../controllers/returns.controller\";\n\nconst router = Router();\n\n// Public\nrouter.get(\"/public/:slug\", getPublicStore);\n\n// Authenticated\nrouter.post(\"/\",            authenticate, createStore);\nrouter.get(\"/\",             authenticate, getMyStores);\nrouter.get(\"/:id\",          authenticate, getStore);\nrouter.put(\"/:id\",          authenticate, updateStore);\nrouter.patch(\"/:id\",        authenticate, updateStore);\nrouter.delete(\"/:id\",       authenticate, deleteStore);\nrouter.patch(\"/:id/domain\", authenticate, updateDomain);\n\n// Flash Sales — frontend calls /stores/:id/flash-sales\nrouter.get(\"/:id/flash-sales/active\", getActiveFlashSales);\nrouter.get(\"/:id/flash-sales\",        authenticate, getFlashSales);\nrouter.post(\"/:id/flash-sales\",       authenticate, createFlashSale);\nrouter.patch(\"/:id/flash-sales/:saleId\", authenticate, updateFlashSale);\nrouter.delete(\"/:id/flash-sales/:saleId\", authenticate, deleteFlashSale);\n\nexport default router;\n// Custom domain lookup — used by frontend for custom domain routing\nrouter.get(\"/domain/:hostname\", async (req: any, res: any) => {\n  try {\n    const { hostname } = req.params;\n    const store = await prisma.store.findFirst({\n      where: {\n        customDomain: hostname,\n        status: { not: \"SUSPENDED\" } as any,\n      },\n      select: { slug: true, id: true, name: true },\n    });\n    if (!store) return res.status(404).json({ success: false });\n    return res.json({ success: true, data: store });\n  } catch {\n    return res.status(500).json({ success: false });\n  }\n});\n",'utf8');
console.log('OK store.routes.ts');
try{
  execSync('git add .',{stdio:'inherit'});
  const st=execSync('git status --short',{encoding:'utf8'}).trim();
  if(st){
    execSync('git commit -m "fix: add prisma import to store.routes.ts"',{stdio:'inherit'});
    execSync('git push origin main',{stdio:'inherit'});
    console.log('Pushed.');
  }else{console.log('Nothing new.');}
}catch(e){console.log('Git error:',e.message);}
