"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{TrendingUp,Search,RefreshCw,Package}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

export default function ProductsIntelPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);
  const[kw,setKw]=useState("");const[winners,setWinners]=useState([]);
  const find=useMutation({mutationFn:()=>api.post("/intel/product-winners",{keyword:kw,storeId}),onSuccess:r=>setWinners(r.data.data||[]),onError:()=>{setWinners([{name:"LED Face Mask",margin:72,trend:"+340%",demand:"Very High",competition:"Low",score:94,price:25000},{name:"Collagen Gummies",margin:68,trend:"+280%",demand:"High",competition:"Low",score:91,price:18000},{name:"Posture Corrector",margin:74,trend:"+140%",demand:"High",competition:"Medium",score:82,price:12000}]);toast("Demo results - connect backend for live data",{icon:"✨"});}});
  const DC={"Very High":V.green,"High":V.cyan,"Medium":V.amber,"Low":V.red};
  const fmt=n=>new Intl.NumberFormat("en",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);
  return(<div className="max-w-5xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-6">
      <div className="flex items-center gap-2 mb-1"><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Product Intelligence</h1><span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:"rgba(107,53,232,0.12)",color:V.v300,border:"1px solid rgba(107,53,232,0.2)"}}>AI</span></div>
      <p className="text-xs sm:text-sm" style={{color:t.muted}}>Find winning products before they go mainstream</p>
    </motion.div>
    <div className="flex gap-3 mb-5"><input style={{...inp(t),flex:1}} value={kw} onChange={e=>setKw(e.target.value)} placeholder="Search niches, products, or categories..."/><button onClick={()=>find.mutate()} disabled={find.isPending} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0 disabled:opacity-50" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}>{find.isPending?<RefreshCw size={13} className="animate-spin"/>:<Search size={13}/>}Find Winners</button></div>
    {winners.length>0?(<div className="space-y-3">{winners.map((p,i)=>(<motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}} className="flex items-center gap-4 p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${i===0?V.v400:t.border}`,boxShadow:i===0?"0 0 0 3px rgba(107,53,232,0.08)":"none"}}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0" style={{background:i===0?"rgba(107,53,232,0.15)":t.faint,color:i===0?V.v400:t.muted}}>#{i+1}</div>
      <div className="flex-1 min-w-0"><p className="text-sm font-bold" style={{color:t.text}}>{p.name}</p><div className="flex flex-wrap items-center gap-3 mt-0.5"><span className="text-xs font-semibold" style={{color:V.green}}>{p.trend} trend</span><span className="text-xs" style={{color:DC[p.demand]||t.muted}}>Demand: {p.demand}</span><span className="text-xs" style={{color:p.competition==="Low"?V.green:V.amber}}>Competition: {p.competition}</span></div></div>
      <div className="flex items-center gap-4 flex-shrink-0"><div className="text-center"><p className="text-sm font-black" style={{color:V.green}}>{p.margin}%</p><p className="text-[10px]" style={{color:t.muted}}>margin</p></div><div className="text-center"><p className="text-sm font-black" style={{color:i===0?V.v400:t.text}}>{p.score}</p><p className="text-[10px]" style={{color:t.muted}}>score</p></div><Link href="/dashboard/import"><button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}><Package size={11}/>Import</button></Link></div>
    </motion.div>))}</div>):(
      <div className="rounded-2xl flex flex-col items-center justify-center py-20 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}><TrendingUp size={36} style={{color:t.muted,opacity:0.3,marginBottom:14}}/><p className="font-bold text-sm mb-2" style={{color:t.text}}>Search for winning products</p><p className="text-xs" style={{color:t.muted}}>Type any niche or category to find high-margin, trending products before your competitors.</p></div>
    )}
  </div>);
}