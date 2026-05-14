"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Check, Zap, CreditCard, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B" };

const PLANS = [
  {
    id:"free", name:"Free", price:0, color:"#6B7280",
    features:["1 store","5 products","Basic analytics","Community support"],
    limits:"5 products max",
  },
  {
    id:"growth", name:"Growth", price:9500, color:V.v400, popular:true,
    features:["3 stores","Unlimited products","Advanced analytics","KIRO AI assistant","Email campaigns","Priority support"],
    limits:"",
  },
  {
    id:"pro", name:"Pro", price:25000, color:"#F59E0B",
    features:["Unlimited stores","All Growth features","White label","API access","Dedicated support","Custom domain"],
    limits:"",
  },
];

const fmt = (n: number) => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);

export default function BillingPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card: isDark?"#181230":"#fff", border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text: isDark?"#F0ECFF":"#130D2E", muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint: isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
  };
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const currentPlan = user?.subscription?.plan?.toLowerCase() || "free";

  const { data: plans } = useQuery({
    queryKey: ["billing-plans"],
    queryFn: () => api.get("/billing/plans").then(r => r.data.data),
    staleTime: Infinity,
  });

  const upgradeMut = useMutation({
    mutationFn: (plan: string) => api.post("/billing/upgrade", { plan }),
    onSuccess: (_, plan) => {
      toast.success(`Upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)}!`);
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => toast.error("Upgrade failed — contact support"),
  });

  return (
    <div style={{ maxWidth:900, margin:"0 auto" }}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.04em", color:t.text, margin:"0 0 4px" }}>Plans & Billing</h1>
        <p style={{ fontSize:13, color:t.muted, margin:0 }}>
          Current plan: <span style={{ color:V.v400, fontWeight:700, textTransform:"capitalize" }}>{currentPlan}</span>
        </p>
      </motion.div>

      {/* Plans */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16, marginBottom:28 }}>
        {PLANS.map((plan, i) => {
          const isActive = currentPlan === plan.id;
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
              {!isActive && (
                <button
                  onClick={() => upgradeMut.mutate(plan.id)}
                  disabled={upgradeMut.isPending}
                  style={{ width:"100%", padding:"10px 0", borderRadius:12, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                    background: plan.id==="free" ? t.faint : `linear-gradient(135deg,${V.v500},#3D1C8A)`,
                    border: plan.id==="free" ? `1px solid ${t.border}` : "none",
                    color: plan.id==="free" ? t.muted : "#fff",
                  }}>
                  {upgradeMut.isPending ? <Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/> : <Zap size={13}/>}
                  {plan.id==="free" ? "Downgrade" : `Upgrade to ${plan.name}`}
                </button>
              )}
              {isActive && (
                <div style={{ textAlign:"center", padding:"10px 0", borderRadius:12, background:`${V.green}10`, border:`1px solid ${V.green}30`, fontSize:13, fontWeight:700, color:V.green }}>
                  ✓ Your current plan
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Paystack note */}
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
        style={{ padding:16, borderRadius:14, background:t.faint, border:`1px solid ${t.border}`, display:"flex", gap:12, alignItems:"flex-start" }}>
        <AlertCircle size={15} color={V.amber} style={{ flexShrink:0, marginTop:1 }}/>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 3px" }}>Payment via Paystack</p>
          <p style={{ fontSize:12, color:t.muted, margin:0, lineHeight:1.5 }}>
            Plan upgrades are processed through Paystack. Contact support at <strong>support@droposhq.com</strong> to upgrade your plan manually while the billing portal is being set up.
          </p>
        </div>
      </motion.div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
