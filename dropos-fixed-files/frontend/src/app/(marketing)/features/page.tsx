"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, BarChart3, Globe, ShoppingCart, Shield, Truck, Tag, Users } from "lucide-react";

const FEATURES = [
  { icon: Zap,          title: "KIRO AI Co-pilot",        desc: "Your AI business partner that builds your store, finds products, fulfils orders, and grows revenue — automatically." },
  { icon: ShoppingCart, title: "One-click store setup",   desc: "Tell KIRO what you want to sell. Your store is live in 60 seconds. No design skills required." },
  { icon: BarChart3,    title: "Real-time analytics",     desc: "Revenue charts, conversion funnels, and product performance — all updated live as orders come in." },
  { icon: Globe,        title: "Global payments",         desc: "Paystack for Nigeria and Africa. Stripe for the world. Accept any currency, from anywhere." },
  { icon: Truck,        title: "Automated fulfilment",    desc: "Connect AliExpress and CJDropshipping. KIRO places orders with suppliers the moment a customer pays." },
  { icon: Tag,          title: "Smart promotions",        desc: "Flash sales, coupons, abandoned cart recovery, and volume discounts — KIRO runs them for you." },
  { icon: Shield,       title: "Enterprise security",     desc: "End-to-end encryption, rate limiting, 2FA, and automatic fraud detection on every transaction." },
  { icon: Users,        title: "Affiliate programme",     desc: "Turn your customers into a sales team. KIRO tracks referrals and pays commissions automatically." },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Hero */}
      <section className="pt-40 pb-24 px-6 text-center relative overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(107,53,232,0.08) 0%, transparent 70%)" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <span className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(107,53,232,0.12)", color: "var(--violet-400)", border: "1px solid rgba(107,53,232,0.2)" }}>
            Everything you need
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6" style={{ color: "var(--text-primary)" }}>
            Every tool your store needs.<br />
            <span style={{ color: "var(--violet-500)" }}>Run by AI.</span>
          </h1>
          <p className="text-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Stop stitching together 10 different apps. DropOS gives you everything in one place, powered by KIRO — your AI that actually takes action.
          </p>
        </motion.div>
      </section>

      {/* Features grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-6"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(107,53,232,0.12)" }}>
                <f.icon size={18} style={{ color: "var(--violet-400)" }} />
              </div>
              <h3 className="font-bold mb-2 text-sm" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black tracking-tight mb-6" style={{ color: "var(--text-primary)" }}>
            Start building your store today
          </h2>
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all hover:opacity-90"
            style={{ background: "var(--violet-500)" }}>
            Get started free
          </Link>
        </div>
      </section>
    </div>
  );
}
