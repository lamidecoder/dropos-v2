"use client";
﻿"use client";
// ── FULFILLMENT QUEUE ─────────────────────────────────────────
// Path: frontend/src/app/dashboard/fulfillment/page.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Package, Check, Clock, ExternalLink, Truck } from "lucide-react";
import toast from "react-hot-toast";

export function FulfillmentPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const qc      = useQueryClient();
  const [tracking, setTracking] = useState<Record<string, string>>({});

  const { data: orders, isLoading } = useQuery({
    queryKey: ["fulfillment", storeId],
    queryFn:  async () => { const r = await api.get(`/intel/fulfillment?storeId=${storeId}`); return r.data.data; },
    enabled:  !!storeId,
    refetchInterval: 60000,
  });

  const fulfillMutation = useMutation({
    mutationFn: async ({ orderId, trackingNumber }: any) =>
      api.post("/intel/fulfillment/fulfill", { orderId, trackingNumber, storeId }),
    onSuccess: (_, { orderId }) => {
      qc.invalidateQueries(["fulfillment", storeId]);
      toast.success("Order marked as shipped!");
    },
  });

  return (
    
      <div className="p-6 max-w-3xl" style={{ minHeight: "100vh", background: "#07070e" }}>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white mb-0.5">Fulfillment Queue</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Orders waiting to be fulfilled — or tell KAI "show me unfulfilled orders"
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}</div>
        ) : !(orders || []).length ? (
          <div className="text-center py-16">
            <Check size={32} className="mx-auto mb-3" style={{ color: "#34d399", opacity: 0.5 }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>All caught up — no pending orders 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(orders || []).map((order: any, i: number) => (
              <motion.div key={order.id} className="rounded-2xl p-4"
                style={{ background: order.daysWaiting > 2 ? "rgba(248,113,113,0.06)" : "rgba(255,255,255,0.03)", border: order.daysWaiting > 2 ? "1px solid rgba(248,113,113,0.2)" : "1px solid rgba(255,255,255,0.07)" }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Order #{order.orderNumber}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{order.customer?.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: order.daysWaiting > 2 ? "#f87171" : "rgba(255,255,255,0.4)" }}>
                    <Clock size={11} />{order.daysWaiting} day{order.daysWaiting !== 1 ? "s" : ""} waiting
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  {order.items.map((item: any, j: number) => (
                    <div key={j} className="flex items-center justify-between">
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{item.productName} × {item.quantity}</p>
                      {item.sourceUrl && (
                        <a href={item.sourceUrl} target="_blank"
                          className="flex items-center gap-1 text-xs"
                          style={{ color: "#60a5fa" }}>
                          <ExternalLink size={10} />Order from supplier
                        </a>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input value={tracking[order.id] || ""} onChange={e => setTracking(t => ({ ...t, [order.id]: e.target.value }))}
                    placeholder="Tracking number (optional)"
                    className="flex-1 rounded-xl px-3 py-2 text-xs outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }} />
                  <button onClick={() => fulfillMutation.mutate({ orderId: order.id, trackingNumber: tracking[order.id] })}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: "#34d399", color: "#000" }}>
                    <Truck size={12} />Mark Shipped
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    
  );
}
export default FulfillmentPage;
