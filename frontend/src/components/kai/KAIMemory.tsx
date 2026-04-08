"use client";
// ============================================================
// KAI — Memory Panel
// Path: frontend/src/components/kai/KAIMemory.tsx
// ============================================================
import { motion } from "framer-motion";
import { Brain, Trash2, Target, TrendingUp, User, Package, AlertCircle, CheckCircle } from "lucide-react";
import { useKaiStore } from "@/store/kai.store";
import { useKai } from "@/hooks/useKai";

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  business_fact:    { label: "Business Facts",    color: "#60a5fa", icon: Package },
  owner_preference: { label: "Your Preferences",  color: "#a78bfa", icon: User },
  goal:             { label: "Goals",             color: "#34d399", icon: Target },
  seasonal_pattern: { label: "Seasonal Patterns", color: "#fbbf24", icon: TrendingUp },
  supplier_note:    { label: "Supplier Notes",    color: "#fb923c", icon: Package },
  customer_insight: { label: "Customer Insights", color: "#f472b6", icon: User },
  brand_voice:      { label: "Brand Voice",       color: "#818cf8", icon: User },
  failure:          { label: "What Didn't Work",  color: "#f87171", icon: AlertCircle },
  success:          { label: "What Worked",       color: "#34d399", icon: CheckCircle },
  market_insight:   { label: "Market Insights",   color: "#38bdf8", icon: TrendingUp },
};

export function KAIMemory() {
  const { memories } = useKaiStore();
  const { deleteMemory } = useKai();

  // Group by category
  const grouped: Record<string, typeof memories> = {};
  for (const m of memories) {
    if (!grouped[m.category]) grouped[m.category] = [];
    grouped[m.category].push(m);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <Brain size={14} style={{ color: "#a78bfa" }} />
          <h2 className="text-sm font-semibold text-white">KAI Memory</h2>
        </div>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
          What KAI remembers about your business — forever
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Brain size={32} className="mb-3" style={{ color: "rgba(255,255,255,0.1)" }} />
            <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>
              No memories yet
            </p>
            <p className="text-xs mt-1 text-center max-w-xs leading-relaxed"
              style={{ color: "rgba(255,255,255,0.2)" }}>
              As you chat with KAI, it learns about your business and remembers everything across all sessions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([category, mems]) => {
              const config = CATEGORY_CONFIG[category] || { label: category, color: "#60a5fa", icon: Brain };
              const Icon = config.icon;
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 px-1 mb-2">
                    <Icon size={11} style={{ color: config.color }} />
                    <p className="text-xs font-medium" style={{ color: config.color, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      {config.label}
                    </p>
                    <span className="text-xs ml-auto" style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>
                      {mems.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {mems.map((memory: any) => (
                      <motion.div key={memory.id}
                        className="group flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", fontSize: "12px" }}>
                            {memory.value}
                          </p>
                          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>
                            Confidence: {Math.round(memory.confidence * 100)}% · Learned {formatDate(memory.learnedAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteMemory.mutate(memory.key)}
                          className="opacity-0 group-hover:opacity-60 w-5 h-5 flex items-center justify-center rounded flex-shrink-0 mt-0.5"
                          style={{ color: "#f87171" }}>
                          <Trash2 size={10} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "today";
    if (diff === 1) return "yesterday";
    return `${diff} days ago`;
  } catch { return ""; }
}
