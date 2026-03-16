const fs = require('fs');

const fixes = [
  {
    file: 'src/app/dashboard/affiliates/page.tsx',
    from:     onSuccess: () => { toast.success("Affiliate removed"); qc.invalidateQueries({ queryKey: ["affiliates"] });\n    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed")) },,
    to:       onSuccess: () => { toast.success("Affiliate removed"); qc.invalidateQueries({ queryKey: ["affiliates"] }); },\n    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed"),
  },
  {
    file: 'src/app/dashboard/api-keys/page.tsx',
    from:     onSuccess: () => { toast.success("Key revoked"); qc.invalidateQueries({ queryKey: ["api-keys"] });\n    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed")) },,
    to:       onSuccess: () => { toast.success("Key revoked"); qc.invalidateQueries({ queryKey: ["api-keys"] }); },\n    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed"),
  },
  {
    file: 'src/app/dashboard/coupons/page.tsx',
    from:     onSuccess: () => { toast.success("Coupon created!"); qc.invalidateQueries({ queryKey: ["coupons"] });\n    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed")) setModal(false); reset(); },,
    to:       onSuccess: () => { toast.success("Coupon created!"); qc.invalidateQueries({ queryKey: ["coupons"] }); setModal(false); reset(); },
  },
  {
    file: 'src/app/dashboard/discounts/page.tsx',
    from:       qc.invalidateQueries({ queryKey: ["discounts"] });\n    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed")),
    to:         qc.invalidateQueries({ queryKey: ["discounts"] });
  },
  {
    file: 'src/app/dashboard/abandoned-carts/page.tsx',
    from:       bg:    "rgba(167,139,250,0.08)",\n    },\n\n\n  return (,
    to:         bg:    "rgba(167,139,250,0.08)",\n    },\n  ];\n\n  return (
  }
];

fixes.forEach(fix => {
  let content = fs.readFileSync(fix.file, 'utf8');
  if (content.includes(fix.from)) {
    content = content.replace(fix.from, fix.to);
    fs.writeFileSync(fix.file, content);
    console.log('Fixed: ' + fix.file);
  } else {
    console.log('NOT FOUND in: ' + fix.file);
  }
});
console.log('Done!');
