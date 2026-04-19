"use client";
// Path: frontend/src/app/dashboard/replay/page.tsx
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { TrendingUp, Award } from "lucide-react";

export default function ReplayPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";

  const { data } = useQuery({
    queryKey: ["replay", storeId],
    queryFn: async () => { const r = await api.get(`/features/replay/${storeId}`); return r.data.data; },
    enabled: !!storeId,
  });

  const maxCumulative = data?.timeline?.length
    ? Math.max(...data.timeline.map((t: any) => t.cumulative))
    : 1;

  return (
    <>
    
      <div className="p-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white mb-1">Revenue Replay</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Your business story — every sale that got you here
          </p>
        </div>

        {/* Total */}
        {data && (
          <div className="rounded-2xl p-5 mb-6 text-center"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(91,33,182,0.1))", border: "1px solid rgba(124,58,237,0.2)" }}>
            <p className="text-4xl font-black text-white mb-1">
              ₦{(data.totalRevenue || 0).toLocaleString()}
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>total revenue, all time</p>
          </div>
        )}

        {/* Milestones */}
        {data?.milestones?.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Milestones Reached</p>
            <div className="flex flex-wrap gap-2">
              {data.milestones.map((m: any, i: number) => (
                <motion.div key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1, type: "spring", damping: 20 }}>
                  <Award size={12} style={{ color: "#a78bfa" }} />
                  <p className="text-xs font-medium" style={{ color: "#a78bfa" }}>{m.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Chart */}
        {data?.timeline?.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Last 30 Sales</p>
            <div className="flex items-end gap-1 h-32">
              {data.timeline.map((t: any, i: number) => (
                <motion.div key={i}
                  className="flex-1 rounded-t-lg min-w-0"
                  style={{ background: "rgba(124,58,237,0.5)" }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(t.cumulative / maxCumulative) * 100}%` }}
                  transition={{ delay: i * 0.02, duration: 0.4 }}
                  title={`₦${t.amount.toLocaleString()} — ${new Date(t.date).toLocaleDateString()}`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>First sale</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Latest</p>
            </div>
          </div>
        )}

        {!data?.timeline?.length && (
          <div className="text-center py-12">
            <TrendingUp size={32} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.1)" }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>No sales yet</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>Your revenue story will appear here after your first sale</p>
          </div>
        )}
      </div>
    
    </>
  );
}
