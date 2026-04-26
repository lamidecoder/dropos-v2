"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useCreditsStore, CREDIT_COSTS } from "../../../store/credits.store";
import { Upload, Wand2, Download, Copy, Loader2, X, Check, Zap, Sparkles, Image as ImageIcon, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const V = { v500: "#6B35E8", v400: "#8B5CF6", v300: "#A78BFA" };
const TM = {
  dark:  { card: "#181230", border: "rgba(255,255,255,0.06)", text: "#fff", muted: "rgba(255,255,255,0.38)", faint: "rgba(255,255,255,0.04)" },
  light: { card: "#fff",    border: "rgba(15,5,32,0.07)",    text: "#0D0918", muted: "rgba(13,9,24,0.45)", faint: "rgba(15,5,32,0.03)" },
};

const TOOLS = [
  { id: "remove_bg",   label: "Remove Background", emoji: "✂️", desc: "Clean white or transparent background", cost: "image_generate" as const },
  { id: "lifestyle",   label: "Lifestyle Scene",    emoji: "🌟", desc: "Product in a real-world setting",       cost: "image_lifestyle" as const },
  { id: "enhance",     label: "Enhance Photo",      emoji: "✨", desc: "Sharpen blurry, improve lighting",      cost: "image_generate" as const },
  { id: "ad_creative", label: "Ad Creative",         emoji: "📣", desc: "Ready-to-post social media ad",         cost: "image_background" as const },
];

const BACKGROUNDS = [
  { id: "studio",   label: "Studio",    emoji: "⬜" },
  { id: "bedroom",  label: "Bedroom",   emoji: "🛏️" },
  { id: "kitchen",  label: "Kitchen",   emoji: "🍳" },
  { id: "outdoor",  label: "Outdoor",   emoji: "🌿" },
  { id: "luxury",   label: "Luxury",    emoji: "✨" },
  { id: "fashion",  label: "Editorial", emoji: "👗" },
  { id: "flat_lay", label: "Flat Lay",  emoji: "📐" },
  { id: "market",   label: "Market",    emoji: "🏪" },
];

export default function ImageStudioPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = isDark ? TM.dark : TM.light;
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const { balance, deduct } = useCreditsStore();

  const [activeTool, setActiveTool]   = useState("remove_bg");
  const [imageUrl,   setImageUrl]     = useState("");
  const [bgStyle,    setBgStyle]      = useState("studio");
  const [productName,setProductName]  = useState("");
  const [hook,       setHook]         = useState("");
  const [result,     setResult]       = useState<string | null>(null);
  const [uploading,  setUploading]    = useState(false);
  const [copied,     setCopied]       = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const tool     = TOOLS.find(t => t.id === activeTool)!;
  const cost     = CREDIT_COSTS[tool.cost];
  const canAfford = balance >= cost;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", "dropos_products");
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.secure_url) { setImageUrl(data.secure_url); setResult(null); }
      else toast.error("Upload failed");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const processMut = useMutation({
    mutationFn: async () => {
      if (!canAfford) throw new Error("Insufficient credits");
      deduct(cost);
      
      if (activeTool === "remove_bg") {
        const r = await api.post("/super/images/remove-bg", { imageUrl, storeId });
        return r.data.data?.url || r.data.url;
      }
      if (activeTool === "lifestyle") {
        const r = await api.post("/super/images/lifestyle", { imageUrl, backgroundStyle: bgStyle, productName, storeId });
        return r.data.data?.url || r.data.url;
      }
      if (activeTool === "enhance") {
        const r = await api.post("/super/images/enhance", { imageUrl, storeId });
        return r.data.data?.url || r.data.url;
      }
      // ad_creative
      const r = await api.post("/super/images/ad-creative", { productName, hook, backgroundColor: bgStyle, storeId });
      return r.data.data?.url || r.data.url;
    },
    onSuccess: url => {
      setResult(url);
      toast.success("Image generated!");
    },
    onError: (err: any) => {
      if (err.message === "Insufficient credits") {
        toast.error("Not enough credits. Top up to continue.");
        return;
      }
      if (err.response?.status === 503) {
        toast("Add FAL_AI_KEY to Render environment to enable AI generation", { icon: "⚙️", duration: 6000 });
      } else {
        toast.error(err.response?.data?.message || "Generation failed");
      }
    },
  });

  const canProcess = activeTool === "ad_creative" ? !!productName : !!imageUrl;

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: t.text }}>AI Image Studio</h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(107,53,232,0.12)", color: V.v300, border: "1px solid rgba(107,53,232,0.2)" }}>Fal.ai</span>
          </div>
          <p className="text-xs sm:text-sm" style={{ color: t.muted }}>Professional product images in seconds. No photographer needed.</p>
        </div>
        {/* Credits */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0" style={{ background: "rgba(107,53,232,0.08)", border: "1px solid rgba(107,53,232,0.2)" }}>
          <Zap size={12} color={V.v400} />
          <span className="text-xs font-bold" style={{ color: V.v300 }}>{balance.toLocaleString()} credits</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left — Controls */}
        <div className="space-y-4">
          {/* Tool picker */}
          <div className="p-4 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: t.muted }}>Choose Tool</p>
            <div className="space-y-2">
              {TOOLS.map(tool => (
                <button key={tool.id} onClick={() => { setActiveTool(tool.id); setResult(null); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all"
                  style={{ background: activeTool === tool.id ? "rgba(107,53,232,0.12)" : t.faint, border: `1px solid ${activeTool === tool.id ? "rgba(107,53,232,0.3)" : t.border}` }}>
                  <span className="text-lg">{tool.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: activeTool === tool.id ? V.v300 : t.text }}>{tool.label}</p>
                    <p className="text-xs" style={{ color: t.muted }}>{tool.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(107,53,232,0.1)", color: V.v400 }}>
                    {CREDIT_COSTS[tool.cost]} cr
                  </span>
                  {activeTool === tool.id && <Check size={13} style={{ color: V.v400, flexShrink: 0 }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Image upload */}
          {activeTool !== "ad_creative" && (
            <div className="p-4 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: t.muted }}>Product Image</p>
              {!imageUrl ? (
                <button onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed rounded-xl py-10 flex flex-col items-center gap-2 transition-all"
                  style={{ borderColor: t.border, background: t.faint }}>
                  {uploading
                    ? <Loader2 size={24} className="animate-spin" style={{ color: V.v400 }} />
                    : <Upload size={24} style={{ color: t.muted }} />}
                  <p className="text-sm font-medium" style={{ color: t.text }}>{uploading ? "Uploading..." : "Click to upload"}</p>
                  <p className="text-xs" style={{ color: t.muted }}>JPG, PNG — max 10MB</p>
                </button>
              ) : (
                <div className="relative">
                  <img src={imageUrl} alt="Product" className="w-full h-48 object-contain rounded-xl" style={{ background: t.faint }} />
                  <button onClick={() => { setImageUrl(""); setResult(null); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white"
                    style={{ background: "rgba(0,0,0,0.6)" }}>
                    <X size={13} />
                  </button>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>
          )}

          {/* Background picker */}
          {(activeTool === "lifestyle" || activeTool === "ad_creative") && (
            <div className="p-4 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: t.muted }}>Background Style</p>
              <div className="grid grid-cols-4 gap-2">
                {BACKGROUNDS.map(bg => (
                  <button key={bg.id} onClick={() => setBgStyle(bg.id)}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all"
                    style={{ background: bgStyle === bg.id ? "rgba(107,53,232,0.15)" : t.faint, border: `1px solid ${bgStyle === bg.id ? "rgba(107,53,232,0.4)" : t.border}` }}>
                    <span className="text-lg">{bg.emoji}</span>
                    <span className="text-[9px] font-semibold text-center" style={{ color: bgStyle === bg.id ? V.v300 : t.muted }}>{bg.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product details */}
          {(activeTool === "lifestyle" || activeTool === "ad_creative") && (
            <div className="p-4 rounded-2xl space-y-3" style={{ background: t.card, border: `1px solid ${t.border}` }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: t.muted }}>Product Details</p>
              <input value={productName} onChange={e => setProductName(e.target.value)} placeholder="Product name (e.g. Wireless Earbuds)"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: t.faint, border: `1px solid ${t.border}`, color: t.text, fontFamily: "inherit" }} />
              {activeTool === "ad_creative" && (
                <input value={hook} onChange={e => setHook(e.target.value)} placeholder="Ad hook (e.g. Sound so clear it feels live)"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: t.faint, border: `1px solid ${t.border}`, color: t.text, fontFamily: "inherit" }} />
              )}
            </div>
          )}

          {/* Not enough credits warning */}
          {!canAfford && (
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertTriangle size={14} color="#EF4444" />
              <p className="text-xs" style={{ color: "#EF4444" }}>Not enough credits. You need {cost} credits.</p>
              <Link href="/dashboard/billing" className="text-xs font-bold ml-auto" style={{ color: "#EF4444", whiteSpace: "nowrap" }}>Top up</Link>
            </div>
          )}

          {/* Generate button */}
          <button
            disabled={!canProcess || processMut.isPending || !canAfford}
            onClick={() => processMut.mutate()}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{ background: canProcess && canAfford ? `linear-gradient(135deg,${V.v500},#3D1C8A)` : t.faint, boxShadow: canProcess && canAfford ? "0 8px 32px rgba(107,53,232,0.3)" : "none" }}>
            {processMut.isPending
              ? <><Loader2 size={15} className="animate-spin" />Generating... ({cost} credits)</>
              : <><Wand2 size={15} />Generate with AI ({cost} credits)</>
            }
          </button>
        </div>

        {/* Right — Result */}
        <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: t.card, border: `1px solid ${t.border}`, minHeight: 400 }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${t.border}` }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: t.muted }}>Result</p>
            {result && (
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: t.faint, color: copied ? "#10B981" : t.muted }}>
                  {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? "Copied" : "Copy URL"}
                </button>
                <a href={result} download target="_blank"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: "rgba(107,53,232,0.15)", color: V.v300 }}>
                  <Download size={11} /> Download
                </a>
              </div>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center p-6">
            <AnimatePresence mode="wait">
              {processMut.isPending && (
                <motion.div key="loading" className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: `linear-gradient(135deg,${V.v500},#3D1C8A)` }}>
                    <Wand2 size={28} color="white" />
                  </motion.div>
                  <p className="font-bold text-sm mb-1" style={{ color: t.text }}>Generating your image...</p>
                  <p className="text-xs" style={{ color: t.muted }}>This takes 15-30 seconds</p>
                </motion.div>
              )}

              {!processMut.isPending && result && (
                <motion.div key="result" className="w-full" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <img src={result} alt="Generated" className="w-full rounded-xl object-contain max-h-96"
                    style={{ background: activeTool === "remove_bg" ? "repeating-conic-gradient(rgba(255,255,255,0.05) 0% 25%, transparent 0% 50%) 0 0 / 16px 16px" : t.faint }} />
                </motion.div>
              )}

              {!processMut.isPending && !result && (
                <motion.div key="empty" className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: t.faint }}>
                    <ImageIcon size={28} style={{ color: t.muted }} />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: t.muted }}>Your image appears here</p>
                  <p className="text-xs" style={{ color: t.muted, opacity: 0.6 }}>Upload a photo and click Generate</p>
                  <div className="mt-6 p-3 rounded-xl text-left" style={{ background: t.faint, border: `1px solid ${t.border}` }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: t.muted }}>Tip: Best results come from</p>
                    {["Clear, well-lit product photo","White or simple background","Product fills most of the frame"].map(tip => (
                      <p key={tip} className="text-xs mb-1 flex items-center gap-1.5" style={{ color: t.muted }}>
                        <Sparkles size={9} style={{ color: V.v400, flexShrink: 0 }} /> {tip}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
