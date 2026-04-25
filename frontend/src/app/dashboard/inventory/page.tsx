"use client";
﻿"use client";
// Path: frontend/src/app/dashboard/inventory/page.tsx
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { BarChart2, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function InventoryPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card: isDark ? "#181230" : "#fff",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,5,32,0.07)",
    text: isDark ? "#fff" : "#0D0918",
    muted: isDark ? "rgba(255,255,255,0.38)" : "rgba(13,9,24,0.45)",
    shadow: isDark ? "none" : "0 1px 3px rgba(15,5,32,0.04), 0 4px 20px rgba(15,5,32,0.03)",
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: t.text }}>
          Inventory
        </h1>
        <p style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>
          Track stock levels across all products
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          padding: 24, borderRadius: 16, background: t.card,
          border: `1px solid ${t.border}`, boxShadow: t.shadow,
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minHeight: 420, textAlign: "center"
        }}
      >
        <div style={{
          width: 68, height: 68, borderRadius: 22,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 20,
          background: "#F59E0B12",
          border: "1px solid #F59E0B25"
        }}>
          <BarChart2 size={28} color="#F59E0B" />
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: t.text, marginBottom: 8 }}>
          Nothing here yet
        </h3>
        <p style={{ fontSize: 13, color: t.muted, maxWidth: 380, lineHeight: 1.6, marginBottom: 28 }}>
          Track stock levels across all products. KIRO can help you get started with this right now.
        </p>

        <Link href="/dashboard/kiro">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "10px 22px", borderRadius: 12, border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #6B35E8, #3D1C8A)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              boxShadow: "0 4px 16px rgba(107,53,232,0.35)"
            }}
          >
            <Zap size={13} /> Ask KIRO <ChevronRight size={13} />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
