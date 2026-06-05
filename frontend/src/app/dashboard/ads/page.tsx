"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { Sparkles, Copy, Check, RefreshCw, ExternalLink, Zap, Clock, TrendingUp } from "lucide-react";

const PLATFORMS = [
  { id:"tiktok",    label:"TikTok",    emoji:"🎵", color:"#000000", grad:"linear-gradient(135deg,#010101,#333)" },
  { id:"instagram", label:"Instagram", emoji:"📸", color:"#E1306C", grad:"linear-gradient(135deg,#405DE6,#E1306C,#F77737)" },
  { id:"facebook",  label:"Facebook",  emoji:"📘", color:"#1877F2", grad:"linear-gradient(135deg,#1877F2,#0d5fd4)" },
  { id:"whatsapp",  label:"WhatsApp",  emoji:"💬", color:"#25D366", grad:"linear-gradient(135deg,#128C7E,#25D366)" },
];

const FORMATS = [
  { id:"video_script", label:"Video Script", icon:"🎬", desc:"30s hook + script + CTA" },
  { id:"image_ad",     label:"Image Ad",     icon:"🖼️", desc:"Headline + copy + CTA" },
  { id:"reel",         label:"Reel",         icon:"📱", desc:"15-30s reel format" },
  { id:"story",        label:"Story",        icon:"⭕", desc:"Story with swipe-up" },
];

const GOALS = [
  { id:"sales",       label:"Drive Sales",   emoji:"💰" },
  { id:"traffic",     label:"Get Traffic",   emoji:"🔗" },
  { id:"awareness",   label:"Brand Awareness",emoji:"📣" },
  { id:"engagement",  label:"Engagement",    emoji:"❤️" },
];

export default function AdsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);

  const C = {
    bg:     isDark ? "#08051A" : "#F4F2FB",
    card:   isDark ? "rgba(255,255,255,0.04)" : "#fff",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.45)" : "rgba(19,13,46,0.5)",
    border: isDark ? "rgba(107,53,232,0.15)" : "rgba(107,53,232,0.12)",
    input:  isDark ? "rgba(255,255,255,0.06)" : "#fff",
  };

  const [platform, setPlatform] = useState("tiktok");
  const [format,   setFormat]   = useState("video_script");
  const [goal,     setGoal]     = useState("sales");
  const [audience, setAudience] = useState("");
  const [budget,   setBudget]   = useState("");
  const [result,   setResult]   = useState<any>(null);
  const [copied,   setCopied]   = useState<string|null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(null), 2000);
    toast.success("Copied to clipboard");
  };

  const genMut = useMutation({
    mutationFn: () => api.post("/ads/generate", { storeId, platform, format, goal,
      budget: budget ? Number(budget) : undefined, targetAudience: audience || undefined }),
    onSuccess: (r) => { setResult(r.data.data); },
    onError:   (e: any) => toast.error(e.response?.data?.error || "Generation failed — check ANTHROPIC_API_KEY is set in Render"),
  });

  const plat = PLATFORMS.find(p => p.id === platform)!;

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button onClick={() => copy(text, id)}
      style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:8,
        background: copied===id ? "rgba(16,185,129,0.1)" : C.card,
        border: `1px solid ${copied===id ? "rgba(16,185,129,0.3)" : C.border}`,
        color: copied===id ? "#10B981" : C.muted, cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"inherit" }}>
      {copied===id ? <Check size={11}/> : <Copy size={11}/>}
      {copied===id ? "Copied" : "Copy"}
    </button>
  );

  return (
    <div style={{ maxWidth:960, margin:"0 auto", fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#2D1B69,#6B35E8)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Sparkles size={16} color="#C4B5FD"/>
          </div>
          <div>
            <h1 style={{ fontSize:20, fontWeight:900, color:C.text, margin:0, letterSpacing:"-0.03em" }}>Ad Copy Generator</h1>
            <p style={{ fontSize:12, color:C.muted, margin:0 }}>KIRO writes high-converting ads for your store</p>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:16 }} className="ads-layout">
        {/* LEFT — Config */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

          {/* Platform */}
          <div style={{ background:C.card, borderRadius:16, padding:18, border:`1px solid ${C.border}` }}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:"0.1em", color:C.muted, textTransform:"uppercase", margin:"0 0 12px" }}>Platform</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => setPlatform(p.id)}
                  style={{ padding:"10px 12px", borderRadius:12, border:`2px solid ${platform===p.id ? p.color : "transparent"}`,
                    background: platform===p.id ? `${p.color}15` : "rgba(255,255,255,0.03)",
                    cursor:"pointer", textAlign:"left", fontFamily:"inherit", transition:"all 0.15s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ fontSize:18 }}>{p.emoji}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{p.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div style={{ background:C.card, borderRadius:16, padding:18, border:`1px solid ${C.border}` }}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:"0.1em", color:C.muted, textTransform:"uppercase", margin:"0 0 12px" }}>Format</p>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {FORMATS.map(f => (
                <button key={f.id} onClick={() => setFormat(f.id)}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:10,
                    border:`1px solid ${format===f.id ? "rgba(107,53,232,0.4)" : C.border}`,
                    background: format===f.id ? "rgba(107,53,232,0.08)" : "transparent",
                    cursor:"pointer", fontFamily:"inherit", transition:"all 0.12s" }}>
                  <span style={{ fontSize:16 }}>{f.icon}</span>
                  <div style={{ textAlign:"left" }}>
                    <p style={{ fontSize:13, fontWeight:format===f.id?700:500, color:C.text, margin:0 }}>{f.label}</p>
                    <p style={{ fontSize:11, color:C.muted, margin:0 }}>{f.desc}</p>
                  </div>
                  {format===f.id && <div style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:"#8B5CF6" }}/>}
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div style={{ background:C.card, borderRadius:16, padding:18, border:`1px solid ${C.border}` }}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:"0.1em", color:C.muted, textTransform:"uppercase", margin:"0 0 12px" }}>Goal</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {GOALS.map(g => (
                <button key={g.id} onClick={() => setGoal(g.id)}
                  style={{ padding:"9px 10px", borderRadius:10, border:`1px solid ${goal===g.id ? "rgba(107,53,232,0.4)" : C.border}`,
                    background: goal===g.id ? "rgba(107,53,232,0.08)" : "transparent",
                    cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
                  <span>{g.emoji}</span>
                  <span style={{ fontSize:12, fontWeight:goal===g.id?700:500, color:C.text }}>{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional */}
          <div style={{ background:C.card, borderRadius:16, padding:18, border:`1px solid ${C.border}` }}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:"0.1em", color:C.muted, textTransform:"uppercase", margin:"0 0 12px" }}>Optional</p>
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:5 }}>Target audience</label>
              <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. Nigerian women 22-35 who love fashion"
                style={{ width:"100%", padding:"9px 12px", borderRadius:10, border:`1px solid ${C.border}`, background:C.input, color:C.text, fontSize:12, fontFamily:"inherit", outline:"none" }}/>
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:5 }}>Daily budget (₦)</label>
              <input value={budget} onChange={e => setBudget(e.target.value)} type="number" placeholder="e.g. 2000"
                style={{ width:"100%", padding:"9px 12px", borderRadius:10, border:`1px solid ${C.border}`, background:C.input, color:C.text, fontSize:12, fontFamily:"inherit", outline:"none" }}/>
            </div>
          </div>

          <button onClick={() => { setResult(null); genMut.mutate(); }} disabled={genMut.isPending || !storeId}
            style={{ padding:"14px 0", borderRadius:14, border:"none", cursor:"pointer",
              background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff",
              fontSize:15, fontWeight:800, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:10,
              boxShadow:"0 6px 24px rgba(107,53,232,0.35)", opacity:genMut.isPending?0.7:1 }}>
            {genMut.isPending ? <><RefreshCw size={16} style={{ animation:"spin 0.7s linear infinite" }}/> Writing your ad…</>
              : <><Sparkles size={16}/> Generate Ad Copy</>}
          </button>
        </div>

        {/* RIGHT — Result */}
        <div>
          <AnimatePresence mode="wait">
            {!result && !genMut.isPending && (
              <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}
                style={{ height:560, borderRadius:18, border:`2px dashed ${C.border}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14 }}>
                <div style={{ width:64, height:64, borderRadius:18, background:"rgba(107,53,232,0.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Sparkles size={28} color="#8B5CF6"/>
                </div>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontSize:16, fontWeight:700, color:C.text, margin:"0 0 6px" }}>Ready to create</p>
                  <p style={{ fontSize:13, color:C.muted }}>Pick your platform and format, then generate</p>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", maxWidth:280 }}>
                  {["Hook in 3 seconds","Nigerian market tone","A/B test variants","Targeting tips"].map(t => (
                    <span key={t} style={{ fontSize:11, padding:"4px 10px", borderRadius:99, background:C.card, border:`1px solid ${C.border}`, color:C.muted }}>
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {genMut.isPending && (
              <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }}
                style={{ height:560, borderRadius:18, border:`1px solid ${C.border}`, background:C.card, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
                <div style={{ width:64, height:64, borderRadius:18, background:"linear-gradient(135deg,#2D1B69,#6B35E8)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 32px rgba(107,53,232,0.4)", animation:"pulse 2s ease-in-out infinite" }}>
                  <Sparkles size={28} color="#C4B5FD"/>
                </div>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontSize:15, fontWeight:700, color:C.text, margin:"0 0 6px" }}>KIRO is writing your ad…</p>
                  <p style={{ fontSize:13, color:C.muted }}>Researching market trends · Crafting hooks · ~15 seconds</p>
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div key="result" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {/* Platform badge */}
                <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:14, background:plat.grad, color:"#fff" }}>
                  <span style={{ fontSize:22 }}>{plat.emoji}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:800, margin:0 }}>{plat.label} · {FORMATS.find(f=>f.id===format)?.label}</p>
                    <p style={{ fontSize:11, margin:0, opacity:0.75 }}>
                      {result.bestPostTime} · {result.estimatedReach}
                    </p>
                  </div>
                  <a href={platform==="tiktok"?"https://ads.tiktok.com/i18n/home":platform==="instagram"||platform==="facebook"?"https://business.facebook.com/adsmanager":"#"}
                    target="_blank" rel="noreferrer"
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:8, background:"rgba(255,255,255,0.2)", color:"#fff", textDecoration:"none", fontSize:12, fontWeight:700 }}>
                    Post <ExternalLink size={11}/>
                  </a>
                </div>

                {/* Hook */}
                {result.hook && (
                  <div style={{ padding:16, borderRadius:14, background:C.card, border:`1px solid ${C.border}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontSize:11, fontWeight:800, color:"#8B5CF6", letterSpacing:"0.06em" }}>🎣 HOOK</span>
                      <CopyBtn text={result.hook} id="hook"/>
                    </div>
                    <p style={{ fontSize:15, fontWeight:700, color:C.text, margin:0, lineHeight:1.5 }}>{result.hook}</p>
                  </div>
                )}

                {/* Script */}
                {result.script && (
                  <div style={{ padding:16, borderRadius:14, background:C.card, border:`1px solid ${C.border}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontSize:11, fontWeight:800, color:"#8B5CF6", letterSpacing:"0.06em" }}>📝 SCRIPT</span>
                      <CopyBtn text={result.script} id="script"/>
                    </div>
                    <p style={{ fontSize:13, color:C.text, margin:0, lineHeight:1.7, whiteSpace:"pre-line", maxHeight:200, overflowY:"auto" }}>{result.script}</p>
                  </div>
                )}

                {/* Caption */}
                {result.caption && (
                  <div style={{ padding:16, borderRadius:14, background:C.card, border:`1px solid ${C.border}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontSize:11, fontWeight:800, color:"#8B5CF6", letterSpacing:"0.06em" }}>📲 CAPTION</span>
                      <CopyBtn text={result.caption} id="caption"/>
                    </div>
                    <p style={{ fontSize:13, color:C.text, margin:0, lineHeight:1.65 }}>{result.caption}</p>
                  </div>
                )}

                {/* CTA + Budget */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {result.cta && (
                    <div style={{ padding:14, borderRadius:14, background:C.card, border:`1px solid ${C.border}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                        <span style={{ fontSize:11, fontWeight:800, color:"#8B5CF6" }}>👆 CTA</span>
                        <CopyBtn text={result.cta} id="cta"/>
                      </div>
                      <p style={{ fontSize:14, fontWeight:700, color:C.text, margin:0 }}>{result.cta}</p>
                    </div>
                  )}
                  {result.aiBudgetTip && (
                    <div style={{ padding:14, borderRadius:14, background:"rgba(16,185,129,0.05)", border:"1px solid rgba(16,185,129,0.15)" }}>
                      <p style={{ fontSize:11, fontWeight:800, color:"#10B981", margin:"0 0 6px" }}>💡 BUDGET TIP</p>
                      <p style={{ fontSize:12, color:C.text, margin:0, lineHeight:1.5 }}>{result.aiBudgetTip}</p>
                    </div>
                  )}
                </div>

                {/* A/B variants */}
                {result.variations?.length > 0 && (
                  <div style={{ padding:16, borderRadius:14, background:C.card, border:`1px solid ${C.border}` }}>
                    <p style={{ fontSize:11, fontWeight:800, color:"#8B5CF6", margin:"0 0 10px" }}>🔀 A/B TEST HOOKS</p>
                    {result.variations.map((v: string, i: number) => (
                      <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
                        <span style={{ fontSize:11, fontWeight:800, color:"#8B5CF6", minWidth:16, marginTop:1 }}>{String.fromCharCode(65+i)}</span>
                        <p style={{ fontSize:13, color:C.text, margin:0, flex:1, lineHeight:1.5 }}>{v}</p>
                        <CopyBtn text={v} id={`v${i}`}/>
                      </div>
                    ))}
                  </div>
                )}

                {/* Targeting */}
                {result.targetingTips?.length > 0 && (
                  <div style={{ padding:16, borderRadius:14, background:C.card, border:`1px solid ${C.border}` }}>
                    <p style={{ fontSize:11, fontWeight:800, color:"#8B5CF6", margin:"0 0 10px" }}>🎯 TARGETING TIPS</p>
                    {result.targetingTips.map((tip: string, i: number) => (
                      <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                        <TrendingUp size={11} color="#8B5CF6" style={{ flexShrink:0, marginTop:2 }}/>
                        <p style={{ fontSize:12, color:C.text, margin:0, lineHeight:1.5 }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={() => { setResult(null); }}
                  style={{ padding:"11px 0", borderRadius:12, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, fontSize:13, fontWeight:600, fontFamily:"inherit", cursor:"pointer" }}>
                  Generate another
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{box-shadow:0 8px 32px rgba(107,53,232,0.4)}50%{box-shadow:0 8px 48px rgba(107,53,232,0.6)}}
        @media(max-width:768px){ .ads-layout{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
}
