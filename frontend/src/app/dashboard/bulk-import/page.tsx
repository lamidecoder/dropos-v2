"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { Link2, Loader2, Package, Check, Download, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const PRICING_RULES = [
  { id: "2x",   label: "2× Cost",   desc: "50% margin", color: "#60a5fa" },
  { id: "2.5x", label: "2.5× Cost", desc: "60% margin", color: "#a78bfa", popular: true },
  { id: "3x",   label: "3× Cost",   desc: "66% margin", color: "#34d399" },
];

const GRADE_CONFIG: Record<string,{color:string;bg:string;label:string}> = {
  A: { color:"#10B981", bg:"rgba(16,185,129,0.1)",  label:"Excellent" },
  B: { color:"#60a5fa", bg:"rgba(96,165,250,0.1)",  label:"Good"      },
  C: { color:"#fbbf24", bg:"rgba(251,191,36,0.1)",  label:"Average"   },
  D: { color:"#fb923c", bg:"rgba(251,146,60,0.1)",  label:"Below avg" },
  F: { color:"#f87171", bg:"rgba(248,113,113,0.1)", label:"Skip"      },
};

export default function BulkImportPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = isDark
    ? { card:"#181230", border:"rgba(255,255,255,0.06)", text:"#F0ECFF", muted:"rgba(240,236,255,0.45)", faint:"rgba(255,255,255,0.03)", input:"rgba(255,255,255,0.05)", inputBdr:"rgba(255,255,255,0.08)" }
    : { card:"#ffffff", border:"rgba(107,53,232,0.1)",  text:"#130D2E", muted:"rgba(19,13,46,0.5)",    faint:"rgba(107,53,232,0.03)", input:"rgba(107,53,232,0.04)", inputBdr:"rgba(107,53,232,0.12)" };

  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const [storeUrl, setStoreUrl]   = useState("");
  const [products, setProducts]   = useState<any[]>([]);
  const [selected, setSelected]   = useState<Set<number>>(new Set());
  const [pricingRule, setPricing] = useState("2.5x");
  const [imported, setImported]   = useState(false);

  const scanMut = useMutation({
    mutationFn: () => api.post("/intel/bulk-import", { storeUrl, storeId }),
    onSuccess:  r => {
      const prods = r.data.data || [];
      setProducts(prods);
      setSelected(new Set(prods.map((_: any, i: number) => i).filter((i: number) => !["D","F"].includes(prods[i].quickScore))));
      setImported(false);
    },
    onError: () => toast.error("Could not scan that URL — try a direct product or store page"),
  });

  const importMut = useMutation({
    mutationFn: () => api.post("/intel/bulk-import/confirm", {
      storeId,
      products: Array.from(selected).map(i => products[i]),
      pricingRule,
    }),
    onSuccess: r => { setImported(true); toast.success(`${r.data.data?.imported || selected.size} products imported!`); },
    onError:   () => toast.error("Import failed, please try again"),
  });

  const toggle    = (i: number) => setSelected(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const selectAll  = () => setSelected(new Set(products.map((_, i) => i)));
  const selectBest = () => setSelected(new Set(products.map((_, i) => i).filter(i => ["A","B"].includes(products[i].quickScore))));

  return (
    <div className="max-w-3xl" style={{ color: t.text }}>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight mb-1" style={{ color: t.text }}>Bulk Import</h1>
        <p className="text-sm" style={{ color: t.muted }}>
          Paste any supplier URL — KIRO scans, scores, and prices every product automatically
        </p>
      </div>

      {/* URL input card */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: isDark ? "none" : "0 2px 12px rgba(107,53,232,0.06)" }}>
        <label className="block text-xs font-semibold mb-2.5" style={{ color: t.muted }}>SUPPLIER STORE URL</label>
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: t.input, border: `1px solid ${t.inputBdr}` }}>
            <Link2 size={14} style={{ color: t.muted, flexShrink: 0 }} />
            <input value={storeUrl} onChange={e => setStoreUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && storeUrl && scanMut.mutate()}
              placeholder="https://www.aliexpress.com/store/... or any product/store link"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: t.text }} />
          </div>
          <button disabled={!storeUrl || scanMut.isPending} onClick={() => scanMut.mutate()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold flex-shrink-0 transition-all"
            style={{ background: storeUrl ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : t.faint, color: storeUrl ? "#fff" : t.muted, border: storeUrl ? "none" : `1px solid ${t.border}` }}>
            {scanMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {scanMut.isPending ? "Scanning…" : "Scan Store"}
          </button>
        </div>

        {/* Tip */}
        <p className="text-xs mt-3" style={{ color: t.muted }}>
          Supports AliExpress, Temu, Amazon, 1688, CJDropshipping and most supplier stores
        </p>
      </div>

      {/* Results */}
      {products.length > 0 && (
        <div>
          {/* Summary bar */}
          <div className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between flex-wrap gap-3"
            style={{ background: isDark ? "rgba(124,58,237,0.08)" : "rgba(107,53,232,0.05)", border: `1px solid ${isDark ? "rgba(124,58,237,0.2)" : "rgba(107,53,232,0.1)"}` }}>
            <div className="flex gap-4">
              {Object.entries(GRADE_CONFIG).map(([grade, cfg]) => {
                const count = products.filter(p => p.quickScore === grade).length;
                if (!count) return null;
                return (
                  <div key={grade} className="flex items-center gap-1.5">
                    <span className="text-xs font-black px-1.5 py-0.5 rounded-md" style={{ background: cfg.bg, color: cfg.color }}>{grade}</span>
                    <span className="text-xs" style={{ color: t.muted }}>{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button onClick={selectBest} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}>
                <TrendingUp size={10} className="inline mr-1" />A & B only
              </button>
              <button onClick={selectAll} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: t.faint, color: t.muted, border: `1px solid ${t.border}` }}>
                Select all
              </button>
              <span className="text-xs self-center font-semibold" style={{ color: "#a78bfa" }}>{selected.size} selected</span>
            </div>
          </div>

          {/* Pricing rules */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs font-semibold" style={{ color: t.muted }}>PRICING:</span>
            {PRICING_RULES.map(r => (
              <button key={r.id} onClick={() => setPricing(r.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative"
                style={{ background: pricingRule === r.id ? `${r.color}18` : t.faint, color: pricingRule === r.id ? r.color : t.muted, border: `1px solid ${pricingRule === r.id ? r.color + "40" : t.border}` }}>
                {r.label}
                <span style={{ opacity: 0.65 }}>· {r.desc}</span>
                {r.popular && <span className="ml-1 text-[9px] px-1 py-0.5 rounded" style={{ background: "#a78bfa20", color: "#a78bfa" }}>Popular</span>}
              </button>
            ))}
          </div>

          {/* Product list */}
          <div className="space-y-2 mb-5">
            {products.map((p, i) => {
              const isSelected = selected.has(i);
              const grade = GRADE_CONFIG[p.quickScore] || { color:"#888", bg:"rgba(128,128,128,0.1)", label:"?" };
              return (
                <motion.div key={i} onClick={() => toggle(i)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
                  style={{ background: isSelected ? "rgba(124,58,237,0.07)" : t.faint, border: `1px solid ${isSelected ? "rgba(124,58,237,0.25)" : t.border}` }}
                  initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.03 }}>
                  {/* Checkbox */}
                  <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background: isSelected ? "#7c3aed" : t.input, border: `1px solid ${isSelected ? "transparent" : t.inputBdr}` }}>
                    {isSelected && <Check size={11} color="#fff" />}
                  </div>
                  {/* Grade badge */}
                  <span className="text-xs font-black w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: grade.bg, color: grade.color }}>{p.quickScore}</span>
                  {/* Image */}
                  {p.image && <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" style={{ border: `1px solid ${t.border}` }} />}
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: t.text }}>{p.name}</p>
                    <p className="text-xs" style={{ color: t.muted }}>{p.reason}</p>
                  </div>
                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold" style={{ color: t.text }}>₦{(p.suggestedLocalPrice || 0).toLocaleString()}</p>
                    <p className="text-xs font-semibold" style={{ color: "#10B981" }}>{p.marginPercent}% margin</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Import CTA */}
          {!imported ? (
            <button disabled={!selected.size || importMut.isPending} onClick={() => importMut.mutate()}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all"
              style={{ background: selected.size ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : t.faint, color: selected.size ? "#fff" : t.muted, border: selected.size ? "none" : `1px solid ${t.border}`, boxShadow: selected.size ? "0 8px 24px rgba(124,58,237,0.3)" : "none" }}>
              {importMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {importMut.isPending ? "Importing…" : `Import ${selected.size} Product${selected.size !== 1 ? "s" : ""} to Store`}
            </button>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <ShieldCheck size={18} style={{ color: "#10B981" }} />
              <span className="text-sm font-bold" style={{ color: "#10B981" }}>Products imported successfully!</span>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!products.length && !scanMut.isPending && (
        <div className="rounded-2xl p-12 text-center" style={{ background: t.faint, border: `1px dashed ${t.border}` }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: isDark ? "rgba(124,58,237,0.1)" : "rgba(107,53,232,0.06)" }}>
            <Package size={24} style={{ color: isDark ? "#a78bfa" : "#7c3aed" }} />
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: t.text }}>Paste a supplier URL above</p>
          <p className="text-xs" style={{ color: t.muted }}>KIRO will scan all products, score them A–F, and suggest prices that give you 50%+ margins</p>
        </div>
      )}
    </div>
  );
}
