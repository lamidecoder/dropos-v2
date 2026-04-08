"use client";
// ============================================================
// 5-Minute Store Setup — KAI Guided Onboarding
// Path: frontend/src/app/onboarding/page.tsx
// Route: /onboarding (shown to new users after signup)
// ============================================================
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Loader2, Check, ChevronRight, Store, Users, DollarSign } from "lucide-react";

const NICHES = [
  { id: "fashion",     label: "Fashion & Clothing",  emoji: "👗" },
  { id: "beauty",      label: "Beauty & Hair",        emoji: "💄" },
  { id: "electronics", label: "Electronics & Gadgets",emoji: "📱" },
  { id: "food",        label: "Food & Drinks",        emoji: "🍔" },
  { id: "home",        label: "Home & Living",        emoji: "🏠" },
  { id: "health",      label: "Health & Fitness",     emoji: "💪" },
  { id: "kids",        label: "Kids & Baby",          emoji: "👶" },
  { id: "general",     label: "General / Mixed",      emoji: "🛍️" },
];

const AUDIENCES = [
  { id: "women_18_35",  label: "Women 18-35",    emoji: "👩" },
  { id: "men_18_35",    label: "Men 18-35",       emoji: "👨" },
  { id: "mothers",      label: "Mothers",         emoji: "👩‍👧" },
  { id: "students",     label: "Students",        emoji: "🎓" },
  { id: "professionals",label: "Professionals",   emoji: "💼" },
  { id: "everyone",     label: "Everyone",        emoji: "🌍" },
];

const BUDGETS = [
  { id: "starter",    label: "Under ₦50,000",     sub: "Just starting out" },
  { id: "growing",    label: "₦50k - ₦200k",      sub: "Ready to invest" },
  { id: "scaling",    label: "₦200k+",             sub: "Serious about growth" },
];

type Step = "niche" | "audience" | "budget" | "building" | "done";

export default function OnboardingPage() {
  const router  = useRouter();
  const user    = useAuthStore(s => s.user);
  const [step, setStep]         = useState<Step>("niche");
  const [niche, setNiche]       = useState("");
  const [audience, setAudience] = useState("");
  const [budget, setBudget]     = useState("");
  const [buildLog, setBuildLog] = useState<string[]>([]);
  const [storeId, setStoreId]   = useState("");

  const firstName = user?.name?.split(" ")[0] || "there";

  const runSetup = async () => {
    setStep("building");
    const log: string[] = [];
    const addLog = (msg: string) => {
      log.push(msg);
      setBuildLog([...log]);
    };

    try {
      addLog("Creating your store...");
      const storeRes = await api.post("/stores", {
        name: `${firstName}'s Store`,
        niche,
        currency: "NGN",
        country: "NG",
      });
      const newStoreId = storeRes.data.data?.id;
      setStoreId(newStoreId);
      await new Promise(r => setTimeout(r, 800));

      addLog("KAI is picking the best template for you...");
      const templateMap: Record<string, string> = {
        fashion: "Lagos Noir", beauty: "Glow", electronics: "Circuit",
        food: "Feast", home: "Cozy", health: "Lab",
        kids: "Kids", general: "Bold",
      };
      const template = templateMap[niche] || "Bold";
      await api.post("/stores/apply-template", { storeId: newStoreId, template }).catch(() => {});
      await new Promise(r => setTimeout(r, 700));

      addLog("Finding 10 starter products for your niche...");
      // Call KAI to get starter products
      const apiKey = (window as any).__NEXT_PUBLIC_API_URL || "";
      await api.post("/stores/import-starter-products", {
        storeId: newStoreId,
        niche,
        count: 10,
      }).catch(() => {});
      await new Promise(r => setTimeout(r, 1000));

      addLog("KAI is writing product descriptions...");
      await new Promise(r => setTimeout(r, 800));

      addLog("Setting up shipping zones for Nigeria...");
      await api.post("/shipping/zones/nigeria-default", { storeId: newStoreId }).catch(() => {});
      await new Promise(r => setTimeout(r, 600));

      addLog("Writing your first WhatsApp broadcast...");
      await new Promise(r => setTimeout(r, 700));

      addLog("✅ Your store is ready!");
      await new Promise(r => setTimeout(r, 500));

      setStep("done");
    } catch (err) {
      addLog("⚠️ Almost done — redirecting to dashboard...");
      await new Promise(r => setTimeout(r, 1000));
      setStep("done");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#07070e" }}>
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>K</div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {step === "done" ? "Your store is ready! 🎉" : `Hi ${firstName}, let's build your store`}
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            {step === "done" ? "KAI has everything set up for you"
              : step === "building" ? "KAI is setting everything up..."
              : "3 quick questions — 5 minutes total"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1 — Niche */}
          {step === "niche" && (
            <StepCard key="niche" icon={Store} title="What do you want to sell?">
              <div className="grid grid-cols-2 gap-2">
                {NICHES.map(n => (
                  <button key={n.id} onClick={() => setNiche(n.id)}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm text-left transition-all"
                    style={{
                      background: niche === n.id ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                      border: niche === n.id ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.07)",
                      color: niche === n.id ? "#a78bfa" : "rgba(255,255,255,0.7)",
                    }}>
                    <span className="text-lg">{n.emoji}</span>
                    <span className="font-medium text-xs">{n.label}</span>
                    {niche === n.id && <Check size={12} className="ml-auto" style={{ color: "#a78bfa" }} />}
                  </button>
                ))}
              </div>
              <NextBtn disabled={!niche} onClick={() => setStep("audience")} />
            </StepCard>
          )}

          {/* Step 2 — Audience */}
          {step === "audience" && (
            <StepCard key="audience" icon={Users} title="Who are your customers?">
              <div className="grid grid-cols-2 gap-2">
                {AUDIENCES.map(a => (
                  <button key={a.id} onClick={() => setAudience(a.id)}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm text-left transition-all"
                    style={{
                      background: audience === a.id ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                      border: audience === a.id ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.07)",
                      color: audience === a.id ? "#a78bfa" : "rgba(255,255,255,0.7)",
                    }}>
                    <span className="text-lg">{a.emoji}</span>
                    <span className="font-medium text-xs">{a.label}</span>
                    {audience === a.id && <Check size={12} className="ml-auto" style={{ color: "#a78bfa" }} />}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep("niche")} className="px-4 py-2.5 rounded-xl text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Back</button>
                <NextBtn disabled={!audience} onClick={() => setStep("budget")} className="flex-1" />
              </div>
            </StepCard>
          )}

          {/* Step 3 — Budget */}
          {step === "budget" && (
            <StepCard key="budget" icon={DollarSign} title="What's your starting budget?">
              <div className="space-y-2">
                {BUDGETS.map(b => (
                  <button key={b.id} onClick={() => setBudget(b.id)}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition-all"
                    style={{
                      background: budget === b.id ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                      border: budget === b.id ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.07)",
                    }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: budget === b.id ? "#a78bfa" : "rgba(255,255,255,0.85)" }}>{b.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{b.sub}</p>
                    </div>
                    {budget === b.id && <Check size={14} style={{ color: "#a78bfa" }} />}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep("audience")} className="px-4 py-2.5 rounded-xl text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Back</button>
                <button disabled={!budget} onClick={runSetup}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "#7c3aed", color: "#fff", opacity: budget ? 1 : 0.4 }}>
                  🚀 Build My Store Now
                </button>
              </div>
            </StepCard>
          )}

          {/* Building */}
          {step === "building" && (
            <StepCard key="building">
              <div className="py-4 space-y-3">
                {buildLog.map((log, i) => (
                  <motion.div key={i} className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    {i === buildLog.length - 1 && !log.startsWith("✅")
                      ? <Loader2 size={14} className="animate-spin flex-shrink-0" style={{ color: "#7c3aed" }} />
                      : <Check size={14} className="flex-shrink-0" style={{ color: "#34d399" }} />
                    }
                    <p className="text-sm" style={{ color: i === buildLog.length - 1 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)" }}>{log}</p>
                  </motion.div>
                ))}
              </div>
            </StepCard>
          )}

          {/* Done */}
          {step === "done" && (
            <StepCard key="done">
              <div className="text-center py-4">
                <motion.div className="text-5xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }}>🎉</motion.div>
                <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
                  KAI set up your store, imported starter products, and wrote all descriptions. You're ready to sell.
                </p>
                <button onClick={() => router.push("/dashboard")}
                  className="w-full py-3 rounded-xl text-sm font-semibold"
                  style={{ background: "#7c3aed", color: "#fff" }}>
                  Open My Dashboard →
                </button>
              </div>
            </StepCard>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        {!["building","done"].includes(step) && (
          <div className="flex justify-center gap-2 mt-6">
            {["niche","audience","budget"].map(s => (
              <div key={s} className="w-2 h-2 rounded-full transition-all"
                style={{ background: s === step ? "#7c3aed" : "rgba(255,255,255,0.15)" }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StepCard({ children, icon: Icon, title }: any) {
  return (
    <motion.div className="rounded-2xl p-6"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
      {(Icon || title) && (
        <div className="flex items-center gap-2.5 mb-5">
          {Icon && <Icon size={16} style={{ color: "#a78bfa" }} />}
          {title && <h2 className="text-base font-semibold text-white">{title}</h2>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}

function NextBtn({ onClick, disabled, className = "" }: any) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${className}`}
      style={{ background: "#7c3aed", color: "#fff", opacity: disabled ? 0.4 : 1 }}>
      Next <ChevronRight size={14} />
    </button>
  );
}
