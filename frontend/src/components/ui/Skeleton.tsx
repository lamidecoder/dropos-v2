"use client";
import { motion } from "framer-motion";
import { useTheme } from "../layout/DashboardLayout";

export function Skeleton({ style, h, w, rounded = 12 }: { style?: React.CSSProperties; h?: number|string; w?: number|string; rounded?: number }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const base  = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const shine = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
  return (
    <motion.div style={{ height:h||"100%", width:w||"100%", borderRadius:rounded, background:base, overflow:"hidden", position:"relative", ...style }}>
      <motion.div style={{ position:"absolute", inset:0, background:`linear-gradient(90deg, transparent 0%, ${shine} 50%, transparent 100%)` }}
        animate={{ x:["-100%","200%"] }} transition={{ duration:1.5, repeat:Infinity, ease:"linear" }} />
    </motion.div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  const { theme } = useTheme(); const isDark = theme === "dark";
  const t = isDark ? { card:"#181230", border:"rgba(255,255,255,0.06)", faint:"rgba(255,255,255,0.04)" } : { card:"#fff", border:"rgba(15,5,32,0.07)", faint:"rgba(15,5,32,0.03)" };
  return (
    <div style={{ borderRadius:16, overflow:"hidden", background:t.card, border:`1px solid ${t.border}` }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderBottom:`1px solid ${t.border}` }}>
          <Skeleton h={36} w={36} rounded={8} style={{ flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <Skeleton h={12} w="50%" rounded={6} style={{ marginBottom:6 }} />
            <Skeleton h={10} w="30%" rounded={6} />
          </div>
          <Skeleton h={24} w={60} rounded={6} style={{ flexShrink:0 }} />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  const cols = Math.min(count, 4);
  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ padding:16, borderRadius:16, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
          <Skeleton h={32} w={32} rounded={10} style={{ marginBottom:12 }} />
          <Skeleton h={24} w="60%" rounded={6} style={{ marginBottom:6 }} />
          <Skeleton h={14} w="40%" rounded={6} />
        </div>
      ))}
    </div>
  );
}
