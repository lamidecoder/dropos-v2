// src/app/admin/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../../lib/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { AdminStatCards } from "../../components/dashboard/StatCards";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import { AlertCircle, ChevronRight, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  
  
  const card = "bg-[var(--bg-card)] border-[var(--border)]";
  const tx   = "text-[var(--text-primary)]";
  const sub  = "text-[var(--text-tertiary)]";

  const { data: stats , isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn:  () => adminAPI.getDashboard().then((r) => r.data.data),
    refetchInterval: 60000,
  });

  const { data: usersData } = useQuery({
    queryKey: ["admin-users-preview"],
    queryFn:  () => adminAPI.getUsers({ limit: 5 }).then((r) => r.data),
  });

  const gwData = stats?.gatewayStats?.length
    ? stats.gatewayStats.map((g: any) => ({
        name:  g.gateway,
        value: g._count.id,
        color: g.gateway === "STRIPE" ? "#7c3aed" : g.gateway === "PAYSTACK" ? "#f59e0b" : "#10b981",
      }))
    : [
        { name: "Stripe",      value: 58, color: "#7c3aed" },
        { name: "Paystack",    value: 28, color: "#f59e0b" },
        { name: "Flutterwave", value: 14, color: "#10b981" },
      ];

  const monthlyData = stats?.monthlyRevenue?.length
    ? stats.monthlyRevenue
    : [
        { month: "Jan", revenue: 18400, fees: 1840 },
        { month: "Feb", revenue: 23600, fees: 2360 },
        { month: "Mar", revenue: 28900, fees: 2890 },
        { month: "Apr", revenue: 35200, fees: 3520 },
        { month: "May", revenue: 43800, fees: 4380 },
        { month: "Jun", revenue: 52100, fees: 5210 },
        { month: "Jul", revenue: 61400, fees: 6140 },
      ];

  const recentUsers = usersData?.data || [];

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Platform Overview</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>
            All tenants · {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Stats */}
        <AdminStatCards stats={stats} />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 rounded-2xl border p-5 ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold ${tx}`}>Platform Revenue</h3>
              <Link href="/admin/analytics" className="text-xs font-semibold text-violet-500 flex items-center gap-1">
                Full analytics <ChevronRight size={12} />
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "var(--chart-tooltip-bg)", border: "1px solid var(--chart-tooltip-border)", borderRadius: 12, fontSize: 12 }}
                  formatter={(val: any, name: string) => [`$${Number(val).toLocaleString()}`, name === "fees" ? "Platform Fees" : "Total Revenue"]}
                />
                <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} name="revenue" />
                <Bar dataKey="fees" fill="#f59e0b66" radius={[4, 4, 0, 0]} name="fees" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {/* Gateway pie */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h3 className={`font-bold text-sm mb-3 ${tx}`}>Payment Gateways</h3>
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie data={gwData} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="value">
                    {gwData.map((d: any, i: number) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--chart-tooltip-bg)", border: "1px solid var(--chart-tooltip-border)", borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              {gwData.map((d: any) => (
                <div key={d.name} className="flex items-center justify-between text-xs mt-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className={sub}>{d.name}</span>
                  </div>
                  <span className={`font-bold ${tx}`}>{d.value}</span>
                </div>
              ))}
            </div>

            {/* Alerts */}
            <div className={`rounded-2xl border p-4 ${card}`}>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={13} className="text-amber-500" />
                <span className={`font-bold text-sm ${tx}`}>Alerts</span>
              </div>
              <div className="space-y-2">
                {(stats?.failedPayments || 0) > 0 && (
                  <Link href="/admin/payments"
                    className={`block text-xs p-2 rounded-lg bg-red-100/80 dark:bg-red-900/20 text-red-600 dark:text-red-300 hover:bg-red-100 dark:bg-red-900/30 transition-all`}>
                    ● {stats.failedPayments} failed payments
                  </Link>
                )}
                {(stats?.openTickets || 0) > 0 && (
                  <Link href="/admin/support"
                    className={`block text-xs p-2 rounded-lg bg-amber-100/80 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:bg-amber-900/30 transition-all`}>
                    ● {stats.openTickets} open support tickets
                  </Link>
                )}
                {!stats?.failedPayments && !stats?.openTickets && (
                  <p className={`text-xs ${sub}`}>No active alerts</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent users */}
        <div className={`rounded-2xl border ${card}`}>
          <div className="flex items-center justify-between p-5 border-b border-inherit">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-violet-500" />
              <h3 className={`font-bold ${tx}`}>Recent Users</h3>
            </div>
            <Link href="/admin/users" className="text-xs font-semibold text-violet-500 flex items-center gap-1">
              Manage all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b border-inherit text-xs ${sub}`}>
                  {["User", "Plan", "Stores", "Revenue", "Status", "Joined", ""].map((h) => (
                    <th key={h} className="text-left font-semibold px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u: any) => (
                  <tr key={u.id}
                    className={`border-b transition-colors cursor-pointer border-[var(--border)]/50 hover:bg-[var(--bg-card)]/40`}>
                    <td className="px-5 py-3">
                      <div className={`font-semibold text-sm ${tx}`}>{u.name}</div>
                      <div className={`text-xs ${sub}`}>{u.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full
                        ${u.subscription?.plan === "ADVANCED" ? "bg-violet-400/10 text-violet-700 dark:text-violet-400"
                          : u.subscription?.plan === "PRO" ? "bg-amber-400/10 text-amber-700 dark:text-amber-400"
                          : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]"}`}>
                        {u.subscription?.plan || "STARTER"}
                      </span>
                    </td>
                    <td className={`px-5 py-3 font-semibold ${tx}`}>{u._count?.stores || 0}</td>
                    <td className={`px-5 py-3 font-bold text-emerald-700 dark:text-emerald-400`}>
                      ${(u.revenue?.total || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${u.status === "ACTIVE" ? "bg-emerald-400/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-red-400/10 text-red-600 dark:text-red-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className={`px-5 py-3 text-xs ${sub}`}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/users/${u.id}`}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all
                          border-violet-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-400/10`}>
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
                {!recentUsers.length && (
                  <tr>
                    <td colSpan={7} className={`px-5 py-8 text-center text-sm ${sub}`}>No users yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
