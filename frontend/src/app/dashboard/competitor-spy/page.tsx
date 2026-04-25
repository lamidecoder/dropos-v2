"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Eye,Search,RefreshCw,AlertCircle}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const DEMO={products:47,avgPrice:18500,topCategory:"Fashion",estimatedRevenue:"2.4M/mo",strengths:["Strong product photos","Daily posting","Fast response time"],weaknesses:["No abandoned cart recovery","No reviews displayed","Slow checkout"]};
export default function CompetitorSpyPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);
  const[url,setUrl]=useState("");const[result,setResult]=useState(null);
  const spy=useMutation({mutationFn:()=>api.post("/intel/competitor-spy",{storeUrl:url,storeId}),onSuccess:r=>{setResult(r.data.data);toast.success("Analysis complete");},onError:()=>{setResult(DEMO);toast("Demo shown - connect backend for real data",{icon:"✨"});}});
  const d=result||DEMO;
  return(<div className="max-w-4xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-6">
      <div className="flex items-center gap-2 mb-1"><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Competitor Spy</h1><span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:"rgba(107,53,232,0.12)",color:V.v300,border:"1px solid rgba(107,53,232,0.2)"}}>KIRO</span></div>
      <p className="text-xs sm:text-sm" style={{color:t.muted}}>Analyse any competitor store. See their products, pricing, and gaps you can exploit.</p>
    </motion.div>
    <div className="p-5 rounded-2xl mb-5" style={{background:t.card,border:`1px solid ${t.border}`}}>
      <label className="block text-xs font-semibold mb-2" style={{color:t.muted}}>Competitor Store URL</label>
      <div className="flex gap-3"><input style={{...inp(t),flex:1}} value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://competitor-store.com"/><button onClick={()=>spy.mutate()} disabled={!url||spy.isPending} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0 disabled:opacity-50" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}>{spy.isPending?<><RefreshCw size={13} className="animate-spin"/>Analysing</>:<><Eye size={13}/>Spy</>}</button></div>
    </div>
    {(result||spy.isError)&&(<motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="space-y-4">
      {!result&&<div className="flex items-center gap-2 p-3 rounded-xl" style={{background:"rgba(107,53,232,0.06)",border:"1px solid rgba(107,53,232,0.15)"}}><AlertCircle size={13} style={{color:V.v400}}/><p className="text-xs" style={{color:t.muted}}>Sample analysis. Enter a real URL to spy on an actual competitor.</p></div>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[{l:"Products",v:d.products,c:V.v400},{l:"Avg Price",v:`₦${(d.avgPrice||0).toLocaleString()}`,c:V.cyan},{l:"Top Category",v:d.topCategory,c:V.green},{l:"Est. Revenue",v:`₦${d.estimatedRevenue}`,c:V.amber}].map(s=>(<div key={s.l} className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}><p className="text-lg font-black mb-0.5 truncate" style={{color:s.c}}>{s.v}</p><p className="text-xs" style={{color:t.muted}}>{s.l}</p></div>))}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}><h3 className="font-bold text-sm mb-3" style={{color:V.green}}>Their Strengths</h3><div className="space-y-2">{(d.strengths||[]).map((s,i)=>(<div key={i} className="flex items-center gap-2 text-xs" style={{color:t.muted}}><div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:V.green}}/>{s}</div>))}</div></div>
        <div className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}><h3 className="font-bold text-sm mb-3" style={{color:V.amber}}>Gaps to Exploit</h3><div className="space-y-2">{(d.weaknesses||[]).map((s,i)=>(<div key={i} className="flex items-center gap-2 text-xs" style={{color:t.muted}}><div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:V.amber}}/>{s}</div>))}</div></div>
      </div>
    </motion.div>)}
    {!result&&!spy.isError&&(<div className="rounded-2xl flex flex-col items-center justify-center py-20 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}><Eye size={36} style={{color:t.muted,opacity:0.3,marginBottom:14}}/><p className="font-bold text-sm mb-2" style={{color:t.text}}>Enter a competitor URL</p><p className="text-xs" style={{color:t.muted}}>KIRO will analyse their products, pricing strategy, and weaknesses.</p></div>)}
  </div>);
}