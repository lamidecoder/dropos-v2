"use client";
// Path: frontend/src/components/scraper/ProductScoreCard.tsx
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Check, X } from "lucide-react";

export function ProductScoreCard({ score }: { score: any }) {
  const radius = 54;
  const circ   = 2 * Math.PI * radius;
  const filled = circ - (circ * score.total) / 100;

  const breakdownItems = Object.values(score.breakdown) as any[];

  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${score.color}30` }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 22 }}>

      {/* Score hero */}
      <div className="p-6 flex items-center gap-6"
        style={{ background: `linear-gradient(135deg, ${score.color}12, ${score.color}05)` }}>

        {/* Circular progress */}
        <div className="relative flex-shrink-0">
          <svg width="128" height="128" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="64" cy="64" r={radius} fill="none"
              stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <motion.circle cx="64" cy="64" r={radius} fill="none"
              stroke={score.color} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: filled }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span className="text-3xl font-black"
              style={{ color: score.color }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}>
              {score.total}
            </motion.span>
            <span className="text-xs font-bold" style={{ color: score.color }}>{score.grade}</span>
          </div>
        </div>

        {/* Verdict + pricing */}
        <div className="flex-1">
          <p className="text-base font-bold text-white mb-1">{score.verdict}</p>
          <p className="text-xs mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            {score.recommendation}
          </p>

          {/* Pricing grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Cost",    value: `${score.pricing.symbol}${score.pricing.supplierLocal.toLocaleString()}` },
              { label: "Sell",    value: `${score.pricing.symbol}${score.pricing.suggestedLocal.toLocaleString()}` },
              { label: "Margin",  value: `${score.pricing.margin}%` },
            ].map(item => (
              <div key={item.label} className="text-center py-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>{item.label}</p>
                <p className="text-sm font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="px-5 py-4 space-y-3">
        {breakdownItems.map((item, i) => (
          <motion.div key={item.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.07 }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
                {item.label}
              </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {item.detail}
              </span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div className="h-full rounded-full"
                style={{ background: item.score >= 16 ? "#34d399" : item.score >= 12 ? score.color : "#f87171" }}
                initial={{ width: 0 }}
                animate={{ width: `${(item.score / 20) * 100}%` }}
                transition={{ delay: 0.4 + i * 0.07, duration: 0.6 }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Import signal */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: score.shouldImport ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${score.shouldImport ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}` }}>
          {score.shouldImport
            ? <Check size={13} style={{ color: "#34d399" }} />
            : <X     size={13} style={{ color: "#f87171" }} />}
          <span className="text-xs" style={{ color: score.shouldImport ? "#34d399" : "#f87171" }}>
            {score.shouldImport ? "KAI recommends importing this product" : "KAI suggests finding a stronger product"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
