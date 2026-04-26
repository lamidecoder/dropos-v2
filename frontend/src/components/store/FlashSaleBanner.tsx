"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Clock } from "lucide-react";

interface FlashSale {
  id:             string;
  name:           string;
  discountPercent: number;
  endsAt:         string;
  active:         boolean;
}

function useCountdown(endsAt: string) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, expired: false });

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ h: 0, m: 0, s: 0, expired: true }); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s, expired: false });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return timeLeft;
}

function Digit({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center font-black text-sm tabular-nums"
      style={{ minWidth: 22 }}>
      {String(n).padStart(2, "0")}
    </span>
  );
}

export default function FlashSaleBanner({ sale, brand }: { sale: FlashSale; brand: string }) {
  const [dismissed, setDismissed] = useState(false);
  const { h, m, s, expired }      = useCountdown(sale.endsAt);

  if (dismissed || expired) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        style={{ background: `linear-gradient(135deg, ${brand}, ${brand}bb)`, overflow: "hidden" }}>
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Zap size={14} color="white" />
            </motion.div>
            <span className="text-sm font-bold text-white">{sale.name} — {sale.discountPercent}% off everything</span>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-1.5 text-white">
            <Clock size={12} style={{ opacity: 0.75 }} />
            <span className="text-xs font-semibold opacity-75">Ends in</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ background: "rgba(0,0,0,0.2)" }}>
              <Digit n={h} />
              <span className="text-xs font-bold opacity-60">:</span>
              <Digit n={m} />
              <span className="text-xs font-bold opacity-60">:</span>
              <Digit n={s} />
            </div>
          </div>

          <button onClick={() => setDismissed(true)}
            className="flex-shrink-0 transition-opacity hover:opacity-60"
            style={{ background: "none", border: "none", cursor: "pointer", color: "white" }}>
            <X size={15} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
