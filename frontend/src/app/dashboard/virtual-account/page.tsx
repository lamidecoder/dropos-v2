"use client";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { Building2, Lock, Bell } from "lucide-react";

export default function VirtualAccountPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card:   isDark ? "rgba(255,255,255,0.03)" : "#fff",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.5)" : "rgba(19,13,46,0.5)",
    border: isDark ? "rgba(107,53,232,0.12)" : "rgba(107,53,232,0.1)",
    faint:  isDark ? "rgba(107,53,232,0.06)" : "rgba(107,53,232,0.04)",
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: t.text, marginBottom: 4, letterSpacing: "-0.03em" }}>Virtual Bank Account</h1>
        <p style={{ fontSize: 13, color: t.muted }}>Your own dedicated store account number</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${t.border}`, boxShadow: "0 4px 32px rgba(107,53,232,0.07)" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#2D1B69,#1A0B4A)", padding: "48px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,250,0.2),transparent 70%)", pointerEvents: "none" }}/>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Building2 size={32} color="#C4B5FD"/>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 99, padding: "5px 14px", marginBottom: 16 }}>
              <Lock size={10} color="#C4B5FD"/>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#C4B5FD", letterSpacing: "0.08em" }}>COMING SOON</span>
            </div>
            <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 28, fontWeight: 500, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              Your own bank<br/><em style={{ fontStyle: "italic", color: "#C4B5FD" }}>account number.</em>
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.6, maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
              Customers transfer directly to your store's account. No payment popup. Money lands instantly.
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={{ background: t.card, padding: "32px 40px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(107,53,232,0.6)", margin: "0 0 20px", textTransform: "uppercase" }}>How it will work</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 28 }}>
            {[
              { n:"01", title:"Generate your account", desc:"One click gives your store a real bank account number — unique to you, powered by Paystack DVA." },
              { n:"02", title:"Share it anywhere",     desc:"Post on WhatsApp Status, Instagram bio, or show it at checkout. Customers pay via their banking app." },
              { n:"03", title:"Orders confirm instantly", desc:"When money lands, your order is marked paid and fulfilment starts — no manual checking needed." },
            ].map(s => (
              <div key={s.n} style={{ display: "flex", gap: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#8B5CF6", minWidth: 24, paddingTop: 1 }}>{s.n}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: "0 0 4px" }}>{s.title}</p>
                  <p style={{ fontSize: 12, color: t.muted, margin: 0, lineHeight: 1.55 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: t.border, marginBottom: 28 }}/>

          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(107,53,232,0.6)", margin: "0 0 14px", textTransform: "uppercase" }}>Unlocks when</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {[
              "DropOS is registered as a business (CAC)",
              "Paystack business account verified",
              "Paystack live keys added to the platform",
            ].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: t.faint, border: `1px solid ${t.border}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Lock size={9} color={t.muted as string}/>
                </div>
                <span style={{ fontSize: 13, color: t.muted }}>{item}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: "16px 20px", borderRadius: 14, background: t.faint, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 12 }}>
            <Bell size={16} color="#8B5CF6" style={{ flexShrink: 0 }}/>
            <p style={{ fontSize: 12, color: t.muted, margin: 0, lineHeight: 1.5 }}>
              We'll notify you as soon as virtual accounts go live. You'll be first to activate it.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
