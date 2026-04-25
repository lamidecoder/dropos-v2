"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Download,Package,ShoppingCart,Users,Check,Shield,Clock}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const EXPORTS=[{type:"orders",label:"Orders",icon:ShoppingCart,color:V.cyan,desc:"Full order history with items and totals"},{type:"products",label:"Products",icon:Package,color:V.v400,desc:"Product catalog with prices and inventory"},{type:"customers",label:"Customers",icon:Users,color:V.green,desc:"Customer list with contact info and history"}];
export default function BackupPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);
  const[exporting,setExporting]=useState(null);const[done,setDone]=useState([]);
  const handleExport=async(type)=>{setExporting(type);try{const r=await api.get(`/analytics/${storeId}/export`,{params:{type},responseType:"blob"});const url=URL.createObjectURL(r.data);const a=document.createElement("a");a.href=url;a.download=`dropos-${type}-${new Date().toISOString().split("T")[0]}.csv`;a.click();setDone(p=>[...p,type]);toast.success(`${type} exported`);}catch{toast.error("Backend offline");}finally{setExporting(null);}};
  return(<div className="max-w-3xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-6"><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Backup and Export</h1><p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Download your store data as CSV files</p></motion.div>
    <div className="flex items-center gap-3 p-4 rounded-2xl mb-5" style={{background:"rgba(107,53,232,0.06)",border:"1px solid rgba(107,53,232,0.15)"}}><Shield size={15} style={{color:V.v400,flexShrink:0}}/><p className="text-xs" style={{color:t.muted}}>We recommend exporting your data monthly. Store it in Google Drive or your email for safekeeping.</p></div>
    <div className="space-y-3">{EXPORTS.map((ex,i)=>{const isExp=exporting===ex.type;const isDone=done.includes(ex.type);return(<motion.div key={ex.type} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}} className="flex items-center gap-4 p-5 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{background:`${ex.color}12`}}><ex.icon size={20} style={{color:ex.color}}/></div>
      <div className="flex-1 min-w-0"><p className="text-sm font-bold" style={{color:t.text}}>{ex.label}</p><p className="text-xs mt-0.5" style={{color:t.muted}}>{ex.desc}</p></div>
      <button onClick={()=>handleExport(ex.type)} disabled={!!exporting} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 disabled:opacity-50" style={{background:isDone?"rgba(16,185,129,0.1)":`${ex.color}12`,color:isDone?V.green:ex.color,border:`1px solid ${isDone?"rgba(16,185,129,0.3)":ex.color+"30"}`}}>
        {isExp?<><Clock size={11} className="animate-spin"/>Exporting</>:isDone?<><Check size={11}/>Downloaded</>:<><Download size={11}/>Export CSV</>}
      </button>
    </motion.div>);})}
    </div>
  </div>);
}