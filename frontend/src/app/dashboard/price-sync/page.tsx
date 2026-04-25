"use client";
﻿"use client";
// ── PRICE SYNC ────────────────────────────────────────────────
// Path: frontend/src/app/dashboard/price-sync/page.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle, Check } from "lucide-react";
import toast from "react-hot-toast";

export function PriceSyncPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const [result, setResult] = useState<any>(null);

  const syncMutation = useMutation({
    mutationFn: async () => api.post(`/intel/price-sync/${storeId}`),
    onSuccess: r => { setResult(r.data.data); toast.success(`Sync complete - ${r.data.data.checked} products checked`); },
    onError:   () => toast.error("Sync failed - try again"),
  });

  return (
    
      <div className="p-6 max-w-3xl" style={{ minHeight: "100vh", background: "#07070e" }}>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white mb-0.5">Price & Stock Sync</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Check if supplier prices changed - or Ask KIRO "sync my prices"</p>
        </div>

        <button onClick={() => syncMutation.mutate()} disabled={syncMutation.isLoading}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold mb-6"
          style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", boxShadow: "0 8px 24px rgba(124,58,237,0.3)" }}>
          {syncMutation.isLoading
            ? <><RefreshCw size={16} className="animate-spin" />Checking {15} supplier prices...</>
            : <><RefreshCw size={16} />Run Price & Stock Sync</>}
        </button>

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Products checked", value: result.checked, color: "#a78bfa" },
                { label: "Price changes",    value: result.priceChanges.length, color: "#fbbf24" },
                { label: "Stock changes",    value: result.stockChanges.length, color: "#f87171" },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-3 text-center"
                  style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}>
                  <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{item.label}</p>
                </div>
              ))}
            </div>

            {result.priceChanges.length > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(251,191,36,0.2)" }}>
                <div className="px-4 py-3" style={{ background: "rgba(251,191,36,0.06)" }}>
                  <p className="text-sm font-semibold text-white">Price Changes</p>
                </div>
                {result.priceChanges.map((c: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    {c.change === "decreased" ? <TrendingDown size={14} style={{ color: "#34d399" }} /> : <TrendingUp size={14} style={{ color: "#f87171" }} />}
                    <p className="flex-1 text-sm text-white truncate">{c.productName}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {c.symbol}{c.oldCost?.toLocaleString()} → {c.symbol}{c.newCost?.toLocaleString()}
                    </p>
                    <span className="text-xs" style={{ color: c.change === "decreased" ? "#34d399" : "#f87171" }}>
                      {c.change === "decreased" ? "↓" : "↑"}{c.changePercent}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {result.priceChanges.length === 0 && result.stockChanges.length === 0 && (
              <div className="text-center py-8">
                <Check size={28} className="mx-auto mb-2" style={{ color: "#34d399" }} />
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>All prices match - no changes needed</p>
              </div>
            )}
          </div>
        )}

        {!result && !syncMutation.isLoading && (
          <div className="text-center py-12">
            <RefreshCw size={32} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.08)" }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Click the button to check all supplier prices</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>Checks up to 15 products per scan to stay within limits</p>
          </div>
        )}
      </div>
    
  );
}
export default PriceSyncPage;
