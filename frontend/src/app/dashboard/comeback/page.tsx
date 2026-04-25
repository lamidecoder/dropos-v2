"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Users,Send,Check}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const fmt=n=>new Intl.NumberFormat("en",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);
export default function ComebackPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);
  const[sent,setSent]=useState(new Set());const[msg,setMsg]=useState({});
  const{data,isLoading}=useQuery({queryKey:["at-risk",storeId],queryFn:()=>api.get(`/features/at-risk/${storeId}`).then(r=>r.data.data),enabled:!!storeId});
  const sendMut=useMutation({mutationFn:({cid,message})=>api.post(`/features/at-risk/${storeId}/send`,{customerId:cid,message}),onSuccess:(_,{cid})=>{setSent(p=>new Set([...p,cid]));toast.success("Message sent");},onError:()=>toast.error("Backend offline")});
  const customers=data||[];
  return(<div className="max-w-5xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-6">
      <div className="flex items-center gap-2 mb-1"><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Win-Back Campaigns</h1><span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:"rgba(107,53,232,0.12)",color:V.v300,border:"1px solid rgba(107,53,232,0.2)"}}>KIRO</span></div>
      <p className="text-xs sm:text-sm" style={{color:t.muted}}>Customers who have not ordered in 30+ days. Send a personal message to bring them back.</p>
    </motion.div>
    <div className="grid grid-cols-3 gap-3 mb-5">{[{l:"At-Risk",v:customers.length,c:V.amber},{l:"Messages Sent",v:sent.size,c:V.green},{l:"Revenue at Risk",v:fmt(customers.reduce((a,c)=>a+(c.totalSpent||0),0)),c:t.text}].map(s=>(<div key={s.l} className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}><p className="text-xl font-black mb-0.5" style={{color:s.c}}>{s.v}</p><p className="text-xs" style={{color:t.muted}}>{s.l}</p></div>))}</div>
    {customers.length===0?(<div className="rounded-2xl flex flex-col items-center justify-center py-20 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}><Users size={36} style={{color:t.muted,opacity:0.3,marginBottom:14}}/><p className="font-bold text-sm mb-2" style={{color:t.text}}>No at-risk customers</p><p className="text-xs" style={{color:t.muted,maxWidth:280,lineHeight:1.6}}>Customers who have not ordered in 30+ days will appear here automatically.</p></div>):(
      <div className="space-y-3">{customers.map((c,i)=>{const isSent=sent.has(c.id);return(<motion.div key={c.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`,opacity:isSent?0.6:1}}>
        <div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}>{(c.name||c.email||"?")[0].toUpperCase()}</div><div className="flex-1 min-w-0"><p className="text-sm font-semibold" style={{color:t.text}}>{c.name||"Customer"}</p><p className="text-xs" style={{color:t.muted}}>Last order {c.daysSinceOrder||"30"}+ days ago · Spent {fmt(c.totalSpent||0)}</p></div>{isSent&&<span className="flex items-center gap-1.5 text-xs font-semibold" style={{color:V.green}}><Check size={12}/>Sent</span>}</div>
        {!isSent&&(<div className="flex gap-2"><input style={{...inp(t),flex:1,fontSize:12}} value={msg[c.id]||""} onChange={e=>setMsg(p=>({...p,[c.id]:e.target.value}))} placeholder={c.suggestedMessage||`Hey ${c.name?.split(" ")[0]||"there"}, we miss you! Here's 10% off your next order.`}/><button onClick={()=>sendMut.mutate({cid:c.id,message:msg[c.id]||c.suggestedMessage})} disabled={sendMut.isPending} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0 disabled:opacity-50" style={{background:V.v500}}><Send size={11}/>Send</button></div>)}
      </motion.div>);})}
    </div>
    )}
  </div>);
}