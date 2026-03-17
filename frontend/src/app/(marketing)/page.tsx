"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  Zap, ArrowRight, Star, Package, BarChart2, Globe, Shield,
  CreditCard, Truck, Palette, TrendingUp, Users, CheckCircle,
  ChevronRight, Play
} from "lucide-react";

function Grain() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.025]"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "128px" }} />
  );
}

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function FadeUp({ children, delay = 0, className = "" }: any) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const features = [
  { icon: Package,    title: "Product Management",    desc: "Add unlimited products with variants, images, inventory tracking and bulk import." },
  { icon: Globe,      title: "Custom Storefronts",    desc: "Beautiful store templates. Your brand, your colors, your domain." },
  { icon: CreditCard, title: "Multi-Gateway Payments", desc: "Accept payments via Stripe, Paystack, and Flutterwave. Sell globally." },
  { icon: Truck,      title: "Smart Shipping Zones",  desc: "Set rates by country, offer free shipping thresholds, track every delivery." },
  { icon: BarChart2,  title: "Real-time Analytics",   desc: "Revenue charts, top products, customer insights — all in one dashboard." },
  { icon: Palette,    title: "Store Customization",   desc: "Fonts, colors, layouts, SEO — full control without touching a single line of code." },
  { icon: Shield,     title: "Coupon Engine",         desc: "Create percentage or fixed discounts, set expiry dates and usage limits." },
  { icon: TrendingUp, title: "Sales Reports",         desc: "Export CSV reports for orders, products and customers. Know your numbers." },
];

const testimonials = [
  { name: "Adaeze Okonkwo",  role: "Fashion Store Owner",     avatar: "AO", text: "I launched my store in 20 minutes. DropOS handles everything — payments, shipping, analytics. Revenue doubled in 3 months.", stars: 5 },
  { name: "Tunde Adekunle",  role: "Electronics Dropshipper", avatar: "TA", text: "The multi-payment gateway support is a game changer. My customers in Nigeria pay with Paystack, international ones use Stripe.", stars: 5 },
  { name: "Chioma Eze",      role: "Beauty Products CEO",     avatar: "CE", text: "The storefront templates are gorgeous. My customers think I spent a fortune on a developer. They have no idea.", stars: 5 },
];

const steps = [
  { n: "01", title: "Create your store",  desc: "Sign up, pick a template, add your brand colors. Live in minutes." },
  { n: "02", title: "Add your products",  desc: "Import from a spreadsheet or add manually. Set prices, variants, inventory." },
  { n: "03", title: "Start selling",      desc: "Share your store link, accept payments worldwide, watch the orders roll in." },
];

export default function HomePage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -80]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <>
      <Grain />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(196,168,76,0.07) 0%, transparent 70%)" }} />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)" }} />
          <div className="absolute inset-0"
            style={{
              backgroundImage: "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }} />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-32">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-8"
            style={{ border: "1px solid rgba(180,130,30,0.3)", background: "rgba(196,168,76,0.08)", color: "#92650a" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#c9a84c" }} />
            Now in public beta — free to start
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-6">
            <span className="block" style={{ color: "var(--text-primary)" }}>Launch your</span>
            <span className="block" style={{ background: "linear-gradient(135deg, #b8860b, #d4a017, #b8860b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              dropshipping empire
            </span>
            <span className="block text-4xl md:text-5xl lg:text-6xl font-light mt-2" style={{ color: "var(--text-tertiary)" }}>
              in minutes, not months.
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
            style={{ color: "var(--text-secondary)" }}>
            DropOS gives you everything — a stunning storefront, multi-currency payments, smart shipping, and powerful analytics. One platform. Zero complexity.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/auth/register"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-black transition-all hover:-translate-y-0.5 text-base"
              style={{ background: "#c9a84c", boxShadow: "0 8px 24px rgba(180,130,20,0.3)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#d4b056"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#c9a84c"; }}>
              Start for free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/features"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all text-base"
              style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}>
              <Play size={14} className="fill-current" /> See how it works
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm"
            style={{ color: "var(--text-tertiary)" }}>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["E","T","A","C","M"].map((l, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white"
                    style={{ borderColor: "var(--bg-base)", background: ["#7c3aed","#c9a84c","#10b981","#ef4444","#3b82f6"][i] }}>{l}</div>
                ))}
              </div>
              <span>Trusted by <strong style={{ color: "var(--text-primary)" }}>2,400+</strong> stores</span>
            </div>
            <div className="hidden sm:block w-px h-4" style={{ background: "var(--border)" }} />
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} style={{ fill: "#c9a84c", color: "#c9a84c" }} />)}
              <span className="ml-1"><strong style={{ color: "var(--text-primary)" }}>4.9</strong> / 5 rating</span>
            </div>
            <div className="hidden sm:block w-px h-4" style={{ background: "var(--border)" }} />
            <span>No credit card required</span>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: "var(--text-disabled)" }}>
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-8"
            style={{ background: "linear-gradient(to bottom, var(--text-disabled), transparent)" }} />
        </motion.div>
      </section>

      {/* STATS */}
      <section className="py-16" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 2400,  suffix: "+",    label: "Active stores" },
              { value: 48000, suffix: "+",    label: "Orders processed" },
              { value: 99,    suffix: ".9%",  label: "Uptime SLA" },
              { value: 3,     suffix: " min", label: "Avg. setup time" },
            ].map((s, i) => (
              <FadeUp key={i} delay={i * 0.1} className="text-center">
                <div className="text-3xl md:text-4xl font-black mb-1" style={{ color: "#b8860b" }}>
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm" style={{ color: "var(--text-tertiary)" }}>{s.label}</div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#b8860b" }}>How it works</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 tracking-tight" style={{ color: "var(--text-primary)" }}>Three steps to live</h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: "var(--text-tertiary)" }}>No technical skills required. No developers needed. Just you and your vision.</p>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px"
              style={{ background: "linear-gradient(to right, transparent, rgba(196,168,76,0.3), transparent)" }} />
            {steps.map((s, i) => (
              <FadeUp key={i} delay={i * 0.15}>
                <div className="relative p-8 rounded-3xl transition-all group cursor-default h-full"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,168,76,0.4)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>
                  <div className="text-6xl font-black absolute top-4 right-6 leading-none select-none"
                    style={{ color: "var(--border-strong)" }}>{s.n}</div>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(184,134,11,0.1)" }}>
                    <span className="font-black text-sm" style={{ color: "#b8860b" }}>{s.n}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-24 md:py-32" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#b8860b" }}>Everything you need</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 tracking-tight" style={{ color: "var(--text-primary)" }}>Built for serious sellers</h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: "var(--text-tertiary)" }}>Every feature you need to run a professional dropshipping business. Nothing you don't.</p>
          </FadeUp>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <FadeUp key={i} delay={i * 0.06}>
                <div className="p-6 rounded-2xl transition-all cursor-default h-full"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,168,76,0.35)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-card)"; }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(184,134,11,0.1)" }}>
                    <f.icon size={18} style={{ color: "#b8860b" }} />
                  </div>
                  <h3 className="font-bold text-sm mb-1.5" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp className="text-center mt-10">
            <Link href="/features" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: "#b8860b" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#d4a017"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#b8860b"; }}>
              See all features <ChevronRight size={14} />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 md:py-32" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#b8860b" }}>Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 tracking-tight" style={{ color: "var(--text-primary)" }}>Sellers love DropOS</h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="p-8 rounded-3xl transition-all flex flex-col gap-4 h-full"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,168,76,0.35)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, j) => <Star key={j} size={13} style={{ fill: "#c9a84c", color: "#c9a84c" }} />)}
                  </div>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--text-secondary)" }}>"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#7c3aed,#c9a84c)" }}>{t.avatar}</div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{t.name}</div>
                      <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="py-24 md:py-32" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#b8860b" }}>Pricing</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 tracking-tight" style={{ color: "var(--text-primary)" }}>Start free. Scale fast.</h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: "var(--text-tertiary)" }}>No hidden fees. Cancel anytime.</p>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: "Starter",  price: "Free", desc: "Perfect to launch",    features: ["1 store","10 products","Basic templates","Community support"],                          cta: "Start free",    highlight: false },
              { name: "Pro",      price: "$29",  desc: "For growing sellers",   features: ["3 stores","Unlimited products","8 premium templates","Priority support","Custom domain"], cta: "Go Pro",        highlight: true  },
              { name: "Advanced", price: "$79",  desc: "For serious operators", features: ["10 stores","Unlimited everything","12 exclusive templates","Dedicated support","API access"], cta: "Go Advanced", highlight: false },
            ].map((p, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="p-8 rounded-3xl flex flex-col gap-5 relative overflow-hidden transition-all h-full"
                  style={p.highlight ? {
                    border: "1px solid rgba(196,168,76,0.5)",
                    background: "rgba(196,168,76,0.04)",
                  } : {
                    border: "1px solid var(--border)",
                    background: "var(--bg-card)",
                  }}>
                  {p.highlight && (
                    <div className="absolute top-0 left-0 right-0 h-px"
                      style={{ background: "linear-gradient(to right, transparent, #c9a84c, transparent)" }} />
                  )}
                  {p.highlight && (
                    <span className="absolute top-4 right-4 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ background: "#c9a84c", color: "#000" }}>Popular</span>
                  )}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-tertiary)" }}>{p.name}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black" style={{ color: p.highlight ? "#b8860b" : "var(--text-primary)" }}>{p.price}</span>
                      {p.price !== "Free" && <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>/mo</span>}
                    </div>
                    <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>{p.desc}</p>
                  </div>
                  <ul className="space-y-2.5 flex-1">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <CheckCircle size={13} style={{ color: p.highlight ? "#b8860b" : "var(--text-tertiary)" }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register"
                    className="py-3 rounded-xl text-sm font-bold text-center transition-all block"
                    style={p.highlight ? { background: "#c9a84c", color: "#000" } : { border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                    onMouseEnter={e => {
                      if (p.highlight) (e.currentTarget as HTMLElement).style.background = "#d4b056";
                      else { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }
                    }}
                    onMouseLeave={e => {
                      if (p.highlight) (e.currentTarget as HTMLElement).style.background = "#c9a84c";
                      else { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }
                    }}>
                    {p.cta}
                  </Link>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp className="text-center mt-8">
            <Link href="/pricing" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: "#b8860b" }}>
              See full pricing comparison <ChevronRight size={14} />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-24 md:py-32" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeUp>
            <div className="relative p-12 md:p-16 rounded-3xl overflow-hidden"
              style={{ border: "1px solid rgba(196,168,76,0.3)", background: "var(--bg-card)" }}>
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(to right, transparent, rgba(196,168,76,0.6), transparent)" }} />
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at top, rgba(196,168,76,0.05) 0%, transparent 65%)" }} />
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }} />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4"
                  style={{ color: "var(--text-primary)" }}>
                  Your store.<br />
                  <span style={{ background: "linear-gradient(135deg,#b8860b,#d4a017)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Ready in minutes.
                  </span>
                </h2>
                <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
                  Join 2,400+ entrepreneurs who chose DropOS to build their business.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/auth/register"
                    className="group flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-black transition-all hover:-translate-y-0.5 text-base"
                    style={{ background: "#c9a84c", boxShadow: "0 8px 24px rgba(180,130,20,0.3)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#d4b056"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#c9a84c"; }}>
                    Start for free — no credit card
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
