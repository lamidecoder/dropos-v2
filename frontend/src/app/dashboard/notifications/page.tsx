"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Bell,Check,Zap,Package,ShoppingCart,AlertTriangle,TrendingUp,Settings}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444",fuchsia:"#C026D3"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const NI={order:ShoppingCart,product:Package,kiro:Zap,alert:AlertTriangle,revenue:TrendingUp};
const NC={order:V.cyan,product:V.v400,kiro:V.v400,alert:V.red,revenue:V.green};
export default function NotificationsPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const qc=useQueryClient();const userId=useAuthStore(s=>s.user?.id);
  const[filter,setFilter]=useState("all");const[prefs,setPrefs]=useState({orders:true,kiro:true,marketing:false,security:true,product:true});
  const{data,isLoading}=useQuery({queryKey:["notifications",userId],queryFn:()=>api.get(`/notifications/${userId}`).then(r=>r.data.data),enabled:!!userId,refetchInterval:30000});
  const readMut=useMutation({mutationFn:(id)=>api.patch(`/notifications/${userId}/${id}/read`,{}),onSuccess:()=>qc.invalidateQueries({queryKey:["notifications"]})});
  const readAllMut=useMutation({mutationFn:()=>api.patch(`/notifications/${userId}/read-all`,{}),onSuccess:()=>{toast.success("All marked as read");qc.invalidateQueries({queryKey:["notifications"]});}});
  const notifs=data||[];const filtered=notifs.filter(n=>filter==="all"?true:filter==="unread"?!n.read:n.type===filter);const unread=notifs.filter(n=>!n.read).length;
  return(<div className="max-w-4xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6">
      <div><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Notifications</h1><p className="text-xs sm:text-sm mt-1" style={{color:unread>0?V.v400:t.muted}}>{unread>0?`${unread} unread`:"You are all caught up"}</p></div>
      {unread>0&&<button onClick={()=>readAllMut.mutate()} className="text-xs font-semibold px-3 py-2 rounded-xl" style={{border:`1px solid ${t.border}`,color:t.muted}}>Mark all read</button>}
    </motion.div>
    <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{scrollbarWidth:"none"}}>{["all","unread","order","kiro","alert"].map(f=>(<button key={f} onClick={()=>setFilter(f)} className="px-3 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap flex-shrink-0" style={{background:filter===f?V.v500:t.card,color:filter===f?"#fff":t.muted,border:`1px solid ${filter===f?V.v500:t.border}`}}>{f==="kiro"?"KIRO":f}</button>))}</div>
    <div className="p-5 rounded-2xl mb-5" style={{background:t.card,border:`1px solid ${t.border}`}}>
      <h3 className="font-bold text-sm mb-4 flex items-center gap-2" style={{color:t.text}}><Settings size={14} style={{color:t.muted}}/>Preferences</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{Object.entries(prefs).map(([k,val])=>(<div key={k} className="flex items-center justify-between"><span className="text-xs font-semibold capitalize" style={{color:t.muted}}>{k==="kiro"?"KIRO Alerts":k}</span><button onClick={()=>setPrefs(p=>({...p,[k]:!val}))} style={{width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",position:"relative",background:val?V.v500:"rgba(128,128,128,0.2)",transition:"all 0.2s"}}><div style={{position:"absolute",top:2,left:val?18:2,width:16,height:16,borderRadius:"50%",background:"white",transition:"left 0.2s"}}/></button></div>))}</div>
    </div>
    {notifs.length===0?(
      <div className="rounded-2xl flex flex-col items-center justify-center py-20 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}><Bell size={36} style={{color:t.muted,opacity:0.3,marginBottom:14}}/><p className="font-bold text-sm mb-2" style={{color:t.text}}>No notifications</p><p className="text-xs" style={{color:t.muted}}>New orders, KIRO alerts, and updates appear here.</p></div>
    ):(
      <div className="space-y-2">{filtered.map((n,i)=>{const Icon=NI[n.type]||Bell;const color=NC[n.type]||t.muted;return(<motion.div key={n.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}} className="flex items-start gap-3 p-4 rounded-2xl cursor-pointer hover:opacity-90 transition-all" style={{background:!n.read?(isDark?"rgba(107,53,232,0.06)":"rgba(107,53,232,0.03)"):t.card,border:`1px solid ${!n.read?"rgba(107,53,232,0.15)":t.border}`}} onClick={()=>!n.read&&readMut.mutate(n.id)}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${color}15`}}><Icon size={14} style={{color}}/></div>
        <div className="flex-1 min-w-0"><p className="text-sm font-semibold" style={{color:t.text}}>{n.title}</p><p className="text-xs mt-0.5" style={{color:t.muted}}>{n.message}</p></div>
        {!n.read&&<div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{background:V.v500}}/>}
      </motion.div>);})}
      </div>
    )}
  </div>);
}