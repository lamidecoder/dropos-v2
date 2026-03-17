"use client";
import { DollarSign, ShoppingCart, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

function StatCard({ icon: Icon, label, value, change, positive, accent = false }: {
  icon: React.ElementType; label: string; value: string | number;
  change?: number; positive?: boolean; accent?: boolean;
}) {
  return (
    <div className="relative rounded-2xl p-5 overflow-hidden transition-all hover:translate-y-[-2px]"
      style={{
        background: accent
          ? "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.03))"
          : "var(--bg-secondary)",
        border: `1px solid ${accent ? "rgba(201,168,76,0.2)" : "var(--bg-card)"}`,
      }}>
      {/* Subtle top glow */}
      {accent && (
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent)" }} />
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accent ? "rgba(201,168,76,0.12)" : "var(--bg-secondary)", border: `1px solid ${accent ? "rgba(201,168,76,0.2)" : "var(--bg-card)"}` }}>
          <Icon size={16} style={{ color: accent ? "var(--accent)" : "var(--text-secondary)" }} />
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-[11px] font-bold ${positive ? "text-emerald-400" : "text-red-400"}`}>
            {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{change}%
          </span>
        )}
      </div>
      <div className="text-2xl font-black tracking-tight" style={{ color: accent ? "var(--accent)" : "white" }}>{value}</div>
      <div className="text-[11px] font-medium mt-1" style={{ color: "var(--text-tertiary)" }}>{label}</div>
    </div>
  );
}

export function StoreStatCards({ analytics }: { analytics?: any }) {
  const totalRevenue = analytics?.revenue?.total || 0;
  const totalOrders  = analytics?.totalOrders    || 0;
  const newCustomers = analytics?.newCustomers   || 0;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard accent icon={DollarSign}   label="Revenue (30d)"  value={`$${totalRevenue.toLocaleString()}`} change={18} positive />
      <StatCard        icon={ShoppingCart} label="Orders (30d)"   value={totalOrders}  change={12} positive />
      <StatCard        icon={Users}        label="New Customers"  value={newCustomers} change={9}  positive />
      <StatCard        icon={TrendingUp}   label="Conversion"     value="3.8%"         change={0.4} positive />
    </div>
  );
}

export function AdminStatCards({ stats }: { stats?: any }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard accent icon={Users}        label="Active Users"     value={stats?.users?.active  || 0} change={16} positive />
      <StatCard accent icon={DollarSign}   label="Platform Revenue" value={`$${(stats?.revenue?.total||0).toLocaleString()}`} change={18} positive />
      <StatCard        icon={ShoppingCart} label="Total Orders"     value={stats?.orders?.total  || 0} change={12} positive />
      <StatCard        icon={TrendingUp}   label="Active Stores"    value={stats?.stores?.active || 0} change={8}  positive />
    </div>
  );
}
