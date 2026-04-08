"use client";
// Path: frontend/src/app/dashboard/forecast/page.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { TrendingUp, TrendingDown, Minus, Zap, Search, Package, ExternalLink, ShoppingBag, Loader2, Check, AlertCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ForecastPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const router  = useRouter();
  const [tab, setTab]         = useState<"forecast" | "scraper">("forecast");
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scraped, setScraped]     = useState<any>(null);
  const [sellingPrice, setSellingPrice] = useState("");
  const [importing, setImporting]       = useState(false);
  const [imported, setImported]         = useState(false);

  const { data: forecast, isLoading: fLoading } = useQuery({
    queryKey: ["forecast", storeId],
    queryFn: async () => { const r = await api.get(`/super/forecast?storeId=${storeId}`); return r.data.data; },
    enabled: !!storeId && tab === "forecast",
    staleTime: 30 * 60 * 1000,
  });

  const scrapeMutation = useMutation({
    mutationFn: async () => api.post("/super/scrape", { url: scrapeUrl, storeId }),
    onSuccess: (res) => {
      setScraped(res.data.data);
      setSellingPrice(res.data.data.suggestedLocalPrice?.replace(/[^\d]/g, "") || "");
    },
    onError: () => toast.error("Could not extract product — try a different URL"),
  });

  const handleImport = async () => {
    if (!scraped) return;
    setImporting(true);
    try {
      await api.post("/super/import", {
        storeId,
        product: { ...scraped, sellingPrice },
      });
      setImported(true);
      setTimeout(() => router.push("/dashboard/products"), 1500);
    } catch { toast.error("Import failed"); }
    finally { setImporting(false); }
  };

  const sym = forecast?.currency || "₦";
  const trend = forecast?.historical?.trend;

  return (
    <DashboardLayout>
      <div className="min-h-screen" style={{ background: "#07070e" }}>

        {/* Header + Tabs */}
        <div className="px-6 pt-6 pb-0">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h1 className="text-xl font-semibold text-white mb-0.5">Intelligence</h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Revenue forecast + product import from any website</p>
            </div>
            <div className="flex gap-1 p-1 rounded-xl mb-0.5" style={{ background: "rgba(255,255,255,0.05)" }}>
              {([["forecast","📈 Forecast"],["scraper","🔗 Import from Web"]] as const).map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)}
                  className="px-4 py-1.5 rounded-lg text-sm transition-all"
                  style={{ background: tab === id ? "rgba(124,58,237,0.3)" : "transparent", color: tab === id ? "#a78bfa" : "rgba(255,255,255,0.4)" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">

            {/* FORECAST TAB */}
            {tab === "forecast" && (
              <motion.div key="forecast" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {fLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <Loader2 size={28} className="animate-spin mx-auto mb-3" style={{ color: "#7c3aed" }} />
                      <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>KAI is analysing your revenue trends...</p>
                    </div>
                  </div>
                ) : forecast ? (
                  <div className="space-y-5">

                    {/* 30-day projection hero */}
                    <div className="rounded-2xl p-6"
                      style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(91,33,182,0.08))", border: "1px solid rgba(124,58,237,0.2)" }}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>Next 30 Days Forecast</p>
                          <div className="flex items-end gap-3">
                            <p className="text-3xl font-black text-white">{sym}{Math.round(forecast.forecast.next30DaysMid).toLocaleString()}</p>
                            <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>projected</p>
                          </div>
                          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                            Range: {sym}{Math.round(forecast.forecast.next30DaysLow).toLocaleString()} — {sym}{Math.round(forecast.forecast.next30DaysHigh).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 justify-end mb-1">
                            {trend === "growing" ? <TrendingUp size={14} style={{ color: "#34d399" }} />
                              : trend === "declining" ? <TrendingDown size={14} style={{ color: "#f87171" }} />
                              : <Minus size={14} style={{ color: "#fbbf24" }} />}
                            <span className="text-sm font-medium capitalize" style={{ color: trend === "growing" ? "#34d399" : trend === "declining" ? "#f87171" : "#fbbf24" }}>
                              {trend}
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {forecast.forecast.confidence}% confidence
                          </p>
                        </div>
                      </div>

                      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {forecast.forecast.trendSummary}
                      </p>
                    </div>

                    {/* Weekly chart */}
                    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Weekly Breakdown</p>

                      <div className="grid grid-cols-4 gap-3">
                        {forecast.forecast.weeklyProjections.map((w: any, i: number) => (
                          <motion.div key={i} className="rounded-xl p-3 text-center"
                            style={{ background: "rgba(255,255,255,0.04)" }}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}>
                            <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>{w.week}</p>
                            <p className="text-sm font-bold text-white">{sym}{Math.round(w.mid).toLocaleString()}</p>
                            <div className="mt-2 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                              <motion.div className="h-full rounded-full" style={{ background: "#7c3aed" }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(w.mid / forecast.forecast.next30DaysHigh) * 100}%` }}
                                transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }} />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Actions + Risks */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl p-4" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: "#34d399", fontSize: "10px" }}>
                          <Zap size={11} />Top Action
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>{forecast.forecast.topAction}</p>
                        {forecast.forecast.opportunities?.map((o: string, i: number) => (
                          <p key={i} className="text-xs mt-2 flex items-start gap-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                            <ArrowRight size={10} className="mt-0.5 flex-shrink-0" style={{ color: "#34d399" }} />{o}
                          </p>
                        ))}
                      </div>
                      <div className="rounded-2xl p-4" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: "#fbbf24", fontSize: "10px" }}>
                          <AlertCircle size={11} />Watch Out
                        </p>
                        {forecast.forecast.riskFactors?.map((r: string, i: number) => (
                          <p key={i} className={`text-xs ${i > 0 ? "mt-2" : ""} leading-relaxed`} style={{ color: "rgba(255,255,255,0.55)" }}>
                            ⚠️ {r}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Historical sparkline */}
                    {forecast.historical.weeks.length > 0 && (
                      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Historical (Last 13 Weeks)</p>
                        <div className="flex items-end gap-1 h-16">
                          {forecast.historical.weeks.map((w: any, i: number) => {
                            const max = Math.max(...forecast.historical.weeks.map((x: any) => x.revenue));
                            const pct = max > 0 ? (w.revenue / max) * 100 : 0;
                            return (
                              <motion.div key={i} title={`${w.week}: ${sym}${Math.round(w.revenue).toLocaleString()}`}
                                className="flex-1 rounded-t-md min-w-0 cursor-pointer transition-opacity hover:opacity-80"
                                style={{ background: "rgba(124,58,237,0.6)" }}
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(pct, 4)}%` }}
                                transition={{ delay: i * 0.03, duration: 0.5 }} />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </motion.div>
            )}

            {/* SCRAPER TAB */}
            {tab === "scraper" && (
              <motion.div key="scraper" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* URL input */}
                <div className="rounded-2xl p-5 mb-5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-sm font-medium text-white mb-1">Paste any product URL</p>
                  <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Works with AliExpress, Amazon, Temu, Jumia, Konga, Instagram posts, or any product page
                  </p>
                  <div className="flex gap-3">
                    <input value={scrapeUrl} onChange={e => setScrapeUrl(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && scrapeMutation.mutate()}
                      placeholder="https://www.aliexpress.com/item/..."
                      className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }} />
                    <button
                      disabled={!scrapeUrl || scrapeMutation.isLoading}
                      onClick={() => scrapeMutation.mutate()}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all flex-shrink-0"
                      style={{ background: "#7c3aed", color: "#fff", opacity: (!scrapeUrl || scrapeMutation.isLoading) ? 0.6 : 1 }}>
                      {scrapeMutation.isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                      {scrapeMutation.isLoading ? "Extracting..." : "Extract"}
                    </button>
                  </div>

                  {/* Supported sites */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}>Works with:</p>
                    {["AliExpress", "Amazon", "Temu", "Jumia", "Konga", "Any website"].map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-xs"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Scraped product preview */}
                <AnimatePresence>
                  {scraped && (
                    <motion.div className="rounded-2xl overflow-hidden"
                      style={{ border: "1px solid rgba(124,58,237,0.25)" }}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

                      {/* Product header */}
                      <div className="p-5" style={{ background: "rgba(124,58,237,0.1)" }}>
                        <div className="flex items-start gap-4">
                          {scraped.images?.[0] && (
                            <img src={scraped.images[0]} alt={scraped.name}
                              className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                              style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
                          )}
                          <div className="flex-1">
                            <p className="text-base font-semibold text-white mb-1">{scraped.name}</p>
                            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{scraped.shortDescription}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                              <span>📦 {scraped.supplierName}</span>
                              <span>🚚 {scraped.estimatedShippingDays} days</span>
                              <span>📁 {scraped.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="p-5 grid grid-cols-3 gap-4" style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <div>
                          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>SUPPLIER PRICE</p>
                          <p className="text-lg font-bold text-white">${scraped.originalPrice}</p>
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>≈ {sym}{Math.round(Number(scraped.originalPrice) * 1580).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>SUGGESTED PRICE</p>
                          <p className="text-lg font-bold" style={{ color: "#34d399" }}>{scraped.suggestedLocalPrice}</p>
                          <p className="text-xs" style={{ color: "#34d399" }}>~60% margin</p>
                        </div>
                        <div>
                          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>YOUR SELLING PRICE</p>
                          <div className="flex items-center gap-1">
                            <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{sym}</span>
                            <input value={sellingPrice} onChange={e => setSellingPrice(e.target.value)}
                              type="number" className="flex-1 bg-transparent text-lg font-bold text-white outline-none border-b"
                              style={{ borderColor: "rgba(124,58,237,0.5)", width: "80px" }} />
                          </div>
                        </div>
                      </div>

                      {/* Description preview */}
                      <div className="px-5 py-4" style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>KAI-REWRITTEN DESCRIPTION</p>
                        <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "rgba(255,255,255,0.6)" }}>{scraped.description}</p>
                        {scraped.bulletPoints?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {scraped.bulletPoints.slice(0, 4).map((b: string, i: number) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(124,58,237,0.1)", color: "#a78bfa" }}>✓ {b.slice(0, 40)}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Why it sells */}
                      {scraped.whyItSells && (
                        <div className="px-5 py-3 flex items-start gap-2" style={{ background: "rgba(52,211,153,0.06)", borderTop: "1px solid rgba(52,211,153,0.1)" }}>
                          <Zap size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#34d399" }} />
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{scraped.whyItSells}</p>
                        </div>
                      )}

                      {/* Import button */}
                      <div className="p-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <button onClick={handleImport} disabled={importing || imported}
                          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all"
                          style={{
                            background: imported ? "rgba(52,211,153,0.2)" : "linear-gradient(135deg, #7c3aed, #5b21b6)",
                            color: imported ? "#34d399" : "#fff",
                            boxShadow: imported ? "none" : "0 8px 24px rgba(124,58,237,0.3)",
                          }}>
                          {importing ? <Loader2 size={15} className="animate-spin" />
                            : imported ? <Check size={15} />
                            : <ShoppingBag size={15} />}
                          {importing ? "Importing..." : imported ? "Added to your store!" : "Import to My Store"}
                        </button>
                        {scraped.supplierUrl && (
                          <a href={scraped.supplierUrl} target="_blank"
                            className="w-full flex items-center justify-center gap-1.5 mt-2 text-xs"
                            style={{ color: "rgba(255,255,255,0.3)" }}>
                            <ExternalLink size={10} />View on {scraped.supplierName}
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty state */}
                {!scraped && !scrapeMutation.isLoading && (
                  <div className="text-center py-12">
                    <Package size={40} className="mx-auto mb-4" style={{ color: "rgba(255,255,255,0.08)" }} />
                    <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>Paste a product URL above</p>
                    <p className="text-xs mt-1 max-w-xs mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.2)" }}>
                      KAI will extract the product, rewrite the description for Nigerian market, and suggest a selling price
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
