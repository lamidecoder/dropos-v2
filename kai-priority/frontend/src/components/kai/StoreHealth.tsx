"use client";
// Path: frontend/src/components/kai/StoreHealth.tsx
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TrendingUp, AlertCircle, CheckCircle, Zap } from "lucide-react";

export function StoreHealth({ storeId }: { storeId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["health", storeId],
    queryFn: async () => { const r = await api.get(`/features/health/${storeId}`); return r.data.data; },
    enabled: !!storeId,
    refetchInterval: 5 * 60 * 1000,
  });

  if (isLoading || !data) return <HealthSkeleton />;

  const { score, grade, breakdown, topFixes } = data;
  const color = score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#f87171";

  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>Store Health</p>
          <div className="flex items-end gap-2">
            <motion.p className="text-4xl font-bold" style={{ color }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {score}
            </motion.p>
            <p className="text-lg font-bold mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>/100</p>
          </div>
        </div>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black"
          style={{ background: `${color}18`, border: `2px solid ${color}40`, color }}>
          {grade}
        </div>
      </div>

      {/* Score breakdown bars */}
      <div className="space-y-2.5 mb-5">
        {Object.values(breakdown).map((b: any) => (
          <div key={b.label}>
            <div className="flex justify-between mb-1">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{b.label}</span>
              <span className="text-xs font-medium" style={{ color: b.score === b.max ? "#34d399" : "rgba(255,255,255,0.7)" }}>{b.score}/{b.max}</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div className="h-full rounded-full" style={{ background: b.score === b.max ? "#34d399" : color }}
                initial={{ width: 0 }} animate={{ width: `${(b.score / b.max) * 100}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
            </div>
          </div>
        ))}
      </div>

      {/* Top fixes */}
      {topFixes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Fix These Today</p>
          {topFixes.map((fix: string, i: number) => (
            <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
              <Zap size={11} className="mt-0.5 flex-shrink-0" style={{ color: "#fbbf24" }} />
              {fix}
            </div>
          ))}
        </div>
      )}

      {score === 100 && (
        <div className="flex items-center gap-2 text-sm" style={{ color: "#34d399" }}>
          <CheckCircle size={14} />
          Perfect score — your store is optimised 🔥
        </div>
      )}
    </div>
  );
}

function HealthSkeleton() {
  return (
    <div className="rounded-2xl p-5 animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="h-10 w-24 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.06)" }} />
      <div className="space-y-3">
        {[1,2,3,4,5].map(i => <div key={i} className="h-3 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />)}
      </div>
    </div>
  );
}
