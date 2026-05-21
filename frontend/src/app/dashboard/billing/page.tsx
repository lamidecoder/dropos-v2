"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Check, Zap, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B" };

const PLANS = [
  {
    id:"free", name:"Free", price:0, color:"#6B7280",
    features:["1 store","5 products","Basic analytics","Community support"],
  },
  {
    id:"growth", name:"Growth", price:9500, color:V.v400, popular:true,
    features:["3 stores","Unlimited products","Advanced analytics","KIRO AI assistant","Email campaigns","Priority support"],
  },
  {
    id:"pro", name:"Pro", price:25000, color:"#F59E0B",
    features:["Unlimited stores","All Growth features","White label","API access","Dedicated support","Custom domain"],
  },
];

const fmt = (n: number) => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);

export default function BillingPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card:   isDark?"#181230":"#fff",
    border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text:   isDark?"#F0ECFF":"#130D2E",
    muted:  isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint:  isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
  };

  const { user, updateUser } = useAuthStore();
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const currentPlan = user?.subscription?.plan?.toLowerCase() || "free";

  // Handle Paystack callback redirect
  useEffect(() => {
    const status = searchParams.get("status");
    const plan   = searchParams.get("plan");
    const ref    = searchParams.get("reference") || searchParams.get("trxref");
    if (status === "success" && ref) {
      api.post("/billing/verify", { reference: ref })
        .then(() => {
          toast.success(`Upgraded to ${plan || "new plan"}! 🎉`);
          qc.invalidateQueries({ queryKey: ["me"] });
          window.history.replaceState({}, "", "/dashboard/billing");
        })
        .catch(() => toast.error("Could not verify payment — contact support"));
    }
  }, []);

  const { data: plans } = useQuery({
    queryKey: ["billing-plans"],
    queryFn:  () => api.get("/billing/plans").then(r => r.data.data),
    staleTime: Infinity,
  });

  const upgradeMut = useMutation({
    mutationFn: async (plan: string) => {
      const res = await api.post("/billing/initialize", { plan });
      const d   = res.data;
      if (d.authorizationUrl) {
        // Redirect to Paystack hosted page
        window.location.href = d.authorizationUrl;
        return;
      }
      // Dev/test mode — direct upgrade
      return d;
    },
    onSuccess: (data) => {
      if (!data) return; // redirected
      toast.success(data.message || "Plan updated!");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => toast.error("Something went wrong — try again"),
  });

  return (
    <div style={{ maxWidth:900, margin:"0 auto" }}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.04em", color:t.text, margin:"0 0 4px" }}>Plans & Billing</h1>
        <p style={{ fontSize:13, color:t.muted, margin:0 }}>
          Current plan: <span style={{ color:V.v400, fontWeight:700, textTransform:"capitalize" }}>{currentPlan}</span>
          {user?.subscription?.currentPeriodEnd && (
            <span style={{ marginLeft:8, color:t.muted }}>
              · renews {new Date(user.subscription.currentPeriodEnd).toLocaleDateString("en-NG",{day:"numeric",month:"short",year:"numeric"})}
            </span>
          )}
        </p>
      </motion.div>

      {/* Plans */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16, marginBottom:28 }}>
        {PLANS.map((plan, i) => {
          const isActive = currentPlan === plan.id;
          const isPending = upgradeMut.isPending;
          return (
            <motion.div key={plan.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
              style={{ padding:24, borderRadius:20, background:isActive?`rgba(107,53,232,0.06)`:t.card, border:`2px solid ${isActive?V.v400:plan.popular?"rgba(107,53,232,0.25)":t.border}`, position:"relative", overflow:"hidden" }}>
              {plan.popular && !isActive && (
                <div style={{ position:"absolute", top:14, right:14, background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, color:"#fff", fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:99 }}>
                  POPULAR
                </div>
              )}
              {isActive && (
                <div style={{ position:"absolute", top:14, right:14, background:V.green, color:"#fff", fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:99 }}>
                  ACTIVE
                </div>
              )}
              <div style={{ marginBottom:16 }}>
                <p style={{ fontSize:16, fontWeight:800, color:t.text, margin:"0 0 4px" }}>{plan.name}</p>
                <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                  <p style={{ fontSize:28, fontWeight:900, color:plan.color, margin:0, letterSpacing:"-0.04em" }}>
                    {plan.price === 0 ? "Free" : fmt(plan.price)}
                  </p>
                  {plan.price > 0 && <span style={{ fontSize:12, color:t.muted }}>/month</span>}
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:18, height:18, borderRadius:"50%", background:`${plan.color}20`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Check size={10} color={plan.color} strokeWidth={3}/>
                    </div>
                    <span style={{ fontSize:12, color:t.muted }}>{f}</span>
                  </div>
                ))}
              </div>
              {!isActive ? (
                <button
                  onClick={() => upgradeMut.mutate(plan.id)}
                  disabled={isPending}
                  style={{ width:"100%", padding:"11px 0", borderRadius:12, cursor:isPending?"wait":"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:6, border:"none",
                    background: plan.id==="free" ? t.faint : `linear-gradient(135deg,${V.v500},#3D1C8A)`,
                    color: plan.id==="free" ? t.muted : "#fff",
                    boxShadow: plan.id!=="free" ? `0 4px 14px ${V.v500}35` : "none",
                  }}>
                  {isPending ? <Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/> : plan.id==="free" ? <RefreshCw size={13}/> : <Zap size={13}/>}
                  {plan.id==="free" ? "Downgrade to Free" : `Upgrade to ${plan.name} — ${fmt(plan.price)}/mo`}
                </button>
              ) : (
                <div style={{ textAlign:"center", padding:"11px 0", borderRadius:12, background:`${V.green}10`, border:`1px solid ${V.green}30`, fontSize:13, fontWeight:700, color:V.green }}>
                  ✓ Your current plan
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Payment info */}
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
        style={{ padding:16, borderRadius:14, background:t.faint, border:`1px solid ${t.border}`, display:"flex", gap:12, alignItems:"flex-start" }}>
        <span style={{ fontSize:18, flexShrink:0 }}>🔒</span>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 3px" }}>Secure payment via Paystack</p>
          <p style={{ fontSize:12, color:t.muted, margin:0, lineHeight:1.5 }}>
            All payments are processed securely through Paystack. Your card details are never stored on our servers.
            Questions? Email <strong>support@droposhq.com</strong>
          </p>
        </div>
      </motion.div>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
