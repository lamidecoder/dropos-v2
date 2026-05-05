"use client";
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { useCreditsStore } from "../../../store/credits.store";
import { Film, Sparkles, Download, Loader2, Zap, AlertTriangle, Play, Clock, Star } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA" };

// Real product images from Unsplash for visual examples
const TEMPLATE_EXAMPLES = {
  product_showcase: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=180&fit=crop",
  flash_sale:       "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&h=180&fit=crop",
  brand_story:      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=180&fit=crop",
  new_arrival:      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&h=180&fit=crop",
  testimonial:      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=180&fit=crop&crop=face",
  tiktok_script:    "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=300&h=180&fit=crop",
};

const TEMPLATES = [
  { id:"product_showcase", label:"Product Showcase", desc:"Cinematic 10-sec product reveal",  credits:20, badge:"Popular",  color:"#8B5CF6" },
  { id:"flash_sale",       label:"Flash Sale",       desc:"High-energy countdown ad",          credits:20, badge:"Converts", color:"#EF4444" },
  { id:"brand_story",      label:"Brand Story",      desc:"30-sec brand introduction film",    credits:50, badge:"Premium",  color:"#F59E0B" },
  { id:"new_arrival",      label:"New Arrival",      desc:"Hype drop announcement",            credits:20, badge:null,      color:"#10B981" },
  { id:"testimonial",      label:"Review Card",      desc:"Customer review animation",         credits:20, badge:null,      color:"#06B6D4" },
  { id:"tiktok_script",    label:"TikTok Script",    desc:"KIRO writes the viral script",      credits:3,  badge:"Fast",    color:"#EC4899" },
];

const MODES = [
  { id:"fast",    label:"Fast",    sub:"8 seconds",  time:"~15s", credits:20  },
  { id:"hd",      label:"HD",      sub:"15 seconds", time:"~45s", credits:50  },
  { id:"premium", label:"Premium", sub:"30 seconds", time:"~2min",credits:100 },
];

// Example TikTok scripts shown as inspiration
const EXAMPLE_SCRIPTS = [
  { product:"Brazilian Hair Bundle",  hook:"POV: You found hair that actually lasts",        duration:"0:28" },
  { product:"LED Face Mask",          hook:"I tried this for 7 days. The results shocked me", duration:"0:34" },
  { product:"Wireless Earbuds",       hook:"These are not $500 earbuds. They cost $30.",      duration:"0:22" },
];

export default function ContentStudioPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card:   isDark ? "#0F0C1E" : "#fff",
    card2:  isDark ? "#181230" : "#F8F7FF",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(107,53,232,0.1)",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.5)" : "rgba(19,13,46,0.55)",
    faint:  isDark ? "rgba(255,255,255,0.03)" : "rgba(107,53,232,0.04)",
  };

  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const { balance, deduct } = useCreditsStore();
  const [template, setTemplate] = useState("product_showcase");
  const [mode, setMode]         = useState("fast");
  const [productName, setProductName] = useState("");
  const [hook, setHook]         = useState("");
  const [result, setResult]     = useState<{url:string;type:"video"|"script"}|null>(null);
  const [activeTab, setActiveTab] = useState<"video"|"script">("video");

  const isTiktok  = template === "tiktok_script";
  const credits   = isTiktok ? 3 : MODES.find(m => m.id === mode)!.credits;
  const canAfford = balance >= credits;
  const selectedTpl = TEMPLATES.find(t => t.id === template)!;

  const genMut = useMutation({
    mutationFn: async () => {
      if (!canAfford) throw new Error("credits");
      deduct(credits);
      if (isTiktok) {
        const prompt = `Write a viral TikTok script for: ${productName}. Hook: ${hook || "surprise the viewer"}. 30-60 seconds. Make it highly engaging.`;
        const res = await api.post("/kai/smart-chat", { message: prompt, storeId });
        return { url: res.data.data?.reply || res.data.reply || "", type:"script" as const };
      }
      const res = await api.post("/super/video/generate", { template, mode, productName, hook, storeId });
      return { url: res.data.data?.url || res.data.url || "", type:"video" as const };
    },
    onSuccess: (r) => { setResult(r); toast.success(isTiktok ? "Script written!" : "Video generated!"); },
    onError: (e:any) => {
      if (e.message === "credits") { toast.error("Not enough credits"); return; }
      if (isTiktok) toast.error("Backend offline");
      else toast("Add KLING_API_KEY to Render to enable video generation", { icon:"⚙️", duration:6000 });
    },
  });

  const inp = {
    width:"100%", padding:"11px 14px", borderRadius:12,
    border:`1px solid ${t.border}`, background:t.faint,
    color:t.text, fontSize:14, outline:"none", fontFamily:"inherit",
  } as const;

  return (
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      {/* Header */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, marginBottom:28, flexWrap:"wrap" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <h1 style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.8px", color:t.text }}>Content Studio</h1>
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", padding:"3px 8px", borderRadius:99, background:"rgba(107,53,232,0.12)", color:V.v300, border:"1px solid rgba(107,53,232,0.2)", textTransform:"uppercase" }}>AI Powered</span>
          </div>
          <p style={{ fontSize:13, color:t.muted }}>Generate product videos, TikTok scripts, and ad creatives in seconds</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", borderRadius:12, background:"rgba(107,53,232,0.08)", border:"1px solid rgba(107,53,232,0.18)" }}>
          <Zap size={13} color={V.v400}/>
          <span style={{ fontSize:13, fontWeight:700, color:V.v300 }}>{balance.toLocaleString()} credits</span>
        </div>
      </motion.div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, alignItems:"start" }}>

        {/* LEFT PANEL */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Template picker - visual cards */}
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.06}}
            style={{ borderRadius:18, overflow:"hidden", border:`1px solid ${t.border}`, background:t.card }}>
            <div style={{ padding:"14px 16px 10px", borderBottom:`1px solid ${t.border}` }}>
              <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:t.muted }}>Choose Format</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:1, background:t.border }}>
              {TEMPLATES.map((tpl,i) => {
                const isActive = template === tpl.id;
                const imgUrl = TEMPLATE_EXAMPLES[tpl.id as keyof typeof TEMPLATE_EXAMPLES];
                return (
                  <button key={tpl.id} onClick={() => setTemplate(tpl.id)}
                    style={{ position:"relative", display:"flex", flexDirection:"column", padding:0, border:"none", cursor:"pointer", background:isActive?"rgba(107,53,232,0.12)":t.card, outline:"none" }}>
                    {/* Video thumbnail */}
                    <div style={{ position:"relative", width:"100%", aspectRatio:"16/9", overflow:"hidden", background:"#000" }}>
                      <img src={imgUrl} alt={tpl.label} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:isActive?1:0.65, transition:"opacity 0.2s" }}
                        onError={e => {(e.target as HTMLImageElement).style.display = "none";}}/>
                      {/* Play overlay */}
                      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)" }}>
                          <Play size={11} color="white" style={{ marginLeft:1 }}/>
                        </div>
                      </div>
                      {tpl.badge && (
                        <div style={{ position:"absolute", top:5, right:5, fontSize:8, fontWeight:700, padding:"2px 6px", borderRadius:99, background:tpl.color, color:"#fff", letterSpacing:"0.05em" }}>
                          {tpl.badge}
                        </div>
                      )}
                      {isActive && <div style={{ position:"absolute", inset:0, border:`2px solid ${V.v400}`, borderRadius:0 }}/>}
                    </div>
                    <div style={{ padding:"8px 10px 10px", textAlign:"left", width:"100%" }}>
                      <p style={{ fontSize:11, fontWeight:700, color:isActive?V.v200:t.text, marginBottom:2 }}>{tpl.label}</p>
                      <p style={{ fontSize:9.5, color:t.muted, lineHeight:1.4 }}>{tpl.desc}</p>
                      <p style={{ fontSize:9, fontWeight:700, color:tpl.color, marginTop:4 }}>{tpl.credits} credits</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Quality mode - only for video */}
          {!isTiktok && (
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
              style={{ borderRadius:18, border:`1px solid ${t.border}`, background:t.card, overflow:"hidden" }}>
              <div style={{ padding:"14px 16px 10px", borderBottom:`1px solid ${t.border}` }}>
                <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:t.muted }}>Video Quality</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0 }}>
                {MODES.map((m,i) => {
                  const isActive = mode === m.id;
                  return (
                    <button key={m.id} onClick={() => setMode(m.id)}
                      style={{ padding:"14px 12px", border:"none", borderRight:i<2?`1px solid ${t.border}`:"none", cursor:"pointer", background:isActive?"rgba(107,53,232,0.1)":t.card, outline:"none", textAlign:"center", transition:"background 0.15s" }}>
                      <div style={{ fontSize:11, fontWeight:800, color:isActive?V.v300:t.text, marginBottom:3 }}>{m.label}</div>
                      <div style={{ fontSize:10, color:t.muted, marginBottom:4 }}>{m.sub}</div>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                        <Clock size={9} color={t.muted}/>
                        <span style={{ fontSize:9, color:t.muted }}>{m.time}</span>
                        <span style={{ fontSize:9, fontWeight:700, color:isActive?V.v400:t.muted }}>{m.credits}cr</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Product details */}
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.14}}
            style={{ borderRadius:18, border:`1px solid ${t.border}`, background:t.card, padding:16 }}>
            <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:t.muted, marginBottom:12 }}>Product Details</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <input value={productName} onChange={e=>setProductName(e.target.value)}
                placeholder={isTiktok ? "What product is this script for?" : "Product name"}
                style={inp}/>
              <input value={hook} onChange={e=>setHook(e.target.value)}
                placeholder={isTiktok ? "Angle or hook (optional)" : "Key message or offer"}
                style={inp}/>
            </div>
          </motion.div>

          {/* Credits warning */}
          {!canAfford && (
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", borderRadius:12, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)" }}>
              <AlertTriangle size={14} color="#EF4444"/>
              <p style={{ fontSize:12, color:"#EF4444", flex:1 }}>You need {credits} credits.</p>
              <Link href="/dashboard/billing" style={{ fontSize:12, fontWeight:700, color:"#EF4444" }}>Top up</Link>
            </div>
          )}

          {/* Generate button */}
          <motion.button whileTap={{scale:0.97}} onClick={() => genMut.mutate()}
            disabled={!productName || genMut.isPending || !canAfford}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10, padding:"14px", borderRadius:14, border:"none", cursor:productName&&canAfford?"pointer":"not-allowed", fontFamily:"inherit", fontSize:14, fontWeight:800, color:"#fff", background:productName&&canAfford?"linear-gradient(135deg,#6B35E8,#3D1C8A)":"rgba(255,255,255,0.06)", opacity:(!productName||!canAfford)&&!genMut.isPending?0.5:1, transition:"all 0.15s" }}>
            {genMut.isPending
              ? <><Loader2 size={16} style={{animation:"spin 1s linear infinite"}}/> Generating... ({credits} credits)</>
              : isTiktok
                ? <><Sparkles size={16}/> Write TikTok Script ({credits} credits)</>
                : <><Film size={16}/> Generate Video ({credits} credits)</>
            }
          </motion.button>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Output panel */}
          <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.1}}
            style={{ borderRadius:18, border:`1px solid ${t.border}`, background:t.card, overflow:"hidden", minHeight:320 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:`1px solid ${t.border}` }}>
              <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:t.muted }}>Preview</p>
              {result?.type==="video" && result.url && (
                <a href={result.url} download target="_blank" style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:10, background:"rgba(107,53,232,0.1)", color:V.v300, textDecoration:"none", fontSize:12, fontWeight:600 }}>
                  <Download size={11}/> Download
                </a>
              )}
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:24, minHeight:260 }}>
              <AnimatePresence mode="wait">
                {genMut.isPending && (
                  <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{textAlign:"center"}}>
                    <motion.div animate={{rotate:360}} transition={{duration:2,repeat:Infinity,ease:"linear"}}
                      style={{width:60,height:60,borderRadius:18,background:"linear-gradient(135deg,#6B35E8,#3D1C8A)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",boxShadow:"0 12px 36px rgba(107,53,232,0.4)"}}>
                      {isTiktok?<Sparkles size={26} color="white"/>:<Film size={26} color="white"/>}
                    </motion.div>
                    <p style={{fontSize:14,fontWeight:700,color:t.text,marginBottom:6}}>{isTiktok?"Writing your script...":"Rendering your video..."}</p>
                    <p style={{fontSize:12,color:t.muted}}>This takes {isTiktok?"5-10":"15-120"} seconds</p>
                  </motion.div>
                )}
                {!genMut.isPending && result && (
                  <motion.div key="result" initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} style={{width:"100%"}}>
                    {result.type==="video" && result.url
                      ? <video src={result.url} controls style={{width:"100%",borderRadius:12,maxHeight:260,background:"#000"}}/>
                      : <div style={{padding:16,borderRadius:14,background:t.faint,border:`1px solid ${t.border}`,fontSize:13,lineHeight:1.7,color:t.text,whiteSpace:"pre-wrap",maxHeight:280,overflowY:"auto"}}>{result.url}</div>
                    }
                  </motion.div>
                )}
                {!genMut.isPending && !result && (
                  <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} style={{textAlign:"center",padding:"0 20px"}}>
                    <div style={{fontSize:48,marginBottom:16}}>{isTiktok?"📱":"🎬"}</div>
                    <p style={{fontSize:14,fontWeight:600,color:t.muted,marginBottom:8}}>{isTiktok?"Your script appears here":"Your video appears here"}</p>
                    <p style={{fontSize:12,color:t.muted,opacity:0.7}}>Choose a format, fill in your product, and click generate</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Example scripts for inspiration */}
          {isTiktok && (
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
              style={{borderRadius:18,border:`1px solid ${t.border}`,background:t.card,overflow:"hidden"}}>
              <div style={{padding:"14px 16px 10px",borderBottom:`1px solid ${t.border}`}}>
                <p style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:t.muted}}>Script Examples</p>
              </div>
              <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>
                {EXAMPLE_SCRIPTS.map((ex,i) => (
                  <div key={i} style={{padding:"12px",borderRadius:12,background:t.faint,border:`1px solid ${t.border}`}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                      <p style={{fontSize:12,fontWeight:700,color:t.text}}>{ex.product}</p>
                      <span style={{fontSize:10,color:t.muted,display:"flex",alignItems:"center",gap:4}}><Clock size={9}/>{ex.duration}</span>
                    </div>
                    <p style={{fontSize:12,color:t.muted,fontStyle:"italic"}}>"{ex.hook}"</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Stats row */}
          {!isTiktok && (
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
              style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,borderRadius:18,overflow:"hidden",border:`1px solid ${t.border}`,background:t.border}}>
              {[{n:"10s",l:"Average generation"},{n:"4K",l:"Maximum resolution"},{n:"16+",l:"Video styles"}].map((s,i)=>(
                <div key={i} style={{padding:"14px",background:t.card,textAlign:"center"}}>
                  <p style={{fontSize:18,fontWeight:900,color:t.text,letterSpacing:"-0.5px"}}>{s.n}</p>
                  <p style={{fontSize:10,color:t.muted,marginTop:2}}>{s.l}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Tips */}
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.25}}
            style={{borderRadius:18,border:"1px solid rgba(107,53,232,0.15)",background:"rgba(107,53,232,0.04)",padding:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <Zap size={13} color={V.v400}/>
              <p style={{fontSize:11,fontWeight:700,color:V.v300}}>KIRO tips for better results</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {["Be specific with product name — 'Brazilian Hair Bundle 18 inch' converts 3x better than just 'hair'",isTiktok?"Include the hook angle — 'survival' or 'transformation' angles outperform generic scripts":"Provide a clear message — 'launches April 30' or '50% off today only' works best"].map((tip,i) => (
                <div key={i} style={{display:"flex",alignItems:"start",gap:8}}>
                  <span style={{fontSize:10,color:V.v400,flexShrink:0,marginTop:2}}>→</span>
                  <p style={{fontSize:11,color:"rgba(255,255,255,0.5)",lineHeight:1.5}}>{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
