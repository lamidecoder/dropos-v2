"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { Sparkles, ArrowRight, Check, Zap, RefreshCw, Palette, Store } from "lucide-react";
import Link from "next/link";

const V = { v400:"#6B35E8", v300:"#8B5CF6" };

const EXAMPLES = [
  "I sell women's fashion — ankara prints, party outfits and accessories in Lagos",
  "I import electronics and gadgets from China and sell to Nigerian buyers",
  "I sell premium skincare and beauty products made with natural ingredients",
  "I run a kids clothing store with bright, playful designs for ages 0-12",
  "I sell handmade jewelry — earrings, necklaces and bracelets",
  "I import home décor and furniture from AliExpress and resell",
];

export default function StoreGeneratorPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card:   isDark ? "rgba(255,255,255,0.03)" : "#fff",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.5)" : "rgba(19,13,46,0.5)",
    border: isDark ? "rgba(107,53,232,0.12)" : "rgba(107,53,232,0.1)",
    faint:  isDark ? "rgba(107,53,232,0.06)" : "rgba(107,53,232,0.04)",
    input:  isDark ? "rgba(255,255,255,0.05)" : "#fff",
  };

  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const storeName = user?.stores?.[0]?.name;
  const [desc, setDesc]     = useState("");
  const [result, setResult] = useState<any>(null);
  const [applied, setApplied] = useState(false);

  const generateMut = useMutation({
    mutationFn: () => api.post("/kai/generate-store", { description:desc, storeName }),
    onSuccess: (res) => setResult(res.data.data),
    onError:   () => toast.error("Generation failed — try again"),
  });

  const applyMut = useMutation({
    mutationFn: () => api.put(`/stores/${storeId}`, {
      theme:          result.templateId,
      templateId:     result.templateId,
      primaryColor:   result.primaryColor,
      accentColor:    result.accentColor,
      fontFamily:     result.fontFamily,
      tagline:        result.tagline,
      description:    result.description,
      announcement:   result.announcement || "",
    }),
    onSuccess: () => { setApplied(true); toast.success("Store design applied!"); },
    onError:   () => toast.error("Failed to apply — try again"),
  });

  return (
    <div style={{ maxWidth:760, margin:"0 auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:32 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          <div style={{ width:44, height:44, borderRadius:13, background:"linear-gradient(135deg,#2D1B69,#1A0B4A)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Sparkles size={20} color="#C4B5FD"/>
          </div>
          <div>
            <h1 style={{ fontSize:20, fontWeight:900, color:t.text, margin:0, letterSpacing:"-0.03em" }}>
              KIRO Store Designer
            </h1>
            <p style={{ fontSize:13, color:t.muted, margin:0 }}>
              Describe your business — KIRO designs your store in seconds
            </p>
          </div>
        </div>
      </motion.div>

      {/* Input */}
      {!result && (
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
          <div style={{ background:t.card, borderRadius:20, padding:28, border:`1px solid ${t.border}`, marginBottom:16 }}>
            <label style={{ fontSize:14, fontWeight:700, color:t.text, display:"block", marginBottom:8 }}>
              Describe your business
            </label>
            <p style={{ fontSize:13, color:t.muted, margin:"0 0 16px", lineHeight:1.55 }}>
              Tell KIRO what you sell, who your customers are, and the vibe you want. The more specific, the better the result.
            </p>
            <textarea value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="e.g. I sell women's fashion — ankara prints, party outfits and accessories. My customers are Nigerian women aged 20-35 who want to look stunning without breaking the bank."
              rows={4}
              style={{ width:"100%", padding:"14px 16px", borderRadius:14, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:14, fontFamily:"inherit", outline:"none", resize:"none", lineHeight:1.6, transition:"border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor=V.v400}
              onBlur={e => e.target.style.borderColor=(isDark?"rgba(107,53,232,0.12)":"rgba(107,53,232,0.1)")}
            />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:16, gap:12, flexWrap:"wrap" }}>
              <p style={{ fontSize:12, color:t.muted, margin:0 }}>{desc.length}/500 characters</p>
              <button onClick={() => generateMut.mutate()} disabled={!desc.trim() || generateMut.isPending}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"13px 24px", borderRadius:12, border:"none", cursor:!desc.trim()?"not-allowed":"pointer", background:`linear-gradient(135deg,#2D1B69,${V.v400})`, color:"#fff", fontSize:14, fontWeight:700, fontFamily:"inherit", opacity:!desc.trim()?0.5:1, boxShadow:"0 4px 20px rgba(107,53,232,0.25)" }}>
                {generateMut.isPending
                  ? <><RefreshCw size={14} style={{ animation:"spin 0.7s linear infinite" }}/> Designing…</>
                  : <><Sparkles size={14}/> Design my store</>
                }
                <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
              </button>
            </div>
          </div>

          {/* Examples */}
          <div style={{ background:t.card, borderRadius:20, padding:24, border:`1px solid ${t.border}` }}>
            <p style={{ fontSize:12, fontWeight:700, color:t.muted, margin:"0 0 14px", textTransform:"uppercase", letterSpacing:"0.08em" }}>
              Try one of these
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setDesc(ex)}
                  style={{ textAlign:"left", padding:"10px 14px", borderRadius:10, border:`1px solid ${t.border}`, background:"transparent", cursor:"pointer", fontSize:13, color:t.muted, fontFamily:"inherit", transition:"all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background=`${V.v400}08`; e.currentTarget.style.color=t.text; e.currentTarget.style.borderColor=`${V.v400}30`; }}
                  onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=t.muted as string; e.currentTarget.style.borderColor=t.border; }}>
                  "{ex}"
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            {/* Preview card */}
            <div style={{ borderRadius:24, overflow:"hidden", border:`1px solid ${t.border}`, marginBottom:16, boxShadow:"0 8px 40px rgba(107,53,232,0.1)" }}>
              {/* Generated store preview header */}
              <div style={{ background:`linear-gradient(135deg,${result.primaryColor}20,${result.accentColor}10)`, borderBottom:`1px solid ${t.border}`, padding:"24px 28px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                  <div style={{ width:40, height:40, borderRadius:11, background:result.primaryColor, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 14px ${result.primaryColor}40` }}>
                    <Store size={18} color="#fff"/>
                  </div>
                  <div>
                    <p style={{ fontSize:16, fontWeight:800, color:t.text, margin:0, fontFamily:`'${result.fontFamily}',sans-serif` }}>
                      {storeName}
                    </p>
                    <p style={{ fontSize:12, color:t.muted, margin:0 }}>{result.tagline}</p>
                  </div>
                </div>

                {result.announcement && (
                  <div style={{ background:result.primaryColor, borderRadius:8, padding:"8px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:12, color:"#fff", fontWeight:600 }}>{result.announcement}</span>
                  </div>
                )}

                <h2 style={{ fontFamily:`'${result.fontFamily}',serif`, fontSize:28, fontWeight:700, color:result.primaryColor, margin:"0 0 8px", letterSpacing:"-0.02em", lineHeight:1.15 }}>
                  {result.heroHeadline}
                </h2>
                <p style={{ fontSize:14, color:t.muted, margin:0 }}>{result.heroSubtext}</p>
              </div>

              {/* Generated details */}
              <div style={{ background:t.card, padding:"24px 28px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:20 }} className="gen-grid">
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:t.muted, margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Template</p>
                    <p style={{ fontSize:14, fontWeight:700, color:t.text, margin:0, textTransform:"capitalize" }}>{result.templateId}</p>
                  </div>
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:t.muted, margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Colors</p>
                    <div style={{ display:"flex", gap:6 }}>
                      <div style={{ width:24, height:24, borderRadius:6, background:result.primaryColor, boxShadow:`0 2px 6px ${result.primaryColor}40` }}/>
                      <div style={{ width:24, height:24, borderRadius:6, background:result.accentColor }}/>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:t.muted, margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Font</p>
                    <p style={{ fontSize:14, fontWeight:700, color:t.text, margin:0, fontFamily:`'${result.fontFamily}',sans-serif` }}>
                      {result.fontFamily}
                    </p>
                  </div>
                </div>

                {/* Categories */}
                <p style={{ fontSize:11, fontWeight:700, color:t.muted, margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Suggested categories</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:20 }}>
                  {result.categories?.map((c: string) => (
                    <span key={c} style={{ fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:99, background:`${result.primaryColor}12`, color:result.primaryColor, border:`1px solid ${result.primaryColor}25` }}>
                      {c}
                    </span>
                  ))}
                </div>

                {/* KIRO reasoning */}
                <div style={{ padding:"12px 14px", borderRadius:12, background:t.faint, border:`1px solid ${t.border}`, marginBottom:24 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:t.muted, margin:"0 0 4px" }}>KIRO's reasoning</p>
                  <p style={{ fontSize:12, color:t.muted, margin:0, lineHeight:1.55 }}>{result.reasoning}</p>
                </div>

                {/* Actions */}
                {!applied ? (
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                    <button onClick={() => applyMut.mutate()} disabled={applyMut.isPending}
                      style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"14px 0", borderRadius:12, border:"none", cursor:"pointer", background:`linear-gradient(135deg,#2D1B69,${V.v400})`, color:"#fff", fontSize:14, fontWeight:700, fontFamily:"inherit", boxShadow:"0 4px 20px rgba(107,53,232,0.25)" }}>
                      {applyMut.isPending ? <><RefreshCw size={14} style={{ animation:"spin 0.7s linear infinite" }}/> Applying…</> : <><Check size={14}/> Apply to my store</>}
                    </button>
                    <button onClick={() => { setResult(null); setApplied(false); }}
                      style={{ padding:"14px 20px", borderRadius:12, border:`1px solid ${t.border}`, background:t.card, color:t.muted, fontSize:14, fontWeight:600, fontFamily:"inherit", cursor:"pointer" }}>
                      Try again
                    </button>
                  </div>
                ) : (
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                    <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"14px 0", borderRadius:12, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)" }}>
                      <Check size={16} color="#10B981"/>
                      <span style={{ fontSize:14, fontWeight:700, color:"#10B981" }}>Store design applied!</span>
                    </div>
                    <Link href="/dashboard/customize"
                      style={{ display:"flex", alignItems:"center", gap:6, padding:"14px 20px", borderRadius:12, background:t.card, border:`1px solid ${t.border}`, color:t.muted, textDecoration:"none", fontSize:13, fontWeight:600 }}>
                      Fine-tune <ArrowRight size={13}/>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@media(max-width:600px){ .gen-grid{grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
}
