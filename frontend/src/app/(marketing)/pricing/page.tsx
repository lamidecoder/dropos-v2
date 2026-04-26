"use client";
import { useState } from "react";
import Link from "next/link";
import { Zap, Check, ArrowRight, X } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: { ngn: "₦0", gbp: "£0", usd: "$0" },
    period: "/month",
    color: "#6B7280",
    desc: "Try it. No card needed.",
    features: [
      { text: "1 store",                     ok: true  },
      { text: "20 products",                  ok: true  },
      { text: "KIRO — 10 messages/day",       ok: true  },
      { text: "Basic analytics",              ok: true  },
      { text: "Paystack payments",            ok: true  },
      { text: "2% transaction fee",           ok: false },
      { text: "Custom domain",                ok: false },
      { text: "Remove DropOS branding",       ok: false },
      { text: "Email campaigns",              ok: false },
      { text: "WhatsApp commerce bot",        ok: false },
    ],
    cta: "Start free",
    href: "/auth/register",
  },
  {
    name: "Growth",
    price: { ngn: "₦9,500", gbp: "£12", usd: "$15" },
    period: "/month",
    color: "#8B5CF6",
    desc: "For serious sellers.",
    popular: true,
    trial: "14-day free trial",
    features: [
      { text: "1 store",                          ok: true },
      { text: "Unlimited products",               ok: true },
      { text: "Full KIRO — unlimited chat",       ok: true },
      { text: "Full analytics",                   ok: true },
      { text: "Paystack + Stripe",                ok: true },
      { text: "0% transaction fee",               ok: true },
      { text: "Custom domain",                    ok: true },
      { text: "Remove DropOS branding",           ok: true },
      { text: "Coupons, flash sales, gift cards", ok: true },
      { text: "Abandoned cart recovery",          ok: true },
    ],
    cta: "Start 14-day trial",
    href: "/auth/register",
  },
  {
    name: "Pro",
    price: { ngn: "₦25,000", gbp: "£35", usd: "$45" },
    period: "/month",
    color: "#F59E0B",
    desc: "Fully automated business.",
    features: [
      { text: "Unlimited stores",                 ok: true },
      { text: "Everything in Growth",             ok: true },
      { text: "KIRO Pro intelligence",            ok: true },
      { text: "WhatsApp commerce bot",            ok: true },
      { text: "Email campaigns",                  ok: true },
      { text: "Loyalty programme",                ok: true },
      { text: "3 staff accounts",                 ok: true },
      { text: "API access",                       ok: true },
      { text: "Priority support (2hr)",           ok: true },
      { text: "20% referral commissions",         ok: true },
    ],
    cta: "Start Pro",
    href: "/auth/register",
  },
];

const FAQ = [
  { q: "Can I switch plans anytime?", a: "Yes. Upgrade or downgrade any time. If you downgrade, you keep your current plan until the end of the billing period." },
  { q: "What happens when I hit the free plan limits?", a: "KIRO will let you know and suggest upgrading. Your store stays live — you just can't add more products until you upgrade." },
  { q: "Is there a setup fee?", a: "Never. DropOS is free to start. We only make money when you grow." },
  { q: "What payment methods do you accept for subscriptions?", a: "We accept all major cards via Paystack (Nigeria) and Stripe (international). Bank transfer available for annual plans." },
  { q: "Do you offer refunds?", a: "Yes. If you're not happy in the first 30 days, we refund you. No questions asked." },
  { q: "What's included in KIRO Pro?", a: "Market research, competitor price monitoring, TikTok trend detection, product intelligence, revenue forecasting, and daily briefings via WhatsApp." },
];

export default function PricingPage() {
  const [currency, setCurrency] = useState<"usd"|"gbp"|"ngn">("usd");
  const [billing,  setBilling]  = useState<"monthly"|"annual">("monthly");

  return (
    <div style={{ background: "#07050F", color: "#fff", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      <nav className="sticky top-0 z-50 px-6 h-16 flex items-center justify-between" style={{ background: "rgba(7,5,15,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
            <Zap size={13} color="white" />
          </div>
          <span className="font-black text-white">Drop<span style={{ color: "#8B5CF6" }}>OS</span></span>
        </Link>
        <Link href="/auth/register">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>Start free <ArrowRight size={13} /></button>
        </Link>
      </nav>

      <div className="text-center px-6 py-16">
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#8B5CF6" }}>Pricing</p>
        <h1 className="font-black text-4xl sm:text-6xl mb-4" style={{ letterSpacing: "-2.5px" }}>
          Simple pricing.<br />No surprises.
        </h1>
        <p className="text-base mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>Start free. Upgrade when you're making money.</p>

        {/* Toggles */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="inline-flex p-1 rounded-xl gap-1" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {(["usd","gbp","ngn"] as const).map(c => (
              <button key={c} onClick={() => setCurrency(c)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all"
                style={{ background: currency===c?"rgba(107,53,232,0.4)":"transparent", color: currency===c?"#fff":"rgba(255,255,255,0.4)", border: "none", cursor: "pointer" }}>
                {c==="usd"?"$ USD":c==="gbp"?"£ GBP":"₦ NGN"}
              </button>
            ))}
          </div>
          <div className="inline-flex p-1 rounded-xl gap-1" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {(["monthly","annual"] as const).map(b => (
              <button key={b} onClick={() => setBilling(b)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
                style={{ background: billing===b?"rgba(107,53,232,0.4)":"transparent", color: billing===b?"#fff":"rgba(255,255,255,0.4)", border: "none", cursor: "pointer" }}>
                {b}{b==="annual"?" (2 months free)":""}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-5 pb-20">
        {PLANS.map(plan => (
          <div key={plan.name} className="p-6 rounded-2xl relative flex flex-col"
            style={{ background: plan.popular?"rgba(107,53,232,0.1)":"rgba(255,255,255,0.03)", border: `1px solid ${plan.popular?"rgba(107,53,232,0.4)":"rgba(255,255,255,0.07)"}` }}>
            {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black text-white" style={{ background: "#6B35E8" }}>MOST POPULAR</div>}
            <div className="mb-5">
              <h2 className="font-black text-lg text-white mb-1">{plan.name}</h2>
              <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>{plan.desc}</p>
              <div className="flex items-baseline gap-1">
                <span className="font-black text-3xl text-white">{billing==="annual" ? (plan.price[currency]==="₦0"||plan.price[currency]==="£0"||plan.price[currency]==="$0" ? plan.price[currency] : plan.price[currency]) : plan.price[currency]}</span>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>{plan.period}</span>
              </div>
              {billing==="annual" && plan.name!=="Free" && <p className="text-xs mt-1" style={{ color: "#10B981" }}>2 months free on annual billing</p>}
              {plan.trial && <p className="text-xs mt-1" style={{ color: plan.color }}>{plan.trial}</p>}
            </div>
            <div className="space-y-2.5 mb-6 flex-1">
              {plan.features.map(f => (
                <div key={f.text} className="flex items-center gap-2.5">
                  {f.ok
                    ? <Check size={13} style={{ color: plan.color, flexShrink: 0 }} strokeWidth={3} />
                    : <X size={13} style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                  }
                  <span className="text-sm" style={{ color: f.ok?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.3)" }}>{f.text}</span>
                </div>
              ))}
            </div>
            <Link href={plan.href}>
              <button className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                style={plan.popular ? { background:`linear-gradient(135deg,#6B35E8,#3D1C8A)`, color:"#fff", border:"none", cursor:"pointer" } : { background:"transparent", color:"rgba(255,255,255,0.7)", border:"1px solid rgba(255,255,255,0.15)", cursor:"pointer" }}>
                {plan.cta}
              </button>
            </Link>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="font-black text-2xl sm:text-3xl text-center mb-10" style={{ letterSpacing: "-1px" }}>Common questions</h2>
        <div className="space-y-4">
          {FAQ.map(item => (
            <div key={item.q} className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 className="font-bold text-sm text-white mb-2">{item.q}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
