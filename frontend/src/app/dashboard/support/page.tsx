"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{MessageSquare,ChevronRight,Zap,AlertCircle}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444",fuchsia:"#C026D3"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const PR={HIGH:{color:V.red,bg:"rgba(239,68,68,0.1)"},MEDIUM:{color:V.amber,bg:"rgba(245,158,11,0.1)"},LOW:{color:V.green,bg:"rgba(16,185,129,0.1)"}};
export default function SupportPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);const[tab,setTab]=useState("open");const[search,setSearch]=useState("");
  const{data,isLoading}=useQuery({queryKey:["tickets",storeId,tab],queryFn:()=>api.get(`/support/${storeId}/tickets?status=${tab}`).then(r=>r.data.data),enabled:!!storeId});
  const tickets=data||[];
  return(<div className="max-w-4xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6">
      <div><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Support</h1><p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Customer support tickets. KIRO answers 80% automatically.</p></div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{background:"rgba(107,53,232,0.1)",color:V.v300,border:"1px solid rgba(107,53,232,0.2)"}}><Zap size={12}/>KIRO handles first response</div>
    </motion.div>
    <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{background:t.faint,border:`1px solid ${t.border}`,width:"fit-content"}}>{["open","resolved","all"].map(tb=>(<button key={tb} onClick={()=>setTab(tb)} className="px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all" style={{background:tab===tb?t.card:"transparent",color:tab===tb?t.text:t.muted,boxShadow:tab===tb?"0 1px 3px rgba(0,0,0,0.1)":"none"}}>{tb}</button>))}</div>
    {tickets.length===0?(
      <div className="rounded-2xl flex flex-col items-center justify-center py-20 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}><MessageSquare size={36} style={{color:V.v400,opacity:0.3,marginBottom:14}}/><p className="font-bold text-sm mb-2" style={{color:t.text}}>No support tickets</p><p className="text-xs" style={{color:t.muted,maxWidth:300,lineHeight:1.6}}>Customer questions appear here. KIRO automatically handles common queries so you only see the ones that need your attention.</p></div>
    ):(
      <div className="space-y-3">{tickets.map((ticket,i)=>{const pr=PR[ticket.priority]||PR.MEDIUM;return(<motion.div key={ticket.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer hover:opacity-80 transition-all" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <div className="w-2 h-10 rounded-full flex-shrink-0" style={{background:pr.color}}/>
        <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate" style={{color:t.text}}>{ticket.subject}</p><p className="text-xs mt-0.5" style={{color:t.muted}}>{ticket.customerName} · {new Date(ticket.createdAt).toLocaleDateString("en",{day:"numeric",month:"short"})}</p></div>
        <span className="text-xs px-2.5 py-1 rounded-full flex-shrink-0" style={{background:pr.bg,color:pr.color}}>{ticket.priority}</span>
        <ChevronRight size={14} style={{color:t.muted}}/>
      </motion.div>);})}
      </div>
    )}
  </div>);
}