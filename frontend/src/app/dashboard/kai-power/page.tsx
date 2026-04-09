"use client";
// ============================================================
// KAI Power Tools — Complete UI
// Path: frontend/src/app/dashboard/kai-power/page.tsx
// Route: /dashboard/kai-power
// ============================================================
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import {
  Zap, FileText, Image, Megaphone, TrendingUp,
  Calculator, Search, Target, ChevronRight,
  Copy, Check, Loader2, Star, AlertTriangle, ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

const TOOLS = [
  { id: "product-page",     icon: FileText,    label: "Product Page",     color: "#7c3aed", desc: "URL → full CRO page in 60s" },
  { id: "ad-copy",          icon: Megaphone,   label: "Ad Copy",          color: "#0ea5e9", desc: "Facebook, TikTok, WhatsApp ads" },
  { id: "winning-products", icon: TrendingUp,  label: "Winning Products", color: "#10b981", desc: "10 trending products right now" },
  { id: "profit-calc",      icon: Calculator,  label: "Profit Calc",      color: "#f59e0b", desc: "True profit after all fees" },
  { id: "niche-research",   icon: Search,      label: "Niche Research",   color: "#ec4899", desc: "Full niche viability report" },
  { id: "competitor",       icon: Target,      label: "Competitor Spy",   color: "#f97316", desc: "Analyse any competitor store" },
  { id: "buyer-motivation", icon: Star,        label: "Buyer Psychology", color: "#a78bfa", desc: "Why people really buy" },
];

export default function KAIPowerPage() {
  const [activeTool, setActiveTool] = useState("winning-products");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // ── Tool Forms State ────────────────────────────────────────
  const [productUrl, setProductUrl]   = useState("");
  const [productName, setProductName] = useState("");
  const [adPlatform, setAdPlatform]   = useState("whatsapp");
  const [adAudience, setAdAudience]   = useState("");
  const [supplierCost, setSupplierCost] = useState("");
  const [sellPrice, setSellPrice]     = useState("");
  const [adSpend, setAdSpend]         = useState("5000");
  const [nicheQuery, setNicheQuery]   = useState("");
  const [competitorUrl, setCompUrl]   = useState("");
  const [buyerProduct, setBuyerProd]  = useState("");

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      let res: any;
      switch (activeTool) {
        case "product-page":
          res = await api.post("/kai/power/product-page", { url: productUrl, productName });
          break;
        case "ad-copy":
          res = await api.post("/kai/power/ad-copy", { productName, platform: adPlatform, targetAudience: adAudience });
          break;
        case "winning-products":
          res = await api.get("/kai/power/winning-products?count=10");
          break;
        case "profit-calc":
          res = await api.post("/kai/power/profit-calc", { supplierCostUSD: Number(supplierCost), sellingPriceLocal: Number(sellPrice), adSpendDaily: Number(adSpend) });
          break;
        case "niche-research":
          res = await api.post("/kai/power/niche-research", { niche: nicheQuery });
          break;
        case "competitor":
          res = await api.post("/kai/power/competitor", { storeUrl: competitorUrl });
          break;
        case "buyer-motivation":
          res = await api.post("/kai/power/buyer-motivation", { productName: buyerProduct });
          break;
      }
      setResult(res?.data?.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen" style={{ background: "#07070e" }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>K</div>
            <h1 className="text-xl font-semibold text-white">KAI Power Tools</h1>
          </div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Replaces PagePilot + droship.io + Minea — all free in DropOS Pro
          </p>
        </div>

        <div className="flex gap-0 h-full">

          {/* Tool selector sidebar */}
          <div className="w-56 flex-shrink-0 px-3 space-y-1 border-r" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {TOOLS.map(tool => (
              <button key={tool.id} onClick={() => { setActiveTool(tool.id); setResult(null); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all"
                style={{
                  background: activeTool === tool.id ? `${tool.color}18` : "transparent",
                  border: activeTool === tool.id ? `1px solid ${tool.color}30` : "1px solid transparent",
                }}>
                <tool.icon size={14} style={{ color: activeTool === tool.id ? tool.color : "rgba(255,255,255,0.4)", flexShrink: 0 }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: activeTool === tool.id ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)", fontSize: "13px" }}>
                    {tool.label}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px" }}>{tool.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 flex gap-0">

            {/* Input panel */}
            <div className="w-72 flex-shrink-0 px-4 py-4 border-r" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <AnimatePresence mode="wait">
                <motion.div key={activeTool} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>

                  {activeTool === "product-page" && (
                    <ToolForm title="Generate Product Page" onRun={run} loading={loading}>
                      <Input label="Product URL (AliExpress, Amazon, Jumia...)" value={productUrl} onChange={setProductUrl} placeholder="https://www.aliexpress.com/item/..." />
                      <Input label="Or product name" value={productName} onChange={setProductName} placeholder="e.g. Brazilian Hair Bundle 20 inch" />
                    </ToolForm>
                  )}

                  {activeTool === "ad-copy" && (
                    <ToolForm title="Generate Ad Copy" onRun={run} loading={loading}>
                      <Input label="Product name" value={productName} onChange={setProductName} placeholder="e.g. Wireless Earbuds" />
                      <div className="space-y-1">
                        <label className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Platform</label>
                        <select value={adPlatform} onChange={e => setAdPlatform(e.target.value)}
                          className="w-full bg-transparent border rounded-lg px-3 py-2 text-sm outline-none"
                          style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
                          {[["whatsapp","WhatsApp Broadcast"],["tiktok","TikTok Script"],["facebook","Facebook Ad"],["instagram","Instagram Caption"],["google","Google Ads"]].map(([v,l]) => (
                            <option key={v} value={v} style={{ background: "#0d0d1a" }}>{l}</option>
                          ))}
                        </select>
                      </div>
                      <Input label="Target audience (optional)" value={adAudience} onChange={setAdAudience} placeholder="e.g. Nigerian women 25-40" />
                    </ToolForm>
                  )}

                  {activeTool === "winning-products" && (
                    <ToolForm title="Find Winning Products" onRun={run} loading={loading} runLabel="Find Products Now">
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                        KAI searches the web for products trending right now in your market. Updated every time you run it.
                      </p>
                      <Input label="Filter by niche (optional)" value={nicheQuery} onChange={setNicheQuery} placeholder="e.g. hair, electronics, fashion" />
                    </ToolForm>
                  )}

                  {activeTool === "profit-calc" && (
                    <ToolForm title="Profit Calculator" onRun={run} loading={loading} runLabel="Calculate">
                      <Input label="Supplier cost (USD)" value={supplierCost} onChange={setSupplierCost} placeholder="e.g. 12" type="number" />
                      <Input label="Your selling price (₦)" value={sellPrice} onChange={setSellPrice} placeholder="e.g. 35000" type="number" />
                      <Input label="Daily ad spend (₦)" value={adSpend} onChange={setAdSpend} placeholder="e.g. 5000" type="number" />
                    </ToolForm>
                  )}

                  {activeTool === "niche-research" && (
                    <ToolForm title="Niche Research" onRun={run} loading={loading} runLabel="Research Niche">
                      <Input label="Niche to research" value={nicheQuery} onChange={setNicheQuery} placeholder="e.g. hair extensions, sneakers, kitchen gadgets" />
                    </ToolForm>
                  )}

                  {activeTool === "competitor" && (
                    <ToolForm title="Competitor Analysis" onRun={run} loading={loading} runLabel="Analyse Store">
                      <Input label="Competitor store URL" value={competitorUrl} onChange={setCompUrl} placeholder="https://theirstore.com" />
                    </ToolForm>
                  )}

                  {activeTool === "buyer-motivation" && (
                    <ToolForm title="Buyer Psychology" onRun={run} loading={loading} runLabel="Analyse Psychology">
                      <Input label="Product name" value={buyerProduct} onChange={setBuyerProd} placeholder="e.g. Brazilian Hair Bundle" />
                    </ToolForm>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Results panel */}
            <div className="flex-1 px-6 py-4 overflow-y-auto">
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div key="loading" className="flex flex-col items-center justify-center h-64"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Loader2 size={32} style={{ color: "#7c3aed" }} />
                    </motion.div>
                    <p className="mt-4 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                      KIRO is researching...
                    </p>
                  </motion.div>
                )}

                {!loading && !result && (
                  <motion.div key="empty" className="flex flex-col items-center justify-center h-64"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Zap size={32} className="mb-3" style={{ color: "rgba(255,255,255,0.1)" }} />
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Fill in the form and click run
                    </p>
                  </motion.div>
                )}

                {!loading && result && (
                  <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <ResultView tool={activeTool} data={result} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Reusable components ───────────────────────────────────────

function ToolForm({ title, children, onRun, loading, runLabel = "Generate" }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      {children}
      <button onClick={onRun} disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={{ background: "#7c3aed", color: "#fff", opacity: loading ? 0.7 : 1 }}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
        {loading ? "Running..." : runLabel}
      </button>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.8)" }} />
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all"
      style={{ color: copied ? "#34d399" : "rgba(255,255,255,0.4)" }}>
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ── Result Views ──────────────────────────────────────────────
function ResultView({ tool, data }: { tool: string; data: any }) {
  switch (tool) {
    case "product-page":    return <ProductPageResult data={data} />;
    case "ad-copy":         return <AdCopyResult data={data} />;
    case "winning-products": return <WinningProductsResult data={data} />;
    case "profit-calc":     return <ProfitCalcResult data={data} />;
    case "niche-research":  return <NicheResearchResult data={data} />;
    case "competitor":      return <CompetitorResult data={data} />;
    case "buyer-motivation": return <BuyerMotivationResult data={data} />;
    default: return <pre className="text-xs text-white">{JSON.stringify(data, null, 2)}</pre>;
  }
}

function Card({ title, children, action }: any) {
  return (
    <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function ProductPageResult({ data }: any) {
  return (
    <div>
      <Card title="Headline" action={<CopyBtn text={data.headline} />}>
        <p className="text-base font-semibold text-white">{data.headline}</p>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>{data.subheadline}</p>
      </Card>

      <Card title="Short Description" action={<CopyBtn text={data.shortDescription} />}>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.6" }}>{data.shortDescription}</p>
      </Card>

      {data.benefits?.length > 0 && (
        <Card title="Benefits">
          <div className="grid grid-cols-2 gap-3">
            {data.benefits.map((b: any, i: number) => (
              <div key={i} className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-xs font-medium text-white mb-1">{b.title}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{b.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.socialProof && (
        <Card title="Social Proof">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-yellow-400 text-sm">{"★".repeat(Math.floor(data.socialProof.rating))}</div>
            <span className="text-sm text-white">{data.socialProof.rating}/5</span>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>({data.socialProof.reviewCount} reviews)</span>
          </div>
          {data.socialProof.testimonials?.map((t: any, i: number) => (
            <div key={i} className="mb-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-xs text-white mb-0.5">"{t.text}"</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>— {t.name}, {t.location}</p>
            </div>
          ))}
        </Card>
      )}

      {data.faq?.length > 0 && (
        <Card title="FAQ">
          {data.faq.map((f: any, i: number) => (
            <div key={i} className="mb-3">
              <p className="text-sm font-medium text-white mb-1">{f.question}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)", lineHeight: "1.6" }}>{f.answer}</p>
            </div>
          ))}
        </Card>
      )}

      {data.adAngles?.length > 0 && (
        <Card title="Ad Angles">
          {data.adAngles.map((a: any, i: number) => (
            <div key={i} className="flex items-start gap-2 mb-2">
              <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>{a.angle}</span>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{a.hook}</p>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function AdCopyResult({ data }: any) {
  return (
    <div>
      <Card title="Main Copy" action={<CopyBtn text={data.primaryCopy} />}>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.8)", whiteSpace: "pre-wrap" }}>{data.primaryCopy}</p>
      </Card>
      {data.script && (
        <Card title="TikTok Script">
          {Object.entries(data.script).map(([k, v]: any) => (
            <div key={k} className="mb-2">
              <span className="text-xs font-medium capitalize" style={{ color: "#a78bfa" }}>{k}: </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>{v}</span>
            </div>
          ))}
        </Card>
      )}
      {data.variations?.length > 0 && (
        <Card title="Variations">
          {data.variations.map((v: string, i: number) => (
            <div key={i} className="flex items-start justify-between gap-2 mb-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", flex: 1 }}>{v}</p>
              <CopyBtn text={v} />
            </div>
          ))}
        </Card>
      )}
      {data.tips && (
        <Card title="Tip">
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>💡 {data.tips}</p>
        </Card>
      )}
    </div>
  );
}

function WinningProductsResult({ data }: any) {
  const products = Array.isArray(data) ? data : [];
  return (
    <div className="space-y-3">
      {products.map((p: any, i: number) => (
        <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>#{p.rank}</span>
                <p className="text-sm font-semibold text-white">{p.name}</p>
              </div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{p.category}</p>
            </div>
            <span className="text-xs flex-shrink-0" style={{ color: p.trendDirection === "rising" ? "#34d399" : "#fbbf24" }}>
              {p.trendDirection === "rising" ? "↑ Rising" : "→ Stable"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Supplier", value: `₦${Number(p.supplierCostLocal || 0).toLocaleString()}` },
              { label: "Sell for", value: `₦${Number(p.recommendedPriceLocal || 0).toLocaleString()}` },
              { label: "Margin", value: `${p.margin}%` },
            ].map(item => (
              <div key={item.label} className="text-center p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>{item.label}</p>
                <p className="text-sm font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <p className="text-xs mb-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{p.whySelling}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              Window: {p.windowOpportunity}
            </span>
            <span className="text-xs font-medium">{p.verdict}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfitCalcResult({ data }: any) {
  return (
    <div>
      <div className="rounded-xl p-4 mb-4 text-center" style={{ background: data.verdict.includes("🔥") ? "rgba(52,211,153,0.08)" : data.verdict.includes("✅") ? "rgba(96,165,250,0.08)" : "rgba(251,191,36,0.08)", border: `1px solid ${data.verdict.includes("🔥") ? "rgba(52,211,153,0.2)" : "rgba(251,191,36,0.2)"}` }}>
        <p className="text-lg font-bold text-white">{data.breakdown.netProfitPerSale}</p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>profit per sale ({data.breakdown.marginPercent} margin)</p>
        <p className="text-sm mt-2 font-medium">{data.verdict}</p>
      </div>

      <Card title="Cost Breakdown">
        {Object.entries(data.breakdown).filter(([k]) => k !== "netProfitPerSale" && k !== "marginPercent").map(([k, v]: any) => (
          <div key={k} className="flex justify-between py-1.5 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            <span className="text-xs capitalize" style={{ color: "rgba(255,255,255,0.4)" }}>{k.replace(/([A-Z])/g, " $1").trim()}</span>
            <span className="text-xs text-white">{v}</span>
          </div>
        ))}
      </Card>

      <Card title="Monthly Projections">
        {Object.entries(data.projections).map(([k, v]: any) => (
          <div key={k} className="flex justify-between py-1.5 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            <span className="text-xs capitalize" style={{ color: "rgba(255,255,255,0.4)" }}>{k.replace(/([A-Z])/g, " $1").trim()}</span>
            <span className="text-xs text-white font-medium">{v}</span>
          </div>
        ))}
      </Card>

      {data.recommendation && (
        <Card title="KAI Recommendation">
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>💡 {data.recommendation}</p>
        </Card>
      )}
    </div>
  );
}

function NicheResearchResult({ data }: any) {
  return (
    <div>
      <div className="rounded-xl p-4 mb-4 flex items-center justify-between"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div>
          <p className="text-lg font-bold text-white capitalize">{data.niche}</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{data.marketSize}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: "#a78bfa" }}>{data.overallScore}/10</p>
          <p className="text-xs" style={{ color: data.growthDirection === "growing" ? "#34d399" : "#fbbf24" }}>
            {data.growthDirection}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Competition", value: data.competitionLevel, color: data.competitionLevel === "low" ? "#34d399" : data.competitionLevel === "medium" ? "#fbbf24" : "#f87171" },
          { label: "Avg Margin", value: data.avgMargin, color: "#a78bfa" },
          { label: "Entry", value: data.entryDifficulty, color: "#60a5fa" },
        ].map(item => (
          <div key={item.label} className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>{item.label}</p>
            <p className="text-sm font-semibold capitalize" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      {data.topProducts?.length > 0 && (
        <Card title="Top Products">
          {data.topProducts.map((p: any, i: number) => (
            <div key={i} className="flex justify-between py-1.5">
              <span className="text-xs text-white">{p.name}</span>
              <div className="flex gap-3">
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{p.avgPrice}</span>
                <span className="text-xs" style={{ color: "#34d399" }}>{p.margin}</span>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Card title="Target Customer">
        <div className="space-y-1.5">
          {Object.entries(data.targetCustomer || {}).map(([k, v]: any) => (
            <div key={k} className="flex gap-2">
              <span className="text-xs capitalize flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)", minWidth: "70px" }}>{k}:</span>
              <span className="text-xs text-white">{v}</span>
            </div>
          ))}
        </div>
      </Card>

      {data.whiteSpaceOpportunity && (
        <Card title="White Space Opportunity">
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>🎯 {data.whiteSpaceOpportunity}</p>
        </Card>
      )}

      {data.verdict && (
        <Card title="KAI Verdict">
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", lineHeight: "1.7" }}>{data.verdict}</p>
          {data.startingBudget && <p className="text-xs mt-2" style={{ color: "#a78bfa" }}>Suggested starting budget: {data.startingBudget}</p>}
        </Card>
      )}
    </div>
  );
}

function CompetitorResult({ data }: any) {
  return (
    <div>
      <Card title="Store Overview">
        <div className="space-y-2">
          {[
            ["Store Name", data.storeName],
            ["Niche", data.niche],
            ["Est. Monthly Revenue", data.estimatedMonthlyRevenue],
            ["Products", data.productCount],
            ["Pricing Strategy", data.pricingStrategy],
            ["Ad Activity", data.adActivity],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{k}</span>
              <span className="text-xs text-white font-medium">{v}</span>
            </div>
          ))}
        </div>
      </Card>

      {data.topProducts?.length > 0 && (
        <Card title="Their Top Products">
          {data.topProducts.map((p: any, i: number) => (
            <div key={i} className="py-1.5">
              <div className="flex justify-between mb-0.5">
                <span className="text-xs text-white">{p.name}</span>
                <span className="text-xs" style={{ color: "#a78bfa" }}>{p.price}</span>
              </div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{p.strength}</p>
            </div>
          ))}
        </Card>
      )}

      {data.weaknesses?.length > 0 && (
        <Card title="Their Weaknesses (Your Opportunity)">
          {data.weaknesses.map((w: string, i: number) => (
            <p key={i} className="text-xs py-1 flex gap-2" style={{ color: "rgba(255,255,255,0.6)" }}>
              <span style={{ color: "#f87171" }}>❌</span>{w}
            </p>
          ))}
        </Card>
      )}

      {data.opportunities?.length > 0 && (
        <Card title="How to Beat Them">
          {data.opportunities.map((o: string, i: number) => (
            <p key={i} className="text-xs py-1 flex gap-2" style={{ color: "rgba(255,255,255,0.6)" }}>
              <span style={{ color: "#34d399" }}>✅</span>{o}
            </p>
          ))}
        </Card>
      )}

      {data.verdict && (
        <Card title="KAI Analysis">
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", lineHeight: "1.7" }}>{data.verdict}</p>
        </Card>
      )}
    </div>
  );
}

function BuyerMotivationResult({ data }: any) {
  return (
    <div>
      <Card title="Primary Motivation">
        <p className="text-sm font-medium text-white">{data.primaryMotivation}</p>
      </Card>

      {data.emotionalTriggers?.length > 0 && (
        <Card title="Emotional Triggers">
          <div className="flex flex-wrap gap-2">
            {data.emotionalTriggers.map((t: string, i: number) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>{t}</span>
            ))}
          </div>
        </Card>
      )}

      {data.powerWords?.length > 0 && (
        <Card title="Power Words to Use">
          <div className="flex flex-wrap gap-2">
            {data.powerWords.map((w: string, i: number) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full font-medium text-white" style={{ background: "rgba(52,211,153,0.15)" }}>{w}</span>
            ))}
          </div>
        </Card>
      )}

      {data.avoidWords?.length > 0 && (
        <Card title="Words to Avoid">
          <div className="flex flex-wrap gap-2">
            {data.avoidWords.map((w: string, i: number) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}>{w}</span>
            ))}
          </div>
        </Card>
      )}

      {data.hookFormula && (
        <Card title="Hook Formula" action={<CopyBtn text={data.exampleHook || data.hookFormula} />}>
          <p className="text-xs mb-2 font-mono" style={{ color: "#a78bfa" }}>{data.hookFormula}</p>
          {data.exampleHook && (
            <p className="text-sm font-medium text-white p-2 rounded-lg" style={{ background: "rgba(124,58,237,0.1)" }}>"{data.exampleHook}"</p>
          )}
        </Card>
      )}

      {data.objections?.length > 0 && (
        <Card title="Common Objections to Address">
          {data.objections.map((o: string, i: number) => (
            <p key={i} className="text-xs py-1.5 border-b flex gap-2" style={{ color: "rgba(255,255,255,0.55)", borderColor: "rgba(255,255,255,0.04)" }}>
              <span style={{ color: "#fbbf24" }}>?</span>{o}
            </p>
          ))}
        </Card>
      )}
    </div>
  );
}
