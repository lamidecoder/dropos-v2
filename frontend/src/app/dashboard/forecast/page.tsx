"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{TrendingUp,DollarSign,Calendar,Zap}from"lucide-react";
import{AreaChart,Area,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer}from"recharts";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const fmt=n=>new Intl.NumberFormat("en",{style:"currency",currency:"NGN",maximumFractionDigits:0,notation:n>=1000000?"compact":"standard"}).format(n||0);
const DEMO=Array.from({length:12},(_,i)=>{const m=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i];return{month:m,revenue:Math.round(150000+i*45000+Math.random()*80000),orders:Math.floor((150000+i*45000)/8500)};});
export default function ForecastPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);
  const{data}=useQuery({queryKey:["forecast",storeId],queryFn:()=>api.get(`/analytics/${storeId}/forecast`).then(r=>r.data.data),enabled:!!storeId});
  const chartData=data?.monthly||DEMO;const isDemo=!data;
  const next=chartData[new Date().getMonth()]||chartData[chartData.length-1];
  const yearly=chartData.reduce((a,d)=>a+(d.revenue||0),0);
  return(<div className="max-w-5xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-start justify-between gap-4 mb-6">
      <div><div className="flex items-center gap-2 mb-1"><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Revenue Forecast</h1>{isDemo&&<span className="text-xs px-2 py-0.5 rounded-full" style={{background:t.faint,color:t.muted}}>Demo</span>}</div><p className="text-xs sm:text-sm" style={{color:t.muted}}>Projected revenue based on your store trends</p></div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{background:"rgba(107,53,232,0.1)",color:V.v300,border:"1px solid rgba(107,53,232,0.2)"}}><Zap size={12}/>KIRO-powered</div>
    </motion.div>
    <div className="grid grid-cols-3 gap-3 mb-5">{[{l:"Next 30 Days",v:fmt(next?.revenue||0),c:V.v400,i:TrendingUp},{l:"12-Month Forecast",v:fmt(yearly),c:V.green,i:DollarSign},{l:"Projected Orders",v:next?.orders||0,c:V.cyan,i:Calendar}].map(s=>(<div key={s.l} className="p-4 rounded-2xl relative overflow-hidden" style={{background:t.card,border:`1px solid ${t.border}`}}><div className="absolute top-0 left-0 right-0 h-0.5" style={{background:`linear-gradient(90deg,transparent,${s.c}60,transparent)`}}/><s.i size={15} style={{color:s.c,marginBottom:8}}/><p className="text-2xl font-black" style={{color:t.text}}>{s.v}</p><p className="text-xs mt-0.5" style={{color:t.muted}}>{s.l}</p></div>))}</div>
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.15}} className="p-5 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
      <h3 className="font-bold text-sm mb-5" style={{color:t.text}}>12-Month Forecast</h3>
      <ResponsiveContainer width="100%" height={240}><AreaChart data={chartData} margin={{top:4,right:0,left:-20,bottom:0}}><defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={V.v400} stopOpacity={0.3}/><stop offset="100%" stopColor={V.v400} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={isDark?"rgba(255,255,255,0.04)":"rgba(15,5,32,0.06)"} vertical={false}/><XAxis dataKey="month" tick={{fontSize:11,fill:t.muted}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:t.muted}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/><Tooltip contentStyle={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,fontSize:12}} formatter={v=>[fmt(v),"Revenue"]}/><Area type="monotone" dataKey="revenue" stroke={V.v400} strokeWidth={2.5} fill="url(#fg)" dot={false} strokeDasharray={isDemo?"6 3":undefined}/></AreaChart></ResponsiveContainer>
      {isDemo&&<p className="text-xs text-center mt-3" style={{color:t.muted}}>Dashed = demo projection. Connect backend to see your real forecast.</p>}
    </motion.div>
  </div>);
}