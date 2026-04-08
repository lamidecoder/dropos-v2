"use client";
// ============================================================
// KAI — Inline Data Cards
// Path: frontend/src/components/kai/KAIDataCard.tsx
// Beautiful cards rendered inside KAI chat messages
// ============================================================
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ShoppingCart, Package, Users, Target, AlertTriangle } from "lucide-react";
import type { KaiDataCard } from "@/types/kai";

interface Props {
  card: KaiDataCard;
}

export function KAIDataCard({ card }: Props) {
  switch (card.type) {
    case "revenue":    return <RevenueCard card={card} />;
    case "orders":     return <OrdersCard card={card} />;
    case "products":   return <ProductsCard card={card} />;
    case "analytics":  return <AnalyticsCard card={card} />;
    case "alert":      return <AlertCard card={card} />;
    case "goal_progress": return <GoalCard card={card} />;
    default:           return <GenericCard card={card} />;
  }
}

function RevenueCard({ card }: Props) {
  const isUp = card.trend === "up";
  return (
    <motion.div className="rounded-xl p-4 my-2"
      style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "rgba(52,211,153,0.7)", fontSize: "10px" }}>{card.title}</p>
        <div className="flex items-center gap-1 text-xs" style={{ color: isUp ? "#34d399" : "#f87171" }}>
          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {card.trendValue}
        </div>
      </div>
      <p className="text-2xl font-black text-white">{card.value}</p>
      {card.subtext && <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{card.subtext}</p>}
    </motion.div>
  );
}

function OrdersCard({ card }: Props) {
  return (
    <motion.div className="rounded-xl p-4 my-2"
      style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.15)" }}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-2 mb-2">
        <ShoppingCart size={14} style={{ color: "#60a5fa" }} />
        <p className="text-xs font-medium" style={{ color: "#60a5fa" }}>{card.title}</p>
      </div>
      {card.items ? (
        <div className="space-y-1.5">
          {card.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span style={{ color: "rgba(255,255,255,0.65)" }}>{item.label}</span>
              <span className="font-medium text-white">{item.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-2xl font-black text-white">{card.value}</p>
      )}
    </motion.div>
  );
}

function ProductsCard({ card }: Props) {
  return (
    <motion.div className="rounded-xl p-4 my-2"
      style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-2 mb-2">
        <Package size={14} style={{ color: "#a78bfa" }} />
        <p className="text-xs font-medium" style={{ color: "#a78bfa" }}>{card.title}</p>
      </div>
      {card.items?.map((item, i) => (
        <div key={i} className="flex justify-between text-sm py-1 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          <span style={{ color: "rgba(255,255,255,0.65)" }}>{item.label}</span>
          <div>
            <span className="font-medium text-white">{item.value}</span>
            {item.sub && <span className="text-xs ml-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>{item.sub}</span>}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function AnalyticsCard({ card }: Props) {
  return (
    <motion.div className="rounded-xl p-4 my-2"
      style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)" }}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <p className="text-xs font-medium mb-3" style={{ color: "#fbbf24" }}>{card.title}</p>
      <div className="grid grid-cols-2 gap-2">
        {card.items?.map((item, i) => (
          <div key={i} className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>{item.label}</p>
            <p className="text-sm font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function AlertCard({ card }: Props) {
  return (
    <motion.div className="rounded-xl p-3 my-2 flex items-start gap-2.5"
      style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#f87171" }} />
      <div>
        <p className="text-xs font-medium text-white">{card.title}</p>
        {card.subtext && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{card.subtext}</p>}
      </div>
    </motion.div>
  );
}

function GoalCard({ card }: Props) {
  const progress = card.progress || 0;
  const color = progress >= 80 ? "#34d399" : progress >= 50 ? "#fbbf24" : "#a78bfa";
  return (
    <motion.div className="rounded-xl p-4 my-2"
      style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs font-medium" style={{ color: "#34d399" }}>{card.title}</p>
        <p className="text-sm font-bold" style={{ color }}>{progress}%</p>
      </div>
      <div className="h-2 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} />
      </div>
      {card.subtext && <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{card.subtext}</p>}
    </motion.div>
  );
}

function GenericCard({ card }: Props) {
  return (
    <motion.div className="rounded-xl p-4 my-2"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <p className="text-xs font-medium mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>{card.title}</p>
      {card.value && <p className="text-xl font-bold text-white">{card.value}</p>}
      {card.subtext && <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{card.subtext}</p>}
    </motion.div>
  );
}
