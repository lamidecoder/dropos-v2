"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{TrendingUp,Zap,Package,RefreshCw}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444",fuchsia:"#C026D3"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const DEMO=[{id:"1",name:"LED Face Mask",margin:72,trend:"+340%",price:25000,competition:"Low",score:94,niche:"Beauty"},{id:"2",name:"Collagen Gummies",margin:68,trend:"+280%",price:18000,competition:"Low",score:91,niche:"Health"},{id:"3",name:"Waist Trainer Pro",margin:65,trend:"+195%",price:15000,competition:"Med",score:87,niche:"Fitness"},{id:"4",name:"Mini Projector",margin:61,trend:"+160%",price:45000,competition:"Low",score:84,niche:"Tech"},{id:"5",name:"Posture Corrector",margin:74,trend:"+140%",price:12000,competition:"Low",score:82,niche:"Health"}];
const fmt=n=>new Intl.NumberFormat("en",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);
export default function TopProductsPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const[niche,setNiche]=useState("all");const[refreshed,setRefreshed]=useState(false);
  const{data,isLoading,refetch}=useQuery({queryKey:["top-products",niche],queryFn:()=>api.get(`/intelligence/top-products?niche=${niche}`).then(r=>r.data.data)});
  const products=data||DEMO;const isDemo=!data;
  const refresh=async()=>{await refetch();setRefreshed(true);setTimeout(()=>setRefreshed(false),2000);};
  return(<div className="max-w-5xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-start justify-between gap-4 mb-6">
      <div><div className="flex items-center gap-2 mb-1"><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Daily Top 10</h1>{isDemo&&<span className="text-xs px-2 py-0.5 rounded-full" style={{background:t.faint,color:t.muted}}>Demo</span>}</div><p className="text-xs sm:text-sm" style={{color:t.muted}}>KIRO-curated winning products updated every morning</p></div>
      <div className="flex gap-2">
        <button onClick={refresh} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{border:`1px solid ${t.border}`,color:t.muted,background:t.card}}><RefreshCw size={12} className={refreshed?"animate-spin":""}/>Refresh</button>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{background:"rgba(107,53,232,0.1)",color:V.v300,border:"1px solid rgba(107,53,232,0.2)"}}><Zap size={12}/>Updated at 6am daily</div>
      </div>
    </motion.div>
    <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{scrollbarWidth:"none"}}>{["all","Fashion","Beauty","Health","Tech","Food","Home","Fitness"].map(n=>(<button key={n} onClick={()=>setNiche(n.toLowerCase())} className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0" style={{background:niche===n.toLowerCase()?V.v500:t.card,color:niche===n.toLowerCase()?"#fff":t.muted,border:`1px solid ${niche===n.toLowerCase()?V.v500:t.border}`}}>{n==="all"?"All Niches":n}</button>))}</div>
    <div className="space-y-3">{products.map((p,i)=>(<motion.div key={p.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}} className="flex items-center gap-4 p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${i===0?V.v400:t.border}`,boxShadow:i===0?"0 0 0 3px rgba(107,53,232,0.08)":"none"}}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0" style={{background:i===0?"rgba(107,53,232,0.15)":t.faint,color:i===0?V.v400:t.muted}}>#{i+1}</div>
      <div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-0.5"><p className="font-bold text-sm" style={{color:t.text}}>{p.name}</p><span className="text-[10px] px-2 py-0.5 rounded-full" style={{background:t.faint,color:t.muted}}>{p.niche}</span></div><div className="flex items-center gap-3 text-xs" style={{color:t.muted}}><span style={{color:V.green}}>{p.trend} trending</span><span>{fmt(p.price)} sell price</span><span style={{color:p.competition==="Low"?V.green:V.amber}}>{p.competition} competition</span></div></div>
      <div className="text-right flex-shrink-0"><div className="text-lg font-black mb-0.5" style={{color:V.green}}>{p.margin}%</div><div className="text-[10px]" style={{color:t.muted}}>margin</div></div>
      <div className="flex flex-col items-center flex-shrink-0"><div className="text-lg font-black" style={{color:i===0?V.v400:t.text}}>{p.score}</div><div className="text-[10px]" style={{color:t.muted}}>score</div></div>
      <Link href="/dashboard/import"><button className="p-2.5 rounded-xl transition-all hover:opacity-80 flex-shrink-0" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,color:"#fff"}}><Package size={14}/></button></Link>
    </motion.div>))}</div>
  </div>);
}