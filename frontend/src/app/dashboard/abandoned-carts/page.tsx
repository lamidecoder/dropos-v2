"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{ShoppingCart,Zap,Mail,RefreshCw,TrendingUp,DollarSign,Check}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444",fuchsia:"#C026D3"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const fmt=n=>new Intl.NumberFormat("en",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);
export default function AbandonedCartsPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);
  const{data,isLoading}=useQuery({queryKey:["abandoned-carts",storeId],queryFn:()=>api.get(`/abandoned-carts/${storeId}`).then(r=>r.data.data),enabled:!!storeId});
  const recMut=useMutation({mutationFn:(id)=>api.post(`/abandoned-carts/${storeId}/${id}/recover`,{}),onSuccess:()=>toast.success("Recovery email sent!"),onError:()=>toast.error("Backend offline")});
  const carts=data?.carts||data||[];const total=carts.reduce((a,c)=>a+(c.total||0),0);const recovered=carts.filter(c=>c.recovered).length;
  return(<div className="max-w-5xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-start justify-between gap-4 mb-6">
      <div><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Abandoned Carts</h1><p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Recover lost revenue with automated follow-ups</p></div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{background:"rgba(107,53,232,0.1)",color:V.v300,border:"1px solid rgba(107,53,232,0.2)"}}><Zap size={12}/>KIRO auto-recovers at 30 min, 2 hrs, 24 hrs</div>
    </motion.div>
    <div className="grid grid-cols-3 gap-3 mb-5">{[{l:"Abandoned",v:carts.length,c:V.amber,i:ShoppingCart},{l:"Lost Revenue",v:fmt(total),c:V.red,i:DollarSign},{l:"Recovered",v:recovered,c:V.green,i:RefreshCw}].map(s=>(<div key={s.l} className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}><div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{background:`${s.c}15`}}><s.i size={14} style={{color:s.c}}/></div><p className="text-xl font-black mb-0.5" style={{color:t.text}}>{s.v}</p><p className="text-xs" style={{color:t.muted}}>{s.l}</p></div>))}</div>
    {carts.length===0?(
      <div className="rounded-2xl flex flex-col items-center justify-center py-20 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}><ShoppingCart size={36} style={{color:V.cyan,opacity:0.3,marginBottom:14}}/><p className="font-bold text-sm mb-2" style={{color:t.text}}>No abandoned carts</p><p className="text-xs" style={{color:t.muted,maxWidth:320,lineHeight:1.6}}>When customers add items but do not complete checkout, they appear here. KIRO sends recovery emails automatically.</p></div>
    ):(
      <div className="space-y-3">{carts.map((cart,i)=>(<motion.div key={cart.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="flex items-center gap-4 p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <div className="flex-1 min-w-0"><p className="font-semibold text-sm" style={{color:t.text}}>{cart.customerEmail||"Anonymous"}</p><p className="text-xs mt-0.5" style={{color:t.muted}}>{cart.items?.length||0} items · {fmt(cart.total||0)} · {new Date(cart.createdAt).toLocaleDateString("en",{day:"numeric",month:"short"})}</p></div>
        {cart.recovered?(<span className="text-xs px-3 py-1.5 rounded-full font-semibold flex-shrink-0" style={{background:"rgba(16,185,129,0.1)",color:V.green}}>Recovered</span>):(<button onClick={()=>recMut.mutate(cart.id)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0" style={{background:"rgba(107,53,232,0.1)",color:V.v400,border:"1px solid rgba(107,53,232,0.2)"}}><Mail size={11}/>Send Recovery Email</button>)}
      </motion.div>))}</div>
    )}
  </div>);
}