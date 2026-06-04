"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { Sparkles, Zap, Check, RefreshCw, ArrowRight, Package, Store, TrendingUp } from "lucide-react";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B" };

const NICHES = [
  { emoji:"👗", label:"Fashion & Clothing"    },
  { emoji:"📱", label:"Phone Accessories"      },
  { emoji:"💄", label:"Beauty & Skincare"      },
  { emoji:"🏠", label:"Home & Kitchen"         },
  { emoji:"💪", label:"Fitness & Sports"       },
  { emoji:"👶", label:"Baby Products"          },
  { emoji:"🎮", label:"Electronics & Gadgets"  },
  { emoji:"🌿", label:"Health & Wellness"      },
  { emoji:"🐾", label:"Pet Supplies"           },
  { emoji:"🎒", label:"Bags & Accessories"     },
  { emoji:"🛒", label:"General/Mixed Store"    },
  { emoji:"✨", label:"Surprise me!"           },
];

type Step = "input" | "generating" | "result" | "applying" | "done";

export default function StartBusinessPage() {
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

  const [step, setStep]       = useState<Step>("input");
  const [interest, setInterest] = useState("");
  const [budget, setBudget]   = useState("");
  const [experience, setExperience] = useState<"none"|"some"|"experienced">("none");
  const [biz, setBiz]         = useState<any>(null);
  const [applyResult, setApplyResult] = useState<any>(null);

  const genMut = useMutation({
    mutationFn: () => api.post("/biz/generate", { interest, budget:budget?Number(budget):undefined, experience }),
    onSuccess: (r) => { setBiz(r.data.data); setStep("result"); },
    onError: (e:any) => { toast.error(e.response?.data?.error || "Generation failed"); setStep("input"); },
  });

  const applyMut = useMutation({
    mutationFn: async () => {
      // 1. Apply the store identity
      await api.post(`/biz/apply/${storeId}`, { business:biz });
      // 2. Import all the products
      const result = await api.post(`/biz/import-products/${storeId}`, { products:biz.suggestedProducts });
      return result.data.data;
    },
    onSuccess: (data) => { setApplyResult(data); setStep("done"); },
    onError:   (e:any) => toast.error(e.response?.data?.error || "Apply failed"),
  });

  const generate = () => {
    setStep("generating");
    genMut.mutate();
  };

  return (
    <div style={{ maxWidth:760, margin:"0 auto" }}>
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:20, fontWeight:900, color:t.text, margin:"0 0 4px", letterSpacing:"-0.03em" }}>
          Start a Business
        </h1>
        <p style={{ fontSize:13, color:t.muted }}>
          Don't know what to sell? KIRO picks the niche, finds winning products, and sets up your entire store.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">

        {/* STEP 1: Input */}
        {step === "input" && (
          <motion.div key="input" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            {/* What are you interested in */}
            <div style={{ background:t.card, borderRadius:20, padding:24, border:`1px solid ${t.border}`, marginBottom:16 }}>
              <p style={{ fontSize:14, fontWeight:700, color:t.text, margin:"0 0 16px" }}>
                What are you interested in? <span style={{ fontWeight:400, color:t.muted }}>(optional)</span>
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }} className="niche-grid">
                {NICHES.map(n => {
                  const active = interest === n.label;
                  return (
                    <button key={n.label} onClick={() => setInterest(active?"":n.label)}
                      style={{ padding:"10px 8px", borderRadius:12, border:`1px solid ${active?"rgba(107,53,232,0.4)":t.border}`, background:active?`${V.v500}10`:t.faint, cursor:"pointer", fontFamily:"inherit", textAlign:"center", transition:"all 0.12s" }}>
                      <p style={{ fontSize:20, margin:"0 0 4px" }}>{n.emoji}</p>
                      <p style={{ fontSize:11, fontWeight:active?700:500, color:active?V.v400:t.muted, margin:0, lineHeight:1.3 }}>{n.label}</p>
                    </button>
                  );
                })}
              </div>
              <textarea value={interest} onChange={e => setInterest(e.target.value)} rows={2}
                placeholder="Or describe what you're passionate about, or what market you want to enter..."
                style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, fontFamily:"inherit", outline:"none", resize:"none" }}/>
            </div>

            {/* Budget and experience */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }} className="budget-grid">
              <div style={{ background:t.card, borderRadius:18, padding:20, border:`1px solid ${t.border}` }}>
                <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 12px" }}>Starting budget (optional)</p>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:14, fontWeight:700, color:t.muted }}>₦</span>
                  <input type="number" value={budget} onChange={e => setBudget(e.target.value)}
                    placeholder="50,000"
                    style={{ ...{width:"100%", padding:"11px 14px 11px 30px", borderRadius:10, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, fontFamily:"inherit", outline:"none"} }}/>
                </div>
                <p style={{ fontSize:11, color:t.muted, margin:"6px 0 0" }}>KIRO picks products you can afford to stock</p>
              </div>
              <div style={{ background:t.card, borderRadius:18, padding:20, border:`1px solid ${t.border}` }}>
                <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 12px" }}>Your experience</p>
                {([ ["none","I'm brand new 👋"], ["some","I've tried before 🔄"], ["experienced","I know what I'm doing ✅"] ] as [typeof experience, string][]).map(([id, label]) => (
                  <button key={id} onClick={() => setExperience(id)}
                    style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 10px", borderRadius:9, border:`1px solid ${experience===id?"rgba(107,53,232,0.3)":"transparent"}`, background:experience===id?`${V.v500}08`:"transparent", cursor:"pointer", fontFamily:"inherit", marginBottom:4 }}>
                    <div style={{ width:16, height:16, borderRadius:"50%", border:`2px solid ${experience===id?V.v500:t.border}`, background:experience===id?V.v500:"transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {experience===id && <div style={{ width:6, height:6, borderRadius:"50%", background:"#fff" }}/>}
                    </div>
                    <span style={{ fontSize:12, fontWeight:experience===id?700:500, color:experience===id?t.text:t.muted }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generate} style={{ width:"100%", padding:"16px 0", borderRadius:14, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", fontSize:16, fontWeight:800, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 8px 30px rgba(107,53,232,0.35)" }}>
              <Sparkles size={18}/> Generate my business
            </button>
          </motion.div>
        )}

        {/* STEP 2: Generating */}
        {step === "generating" && (
          <motion.div key="generating" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ textAlign:"center", padding:"80px 24px" }}>
            <div style={{ width:80, height:80, borderRadius:24, background:"linear-gradient(145deg,#2D1B69,#6B35E8)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", boxShadow:"0 12px 40px rgba(107,53,232,0.3)", animation:"pulse 2s ease-in-out infinite" }}>
              <Sparkles size={36} color="#C4B5FD"/>
            </div>
            <h2 style={{ fontSize:22, fontWeight:800, color:t.text, margin:"0 0 10px", letterSpacing:"-0.03em" }}>KIRO is building your business…</h2>
            <p style={{ fontSize:14, color:t.muted, lineHeight:1.6 }}>
              Researching the Nigerian market, finding winning products,<br/>setting up your store identity. Usually takes 15-20 seconds.
            </p>
            <style>{"@keyframes pulse{0%,100%{box-shadow:0 12px 40px rgba(107,53,232,0.3)}50%{box-shadow:0 12px 60px rgba(107,53,232,0.5)}}"}</style>
          </motion.div>
        )}

        {/* STEP 3: Result */}
        {step === "result" && biz && (
          <motion.div key="result" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            {/* Business header */}
            <div style={{
              borderRadius:20, overflow:"hidden", marginBottom:16,
              background:`linear-gradient(135deg,${biz.primaryColor}18,${biz.primaryColor}08)`,
              border:`1px solid ${biz.primaryColor}30`,
            }}>
              <div style={{ padding:"28px 28px 20px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:16 }}>
                  <div style={{ width:52, height:52, borderRadius:15, background:biz.primaryColor, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 6px 20px ${biz.primaryColor}40` }}>
                    <Store size={24} color="#fff"/>
                  </div>
                  <div style={{ flex:1 }}>
                    <h2 style={{ fontSize:24, fontWeight:900, color:t.text, margin:"0 0 4px", letterSpacing:"-0.04em" }}>{biz.storeName}</h2>
                    <p style={{ fontSize:14, color:biz.primaryColor, fontWeight:700, margin:"0 0 6px" }}>{biz.tagline}</p>
                    <p style={{ fontSize:13, color:t.muted, margin:0, lineHeight:1.5 }}>{biz.description}</p>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }} className="biz-stats">
                  <div style={{ padding:14, borderRadius:12, background:t.card, border:`1px solid ${t.border}`, textAlign:"center" }}>
                    <p style={{ fontSize:11, color:t.muted, margin:"0 0 4px" }}>Niche</p>
                    <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:0 }}>{biz.niche}</p>
                  </div>
                  <div style={{ padding:14, borderRadius:12, background:t.card, border:`1px solid ${t.border}`, textAlign:"center" }}>
                    <p style={{ fontSize:11, color:t.muted, margin:"0 0 4px" }}>Products</p>
                    <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:0 }}>{biz.suggestedProducts?.length || 0} selected</p>
                  </div>
                  <div style={{ padding:14, borderRadius:12, background:t.card, border:`1px solid ${t.border}`, textAlign:"center" }}>
                    <p style={{ fontSize:11, color:t.muted, margin:"0 0 4px" }}>Est. profit</p>
                    <p style={{ fontSize:12, fontWeight:700, color:V.green, margin:0 }}>{biz.estimatedProfit}</p>
                  </div>
                </div>
              </div>

              {/* Why this niche */}
              <div style={{ padding:"16px 28px", background:"rgba(255,255,255,0.03)", borderTop:`1px solid ${biz.primaryColor}20` }}>
                <p style={{ fontSize:11, fontWeight:700, color:t.muted, margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.08em" }}>Why KIRO chose this</p>
                <p style={{ fontSize:13, color:t.muted, margin:0, lineHeight:1.6 }}>{biz.whyThisNiche}</p>
              </div>
            </div>

            {/* Product list */}
            <div style={{ background:t.card, borderRadius:18, border:`1px solid ${t.border}`, marginBottom:16, overflow:"hidden" }}>
              <div style={{ padding:"16px 20px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:10 }}>
                <Package size={16} color={V.v400}/>
                <p style={{ fontSize:14, fontWeight:700, color:t.text, margin:0 }}>
                  {biz.suggestedProducts?.length} products KIRO selected
                </p>
                <span style={{ fontSize:11, color:V.green, background:"rgba(16,185,129,0.1)", padding:"2px 8px", borderRadius:99, fontWeight:700, marginLeft:"auto" }}>
                  Ready to import
                </span>
              </div>
              <div style={{ maxHeight:320, overflowY:"auto" }}>
                {biz.suggestedProducts?.map((p: any, i: number) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 20px", borderBottom:i<biz.suggestedProducts.length-1?`1px solid rgba(255,255,255,0.04)`:"none" }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:t.faint, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:18 }}>
                      🛍️
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:t.text, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</p>
                      <p style={{ fontSize:11, color:t.muted, margin:0 }}>{p.why}</p>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <p style={{ fontSize:13, fontWeight:800, color:t.text, margin:0 }}>₦{p.targetPrice?.toLocaleString()}</p>
                      <p style={{ fontSize:10, color:V.green, margin:0, fontWeight:700 }}>{p.margin}% margin</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={() => applyMut.mutate()} disabled={applyMut.isPending || !storeId}
                style={{ flex:2, display:"flex", alignItems:"center", justifyContent:"center", gap:10, padding:"16px 0", borderRadius:14, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", fontSize:15, fontWeight:800, fontFamily:"inherit", boxShadow:"0 8px 30px rgba(107,53,232,0.3)", opacity:applyMut.isPending?0.7:1 }}>
                {applyMut.isPending ? <><RefreshCw size={16} style={{ animation:"spin 0.7s linear infinite" }}/> Building your store…</> : <><Zap size={16}/> Launch this business</>}
              </button>
              <button onClick={() => { setBiz(null); setStep("input"); }}
                style={{ flex:1, padding:"16px 0", borderRadius:14, border:`1px solid ${t.border}`, background:t.card, color:t.muted, fontSize:13, fontWeight:600, fontFamily:"inherit", cursor:"pointer" }}>
                Try again
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Done */}
        {step === "done" && (
          <motion.div key="done" initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
            style={{ textAlign:"center", padding:"60px 24px" }}>
            <motion.div
              initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", delay:0.2 }}
              style={{ width:80, height:80, borderRadius:"50%", background:"rgba(16,185,129,0.12)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
              <Check size={36} color={V.green}/>
            </motion.div>
            <h2 style={{ fontSize:28, fontWeight:900, color:t.text, margin:"0 0 10px", letterSpacing:"-0.04em" }}>
              Your business is live! 🚀
            </h2>
            <p style={{ fontSize:15, color:t.muted, margin:"0 0 6px", lineHeight:1.6 }}>
              <strong style={{ color:t.text }}>{biz?.storeName}</strong> is set up and ready.
            </p>
            <p style={{ fontSize:14, color:V.green, fontWeight:700, margin:"0 0 28px" }}>
              ✅ {applyResult?.created} products imported · Store identity applied · Auto-fulfillment enabled
            </p>
            <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
              <a href="/dashboard" style={{ display:"flex", alignItems:"center", gap:8, padding:"13px 24px", borderRadius:12, background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", textDecoration:"none", fontSize:14, fontWeight:700, boxShadow:"0 6px 20px rgba(107,53,232,0.25)" }}>
                <TrendingUp size={14}/> Go to dashboard
              </a>
              <a href="/dashboard/ads" style={{ display:"flex", alignItems:"center", gap:8, padding:"13px 24px", borderRadius:12, border:`1px solid ${t.border}`, background:t.card, color:t.text, textDecoration:"none", fontSize:14, fontWeight:600 }}>
                Create first ad <ArrowRight size={13}/>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:640px){ .niche-grid{grid-template-columns:1fr 1fr!important;} .budget-grid,.biz-stats{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
}
