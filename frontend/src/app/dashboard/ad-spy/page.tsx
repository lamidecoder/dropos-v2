"use client";
﻿"use client";
// Path: frontend/src/app/dashboard/ad-spy/page.tsx
// Also accessible via KAI: "Show me winning ads for hair products"
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Search, Zap, TrendingUp, Eye, Lightbulb, AlertCircle, Loader2, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

const PLATFORMS = [
  { id: "all",       label: "All Platforms", icon: "🌐" },
  { id: "tiktok",    label: "TikTok",        icon: "🎵" },
  { id: "instagram", label: "Instagram",     icon: "📸" },
  { id: "facebook",  label: "Facebook",      icon: "👥" },
];

const QUICK_SEARCHES = [
  "Hair products", "Beauty & skincare", "Fashion accessories",
  "Kitchen gadgets", "Phone accessories", "Baby products",
  "Health supplements", "Fitness gear",
];

export default function AdSpyPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const [query, setQuery]       = useState("");
  const [platform, setPlatform] = useState("all");
  const [result, setResult]     = useState<any>(null);
  const [copied, setCopied]     = useState<string | null>(null);

  const spy = useMutation({
    mutationFn: async () => api.post("/intel/ad-spy", { query, platform, storeId }),
    onSuccess: r => setResult(r.data.data),
    onError:   () => toast.error("Ad spy failed — try a different query"),
  });

  const copyHook = (hook: string) => {
    navigator.clipboard.writeText(hook);
    setCopied(hook);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Hook copied!");
  };

  const engagementColor = (e: string) => e === "viral" ? "#a78bfa" : e === "high" ? "#34d399" : e === "medium" ? "#fbbf24" : "#60a5fa";

  return (
    
      <div className="min-h-screen p-6" style={{ background: "#07070e" }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-white mb-0.5">Ad Spy</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Discover winning ads & hooks in your market right now — or Ask KIRO in chat
            </p>
          </div>

          {/* Search bar */}
          <div className="rounded-2xl p-5 mb-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex gap-3 mb-4">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <Search size={15} style={{ color: "rgba(255,255,255,0.3)" }} />
                <input value={query} onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && query && spy.mutate()}
                  placeholder="e.g. 'hair products' or 'kitchen gadgets'"
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "rgba(255,255,255,0.85)" }} />
              </div>
              <button disabled={!query || spy.isLoading} onClick={() => spy.mutate()}
                className="flex items-center gap-2 px-5 rounded-xl text-sm font-semibold flex-shrink-0 transition-all"
                style={{ background: query ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "rgba(255,255,255,0.05)", color: query ? "#fff" : "rgba(255,255,255,0.25)" }}>
                {spy.isLoading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                {spy.isLoading ? "Spying..." : "Spy Now"}
              </button>
            </div>

            {/* Platform */}
            <div className="flex gap-2 mb-4">
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => setPlatform(p.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{ background: platform === p.id ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)", border: platform === p.id ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(255,255,255,0.06)", color: platform === p.id ? "#a78bfa" : "rgba(255,255,255,0.45)" }}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>

            {/* Quick searches */}
            <div className="flex flex-wrap gap-2">
              <p className="text-xs self-center" style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px" }}>Quick:</p>
              {QUICK_SEARCHES.map(q => (
                <button key={q} onClick={() => { setQuery(q); setTimeout(() => spy.mutate(), 50); }}
                  className="px-2.5 py-1 rounded-lg text-xs transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)" }}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div className="space-y-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                {/* Trend insight banner */}
                {result.trendInsight && (
                  <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
                    style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
                    <TrendingUp size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#a78bfa" }} />
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{result.trendInsight}</p>
                  </div>
                )}

                {/* Winning Hooks */}
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="px-5 py-4" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-sm font-semibold text-white">Winning Hooks</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Copy these — they're proven to work</p>
                  </div>
                  <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    {(result.topHooks || []).map((hook: any, i: number) => (
                      <motion.div key={i} className="px-5 py-4 flex items-start gap-3"
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: `${engagementColor(hook.engagement)}15`, color: engagementColor(hook.engagement), fontSize: "10px" }}>
                              {hook.platform} · {hook.engagement}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-white mb-1">"{hook.hook}"</p>
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{hook.whyWorks}</p>
                        </div>
                        <button onClick={() => copyHook(hook.hook)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-all"
                          style={{ background: copied === hook.hook ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.05)" }}>
                          {copied === hook.hook ? <Check size={13} style={{ color: "#34d399" }} /> : <Copy size={13} style={{ color: "rgba(255,255,255,0.4)" }} />}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Winning Angles + Best Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Winning Angles</p>
                    <div className="space-y-2">
                      {(result.winningAngles || []).map((a: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <p className="text-xs font-medium text-white">{a.angle}</p>
                          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{a.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Avoid These Mistakes</p>
                    <div className="space-y-2">
                      {(result.avoidMistakes || []).map((m: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <AlertCircle size={11} className="mt-0.5 flex-shrink-0" style={{ color: "#f87171" }} />
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{m}</p>
                        </div>
                      ))}
                    </div>
                    {result.bestTimeToRun && (
                      <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Best time to run</p>
                        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>{result.bestTimeToRun}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!result && !spy.isLoading && (
            <div className="text-center py-16">
              <Eye size={36} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.08)" }} />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Search for any product or niche above</p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>Or Ask KIRO in chat: "Show me winning ads for hair products"</p>
            </div>
          )}
        </div>
      </div>
    
  );
}
