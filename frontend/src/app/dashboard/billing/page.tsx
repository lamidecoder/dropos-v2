"use client";
﻿"use client";
// Path: frontend/src/app/dashboard/billing/page.tsx

import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { Check, Zap, Crown, ArrowUpRight, CreditCard, Receipt, ChevronRight, Shield, Sparkles } from "lucide-react";
import { useAuthStore } from "../../../store/auth.store";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";

const V = { v900: "#1A0D3D", v700: "#3D1C8A", v600: "#5428C8", v500: "#6B35E8", v400: "#8B5CF6", v300: "#A78BFA", v200: "#C4B5FD", fuchsia: "#C026D3" };
const T = {
  dark:  { card: "#181230", border: "rgba(255,255,255,0.06)", text: "#fff", muted: "rgba(255,255,255,0.38)", faint: "rgba(255,255,255,0.04)" },
  light: { card: "#fff",    border: "rgba(15,5,32,0.07)",    text: "#0D0918", muted: "rgba(13,9,24,0.45)", faint: "rgba(15,5,32,0.03)" },
};

const PLANS = [
  {
    id: "FREE", name: "Free", price: { ngn: 0, gbp: 0, usd: 0 },
    icon: Sparkles, color: "#6B7280",
    features: ["1 store", "20 products", "KIRO 10 msgs/day", "Basic analytics", "2% transaction fee", "Community support"],
    limit: true,
  },
  {
    id: "GROWTH", name: "Growth", price: { ngn: 9500, gbp: 12, usd: 15 },
    icon: Zap, color: V.v400,
    features: ["1 store", "Unlimited products", "Full KIRO access", "Advanced analytics", "Custom domain", "1.5% transaction fee", "Email support 24hr", "Coupons & flash sales", "Abandoned cart recovery"],
    popular: true,
  },
  {
    id: "PRO", name: "Pro", price: { ngn: 25000, gbp: 35, usd: 45 },
    icon: Crown, color: "#F59E0B",
    features: ["Unlimited stores", "Everything in Growth", "KIRO Pro intelligence", "WhatsApp commerce bot", "1% transaction fee", "Email campaigns", "Loyalty programme", "3 staff accounts", "API access", "Priority support 2hr"],
  },
];

const CURRENCY_LABELS: Record<string, string> = { ngn: "₦", gbp: "£", usd: "$" };

export default function BillingPage() {
  const { theme } = useTheme();
  const t = theme === "dark" ? T.dark : T.light;
  const { user } = useAuthStore();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [currency, setCurrency] = useState<"ngn" | "gbp" | "usd">("ngn");
  const currentPlan = user?.subscription?.plan || "FREE";

  const upgradeMut = useMutation({
    mutationFn: async (planId: string) => {
      const price = PLANS.find(p => p.id === planId)?.price[currency] || 0;
      const amount = billing === "annual" ? Math.round(price * 10) : price; // 10 months for annual (2 free)
      return api.post("/billing/upgrade", { plan: planId, currency, billing, amount });
    },
    onSuccess: (res) => {
      const url = res.data?.data?.authorizationUrl || res.data?.data?.url;
      if (url) { window.location.href = url; }
      else { toast.success("Plan updated!"); }
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Upgrade failed - backend offline"),
  });

  const handleUpgrade = (planId: string) => {
    if (planId === "FREE") return;
    if (planId === currentPlan) { toast.success("You are already on this plan"); return; }
    const plan = PLANS.find(p => p.id === planId);
    const price = plan?.price[currency] || 0;
    const msg = billing === "annual"
      ? `Upgrade to ${plan?.name} — ${CURRENCY_LABELS[currency]}${(price * 10).toLocaleString()}/year (2 months free)`
      : `Upgrade to ${plan?.name} — ${CURRENCY_LABELS[currency]}${price.toLocaleString()}/month`;
    toast.loading(msg, { duration: 2000 });
    setTimeout(() => upgradeMut.mutate(planId), 400);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: t.text }}>Billing & Plans</h1>
          <p style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>Manage your subscription and payment details</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 11, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", fontSize: 13, color: t.muted }}>
            <Receipt size={13} /> View Invoices
          </button>
        </div>
      </motion.div>

      {/* Current plan banner */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ padding: "18px 22px", borderRadius: 16, marginBottom: 28, background: "rgba(107,53,232,0.08)", border: "1px solid rgba(107,53,232,0.2)", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(145deg, ${V.v500}, ${V.v900})`, boxShadow: "0 4px 14px rgba(107,53,232,0.3)" }}>
          <Zap size={18} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>You're on the <span style={{ color: V.v300 }}>{currentPlan}</span> plan</div>
          <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>Upgrade anytime. No contracts. Cancel anytime.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={13} color={V.v400} />
          <span style={{ fontSize: 12, color: V.v400 }}>Secured by Paystack</span>
        </div>
      </motion.div>

      {/* Billing toggle + currency */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-7" style={{}}>
        <div style={{ display: "flex", padding: 3, borderRadius: 12, background: t.card, border: `1px solid ${t.border}` }}>
          {(["monthly", "annual"] as const).map(b => (
            <button key={b} onClick={() => setBilling(b)}
              style={{ padding: "7px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: billing === b ? 600 : 400, background: billing === b ? (theme === "dark" ? "rgba(107,53,232,0.25)" : "rgba(107,53,232,0.12)") : "transparent", color: billing === b ? (theme === "dark" ? V.v200 : V.v600) : t.muted, transition: "all 0.15s" }}>
              {b === "monthly" ? "Monthly" : "Annual"}{b === "annual" && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: "rgba(16,185,129,0.2)", color: "#10B981" }}>-17%</span>}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", padding: 3, borderRadius: 12, background: t.card, border: `1px solid ${t.border}` }}>
          {(["ngn", "gbp", "usd"] as const).map(c => (
            <button key={c} onClick={() => setCurrency(c)}
              style={{ padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: currency === c ? 600 : 400, background: currency === c ? (theme === "dark" ? "rgba(107,53,232,0.25)" : "rgba(107,53,232,0.12)") : "transparent", color: currency === c ? (theme === "dark" ? V.v200 : V.v600) : t.muted, transition: "all 0.15s" }}>
              {CURRENCY_LABELS[c]}{c.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" style={{}}>
        {PLANS.map((plan, i) => {
          const Icon = plan.icon;
          const isCurrent = currentPlan === plan.id;
          const price = billing === "annual" ? Math.round(plan.price[currency] * 10) : plan.price[currency];
          const isPopular = plan.popular;

          return (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              style={{ padding: 24, borderRadius: 20, position: "relative", overflow: "hidden", background: isPopular ? `linear-gradient(145deg, ${V.v900} 0%, #110D22 100%)` : t.card, border: `1px solid ${isPopular ? "rgba(107,53,232,0.4)" : isCurrent ? "rgba(107,53,232,0.25)" : t.border}`, boxShadow: isPopular ? "0 8px 32px rgba(107,53,232,0.25)" : theme === "light" ? "0 1px 3px rgba(15,5,32,0.04), 0 4px 20px rgba(15,5,32,0.03)" : "none" }}>

              {/* Glow for popular */}
              {isPopular && <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(107,53,232,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />}

              {/* Popular badge */}
              {isPopular && (
                <div style={{ position: "absolute", top: 14, right: 14, fontFamily: "'Syncopate', sans-serif", fontSize: 7.5, fontWeight: 700, letterSpacing: "0.1em", padding: "4px 8px", borderRadius: 6, background: `linear-gradient(135deg, ${V.v500}, ${V.fuchsia})`, color: "white" }}>POPULAR</div>
              )}

              {/* Current badge */}
              {isCurrent && !isPopular && (
                <div style={{ position: "absolute", top: 14, right: 14, fontFamily: "'Syncopate', sans-serif", fontSize: 7.5, fontWeight: 700, letterSpacing: "0.1em", padding: "4px 8px", borderRadius: 6, background: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.25)" }}>CURRENT</div>
              )}

              {/* Plan icon */}
              <div style={{ width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, background: `${plan.color}20`, border: `1px solid ${plan.color}30` }}>
                <Icon size={20} color={plan.color} />
              </div>

              <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: plan.color, marginBottom: 6 }}>{plan.name.toUpperCase()}</div>

              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em", color: isPopular ? "#fff" : t.text }}>
                  {CURRENCY_LABELS[currency]}{price === 0 ? "0" : price.toLocaleString()}
                </span>
                {price > 0 && <span style={{ fontSize: 13, color: isPopular ? "rgba(255,255,255,0.45)" : t.muted }}>/mo</span>}
                {price === 0 && <span style={{ fontSize: 13, color: isPopular ? "rgba(255,255,255,0.45)" : t.muted }}> forever</span>}
                {billing === "annual" && price > 0 && <div style={{ fontSize: 11, color: "#10B981", marginTop: 3 }}>Billed annually · 2 months free</div>}
              </div>

              {/* CTA */}
              <button
                disabled={isCurrent || upgradeMut.isPending}
                onClick={() => !isCurrent && handleUpgrade(plan.id)}
                style={{ width: "100%", padding: "11px", borderRadius: 12, border: isCurrent ? `1px solid ${t.border}` : "none", cursor: isCurrent ? "default" : "pointer", fontSize: 13, fontWeight: 700, marginBottom: 20, background: isCurrent ? "transparent" : isPopular ? `linear-gradient(135deg, ${V.v500}, ${V.v700})` : `${plan.color}15`, color: isCurrent ? t.muted : isPopular ? "white" : plan.color, boxShadow: isPopular && !isCurrent ? "0 4px 16px rgba(107,53,232,0.35)" : "none", transition: "all 0.15s", opacity: upgradeMut.isPending ? 0.7 : 1 }}>
                {upgradeMut.isPending && upgradeMut.variables === plan.id ? "Opening Paystack..." : isCurrent ? "Current Plan" : plan.id === "FREE" ? "Downgrade" : `Upgrade to ${plan.name}`}
              </button>

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `${plan.color}20`, flexShrink: 0 }}>
                      <Check size={9} color={plan.color} />
                    </div>
                    <span style={{ fontSize: 12, color: isPopular ? "rgba(255,255,255,0.7)" : t.muted }}>{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Payment method */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ padding: 20, borderRadius: 16, background: t.card, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: t.faint, border: `1px solid ${t.border}` }}>
          <CreditCard size={18} color={t.muted} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>No payment method added</div>
          <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>Add a card or bank account to upgrade your plan</div>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${V.v500}, ${V.v700})`, color: "white", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 12px rgba(107,53,232,0.3)" }}>
          Add Payment Method <ChevronRight size={13} />
        </button>
      </motion.div>
    </div>
  );
}
