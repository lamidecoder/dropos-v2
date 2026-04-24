"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Free", price: "Free", period: "",
    desc: "Start selling today. No credit card required.",
    color: "var(--text-secondary)", featured: false, cta: "Start free", href: "/auth/register",
    features: ["1 store","Up to 10 products","KIRO basic chat","Paystack checkout","2% transaction fee","Community support"],
  },
  {
    name: "Growth", price: "9,500", period: "/mo",
    desc: "For serious sellers ready to scale.",
    color: "var(--violet-400)", featured: true, cta: "Start Growth", href: "/auth/register?plan=growth",
    features: ["3 stores","Unlimited products","KIRO full actions","Abandoned cart recovery","Flash sales & coupons","Analytics dashboard","1% transaction fee","Priority support"],
  },
  {
    name: "Pro", price: "25,000", period: "/mo",
    desc: "For high-volume stores and agencies.",
    color: "#C026D3", featured: false, cta: "Start Pro", href: "/auth/register?plan=pro",
    features: ["Unlimited stores","Unlimited products","KIRO extended thinking","KIRO vision","Custom domain","Affiliate programme","API access","0.5% transaction fee","Dedicated support"],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <section className="pt-40 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(107,53,232,0.08) 0%, transparent 70%)" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(107,53,232,0.12)", color: "var(--violet-400)", border: "1px solid rgba(107,53,232,0.2)" }}>
            Pricing
          </span>
          <h1 className="text-5xl font-black tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>Simple, honest pricing</h1>
          <p className="text-xl" style={{ color: "var(--text-secondary)" }}>Start free. Upgrade when you are ready to scale.</p>
        </motion.div>
      </section>
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-3xl p-8 flex flex-col relative"
              style={{ background: plan.featured ? "rgba(107,53,232,0.08)" : "var(--bg-card)", border: plan.featured ? "2px solid var(--violet-500)" : "1px solid var(--border)" }}>
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold tracking-widest uppercase px-4 py-1 rounded-full text-white" style={{ background: "var(--violet-500)" }}>
                  Most popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-sm font-bold tracking-widest uppercase mb-2" style={{ color: plan.color }}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  {plan.price !== "Free" && <span className="text-xl font-bold" style={{ color: "var(--text-secondary)" }}>N</span>}
                  <span className="text-4xl font-black" style={{ color: "var(--text-primary)" }}>{plan.price}</span>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{plan.period}</span>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{plan.desc}</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: plan.color }} />{f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className="block text-center py-3.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
                style={plan.featured ? { background: "var(--violet-500)", color: "#fff" } : { background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
