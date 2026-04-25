"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Play,MousePointer,Zap}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

export default function ReplayPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);const[sel,setSel]=useState(null);
  const{data,isLoading}=useQuery({queryKey:["replay",storeId],queryFn:()=>api.get(`/features/replay/${storeId}`).then(r=>r.data.data),enabled:!!storeId});
  const sessions=data?.sessions||data||[];const stats=data?.stats||{};
  return(<div className="max-w-5xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-6">
      <div className="flex items-center gap-2 mb-1"><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Session Replay</h1><span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:"rgba(107,53,232,0.12)",color:V.v300,border:"1px solid rgba(107,53,232,0.2)"}}>KIRO</span></div>
      <p className="text-xs sm:text-sm" style={{color:t.muted}}>Watch how real customers navigate your store. Spot friction. Fix it.</p>
    </motion.div>
    <div className="grid grid-cols-3 gap-3 mb-5">{[{l:"Sessions",v:stats.totalSessions||sessions.length,c:V.v400},{l:"Avg Duration",v:`${Math.round(stats.avgDuration||0)}s`,c:V.cyan},{l:"Conversion",v:`${(stats.conversionRate||0).toFixed(1)}%`,c:V.green}].map(s=>(<div key={s.l} className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}><p className="text-xl font-black mb-0.5" style={{color:s.c}}>{s.v}</p><p className="text-xs" style={{color:t.muted}}>{s.l}</p></div>))}</div>
    {sessions.length===0?(<div className="rounded-2xl flex flex-col items-center justify-center py-20 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}><Play size={36} style={{color:t.muted,opacity:0.3,marginBottom:14}}/><p className="font-bold text-sm mb-2" style={{color:t.text}}>No sessions recorded yet</p><p className="text-xs mb-4" style={{color:t.muted,maxWidth:280,lineHeight:1.6}}>Once customers visit your store, KIRO records their sessions here. You will see mouse movements, clicks, and drop-off points.</p><div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{background:"rgba(107,53,232,0.06)",border:"1px solid rgba(107,53,232,0.15)",color:V.v300}}><Zap size={11}/>Recordings start automatically once your store has visitors</div></div>):(
      <div className="space-y-3">{sessions.map((s,i)=>(<motion.div key={s.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}} className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer hover:opacity-80 transition-opacity" style={{background:t.card,border:`1px solid ${t.border}`}} onClick={()=>setSel(s)}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"rgba(107,53,232,0.08)"}}><MousePointer size={14} style={{color:V.v400}}/></div>
        <div className="flex-1 min-w-0"><p className="text-sm font-semibold" style={{color:t.text}}>Session {s.id?.slice(-6)}</p><p className="text-xs mt-0.5" style={{color:t.muted}}>{s.pageViews||0} pages · {s.duration||0}s · {s.device||"Desktop"}</p></div>
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0" style={{background:s.converted?"rgba(16,185,129,0.12)":t.faint,color:s.converted?V.green:t.muted}}>{s.converted?"Converted":"Browsed"}</span>
        <Play size={13} style={{color:t.muted}}/>
      </motion.div>))}</div>
    )}
  </div>);
}