"use client";
// Path: frontend/src/app/dashboard/comeback/page.tsx
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Send, AlertTriangle, Clock, TrendingDown } from "lucide-react";
import toast from "react-hot-toast";

export default function ComebackPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const [editMsg, setEditMsg] = useState<Record<string, string>>({});
  const [sent, setSent]       = useState<Set<string>>(new Set());

  const { data: atRisk, isLoading } = useQuery({
    queryKey: ["at-risk", storeId],
    queryFn: async () => { const r = await api.get(`/features/at-risk/${storeId}`); return r.data.data; },
    enabled: !!storeId,
  });

  const sendMutation = useMutation({
    mutationFn: async ({ customerId, message }: any) =>
      api.post("/features/send-comeback", { customerId, message, storeId }),
    onSuccess: (_, vars) => {
      setSent(s => new Set([...s, vars.customerId]));
      toast.success("Win-back message sent!");
    },
  });

  const riskColor = (level: string) => level === "high" ? "#f87171" : level === "medium" ? "#fbbf24" : "#60a5fa";

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white mb-1">Customer Comeback</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            KAI detects customers who might be shopping elsewhere
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
          </div>
        ) : !atRisk?.length ? (
          <div className="text-center py-12">
            <TrendingDown size={32} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.12)" }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>No at-risk customers right now</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>KAI will alert you when it detects customers going quiet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(atRisk || []).map((customer: any, i: number) => {
              const color = riskColor(customer.riskLevel);
              const isSent = sent.has(customer.id);
              const msg = editMsg[customer.id] || customer.suggestedMessage;

              return (
                <motion.div key={customer.id}
                  className="rounded-xl p-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}20` }}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}>

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-white">{customer.name}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded-full capitalize"
                          style={{ background: `${color}15`, color }}>{customer.riskLevel} risk</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        <span>{customer.orderCount} orders</span>
                        <span>₦{customer.totalSpend.toLocaleString()} spent</span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />{customer.daysSinceLastOrder} days silent
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Editable message */}
                  <textarea
                    value={msg}
                    onChange={e => setEditMsg(m => ({ ...m, [customer.id]: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none mb-3"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.7)", fontSize: "12px" }}
                    rows={2} disabled={isSent} />

                  <div className="flex gap-2">
                    <button
                      onClick={() => sendMutation.mutate({ customerId: customer.id, message: msg })}
                      disabled={isSent || sendMutation.isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: isSent ? "rgba(52,211,153,0.15)" : "#7c3aed", color: isSent ? "#34d399" : "#fff", opacity: isSent ? 0.8 : 1 }}>
                      <Send size={11} />
                      {isSent ? "Sent ✓" : "Send WhatsApp"}
                    </button>
                    <button onClick={() => setEditMsg(m => ({ ...m, [customer.id]: customer.suggestedMessage }))}
                      className="px-3 py-1.5 rounded-lg text-xs"
                      style={{ color: "rgba(255,255,255,0.35)" }}>
                      Reset
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
