"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react";
import { PageHeader, StatGrid, StatCard } from "../../../components/admin/AdminTable";

const V = { accent:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B", red:"#EF4444", cyan:"#06B6D4" };
const t = { card:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.07)", text:"rgba(255,255,255,0.9)", muted:"rgba(255,255,255,0.4)" };
const fmt = (n: number) => `₦${(n/1000).toFixed(0)}k`;

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState("30d");

  const { data: stats } = useQuery<any>({
    queryKey: ["admin-overview"], queryFn: () => adminAPI.getStats().then((r:any) => r.data.data),
  });
  const { data: analytics } = useQuery<any>({
    queryKey: ["admin-analytics", period],
    queryFn: () => adminAPI.get("/admin/analytics", { params:{ period } }).then((r:any) => r.data.data),
  });

  const s = stats;
  const revenueData = s?.monthlyRevenue || [];

  return (
    <div>
      <PageHeader title="Analytics" sub="Platform-wide performance metrics"
        action={
          <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,0.04)", borderRadius:10, padding:3 }}>
            {["7d","30d","90d"].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                style={{ padding:"5px 12px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit", background:period===p?"rgba(107,53,232,0.2)":"transparent", color:period===p?"#A78BFA":"rgba(255,255,255,0.4)", transition:"all 0.15s" }}>
                {p}
              </button>
            ))}
          </div>
        }/>

      <StatGrid cols={4}>
        <StatCard label="Total revenue"     value={`₦${((s?.revenue?.total||0)/1000000).toFixed(1)}M`} color={V.green}  icon={DollarSign}  sub={s?.revenue?.growth}/>
        <StatCard label="Platform fees"     value={`₦${((s?.fees?.total||0)/1000).toFixed(0)}k`}       color={V.accent} icon={TrendingUp}/>
        <StatCard label="Active merchants"  value={(s?.users?.active||0).toLocaleString()}               color={V.cyan}   icon={Users}       sub={s?.users?.growth}/>
        <StatCard label="Total orders"      value={(s?.orders?.total||0).toLocaleString()}               color={V.amber}  icon={ShoppingCart} sub={s?.orders?.growth}/>
      </StatGrid>

      {/* Revenue chart */}
      <div style={{ background:t.card, borderRadius:18, padding:24, border:`1px solid ${t.border}`, marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <p style={{ fontSize:14, fontWeight:700, color:t.text, margin:0 }}>Monthly revenue & fees</p>
        </div>
        <div style={{ height:220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top:0, right:0, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={V.accent} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={V.accent} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="fee" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={V.green} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={V.green} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill:"rgba(255,255,255,0.3)", fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={fmt} tick={{ fill:"rgba(255,255,255,0.3)", fontSize:11 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:"#0d0a1a", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, fontSize:12 }} formatter={(v:any)=>[`₦${Number(v).toLocaleString()}`,""]}/>
              <Area type="monotone" dataKey="revenue" stroke={V.accent} fill="url(#rev)" strokeWidth={2} name="Revenue"/>
              <Area type="monotone" dataKey="fees"    stroke={V.green}  fill="url(#fee)" strokeWidth={2} name="DropOS Fees"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gateway distribution + Plan breakdown */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }} className="adm-2col">
        {/* Gateway */}
        <div style={{ background:t.card, borderRadius:18, padding:24, border:`1px solid ${t.border}` }}>
          <p style={{ fontSize:14, fontWeight:700, color:t.text, margin:"0 0 18px" }}>Payment gateways</p>
          {(s?.gatewayStats||[{gateway:"PAYSTACK",_count:{id:0}},{gateway:"STRIPE",_count:{id:0}}]).map((g:any) => {
            const total = (s?.gatewayStats||[]).reduce((a:number,x:any)=>a+(x._count?.id||0),0)||1;
            const pct = Math.round((g._count?.id||0)/total*100);
            return (
              <div key={g.gateway} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:12, color:t.muted }}>{g.gateway}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:t.text }}>{pct}%</span>
                </div>
                <div style={{ height:6, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                  <div style={{ width:`${pct}%`, height:"100%", borderRadius:99, background:g.gateway==="PAYSTACK"?V.amber:V.accent }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plan breakdown */}
        <div style={{ background:t.card, borderRadius:18, padding:24, border:`1px solid ${t.border}` }}>
          <p style={{ fontSize:14, fontWeight:700, color:t.text, margin:"0 0 18px" }}>Plan distribution</p>
          {[
            { plan:"FREE",       color:"rgba(255,255,255,0.4)", count:s?.users?.byPlan?.FREE||0 },
            { plan:"GROWTH",     color:V.accent,                count:s?.users?.byPlan?.GROWTH||0 },
            { plan:"PRO",        color:V.amber,                 count:s?.users?.byPlan?.PRO||0 },
            { plan:"ENTERPRISE", color:V.green,                 count:s?.users?.byPlan?.ENTERPRISE||0 },
          ].map(p => {
            const total = Math.max(s?.users?.total||1, 1);
            const pct   = Math.round((p.count/total)*100);
            return (
              <div key={p.plan} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:12, color:t.muted }}>{p.plan}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:t.text }}>{p.count.toLocaleString()}</span>
                </div>
                <div style={{ height:6, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                  <div style={{ width:`${pct||2}%`, height:"100%", borderRadius:99, background:p.color }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`@media(max-width:640px){ .adm-2col{grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
}
