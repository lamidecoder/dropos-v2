"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { CheckCircle, X, ArrowRight, Zap } from "lucide-react";

function FadeUp({ children, delay = 0, className = "" }: any) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const plans = [
  {
    name: "Starter", price: { monthly: 0, yearly: 0 }, desc: "Launch your first store",
    color: "#ffffff",
    features: {
      "Stores": "1", "Products": "10", "Orders/month": "50",
      "Store templates": "2 free", "Custom domain": false,
      "Analytics": "Basic", "Support": "Community",
      "CSV export": false, "Coupons": true, "Reviews": true,
      "API access": false,
    },
  },
  {
    name: "Pro", price: { monthly: 29, yearly: 23 }, desc: "For growing businesses",
    color: "#c9a84c", popular: true,
    features: {
      "Stores": "3", "Products": "Unlimited", "Orders/month": "500",
      "Store templates": "8 premium", "Custom domain": true,
      "Analytics": "Advanced", "Support": "Priority email",
      "CSV export": true, "Coupons": true, "Reviews": true,
      "API access": false,
    },
  },
  {
    name: "Advanced", price: { monthly: 79, yearly: 63 }, desc: "For serious operators",
    color: "#7c3aed",
    features: {
      "Stores": "10", "Products": "Unlimited", "Orders/month": "Unlimited",
      "Store templates": "12 exclusive", "Custom domain": true,
      "Analytics": "Full + export", "Support": "Dedicated manager",
      "CSV export": true, "Coupons": true, "Reviews": true,
      "API access": true,
    },
  },
];

const faqs = [
  { q: "Can I switch plans anytime?",          a: "Yes. Upgrade or downgrade at any time. Changes take effect immediately." },
  { q: "Is there a free trial?",               a: "The Starter plan is free forever. Paid plans include a 14-day free trial." },
  { q: "What payment methods do you accept?",  a: "We accept all major cards via Stripe, and Paystack for Nigerian cards." },
  { q: "Do you charge transaction fees?",      a: "DropOS charges a 10% platform fee on orders. Your payment gateway may charge additional fees." },
  { q: "Can I use my own domain?",             a: "Yes, on Pro and Advanced plans. Point your domain DNS to DropOS and you're live." },
  { q: "What happens if I exceed my limits?",  a: "We'll notify you and pause new orders until you upgrade. No surprise charges." },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
      <>
      {/* Hero */}
      <section className="pt-40 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(196,168,76,0.05) 0%, transparent 70%)" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 max-w-2xl mx-auto">
          <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Pricing</span>
          <h1 className="text-5xl md:text-6xl font-black text-[var(--text-primary)] tracking-tight mt-4 mb-6">
            Simple,{" "}
            <span style={{ background: "linear-gradient(135deg,#c9a84c,#f0c040)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              honest pricing
            </span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg mb-8">Start free. Pay only when you're ready to scale.</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
            <button onClick={() => setYearly(false)} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${!yearly ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}>Monthly</button>
            <button onClick={() => setYearly(true)}  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${yearly ? "bg-amber-400/20 text-amber-400" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}>
              Yearly <span className="text-[10px] font-black bg-amber-400 text-black px-1.5 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* Plans */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <div className={`relative p-8 rounded-3xl border flex flex-col gap-6 h-full transition-all ${
                p.popular ? "border-amber-400/40 bg-amber-400/5" : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border)]"
              }`}>
                {p.popular && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />}
                {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black text-black bg-amber-400 px-3 py-1 rounded-full uppercase tracking-wider">Most popular</span>}

                <div>
                  <div className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest mb-1">{p.name}</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-5xl font-black" style={{ color: p.popular ? "#c9a84c" : "white" }}>
                      {p.price.monthly === 0 ? "Free" : `$${yearly ? p.price.yearly : p.price.monthly}`}
                    </span>
                    {p.price.monthly > 0 && <span className="text-[var(--text-tertiary)] text-sm">/mo</span>}
                  </div>
                  {yearly && p.price.monthly > 0 && <div className="text-[var(--text-tertiary)] text-xs">Billed ${p.price.yearly * 12}/year</div>}
                  <p className="text-[var(--text-tertiary)] text-sm mt-2">{p.desc}</p>
                </div>

                <ul className="space-y-3 flex-1">
                  {Object.entries(p.features).map(([key, val]) => (
                    <li key={key} className="flex items-center justify-between gap-2">
                      <span className="text-[var(--text-tertiary)] text-sm">{key}</span>
                      {typeof val === "boolean" ? (
                        val ? <CheckCircle size={14} className="text-amber-400 flex-shrink-0" /> : <X size={14} className="text-[var(--text-disabled)] flex-shrink-0" />
                      ) : (
                        <span className="text-[var(--text-primary)] text-sm font-semibold">{val}</span>
                      )}
                    </li>
                  ))}
                </ul>

                <Link href="/auth/register"
                  className={`py-3.5 rounded-xl text-sm font-bold text-center transition-all ${
                    p.popular
                      ? "bg-amber-400 text-black hover:bg-amber-300 shadow-lg shadow-amber-400/20"
                      : "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  }`}>
                  {p.price.monthly === 0 ? "Start for free" : `Get ${p.name}`} →
                </Link>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6">
          <FadeUp className="text-center mb-12">
            <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">FAQ</span>
            <h2 className="text-4xl font-black text-[var(--text-primary)] mt-3 tracking-tight">Frequently asked questions</h2>
          </FadeUp>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <FadeUp key={i} delay={i * 0.05}>
                <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border)] transition-all">
                  <h3 className="text-[var(--text-primary)] font-bold mb-2">{f.q}</h3>
                  <p className="text-[var(--text-tertiary)] text-sm leading-relaxed">{f.a}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-[var(--border)]">
        <div className="max-w-xl mx-auto px-6 text-center">
          <FadeUp>
            <h2 className="text-3xl font-black text-[var(--text-primary)] mb-4">Still have questions?</h2>
            <p className="text-[var(--text-tertiary)] mb-6">Our team is here to help. No sales pressure, just honest answers.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 transition-all">
              Talk to us <ArrowRight size={14} />
            </Link>
          </FadeUp>
        </div>
      </section>
  </>

  );
}
