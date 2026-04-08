"use client";
// Path: frontend/src/components/kai/LiveTicker.tsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ShoppingBag } from "lucide-react";

export function LiveTicker({ storeId }: { storeId: string }) {
  const [visible, setVisible] = useState<any>(null);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const { data: sales } = useQuery({
    queryKey: ["live-sales", storeId],
    queryFn: async () => { const r = await api.get(`/features/live-sales/${storeId}`); return r.data.data; },
    enabled: !!storeId,
    refetchInterval: 30 * 1000, // refresh every 30s
  });

  useEffect(() => {
    if (!sales?.length) return;
    const show = () => {
      setVisible(sales[index % sales.length]);
      setIndex(i => i + 1);
      timerRef.current = setTimeout(() => setVisible(null), 4000);
    };
    const interval = setInterval(show, 8000);
    show();
    return () => { clearInterval(interval); clearTimeout(timerRef.current); };
  }, [sales]);

  if (!sales?.length) return null;

  return (
    <div className="fixed bottom-24 left-4 z-40 pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl max-w-xs"
            style={{ background: "rgba(13,13,26,0.95)", border: "1px solid rgba(124,58,237,0.3)", backdropFilter: "blur(12px)" }}
            initial={{ opacity: 0, x: -40, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(52,211,153,0.15)" }}>
              <ShoppingBag size={14} style={{ color: "#34d399" }} />
            </div>
            <div>
              <p className="text-xs font-medium text-white">
                {visible.customerName} from {visible.city}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                bought <span style={{ color: "rgba(255,255,255,0.8)" }}>{visible.productName}</span> · <span style={{ color: "#34d399" }}>₦{visible.amount.toLocaleString()}</span>
              </p>
            </div>
            <p className="text-xs ml-auto flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
              {visible.minutesAgo < 1 ? "just now" : `${visible.minutesAgo}m ago`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Win Celebration (confetti on first sale) ──────────────────
export function WinCelebration({ show, type, amount }: { show: boolean; type: "first_sale" | "milestone"; amount?: number }) {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    if (!show) return;
    setParticles(Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: ["#7c3aed","#34d399","#fbbf24","#f472b6","#60a5fa"][Math.floor(Math.random() * 5)],
      size: Math.random() * 8 + 4,
    })));
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(p => (
        <motion.div key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: "-5%", width: p.size, height: p.size, background: p.color }}
          animate={{ y: "110vh", rotate: Math.random() * 720, opacity: [1, 1, 0] }}
          transition={{ duration: 2 + Math.random(), delay: p.delay, ease: "easeIn" }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div className="text-center px-8 py-6 rounded-3xl"
          style={{ background: "rgba(13,13,26,0.95)", border: "1px solid rgba(124,58,237,0.4)" }}
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}>
          <p className="text-5xl mb-3">{type === "first_sale" ? "🎉" : "🏆"}</p>
          <p className="text-xl font-bold text-white mb-1">
            {type === "first_sale" ? "YOUR FIRST SALE!" : `₦${amount?.toLocaleString()} milestone!`}
          </p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            {type === "first_sale" ? "Screenshot this. You'll want to remember this moment." : "You're on fire 🔥"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
