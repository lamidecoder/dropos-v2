"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, ShoppingCart, Users, ArrowUpRight, ArrowDownRight, Zap, Download, Activity, DollarSign } from "lucide-react";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA", cyan:"#06B6D4", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };
const T = {
  dark:  { card:"#181230", border:"rgba(255,255,255,0.06)", text:"#fff", muted:"rgba(255,255,255,0.38)", faint:"rgba(255,255,255,0.04)", grid:"rgba(255,255,255,0.04)" },
  light: { card:"#fff",    border:"rgba(15,5,32,0.07)",    text:"#0D0918", muted:"rgba(13,9,24,0.45)", faint:"rgba(15,5,32,0.03)", grid:"rgba(15,5,32,0.06)" },
};
const PERIODS = ["7 days","30 days","90 days","1 year"];

function generateDemo(days: number) {
  const data = [], now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const label = days <= 7 ? d.toLocaleDateString("en",{weekday:"short"})
      : days <= 31 ? d.toLocaleDateString("en",{month:"short",day:"numeric"})
      : d.toLocaleDateString("en",{month:"short"});
    const base = 18000 + Math.random() * 45000;
    data.push({ label, revenue:Math.round(base), orders:Math.floor(2+Math.random()*14), visitors:Math.floor(40+Math.random()*180), returning:Math.floor(5+Math.random()*40) });
  }
  return data;
}

const COHORT_DATA = [
  { month:"Jan", day30:45, day60:28, day90:18 },
  { month:"Feb", day30:52, day60:34, day90:22 },
  { month:"Mar", day30:48, day60:31, day90:20 },
  { month:"Apr", day30:61, day60:40, day90:26 },
];

const KIRO_INSIGHTS = [
  { icon:"📈", text:"Revenue up 34% vs last period — your LED mask restock drove most of the growth" },
  { icon:"⏰", text:"Peak buying hours are 7–9pm on Thursdays and Fridays — schedule posts then" },
  { icon:"🛒", text:"Cart abandonment rate is 68% — consider enabling Pay on Delivery to recover these" },
  { icon:"⚠️", text:"3 products haven't sold in 14 days — want me to run a flash sale or rewrite their descriptions?" },
];

function fmt(n: number) {
  return new Intl.NumberFormat("en", {style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);
}

function StatCard({ label, value, delta, icon: Icon, color, t }: any) {
  const positive = delta >= 0;
  return (
    <div className="p-5 rounded-2xl" style={{ background:t.card, border:`1px solid ${t.border}` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:`${color}15` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold" style={{ color:positive?V.green:V.red }}>
          {positive ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
          {Math.abs(delta)}%
        </div>
      </div>
      <p className="text-2xl font-black mb-0.5" style={{ color:t.text }}>{value}</p>
      <p className="text-xs" style={{ color:t.muted }}>{label}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = isDark ? T.dark : T.light;
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const [period, setPeriod] = useState("30 days");
  const [tab, setTab] = useState<"revenue"|"customers"|"products"|"cohort">("revenue");

  const days = period === "7 days" ? 7 : period === "30 days" ? 30 : period === "90 days" ? 90 : 365;

  const { data: analytics } = useQuery({
    queryKey: ["analytics", storeId, period],
    queryFn:  () => api.get(`/analytics/${storeId}?period=${days}`).then(r => r.data.data),
    enabled:  !!storeId,
    staleTime: 300000,
  });

  const chartData = analytics?.chart || generateDemo(Math.min(days, 30));
  const stats = analytics?.summary || { revenue:0, orders:0, customers:0, avgOrder:0, ltv:0, convRate:0 };
  const isDemo = !analytics;

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Analytics</h1>
          {isDemo && <span className="text-xs px-2 py-0.5 rounded-full" style={{background:t.faint,color:t.muted}}>Demo data</span>}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl gap-1 overflow-x-auto" style={{background:t.faint,border:`1px solid ${t.border}`}}>
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                style={{background:period===p?V.v500:"transparent",color:period===p?"#fff":t.muted,border:"none",cursor:"pointer"}}>
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs" style={{border:`1px solid ${t.border}`,color:t.muted,background:t.card}}>
            <Download size={12}/> Export
          </button>
        </div>
      </motion.div>

      {/* KIRO Insights */}
      <div className="p-4 rounded-2xl mb-5" style={{background:"rgba(107,53,232,0.06)",border:"1px solid rgba(107,53,232,0.15)"}}>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={13} color={V.v400}/>
          <p className="text-xs font-bold" style={{color:V.v300}}>KIRO Insights</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {KIRO_INSIGHTS.map((insight,i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-sm flex-shrink-0">{insight.icon}</span>
              <p className="text-xs leading-relaxed" style={{color:"rgba(255,255,255,0.55)"}}>{insight.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {[
          {label:"Revenue",       value:fmt(stats.revenue||chartData.reduce((a:any,d:any)=>a+d.revenue,0)), delta:12, icon:DollarSign,  color:V.v400},
          {label:"Orders",        value:(stats.orders||chartData.reduce((a:any,d:any)=>a+d.orders,0)).toLocaleString(), delta:8, icon:ShoppingCart, color:V.cyan},
          {label:"Customers",     value:(stats.customers||Math.floor(chartData.length*3)).toLocaleString(), delta:15, icon:Users, color:V.green},
          {label:"Avg Order",     value:fmt(stats.avgOrder||28000), delta:-3, icon:TrendingUp, color:V.amber},
          {label:"Customer LTV",  value:fmt(stats.ltv||84000), delta:22, icon:Activity, color:V.v300},
          {label:"Conv. Rate",    value:`${stats.convRate||3.2}%`, delta:5, icon:ArrowUpRight, color:"#EC4899"},
        ].map(s => <StatCard key={s.label} {...s} t={t} />)}
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{background:t.faint,border:`1px solid ${t.border}`,width:"fit-content"}}>
        {(["revenue","customers","products","cohort"] as const).map(tb => (
          <button key={tb} onClick={() => setTab(tb)}
            className="px-4 py-2 rounded-lg text-xs font-semibold capitalize"
            style={{background:tab===tb?t.card:"transparent",color:tab===tb?t.text:t.muted,border:"none",cursor:"pointer",boxShadow:tab===tb?"0 1px 3px rgba(0,0,0,0.1)":"none"}}>
            {tb}
          </button>
        ))}
      </div>

      {/* Charts */}
      {tab === "revenue" && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-5 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
            <h3 className="text-sm font-bold mb-4" style={{color:t.text}}>Revenue over time</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={V.v500} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={V.v500} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={t.grid} strokeDasharray="3 3"/>
                <XAxis dataKey="label" tick={{fill:t.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:t.muted,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`₦${(v/1000).toFixed(0)}k`}/>
                <Tooltip contentStyle={{background:isDark?"#181230":"#fff",border:`1px solid ${t.border}`,borderRadius:12}} labelStyle={{color:t.text}} formatter={(v:any)=>[fmt(v),"Revenue"]}/>
                <Area type="monotone" dataKey="revenue" stroke={V.v500} strokeWidth={2} fill="url(#rev)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="p-5 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
            <h3 className="text-sm font-bold mb-4" style={{color:t.text}}>Orders per day</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData.slice(-14)}>
                <CartesianGrid stroke={t.grid} strokeDasharray="3 3"/>
                <XAxis dataKey="label" tick={{fill:t.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:t.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:isDark?"#181230":"#fff",border:`1px solid ${t.border}`,borderRadius:12}} labelStyle={{color:t.text}}/>
                <Bar dataKey="orders" fill={V.cyan} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === "customers" && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
            <h3 className="text-sm font-bold mb-1" style={{color:t.text}}>New vs Returning</h3>
            <p className="text-xs mb-4" style={{color:t.muted}}>Customer acquisition and retention over time</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid stroke={t.grid} strokeDasharray="3 3"/>
                <XAxis dataKey="label" tick={{fill:t.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:t.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:isDark?"#181230":"#fff",border:`1px solid ${t.border}`,borderRadius:12}} labelStyle={{color:t.text}}/>
                <Line type="monotone" dataKey="visitors" stroke={V.v400} strokeWidth={2} dot={false} name="New customers"/>
                <Line type="monotone" dataKey="returning" stroke={V.green} strokeWidth={2} dot={false} name="Returning"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="p-5 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
            <h3 className="text-sm font-bold mb-4" style={{color:t.text}}>Customer LTV Segments</h3>
            <div className="space-y-3">
              {[
                {label:"Champions (5+ orders)",    count:Math.floor(stats.customers*0.12)||24,  ltv:fmt(180000), color:V.v400},
                {label:"Loyal (3–4 orders)",       count:Math.floor(stats.customers*0.18)||36,  ltv:fmt(95000),  color:V.green},
                {label:"Promising (2 orders)",     count:Math.floor(stats.customers*0.25)||50,  ltv:fmt(48000),  color:V.cyan},
                {label:"New (1 order)",            count:Math.floor(stats.customers*0.45)||90,  ltv:fmt(24000),  color:V.amber},
              ].map(seg => (
                <div key={seg.label} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:seg.color}}/>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs" style={{color:t.text}}>{seg.label}</span>
                      <span className="text-xs font-bold" style={{color:t.text}}>{seg.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{background:t.faint}}>
                      <div style={{width:`${Math.min(100,(seg.count/(stats.customers||200))*100)}%`,height:"100%",borderRadius:99,background:seg.color}}/>
                    </div>
                  </div>
                  <span className="text-xs font-semibold w-20 text-right flex-shrink-0" style={{color:t.muted}}>LTV {seg.ltv}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "products" && (
        <div className="p-5 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
          <h3 className="text-sm font-bold mb-4" style={{color:t.text}}>Product Performance</h3>
          <div className="overflow-x-auto">
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr>{["Product","Revenue","Orders","Conv. Rate","Trend"].map(h => <th key={h} style={{textAlign:"left",padding:"8px 12px",color:t.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:`1px solid ${t.border}`}}>{h}</th>)}</tr></thead>
              <tbody>
                {[
                  {name:"Brazilian Hair Bundle",revenue:fmt(384000),orders:16,conv:"4.2%",trend:"+28%"},
                  {name:"LED Face Mask",         revenue:fmt(290000),orders:14,conv:"3.8%",trend:"+15%"},
                  {name:"Collagen Gummies",      revenue:fmt(224000),orders:12,conv:"3.1%",trend:"-4%"},
                  {name:"Men's Perfume Set",     revenue:fmt(176000),orders:8, conv:"2.8%",trend:"+6%"},
                  {name:"Waist Trainer Pro",     revenue:fmt(144000),orders:9, conv:"2.4%",trend:"+3%"},
                ].map((p,i) => (
                  <tr key={p.name} style={{borderBottom:`1px solid ${t.border}`}}>
                    <td style={{padding:"12px",color:t.text,fontWeight:600}}>{p.name}</td>
                    <td style={{padding:"12px",color:t.text,fontWeight:700}}>{p.revenue}</td>
                    <td style={{padding:"12px",color:t.muted}}>{p.orders}</td>
                    <td style={{padding:"12px",color:t.muted}}>{p.conv}</td>
                    <td style={{padding:"12px"}}><span style={{color:p.trend.startsWith("+")?V.green:V.red,fontWeight:600,fontSize:12}}>{p.trend}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "cohort" && (
        <div className="p-5 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
          <h3 className="text-sm font-bold mb-1" style={{color:t.text}}>Cohort Retention Analysis</h3>
          <p className="text-xs mb-5" style={{color:t.muted}}>% of customers who purchased again after first order</p>
          <div className="overflow-x-auto">
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>
                {["Cohort","Customers","Day 30","Day 60","Day 90"].map(h => <th key={h} style={{textAlign:"left",padding:"8px 16px",color:t.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:`1px solid ${t.border}`}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {COHORT_DATA.map(row => (
                  <tr key={row.month} style={{borderBottom:`1px solid ${t.border}`}}>
                    <td style={{padding:"14px 16px",color:t.text,fontWeight:600}}>{row.month} 2025</td>
                    <td style={{padding:"14px 16px",color:t.muted}}>{Math.floor(80+Math.random()*120)}</td>
                    {[row.day30,row.day60,row.day90].map((v,i) => (
                      <td key={i} style={{padding:"14px 16px"}}>
                        <div className="flex items-center gap-2">
                          <div style={{width:48,height:6,borderRadius:99,background:t.faint,overflow:"hidden"}}>
                            <div style={{width:`${v}%`,height:"100%",background:v>40?V.green:v>25?V.amber:V.red,borderRadius:99}}/>
                          </div>
                          <span style={{fontSize:12,fontWeight:700,color:v>40?V.green:v>25?V.amber:V.red}}>{v}%</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 rounded-xl flex items-start gap-2.5" style={{background:"rgba(107,53,232,0.06)",border:"1px solid rgba(107,53,232,0.15)"}}>
            <Zap size={13} color={V.v400} style={{flexShrink:0,marginTop:1}}/>
            <p className="text-xs leading-relaxed" style={{color:"rgba(255,255,255,0.5)"}}>Your Day 30 retention is above 45% — excellent. KIRO suggests adding a loyalty programme to push Day 60 retention above 35%.</p>
          </div>
        </div>
      )}
    </div>
  );
}
