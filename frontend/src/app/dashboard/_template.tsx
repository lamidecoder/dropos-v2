// _page-template.tsx
// Use this pattern for remaining pages

"use client";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { Zap, ChevronRight } from "lucide-react";
import Link from "next/link";

const V = { v500: "#6B35E8", v700: "#3D1C8A", v400: "#8B5CF6", v300: "#A78BFA" };

export default function GenericPage({ title, description, icon: Icon, color }: { title: string; description: string; icon: any; color: string }) {
  const { theme } = useTheme();
  const t = theme === "dark"
    ? { card: "#181230", border: "rgba(255,255,255,0.06)", text: "#fff", muted: "rgba(255,255,255,0.38)", faint: "rgba(255,255,255,0.04)" }
    : { card: "#fff", border: "rgba(15,5,32,0.07)", text: "#0D0918", muted: "rgba(13,9,24,0.45)", faint: "rgba(15,5,32,0.03)" };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: t.text }}>{title}</h1>
        <p style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>{description}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ padding: 24, borderRadius: 16, background: t.card, border: `1px solid ${t.border}`, boxShadow: theme === "light" ? "0 1px 3px rgba(15,5,32,0.04), 0 4px 20px rgba(15,5,32,0.03)" : "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, background: `${color}12`, border: `1px solid ${color}25` }}>
          <Icon size={28} color={color} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: t.text, marginBottom: 8 }}>Nothing here yet</h3>
        <p style={{ fontSize: 13, color: t.muted, maxWidth: 360, lineHeight: 1.6, marginBottom: 24 }}>
          {description}. Ask KIRO for help getting started with this feature.
        </p>
        <Link href="/dashboard/kiro">
          <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${V.v500}, ${V.v700})`, color: "#fff", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 16px rgba(107,53,232,0.35)" }}>
            <Zap size={13} /> Ask KIRO <ChevronRight size={13} />
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
