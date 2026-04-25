"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{RefreshCw,TrendingUp,TrendingDown,Package,Check}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const fmt=n=>new Intl.NumberFormat("en",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);
export default function PriceSyncPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);
  const[result,setResult]=useState(null);
  const sync=useMutation({mutationFn:()=>api.post(`/intel/price-sync/${storeId}`),onSuccess:r=>{setResult(r.data.data);toast.success("Sync complete");},onError:()=>{setResult({checked:12,updated:3,unchanged:9,changes:[{name:"LED Face Mask",oldPrice:25000,newPrice:22000,change:-12},{name:"Collagen Gummies",oldPrice:15000,newPrice:16500,change:10}]});toast("Demo results - connect backend for live sync",{icon:"✨"});}});
  return(<div className="max-w-4xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-6"><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Price Sync</h1><p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Check suppliers for price changes and update your margins automatically</p></motion.div>
    <div className="p-5 rounded-2xl mb-5" style={{background:t.card,border:`1px solid ${t.border}`}}>
      <div className="flex items-start justify-between gap-4"><div><h3 className="font-bold text-sm mb-1" style={{color:t.text}}>Sync Now</h3><p className="text-xs" style={{color:t.muted}}>KIRO checks all linked supplier prices and updates your store margins automatically.</p></div><button onClick={()=>sync.mutate()} disabled={sync.isPending} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0 disabled:opacity-50" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}><RefreshCw size={13} className={sync.isPending?"animate-spin":""}/>{sync.isPending?"Syncing...":"Run Sync"}</button></div>
    </div>
    {result&&(<motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="space-y-4">
      <div className="grid grid-cols-3 gap-3">{[{l:"Checked",v:result.checked,c:t.text},{l:"Updated",v:result.updated,c:V.green},{l:"Unchanged",v:result.unchanged,c:t.muted}].map(s=>(<div key={s.l} className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}><p className="text-2xl font-black mb-0.5" style={{color:s.c}}>{s.v}</p><p className="text-xs" style={{color:t.muted}}>{s.l}</p></div>))}</div>
      {(result.changes||[]).length>0&&(<div className="rounded-2xl overflow-hidden" style={{background:t.card,border:`1px solid ${t.border}`}}><div className="px-4 py-3" style={{borderBottom:`1px solid ${t.border}`}}><h3 className="font-bold text-sm" style={{color:t.text}}>Price Changes</h3></div><div className="divide-y" style={{borderColor:t.border}}>{result.changes.map((c,i)=>{const up=c.change>0;return(<div key={i} className="flex items-center gap-3 px-4 py-3.5"><Package size={14} style={{color:t.muted,flexShrink:0}}/><p className="text-sm font-semibold flex-1" style={{color:t.text}}>{c.name}</p><p className="text-xs" style={{color:t.muted}}>{fmt(c.oldPrice)}</p><span style={{color:t.muted,fontSize:12}}>→</span><p className="text-sm font-bold" style={{color:t.text}}>{fmt(c.newPrice)}</p><span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{background:up?"rgba(239,68,68,0.12)":"rgba(16,185,129,0.12)",color:up?V.red:V.green}}>{up?"+":""}{c.change}%</span></div>);})}
      </div></div>)}
    </motion.div>)}
    {!result&&!sync.isPending&&(<div className="rounded-2xl flex flex-col items-center justify-center py-20 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}><RefreshCw size={36} style={{color:t.muted,opacity:0.3,marginBottom:14}}/><p className="font-bold text-sm mb-2" style={{color:t.text}}>No sync run yet</p><p className="text-xs" style={{color:t.muted,maxWidth:260,lineHeight:1.6}}>Click Run Sync to check your suppliers for price changes across all connected products.</p></div>)}
  </div>);
}