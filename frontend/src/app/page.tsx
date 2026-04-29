"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Check, Star, Globe, ShoppingCart, BarChart2, Package, Sparkles, ChevronDown, Play } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api";

// ── Data ──────────────────────────────────────────────────────────────────────
const DEMO_MESSAGES = [
  { role: "user",  text: "Build me a store selling wireless earbuds" },
  { role: "kiro",  text: "Scanning market data, building your store...", typing: true },
  { role: "kiro",  text: "Done ✓  Your store is live at earbuds.droposhq.com  -  12 products added, SEO optimised. Want the TikTok ad too?" },
  { role: "user",  text: "Yes, write the TikTok ad" },
  { role: "kiro",  text: "Hook (0\u20133s): \"POV: You found earbuds that stay in\"\nMid: Unboxing, noise cancel demo, 40hr battery\nCTA: \"500 sold this week. Link in bio.\"" },
];

const FEATURES = [
  { icon: Zap,          label: "KIRO AI",         desc: "Your AI business partner. Builds stores, writes ads, finds products  -  all from chat.",   color: "#8B5CF6", bg: "rgba(139,92,246,0.08)" },
  { icon: Globe,        label: "Sell Everywhere",  desc: "90+ currencies, global payments, 135+ countries. Your store works anywhere on Earth.",    color: "#06B6D4", bg: "rgba(6,182,212,0.08)"  },
  { icon: ShoppingCart, label: "Full Commerce",    desc: "Products, orders, shipping, coupons, subscriptions  -  everything built in, nothing extra.", color: "#10B981", bg: "rgba(16,185,129,0.08)" },
  { icon: BarChart2,    label: "Real Analytics",   desc: "LTV, cohort retention, revenue attribution. Plain English insights from KIRO.",           color: "#F59E0B", bg: "rgba(245,158,11,0.08)"  },
  { icon: Package,      label: "Auto-Fulfilment",  desc: "KIRO places and tracks orders with AliExpress, CJ, Zendrop. You do nothing.",            color: "#EC4899", bg: "rgba(236,72,153,0.08)"  },
  { icon: Sparkles,     label: "Content Studio",   desc: "AI product photos, TikTok videos, ad creatives. No designer, no agency.",                  color: "#6366F1", bg: "rgba(99,102,241,0.08)"  },
];

const TESTIMONIALS = [
  { name: "Sarah K.",  loc: "New York",    text: "Launched my skincare store in 40 minutes. KIRO wrote all my descriptions and my first TikTok script. Made $2,400 in week one.", stars: 5, av: "S", color: "#8B5CF6" },
  { name: "Amaka O.",  loc: "Lagos",       text: "My store went live in 20 minutes. KIRO set up my Paystack, wrote my captions, and my first sale came within 3 days.", stars: 5, av: "A", color: "#10B981" },
  { name: "Raj M.",    loc: "London",      text: "Switched from Shopify. Cheaper and smarter. KIRO monitors my competitors and tells me when to change prices.", stars: 5, av: "R", color: "#06B6D4" },
  { name: "Carlos V.", loc: "Mexico City", text: "The WhatsApp commerce feature alone is worth it. KIRO handles my customer messages automatically while I sleep.", stars: 5, av: "C", color: "#F59E0B" },
];

const PLANS = [
  { name: "Free",   ngn:"₦0",      usd:"$0",   gbp:"£0",   color:"#6B7280", features:["1 store","20 products","KIRO 10 msgs/day","2% transaction fee"], cta:"Start free",         href:"/auth/register" },
  { name: "Growth", ngn:"₦9,500",  usd:"$15",  gbp:"£12",  color:"#8B5CF6", popular:true, features:["Unlimited products","Full KIRO","Custom domain","0% fee","Email support"], cta:"Start 14-day trial", href:"/auth/register" },
  { name: "Pro",    ngn:"₦25,000", usd:"$45",  gbp:"£35",  color:"#F59E0B", features:["Unlimited stores","KIRO Pro","WhatsApp bot","Loyalty","Priority support"], cta:"Start Pro", href:"/auth/register" },
];

const TOAST_DATA = [
  { name:"Ngozi A.", city:"Lagos",    action:"made her first sale" },
  { name:"James L.", city:"London",   action:"launched a store"    },
  { name:"Priya S.", city:"Dubai",    action:"got 5 new orders"    },
  { name:"Carlos V.",city:"Bogotá",   action:"joined DropOS"       },
  { name:"Yuki N.", city:"Tokyo",    action:"hit ₦100k revenue"   },
];

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useFadeIn(delay = 0) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return { ref, style: { opacity: isInView ? 1 : 0, transform: isInView ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s` } };
}

// ── KIRO Demo ─────────────────────────────────────────────────────────────────
function KIRODemo() {
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState<typeof DEMO_MESSAGES>([]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step >= DEMO_MESSAGES.length) return;
    const msg = DEMO_MESSAGES[step];
    const delay = step === 0 ? 600 : msg.role === "user" ? 1000 : 500;
    const t = setTimeout(() => {
      if (msg.role === "kiro" && msg.typing) {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setShown(p => [...p, msg]);
          setStep(s => s + 1);
        }, 1600);
      } else {
        setShown(p => [...p, msg]);
        setStep(s => s + 1);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [shown, typing]);

  return (
    <div className="rounded-2xl overflow-hidden h-full" style={{ background: "#0a0814", border: "1px solid rgba(107,53,232,0.2)", boxShadow: "0 32px 80px rgba(107,53,232,0.15), 0 0 0 1px rgba(107,53,232,0.05)" }}>
      {/* Mac bar */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        <div className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
        <div className="w-3 h-3 rounded-full" style={{ background: "#FFBD2E" }} />
        <div className="w-3 h-3 rounded-full" style={{ background: "#28C840" }} />
        <div className="flex-1 text-center">
          <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>KIRO  -  AI Business Partner</span>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 overflow-y-auto" style={{ minHeight: 260, maxHeight: 320, scrollbarWidth: "none" }}>
        <AnimatePresence>
          {shown.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "kiro" && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
                  <Zap size={11} color="white" />
                </div>
              )}
              <div className="max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line"
                style={msg.role === "user"
                  ? { background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", color: "#fff", borderRadius: "16px 16px 4px 16px" }
                  : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)", borderRadius: "4px 16px 16px 16px" }}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {typing && (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
                <Zap size={11} color="white" />
              </div>
              <div className="flex items-center gap-1 px-3.5 py-2.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", borderRadius: "4px 16px 16px 16px" }}>
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "#8B5CF6" }}
                    animate={{ scale: [1,1.5,1], opacity: [0.4,1,0.4] }}
                    transition={{ duration: 0.7, delay: i*0.15, repeat: Infinity }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="text-xs flex-1" style={{ color: "rgba(255,255,255,0.2)" }}>Ask KIRO anything about your store...</span>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
            <ArrowRight size={10} color="white" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Floating badge toasts ─────────────────────────────────────────────────────
function Toasts() {
  const [active, setActive] = useState<typeof TOAST_DATA[0] | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let alive = true;
    const show = () => {
      if (!alive) return;
      const item = TOAST_DATA[Math.floor(Math.random() * TOAST_DATA.length)];
      setActive(item);
      setTimeout(() => { if (alive) setActive(null); }, 4000);
      setTimeout(() => { if (alive) show(); }, 10000 + Math.random() * 8000);
    };
    const t = setTimeout(show, 5000);
    return () => { alive = false; clearTimeout(t); };
  }, []);

  return (
    <div className="fixed bottom-6 left-4 z-40 pointer-events-none">
      <AnimatePresence>
        {active && (
          <motion.div key={active.name} initial={{ opacity: 0, x: -20, y: 8 }} animate={{ opacity: 1, x: 0, y: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
            style={{ background: "#fff", maxWidth: 260 }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
              {active.name[0]}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">{active.name} from {active.city}</p>
              <p className="text-xs text-gray-500">{active.action}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <section className={`px-4 sm:px-6 ${className}`} style={style}>{children}</section>;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [email,    setEmail]    = useState("");
  const [status,   setStatus]   = useState<"idle"|"loading"|"success"|"error">("idle");
  const [count,    setCount]    = useState(1247);
  const [currency, setCurrency] = useState<"ngn"|"usd"|"gbp">("usd");

  useEffect(() => {
    if (typeof window === "undefined") return;
    fetch(`${API}/waitlist/stats`).then(r => r.json()).then(d => { if (d.data?.count) setCount(d.data.count); }).catch(() => {});
  }, []);

  const submit = async () => {
    if (!email.trim() || !email.includes("@")) return;
    setStatus("loading");
    try {
      await fetch(`${API}/waitlist`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email, source:"landing" }) });
      setStatus("success"); setCount(c => c + 1);
    } catch { setStatus("error"); }
  };

  const hero = useFadeIn(0);
  const features = useFadeIn(0.1);

  return (
    <div style={{ background: "#07050F", color: "#fff", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: rgba(107,53,232,0.4); }
        .hero-glow { background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(107,53,232,0.35), transparent); }
        .grid-bg { background-image: linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px); background-size:72px 72px; }
        .card-hover { transition: transform 0.2s, box-shadow 0.2s; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 20px 60px rgba(107,53,232,0.15); }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .float { animation: float 6s ease-in-out infinite; }
        @keyframes pulse-ring { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1.8)} }
        .pulse-ring { animation: pulse-ring 2s ease-out infinite; }
        @media(max-width:640px) { .hero-title { font-size: clamp(36px,10vw,56px) !important; } }
      `}</style>

      {/* ── STANDALONE NAV (not in marketing layout) ── */}
      <nav className="fixed top-0 inset-x-0 z-50" style={{ background: "rgba(7,5,15,0)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", boxShadow: "0 4px 14px rgba(107,53,232,0.4)" }}>
              <Zap size={14} color="white" />
            </div>
            <span className="font-black text-lg tracking-tight text-white">Drop<span style={{ color: "#8B5CF6" }}>OS</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {[["Features","/features"],["Pricing","/pricing"],["About","/about"]].map(([l,h]) => (
              <Link key={l} href={h} className="text-sm font-medium transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>{l}</Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="hidden sm:block text-sm font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>Sign in</Link>
            <Link href="/auth/register">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", boxShadow: "0 4px 14px rgba(107,53,232,0.35)" }}>
                Start free <ArrowRight size={13} />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="absolute inset-0 hero-glow grid-bg pointer-events-none" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full pointer-events-none float" style={{ background: "radial-gradient(circle,rgba(107,53,232,0.12),transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(6,182,212,0.08),transparent 70%)", filter: "blur(40px)", animationDelay: "3s" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left */}
            <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}>
              {/* Live badge */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(107,53,232,0.12)", border: "1px solid rgba(107,53,232,0.25)", color: "#A78BFA" }}>
                <span className="relative flex h-2 w-2">
                  <span className="pulse-ring absolute inline-flex h-full w-full rounded-full" style={{ background: "#A78BFA" }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#8B5CF6" }} />
                </span>
                {count.toLocaleString()} sellers already building
              </motion.div>

              <h1 className="hero-title font-black leading-none tracking-tight mb-5"
                style={{ fontSize: "clamp(44px,6vw,72px)", letterSpacing: "-3px" }}>
                Your store.<br />
                <span style={{ background: "linear-gradient(135deg,#C4B5FD 0%,#8B5CF6 40%,#06B6D4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Runs itself.
                </span>
              </h1>

              <p className="text-base sm:text-lg mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)", maxWidth: 440 }}>
                KIRO builds your dropshipping store, finds winning products, writes your ads, and grows your revenue  -  all from a single chat. No experience needed.
              </p>

              {/* Waitlist */}
              {status === "success" ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-5 rounded-2xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", maxWidth: 420 }}>
                  <p className="font-bold text-emerald-400 mb-1">You're on the list 🎉</p>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>We'll email you before anyone else gets access.</p>
                </motion.div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                  <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
                    placeholder="you@example.com" type="email"
                    className="flex-1 px-4 py-3 rounded-xl text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <button onClick={submit} disabled={status === "loading"}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white whitespace-nowrap disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", boxShadow: "0 8px 24px rgba(107,53,232,0.4)" }}>
                    {status === "loading" ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Get early access <ArrowRight size={14} /></>}
                  </button>
                </div>
              )}
              <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.2)" }}>Free forever · No credit card · Store live in 60 seconds</p>

              {/* Social proof avatars */}
              <div className="flex items-center gap-4 mt-6">
                <div className="flex -space-x-2">
                  {["S","R","A","C","Y","E"].map((l,i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black text-white"
                      style={{ borderColor: "#07050F", background: ["#6B35E8","#06B6D4","#10B981","#F59E0B","#EF4444","#EC4899"][i] }}>{l}</div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 mb-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={11} className="fill-amber-400 text-amber-400" />)}</div>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Loved by sellers worldwide</p>
                </div>
              </div>
            </motion.div>

            {/* Right  -  KIRO demo */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, type: "spring", stiffness: 90 }}
              className="relative">
              <KIRODemo />
              {/* Glow under */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 pointer-events-none"
                style={{ background: "radial-gradient(ellipse,rgba(107,53,232,0.3),transparent)", filter: "blur(20px)" }} />
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0,8,0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown size={20} style={{ color: "rgba(255,255,255,0.2)" }} />
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <Section style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "48px 24px" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 text-center">
          {[["60s","Store live in"],["90+","Currencies supported"],["20+","Store templates"],["0","Plugins needed"]].map(([n,l]) => (
            <div key={l}>
              <p className="font-black text-3xl sm:text-4xl mb-1" style={{ background: "linear-gradient(135deg,#C4B5FD,#06B6D4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{n}</p>
              <p className="text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>{l}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── FEATURES BENTO ── */}
      <Section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto">
          <div {...features} className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#8B5CF6" }}>Everything built in</p>
            <h2 className="font-black mb-4" style={{ fontSize: "clamp(28px,4vw,48px)", letterSpacing: "-2px" }}>One platform. Zero plugins.</h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
              Shopify charges extra for everything. DropOS includes it all  -  and KIRO makes it run itself.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              const fd = useFadeIn(i * 0.06);
              return (
                <div key={f.label} {...fd} className="card-hover p-6 rounded-2xl cursor-default"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: f.bg }}>
                    <Icon size={20} style={{ color: f.color }} />
                  </div>
                  <h3 className="font-bold text-base mb-2" style={{ color: "#fff" }}>{f.label}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.42)" }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ── KIRO SPOTLIGHT ── */}
      <Section className="py-20 sm:py-28" style={{ background: "rgba(107,53,232,0.03)", borderTop: "1px solid rgba(107,53,232,0.1)", borderBottom: "1px solid rgba(107,53,232,0.1)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5"
              style={{ background: "rgba(107,53,232,0.12)", border: "1px solid rgba(107,53,232,0.25)", color: "#A78BFA" }}>
              <Zap size={11} /> Powered by Anthropic Claude
            </div>
            <h2 className="font-black mb-4" style={{ fontSize: "clamp(26px,4vw,48px)", letterSpacing: "-2px" }}>
              KIRO does the work.<br />You take the revenue.
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
              Tell KIRO what you want. It builds, optimises, and runs everything  -  while you focus on your customers.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { emoji:"🏪", title:"Builds stores",    desc:"One sentence. Store live in 60 seconds with products, theme, and payments." },
              { emoji:"📣", title:"Writes ads",       desc:"TikTok scripts, Instagram captions, WhatsApp messages  -  in any language." },
              { emoji:"📦", title:"Fulfils orders",   desc:"KIRO places supplier orders and sends tracking to customers automatically." },
              { emoji:"📊", title:"Grows revenue",   desc:"Spots trends, detects slow products, suggests what to do  -  in plain English." },
            ].map((c, i) => {
              const fd = useFadeIn(i * 0.08);
              return (
                <div key={c.title} {...fd} className="p-5 rounded-2xl text-center"
                  style={{ background: "rgba(107,53,232,0.06)", border: "1px solid rgba(107,53,232,0.14)" }}>
                  <div className="text-3xl mb-3">{c.emoji}</div>
                  <h3 className="font-bold text-sm mb-2 text-white">{c.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ── TESTIMONIALS ── */}
      <Section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-black mb-3" style={{ fontSize: "clamp(26px,4vw,44px)", letterSpacing: "-2px" }}>Sellers love it.</h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>From Lagos to London. From beginners to 7-figure sellers.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {TESTIMONIALS.map((t, i) => {
              const fd = useFadeIn(i * 0.07);
              return (
                <div key={t.name} {...fd} className="card-hover p-6 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex gap-0.5 mb-4">{[1,2,3,4,5].map(i => <Star key={i} size={13} className="fill-amber-400 text-amber-400" />)}</div>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.65)" }}>"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm" style={{ background: t.color }}>{t.av}</div>
                    <div>
                      <p className="text-sm font-bold text-white">{t.name}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{t.loc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ── PRICING ── */}
      <Section id="pricing" className="py-20 sm:py-28" style={{ background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-black mb-3" style={{ fontSize: "clamp(26px,4vw,44px)", letterSpacing: "-2px" }}>Simple pricing.</h2>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>Start free. Upgrade when you're ready to scale.</p>
            <div className="inline-flex p-1 rounded-xl gap-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {(["usd","gbp","ngn"] as const).map(c => (
                <button key={c} onClick={() => setCurrency(c)}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all"
                  style={{ background: currency===c?"rgba(107,53,232,0.4)":"transparent", color: currency===c?"#fff":"rgba(255,255,255,0.4)", border:"none", cursor:"pointer" }}>
                  {c==="usd"?"$ USD":c==="gbp"?"£ GBP":"₦ NGN"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {PLANS.map((plan, i) => {
              const fd = useFadeIn(i * 0.08);
              return (
                <div key={plan.name} {...fd} className="p-6 rounded-2xl relative flex flex-col"
                  style={{ background: plan.popular?"rgba(107,53,232,0.09)":"rgba(255,255,255,0.03)", border:`1px solid ${plan.popular?"rgba(107,53,232,0.35)":"rgba(255,255,255,0.07)"}` }}>
                  {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black text-white" style={{ background: "#6B35E8" }}>MOST POPULAR</div>}
                  <h3 className="font-black text-lg mb-1 text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="font-black text-3xl text-white">{plan[currency]}</span>
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>/month</span>
                  </div>
                  <div className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-2.5">
                        <Check size={12} style={{ color: plan.color, flexShrink: 0 }} strokeWidth={3} />
                        <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={plan.href}>
                    <button className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                      style={plan.popular ? { background:`linear-gradient(135deg,#6B35E8,#3D1C8A)`,color:"#fff",border:"none",cursor:"pointer" } : { background:"transparent",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.15)",cursor:"pointer" }}>
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ── FINAL CTA ── */}
      <Section className="py-24 sm:py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96" style={{ background: "radial-gradient(ellipse,rgba(107,53,232,0.2),transparent)", filter: "blur(60px)" }} />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="font-black mb-5" style={{ fontSize: "clamp(32px,6vw,60px)", letterSpacing: "-2.5px" }}>
            Start in 60 seconds.<br />
            <span style={{ background: "linear-gradient(135deg,#C4B5FD,#06B6D4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Free forever.
            </span>
          </h2>
          <p className="text-base mb-10" style={{ color: "rgba(255,255,255,0.4)" }}>No credit card. No setup. Just tell KIRO what you want to sell.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register">
              <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base"
                style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", boxShadow: "0 12px 40px rgba(107,53,232,0.4)" }}>
                Launch your store <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/how-it-works">
              <button className="flex items-center gap-2 px-8 py-4 rounded-xl text-base transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", background: "transparent", cursor: "pointer" }}>
                <Play size={14} /> See how it works
              </button>
            </Link>
          </div>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-12" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
              <Zap size={12} color="white" />
            </div>
            <span className="font-black text-white">Drop<span style={{ color: "#8B5CF6" }}>OS</span></span>
          </div>
          <div className="flex items-center gap-5 flex-wrap justify-center">
            {[["Features","/features"],["How it Works","/how-it-works"],["Pricing","/pricing"],["About","/about"],["Privacy","/privacy"],["Terms","/terms"]].map(([l,h]) => (
              <Link key={l} href={h} className="text-xs transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.3)" }}>{l}</Link>
            ))}
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>© 2026 DropOS. All rights reserved.</p>
        </div>
      </footer>

      <Toasts />
    </div>
  );
}
