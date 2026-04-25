"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{BarChart2,Package,AlertCircle}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const GC={A:V.green,B:V.cyan,C:V.amber,D:"#F97316",F:V.red};
const GB={A:"rgba(16,185,129,0.12)",B:"rgba(6,182,212,0.12)",C:"rgba(245,158,11,0.12)",D:"rgba(249,115,22,0.12)",F:"rgba(239,68,68,0.12)"};
const fmt=n=>new Intl.NumberFormat("en",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);
export default function GraderPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);
  const{data,isLoading}=useQuery({queryKey:["grades",storeId],queryFn:()=>api.get(`/features/product-grades/${storeId}`).then(r=>r.data.data),enabled:!!storeId});
  const grades=data||[];const failing=grades.filter(g=>g.grade==="F"||g.grade==="D").length;
  return(<div className="max-w-5xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-start justify-between gap-4 mb-6">
      <div><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Product Grader</h1><p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>KIRO scores every product by profit potential, competition, and demand</p></div>
      {failing>0&&<div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{background:"rgba(239,68,68,0.08)",color:V.red,border:"1px solid rgba(239,68,68,0.2)"}}><AlertCircle size={12}/>{failing} failing</div>}
    </motion.div>
    <div className="grid grid-cols-5 gap-2 mb-5">{["A","B","C","D","F"].map(g=>(<div key={g} className="p-3 rounded-2xl text-center" style={{background:t.card,border:`1px solid ${t.border}`}}><p className="text-2xl font-black mb-0.5" style={{color:GC[g]}}>{grades.filter(x=>x.grade===g).length}</p><p className="text-xs font-bold" style={{color:GC[g]}}>Grade {g}</p></div>))}</div>
    {isLoading?Array.from({length:4}).map((_,i)=><div key={i} className="h-16 rounded-2xl mb-3 animate-pulse" style={{background:t.card}}/>):grades.length===0?(
      <div className="rounded-2xl flex flex-col items-center justify-center py-20 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}><BarChart2 size={36} style={{color:t.muted,opacity:0.3,marginBottom:14}}/><p className="font-bold text-sm mb-2" style={{color:t.text}}>No products graded yet</p><p className="text-xs mb-4" style={{color:t.muted,maxWidth:280,lineHeight:1.6}}>Add products to your store and KIRO will automatically grade them on profit potential, competition, and demand.</p><Link href="/dashboard/products" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}><Package size={12}/>Add Products</Link></div>
    ):(
      <div className="space-y-3">{grades.sort((a,b)=>(b.score||0)-(a.score||0)).map((g,i)=>(<motion.div key={g.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}} className="flex items-center gap-4 p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0" style={{background:GB[g.grade]||t.faint,color:GC[g.grade]||t.muted}}>{g.grade}</div>
        <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate" style={{color:t.text}}>{g.name||g.product?.name}</p><div className="flex flex-wrap items-center gap-3 mt-0.5"><span className="text-xs" style={{color:t.muted}}>Score: <span style={{color:GC[g.grade],fontWeight:700}}>{g.score}/100</span></span>{g.margin!==undefined&&<span className="text-xs" style={{color:t.muted}}>Margin: <span style={{color:V.green,fontWeight:700}}>{g.margin}%</span></span>}{g.competition&&<span className="text-xs" style={{color:g.competition==="Low"?V.green:V.amber,fontWeight:600}}>{g.competition} competition</span>}</div></div>
        {g.price&&<p className="text-sm font-black flex-shrink-0" style={{color:t.text}}>{fmt(g.price)}</p>}
      </motion.div>))}</div>
    )}
  </div>);
}