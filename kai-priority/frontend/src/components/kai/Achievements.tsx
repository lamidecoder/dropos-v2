"use client";
// Path: frontend/src/components/kai/Achievements.tsx
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Lock } from "lucide-react";

export function Achievements({ storeId }: { storeId: string }) {
  const { data: achievements } = useQuery({
    queryKey: ["achievements", storeId],
    queryFn: async () => { const r = await api.get(`/features/achievements/${storeId}`); return r.data.data; },
    enabled: !!storeId,
  });

  if (!achievements) return null;

  const unlocked = achievements.filter((a: any) => a.unlocked);
  const locked   = achievements.filter((a: any) => !a.unlocked);

  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>Achievements</p>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>
          {unlocked.length}/{achievements.length}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {unlocked.map((a: any, i: number) => (
          <motion.div key={a.id} title={`${a.title}: ${a.description}`}
            className="flex flex-col items-center gap-1 p-2 rounded-xl cursor-default"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: i * 0.05, type: "spring", damping: 20 }}>
            <span className="text-xl">{a.emoji}</span>
            <p className="text-center leading-tight" style={{ color: "rgba(255,255,255,0.7)", fontSize: "9px" }}>{a.title}</p>
          </motion.div>
        ))}
        {locked.slice(0, 8 - unlocked.length).map((a: any) => (
          <div key={a.id} title={`Locked: ${a.description}`}
            className="flex flex-col items-center gap-1 p-2 rounded-xl opacity-30"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Lock size={16} style={{ color: "rgba(255,255,255,0.3)" }} />
            <p className="text-center leading-tight" style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px" }}>{a.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
