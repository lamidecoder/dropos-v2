"use client";
// Path: frontend/src/app/dashboard/image-studio/page.tsx
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import { Upload, Wand2, Image, Sparkles, Download, Copy, Loader2, X, Check } from "lucide-react";
import toast from "react-hot-toast";

const BACKGROUNDS = [
  { id: "studio",   label: "Clean Studio",   emoji: "⬜", color: "#f8f8f8" },
  { id: "bedroom",  label: "Modern Bedroom", emoji: "🛏️", color: "#c4956a" },
  { id: "kitchen",  label: "Kitchen",        emoji: "🍳", color: "#8bc34a" },
  { id: "outdoor",  label: "Lagos Street",   emoji: "🏙️", color: "#2196f3" },
  { id: "luxury",   label: "Luxury Lagos",   emoji: "✨", color: "#ffd700" },
  { id: "fashion",  label: "Editorial",      emoji: "👗", color: "#e91e63" },
  { id: "flat_lay", label: "Flat Lay",        emoji: "📐", color: "#9c27b0" },
];

const TOOLS = [
  { id: "remove_bg",  label: "Remove Background", icon: "✂️", desc: "Clean white/transparent background" },
  { id: "lifestyle",  label: "Lifestyle Scene",    icon: "🌟", desc: "Product in a real-world setting" },
  { id: "ad_creative",label: "Ad Creative",        icon: "📣", desc: "Ready-to-run social media ad" },
];

export default function ImageStudioPage() {
  const user    = useAuthStore(s => s.user);
  const [activeTool, setActiveTool] = useState("remove_bg");
  const [imageUrl, setImageUrl]     = useState("");
  const [bgStyle, setBgStyle]       = useState("studio");
  const [productName, setProductName] = useState("");
  const [hook, setHook]             = useState("");
  const [result, setResult]         = useState<string | null>(null);
  const [uploading, setUploading]   = useState(false);
  const [copied, setCopied]         = useState(false);
  const fileRef                     = useRef<HTMLInputElement>(null);

  // Upload to Cloudinary
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "dropos_products");
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
      const data = await res.json();
      setImageUrl(data.secure_url);
      setResult(null);
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const processMutation = useMutation({
    mutationFn: async () => {
      if (activeTool === "remove_bg") {
        const r = await api.post("/super/images/remove-bg", { imageUrl });
        return r.data.data.url;
      } else if (activeTool === "lifestyle") {
        const r = await api.post("/super/images/lifestyle", { imageUrl, backgroundStyle: bgStyle, productName });
        return r.data.data.url;
      } else {
        const r = await api.post("/super/images/ad-creative", { productName, hook, backgroundColor: bgStyle });
        return r.data.data.url;
      }
    },
    onSuccess: (url) => setResult(url),
    onError: (err: any) => {
      if (err.response?.status === 503) {
        toast("Add REPLICATE_API_TOKEN to Render to enable AI generation", { icon: "⚙️", duration: 6000 });
      } else {
        toast.error(err.response?.data?.message || "Processing failed");
      }
    },
  });

  const copyUrl = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canProcess = activeTool === "ad_creative"
    ? !!productName
    : !!imageUrl;

  return (
    
      <div className="min-h-screen" style={{ background: "#07070e" }}>
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-xl font-semibold text-white mb-0.5">AI Image Studio</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Professional product images in seconds - no photographer needed
          </p>
        </div>

        <div className="px-6 pb-6 grid grid-cols-2 gap-6">

          {/* Left - Controls */}
          <div className="space-y-4">
            {/* Tool selector */}
            <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Choose Tool</p>
              <div className="space-y-2">
                {TOOLS.map(t => (
                  <button key={t.id} onClick={() => { setActiveTool(t.id); setResult(null); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all"
                    style={{
                      background: activeTool === t.id ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
                      border: activeTool === t.id ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(255,255,255,0.06)",
                    }}>
                    <span className="text-xl">{t.icon}</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: activeTool === t.id ? "#a78bfa" : "rgba(255,255,255,0.8)" }}>{t.label}</p>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>{t.desc}</p>
                    </div>
                    {activeTool === t.id && <Check size={13} className="ml-auto" style={{ color: "#a78bfa" }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Image upload (for remove_bg and lifestyle) */}
            {activeTool !== "ad_creative" && (
              <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Product Image</p>

                {!imageUrl ? (
                  <button onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed rounded-xl py-8 flex flex-col items-center gap-2 transition-all"
                    style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                    {uploading
                      ? <Loader2 size={24} className="animate-spin" style={{ color: "#7c3aed" }} />
                      : <Upload size={24} style={{ color: "rgba(255,255,255,0.3)" }} />}
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {uploading ? "Uploading..." : "Click to upload product photo"}
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>JPG, PNG - max 10MB</p>
                  </button>
                ) : (
                  <div className="relative">
                    <img src={imageUrl} alt="Product" className="w-full h-48 object-contain rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)" }} />
                    <button onClick={() => { setImageUrl(""); setResult(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.7)" }}>
                      <X size={13} style={{ color: "#fff" }} />
                    </button>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </div>
            )}

            {/* Background selector (lifestyle) */}
            {activeTool === "lifestyle" && (
              <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Background Style</p>
                <div className="grid grid-cols-4 gap-2">
                  {BACKGROUNDS.map(b => (
                    <button key={b.id} onClick={() => setBgStyle(b.id)}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                      style={{
                        background: bgStyle === b.id ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.03)",
                        border: bgStyle === b.id ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.06)",
                      }}>
                      <span className="text-lg">{b.emoji}</span>
                      <p style={{ color: bgStyle === b.id ? "#a78bfa" : "rgba(255,255,255,0.4)", fontSize: "9px", textAlign: "center" }}>{b.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product name */}
            {(activeTool === "lifestyle" || activeTool === "ad_creative") && (
              <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Product Details</p>
                <input value={productName} onChange={e => setProductName(e.target.value)}
                  placeholder="Product name e.g. Brazilian Hair Bundle"
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none mb-2"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }} />
                {activeTool === "ad_creative" && (
                  <input value={hook} onChange={e => setHook(e.target.value)}
                    placeholder="Ad hook e.g. Get beautiful hair this weekend"
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }} />
                )}
              </div>
            )}

            {/* Generate button */}
            <button
              disabled={!canProcess || processMutation.isLoading}
              onClick={() => processMutation.mutate()}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-base font-semibold transition-all"
              style={{
                background: canProcess ? "linear-gradient(135deg, #7c3aed, #5b21b6)" : "rgba(255,255,255,0.05)",
                color: canProcess ? "#fff" : "rgba(255,255,255,0.25)",
                boxShadow: canProcess ? "0 8px 32px rgba(124,58,237,0.3)" : "none",
              }}>
              {processMutation.isLoading
                ? <><Loader2 size={16} className="animate-spin" />Generating...</>
                : <><Wand2 size={16} />Generate with AI</>}
            </button>
          </div>

          {/* Right - Result */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Result</p>
              {result && (
                <div className="flex gap-2">
                  <button onClick={copyUrl}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{ background: "rgba(255,255,255,0.06)", color: copied ? "#34d399" : "rgba(255,255,255,0.5)" }}>
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                    {copied ? "Copied!" : "Copy URL"}
                  </button>
                  <a href={result} download target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>
                    <Download size={11} />Download
                  </a>
                </div>
              )}
            </div>

            <div className="p-6 flex items-center justify-center min-h-80">
              <AnimatePresence mode="wait">
                {processMutation.isLoading && (
                  <motion.div key="loading" className="text-center"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
                      <Wand2 size={28} style={{ color: "#fff" }} />
                    </motion.div>
                    <p className="text-sm font-medium text-white mb-1">AI is creating your image...</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                      This takes 15-30 seconds
                    </p>
                  </motion.div>
                )}

                {!processMutation.isLoading && result && (
                  <motion.div key="result" className="w-full"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <img src={result} alt="Generated" className="w-full rounded-xl object-contain max-h-96"
                      style={{ background: activeTool === "remove_bg" ? "repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 0 0 / 16px 16px" : "transparent" }} />
                  </motion.div>
                )}

                {!processMutation.isLoading && !result && (
                  <motion.div key="empty" className="text-center"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Image size={48} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.08)" }} />
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Your generated image appears here
                    </p>
                    <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.15)" }}>
                      Upload a product photo and click Generate
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    
  );
}
