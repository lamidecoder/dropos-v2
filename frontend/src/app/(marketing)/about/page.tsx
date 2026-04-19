"use client";
import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Heart, Zap, Globe, Shield } from "lucide-react";

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

const values = [
  { icon: Zap,    title: "Speed first",      desc: "We obsess over performance. Every millisecond matters for your customers." },
  { icon: Heart,  title: "Seller focused",   desc: "Every feature is built by listening to real sellers with real problems." },
  { icon: Globe,  title: "Built for Africa", desc: "Designed from the ground up for African entrepreneurs and payment methods." },
  { icon: Shield, title: "You own it",       desc: "Your store, your data, your customers. We just power the platform." },
];

const team = [
  { name: "Emeka Okafor",   role: "Founder & CEO",      initials: "EO", color: "#c9a84c" },
  { name: "Amaka Nwosu",    role: "Head of Product",     initials: "AN", color: "#7c3aed" },
  { name: "Tunde Alabi",    role: "Lead Engineer",       initials: "TA", color: "#10b981" },
  { name: "Chidinma Eze",   role: "Head of Design",      initials: "CE", color: "#ef4444" },
  { name: "Bayo Adeyemi",   role: "Head of Growth",      initials: "BA", color: "#3b82f6" },
  { name: "Ngozi Obi",      role: "Customer Success",    initials: "NO", color: "#f59e0b" },
];

export default function AboutPage() {
  return (
      {/* Hero */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(196,168,76,0.05) 0%, transparent 70%)" }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">About DropOS</span>
            <h1 className="text-5xl md:text-7xl font-black text-[var(--text-primary)] tracking-tight leading-tight mt-4 mb-6">
              We're building the future of{" "}
              <span style={{ background: "linear-gradient(135deg,#c9a84c,#f0c040)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                African commerce
              </span>
            </h1>
            <p className="text-[var(--text-secondary)] text-xl leading-relaxed max-w-2xl mx-auto">
              DropOS was born from a simple frustration — it was too hard for African entrepreneurs to launch world-class online stores. We fixed that.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Our story</span>
              <h2 className="text-4xl font-black text-[var(--text-primary)] mt-3 mb-6 tracking-tight leading-tight">
                Started in Lagos.<br />Built for the world.
              </h2>
              <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                <p>In 2023, our founder Emeka spent 6 months trying to launch a dropshipping store. He dealt with terrible UX, broken payment integrations, and platforms that didn't understand African payment methods.</p>
                <p>He built DropOS for himself first. Then his friends wanted it. Then strangers started asking. Within 6 months, 500 stores were live.</p>
                <p>Today DropOS powers over 2,400 stores across Nigeria, Ghana, Kenya, and beyond — processing millions in transactions every month.</p>
              </div>
            </FadeUp>
            <FadeUp delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Founded",         value: "2023" },
                  { label: "Active stores",   value: "2,400+" },
                  { label: "Countries",       value: "14" },
                  { label: "Orders/month",    value: "48K+" },
                ].map((s, i) => (
                  <div key={i} className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
                    <div className="text-3xl font-black text-amber-400 mb-1">{s.value}</div>
                    <div className="text-[var(--text-tertiary)] text-sm">{s.label}</div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Our values</span>
            <h2 className="text-4xl font-black text-[var(--text-primary)] mt-3 tracking-tight">What we stand for</h2>
          </FadeUp>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="p-8 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-amber-400/20 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center mb-5 group-hover:bg-amber-400/15 transition-colors">
                    <v.icon size={20} className="text-amber-400" />
                  </div>
                  <h3 className="text-[var(--text-primary)] font-bold text-lg mb-2">{v.title}</h3>
                  <p className="text-[var(--text-tertiary)] text-sm leading-relaxed">{v.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">The team</span>
            <h2 className="text-4xl font-black text-[var(--text-primary)] mt-3 tracking-tight">The people behind DropOS</h2>
            <p className="text-[var(--text-tertiary)] mt-4 max-w-lg mx-auto">A small, obsessed team building the best commerce platform on the continent.</p>
          </FadeUp>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {team.map((m, i) => (
              <FadeUp key={i} delay={i * 0.07} className="text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-[var(--text-primary)] mx-auto mb-3"
                  style={{ background: `linear-gradient(135deg, ${m.color}33, ${m.color}66)`, border: `1px solid ${m.color}33` }}>
                  {m.initials}
                </div>
                <div className="text-[var(--text-primary)] font-semibold text-sm">{m.name}</div>
                <div className="text-[var(--text-tertiary)] text-xs mt-0.5">{m.role}</div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <FadeUp>
            <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tight mb-4">Join our journey</h2>
            <p className="text-[var(--text-tertiary)] mb-8">Be part of the fastest-growing commerce platform in Africa.</p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/auth/register"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-black bg-amber-400 hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/20">
                Get started free <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="px-8 py-4 rounded-2xl font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all">
                Talk to us
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
  );
}
