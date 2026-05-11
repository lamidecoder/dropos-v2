"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { RefreshCw, Zap, TrendingUp, DollarSign, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";
const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B" };
const fmt = (n:number) => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);
export default function PriceSyncPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = { card:isDark?"#181230":"#fff", border:isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)", text:isDark?"#F0ECFF":"#130D2E", muted:isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)", faint:isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)" };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const qc = useQueryClient();
  const [margin, setMargin] = useState(40);
  const [syncing, setSyncing] = useState(false);
  const { data } = useQuery({ queryKey:["products-price",storeId], queryFn:()=>api.get(`/products/${storeId}?limit=20`).then(r=>r.data.data?.products||r.data.data||[]), enabled:!!storeId });
  const products = data||[];
  const syncAll = async () => {
    setSyncing(true);
    try {
      await api.post(`/products/${storeId}/sync-prices`, { marginPct: margin });
      toast.success("Prices synced with suppliers!");
      qc.invalidateQueries({queryKey:["products-price"]});
    } catch { toast.error("Sync failed — check supplier connections"); }
    setSyncing(false);
  };
  return (
    <div style={{maxWidth:800,margin:"0 auto"}}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:t.text,margin:"0 0 4px"}}>Price Sync</h1>
        <p style={{fontSize:13,color:t.muted,margin:0}}>Auto-sync your prices with supplier costs and apply a margin multiplier</p>
      </motion.div>
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} style={{padding:20,borderRadius:16,background:t.card,border:`1px solid ${t.border}`,marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:16}}>
          <div>
            <p style={{fontSize:14,fontWeight:700,color:t.text,margin:"0 0 4px"}}>Target Margin</p>
            <p style={{fontSize:12,color:t.muted,margin:0}}>KIRO will price all products at cost × (1 + {margin}%)</p>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <input type="range" min={10} max={200} value={margin} onChange={e=>setMargin(Number(e.target.value))} style={{width:120,accentColor:V.v500}}/>
            <span style={{fontSize:18,fontWeight:900,color:V.v400,minWidth:48}}>{margin}%</span>
          </div>
        </div>
        <button onClick={syncAll} disabled={syncing} style={{display:"flex",alignItems:"center",gap:8,padding:"11px 22px",borderRadius:12,background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:syncing?"not-allowed":"pointer",color:"#fff",fontSize:13,fontWeight:700,opacity:syncing?0.7:1}}>
          {syncing?<Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>:<RefreshCw size={14}/>}
          {syncing?"Syncing prices...":"Sync All Prices"}
        </button>
      </motion.div>
      {products.length>0&&(
        <div style={{borderRadius:16,overflow:"hidden",background:t.card,border:`1px solid ${t.border}`}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:12,padding:"10px 16px",borderBottom:`1px solid ${t.border}`}}>
            <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:t.muted}}>Product</span>
            <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:t.muted}}>Current</span>
            <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:t.muted}}>Synced</span>
          </div>
          {products.slice(0,8).map((p:any,i:number)=>{
            const synced = Math.round((p.costPrice||p.price*0.6)*(1+margin/100));
            return (
              <div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:12,alignItems:"center",padding:"10px 16px",borderBottom:i<7?`1px solid ${t.border}`:"none",background:i%2===0?"transparent":"rgba(255,255,255,0.01)"}}>
                <p style={{fontSize:13,color:t.text,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</p>
                <p style={{fontSize:13,fontWeight:600,color:t.muted,margin:0,whiteSpace:"nowrap"}}>{fmt(p.price)}</p>
                <p style={{fontSize:13,fontWeight:700,color:synced>p.price?V.green:V.amber,margin:0,whiteSpace:"nowrap"}}>{fmt(synced)}</p>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
