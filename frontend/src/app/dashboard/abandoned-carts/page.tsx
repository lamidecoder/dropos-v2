"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { ShoppingCart, Send, DollarSign, Clock, Zap, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B" };
const fmt = (n:number) => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);

export default function AbandonedCartsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card: isDark?"#181230":"#fff", border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text: isDark?"#F0ECFF":"#130D2E", muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint: isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
  };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["abandoned-carts", storeId],
    queryFn: () => api.get(`/abandoned-carts/${storeId}`).then(r => r.data.data || []),
    enabled: !!storeId,
  });

  const recoverMut = useMutation({
    mutationFn: (id: string) => api.post(`/abandoned-carts/${id}/recover`, { storeId }),
    onSuccess: () => { toast.success("Recovery email sent!"); qc.invalidateQueries({queryKey:["abandoned-carts"]}); },
    onError: () => toast.error("Failed to send"),
  });

  const carts = data || [];
  const totalValue = carts.reduce((a:number,c:any) => a+(c.total||c.value||0), 0);
  const recovered  = carts.filter((c:any) => c.recovered||c.status==="recovered").length;

  return (
    <div style={{maxWidth:900,margin:"0 auto"}}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:t.text,marginBottom:4}}>Abandoned Carts</h1>
        <p style={{fontSize:13,color:t.muted}}>{carts.length} carts · {fmt(totalValue)} at risk · {recovered} recovered</p>
      </motion.div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        {[
          {label:"Abandoned",   value:carts.length,            color:V.amber, icon:ShoppingCart},
          {label:"Value at Risk",value:fmt(totalValue),         color:V.v400,  icon:DollarSign },
          {label:"Recovered",   value:recovered,               color:V.green, icon:Zap        },
        ].map((s,i)=>(
          <motion.div key={s.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            style={{padding:16,borderRadius:16,background:t.card,border:`1px solid ${t.border}`}}>
            <div style={{width:32,height:32,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:`${s.color}15`,marginBottom:10}}>
              <s.icon size={14} color={s.color}/>
            </div>
            <p style={{fontSize:20,fontWeight:900,color:t.text,margin:"0 0 2px"}}>{s.value}</p>
            <p style={{fontSize:12,color:t.muted,margin:0}}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {isLoading ? (
        <div style={{textAlign:"center",padding:"60px 0",color:t.muted}}>Loading...</div>
      ) : carts.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px 20px",borderRadius:16,background:t.faint,border:`1px solid ${t.border}`}}>
          <ShoppingCart size={36} style={{color:t.muted,margin:"0 auto 12px"}}/>
          <p style={{fontWeight:700,fontSize:15,color:t.text,margin:"0 0 6px"}}>No abandoned carts</p>
          <p style={{fontSize:13,color:t.muted,margin:0}}>When customers leave without checking out, they appear here and KIRO auto-sends recovery emails.</p>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {carts.map((c:any,i:number)=>(
            <motion.div key={c.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
              style={{display:"flex",alignItems:"center",gap:14,padding:16,borderRadius:16,background:t.card,border:`1px solid ${t.border}`}}>
              <div style={{width:40,height:40,borderRadius:12,background:`${V.amber}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <ShoppingCart size={16} color={V.amber}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:600,color:t.text,margin:"0 0 3px"}}>{c.customerEmail||c.email||"Anonymous"}</p>
                <p style={{fontSize:12,color:t.muted,margin:0,display:"flex",alignItems:"center",gap:6}}>
                  <Clock size={10}/> {new Date(c.createdAt||c.abandonedAt).toLocaleDateString()} · {c.items?.length||c.itemCount||1} item{(c.items?.length||c.itemCount||1)!==1?"s":""}
                </p>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <p style={{fontSize:14,fontWeight:700,color:t.text,margin:"0 0 4px"}}>{fmt(c.total||c.value||0)}</p>
                {c.recovered||c.status==="recovered" ? (
                  <span style={{fontSize:11,fontWeight:700,color:V.green,background:"rgba(16,185,129,0.1)",padding:"2px 8px",borderRadius:99}}>Recovered</span>
                ) : (
                  <button onClick={()=>recoverMut.mutate(c.id)} disabled={recoverMut.isPending}
                    style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:8,background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:"pointer",color:"#fff",fontSize:12,fontWeight:600}}>
                    <Send size={10}/> Recover
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
