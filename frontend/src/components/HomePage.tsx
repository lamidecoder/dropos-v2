"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Zap, ArrowRight, Check, Store, Package, BarChart3,
  ShoppingCart, Globe, Shield, TrendingUp, Sparkles,
  ChevronRight, Star, Play, Menu, X, MessageSquare,
} from "lucide-react";

// ─── Brand colors (matches dashboard + auth) ─────────────────────────────────
const C = {
  bg:      "#F4F2FB",
  navy:    "#130D2E",
  purple:  "#6B35E8",
  violet:  "#2D1B69",
  muted:   "rgba(19,13,46,0.5)",
  faint:   "rgba(107,53,232,0.06)",
  border:  "rgba(107,53,232,0.1)",
};

const API = process.env.NEXT_PUBLIC_API_URL || "";

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 24px",
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(244,242,251,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        transition: "all 0.3s ease",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(145deg,#2D1B69,#0D0625)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(45,27,105,0.3)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white"/>
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: C.navy, letterSpacing: "-0.02em" }}>DropOS</span>
        </Link>

        {/* Desktop nav */}
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[
            { label: "Features",   href: "/#features"  },
            { label: "Pricing",    href: "/pricing"    },
            { label: "How it works", href: "/how-it-works" },
          ].map(l => (
            <Link key={l.label} href={l.href}
              style={{ fontSize: 13, fontWeight: 500, color: C.muted, textDecoration: "none", padding: "6px 12px", borderRadius: 8, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.color = C.navy; e.currentTarget.style.background = C.faint; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = "transparent"; }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="nav-cta" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/auth/login" style={{ fontSize: 13, fontWeight: 600, color: C.muted, textDecoration: "none", padding: "8px 14px", borderRadius: 8 }}>
            Sign in
          </Link>
          <Link href="/auth/register" style={{
            fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none",
            padding: "9px 18px", borderRadius: 10,
            background: C.navy,
            boxShadow: "0 4px 14px rgba(19,13,46,0.2)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            Start free <ArrowRight size={13}/>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="nav-mobile-btn" onClick={() => setMobileOpen(!mobileOpen)}
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: C.navy, padding: 4 }}>
          {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{
              position: "fixed", top: 64, left: 0, right: 0, zIndex: 99,
              background: "rgba(244,242,251,0.98)", backdropFilter: "blur(20px)",
              borderBottom: `1px solid ${C.border}`, padding: "16px 24px 24px",
              display: "flex", flexDirection: "column", gap: 4,
            }}>
            {["Features", "Pricing", "How it works"].map(l => (
              <Link key={l} href={`/${l.toLowerCase().replace(/ /g, "-")}`}
                onClick={() => setMobileOpen(false)}
                style={{ fontSize: 15, fontWeight: 600, color: C.navy, textDecoration: "none", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                {l}
              </Link>
            ))}
            <Link href="/auth/register" onClick={() => setMobileOpen(false)}
              style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "14px 0", borderRadius: 12, background: C.navy, color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 700 }}>
              Start free <ArrowRight size={14}/>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media(max-width:768px){ .nav-links,.nav-cta{display:none!important;} .nav-mobile-btn{display:flex!important;} }
      `}</style>
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const join = async () => {
    if (!email || loading) return;
    setLoading(true);
    try {
      await fetch(`${API}/waitlist`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage" }),
      });
    } catch {}
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <section style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "120px 24px 80px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient background */}
      <div style={{
        position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
        width: 700, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(107,53,232,0.08) 0%, transparent 65%)",
        filter: "blur(60px)", pointerEvents: "none",
      }}/>

      {/* Badge */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 14px 6px 6px", borderRadius: 99,
          background: "#fff", border: `1px solid ${C.border}`,
          marginBottom: 28, boxShadow: "0 2px 12px rgba(107,53,232,0.08)",
        }}>
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: "0.08em",
          background: C.navy, color: "#fff",
          padding: "3px 8px", borderRadius: 99,
        }}>NEW</span>
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>
          KIRO AI now has 22 smart commands
        </span>
        <ChevronRight size={12} style={{ color: C.muted }}/>
      </motion.div>

      {/* Headline */}
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: "clamp(40px, 7vw, 76px)",
          fontWeight: 500, letterSpacing: "-0.04em",
          color: C.navy, lineHeight: 1.04,
          maxWidth: 800, margin: "0 0 20px",
        }}>
        The smarter way<br/>
        <em style={{ fontStyle: "italic", color: C.purple }}>to dropship.</em>
      </motion.h1>

      {/* Subheading */}
      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
        style={{ fontSize: "clamp(15px, 2.5vw, 18px)", color: C.muted, maxWidth: 520, lineHeight: 1.6, marginBottom: 40 }}>
        Launch your store in 60 seconds. Import from any supplier worldwide.
        Let KIRO handle the copy, pricing, and sales — so you focus on growing.
      </motion.p>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
        style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/auth/register" style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "15px 28px", borderRadius: 14,
          background: C.navy, color: "#fff",
          textDecoration: "none", fontSize: 15, fontWeight: 700,
          boxShadow: "0 8px 28px rgba(19,13,46,0.22)",
          letterSpacing: "-0.01em",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(19,13,46,0.3)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(19,13,46,0.22)"; }}>
          Start for free <ArrowRight size={15}/>
        </Link>
        <Link href="/auth/login" style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "15px 28px", borderRadius: 14,
          background: "#fff", color: C.navy,
          textDecoration: "none", fontSize: 15, fontWeight: 600,
          border: `1px solid ${C.border}`,
          boxShadow: "0 2px 12px rgba(107,53,232,0.06)",
          transition: "all 0.15s",
        }}>
          Sign in
        </Link>
      </motion.div>

      {/* Trust signals */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "8px 24px", marginTop: 36 }}>
        {[
          "No credit card required",
          "Free plan available",
          "Paystack + Stripe payments",
          "29 store templates",
        ].map(f => (
          <span key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted }}>
            <Check size={11} color={C.purple} strokeWidth={2.5}/>
            {f}
          </span>
        ))}
      </motion.div>

      {/* Dashboard preview */}
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
        style={{ width: "100%", maxWidth: 960, marginTop: 72, position: "relative" }}>
        {/* Glow under the preview */}
        <div style={{
          position: "absolute", bottom: -40, left: "10%", right: "10%",
          height: 80, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(107,53,232,0.15), transparent)",
          filter: "blur(20px)",
        }}/>
        <div style={{
          borderRadius: 20, overflow: "hidden",
          border: `1px solid ${C.border}`,
          boxShadow: "0 32px 80px rgba(19,13,46,0.12), 0 2px 4px rgba(19,13,46,0.04)",
          background: "#fff",
          position: "relative",
        }}>
          {/* Browser chrome */}
          <div style={{
            background: "#F4F2FB", padding: "12px 16px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ display: "flex", gap: 5 }}>
              {["#EF4444","#F59E0B","#10B981"].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }}/>
              ))}
            </div>
            <div style={{
              flex: 1, maxWidth: 240, margin: "0 auto",
              background: "#fff", borderRadius: 6, padding: "4px 12px",
              fontSize: 11, color: C.muted, textAlign: "center", border: `1px solid ${C.border}`,
            }}>
              droposhq.com/dashboard
            </div>
          </div>
          {/* Dashboard mock */}
          <div style={{ background: "#F4F2FB", padding: 20, display: "flex", gap: 14, minHeight: 320 }}>
            {/* Sidebar */}
            <div style={{ width: 48, background: "#fff", borderRadius: 12, padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, border: `1px solid ${C.border}` }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(145deg,#2D1B69,#0D0625)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white"/></svg>
              </div>
              {[Zap, Package, ShoppingCart, BarChart3, Store].map((Icon, i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: i === 0 ? "rgba(107,53,232,0.1)" : "transparent" }}>
                  <Icon size={14} color={i === 0 ? C.purple : "rgba(19,13,46,0.3)"}/>
                </div>
              ))}
            </div>
            {/* Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                {[
                  { label: "Revenue", value: "₦284,000", up: true },
                  { label: "Orders",  value: "42",        up: true },
                  { label: "Products",value: "186",       up: false },
                  { label: "Visitors",value: "1,240",     up: true },
                ].map(s => (
                  <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "14px 12px", border: `1px solid ${C.border}` }}>
                    <p style={{ fontSize: 9, color: C.muted, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
                    <p style={{ fontSize: 17, fontWeight: 800, color: C.navy, margin: 0 }}>{s.value}</p>
                    <p style={{ fontSize: 9, color: s.up ? "#10B981" : "#EF4444", margin: "2px 0 0" }}>{s.up ? "↑" : "↓"} this month</p>
                  </div>
                ))}
              </div>
              {/* KIRO chat */}
              <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: `1px solid ${C.border}`, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(145deg,#7c3aed,#4c1d95)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Zap size={11} color="#fff"/>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>KIRO</span>
                  <span style={{ fontSize: 9, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "2px 6px", borderRadius: 99 }}>● Ready</span>
                </div>
                <div style={{ background: "#F4F2FB", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
                  <p style={{ fontSize: 11, color: C.navy, margin: 0 }}>Your store made ₦47,000 this week. Want me to run a flash sale to hit ₦100k by Sunday?</p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["Yes, let's go", "Show me the plan", "Not now"].map(a => (
                    <button key={a} style={{ fontSize: 9, padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", color: C.muted, cursor: "pointer", fontFamily: "inherit" }}>{a}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Sparkles,
    color: "#7C3AED",
    title: "KIRO AI — your commerce brain",
    desc: "Import products, write descriptions, run flash sales, recover abandoned carts, and get daily insights — all from a single chat.",
    tags: ["22 slash commands", "Proactive alerts", "Daily brief"],
  },
  {
    icon: Store,
    color: "#0EA5E9",
    title: "29 store templates",
    desc: "From fashion to food to electronics — pick a template that matches your brand. Customize colors, fonts, and layout in seconds.",
    tags: ["Fashion", "Beauty", "Electronics", "+26 more"],
  },
  {
    icon: Package,
    color: "#10B981",
    title: "One-click supplier import",
    desc: "Paste any AliExpress, Temu, or Amazon link. KIRO scrapes it, scores it A–F, and sets a margin price that actually makes you money.",
    tags: ["AliExpress", "Temu", "Amazon", "CJDropshipping"],
  },
  {
    icon: TrendingUp,
    color: "#F59E0B",
    title: "Paystack + Stripe payments",
    desc: "Accept Naira payments via Paystack. Accept global card payments via Stripe. Both wired in — no code needed.",
    tags: ["Card", "Bank transfer", "USSD", "International"],
  },
  {
    icon: BarChart3,
    color: "#EF4444",
    title: "Smart analytics",
    desc: "Revenue, orders, conversion rate, top products. KIRO reads your numbers and tells you what to do about them.",
    tags: ["Revenue", "Conversion", "Products", "Customers"],
  },
  {
    icon: MessageSquare,
    color: "#8B5CF6",
    title: "Opportunity engine",
    desc: "KIRO scans your store every 6 hours for price wins, bundle opportunities, abandoned cart value, and seasonal moments.",
    tags: ["Pricing AI", "Bundle detection", "Win-back", "Seasonal"],
  },
];

function Features() {
  return (
    <section id="features" style={{ padding: "100px 24px", maxWidth: 1080, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: C.purple, marginBottom: 12, textTransform: "uppercase" }}>
          EVERYTHING YOU NEED
        </p>
        <h2 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 500, letterSpacing: "-0.035em",
          color: C.navy, margin: "0 0 16px", lineHeight: 1.1,
        }}>
          Everything you need,<br/>
          <em style={{ fontStyle: "italic", color: C.purple }}>nothing you don't.</em>
        </h2>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
          Every feature is designed to help you sell more, work less, and grow faster.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} className="feat-grid">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }} viewport={{ once: true }}
              style={{
                background: "#fff", borderRadius: 20, padding: 24,
                border: `1px solid ${C.border}`,
                boxShadow: "0 2px 12px rgba(107,53,232,0.05)",
                transition: "all 0.2s",
              }}
              whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(107,53,232,0.1)" }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, marginBottom: 16,
                background: `${f.color}12`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={20} color={f.color}/>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, margin: "0 0 8px", letterSpacing: "-0.02em" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: "0 0 16px" }}>{f.desc}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {f.tags.map(t => (
                  <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: C.faint, color: C.purple, border: `1px solid ${C.border}` }}>
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      <style>{`@media(max-width:768px){ .feat-grid{grid-template-columns:1fr!important;} }`}</style>
    </section>
  );
}

// ─── Location-aware Pricing Preview ──────────────────────────────────────────
const PRICING_BY_REGION: Record<string, {
  symbol: string; free: string; growth: string; pro: string;
  period: string; tagline: string; badge?: string;
}> = {
  NG: { symbol:"₦", free:"₦0",     growth:"₦9,500",  pro:"₦25,000", period:"/mo", tagline:"Pay in Naira. No forex stress.", badge:"🇳🇬 Nigerian prices" },
  GH: { symbol:"₵", free:"₵0",     growth:"₵89",     pro:"₵240",    period:"/mo", tagline:"Priced for Ghana. Accept GHS payments.", badge:"🇬🇭 Ghana prices" },
  KE: { symbol:"KSh",free:"KSh 0", growth:"KSh 1,300",pro:"KSh 3,500",period:"/mo", tagline:"Priced for Kenya. M-Pesa friendly.", badge:"🇰🇪 Kenya prices" },
  ZA: { symbol:"R",  free:"R 0",   growth:"R 180",   pro:"R 470",   period:"/mo", tagline:"Priced for South Africa.", badge:"🇿🇦 South Africa prices" },
  GB: { symbol:"£",  free:"£0",    growth:"£5",      pro:"£14",     period:"/mo", tagline:"Priced for the UK. Accept GBP.", badge:"🇬🇧 UK prices" },
  US: { symbol:"$",  free:"$0",    growth:"$6",      pro:"$16",     period:"/mo", tagline:"Accept USD payments globally.", badge:"🇺🇸 US prices" },
  DEFAULT: { symbol:"$", free:"$0", growth:"$6",     pro:"$16",     period:"/mo", tagline:"Accept payments in 50+ currencies.", },
};

function detectRegion(): string {
  if (typeof window === "undefined") return "DEFAULT";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes("Lagos") || tz.includes("Abuja")) return "NG";
    if (tz.includes("Accra")) return "GH";
    if (tz.includes("Nairobi")) return "KE";
    if (tz.includes("Johannesburg") || tz.includes("Cape_Town")) return "ZA";
    if (tz.includes("London")) return "GB";
    if (tz.includes("New_York") || tz.includes("Los_Angeles") || tz.includes("Chicago")) return "US";
    const lang = navigator.language || "";
    if (lang.includes("en-NG")) return "NG";
    if (lang.includes("en-GH")) return "GH";
    if (lang.includes("en-KE")) return "KE";
    if (lang.includes("en-ZA")) return "ZA";
    if (lang.includes("en-GB")) return "GB";
    if (lang.includes("en-US")) return "US";
  } catch {}
  return "DEFAULT";
}

function PricingPreview() {
  const [region, setRegion] = useState("DEFAULT");
  useEffect(() => { setRegion(detectRegion()); }, []);
  const p = PRICING_BY_REGION[region] || PRICING_BY_REGION.DEFAULT;

  const plans = [
    { name: "Free",   price: p.free,   features: ["1 store", "20 products", "KIRO — 10 msg/day", "Basic analytics"], highlight: false },
    { name: "Growth", price: p.growth, features: ["5 stores", "Unlimited products", "KIRO — unlimited", "Custom domain", "Priority support"], highlight: true },
    { name: "Pro",    price: p.pro,    features: ["Unlimited stores", "Everything in Growth", "API access", "Dedicated support"], highlight: false },
  ];

  return (
    <section style={{ padding:"80px 24px", background:"linear-gradient(160deg,#2D1B69 0%,#0D0625 100%)" }}>
      <div style={{ maxWidth:960, margin:"0 auto", textAlign:"center" }}>
        <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.12em", color:"rgba(196,181,253,0.7)", marginBottom:12, textTransform:"uppercase" }}>PRICING</p>
        <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(28px,5vw,48px)", fontWeight:500, letterSpacing:"-0.03em", color:"#fff", margin:"0 0 10px", lineHeight:1.1 }}>
          Start free.<br/>
          <em style={{ fontStyle:"italic", color:"#C4B5FD" }}>Scale when you're ready.</em>
        </h2>

        {/* Location badge */}
        {p.badge && (
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, margin:"14px 0 32px", padding:"6px 14px", borderRadius:99, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)" }}>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)", fontWeight:500 }}>{p.badge}</span>
            <span style={{ fontSize:11, color:"rgba(196,181,253,0.6)" }}>· {p.tagline}</span>
          </div>
        )}
        {!p.badge && <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", marginBottom:36 }}>{p.tagline}</p>}

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:36 }} className="price-grid">
          {plans.map(plan => (
            <div key={plan.name} style={{
              background: plan.highlight ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
              borderRadius:20, padding:"28px 24px",
              border: plan.highlight ? "1px solid rgba(196,181,253,0.35)" : "1px solid rgba(255,255,255,0.08)",
              position:"relative",
            }}>
              {plan.highlight && (
                <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"#C4B5FD", color:"#130D2E", fontSize:10, fontWeight:800, padding:"4px 14px", borderRadius:99, letterSpacing:"0.06em", whiteSpace:"nowrap" }}>
                  MOST POPULAR
                </div>
              )}
              <p style={{ fontSize:13, fontWeight:700, color:"rgba(196,181,253,0.8)", margin:"0 0 8px" }}>{plan.name}</p>
              <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:20 }}>
                <span style={{ fontSize:30, fontWeight:900, color:"#fff", letterSpacing:"-0.03em" }}>{plan.price}</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{p.period}</span>
              </div>
              {plan.features.map(f => (
                <div key={f} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <Check size={11} color="#A78BFA" strokeWidth={2.5}/>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.65)" }}>{f}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginBottom:24 }}>
          2% transaction fee on all plans · Cancel anytime
        </p>
        <Link href="/auth/register" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 32px", borderRadius:14, background:"#fff", color:C.navy, textDecoration:"none", fontSize:14, fontWeight:700, boxShadow:"0 8px 24px rgba(0,0,0,0.2)" }}>
          Start for free <ArrowRight size={14}/>
        </Link>
      </div>
      <style>{`@media(max-width:768px){ .price-grid{grid-template-columns:1fr!important;} }`}</style>
    </section>
  );
}

// ─── Social Proof ──────────────────────────────────────────────────────────────
function SocialProof() {
  const stats = [
    { value: "29",   label: "Store templates" },
    { value: "60s",  label: "To launch a store" },
    { value: "54+",  label: "Backend features" },
    { value: "100%", label: "Uptime SLA" },
  ];

  return (
    <section style={{ padding: "80px 24px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, textAlign: "center" }} className="stats-grid">
        {stats.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
            <p style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 500,
              color: C.navy, margin: "0 0 6px", letterSpacing: "-0.04em",
              lineHeight: 1,
            }}>{s.value}</p>
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{s.label}</p>
          </motion.div>
        ))}
      </div>
      <style>{`@media(max-width:768px){ .stats-grid{grid-template-columns:1fr 1fr!important; gap:32px!important;} }`}</style>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section style={{ padding: "100px 24px", textAlign: "center" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: "clamp(32px, 6vw, 60px)", fontWeight: 500, letterSpacing: "-0.04em",
          color: C.navy, margin: "0 0 18px", lineHeight: 1.08,
        }}>
          Your store is<br/>
          <em style={{ fontStyle: "italic", color: C.purple }}>60 seconds away.</em>
        </h2>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 400, margin: "0 auto 40px", lineHeight: 1.6 }}>
          No inventory. No coding. Just KIRO and a product idea.
          The rest takes care of itself.
        </p>
        <Link href="/auth/register" style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "16px 36px", borderRadius: 16,
          background: C.navy, color: "#fff",
          textDecoration: "none", fontSize: 16, fontWeight: 700,
          boxShadow: "0 8px 32px rgba(19,13,46,0.2)",
          letterSpacing: "-0.01em",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
          Launch your store free <ArrowRight size={16}/>
        </Link>
        <p style={{ fontSize: 12, color: C.muted, marginTop: 16 }}>
          No credit card · Free plan forever · Cancel anytime
        </p>
      </motion.div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${C.border}`, padding: "40px 24px",
      background: "#fff",
    }}>
      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(145deg,#2D1B69,#0D0625)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white"/></svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.navy, letterSpacing: "-0.02em" }}>DropOS</span>
          <span style={{ fontSize: 12, color: C.muted }}>© 2026</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {["Pricing", "Features", "Privacy", "Terms"].map(l => (
            <Link key={l} href={`/${l.toLowerCase()}`}
              style={{ fontSize: 12, color: C.muted, textDecoration: "none", fontWeight: 500 }}>
              {l}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div style={{ background: C.bg, fontFamily: "'Plus Jakarta Sans', -apple-system, system-ui, sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
      `}</style>
      <Nav />
      <Hero />
      <SocialProof />
      <Features />
      <PricingPreview />
      <FinalCTA />
      <Footer />
    </div>
  );
}
