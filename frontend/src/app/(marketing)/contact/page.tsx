"use client";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, MessageSquare, Twitter, Send, CheckCircle } from "lucide-react";

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

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => setSent(true), 600);
  };

  const inp = "w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-disabled)] outline-none focus:border-amber-400/40 focus:bg-[var(--bg-elevated)] transition-all text-sm";

  return (
    <>
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(196,168,76,0.05) 0%, transparent 70%)" }} />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Contact</span>
            <h1 className="text-5xl md:text-6xl font-black text-[var(--text-primary)] tracking-tight mt-4 mb-4">
              Let's{" "}
              <span style={{ background: "linear-gradient(135deg,#c9a84c,#f0c040)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                talk
              </span>
            </h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">Questions, feedback, partnership — we read everything and respond fast.</p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-8 items-start">
            {/* Info */}
            <FadeUp className="md:col-span-2 space-y-4">
              {[
                { icon: Mail,          title: "Email us",        value: "hello@dropos.io",       sub: "We reply within 24 hours" },
                { icon: MessageSquare, title: "Live chat",        value: "Available in dashboard", sub: "Mon–Fri, 9am–6pm WAT" },
                { icon: Twitter,       title: "Twitter / X",     value: "@DropOS_app",            sub: "Fastest for quick questions" },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-4 p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-amber-400/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                    <c.icon size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <div className="text-[var(--text-tertiary)] text-xs font-semibold uppercase tracking-wider mb-0.5">{c.title}</div>
                    <div className="text-[var(--text-primary)] font-semibold text-sm">{c.value}</div>
                    <div className="text-[var(--text-tertiary)] text-xs mt-0.5">{c.sub}</div>
                  </div>
                </div>
              ))}
            </FadeUp>

            {/* Form */}
            <FadeUp delay={0.1} className="md:col-span-3">
              <div className="p-8 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)]">
                {sent ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-amber-400/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={28} className="text-amber-400" />
                    </div>
                    <h3 className="text-[var(--text-primary)] text-xl font-black mb-2">Message sent!</h3>
                    <p className="text-[var(--text-tertiary)] text-sm">We'll get back to you within 24 hours.</p>
                    <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                      className="mt-6 text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors">
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[var(--text-tertiary)] text-xs font-semibold uppercase tracking-wider block mb-1.5">Name</label>
                        <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                          placeholder="Your name" className={inp} />
                      </div>
                      <div>
                        <label className="text-[var(--text-tertiary)] text-xs font-semibold uppercase tracking-wider block mb-1.5">Email</label>
                        <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                          placeholder="you@example.com" className={inp} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[var(--text-tertiary)] text-xs font-semibold uppercase tracking-wider block mb-1.5">Subject</label>
                      <input required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                        placeholder="How can we help?" className={inp} />
                    </div>
                    <div>
                      <label className="text-[var(--text-tertiary)] text-xs font-semibold uppercase tracking-wider block mb-1.5">Message</label>
                      <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                        placeholder="Tell us everything…" className={`${inp} resize-none`} />
                    </div>
                    <button type="submit"
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-black bg-amber-400 hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/20">
                      Send message <Send size={14} />
                    </button>
                  </form>
                )}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
    </>
  );
}
