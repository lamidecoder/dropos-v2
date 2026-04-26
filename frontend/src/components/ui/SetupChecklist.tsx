"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, X, Zap, Package, CreditCard, Share2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "../../store/auth.store";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

interface ChecklistStep {
  id:       string;
  icon:     React.ElementType;
  label:    string;
  desc:     string;
  href:     string;
  points:   number;
  check:    (data: any) => boolean;
}

const STEPS: ChecklistStep[] = [
  {
    id:     "store",
    icon:   ShoppingBag,
    label:  "Create your store",
    desc:   "Give your store a name and pick a theme",
    href:   "/dashboard/stores",
    points: 20,
    check:  d => !!(d?.stores?.[0]?.name),
  },
  {
    id:     "product",
    icon:   Package,
    label:  "Add your first product",
    desc:   "Add at least one product to your store",
    href:   "/dashboard/products",
    points: 20,
    check:  d => (d?.productCount || 0) > 0,
  },
  {
    id:     "kiro",
    icon:   Zap,
    label:  "Chat with KIRO",
    desc:   "Ask KIRO to help set up your store",
    href:   "/dashboard/kiro",
    points: 20,
    check:  d => (d?.kiroMessageCount || 0) > 0,
  },
  {
    id:     "payment",
    icon:   CreditCard,
    label:  "Connect payments",
    desc:   "Set up Paystack to start receiving money",
    href:   "/dashboard/settings",
    points: 20,
    check:  d => !!(d?.stores?.[0]?.paystackConnected),
  },
  {
    id:     "share",
    icon:   Share2,
    label:  "Share your store",
    desc:   "Send your store link to your first customer",
    href:   "/dashboard/stores",
    points: 20,
    check:  d => (d?.orderCount || 0) > 0,
  },
];

export default function SetupChecklist() {
  const user    = useAuthStore(s => s.user);
  const [dismissed, setDismissed] = useState(false);
  const [hasShown, setHasShown]   = useState(false);

  const { data } = useQuery({
    queryKey:  ["setup-progress", user?.id],
    queryFn:   () => api.get("/dashboard/setup-progress").then(r => r.data.data),
    enabled:   !!user?.id,
    staleTime: 60000,
  });

  const progress = STEPS.filter(s => s.check(data || user)).length;
  const total    = STEPS.length;
  const pct      = Math.round((progress / total) * 100);
  const allDone  = progress === total;

  // Auto-dismiss when complete
  useEffect(() => {
    if (allDone) {
      const t = setTimeout(() => setDismissed(true), 3000);
      return () => clearTimeout(t);
    }
  }, [allDone]);

  // Don't show if dismissed or all done
  if (dismissed || allDone) return null;

  // Only show for new users (< 7 days old)
  const createdAt  = user?.createdAt ? new Date(user.createdAt) : new Date();
  const daysSince  = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince > 7) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{ borderRadius: 20, background: "rgba(107,53,232,0.08)", border: "1px solid rgba(107,53,232,0.2)", overflow: "hidden", marginBottom: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Zap size={15} color="#8B5CF6" />
            <p style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
              {progress === 0 ? "Let's get your store ready" : `${progress} of ${total} done - keep going!`}
            </p>
          </div>
          {/* Progress bar */}
          <div style={{ width: 200, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#6B35E8,#A78BFA)" }}
            />
          </div>
        </div>
        <button onClick={() => setDismissed(true)} style={{ color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer" }}>
          <X size={15} />
        </button>
      </div>

      {/* Steps */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(255,255,255,0.05)" }}>
        {STEPS.map((step, i) => {
          const done    = step.check(data || user);
          const Icon    = step.icon;
          return (
            <Link key={step.id} href={done ? "#" : step.href} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: done ? "rgba(16,185,129,0.05)" : "rgba(6,4,13,0.5)", transition: "background 0.15s", cursor: done ? "default" : "pointer" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: done ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${done ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)"}` }}>
                  {done
                    ? <Check size={13} color="#10B981" strokeWidth={3} />
                    : <Icon size={13} color="rgba(255,255,255,0.5)" />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: done ? 500 : 600, color: done ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.85)", textDecoration: done ? "line-through" : "none" }}>{step.label}</p>
                  {!done && <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{step.desc}</p>}
                </div>
                {!done && <ChevronRight size={12} color="rgba(255,255,255,0.2)" />}
              </div>
            </Link>
          );
        })}
      </div>

      <div style={{ padding: "10px 20px 14px", fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
        Complete all 5 steps to unlock your full store potential
      </div>
    </motion.div>
  );
}
