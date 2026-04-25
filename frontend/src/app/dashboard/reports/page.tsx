"use client";
﻿"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Download, TrendingUp, ShoppingCart, DollarSign, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function ReportsPage() {
  
  
  const user = useAuthStore((s) => s.user);
  const storeId = user?.stores?.[0]?.id;
  const [period, setPeriod] = useState("30d");
  const [exporting, setExporting] = useState(false);

  const tx   = "[color:var(--text-primary)]";
  const sub  = "text-secondary";
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";
  const tip  = { background: "var(--chart-tooltip-bg)", border: "1px solid var(--chart-tooltip-border)", borderRadius: 12, fontSize: 12 };

  const { data: report , isLoading } = useQuery({
    queryKey: ["report", storeId, period],
    queryFn:  () => api.get(`/analytics/${storeId}/report`, { params: { period } }).then((r) => r.data.data),
    enabled:  !!storeId,
  });

  const monthly = report?.monthly || [
    { month: "Jan", revenue: 4200, orders: 38, customers: 28 },
    { month: "Feb", revenue: 5800, orders: 52, customers: 35 },
    { month: "Mar", revenue: 4900, orders: 44, customers: 31 },
    { month: "Apr", revenue: 7200, orders: 68, customers: 49 },
    { month: "May", revenue: 8600, orders: 79, customers: 55 },
    { month: "Jun", revenue: 9400, orders: 88, customers: 62 },
    { month: "Jul", revenue: 11200, orders: 102, customers: 74 },
  ];

  const exportCSV = async (type: "orders" | "products" | "customers") => {
    setExporting(true);
    try {
      const res = await api.get(`/analytics/${storeId}/export`, {
        params: { type, period },
        responseType: "blob",
      });
      const url  = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href     = url;
      link.download = `dropos-${type}-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`${type} exported!`);
    } catch {
      // Fallback - generate CSV from demo data
      const headers = type === "orders"
        ? "Order Number,Date,Customer,Total,Status"
        : type === "products"
        ? "Name,SKU,Price,Inventory,Status"
        : "Name,Email,Orders,Total Spent";
      const csv = `${headers}\n(No data available for selected period)`;
      const blob = new Blob([csv], { type: "text/csv" });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href     = url;
      link.download = `dropos-${type}-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
    } finally {
      setExporting(false);
    }
  };

  return (
    
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Reports</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>Sales and performance data</p>
          </div>
          <div className={`flex gap-1 p-1 rounded-xl border [background:var(--bg-secondary)] [border-color:var(--border)]`}>
            {["7d", "30d", "90d", "1y"].map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${period === p ? "[color:var(--text-primary)]" : sub}`}
                style={period === p ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: DollarSign, label: "Total Revenue",   value: `$${(report?.totals?.revenue || 11200).toLocaleString()}`,  change: "+18%", c: "text-emerald-500" },
            { icon: ShoppingCart, label: "Total Orders",  value: report?.totals?.orders || 102,                               change: "+12%", c: "text-blue-500" },
            { icon: Users,       label: "New Customers",  value: report?.totals?.customers || 74,                             change: "+9%",  c: "[color:var(--accent)]" },
            { icon: TrendingUp,  label: "Avg Order Value",value: `$${(report?.totals?.avgOrder || 109.80).toFixed(2)}`,       change: "+5%",  c: "[color:var(--accent)]" },
          ].map(({ icon: Icon, label, value, change, c }) => (
            <div key={label} className={`rounded-2xl border p-5 ${card}`}>
              <div className="flex items-center justify-between mb-3">
                <Icon size={18} className={c} />
                <span className="text-xs font-bold text-emerald-500">{change}</span>
              </div>
              <div className={`text-2xl font-black ${tx}`}>{value}</div>
              <div className={`text-xs mt-0.5 ${sub}`}>{label}</div>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        <div className={`rounded-2xl border p-5 ${card}`}>
          <h3 className={`font-bold mb-4 ${tx}`}>Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tip} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`rounded-2xl border p-5 ${card}`}>
            <h3 className={`font-bold mb-4 ${tx}`}>Orders Per Month</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthly}>
                <XAxis dataKey="month" tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tip} />
                <Bar dataKey="orders" fill="#7c3aed" radius={[5, 5, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`rounded-2xl border p-5 ${card}`}>
            <h3 className={`font-bold mb-4 ${tx}`}>New Customers</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthly}>
                <XAxis dataKey="month" tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tip} />
                <Bar dataKey="customers" fill="#a855f7" radius={[5, 5, 0, 0]} name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Export section */}
        <div className={`rounded-2xl border p-6 ${card}`}>
          <h3 className={`font-bold mb-1 ${tx}`}>Export Data</h3>
          <p className={`text-sm mb-5 ${sub}`}>Download your data as CSV files</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { type: "orders",    label: "Orders Report",    desc: "All orders with details" },
              { type: "products",  label: "Products Report",  desc: "Inventory and sales" },
              { type: "customers", label: "Customers Report", desc: "Customer list and stats" },
            ].map(({ type, label, desc }) => (
              <button key={type}
                onClick={() => exportCSV(type as any)}
                disabled={exporting}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all disabled:opacity-60 ${
                  "[border-color:var(--border)] hover:[border-color:var(--accent)]/20 hover:[background:var(--accent-dim)]"
                }`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center [background:var(--accent-dim)] flex-shrink-0">
                  <Download size={16} className="[color:var(--accent)]" />
                </div>
                <div>
                  <div className={`font-bold text-sm ${tx}`}>{label}</div>
                  <div className={`text-xs ${sub}`}>{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    
  );
}
