"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{RefreshCw,X,ChevronRight,DollarSign,Check}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const ST={PENDING:{label:"Pending",color:V.amber,bg:"rgba(245,158,11,0.12)"},APPROVED:{label:"Approved",color:V.green,bg:"rgba(16,185,129,0.12)"},REJECTED:{label:"Rejected",color:V.red,bg:"rgba(239,68,68,0.12)"},PROCESSED:{label:"Processed",color:V.cyan,bg:"rgba(6,182,212,0.12)"}};
const RR={DAMAGED:"Item Damaged",NOT_RECEIVED:"Not Received",WRONG_ITEM:"Wrong Item",NOT_AS_DESCRIBED:"Not as Described",CHANGED_MIND:"Changed Mind",OTHER:"Other"};
const fmt=n=>new Intl.NumberFormat("en",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);
export default function RefundsPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);const qc=useQueryClient();
  const[sel,setSel]=useState(null);const[tab,setTab]=useState("PENDING");
  const{data}=useQuery({queryKey:["refunds",storeId,tab],queryFn:()=>api.get(`/refunds/${storeId}?status=${tab}`).then(r=>r.data.data),enabled:!!storeId});
  const upd=useMutation({mutationFn:({id,status})=>api.patch(`/refunds/${storeId}/${id}`,{status}),onSuccess:()=>{toast.success("Refund updated");qc.invalidateQueries({queryKey:["refunds"]});setSel(null);},onError:()=>toast.error("Backend offline")});
  const refunds=data||[];
  return(<div className="max-w-5xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6">
      <div><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Refunds</h1><p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Review and process refund requests</p></div>
      <div className="px-3 py-2 rounded-xl text-xs font-semibold" style={{background:"rgba(245,158,11,0.1)",color:V.amber,border:"1px solid rgba(245,158,11,0.2)"}}>{refunds.filter(r=>r.status==="PENDING").length} pending</div>
    </motion.div>
    <div className="flex gap-1 mb-5 p-1 rounded-xl overflow-x-auto" style={{background:t.faint,border:`1px solid ${t.border}`,width:"fit-content",scrollbarWidth:"none"}}>
      {Object.entries(ST).map(([k,s])=>(<button key={k} onClick={()=>setTab(k)} className="px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap" style={{background:tab===k?t.card:"transparent",color:tab===k?t.text:t.muted,boxShadow:tab===k?"0 1px 3px rgba(0,0,0,0.1)":"none"}}>{s.label}</button>))}
    </div>
    <div className="rounded-2xl overflow-hidden" style={{background:t.card,border:`1px solid ${t.border}`}}>
      {refunds.length===0?(
        <div className="flex flex-col items-center justify-center py-20 text-center"><RefreshCw size={36} style={{color:t.muted,opacity:0.3,marginBottom:14}}/><p className="font-bold text-sm mb-1" style={{color:t.text}}>No {ST[tab].label.toLowerCase()} refunds</p><p className="text-xs" style={{color:t.muted}}>Refund requests will appear here</p></div>
      ):(<div className="divide-y" style={{borderColor:t.border}}>{refunds.map((r,i)=>{const s=ST[r.status]||ST.PENDING;return(<button key={r.id} onClick={()=>setSel(r)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:opacity-80 transition-opacity text-left">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:s.bg}}><RefreshCw size={14} style={{color:s.color}}/></div>
        <div className="flex-1 min-w-0"><p className="text-sm font-semibold" style={{color:t.text}}>{r.customerName||r.customer?.name||"Customer"}</p><p className="text-xs" style={{color:t.muted}}>{RR[r.reason]||r.reason||"Refund"} · {new Date(r.createdAt).toLocaleDateString("en",{day:"numeric",month:"short"})}</p></div>
        <p className="text-sm font-black flex-shrink-0" style={{color:V.red}}>{fmt(r.amount)}</p>
        <ChevronRight size={14} style={{color:t.muted}}/>
      </button>);})}</div>)}
    </div>
    <AnimatePresence>{sel&&(<div className="fixed inset-0 z-50 flex items-center justify-end" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)"}} onClick={e=>e.target===e.currentTarget&&setSel(null)}>
      <motion.div initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring",damping:28}} className="h-full w-full max-w-sm overflow-y-auto" style={{background:isDark?"#181230":"#fff",borderLeft:`1px solid ${t.border}`}}>
        <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:`1px solid ${t.border}`}}><div><h2 className="font-bold text-sm" style={{color:t.text}}>#{sel.id?.slice(-8)?.toUpperCase()}</h2><p className="text-xs mt-0.5" style={{color:t.muted}}>{fmt(sel.amount)}</p></div><button onClick={()=>setSel(null)} style={{color:t.muted}}><X size={17}/></button></div>
        <div className="p-5 space-y-4">
          <div className="p-4 rounded-2xl space-y-2" style={{background:t.faint,border:`1px solid ${t.border}`}}>
            <div className="flex justify-between text-xs"><span style={{color:t.muted}}>Customer</span><span style={{color:t.text,fontWeight:600}}>{sel.customerName||"Customer"}</span></div>
            <div className="flex justify-between text-xs"><span style={{color:t.muted}}>Reason</span><span style={{color:t.text,fontWeight:600}}>{RR[sel.reason]||sel.reason||"N/A"}</span></div>
            <div className="flex justify-between text-xs"><span style={{color:t.muted}}>Amount</span><span style={{color:V.red,fontWeight:700}}>{fmt(sel.amount)}</span></div>
          </div>
          {sel.status==="PENDING"&&(<div className="flex gap-2"><button onClick={()=>upd.mutate({id:sel.id,status:"APPROVED"})} disabled={upd.isPending} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{background:V.green}}>Approve</button><button onClick={()=>upd.mutate({id:sel.id,status:"REJECTED"})} disabled={upd.isPending} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{background:V.red}}>Reject</button></div>)}
          {sel.status==="APPROVED"&&(<button onClick={()=>upd.mutate({id:sel.id,status:"PROCESSED"})} disabled={upd.isPending} className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{background:V.cyan}}>Mark Processed</button>)}
        </div>
      </motion.div>
    </div>)}</AnimatePresence>
  </div>);
}