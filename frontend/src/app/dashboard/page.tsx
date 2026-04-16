"use client";
// Path: frontend/src/app/dashboard/page.tsx
// World-class Overview — light default, dark mode, app-like

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp, ShoppingCart, Users, Package,
  Zap, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Sparkles, ChevronRight, Clock, AlertCircle,
  Store, Flame, Star, Activity, Eye,
} from "lucide-react";
import { useTheme } from "../../components/layout/DashboardLayout";
import { useAuthStore } from "../../store/auth.store";

// ── STAT CARD ─────────────────────────────────────────────────
function StatCard({
  label, value, change, changeType, icon: Icon, color, delay = 0, theme
}: {
  label: string; value: string; change: string;
  changeType: "up" | "down" | "neutral"; icon: any;
  color: string; delay?: number; theme: "light" | "dark";
}) {
  const isLight = theme === "light";
  const isUp = changeType === "up";
  const isDown = changeType === "down";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="rounded-2xl p-5 relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-0.5"
      style={{
        background: isLight ? "#fff" : "#1A1330",
        border: `1px solid ${isLight ? "rgba(15,5,32,0.06)" : "rgba(255,255,255,0.06)"}`,
        boxShadow: isLight ? "0 1px 3px rgba(15,5,32,0.04), 0 4px 20px rgba(15,5,32,0.03)" : "none",
      }}
    >
      {/* Subtle gradient top */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-50"
        style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: isLight ? "rgba(15,5,32,0.04)" : "rgba(255,255,255,0.06)" }}>
          <MoreHorizontal size={13} style={{ color: isLight ? "rgba(15,5,32,0.4)" : "rgba(255,255,255,0.4)" }} />
        </button>
      </div>

      <div className="mb-1">
        <div className="sora text-2xl font-bold tracking-tight"
          style={{ color: isLight ? "#0F0520" : "#F0EEFF" }}>
          {value}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[12px]" style={{ color: isLight ? "rgba(15,5,32,0.45)" : "rgba(255,255,255,0.4)" }}>
          {label}
        </span>
        <div className="flex items-center gap-1">
          {isUp && <ArrowUpRight size={11} className="text-emerald-500" />}
          {isDown && <ArrowDownRight size={11} className="text-red-400" />}
          <span className="text-[11px] font-semibold"
            style={{ color: isUp ? "#10b981" : isDown ? "#f87171" : isLight ? "rgba(15,5,32,0.4)" : "rgba(255,255,255,0.3)" }}>
            {change}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── ORDER ROW ─────────────────────────────────────────────────
function OrderRow({ order, theme, delay = 0 }: { order: any; theme: "light" | "dark"; delay?: number }) {
  const isLight = theme === "light";
  const statusColors: Record<string, { bg: string; text: string }> = {
    PAID:       { bg: "rgba(16,185,129,0.1)",  text: "#10b981" },
    PENDING:    { bg: "rgba(245,158,11,0.1)",   text: "#f59e0b" },
    SHIPPED:    { bg: "rgba(59,130,246,0.1)",   text: "#3b82f6" },
    CANCELLED:  { bg: "rgba(239,68,68,0.1)",    text: "#ef4444" },
    DELIVERED:  { bg: "rgba(124,58,237,0.1)",   text: "#7C3AED" },
  };
  const s = statusColors[order.status] || statusColors.PENDING;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center gap-4 py-3 group cursor-pointer transition-all hover:px-2 rounded-xl -mx-2"
      style={{ borderBottom: `1px solid ${isLight ? "rgba(15,5,32,0.04)" : "rgba(255,255,255,0.04)"}` }}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
        style={{ background: isLight ? "rgba(15,5,32,0.05)" : "rgba(255,255,255,0.06)", color: isLight ? "rgba(15,5,32,0.5)" : "rgba(255,255,255,0.4)" }}>
        #{order.id}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium truncate" style={{ color: isLight ? "#0F0520" : "#F0EEFF" }}>
          {order.customer}
        </div>
        <div className="text-[11px] truncate" style={{ color: isLight ? "rgba(15,5,32,0.4)" : "rgba(255,255,255,0.3)" }}>
          {order.items} item{order.items !== 1 ? "s" : ""} · {order.time}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-[13px] font-semibold sora" style={{ color: isLight ? "#0F0520" : "#F0EEFF" }}>
          {order.amount}
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: s.bg, color: s.text }}>
          {order.status}
        </span>
      </div>
    </motion.div>
  );
}

// ── KIRO INSIGHT CARD ─────────────────────────────────────────
function KIROInsight({ text, type, theme }: { text: string; type: "tip" | "alert" | "win"; theme: "light" | "dark" }) {
  const isLight = theme === "light";
  const icons = { tip: Sparkles, alert: AlertCircle, win: Star };
  const colors = { tip: "#7C3AED", alert: "#f59e0b", win: "#10b981" };
  const Icon = icons[type];
  const color = colors[type];

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl"
      style={{
        background: `${color}08`,
        border: `1px solid ${color}20`,
      }}
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <p className="text-[12px] leading-relaxed flex-1"
        style={{ color: isLight ? "rgba(15,5,32,0.65)" : "rgba(255,255,255,0.6)" }}>
        {text}
      </p>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function DashboardPage() {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const isLight = theme === "light";
  const firstName = user?.name?.split(" ")[0] || "there";

  // Mock data — will be replaced with real API calls
  const stats = [
    { label: "Total Revenue", value: "₦0", change: "—", changeType: "neutral" as const, icon: TrendingUp, color: "#7C3AED" },
    { label: "Total Orders",  value: "0",   change: "—", changeType: "neutral" as const, icon: ShoppingCart, color: "#3b82f6" },
    { label: "Customers",     value: "0",   change: "—", changeType: "neutral" as const, icon: Users, color: "#10b981" },
    { label: "Products",      value: "0",   change: "—", changeType: "neutral" as const, icon: Package, color: "#f59e0b" },
  ];

  const recentOrders: any[] = [];

  const kiroInsights = [
    { text: "Your store is ready. Ask KIRO to set up your first product collection.", type: "tip" as const },
    { text: "Add a custom domain to build trust with customers and boost conversions.", type: "tip" as const },
    { text: "Enable abandoned cart recovery — KIRO recovers up to 15% of lost sales automatically.", type: "win" as const },
  ];

  const quickActions = [
    { label: "Add Product",    href: "/dashboard/products/new",  icon: Package,   color: "#7C3AED" },
    { label: "View Store",     href: "#",                         icon: Store,     color: "#3b82f6" },
    { label: "Flash Sale",     href: "/dashboard/flash-sales",    icon: Flame,     color: "#f59e0b" },
    { label: "Analytics",      href: "/dashboard/analytics",      icon: Activity,  color: "#10b981" },
  ];

  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const h = new Date().getHours();
      setTime(h < 12 ? "morning" : h < 17 ? "afternoon" : "evening");
    };
    update();
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="sora font-bold text-2xl leading-tight"
            style={{ color: isLight ? "#0F0520" : "#F0EEFF" }}>
            Good {time}, {firstName} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: isLight ? "rgba(15,5,32,0.45)" : "rgba(255,255,255,0.4)" }}>
            Here's what's happening with your store today.
          </p>
        </div>

        <Link href="/dashboard/kai">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
              boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
            }}
          >
            <Zap size={15} className="text-white" />
            <span className="text-[13px] font-semibold text-white sora">Ask KIRO</span>
            <ChevronRight size={13} className="text-white/60" />
          </motion.div>
        </Link>
      </motion.div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.08} theme={theme} />
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl p-5"
          style={{
            background: isLight ? "#fff" : "#1A1330",
            border: `1px solid ${isLight ? "rgba(15,5,32,0.06)" : "rgba(255,255,255,0.06)"}`,
            boxShadow: isLight ? "0 1px 3px rgba(15,5,32,0.04), 0 4px 20px rgba(15,5,32,0.03)" : "none",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="sora font-semibold text-[15px]" style={{ color: isLight ? "#0F0520" : "#F0EEFF" }}>
              Recent Orders
            </h2>
            <Link href="/dashboard/orders">
              <span className="text-[12px] font-medium flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ color: "#7C3AED" }}>
                View all <ArrowUpRight size={11} />
              </span>
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: isLight ? "rgba(15,5,32,0.04)" : "rgba(255,255,255,0.05)" }}
              >
                <ShoppingCart size={22} style={{ color: isLight ? "rgba(15,5,32,0.2)" : "rgba(255,255,255,0.2)" }} />
              </div>
              <p className="text-[13px] font-medium mb-1" style={{ color: isLight ? "rgba(15,5,32,0.5)" : "rgba(255,255,255,0.4)" }}>
                No orders yet
              </p>
              <p className="text-[12px]" style={{ color: isLight ? "rgba(15,5,32,0.3)" : "rgba(255,255,255,0.25)" }}>
                Your first order will appear here
              </p>
              <Link href="/dashboard/kai">
                <div
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium cursor-pointer transition-all hover:opacity-80"
                  style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}
                >
                  <Zap size={12} />
                  Ask KIRO to help get first sales
                </div>
              </Link>
            </div>
          ) : (
            <div>
              {recentOrders.map((order, i) => (
                <OrderRow key={order.id} order={order} theme={theme} delay={i * 0.06} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Right column */}
        <div className="space-y-4">
          {/* KIRO Insights */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="rounded-2xl p-5"
            style={{
              background: isLight ? "#fff" : "#1A1330",
              border: `1px solid ${isLight ? "rgba(15,5,32,0.06)" : "rgba(255,255,255,0.06)"}`,
              boxShadow: isLight ? "0 1px 3px rgba(15,5,32,0.04), 0 4px 20px rgba(15,5,32,0.03)" : "none",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}>
                <Zap size={13} className="text-white" />
              </div>
              <h2 className="sora font-semibold text-[14px]" style={{ color: isLight ? "#0F0520" : "#F0EEFF" }}>
                KIRO Insights
              </h2>
            </div>
            <div className="space-y-2">
              {kiroInsights.map((insight, i) => (
                <KIROInsight key={i} {...insight} theme={theme} />
              ))}
            </div>
            <Link href="/dashboard/kai">
              <div
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer transition-all hover:opacity-80"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                  color: "#fff",
                }}
              >
                <Sparkles size={12} />
                Chat with KIRO
              </div>
            </Link>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="rounded-2xl p-5"
            style={{
              background: isLight ? "#fff" : "#1A1330",
              border: `1px solid ${isLight ? "rgba(15,5,32,0.06)" : "rgba(255,255,255,0.06)"}`,
              boxShadow: isLight ? "0 1px 3px rgba(15,5,32,0.04), 0 4px 20px rgba(15,5,32,0.03)" : "none",
            }}
          >
            <h2 className="sora font-semibold text-[14px] mb-4" style={{ color: isLight ? "#0F0520" : "#F0EEFF" }}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <Link href={action.href} key={action.label}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer transition-all"
                      style={{
                        background: isLight ? "rgba(15,5,32,0.03)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${isLight ? "rgba(15,5,32,0.05)" : "rgba(255,255,255,0.05)"}`,
                      }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: `${action.color}15` }}>
                        <Icon size={15} style={{ color: action.color }} />
                      </div>
                      <span className="text-[11px] font-medium text-center"
                        style={{ color: isLight ? "rgba(15,5,32,0.6)" : "rgba(255,255,255,0.5)" }}>
                        {action.label}
                      </span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Store health */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="rounded-2xl p-5"
            style={{
              background: "linear-gradient(135deg, #7C3AED15, #5B21B610)",
              border: "1px solid rgba(124,58,237,0.2)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-semibold sora" style={{ color: isLight ? "#0F0520" : "#F0EEFF" }}>
                Store Health
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "rgba(124,58,237,0.15)", color: "#7C3AED" }}>
                Setup needed
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full mb-2"
              style={{ background: isLight ? "rgba(15,5,32,0.08)" : "rgba(255,255,255,0.08)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "15%" }}
                transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #7C3AED, #9D6EFF)" }}
              />
            </div>

            <p className="text-[11px]" style={{ color: isLight ? "rgba(15,5,32,0.5)" : "rgba(255,255,255,0.4)" }}>
              Complete your store setup to unlock full potential
            </p>

            <Link href="/dashboard/kai">
              <div className="mt-3 flex items-center gap-1.5 text-[12px] font-medium cursor-pointer hover:opacity-70 transition-opacity"
                style={{ color: "#7C3AED" }}>
                <Zap size={11} /> Ask KIRO to complete setup
                <ChevronRight size={11} />
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}