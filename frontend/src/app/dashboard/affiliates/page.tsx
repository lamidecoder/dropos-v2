"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Users,Plus,Copy,Check,TrendingUp,DollarSign,Zap}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444",fuchsia:"#C026D3"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const fmt=n=>new Intl.NumberFormat("en",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);
export default function AffiliatesPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);const[copied,setCopied]=useState("");
  const{data}=useQuery({queryKey:["affiliates",storeId],queryFn:()=>api.get(`/affiliates/${storeId}`).then(r=>r.data.data),enabled:!!storeId});
  const affiliates=data?.affiliates||[];const total=affiliates.reduce((a,af)=>a+(af.totalEarned||0),0);
  const copyLink=(code)=>{navigator.clipboard.writeText(`https://droposhq.com/store/${storeId}?ref=${code}`);setCopied(code);setTimeout(()=>setCopied(""),2000);};
  return(<div className="max-w-4xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6">
      <div><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Affiliates</h1><p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Turn your customers into a sales team</p></div>
      <button className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}><Plus size={14}/>Invite Affiliate</button>
    </motion.div>
    <div className="grid grid-cols-3 gap-3 mb-5">{[{l:"Total Affiliates",v:affiliates.length,c:V.v400,i:Users},{l:"Total Commissions",v:fmt(total),c:V.green,i:DollarSign},{l:"Default Rate",v:"10%",c:V.cyan,i:TrendingUp}].map(s=>(<div key={s.l} className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}><div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{background:`${s.c}15`}}><s.i size={14} style={{color:s.c}}/></div><p className="text-xl font-black mb-0.5" style={{color:t.text}}>{s.v}</p><p className="text-xs" style={{color:t.muted}}>{s.l}</p></div>))}</div>
    {affiliates.length===0?(
      <div className="rounded-2xl flex flex-col items-center justify-center py-20 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}><Users size={36} style={{color:V.v400,opacity:0.3,marginBottom:14}}/><p className="font-bold text-sm mb-2" style={{color:t.text}}>No affiliates yet</p><p className="text-xs mb-5" style={{color:t.muted,maxWidth:300,lineHeight:1.6}}>Invite customers and influencers to promote your store. They earn commission, you get sales.</p><div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{background:"rgba(107,53,232,0.08)",border:"1px solid rgba(107,53,232,0.2)",color:V.v300}}><Zap size={12}/>KIRO can find influencers in your niche</div></div>
    ):(
      <div className="space-y-3">{affiliates.map((af,i)=>(<motion.div key={af.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.05}} className="flex items-center gap-4 p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0" style={{background:V.v500}}>{af.name?.[0]||"?"}</div>
        <div className="flex-1 min-w-0"><p className="font-semibold text-sm" style={{color:t.text}}>{af.name}</p><p className="text-xs" style={{color:t.muted}}>{af.sales||0} sales · {fmt(af.totalEarned||0)} earned</p></div>
        <button onClick={()=>copyLink(af.code)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs flex-shrink-0" style={{border:`1px solid ${t.border}`,color:copied===af.code?V.green:t.muted}}>{copied===af.code?<Check size={11}/>:<Copy size={11}/>}{af.code}</button>
      </motion.div>))}</div>
    )}
  </div>);
}