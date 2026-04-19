"use client";
﻿"use client";
// Path: frontend/src/app/dashboard/grader/page.tsx
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { BarChart2, TrendingUp, TrendingDown, Package } from "lucide-react";

export default function ProductGraderPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";

  const { data: grades, isLoading } = useQuery({
    queryKey: ["product-grades", storeId],
    queryFn: async () => { const r = await api.get(`/features/product-grades/${storeId}`); return r.data.data; },
    enabled: !!storeId,
  });

  const summary = grades ? {
    aPlus: grades.filter((g: any) => g.grade === "A+").length,
    good:  grades.filter((g: any) => ["A","B"].includes(g.grade)).length,
    poor:  grades.filter((g: any) => ["D","F"].includes(g.grade)).length,
  } : null;

  return (
    
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white mb-1">Product Performance</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            KAI grades every product based on real sales data
          </p>
        </div>

        {summary && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Best sellers", value: summary.aPlus, color: "#34d399", icon: "🔥" },
              { label: "Good products", value: summary.good, color: "#60a5fa", icon: "✅" },
              { label: "Remove these", value: summary.poor, color: "#f87171", icon: "❌" },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-4 text-center"
                style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}>
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{item.label}</p>
              </div>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {(grades || []).map((p: any, i: number) => (
              <motion.div key={p.id}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}>

                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{ background: `${p.color}18`, color: p.color }}>
                  {p.grade}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{p.name}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {p.salesLast30} sales in 30 days · {p.totalSales} total · ₦{Number(p.price).toLocaleString()}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium" style={{ color: p.color }}>{p.verdict}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)", maxWidth: "180px" }}>
                    {p.action}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    
  );
}
