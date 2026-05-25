"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Plus, TrendingUp, AlertTriangle, X, Check } from "lucide-react";
import { useCreditsStore, CREDIT_COSTS } from "../../store/credits.store";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

const TOP_UP_PACKS = [
  { id: "starter",    amount: 500,   price: 1500,   label: "Starter",    popular: false },
  { id: "growth",     amount: 2000,  price: 5000,   label: "Growth",     popular: true  },
  { id: "pro",        amount: 5000,  price: 10000,  label: "Pro",        popular: false },
  { id: "unlimited",  amount: 15000, price: 25000,  label: "Unlimited",  popular: false },
];

export function CreditBadge({ compact = false }: { compact?: boolean }) {
  const { balance, monthlyLimit } = useCreditsStore();
  const pct = Math.round((balance / monthlyLimit) * 100);
  const isLow = pct <= 20;
  const isCritical = pct <= 5;

  const color = isCritical ? "#EF4444" : isLow ? "#F59E0B" : "#10B981";
  const bg    = isCritical ? "rgba(239,68,68,0.1)" : isLow ? "rgba(245,158,11,0.1)" : "rgba(107,53,232,0.1)";

  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: bg, border: `1px solid ${color}30` }}>
        <Zap size={11} color={color} />
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{balance.toLocaleString()}</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Zap size={13} color={color} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Credits</span>
          <span style={{ fontSize: 11, fontWeight: 700, color }}>{balance.toLocaleString()} / {monthlyLimit.toLocaleString()}</span>
        </div>
        <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ height: "100%", borderRadius: 99, background: color }}
          />
        </div>
      </div>
    </div>
  );
}

export function CreditCost({ feature, children }: { feature: keyof typeof CREDIT_COSTS; children?: React.ReactNode }) {
  const { balance } = useCreditsStore();
  const cost = CREDIT_COSTS[feature];
  const canAfford = balance >= cost;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {children}
      <span style={{ fontSize: 11, fontWeight: 600, color: canAfford ? "#A78BFA" : "#EF4444", display: "flex", alignItems: "center", gap: 3 }}>
        <Zap size={10} />
        {cost} credits
        {!canAfford && <AlertTriangle size={10} color="#EF4444" />}
      </span>
    </div>
  );
}

export function TopUpModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);
  const { setBalance, balance } = useCreditsStore();

  const handleTopUp = async (pack: typeof TOP_UP_PACKS[0]) => {
    setLoading(pack.id);
    try {
      const res = await api.post("/billing/credits/topup", { packId: pack.id });
      const url = res.data?.data?.authorizationUrl;
      if (url) {
        window.location.href = url;
      } else {
        // Demo mode - just add credits
        setBalance(balance + pack.amount);
        toast.success(`Added ${pack.amount.toLocaleString()} credits!`);
        onClose();
      }
    } catch {
      toast.error("Top-up failed - backend offline");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 420, borderRadius: 24, background: "#181230", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 2 }}>Top Up Credits</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Credits never expire. Use for KIRO, images, videos.</p>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
        </div>

        <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {TOP_UP_PACKS.map(pack => (
            <button key={pack.id} onClick={() => handleTopUp(pack)} disabled={!!loading}
              style={{ padding: "16px", borderRadius: 16, border: `1px solid ${pack.popular ? "rgba(107,53,232,0.5)" : "rgba(255,255,255,0.08)"}`, background: pack.popular ? "rgba(107,53,232,0.1)" : "rgba(255,255,255,0.03)", cursor: "pointer", textAlign: "left", position: "relative", opacity: loading ? 0.6 : 1 }}>
              {pack.popular && <span style={{ position: "absolute", top: -8, right: 8, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#6B35E8", color: "#fff", letterSpacing: "0.05em", textTransform: "uppercase" }}>Popular</span>}
              {loading === pack.id
                ? <div style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Zap size={16} color="#8B5CF6" /></motion.div>
                  </div>
                : <>
                    <p style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 2 }}>{pack.amount.toLocaleString()}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>credits</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: "#A78BFA" }}>₦{pack.price.toLocaleString()}</p>
                  </>
              }
            </button>
          ))}
        </div>

        <div style={{ padding: "0 24px 24px" }}>
          <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(107,53,232,0.06)", border: "1px solid rgba(107,53,232,0.15)", fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
            Top-up credits roll over forever. Monthly plan credits reset each billing date. KIRO uses 1 credit per message.
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CreditWallet() {
  const { balance, plan, monthlyLimit, usedThisMonth } = useCreditsStore();
  const [showTopUp, setShowTopUp] = useState(false);
  const pct = Math.round((balance / monthlyLimit) * 100);
  const isLow = pct <= 20;

  return (
    <>
      <div style={{ padding: "14px 16px", borderRadius: 16, background: "rgba(107,53,232,0.08)", border: "1px solid rgba(107,53,232,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Zap size={14} color="#8B5CF6" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>KIRO Credits</span>
          </div>
          <button onClick={() => setShowTopUp(true)}
            style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, border: "1px solid rgba(107,53,232,0.4)", background: "rgba(107,53,232,0.12)", color: "#A78BFA", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={10} /> Top Up
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: isLow ? "#F59E0B" : "#fff" }}>{balance.toLocaleString()}</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>/ {monthlyLimit.toLocaleString()} this month</span>
        </div>

        <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 8 }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
            style={{ height: "100%", borderRadius: 99, background: isLow ? (pct <= 5 ? "#EF4444" : "#F59E0B") : "#6B35E8" }} />
        </div>

        {isLow && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: pct <= 5 ? "#F87171" : "#FCD34D" }}>
            <AlertTriangle size={11} />
            {pct <= 5 ? "Almost out! Top up to keep KIRO running." : "Running low on credits."}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}
      </AnimatePresence>
    </>
  );
}
