"use client";
import { useState } from "react";
import Link from "next/link";
import { Zap, Mail, MessageSquare, ArrowRight, Check, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api";

export default function ContactPage() {
  const [form, setForm]   = useState({ name: "", email: "", subject: "general", message: "" });
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setStatus("loading");
    try {
      await fetch(`${API}/contact`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const inp = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/60 transition-all";

  return (
    <div style={{ background: "#07050F", color: "#fff", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>
<div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#8B5CF6" }}>Contact</p>
          <h1 className="font-black text-4xl sm:text-5xl mb-4" style={{ letterSpacing: "-2px" }}>Get in touch</h1>
          <p className="text-base" style={{ color: "rgba(255,255,255,0.4)" }}>We reply within 24 hours. For urgent issues, message KIRO in your dashboard.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {/* Contact options */}
          <div className="space-y-4">
            {[
              { icon: MessageSquare, label: "General questions", desc: "Product, pricing, plans", color: "#8B5CF6" },
              { icon: Zap,           label: "Technical support", desc: "Bugs, errors, help",       color: "#06B6D4" },
              { icon: Mail,          label: "Enterprise",        desc: "Custom plans, API access", color: "#10B981" },
            ].map(c => (
              <div key={c.label} className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${c.color}15` }}>
                  <c.icon size={16} style={{ color: c.color }} />
                </div>
                <h3 className="font-bold text-sm text-white mb-1">{c.label}</h3>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{c.desc}</p>
              </div>
            ))}
            <div className="p-4 rounded-2xl" style={{ background: "rgba(107,53,232,0.08)", border: "1px solid rgba(107,53,232,0.2)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "#A78BFA" }}>Fastest response</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Message KIRO in your dashboard. It knows every feature and can fix most issues instantly.</p>
              <Link href="/auth/login" className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold" style={{ color: "#A78BFA" }}>
                Open KIRO <ArrowRight size={10} />
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {status === "success" ? (
              <div className="p-8 rounded-2xl text-center" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <Check size={40} className="mx-auto mb-4" style={{ color: "#10B981" }} />
                <h3 className="font-bold text-lg text-white mb-2">Message sent</h3>
                <p style={{ color: "rgba(255,255,255,0.5)" }}>We'll reply within 24 hours.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Name</label>
                    <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your name" className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Email</label>
                    <input value={form.email} onChange={e => set("email", e.target.value)} type="email" placeholder="you@example.com" className={inp} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Subject</label>
                  <select value={form.subject} onChange={e => set("subject", e.target.value)} className={inp} style={{ cursor: "pointer" }}>
                    <option value="general">General question</option>
                    <option value="support">Technical support</option>
                    <option value="billing">Billing issue</option>
                    <option value="enterprise">Enterprise enquiry</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Message</label>
                  <textarea value={form.message} onChange={e => set("message", e.target.value)} rows={5} placeholder="How can we help?" className={inp} style={{ resize: "none" }} />
                </div>
                <button onClick={submit} disabled={!form.name||!form.email||!form.message||status==="loading"}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
                  {status==="loading" ? <><Loader2 size={14} className="animate-spin" />Sending</> : "Send message"}
                </button>
                {status==="error" && <p className="text-xs text-center text-red-400">Something went wrong. Try again or email hello@droposhq.com</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
