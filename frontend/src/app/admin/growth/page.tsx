"use client";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, DollarSign, Zap, ArrowUpRight, Percent } from "lucide-react";
import { PageHeader, StatGrid, StatCard } from "../../../components/admin/AdminTable";
import { motion } from "framer-motion";

const V = { accent:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B", red:"#EF4444", cyan:"#06B6D4" };
const t = { card:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.07)", text:"rgba(255,255,255,0.9)", muted:"rgba(255,255,255,0.4)" };

function fmtCurrency(n: number) {
  if (n >= 1_000_000) return `₦${(n/1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `₦${(n/1_000).toFixed(1)}k`;
  return `₦${n.toFixed(0)}`;
}

function MetricCard({ label, value, sub, color, icon:Icon, delay=0 }: any) {
  return (
    <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay }}
      style={{ padding:24, borderRadius:18, background:t.card, border:`1px solid ${t.border}` }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ width:38, height:38, borderRadius:11, background:`${color}14`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={17} color={color}/>
        </div>
        {sub && <span style={{ fontSize:11, fontWeight:700, color:V.green, background:"rgba(16,185,129,0.1)", padding:"2px 8px", borderRadius:99, display:"flex", alignItems:"center", gap:3 }}>
          <ArrowUpRight size={10}/>{sub}
        </span>}
      </div>
      <p style={{ fontSize:28, fontWeight:900, color:t.text, letterSpacing:"-0.05em", margin:"0 0 4px", lineHeight:1 }}>{value}</p>
      <p style={{ fontSize:12, color:t.muted, margin:0 }}>{label}</p>
    </motion.div>
  );
}

export default function AdminGrowthPage() {
  const { data: raw } = useQuery<any>({
    queryKey: ["admin-growth"],
    queryFn: () => adminAPI.get("/admin/growth").then((r:any) => r.data.data),
    refetchInterval: 300_000,
  });
  const { data: statsRaw } = useQuery<any>({
    queryKey: ["admin-overview"],
    queryFn: () => adminAPI.getStats().then((r:any) => r.data.data),
  });

  const g = raw || {};
  const s = statsRaw || {};
  const monthly = s.monthlyRevenue || [];

  return (
    <div>
      <PageHeader title="Growth Metrics" sub="MRR, ARR, LTV and platform health"/>

      {/* Key Metrics */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }} className="adm-3col">
        <MetricCard label="Monthly Recurring Revenue (MRR)" value={fmtCurrency(g.MRR||0)} color={V.green} icon={DollarSign} delay={0}/>
        <MetricCard label="Annual Run Rate (ARR)"           value={fmtCurrency(g.ARR||0)} color={V.accent} icon={TrendingUp} delay={0.07}/>
        <MetricCard label="Avg Lifetime Value (LTV)"       value={fmtCurrency(g.LTV||0)} color={V.cyan}   icon={Zap}        delay={0.14}/>
      </div>

      <StatGrid cols={4}>
        <StatCard label="Total merchants"   value={(g.totalUsers||0).toLocaleString()}             color={V.accent} icon={Users}/>
        <StatCard label="Paying merchants"  value={(g.paidUsers||0).toLocaleString()}              color={V.green}  icon={Users}/>
        <StatCard label="ARPU"              value={fmtCurrency(g.ARPU||0)}                         color={V.amber}  icon={DollarSign}/>
        <StatCard label="Free → Paid rate"  value={`${g.convRate||0}%`}                            color={V.cyan}   icon={Percent}/>
      </StatGrid>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }} className="adm-2col">
        {/* Revenue trend */}
        <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}
          style={{ background:t.card, borderRadius:18, padding:24, border:`1px solid ${t.border}` }}>
          <p style={{ fontSize:14, fontWeight:700, color:t.text, margin:"0 0 4px" }}>Platform fee revenue</p>
          <p style={{ fontSize:12, color:t.muted, margin:"0 0 20px" }}>Monthly DropOS earnings from transaction fees</p>
          <div style={{ height:200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top:0,right:0,left:-20,bottom:0 }}>
                <defs>
                  <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={V.green} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={V.green} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill:"rgba(255,255,255,0.3)",fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={v=>`₦${(v/1000).toFixed(0)}k`} tick={{ fill:"rgba(255,255,255,0.3)",fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"#0d0a1a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,fontSize:12 }} formatter={(v:any)=>[`₦${Number(v).toLocaleString()}`,""]}/>
                <Area type="monotone" dataKey="fees" stroke={V.green} fill="url(#gr)" strokeWidth={2} name="DropOS Fees"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weekly new users */}
        <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.25 }}
          style={{ background:t.card, borderRadius:18, padding:24, border:`1px solid ${t.border}` }}>
          <p style={{ fontSize:14, fontWeight:700, color:t.text, margin:"0 0 4px" }}>New merchants (weekly)</p>
          <p style={{ fontSize:12, color:t.muted, margin:"0 0 20px" }}>Signups over the last 8 weeks</p>
          <div style={{ height:200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={g.weeklyGrowth||[]} margin={{ top:0,right:0,left:-20,bottom:0 }}>
                <XAxis dataKey="week" tick={{ fill:"rgba(255,255,255,0.3)",fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:"rgba(255,255,255,0.3)",fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"#0d0a1a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,fontSize:12 }}/>
                <Bar dataKey="newUsers" fill={V.accent} radius={[4,4,0,0]} name="New merchants"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media(max-width:900px){ .adm-3col{grid-template-columns:1fr 1fr!important;} .adm-2col{grid-template-columns:1fr!important;} }
        @media(max-width:480px){ .adm-3col{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
}
