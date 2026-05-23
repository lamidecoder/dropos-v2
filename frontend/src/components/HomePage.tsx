"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, ArrowRight, Check } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api";
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{
        width: "clamp(56px, 14vw, 80px)",
        height: "clamp(56px, 14vw, 80px)",
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "clamp(22px, 5vw, 32px)",
        fontWeight: 900,
        letterSpacing: "-0.04em",
        background: "rgba(107,53,232,0.12)",
        border: "1px solid rgba(107,53,232,0.25)",
        color: "#F0ECFF",
      }}>
        {String(value).padStart(2, "0")}
      </div>
      <p style={{ fontSize: "clamp(9px, 2vw, 11px)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(240,236,255,0.35)", margin: 0 }}>
        {label}
      </p>
    </div>
  );
}

export default function HomePage() {
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
    } catch {}
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#080612",
      padding: "24px 16px",
      position: "relative",
      overflow: "hidden",
      boxSizing: "border-box",
    }}>
      {/* Background glows */}
      <div style={{ position: "absolute", top: "5%", left: "50%", transform: "translateX(-50%)", width: "min(600px, 100vw)", height: "min(600px, 100vw)", borderRadius: "50%", background: "radial-gradient(circle, rgba(107,53,232,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "0", right: "0", width: "min(300px, 50vw)", height: "min(300px, 50vw)", borderRadius: "50%", background: "radial-gradient(circle, rgba(61,28,138,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          width: "100%",
          maxWidth: 520,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "clamp(32px, 8vw, 52px)", textDecoration: "none" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", flexShrink: 0 }}>
            <Zap size={17} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.03em", color: "#F0ECFF" }}>DropOS</span>
        </Link>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 99, background: "rgba(107,53,232,0.1)", border: "1px solid rgba(107,53,232,0.2)", marginBottom: "clamp(20px, 5vw, 32px)" }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(167,139,250,0.9)" }}>Something big is coming</span>
        </motion.div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(28px, 8vw, 48px)",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          lineHeight: 1.1,
          color: "#F0ECFF",
          margin: "0 0 clamp(12px, 3vw, 20px)",
        }}>
          Your AI-powered{" "}
          <span style={{ background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            dropshipping store
          </span>
        </h1>

        <p style={{
          fontSize: "clamp(13px, 3.5vw, 15px)",
          lineHeight: 1.65,
          color: "rgba(240,236,255,0.5)",
          margin: "0 0 clamp(28px, 7vw, 44px)",
          maxWidth: 380,
        }}>
          DropOS is the first AI-native store platform built for modern merchants.
          KIRO handles everything — import, pricing, fulfilment, and growth.
        </p>

        {/* Countdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 3vw, 20px)", marginBottom: "clamp(28px, 7vw, 44px)" }}>
          <Block value={d} label="Days" />
          <span style={{ fontSize: "clamp(18px, 5vw, 28px)", fontWeight: 900, color: "rgba(107,53,232,0.4)", paddingBottom: "clamp(16px, 4vw, 24px)" }}>:</span>
          <Block value={h} label="Hours" />
          <span style={{ fontSize: "clamp(18px, 5vw, 28px)", fontWeight: 900, color: "rgba(107,53,232,0.4)", paddingBottom: "clamp(16px, 4vw, 24px)" }}>:</span>
          <Block value={m} label="Mins" />
          <span style={{ fontSize: "clamp(18px, 5vw, 28px)", fontWeight: 900, color: "rgba(107,53,232,0.4)", paddingBottom: "clamp(16px, 4vw, 24px)" }}>:</span>
          <Block value={s} label="Secs" />
        </div>

        {/* Email form */}
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: 16, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", width: "100%", maxWidth: 400, boxSizing: "border-box" }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,0.15)", flexShrink: 0 }}>
              <Check size={15} color="#10B981" />
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#10B981", margin: "0 0 2px" }}>You're on the list!</p>
              <p style={{ fontSize: 12, color: "rgba(240,236,255,0.35)", margin: 0 }}>We'll email you the moment we launch.</p>
            </div>
          </motion.div>
        ) : (
          <div style={{ display: "flex", width: "100%", maxWidth: 400, gap: 8, flexWrap: "wrap" }}>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && join()}
              type="email"
              placeholder="your@email.com"
              style={{
                flex: "1 1 160px",
                minWidth: 0,
                padding: "11px 16px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(107,53,232,0.2)",
                color: "#F0ECFF",
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={join}
              disabled={!email || loading}
              style={{
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "11px 18px",
                borderRadius: 12,
                background: email && !loading ? "linear-gradient(135deg,#6B35E8,#3D1C8A)" : "rgba(107,53,232,0.3)",
                border: "none",
                cursor: email && !loading ? "pointer" : "not-allowed",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "..." : <><span>Notify me</span><ArrowRight size={14} /></>}
            </button>
          </div>
        )}

        {/* Features */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "8px 20px", margin: "clamp(20px,5vw,36px) 0" }}>
          {["AI product import", "KIRO AI assistant", "Paystack & Stripe", "Built for global commerce"].map(f => (
            <span key={f} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "clamp(11px, 2.5vw, 12px)", color: "rgba(240,236,255,0.38)" }}>
              <Check size={10} color="#6B35E8" />
              {f}
            </span>
          ))}
        </div>

        {/* Auth links */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/auth/login" style={{ fontSize: 13, fontWeight: 600, padding: "8px 18px", borderRadius: 10, color: "rgba(167,139,250,0.7)", textDecoration: "none", border: "1px solid rgba(107,53,232,0.15)", background: "rgba(107,53,232,0.05)" }}>
            Sign in
          </Link>
          <Link href="/auth/register" style={{ fontSize: 13, fontWeight: 700, padding: "8px 18px", borderRadius: 10, color: "#fff", textDecoration: "none", background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
            Get early access →
          </Link>
        </div>
      </motion.div>

      {/* Footer */}
      <p style={{ position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center", fontSize: 11, color: "rgba(240,236,255,0.18)", margin: 0 }}>
        © {new Date().getFullYear()} DropOS · Built for modern merchants
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
