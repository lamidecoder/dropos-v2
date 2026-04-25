"use client";
﻿"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import { TrendingDown, Globe, BarChart3 } from "lucide-react";

export default function FunnelPage() {
  const user = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const [period, setPeriod] = useState("30d");
  const tx = "[color:var(--text-primary)]";
  const sub = "text-secondary";
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";

  const { data: funnelData , isLoading } = useQuery({
    queryKey: ["funnel", storeId, period],
    queryFn: () => api.get(`/funnel/${storeId}?period=${period}`).then(r => r.data.data),
    enabled: !!storeId,
  });

  const { data: cohortData } = useQuery({
    queryKey: ["cohort", storeId],
    queryFn: () => api.get(`/funnel/${storeId}/cohort`).then(r => r.data.data),
    enabled: !!storeId,
  });

  const funnel = funnelData?.funnel || [
    { stage: "Product Views", count: 8420, rate: 100, dropOff: 0 },
    { stage: "Add to Cart", count: 1684, rate: 20, dropOff: 80 },
    { stage: "Checkout Started", count: 843, rate: 10, dropOff: 50 },
    { stage: "Purchase Completed", count: 320, rate: 3.8, dropOff: 62 },
  ];

  const campaigns = funnelData?.campaigns || [
    { campaign: "summer_sale", clicks: 1240, conversions: 87, revenue: 4320 },
    { campaign: "influencer_promo", clicks: 890, conversions: 62, revenue: 3180 },
    { campaign: "email_reactivation", clicks: 560, conversions: 48, revenue: 2240 },
  ];
  const sources = funnelData?.sources || [
    { source: "direct", count: 2840 },
    { source: "instagram", count: 1920 },
    { source: "google", count: 1240 },
    { source: "tiktok", count: 840 },
    { source: "whatsapp", count: 420 },
  ];

  const cohorts = cohortData || [
    { month: "2025-01", totalCustomers: 124, day30Rate: 22, day60Rate: 14, day90Rate: 8 },
    { month: "2025-02", totalCustomers: 198, day30Rate: 28, day60Rate: 18, day90Rate: 12 },
    { month: "2025-03", totalCustomers: 156, day30Rate: 25, day60Rate: 16, day90Rate: 0 },
  ];

  const maxCount = Math.max(...funnel.map((f: any) => f.count));

  return (
    
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Funnel & Attribution</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>See exactly where customers drop off - and fix it.</p>
          </div>
          <div className="flex gap-2">
            {["7d","30d","90d"].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === p ? "text-[var(--text-primary)]" : `${sub} hover:[background:var(--bg-secondary)]`}`}
                style={period === p ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className={`rounded-2xl border p-6 ${card}`}>
          <h2 className={`text-sm font-bold ${tx} mb-6`}>Conversion Funnel</h2>
          <div className="space-y-3">
            {funnel.map((stage: any, i: number) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-sm font-semibold ${tx}`}>{stage.stage}</span>
                  <div className="flex items-center gap-4">
                    {i > 0 && (
                      <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                        <TrendingDown size={10} /> {stage.dropOff}% drop
                      </span>
                    )}
                    <span className={`text-sm font-bold ${tx}`}>{stage.count.toLocaleString()}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${i === 0 ? "[color:var(--accent)] [background:var(--accent-dim)]" : "text-secondary [background:var(--bg-card)]"}`}>
                      {stage.rate}%
                    </span>
                  </div>
                </div>
                <div className="h-8 rounded-xl overflow-hidden [background:var(--bg-card)]">
                  <div className="h-full rounded-xl transition-all duration-700"
                    style={{
                      width: `${(stage.count / maxCount) * 100}%`,
                      background: i === 0 ? "linear-gradient(90deg,#7c3aed,#a855f7)" :
                                  i === 1 ? "linear-gradient(90deg,#a855f7,#c084fc)" :
                                  i === 2 ? "linear-gradient(90deg,#c084fc,#c9a84c)" :
                                            "linear-gradient(90deg,#c9a84c,#f0c040)",
                    }} />
                </div>
              </div>
            ))}
          </div>
          <div className={`mt-4 pt-4 border-t [border-color:var(--border)] text-xs ${sub}`}>
            Overall conversion rate: <span className="font-bold [color:var(--accent)]">{funnel[3]?.rate || 0}%</span>
            {" "}· Industry average: <span className="font-semibold">2.5-3%</span>
          </div>
        </div>

        {/* Traffic sources + Cohort side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Traffic Sources */}
          <div className={`rounded-2xl border p-5 ${card}`}>
            <div className="flex items-center gap-2 mb-5">
              <Globe size={14} className={sub} />
              <h2 className={`text-sm font-bold ${tx}`}>Traffic Sources</h2>
            </div>
            <div className="space-y-3">
              {sources.map((s: any) => {
                const maxSrc = Math.max(...sources.map((x: any) => x.count));
                const pct = ((s.count / maxSrc) * 100).toFixed(0);
                return (
                  <div key={s.source}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-semibold capitalize ${tx}`}>{s.source || "Direct"}</span>
                      <span className={`text-sm font-bold ${tx}`}>{s.count.toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full [background:var(--bg-card)]">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cohort Analysis */}
          <div className={`rounded-2xl border p-5 ${card}`}>
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 size={14} className={sub} />
              <h2 className={`text-sm font-bold ${tx}`}>Cohort Retention</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={sub}>
                    <th className="text-left py-2 font-semibold">Cohort</th>
                    <th className="text-center py-2 font-semibold">Customers</th>
                    <th className="text-center py-2 font-semibold">30-day</th>
                    <th className="text-center py-2 font-semibold">60-day</th>
                    <th className="text-center py-2 font-semibold">90-day</th>
                  </tr>
                </thead>
                <tbody>
                  {cohorts.map((c: any) => (
                    <tr key={c.month} className="border-t [border-color:var(--border)]">
                      <td className={`py-2 font-semibold ${tx}`}>{c.month}</td>
                      <td className={`py-2 text-center ${sub}`}>{c.totalCustomers}</td>
                      {[c.day30Rate, c.day60Rate, c.day90Rate].map((rate, i) => (
                        <td key={i} className="py-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${rate >= 20 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : rate >= 10 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"}`}>
                            {rate}%
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={`text-xs ${sub} mt-3`}>% of original cohort that made a repeat purchase</p>
          </div>
        </div>
      {/* UTM Campaign Performance */}
      <div className={`rounded-2xl border p-5 ${card}`}>
          <h3 className={`font-bold mb-4 ${tx}`}>UTM Campaigns</h3>
          {campaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b border-inherit text-xs ${sub}`}>
                    {["Campaign", "Clicks", "Conversions", "Conv. Rate", "Revenue"].map(h => (
                      <th key={h} className="text-left font-semibold px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c: any) => (
                    <tr key={c.campaign} className="border-b [border-color:var(--border)] hover:[background:var(--bg-card)] transition-colors">
                      <td className={`px-4 py-3 font-mono text-xs font-semibold ${tx}`}>{c.campaign}</td>
                      <td className={`px-4 py-3 text-xs ${sub}`}>{c.clicks?.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-xs ${sub}`}>{c.conversions}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.clicks > 0 && (c.conversions/c.clicks)*100 >= 5 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                          {c.clicks > 0 ? ((c.conversions / c.clicks) * 100).toFixed(1) : "0"}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-black text-emerald-700 dark:text-emerald-400">
                        ${(c.revenue || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={`text-sm ${sub}`}>No UTM campaign data yet. Add UTM parameters to your links.</p>
          )}
        </div>
      </div>
  );
}
