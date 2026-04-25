"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, ShoppingCart, Users, Activity,
  ArrowUpRight, ArrowDownRight, Download, Zap,
} from "lucide-react";

const V = { v500: "#6B35E8", v400: "#8B5CF6", cyan: "#06B6D4", fuchsia: "#C026D3" };
const T = {
  dark:  { card: "#181230", border: "rgba(255,255,255,0.06)", text: "#fff", muted: "rgba(255,255,255,0.38)", faint: "rgba(255,255,255,0.04)", grid: "rgba(255,255,255,0.04)" },
  light: { card: "#fff",    border: "rgba(15,5,32,0.07)",    text: "#0D0918", muted: "rgba(13,9,24,0.45)", faint: "rgba(15,5,32,0.03)", grid: "rgba(15,5,32,0.06)" },
};

const PERIODS = ["7 days", "30 days", "90 days", "1 year"];

// Demo data - replaced by real API data when backend is up
function generateDemoData(days: number) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = days <= 7
      ? d.toLocaleDateString("en", { weekday: "short" })
      : days <= 31
        ? d.toLocaleDateString("en", { month: "short", day: "numeric" })
        : d.toLocaleDateString("en", { month: "short" });
    const base = 5000 + Math.random() * 25000;
    const orders = Math.floor(1 + Math.random() * 12);
    data.push({ label, revenue: Math.round(base), orders, visitors: Math.floor(orders * (4 + Math.random() * 6)) });
  }
  return data;
}

const TOP_PRODUCTS = [
  { name: "Brazilian Hair Bundle", sold: 0, revenue: 0, color: V.v400 },
  { name: "LED Face Mask",         sold: 0, revenue: 0, color: V.cyan },
  { name: "Collagen Gummies",      sold: 0, revenue: 0, color: V.fuchsia },
  { name: "Men's Perfume Set",     sold: 0, revenue: 0, color: "#10B981" },
];

const TRAFFIC_SOURCES = [
  { name: "Direct",    value: 38, color: V.v400 },
  { name: "WhatsApp",  value: 29, color: "#25D366" },
  { name: "Instagram", value: 18, color: V.fuchsia },
  { name: "Twitter",   value: 10, color: "#1D9BF0" },
  { name: "Other",     value: 5,  color: "#64748B" },
];

function CustomTooltip({ active, payload, label, t, fmt }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl px-4 py-3 shadow-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }}>
      <p className="text-xs font-semibold mb-2" style={{ color: t.muted }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm font-bold" style={{ color: p.color }}>
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          {p.dataKey === "revenue" ? fmt(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const t = theme === "dark" ? T.dark : T.light;
  const isDark = theme === "dark";
  const [period, setPeriod] = useState("7 days");
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);

  const days = period === "7 days" ? 7 : period === "30 days" ? 30 : period === "90 days" ? 90 : 365;

  const { data: analyticsData } = useQuery({
    queryKey: ["analytics", storeId, period],
    queryFn: () => api.get(`/analytics/${storeId}?period=${period}`).then(r => r.data.data),
    enabled: !!storeId,
  });

  // Use real data if available, demo data otherwise
  const chartData = analyticsData?.daily || generateDemoData(days);
  const isDemo = !analyticsData;

  const totalRevenue  = chartData.reduce((a: number, d: any) => a + (d.revenue || 0), 0);
  const totalOrders   = chartData.reduce((a: number, d: any) => a + (d.orders  || 0), 0);
  const totalVisitors = chartData.reduce((a: number, d: any) => a + (d.visitors || 0), 0);
  const conversion    = totalVisitors > 0 ? ((totalOrders / totalVisitors) * 100).toFixed(1) : "0.0";

  const fmt = (n: number) => {
    const currency = "NGN";
    return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0, notation: n >= 1000000 ? "compact" : "standard" }).format(n);
  };

  const stats = [
    { label: "Total Revenue",  value: fmt(totalRevenue),  delta: 12,  color: V.v400,    icon: TrendingUp },
    { label: "Total Orders",   value: totalOrders,        delta: 8,   color: V.cyan,    icon: ShoppingCart },
    { label: "Visitors",       value: totalVisitors,      delta: 24,  color: V.fuchsia, icon: Users },
    { label: "Conversion",     value: `${conversion}%`,   delta: -2,  color: "#10B981", icon: Activity },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: t.text }}>Analytics</h1>
          <p style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>
            Track your store performance
            {isDemo && <span style={{ color: V.v400 }}> · Demo data - connect backend to see real stats</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period picker */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${t.border}` }}>
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-3 py-2 text-xs font-semibold transition-all"
                style={{
                  background: period === p ? V.v500 : t.card,
                  color: period === p ? "#fff" : t.muted,
                  borderRight: p !== "1 year" ? `1px solid ${t.border}` : "none",
                }}>
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ border: `1px solid ${t.border}`, background: t.card, color: t.muted }}>
            <Download size={12} /> Export
          </button>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{ background: t.card, border: `1px solid ${t.border}` }}>
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)` }} />
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                <s.icon size={15} style={{ color: s.color }} />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold"
                style={{ color: s.delta >= 0 ? "#10B981" : "#EF4444" }}>
                {s.delta >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(s.delta)}%
              </div>
            </div>
            <p className="text-xl font-black mb-0.5" style={{ color: t.text }}>{s.value}</p>
            <p className="text-xs" style={{ color: t.muted }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl p-5 mb-4"
        style={{ background: t.card, border: `1px solid ${t.border}` }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-sm" style={{ color: t.text }}>Revenue</h2>
            <p className="text-xs mt-0.5" style={{ color: t.muted }}>{period}</p>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: t.muted }}>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: V.v400 }} />Revenue</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={V.v400} stopOpacity={0.25} />
                <stop offset="100%" stopColor={V.v400} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: t.muted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: t.muted }} axisLine={false} tickLine={false}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
            <Tooltip content={<CustomTooltip t={t} fmt={fmt} />} />
            <Area type="monotone" dataKey="revenue" stroke={V.v400} strokeWidth={2} fill="url(#revGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Orders + Traffic row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Orders bar chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: t.card, border: `1px solid ${t.border}` }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-sm" style={{ color: t.text }}>Orders</h2>
            <div className="text-xs" style={{ color: t.muted }}>{period}</div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: t.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: t.muted }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip t={t} fmt={fmt} />} />
              <Bar dataKey="orders" fill={V.cyan} radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Traffic sources */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl p-5"
          style={{ background: t.card, border: `1px solid ${t.border}` }}>
          <h2 className="font-bold text-sm mb-5" style={{ color: t.text }}>Traffic Sources</h2>
          <div className="flex justify-center mb-4">
            <PieChart width={140} height={140}>
              <Pie data={TRAFFIC_SOURCES} cx={70} cy={70} innerRadius={45} outerRadius={65} dataKey="value" strokeWidth={0}>
                {TRAFFIC_SOURCES.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2">
            {TRAFFIC_SOURCES.map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs" style={{ color: t.muted }}>{s.name}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: t.text }}>{s.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top products */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl p-5"
        style={{ background: t.card, border: `1px solid ${t.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm" style={{ color: t.text }}>Top Products</h2>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(107,53,232,0.1)", color: V.v400, border: "1px solid rgba(107,53,232,0.2)" }}>
            <Zap size={11} /> KIRO picks winners daily
          </div>
        </div>
        <div className="space-y-3">
          {TOP_PRODUCTS.map((p, i) => (
            <div key={p.name} className="flex items-center gap-3">
              <span className="text-xs font-black w-4" style={{ color: t.muted }}>#{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold" style={{ color: t.text }}>{p.name}</span>
                  <span className="text-xs" style={{ color: t.muted }}>{p.sold} sold</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }}>
                  <div className="h-full rounded-full" style={{ width: `${20 + i * 15}%`, background: p.color }} />
                </div>
              </div>
              <span className="text-xs font-bold w-16 text-right" style={{ color: p.color }}>{fmt(p.revenue)}</span>
            </div>
          ))}
        </div>
        {isDemo && (
          <p className="text-xs mt-4 text-center" style={{ color: t.muted }}>
            Connect your backend to see real product performance
          </p>
        )}
      </motion.div>
    </div>
  );
}
