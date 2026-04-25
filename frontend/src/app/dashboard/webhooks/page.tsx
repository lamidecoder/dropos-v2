"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Webhook,Plus,Trash2,X,Play,Check,AlertCircle,ExternalLink}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const EVENTS=["order.created","order.paid","order.shipped","order.completed","order.cancelled","product.created","product.updated","customer.created"];
function Modal({storeId,onClose,t,isDark}){
  const qc=useQueryClient();
  const[url,setUrl]=useState("");
  const[events,setEvents]=useState(["order.created","order.paid"]);
  const mut=useMutation({mutationFn:()=>api.post(`/webhooks/${storeId}`,{url,events}),onSuccess:()=>{toast.success("Webhook created");qc.invalidateQueries({queryKey:["webhooks"]});onClose();},onError:(e)=>toast.error(e.response?.data?.message||"Failed")});
  return(<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{background:"rgba(0,0,0,0.65)",backdropFilter:"blur(8px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden" style={{background:isDark?"#181230":"#fff",border:`1px solid ${t.border}`}}>
      <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:`1px solid ${t.border}`}}>
        <h2 className="font-black text-base" style={{color:t.text}}>Add Webhook</h2>
        <button onClick={onClose} style={{color:t.muted}}><X size={17}/></button>
      </div>
      <div className="p-5 space-y-4" style={{maxHeight:"60vh",overflowY:"auto"}}>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Endpoint URL</label>
          <input style={inp(t)} value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://yoursite.com/webhook"/>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-2" style={{color:t.muted}}>Events</label>
          <div className="grid grid-cols-2 gap-1.5">
            {EVENTS.map(ev=>{const on=events.includes(ev);return(<button key={ev} onClick={()=>setEvents(p=>on?p.filter(e=>e!==ev):[...p,ev])} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all" style={{background:on?"rgba(107,53,232,0.12)":t.faint,border:`1px solid ${on?"rgba(107,53,232,0.3)":t.border}`,color:on?V.v300:t.muted}}><div className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0" style={{background:on?V.v500:t.faint,border:`1px solid ${on?V.v500:t.border}`}}>{on&&<Check size={8} color="white" strokeWidth={3}/>}</div>{ev}</button>);})}
          </div>
        </div>
      </div>
      <div className="flex gap-3 px-5 py-4" style={{borderTop:`1px solid ${t.border}`}}>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm" style={{border:`1px solid ${t.border}`,color:t.muted}}>Cancel</button>
        <button onClick={()=>mut.mutate()} disabled={!url||mut.isPending} className="flex-[2] py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}>{mut.isPending?"Creating...":"Create Webhook"}</button>
      </div>
    </motion.div>
  </div>);
}
export default function WebhooksPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);const qc=useQueryClient();
  const[show,setShow]=useState(false);
  const{data,isLoading}=useQuery({queryKey:["webhooks",storeId],queryFn:()=>api.get(`/webhooks/${storeId}`).then(r=>r.data.data),enabled:!!storeId});
  const delMut=useMutation({mutationFn:(id)=>api.delete(`/webhooks/${storeId}/${id}`),onSuccess:()=>{toast.success("Deleted");qc.invalidateQueries({queryKey:["webhooks"]});}});
  const testMut=useMutation({mutationFn:(id)=>api.post(`/webhooks/${storeId}/${id}/test`,{}),onSuccess:()=>toast.success("Test sent"),onError:()=>toast.error("Backend offline")});
  const hooks=data||[];
  return(<div className="max-w-4xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6">
      <div><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Webhooks</h1><p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Real-time notifications for store events</p></div>
      <button onClick={()=>setShow(true)} className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}><Plus size={14}/><span className="hidden sm:inline">Add</span> Webhook</button>
    </motion.div>
    <div className="flex items-center gap-3 p-4 rounded-2xl mb-5" style={{background:"rgba(107,53,232,0.06)",border:"1px solid rgba(107,53,232,0.15)"}}>
      <AlertCircle size={14} style={{color:V.v400,flexShrink:0}}/>
      <p className="text-xs" style={{color:t.muted}}>Webhooks send POST requests to your endpoint when events occur. Your server must return HTTP 200 within 10 seconds.</p>
    </div>
    {hooks.length===0?(<motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="rounded-2xl flex flex-col items-center justify-center py-20 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}>
      <Webhook size={36} style={{color:t.muted,opacity:0.3,marginBottom:14}}/>
      <h3 className="font-bold text-sm mb-2" style={{color:t.text}}>No webhooks yet</h3>
      <p className="text-xs mb-5" style={{color:t.muted,maxWidth:280,lineHeight:1.6}}>Connect your apps and get notified in real-time when orders, products, or customers change.</p>
      <button onClick={()=>setShow(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}><Plus size={13}/>Add Webhook</button>
    </motion.div>):(<div className="space-y-3">
      {hooks.map((wh,i)=>(<motion.div key={wh.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"rgba(107,53,232,0.1)"}}><Webhook size={15} style={{color:V.v400}}/></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{color:t.text}}>{wh.url}</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">{(wh.events||[]).map(ev=>(<span key={ev} className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{background:"rgba(107,53,232,0.08)",color:V.v300,border:"1px solid rgba(107,53,232,0.15)"}}>{ev}</span>))}</div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] px-2 py-1 rounded-full font-semibold" style={{background:wh.active?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",color:wh.active?V.green:V.red}}>{wh.active?"Active":"Inactive"}</span>
            <button onClick={()=>testMut.mutate(wh.id)} className="p-2 rounded-lg" style={{border:`1px solid ${t.border}`,color:t.muted}}><Play size={12}/></button>
            <button onClick={()=>delMut.mutate(wh.id)} className="p-2 rounded-lg" style={{border:`1px solid ${t.border}`,color:V.red}}><Trash2 size={12}/></button>
          </div>
        </div>
      </motion.div>))}
    </div>)}
    <AnimatePresence>{show&&<Modal storeId={storeId} onClose={()=>setShow(false)} t={t} isDark={isDark}/>}</AnimatePresence>
  </div>);
}