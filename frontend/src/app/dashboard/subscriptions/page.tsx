"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Repeat,Pause,Play,DollarSign,Users}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const ST={ACTIVE:{label:"Active",color:V.green,bg:"rgba(16,185,129,0.12)"},PAUSED:{label:"Paused",color:V.amber,bg:"rgba(245,158,11,0.12)"},CANCELLED:{label:"Cancelled",color:V.red,bg:"rgba(239,68,68,0.12)"}};
const IV={weekly:"Weekly",monthly:"Monthly",quarterly:"Every 3 months"};
const fmt=n=>new Intl.NumberFormat("en",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);
export default function SubscriptionsPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);const qc=useQueryClient();
  const{data,isLoading}=useQuery({queryKey:["subs",storeId],queryFn:()=>api.get(`/product-subscriptions/${storeId}`).then(r=>r.data.data),enabled:!!storeId});
  const upd=useMutation({mutationFn:({id,status})=>api.patch(`/product-subscriptions/${storeId}/${id}`,{status}),onSuccess:()=>{toast.success("Updated");qc.invalidateQueries({queryKey:["subs"]});},onError:()=>toast.error("Backend offline")});
  const subs=data||[];
  const mrr=subs.filter(s=>s.status==="ACTIVE").reduce((a,s)=>a+(s.interval==="monthly"?s.amount:s.interval==="weekly"?s.amount*4:s.amount/3),0);
  return(<div className="max-w-5xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-6">
      <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Subscriptions</h1>
      <p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Recurring product orders from your customers</p>
    </motion.div>
    <div className="grid grid-cols-3 gap-3 mb-5">
      {[{label:"Monthly Recurring",value:fmt(mrr),color:V.green},{label:"Active",value:subs.filter(s=>s.status==="ACTIVE").length,color:t.text},{label:"Total",value:subs.length,color:t.text}].map(s=>(<div key={s.label} className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}><p className="text-xl font-black mb-0.5" style={{color:s.color}}>{s.value}</p><p className="text-xs" style={{color:t.muted}}>{s.label}</p></div>))}
    </div>
    <div className="rounded-2xl overflow-hidden" style={{background:t.card,border:`1px solid ${t.border}`}}>
      {isLoading?Array.from({length:3}).map((_,i)=><div key={i} className="h-16 animate-pulse m-3 rounded-xl" style={{background:t.faint}}/>):subs.length===0?(
        <div className="flex flex-col items-center justify-center py-20 text-center"><Repeat size={36} style={{color:t.muted,opacity:0.3,marginBottom:14}}/><p className="font-bold text-sm mb-1" style={{color:t.text}}>No subscriptions yet</p><p className="text-xs" style={{color:t.muted,maxWidth:280}}>When customers subscribe to recurring products, they appear here</p></div>
      ):(<div className="divide-y" style={{borderColor:t.border}}>{subs.map((sub,i)=>{const s=ST[sub.status]||ST.ACTIVE;return(<div key={sub.id} className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:s.bg}}><Repeat size={14} style={{color:s.color}}/></div>
        <div className="flex-1 min-w-0"><p className="text-sm font-semibold" style={{color:t.text}}>{sub.customerName||sub.customer?.name||"Customer"}</p><p className="text-xs mt-0.5" style={{color:t.muted}}>{sub.product?.name||"Product"} · {IV[sub.interval]||sub.interval} · {fmt(sub.amount)}</p></div>
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0" style={{background:s.bg,color:s.color}}>{s.label}</span>
        {sub.status==="ACTIVE"&&<button onClick={()=>upd.mutate({id:sub.id,status:"PAUSED"})} className="p-2 rounded-lg flex-shrink-0" style={{border:`1px solid ${t.border}`,color:t.muted}}><Pause size={12}/></button>}
        {sub.status==="PAUSED"&&<button onClick={()=>upd.mutate({id:sub.id,status:"ACTIVE"})} className="p-2 rounded-lg flex-shrink-0" style={{border:`1px solid ${t.border}`,color:V.green}}><Play size={12}/></button>}
      </div>);})}
      </div>)}
    </div>
  </div>);
}