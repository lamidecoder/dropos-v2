"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "../../components/layout/DashboardLayout";
import { useAuthStore } from "../../store/auth.store";
import { api } from "../../lib/api";
import StoreHealthScore from "../../components/ui/StoreHealthScore";
import {
  Zap, TrendingUp, ShoppingCart, Users, ArrowUpRight,
  ArrowRight, Package, Store, Activity, ChevronRight,
} from "lucide-react";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA", green:"#10B981", amber:"#F59E0B", red:"#EF4444", cyan:"#06B6D4" };

// Real photos from Unsplash
const CUSTOMER_PHOTOS = [
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=64&h=64&fit=crop&crop=face",
];

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", { style:"currency", currency:"NGN", maximumFractionDigits:0 }).format(n || 0);
}

function StatCard({ label, value, delta, color, icon: Icon, href, t }: any) {
  const up = delta >= 0;
  return (
    <Link href={href || "#"} style={{ textDecoration:"none" }}>
      <motion.div whileHover={{ y:-2 }} className="p-5 rounded-2xl cursor-pointer"
        style={{ background:t.card, border:`1px solid ${t.border}`, transition:"box-shadow 0.2s" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:`${color}14` }}>
            <Icon size={16} style={{ color }}/>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
            style={{ background:up?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)", color:up?V.green:V.red }}>
            <ArrowUpRight size={10} style={{ transform:up?"rotate(0)":"rotate(90deg)" }}/>
            {Math.abs(delta)}%
          </div>
        </div>
        <p className="text-2xl font-black mb-1" style={{ color:t.text, letterSpacing:"-1px" }}>{value}</p>
        <p className="text-xs font-medium" style={{ color:t.muted }}>{label}</p>
      </motion.div>
    </Link>
  );
}

function KIROBrief({ firstName, stats, t }: any) {
  const [hour, setHour] = useState(12);
  useEffect(() => { setHour(new Date().getHours()); }, []);
  const timeLabel = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  const insights = [
    stats?.revenue > 0
      ? `You made ${fmt(stats.revenue || 84000)} today, up ${stats.revenueGrowth || 34}% from yesterday.`
      : "Your store is live. Share your link to get your first sale today.",
    stats?.pendingOrders > 0
      ? `${stats.pendingOrders} orders need fulfilment. I can handle them automatically.`
      : "No pending orders right now. Great time to run a flash sale.",
    "Your LED Face Mask is trending in 3 competitor stores. Want me to import it?",
  ];

  return (
    <div className="rounded-2xl p-5 mb-5" style={{ background:"rgba(107,53,232,0.07)", border:"1px solid rgba(107,53,232,0.18)" }}>
      <div className="flex items-start gap-4">
        {/* KIRO avatar */}
        <motion.div animate={{ boxShadow:["0 0 0 0 rgba(107,53,232,0.4)","0 0 0 8px rgba(107,53,232,0)","0 0 0 0 rgba(107,53,232,0)"] }} transition={{ duration:2.5, repeat:Infinity }}
          style={{ width:44, height:44, borderRadius:14, background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Zap size={20} color="white"/>
        </motion.div>
        <div style={{ flex:1 }}>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-black" style={{ color:"#fff" }}>KIRO</p>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background:"rgba(107,53,232,0.2)", color:V.v300 }}>AI</span>
          </div>
          <p className="text-sm mb-3 font-semibold" style={{ color:"rgba(255,255,255,0.7)", letterSpacing:"-0.01em" }}>
            Good {timeLabel}, {firstName}. Here is what matters today.
          </p>
          <div className="space-y-2 mb-4">
            {insights.map((insight, i) => (
              <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.1 }}
                className="flex items-start gap-2.5">
                <span className="text-base flex-shrink-0" style={{ marginTop:1 }}>{["📊","📦","🔥"][i]}</span>
                <p className="text-xs leading-relaxed" style={{ color:"rgba(255,255,255,0.55)" }}>{insight}</p>
              </motion.div>
            ))}
          </div>
          <Link href="/dashboard/kiro">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, color:"#fff", border:"none", cursor:"pointer" }}>
              <Zap size={12}/> Talk to KIRO <ArrowRight size={12}/>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function RecentOrders({ orders, t }: any) {
  if (!orders?.length) return null;
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background:t.card, border:`1px solid ${t.border}` }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:`1px solid ${t.border}` }}>
        <h3 className="text-sm font-bold" style={{ color:t.text }}>Recent Orders</h3>
        <Link href="/dashboard/orders" className="text-xs font-semibold flex items-center gap-1" style={{ color:V.v400 }}>
          See all <ChevronRight size={12}/>
        </Link>
      </div>
      <div className="divide-y" style={{ borderColor:t.border }}>
        {orders.slice(0,5).map((order: any, i: number) => {
          const photo = CUSTOMER_PHOTOS[i % CUSTOMER_PHOTOS.length];
          const statusColors: any = {
            PENDING:    { color:"#F59E0B", bg:"rgba(245,158,11,0.1)"  },
            PROCESSING: { color:"#8B5CF6", bg:"rgba(139,92,246,0.1)" },
            SHIPPED:    { color:"#10B981", bg:"rgba(16,185,129,0.1)" },
            DELIVERED:  { color:"#10B981", bg:"rgba(16,185,129,0.1)" },
            CANCELLED:  { color:"#EF4444", bg:"rgba(239,68,68,0.1)"  },
          };
          const sc = statusColors[order.status] || statusColors.PENDING;
          return (
            <div key={order.id} className="flex items-center gap-3 px-5 py-3.5">
              <img src={photo} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" style={{ border:`2px solid ${t.border}` }}/>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color:t.text }}>{order.customer?.name || "Customer"}</p>
                <p className="text-xs truncate" style={{ color:t.muted }}>{order.items?.length || 1} item{order.items?.length !== 1 ? "s" : ""} · #{order.orderNumber || order.id?.slice(-6)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold" style={{ color:t.text }}>{fmt(order.total)}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background:sc.bg, color:sc.color }}>{order.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuickActions({ t }: any) {
  const actions = [
    { emoji:"➕", label:"Add Product",     href:"/dashboard/products",     color:V.v400  },
    { emoji:"⚡", label:"Flash Sale",      href:"/dashboard/flash-sales",  color:"#F59E0B"},
    { emoji:"🎬", label:"TikTok Script",   href:"/dashboard/content-studio",color:"#EC4899"},
    { emoji:"📊", label:"View Analytics",  href:"/dashboard/analytics",    color:V.cyan  },
    { emoji:"🎟️", label:"New Coupon",      href:"/dashboard/coupons",      color:V.green },
    { emoji:"📣", label:"Broadcast",       href:"/dashboard/broadcasts",   color:"#F97316"},
  ];
  return (
    <div className="rounded-2xl p-5" style={{ background:t.card, border:`1px solid ${t.border}` }}>
      <h3 className="text-sm font-bold mb-4" style={{ color:t.text }}>Quick Actions</h3>
      <div className="grid grid-cols-3 gap-2">
        {actions.map(a => (
          <Link key={a.label} href={a.href} style={{ textDecoration:"none" }}>
            <motion.div whileHover={{ scale:1.03 }} className="flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer transition-all"
              style={{ background:"rgba(255,255,255,0.03)", border:`1px solid rgba(255,255,255,0.06)` }}>
              <span style={{ fontSize:22 }}>{a.emoji}</span>
              <span className="text-[10px] font-semibold text-center leading-tight" style={{ color:t.muted }}>{a.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function TopProducts({ products, t }: any) {
  const demo = [
    { name:"Brazilian Hair Bundle", revenue:384000, sold:16, img:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=48&h=48&fit=crop" },
    { name:"LED Face Mask",         revenue:290000, sold:14, img:"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=48&h=48&fit=crop" },
    { name:"Collagen Gummies",      revenue:224000, sold:12, img:"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=48&h=48&fit=crop" },
  ];
  const items = products?.length ? products.slice(0,3) : demo;
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background:t.card, border:`1px solid ${t.border}` }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:`1px solid ${t.border}` }}>
        <h3 className="text-sm font-bold" style={{ color:t.text }}>Top Products</h3>
        <Link href="/dashboard/analytics" className="text-xs font-semibold flex items-center gap-1" style={{ color:V.v400 }}>
          Full report <ChevronRight size={12}/>
        </Link>
      </div>
      <div className="divide-y" style={{ borderColor:t.border }}>
        {items.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5">
            <img src={p.img} alt={p.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
              style={{ border:`1px solid ${t.border}` }}
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}/>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color:t.text }}>{p.name}</p>
              <p className="text-xs" style={{ color:t.muted }}>{p.sold} sold</p>
            </div>
            <p className="text-sm font-bold flex-shrink-0" style={{ color:V.green }}>{fmt(p.revenue)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const user = useAuthStore(s => s.user);
  const firstName = user?.name?.split(" ")[0] || "there";
  const storeId   = user?.stores?.[0]?.id;

  const t = {
    card:   isDark ? "#181230" : "#fff",
    border: isDark ? "rgba(255,255,255,0.07)" : "rgba(107,53,232,0.08)",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.45)" : "rgba(19,13,46,0.55)",
    faint:  isDark ? "rgba(255,255,255,0.03)" : "rgba(107,53,232,0.03)",
  };

  const { data: analytics }  = useQuery({ queryKey:["analytics-summary",storeId], queryFn:()=>api.get(`/analytics/${storeId}/summary`).then(r=>r.data.data), enabled:!!storeId, staleTime:60000 });
  const { data: ordersData }  = useQuery({ queryKey:["orders-recent",storeId],    queryFn:()=>api.get(`/orders/${storeId}?limit=5`).then(r=>r.data.data),             enabled:!!storeId, staleTime:30000 });
  const { data: topProducts } = useQuery({ queryKey:["top-products",storeId],     queryFn:()=>api.get(`/analytics/${storeId}/top-products`).then(r=>r.data.data),      enabled:!!storeId, staleTime:60000 });

  const stats = analytics || {};
  const orders = ordersData || [];

  return (
    <div className="max-w-5xl mx-auto">
      {/* KIRO brief */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}>
        <KIROBrief firstName={firstName} stats={stats} t={t}/>
      </motion.div>

      {/* Store health */}
      <StoreHealthScore />

      {/* Stats */}
      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Revenue Today"   value={fmt(stats.revenueToday||0)}         delta={stats.revenueGrowth||12}  color={V.v400}  icon={TrendingUp}  href="/dashboard/analytics" t={t}/>
        <StatCard label="Orders Today"    value={(stats.ordersToday||0).toLocaleString()} delta={stats.ordersGrowth||8}   color={V.cyan}  icon={ShoppingCart} href="/dashboard/orders"    t={t}/>
        <StatCard label="Total Customers" value={(stats.customers||0).toLocaleString()}   delta={stats.customerGrowth||15} color={V.green} icon={Users}        href="/dashboard/customers" t={t}/>
        <StatCard label="Active Products" value={(stats.products||0).toLocaleString()}    delta={stats.productGrowth||0}   color={V.amber} icon={Package}      href="/dashboard/products"  t={t}/>
      </motion.div>

      {/* Main grid */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.14 }}
        className="grid lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <RecentOrders orders={orders} t={t}/>
        </div>
        <div>
          <QuickActions t={t}/>
        </div>
      </motion.div>

      {/* Top products */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
        <TopProducts products={topProducts} t={t}/>
      </motion.div>
    </div>
  );
}
