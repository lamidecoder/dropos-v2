"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, Check, Loader2, ArrowLeft } from "lucide-react";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/auth.store";

const V = { v500:"#6B35E8", v700:"#3D1C8A", v400:"#8B5CF6", v300:"#A78BFA" };

const NICHES = [
  { id:"hair",        emoji:"💇", label:"Hair and Beauty",       template:"beauty"     },
  { id:"fashion",     emoji:"👗", label:"Fashion and Clothing",   template:"fashion"    },
  { id:"electronics", emoji:"📱", label:"Electronics",            template:"tech"       },
  { id:"food",        emoji:"🍔", label:"Food and Drinks",        template:"food"       },
  { id:"skincare",    emoji:"✨", label:"Skincare and Wellness",  template:"skincare"   },
  { id:"home",        emoji:"🏠", label:"Home and Living",        template:"home"       },
  { id:"kids",        emoji:"🧸", label:"Kids and Baby",          template:"kids"       },
  { id:"other",       emoji:"📦", label:"Something else",         template:"minimal"    },
];

const STAGES = [
  { id:"new",      emoji:"🌱", label:"Starting from scratch",              desc:"I have an idea but no products yet"       },
  { id:"products", emoji:"📦", label:"I have products ready",              desc:"I source my own or from suppliers"        },
  { id:"social",   emoji:"📱", label:"I already sell on Instagram",        desc:"I want a proper store to scale"           },
  { id:"existing", emoji:"🔄", label:"Moving from another platform",       desc:"Migrating from Shopify or Woocommerce"    },
];

const GOALS = [
  { id:"first_sale",  emoji:"🎯", label:"Make my first sale",         color:"#8B5CF6" },
  { id:"scale",       emoji:"📈", label:"Scale what I am doing",      color:"#06B6D4" },
  { id:"automate",    emoji:"🤖", label:"Automate my fulfilment",     color:"#10B981" },
  { id:"content",     emoji:"📣", label:"Create better content",      color:"#F59E0B" },
];

const TEMPLATES = [
  { id:"beauty",   label:"Beauty Store",   emoji:"💄", bg:"#FF6B9D", products:["Lipstick Set","Skincare Bundle","Perfume Collection"] },
  { id:"fashion",  label:"Fashion Store",  emoji:"👗", bg:"#8B5CF6", products:["Summer Dress","Sneaker Collection","Handbag Set"]     },
  { id:"tech",     label:"Tech Store",     emoji:"📱", bg:"#06B6D4", products:["Wireless Earbuds","Smart Watch","Phone Case"]         },
  { id:"food",     label:"Food Store",     emoji:"🍔", bg:"#F59E0B", products:["Snack Bundle","Health Drinks","Protein Pack"]          },
  { id:"skincare", label:"Skincare Store", emoji:"✨", bg:"#10B981", products:["Vitamin C Serum","Face Mask Kit","Eye Cream"]          },
  { id:"home",     label:"Home Store",     emoji:"🏠", bg:"#F97316", products:["LED Strip Lights","Smart Plug","Throw Pillow Set"]     },
  { id:"kids",     label:"Kids Store",     emoji:"🧸", bg:"#EC4899", products:["Building Blocks","Baby Monitor","Kids Backpack"]       },
  { id:"minimal",  label:"Clean Store",    emoji:"📦", bg:"#6366F1", products:["Your Products","Any Niche","Custom Brand"]             },
];

type Step = "welcome" | "niche" | "stage" | "goal" | "template" | "building" | "done";

export default function OnboardingPage() {
  const router  = useRouter();
  const user    = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);

  const [step,      setStep]      = useState<Step>("welcome");
  const [niche,     setNiche]     = useState("");
  const [stage,     setStage]     = useState("");
  const [goal,      setGoal]      = useState("");
  const [template,  setTemplate]  = useState("");
  const [kiroText,  setKiroText]  = useState("");
  const [progress,  setProgress]  = useState(0);

  useEffect(() => {
    if (user?.onboarded) router.push("/dashboard");
  }, [user, router]);

  const selectedNiche    = NICHES.find(n => n.id === niche);
  const suggestedTemplate = TEMPLATES.find(t => t.id === selectedNiche?.template) || TEMPLATES[7];

  const startBuilding = async (chosenTemplate: string) => {
    setTemplate(chosenTemplate);
    setStep("building");

    const kiroMessage = `Perfect. I am setting up your ${selectedNiche?.label || "store"} right now. Importing trending products, applying your template, and configuring Paystack for you.`;

    // Animate KIRO message
    const words = kiroMessage.split(" ");
    let displayed = "";
    for (let i = 0; i < words.length; i++) {
      await new Promise(r => setTimeout(r, 50));
      displayed += (i === 0 ? "" : " ") + words[i];
      setKiroText(displayed);
    }

    // Animate progress bar
    for (let p = 0; p <= 100; p += 2) {
      await new Promise(r => setTimeout(r, 40));
      setProgress(p);
    }

    // Save to backend
    try {
      await api.post("/onboarding/complete", { niche, stage, goal, template: chosenTemplate });
      updateUser({ onboarded: true, niche, stage, goal } as any);
    } catch {
      // Still proceed to dashboard
    }

    setStep("done");
    await new Promise(r => setTimeout(r, 1800));
    router.push("/dashboard");
  };

  const stepIndex: Record<Step, number> = {
    welcome: 0, niche: 1, stage: 2, goal: 3, template: 4, building: 5, done: 6,
  };

  const totalSteps = 4;
  const currentStep = Math.max(0, Math.min(stepIndex[step] - 1, totalSteps));
  const pct = (currentStep / totalSteps) * 100;

  const btn = {
    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
    padding:"14px 28px", borderRadius:16, border:"none", cursor:"pointer",
    background:`linear-gradient(135deg,${V.v500},${V.v700})`,
    color:"#fff", fontSize:15, fontWeight:800,
    boxShadow:`0 8px 28px rgba(107,53,232,0.4)`,
  } as const;

  return (
    <div style={{ minHeight:"100vh", background:"#07050F", color:"#fff", fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"16px 16px 40px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes glow  { 0%,100%{box-shadow:0 8px 32px rgba(107,53,232,0.4)} 50%{box-shadow:0 8px 48px rgba(107,53,232,0.7)} }
        * { box-sizing:border-box; }
        .choice-btn:hover { border-color:rgba(107,53,232,0.4)!important; background:rgba(107,53,232,0.08)!important; }
      `}</style>

      {/* Logo */}
      <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
        style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32 }}>
        <div style={{ width:36, height:36, borderRadius:12, background:`linear-gradient(135deg,${V.v500},${V.v700})`, display:"flex", alignItems:"center", justifyContent:"center", animation:"glow 2.5s ease-in-out infinite" }}>
          <Zap size={17} color="white"/>
        </div>
        <span style={{ fontWeight:900, fontSize:18, color:"#fff" }}>Drop<span style={{ color:V.v400 }}>OS</span></span>
      </motion.div>

      {/* Progress bar */}
      {step !== "welcome" && step !== "building" && step !== "done" && (
        <div style={{ width:"100%", maxWidth:480, marginBottom:28, height:3, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
          <motion.div animate={{ width:`${pct}%` }} transition={{ duration:0.4 }} style={{ height:"100%", background:`linear-gradient(90deg,${V.v500},${V.v300})`, borderRadius:99 }}/>
        </div>
      )}

      {/* Step content */}
      <div style={{ width:"100%", maxWidth:step === "template" ? 600 : 480 }}>
        <AnimatePresence mode="wait">

          {/* WELCOME */}
          {step === "welcome" && (
            <motion.div key="welcome" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} style={{ textAlign:"center" }}>
              <motion.div initial={{ scale:0.7, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ type:"spring", stiffness:220, delay:0.1 }}
                style={{ width:80, height:80, borderRadius:24, background:`linear-gradient(135deg,${V.v500},${V.v700})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 28px", animation:"float 5s ease-in-out infinite", boxShadow:`0 16px 48px rgba(107,53,232,0.5)` }}>
                <Zap size={38} color="white"/>
              </motion.div>
              <h1 style={{ fontSize:"clamp(26px,7vw,36px)", fontWeight:900, letterSpacing:"-1.5px", marginBottom:12 }}>
                Hey {user?.name?.split(" ")[0] || "there"} 👋
              </h1>
              <p style={{ fontSize:16, color:"rgba(255,255,255,0.5)", lineHeight:1.65, marginBottom:8, maxWidth:340, margin:"0 auto 8px" }}>
                I am KIRO, your AI business partner.
              </p>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.35)", marginBottom:36 }}>
                3 quick questions and your store is live. Takes under a minute.
              </p>
              <button onClick={() => setStep("niche")} style={btn}>
                Get started <ArrowRight size={17}/>
              </button>
            </motion.div>
          )}

          {/* NICHE */}
          {step === "niche" && (
            <motion.div key="niche" initial={{ opacity:0, x:32 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-32 }}>
              <p style={{ textAlign:"center", fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:V.v300, marginBottom:10 }}>Question 1 of 3</p>
              <h2 style={{ fontSize:"clamp(22px,5vw,30px)", fontWeight:900, letterSpacing:"-1.5px", textAlign:"center", marginBottom:28 }}>
                What do you sell?
              </h2>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {NICHES.map(n => (
                  <button key={n.id} className="choice-btn" onClick={() => { setNiche(n.id); setTimeout(() => setStep("stage"), 160); }}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderRadius:14, border:`1px solid ${niche===n.id?"rgba(107,53,232,0.5)":"rgba(255,255,255,0.08)"}`, background:niche===n.id?"rgba(107,53,232,0.15)":"rgba(255,255,255,0.03)", cursor:"pointer", color:"#fff", transition:"all 0.15s", textAlign:"left" }}>
                    <span style={{ fontSize:24, lineHeight:1 }}>{n.emoji}</span>
                    <span style={{ fontSize:13, fontWeight:600 }}>{n.label}</span>
                    {niche===n.id && <Check size={14} style={{ color:V.v300, marginLeft:"auto", flexShrink:0 }} strokeWidth={3}/>}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STAGE */}
          {step === "stage" && (
            <motion.div key="stage" initial={{ opacity:0, x:32 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-32 }}>
              <p style={{ textAlign:"center", fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:V.v300, marginBottom:10 }}>Question 2 of 3</p>
              <h2 style={{ fontSize:"clamp(22px,5vw,30px)", fontWeight:900, letterSpacing:"-1.5px", textAlign:"center", marginBottom:28 }}>
                Where are you right now?
              </h2>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {STAGES.map(s => (
                  <button key={s.id} className="choice-btn" onClick={() => { setStage(s.id); setTimeout(() => setStep("goal"), 160); }}
                    style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", borderRadius:14, border:`1px solid ${stage===s.id?"rgba(107,53,232,0.5)":"rgba(255,255,255,0.08)"}`, background:stage===s.id?"rgba(107,53,232,0.15)":"rgba(255,255,255,0.03)", cursor:"pointer", transition:"all 0.15s", textAlign:"left" }}>
                    <span style={{ fontSize:22, flexShrink:0 }}>{s.emoji}</span>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:"#fff", marginBottom:3 }}>{s.label}</p>
                      <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{s.desc}</p>
                    </div>
                    {stage===s.id && <Check size={14} style={{ color:V.v300, flexShrink:0 }} strokeWidth={3}/>}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* GOAL */}
          {step === "goal" && (
            <motion.div key="goal" initial={{ opacity:0, x:32 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-32 }}>
              <p style={{ textAlign:"center", fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:V.v300, marginBottom:10 }}>Question 3 of 3</p>
              <h2 style={{ fontSize:"clamp(22px,5vw,30px)", fontWeight:900, letterSpacing:"-1.5px", textAlign:"center", marginBottom:28 }}>
                What matters most right now?
              </h2>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {GOALS.map(g => (
                  <button key={g.id} className="choice-btn" onClick={() => { setGoal(g.id); setTimeout(() => setStep("template"), 160); }}
                    style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, padding:"22px 16px", borderRadius:14, border:`1px solid ${goal===g.id?`${g.color}60`:"rgba(255,255,255,0.08)"}`, background:goal===g.id?`${g.color}12`:"rgba(255,255,255,0.03)", cursor:"pointer", color:"#fff", transition:"all 0.15s" }}>
                    <span style={{ fontSize:32 }}>{g.emoji}</span>
                    <span style={{ fontSize:13, fontWeight:700, textAlign:"center" }}>{g.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* TEMPLATE PICKER */}
          {step === "template" && (
            <motion.div key="template" initial={{ opacity:0, x:32 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-32 }}>
              <div style={{ textAlign:"center", marginBottom:28 }}>
                <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:V.v300, marginBottom:10 }}>Almost there</p>
                <h2 style={{ fontSize:"clamp(22px,5vw,30px)", fontWeight:900, letterSpacing:"-1.5px", marginBottom:8 }}>
                  Pick your store template
                </h2>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)" }}>You can change this any time. KIRO will add your products automatically.</p>
              </div>

              {/* Suggested */}
              <div style={{ marginBottom:16 }}>
                <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:V.v300, marginBottom:10 }}>Recommended for you</p>
                <button onClick={() => startBuilding(suggestedTemplate.id)}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:16, padding:"18px 20px", borderRadius:16, border:"2px solid rgba(107,53,232,0.5)", background:"rgba(107,53,232,0.12)", cursor:"pointer", color:"#fff", transition:"all 0.15s" }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:`linear-gradient(135deg,${suggestedTemplate.bg},${suggestedTemplate.bg}88)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>
                    {suggestedTemplate.emoji}
                  </div>
                  <div style={{ flex:1, textAlign:"left" }}>
                    <p style={{ fontSize:15, fontWeight:800, marginBottom:4 }}>{suggestedTemplate.label}</p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)" }}>
                      {suggestedTemplate.products.join(" · ")}
                    </p>
                  </div>
                  <div style={{ padding:"6px 14px", borderRadius:99, background:"rgba(107,53,232,0.3)", fontSize:11, fontWeight:700, color:V.v200, flexShrink:0 }}>
                    Use this
                  </div>
                </button>
              </div>

              {/* Other templates */}
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", marginBottom:10 }}>Or choose another</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                {TEMPLATES.filter(t => t.id !== suggestedTemplate.id).map(tpl => (
                  <button key={tpl.id} className="choice-btn" onClick={() => startBuilding(tpl.id)}
                    style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, padding:"14px 10px", borderRadius:14, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.03)", cursor:"pointer", color:"#fff", transition:"all 0.15s" }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:`linear-gradient(135deg,${tpl.bg},${tpl.bg}88)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                      {tpl.emoji}
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, textAlign:"center" }}>{tpl.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* BUILDING */}
          {step === "building" && (
            <motion.div key="building" initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} style={{ textAlign:"center" }}>
              <motion.div animate={{ rotate:360 }} transition={{ duration:2.5, repeat:Infinity, ease:"linear" }}
                style={{ width:72, height:72, borderRadius:22, background:`linear-gradient(135deg,${V.v500},${V.v700})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 28px", boxShadow:`0 16px 48px rgba(107,53,232,0.5)` }}>
                <Zap size={32} color="white"/>
              </motion.div>

              {/* KIRO speech bubble */}
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(107,53,232,0.2)", borderRadius:20, padding:"16px 20px", marginBottom:28, textAlign:"left", maxWidth:420, margin:"0 auto 28px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <div style={{ width:24, height:24, borderRadius:8, background:`linear-gradient(135deg,${V.v500},${V.v700})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Zap size={11} color="white"/>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:V.v300 }}>KIRO</span>
                </div>
                <p style={{ fontSize:14, lineHeight:1.6, color:"rgba(255,255,255,0.8)" }}>
                  {kiroText}
                  <motion.span animate={{ opacity:[0,1] }} transition={{ duration:0.4, repeat:Infinity }}
                    style={{ display:"inline-block", width:2, height:14, background:V.v400, marginLeft:2, verticalAlign:"middle" }}/>
                </p>
              </div>

              {/* Progress bar */}
              <div style={{ width:"100%", maxWidth:380, margin:"0 auto", height:4, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
                <motion.div animate={{ width:`${progress}%` }} transition={{ ease:"linear" }}
                  style={{ height:"100%", background:`linear-gradient(90deg,${V.v500},${V.v300})`, borderRadius:99 }}/>
              </div>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.3)", marginTop:10 }}>
                {progress < 30 ? "Picking your template..." : progress < 60 ? "Importing trending products..." : progress < 90 ? "Writing product descriptions..." : "Almost ready..."}
              </p>
            </motion.div>
          )}

          {/* DONE */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} style={{ textAlign:"center" }}>
              <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:200, delay:0.1 }}
                style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#10B981,#059669)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", boxShadow:"0 16px 48px rgba(16,185,129,0.5)" }}>
                <Check size={38} color="white" strokeWidth={3}/>
              </motion.div>
              <h2 style={{ fontSize:"clamp(24px,6vw,34px)", fontWeight:900, letterSpacing:"-1.5px", marginBottom:10 }}>
                Your store is live
              </h2>
              <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", marginBottom:6 }}>
                KIRO has set everything up for you.
              </p>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.25)" }}>
                Opening your dashboard...
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Back button */}
      {(step === "stage" || step === "goal") && (
        <button onClick={() => setStep(step === "stage" ? "niche" : "stage")}
          style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:99, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.4)", fontSize:12, cursor:"pointer" }}>
          <ArrowLeft size={12}/> Back
        </button>
      )}
    </div>
  );
}
