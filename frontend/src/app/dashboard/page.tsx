"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp, ShoppingCart, Users, Package, Zap,
  ChevronRight, Store, Flame, Activity, ArrowUpRight,
  AlertCircle, Clock, CheckCircle2, RefreshCw, Plus,
} from "lucide-react";
import { useTheme } from "../../components/layout/DashboardLayout";
import { useAuthStore } from "../../store/auth.store";
import { api } from "../../lib/api";
import { OnboardingTips } from "../../components/dashboard/OnboardingTips";

const V = { v500:"#6B35E8", v400:"#8B5CF6", cyan:"#06B6D4", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };
const fmt = (n: number) => new Intl.NumberFormat("en-NG",{ style:"currency", currency:"NGN", maximumFractionDigits:0 }).format(n||0);

function Skeleton({ w="100%", h=16, r=8 }: { w?: string|number; h?: number; r?: number }) {
  const { theme } = useTheme();
  return (
    <div style={{ width:w, height:h, borderRadius:r,
      background: theme==="dark" ? "rgba(255,255,255,0.06)" : "rgba(19,13,46,0.06)",
      animation:"pulse 1.5s ease-in-out infinite" }}/>
  );
}

function StatCard({ label, value, delta, color, icon:Icon, loading, delay=0 }: any) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card:   isDark ? "#181230" : "#fff",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,5,32,0.07)",
    text:   isDark ? "#fff" : "#0D0918",
    muted:  isDark ? "rgba(255,255,255,0.38)" : "rgba(13,9,24,0.45)",
  };
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay }}
      style={{ padding:18, borderRadius:16, background:t.card, border:`1px solid ${t.border}` }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ width:36, height:36, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", background:`${color}18` }}>
          <Icon size={16} color={color}/>
        </div>
        {delta !== undefined && !loading && (
          <span style={{ fontSize:11, fontWeight:700, color:delta>=0?V.green:V.red, background:delta>=0?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)", padding:"3px 8px", borderRadius:99 }}>
            {delta>=0?"+":""}{delta}%
          </span>
        )}
      </div>
      {loading
        ? <><Skeleton h={28} r={6}/><div style={{ marginTop:6 }}><Skeleton w="60%" h={12} r={4}/></div></>
        : <><p style={{ fontSize:22, fontWeight:900, color:t.text, letterSpacing:"-0.04em", lineHeight:1, margin:0 }}>{value}</p>
           <p style={{ fontSize:12, color:t.muted, marginTop:4, marginBottom:0 }}>{label}</p></>
      }
    </motion.div>
  );
}

function OrderRow({ order, t }: any) {
  const statusColors: Record<string,string> = {
    PENDING:V.amber, COMPLETED:V.green, SHIPPED:V.cyan, DELIVERED:V.v400, CANCELLED:V.red, PAID:V.green,
  };
  const color = statusColors[order.status] || V.amber;
  return (
    <Link href={`/dashboard/orders/${order.id}`} style={{ textDecoration:"none" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 16px", borderRadius:12, background:"transparent", transition:"background 0.12s", cursor:"pointer" }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(107,53,232,0.04)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
        <div style={{ width:36, height:36, borderRadius:10, background:`${color}12`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <ShoppingCart size={14} color={color}/>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:13, fontWeight:600, color:t.text, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {order.customerName || order.customerEmail || "Guest"}
          </p>
          <p style={{ fontSize:11, color:t.muted, margin:0 }}>#{order.orderNumber || order.id?.slice(-8).toUpperCase()}</p>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:0 }}>{fmt(order.total)}</p>
          <span style={{ fontSize:10, fontWeight:700, color, background:`${color}15`, padding:"2px 7px", borderRadius:99 }}>{order.status}</span>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardOverview() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;

  const t = {
    bg:     isDark ? "#08051A" : "#F4F2FB",
    card:   isDark ? "#181230" : "#fff",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,5,32,0.07)",
    text:   isDark ? "#fff" : "#0D0918",
    muted:  isDark ? "rgba(255,255,255,0.38)" : "rgba(13,9,24,0.45)",
  };

  const { data: analytics, isLoading: aLoading, isError: aError } = useQuery({
    queryKey:  ["dashboard-analytics", storeId],
    queryFn:   () => api.get(`/analytics/${storeId}?period=7`).then(r => r.data.data),
    enabled:   !!storeId,
    retry:     2,
    staleTime: 60_000,
  });

  const { data: recentOrders, isLoading: oLoading } = useQuery({
    queryKey: ["dashboard-orders", storeId],
    queryFn:  () => api.get(`/orders/${storeId}?limit=5`).then(r => r.data.data?.orders || r.data.data || []),
    enabled:  !!storeId,
    retry:    2,
  });

  const { data: productCount } = useQuery({
    queryKey: ["dashboard-products", storeId],
    queryFn:  () => api.get(`/products/${storeId}?limit=1`).then(r => r.data.total || r.data.data?.total || 0),
    enabled:  !!storeId,
    retry:    2,
  });

  const { data: pulse } = useQuery({
    queryKey: ["dashboard-pulse", storeId],
    queryFn:  () => api.get(`/kai/pulse?storeId=${storeId}&limit=3`).then(r => r.data.data || []),
    enabled:  !!storeId,
    retry:    1,
  });

  // No store yet
  if (!storeId) return (
    <div style={{ maxWidth:520, margin:"80px auto", textAlign:"center", padding:"0 24px" }}>
      <div style={{ width:72, height:72, borderRadius:22, background:"linear-gradient(135deg,#2D1B69,#6B35E8)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", boxShadow:"0 12px 40px rgba(107,53,232,0.3)" }}>
        <Store size={32} color="#C4B5FD"/>
      </div>
      <h2 style={{ fontSize:24, fontWeight:900, color:t.text, margin:"0 0 10px", letterSpacing:"-0.04em" }}>
        Welcome to DropOS, {user?.name?.split(" ")[0] || "there"}! 👋
      </h2>
      <p style={{ fontSize:15, color:t.muted, margin:"0 0 28px", lineHeight:1.6 }}>
        Create your first store to start selling. KIRO will guide you.
      </p>
      <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
        <Link href="/dashboard/stores" style={{ display:"flex", alignItems:"center", gap:8, padding:"13px 24px", borderRadius:12, background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", textDecoration:"none", fontSize:14, fontWeight:700, boxShadow:"0 6px 20px rgba(107,53,232,0.25)" }}>
          <Plus size={15}/> Create your store
        </Link>
        <Link href="/dashboard/start-business" style={{ display:"flex", alignItems:"center", gap:8, padding:"13px 24px", borderRadius:12, border:`1px solid ${t.border}`, background:t.card, color:t.text, textDecoration:"none", fontSize:14, fontWeight:600 }}>
          <Zap size={14} color={V.v400}/> Let KIRO do it
        </Link>
      </div>
    </div>
  );

  // Error state
  if (aError) return (
    <div style={{ maxWidth:480, margin:"80px auto", textAlign:"center", padding:"0 24px" }}>
      <div style={{ width:56, height:56, borderRadius:16, background:"rgba(239,68,68,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
        <AlertCircle size={24} color={V.red}/>
      </div>
      <h2 style={{ fontSize:18, fontWeight:700, color:t.text, margin:"0 0 8px" }}>Could not load dashboard</h2>
      <p style={{ fontSize:14, color:t.muted, margin:"0 0 20px" }}>
        The backend may be waking up. Wait 30 seconds and refresh.
      </p>
      <button onClick={() => window.location.reload()}
        style={{ padding:"11px 24px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:8, margin:"0 auto" }}>
        <RefreshCw size={14}/> Refresh
      </button>
    </div>
  );

  const stats = [
    { label:"Revenue (7d)",  value: aLoading ? "—" : fmt(analytics?.revenue || 0),       delta: analytics?.revenueGrowth,  color:V.v500,  icon:TrendingUp,  delay:0 },
    { label:"Orders (7d)",   value: aLoading ? "—" : (analytics?.orders || 0),            delta: analytics?.ordersGrowth,   color:V.cyan,  icon:ShoppingCart,delay:0.05 },
    { label:"Customers",     value: aLoading ? "—" : (analytics?.customers || 0),         delta: analytics?.customersGrowth,color:V.green, icon:Users,        delay:0.1 },
    { label:"Products",      value: aLoading ? "—" : (productCount || 0),                 delta: undefined,                  color:V.amber, icon:Package,      delay:0.15 },
  ];

  const store = user?.stores?.[0];
  const storeUrl = store ? `https://${store.slug}.droposhq.com` : null;

  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      {/* Greeting */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:900, color:t.text, margin:"0 0 4px", letterSpacing:"-0.03em" }}>
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <p style={{ fontSize:13, color:t.muted, margin:0 }}>
            {store?.name} · Last 7 days
          </p>
          {storeUrl && (
            <a href={storeUrl} target="_blank" rel="noreferrer"
              style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:V.v400, textDecoration:"none", fontWeight:600 }}>
              View store <ArrowUpRight size={11}/>
            </a>
          )}
        </div>
      </div>

      {/* Onboarding */}
      <OnboardingTips/>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }} className="stats-grid">
        {stats.map(s => <StatCard key={s.label} {...s} loading={aLoading}/>)}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:16 }} className="main-grid">
        {/* Recent orders */}
        <div style={{ background:t.card, borderRadius:18, border:`1px solid ${t.border}`, overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <p style={{ fontSize:14, fontWeight:700, color:t.text, margin:0 }}>Recent orders</p>
            <Link href="/dashboard/orders" style={{ fontSize:12, color:V.v400, textDecoration:"none", fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
              View all <ChevronRight size={12}/>
            </Link>
          </div>
          <div style={{ padding:"8px 4px" }}>
            {oLoading ? (
              Array.from({length:4}).map((_,i) => (
                <div key={i} style={{ display:"flex", gap:12, padding:"10px 16px", alignItems:"center" }}>
                  <Skeleton w={36} h={36} r={10}/>
                  <div style={{ flex:1, display:"flex", flexDirection:"column", gap:5 }}>
                    <Skeleton w="60%" h={13} r={4}/>
                    <Skeleton w="40%" h={11} r={4}/>
                  </div>
                  <Skeleton w={60} h={13} r={4}/>
                </div>
              ))
            ) : !recentOrders?.length ? (
              <div style={{ padding:"32px 20px", textAlign:"center" }}>
                <ShoppingCart size={28} color={t.muted as string} style={{ margin:"0 auto 10px", display:"block" }}/>
                <p style={{ fontSize:13, color:t.muted, margin:0 }}>No orders yet</p>
                <p style={{ fontSize:11, color:t.muted, margin:"4px 0 0" }}>Share your store to get your first order</p>
              </div>
            ) : (
              recentOrders.map((o: any) => <OrderRow key={o.id} order={o} t={t}/>)
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* KIRO insights */}
          <div style={{ background:"linear-gradient(135deg,#2D1B69,#1a0d4a)", borderRadius:18, padding:20, border:"1px solid rgba(107,53,232,0.2)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <div style={{ width:30, height:30, borderRadius:9, background:"rgba(196,181,253,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Zap size={14} color="#C4B5FD"/>
              </div>
              <p style={{ fontSize:13, fontWeight:800, color:"#C4B5FD", margin:0 }}>KIRO Insights</p>
            </div>
            {!pulse?.length ? (
              <p style={{ fontSize:12, color:"rgba(196,181,253,0.5)", margin:0, lineHeight:1.6 }}>
                KIRO is watching your store. Insights will appear as you get orders and traffic.
              </p>
            ) : (
              pulse.map((item: any, i: number) => (
                <div key={i} style={{ marginBottom:i<pulse.length-1?12:0, paddingBottom:i<pulse.length-1?12:0, borderBottom:i<pulse.length-1?"1px solid rgba(255,255,255,0.06)":"none" }}>
                  <p style={{ fontSize:12, color:"rgba(240,236,255,0.8)", margin:0, lineHeight:1.6 }}>{item.message || item.text}</p>
                </div>
              ))
            )}
            <Link href="/kiro" style={{ display:"flex", alignItems:"center", gap:6, marginTop:14, fontSize:12, color:"#A78BFA", textDecoration:"none", fontWeight:700 }}>
              Ask KIRO anything <ChevronRight size={12}/>
            </Link>
          </div>

          {/* Quick actions */}
          <div style={{ background:t.card, borderRadius:18, padding:18, border:`1px solid ${t.border}` }}>
            <p style={{ fontSize:12, fontWeight:700, color:t.muted, margin:"0 0 12px", textTransform:"uppercase", letterSpacing:"0.08em" }}>Quick actions</p>
            {[
              { label:"Add a product",    href:"/dashboard/products",   icon:Package,      color:V.v400 },
              { label:"Create discount",  href:"/dashboard/discounts",  icon:Flame,        color:V.amber },
              { label:"View analytics",   href:"/dashboard/analytics",  icon:Activity,     color:V.cyan  },
              { label:"Generate ad copy", href:"/dashboard/ads",        icon:Zap,          color:V.green },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:10, textDecoration:"none", marginBottom:4, transition:"background 0.12s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(107,53,232,0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <div style={{ width:28, height:28, borderRadius:8, background:`${a.color}12`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <a.icon size={13} color={a.color}/>
                </div>
                <span style={{ fontSize:13, fontWeight:600, color:t.text }}>{a.label}</span>
                <ChevronRight size={12} color={t.muted as string} style={{ marginLeft:"auto" }}/>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @media(max-width:900px){ .stats-grid{grid-template-columns:1fr 1fr!important;} .main-grid{grid-template-columns:1fr!important;} }
        @media(max-width:480px){ .stats-grid{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
}
