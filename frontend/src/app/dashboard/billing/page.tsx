"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import DashboardLayout from "../../../components/layout/DashboardLayout";

import { Check, Zap, Crown, Rocket, Loader2, CreditCard, Shield, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const PLANS = [
  {
    id:       "STARTER",
    name:     "Starter",
    icon:     Zap,
    price:    0,
    color:    "#64748b",
    stores:   1,
    products: 50,
    features: [
      "1 store",
      "Up to 50 products",
      "Basic analytics",
      "Email support",
      "Standard checkout",
      "DropOS subdomain",
    ],
  },
  {
    id:       "PRO",
    name:     "Pro",
    icon:     Rocket,
    price:    29,
    color:    "#7c3aed",
    stores:   3,
    products: 500,
    popular:  true,
    features: [
      "3 stores",
      "Up to 500 products",
      "Advanced analytics",
      "Priority support",
      "Custom domain",
      "Coupon codes",
      "Abandoned cart recovery",
      "Lower platform fee (8%)",
    ],
  },
  {
    id:       "ADVANCED",
    name:     "Advanced",
    icon:     Crown,
    price:    79,
    color:    "#f59e0b",
    stores:   10,
    products: 999999,
    features: [
      "10 stores",
      "Unlimited products",
      "Full analytics suite",
      "Dedicated support",
      "Custom domain",
      "Coupon codes",
      "Abandoned cart recovery",
      "Lowest platform fee (5%)",
      "White-label option",
      "API access",
    ],
  },
];

export default function BillingPage() {
  
  
  const user = useAuthStore((s) => s.user);
  const currentPlan = user?.subscription?.plan || "STARTER";
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const tx   = "[color:var(--text-primary)]";
  const sub  = "text-secondary";

  const { data: settings } = useQuery({
    queryKey: ["plan-settings"],
    queryFn:  () => api.get("/admin/settings").then((r) => r.data.data),
  });

  const upgradeMut = useMutation({
    mutationFn: (planId: string) =>
      api.post("/payments/subscribe", {
        plan:    planId,
        billing,
        email:   user?.email,
        name:    user?.name,
      }),
    onSuccess: (res) => {
      const url = res.data.data?.authorization_url
        || res.data.data?.link
        || res.data.data?.redirectUrl;
      if (url) {
        window.location.href = url;
      } else {
        toast.success("Plan updated!");
      }
    },
    onError: () => toast.error("Could not start upgrade — please try again"),
  });

  const getPrice = (base: number) => {
    if (base === 0) return 0;
    return billing === "yearly" ? Math.round(base * 12 * 0.8) : base;
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-8">
        {/* Header */}
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Billing & Plans</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>
            You're currently on the <span className="font-bold [color:var(--accent)]">{currentPlan}</span> plan
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center">
          <div className={`flex items-center gap-1 p-1 rounded-2xl border [background:var(--bg-secondary)] [border-color:var(--border)]`}>
            {(["monthly", "yearly"] as const).map((b) => (
              <button key={b} onClick={() => setBilling(b)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${
                  billing === b ? "[color:var(--text-primary)] shadow-md" : sub
                }`}
                style={billing === b ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
                {b}
                {b === "yearly" && (
                  <span className={`ml-2 text-xs font-black px-2 py-0.5 rounded-full ${billing === "yearly" ? "bg-[var(--bg-secondary)] 20" : "bg-emerald-500 text-[var(--text-primary)]"}`}>
                    -20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const Icon      = plan.icon;
            const isCurrent = currentPlan === plan.id;
            const price     = getPrice(plan.price);
            const isPopular = plan.popular;

            return (
              <div key={plan.id}
                className={`relative rounded-3xl border-2 p-6 flex flex-col transition-all ${
                  isPopular
                    ? "border-violet-500 shadow-2xl "
                    : "[border-color:var(--border)] [background:var(--bg-secondary)]/50"
                }`}
                style={isPopular ? { background: "rgba(124,58,237,.08)" } : {}}>

                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black text-[var(--text-primary)]"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                    Most Popular
                  </div>
                )}

                {/* Icon + name */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md"
                    style={{ background: `${plan.color}20` }}>
                    <Icon size={20} style={{ color: plan.color }} />
                  </div>
                  <div>
                    <h3 className={`font-black text-lg ${tx}`}>{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-xs font-bold [color:var(--accent)] [background:var(--accent-dim)] px-2 py-0.5 rounded-full">
                        Current Plan
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {price === 0 ? (
                    <div className={`text-4xl font-black ${tx}`}>Free</div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black ${tx}`}>${price}</span>
                      <span className={`text-sm ${sub}`}>/{billing === "yearly" ? "yr" : "mo"}</span>
                    </div>
                  )}
                  {billing === "yearly" && price > 0 && (
                    <p className="text-xs text-emerald-500 font-semibold mt-1">
                      Save ${Math.round(plan.price * 12 * 0.2)}/year
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${plan.color}20` }}>
                        <Check size={10} style={{ color: plan.color }} />
                      </div>
                      <span className={`text-sm ${sub}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <button disabled
                    className={`w-full py-3 rounded-xl text-sm font-bold border-2 opacity-60 cursor-default ${
                      "[border-color:var(--border-strong)] text-secondary"
                    }`}>
                    Current Plan
                  </button>
                ) : plan.price === 0 ? (
                  <button
                    onClick={() => upgradeMut.mutate(plan.id)}
                    className={`w-full py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                      "[border-color:var(--border-strong)] text-secondary hover:[background:var(--bg-card)]"
                    }`}>
                    Downgrade to Free
                  </button>
                ) : (
                  <button
                    onClick={() => upgradeMut.mutate(plan.id)}
                    disabled={upgradeMut.isPending}
                    className="w-full py-3.5 rounded-xl text-sm font-black [color:var(--text-primary)] flex items-center justify-center gap-2 shadow-lg transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-60"
                    style={{
                      background:  `linear-gradient(135deg, ${plan.color}, ${plan.color}bb)`,
                      boxShadow:   `0 8px 24px ${plan.color}40`,
                    }}>
                    {upgradeMut.isPending
                      ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
                      : <><ArrowRight size={16} /> Upgrade to {plan.name}</>}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Security note */}
        <div className={`flex items-center justify-center gap-6 text-xs ${sub}`}>
          <div className="flex items-center gap-1.5">
            <Shield size={13} className="text-emerald-500" /> SSL Encrypted Payments
          </div>
          <div className="flex items-center gap-1.5">
            <CreditCard size={13} className="[color:var(--accent)]" /> Cancel Anytime
          </div>
          <div className="flex items-center gap-1.5">
            <Check size={13} className="text-emerald-500" /> 30-Day Money Back
          </div>
        </div>

        {/* Current plan details */}
        <div className={`rounded-2xl border p-6 [background:var(--bg-secondary)]/50 [border-color:var(--border)]`}>
          <h3 className={`font-black mb-4 ${tx}`}>Current Plan Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { l: "Plan",          v: currentPlan },
              { l: "Status",        v: user?.subscription?.status || "ACTIVE" },
              { l: "Billing",       v: user?.subscription?.interval || "Free" },
              { l: "Next Billing",  v: user?.subscription?.currentPeriodEnd
                  ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString()
                  : "N/A" },
            ].map(({ l, v }) => (
              <div key={l}>
                <p className={`text-xs font-bold uppercase tracking-wide ${sub} mb-1`}>{l}</p>
                <p className={`font-bold text-sm ${tx}`}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
