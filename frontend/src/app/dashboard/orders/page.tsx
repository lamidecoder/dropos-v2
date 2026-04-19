"use client";
// Path: frontend/src/app/dashboard/orders/page.tsx

import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { ShoppingCart, Search, Filter, Download, ChevronDown, Zap, Package, Truck, Check, X, Clock, RefreshCw, ArrowUpRight } from "lucide-react";

const V = { v500: "#6B35E8", v700: "#3D1C8A", v400: "#8B5CF6", v300: "#A78BFA" };
const T = {
  dark:  { card: "#181230", border: "rgba(255,255,255,0.06)", text: "#fff", muted: "rgba(255,255,255,0.38)", faint: "rgba(255,255,255,0.04)", row: "rgba(255,255,255,0.02)" },
  light: { card: "#fff",    border: "rgba(15,5,32,0.07)",    text: "#0D0918", muted: "rgba(13,9,24,0.45)", faint: "rgba(15,5,32,0.03)", row: "rgba(15,5,32,0.015)" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PAID:      { label: "Paid",      color: "#10B981", bg: "rgba(16,185,129,0.12)",  icon: Check },
  PENDING:   { label: "Pending",   color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  icon: Clock },
  SHIPPED:   { label: "Shipped",   color: "#06B6D4", bg: "rgba(6,182,212,0.12)",   icon: Truck },
  DELIVERED: { label: "Delivered", color: V.v400,    bg: "rgba(107,53,232,0.12)",  icon: Package },
  CANCELLED: { label: "Cancelled", color: "#EF4444", bg: "rgba(239,68,68,0.12)",   icon: X },
  REFUNDED:  { label: "Refunded",  color: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  icon: RefreshCw },
};

const TABS = ["All Orders", "Pending", "Shipped", "Delivered", "Cancelled"];

export default function OrdersPage() {
  const { theme } = useTheme();
  const t = theme === "dark" ? T.dark : T.light;
  const [activeTab, setActiveTab] = useState("All Orders");
  const [search, setSearch] = useState("");

  const stats = [
    { label: "Total Orders",   value: "0",   color: V.v400,    sub: "All time" },
    { label: "Today",          value: "0",   color: "#10B981", sub: "Last 24 hours" },
    { label: "Pending",        value: "0",   color: "#F59E0B", sub: "Needs action" },
    { label: "Revenue",        value: "₦0",  color: "#06B6D4", sub: "This month" },
  ];

  return (
    <>
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: t.text }}>Orders</h1>
          <p style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>Track and manage customer orders</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 11, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", fontSize: 13, color: t.muted }}>
            <Download size={13} /> Export
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 11, border: "1px solid rgba(107,53,232,0.3)", cursor: "pointer", background: "rgba(107,53,232,0.1)", color: V.v300, fontSize: 13, fontWeight: 600 }}>
            <Zap size={13} /> KIRO Auto-fulfil
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            style={{ padding: "16px", borderRadius: 14, background: t.card, border: `1px solid ${t.border}`, boxShadow: theme === "light" ? "0 1px 3px rgba(15,5,32,0.04)" : "none", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${s.color}40, transparent)` }} />
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.04em", color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: t.muted }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Main card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ borderRadius: 16, background: t.card, border: `1px solid ${t.border}`, overflow: "hidden", boxShadow: theme === "light" ? "0 1px 3px rgba(15,5,32,0.04), 0 4px 20px rgba(15,5,32,0.03)" : "none" }}>

        {/* Tabs + toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, borderBottom: `1px solid ${t.border}`, padding: "0 16px" }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: "14px 14px 13px", border: "none", borderBottom: `2px solid ${activeTab === tab ? V.v500 : "transparent"}`, background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? (theme === "dark" ? "#fff" : "#0D0918") : t.muted, whiteSpace: "nowrap", transition: "all 0.15s" }}>
              {tab}
            </button>
          ))}
          <div style={{ flex: 1 }} />

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 11px", borderRadius: 9, background: t.faint, border: `1px solid ${t.border}`, margin: "8px 0" }}>
            <Search size={12} color={t.muted} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." style={{ background: "transparent", border: "none", outline: "none", fontSize: 12, color: t.text, width: 180, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 11px", borderRadius: 9, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", fontSize: 12, color: t.muted, marginLeft: 8 }}>
            <Filter size={11} /> Filter
          </button>
        </div>

        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 140px 100px 110px 100px 80px", gap: 0, padding: "10px 16px", borderBottom: `1px solid ${t.border}` }}>
          {["", "Customer / Order", "Date", "Items", "Status", "Total", ""].map((h, i) => (
            <div key={i} style={{ fontSize: 10, fontWeight: 700, color: t.muted, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Syncopate', sans-serif", padding: "0 6px" }}>{h}</div>
          ))}
        </div>

        {/* Empty state */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: theme === "dark" ? "rgba(6,182,212,0.1)" : "rgba(6,182,212,0.07)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, border: "1px solid rgba(6,182,212,0.2)" }}>
            <ShoppingCart size={26} color="#06B6D4" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 8, letterSpacing: "-0.02em" }}>No orders yet</h3>
          <p style={{ fontSize: 13, color: t.muted, marginBottom: 24, maxWidth: 340, lineHeight: 1.6 }}>
            Once customers start buying, all orders appear here. KIRO can help you get your first sale.
          </p>
          <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${V.v500}, ${V.v700})`, color: "#fff", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 16px rgba(107,53,232,0.35)" }}>
            <Zap size={13} /> Ask KIRO to get first sales
          </button>
        </div>
      </motion.div>
    </div>
    </>
  );
}
