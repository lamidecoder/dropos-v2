"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { Sparkles, Zap, Check, RefreshCw, ArrowRight, Package, TrendingUp, Store, ChevronRight } from "lucide-react";

const NICHES = [
  { emoji:"👗", label:"Fashion"         },
  { emoji:"📱", label:"Phone Accessories"},
  { emoji:"💄", label:"Beauty & Skincare"},
  { emoji:"🏠", label:"Home & Kitchen"  },
  { emoji:"💪", label:"Fitness"         },
  { emoji:"👶", label:"Baby Products"   },
  { emoji:"🎮", label:"Gadgets"         },
  { emoji:"🌿", label:"Health"          },
  { emoji:"🐾", label:"Pet Supplies"    },
  { emoji:"🎒", label:"Bags"            },
  { emoji:"🛒", label:"General Store"  },
  { emoji:"✨", label:"Surprise me!"    },
];

type Step = "input"|"generating"|"result"|"launching"|"done";

export default function StartBusinessPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;

  const C = {
    card:   isDark ? "rgba(255,255,255,0.04)" : "#fff",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.45)" : "rgba(19,13,46,0.5)",
    border: isDark ? "rgba(107,53,232,0.15)" : "rgba(107,53,232,0.12)",
    faint:  isDark ? "rgba(107,53,232,0.06)" : "rgba(107,53,232,0.04)",
    input:  isDark ? "rgba(255,255,255,0.06)" : "#fff",
  };

  const [step, setStep]       = useState<Step>("input");
  const [interest, setInterest] = useState("");
  const [budget, setBudget]   = useState("");
  const [experience, setExp]  = useState<"none"|"some"|"experienced">("none");
  const [biz, setBiz]         = useState<any>(null);
  const [launched, setLaunched] = useState<any>(null);

  const genMut = useMutation({
    mutationFn: () => api.post("/biz/generate", { interest, budget:budget?Number(budget):undefined, experience }),
    onSuccess: (r) => { setBiz(r.data.data); setStep("result"); },
    onError: (e:any) => { toast.error(e.response?.data?.error || "Generation failed"); setStep("input"); },
  });

  const launchMut = useMutation({
    mutationFn: async () => {
      await api.post(`/biz/apply/${storeId}`, { business:biz });
      const r = await api.post(`/biz/import-products/${storeId}`, { products:biz.suggestedProducts });
      return r.data.data;
    },
    onSuccess: (data) => { setLaunched(data); setStep("done"); },
    onError: (e:any) => toast.error(e.response?.data?.error || "Launch failed"),
  });

  const handleGenerate = () => { setStep("generating"); genMut.mutate(); };

  // DONE
  if (step === "done") return (
    <div style={{ maxWidth:520, margin:"60px auto 0", textAlign:"center", padding:"0 24px", fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:200 }}>
        <div style={{ width:80, height:80, borderRadius:24, background:"linear-gradient(135deg,#2D1B69,#6B35E8)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", boxShadow:"0 16px 48px rgba(107,53,232,0.4)" }}>
          <Zap size={36} color="#C4B5FD"/>
        </div>
      </motion.div>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
        <h2 style={{ fontSize:28, fontWeight:900, color:C.text, margin:"0 0 10px", letterSpacing:"-0.04em" }}>
          {biz?.storeName} is live! 🚀
        </h2>
        <p style={{ fontSize:15, color:C.muted, margin:"0 0 6px" }}>
          Your store is set up with {launched?.created || 0} products.
        </p>
        <p style={{ fontSize:14, color:"#10B981", fontWeight:700, margin:"0 0 32px" }}>
          ✅ Store identity applied · Products imported · Ready to sell
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <a href="/dashboard" style={{ display:"flex", alignItems:"center", gap:8, padding:"13px 24px", borderRadius:12, background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", textDecoration:"none", fontSize:14, fontWeight:700, boxShadow:"0 6px 20px rgba(107,53,232,0.25)" }}>
            <TrendingUp size={14}/> Go to dashboard
          </a>
          <a href="/dashboard/products" style={{ display:"flex", alignItems:"center", gap:8, padding:"13px 24px", borderRadius:12, border:`1px solid ${C.border}`, background:C.card, color:C.text, textDecoration:"none", fontSize:14, fontWeight:600 }}>
            <Package size={14}/> View products <ChevronRight size={13}/>
          </a>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div style={{ maxWidth:800, margin:"0 auto", fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
        <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#2D1B69,#6B35E8)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Sparkles size={18} color="#C4B5FD"/>
        </div>
        <div>
          <h1 style={{ fontSize:20, fontWeight:900, color:C.text, margin:0, letterSpacing:"-0.03em" }}>Start a Business</h1>
          <p style={{ fontSize:12, color:C.muted, margin:0 }}>KIRO picks a niche, finds products, and sets up your entire store</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* INPUT */}
        {step === "input" && (
          <motion.div key="input" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }} className="biz-split">
              {/* Niche picker */}
              <div style={{ background:C.card, borderRadius:18, padding:22, border:`1px solid ${C.border}` }}>
                <p style={{ fontSize:13, fontWeight:800, color:C.text, margin:"0 0 14px" }}>What do you want to sell?</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:14 }}>
                  {NICHES.map(n => {
                    const active = interest === n.label;
                    return (
                      <button key={n.label} onClick={() => setInterest(active?"":n.label)}
                        style={{ padding:"8px 6px", borderRadius:10, border:`1px solid ${active?"rgba(107,53,232,0.5)":"transparent"}`, background:active?"rgba(107,53,232,0.1)":C.faint, cursor:"pointer", fontFamily:"inherit", textAlign:"center", transition:"all 0.12s" }}>
                        <p style={{ fontSize:18, margin:"0 0 2px" }}>{n.emoji}</p>
                        <p style={{ fontSize:10, fontWeight:active?700:500, color:active?"#A78BFA":C.muted, margin:0, lineHeight:1.2 }}>{n.label}</p>
                      </button>
                    );
                  })}
                </div>
                <textarea value={interest} onChange={e => setInterest(e.target.value)} rows={2}
                  placeholder="Or describe what you're interested in…"
                  style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:`1px solid ${C.border}`, background:C.input, color:C.text, fontSize:12, fontFamily:"inherit", outline:"none", resize:"none" }}/>
              </div>

              {/* Budget + experience */}
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ background:C.card, borderRadius:18, padding:22, border:`1px solid ${C.border}` }}>
                  <p style={{ fontSize:13, fontWeight:800, color:C.text, margin:"0 0 14px" }}>Starting budget</p>
                  <div style={{ position:"relative", marginBottom:8 }}>
                    <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:14, fontWeight:700, color:C.muted }}>₦</span>
                    <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="50,000"
                      style={{ width:"100%", padding:"11px 14px 11px 30px", borderRadius:11, border:`1px solid ${C.border}`, background:C.input, color:C.text, fontSize:14, fontFamily:"inherit", outline:"none" }}/>
                  </div>
                  <p style={{ fontSize:11, color:C.muted, margin:0 }}>KIRO picks products you can afford to start with</p>
                </div>

                <div style={{ background:C.card, borderRadius:18, padding:22, border:`1px solid ${C.border}`, flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:800, color:C.text, margin:"0 0 14px" }}>Your experience</p>
                  {([ ["none","Brand new to this 👋"], ["some","Tried before 🔄"], ["experienced","I know what I'm doing ✅"] ] as any[]).map(([id, label]: any) => (
                    <button key={id} onClick={() => setExp(id)}
                      style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"9px 12px", borderRadius:10, border:`1px solid ${experience===id?"rgba(107,53,232,0.3)":"transparent"}`, background:experience===id?"rgba(107,53,232,0.07)":"transparent", cursor:"pointer", fontFamily:"inherit", marginBottom:6, transition:"all 0.12s" }}>
                      <div style={{ width:16, height:16, borderRadius:"50%", border:`2px solid ${experience===id?"#6B35E8":C.border}`, background:experience===id?"#6B35E8":"transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {experience===id && <div style={{ width:6, height:6, borderRadius:"50%", background:"#fff" }}/>}
                      </div>
                      <span style={{ fontSize:12, fontWeight:experience===id?700:500, color:experience===id?C.text:C.muted }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleGenerate}
              style={{ width:"100%", padding:"16px 0", borderRadius:16, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", fontSize:16, fontWeight:800, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:12, boxShadow:"0 8px 32px rgba(107,53,232,0.35)" }}>
              <Sparkles size={18}/> Build my business with KIRO
            </button>
          </motion.div>
        )}

        {/* GENERATING */}
        {step === "generating" && (
          <motion.div key="gen" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ textAlign:"center", padding:"80px 24px" }}>
            <div style={{ width:88, height:88, borderRadius:26, background:"linear-gradient(145deg,#2D1B69,#6B35E8)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", boxShadow:"0 16px 56px rgba(107,53,232,0.5)", animation:"pulse 2s ease-in-out infinite" }}>
              <Sparkles size={40} color="#C4B5FD"/>
            </div>
            <h2 style={{ fontSize:22, fontWeight:800, color:C.text, margin:"0 0 10px", letterSpacing:"-0.03em" }}>KIRO is building your business…</h2>
            <p style={{ fontSize:14, color:C.muted, lineHeight:1.6, margin:"0 auto", maxWidth:360 }}>
              Researching the Nigerian market · Picking a profitable niche · Selecting 12 winning products
            </p>
          </motion.div>
        )}

        {/* RESULT */}
        {step === "result" && biz && (
          <motion.div key="result" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            {/* Business card */}
            <div style={{ borderRadius:20, overflow:"hidden", marginBottom:16, border:`1px solid ${biz.primaryColor}30` }}>
              <div style={{ padding:24, background:`linear-gradient(135deg,${biz.primaryColor}15,${biz.primaryColor}06)` }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:18 }}>
                  <div style={{ width:56, height:56, borderRadius:16, background:biz.primaryColor, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 8px 24px ${biz.primaryColor}50` }}>
                    <Store size={26} color="#fff"/>
                  </div>
                  <div style={{ flex:1 }}>
                    <h2 style={{ fontSize:26, fontWeight:900, color:C.text, margin:"0 0 4px", letterSpacing:"-0.04em" }}>{biz.storeName}</h2>
                    <p style={{ fontSize:14, fontWeight:700, color:biz.primaryColor, margin:"0 0 6px" }}>{biz.tagline}</p>
                    <p style={{ fontSize:13, color:C.muted, margin:0, lineHeight:1.5 }}>{biz.description}</p>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                  {[
                    { label:"Niche", value:biz.niche },
                    { label:"Products", value:`${biz.suggestedProducts?.length} ready` },
                    { label:"Est. profit", value:biz.estimatedProfit, color:"#10B981" },
                  ].map(s => (
                    <div key={s.label} style={{ padding:14, borderRadius:12, background:C.card, border:`1px solid ${C.border}`, textAlign:"center" }}>
                      <p style={{ fontSize:11, color:C.muted, margin:"0 0 4px" }}>{s.label}</p>
                      <p style={{ fontSize:13, fontWeight:700, color:s.color||C.text, margin:0 }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding:"14px 24px", background:C.card, borderTop:`1px solid ${biz.primaryColor}20` }}>
                <p style={{ fontSize:11, fontWeight:700, color:C.muted, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.08em" }}>Why KIRO chose this</p>
                <p style={{ fontSize:13, color:C.muted, margin:0, lineHeight:1.6 }}>{biz.whyThisNiche}</p>
              </div>
            </div>

            {/* Products list */}
            <div style={{ background:C.card, borderRadius:18, border:`1px solid ${C.border}`, overflow:"hidden", marginBottom:16 }}>
              <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
                <Package size={15} color="#8B5CF6"/>
                <p style={{ fontSize:14, fontWeight:700, color:C.text, margin:0 }}>{biz.suggestedProducts?.length} products selected by KIRO</p>
                <span style={{ marginLeft:"auto", fontSize:11, color:"#10B981", background:"rgba(16,185,129,0.1)", padding:"2px 10px", borderRadius:99, fontWeight:700 }}>Ready to import</span>
              </div>
              <div style={{ maxHeight:280, overflowY:"auto" }}>
                {biz.suggestedProducts?.map((p: any, i: number) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 20px", borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
                    <div style={{ width:34, height:34, borderRadius:9, background:C.faint, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Package size={14} color="#8B5CF6"/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:C.text, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</p>
                      <p style={{ fontSize:11, color:C.muted, margin:0 }}>{p.why}</p>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <p style={{ fontSize:13, fontWeight:800, color:C.text, margin:0 }}>₦{p.targetPrice?.toLocaleString()}</p>
                      <p style={{ fontSize:10, fontWeight:700, color:"#10B981", margin:0 }}>{p.margin}% margin</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={() => launchMut.mutate()} disabled={launchMut.isPending || !storeId}
                style={{ flex:2, padding:"15px 0", borderRadius:14, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", fontSize:15, fontWeight:800, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 8px 32px rgba(107,53,232,0.3)", opacity:launchMut.isPending?0.7:1 }}>
                {launchMut.isPending ? <><RefreshCw size={15} style={{ animation:"spin 0.7s linear infinite" }}/> Launching…</>
                  : <><Zap size={15}/> Launch this business</>}
              </button>
              <button onClick={() => { setBiz(null); setStep("input"); }}
                style={{ flex:1, padding:"15px 0", borderRadius:14, border:`1px solid ${C.border}`, background:C.card, color:C.muted, fontSize:13, fontWeight:600, fontFamily:"inherit", cursor:"pointer" }}>
                Try again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{box-shadow:0 16px 56px rgba(107,53,232,0.5)}50%{box-shadow:0 16px 72px rgba(107,53,232,0.7)}}
        @media(max-width:700px){ .biz-split{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
}
