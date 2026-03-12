"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/layout/DashboardLayout";

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";

const DEMO_REVENUE = [
  { m: "Jan", rev: 4200,  ord: 38 },  { m: "Feb", rev: 5800,  ord: 52 },
  { m: "Mar", rev: 4900,  ord: 44 },  { m: "Apr", rev: 7200,  ord: 68 },
  { m: "May", rev: 8600,  ord: 79 },  { m: "Jun", rev: 9400,  ord: 88 },
  { m: "Jul", rev: 11200, ord: 102 },
];

const PIE_COLORS = ["#7c3aed", "#a855f7", "#c084fc"];

export default function AnalyticsPage() {
  
  
  const user = useAuthStore((s) => s.user);
  const storeId = user?.stores?.[0]?.id;
  const tx   = "[color:var(--text-primary)]";
  const sub  = "text-secondary";
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";
  const [period, setPeriod] = useState("30d");

  const { data: analytics , isLoading } = useQuery({
    queryKey: ["analytics", storeId, period],
    queryFn:  () => analyticsAPI.getStore(storeId!, { period }).then((r) => r.data.data),
    enabled:  !!storeId,
  });

  const topProducts = analytics?.topProducts || [
    { name: "Wireless Earbuds Pro", _sum: { quantity: 128, total: 11519 } },
    { name: "Minimalist Watch",     _sum: { quantity: 89,  total: 13349 } },
    { name: "Laptop Stand",         _sum: { quantity: 67,  total: 4019  } },
    { name: "Phone Grip Ring",      _sum: { quantity: 55,  total: 714   } },
    { name: "Smart Water Bottle",   _sum: { quantity: 44,  total: 1539  } },
  ];

  const ordersByStatus = analytics?.orders || [
    { status: "COMPLETED",  _count: { id: 62 } },
    { status: "PROCESSING", _count: { id: 18 } },
    { status: "SHIPPED",    _count: { id: 14 } },
    { status: "CANCELLED",  _count: { id: 8 } },
  ];

  const totalRevenue = analytics?.revenue?.total || 11240;
  const totalOrders  = analytics?.totalOrders   || 102;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Analytics</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>Store performance overview</p>
          </div>
          <div className={`flex gap-1 rounded-xl p-1 border [background:var(--bg-secondary)] [border-color:var(--border)]`}>
            {["7d", "30d", "90d"].map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all
                  ${period === p ? "[color:var(--text-primary)]" : sub}`}
                style={period === p ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: DollarSign,   label: "Revenue",     value: `$${totalRevenue.toLocaleString()}`,       change: "+18%" },
            { icon: ShoppingCart, label: "Orders",      value: totalOrders,                               change: "+12%" },
            { icon: Users,        label: "New Customers",value: analytics?.newCustomers || 24,            change: "+9%"  },
            { icon: TrendingUp,   label: "Conversion",  value: "3.8%",                                    change: "+0.4%"},
          ].map(({ icon: Icon, label, value, change }) => (
            <div key={label} className={`rounded-2xl border p-5 ${card}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl [background:var(--accent-dim)]`}>
                  <Icon size={16} className="[color:var(--accent)]" />
                </div>
                <span className="text-xs font-bold text-emerald-500">{change}</span>
              </div>
              <div className={`text-2xl font-black ${tx}`}>{value}</div>
              <div className={`text-xs mt-0.5 ${sub}`}>{label}</div>
            </div>
          ))}
        </div>

        {/* Revenue area chart */}
        <div className={`rounded-2xl border p-5 ${card}`}>
          <h3 className={`font-bold mb-4 ${tx}`}>Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={DEMO_REVENUE}>
              <defs>
                <linearGradient id="revGr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={.25} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "var(--chart-tooltip-bg)", border: "1px solid var(--chart-tooltip-border)", borderRadius: 12, fontSize: 12 }}
                formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="rev" stroke="#7c3aed" strokeWidth={2.5} fill="url(#revGr)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders bar chart */}
          <div className={`rounded-2xl border p-5 ${card}`}>
            <h3 className={`font-bold mb-4 ${tx}`}>Orders Per Month</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={DEMO_REVENUE}>
                <XAxis dataKey="m" tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--chart-tooltip-bg)", border: "1px solid var(--chart-tooltip-border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="ord" fill="#7c3aed" radius={[5, 5, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Order status pie */}
          <div className={`rounded-2xl border p-5 ${card}`}>
            <h3 className={`font-bold mb-4 ${tx}`}>Orders by Status</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={68}
                    dataKey="_count.id" nameKey="status">
                    {ordersByStatus.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {ordersByStatus.map((s: any, i: number) => (
                  <div key={s.status} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className={sub}>{s.status}</span>
                    </div>
                    <span className={`font-bold ${tx}`}>{s._count?.id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top products */}
        <div className={`rounded-2xl border ${card}`}>
          <div className={`flex items-center justify-between p-5 border-b border-inherit`}>
            <h3 className={`font-bold ${tx}`}>Top Products</h3>
            <span className={`text-xs ${sub}`}>by revenue</span>
          </div>
          <div className="p-5 space-y-3">
            {topProducts.map((p: any, i: number) => {
              const maxRev = topProducts[0]?._sum?.total || 1;
              const pct = ((p._sum?.total || 0) / maxRev) * 100;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-black w-4 ${sub}`}>{i + 1}</span>
                      <span className={`text-sm font-semibold ${tx}`}>{p.name}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold text-sm ${tx}`}>${(p._sum?.total || 0).toLocaleString()}</span>
                      <span className={`text-xs ${sub} ml-2`}>{p._sum?.quantity} sold</span>
                    </div>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${"[background:var(--bg-card)]"}`}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
