"use client";
import { useQuery } from "@tanstack/react-query";
import { analyticsAPI } from "../../lib/api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const MOCK = [
  { m: "Aug", rev: 4200 }, { m: "Sep", rev: 5800 }, { m: "Oct", rev: 4900 },
  { m: "Nov", rev: 7200 }, { m: "Dec", rev: 8600 }, { m: "Jan", rev: 9400 },
  { m: "Feb", rev: 11200 },
];

export function RevenueChart({ storeId }: { storeId: string }) {
  const { data } = useQuery({
    queryKey: ["analytics-chart", storeId],
    queryFn:  () => analyticsAPI.getStore(storeId, { period: "30d" }).then(r => r.data.data),
    enabled: !!storeId,
  });

  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="[color:var(--text-primary)] font-bold text-sm">Revenue Overview</h3>
          <p className="text-secondary text-xs mt-0.5">Monthly store revenue</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(201,168,76,0.1)", color: "var(--accent)", border: "1px solid rgba(201,168,76,0.15)" }}>Last 7 months</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={MOCK} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="m" tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: "var(--bg-secondary)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 12, fontSize: 12, color: "var(--text-primary)" }}
            formatter={(v: any) => [`$${v.toLocaleString()}`, "Revenue"]}
          />
          <Area type="monotone" dataKey="rev" stroke="var(--accent)" strokeWidth={2} fill="url(#goldGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
