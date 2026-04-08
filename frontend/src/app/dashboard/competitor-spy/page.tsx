"use client";
// ── COMPETITOR SPY ────────────────────────────────────────────
// Path: frontend/src/app/dashboard/competitor-spy/page.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Eye, Search, TrendingUp, Loader2, ChevronRight, AlertCircle, Zap } from "lucide-react";
import toast from "react-hot-toast";

export function CompetitorSpyPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const [url, setUrl]       = useState("");
  const [result, setResult] = useState<any>(null);

  const spy = useMutation({
    mutationFn: async () => api.post("/intel/competitor-spy", { storeUrl: url, storeId }),
    onSuccess: r => setResult(r.data.data),
    onError:   () => toast.error("Could not analyse that store"),
  });

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl" style={{ minHeight: "100vh", background: "#07070e" }}>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white mb-0.5">Competitor Store Spy</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Paste any competitor store URL — or ask KAI "spy on this store: [URL]"
          </p>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Search size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
            <input value={url} onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && url && spy.mutate()}
              placeholder="https://competitor-store.com"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "rgba(255,255,255,0.85)" }} />
          </div>
          <button disabled={!url || spy.isLoading} onClick={() => spy.mutate()}
            className="flex items-center gap-2 px-5 rounded-xl text-sm font-semibold flex-shrink-0"
            style={{ background: url ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "rgba(255,255,255,0.05)", color: url ? "#fff" : "rgba(255,255,255,0.25)" }}>
            {spy.isLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
            {spy.isLoading ? "Analysing..." : "Spy"}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div className="space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              {/* Overview */}
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-base font-bold text-white mb-1">{result.storeName}</p>
                <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>{result.niche}</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Est. Revenue",   value: result.estimatedMonthlyRevenue },
                    { label: "Est. Orders",    value: result.estimatedMonthlyOrders },
                    { label: "Traffic Level",  value: result.trafficLevel },
                  ].map(item => (
                    <div key={item.label} className="p-2.5 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>{item.label}</p>
                      <p className="text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top products */}
              {result.topProducts?.length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="px-4 py-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-sm font-semibold text-white">Their Top Products</p>
                  </div>
                  {result.topProducts.map((p: any, i: number) => (
                    <div key={i} className="flex justify-between px-4 py-2.5 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      <p className="text-sm text-white">{p.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{p.estimatedPrice}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: p.salesLevel === "high" ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.05)", color: p.salesLevel === "high" ? "#34d399" : "rgba(255,255,255,0.4)" }}>{p.salesLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Opportunities */}
              {result.opportunities?.length > 0 && (
                <div className="rounded-2xl p-4" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#34d399", fontSize: "10px" }}>Your Opportunities</p>
                  {result.opportunities.map((o: string, i: number) => (
                    <p key={i} className="text-sm flex items-start gap-2 mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                      <ChevronRight size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#34d399" }} />{o}
                    </p>
                  ))}
                </div>
              )}

              {/* Weaknesses */}
              {result.weaknesses?.length > 0 && (
                <div className="rounded-2xl p-4" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#fbbf24", fontSize: "10px" }}>Their Weaknesses</p>
                  {result.weaknesses.map((w: string, i: number) => (
                    <p key={i} className="text-xs flex items-start gap-2 mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                      <AlertCircle size={10} className="mt-0.5 flex-shrink-0" style={{ color: "#fbbf24" }} />{w}
                    </p>
                  ))}
                </div>
              )}

              {/* Verdict */}
              {result.verdict && (
                <div className="rounded-xl p-4" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#a78bfa", fontSize: "10px" }}>KAI's Take</p>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{result.verdict}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!result && !spy.isLoading && (
          <div className="text-center py-16">
            <Eye size={36} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.08)" }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Paste any competitor store URL above</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>Works with Shopify stores, DropOS stores, any website</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
export default CompetitorSpyPage;
