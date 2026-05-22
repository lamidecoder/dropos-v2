"use client";
// Path: frontend/src/app/dashboard/admin/page.tsx
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Users, Store, ShoppingCart, TrendingUp, Activity, DollarSign, AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const V = { v500:"#6B35E8", v400:"#8B5CF6" };
const fmt = (n:number) => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);
const num = (n:number) => new Intl.NumberFormat("en-NG").format(n||0);

export default function AdminPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuthStore();
  const router = useRouter();

  const t = {
    card:   isDark?"#16122A":"#fff",
    border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text:   isDark?"#F0ECFF":"#130D2E",
    muted:  isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint:  isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
    green:  "#10B981", amber:"#F59E0B", red:"#EF4444",
  };

  // Guard — only admin
  useEffect(() => {
    if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
    }
  }, [user]);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ["admin-stats"],
    queryFn:  () => api.get("/admin/stats").then(r => r.data.data),
    refetchInterval: 30000,
  });

  const { data: recentUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn:  () => api.get("/admin/users?limit=10").then(r => r.data.data),
    staleTime: 30000,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn:  () => api.get("/admin/orders?limit=10").then(r => r.data.data),
    staleTime: 30000,
  });

  if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") return null;

  const statCards = [
    { label:"Total Users",    value:num(stats?.totalUsers||0),        delta:stats?.newUsersToday, color:V.v400,       icon:Users        },
    { label:"Active Stores",  value:num(stats?.totalStores||0),       delta:stats?.newStoresToday,color:"#06B6D4",    icon:Store        },
    { label:"Total Orders",   value:num(stats?.totalOrders||0),       delta:stats?.ordersToday,   color:t.green,      icon:ShoppingCart },
    { label:"Total Revenue",  value:fmt(stats?.totalRevenue||0),      delta:null,                 color:t.amber,      icon:DollarSign   },
    { label:"Active Today",   value:num(stats?.activeToday||0),       delta:null,                 color:"#EC4899",    icon:Activity     },
    { label:"MRR",            value:fmt(stats?.mrr||0),               delta:stats?.mrrGrowth,     color:"#F59E0B",    icon:TrendingUp   },
  ];

  return (
    <div style={{ maxWidth:1200, margin:"0 auto" }}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:t.green, animation:"pulse 2s infinite" }}/>
            <span style={{ fontSize:11, color:t.green, fontWeight:700, letterSpacing:"0.06em" }}>ADMIN PANEL</span>
          </div>
          <h1 style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.04em", color:t.text, margin:0 }}>Platform Overview</h1>
        </div>
        <button onClick={()=>refetch()} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:10, border:`1px solid ${t.border}`, background:"transparent", color:t.muted, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
          <RefreshCw size={13}/> Refresh
        </button>
      </motion.div>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12, marginBottom:24 }}>
        {statCards.map((s,i) => (
          <motion.div key={s.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
            style={{ padding:"18px 20px", borderRadius:16, background:t.card, border:`1px solid ${t.border}` }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:`${s.color}15`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <s.icon size={15} color={s.color}/>
              </div>
              {s.delta!=null && <span style={{ fontSize:11, fontWeight:700, color:t.green, background:"rgba(16,185,129,0.1)", padding:"2px 8px", borderRadius:99 }}>+{s.delta} today</span>}
            </div>
            <p style={{ fontSize:22, fontWeight:900, color:t.text, letterSpacing:"-0.04em", margin:"0 0 2px" }}>{isLoading?"—":s.value}</p>
            <p style={{ fontSize:12, color:t.muted, margin:0 }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Recent users */}
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
          style={{ borderRadius:18, background:t.card, border:`1px solid ${t.border}`, padding:"20px 22px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <span style={{ fontSize:14, fontWeight:800, color:t.text }}>Recent Users</span>
            <Link href="/dashboard/admin/users" style={{ fontSize:12, color:V.v400, fontWeight:700, textDecoration:"none" }}>View all</Link>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {(recentUsers?.users||recentUsers||[]).slice(0,8).map((u:any) => (
              <div key={u.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:`1px solid ${t.border}` }}>
                <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(135deg,${V.v500},${V.v400})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff", flexShrink:0 }}>
                  {(u.name||u.email||"U").slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:t.text, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name||u.email}</p>
                  <p style={{ fontSize:10, color:t.muted, margin:0 }}>{u.subscription?.plan||"Free"} · {new Date(u.createdAt).toLocaleDateString("en-NG",{month:"short",day:"numeric"})}</p>
                </div>
                <div style={{ width:7, height:7, borderRadius:"50%", background:u.stores?.length>0?t.green:"rgba(0,0,0,0.1)", flexShrink:0 }}/>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent orders */}
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.35}}
          style={{ borderRadius:18, background:t.card, border:`1px solid ${t.border}`, padding:"20px 22px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <span style={{ fontSize:14, fontWeight:800, color:t.text }}>Recent Orders</span>
            <Link href="/dashboard/admin/payments" style={{ fontSize:12, color:V.v400, fontWeight:700, textDecoration:"none" }}>View all</Link>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {(recentOrders?.orders||recentOrders||[]).slice(0,8).map((o:any) => {
              const statusColor = o.status==="FULFILLED"?t.green:o.status==="PENDING"?t.amber:o.status==="CANCELLED"?t.red:t.muted;
              return (
                <div key={o.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:`1px solid ${t.border}` }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:12, fontWeight:600, color:t.text, margin:0 }}>#{o.orderNumber} · {o.customerName}</p>
                    <p style={{ fontSize:10, color:t.muted, margin:0 }}>{o.store?.name||"Store"}</p>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:t.text, margin:0 }}>{fmt(o.total)}</p>
                    <p style={{ fontSize:10, fontWeight:600, color:statusColor, margin:0 }}>{o.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Quick links */}
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
        style={{ marginTop:16, display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:10 }}>
        {[
          { label:"All Users",    href:"/dashboard/admin/users",    icon:"👥" },
          { label:"All Stores",   href:"/dashboard/admin",          icon:"🏪" },
          { label:"Payments",     href:"/dashboard/admin/payments", icon:"💳" },
          { label:"Audit Logs",   href:"/dashboard/admin/audit-logs",icon:"📋" },
          { label:"Support",      href:"/dashboard/admin/support",  icon:"🎧" },
          { label:"Waitlist",     href:"/dashboard/admin/waitlist", icon:"⏳" },
        ].map(l=>(
          <Link key={l.label} href={l.href}
            style={{ padding:"14px 16px", borderRadius:12, background:t.card, border:`1px solid ${t.border}`, textDecoration:"none", display:"flex", alignItems:"center", gap:10, transition:"background 0.15s" }}
            onMouseEnter={e=>(e.currentTarget.style.background=`${V.v400}08`)}
            onMouseLeave={e=>(e.currentTarget.style.background=t.card)}>
            <span style={{ fontSize:18 }}>{l.icon}</span>
            <span style={{ fontSize:13, fontWeight:600, color:t.text }}>{l.label}</span>
          </Link>
        ))}
      </motion.div>

      <style>{"@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} @media(max-width:768px){[style*='grid-template-columns: 1fr 1fr']{grid-template-columns:1fr!important}}"}</style>
    </div>
  );
}
