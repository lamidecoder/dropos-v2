"use client";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { UserMinus, AlertTriangle, TrendingDown, RefreshCw } from "lucide-react";
import { PageHeader, StatGrid, StatCard } from "../../../components/admin/AdminTable";
import { motion } from "framer-motion";

const V = { accent:"#6B35E8", green:"#10B981", amber:"#F59E0B", red:"#EF4444", cyan:"#06B6D4" };
const t = { card:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.07)", text:"rgba(255,255,255,0.9)", muted:"rgba(255,255,255,0.4)" };

export default function AdminChurnPage() {
  const { data:raw, isLoading } = useQuery<any>({
    queryKey: ["admin-churn"],
    queryFn: () => adminAPI.get("/admin/churn").then((r:any) => r.data.data),
  });

  const c = raw || {};

  const actionItems = [
    { icon:"📧", title:"Send win-back campaign", desc:`${c.atRisk||0} stores have had no orders in 14+ days. Broadcast a flash sale nudge.`, color:V.amber, urgent: (c.atRisk||0) > 0 },
    { icon:"💰", title:"Offer downgrade incentive", desc:`${c.recentCancels||0} merchants switched to Free this month. Send a 30% discount offer to win them back.`, color:V.accent, urgent: (c.recentCancels||0) > 0 },
    { icon:"📞", title:"Manual outreach", desc:`${c.churned||0} accounts suspended in last 30 days. Review and reach out to high-value ones.`, color:V.red, urgent: (c.churned||0) > 3 },
  ];

  return (
    <div>
      <PageHeader title="Churn Analysis" sub="Merchant retention and at-risk account tracking"/>

      <StatGrid cols={4}>
        <StatCard label="Churned (30d)"     value={c.churned||0}       color={V.red}   icon={UserMinus} sub={-(c.churnRate||0)}/>
        <StatCard label="At-risk stores"    value={c.atRisk||0}        color={V.amber} icon={AlertTriangle}/>
        <StatCard label="Recent downgrades" value={c.recentCancels||0} color={V.accent} icon={TrendingDown}/>
        <StatCard label="Churn rate"        value={`${c.churnRate||0}%`} color={V.red}  icon={RefreshCw}/>
      </StatGrid>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }} className="adm-2col">
        {/* Monthly churn chart */}
        <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15 }}
          style={{ background:t.card, borderRadius:18, padding:24, border:`1px solid ${t.border}` }}>
          <p style={{ fontSize:14, fontWeight:700, color:t.text, margin:"0 0 4px" }}>Monthly churn</p>
          <p style={{ fontSize:12, color:t.muted, margin:"0 0 18px" }}>Suspended accounts per month</p>
          <div style={{ height:200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={c.monthlyChurn||[]} margin={{ top:0,right:0,left:-20,bottom:0 }}>
                <XAxis dataKey="month" tick={{ fill:"rgba(255,255,255,0.3)",fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:"rgba(255,255,255,0.3)",fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip contentStyle={{ background:"#0d0a1a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,fontSize:12 }}/>
                <Bar dataKey="churned" fill={V.red} radius={[4,4,0,0]} name="Churned"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Action items */}
        <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}
          style={{ background:t.card, borderRadius:18, padding:24, border:`1px solid ${t.border}` }}>
          <p style={{ fontSize:14, fontWeight:700, color:t.text, margin:"0 0 18px" }}>Recommended actions</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {actionItems.map((a, i) => (
              <div key={i} style={{ padding:"14px 16px", borderRadius:12, background:a.urgent?`${a.color}08`:"rgba(255,255,255,0.02)", border:`1px solid ${a.urgent?`${a.color}20`:"rgba(255,255,255,0.05)"}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}>
                  <span style={{ fontSize:18 }}>{a.icon}</span>
                  <p style={{ fontSize:13, fontWeight:700, color:a.urgent?t.text:"rgba(255,255,255,0.5)", margin:0 }}>{a.title}</p>
                  {a.urgent && <span style={{ fontSize:9, fontWeight:800, padding:"2px 6px", borderRadius:99, background:`${a.color}20`, color:a.color, textTransform:"uppercase", letterSpacing:"0.05em", marginLeft:"auto" }}>Action needed</span>}
                </div>
                <p style={{ fontSize:12, color:t.muted, margin:0, lineHeight:1.5 }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`@media(max-width:768px){ .adm-2col{grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
}
