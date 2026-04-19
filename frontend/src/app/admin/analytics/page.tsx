"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const MOCK_MONTHLY = [
  { month: "Jan", revenue: 18400, fees: 1840, users: 12, stores: 8 },
  { month: "Feb", revenue: 23600, fees: 2360, users: 18, stores: 12 },
  { month: "Mar", revenue: 28900, fees: 2890, users: 22, stores: 15 },
  { month: "Apr", revenue: 35200, fees: 3520, users: 31, stores: 21 },
  { month: "May", revenue: 43800, fees: 4380, users: 40, stores: 28 },
  { month: "Jun", revenue: 52100, fees: 5210, users: 52, stores: 36 },
  { month: "Jul", revenue: 61400, fees: 6140, users: 67, stores: 44 },
];

const GW_COLORS = ["#7c3aed", "#f59e0b", "#10b981"];
const GW_DATA   = [{ name: "Stripe", value: 58 }, { name: "Paystack", value: 28 }, { name: "Flutterwave", value: 14 }];

export default function AdminAnalyticsPage() {
  
  
  const [period, setPeriod] = useState("7d");
  const card = "bg-[var(--bg-card)] border-[var(--border)]";
  const tx   = "text-[var(--text-primary)]";
  const sub  = "text-[var(--text-tertiary)]";
  const tip  = { background: "var(--chart-tooltip-bg)", border: "1px solid var(--chart-tooltip-border)", borderRadius: 12, fontSize: 12 };

  const { data: stats , isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn:  () => adminAPI.getDashboard().then((r) => r.data.data),
  });

  const monthly = stats?.monthlyRevenue?.length ? stats.monthlyRevenue : MOCK_MONTHLY;

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Platform Analytics</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>All-tenants overview</p>
          </div>
          <div className={`flex gap-1 rounded-xl p-1 border bg-[var(--bg-card)] border-[var(--border)]`}>
            {["7d", "30d", "90d"].map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${period === p ? "text-[var(--text-primary)]" : sub}`}
                style={period === p ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: "Total Revenue",     v: `$${(stats?.revenue?.total || 61400).toLocaleString()}`,           c: "text-emerald-400" },
            { l: "Platform Fees",     v: `$${(stats?.platformFees?.total || 6140).toLocaleString()}`,        c: "text-amber-400" },
            { l: "Active Users",      v: stats?.users?.active || 398,                                        c: tx },
            { l: "Total Stores",      v: stats?.stores?.total || 44,                                         c: tx },
          ].map(({ l, v, c }) => (
            <div key={l} className={`rounded-2xl border p-5 ${card}`}>
              <div className={`text-2xl font-black ${c}`}>{v}</div>
              <div className={`text-xs mt-0.5 ${sub}`}>{l}</div>
            </div>
          ))}
        </div>

        {/* Revenue trend */}
        <div className={`rounded-2xl border p-5 ${card}`}>
          <h3 className={`font-bold mb-4 ${tx}`}>Revenue & Fees Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={.25} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="feeArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tip}
                formatter={(v: any, name: string) => [`$${Number(v).toLocaleString()}`, name === "fees" ? "Platform Fees" : "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#revArea)" name="revenue" />
              <Area type="monotone" dataKey="fees"    stroke="#f59e0b" strokeWidth={2}   fill="url(#feeArea)" name="fees" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New users bar chart */}
          <div className={`rounded-2xl border p-5 ${card}`}>
            <h3 className={`font-bold mb-4 ${tx}`}>New Users & Stores</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthly}>
                <XAxis dataKey="month" tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tip} />
                <Bar dataKey="users"  fill="#7c3aed" radius={[4, 4, 0, 0]} name="Users"  />
                <Bar dataKey="stores" fill="#a855f766" radius={[4, 4, 0, 0]} name="Stores" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gateway distribution */}
          <div className={`rounded-2xl border p-5 ${card}`}>
            <h3 className={`font-bold mb-4 ${tx}`}>Gateway Distribution</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={GW_DATA} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value">
                    {GW_DATA.map((_, i) => <Cell key={i} fill={GW_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={tip} formatter={(v: any) => [`${v}%`]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {GW_DATA.map((g, i) => (
                  <div key={g.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: GW_COLORS[i] }} />
                        <span className={sub}>{g.name}</span>
                      </div>
                      <span className={`font-black ${tx}`}>{g.value}%</span>
                    </div>
                    <div className={`h-1.5 rounded-full overflow-hidden ${"bg-[var(--bg-card)]"}`}>
                      <div className="h-full rounded-full" style={{ width: `${g.value}%`, background: GW_COLORS[i] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
