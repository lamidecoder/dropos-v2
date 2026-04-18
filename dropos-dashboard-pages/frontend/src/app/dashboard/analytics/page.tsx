"use client";
// Path: frontend/src/app/dashboard/analytics/page.tsx

import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { BarChart2, TrendingUp, Users, ShoppingCart, ArrowUpRight, Zap, Calendar, ChevronDown, Download, Activity, Package } from "lucide-react";

const V = { v500: "#6B35E8", v700: "#3D1C8A", v400: "#8B5CF6", v300: "#A78BFA", fuchsia: "#C026D3", cyan: "#06B6D4" };
const T = {
  dark:  { card: "#181230", border: "rgba(255,255,255,0.06)", text: "#fff", muted: "rgba(255,255,255,0.38)", faint: "rgba(255,255,255,0.04)" },
  light: { card: "#fff",    border: "rgba(15,5,32,0.07)",    text: "#0D0918", muted: "rgba(13,9,24,0.45)", faint: "rgba(15,5,32,0.03)" },
};

const PERIODS = ["Today", "7 days", "30 days", "90 days", "1 year"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BAR_HEIGHTS = [30, 45, 38, 60, 52, 78, 55];

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const t = theme === "dark" ? T.dark : T.light;
  const [period, setPeriod] = useState("7 days");

  const stats = [
    { label: "Total Revenue",  value: "₦0",  delta: "0%",  color: V.v400,    icon: TrendingUp },
    { label: "Total Orders",   value: "0",   delta: "0%",  color: V.cyan,    icon: ShoppingCart },
    { label: "Visitors",       value: "0",   delta: "0%",  color: V.fuchsia, icon: Users },
    { label: "Conversion",     value: "0%",  delta: "0%",  color: "#10B981", icon: Activity },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: t.text }}>Analytics</h1>
          <p style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>Track your store performance</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Period selector */}
          <div style={{ display: "flex", gap: 2, padding: 3, borderRadius: 11, background: t.card, border: `1px solid ${t.border}` }}>
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                style={{ padding: "6px 12px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12, fontWeight: period === p ? 600 : 400, background: period === p ? (theme === "dark" ? "rgba(107,53,232,0.2)" : "rgba(107,53,232,0.1)") : "transparent", color: period === p ? V.v300 : t.muted, transition: "all 0.15s" }}>
                {p}
              </button>
            ))}
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 11, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", fontSize: 13, color: t.muted }}>
            <Download size={13} /> Export
          </button>
        </div>
      </motion.div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{ padding: "18px", borderRadius: 14, background: t.card, border: `1px solid ${t.border}`, boxShadow: theme === "light" ? "0 1px 3px rgba(15,5,32,0.04)" : "none", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)` }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${s.color}15` }}>
                  <Icon size={16} color={s.color} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, color: "#10B981" }}>
                  <ArrowUpRight size={11} />{s.delta}
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.04em", color: t.text, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: t.muted }}>{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Chart + breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, marginBottom: 16 }}>

        {/* Revenue chart */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ padding: 20, borderRadius: 16, background: t.card, border: `1px solid ${t.border}`, boxShadow: theme === "light" ? "0 1px 3px rgba(15,5,32,0.04), 0 4px 20px rgba(15,5,32,0.03)" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>Revenue Overview</div>
              <div style={{ fontSize: 12, color: t.muted, marginTop: 3 }}>No data for this period yet</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: t.muted }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: V.v400 }} />Revenue
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: t.muted }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: V.cyan }} />Orders
              </div>
            </div>
          </div>

          {/* Bar chart placeholder */}
          <div style={{ position: "relative", height: 180 }}>
            {/* Grid lines */}
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${i * 33}%`, height: 1, background: t.faint, borderTop: `1px dashed ${theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(15,5,32,0.05)"}` }} />
            ))}

            {/* Bars */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: "100%", paddingTop: 10 }}>
              {DAYS.map((day, i) => (
                <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%" }}>
                  <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", gap: 3 }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${BAR_HEIGHTS[i]}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                      style={{ flex: 1, borderRadius: "4px 4px 0 0", background: theme === "dark" ? "rgba(107,53,232,0.15)" : "rgba(107,53,232,0.08)", border: `1px solid ${theme === "dark" ? "rgba(107,53,232,0.2)" : "rgba(107,53,232,0.12)"}`, borderBottom: "none" }}
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${BAR_HEIGHTS[i] * 0.6}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08 + 0.1, ease: "easeOut" }}
                      style={{ flex: 1, borderRadius: "4px 4px 0 0", background: theme === "dark" ? "rgba(6,182,212,0.12)" : "rgba(6,182,212,0.08)", border: `1px solid ${theme === "dark" ? "rgba(6,182,212,0.18)" : "rgba(6,182,212,0.12)"}`, borderBottom: "none" }}
                    />
                  </div>
                  <div style={{ fontSize: 10, color: t.muted, fontFamily: "'Syncopate', sans-serif", letterSpacing: "0.05em" }}>{day}</div>
                </div>
              ))}
            </div>
          </div>

          {/* KIRO insight */}
          <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 11, background: "rgba(107,53,232,0.08)", border: "1px solid rgba(107,53,232,0.18)", display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={12} color={V.v400} />
            <span style={{ fontSize: 12, color: theme === "dark" ? V.v200 : V.v500 }}>Start selling to see KIRO's revenue insights and growth recommendations.</span>
          </div>
        </motion.div>

        {/* Top products */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ padding: 20, borderRadius: 16, background: t.card, border: `1px solid ${t.border}`, boxShadow: theme === "light" ? "0 1px 3px rgba(15,5,32,0.04), 0 4px 20px rgba(15,5,32,0.03)" : "none" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: "-0.02em", marginBottom: 16 }}>Top Products</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px", textAlign: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, background: theme === "dark" ? "rgba(192,38,211,0.1)" : "rgba(192,38,211,0.07)", border: "1px solid rgba(192,38,211,0.18)" }}>
              <Package size={20} color={V.fuchsia} />
            </div>
            <p style={{ fontSize: 12, color: t.muted, lineHeight: 1.6 }}>Add products and make sales to see your best performers here.</p>
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { title: "Traffic Sources", icon: Users, color: V.fuchsia },
          { title: "Sales by Country", icon: BarChart2, color: V.cyan },
        ].map(card => {
          const Icon = card.icon;
          return (
            <motion.div key={card.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{ padding: 20, borderRadius: 16, background: t.card, border: `1px solid ${t.border}`, boxShadow: theme === "light" ? "0 1px 3px rgba(15,5,32,0.04)" : "none" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: "-0.02em", marginBottom: 20 }}>{card.title}</div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 16px", textAlign: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, background: `${card.color}10`, border: `1px solid ${card.color}20` }}>
                  <Icon size={18} color={card.color} />
                </div>
                <p style={{ fontSize: 12, color: t.muted, lineHeight: 1.6 }}>Data will appear once you start receiving traffic and orders.</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
