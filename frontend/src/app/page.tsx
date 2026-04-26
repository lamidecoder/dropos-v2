"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Check, Star, Globe, ShoppingCart, BarChart2, Package, Cpu, Sparkles, ChevronDown, Menu, X } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api";

const DEMO_MESSAGES = [
  { role: "user",  text: "Build me a store selling wireless earbuds" },
  { role: "kiro",  text: "On it. Scanning market pricing, building your store...", typing: true },
  { role: "kiro",  text: "Done. Your store is live at myearbuds.droposhq.com — 12 products added, optimised for conversion. Want me to write the TikTok ad?" },
  { role: "user",  text: "Yes, write the TikTok ad" },
  { role: "kiro",  text: "**Hook (0-3s):** \"Wait — these earbuds last 40 hours and cost under $30?\"\n**Middle:** Show unboxing, noise cancellation demo, price reveal\n**CTA:** \"Link in bio. 500 sold this week.\"" },
];

const TOAST_NAMES = ["Sarah K.","Raj M.","Emma T.","Carlos V.","Yuki N.","Amaka O.","James L.","Priya S."];
const TOAST_CITIES = ["New York","London","Lagos","Singapore","Dubai","Toronto","Berlin","Sydney","Mumbai","São Paulo"];

const FEATURES = [
  { icon: Zap,          label: "KIRO AI",          desc: "Your AI business partner. Builds stores, writes ads, finds winning products, manages orders — all from chat." },
  { icon: Globe,        label: "Sell Anywhere",     desc: "Multi-currency, 90+ languages, global payment methods. Your store works in every country." },
  { icon: ShoppingCart, label: "Full Commerce",     desc: "Products, orders, inventory, shipping, returns, coupons, flash sales — everything built in." },
  { icon: BarChart2,    label: "Real Analytics",    desc: "Revenue, LTV, cohorts, attribution. Know exactly what drives your sales." },
  { icon: Package,      label: "Auto-Fulfilment",   desc: "KIRO connects to AliExpress, CJ, Zendrop. Orders placed and tracked automatically." },
  { icon: Cpu,          label: "Content Studio",    desc: "AI-generated product photos, TikTok videos, ad creatives. No designer needed." },
];

const TESTIMONIALS = [
  { name: "Sarah K.",     location: "New York, USA",     text: "I launched my skincare store in 40 minutes. KIRO wrote all my product descriptions and my first TikTok script. Made $2,400 in week one.", avatar: "S" },
  { name: "Raj M.",       location: "London, UK",         text: "Switched from Shopify. Cheaper, smarter. KIRO monitors my competitors and tells me when to change prices. Nothing else does that.", avatar: "R" },
  { name: "Amaka O.",     location: "Lagos, Nigeria",     text: "My store went live in 20 minutes. KIRO set up my Paystack, wrote my captions, and my first sale came within 3 days.", avatar: "A" },
  { name: "Carlos V.",    location: "Mexico City, MX",    text: "The WhatsApp commerce feature alone is worth it. KIRO handles all my customer messages automatically while I sleep.", avatar: "C" },
];

const PLANS = [
  { name: "Free",   price: { ngn: "₦0",    gbp: "£0",  usd: "$0"  }, period: "/month", color: "#6B7280", features: ["1 store", "20 products", "KIRO 10 msgs/day", "Basic analytics", "2% transaction fee"], cta: "Start free", href: "/auth/register" },
  { name: "Growth", price: { ngn: "₦9,500",gbp: "£12", usd: "$15" }, period: "/month", color: "#8B5CF6", popular: true, features: ["Unlimited products", "Full KIRO", "Custom domain", "Remove branding", "0% fee", "Email support"], cta: "Start 14-day trial", href: "/auth/register" },
  { name: "Pro",    price: { ngn: "₦25,000",gbp: "£35",usd: "$45" }, period: "/month", color: "#F59E0B", features: ["Unlimited stores", "KIRO Pro intelligence", "WhatsApp commerce bot", "Email campaigns", "Loyalty programme", "Priority support"], cta: "Start Pro", href: "/auth/register" },
];

function Nav({ count }: { count: number }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 transition-all" style={{ background: scrolled ? "rgba(7,5,15,0.95)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
            <Zap size={14} color="white" />
          </div>
          <span className="font-black text-white text-lg tracking-tight">Drop<span style={{ color: "#8B5CF6" }}>OS</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[["Features", "#features"], ["Pricing", "#pricing"], ["Dashboard", "/auth/login"]].map(([l, h]) => (
            <a key={l} href={h} className="text-sm font-medium transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.5)" }}>{l}</a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="hidden md:block text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Sign in</Link>
          <Link href="/auth/register">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
              Start free <ArrowRight size={13} />
            </button>
          </Link>
          <button onClick={() => setOpen(!open)} className="md:hidden" style={{ color: "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: "pointer" }}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t px-6 py-4 space-y-3" style={{ background: "rgba(7,5,15,0.98)", borderColor: "rgba(255,255,255,0.06)" }}>
          {[["Features", "#features"], ["Pricing", "#pricing"], ["Sign in", "/auth/login"], ["Start free", "/auth/register"]].map(([l, h]) => (
            <a key={l} href={h} onClick={() => setOpen(false)} className="block text-sm font-medium py-2" style={{ color: "rgba(255,255,255,0.7)" }}>{l}</a>
          ))}
        </div>
      )}
    </nav>
  );
}

function KIRODemo() {
  const [step, setStep] = useState(0);
  const [displayed, setDisplayed] = useState<typeof DEMO_MESSAGES>([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (step >= DEMO_MESSAGES.length) return;
    const msg = DEMO_MESSAGES[step];
    const delay = step === 0 ? 800 : msg.role === "user" ? 1200 : 600;
    const t = setTimeout(() => {
      if (msg.role === "kiro" && msg.typing) {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setDisplayed(p => [...p, msg]);
          setStep(s => s + 1);
        }, 1800);
      } else {
        setDisplayed(p => [...p, msg]);
        setStep(s => s + 1);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#0a0814", border: "1px solid rgba(107,53,232,0.25)", boxShadow: "0 32px 80px rgba(107,53,232,0.2)" }}>
      {/* Mac-style header */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        <div className="w-3 h-3 rounded-full bg-red-500/60" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <div className="w-3 h-3 rounded-full bg-green-500/60" />
        <div className="flex-1 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
              <Zap size={10} color="white" />
            </div>
            <span className="text-xs font-bold text-white">KIRO</span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>— your AI business partner</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="p-5 space-y-4 min-h-[280px]">
        <AnimatePresence>
          {displayed.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2.5`}>
              {msg.role === "kiro" && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
                  <Zap size={11} color="white" />
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed`}
                style={msg.role === "user"
                  ? { background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", color: "#fff", borderRadius: "18px 18px 4px 18px" }
                  : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.85)", borderRadius: "4px 18px 18px 18px", whiteSpace: "pre-line" }
                }>
                {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
              </div>
            </motion.div>
          ))}
          {typing && (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
                <Zap size={11} color="white" />
              </div>
              <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", borderRadius: "4px 18px 18px 18px" }}>
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "#8B5CF6" }}
                    animate={{ scale: [1,1.4,1], opacity: [0.4,1,0.4] }}
                    transition={{ duration: 0.8, delay: i*0.15, repeat: Infinity }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="text-sm flex-1" style={{ color: "rgba(255,255,255,0.2)" }}>Ask KIRO to build, sell, or grow...</span>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
            <ArrowRight size={12} color="white" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [email,    setEmail]    = useState("");
  const [wa,       setWa]       = useState("");
  const [status,   setStatus]   = useState<"idle"|"loading"|"success"|"error">("idle");
  const [errMsg,   setErrMsg]   = useState("");
  const [count,    setCount]    = useState(1247);
  const [copied,   setCopied]   = useState(false);
  const [currency, setCurrency] = useState<"usd"|"gbp"|"ngn">("usd");
  const [toasts,   setToasts]   = useState<{id:number;name:string;city:string}[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    fetch(`${API}/waitlist/stats`).then(r => r.json()).then(d => { if (d.data?.count) setCount(d.data.count); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const show = () => {
      if (!alive) return;
      const id = Date.now();
      const name = TOAST_NAMES[Math.floor(Math.random() * TOAST_NAMES.length)];
      const city = TOAST_CITIES[Math.floor(Math.random() * TOAST_CITIES.length)];
      setToasts(t => [...t.slice(-1), { id, name, city }]);
      timers.push(setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000));
      if (alive) timers.push(setTimeout(show, 10000 + Math.random() * 15000));
    };
    timers.push(setTimeout(show, 4000));
    return () => { alive = false; timers.forEach(clearTimeout); };
  }, []);

  const submit = async () => {
    setErrMsg("");
    if (!email.trim() || !email.includes("@")) { setErrMsg("Enter a valid email address."); return; }
    setStatus("loading");
    try {
      await fetch(`${API}/waitlist`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), whatsapp: wa.trim() || undefined, source: "landing" }),
      });
      setStatus("success");
      setCount(c => c + 1);
    } catch {
      setStatus("error");
      setErrMsg("Something went wrong. Try again.");
    }
  };

  const inp = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/60 transition-all";

  return (
    <div style={{ background: "#07050F", color: "#fff", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", overflowX: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); * { box-sizing: border-box; } ::selection { background: rgba(107,53,232,0.4); }`}</style>

      <Nav count={count} />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20 px-6">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-25" style={{ background: "radial-gradient(ellipse, #6B35E8, transparent 70%)", filter: "blur(100px)" }} />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: "radial-gradient(ellipse, #06B6D4, transparent 70%)", filter: "blur(80px)" }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{ background: "rgba(107,53,232,0.15)", border: "1px solid rgba(107,53,232,0.3)", color: "#A78BFA" }}>
                <motion.div className="w-1.5 h-1.5 rounded-full bg-violet-400" animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                {count.toLocaleString()} sellers already joined
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="font-black leading-[0.92] tracking-tight mb-6"
                style={{ fontSize: "clamp(44px,6vw,76px)", letterSpacing: "-3px" }}>
                Your store.<br />
                <span style={{ background: "linear-gradient(135deg, #A78BFA 0%, #C4B5FD 35%, #06B6D4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Runs itself.
                </span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                className="text-base sm:text-lg mb-8 max-w-md leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                KIRO builds your dropshipping store, finds winning products, writes your ads, and grows your revenue — all from a single chat. No experience needed.
              </motion.p>

              {/* Waitlist form */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                {status === "success" ? (
                  <div className="p-5 rounded-2xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
                    <p className="font-bold text-emerald-400 mb-1">You're on the list 🎉</p>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>We'll email you before anyone else gets access. Check your inbox.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="you@example.com" type="email" className={inp} style={{ flex: 1 }} />
                      <motion.button onClick={submit} disabled={status === "loading"} whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white text-sm flex-shrink-0 disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", boxShadow: "0 8px 32px rgba(107,53,232,0.4)", whiteSpace: "nowrap" }}>
                        {status === "loading" ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Get early access <ArrowRight size={14} /></>}
                      </motion.button>
                    </div>
                    {errMsg && <p className="text-xs text-red-400">{errMsg}</p>}
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Free forever. No credit card. Launch in 60 seconds.</p>
                  </div>
                )}
              </motion.div>

              {/* Social proof logos */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="flex items-center gap-4 mt-8">
                <div className="flex -space-x-2">
                  {["S","R","A","C","Y","E"].map((l, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#07050F] flex items-center justify-center text-xs font-black text-white" style={{ background: ["#6B35E8","#06B6D4","#10B981","#F59E0B","#EF4444","#8B5CF6"][i] }}>{l}</div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 mb-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={11} className="fill-amber-400 text-amber-400" />)}</div>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Loved by 1,200+ sellers worldwide</p>
                </div>
              </motion.div>
            </div>

            {/* Right — KIRO demo */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, type: "spring", stiffness: 100 }}>
              <KIRODemo />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown size={20} style={{ color: "rgba(255,255,255,0.2)" }} />
          </motion.div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: "60s",    label: "Store live in"      },
            { n: "20+",    label: "Store templates"    },
            { n: "90+",    label: "Currencies"         },
            { n: "0",      label: "Plugins needed"     },
          ].map(s => (
            <div key={s.label}>
              <p className="font-black text-4xl mb-1" style={{ background: "linear-gradient(135deg,#A78BFA,#06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.n}</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest mb-3 uppercase" style={{ color: "#8B5CF6" }}>Everything built in</p>
            <h2 className="font-black text-3xl sm:text-5xl mb-4" style={{ letterSpacing: "-2px" }}>One platform. Zero plugins.</h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
              Shopify charges extra for everything. DropOS includes it all — powered by KIRO so it actually runs itself.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(107,53,232,0.12)" }}>
                    <Icon size={18} style={{ color: "#8B5CF6" }} />
                  </div>
                  <h3 className="font-bold text-sm mb-2" style={{ color: "#fff" }}>{f.label}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── KIRO SPOTLIGHT ───────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "rgba(107,53,232,0.04)", borderTop: "1px solid rgba(107,53,232,0.12)", borderBottom: "1px solid rgba(107,53,232,0.12)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5" style={{ background: "rgba(107,53,232,0.15)", border: "1px solid rgba(107,53,232,0.3)", color: "#A78BFA" }}>
              <Zap size={11} /> Powered by Claude AI
            </div>
            <h2 className="font-black text-3xl sm:text-5xl mb-4" style={{ letterSpacing: "-2px" }}>KIRO does the work.<br />You take the money.</h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>Tell KIRO what you want. KIRO builds it, optimises it, and runs it — while you focus on growth.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { emoji: "🏪", title: "Builds stores",      desc: "\"Build me a shoe store\" — done in 60 seconds with products, theme, and payment." },
              { emoji: "📣", title: "Writes ads",         desc: "TikTok scripts, Instagram captions, Facebook ads — for any product, in seconds." },
              { emoji: "📦", title: "Manages orders",     desc: "\"Mark order shipped\" — done. KIRO handles fulfilment, tracking, and customer updates." },
              { emoji: "📊", title: "Grows revenue",      desc: "Spots slow products, suggests price changes, finds trending items before everyone else." },
            ].map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-5 rounded-2xl text-center" style={{ background: "rgba(107,53,232,0.06)", border: "1px solid rgba(107,53,232,0.15)" }}>
                <div className="text-3xl mb-3">{c.emoji}</div>
                <h3 className="font-bold text-sm mb-2 text-white">{c.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-black text-3xl sm:text-5xl mb-3" style={{ letterSpacing: "-2px" }}>Sellers love it.</h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>From Lagos to London. From beginners to 7-figure sellers.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex gap-0.5 mb-4">{[1,2,3,4,5].map(i => <Star key={i} size={13} className="fill-amber-400 text-amber-400" />)}</div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.65)" }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>{t.avatar}</div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6" style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-black text-3xl sm:text-5xl mb-3" style={{ letterSpacing: "-2px" }}>Simple pricing.</h2>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>Start free. Upgrade when you're ready to scale.</p>
            {/* Currency toggle */}
            <div className="inline-flex p-1 rounded-xl gap-1" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {(["usd","gbp","ngn"] as const).map(c => (
                <button key={c} onClick={() => setCurrency(c)}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all"
                  style={{ background: currency === c ? "rgba(107,53,232,0.4)" : "transparent", color: currency === c ? "#fff" : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer" }}>
                  {c === "usd" ? "USD $" : c === "gbp" ? "GBP £" : "NGN ₦"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {PLANS.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl relative" style={{ background: plan.popular ? "rgba(107,53,232,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${plan.popular ? "rgba(107,53,232,0.4)" : "rgba(255,255,255,0.07)"}` }}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black text-white" style={{ background: "#6B35E8" }}>MOST POPULAR</div>
                )}
                <h3 className="font-black text-lg mb-1 text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="font-black text-3xl text-white">{plan.price[currency]}</span>
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>{plan.period}</span>
                </div>
                <div className="space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <Check size={13} style={{ color: plan.color, flexShrink: 0 }} strokeWidth={3} />
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href={plan.href}>
                  <button className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                    style={plan.popular ? { background: `linear-gradient(135deg,#6B35E8,#3D1C8A)`, color: "#fff", border: "none", cursor: "pointer" } : { background: "transparent", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}>
                    {plan.cta}
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="py-28 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px]" style={{ background: "radial-gradient(ellipse, rgba(107,53,232,0.25), transparent 70%)", filter: "blur(60px)" }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="font-black text-4xl sm:text-6xl mb-5" style={{ letterSpacing: "-2.5px" }}>
            Start in 60 seconds.<br />
            <span style={{ background: "linear-gradient(135deg,#A78BFA,#06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Free forever.</span>
          </h2>
          <p className="text-base mb-10" style={{ color: "rgba(255,255,255,0.4)" }}>No credit card. No setup. Just tell KIRO what you want to sell.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register">
              <motion.button whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base"
                style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", boxShadow: "0 12px 40px rgba(107,53,232,0.45)" }}>
                Launch your store <ArrowRight size={16} />
              </motion.button>
            </Link>
            <Link href="/auth/login">
              <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-base transition-colors" style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", background: "transparent", cursor: "pointer" }}>
                Sign in
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="px-6 py-12" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
              <Zap size={12} color="white" />
            </div>
            <span className="font-black text-white">Drop<span style={{ color: "#8B5CF6" }}>OS</span></span>
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            {[["Features","#features"],["Pricing","#pricing"],["Privacy","/privacy"],["Terms","/terms"]].map(([l,h]) => (
              <a key={l} href={h} className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>© 2026 DropOS. All rights reserved.</p>
        </div>
      </footer>

      {/* Live signup toasts */}
      <div className="fixed bottom-6 left-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: -20, y: 8 }} animate={{ opacity: 1, x: 0, y: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl"
              style={{ background: "#fff", maxWidth: 260 }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
                {t.name[0]}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{t.name} from {t.city}</p>
                <p className="text-xs text-gray-500">just joined the waitlist</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
