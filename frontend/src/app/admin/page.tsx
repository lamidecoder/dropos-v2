"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { adminAPI } from "../../lib/api";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, DollarSign, ShoppingCart, TrendingUp, Store, Zap, ArrowUpRight, Activity, Clock, ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";

const V = { v500:"#6B35E8", v700:"#3D1C8A", v400:"#8B5CF6", v300:"#A78BFA", green:"#10B981", amber:"#F59E0B", red:"#EF4444", cyan:"#06B6D4" };

function fmt(n: number) { return new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0); }
function num(n: number) { return n>=1000000?`${(n/1000000).toFixed(1)}M`:n>=1000?`${(n/1000).toFixed(1)}k`:String(n||0); }

function StatCard({ label, value, sub, color, icon:Icon, delay=0 }: any) {
  return (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay}}
      style={{ padding:20, borderRadius:16, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={16} color={color}/>
        </div>
        {sub !== undefined && (
          <span style={{ fontSize:11, fontWeight:700, color:sub>=0?V.green:V.red, background:sub>=0?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)", padding:"2px 8px", borderRadius:99 }}>
            {sub>=0?"+":""}{sub}%
          </span>
        )}
      </div>
      <p style={{ fontSize:24, fontWeight:900, color:"#fff", letterSpacing:"-0.05em", margin:"0 0 4px", lineHeight:1 }}>{value}</p>
      <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>{label}</p>
    </motion.div>
  );
}

const DEMO_REVENUE = [
  {month:"Jan",revenue:1840000,fees:184000},{month:"Feb",revenue:2360000,fees:236000},
  {month:"Mar",revenue:2890000,fees:289000},{month:"Apr",revenue:3520000,fees:352000},
  {month:"May",revenue:4380000,fees:438000},{month:"Jun",revenue:5210000,fees:521000},
  {month:"Jul",revenue:6140000,fees:614000},{month:"Aug",revenue:7200000,fees:720000},
];

const DEMO_GW = [
  {name:"Paystack",value:68,color:V.amber},
  {name:"Stripe",  value:24,color:V.v400},
  {name:"Other",   value:8, color:V.cyan},
];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminAPI.getStats().then(r => r.data.data),
    refetchInterval: 60000,
    retry: 2,
  });

  const { data: usersData } = useQuery({
    queryKey: ["admin-recent-users"],
    queryFn: () => adminAPI.getUsers({ limit:5, sort:"newest" }).then(r => r.data),
    retry: 2,
  });

  const statCards = [
    { label:"Total Users",       value: num(stats?.users?.total||0),       sub:stats?.users?.growth,       color:V.v400,  icon:Users         },
    { label:"Platform Revenue",  value: fmt(stats?.revenue?.total||0),     sub:stats?.revenue?.growth,     color:V.green, icon:DollarSign    },
    { label:"Active Stores",     value: num(stats?.stores?.active||0),     sub:stats?.stores?.growth,      color:V.cyan,  icon:Store         },
    { label:"Total Orders",      value: num(stats?.orders?.total||0),      sub:stats?.orders?.growth,      color:V.amber, icon:ShoppingCart  },
    { label:"DropOS Fees",       value: fmt(stats?.fees?.total||0),        sub:undefined,                  color:V.v300,  icon:TrendingUp    },
    { label:"Avg MRR per Store", value: fmt(stats?.avgMRR||0),             sub:undefined,                  color:V.green, icon:Activity      },
  ];

  const recentUsers = usersData?.data || [];
  const gwData = stats?.gatewayStats?.length ? stats.gatewayStats.map((g:any)=>({name:g.gateway,value:g._count?.id||0,color:g.gateway==="PAYSTACK"?V.amber:V.v400})) : DEMO_GW;
  const revenueData = stats?.monthlyRevenue?.length ? stats.monthlyRevenue : DEMO_REVENUE;

  return (
    <div>
      {/* Header */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:"clamp(20px,4vw,26px)", fontWeight:900, letterSpacing:"-0.04em", color:"#fff", margin:"0 0 4px" }}>Platform Overview</h1>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)", margin:0 }}>
          All merchants · {new Date().toLocaleDateString("en-NG",{month:"long",year:"numeric"})}
        </p>
      </motion.div>

      {/* Stat grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12, marginBottom:24 }}>
        {statCards.map((s,i) => <StatCard key={s.label} {...s} delay={i*0.06}/>)}
      </div>

      {/* Charts row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:16, marginBottom:20 }} className="admin-charts">
        {/* Revenue chart */}
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
          style={{ padding:20, borderRadius:16, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:8 }}>
            <p style={{ fontSize:14, fontWeight:700, color:"#fff", margin:0 }}>Platform Revenue</p>
            <Link href="/admin/analytics" style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:V.v300, textDecoration:"none", fontWeight:600 }}>
              Full report <ArrowUpRight size={12}/>
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData} margin={{top:0,right:0,bottom:0,left:0}}>
              <defs>
                <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={V.v400} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={V.v400} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{fill:"rgba(255,255,255,0.3)",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"rgba(255,255,255,0.3)",fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`₦${(v/1000000).toFixed(1)}M`}/>
              <Tooltip contentStyle={{background:"#181230",border:"1px solid rgba(107,53,232,0.3)",borderRadius:10,fontSize:12}} formatter={(v:any)=>[fmt(v),"Revenue"]}/>
              <Area type="monotone" dataKey="revenue" stroke={V.v400} strokeWidth={2} fill="url(#gr)"/>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Gateway pie */}
        <motion.div initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:0.45}}
          style={{ padding:20, borderRadius:16, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize:14, fontWeight:700, color:"#fff", margin:"0 0 16px" }}>Payment Gateways</p>
          <div style={{ display:"flex", justifyContent:"center" }}>
            <PieChart width={140} height={140}>
              <Pie data={gwData} cx={65} cy={65} innerRadius={38} outerRadius={60} dataKey="value" strokeWidth={0}>
                {gwData.map((g:any,i:number) => <Cell key={i} fill={g.color}/>)}
              </Pie>
            </PieChart>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
            {gwData.map((g:any) => (
              <div key={g.name} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:g.color, flexShrink:0 }}/>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)", flex:1 }}>{g.name}</span>
                <span style={{ fontSize:12, fontWeight:700, color:"#fff" }}>{g.value}{typeof g.value==="number"&&g.value<100?"%":""}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent users */}
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.5}}
        style={{ padding:20, borderRadius:16, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <p style={{ fontSize:14, fontWeight:700, color:"#fff", margin:0 }}>Recent Signups</p>
          <Link href="/admin/users" style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:V.v300, textDecoration:"none", fontWeight:600 }}>
            All users <ChevronRight size={12}/>
          </Link>
        </div>
        {recentUsers.length === 0 ? (
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)", textAlign:"center", padding:"24px 0", margin:0 }}>No users yet</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {recentUsers.slice(0,5).map((u:any,i:number) => (
              <motion.div key={u.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:0.52+i*0.04}}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:12, background:"rgba(255,255,255,0.02)" }}>
                <div style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg,${V.v500},${V.v700})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#fff", flexShrink:0 }}>
                  {u.name?.charAt(0)||"U"}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.8)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name}</p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</p>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:u.status==="ACTIVE"?V.green:V.amber, background:u.status==="ACTIVE"?"rgba(16,185,129,0.1)":"rgba(245,158,11,0.1)", padding:"2px 8px", borderRadius:99 }}>{u.status}</span>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.25)", margin:"3px 0 0" }}>{new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                <Link href={`/admin/users/${u.id}`} style={{ textDecoration:"none" }}>
                  <ChevronRight size={14} color="rgba(255,255,255,0.2)"/>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <style>{`
        @media(max-width:700px){
          .admin-charts{grid-template-columns:1fr!important}
        }
      `}</style>
    </div>
  );
}
