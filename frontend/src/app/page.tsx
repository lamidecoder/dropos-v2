"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, ArrowRight, Mail, Check } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api";

// Launch date: 30 days from now (update this to real date before launch)
const LAUNCH = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc());
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function Block({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl"
          style={{ background: "rgba(107,53,232,0.12)", border: "1px solid rgba(107,53,232,0.25)", color: "#F0ECFF", letterSpacing: "-0.04em" }}>
          {String(value).padStart(2, "0")}
        </div>
      </div>
      <p className="text-xs font-semibold mt-2 uppercase tracking-widest" style={{ color: "rgba(240,236,255,0.35)" }}>{label}</p>
    </div>
  );
}

export default function ComingSoonPage() {
  const { d, h, m, s } = useCountdown(LAUNCH);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const join = async () => {
    if (!email || loading) return;
    setLoading(true);
    try {
      await fetch(`${API}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "coming_soon" }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true); // optimistic — store anyway
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "#080612" }}>

      {/* Background glows */}
      <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(107,53,232,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(61,28,138,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
        className="flex flex-col items-center text-center max-w-xl w-full relative z-10">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-12">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <span className="text-lg font-black tracking-tight" style={{ color: "#F0ECFF" }}>DropOS</span>
        </Link>

        {/* Badge */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{ background: "rgba(107,53,232,0.1)", border: "1px solid rgba(107,53,232,0.2)" }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10B981" }} />
          <span className="text-xs font-bold" style={{ color: "rgba(167,139,250,0.9)" }}>Something big is coming</span>
        </motion.div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-5 leading-tight"
          style={{ color: "#F0ECFF", letterSpacing: "-0.04em" }}>
          Your AI-powered<br />
          <span style={{ background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            dropshipping store
          </span>
        </h1>

        <p className="text-base mb-10 leading-relaxed" style={{ color: "rgba(240,236,255,0.5)", maxWidth: 400 }}>
          DropOS is the first AI-native store platform built for African merchants.
          KIRO handles everything — product import, pricing, fulfilment, and marketing.
        </p>

        {/* Countdown */}
        <div className="flex items-center gap-5 mb-10">
          <Block value={d} label="Days" />
          <span className="text-2xl font-black pb-5" style={{ color: "rgba(107,53,232,0.4)" }}>:</span>
          <Block value={h} label="Hours" />
          <span className="text-2xl font-black pb-5" style={{ color: "rgba(107,53,232,0.4)" }}>:</span>
          <Block value={m} label="Mins" />
          <span className="text-2xl font-black pb-5" style={{ color: "rgba(107,53,232,0.4)" }}>:</span>
          <Block value={s} label="Secs" />
        </div>

        {/* Email waitlist */}
        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)" }}>
              <Check size={16} color="#10B981" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold" style={{ color: "#10B981" }}>You're on the list!</p>
              <p className="text-xs" style={{ color: "rgba(240,236,255,0.4)" }}>We'll email you the moment we launch.</p>
            </div>
          </motion.div>
        ) : (
          <div className="flex w-full max-w-sm gap-2">
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && join()}
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(107,53,232,0.2)", color: "#F0ECFF", fontFamily: "inherit" }}
            />
            <button
              onClick={join}
              disabled={!email || loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", border: "none", cursor: email && !loading ? "pointer" : "not-allowed", opacity: !email ? 0.6 : 1, flexShrink: 0 }}>
              {loading ? "..." : <><span>Notify me</span><ArrowRight size={14} /></>}
            </button>
          </div>
        )}

        {/* Features preview */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          {["AI product import", "KIRO AI assistant", "Paystack & Stripe", "Nigerian merchants"].map(f => (
            <span key={f} className="flex items-center gap-1.5 text-xs"
              style={{ color: "rgba(240,236,255,0.4)" }}>
              <Check size={11} color="#6B35E8" />
              {f}
            </span>
          ))}
        </div>

        {/* Already have account */}
        <div className="flex items-center gap-3 mt-12">
          <Link href="/auth/login"
            className="text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            style={{ color: "rgba(167,139,250,0.7)", textDecoration: "none", border: "1px solid rgba(107,53,232,0.15)", background: "rgba(107,53,232,0.05)" }}>
            Sign in
          </Link>
          <Link href="/auth/register"
            className="text-xs font-semibold px-4 py-2 rounded-xl text-white"
            style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", textDecoration: "none" }}>
            Early access →
          </Link>
        </div>
      </motion.div>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs" style={{ color: "rgba(240,236,255,0.2)" }}>
        © {new Date().getFullYear()} DropOS · Built for African merchants
      </p>
    </div>
  );
}
