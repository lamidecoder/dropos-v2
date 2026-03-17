"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#7C3AED", "#10B981", "#3B82F6"];

export function PaymentSplit({ analytics }: { analytics?: any }) {
  const data = [
    { name: "Stripe",      value: analytics?.paymentSplit?.stripe      || 45 },
    { name: "Paystack",    value: analytics?.paymentSplit?.paystack    || 38 },
    { name: "Flutterwave", value: analytics?.paymentSplit?.flutterwave || 17 },
  ];
  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Payment Gateways</h3>
      <ResponsiveContainer width="100%" height={120}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 mt-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{d.name}</span>
            </div>
            <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
