"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { api } from "../../../lib/api";
import {
  Users, Search, Download, Mail, Phone,
  ShoppingBag, TrendingUp, Zap, ChevronRight,
  ArrowUpRight, User,
} from "lucide-react";
import Link from "next/link";

const V = { v500: "#6B35E8", v400: "#8B5CF6", v300: "#A78BFA", cyan: "#06B6D4" };
const T = {
  dark:  { card: "#181230", border: "rgba(255,255,255,0.06)", text: "#fff", muted: "rgba(255,255,255,0.38)", faint: "rgba(255,255,255,0.04)", row: "rgba(255,255,255,0.02)" },
  light: { card: "#fff",    border: "rgba(15,5,32,0.07)",    text: "#0D0918", muted: "rgba(13,9,24,0.45)", faint: "rgba(15,5,32,0.03)", row: "rgba(15,5,32,0.015)" },
};

function fmt(n: number) {
  return new Intl.NumberFormat("en", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
}

function CustomerRow({ customer, t, isDark, i }: any) {
  const initials = customer.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("") || "?";
  const colors   = [V.v400, V.cyan, "#10B981", "#F59E0B", "#C026D3", "#06B6D4"];
  const color    = colors[i % colors.length];

  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
      className="grid items-center gap-3 px-4 py-3 rounded-xl transition-all hover:opacity-80 cursor-pointer"
      style={{
        gridTemplateColumns: "36px 1fr 180px 100px 100px 80px",
        background: i % 2 === 0 ? t.row : "transparent",
      }}>
      {/* Avatar */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
        style={{ background: `linear-gradient(135deg,${color},${color}99)` }}>
        {initials}
      </div>
      {/* Name + email */}
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: t.text }}>{customer.name || "Unknown"}</p>
        <p className="text-xs truncate" style={{ color: t.muted }}>{customer.email}</p>
      </div>
      {/* Phone */}
      <p className="text-xs truncate" style={{ color: t.muted }}>{customer.phone || "-"}</p>
      {/* Orders */}
      <div className="flex items-center gap-1">
        <ShoppingBag size={11} style={{ color: V.cyan }} />
        <span className="text-sm font-bold" style={{ color: t.text }}>{customer._count?.orders || customer.totalOrders || 0}</span>
      </div>
      {/* Total spent */}
      <p className="text-sm font-bold" style={{ color: "#10B981" }}>{fmt(customer.totalSpent || 0)}</p>
      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <a href={`mailto:${customer.email}`} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
          style={{ background: t.faint, border: `1px solid ${t.border}` }}>
          <Mail size={11} style={{ color: t.muted }} />
        </a>
        <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
          style={{ background: t.faint, border: `1px solid ${t.border}` }}>
          <ChevronRight size={11} style={{ color: t.muted }} />
        </button>
      </div>
    </motion.div>
  );
}

export default function CustomersPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = isDark ? T.dark : T.light;
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");

  const { data, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get("/customers").then(r => r.data.data),
  });

  const customers: any[] = data || [];

  const filtered = customers.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Total Customers",   value: customers.length,                                          color: V.v400,    icon: Users },
    { label: "New This Month",    value: customers.filter((c: any) => {
        const d = new Date(c.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,                                                                                       color: "#10B981", icon: ArrowUpRight },
    { label: "Total Revenue",     value: fmt(customers.reduce((a: number, c: any) => a + (c.totalSpent || 0), 0)), color: V.cyan, icon: TrendingUp },
    { label: "Avg. Order Value",  value: fmt(customers.length > 0
        ? customers.reduce((a: number, c: any) => a + (c.totalSpent || 0), 0) / Math.max(customers.reduce((a: number, c: any) => a + (c.totalOrders || 0), 0), 1)
        : 0),                                                                                         color: "#F59E0B", icon: ShoppingBag },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: t.text }}>Customers</h1>
          <p style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>
            {customers.length > 0 ? `${customers.length} customer${customers.length !== 1 ? "s" : ""}` : "View and manage your customer base"}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ border: `1px solid ${t.border}`, color: t.muted, background: t.card }}>
            <Download size={12} /> Export
          </button>
          <Link href="/dashboard/kiro"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: "rgba(107,53,232,0.1)", color: V.v300, border: "1px solid rgba(107,53,232,0.2)" }}>
            <Zap size={12} /> KIRO Insights
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{ background: t.card, border: `1px solid ${t.border}` }}>
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)` }} />
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}18` }}>
              <s.icon size={15} style={{ color: s.color }} />
            </div>
            <p className="text-xl font-black mb-0.5" style={{ color: t.text }}>{s.value}</p>
            <p className="text-xs" style={{ color: t.muted }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: t.card, border: `1px solid ${t.border}` }}>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${t.border}` }}>
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl"
            style={{ background: t.faint, border: `1px solid ${t.border}` }}>
            <Search size={12} style={{ color: t.muted }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..."
              className="flex-1 bg-transparent border-none outline-none text-xs"
              style={{ color: t.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-medium outline-none cursor-pointer"
            style={{ background: t.card, border: `1px solid ${t.border}`, color: t.muted }}>
            <option value="recent">Most Recent</option>
            <option value="spent">Highest Spend</option>
            <option value="orders">Most Orders</option>
          </select>
        </div>

        {/* Column headers */}
        <div className="grid px-4 py-2.5" style={{ gridTemplateColumns: "36px 1fr 180px 100px 100px 80px", borderBottom: `1px solid ${t.border}` }}>
          {["", "Customer", "Phone", "Orders", "Total Spent", ""].map((h, i) => (
            <div key={i} className="text-[10px] font-bold uppercase tracking-wider" style={{ color: t.muted, fontFamily: "'Syncopate', sans-serif", paddingLeft: i === 0 ? 0 : 4 }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        <div className="p-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl mb-1 animate-pulse" style={{ background: t.faint }} />
            ))
          ) : filtered.length > 0 ? (
            filtered.map((c, i) => <CustomerRow key={c.id} customer={c} t={t} isDark={isDark} i={i} />)
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <Users size={24} color="#10B981" />
              </div>
              <h3 className="font-bold text-sm mb-2" style={{ color: t.text }}>
                {search ? "No customers found" : "No customers yet"}
              </h3>
              <p className="text-xs mb-5" style={{ color: t.muted, maxWidth: 300, lineHeight: 1.6 }}>
                {search
                  ? "Try a different search term"
                  : "Customers appear here once they make a purchase through your store. KIRO can help you get your first customer."}
              </p>
              {!search && (
                <Link href="/dashboard/kiro"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${V.v500}, #3D1C8A)` }}>
                  <Zap size={12} /> Ask KIRO to get first customers
                </Link>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
