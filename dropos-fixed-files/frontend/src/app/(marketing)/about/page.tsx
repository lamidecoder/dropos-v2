"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
  const team = [
    { name: "Olamide", role: "Co-founder & CTO", bio: "Builds everything technical. Full-stack engineer obsessed with AI and developer experience." },
    { name: "Tobi Bamidele", role: "Co-founder & CEO", bio: "Drives growth and partnerships. Former operator who understands commerce from the ground up." },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Hero */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(107,53,232,0.08) 0%, transparent 70%)" }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6"
              style={{ background: "rgba(107,53,232,0.12)", color: "var(--violet-400)", border: "1px solid rgba(107,53,232,0.2)" }}>
              Our Story
            </span>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6"
              style={{ color: "var(--text-primary)" }}>
              Built for the next generation<br />
              <span style={{ color: "var(--violet-500)" }}>of commerce</span>
            </h1>
            <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              DropOS started with a simple frustration — running an online store required too many tools, too much manual work, and too much expertise. We decided to fix that.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-12 text-center"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <h2 className="text-3xl font-black tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
              Our mission
            </h2>
            <p className="text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              To give every entrepreneur on the planet an AI-powered business partner that builds their store, finds winning products, and grows their revenue — automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black tracking-tight text-center mb-16" style={{ color: "var(--text-primary)" }}>
            The team
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {team.map((member) => (
              <div key={member.name} className="rounded-3xl p-8"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black mb-6"
                  style={{ background: "rgba(107,53,232,0.15)", color: "var(--violet-400)" }}>
                  {member.name[0]}
                </div>
                <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{member.name}</h3>
                <p className="text-sm font-medium mb-4" style={{ color: "var(--violet-400)" }}>{member.role}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black tracking-tight mb-6" style={{ color: "var(--text-primary)" }}>
            Ready to start?
          </h2>
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all hover:opacity-90"
            style={{ background: "var(--violet-500)" }}>
            Create your free store
          </Link>
        </div>
      </section>
    </div>
  );
}
