"use client";
// Path: frontend/src/app/dashboard/tiktok-scripts/page.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Film, Clock, Copy, Check, Loader2, Music, Hash, Zap } from "lucide-react";
import toast from "react-hot-toast";

const DURATIONS = [15, 30, 60] as const;
const SECTION_COLORS: Record<string, string> = {
  HOOK: "#a78bfa", PROBLEM: "#f87171", REVEAL: "#34d399",
  "SOCIAL PROOF": "#fbbf24", CTA: "#60a5fa",
};

export default function TikTokScriptsPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const [productName, setProductName] = useState("");
  const [price, setPrice]             = useState("");
  const [duration, setDuration]       = useState<15|30|60>(30);
  const [script, setScript]           = useState<any>(null);
  const [copied, setCopied]           = useState<string | null>(null);

  const { data: products } = useQuery({
    queryKey: ["products-list", storeId],
    queryFn:  async () => { const r = await api.get(`/products?storeId=${storeId}&limit=30`); return r.data.data?.products || []; },
    enabled: !!storeId,
  });

  const generate = useMutation({
    mutationFn: async () => api.post("/intel/tiktok-script", { productName, price: Number(price.replace(/[^\d]/g,"")), storeId, duration }),
    onSuccess: r => setScript(r.data.data),
    onError:   () => toast.error("Script generation failed"),
  });

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied!");
  };

  return (
    
      <div className="min-h-screen p-6" style={{ background: "#07070e" }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-white mb-0.5">TikTok Script Generator</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              KAI writes video scripts built for your market — or ask in chat
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Input panel */}
            <div className="space-y-4">
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Product Details</p>

                {/* Product name or select */}
                <div className="mb-3">
                  <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.45)" }}>Product name</label>
                  <input value={productName} onChange={e => setProductName(e.target.value)}
                    placeholder="e.g. Brazilian Hair Bundle"
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }} />
                  {(products || []).length > 0 && (
                    <select onChange={e => {
                      const p = (products || []).find((x: any) => x.name === e.target.value);
                      if (p) { setProductName(p.name); setPrice(String(p.price)); }
                    }} className="w-full mt-2 rounded-xl px-3 py-2 text-xs outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)" }}>
                      <option value="" style={{ background: "#0d0d1a" }}>Or pick from my store...</option>
                      {(products || []).map((p: any) => <option key={p.id} value={p.name} style={{ background: "#0d0d1a" }}>{p.name}</option>)}
                    </select>
                  )}
                </div>

                <div className="mb-4">
                  <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.45)" }}>Selling price</label>
                  <input value={price} onChange={e => setPrice(e.target.value)}
                    placeholder="₦35,000"
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }} />
                </div>

                <div className="mb-5">
                  <label className="text-xs mb-2 block" style={{ color: "rgba(255,255,255,0.45)" }}>Video duration</label>
                  <div className="flex gap-2">
                    {DURATIONS.map(d => (
                      <button key={d} onClick={() => setDuration(d)}
                        className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                        style={{ background: duration === d ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.04)", border: duration === d ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.07)", color: duration === d ? "#a78bfa" : "rgba(255,255,255,0.5)" }}>
                        {d}s
                      </button>
                    ))}
                  </div>
                </div>

                <button disabled={!productName || !price || generate.isLoading} onClick={() => generate.mutate()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: (productName && price) ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "rgba(255,255,255,0.05)", color: (productName && price) ? "#fff" : "rgba(255,255,255,0.25)" }}>
                  {generate.isLoading ? <><Loader2 size={14} className="animate-spin" />Writing script...</> : <><Film size={14} />Generate Script</>}
                </button>
              </div>
            </div>

            {/* Script output */}
            <div>
              <AnimatePresence>
                {script && (
                  <motion.div className="space-y-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Hook */}
                    <div className="rounded-2xl p-4" style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold" style={{ color: "#a78bfa" }}>⚡ HOOK — first 2 seconds</p>
                        <button onClick={() => copy(script.hook, "hook")} className="w-6 h-6 flex items-center justify-center rounded">
                          {copied === "hook" ? <Check size={11} style={{ color: "#34d399" }} /> : <Copy size={11} style={{ color: "rgba(255,255,255,0.3)" }} />}
                        </button>
                      </div>
                      <p className="text-base font-bold text-white">"{script.hook}"</p>
                    </div>

                    {/* Sections */}
                    {(script.sections || []).map((s: any, i: number) => {
                      const color = SECTION_COLORS[s.label] || "#60a5fa";
                      return (
                        <motion.div key={i} className="rounded-xl p-4" style={{ background: `${color}08`, border: `1px solid ${color}20` }}
                          initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${color}20`, color }}>
                              {s.time}
                            </span>
                            <span className="text-xs font-semibold" style={{ color }}>{s.label}</span>
                          </div>
                          <p className="text-xs mb-1 text-white">{s.script}</p>
                          <p className="text-xs italic" style={{ color: "rgba(255,255,255,0.35)" }}>📹 {s.action}</p>
                          {s.tip && <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>💡 {s.tip}</p>}
                        </motion.div>
                      );
                    })}

                    {/* Metadata */}
                    <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      {script.soundSuggestion && <p className="text-xs flex items-center gap-2" style={{ color: "rgba(255,255,255,0.55)" }}><Music size={11} style={{ color: "#a78bfa" }} />{script.soundSuggestion}</p>}
                      {script.postTime && <p className="text-xs flex items-center gap-2" style={{ color: "rgba(255,255,255,0.55)" }}><Clock size={11} style={{ color: "#fbbf24" }} />{script.postTime}</p>}
                      {script.hashtags && <p className="text-xs flex items-center gap-2 flex-wrap" style={{ color: "#60a5fa" }}><Hash size={11} />{script.hashtags.join(" ")}</p>}
                    </div>

                    {/* Hook variants */}
                    {script.hookVariants?.length > 0 && (
                      <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Hook Variants to Test</p>
                        {script.hookVariants.map((h: string, i: number) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                            <p className="text-xs text-white">"{h}"</p>
                            <button onClick={() => copy(h, `v${i}`)} className="flex-shrink-0">
                              {copied === `v${i}` ? <Check size={11} style={{ color: "#34d399" }} /> : <Copy size={11} style={{ color: "rgba(255,255,255,0.25)" }} />}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {!script && !generate.isLoading && (
                <div className="h-full flex items-center justify-center py-16 text-center">
                  <div>
                    <Film size={36} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.08)" }} />
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Your script appears here</p>
                    <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>Or Ask KIRO: "Write TikTok script for my hair bundle"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    
  );
}
