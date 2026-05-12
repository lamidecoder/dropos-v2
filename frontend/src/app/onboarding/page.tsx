"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/auth.store";

const V = { v500:"#6B35E8", v700:"#3D1C8A", v400:"#8B5CF6", v300:"#A78BFA" };

const NICHES = [
  { id:"hair",        emoji:"💇", label:"Hair & Beauty",       color:"#E91E8C" },
  { id:"fashion",     emoji:"👗", label:"Fashion & Clothing",  color:"#8B5CF6" },
  { id:"electronics", emoji:"📱", label:"Electronics & Tech",  color:"#06B6D4" },
  { id:"food",        emoji:"🍔", label:"Food & Drinks",       color:"#F59E0B" },
  { id:"skincare",    emoji:"✨", label:"Skincare & Wellness", color:"#10B981" },
  { id:"home",        emoji:"🏠", label:"Home & Living",       color:"#F97316" },
  { id:"kids",        emoji:"🧸", label:"Kids & Baby",         color:"#EC4899" },
  { id:"fitness",     emoji:"💪", label:"Fitness & Sports",    color:"#14B8A6" },
  { id:"jewelry",     emoji:"💎", label:"Jewellery",           color:"#EAB308" },
  { id:"other",       emoji:"📦", label:"Something Else",      color:"#6366F1" },
];

const STAGES = [
  { id:"new",      emoji:"🌱", label:"Starting from scratch",         desc:"I have an idea, no products yet"    },
  { id:"products", emoji:"📦", label:"I have products ready",         desc:"I source my own or from suppliers"  },
  { id:"social",   emoji:"📱", label:"Selling on Instagram/TikTok",   desc:"I want a proper store to scale"     },
  { id:"existing", emoji:"🔄", label:"Moving from another platform",  desc:"Migrating from Shopify/Woocommerce" },
];

const GOALS = [
  { id:"first_sale", emoji:"🎯", label:"Make my first sale",     color:"#8B5CF6" },
  { id:"scale",      emoji:"📈", label:"Scale my revenue",       color:"#06B6D4" },
  { id:"automate",   emoji:"🤖", label:"Automate fulfilment",    color:"#10B981" },
  { id:"content",    emoji:"📣", label:"Create better content",  color:"#F59E0B" },
];

type Step = "niche"|"stage"|"goal"|"done";

const TEMPLATE_MAP: Record<string,string> = {
  hair:"boutique", fashion:"boutique", electronics:"classic", food:"bold",
  skincare:"minimal", home:"classic", kids:"bold", fitness:"dark-luxe",
  jewelry:"dark-luxe", other:"classic",
};

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);
  const [step, setStep]     = useState<Step>("niche");
  const [niche, setNiche]   = useState("");
  const [stage, setStage]   = useState("");
  const [goal, setGoal]     = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [built, setBuilt]   = useState(0);
  const hasSaved = useRef(false);

  useEffect(() => { if (user?.onboarded) router.replace("/dashboard"); }, [user]);

  const canNext = step==="niche"?!!niche : step==="stage"?!!stage : step==="goal"?!!goal : false;

  const handleNext = async () => {
    if (step==="niche") { setStep("stage"); return; }
    if (step==="stage") { setStep("goal");  return; }
    if (step==="goal") {
      if (hasSaved.current) { setStep("done"); startBuild(); return; }
      setSaving(true); setError("");
      try {
        await api.post("/onboarding/complete", { niche, stage, goal, template: TEMPLATE_MAP[niche]||"classic" });
        hasSaved.current = true;
        updateUser({ onboarded: true } as any);
        setStep("done");
        startBuild();
      } catch(e: any) {
        setError(e.response?.data?.message || "Save failed. Check connection.");
      } finally { setSaving(false); }
    }
  };

  const startBuild = () => {
    [700,1400,2100,2800,3600].forEach((t,i) => setTimeout(()=>setBuilt(i+1), t));
    setTimeout(() => router.replace("/dashboard"), 4500);
  };

  const inp = { padding:"13px 16px", borderRadius:12, border:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.04)", color:"#fff", fontSize:14, outline:"none", fontFamily:"inherit", width:"100%", boxSizing:"border-box" as const };

  return (
    <div style={{ minHeight:"100vh", background:"#080612", display:"flex", flexDirection:"column", fontFamily:"system-ui,sans-serif" }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none" }}>
        <div style={{ position:"absolute", top:"5%", left:"50%", transform:"translateX(-50%)", width:"min(600px,100vw)", height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(107,53,232,0.15),transparent 70%)", filter:"blur(60px)" }}/>
      </div>

      {/* Header */}
      <div style={{ position:"relative", zIndex:1, padding:"20px clamp(16px,5vw,40px)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg,${V.v500},${V.v700})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Zap size={15} color="#fff" fill="#fff"/>
          </div>
          <span style={{ fontSize:17, fontWeight:900, color:"#fff", letterSpacing:"-0.03em" }}>DropOS</span>
        </div>
        {/* Step dots */}
        {step !== "done" && (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {(["niche","stage","goal"] as const).map((s,i) => {
              const done = ["niche","stage","goal"].indexOf(step) > i;
              const active = step === s;
              return (
                <div key={s} style={{ width: active?24:8, height:8, borderRadius:99, background: done?V.v300 : active?V.v500:"rgba(255,255,255,0.12)", transition:"all 0.3s" }}/>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"clamp(16px,4vw,40px) clamp(16px,5vw,40px)", position:"relative", zIndex:1 }}>
        <div style={{ width:"100%", maxWidth:600 }}>
          <AnimatePresence mode="wait">

            {step === "done" && (
              <motion.div key="done" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
                <div style={{ textAlign:"center", marginBottom:36 }}>
                  <motion.div animate={{rotate:360}} transition={{duration:2,repeat:Infinity,ease:"linear"}}
                    style={{ width:56, height:56, borderRadius:16, background:`linear-gradient(135deg,${V.v500},${V.v700})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                    <Zap size={24} color="#fff" fill="#fff"/>
                  </motion.div>
                  <h2 style={{ fontSize:"clamp(22px,5vw,34px)", fontWeight:900, color:"#fff", letterSpacing:"-0.03em", margin:"0 0 8px" }}>KIRO is building your store</h2>
                  <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", margin:0 }}>Takes about 5 seconds</p>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[
                    `Creating your ${NICHES.find(n=>n.id===niche)?.label||"store"}`,
                    "Applying your brand colour and template",
                    "Configuring Paystack payments",
                    "Setting up KIRO AI assistant",
                    "Your store is live 🎉"
                  ].map((txt,i) => (
                    <motion.div key={i} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:i*0.12}}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:14, background:"rgba(255,255,255,0.03)", border:`1px solid ${built>i?"rgba(107,53,232,0.3)":"rgba(255,255,255,0.06)"}`, transition:"border-color 0.4s" }}>
                      <div style={{ width:24, height:24, borderRadius:"50%", background:built>i?`linear-gradient(135deg,${V.v500},${V.v700})`:"rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.4s" }}>
                        {built>i?<Check size={12} color="#fff" strokeWidth={3}/>:i===built?<Loader2 size={12} color={V.v400} style={{animation:"spin 0.8s linear infinite"}}/>:null}
                      </div>
                      <p style={{ fontSize:13, fontWeight:600, color:built>i?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.3)", margin:0, transition:"color 0.4s" }}>{txt}</p>
                    </motion.div>
                  ))}
                </div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </motion.div>
            )}

            {step === "niche" && (
              <motion.div key="niche" initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-24}}>
                <h1 style={{ fontSize:"clamp(24px,5vw,40px)", fontWeight:900, color:"#fff", letterSpacing:"-0.04em", margin:"0 0 6px" }}>What are you selling?</h1>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", margin:"0 0 28px" }}>KIRO will tailor your store to your niche</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:10 }}>
                  {NICHES.map(n => (
                    <motion.button key={n.id} whileHover={{scale:1.03}} whileTap={{scale:0.95}} onClick={()=>setNiche(n.id)}
                      style={{ padding:"18px 12px", borderRadius:16, cursor:"pointer", textAlign:"center", border:`1.5px solid ${niche===n.id?n.color+"60":"rgba(255,255,255,0.07)"}`, background:niche===n.id?`${n.color}15`:"rgba(255,255,255,0.03)", transition:"all 0.15s" }}>
                      <div style={{ fontSize:30, marginBottom:8, lineHeight:1 }}>{n.emoji}</div>
                      <p style={{ fontSize:12, fontWeight:700, color:niche===n.id?"#fff":"rgba(255,255,255,0.6)", margin:0, lineHeight:1.3 }}>{n.label}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "stage" && (
              <motion.div key="stage" initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-24}}>
                <h1 style={{ fontSize:"clamp(24px,5vw,40px)", fontWeight:900, color:"#fff", letterSpacing:"-0.04em", margin:"0 0 6px" }}>Where are you right now?</h1>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", margin:"0 0 28px" }}>So KIRO knows exactly how to help</p>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {STAGES.map(s => (
                    <motion.button key={s.id} whileHover={{scale:1.01}} whileTap={{scale:0.98}} onClick={()=>setStage(s.id)}
                      style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", borderRadius:16, cursor:"pointer", textAlign:"left", border:`1.5px solid ${stage===s.id?"rgba(107,53,232,0.5)":"rgba(255,255,255,0.07)"}`, background:stage===s.id?"rgba(107,53,232,0.1)":"rgba(255,255,255,0.03)", transition:"all 0.15s" }}>
                      <span style={{ fontSize:26, flexShrink:0 }}>{s.emoji}</span>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:14, fontWeight:700, color:stage===s.id?"#fff":"rgba(255,255,255,0.75)", margin:"0 0 2px" }}>{s.label}</p>
                        <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", margin:0 }}>{s.desc}</p>
                      </div>
                      {stage===s.id && <div style={{ width:22, height:22, borderRadius:"50%", background:V.v500, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Check size={12} color="#fff" strokeWidth={3}/></div>}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "goal" && (
              <motion.div key="goal" initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-24}}>
                <h1 style={{ fontSize:"clamp(24px,5vw,40px)", fontWeight:900, color:"#fff", letterSpacing:"-0.04em", margin:"0 0 6px" }}>What's your main goal?</h1>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", margin:"0 0 28px" }}>KIRO will focus on what matters most to you</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))", gap:10, marginBottom:16 }}>
                  {GOALS.map(g => (
                    <motion.button key={g.id} whileHover={{scale:1.02}} whileTap={{scale:0.97}} onClick={()=>setGoal(g.id)}
                      style={{ padding:"22px 18px", borderRadius:16, cursor:"pointer", textAlign:"left", border:`1.5px solid ${goal===g.id?g.color+"60":"rgba(255,255,255,0.07)"}`, background:goal===g.id?`${g.color}12`:"rgba(255,255,255,0.03)", transition:"all 0.15s" }}>
                      <div style={{ fontSize:28, marginBottom:10, lineHeight:1 }}>{g.emoji}</div>
                      <p style={{ fontSize:14, fontWeight:700, color:goal===g.id?"#fff":"rgba(255,255,255,0.7)", margin:0 }}>{g.label}</p>
                      {goal===g.id && <div style={{ width:6, height:6, borderRadius:"50%", background:g.color, marginTop:10 }}/>}
                    </motion.button>
                  ))}
                </div>
                {error && <p style={{ fontSize:13, color:"#f87171", padding:"10px 14px", borderRadius:10, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", margin:"0 0 16px" }}>{error}</p>}
              </motion.div>
            )}

          </AnimatePresence>

          {/* Nav buttons */}
          {step !== "done" && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:28, gap:12 }}>
              {step !== "niche" ? (
                <button onClick={()=>step==="stage"?setStep("niche"):setStep("stage")}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"11px 18px", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", cursor:"pointer", color:"rgba(255,255,255,0.5)", fontSize:14, fontWeight:600, fontFamily:"inherit" }}>
                  <ArrowLeft size={14}/> Back
                </button>
              ) : <div/>}
              <motion.button whileHover={canNext?{scale:1.02}:{}} whileTap={canNext?{scale:0.97}:{}}
                onClick={canNext&&!saving?handleNext:undefined} disabled={!canNext||saving}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 28px", borderRadius:12, border:"none", cursor:canNext&&!saving?"pointer":"not-allowed", color:"#fff", fontSize:14, fontWeight:700, fontFamily:"inherit", background:canNext?`linear-gradient(135deg,${V.v500},${V.v700})`:"rgba(255,255,255,0.06)", opacity:canNext?1:0.4, transition:"all 0.2s", boxShadow:canNext?"0 8px 24px rgba(107,53,232,0.35)":"none" }}>
                {saving?<><Loader2 size={14} style={{animation:"spin 0.8s linear infinite"}}/> Saving...</>:<>{step==="goal"?"Launch my store →":"Continue"} {step!=="goal"&&<ArrowRight size={14}/>}</>}
              </motion.button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
