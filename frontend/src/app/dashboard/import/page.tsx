"use client";
// ============================================================
// Product Import — Full Wizard
// Path: frontend/src/app/dashboard/import/page.tsx
//
// Step 1: Paste URL
// Step 2: See score + product preview  
// Step 3: Choose marketing angle
// Step 4: Import reviews (optional)
// Step 5: Set price + confirm import
// ============================================================
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation }             from "@tanstack/react-query";
import DashboardLayout             from "@/components/layout/DashboardLayout";
import { ProductScoreCard }        from "@/components/scraper/ProductScoreCard";
import { AngleSelector }           from "@/components/scraper/AngleSelector";
import { ReviewImportPreview }     from "@/components/scraper/ReviewImportPreview";
import { api }                     from "@/lib/api";
import { useAuthStore }            from "@/store/auth.store";
import { useRouter }               from "next/navigation";
import {
  Link, Search, Package, ShoppingBag,
  ChevronRight, Loader2, Star, Check,
  ArrowLeft, Zap,
} from "lucide-react";
import toast from "react-hot-toast";

type Step = "url" | "score" | "angle" | "confirm";

const STEP_LABELS = ["Paste URL", "Product Score", "Selling Angle", "Import"];

const PLATFORMS = [
  { name: "AliExpress", icon: "🛒", example: "aliexpress.com/item/..." },
  { name: "Amazon",     icon: "📦", example: "amazon.com/dp/..." },
  { name: "Temu",       icon: "🎁", example: "temu.com/..." },
  { name: "Jumia",      icon: "🛍️", example: "jumia.com.ng/..." },
  { name: "Konga",      icon: "🏪", example: "konga.com/product/..." },
  { name: "Any site",   icon: "🌐", example: "Any product URL works" },
];

export default function ImportPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const router  = useRouter();

  const [step, setStep]               = useState<Step>("url");
  const [url, setUrl]                 = useState("");
  const [result, setResult]           = useState<any>(null);          // score + angles + scraped
  const [selectedAngle, setAngle]     = useState<string | null>(null);
  const [sellingPrice, setSellingPrice] = useState("");
  const [reviews, setReviews]         = useState<any[]>([]);
  const [reviewsImported, setRevImported] = useState(false);
  const [loadingReviews, setLoadingRev]   = useState(false);
  const [importDone, setImportDone]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Step 1 → 2: Analyse
  const analyseMutation = useMutation({
    mutationFn: async () => api.post("/products/intel/analyse", { url: url.trim(), storeId }),
    onSuccess: async (res) => {
      const data = res.data.data;
      setResult(data);
      setSellingPrice(String(data.score.pricing.suggestedLocal));
      setStep("score");

      // Auto-fetch reviews in background
      setLoadingRev(true);
      try {
        const revRes = await api.post("/products/intel/import-reviews", {
          url: url.trim(), storeId,
          productId: "preview", // we'll attach to real product on confirm
          count: 8,
        });
        setReviews(revRes.data.data?.reviews || []);
      } catch {}
      finally { setLoadingRev(false); }
    },
    onError: () => toast.error("Could not analyse that URL — try another product page"),
  });

  // Final import
  const importMutation = useMutation({
    mutationFn: async () => api.post("/products/intel/import-confirmed", {
      storeId,
      scrapedData:    result.scrapedData,
      selectedAngle,
      sellingPrice:   Number(sellingPrice),
      importReviews:  reviews.length > 0,
    }),
    onSuccess: (res) => {
      setImportDone(true);
      toast.success(res.data.message);
      setTimeout(() => router.push("/dashboard/products"), 2000);
    },
    onError: () => toast.error("Import failed — please try again"),
  });

  const handleImportReviews = () => {
    setRevImported(true);
    toast.success(`${reviews.length} reviews will be imported with the product`);
  };

  const stepIndex = ["url","score","angle","confirm"].indexOf(step);
  const sym       = result?.score?.pricing?.symbol || "₦";

  return (
    <DashboardLayout>
      <div className="min-h-full" style={{ background: "#07070e" }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center gap-3 mb-5">
            {step !== "url" && (
              <button onClick={() => {
                if (step === "score")   setStep("url");
                if (step === "angle")  setStep("score");
                if (step === "confirm") setStep("angle");
              }}
                className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                <ArrowLeft size={15} />
              </button>
            )}
            <div>
              <h1 className="text-xl font-semibold text-white">Import Product</h1>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Paste any product URL — KAI scores, angles, and imports it
              </p>
            </div>
          </div>

          {/* Step progress */}
          <div className="flex items-center gap-0">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      background: i <= stepIndex ? "#7c3aed" : "rgba(255,255,255,0.07)",
                      color:      i <= stepIndex ? "#fff"    : "rgba(255,255,255,0.25)",
                    }}>
                    {i < stepIndex ? <Check size={12} /> : i + 1}
                  </div>
                  <p className="text-xs mt-1 whitespace-nowrap"
                    style={{ color: i === stepIndex ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)", fontSize: "10px" }}>
                    {label}
                  </p>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className="h-px w-12 mx-1 mb-4 transition-all"
                    style={{ background: i < stepIndex ? "#7c3aed" : "rgba(255,255,255,0.08)" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-8">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: URL ──────────────────────────────────── */}
            {step === "url" && (
              <motion.div key="url"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>

                {/* URL input */}
                <div className="rounded-2xl p-5 mb-5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-sm font-medium text-white mb-1">Paste the product URL</p>
                  <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                    KAI will score it, build the page, and import reviews — automatically
                  </p>
                  <div className="flex gap-3">
                    <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <Link size={15} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                      <input ref={inputRef} value={url} onChange={e => setUrl(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && url && analyseMutation.mutate()}
                        placeholder="https://www.aliexpress.com/item/..."
                        className="flex-1 bg-transparent outline-none text-sm"
                        style={{ color: "rgba(255,255,255,0.85)" }} />
                    </div>
                    <button
                      disabled={!url.trim() || analyseMutation.isLoading}
                      onClick={() => analyseMutation.mutate()}
                      className="flex items-center gap-2 px-5 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
                      style={{
                        background: url.trim() ? "linear-gradient(135deg, #7c3aed, #5b21b6)" : "rgba(255,255,255,0.05)",
                        color:      url.trim() ? "#fff" : "rgba(255,255,255,0.25)",
                        boxShadow:  url.trim() ? "0 4px 20px rgba(124,58,237,0.3)" : "none",
                      }}>
                      {analyseMutation.isLoading
                        ? <><Loader2 size={14} className="animate-spin" />Analysing...</>
                        : <><Zap size={14} />Analyse</>}
                    </button>
                  </div>
                </div>

                {/* Loading state */}
                {analyseMutation.isLoading && (
                  <motion.div className="rounded-2xl p-6 text-center"
                    style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <motion.div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: "rgba(124,58,237,0.2)" }}
                      animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <Zap size={24} style={{ color: "#a78bfa" }} />
                    </motion.div>
                    <p className="text-sm font-medium text-white mb-1">KIRO is analysing the product</p>
                    <div className="space-y-1 mt-3">
                      {["Scraping product data...", "Scoring for your market...", "Generating selling angles...", "Fetching supplier reviews..."].map((t, i) => (
                        <motion.p key={i} className="text-xs"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          transition={{ delay: i * 1.2 }}>{t}</motion.p>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Supported platforms */}
                {!analyseMutation.isLoading && (
                  <div>
                    <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Works with
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {PLATFORMS.map(p => (
                        <div key={p.name} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <span className="text-lg">{p.icon}</span>
                          <div>
                            <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>{p.name}</p>
                            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px" }}>{p.example}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEP 2: SCORE ─────────────────────────────────── */}
            {step === "score" && result && (
              <motion.div key="score" className="space-y-5"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>

                {/* Product name + image */}
                <div className="flex items-center gap-4 rounded-2xl p-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {result.scrapedData.images?.[0] && (
                    <img src={result.scrapedData.images[0]} alt=""
                      className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }} />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">{result.scrapedData.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {result.scrapedData.supplierName} · {result.scrapedData.estimatedShippingDays} day shipping
                    </p>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {result.scrapedData.shortDescription}
                    </p>
                  </div>
                </div>

                {/* Score card */}
                <ProductScoreCard score={result.score} />

                {/* Reviews preview */}
                {(loadingReviews || reviews.length > 0) && (
                  <ReviewImportPreview
                    reviews={reviews}
                    isLoading={loadingReviews}
                    onImport={handleImportReviews}
                    imported={reviewsImported}
                  />
                )}

                {/* CTA */}
                <button
                  onClick={() => setStep("angle")}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)", color: "#fff", boxShadow: "0 8px 24px rgba(124,58,237,0.3)" }}>
                  Choose selling angle
                  <ChevronRight size={16} />
                </button>
              </motion.div>
            )}

            {/* ── STEP 3: ANGLE ─────────────────────────────────── */}
            {step === "angle" && result && (
              <motion.div key="angle" className="space-y-5"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>

                <AngleSelector
                  angles={result.angles}
                  selected={selectedAngle}
                  onSelect={setAngle}
                />

                <button
                  disabled={!selectedAngle}
                  onClick={() => setStep("confirm")}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold transition-all"
                  style={{
                    background: selectedAngle ? "linear-gradient(135deg, #7c3aed, #5b21b6)" : "rgba(255,255,255,0.05)",
                    color:      selectedAngle ? "#fff" : "rgba(255,255,255,0.25)",
                    boxShadow:  selectedAngle ? "0 8px 24px rgba(124,58,237,0.3)" : "none",
                  }}>
                  Continue to import
                  <ChevronRight size={16} />
                </button>
              </motion.div>
            )}

            {/* ── STEP 4: CONFIRM ───────────────────────────────── */}
            {step === "confirm" && result && (
              <motion.div key="confirm" className="space-y-4"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>

                <div className="rounded-2xl p-5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-sm font-semibold text-white mb-4">Review before importing</p>

                  {/* Summary rows */}
                  <div className="space-y-3">
                    {[
                      { label: "Product",     value: result.scrapedData.name },
                      { label: "Score",       value: `${result.score.total}/100 — ${result.score.grade} (${result.score.verdict})` },
                      { label: "Angle",       value: result.angles.find((a: any) => a.id === selectedAngle)?.title || "KAI decides" },
                      { label: "Reviews",     value: reviewsImported ? `${reviews.length} reviews will be imported` : "No reviews" },
                    ].map(row => (
                      <div key={row.label} className="flex items-start gap-3 py-2.5 border-b"
                        style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        <span className="text-xs w-20 flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>{row.label}</span>
                        <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>{row.value}</span>
                      </div>
                    ))}

                    {/* Price input */}
                    <div className="flex items-center gap-3 py-2.5">
                      <span className="text-xs w-20 flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>Selling price</span>
                      <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{sym}</span>
                        <input type="number" value={sellingPrice}
                          onChange={e => setSellingPrice(e.target.value)}
                          className="flex-1 bg-transparent outline-none text-sm font-bold text-white" />
                      </div>
                      <span className="text-xs" style={{ color: result.score.color }}>
                        {sellingPrice ? `${Math.round(((Number(sellingPrice) - result.score.pricing.supplierLocal) / Number(sellingPrice)) * 100)}% margin` : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Import button */}
                {!importDone ? (
                  <button onClick={() => importMutation.mutate()}
                    disabled={!sellingPrice || importMutation.isLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-base font-semibold transition-all"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
                      color:      "#fff",
                      boxShadow:  "0 8px 32px rgba(124,58,237,0.35)",
                    }}>
                    {importMutation.isLoading
                      ? <><Loader2 size={16} className="animate-spin" />Importing...</>
                      : <><ShoppingBag size={16} />Import to My Store</>}
                  </button>
                ) : (
                  <motion.div className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl"
                    style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)" }}
                    initial={{ scale: 0.96 }} animate={{ scale: 1 }}>
                    <Check size={18} style={{ color: "#34d399" }} />
                    <span className="text-base font-semibold" style={{ color: "#34d399" }}>
                      Product imported — redirecting...
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
