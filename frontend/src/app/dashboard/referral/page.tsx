"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Copy, Check, DollarSign, Users, TrendingUp, Zap, Gift, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA", green:"#10B981", amber:"#F59E0B" };
const TM = {
  dark:  { card:"#181230", border:"rgba(255,255,255,0.06)", text:"#fff", muted:"rgba(255,255,255,0.38)", faint:"rgba(255,255,255,0.04)" },
  light: { card:"#fff",    border:"rgba(15,5,32,0.07)",    text:"#0D0918", muted:"rgba(13,9,24,0.45)", faint:"rgba(15,5,32,0.03)" },
};

export default function ReferralPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = isDark ? TM.dark : TM.light;
  const user = useAuthStore(s => s.user);
  const [copied, setCopied] = useState(false);

  const { data } = useQuery({
    queryKey: ["referral-stats", user?.id],
    queryFn:  () => api.get("/referral/stats").then(r => r.data.data),
    enabled:  !!user?.id,
  });

  const refCode = data?.code || user?.id?.slice(-8).toUpperCase() || "XXXXXXXX";
  const refUrl  = `https://droposhq.com?ref=${refCode}`;
  const stats   = data || { clicks:0, signups:0, conversions:0, earned:0, pending:0 };
  const fmt     = (n: number) => new Intl.NumberFormat("en",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);

  const copy = () => {
    navigator.clipboard.writeText(refUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Referral link copied!");
  };

  const STEPS = [
    { n:"1", title:"Share your link", desc:"Send to fellow sellers, WhatsApp groups, Twitter, anywhere" },
    { n:"2", title:"They sign up",    desc:"Anyone who registers via your link is tracked automatically" },
    { n:"3", title:"They upgrade",    desc:"When they upgrade to Growth or Pro, your commission starts" },
    { n:"4", title:"You earn 20%",    desc:"Monthly. Forever. As long as they keep their subscription" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-6">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1" style={{color:t.text}}>DropOS Referral Programme</h1>
        <p className="text-xs sm:text-sm" style={{color:t.muted}}>Refer other sellers to DropOS. Earn 20% of their subscription forever.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {label:"Link Clicks",   value:stats.clicks,      color:V.v400,  icon:TrendingUp},
          {label:"Sign-ups",      value:stats.signups,     color:V.amber, icon:Users},
          {label:"Paying Users",  value:stats.conversions, color:V.green, icon:Gift},
          {label:"Total Earned",  value:fmt(stats.earned), color:V.v300,  icon:DollarSign},
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{background:`${s.color}15`}}>
              <s.icon size={14} style={{color:s.color}}/>
            </div>
            <p className="text-xl font-black mb-0.5" style={{color:t.text}}>{typeof s.value==="number"?s.value.toLocaleString():s.value}</p>
            <p className="text-xs" style={{color:t.muted}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="p-5 rounded-2xl mb-5" style={{background:t.card,border:`1px solid rgba(107,53,232,0.3)`}}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:V.v300}}>Your Referral Link</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 px-4 py-3 rounded-xl text-sm font-mono truncate" style={{background:t.faint,border:`1px solid ${t.border}`,color:t.text}}>
            {refUrl}
          </div>
          <button onClick={copy}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white flex-shrink-0"
            style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}>
            {copied ? <Check size={14}/> : <Copy size={14}/>}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs" style={{color:t.muted}}>
          <span>Your code: <strong style={{color:V.v300}}>{refCode}</strong></span>
          {stats.pending > 0 && <span style={{color:V.amber}}>₦{fmt(stats.pending)} pending payout</span>}
        </div>
      </div>

      {/* How it works */}
      <div className="p-5 rounded-2xl mb-5" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <h2 className="text-sm font-bold mb-5" style={{color:t.text}}>How it works</h2>
        <div className="grid sm:grid-cols-4 gap-4">
          {STEPS.map((step,i) => (
            <div key={step.n} className="flex sm:flex-col gap-3 sm:gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}>
                {step.n}
              </div>
              <div>
                <p className="text-sm font-bold mb-1" style={{color:t.text}}>{step.title}</p>
                <p className="text-xs leading-relaxed" style={{color:t.muted}}>{step.desc}</p>
              </div>
              {i < 3 && <ArrowRight size={14} className="hidden sm:block sm:mx-auto mt-2" style={{color:t.muted,opacity:0.3}}/>}
            </div>
          ))}
        </div>
      </div>

      {/* Earnings calculator */}
      <div className="p-5 rounded-2xl" style={{background:"rgba(107,53,232,0.06)",border:"1px solid rgba(107,53,232,0.2)"}}>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={14} color={V.v400}/>
          <h2 className="text-sm font-bold" style={{color:t.text}}>Earnings potential</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          {[
            {stores:10,  plan:"Growth", monthly:fmt(10*9500*0.2),  yearly:fmt(10*9500*0.2*12)},
            {stores:50,  plan:"Growth", monthly:fmt(50*9500*0.2),  yearly:fmt(50*9500*0.2*12)},
            {stores:100, plan:"Mix",    monthly:fmt(100*12000*0.2), yearly:fmt(100*12000*0.2*12)},
          ].map(calc => (
            <div key={calc.stores} className="p-4 rounded-xl" style={{background:"rgba(107,53,232,0.08)",border:"1px solid rgba(107,53,232,0.15)"}}>
              <p className="text-2xl font-black mb-1" style={{color:V.v300}}>{calc.monthly}</p>
              <p className="text-xs mb-1" style={{color:"rgba(255,255,255,0.5)"}}>per month</p>
              <p className="text-xs font-semibold" style={{color:V.v300}}>{calc.stores} referred stores</p>
              <p className="text-xs" style={{color:"rgba(255,255,255,0.3)"}}>{calc.yearly}/year</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-center mt-3" style={{color:"rgba(255,255,255,0.25)"}}>Based on 20% commission. Paid monthly via Paystack.</p>
      </div>
    </div>
  );
}
