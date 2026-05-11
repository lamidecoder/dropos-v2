"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Star, MessageSquare, Send, Check, X, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{display:"flex",gap:2}}>
      {[1,2,3,4,5].map(i=>(
        <Star key={i} size={13} fill={i<=rating?"#F59E0B":"none"} color={i<=rating?"#F59E0B":"rgba(255,255,255,0.15)"}/>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card: isDark?"#181230":"#fff", border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text: isDark?"#F0ECFF":"#130D2E", muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint: isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
  };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const qc = useQueryClient();
  const [tab, setTab] = [["all","pending","approved"].includes("all") ? "all" : "all", (v:string)=>{}];

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", storeId],
    queryFn: () => api.get(`/reviews/${storeId}`).then(r => r.data.data || []),
    enabled: !!storeId,
  });

  const approveMut = useMutation({
    mutationFn: (id:string) => api.patch(`/reviews/${storeId}/${id}`, { approved: true }),
    onSuccess: () => { toast.success("Review approved"); qc.invalidateQueries({queryKey:["reviews"]}); },
  });
  const rejectMut = useMutation({
    mutationFn: (id:string) => api.delete(`/reviews/${storeId}/${id}`),
    onSuccess: () => { toast.success("Review removed"); qc.invalidateQueries({queryKey:["reviews"]}); },
  });

  const reviews = data || [];
  const avg = reviews.length ? (reviews.reduce((a:number,r:any)=>a+(r.rating||0),0)/reviews.length).toFixed(1) : "—";
  const pending = reviews.filter((r:any)=>!r.approved&&r.approved!==undefined).length;

  return (
    <div style={{maxWidth:860,margin:"0 auto"}}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:t.text,marginBottom:4}}>Reviews</h1>
        <p style={{fontSize:13,color:t.muted}}>{reviews.length} total · {avg}★ average · {pending} pending approval</p>
      </motion.div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        {[
          {label:"Avg Rating", value:`${avg} ★`,   color:V.amber, icon:Star        },
          {label:"Total",      value:reviews.length, color:V.v400,  icon:MessageSquare},
          {label:"Pending",    value:pending,         color:V.green, icon:TrendingUp  },
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
      ) : reviews.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px 20px",borderRadius:16,background:t.faint,border:`1px solid ${t.border}`}}>
          <Star size={36} style={{color:t.muted,margin:"0 auto 12px"}}/>
          <p style={{fontWeight:700,fontSize:15,color:t.text,margin:"0 0 6px"}}>No reviews yet</p>
          <p style={{fontSize:13,color:t.muted,margin:0}}>KIRO automatically requests reviews after delivery. They appear here for moderation.</p>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {reviews.map((r:any,i:number)=>(
            <motion.div key={r.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
              style={{padding:16,borderRadius:16,background:t.card,border:`1px solid ${t.border}`}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                    <Stars rating={r.rating||5}/>
                    <span style={{fontSize:12,fontWeight:600,color:t.muted}}>{r.customerName||"Customer"}</span>
                    <span style={{fontSize:11,color:t.muted}}>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.title&&<p style={{fontSize:13,fontWeight:700,color:t.text,margin:"0 0 4px"}}>{r.title}</p>}
                  <p style={{fontSize:13,color:t.muted,margin:0,lineHeight:1.5}}>{r.body||r.content||r.comment||""}</p>
                  {r.productName&&<p style={{fontSize:11,color:t.muted,marginTop:6}}>on {r.productName}</p>}
                </div>
                {!r.approved && r.approved !== undefined && (
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    <button onClick={()=>approveMut.mutate(r.id)}
                      style={{width:30,height:30,borderRadius:8,border:"none",background:"rgba(16,185,129,0.15)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Check size={13} color={V.green}/>
                    </button>
                    <button onClick={()=>rejectMut.mutate(r.id)}
                      style={{width:30,height:30,borderRadius:8,border:"none",background:"rgba(239,68,68,0.1)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <X size={13} color={V.red}/>
                    </button>
                  </div>
                )}
                {r.approved && (
                  <span style={{fontSize:11,fontWeight:700,color:V.green,background:"rgba(16,185,129,0.1)",padding:"3px 10px",borderRadius:99,flexShrink:0}}>Published</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
