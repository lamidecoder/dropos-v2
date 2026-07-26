"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Bell, Check, Trash2, Package, ShoppingCart, Users, Zap, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };

const ICONS: Record<string,any> = {
  order: ShoppingCart, product: Package, customer: Users,
  kiro: Zap, alert: AlertCircle, default: Bell,
};

export default function NotificationsPage() {
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
    queryKey: ["notifications", storeId],
    queryFn: () => api.get(`/notifications/${storeId}`).then(r => r.data.data || []),
    enabled: !!storeId,
    refetchInterval: 30000,
  });

  const readMut = useMutation({
    mutationFn: (id:string) => api.patch(`/notifications/${storeId}/${id}`, { read: true }),
    onSuccess: () => qc.invalidateQueries({queryKey:["notifications"]}),
  });

  const readAllMut = useMutation({
    mutationFn: () => api.patch(`/notifications/${storeId}/read-all`, {}),
    onSuccess: () => { toast.success("All marked as read"); qc.invalidateQueries({queryKey:["notifications"]}); },
  });

  const deleteMut = useMutation({
    mutationFn: (id:string) => api.delete(`/notifications/${storeId}/${id}`),
    onSuccess: () => qc.invalidateQueries({queryKey:["notifications"]}),
  });

  const notifs = data || [];
  const unread = notifs.filter((n:any)=>!n.read).length;

  const typeColor = (type:string) => {
    if (type==="order") return V.green;
    if (type==="alert"||type==="error") return V.red;
    if (type==="kiro") return V.v400;
    return V.amber;
  };

  return (
    <div style={{maxWidth:700,margin:"0 auto"}}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:t.text,margin:"0 0 4px"}}>Notifications</h1>
          <p style={{fontSize:13,color:t.muted,margin:0}}>{unread > 0 ? `${unread} unread` : "All caught up"}</p>
        </div>
        {unread > 0 && (
          <button onClick={()=>readAllMut.mutate()} style={{fontSize:12,fontWeight:600,padding:"7px 14px",borderRadius:10,border:`1px solid ${t.border}`,background:t.faint,cursor:"pointer",color:t.muted}}>
            Mark all read
          </button>
        )}
      </motion.div>

      {isLoading ? (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {Array.from({length:5}).map((_,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:14,borderRadius:14,background:t.card,border:`1px solid ${t.border}`,animation:"pulse 1.5s ease-in-out infinite",animationDelay:`${i*0.08}s`}}>
              <div style={{width:36,height:36,borderRadius:10,background:t.faint,flexShrink:0}}/>
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
                <div style={{height:12,borderRadius:5,background:t.faint,width:"60%"}}/>
                <div style={{height:10,borderRadius:5,background:t.faint,width:"80%"}}/>
                <div style={{height:9,borderRadius:5,background:t.faint,width:"30%"}}/>
              </div>
            </div>
          ))}
          <style>{"@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}"}</style>
        </div>
      ) : notifs.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px 20px",borderRadius:16,background:t.faint,border:`1px solid ${t.border}`}}>
          <Bell size={36} style={{color:t.muted,margin:"0 auto 12px"}}/>
          <p style={{fontWeight:700,fontSize:15,color:t.text,margin:"0 0 6px"}}>You're all caught up 🎉</p>
          <p style={{fontSize:13,color:t.muted,margin:0}}>New orders, low stock alerts, and KIRO insights will appear here.</p>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {notifs.map((n:any,i:number)=>{
            const Icon = ICONS[n.type]||ICONS.default;
            const color = typeColor(n.type);
            return (
              <motion.div key={n.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
                style={{display:"flex",alignItems:"flex-start",gap:12,padding:14,borderRadius:14,background:n.read?t.faint:t.card,border:`1px solid ${n.read?t.border:color+"30"}`,cursor:"pointer"}}
                onClick={()=>!n.read&&readMut.mutate(n.id)}>
                <div style={{width:36,height:36,borderRadius:10,background:`${color}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Icon size={15} color={color}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <p style={{fontSize:13,fontWeight:n.read?500:700,color:t.text,margin:0}}>{n.title||n.message}</p>
                    {!n.read&&<div style={{width:7,height:7,borderRadius:"50%",background:color,flexShrink:0}}/>}
                  </div>
                  {n.body&&<p style={{fontSize:12,color:t.muted,margin:"0 0 4px",lineHeight:1.45}}>{n.body}</p>}
                  <p style={{fontSize:11,color:t.muted,margin:0}}>{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={e=>{e.stopPropagation();deleteMut.mutate(n.id);}}
                  style={{width:28,height:28,borderRadius:8,border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,opacity:0.4}}>
                  <Trash2 size={12} color={t.muted}/>
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
