"use client";
// ── BULK IMPORT PAGE ─────────────────────────────────────────
// Path: frontend/src/app/dashboard/bulk-import/page.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Link, Loader2, Package, Check, Download } from "lucide-react";
import toast from "react-hot-toast";

const PRICING_RULES = [
  { id: "2x",   label: "Cost × 2",   desc: "50% margin" },
  { id: "2.5x", label: "Cost × 2.5", desc: "60% margin ✨" },
  { id: "3x",   label: "Cost × 3",   desc: "66% margin" },
];

const GRADE_COLORS: Record<string, string> = { A: "#34d399", B: "#60a5fa", C: "#fbbf24", D: "#fb923c", F: "#f87171" };

export function BulkImportPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const [storeUrl, setStoreUrl]   = useState("");
  const [products, setProducts]   = useState<any[]>([]);
  const [selected, setSelected]   = useState<Set<number>>(new Set());
  const [pricingRule, setPricing] = useState("2.5x");
  const [imported, setImported]   = useState(false);

  const scanMutation = useMutation({
    mutationFn: async () => api.post("/intel/bulk-import", { storeUrl, storeId }),
    onSuccess:  r => {
      setProducts(r.data.data || []);
      setSelected(new Set(r.data.data?.map((_: any, i: number) => i).filter((_: number, i: number) => r.data.data[i].quickScore !== "F") || []));
    },
    onError: () => toast.error("Could not scan that URL"),
  });

  const importMutation = useMutation({
    mutationFn: async () => api.post("/intel/bulk-import/confirm", {
      storeId,
      products: Array.from(selected).map(i => products[i]),
      pricingRule,
    }),
    onSuccess: r => { setImported(true); toast.success(`${r.data.data.imported} products imported!`); },
  });

  const toggleSelect = (i: number) => setSelected(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const selectAll    = () => setSelected(new Set(products.map((_, i) => i)));
  const selectGood   = () => setSelected(new Set(products.map((_, i) => i).filter(i => ["A","B"].includes(products[i].quickScore))));

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl" style={{ minHeight: "100vh", background: "#07070e" }}>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white mb-0.5">Bulk Import</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Paste any supplier store URL — KAI fetches all products and scores them
          </p>
        </div>

        {/* URL input */}
        <div className="rounded-2xl p-5 mb-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Link size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
              <input value={storeUrl} onChange={e => setStoreUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && storeUrl && scanMutation.mutate()}
                placeholder="https://www.aliexpress.com/store/... or any supplier URL"
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "rgba(255,255,255,0.85)" }} />
            </div>
            <button disabled={!storeUrl || scanMutation.isLoading} onClick={() => scanMutation.mutate()}
              className="flex items-center gap-2 px-5 rounded-xl text-sm font-semibold flex-shrink-0"
              style={{ background: storeUrl ? "#7c3aed" : "rgba(255,255,255,0.05)", color: storeUrl ? "#fff" : "rgba(255,255,255,0.25)" }}>
              {scanMutation.isLoading ? <Loader2 size={14} className="animate-spin" /> : <Package size={14} />}
              {scanMutation.isLoading ? "Scanning..." : "Scan Store"}
            </button>
          </div>
        </div>

        {/* Results */}
        {products.length > 0 && (
          <div>
            {/* Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <button onClick={selectAll} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>Select all</button>
                <button onClick={selectGood} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: "rgba(52,211,153,0.1)", color: "#34d399" }}>Select A & B grades</button>
                <span className="text-xs self-center" style={{ color: "rgba(255,255,255,0.35)" }}>{selected.size} selected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Pricing:</span>
                {PRICING_RULES.map(r => (
                  <button key={r.id} onClick={() => setPricing(r.id)}
                    className="px-2.5 py-1.5 rounded-lg text-xs transition-all"
                    style={{ background: pricingRule === r.id ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)", border: pricingRule === r.id ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(255,255,255,0.06)", color: pricingRule === r.id ? "#a78bfa" : "rgba(255,255,255,0.4)" }}>
                    {r.label} <span style={{ opacity: 0.6 }}>({r.desc})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Product list */}
            <div className="space-y-2 mb-5">
              {products.map((p, i) => {
                const isSelected = selected.has(i);
                return (
                  <motion.div key={i} onClick={() => toggleSelect(i)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
                    style={{ background: isSelected ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.03)", border: isSelected ? "1px solid rgba(124,58,237,0.2)" : "1px solid rgba(255,255,255,0.06)" }}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}>
                    {/* Checkbox */}
                    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: isSelected ? "#7c3aed" : "rgba(255,255,255,0.08)" }}>
                      {isSelected && <Check size={11} style={{ color: "#fff" }} />}
                    </div>
                    {/* Grade */}
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: `${GRADE_COLORS[p.quickScore] || "#888"}18`, color: GRADE_COLORS[p.quickScore] || "#888" }}>
                      {p.quickScore}
                    </div>
                    {/* Image */}
                    {p.image && <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" style={{ border: "1px solid rgba(255,255,255,0.08)" }} />}
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.name}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{p.reason}</p>
                    </div>
                    {/* Pricing */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-white">₦{(p.suggestedLocalPrice || 0).toLocaleString()}</p>
                      <p className="text-xs" style={{ color: "#34d399" }}>{p.marginPercent}%</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Import button */}
            {!imported ? (
              <button disabled={!selected.size || importMutation.isLoading} onClick={() => importMutation.mutate()}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold"
                style={{ background: selected.size ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "rgba(255,255,255,0.05)", color: selected.size ? "#fff" : "rgba(255,255,255,0.25)" }}>
                {importMutation.isLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {importMutation.isLoading ? "Importing..." : `Import ${selected.size} Products`}
              </button>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
                style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <Check size={16} style={{ color: "#34d399" }} />
                <span className="text-sm font-semibold" style={{ color: "#34d399" }}>Products imported successfully!</span>
              </div>
            )}
          </div>
        )}

        {!products.length && !scanMutation.isLoading && (
          <div className="text-center py-16">
            <Package size={36} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.08)" }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Paste a supplier store URL above</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>Or tell KAI: "Import products from this AliExpress store"</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default BulkImportPage;
