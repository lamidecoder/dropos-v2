"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Users, DollarSign, Link2, Copy, Check, Gift, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA", green:"#10B981", amber:"#F59E0B" };
const fmt = (n: number) => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);

export default function ReferralPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card: isDark?"#181230":"#fff", border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text: isDark?"#F0ECFF":"#130D2E", muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint: isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
  };
  const user = useAuthStore(s => s.user);
  const [copied, setCopied] = useState(false);

  const { data } = useQuery({
    queryKey: ["referral-stats"],
    queryFn: () => api.get("/referral/stats").then(r => r.data.data),
  });

  const link = data?.link || `https://droposhq.com/ref/${user?.id?.slice(-8)}`;

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label:"Total Referrals",  value: data?.referrals || 0,                color: V.v400,  icon: Users      },
    { label:"Total Earnings",   value: fmt(data?.earnings || 0),             color: V.green, icon: DollarSign },
    { label:"Pending Payout",   value: fmt(data?.pendingEarnings || 0),      color: V.amber, icon: Gift       },
    { label:"Paid Out",         value: fmt(data?.paidEarnings || 0),         color: V.v300,  icon: TrendingUp },
  ];

  const STEPS = [
    { step:"1", title:"Share your link", desc:"Send your unique referral link to other sellers and entrepreneurs." },
    { step:"2", title:"They sign up",    desc:"When someone creates a DropOS account using your link." },
    { step:"3", title:"You earn",        desc:"Get ₦5,000 for every active merchant you refer. No limit." },
  ];

  return (
    <div style={{ maxWidth:800, margin:"0 auto" }}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.04em", color:t.text, margin:"0 0 4px" }}>Referral Programme</h1>
        <p style={{ fontSize:13, color:t.muted, margin:0 }}>Earn ₦5,000 for every merchant you bring to DropOS</p>
      </motion.div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12, marginBottom:20 }}>
        {stats.map((s,i) => (
          <motion.div key={s.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            style={{ padding:16, borderRadius:16, background:t.card, border:`1px solid ${t.border}` }}>
            <div style={{ width:32, height:32, borderRadius:10, background:`${s.color}15`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
              <s.icon size={14} color={s.color}/>
            </div>
            <p style={{ fontSize:20, fontWeight:900, color:t.text, margin:"0 0 2px" }}>{s.value}</p>
            <p style={{ fontSize:12, color:t.muted, margin:0 }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Link */}
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.28}}
        style={{ padding:20, borderRadius:16, background:`linear-gradient(135deg,rgba(107,53,232,0.08),rgba(107,53,232,0.03))`, border:`1px solid rgba(107,53,232,0.2)`, marginBottom:20 }}>
        <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 12px" }}>Your Referral Link</p>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ flex:1, display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:12, background:isDark?"rgba(255,255,255,0.05)":"#F0EDFF", border:`1px solid ${t.border}` }}>
            <Link2 size={14} color={V.v400} style={{ flexShrink:0 }}/>
            <span style={{ fontSize:13, color:t.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{link}</span>
          </div>
          <button onClick={copy} style={{ display:"flex", alignItems:"center", gap:6, padding:"11px 18px", borderRadius:12, background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, border:"none", cursor:"pointer", color:"#fff", fontSize:13, fontWeight:700, flexShrink:0, fontFamily:"inherit" }}>
            {copied ? <Check size={14}/> : <Copy size={14}/>}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p style={{ fontSize:11, color:t.muted, margin:"10px 0 0" }}>Share this link on WhatsApp, Twitter, Instagram, or anywhere your audience is.</p>
      </motion.div>

      {/* How it works */}
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.35}}
        style={{ padding:20, borderRadius:16, background:t.card, border:`1px solid ${t.border}` }}>
        <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 16px" }}>How it works</p>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {STEPS.map((s,i) => (
            <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
              <div style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:14, fontWeight:900, color:"#fff" }}>
                {s.step}
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 3px" }}>{s.title}</p>
                <p style={{ fontSize:12, color:t.muted, margin:0, lineHeight:1.5 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
