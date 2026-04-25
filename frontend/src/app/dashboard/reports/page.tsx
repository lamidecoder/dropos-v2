"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Download,FileText,TrendingUp,ShoppingCart,Users,BarChart2}from"lucide-react";
import{AreaChart,Area,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer}from"recharts";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const PERIODS=[{id:"7d",l:"7 days"},{id:"30d",l:"30 days"},{id:"90d",l:"90 days"},{id:"1y",l:"1 year"}];
const fmt=n=>new Intl.NumberFormat("en",{style:"currency",currency:"NGN",maximumFractionDigits:0,notation:n>=1000000?"compact":"standard"}).format(n||0);
export default function ReportsPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);
  const[period,setPeriod]=useState("30d");const[exporting,setExporting]=useState(null);
  const{data}=useQuery({queryKey:["report",storeId,period],queryFn:()=>api.get(`/analytics/${storeId}/report`,{params:{period}}).then(r=>r.data.data),enabled:!!storeId});
  const handleExport=async(type)=>{setExporting(type);try{const r=await api.get(`/analytics/${storeId}/export`,{params:{type,period},responseType:"blob"});const url=URL.createObjectURL(r.data);const a=document.createElement("a");a.href=url;a.download=`dropos-${type}-${period}.csv`;a.click();toast.success("Exported");}catch{toast.error("Backend offline");}finally{setExporting(null);}};
  const chartData=data?.daily||[];const totRev=chartData.reduce((a,d)=>a+(d.revenue||0),0);const totOrd=chartData.reduce((a,d)=>a+(d.orders||0),0);
  const EXPORTS=[{type:"orders",label:"Orders Report",icon:ShoppingCart,color:V.cyan},{type:"products",label:"Products Report",icon:BarChart2,color:V.v400},{type:"customers",label:"Customers Report",icon:Users,color:V.green}];
  return(<div className="max-w-5xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-start justify-between gap-4 mb-6">
      <div><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Reports</h1><p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Performance data and exports</p></div>
      <div className="flex gap-1 p-1 rounded-xl" style={{background:t.faint,border:`1px solid ${t.border}`}}>{PERIODS.map(p=>(<button key={p.id} onClick={()=>setPeriod(p.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{background:period===p.id?t.card:"transparent",color:period===p.id?t.text:t.muted}}>{p.l}</button>))}</div>
    </motion.div>
    <div className="grid grid-cols-2 gap-3 mb-5">
      {[{label:"Revenue",value:fmt(totRev),color:V.v400,icon:TrendingUp},{label:"Orders",value:totOrd,color:V.cyan,icon:ShoppingCart}].map(s=>(<div key={s.label} className="p-4 rounded-2xl relative overflow-hidden" style={{background:t.card,border:`1px solid ${t.border}`}}><div className="absolute top-0 left-0 right-0 h-0.5" style={{background:`linear-gradient(90deg,transparent,${s.color}60,transparent)`}}/><s.icon size={15} style={{color:s.color,marginBottom:8}}/><p className="text-2xl font-black" style={{color:t.text}}>{s.value}</p><p className="text-xs mt-0.5" style={{color:t.muted}}>{s.label}</p></div>))}
    </div>
    {chartData.length>0&&(<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="p-5 rounded-2xl mb-5" style={{background:t.card,border:`1px solid ${t.border}`}}>
      <h3 className="font-bold text-sm mb-4" style={{color:t.text}}>Revenue Over Time</h3>
      <ResponsiveContainer width="100%" height={200}><AreaChart data={chartData} margin={{top:4,right:0,left:-20,bottom:0}}><defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={V.v400} stopOpacity={0.25}/><stop offset="100%" stopColor={V.v400} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={isDark?"rgba(255,255,255,0.04)":"rgba(15,5,32,0.06)"} vertical={false}/><XAxis dataKey="label" tick={{fontSize:10,fill:t.muted}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:t.muted}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/><Tooltip contentStyle={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,fontSize:12}}/><Area type="monotone" dataKey="revenue" stroke={V.v400} strokeWidth={2} fill="url(#rg)" dot={false}/></AreaChart></ResponsiveContainer>
    </motion.div>)}
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="p-5 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
      <h3 className="font-bold text-sm mb-4" style={{color:t.text}}>Export Data</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{EXPORTS.map(ex=>(<button key={ex.type} onClick={()=>handleExport(ex.type)} disabled={!!exporting} className="flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:opacity-80 disabled:opacity-50" style={{background:t.faint,border:`1px solid ${t.border}`}}><div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${ex.color}12`}}><ex.icon size={16} style={{color:ex.color}}/></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold" style={{color:t.text}}>{ex.label}</p><p className="text-xs" style={{color:t.muted}}>CSV · {PERIODS.find(p=>p.id===period)?.l}</p></div><Download size={14} style={{color:t.muted}}/></button>))}</div>
    </motion.div>
  </div>);
}