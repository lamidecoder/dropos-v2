"use client";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { Building2, Bell } from "lucide-react";

export default function VirtualAccountPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card:   isDark ? "rgba(255,255,255,0.03)" : "#fff",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.5)" : "rgba(19,13,46,0.5)",
    border: isDark ? "rgba(107,53,232,0.12)" : "rgba(107,53,232,0.1)",
  };
  return (
    <div style={{ maxWidth: 520, margin: "80px auto 0", textAlign: "center", padding: "0 24px" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: "linear-gradient(145deg,#2D1B69,#0D0625)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 32px rgba(45,27,105,0.25)" }}>
          <Building2 size={34} color="#C4B5FD"/>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(107,53,232,0.08)", border: "1px solid rgba(107,53,232,0.15)", borderRadius: 99, padding: "5px 14px", marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#8B5CF6", letterSpacing: "0.08em" }}>COMING SOON</span>
        </div>
        <h1 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: "clamp(28px,5vw,38px)", fontWeight: 500, color: t.text, margin: "0 0 14px", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
          Virtual Bank Account
        </h1>
        <p style={{ fontSize: 15, color: t.muted, lineHeight: 1.65, margin: "0 0 36px" }}>
          Get your own dedicated account number for your store. We're working on it — it'll be ready soon.
        </p>
        <div style={{ padding: "18px 20px", borderRadius: 16, background: t.card, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(107,53,232,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Bell size={16} color="#8B5CF6"/>
          </div>
          <p style={{ fontSize: 13, color: t.muted, margin: 0, lineHeight: 1.5 }}>
            You'll be notified as soon as this goes live.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
