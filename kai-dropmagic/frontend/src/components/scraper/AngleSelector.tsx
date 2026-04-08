"use client";
// Path: frontend/src/components/scraper/AngleSelector.tsx
import { motion } from "framer-motion";
import { Sparkles, Check } from "lucide-react";

export function AngleSelector({ angles, selected, onSelect }: {
  angles:   any[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-white">Choose your selling angle</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            KAI builds your entire product page around this audience
          </p>
        </div>
        <button onClick={() => onSelect("kai_decide")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{
            background: selected === "kai_decide" ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
            border:     selected === "kai_decide" ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.08)",
            color:      selected === "kai_decide" ? "#a78bfa" : "rgba(255,255,255,0.45)",
          }}>
          <Sparkles size={11} />
          Let KAI decide
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {angles.map((angle, i) => {
          const isSelected = selected === angle.id;
          return (
            <motion.button key={angle.id}
              onClick={() => onSelect(angle.id)}
              className="text-left p-4 rounded-2xl transition-all relative overflow-hidden"
              style={{
                background: isSelected ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
                border:     isSelected ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.07)",
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: "spring", damping: 22 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}>

              {/* Selected check */}
              {isSelected && (
                <motion.div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "#7c3aed" }}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 20 }}>
                  <Check size={10} style={{ color: "#fff" }} />
                </motion.div>
              )}

              {/* Emoji */}
              <p className="text-2xl mb-2">{angle.emoji}</p>

              {/* Title */}
              <p className="text-sm font-semibold mb-1"
                style={{ color: isSelected ? "#a78bfa" : "rgba(255,255,255,0.85)" }}>
                {angle.title}
              </p>

              {/* Hook */}
              <p className="text-xs mb-2 italic leading-relaxed"
                style={{ color: "rgba(255,255,255,0.5)" }}>
                "{angle.hook}"
              </p>

              {/* Audience + platform */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-xs"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", fontSize: "10px" }}>
                  {angle.audience}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs"
                  style={{ background: isSelected ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)", color: isSelected ? "#a78bfa" : "rgba(255,255,255,0.35)", fontSize: "10px" }}>
                  {angle.adPlatform}
                </span>
              </div>

              {/* Hover gradient */}
              {!isSelected && (
                <motion.div className="absolute inset-0 rounded-2xl opacity-0 pointer-events-none"
                  style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.08), transparent)" }}
                  whileHover={{ opacity: 1 }} />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
