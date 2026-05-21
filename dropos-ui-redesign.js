// dropos-ui-redesign.js
// node dropos-ui-redesign.js
// Writes new dashboard + KIRO page matching CEO's design screenshots, then pushes.

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const files = {

// ─────────────────────────────────────────────────────────────────────────────
"frontend/src/app/dashboard/page.tsx": `"use client";
// Path: frontend/src/app/dashboard/page.tsx
// Dashboard Overview — matches CEO design (Image 1)
// Dark by default, light mode supported, fully responsive

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCurrency } from "../../lib/currency";
import {
  TrendingUp, ShoppingCart, Users, Package, Zap,
  ChevronRight, Flame, Activity, Bell, Plus,
  AlertCircle, Heart, ArrowUpRight,
} from "lucide-react";
import { useTheme } from "../../components/layout/DashboardLayout";
import { useAuthStore } from "../../store/auth.store";
import { api } from "../../lib/api";

const V = {
  v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA",
  cyan:"#06B6D4", green:"#10B981", amber:"#F59E0B", red:"#EF4444",
};

// ── Mini sparkline ─────────────────────────────────────────────
function Sparkline({ color, up }: { color:string; up:boolean }) {
  const pts = up
    ? "0,18 8,14 16,16 24,10 32,12 40,6 48,8 56,4 64,6 72,2"
    : "0,4 8,8 16,6 24,12 32,10 40,14 48,12 56,16 64,14 72,18";
  return (
    <svg width="72" height="20" viewBox="0 0 72 20" fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
    </svg>
  );
}

// ── Stat card ──────────────────────────────────────────────────
function StatCard({ label, value, delta, color, icon:Icon, delay=0, isDark }:any) {
  const t = {
    card:   isDark?"#16122A":"#fff",
    border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.10)",
    text:   isDark?"#F0ECFF":"#130D2E",
    muted:  isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.5)",
  };
  const up = (delta??0) >= 0;
  return (
    <motion.div
      initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay}}
      style={{padding:"18px 20px",borderRadius:16,background:t.card,border:\`1px solid \${t.border}\`,display:"flex",flexDirection:"column",gap:10}}
    >
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{width:36,height:36,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:\`\${color}18\`}}>
          <Icon size={16} color={color}/>
        </div>
        {delta !== undefined && (
          <span style={{fontSize:11,fontWeight:700,color:up?V.green:V.red,background:up?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)",padding:"3px 8px",borderRadius:99,display:"flex",alignItems:"center",gap:3}}>
            <ArrowUpRight size={10} style={{transform:up?"none":"rotate(90deg)"}}/>
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div>
        <p style={{fontSize:24,fontWeight:900,color:t.text,letterSpacing:"-0.045em",lineHeight:1,marginBottom:3}}>{value}</p>
        <p style={{fontSize:12,color:t.muted}}>{label}</p>
      </div>
      <Sparkline color={color} up={up}/>
    </motion.div>
  );
}

// ── Store overview hero ────────────────────────────────────────
function StoreHero({ delta, isDark }:{delta:number;isDark:boolean}) {
  return (
    <motion.div
      initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.05}}
      style={{borderRadius:20,overflow:"hidden",marginBottom:20,position:"relative",
        background:isDark
          ?"linear-gradient(135deg,#1a0840 0%,#2d1060 40%,#3d1580 100%)"
          :"linear-gradient(135deg,#3b0d9e 0%,#5b21b6 50%,#7c3aed 100%)",
        padding:"28px 32px",minHeight:160}}
    >
      <div style={{position:"absolute",right:0,bottom:0,top:0,width:"45%",display:"flex",alignItems:"flex-end",gap:6,padding:"0 24px 0 0",pointerEvents:"none"}}>
        {[38,52,44,62,56,72,80].map((h,i)=>(
          <div key={i} style={{flex:1,height:\`\${h}%\`,borderRadius:"6px 6px 0 0",background:i===6?"rgba(255,255,255,0.85)":\`rgba(255,255,255,\${0.15+i*0.06})\`}}/>
        ))}
      </div>
      <div style={{position:"absolute",top:20,right:28,background:V.green,color:"#fff",fontWeight:800,fontSize:13,padding:"4px 12px",borderRadius:99,boxShadow:"0 2px 12px rgba(16,185,129,0.4)"}}>
        +{Math.abs(delta||12)}%
      </div>
      <div style={{position:"relative",zIndex:1}}>
        <p style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:8,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase"}}>Store Overview</p>
        <h2 style={{fontSize:26,fontWeight:900,color:"#fff",lineHeight:1.2,marginBottom:4}}>Your store is growing</h2>
        <h2 style={{fontSize:26,fontWeight:900,color:V.green,lineHeight:1.2,marginBottom:16}}>{Math.abs(delta||12)}% faster</h2>
        <p style={{fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.7)",marginBottom:20}}>than last week.</p>
        <Link href="/dashboard/analytics" style={{textDecoration:"none"}}>
          <button style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,border:"none",cursor:"pointer",background:"rgba(255,255,255,0.18)",color:"#fff",fontSize:13,fontWeight:700,backdropFilter:"blur(8px)"}}>
            View full analytics <ArrowUpRight size={14}/>
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

// ── KIRO insight row ───────────────────────────────────────────
function KIROInsight({ icon, title, body, cta, href, color, delay, isDark }:any) {
  const border = isDark?"rgba(255,255,255,0.05)":"rgba(107,53,232,0.08)";
  const text   = isDark?"#F0ECFF":"#130D2E";
  const muted  = isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.5)";
  return (
    <motion.div
      initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay}}
      style={{display:"flex",alignItems:"center",gap:14,padding:"14px 0",borderBottom:\`1px solid \${border}\`}}
    >
      <div style={{width:42,height:42,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:\`\${color}22\`,flexShrink:0,fontSize:18}}>
        {icon}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontSize:13,fontWeight:700,color:text,marginBottom:2}}>{title}</p>
        <p style={{fontSize:11,color:muted,lineHeight:1.5}}>{body}</p>
      </div>
      <Link href={href} style={{textDecoration:"none",flexShrink:0}}>
        <button style={{padding:"7px 14px",borderRadius:8,border:\`1px solid \${isDark?"rgba(255,255,255,0.12)":"rgba(107,53,232,0.15)"}\`,background:isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.06)",color:text,fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
          {cta}
        </button>
      </Link>
    </motion.div>
  );
}

// ── Revenue area chart ─────────────────────────────────────────
function RevenueChart({ data }:{data:number[]}) {
  const max = Math.max(...data, 1);
  const w   = 100 / (data.length - 1);
  const pts = data.map((v,i)=>\`\${i*w},\${100-(v/max)*85}\`).join(" ");
  const fill = data.map((v,i)=>\`\${i*w},\${100-(v/max)*85}\`).join(" ")
    + \` \${(data.length-1)*w},100 0,100\`;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{width:"100%",height:80}}>
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={V.v400} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={V.v400} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={fill} fill="url(#rg)"/>
      <polyline points={pts} fill="none" stroke={V.v400} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={(data.length-1)*w} cy={100-(data[data.length-1]/max)*85} r="3" fill="#fff" stroke={V.v400} strokeWidth="2"/>
    </svg>
  );
}

// ── Activity item ──────────────────────────────────────────────
function ActivityItem({ icon, title, sub, time, color, isDark }:any) {
  const text  = isDark?"#F0ECFF":"#130D2E";
  const muted = isDark?"rgba(240,236,255,0.4)":"rgba(19,13,46,0.45)";
  const bdr   = isDark?"rgba(255,255,255,0.04)":"rgba(107,53,232,0.06)";
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:\`1px solid \${bdr}\`}}>
      <div style={{width:34,height:34,borderRadius:10,background:\`\${color}20\`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14}}>
        {icon}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontSize:12,fontWeight:600,color:text}}>{title}</p>
        <p style={{fontSize:11,color:muted,marginTop:1}}>{sub}</p>
      </div>
      <span style={{fontSize:10,color:muted,flexShrink:0}}>{time}</span>
    </div>
  );
}

// ── Quick action card ──────────────────────────────────────────
function QAction({ icon, label, sub, href, color, isDark }:any) {
  const t = {
    card:   isDark?"#16122A":"#fff",
    border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.10)",
    text:   isDark?"#F0ECFF":"#130D2E",
    muted:  isDark?"rgba(240,236,255,0.4)":"rgba(19,13,46,0.5)",
    faint:  isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
  };
  return (
    <Link href={href} style={{textDecoration:"none"}}>
      <motion.div
        whileHover={{scale:1.02,y:-2}} whileTap={{scale:0.97}}
        style={{padding:"16px 14px",borderRadius:14,background:t.card,border:\`1px solid \${t.border}\`,cursor:"pointer",display:"flex",flexDirection:"column",gap:8}}
      >
        <div style={{width:36,height:36,borderRadius:10,background:\`\${color}18\`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:16}}>{icon}</span>
        </div>
        <div>
          <p style={{fontSize:12,fontWeight:700,color:t.text,marginBottom:2}}>{label}</p>
          <p style={{fontSize:10,color:t.muted,lineHeight:1.4}}>{sub}</p>
        </div>
        <ChevronRight size={12} color={t.muted} style={{alignSelf:"flex-end"}}/>
      </motion.div>
    </Link>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function DashboardPage() {
  const { theme } = useTheme();
  const { user }  = useAuthStore();
  const isDark    = theme === "dark";
  const [greeting, setGreeting] = useState("morning");
  const { fmt }   = useCurrency();
  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const storeId   = user?.stores?.[0]?.id;

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h<12?"morning":h<17?"afternoon":"evening");
  }, []);

  const tk = {
    bg:     isDark?"#06040D":"#F4F2FB",
    card:   isDark?"#16122A":"#fff",
    border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.10)",
    text:   isDark?"#F0ECFF":"#130D2E",
    muted:  isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.5)",
    faint:  isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
  };

  const { data: analytics } = useQuery({
    queryKey:["dashboard-analytics",storeId],
    queryFn: ()=>api.get(\`/analytics/\${storeId}?period=7\`).then(r=>r.data.data),
    enabled: !!storeId, staleTime:60000,
  });
  const { data: recentOrders } = useQuery({
    queryKey:["dashboard-orders",storeId],
    queryFn: ()=>api.get(\`/orders/\${storeId}?limit=5\`).then(r=>r.data.data?.orders||r.data.data||[]),
    enabled: !!storeId, staleTime:30000,
  });
  const { data: pulse } = useQuery({
    queryKey:["kiro-pulse",storeId],
    queryFn: ()=>api.get(\`/kai/pulse?storeId=\${storeId}&limit=3\`).then(r=>r.data.data||[]),
    enabled: !!storeId, staleTime:120000,
  });

  const stats   = analytics?.stats || {};
  const orders  = Array.isArray(recentOrders) ? recentOrders : [];
  const alerts  = Array.isArray(pulse) ? pulse : [];
  const revDelta = stats.revenueDelta ?? 12;
  const chartData = analytics?.chartData?.map((d:any)=>d.revenue) ||
    [8000,14000,11000,18000,15000,22000,28000];

  const statCards = [
    { label:"Revenue",         value:fmt(stats.revenue||12430),                   delta:revDelta,           color:V.v400,  icon:TrendingUp  },
    { label:"Orders",          value:(stats.orders||124).toLocaleString(),         delta:stats.ordersDelta??14, color:V.cyan, icon:ShoppingCart },
    { label:"Conversion Rate", value:\`\${stats.conversionRate||4.8}%\`,            delta:stats.conversionDelta??8, color:V.amber, icon:Activity },
    { label:"Store Health",    value:\`\${stats.healthScore||82}%\`,               delta:12,                 color:V.green, icon:Heart       },
  ];

  const kiroInsights = alerts.length > 0 ? alerts.map((a:any)=>({
    icon: a.severity==="high"?"🔥":a.type==="stock"?"⚠️":"📈",
    title:a.title, body:a.message,
    cta:a.cta||"View", href:a.href||"/dashboard/analytics",
    color:a.severity==="high"?V.red:V.amber,
  })) : [
    { icon:"🔥", title:"Trending Product Alert",   body:"Wireless portable blender is trending on TikTok. High demand, low competition.",   cta:"Research Now",   href:"/dashboard/ad-spy",    color:V.red   },
    { icon:"📈", title:"Increase Ad Budget",        body:"Your Facebook ad performance is high. Consider increasing budget by 20%.",          cta:"View Campaigns", href:"/dashboard/analytics", color:V.green },
    { icon:"⚠️", title:"Low Stock Alert",           body:"3 products are running low. Restock to avoid losing sales.",                        cta:"View Products",  href:"/dashboard/products",  color:V.amber },
  ];

  const quickActions = [
    { icon:"🛍️", label:"Import Product",  sub:"Add products from any platform",            href:"/dashboard/import",      color:V.v400  },
    { icon:"✏️",  label:"Write Ad Copy",   sub:"Generate high-converting ad copy in seconds", href:"/kiro",                  color:V.cyan  },
    { icon:"⚡",  label:"Flash Sale",      sub:"Create a flash sale in minutes",             href:"/dashboard/flash-sales", color:V.green },
    { icon:"🚀",  label:"Growth Plan",     sub:"Get your 5-step custom growth plan",         href:"/kiro",                  color:V.amber },
    { icon:"📊",  label:"Analytics",       sub:"Deep insights and store performance",        href:"/dashboard/analytics",   color:"#EC4899"},
  ];

  const recentActivity = orders.length > 0 ? orders.slice(0,4).map((o:any)=>({
    icon:"📦", title:o.customerName||"New Order",
    sub:\`Order #\${o.orderNumber||o.id?.slice(-6)} · \${fmt(o.total)}\`,
    time:"just now", color:V.v400,
  })) : [
    { icon:"📦", title:"Product imported successfully", sub:"Wireless Portable Blender", time:"2m ago",  color:V.green },
    { icon:"✏️", title:"Ad copy generated",            sub:"TikTok Ad – Summer Sale",   time:"15m ago", color:V.cyan  },
    { icon:"⚡", title:"Flash sale created",            sub:"Summer Madness Sale",        time:"1h ago",  color:V.amber },
    { icon:"🛒", title:"Order received",               sub:"Order #1234 – ₦99.99",      time:"2h ago",  color:V.v400  },
  ];

  const days = ["May 15","May 16","May 17","May 18","May 19","May 20","May 21"];

  return (
    <div style={{maxWidth:1200,margin:"0 auto",paddingBottom:40}}>

      {/* Header */}
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
        style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,gap:12,flexWrap:"wrap"}}
      >
        <div>
          <h1 style={{fontSize:26,fontWeight:900,letterSpacing:"-0.04em",color:tk.text,marginBottom:4}}>
            Good {greeting}, {firstName} 👋
          </h1>
          <p style={{fontSize:13,color:tk.muted}}>Your AI commerce assistant is ready to help you grow smarter today.</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{position:"relative"}}>
            <Bell size={18} color={tk.muted}/>
            <div style={{position:"absolute",top:-2,right:-2,width:7,height:7,borderRadius:"50%",background:V.v400}}/>
          </div>
          <Link href="/kiro" style={{textDecoration:"none"}}>
            <button style={{display:"flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:10,border:"none",cursor:"pointer",background:\`linear-gradient(135deg,\${V.v500},\${V.v400})\`,color:"#fff",fontSize:13,fontWeight:700,boxShadow:\`0 4px 16px \${V.v500}40\`}}>
              <Plus size={14}/> New Task
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Store hero */}
      <StoreHero delta={revDelta} isDark={isDark}/>

      {/* Stat cards */}
      <div className="stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {statCards.map((s,i)=><StatCard key={s.label} {...s} delay={0.08+i*0.06} isDark={isDark}/>)}
      </div>

      {/* KIRO AI Recommendations */}
      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.35}}
        style={{borderRadius:18,background:isDark?"#120E24":"#fff",border:\`1px solid \${tk.border}\`,padding:"20px 24px",marginBottom:20}}
      >
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:13,fontWeight:800,color:tk.text}}>KIRO AI Recommendations</span>
            <div style={{width:16,height:16,borderRadius:"50%",border:\`1.5px solid \${tk.muted}\`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:9,color:tk.muted,fontWeight:700}}>i</span>
            </div>
          </div>
          <span style={{fontSize:12,color:V.v400,fontWeight:700}}>✨ {kiroInsights.length} new insights</span>
        </div>
        <div>
          {kiroInsights.map((item:any,i:number)=>(
            <KIROInsight key={i} {...item} delay={0.4+i*0.06} isDark={isDark}/>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.55}} style={{marginBottom:20}}>
        <p style={{fontSize:14,fontWeight:800,color:tk.text,marginBottom:12}}>Quick Actions</p>
        <div className="qa-grid" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
          {quickActions.map(a=><QAction key={a.label} {...a} isDark={isDark}/>)}
        </div>
      </motion.div>

      {/* Revenue + Activity */}
      <div className="bottom-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>

        <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.65}}
          style={{borderRadius:18,background:tk.card,border:\`1px solid \${tk.border}\`,padding:"20px 22px"}}
        >
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <span style={{fontSize:13,fontWeight:800,color:tk.text}}>Revenue Overview</span>
            <span style={{fontSize:11,color:tk.muted,background:tk.faint,border:\`1px solid \${tk.border}\`,padding:"4px 10px",borderRadius:8,fontWeight:600}}>Last 7 days ▾</span>
          </div>
          <p style={{fontSize:28,fontWeight:900,color:tk.text,letterSpacing:"-0.04em"}}>{fmt(stats.revenue||12430)}</p>
          <p style={{fontSize:12,color:V.green,fontWeight:700,marginBottom:16}}>▲ {revDelta}% vs previous 7 days</p>
          <RevenueChart data={chartData}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
            {days.map(d=><span key={d} style={{fontSize:9,color:tk.muted}}>{d}</span>)}
          </div>
        </motion.div>

        <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.72}}
          style={{borderRadius:18,background:tk.card,border:\`1px solid \${tk.border}\`,padding:"20px 22px"}}
        >
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <span style={{fontSize:13,fontWeight:800,color:tk.text}}>Recent Activity</span>
            <Link href="/dashboard/orders" style={{textDecoration:"none"}}>
              <span style={{fontSize:12,color:V.v400,fontWeight:700}}>View all</span>
            </Link>
          </div>
          <div>
            {recentActivity.map((a:any,i:number)=><ActivityItem key={i} {...a} isDark={isDark}/>)}
          </div>
        </motion.div>
      </div>

      <style>{\`
        @media(max-width:1024px){
          .stat-grid{grid-template-columns:repeat(2,1fr)!important}
          .qa-grid  {grid-template-columns:repeat(3,1fr)!important}
        }
        @media(max-width:768px){
          .stat-grid  {grid-template-columns:repeat(2,1fr)!important}
          .qa-grid    {grid-template-columns:repeat(2,1fr)!important}
          .bottom-grid{grid-template-columns:1fr!important}
        }
        @media(max-width:480px){
          .stat-grid{grid-template-columns:1fr 1fr!important}
          .qa-grid  {grid-template-columns:1fr 1fr!important}
        }
      \`}</style>
    </div>
  );
}
`,

// ─────────────────────────────────────────────────────────────────────────────
"frontend/src/app/(public)/kiro/page.tsx": `"use client";
// Path: frontend/src/app/(public)/kiro/page.tsx
// KIRO Public Page — matches CEO design (Image 2)
// Light default, dark toggle, mobile-first

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";

const BASE    = process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api";
const ACCENT  = "#7C3AED";
const ACCENT_D = "#5B21B6";

const KIROChatFull = dynamic(()=>import("../../../components/kai/KIROChat"),{
  ssr:false, loading:()=><Spinner/>,
});

// ── Tokens ────────────────────────────────────────────────────
const TL = {
  bg:"#F7F6F3",s1:"#FFFFFF",s2:"#F0EFF9",s3:"#E8E6F4",
  text:"#111827",sub:"#6B7280",muted:"#9CA3AF",
  border:"rgba(0,0,0,0.07)",borderH:"rgba(124,58,237,0.2)",
  accent:ACCENT,accentD:ACCENT_D,accentBg:ACCENT+"12",
  green:"#059669",amber:"#D97706",red:"#DC2626",
  heroGrad:"linear-gradient(145deg,#EDE9FE 0%,#F5F3FF 50%,#EEF2FF 100%)",
  shadow:"0 1px 3px rgba(0,0,0,0.05),0 4px 16px rgba(0,0,0,0.04)",
  shadowMd:"0 4px 24px rgba(124,58,237,0.12)",
};
const TD = {
  bg:"#0D0D14",s1:"#13131F",s2:"#1A1A2A",s3:"#232338",
  text:"#F9F8FF",sub:"#A0A0C0",muted:"#606080",
  border:"rgba(255,255,255,0.07)",borderH:"rgba(144,97,249,0.3)",
  accent:"#9061F9",accentD:ACCENT,accentBg:ACCENT+"18",
  green:"#10B981",amber:"#F59E0B",red:"#EF4444",
  heroGrad:"linear-gradient(145deg,#1a0840 0%,#1e1040 50%,#141428 100%)",
  shadow:"0 1px 4px rgba(0,0,0,0.4)",
  shadowMd:"0 4px 24px rgba(124,58,237,0.25)",
};

function Spinner() {
  return (
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:24,height:24,borderRadius:"50%",border:\`2px solid \${ACCENT}30\`,borderTopColor:ACCENT,animation:"spin 0.8s linear infinite"}}/>
      <style>{\`@keyframes spin{to{transform:rotate(360deg)}}\`}</style>
    </div>
  );
}

function KIROLogo({size=32}:{size?:number}) {
  return (
    <div style={{width:size,height:size,borderRadius:Math.round(size*0.27),background:\`linear-gradient(145deg,\${ACCENT},\${ACCENT_D})\`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:\`0 2px 10px \${ACCENT}45\`}}>
      <svg width={size*0.44} height={size*0.44} viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white" fillOpacity={.95}/>
      </svg>
    </div>
  );
}

function ActionCard({icon,label,sub,onClick,T}:any) {
  const [hov,setHov]=useState(false);
  return (
    <motion.button whileTap={{scale:0.97}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={onClick}
      style={{display:"flex",alignItems:"center",gap:14,padding:"16px 18px",borderRadius:16,
        border:\`1.5px solid \${hov?T.borderH:T.border}\`,
        background:hov?T.accentBg:T.s1,cursor:"pointer",textAlign:"left",width:"100%",
        transition:"all 0.18s",boxShadow:hov?T.shadowMd:T.shadow,outline:"none",fontFamily:"inherit"}}
    >
      <div style={{width:48,height:48,borderRadius:14,background:icon.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:22}}>
        {icon.emoji}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:3}}>{label}</p>
        <p style={{fontSize:12,color:T.sub,lineHeight:1.4}}>{sub}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </motion.button>
  );
}

function Chip({label,onClick,T}:any) {
  const [hov,setHov]=useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{padding:"8px 14px",borderRadius:99,border:\`1.5px solid \${hov?T.borderH:T.border}\`,background:hov?T.accentBg:T.s1,color:T.sub,fontSize:13,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s",outline:"none",fontFamily:"inherit"}}>
      {label}
    </button>
  );
}

function AuthModal({onClose,onSuccess,T}:{onClose:()=>void;onSuccess:(s:string)=>void;T:typeof TL}) {
  const [mode,setMode]=useState<"register"|"login">("register");
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [pass,setPass]=useState("");
  const [err,setErr]=useState(""); const [busy,setBusy]=useState(false);
  const inp:React.CSSProperties={width:"100%",padding:"11px 14px",borderRadius:10,border:\`1.5px solid \${T.border}\`,background:T.s2,color:T.text,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box" as any};
  async function submit(){
    if(!email||!pass) return; setBusy(true); setErr("");
    try{
      const body=mode==="register"?{name,email,password:pass}:{email,password:pass};
      const res=await fetch(\`\${BASE}/auth/\${mode}\`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const d=await res.json();
      if(!res.ok){setErr(d.message||"Something went wrong");setBusy(false);return;}
      const token=d.data?.accessToken||d.accessToken||"";
      if(token){localStorage.setItem("kiro_sid",token);onSuccess(token);}
    }catch{setErr("Network error");}
    setBusy(false);
  }
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16,fontFamily:"inherit"}}
      onClick={onClose}>
      <motion.div initial={{scale:0.93,y:16}} animate={{scale:1,y:0}} exit={{scale:0.93,y:16}}
        style={{background:T.s1,borderRadius:20,padding:28,width:"100%",maxWidth:400,boxShadow:"0 24px 64px rgba(0,0,0,0.22)"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:20}}><KIROLogo size={44}/></div>
        <h2 style={{textAlign:"center",fontSize:18,fontWeight:800,color:T.text,marginBottom:4}}>
          {mode==="register"?"Create your free account":"Welcome back"}
        </h2>
        <p style={{textAlign:"center",fontSize:13,color:T.sub,marginBottom:20}}>
          {mode==="register"?"Your store builder is almost ready":"Continue building your store"}
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {mode==="register"&&<input style={inp} placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/>}
          <input style={inp} type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)}/>
          <input style={inp} type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>
        {err&&<p style={{color:T.red,fontSize:12,marginTop:8,textAlign:"center"}}>{err}</p>}
        <button disabled={busy} onClick={submit}
          style={{width:"100%",marginTop:16,padding:"12px 0",borderRadius:11,border:"none",background:\`linear-gradient(135deg,\${ACCENT},\${ACCENT_D})\`,color:"#fff",fontWeight:700,fontSize:14,cursor:busy?"wait":"pointer",opacity:busy?.7:1,boxShadow:\`0 4px 16px \${ACCENT}40\`,fontFamily:"inherit"}}>
          {busy?"…":mode==="register"?"Create Account & Continue":"Log In"}
        </button>
        <p style={{textAlign:"center",fontSize:12,color:T.sub,marginTop:14}}>
          {mode==="register"?"Already have an account? ":"Don't have an account? "}
          <button onClick={()=>setMode(mode==="register"?"login":"register")} style={{background:"none",border:"none",color:ACCENT,fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>
            {mode==="register"?"Log in":"Sign up free"}
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function KiroPage() {
  const [mode,setMode]=useState<"light"|"dark">("light");
  const [sid,setSid]=useState<string|null>(()=>typeof window!=="undefined"?(localStorage.getItem("kiro_sid")||localStorage.getItem("accessToken")):null);
  const [authOpen,setAuthOpen]=useState(false);
  const [inputVal,setInputVal]=useState("");
  const [chatStarted,setChatStarted]=useState(false);
  const inputRef=useRef<HTMLTextAreaElement>(null);
  const T = mode==="light"?TL:TD;

  const handleSend=useCallback((text?:string)=>{
    const msg=text||inputVal.trim();
    if(!msg) return;
    if(!sid){setAuthOpen(true);return;}
    setChatStarted(true);
  },[inputVal,sid]);

  const handleChip=(label:string)=>{
    setInputVal(label);
    setTimeout(()=>handleSend(label),50);
  };

  if(sid&&chatStarted){
    return (
      <div style={{height:"100dvh",display:"flex",flexDirection:"column",background:T.bg,fontFamily:"'Inter',system-ui,sans-serif"}}>
        <style>{\`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box}\`}</style>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",borderBottom:\`1px solid \${T.border}\`,background:T.s1,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <KIROLogo size={30}/>
            <span style={{fontSize:15,fontWeight:800,color:T.text}}>KIRO</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setMode(m=>m==="light"?"dark":"light")} style={{width:32,height:32,borderRadius:8,border:\`1px solid \${T.border}\`,background:"transparent",cursor:"pointer",fontSize:14,color:T.sub}}>
              {mode==="light"?"🌙":"☀️"}
            </button>
            <Link href="/dashboard">
              <button style={{padding:"7px 14px",borderRadius:8,border:\`1.5px solid \${T.borderH}\`,background:T.accentBg,color:T.accent,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                Dashboard →
              </button>
            </Link>
          </div>
        </div>
        <div style={{flex:1,overflow:"hidden"}}>
          <KIROChatFull/>
        </div>
      </div>
    );
  }

  const actions=[
    {icon:{emoji:"🔥",bg:"rgba(239,68,68,0.1)"},   label:"Trending products", sub:"Live market research",             prompt:"Find me trending products right now"},
    {icon:{emoji:"🌐",bg:"rgba(6,182,212,0.1)"},    label:"Import product",    sub:"Any URL — AliExpress, Temu, Amazon",prompt:"Import a product for me"},
    {icon:{emoji:"📣",bg:"rgba(124,58,237,0.12)"},  label:"Write ad copy",     sub:"TikTok · WhatsApp · Instagram",    prompt:"Write ad copy for my product"},
    {icon:{emoji:"⚡",bg:"rgba(245,158,11,0.1)"},   label:"Flash sale",        sub:"Drive sales right now",            prompt:"Help me create a flash sale"},
    {icon:{emoji:"🚀",bg:"rgba(16,185,129,0.1)"},   label:"Growth plan",       sub:"Specific 5-step plan",             prompt:"Create a growth plan for my store"},
    {icon:{emoji:"📊",bg:"rgba(107,53,232,0.1)"},   label:"Store pulse",       sub:"Revenue · Health · What needs action",prompt:"Analyse my store performance"},
  ];
  const chips=["✨ Find winning products","🎯 Write a TikTok ad","📈 Create growth plan"];

  return (
    <div style={{minHeight:"100dvh",background:T.bg,fontFamily:"'Inter',system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box} textarea{resize:none}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      \`}</style>

      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",background:T.s1,borderBottom:\`1px solid \${T.border}\`,position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <KIROLogo size={32}/><span style={{fontSize:16,fontWeight:800,color:T.text,letterSpacing:"-0.02em"}}>KIRO</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setMode(m=>m==="light"?"dark":"light")}
            style={{width:34,height:34,borderRadius:9,border:\`1.5px solid \${T.border}\`,background:"transparent",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",color:T.sub}}>
            {mode==="light"?"🌙":"☀️"}
          </button>
          {sid?(
            <Link href="/dashboard">
              <button style={{padding:"8px 16px",borderRadius:9,border:"none",background:\`linear-gradient(135deg,\${ACCENT},\${ACCENT_D})\`,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Dashboard →</button>
            </Link>
          ):(
            <button onClick={()=>setAuthOpen(true)}
              style={{padding:"8px 16px",borderRadius:9,border:\`1.5px solid \${T.borderH}\`,background:T.accentBg,color:T.accent,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Dashboard →</button>
          )}
        </div>
      </div>

      {/* Hero */}
      <div style={{padding:"20px 20px 0"}}>
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
          style={{borderRadius:24,background:T.heroGrad,padding:"28px 24px",position:"relative",overflow:"hidden",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,marginBottom:4}}
        >
          <div style={{flex:1}}>
            <div style={{fontSize:24,marginBottom:8}}>👋</div>
            <h1 style={{fontSize:26,fontWeight:900,color:T.text,letterSpacing:"-0.03em",lineHeight:1.2,marginBottom:8}}>Good evening.</h1>
            <p style={{fontSize:14,color:T.sub,lineHeight:1.5,marginBottom:20}}>Your commerce AI is ready<br/>to help you grow.</p>
            <div style={{display:"inline-flex",flexDirection:"column",gap:8,padding:"12px 16px",borderRadius:14,background:"rgba(255,255,255,0.8)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.6)",minWidth:180}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:12,fontWeight:600,color:T.sub}}>Store Health</span>
                <span style={{fontSize:10,color:T.muted,background:T.s3,borderRadius:99,padding:"1px 6px"}}>ⓘ</span>
              </div>
              <p style={{fontSize:22,fontWeight:900,color:ACCENT,letterSpacing:"-0.04em"}}>82%</p>
              <div style={{display:"flex",gap:4}}>
                {[1,1,1,1,1,0,0,0].map((f,i)=>(
                  <div key={i} style={{flex:1,height:5,borderRadius:3,background:f?ACCENT:"rgba(124,58,237,0.15)"}}/>
                ))}
              </div>
              <span style={{fontSize:11,color:T.green,fontWeight:700}}>● Excellent</span>
            </div>
          </div>
          <div style={{flexShrink:0,animation:"float 3s ease-in-out infinite"}}>
            <div style={{width:90,height:90,borderRadius:24,background:\`linear-gradient(145deg,\${ACCENT},\${ACCENT_D})\`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:\`0 16px 40px \${ACCENT}50,0 4px 12px \${ACCENT}30\`,position:"relative"}}>
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white" fillOpacity={.95}/>
              </svg>
              <div style={{position:"absolute",bottom:-10,left:"50%",transform:"translateX(-50%)",width:60,height:12,borderRadius:"50%",background:\`\${ACCENT}30\`,filter:"blur(6px)"}}/>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <div style={{padding:"20px 20px 0"}}>
        <p style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>Quick actions</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {actions.map((a,i)=>(
            <motion.div key={a.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.08+i*0.05}}>
              <ActionCard {...a} onClick={()=>handleChip(a.prompt)} T={T}/>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chips */}
      <div style={{padding:"20px 20px 0"}}>
        <p style={{fontSize:13,color:T.muted,marginBottom:10,fontWeight:500}}>Try asking KIRO</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {chips.map(c=><Chip key={c} label={c} onClick={()=>handleChip(c)} T={T}/>)}
        </div>
      </div>

      {/* Input */}
      <div style={{padding:"16px 20px 24px",marginTop:"auto"}}>
        <div style={{background:T.s1,border:\`1.5px solid \${T.border}\`,borderRadius:18,padding:"14px 16px",boxShadow:T.shadowMd}}>
          <textarea ref={inputRef} value={inputVal} onChange={e=>setInputVal(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSend();}}}
            placeholder="Message KIRO... paste a URL, describe a product, or ask"
            rows={2}
            style={{width:"100%",border:"none",outline:"none",background:"transparent",color:T.sub,fontSize:14,fontFamily:"inherit",lineHeight:1.5}}
          />
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10}}>
            <div style={{display:"flex",gap:8}}>
              {["🖼️","📎","🎤"].map((icon,i)=>(
                <button key={i} style={{width:32,height:32,borderRadius:8,border:\`1px solid \${T.border}\`,background:"transparent",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",color:T.muted}}>{icon}</button>
              ))}
            </div>
            <button onClick={()=>handleSend()}
              style={{width:38,height:38,borderRadius:10,border:"none",background:inputVal.trim()?\`linear-gradient(135deg,\${ACCENT},\${ACCENT_D})\`:"rgba(124,58,237,0.15)",cursor:inputVal.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",boxShadow:inputVal.trim()?\`0 4px 16px \${ACCENT}45\`:"none"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={inputVal.trim()?"#fff":ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4z"/>
              </svg>
            </button>
          </div>
        </div>
        <p style={{textAlign:"center",fontSize:11,color:T.muted,marginTop:10,fontWeight:500}}>
          KIRO · Built by Darkweb & DropOS
        </p>
      </div>

      <AnimatePresence>
        {authOpen&&<AuthModal onClose={()=>setAuthOpen(false)} onSuccess={token=>{setSid(token);setAuthOpen(false);setChatStarted(true);}} T={T}/>}
      </AnimatePresence>
    </div>
  );
}
`,

}; // end files

// ── Write + push ───────────────────────────────────────────────
let n = 0;
for (const [rel, content] of Object.entries(files)) {
  const p = rel.replace(/\//g, path.sep);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
  console.log('✅', rel.split('/').slice(-2).join('/'));
  n++;
}
console.log(`\nWritten: ${n} files`);

try {
  execSync('git add .', { stdio: 'inherit' });
  const st = execSync('git status --short', { encoding: 'utf8' }).trim();
  if (st) {
    execSync('git commit -m "feat: UI redesign — dashboard matches CEO Image 1, KIRO page matches CEO Image 2"', { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('\n🚀 Pushed. Vercel is deploying now.');
  } else {
    console.log('\nNothing new to commit. Run: git push origin main');
  }
} catch(e: any) {
  console.log('Git error:', e.message);
}
