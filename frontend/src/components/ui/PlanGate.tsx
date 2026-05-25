"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, ArrowRight, Crown, Lock } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import Link from "next/link";

type Feature =
  | "products"   // Free: 20, Growth+: unlimited
  | "stores"     // Free+Growth: 1, Pro: unlimited
  | "kiro"       // Free: 10/day, Growth+: unlimited
  | "analytics"  // Free: basic, Growth+: full
  | "domain"     // Free: no, Growth+: yes
  | "branding"   // Free: required, Growth+: removable
  | "campaigns"  // Pro only
  | "loyalty"    // Pro only
  | "whatsapp"   // Pro only
  | "api"        // Pro only
  | "staff";     // Pro only: 3 accounts

const PLAN_REQUIREMENTS: Record<Feature, "FREE" | "GROWTH" | "PRO"> = {
  products:  "GROWTH",
  stores:    "PRO",
  kiro:      "GROWTH",
  analytics: "GROWTH",
  domain:    "GROWTH",
  branding:  "GROWTH",
  campaigns: "PRO",
  loyalty:   "PRO",
  whatsapp:  "PRO",
  api:       "PRO",
  staff:     "PRO",
};

const UPGRADE_COPY: Record<Feature, { title: string; desc: string; cta: string }> = {
  products:  { title: "Upgrade to add more products", desc: "You've hit the 20 product limit on your free plan. Growth gives you unlimited products.", cta: "Upgrade to Growth - ₦9,500/mo" },
  stores:    { title: "Multiple stores on Pro", desc: "Run unlimited stores on Pro. Your Growth plan includes 1 store.", cta: "Upgrade to Pro - ₦25,000/mo" },
  kiro:      { title: "Unlimited KIRO on Growth", desc: "You've used your 10 free KIRO messages today. Upgrade for unlimited chat.", cta: "Upgrade to Growth - ₦9,500/mo" },
  analytics: { title: "Full analytics on Growth", desc: "See LTV, cohorts, and revenue attribution with a Growth plan.", cta: "Upgrade to Growth - ₦9,500/mo" },
  domain:    { title: "Custom domain on Growth", desc: "Remove the dropos.io subdomain and use your own domain.", cta: "Upgrade to Growth - ₦9,500/mo" },
  branding:  { title: "Remove DropOS branding", desc: "Show your brand, not ours. Available on Growth and above.", cta: "Upgrade to Growth - ₦9,500/mo" },
  campaigns: { title: "Email campaigns on Pro", desc: "Send broadcast emails to your customer segments.", cta: "Upgrade to Pro - ₦25,000/mo" },
  loyalty:   { title: "Loyalty programme on Pro", desc: "Keep customers coming back with points and rewards.", cta: "Upgrade to Pro - ₦25,000/mo" },
  whatsapp:  { title: "WhatsApp Commerce on Pro", desc: "KIRO handles all customer WhatsApp messages automatically, 24/7.", cta: "Upgrade to Pro - ₦25,000/mo" },
  api:       { title: "API access on Pro", desc: "Build on top of DropOS with full API access.", cta: "Upgrade to Pro - ₦25,000/mo" },
  staff:     { title: "Staff accounts on Pro", desc: "Add up to 3 team members to manage your store.", cta: "Upgrade to Pro - ₦25,000/mo" },
};

function getPlanLevel(plan: string): number {
  if (plan === "PRO")    return 3;
  if (plan === "GROWTH") return 2;
  return 1; // FREE
}

function meetsRequirement(userPlan: string, required: string): boolean {
  return getPlanLevel(userPlan) >= getPlanLevel(required);
}

interface PlanGateProps {
  feature:   Feature;
  children:  React.ReactNode;
  fallback?: React.ReactNode;
  silent?:   boolean; // just hide, no modal
}

export function PlanGate({ feature, children, fallback, silent }: PlanGateProps) {
  const user    = useAuthStore(s => s.user);
  const plan    = user?.subscription?.plan || "FREE";
  const required = PLAN_REQUIREMENTS[feature];

  if (meetsRequirement(plan, required)) return <>{children}</>;
  if (silent) return fallback ? <>{fallback}</> : null;

  return (
    <>
      {fallback || (
        <div style={{ opacity: 0.4, pointerEvents: "none", filter: "grayscale(0.5)" }}>
          {children}
        </div>
      )}
      <UpgradePrompt feature={feature} requiredPlan={required} />
    </>
  );
}

export function UpgradePrompt({ feature, requiredPlan, inline = false }: { feature: Feature; requiredPlan: string; inline?: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  const copy = UPGRADE_COPY[feature];
  const color = requiredPlan === "PRO" ? "#F59E0B" : "#8B5CF6";
  const bg    = requiredPlan === "PRO" ? "rgba(245,158,11,0.08)" : "rgba(107,53,232,0.08)";

  if (dismissed && inline) return null;

  if (inline) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ padding: "14px 16px", borderRadius: 14, background: bg, border: `1px solid ${color}30`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {requiredPlan === "PRO" ? <Crown size={14} color={color} /> : <Zap size={14} color={color} />}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{copy.title}</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{copy.desc}</p>
        </div>
        <Link href="/dashboard/billing">
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${color},${color}99)`, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
            Upgrade <ArrowRight size={11} />
          </button>
        </Link>
        <button onClick={() => setDismissed(true)} style={{ color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer" }}><X size={14} /></button>
      </motion.div>
    );
  }

  return null;
}

// Usage limit progress bar — shown when approaching limits
export function UsageBar({ feature, current, max, label }: { feature: Feature; current: number; max: number; label?: string }) {
  const pct      = Math.min(100, Math.round((current / max) * 100));
  const isHigh   = pct >= 80;
  const isFull   = pct >= 100;
  const color    = isFull ? "#EF4444" : isHigh ? "#F59E0B" : "#6B35E8";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11 }}>
        <span style={{ color: "rgba(255,255,255,0.45)" }}>{label || feature}</span>
        <span style={{ color: isHigh ? color : "rgba(255,255,255,0.45)", fontWeight: isHigh ? 700 : 400 }}>
          {current} / {max}
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8 }}
          style={{ height: "100%", borderRadius: 99, background: color }}
        />
      </div>
      {isFull && (
        <UpgradePrompt feature={feature} requiredPlan={PLAN_REQUIREMENTS[feature]} inline />
      )}
    </div>
  );
}
