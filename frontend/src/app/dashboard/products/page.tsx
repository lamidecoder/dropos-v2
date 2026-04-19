"use client";
// Path: frontend/src/app/dashboard/products/page.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { Package, Plus, Search, Filter, MoreHorizontal, ArrowUpRight, TrendingUp, Eye, Star, ChevronDown, Grid, List, Zap, Upload, Tag } from "lucide-react";

const V = { v500: "#6B35E8", v700: "#3D1C8A", v400: "#8B5CF6", v300: "#A78BFA", v200: "#C4B5FD", fuchsia: "#C026D3", cyan: "#06B6D4" };
const T = {
  dark:  { bg: "#06040D", card: "#181230", border: "rgba(255,255,255,0.06)", text: "#fff", muted: "rgba(255,255,255,0.38)", faint: "rgba(255,255,255,0.05)", hover: "rgba(255,255,255,0.04)" },
  light: { bg: "#F4F2FF", card: "#fff",    border: "rgba(15,5,32,0.07)",    text: "#0D0918", muted: "rgba(13,9,24,0.45)", faint: "rgba(15,5,32,0.03)", hover: "rgba(15,5,32,0.04)" },
};

const FILTERS = ["All", "Active", "Draft", "Out of Stock", "Archived"];
const MOCK_PRODUCTS: any[] = [];

function EmptyState({ t, theme }: any) {
  return (
    <>
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: 22, background: theme === "dark" ? "rgba(107,53,232,0.12)" : "rgba(107,53,232,0.07)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, border: "1px solid rgba(107,53,232,0.2)" }}>
        <Package size={30} color={V.v400} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", color: t.text, marginBottom: 8 }}>No products yet</h3>
      <p style={{ fontSize: 13, color: t.muted, marginBottom: 28, maxWidth: 360, lineHeight: 1.6 }}>
        Add your first product or let KIRO find winning products for your store automatically.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${V.v500}, ${V.v700})`, color: "#fff", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 16px rgba(107,53,232,0.35)" }}>
          <Plus size={14} /> Add Product
        </button>
        <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 12, border: "1px solid rgba(107,53,232,0.3)", cursor: "pointer", background: "rgba(107,53,232,0.08)", color: V.v300, fontSize: 13, fontWeight: 600 }}>
          <Zap size={14} /> Ask KIRO to find products
        </button>
      </div>
    </motion.div>
  );
}

export default function ProductsPage() {
  const { theme } = useTheme();
  const t = theme === "dark" ? T.dark : T.light;
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [search, setSearch] = useState("");

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: t.text, lineHeight: 1.2 }}>Products</h1>
          <p style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>Manage your product catalogue</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 11, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", fontSize: 13, color: t.muted }}>
            <Upload size={13} /> Import
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 11, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${V.v500}, ${V.v700})`, color: "#fff", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 14px rgba(107,53,232,0.35)" }}>
            <Plus size={14} /> Add Product
          </button>
        </div>
      </motion.div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Products", value: "0", color: V.v400 },
          { label: "Active",         value: "0", color: "#10B981" },
          { label: "Out of Stock",   value: "0", color: "#F59E0B" },
          { label: "Draft",          value: "0", color: t.muted },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            style={{ padding: "14px 16px", borderRadius: 14, background: t.card, border: `1px solid ${t.border}`, boxShadow: theme === "light" ? "0 1px 3px rgba(15,5,32,0.04)" : "none" }}>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.04em", color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: t.muted }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "14px 16px", borderRadius: 14, background: t.card, border: `1px solid ${t.border}` }}>

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, maxWidth: 320, padding: "8px 12px", borderRadius: 10, background: t.faint, border: `1px solid ${t.border}` }}>
          <Search size={13} color={t.muted} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: t.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 2, background: t.faint, borderRadius: 10, padding: 3 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: activeFilter === f ? 600 : 400, background: activeFilter === f ? (theme === "dark" ? "rgba(255,255,255,0.08)" : "#fff") : "transparent", color: activeFilter === f ? t.text : t.muted, transition: "all 0.15s", boxShadow: activeFilter === f ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
              {f}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", fontSize: 12, color: t.muted }}>
          <Filter size={12} /> Filter
        </button>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 2, background: t.faint, borderRadius: 9, padding: 3 }}>
          {([["list", List], ["grid", Grid]] as any[]).map(([mode, Icon]) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              style={{ width: 30, height: 30, borderRadius: 7, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: viewMode === mode ? (theme === "dark" ? "rgba(255,255,255,0.08)" : "#fff") : "transparent", color: viewMode === mode ? t.text : t.muted }}>
              <Icon size={13} />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        style={{ borderRadius: 16, background: t.card, border: `1px solid ${t.border}`, overflow: "hidden", boxShadow: theme === "light" ? "0 1px 3px rgba(15,5,32,0.04), 0 4px 20px rgba(15,5,32,0.03)" : "none" }}>

        {MOCK_PRODUCTS.length === 0 ? (
          <EmptyState t={t} theme={theme} />
        ) : (
          <div style={{ padding: 16 }}>Products list here</div>
        )}
      </motion.div>
    </div>
    </>
  );
}
