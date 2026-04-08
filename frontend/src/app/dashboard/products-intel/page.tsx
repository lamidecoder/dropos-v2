"use client";
// Path: frontend/src/app/dashboard/products-intel/page.tsx
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { TrendingUp, Zap, FlaskConical } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductsIntelPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const [activeTab, setActiveTab] = useState<"winners" | "test">("winners");
  const [priceTestForm, setPriceTestForm] = useState({ productId: "", priceA: "", priceB: "" });
  const [loadingWinners, setLoadingWinners] = useState(false);
  const [winners, setWinners] = useState<any[]>([]);

  const fetchWinners = async () => {
    setLoadingWinners(true);
    try {
      const r = await api.get(`/kai/power/winning-products?count=10&storeId=${storeId}`);
      setWinners(r.data.data || []);
    } catch { toast.error("Failed to fetch — try again"); }
    finally { setLoadingWinners(false); }
  };

  const { data: products } = useQuery({
    queryKey: ["products-simple", storeId],
    queryFn: async () => {
      const r = await api.get(`/products?storeId=${storeId}&limit=50`);
      return r.data.data?.products || r.data.data || [];
    },
    enabled: !!storeId && activeTab === "test",
  });

  const priceTestMutation = useMutation({
    mutationFn: async (data: any) => api.post("/features/price-test", { storeId, ...data }),
    onSuccess: () => { toast.success("A/B price test started!"); setPriceTestForm({ productId: "", priceA: "", priceB: "" }); },
  });

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white mb-1">Product Intelligence</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Find winning products and test prices with real data
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: "rgba(255,255,255,0.04)" }}>
          {[["winners","Weekly Winners","🔥"],["test","Price A/B Test","⚗️"]].map(([id,label,icon]) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all"
              style={{
                background: activeTab === id ? "rgba(124,58,237,0.2)" : "transparent",
                color: activeTab === id ? "#a78bfa" : "rgba(255,255,255,0.4)",
                border: activeTab === id ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
              }}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Weekly Winners */}
        {activeTab === "winners" && (
          <div>
            {!winners.length ? (
              <div className="text-center py-10">
                <TrendingUp size={32} className="mx-auto mb-4" style={{ color: "rgba(255,255,255,0.1)" }} />
                <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Get this week's 10 winning products
                </p>
                <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.25)" }}>
                  KAI searches the web for what's trending right now in your market
                </p>
                <button onClick={fetchWinners} disabled={loadingWinners}
                  className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: "#7c3aed", color: "#fff" }}>
                  {loadingWinners ? "Searching..." : "🔥 Find This Week's Winners"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {winners.map((p: any, i: number) => (
                  <motion.div key={i} className="rounded-xl p-4"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                            style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>#{p.rank}</span>
                          <p className="text-sm font-semibold text-white">{p.name}</p>
                        </div>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{p.category}</p>
                      </div>
                      <span className="text-xs font-medium">{p.verdict}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {[["Cost","₦"+(p.supplierCostLocal||0).toLocaleString()],["Sell","₦"+(p.recommendedPriceLocal||0).toLocaleString()],["Margin",p.margin+"%"]].map(([l,v]) => (
                        <div key={l} className="text-center p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                          <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"10px" }}>{l}</p>
                          <p className="text-sm font-semibold text-white">{v}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{p.whySelling}</p>
                  </motion.div>
                ))}
                <button onClick={fetchWinners}
                  className="w-full py-2.5 rounded-xl text-sm"
                  style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}>
                  Refresh Winners
                </button>
              </div>
            )}
          </div>
        )}

        {/* Price A/B Test */}
        {activeTab === "test" && (
          <div>
            <div className="rounded-xl p-4 mb-5"
              style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.15)" }}>
              <p className="text-sm font-medium text-white mb-1">How it works</p>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                50% of visitors see Price A, 50% see Price B. After 7 days KAI shows which converted better and recommends switching permanently. Most sellers make 20-40% more revenue from this.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.5)" }}>Choose product</label>
                <select value={priceTestForm.productId}
                  onChange={e => setPriceTestForm(f => ({ ...f, productId: e.target.value }))}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
                  <option value="" style={{ background: "#0d0d1a" }}>Select a product...</option>
                  {(products || []).map((p: any) => (
                    <option key={p.id} value={p.id} style={{ background: "#0d0d1a" }}>
                      {p.name} (₦{Number(p.price).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[["priceA","Price A (current)"],["priceB","Price B (test)"]].map(([key, label]) => (
                  <div key={key}>
                    <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</label>
                    <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>₦</span>
                      <input type="number"
                        value={(priceTestForm as any)[key]}
                        onChange={e => setPriceTestForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder="0"
                        className="flex-1 bg-transparent outline-none text-sm text-white" />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => priceTestMutation.mutate(priceTestForm)}
                disabled={!priceTestForm.productId || !priceTestForm.priceA || !priceTestForm.priceB}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{ background: "#7c3aed", color: "#fff", opacity: (!priceTestForm.productId || !priceTestForm.priceA || !priceTestForm.priceB) ? 0.5 : 1 }}>
                <FlaskConical size={15} />
                Start A/B Price Test
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
