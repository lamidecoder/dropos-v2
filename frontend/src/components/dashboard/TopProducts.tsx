"use client";
export function TopProducts({ analytics }: { analytics?: any }) {
  const products = analytics?.topProducts || [
    { name: "Wireless Earbuds", sales: 142 },
    { name: "Phone Case Pro",   sales: 98  },
    { name: "USB-C Hub",        sales: 76  },
  ];
  const max = Math.max(...products.map((p: any) => p.sales), 1);
  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Top Products</h3>
      <div className="space-y-3">
        {products.slice(0, 4).map((p: any, i: number) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs truncate flex-1 mr-2" style={{ color: "var(--text-secondary)" }}>{p.name}</span>
              <span className="text-xs font-bold flex-shrink-0" style={{ color: "var(--accent)" }}>{p.sales}</span>
            </div>
            <div className="h-1 rounded-full" style={{ background: "var(--bg-secondary)" }}>
              <div className="h-1 rounded-full transition-all" style={{ width: `${(p.sales / max) * 100}%`, background: i === 0 ? "linear-gradient(90deg,#7C3AED,#A78BFA)" : "var(--accent-dim)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
