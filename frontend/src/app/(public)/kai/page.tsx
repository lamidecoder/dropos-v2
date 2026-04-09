"use client";
// Path: frontend/src/app/(public)/kai/page.tsx
// Public KAI — no login needed
// Builds store in conversation → login popup at 80% complete
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Send, X, Zap, ArrowRight, Loader2,
  Store, TrendingUp, Package, Star,
} from "lucide-react";

interface Msg {
  id:     string;
  role:   "user" | "KIRO";
  text:   string;
  typing?: boolean;
}

// The building flow
const FLOW = [
  { step: 1,  progress: 15, prompt_match: ["sell","store","start","business","product","niche"] },
  { step: 2,  progress: 35, prompt_match: ["name","call","brand"] },
  { step: 3,  progress: 55, prompt_match: ["target","customer","audience","nigeria","lagos","women","men"] },
  { step: 4,  progress: 75, prompt_match: ["theme","color","style","look","design"] },
  { step: 5,  progress: 85, prompt_match: ["price","cost","margin","profit"] },
];

// KAI persona — public version (no store data, but helpful and smart)
const WELCOME = [
  "Hi! I'm KAI 👋 I can help you build a store, find winning products, write ads, or just answer dropshipping questions.",
  "What would you like to do today?",
];

const DEMO_RESPONSES: Record<string, string> = {
  default: "Great question! As a dropshipping AI built for Nigerian sellers, I can help you with that. What product are you thinking of selling?",
  product: "Nice choice! In Nigeria right now, the highest-margin categories are hair products (60-80% margin), skincare (70-85%), and phone accessories (45-60%). Which fits your audience best?",
  store:   "Let's build your store! First — what do you want to sell? Tell me the product category or a specific item you're passionate about.",
  sales:   "Based on trending data, here are the top 3 winning products in Nigeria this week:\n\n🥇 Brazilian Hair Bundles — ₦45k avg order, 72% margin\n🥈 LED Face Masks — ₦28k avg order, 68% margin\n🥉 Men's Perfume Sets — ₦15k avg order, 65% margin\n\nWant me to set up a store around any of these?",
  tiktok:  "Here's a TikTok script for a hair bundle product:\n\n🎬 Hook (0-2s): \"POV: You found the supplier Abuja girls have been keeping secret 👀\"\n\n📱 Body (2-10s): Show the product, unboxing, before/after\n\n💬 CTA: \"Link in bio — free delivery today only\"\n\nThis format converts at 4-8% on Nigerian TikTok. Want me to write more?",
  name:    "Love that! A strong store name should be memorable and hint at quality. Some options:\n\n✨ GlowVault\n✨ NaijaLux\n✨ Velvet & Co\n✨ The Lagos Edit\n\nWhich vibe fits your brand?",
  price:   "For Nigerian dropshipping, a good rule: sell at 3-4x your supplier cost. If you buy at ₦5,000, sell at ₦15-20k. Paystack takes 1.5% + ₦100, so factor that in. Your margin should be minimum 40% after all costs.",
};

function getResponse(input: string): string {
  const low = input.toLowerCase();
  if (low.includes("tiktok") || low.includes("script") || low.includes("video")) return DEMO_RESPONSES.tiktok;
  if (low.includes("name") || low.includes("brand") || low.includes("call")) return DEMO_RESPONSES.name;
  if (low.includes("price") || low.includes("margin") || low.includes("profit") || low.includes("cost")) return DEMO_RESPONSES.price;
  if (low.includes("trending") || low.includes("top product") || low.includes("winning") || low.includes("best sell")) return DEMO_RESPONSES.sales;
  if (low.includes("store") || low.includes("build") || low.includes("create") || low.includes("start")) return DEMO_RESPONSES.store;
  if (low.includes("product") || low.includes("sell") || low.includes("niche")) return DEMO_RESPONSES.product;
  return DEMO_RESPONSES.default;
}

function getProgress(msgs: Msg[]): number {
  const count = msgs.filter(m => m.role === "user").length;
  if (count === 0) return 0;
  if (count === 1) return 20;
  if (count === 2) return 40;
  if (count === 3) return 60;
  if (count === 4) return 75;
  return Math.min(85, 75 + count * 3);
}

// ── Login Modal ───────────────────────────────────────────────
function LoginModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
        onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md rounded-3xl p-8 text-center"
        style={{ background: "#0e0e1e", border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(124,58,237,0.15)" }}
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>

        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl"
          style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)" }}>
          <X size={14} />
        </button>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#7c3aed,#a78bfa)" }}
              initial={{ width: "0%" }} animate={{ width: "80%" }} transition={{ duration: 1, delay: 0.3 }} />
          </div>
          <span className="text-sm font-bold" style={{ color: "#a78bfa" }}>80%</span>
        </div>

        <div className="w-16 h-16 rounded-3xl flex items-center justify-center font-black text-white text-2xl mx-auto mb-5"
          style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", boxShadow: "0 0 30px rgba(124,58,237,0.5)" }}>
          K
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Your store is almost ready!</h2>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
          Create your free account to save everything we've built together. Takes 30 seconds.
        </p>

        <div className="space-y-3">
          <Link href="/auth/register" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", boxShadow: "0 8px 24px rgba(124,58,237,0.4)" }}>
            Create Free Account <ArrowRight size={16} />
          </Link>
          <Link href="/auth/login" className="flex items-center justify-center w-full py-3 rounded-2xl text-sm"
            style={{ color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)" }}>
            Already have an account? Sign in
          </Link>
        </div>

        <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.25)" }}>
          Free forever · No credit card needed
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── Floating stats ────────────────────────────────────────────
const STATS = [
  { icon: <Store size={14} />, text: "Store in 60 sec" },
  { icon: <TrendingUp size={14} />, text: "AI finds winners" },
  { icon: <Package size={14} />, text: "Auto-fulfillment" },
  { icon: <Star size={14} />, text: "Built for Nigeria" },
];

// ── Main page ─────────────────────────────────────────────────
export default function PublicKAIPage() {
  const [msgs, setMsgs]         = useState<Msg[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoad]      = useState(false);
  const [showLogin, setLogin]   = useState(false);
  const [hasTriggered, setTrig] = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  const progress = getProgress(msgs);

  // Trigger login popup at 80%
  useEffect(() => {
    if (progress >= 75 && !hasTriggered && msgs.length > 0) {
      setTrig(true);
      const t = setTimeout(() => setLogin(true), 1200);
      return () => clearTimeout(t);
    }
  }, [progress, hasTriggered, msgs.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // Show welcome message on mount
  useEffect(() => {
    setTimeout(async () => {
      const id = "welcome";
      setMsgs([{ id, role: "KIRO", text: "", typing: true }]);
      await new Promise(r => setTimeout(r, 800));
      const full = WELCOME.join("\n\n");
      let built = "";
      for (const word of full.split(" ")) {
        await new Promise(r => setTimeout(r, 18));
        built += (built ? " " : "") + word;
        const snap = built;
        setMsgs([{ id, role: "KIRO", text: snap, typing: false }]);
      }
    }, 400);
  }, []);

  const send = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const uid = Date.now().toString();
    const kid = (Date.now()+1).toString();
    setMsgs(prev => [...prev, { id: uid, role: "user", text: msg }, { id: kid, role: "KIRO", text: "", typing: true }]);
    setLoad(true);

    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

    const reply = getResponse(msg);
    let built = "";
    for (const word of reply.split(" ")) {
      await new Promise(r => setTimeout(r, 18 + Math.random() * 10));
      built += (built ? " " : "") + word;
      const snap = built;
      setMsgs(prev => prev.map(m => m.id === kid ? { ...m, text: snap, typing: false } : m));
    }

    setLoad(false);
  }, [input, loading]);

  const QUICK = [
    { icon: "🔥", label: "What's trending in Nigeria?", p: "What products are trending in Nigeria right now?" },
    { icon: "🏪", label: "Build my store",              p: "I want to build a dropshipping store" },
    { icon: "📱", label: "Write a TikTok script",       p: "Write a TikTok script for my product" },
    { icon: "💰", label: "How to price products?",      p: "How do I price my dropshipping products?" },
  ];

  const isEmpty = msgs.length === 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#06060f" }}>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", width: "800px", height: "800px",
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)",
          top: "-300px", left: "50%", transform: "translateX(-50%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px" }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}>
            <Zap size={16} fill="white" color="white" />
          </div>
          <span className="font-black text-base">
            <span className="text-white">Drop</span><span style={{ color: "#a78bfa" }}>OS</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm px-4 py-2 rounded-xl"
            style={{ color: "rgba(255,255,255,0.5)" }}>Sign in</Link>
          <Link href="/auth/register"
            className="text-sm px-4 py-2 rounded-xl font-semibold text-white"
            style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero — visible when chat is empty */}
      <AnimatePresence>
        {isEmpty && (
          <motion.div className="relative z-10 text-center px-6 pt-12 pb-4 flex-shrink-0"
            exit={{ opacity: 0, height: 0 }}>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-medium"
              style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a78bfa" }}
                animate={{ scale: [1,1.4,1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              Africa's First AI Store Builder
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              Your store.<br />
              <span style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Meets KAI.
              </span>
            </motion.h1>

            <motion.p className="text-base mb-8 max-w-sm mx-auto leading-relaxed"
              style={{ color: "rgba(255,255,255,0.45)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              Tell KAI what you want to sell. Your store is built in the conversation.
            </motion.p>

            {/* Stats row */}
            <motion.div className="flex items-center justify-center gap-3 flex-wrap"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              {STATS.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                  <span style={{ color: "#a78bfa" }}>{s.icon}</span>
                  {s.text}
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar — shows when chatting */}
      <AnimatePresence>
        {!isEmpty && progress > 0 && (
          <motion.div className="relative z-10 px-4 py-2 flex-shrink-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-3 max-w-2xl mx-auto">
              <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg,#7c3aed,#a78bfa)" }}
                  animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }} />
              </div>
              <span className="text-xs font-semibold flex-shrink-0" style={{ color: "#a78bfa" }}>
                {progress}% built
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 max-w-2xl w-full mx-auto space-y-4">
        {msgs.map(m => (
          <motion.div key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} gap-2.5`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 22 }}>

            {m.role === "KIRO" && (
              <motion.div
                className="w-8 h-8 rounded-2xl flex items-center justify-center font-black text-white text-sm flex-shrink-0 mt-0.5"
                style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", boxShadow: "0 0 16px rgba(124,58,237,0.4)" }}
                animate={{ boxShadow: ["0 0 8px rgba(124,58,237,0.3)","0 0 20px rgba(124,58,237,0.5)","0 0 8px rgba(124,58,237,0.3)"] }}
                transition={{ duration: 2.5, repeat: Infinity }}>
                K
              </motion.div>
            )}

            <div className={`max-w-[80%] flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
              {m.role === "KIRO" && m.typing && !m.text ? (
                <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm"
                  style={{ background: "rgba(255,255,255,0.07)" }}>
                  {[0,1,2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "#a78bfa" }}
                      animate={{ scale: [1,1.5,1], opacity: [0.4,1,0.4] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i*0.2 }} />
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-sm leading-relaxed"
                  style={{
                    background:   m.role === "user" ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "rgba(255,255,255,0.07)",
                    color:        "rgba(255,255,255,0.88)",
                    borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                    boxShadow:    m.role === "user" ? "0 4px 20px rgba(124,58,237,0.3)" : "none",
                  }}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick chips — only on empty */}
      {isEmpty && (
        <div className="relative z-10 px-4 pb-4 flex-shrink-0">
          <div className="max-w-2xl mx-auto grid grid-cols-2 gap-2">
            {QUICK.map((q, i) => (
              <motion.button key={i} onClick={() => send(q.p)}
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-left text-sm"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
                whileHover={{ borderColor: "rgba(124,58,237,0.3)", color: "#a78bfa", backgroundColor: "rgba(124,58,237,0.06)" }}
                whileTap={{ scale: 0.98 }}>
                <span className="text-lg flex-shrink-0">{q.icon}</span>
                <span className="text-xs leading-tight">{q.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="relative z-10 px-4 pb-6 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
            <input ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder={isEmpty ? "Tell KAI what you want to sell..." : "Ask KIRO anything..."}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "rgba(255,255,255,0.85)" }} />
            <motion.button onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: input.trim() ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "rgba(255,255,255,0.07)",
                boxShadow: input.trim() ? "0 4px 16px rgba(124,58,237,0.4)" : "none" }}
              whileTap={input.trim() ? { scale: 0.95 } : {}}>
              {loading
                ? <Loader2 size={15} className="animate-spin" style={{ color: "#a78bfa" }} />
                : <Send size={15} style={{ color: input.trim() ? "#fff" : "rgba(255,255,255,0.25)" }} />
              }
            </motion.button>
          </div>
          <p className="text-center mt-2 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            No account needed · Free to try
          </p>
        </div>
      </div>

      {/* Login modal */}
      <AnimatePresence>
        {showLogin && <LoginModal onClose={() => setLogin(false)} />}
      </AnimatePresence>
    </div>
  );
}
