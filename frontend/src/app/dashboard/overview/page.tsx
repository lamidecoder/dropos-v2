"use client";
﻿"use client";
// ============================================================
// Dashboard Overview — Premium Home Screen
// Path: frontend/src/app/dashboard/overview/page.tsx
// ============================================================
import { useState }      from "react";
import { useQuery }      from "@tanstack/react-query";
import { motion }        from "framer-motion";
import { api }           from "@/lib/api";
import { useAuthStore }  from "@/store/auth.store";
import KAIChat           from "@/components/kai/KAIChat";
import {
  TrendingUp, Package, Users, ShoppingCart,
  ArrowUpRight, ArrowDownRight, Bell,
  Zap, ChevronRight, Clock, AlertCircle,
} from "lucide-react";

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, sub, trend, color, icon: Icon, delay = 0 }: any) {
  const isUp = trend >= 0;
  return (
    <motion.div className="rounded-2xl p-4 relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", damping: 22 }}>
      {/* Glow */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ background: color, transform: "translate(30%,-30%)" }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-xs"
            style={{ color: isUp ? "#34d399" : "#f87171" }}>
            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-black text-white mb-0.5">{value}</p>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</p>}
    </motion.div>
  );
}

// ── KAI Pulse Alert ───────────────────────────────────────────
function PulseAlert({ alert }: { alert: any }) {
  const colors: Record<string,string> = {
    critical: "#f87171", warning: "#fbbf24",
    success:  "#34d399", info:    "#60a5fa",
  };
  const c = colors[alert.severity] || "#60a5fa";
  return (
    <motion.div className="flex items-start gap-3 px-4 py-3 rounded-2xl"
      style={{ background: `${c}08`, border: `1px solid ${c}20` }}
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
        style={{ background: c }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{alert.title}</p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
          {alert.message}
        </p>
      </div>
      {alert.suggestedPrompt && (
        <button className="text-xs flex items-center gap-1 flex-shrink-0"
          style={{ color: c }}>
          Ask KIRO <ChevronRight size={10} />
        </button>
      )}
    </motion.div>
  );
}

// ── Quick Action ──────────────────────────────────────────────
function QuickAction({ emoji, label, href, color }: any) {
  return (
    <a href={href}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{ background: `${color}15` }}>
        {emoji}
      </div>
      <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.3 }}>{label}</p>
    </a>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export default function OverviewPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const name    = user?.name?.split(" ")[0] || "there";
  const [showKAI, setShowKAI] = useState(false);

  const { data: analytics } = useQuery({
    queryKey: ["analytics", storeId],
    queryFn:  async () => { const r = await api.get(`/analytics?storeId=${storeId}`); return r.data.data; },
    enabled:  !!storeId,
  });

  const { data: pulseAlerts } = useQuery({
    queryKey: ["pulse", storeId],
    queryFn:  async () => {
      const r = await api.get(`/kai/pulse?storeId=${storeId}&limit=5`);
      return r.data.data || [];
    },
    enabled:  !!storeId,
    refetchInterval: 2 * 60 * 1000,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["recent-orders", storeId],
    queryFn:  async () => {
      const r = await api.get(`/orders?storeId=${storeId}&limit=5&status=PAID`);
      return r.data.data?.orders || r.data.data || [];
    },
    enabled:  !!storeId,
  });

  const a       = analytics || {};
  const alerts  = (pulseAlerts || []) as any[];
  const orders  = (recentOrders || []) as any[];
  const criticals = alerts.filter((a: any) => a.severity === "critical" || a.severity === "warning");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    
      <div className="min-h-screen" style={{ background: "#07070e" }}>
        <div className="max-w-2xl mx-auto px-5 pt-6 pb-10">

          {/* Greeting */}
          <motion.div className="mb-6"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              {greeting},
            </p>
            <h1 className="text-xl font-semibold text-white">{name} 👋</h1>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              {new Date().toLocaleDateString("en-NG", { weekday:"long", day:"numeric", month:"long" })}
            </p>
          </motion.div>

          {/* Critical alerts */}
          {criticals.length > 0 && (
            <div className="mb-5 space-y-2">
              {criticals.slice(0,2).map((alert: any, i: number) => (
                <PulseAlert key={i} alert={alert} />
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard
              label="Today's Revenue" icon={TrendingUp} color="#34d399"
              value={`₦${((a.todayRevenue || 0)/1000).toFixed(0)}k`}
              trend={a.revenueGrowth || 0} delay={0}
              sub={`${a.todayOrders || 0} orders`} />
            <StatCard
              label="Need Fulfillment" icon={Package} color="#60a5fa"
              value={orders.length || 0}
              delay={0.05}
              sub="Click to fulfill" />
            <StatCard
              label="Total Customers" icon={Users} color="#a78bfa"
              value={a.totalCustomers || 0}
              trend={a.customerGrowth || 0} delay={0.1} />
            <StatCard
              label="This Month" icon={ShoppingCart} color="#fbbf24"
              value={`₦${((a.monthRevenue || 0)/1000).toFixed(0)}k`}
              delay={0.15}
              sub={`${a.monthOrders || 0} orders`} />
          </div>

          {/* New orders needing action */}
          {orders.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-white">Needs Fulfillment</p>
                <a href="/dashboard/orders" className="text-xs" style={{ color: "#a78bfa" }}>
                  See all
                </a>
              </div>
              <div className="space-y-2">
                {orders.slice(0,3).map((order: any, i: number) => (
                  <motion.a key={order.id} href="/dashboard/orders"
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.15)" }}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    whileHover={{ borderColor: "rgba(96,165,250,0.35)" }}>
                    <motion.div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: "#60a5fa" }}
                      animate={{ scale: [1,1.4,1] }}
                      transition={{ duration: 1.8, repeat: Infinity }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{order.customer?.name}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="text-sm font-bold" style={{ color: "#60a5fa" }}>
                      ₦{Number(order.total || 0).toLocaleString()}
                    </p>
                    <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                  </motion.a>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-white mb-3">Quick Actions</p>
            <div className="grid grid-cols-4 gap-2">
              <QuickAction emoji="📦" label="Orders"     href="/dashboard/orders"       color="#60a5fa" />
              <QuickAction emoji="➕" label="Add Product"href="/dashboard/products/new" color="#34d399" />
              <QuickAction emoji="🔥" label="Top 10"     href="/dashboard/top-products" color="#f97316" />
              <QuickAction emoji="📊" label="Analytics"  href="/dashboard/analytics"   color="#a78bfa" />
              <QuickAction emoji="🎯" label="Ad Spy"     href="/dashboard/ad-spy"       color="#e1306c" />
              <QuickAction emoji="✍️" label="TikTok"     href="/dashboard/tiktok-scripts" color="#ff4d4d" />
              <QuickAction emoji="⚙️" label="Autopilot"  href="/dashboard/autopilot"   color="#fbbf24" />
              <QuickAction emoji="🛒" label="Import"     href="/dashboard/import"       color="#25d366" />
            </div>
          </div>

          {/* KAI shortcut */}
          <motion.button
            onClick={() => setShowKAI(!showKAI)}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
            whileHover={{ borderColor: "rgba(124,58,237,0.4)" }}
            whileTap={{ scale: 0.99 }}>
            <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white"
              style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}
              animate={{ boxShadow: ["0 0 0px #7c3aed30","0 0 16px #7c3aed50","0 0 0px #7c3aed30"] }}
              transition={{ duration: 3, repeat: Infinity }}>
              K
            </motion.div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">Ask KIRO anything</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                "What should I sell this week?" · "Write me a TikTok script"
              </p>
            </div>
            <Zap size={16} style={{ color: "#a78bfa" }} />
          </motion.button>

        </div>
      </div>
    
  );
}
