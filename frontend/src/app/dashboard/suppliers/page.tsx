"use client";
// Path: frontend/src/app/dashboard/suppliers/page.tsx
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Search, Package, Truck, Star, Loader2, ExternalLink, Zap } from "lucide-react";
import toast from "react-hot-toast";

export function SuppliersPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const [productName, setProductName]   = useState("");
  const [maxPrice, setMaxPrice]         = useState("");
  const [suppliers, setSuppliers]       = useState<any[]>([]);

  const { data: products } = useQuery({
    queryKey: ["products-list", storeId],
    queryFn:  async () => { const r = await api.get(`/products?storeId=${storeId}&limit=30`); return r.data.data?.products || []; },
    enabled:  !!storeId,
  });

  const findMutation = useMutation({
    mutationFn: async () => api.post("/intel/suppliers", { productName, storeId, maxPriceUSD: maxPrice ? Number(maxPrice) : undefined }),
    onSuccess: r => setSuppliers(r.data.data || []),
    onError:   () => toast.error("Could not find suppliers — try different terms"),
  });

  const typeColor = (type: string) => type === "local" ? "#34d399" : "#60a5fa";

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl" style={{ minHeight: "100vh", background: "#07070e" }}>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white mb-0.5">Supplier Finder</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Find alternative suppliers — or Ask KIRO "find me a supplier for hair bundles"
          </p>
        </div>

        <div className="rounded-2xl p-5 mb-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.45)" }}>Product name</label>
              <input value={productName} onChange={e => setProductName(e.target.value)}
                placeholder="e.g. Brazilian Hair Bundle"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }} />
              {(products || []).length > 0 && (
                <select onChange={e => setProductName(e.target.value)}
                  className="w-full mt-1.5 rounded-lg px-3 py-2 text-xs outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
                  <option value="" style={{ background: "#0d0d1a" }}>Or pick from my products...</option>
                  {(products || []).map((p: any) => <option key={p.id} value={p.name} style={{ background: "#0d0d1a" }}>{p.name}</option>)}
                </select>
              )}
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.45)" }}>Max cost (USD, optional)</label>
              <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                placeholder="e.g. 10"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }} />
            </div>
          </div>

          <button disabled={!productName || findMutation.isLoading} onClick={() => findMutation.mutate()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: productName ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "rgba(255,255,255,0.05)", color: productName ? "#fff" : "rgba(255,255,255,0.25)" }}>
            {findMutation.isLoading ? <><Loader2 size={14} className="animate-spin" />Searching...</> : <><Search size={14} />Find Suppliers</>}
          </button>
        </div>

        <AnimatePresence>
          {suppliers.length > 0 && (
            <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {suppliers.map((s: any, i: number) => (
                <motion.div key={i} className="rounded-2xl p-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-white">{s.supplierName}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                          style={{ background: `${typeColor(s.type)}15`, color: typeColor(s.type), fontSize: "10px" }}>
                          {s.type}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{s.platform}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">${s.priceUSD}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>≈ ₦{(s.priceLocal || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                    <span className="flex items-center gap-1"><Truck size={10} />{s.shippingDaysToCountry} days</span>
                    <span className="flex items-center gap-1"><Package size={10} />Min: {s.minimumOrder} unit{s.minimumOrder > 1 ? "s" : ""}</span>
                    <span className="flex items-center gap-1"><Star size={10} />Quality: {s.qualityScore}/10</span>
                    {s.hasLocalWarehouse && <span style={{ color: "#34d399" }}>📦 Local warehouse</span>}
                  </div>

                  <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>{s.whyBetter}</p>

                  {s.url && (
                    <a href={s.url} target="_blank"
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: "#60a5fa" }}>
                      <ExternalLink size={11} />View supplier
                    </a>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!suppliers.length && !findMutation.isLoading && (
          <div className="text-center py-16">
            <Package size={36} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.08)" }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Enter a product name to find suppliers</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>KAI finds both AliExpress and local African suppliers</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
export default SuppliersPage;
