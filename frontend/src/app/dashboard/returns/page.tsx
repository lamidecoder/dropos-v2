"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{RotateCcw,X,Check,ChevronRight,AlertCircle}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const ST={REQUESTED:{label:"Requested",color:V.amber,bg:"rgba(245,158,11,0.12)"},APPROVED:{label:"Approved",color:V.green,bg:"rgba(16,185,129,0.12)"},REJECTED:{label:"Rejected",color:V.red,bg:"rgba(239,68,68,0.12)"},RECEIVED:{label:"Received",color:V.cyan,bg:"rgba(6,182,212,0.12)"},REFUNDED:{label:"Refunded",color:V.v400,bg:"rgba(107,53,232,0.12)"}};
export default function ReturnsPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);const qc=useQueryClient();
  const[sel,setSel]=useState(null);const[note,setNote]=useState("");const[status,setStatus]=useState("");
  const{data,isLoading}=useQuery({queryKey:["returns",storeId],queryFn:()=>api.get(`/ops/returns/${storeId}`).then(r=>r.data.data),enabled:!!storeId});
  const upd=useMutation({mutationFn:()=>api.patch(`/ops/returns/${storeId}/${sel.id}`,{status,adminNote:note}),onSuccess:()=>{toast.success("Return updated");qc.invalidateQueries({queryKey:["returns"]});setSel(null);},onError:(e)=>toast.error(e.response?.data?.message||"Failed")});
  const returns=data||[];
  return(<div className="max-w-5xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-6">
      <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Returns</h1>
      <p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Manage customer return requests</p>
    </motion.div>
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
      {Object.entries(ST).map(([k,s])=>(<div key={k} className="p-3 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}><p className="text-xl font-black mb-0.5" style={{color:t.text}}>{returns.filter(r=>r.status===k).length}</p><p className="text-[11px]" style={{color:s.color}}>{s.label}</p></div>))}
    </div>
    <div className="rounded-2xl overflow-hidden" style={{background:t.card,border:`1px solid ${t.border}`}}>
      {isLoading?Array.from({length:3}).map((_,i)=><div key={i} className="h-16 animate-pulse m-3 rounded-xl" style={{background:t.faint}}/>):returns.length===0?(
        <div className="flex flex-col items-center justify-center py-20 text-center"><RotateCcw size={36} style={{color:t.muted,opacity:0.3,marginBottom:14}}/><p className="font-bold text-sm mb-1" style={{color:t.text}}>No return requests</p><p className="text-xs" style={{color:t.muted}}>Customer return requests will appear here</p></div>
      ):(<div className="divide-y" style={{borderColor:t.border}}>{returns.map((r,i)=>{const s=ST[r.status]||ST.REQUESTED;return(<button key={r.id} onClick={()=>{setSel(r);setStatus(r.status);setNote(r.adminNote||"");}} className="w-full flex items-center gap-3 px-4 py-3.5 hover:opacity-80 transition-opacity text-left">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:s.bg}}><RotateCcw size={14} style={{color:s.color}}/></div>
        <div className="flex-1 min-w-0"><p className="text-sm font-semibold" style={{color:t.text}}>{r.customerName||r.customer?.name||"Customer"}</p><p className="text-xs" style={{color:t.muted}}>{r.reason||"Return requested"} · {new Date(r.createdAt).toLocaleDateString("en",{day:"numeric",month:"short"})}</p></div>
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0" style={{background:s.bg,color:s.color}}>{s.label}</span>
        <ChevronRight size={14} style={{color:t.muted}}/>
      </button>);})}
      </div>)}
    </div>
    <AnimatePresence>{sel&&(<div className="fixed inset-0 z-50 flex items-center justify-end" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)"}} onClick={e=>e.target===e.currentTarget&&setSel(null)}>
      <motion.div initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring",damping:28}} className="h-full w-full max-w-sm overflow-y-auto" style={{background:isDark?"#181230":"#fff",borderLeft:`1px solid ${t.border}`}}>
        <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:`1px solid ${t.border}`}}><h2 className="font-bold text-sm" style={{color:t.text}}>Return #{sel.id?.slice(-8)?.toUpperCase()}</h2><button onClick={()=>setSel(null)} style={{color:t.muted}}><X size={17}/></button></div>
        <div className="p-5 space-y-4">
          <div className="p-4 rounded-2xl" style={{background:t.faint,border:`1px solid ${t.border}`}}><p className="text-xs font-semibold mb-2" style={{color:t.muted}}>Reason</p><p className="text-sm" style={{color:t.text}}>{sel.reason||"Not specified"}</p></div>
          <div><p className="text-xs font-semibold mb-2" style={{color:t.muted}}>Update Status</p><div className="grid grid-cols-2 gap-2">{Object.entries(ST).map(([k,s])=>(<button key={k} onClick={()=>setStatus(k)} className="px-3 py-2 rounded-xl text-xs font-semibold transition-all" style={{background:status===k?s.bg:t.faint,border:`1px solid ${status===k?s.color:t.border}`,color:status===k?s.color:t.muted}}>{s.label}</button>))}</div></div>
          <div><p className="text-xs font-semibold mb-2" style={{color:t.muted}}>Admin Note</p><textarea style={{...inp(t),resize:"none"}} rows={3} value={note} onChange={e=>setNote(e.target.value)} placeholder="Internal note..."/></div>
          <button onClick={()=>upd.mutate()} disabled={upd.isPending} className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}>{upd.isPending?"Saving...":"Save Changes"}</button>
        </div>
      </motion.div>
    </div>)}</AnimatePresence>
  </div>);
}