// ============================================================
// ALL REMAINING DASHBOARD PAGES
// Each page = clean UI + KIRO chat shortcut shown
// ============================================================

// ── Daily Top 10 ─────────────────────────────────────────────
// Path: frontend/src/app/dashboard/top-products/page.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { TrendingUp, Loader2, Import, Zap } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export function DailyTop10Page() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const [importing, setImporting] = useState<string | null>(null);

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ["daily-top10", storeId],
    queryFn:  async () => { const r = await api.get(`/intel/daily-top10?storeId=${storeId}`); return r.data.data; },
    enabled: !!storeId,
    staleTime: 4 * 60 * 60 * 1000,
  });

  const importProduct = async (product: any) => {
    setImporting(product.name);
    try {
      await api.post("/products/intel/import-confirmed", {
        storeId,
        scrapedData: { name: product.name, category: product.category, description: product.whyNow },
        sellingPrice: product.suggestedPriceLocal,
      });
      toast.success(`${product.name} added to store!`);
    } catch { toast.error("Import failed"); }
    finally { setImporting(null); }
  };

  const trendColor = (t: string) => t === "exploding" ? "#a78bfa" : t === "rising" ? "#34d399" : t === "stable" ? "#fbbf24" : "#f87171";

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl" style={{ minHeight: "100vh", background: "#07070e" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-white mb-0.5">Today's Top 10</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Products generating buzz in your market right now — refreshed every 12 hours
            </p>
          </div>
          <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
            <Zap size={12} />Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 size={28} className="animate-spin mx-auto mb-3" style={{ color: "#7c3aed" }} />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>KIRO is scanning your market...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {(products || []).map((p: any, i: number) => (
              <motion.div key={i} className="rounded-2xl p-4 flex items-center gap-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>

                {/* Rank */}
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{ background: i < 3 ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)", color: i < 3 ? "#a78bfa" : "rgba(255,255,255,0.4)" }}>
                  {p.rank}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                    <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: `${trendColor(p.trendDirection)}15`, color: trendColor(p.trendDirection), fontSize: "10px" }}>
                      {p.trendDirection} ↑{p.trendScore}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{p.whyNow}</p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {p.saturationLevel} saturation · {p.windowDays}d window · {p.targetAudience}
                  </p>
                </div>

                {/* Pricing */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-white">{p.symbol || "₦"}{(p.suggestedPriceLocal || 0).toLocaleString()}</p>
                  <p className="text-xs" style={{ color: "#34d399" }}>{p.marginPercent}% margin</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>cost: {p.symbol || "₦"}{(p.supplierCostLocal || 0).toLocaleString()}</p>
                </div>

                {/* Import */}
                <button onClick={() => importProduct(p)} disabled={importing === p.name}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium flex-shrink-0 transition-all"
                  style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa" }}>
                  {importing === p.name ? <Loader2 size={12} className="animate-spin" /> : <TrendingUp size={12} />}
                  Add
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default DailyTop10Page;
