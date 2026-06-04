"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { Sparkles, Copy, Check, RefreshCw, TrendingUp, ExternalLink } from "lucide-react";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B", pink:"#EC4899", red:"#EF4444" };

const PLATFORMS = [
  { id:"tiktok",    label:"TikTok",    emoji:"🎵", color:"#000",    textColor:"#fff", desc:"Short video, 15-60s" },
  { id:"instagram", label:"Instagram", emoji:"📸", color:"#E1306C", textColor:"#fff", desc:"Reels, stories, posts" },
  { id:"facebook",  label:"Facebook",  emoji:"📘", color:"#1877F2", textColor:"#fff", desc:"Feed ads, video" },
  { id:"whatsapp",  label:"WhatsApp",  emoji:"💬", color:"#25D366", textColor:"#fff", desc:"Status, broadcast" },
];

const FORMATS = [
  { id:"video_script", label:"Video Script",  desc:"Full 30s script with hooks" },
  { id:"image_ad",     label:"Image Ad",      desc:"Headline + copy + CTA"     },
  { id:"reel",         label:"Reel/Short",    desc:"15-30s reel script"        },
  { id:"story",        label:"Story",         desc:"15s story format"          },
];

const GOALS = [
  { id:"sales",       label:"Make sales",     emoji:"💰" },
  { id:"traffic",     label:"Drive traffic",  emoji:"🔗" },
  { id:"awareness",   label:"Build brand",    emoji:"📣" },
  { id:"engagement",  label:"Get engagement", emoji:"❤️" },
];

export default function AdsPage() {
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

  const storeId   = useAuthStore(s => s.user?.stores?.[0]?.id);
  const [platform, setPlatform] = useState("tiktok");
  const [format,   setFormat]   = useState("video_script");
  const [goal,     setGoal]     = useState("sales");
  const [audience, setAudience] = useState("");
  const [budget,   setBudget]   = useState("");
  const [result,   setResult]   = useState<any>(null);
  const [copied,   setCopied]   = useState<string|null>(null);

  const genMut = useMutation({
    mutationFn: () => api.post("/ads/generate", { storeId, platform, format, goal, budget:budget?Number(budget):undefined, targetAudience:audience }),
    onSuccess:  (r) => setResult(r.data.data),
    onError:    (e:any) => toast.error(e.response?.data?.error || "Generation failed"),
  });

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied!");
  };

  const platformInfo = PLATFORMS.find(p => p.id === platform)!;

  return (
    <div style={{ maxWidth:900, margin:"0 auto" }}>
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:900, color:t.text, margin:"0 0 4px", letterSpacing:"-0.03em" }}>
          Ad Studio
        </h1>
        <p style={{ fontSize:13, color:t.muted }}>KIRO creates high-converting ad scripts, hooks and captions for any platform</p>
      </motion.div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }} className="ads-grid">
        {/* Config panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Platform */}
          <div style={{ background:t.card, borderRadius:18, padding:20, border:`1px solid ${t.border}` }}>
            <p style={{ fontSize:12, fontWeight:700, color:t.muted, margin:"0 0 12px", textTransform:"uppercase", letterSpacing:"0.08em" }}>Platform</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => setPlatform(p.id)}
                  style={{ padding:"10px 12px", borderRadius:12, border:`1px solid ${platform===p.id?p.color:"transparent"}`, background:platform===p.id?`${p.color}18`:t.faint, cursor:"pointer", textAlign:"left", fontFamily:"inherit", transition:"all 0.15s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                    <span style={{ fontSize:16 }}>{p.emoji}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:t.text }}>{p.label}</span>
                  </div>
                  <p style={{ fontSize:11, color:t.muted, margin:0 }}>{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div style={{ background:t.card, borderRadius:18, padding:20, border:`1px solid ${t.border}` }}>
            <p style={{ fontSize:12, fontWeight:700, color:t.muted, margin:"0 0 12px", textTransform:"uppercase", letterSpacing:"0.08em" }}>Ad Format</p>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {FORMATS.map(f => (
                <button key={f.id} onClick={() => setFormat(f.id)}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, border:`1px solid ${format===f.id?"rgba(107,53,232,0.3)":t.border}`, background:format===f.id?`${V.v500}08`:t.card, cursor:"pointer", fontFamily:"inherit", transition:"all 0.12s" }}>
                  <div style={{ width:18, height:18, borderRadius:"50%", background:format===f.id?V.v500:"transparent", border:`2px solid ${format===f.id?V.v500:t.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {format===f.id && <div style={{ width:7, height:7, borderRadius:"50%", background:"#fff" }}/>}
                  </div>
                  <div style={{ textAlign:"left" }}>
                    <p style={{ fontSize:13, fontWeight:format===f.id?700:500, color:t.text, margin:0 }}>{f.label}</p>
                    <p style={{ fontSize:11, color:t.muted, margin:0 }}>{f.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div style={{ background:t.card, borderRadius:18, padding:20, border:`1px solid ${t.border}` }}>
            <p style={{ fontSize:12, fontWeight:700, color:t.muted, margin:"0 0 12px", textTransform:"uppercase", letterSpacing:"0.08em" }}>Goal</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {GOALS.map(g => (
                <button key={g.id} onClick={() => setGoal(g.id)}
                  style={{ padding:"10px", borderRadius:10, border:`1px solid ${goal===g.id?"rgba(107,53,232,0.3)":t.border}`, background:goal===g.id?`${V.v500}08`:t.card, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:18 }}>{g.emoji}</span>
                  <span style={{ fontSize:12, fontWeight:goal===g.id?700:500, color:t.text }}>{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional fields */}
          <div style={{ background:t.card, borderRadius:18, padding:20, border:`1px solid ${t.border}` }}>
            <p style={{ fontSize:12, fontWeight:700, color:t.muted, margin:"0 0 12px", textTransform:"uppercase", letterSpacing:"0.08em" }}>Optional</p>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, fontWeight:600, color:t.muted, display:"block", marginBottom:6 }}>Target audience</label>
              <input value={audience} onChange={e => setAudience(e.target.value)}
                placeholder="e.g. Nigerian women aged 22-35 who love fashion"
                style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, fontFamily:"inherit", outline:"none" }}/>
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:t.muted, display:"block", marginBottom:6 }}>Daily budget (₦)</label>
              <input value={budget} onChange={e => setBudget(e.target.value)} type="number"
                placeholder="e.g. 2000"
                style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, fontFamily:"inherit", outline:"none" }}/>
            </div>
          </div>

          <button onClick={() => genMut.mutate()} disabled={genMut.isPending || !storeId}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, padding:"15px 0", borderRadius:14, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", fontSize:15, fontWeight:800, fontFamily:"inherit", boxShadow:"0 6px 24px rgba(107,53,232,0.3)", transition:"all 0.15s" }}>
            {genMut.isPending ? <><RefreshCw size={16} style={{ animation:"spin 0.7s linear infinite" }}/> Creating ad…</> : <><Sparkles size={16}/> Generate Ad Content</>}
          </button>
        </div>

        {/* Result panel */}
        <div>
          <AnimatePresence mode="wait">
            {!result && !genMut.isPending && (
              <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}
                style={{ height:"100%", minHeight:400, borderRadius:18, border:`2px dashed ${t.border}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, textAlign:"center" }}>
                <div style={{ width:56, height:56, borderRadius:16, background:t.faint, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                  <Sparkles size={24} color={V.v400}/>
                </div>
                <p style={{ fontSize:15, fontWeight:700, color:t.text, margin:"0 0 8px" }}>Your ad will appear here</p>
                <p style={{ fontSize:13, color:t.muted, lineHeight:1.5 }}>Choose your platform, format and goal, then click Generate.</p>
              </motion.div>
            )}
            {genMut.isPending && (
              <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }}
                style={{ height:"100%", minHeight:400, borderRadius:18, border:`1px solid ${t.border}`, background:t.card, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, textAlign:"center" }}>
                <RefreshCw size={28} color={V.v400} style={{ marginBottom:16, animation:"spin 1s linear infinite" }}/>
                <p style={{ fontSize:15, fontWeight:700, color:t.text, margin:"0 0 8px" }}>KIRO is writing your ad…</p>
                <p style={{ fontSize:13, color:t.muted }}>Analysing your store and crafting high-converting copy</p>
              </motion.div>
            )}
            {result && (
              <motion.div key="result" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {/* Platform badge */}
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderRadius:14, background:`${platformInfo.color}12`, border:`1px solid ${platformInfo.color}30` }}>
                  <span style={{ fontSize:20 }}>{platformInfo.emoji}</span>
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:0 }}>{platformInfo.label} • {FORMATS.find(f=>f.id===format)?.label}</p>
                    <p style={{ fontSize:11, color:t.muted, margin:0 }}>{result.bestPostTime}</p>
                  </div>
                  <div style={{ marginLeft:"auto", fontSize:11, fontWeight:700, color:V.green, background:"rgba(16,185,129,0.1)", padding:"3px 10px", borderRadius:99 }}>
                    {result.estimatedReach}
                  </div>
                </div>

                {/* Hook */}
                <ResultCard label="🎣 Hook" value={result.hook} onCopy={() => copy(result.hook, "hook")} copied={copied==="hook"} t={t}/>

                {/* Script */}
                <ResultCard label="📝 Script" value={result.script} onCopy={() => copy(result.script, "script")} copied={copied==="script"} t={t} large/>

                {/* Caption */}
                <ResultCard label="📲 Caption + Hashtags" value={result.caption} onCopy={() => copy(result.caption, "caption")} copied={copied==="caption"} t={t}/>

                {/* CTA */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <ResultCard label="👆 CTA" value={result.cta} onCopy={() => copy(result.cta, "cta")} copied={copied==="cta"} t={t}/>
                  <div style={{ padding:16, borderRadius:14, background:t.faint, border:`1px solid ${t.border}` }}>
                    <p style={{ fontSize:11, fontWeight:700, color:t.muted, margin:"0 0 8px" }}>💡 BUDGET TIP</p>
                    <p style={{ fontSize:12, color:t.text, margin:0, lineHeight:1.5 }}>{result.aiBudgetTip}</p>
                  </div>
                </div>

                {/* A/B Variants */}
                {result.variations && (
                  <div style={{ padding:16, borderRadius:14, background:t.faint, border:`1px solid ${t.border}` }}>
                    <p style={{ fontSize:11, fontWeight:700, color:t.muted, margin:"0 0 10px" }}>🔀 A/B TEST HOOKS</p>
                    {result.variations.map((v: string, i: number) => (
                      <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:8 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:V.v400, minWidth:20 }}>{String.fromCharCode(65+i)}.</span>
                        <p style={{ fontSize:12, color:t.text, margin:0, lineHeight:1.5, flex:1 }}>{v}</p>
                        <button onClick={() => copy(v, `var${i}`)} style={{ background:"none", border:"none", cursor:"pointer", color:t.muted, padding:2 }}>
                          {copied===`var${i}` ? <Check size={11} color={V.green}/> : <Copy size={11}/>}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Targeting tips */}
                <div style={{ padding:16, borderRadius:14, background:t.faint, border:`1px solid ${t.border}` }}>
                  <p style={{ fontSize:11, fontWeight:700, color:t.muted, margin:"0 0 10px" }}>🎯 TARGETING TIPS</p>
                  {result.targetingTips?.map((tip: string, i: number) => (
                    <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                      <TrendingUp size={11} color={V.v400} style={{ flexShrink:0, marginTop:2 }}/>
                      <p style={{ fontSize:12, color:t.text, margin:0, lineHeight:1.5 }}>{tip}</p>
                    </div>
                  ))}
                </div>

                {/* Post on platform */}
                <a href={platform==="tiktok"?"https://ads.tiktok.com":platform==="instagram"||platform==="facebook"?"https://business.facebook.com/adsmanager":"#"}
                  target="_blank" rel="noreferrer"
                  style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 0", borderRadius:12, background:`${platformInfo.color}18`, border:`1px solid ${platformInfo.color}30`, color:t.text, textDecoration:"none", fontSize:13, fontWeight:700 }}>
                  <ExternalLink size={13}/> Create ad on {platformInfo.label}
                </a>

                <button onClick={() => { setResult(null); genMut.reset(); }}
                  style={{ padding:"10px 0", borderRadius:10, border:`1px solid ${t.border}`, background:"transparent", color:t.muted, fontSize:12, fontWeight:600, fontFamily:"inherit", cursor:"pointer" }}>
                  Generate another
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:768px){ .ads-grid{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
}

function ResultCard({ label, value, onCopy, copied, t, large=false }: any) {
  return (
    <div style={{ padding:14, borderRadius:14, background:t.faint, border:`1px solid ${t.border}` }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <p style={{ fontSize:11, fontWeight:700, color:"rgba(107,53,232,0.6)", margin:0, letterSpacing:"0.06em" }}>{label}</p>
        <button onClick={onCopy} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(107,53,232,0.5)", display:"flex", alignItems:"center", gap:4, fontSize:11, padding:"3px 8px", borderRadius:6, fontFamily:"inherit" }}>
          {copied ? <><Check size={11} color="#10B981"/> Copied</> : <><Copy size={11}/> Copy</>}
        </button>
      </div>
      <p style={{ fontSize:13, color:"rgba(255,255,255,0.85)", margin:0, lineHeight:1.65, whiteSpace:"pre-line", maxHeight:large?300:120, overflowY:"auto", color:"rgba(19,13,46,0.85)" }}>
        {value}
      </p>
    </div>
  );
}
