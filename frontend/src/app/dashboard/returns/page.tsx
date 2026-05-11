"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { RotateCcw, Check, X, Clock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };
const fmt = (n:number) => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);

const STATUS:Record<string,any> = {
  PENDING:  {label:"Pending",  color:V.amber, bg:"rgba(245,158,11,0.1)" },
  APPROVED: {label:"Approved", color:V.green, bg:"rgba(16,185,129,0.1)"},
  REJECTED: {label:"Rejected", color:V.red,   bg:"rgba(239,68,68,0.1)" },
  COMPLETED:{label:"Completed",color:"#6B7280",bg:"rgba(107,114,128,0.1)"},
};

export default function ReturnsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card: isDark?"#181230":"#fff", border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text: isDark?"#F0ECFF":"#130D2E", muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint: isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
  };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const qc = useQueryClient();
  const [tab, setTab] = useState("PENDING");

  const { data, isLoading } = useQuery({
    queryKey: ["returns", storeId, tab],
    queryFn: () => api.get(`/returns/${storeId}?status=${tab}`).then(r => r.data.data || []),
    enabled: !!storeId,
  });

  const actionMut = useMutation({
    mutationFn: ({id,status}:{id:string;status:string}) => api.patch(`/returns/${storeId}/${id}`, {status}),
    onSuccess: (_,v) => { toast.success(`Return ${v.status.toLowerCase()}`); qc.invalidateQueries({queryKey:["returns"]}); },
  });

  const returns = data || [];

  return (
    <div style={{maxWidth:860,margin:"0 auto"}}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:t.text,margin:"0 0 4px"}}>Returns</h1>
        <p style={{fontSize:13,color:t.muted,margin:0}}>{returns.length} {tab.toLowerCase()} return requests</p>
      </motion.div>

      {/* Tabs */}
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {Object.entries(STATUS).map(([id,cfg])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{padding:"7px 16px",borderRadius:12,border:`1px solid ${tab===id?cfg.color+"40":t.border}`,background:tab===id?cfg.bg:"transparent",cursor:"pointer",color:tab===id?cfg.color:t.muted,fontSize:12,fontWeight:600}}>
            {cfg.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{textAlign:"center",padding:"60px 0",color:t.muted}}>Loading...</div>
      ) : returns.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px 20px",borderRadius:16,background:t.faint,border:`1px solid ${t.border}`}}>
          <RotateCcw size={36} style={{color:t.muted,margin:"0 auto 12px"}}/>
          <p style={{fontWeight:700,fontSize:15,color:t.text,margin:"0 0 6px"}}>No {tab.toLowerCase()} returns</p>
          <p style={{fontSize:13,color:t.muted,margin:0}}>Return requests from customers appear here.</p>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {returns.map((r:any,i:number)=>{
            const cfg = STATUS[r.status]||STATUS.PENDING;
            return (
              <motion.div key={r.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                style={{display:"flex",alignItems:"center",gap:14,padding:16,borderRadius:16,background:t.card,border:`1px solid ${t.border}`}}>
                <div style={{width:40,height:40,borderRadius:12,background:`${cfg.color}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <RotateCcw size={16} color={cfg.color}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:600,color:t.text,margin:"0 0 3px"}}>Order #{r.orderNumber||r.orderId?.slice(-8)}</p>
                  <p style={{fontSize:12,color:t.muted,margin:0}}>{r.reason||"Return requested"} · {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <p style={{fontSize:14,fontWeight:700,color:t.text,flexShrink:0}}>{fmt(r.amount||r.refundAmount||0)}</p>
                {r.status==="PENDING"&&(
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    <button onClick={()=>actionMut.mutate({id:r.id,status:"APPROVED"})}
                      style={{width:30,height:30,borderRadius:8,border:"none",background:"rgba(16,185,129,0.15)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Check size={13} color={V.green}/>
                    </button>
                    <button onClick={()=>actionMut.mutate({id:r.id,status:"REJECTED"})}
                      style={{width:30,height:30,borderRadius:8,border:"none",background:"rgba(239,68,68,0.1)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <X size={13} color={V.red}/>
                    </button>
                  </div>
                )}
                {r.status!=="PENDING"&&(
                  <span style={{fontSize:11,fontWeight:700,color:cfg.color,background:cfg.bg,padding:"3px 10px",borderRadius:99,flexShrink:0}}>{cfg.label}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
