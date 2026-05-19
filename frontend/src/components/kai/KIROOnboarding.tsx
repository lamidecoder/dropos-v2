"use client";
// KIRO Onboarding — first-time user wizard
// Shows once after signup, guides through: store setup → first product → first insight
// Stored in localStorage so it only shows once

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/auth.store";
import toast from "react-hot-toast";

const P = { v600:"#5B21B6", v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA" };

interface OnboardingProps {
  storeId: string;
  onComplete: () => void;
}

export function KIROOnboarding({ storeId, onComplete }: OnboardingProps) {
  const user = useAuthStore(s => s.user);
  const [step,     setStep]     = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [niche,    setNiche]    = useState("");
  const [goal,     setGoal]     = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [imported, setImported] = useState<any>(null);
  const name = user?.name?.split(" ")?.[0] || "there";

  const NICHES = [
    { icon:"👗", label:"Fashion & Clothing" },
    { icon:"📱", label:"Electronics & Gadgets" },
    { icon:"💄", label:"Beauty & Skincare" },
    { icon:"🏠", label:"Home & Living" },
    { icon:"👶", label:"Baby & Kids" },
    { icon:"💪", label:"Health & Fitness" },
    { icon:"🎮", label:"Gaming & Tech" },
    { icon:"🐾", label:"Pets & Animals" },
  ];

  const GOALS = [
    { icon:"💰", label:"Make my first ₦100,000" },
    { icon:"📦", label:"Get 10 orders this month" },
    { icon:"🚀", label:"Build a full-time income" },
    { icon:"🎯", label:"Test if this niche works" },
  ];

  const STEPS = [
    { id:"welcome",  title:`Welcome, ${name}`, subtitle:"KIRO is your commerce AI. Let's get your store ready in 60 seconds." },
    { id:"niche",    title:"What do you sell?",  subtitle:"KIRO will find the best products and strategies for your market." },
    { id:"goal",     title:"What's your goal?",  subtitle:"KIRO will push you toward it every day." },
    { id:"import",   title:"Import your first product", subtitle:"Paste any URL from AliExpress, Temu, Jumia, Amazon — KIRO handles the rest." },
    { id:"done",     title:"KIRO is ready.",     subtitle:"Everything is set. Let's make your first sale." },
  ];

  const handleImport = async () => {
    if (!urlInput.trim()) { setStep(4); return; }
    setLoading(true);
    try {
      const res = await api.post("/kai/scrape-url", { url: urlInput.trim(), storeId });
      setImported(res.data.data);
      setStep(4);
    } catch {
      toast.error("Couldn't fetch that URL — you can import products later in KIRO");
      setStep(4);
    } finally { setLoading(false); }
  };

  const handleDone = async () => {
    setLoading(true);
    try {
      // Save niche + goal to store settings
      if (niche) await api.patch(`/stores/${storeId}`, { niche }).catch(() => {});
      if (goal) {
        await api.post("/kai/goals", {
          storeId,
          title: goal,
          targetValue: 100000,
          unit: "NGN",
          deadline: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        }).catch(() => {});
      }
      if (imported) {
        await api.post("/kai/action", {
          storeId,
          actions: [{ type:"import_from_url", approved:true, payload: { url: urlInput.trim() } }],
        }).catch(() => {});
      }
    } catch {}
    localStorage.setItem(`kiro-onboarded-${storeId}`, "1");
    setLoading(false);
    onComplete();
  };

  const progress = ((step) / (STEPS.length - 1)) * 100;

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}
      style={{ position:"fixed", inset:0, zIndex:10000, display:"flex", alignItems:"center", justifyContent:"center", padding:16, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(12px)" }}>

      <motion.div initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}}
        style={{ width:"100%", maxWidth:460, borderRadius:24, background:"#0D0918", border:"1px solid rgba(107,53,232,0.2)", overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>

        {/* Progress bar */}
        <div style={{ height:3, background:"rgba(107,53,232,0.15)" }}>
          <motion.div animate={{ width:`${progress}%` }} transition={{ duration:0.4 }}
            style={{ height:"100%", background:`linear-gradient(90deg,${P.v500},${P.v400})`, borderRadius:2 }}/>
        </div>

        <div style={{ padding:"28px 24px 24px" }}>
          {/* Step indicator */}
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:20 }}>
            {STEPS.map((_,i) => (
              <div key={i} style={{ height:4, flex:1, borderRadius:2, background:i<=step?"rgba(107,53,232,0.7)":"rgba(107,53,232,0.15)", transition:"all 0.3s" }}/>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 0: Welcome */}
            {step === 0 && (
              <motion.div key="welcome" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <div style={{ textAlign:"center", padding:"8px 0 24px" }}>
                  <motion.div animate={{scale:[1,1.08,1]}} transition={{duration:2,repeat:Infinity,ease:"easeInOut"}}
                    style={{ width:72, height:72, borderRadius:22, background:`linear-gradient(135deg,${P.v500},${P.v600})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", boxShadow:`0 8px 30px rgba(107,53,232,0.5)` }}>
                    <svg width={36} height={36} viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14l9 0-1 8 10-12-9 0L13 2z" fill="white" fillOpacity={0.95}/></svg>
                  </motion.div>
                  <h2 style={{ fontSize:24, fontWeight:900, color:"#F0ECFF", margin:"0 0 8px", letterSpacing:"-0.5px" }}>Welcome, {name} 👋</h2>
                  <p style={{ fontSize:14, color:"rgba(200,190,255,0.6)", margin:"0 0 24px", lineHeight:1.6 }}>
                    I'm KIRO — your AI business partner. I'll help you find winning products, write ad copy, fulfill orders, and grow your store from a single chat.
                  </p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:24 }}>
                    {[
                      { icon:"🌐", text:"Import from any website" },
                      { icon:"📊", text:"Live store analytics" },
                      { icon:"⚡", text:"Actions from chat" },
                      { icon:"🎯", text:"Winning product intel" },
                    ].map(f => (
                      <div key={f.text} style={{ padding:"10px 12px", borderRadius:12, background:"rgba(107,53,232,0.08)", border:"1px solid rgba(107,53,232,0.15)", display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:16 }}>{f.icon}</span>
                        <span style={{ fontSize:12, color:"rgba(200,190,255,0.7)", fontWeight:500 }}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => setStep(1)}
                  style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:`linear-gradient(135deg,${P.v500},${P.v600})`, color:"#fff", fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 20px rgba(107,53,232,0.4)` }}>
                  Let's set up KIRO →
                </button>
              </motion.div>
            )}

            {/* Step 1: Niche */}
            {step === 1 && (
              <motion.div key="niche" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <h2 style={{ fontSize:20, fontWeight:800, color:"#F0ECFF", margin:"0 0 4px" }}>What do you sell?</h2>
                <p style={{ fontSize:13, color:"rgba(200,190,255,0.5)", margin:"0 0 20px" }}>KIRO will personalise your insights and product recommendations.</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:20 }}>
                  {NICHES.map(n => (
                    <button key={n.label} onClick={() => setNiche(n.label)}
                      style={{ padding:"12px", borderRadius:12, border:`1px solid ${niche===n.label?P.v400:"rgba(107,53,232,0.15)"}`, background:niche===n.label?"rgba(107,53,232,0.2)":"rgba(107,53,232,0.05)", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:8, transition:"all 0.15s" }}>
                      <span style={{ fontSize:18 }}>{n.icon}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:"rgba(200,190,255,0.8)", textAlign:"left" }}>{n.label}</span>
                    </button>
                  ))}
                </div>
                <input value={niche} onChange={e=>setNiche(e.target.value)} placeholder="Or type your niche..."
                  style={{ width:"100%", padding:"12px 16px", borderRadius:12, border:"1px solid rgba(107,53,232,0.2)", background:"rgba(107,53,232,0.05)", color:"#F0ECFF", fontSize:14, outline:"none", fontFamily:"inherit", marginBottom:14, boxSizing:"border-box" }}/>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>setStep(0)} style={{ padding:"12px 16px", borderRadius:12, border:"1px solid rgba(107,53,232,0.2)", background:"transparent", color:"rgba(200,190,255,0.5)", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>← Back</button>
                  <button onClick={()=>setStep(2)} disabled={!niche}
                    style={{ flex:1, padding:"12px", borderRadius:12, border:"none", background:niche?`linear-gradient(135deg,${P.v500},${P.v600})`:"rgba(107,53,232,0.2)", color:"#fff", fontSize:14, fontWeight:700, cursor:niche?"pointer":"not-allowed", fontFamily:"inherit" }}>
                    Continue →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Goal */}
            {step === 2 && (
              <motion.div key="goal" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <h2 style={{ fontSize:20, fontWeight:800, color:"#F0ECFF", margin:"0 0 4px" }}>What's your goal?</h2>
                <p style={{ fontSize:13, color:"rgba(200,190,255,0.5)", margin:"0 0 20px" }}>KIRO will track this and remind you every day.</p>
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
                  {GOALS.map(g => (
                    <button key={g.label} onClick={()=>setGoal(g.label)}
                      style={{ padding:"14px 16px", borderRadius:12, border:`1px solid ${goal===g.label?P.v400:"rgba(107,53,232,0.15)"}`, background:goal===g.label?"rgba(107,53,232,0.18)":"rgba(107,53,232,0.05)", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:12, transition:"all 0.15s", textAlign:"left" }}>
                      <span style={{ fontSize:22, flexShrink:0 }}>{g.icon}</span>
                      <span style={{ fontSize:14, fontWeight:600, color:"rgba(200,190,255,0.85)" }}>{g.label}</span>
                      {goal===g.label && <span style={{ marginLeft:"auto", width:18, height:18, borderRadius:"50%", background:P.v500, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff", flexShrink:0 }}>✓</span>}
                    </button>
                  ))}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>setStep(1)} style={{ padding:"12px 16px", borderRadius:12, border:"1px solid rgba(107,53,232,0.2)", background:"transparent", color:"rgba(200,190,255,0.5)", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>← Back</button>
                  <button onClick={()=>setStep(3)}
                    style={{ flex:1, padding:"12px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${P.v500},${P.v600})`, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                    {goal ? "Continue →" : "Skip for now →"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Import first product */}
            {step === 3 && (
              <motion.div key="import" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <h2 style={{ fontSize:20, fontWeight:800, color:"#F0ECFF", margin:"0 0 4px" }}>Import your first product</h2>
                <p style={{ fontSize:13, color:"rgba(200,190,255,0.5)", margin:"0 0 20px" }}>Paste a product link from AliExpress, Temu, Amazon, Jumia, or any website.</p>
                <input value={urlInput} onChange={e=>setUrlInput(e.target.value)} placeholder="https://aliexpress.com/item/..."
                  style={{ width:"100%", padding:"12px 16px", borderRadius:12, border:"1px solid rgba(107,53,232,0.2)", background:"rgba(107,53,232,0.05)", color:"#F0ECFF", fontSize:14, outline:"none", fontFamily:"inherit", marginBottom:10, boxSizing:"border-box" }}/>
                <p style={{ fontSize:11, color:"rgba(200,190,255,0.4)", margin:"0 0 16px" }}>
                  Works with: AliExpress · Temu · Amazon · Jumia · Konga · Shein · DHgate · any store
                </p>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>setStep(2)} style={{ padding:"12px 16px", borderRadius:12, border:"1px solid rgba(107,53,232,0.2)", background:"transparent", color:"rgba(200,190,255,0.5)", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>← Back</button>
                  <button onClick={handleImport} disabled={loading}
                    style={{ flex:1, padding:"12px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${P.v500},${P.v600})`, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    {loading ? <><span style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"block"}}/> Fetching...</> : urlInput.trim() ? "Import →" : "Skip for now →"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Done */}
            {step === 4 && (
              <motion.div key="done" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <div style={{ textAlign:"center", padding:"8px 0 20px" }}>
                  <motion.div animate={{scale:[0.8,1.1,1]}} transition={{duration:0.5}}
                    style={{ fontSize:60, marginBottom:16 }}>🎉</motion.div>
                  <h2 style={{ fontSize:22, fontWeight:900, color:"#F0ECFF", margin:"0 0 8px", letterSpacing:"-0.5px" }}>KIRO is ready.</h2>
                  <p style={{ fontSize:14, color:"rgba(200,190,255,0.6)", margin:"0 0 20px", lineHeight:1.6 }}>
                    {niche && `Your ${niche} store is configured. `}
                    {goal && `I'll track your goal: "${goal}". `}
                    {imported ? `"${imported.name}" is ready to import. ` : ""}
                    Ask me anything.
                  </p>
                  {imported && (
                    <div style={{ padding:"12px 14px", borderRadius:12, background:"rgba(107,53,232,0.1)", border:"1px solid rgba(107,53,232,0.2)", marginBottom:16, textAlign:"left" }}>
                      <p style={{ fontSize:12, fontWeight:700, color:P.v300, margin:"0 0 4px" }}>Ready to import</p>
                      <p style={{ fontSize:13, color:"#F0ECFF", margin:"0 0 4px", fontWeight:600 }}>{imported.name}</p>
                      <p style={{ fontSize:12, color:"rgba(200,190,255,0.6)", margin:0 }}>{imported.currencySymbol}{imported.suggestedLocalPrice?.toLocaleString()} · {imported.marginPct}% margin</p>
                    </div>
                  )}
                </div>
                <button onClick={handleDone} disabled={loading}
                  style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:`linear-gradient(135deg,${P.v500},${P.v600})`, color:"#fff", fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 20px rgba(107,53,232,0.4)`, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  {loading ? <span style={{width:16,height:16,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"block"}}/> : "⚡"}
                  {loading ? "Setting up..." : "Start using KIRO →"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  );
}

// Hook: use this in the KIRO dashboard page to show onboarding once
export function useKIROOnboarding(storeId: string) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!storeId) return;
    const done = localStorage.getItem(`kiro-onboarded-${storeId}`);
    if (!done) setShow(true);
  }, [storeId]);
  return { show, complete: () => setShow(false) };
}
