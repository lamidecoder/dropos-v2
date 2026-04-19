"use client";
﻿"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp, ShoppingCart, Users, Package, Zap, Sparkles, ChevronRight, AlertCircle, Store, Flame, Activity } from "lucide-react";
import { useTheme } from "../../components/layout/DashboardLayout";
import { useAuthStore } from "../../store/auth.store";

export default function DashboardPage() {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const isDark = theme === "dark";
  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const [greeting, setGreeting] = useState("morning");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "morning" : h < 17 ? "afternoon" : "evening");
  }, []);

  const t = {
    card: isDark ? "#181230" : "#fff",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,5,32,0.07)",
    text: isDark ? "#fff" : "#0D0918",
    muted: isDark ? "rgba(255,255,255,0.38)" : "rgba(13,9,24,0.45)",
    shadow: isDark ? "none" : "0 1px 3px rgba(15,5,32,0.04), 0 4px 20px rgba(15,5,32,0.03)",
  };

  const stats = [
    { label: "Total Revenue", value: "N0",   color: "#8B5CF6", icon: TrendingUp },
    { label: "Total Orders",  value: "0",    color: "#06B6D4", icon: ShoppingCart },
    { label: "Customers",     value: "0",    color: "#10B981", icon: Users },
    { label: "Products",      value: "0",    color: "#C026D3", icon: Package },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: t.text }}>
            Good {greeting}, {firstName}
          </h1>
          <p style={{ fontSize: 13, marginTop: 4, color: t.muted }}>Here's what's happening with your store today.</p>
        </div>
        <Link href="/dashboard/kai">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #6B35E8, #3D1C8A)", color: "#fff", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 6px 24px rgba(107,53,232,0.35)" }}>
            <Zap size={14} color="white" /> Ask KIRO <ChevronRight size={13} color="rgba(255,255,255,0.6)" />
          </motion.button>
        </Link>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ padding: 18, borderRadius: 16, background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: `${s.color}15`, marginBottom: 14 }}>
                <Icon size={17} color={s.color} />
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.04em", color: t.text, marginBottom: 6 }}>{s.value}</div>
              <span style={{ fontSize: 12, color: t.muted }}>{s.label}</span>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 308px", gap: 16 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ padding: 20, borderRadius: 16, background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>Recent Orders</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,5,32,0.04)" }}>
              <ShoppingCart size={22} color={isDark ? "rgba(255,255,255,0.2)" : "rgba(15,5,32,0.2)"} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: t.muted }}>No orders yet</p>
            <p style={{ fontSize: 12, marginBottom: 16, color: isDark ? "rgba(255,255,255,0.22)" : "rgba(15,5,32,0.28)" }}>Your first order will appear here</p>
            <Link href="/dashboard/kai">
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: "pointer", background: "rgba(107,53,232,0.12)", color: "#A78BFA" }}>
                <Zap size={12} /> Ask KIRO to help get first sales
              </div>
            </Link>
          </div>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{ borderRadius: 16, padding: 18, background: isDark ? "linear-gradient(135deg, rgba(107,53,232,0.1), rgba(91,33,182,0.05))" : "linear-gradient(135deg, rgba(107,53,232,0.06), rgba(91,33,182,0.02))", border: "1px solid rgba(107,53,232,0.22)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(145deg, #6B35E8, #1A0D3D)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={13} color="white" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? "#C4B5FD" : "#3D1C8A" }}>KIRO Insights</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {[
                { text: "Your store is ready. Ask KIRO to set up your first product collection.", color: "#8B5CF6", bg: "rgba(107,53,232,0.08)", border: "rgba(107,53,232,0.18)", icon: Sparkles },
                { text: "Enable abandoned cart recovery — KIRO recovers up to 15% of lost sales.", color: "#10B981", bg: "rgba(16,185,129,0.07)", border: "rgba(16,185,129,0.18)", icon: TrendingUp },
                { text: "Add a custom domain to build trust with customers.", color: "#F59E0B", bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.18)", icon: AlertCircle },
              ].map((ins, i) => {
                const Icon = ins.icon;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: 10, borderRadius: 11, background: ins.bg, border: `1px solid ${ins.border}` }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: `${ins.color}20` }}>
                      <Icon size={11} color={ins.color} />
                    </div>
                    <p style={{ fontSize: 11.5, lineHeight: 1.55, color: t.muted }}>{ins.text}</p>
                  </div>
                );
              })}
            </div>
            <Link href="/dashboard/kai">
              <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: 10, borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #6B35E8, #3D1C8A)", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                <Zap size={12} color="white" /> Chat with KIRO
              </button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ padding: 18, borderRadius: 16, background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: t.text, display: "block", marginBottom: 14 }}>Quick Actions</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Add Product", href: "/dashboard/products", icon: Package, color: "#8B5CF6" },
                { label: "View Store", href: "#", icon: Store, color: "#06B6D4" },
                { label: "Flash Sale", href: "/dashboard/flash-sales", icon: Flame, color: "#F59E0B" },
                { label: "Analytics", href: "/dashboard/analytics", icon: Activity, color: "#10B981" },
              ].map(a => {
                const Icon = a.icon;
                return (
                  <Link href={a.href} key={a.label}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, cursor: "pointer", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(15,5,32,0.03)", border: `1px solid ${t.border}` }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${a.color}15` }}>
                        <Icon size={15} color={a.color} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 500, color: t.muted }}>{a.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
