"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { TrendingUp, Star, ShoppingCart, DollarSign, Zap, RefreshCw } from "lucide-react";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA", green:"#10B981", amber:"#F59E0B", cyan:"#06B6D4" };

const DEMO = [
  {rank:1, name:"Brazilian Hair Bundle 18 inch",     revenue:840000, units:32, trend:"+24%", img:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=48&h=48&fit=crop", hot:true},
  {rank:2, name:"LED Face Mask Beauty Device",     revenue:620000, units:28, trend:"+18%", img:"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=48&h=48&fit=crop", hot:true},
  {rank:3, name:"Wireless Earbuds Pro",            revenue:480000, units:24, trend:"+12%", img:"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=48&h=48&fit=crop"},
  {rank:4, name:"Vitamin C Serum 30ml",            revenue:360000, units:20, trend:"+9%",  img:"https://images.unsplash.com/photo-1617897903246-719242758050?w=48&h=48&fit=crop"},
  {rank:5, name:"Smart Watch Series 8",            revenue:290000, units:14, trend:"+6%",  img:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=48&h=48&fit=crop"},
  {rank:6, name:"Fashion Sneakers 2024",           revenue:240000, units:12, trend:"+4%",  img:"https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=48&h=48&fit=crop"},
  {rank:7, name:"Collagen Gummies 60ct",           revenue:195000, units:18, trend:"+3%",  img:"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=48&h=48&fit=crop"},
  {rank:8, name:"Magnetic Phone Holder",           revenue:145000, units:22, trend:"+2%",  img:"https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=48&h=48&fit=crop"},
  {rank:9, name:"Portable Blender USB",            revenue:120000, units:10, trend:"+1%",  img:"https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=48&h=48&fit=crop"},
  {rank:10,name:"Silk Sleep Mask Premium",         revenue: 95000, units:16, trend:"0%",   img:"https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=48&h=48&fit=crop"},
];

function fmt(n: number) { return new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n); }

export default function TopProductsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card: isDark?"#181230":"#fff", border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text: isDark?"#F0ECFF":"#130D2E", muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint: isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
    row: isDark?"rgba(255,255,255,0.02)":"rgba(107,53,232,0.015)",
  };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const [period, setPeriod] = useState(7);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["top-products", storeId, period],
    queryFn: () => api.get(`/analytics/${storeId}/top-products?days=${period}`).then(r => r.data.data),
    enabled: !!storeId,
  });

  const products = data?.length ? data : DEMO;
  const totalRevenue = products.reduce((a:number, p:any) => a + (p.revenue||0), 0);

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1" style={{color:t.text}}>Daily Top 10</h1>
          <p className="text-sm" style={{color:t.muted}}>Best performing products by revenue</p>
        </div>
        <div className="flex items-center gap-2">
          {[7,14,30].map(d => (
            <button key={d} onClick={() => setPeriod(d)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{background:period===d?V.v500:"transparent",color:period===d?"#fff":t.muted,border:`1px solid ${period===d?V.v500:t.border}`,cursor:"pointer"}}>
              {d}d
            </button>
          ))}
          <button onClick={() => refetch()} style={{width:32,height:32,borderRadius:10,border:`1px solid ${t.border}`,background:t.faint,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <RefreshCw size={13} style={{color:t.muted}}/>
          </button>
        </div>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          {label:"Total Revenue",  value:fmt(totalRevenue),           color:V.v400, icon:DollarSign},
          {label:"Units Sold",     value:products.reduce((a:number,p:any)=>a+(p.units||p.sold||0),0).toLocaleString(), color:V.green, icon:ShoppingCart},
          {label:"Top Product",    value:products[0]?.name?.split(" ").slice(0,3).join(" ")+"..." , color:V.amber, icon:Star},
        ].map((s,i) => (
          <motion.div key={s.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{background:`${s.color}15`}}>
              <s.icon size={14} style={{color:s.color}}/>
            </div>
            <p className="text-base font-black mb-0.5 truncate" style={{color:t.text}}>{s.value}</p>
            <p className="text-xs" style={{color:t.muted}}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{background:t.card,border:`1px solid ${t.border}`}}>
        {products.map((p:any, i:number) => {
          const pct = totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0;
          const medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":null;
          return (
            <motion.div key={p.rank||i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
              className="flex items-center gap-4 px-4 py-3.5"
              style={{borderBottom:i<products.length-1?`1px solid ${t.border}`:"none",background:i%2===0?t.row:"transparent"}}>
              <div className="w-7 text-center flex-shrink-0">
                {medal ? <span className="text-lg">{medal}</span> : <span className="text-sm font-bold" style={{color:t.muted}}>#{i+1}</span>}
              </div>
              {p.img ? (
                <img src={p.img} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" style={{border:`1px solid ${t.border}`}}
                  onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
              ) : (
                <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{background:t.faint,border:`1px solid ${t.border}`}}/>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold truncate" style={{color:t.text}}>{p.name}</p>
                  {p.hot && <span className="text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0" style={{background:"rgba(239,68,68,0.1)",color:"#EF4444"}}>HOT</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full" style={{background:t.faint}}>
                    <div style={{width:`${pct}%`,height:"100%",borderRadius:99,background:`linear-gradient(90deg,${V.v500},${V.v300})`}}/>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{color:t.muted}}>{pct.toFixed(0)}%</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold" style={{color:t.text}}>{fmt(p.revenue||0)}</p>
                <p className="text-xs" style={{color:V.green}}>{p.trend || `${p.units||0} sold`}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
