"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, Check, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/auth.store";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA" };

const NICHES = [
  { id:"hair",       emoji:"💇", label:"Hair & Beauty"      },
  { id:"fashion",    emoji:"👗", label:"Fashion & Clothing"  },
  { id:"electronics",emoji:"📱", label:"Electronics & Gadgets"},
  { id:"food",       emoji:"🍔", label:"Food & Drinks"       },
  { id:"skincare",   emoji:"✨", label:"Skincare & Wellness" },
  { id:"home",       emoji:"🏠", label:"Home & Living"       },
  { id:"kids",       emoji:"🧸", label:"Kids & Baby"         },
  { id:"other",      emoji:"📦", label:"Something else"      },
];

const STAGES = [
  { id:"new",      label:"Starting from scratch",                  desc:"I have an idea but no products yet"          },
  { id:"products", label:"I have products, need a store",          desc:"I source my own or from suppliers"           },
  { id:"social",   label:"I sell on Instagram/WhatsApp",           desc:"I want a proper store to scale"              },
  { id:"existing", label:"I already have a store elsewhere",       desc:"Migrating from Shopify or another platform"  },
];

const GOALS = [
  { id:"first_sale",  emoji:"🎯", label:"Make my first sale"         },
  { id:"scale",       emoji:"📈", label:"Scale what I'm already doing"},
  { id:"automate",    emoji:"🤖", label:"Automate my fulfilment"      },
  { id:"content",     emoji:"📣", label:"Create better content"       },
];

interface Answers { niche: string; stage: string; goal: string; }

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore() as any;
  const [step,      setStep]      = useState(0);
  const [answers,   setAnswers]   = useState<Answers>({ niche:"", stage:"", goal:"" });
  const [loading,   setLoading]   = useState(false);
  const [kiroText,  setKiroText]  = useState("");
  const [showKiro,  setShowKiro]  = useState(false);

  // Redirect if not logged in
  useEffect(() => { if (!user) router.push("/auth/register"); }, [user]);

  // Skip if already onboarded
  useEffect(() => { if (user?.onboarded) router.push("/dashboard"); }, [user]);

  const progress = ((step) / 4) * 100;

  const choose = (key: keyof Answers, val: string) => {
    setAnswers(a => ({ ...a, [key]: val }));
    setTimeout(() => setStep(s => s + 1), 200);
  };

  const finish = async () => {
    setLoading(true);
    setStep(3); // KIRO building screen
    try {
      const res = await api.post("/onboarding/complete", answers);
      const kiroMessage = res.data.data?.kiroMessage ||
        `Perfect. I'm setting up your ${NICHES.find(n => n.id === answers.niche)?.label} store now. Give me 10 seconds.`;
      
      // Animate KIRO message word by word
      setShowKiro(true);
      const words = kiroMessage.split(" ");
      let displayed = "";
      for (let i = 0; i < words.length; i++) {
        await new Promise(r => setTimeout(r, 40));
        displayed += (i === 0 ? "" : " ") + words[i];
        setKiroText(displayed);
      }

      await new Promise(r => setTimeout(r, 1200));
      setStep(4); // Done
      await new Promise(r => setTimeout(r, 2000));
      router.push("/dashboard");
    } catch {
      // Fallback - go to dashboard anyway
      router.push("/dashboard");
    } finally { setLoading(false); }
  };

  const SCREENS = [
    // Screen 0 — Welcome
    <motion.div key="welcome" className="text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type:"spring", stiffness:200 }}
        className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8"
        style={{ background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", boxShadow:"0 16px 48px rgba(107,53,232,0.5)" }}>
        <Zap size={36} color="white" />
      </motion.div>
      <h1 className="text-3xl font-black mb-3" style={{ letterSpacing:"-1.5px" }}>
        Hey {user?.name?.split(" ")[0] || "there"} 👋
      </h1>
      <p className="text-base mb-3" style={{ color:"rgba(255,255,255,0.55)", maxWidth:320, margin:"0 auto 20px" }}>
        I'm KIRO — your AI business partner. I'm going to set up your store right now.
      </p>
      <p className="text-sm mb-8" style={{ color:"rgba(255,255,255,0.35)" }}>3 quick questions. Takes 30 seconds.</p>
      <button onClick={() => setStep(1)}
        className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base mx-auto"
        style={{ background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", boxShadow:"0 12px 40px rgba(107,53,232,0.45)", border:"none", cursor:"pointer", display:"flex" }}>
        Let's go <ArrowRight size={18} />
      </button>
    </motion.div>,

    // Screen 1 — Niche
    <motion.div key="niche">
      <p className="text-xs font-bold tracking-widest uppercase mb-2 text-center" style={{ color:V.v300 }}>Question 1 of 3</p>
      <h2 className="text-2xl font-black text-center mb-8" style={{ letterSpacing:"-1px" }}>What do you sell?</h2>
      <div className="grid grid-cols-2 gap-3">
        {NICHES.map(n => (
          <button key={n.id} onClick={() => choose("niche", n.id)}
            className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
            style={{ background:answers.niche===n.id?"rgba(107,53,232,0.18)":"rgba(255,255,255,0.04)", border:`1px solid ${answers.niche===n.id?"rgba(107,53,232,0.4)":"rgba(255,255,255,0.08)"}`, cursor:"pointer", color:"#fff" }}>
            <span className="text-2xl">{n.emoji}</span>
            <span className="text-sm font-semibold">{n.label}</span>
            {answers.niche===n.id && <Check size={14} style={{ color:V.v300, marginLeft:"auto", flexShrink:0 }} />}
          </button>
        ))}
      </div>
    </motion.div>,

    // Screen 2 — Stage
    <motion.div key="stage">
      <p className="text-xs font-bold tracking-widest uppercase mb-2 text-center" style={{ color:V.v300 }}>Question 2 of 3</p>
      <h2 className="text-2xl font-black text-center mb-8" style={{ letterSpacing:"-1px" }}>Where are you right now?</h2>
      <div className="space-y-3">
        {STAGES.map(s => (
          <button key={s.id} onClick={() => choose("stage", s.id)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
            style={{ background:answers.stage===s.id?"rgba(107,53,232,0.18)":"rgba(255,255,255,0.04)", border:`1px solid ${answers.stage===s.id?"rgba(107,53,232,0.4)":"rgba(255,255,255,0.08)"}`, cursor:"pointer" }}>
            <div style={{ flex:1 }}>
              <p className="text-sm font-bold" style={{ color:"#fff" }}>{s.label}</p>
              <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.4)" }}>{s.desc}</p>
            </div>
            {answers.stage===s.id && <Check size={14} style={{ color:V.v300, flexShrink:0 }} />}
          </button>
        ))}
      </div>
    </motion.div>,

    // Screen 3 — Goal + KIRO building
    step === 3 && showKiro ? (
      <motion.div key="kiro-building" className="text-center">
        <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background:"linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
          <Zap size={28} color="white" />
        </motion.div>
        <div className="rounded-2xl p-5 text-left mb-4" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-sm leading-relaxed" style={{ color:"rgba(255,255,255,0.85)" }}>
            {kiroText}
            <motion.span animate={{ opacity:[0,1] }} transition={{ duration:0.4, repeat:Infinity }} style={{ display:"inline-block", width:2, height:14, background:V.v400, marginLeft:2, verticalAlign:"middle" }} />
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Loader2 size={14} style={{ color:V.v400, animation:"spin 1s linear infinite" }} />
          <p className="text-xs" style={{ color:"rgba(255,255,255,0.4)" }}>Setting up your store...</p>
        </div>
      </motion.div>
    ) : step < 3 ? (
      <motion.div key="goal">
        <p className="text-xs font-bold tracking-widest uppercase mb-2 text-center" style={{ color:V.v300 }}>Question 3 of 3</p>
        <h2 className="text-2xl font-black text-center mb-8" style={{ letterSpacing:"-1px" }}>What matters most right now?</h2>
        <div className="grid grid-cols-2 gap-3">
          {GOALS.map(g => (
            <button key={g.id} onClick={() => { setAnswers(a => ({ ...a, goal:g.id })); finish(); }}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl text-center transition-all"
              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", cursor:"pointer" }}>
              <span className="text-3xl">{g.emoji}</span>
              <span className="text-sm font-semibold" style={{ color:"#fff" }}>{g.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    ) : null,

    // Screen 4 — Done
    <motion.div key="done" className="text-center">
      <motion.div initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ type:"spring", stiffness:200 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background:"linear-gradient(135deg,#10B981,#059669)", boxShadow:"0 16px 48px rgba(16,185,129,0.4)" }}>
        <Check size={36} color="white" strokeWidth={3} />
      </motion.div>
      <h2 className="text-3xl font-black mb-3" style={{ letterSpacing:"-1.5px" }}>Your store is ready 🎉</h2>
      <p className="text-base" style={{ color:"rgba(255,255,255,0.5)" }}>Opening your dashboard now...</p>
    </motion.div>,
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#07050F", color:"#fff", fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { to { transform:rotate(360deg) } }
        * { box-sizing:border-box; }
      `}</style>

      <div style={{ width:"100%", maxWidth:480 }}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background:"linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
            <Zap size={13} color="white"/>
          </div>
          <span className="font-black text-lg" style={{ color:"#fff" }}>Drop<span style={{ color:V.v400 }}>OS</span></span>
        </div>

        {/* Progress bar */}
        {step > 0 && step < 4 && (
          <div className="mb-8">
            <div className="h-1 rounded-full" style={{ background:"rgba(255,255,255,0.06)" }}>
              <motion.div className="h-full rounded-full" style={{ background:`linear-gradient(90deg,${V.v500},${V.v300})` }}
                animate={{ width:`${progress}%` }} transition={{ duration:0.4 }} />
            </div>
          </div>
        )}

        {/* Screen content */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.25 }}>
            {SCREENS[Math.min(step, SCREENS.length - 1)]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
