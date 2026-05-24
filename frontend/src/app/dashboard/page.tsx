"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCurrency } from "../../lib/currency";
import {
  TrendingUp, ShoppingCart, Users, Package, Zap,
  ChevronRight, Store, Flame, Activity, ArrowUpRight,
  AlertCircle, Clock, CheckCircle2, RefreshCw
} from "lucide-react";
import { useTheme } from "../../components/layout/DashboardLayout";
import { useAuthStore } from "../../store/auth.store";
import { api } from "../../lib/api";

const V = { v500: "#6B35E8", v400: "#8B5CF6", v300: "#A78BFA", cyan: "#06B6D4", green: "#10B981", amber: "#F59E0B", red: "#EF4444" };

const fmt = (n: number) => new Intl.NumberFormat("en-NG", { style:"currency", currency:"NGN", maximumFractionDigits:0 }).format(n||0);

function StatCard({ label, value, delta, color, icon: Icon, delay = 0 }: any) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = { card: isDark ? "#181230" : "#fff", border: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,5,32,0.07)", text: isDark ? "#fff" : "#0D0918", muted: isDark ? "rgba(255,255,255,0.38)" : "rgba(13,9,24,0.45)" };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      style={{ padding: 18, borderRadius: 16, background: t.card, border: `1px solid ${t.border}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}18` }}>
          <Icon size={16} color={color} />
        </div>
        {delta !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 700, color: delta >= 0 ? V.green : V.red, background: delta >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", padding: "3px 8px", borderRadius: 99 }}>
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      <p style={{ fontSize: 22, fontWeight: 900, color: t.text, letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 12, color: t.muted, marginTop: 4 }}>{label}</p>
    </motion.div>
  );
}

function OrderRow({ order, t }: any) {
  const statusColors: Record<string, string> = {
    PENDING: V.amber, COMPLETED: V.green, SHIPPED: V.cyan,
    DELIVERED: V.v400, CANCELLED: V.red, PROCESSING: V.cyan,
  };
  const color = statusColors[order.status] || V.amber;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${t.border}` }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <ShoppingCart size={13} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {order.customerName || "Customer"}
        </p>
        <p style={{ fontSize: 11, color: t.muted, marginTop: 1 }}>#{order.orderNumber || order.id?.slice(-6)}</p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{fmt(order.total)}</p>
        <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}15`, padding: "2px 6px", borderRadius: 99 }}>
          {order.status}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const isDark = theme === "dark";
  const [greeting, setGreeting] = useState("morning");
  const { fmt, code, symbol } = useCurrency();
  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const storeId = user?.stores?.[0]?.id;
  const storeSlug = user?.stores?.[0]?.slug;

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "morning" : h < 17 ? "afternoon" : "evening");
  }, []);

  const t = {
    card:   isDark ? "#181230" : "#fff",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,5,32,0.07)",
    text:   isDark ? "#fff"    : "#0D0918",
    muted:  isDark ? "rgba(255,255,255,0.38)" : "rgba(13,9,24,0.45)",
    faint:  isDark ? "rgba(255,255,255,0.03)" : "rgba(15,5,32,0.02)",
  };

  const { data: analytics } = useQuery({
    queryKey: ["dashboard-analytics", storeId],
    queryFn:  () => api.get(`/analytics/${storeId}?period=7`).then(r => r.data.data),
    enabled:  !!storeId,
    staleTime: 60000,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["dashboard-orders", storeId],
    queryFn:  () => api.get(`/orders/${storeId}?limit=5`).then(r => r.data.data?.orders || r.data.data || []),
    enabled:  !!storeId,
    staleTime: 30000,
  });

  const { data: pulse } = useQuery({
    queryKey: ["kiro-pulse", storeId],
    queryFn:  () => api.get(`/kai/pulse?storeId=${storeId}&limit=3`).then(r => r.data.data || []),
    enabled:  !!storeId,
    staleTime: 120000,
  });

  const stats = analytics?.stats || {};
  const orders = Array.isArray(recentOrders) ? recentOrders : [];
  // Deduplicate alerts by message to avoid showing same alert multiple times
  const rawAlerts = Array.isArray(pulse) ? pulse : [];
  const seen = new Set<string>();
  const alerts = rawAlerts.filter((a: any) => {
    const key = a.message || a.title || JSON.stringify(a);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 4);

  const statCards = [
    { label: "Revenue (7d)",  value: fmt(stats.revenue || 0),          delta: stats.revenueDelta,  color: V.v400,  icon: TrendingUp  },
    { label: "Orders (7d)",   value: (stats.orders    || 0).toLocaleString(), delta: stats.ordersDelta, color: V.cyan,  icon: ShoppingCart },
    { label: "Customers",     value: (stats.customers || 0).toLocaleString(), delta: undefined,         color: V.green, icon: Users        },
    { label: "Products",      value: (stats.products  || 0).toLocaleString(), delta: undefined,         color: V.amber, icon: Package      },
  ];

  const quickActions = [
    { label: "Add Product",  href: "/dashboard/products",   icon: Package,   color: V.v400  },
    { label: "View Store",   href: storeSlug ? `/store/${storeSlug}` : "/dashboard/stores", icon: Store, color: V.cyan, target: "_blank" },
    { label: "Flash Sale",   href: "/dashboard/flash-sales",icon: Flame,     color: V.amber },
    { label: "Analytics",    href: "/dashboard/analytics",  icon: Activity,  color: V.green },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em", color: t.text, marginBottom: 4 }}>
          Good {greeting}, {firstName} 👋
        </h1>
        <p style={{ fontSize: 13, color: t.muted }}>
          {user?.stores?.[0]?.name || "Your store"} · {new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </motion.div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }} className="grid-cols-2 sm:grid-cols-4">
        {statCards.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.07} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }} className="grid-1col lg:grid-2col">
        {/* Left: Recent Orders */}
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ padding: 18, borderRadius: 16, background: t.card, border: `1px solid ${t.border}`, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Recent Orders</span>
              <Link href="/dashboard/orders" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: V.v400, textDecoration: "none", fontWeight: 600 }}>
                View all <ChevronRight size={13} />
              </Link>
            </div>
            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <ShoppingCart size={28} style={{ color: t.muted, margin: "0 auto 8px" }} />
                <p style={{ fontSize: 12, color: t.muted }}>No orders yet. Share your store link to get your first sale.</p>
                {storeSlug && (
                  <a href={`/store/${storeSlug}`} target="_blank" rel="noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 12, fontWeight: 700, color: V.v400, textDecoration: "none", background: "rgba(107,53,232,0.08)", padding: "6px 14px", borderRadius: 99, border: "1px solid rgba(107,53,232,0.2)" }}>
                    <Store size={11} /> View your store <ArrowUpRight size={11} />
                  </a>
                )}
              </div>
            ) : (
              <div>
                {orders.slice(0, 5).map((o: any) => <OrderRow key={o.id} order={o} t={t} />)}
              </div>
            )}
          </motion.div>

          {/* KIRO Pulse Alerts */}
          {alerts.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              style={{ padding: 18, borderRadius: 16, background: t.card, border: `1px solid ${t.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Zap size={14} color={V.v400} />
                <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>KIRO Alerts</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {alerts.map((a: any) => (
                  <div key={a.id} style={{ display: "flex", gap: 10, padding: 10, borderRadius: 10, background: t.faint, border: `1px solid ${t.border}` }}>
                    <AlertCircle size={13} color={a.severity === "high" ? V.red : V.amber} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{a.title}</p>
                      <p style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>{a.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* KIRO CTA */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
            style={{ padding: 18, borderRadius: 16, background: "linear-gradient(135deg,#2D1B69,#1a0f3c)", border: "1px solid rgba(107,53,232,0.3)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(107,53,232,0.15)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(107,53,232,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={13} color={V.v300} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: V.v300 }}>KIRO</span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>What do you want to build today?</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 14, lineHeight: 1.5 }}>
              Import products, write copy, run a sale, or just ask anything about your store.
            </p>
            <Link href="/kiro">
              <button style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: "none", cursor: "pointer", background: "rgba(107,53,232,0.4)", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Zap size={12} /> Chat with KIRO
              </button>
            </Link>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.32 }}
            style={{ padding: 18, borderRadius: 16, background: t.card, border: `1px solid ${t.border}` }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: t.text, display: "block", marginBottom: 12 }}>Quick Actions</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {quickActions.map(a => {
                const Icon = a.icon;
                return (
                  <Link key={a.label} href={a.href} target={(a as any).target} style={{ textDecoration: "none" }}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: 12, borderRadius: 12, cursor: "pointer", background: t.faint, border: `1px solid ${t.border}` }}>
                      <div style={{ width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: `${a.color}15` }}>
                        <Icon size={14} color={a.color} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: t.muted, textAlign: "center" }}>{a.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Store status */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.38 }}
            style={{ padding: 18, borderRadius: 16, background: t.card, border: `1px solid ${t.border}` }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: t.text, display: "block", marginBottom: 12 }}>Store Status</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Store live",      done: !!user?.stores?.[0]?.id,        icon: Store         },
                { label: "Products added",  done: (stats.products || 0) > 0,       icon: Package       },
                { label: "First order",     done: (stats.orders   || 0) > 0,       icon: ShoppingCart  },
                { label: "Payment setup",   done: !!user?.stores?.[0]?.id,        icon: CheckCircle2  },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: item.done ? "rgba(16,185,129,0.1)" : t.faint, flexShrink: 0 }}>
                      <Icon size={11} color={item.done ? V.green : t.muted} />
                    </div>
                    <span style={{ fontSize: 12, color: item.done ? t.text : t.muted, flex: 1 }}>{item.label}</span>
                    {item.done
                      ? <CheckCircle2 size={13} color={V.green} />
                      : <Clock size={13} style={{ color: t.muted }} />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media(max-width:900px){
          .grid-cols-2{grid-template-columns:1fr 1fr!important}
          .grid-1col.lg\\:grid-2col{grid-template-columns:1fr!important}
        }
        @media(max-width:480px){
          .grid-cols-2{grid-template-columns:1fr 1fr!important}
        }
      `}</style>
    </div>
  );
}
