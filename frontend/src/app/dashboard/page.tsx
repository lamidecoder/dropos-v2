"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import SetupChecklist from "../../components/ui/SetupChecklist";
import {
  TrendingUp, ShoppingCart, Users, Package,
  Zap, Sparkles, ChevronRight, AlertCircle,
  Store, Flame, Activity, ArrowUpRight,
} from "lucide-react";
import { useTheme } from "../../components/layout/DashboardLayout";
import { useAuthStore } from "../../store/auth.store";
import { api } from "../../lib/api";

const V = { v500: "#6B35E8", v400: "#8B5CF6", v300: "#A78BFA", cyan: "#06B6D4" };

export default function DashboardPage() {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const isDark = theme === "dark";
  const firstName = user?.name?.split(" ")[0] || "there";
  const storeId   = user?.stores?.[0]?.id;
  const [greeting, setGreeting] = useState("morning");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "morning" : h < 17 ? "afternoon" : "evening");
  }, []);

  const t = {
    card:   isDark ? "#181230" : "#fff",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,5,32,0.07)",
    text:   isDark ? "#fff" : "#0D0918",
    muted:  isDark ? "rgba(255,255,255,0.38)" : "rgba(13,9,24,0.45)",
    faint:  isDark ? "rgba(255,255,255,0.04)" : "rgba(15,5,32,0.03)",
  };

  const { data: analytics } = useQuery({
    queryKey: ["dashboard-analytics", storeId],
    queryFn:  () => api.get(`/analytics/${storeId}`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["dashboard-orders", storeId],
    queryFn:  () => api.get(`/orders/${storeId}?limit=5`).then(r => r.data.data?.orders || r.data.data || []),
    enabled:  !!storeId,
  });

  const a = analytics || {};
  const orders: any[] = recentOrders || [];

  const stats = [
    { label: "Revenue Today", value: `₦${((a.todayRevenue || 0)/1000).toFixed(0)}k`, color: V.v400,   icon: TrendingUp,  sub: `${a.todayOrders || 0} orders` },
    { label: "Total Orders",  value: a.totalOrders  || "0",                           color: V.cyan,   icon: ShoppingCart, sub: "All time" },
    { label: "Customers",     value: a.totalCustomers || "0",                          color: "#10B981", icon: Users,       sub: "Total" },
    { label: "Products",      value: a.totalProducts  || "0",                          color: "#C026D3", icon: Package,     sub: "Live" },
  ];

  const quickActions = [
    { label: "Add Product", href: "/dashboard/products", icon: Package, color: V.v400 },
    { label: "View Store",  href: "/dashboard/stores",   icon: Store,   color: V.cyan },
    { label: "Flash Sale",  href: "/dashboard/flash-sales", icon: Flame,  color: "#F59E0B" },
    { label: "Analytics",  href: "/dashboard/analytics", icon: Activity, color: "#10B981" },
  ];

  const insights = [
    { text: "Your store is ready. Ask KIRO to set up your first product collection.", color: V.v400, icon: Sparkles },
    { text: "Enable abandoned cart recovery - KIRO recovers up to 15% of lost sales.", color: "#10B981", icon: TrendingUp },
    { text: "Add a custom domain to build trust with customers.", color: "#F59E0B", icon: AlertCircle },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: t.text }}>
            Good {greeting}, {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: t.muted }}>
            Here's what's happening with your store today.
          </p>
        </div>
        <Link href="/dashboard/kiro" className="flex-shrink-0">
          <motion.button whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", boxShadow: "0 4px 16px rgba(107,53,232,0.35)" }}>
            <Zap size={13} /> <span className="hidden sm:inline">Ask</span> KIRO
          </motion.button>
        </Link>
      </motion.div>

      <SetupChecklist />

      {/* Stats grid - 2 col mobile, 4 col desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-4 relative overflow-hidden"
              style={{ background: t.card, border: `1px solid ${t.border}` }}>
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg,transparent,${s.color}60,transparent)` }} />
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}15` }}>
                <Icon size={15} style={{ color: s.color }} />
              </div>
              <p className="text-xl sm:text-2xl font-black mb-0.5" style={{ color: t.text }}>{s.value}</p>
              <p className="text-xs font-semibold" style={{ color: t.text }}>{s.label}</p>
              {s.sub && <p className="text-[10px] mt-0.5" style={{ color: t.muted }}>{s.sub}</p>}
            </motion.div>
          );
        })}
      </div>

      {/* Main 2-col - stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent orders - takes 2/3 on desktop */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: t.card, border: `1px solid ${t.border}` }}>
          <div className="flex items-center justify-between px-4 sm:px-5 py-4" style={{ borderBottom: `1px solid ${t.border}` }}>
            <span className="text-sm font-bold" style={{ color: t.text }}>Recent Orders</span>
            <Link href="/dashboard/orders" className="text-xs font-semibold" style={{ color: V.v300 }}>
              See all <ArrowUpRight size={10} className="inline" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: t.faint }}>
                <ShoppingCart size={20} style={{ color: t.muted }} />
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: t.muted }}>No orders yet</p>
              <p className="text-xs mb-4" style={{ color: t.muted, opacity: 0.7 }}>Your first order will appear here</p>
              <Link href="/dashboard/kiro">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                  style={{ background: "rgba(107,53,232,0.1)", color: V.v300 }}>
                  <Zap size={11} /> Ask KIRO to get first sales
                </div>
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: t.border }}>
              {orders.slice(0, 5).map((order: any) => (
                <Link href="/dashboard/orders" key={order.id}
                  className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-black"
                    style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
                    {(order.customerName || order.customer?.name || "?")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: t.text }}>{order.customerName || order.customer?.name || "Customer"}</p>
                    <p className="text-xs" style={{ color: t.muted }}>{(order.items || []).length} item{(order.items || []).length !== 1 ? "s" : ""}</p>
                  </div>
                  <p className="text-sm font-bold flex-shrink-0" style={{ color: "#10B981" }}>₦{Number(order.total || 0).toLocaleString()}</p>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right col */}
        <div className="flex flex-col gap-4">
          {/* KIRO insights */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
            className="rounded-2xl p-4"
            style={{ background: isDark ? "linear-gradient(135deg,rgba(107,53,232,0.1),rgba(91,33,182,0.05))" : "rgba(107,53,232,0.04)", border: "1px solid rgba(107,53,232,0.2)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(145deg,#6B35E8,#1A0D3D)" }}>
                <Zap size={12} color="white" />
              </div>
              <span className="text-sm font-bold" style={{ color: isDark ? "#C4B5FD" : "#3D1C8A" }}>KIRO Insights</span>
            </div>
            <div className="space-y-2 mb-4">
              {insights.map((ins, i) => {
                const Icon = ins.icon;
                return (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl"
                    style={{ background: `${ins.color}08`, border: `1px solid ${ins.color}20` }}>
                    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${ins.color}20` }}>
                      <Icon size={10} style={{ color: ins.color }} />
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: t.muted }}>{ins.text}</p>
                  </div>
                );
              })}
            </div>
            <Link href="/dashboard/kiro">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
                <Zap size={11} /> Chat with KIRO
              </button>
            </Link>
          </motion.div>

          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
            className="rounded-2xl p-4"
            style={{ background: t.card, border: `1px solid ${t.border}` }}>
            <p className="text-sm font-bold mb-3" style={{ color: t.text }}>Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map(a => {
                const Icon = a.icon;
                return (
                  <Link href={a.href} key={a.label}>
                    <motion.div whileTap={{ scale: 0.96 }}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer"
                      style={{ background: t.faint, border: `1px solid ${t.border}` }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${a.color}15` }}>
                        <Icon size={15} style={{ color: a.color }} />
                      </div>
                      <span className="text-xs font-medium text-center" style={{ color: t.muted }}>{a.label}</span>
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
