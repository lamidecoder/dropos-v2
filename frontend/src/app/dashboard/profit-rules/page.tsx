"use client";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ProfitRulesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card:   isDark ? "#181230" : "#fff",
    border: isDark ? "rgba(255,255,255,0.07)" : "rgba(107,53,232,0.08)",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.45)" : "rgba(19,13,46,0.55)",
    faint:  isDark ? "rgba(255,255,255,0.03)" : "rgba(107,53,232,0.03)",
  };
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} className="mb-8">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1.5" style={{ color:t.text }}>💰 Profit Rules</h1>
        <p className="text-sm" style={{ color:t.muted }}>Set rules. KIRO enforces them automatically.</p>
      </motion.div>
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
        className="rounded-2xl p-10 text-center mb-5" style={{ background:t.card, border:`1px solid ${t.border}` }}>
        <div className="text-5xl mb-5">💰</div>
        <h2 className="text-xl font-black mb-3" style={{ color:t.text, letterSpacing:"-0.5px" }}>Profit Rules</h2>
        <p className="text-sm leading-relaxed mb-6 max-w-md mx-auto" style={{ color:t.muted }}>Tell KIRO your minimum margin. It automatically adjusts prices, flags products below target, and alerts you before you sell at a loss.</p>
        <Link href="/dashboard/kiro">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", border:"none", cursor:"pointer" }}>
            <Zap size={13}/> Ask KIRO <ArrowRight size={13}/>
          </button>
        </Link>
      </motion.div>
      <div className="grid sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="p-4 rounded-2xl" style={{ background:t.faint, border:`1px solid ${t.border}` }}>
          <div className="text-2xl mb-2">🎯</div>
          <p className="text-sm font-semibold mb-1" style={{ color:t.text }}>Margin targets</p>
          <p className="text-xs leading-relaxed" style={{ color:t.muted }}>Set minimum profit margins per product category</p>
        </motion.div>
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18 }}
          className="p-4 rounded-2xl" style={{ background:t.faint, border:`1px solid ${t.border}` }}>
          <div className="text-2xl mb-2">🔄</div>
          <p className="text-sm font-semibold mb-1" style={{ color:t.text }}>Auto-adjust</p>
          <p className="text-xs leading-relaxed" style={{ color:t.muted }}>KIRO reprices when supplier costs change</p>
        </motion.div>
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.26 }}
          className="p-4 rounded-2xl" style={{ background:t.faint, border:`1px solid ${t.border}` }}>
          <div className="text-2xl mb-2">📊</div>
          <p className="text-sm font-semibold mb-1" style={{ color:t.text }}>Profit reports</p>
          <p className="text-xs leading-relaxed" style={{ color:t.muted }}>See actual profit after all costs</p>
        </motion.div>
      </div>
    </div>
  );
}