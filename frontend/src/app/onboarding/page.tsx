"use client";
// Path: frontend/src/app/onboarding/page.tsx
// Redesigned: clean, professional, image-driven, multi-industry, global

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check, Loader2, Zap } from "lucide-react";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/auth.store";

const V = { v500:"#6B35E8", v700:"#3D1C8A", v400:"#8B5CF6", v300:"#A78BFA" };

// Industries — real photography, no emojis on cards
const INDUSTRIES = [
  {
    id: "fashion",
    label: "Fashion & Apparel",
    desc: "Clothing, shoes, accessories",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=240&fit=crop&auto=format",
    template: "aurora",
    color: "#8B5CF6",
  },
  {
    id: "beauty",
    label: "Beauty & Skincare",
    desc: "Cosmetics, skincare, wellness",
    img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=240&fit=crop&auto=format",
    template: "glow",
    color: "#E8547A",
  },
  {
    id: "food",
    label: "Food & Beverage",
    desc: "Restaurant, café, bakery, delivery",
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=240&fit=crop&auto=format",
    template: "artisan",
    color: "#F59E0B",
  },
  {
    id: "tech",
    label: "Electronics & Tech",
    desc: "Gadgets, phones, accessories",
    img: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&h=240&fit=crop&auto=format",
    template: "ionic",
    color: "#00D4FF",
  },
  {
    id: "home",
    label: "Home & Living",
    desc: "Furniture, decor, plants",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=240&fit=crop&auto=format",
    template: "sage",
    color: "#5B7B5C",
  },
  {
    id: "fitness",
    label: "Fitness & Sports",
    desc: "Supplements, gear, activewear",
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=240&fit=crop&auto=format",
    template: "apex",
    color: "#39FF14",
  },
  {
    id: "jewelry",
    label: "Jewelry & Watches",
    desc: "Fine jewelry, accessories",
    img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=240&fit=crop&auto=format",
    template: "diamond",
    color: "#D4AF37",
  },
  {
    id: "art",
    label: "Art & Creative",
    desc: "Digital products, prints, music",
    img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=240&fit=crop&auto=format",
    template: "muse",
    color: "#FF6B2B",
  },
  {
    id: "kids",
    label: "Kids & Family",
    desc: "Toys, clothing, baby products",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=240&fit=crop&auto=format",
    template: "kids",
    color: "#FF6B9D",
  },
  {
    id: "travel",
    label: "Travel & Hospitality",
    desc: "Hotels, tours, experiences",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=240&fit=crop&auto=format",
    template: "dusk",
    color: "#9B7B4E",
  },
  {
    id: "books",
    label: "Books & Education",
    desc: "Books, courses, digital learning",
    img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=240&fit=crop&auto=format",
    template: "bound",
    color: "#8B3A3A",
  },
  {
    id: "other",
    label: "Something Else",
    desc: "I'll customize it myself",
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=240&fit=crop&auto=format",
    template: "aurora",
    color: "#6B35E8",
  },
];

const STAGES = [
  { id:"new",      label:"Starting fresh",              desc:"I have an idea and want to launch a store",      img:"https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=80&h=80&fit=crop&auto=format" },
  { id:"products", label:"I have products ready",       desc:"I already source products or make my own",       img:"https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=80&h=80&fit=crop&auto=format" },
  { id:"social",   label:"Selling on social media",     desc:"I want to move beyond Instagram or TikTok",      img:"https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=80&h=80&fit=crop&auto=format" },
  { id:"existing", label:"Moving from another platform",desc:"Migrating from Shopify, WooCommerce, or similar",img:"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=80&h=80&fit=crop&auto=format" },
];

const GOALS = [
  { id:"first_sale", label:"Make my first sale",       desc:"Get products live and start generating revenue" },
  { id:"scale",      label:"Scale my revenue",         desc:"I'm selling but want to grow faster" },
  { id:"automate",   label:"Automate my operations",   desc:"Reduce manual work on orders and fulfilment" },
  { id:"brand",      label:"Build a serious brand",    desc:"Professional store that reflects my identity" },
];

const BUILD_STEPS = [
  "Creating your store",
  "Applying your template",
  "Configuring payments",
  "Setting up your AI assistant",
  "Your store is live",
];

type Step = "industry" | "stage" | "goal" | "done";

export default function OnboardingPage() {
  const router    = useRouter();
  const user      = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);

  const [step,       setStep]       = useState<Step>("industry");
  const [industries, setIndustries] = useState<string[]>([]);  // multi-select
  const [stage,      setStage]      = useState("");
  const [goal,       setGoal]       = useState("");
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [built,      setBuilt]      = useState(0);
  const hasSaved = useRef(false);

  useEffect(() => { if (user?.onboarded) router.replace("/dashboard"); }, [user]);

  const canNext =
    step === "industry" ? industries.length > 0 :
    step === "stage"    ? !!stage :
    step === "goal"     ? !!goal  : false;

  // Pick the best matching template from selected industries
  const primaryIndustry = INDUSTRIES.find(i => i.id === industries[0]);
  const template = primaryIndustry?.template || "aurora";

  const toggleIndustry = (id: string) => {
    setIndustries(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const handleNext = async () => {
    if (step === "industry") { setStep("stage"); return; }
    if (step === "stage")    { setStep("goal");  return; }
    if (step === "goal") {
      if (hasSaved.current) { setStep("done"); startBuild(); return; }
      setSaving(true); setError("");
      try {
        await api.post("/onboarding/complete", {
          niche:    industries[0] || "other",
          industries,
          stage, goal,
          template,
        });
        hasSaved.current = true;
        updateUser({ onboarded: true } as any);
        setStep("done");
        startBuild();
      } catch (e: any) {
        setError(e.response?.data?.message || "Something went wrong. Please try again.");
      } finally { setSaving(false); }
    }
  };

  const startBuild = () => {
    BUILD_STEPS.forEach((_, i) => setTimeout(() => setBuilt(i + 1), 700 + i * 800));
    setTimeout(() => router.replace("/dashboard"), 700 + BUILD_STEPS.length * 800 + 400);
  };

  const progress = step === "industry" ? 1 : step === "stage" ? 2 : step === "goal" ? 3 : 4;

  return (
    <div style={{ minHeight: "100vh", background: "#05030F", fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        * { box-sizing: border-box; }
      `}</style>

      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: 700, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(107,53,232,0.12) 0%, transparent 70%)", filter: "blur(40px)" }}/>
        <div style={{ position: "absolute", bottom: "-5%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", filter: "blur(60px)" }}/>
      </div>

      {/* Nav */}
      <div style={{ position: "relative", zIndex: 10, padding: "20px clamp(20px,5vw,48px)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${V.v500},${V.v700})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${V.v500}40` }}>
            <Zap size={16} color="#fff" fill="#fff"/>
          </div>
          <span style={{ fontSize: 17, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>DropOS</span>
        </div>

        {/* Progress bar */}
        {step !== "done" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 120, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(progress/3)*100}%`, background: `linear-gradient(to right, ${V.v500}, ${V.v300})`, borderRadius: 99, transition: "width 0.4s ease" }}/>
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>{progress}/3</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(20px,4vw,48px) clamp(20px,5vw,48px)", position: "relative", zIndex: 1 }}>
        <div style={{ width: "100%", maxWidth: step === "industry" ? 900 : 600 }}>
          <AnimatePresence mode="wait">

            {/* STEP 1 — Industry (multi-select with images) */}
            {step === "industry" && (
              <motion.div key="industry" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                <div style={{ marginBottom: 32 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: V.v300, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px" }}>Step 1 of 3</p>
                  <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", margin: "0 0 8px", lineHeight: 1.1 }}>
                    What kind of business is this?
                  </h1>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: 0, fontWeight: 400 }}>
                    Select all that apply. We'll tailor your store and suggest the right template.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
                  {INDUSTRIES.map(ind => {
                    const selected = industries.includes(ind.id);
                    return (
                      <motion.button
                        key={ind.id}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleIndustry(ind.id)}
                        style={{
                          position: "relative", padding: 0, borderRadius: 14, cursor: "pointer",
                          border: `2px solid ${selected ? ind.color : "rgba(255,255,255,0.07)"}`,
                          background: selected ? `${ind.color}12` : "rgba(255,255,255,0.02)",
                          overflow: "hidden", textAlign: "left",
                          boxShadow: selected ? `0 0 0 4px ${ind.color}20` : "none",
                          transition: "all 0.2s",
                        }}>
                        {/* Image */}
                        <div style={{ position: "relative", aspectRatio: "5/3", overflow: "hidden" }}>
                          <img src={ind.img} alt={ind.label}
                            style={{ width: "100%", height: "100%", objectFit: "cover", filter: selected ? "brightness(0.9)" : "brightness(0.6)", transition: "filter 0.3s", display: "block" }}/>
                          {/* Gradient overlay */}
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,3,15,0.9) 0%, transparent 60%)" }}/>
                          {/* Check badge */}
                          {selected && (
                            <div style={{ position: "absolute", top: 10, right: 10, width: 24, height: 24, borderRadius: "50%", background: ind.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Check size={12} color="#fff" strokeWidth={3}/>
                            </div>
                          )}
                        </div>
                        {/* Label */}
                        <div style={{ padding: "12px 14px 14px" }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: selected ? "#fff" : "rgba(255,255,255,0.75)", margin: "0 0 2px" }}>{ind.label}</p>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0 }}>{ind.desc}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Multi-select hint */}
                {industries.length > 1 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: 16, padding: "10px 16px", borderRadius: 10, background: `${V.v500}12`, border: `1px solid ${V.v500}25` }}>
                    <p style={{ fontSize: 13, color: V.v300, margin: 0 }}>
                      Great — {industries.length} industries selected. Your primary template will be based on <strong style={{ color: "#fff" }}>{INDUSTRIES.find(i => i.id === industries[0])?.label}</strong>.
                      You can change this later from your dashboard.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* STEP 2 — Business stage */}
            {step === "stage" && (
              <motion.div key="stage" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                <div style={{ marginBottom: 32 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: V.v300, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px" }}>Step 2 of 3</p>
                  <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", margin: "0 0 8px", lineHeight: 1.1 }}>
                    Where are you right now?
                  </h1>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: 0, fontWeight: 400 }}>
                    This helps us configure the right features for your stage.
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {STAGES.map(s => (
                    <motion.button key={s.id} whileHover={{ x: 4 }} whileTap={{ scale: 0.99 }} onClick={() => setStage(s.id)}
                      style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: 16, cursor: "pointer", textAlign: "left", border: `1.5px solid ${stage===s.id?"rgba(107,53,232,0.6)":"rgba(255,255,255,0.07)"}`, background: stage===s.id ? "rgba(107,53,232,0.1)" : "rgba(255,255,255,0.03)", transition: "all 0.2s" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, overflow: "hidden", flexShrink: 0, border: `1px solid rgba(255,255,255,0.1)` }}>
                        <img src={s.img} alt={s.label} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: stage===s.id ? "#fff" : "rgba(255,255,255,0.75)", margin: "0 0 3px" }}>{s.label}</p>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0 }}>{s.desc}</p>
                      </div>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${stage===s.id?V.v500:"rgba(255,255,255,0.15)"}`, background: stage===s.id?V.v500:"transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                        {stage === s.id && <Check size={11} color="#fff" strokeWidth={3}/>}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 3 — Goal */}
            {step === "goal" && (
              <motion.div key="goal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                <div style={{ marginBottom: 32 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: V.v300, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px" }}>Step 3 of 3</p>
                  <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", margin: "0 0 8px", lineHeight: 1.1 }}>
                    What matters most right now?
                  </h1>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: 0, fontWeight: 400 }}>
                    Your AI assistant will focus on this from day one.
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10, marginBottom: 16 }}>
                  {GOALS.map(g => (
                    <motion.button key={g.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setGoal(g.id)}
                      style={{ padding: "22px 20px", borderRadius: 16, cursor: "pointer", textAlign: "left", border: `1.5px solid ${goal===g.id?"rgba(107,53,232,0.5)":"rgba(255,255,255,0.07)"}`, background: goal===g.id?"rgba(107,53,232,0.1)":"rgba(255,255,255,0.03)", transition: "all 0.2s" }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: goal===g.id?"#fff":"rgba(255,255,255,0.7)", margin: "0 0 6px" }}>{g.label}</p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.5 }}>{g.desc}</p>
                      {goal === g.id && <div style={{ width: 6, height: 6, borderRadius: "50%", background: V.v400, marginTop: 12 }}/>}
                    </motion.button>
                  ))}
                </div>
                {error && (
                  <p style={{ fontSize: 13, color: "#f87171", padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", margin: "0 0 16px" }}>
                    {error}
                  </p>
                )}
              </motion.div>
            )}

            {/* DONE — Building store */}
            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg,${V.v500},${V.v700})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: `0 16px 48px ${V.v500}40` }}>
                    <Zap size={28} color="#fff" fill="#fff"/>
                  </motion.div>
                  <h2 style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", margin: "0 0 8px" }}>
                    Setting up your store
                  </h2>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>This takes just a few seconds</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {BUILD_STEPS.map((txt, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: `1px solid ${built > i ? `${V.v500}40` : "rgba(255,255,255,0.06)"}`, transition: "border-color 0.5s" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: built > i ? `linear-gradient(135deg,${V.v500},${V.v700})` : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.4s" }}>
                        {built > i
                          ? <Check size={13} color="#fff" strokeWidth={3}/>
                          : i === built
                          ? <Loader2 size={13} color={V.v400} style={{ animation: "spin 0.8s linear infinite" }}/>
                          : null
                        }
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: built > i ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)", margin: 0, transition: "color 0.4s" }}>
                        {txt}
                      </p>
                      {built > i && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#10B981" }}/>}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Nav buttons */}
          {step !== "done" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 32, gap: 12 }}>
              {step !== "industry" ? (
                <button onClick={() => step === "stage" ? setStep("industry") : setStep("stage")}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}>
                  <ArrowLeft size={14}/> Back
                </button>
              ) : <div/>}
              <motion.button
                whileHover={canNext ? { scale: 1.02 } : {}}
                whileTap={canNext ? { scale: 0.97 } : {}}
                onClick={canNext && !saving ? handleNext : undefined}
                disabled={!canNext || saving}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 12, border: "none", cursor: canNext && !saving ? "pointer" : "not-allowed", color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "inherit", background: canNext ? `linear-gradient(135deg,${V.v500},${V.v700})` : "rgba(255,255,255,0.06)", opacity: canNext ? 1 : 0.4, transition: "all 0.2s", boxShadow: canNext ? `0 8px 24px ${V.v500}40` : "none" }}>
                {saving
                  ? <><Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }}/> Saving…</>
                  : <>{step === "goal" ? "Launch my store" : "Continue"} <ArrowRight size={15}/></>
                }
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
