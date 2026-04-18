"use client";
// Path: frontend/src/app/dashboard/page.tsx

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp, ShoppingCart, Users, Package,
  Zap, ArrowUpRight, Sparkles, ChevronRight,
  AlertCircle, Store, Flame, Activity, Star,
} from "lucide-react";
import { useTheme } from "../../components/layout/DashboardLayout";
import { useAuthStore } from "../../store/auth.store";

const V = { v500: "#6B35E8", v700: "#3D1C8A", v400: "#8B5CF6", v300: "#A78BFA", v200: "#C4B5FD", fuchsia: "#C026D3", cyan: "#06B6D4" };

const T = {
  dark: { text: "#fff", muted: "rgba(255,255,255,0.38)", faint: "rgba(255,255,255,0.18)", card: "#181230", border: "rgba(255,255,255,0.06)", cardHi: "#1E1640" },
  light: { text: "#0D0918", muted: "rgba(13,9,24,0.45)", faint: "rgba(13,9,24,0.22)", card: "#fff", border: "rgba(15,5,32,0.07)", cardHi: "#F8F6FF" },
};

function StatCard({ label, value, color, icon: Icon, delay, t, theme }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      style={{
        padding: 18, borderRadius: 16, cursor: "pointer",
        background: t.card, border: `1px solid ${t.border}`,
        boxShadow: theme === "light" ? "0 1px 3px rgba(15,5,32,0.04), 0 4px 20px rgba(15,5,32,0.03)" : "none",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* top line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}15` }}>
          <Icon size={17} color={color} />
        </div>
      </div>

      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.04em", color: t.text, marginBottom: 6 }}>{value}</div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: t.muted }}>{label}</span>
        <span style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 9, color: t.faint, letterSpacing: "0.06em" }}>— No data</span>
      </div>
    </motion.div>
  );
}

function InsightItem({ text, type, t }: { text: string; type: "tip" | "win" | "alert"; t: any }) {
  const cfg = {
    tip:   { color: V.v400, bg: "rgba(107,53,232,0.08)", border: "rgba(107,53,232,0.18)", icon: Sparkles },
    win:   { color: "#10B981", bg: "rgba(16,185,129,0.07)", border: "rgba(16,185,129,0.18)", icon: TrendingUp },
    alert: { color: "#F59E0B", bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.18)", icon: AlertCircle },
  }[type];
  const Icon = cfg.icon;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: 10, borderRadius: 11, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <div style={{ width: 24, height: 24, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: `${cfg.color}20` }}>
        <Icon size={11} color={cfg.color} />
      </div>
      <p style={{ fontSize: 11.5, lineHeight: 1.55, color: t.muted }}>{text}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const t = theme === "dark" ? T.dark : T.light;

  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const [greeting, setGreeting] = useState("morning");
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "morning" : h < 17 ? "afternoon" : "evening");
  }, []);

  const stats = [
    { label: "Total Revenue", value: "₦0",   color: V.v400,    icon: TrendingUp   },
    { label: "Total Orders",  value: "0",     color: V.cyan,    icon: ShoppingCart },
    { label: "Customers",     value: "0",     color: "#10B981", icon: Users        },
    { label: "Products",      value: "0",     color: V.fuchsia, icon: Package      },
  ];

  const insights = [
    { text: "Your store is ready. Ask KIRO to set up your first product collection.", type: "tip" as const },
    { text: "Enable abandoned cart recovery — KIRO recovers up to 15% of lost sales automatically.", type: "win" as const },
    { text: "Add a custom domain to build trust with customers and boost conversions.", type: "alert" as const },
  ];

  const quickActions = [
    { label: "Add Product", href: "/dashboard/products", icon: Package, color: V.v400 },
    { label: "View Store",  href: "#",                   icon: Store,   color: V.cyan },
    { label: "Flash Sale",  href: "/dashboard/flash-sales", icon: Flame, color: "#F59E0B" },
    { label: "Analytics",  href: "/dashboard/analytics", icon: Activity, color: "#10B981" },
  ];

  const cardStyle = {
    borderRadius: 16, padding: 20,
    background: t.card, border: `1px solid ${t.border}`,
    boxShadow: theme === "light" ? "0 1px 3px rgba(15,5,32,0.04), 0 4px 20px rgba(15,5,32,0.03)" : "none",
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.2, color: t.text }}>
            Good {greeting}, {firstName} 👋
          </h1>
          <p style={{ fontSize: 13, marginTop: 4, color: t.muted }}>
            Here's what's happening with your store today.
          </p>
        </div>
        <Link href="/dashboard/kai">
          <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 14, cursor: "pointer", border: "none", background: `linear-gradient(135deg, ${V.v500}, ${V.v700})`, color: "#fff", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 6px 24px rgba(107,53,232,0.35)" }}>
            <Zap size={14} color="white" />
            Ask KIRO
            <ChevronRight size={13} color="rgba(255,255,255,0.6)" />
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.08} t={t} theme={theme} />)}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 308px", gap: 16 }}>

        {/* Orders */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", color: t.text }}>Recent Orders</span>
            <Link href="/dashboard/orders">
              <span style={{ fontSize: 12, fontWeight: 500, color: V.v400, display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}>
                View all <ArrowUpRight size={11} />
              </span>
            </Link>
          </div>

          {/* Empty */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, background: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(15,5,32,0.04)" }}>
              <ShoppingCart size={22} color={t.faint} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: t.muted }}>No orders yet</p>
            <p style={{ fontSize: 12, marginBottom: 16, color: theme === "dark" ? "rgba(255,255,255,0.22)" : "rgba(15,5,32,0.28)" }}>Your first order will appear here</p>
            <Link href="/dashboard/kai">
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: "pointer", background: "rgba(107,53,232,0.12)", color: V.v300, border: "1px solid rgba(107,53,232,0.22)" }}>
                <Zap size={12} /> Ask KIRO to help get first sales
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Right col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* KIRO */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}
            style={{ borderRadius: 16, padding: 18, background: theme === "dark" ? `linear-gradient(135deg, rgba(107,53,232,0.1), rgba(91,33,182,0.05))` : `linear-gradient(135deg, rgba(107,53,232,0.06), rgba(91,33,182,0.02))`, border: "1px solid rgba(107,53,232,0.22)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, rgba(107,53,232,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, position: "relative" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(145deg, ${V.v500}, ${V.v700})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 12px rgba(107,53,232,0.3)" }}>
                <Zap size={13} color="white" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.02em", color: theme === "dark" ? V.v200 : V.v700 }}>KIRO Insights</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {insights.map((ins, i) => <InsightItem key={i} {...ins} t={t} />)}
            </div>
            <Link href="/dashboard/kai">
              <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: 10, borderRadius: 12, fontFamily: "'Syncopate', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, cursor: "pointer", border: "none", background: `linear-gradient(135deg, ${V.v500}, ${V.v700})`, color: "#fff", boxShadow: "0 4px 16px rgba(107,53,232,0.3)" }}>
                <Zap size={12} color="white" /> Chat with KIRO
              </button>
            </Link>
          </motion.div>

          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} style={cardStyle}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", color: t.text, display: "block", marginBottom: 14 }}>Quick Actions</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {quickActions.map(action => {
                const Icon = action.icon;
                return (
                  <Link href={action.href} key={action.label}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, cursor: "pointer", background: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,5,32,0.03)", border: `1px solid ${t.border}` }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${action.color}15` }}>
                        <Icon size={15} color={action.color} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 500, color: t.muted }}>{action.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Store health */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 }}
            style={{ borderRadius: 16, padding: 18, background: theme === "dark" ? "linear-gradient(135deg, rgba(107,53,232,0.08), rgba(91,33,182,0.04))" : "linear-gradient(135deg, rgba(107,53,232,0.05), rgba(91,33,182,0.02))", border: "1px solid rgba(107,53,232,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.02em", color: t.text }}>Store Health</span>
              <span style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 99, background: "rgba(107,53,232,0.15)", color: V.v300, border: "1px solid rgba(107,53,232,0.25)" }}>15%</span>
            </div>
            <div style={{ height: 5, borderRadius: 99, marginBottom: 8, overflow: "hidden", background: theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(15,5,32,0.08)" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: "15%" }} transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${V.v500}, ${V.v300})` }} />
            </div>
            <p style={{ fontSize: 11, color: t.muted, marginBottom: 12 }}>Complete your store setup to unlock full potential</p>
            <Link href="/dashboard/kai">
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: V.v400, cursor: "pointer" }}>
                <Zap size={11} /> Ask KIRO to complete setup <ChevronRight size={11} />
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
