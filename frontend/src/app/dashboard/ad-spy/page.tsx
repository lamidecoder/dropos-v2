"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Eye,Search,RefreshCw,Zap,TrendingUp}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const PLATFORMS=[{id:"all",l:"All",e:"🌐"},{id:"tiktok",l:"TikTok",e:"🎵"},{id:"instagram",l:"Instagram",e:"📸"},{id:"facebook",l:"Facebook",e:"👥"}];
const DEMO_ADS=[{id:"1",platform:"TikTok",headline:"This face mask ACTUALLY works",views:"2.4M",engagement:"8.2%",format:"Video 15s",trend:"+340%"},{id:"2",platform:"Instagram",headline:"Wait for the transformation",views:"890K",engagement:"6.1%",format:"Reel",trend:"+180%"},{id:"3",platform:"Facebook",headline:"Limited stock - order now",views:"540K",engagement:"4.8%",format:"Image",trend:"+95%"}];
export default function AdSpyPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);
  const[platform,setPlatform]=useState("all");const[search,setSearch]=useState("");const[ads,setAds]=useState([]);
  const spy=useMutation({mutationFn:()=>api.post("/intel/ad-spy",{platform,keyword:search,storeId}),onSuccess:r=>setAds(r.data.data||[]),onError:()=>{setAds(DEMO_ADS);toast("Demo ads - connect backend for real spy data",{icon:"✨"});}});
  return(<div className="max-w-5xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-6">
      <div className="flex items-center gap-2 mb-1"><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Ad Spy</h1><span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:"rgba(107,53,232,0.12)",color:V.v300,border:"1px solid rgba(107,53,232,0.2)"}}>AI</span></div>
      <p className="text-xs sm:text-sm" style={{color:t.muted}}>Find winning ads in your niche across TikTok, Instagram, and Facebook.</p>
    </motion.div>
    <div className="p-5 rounded-2xl mb-5" style={{background:t.card,border:`1px solid ${t.border}`}}>
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{scrollbarWidth:"none"}}>{PLATFORMS.map(p=>(<button key={p.id} onClick={()=>setPlatform(p.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0" style={{background:platform===p.id?V.v500:t.faint,color:platform===p.id?"#fff":t.muted,border:`1px solid ${platform===p.id?V.v500:t.border}`}}>{p.e} {p.l}</button>))}</div>
      <div className="flex gap-3"><input style={{...inp(t),flex:1}} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by niche, keyword, or product..."/><button onClick={()=>spy.mutate()} disabled={spy.isPending} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0 disabled:opacity-50" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}>{spy.isPending?<RefreshCw size={13} className="animate-spin"/>:<Search size={13}/>}Spy</button></div>
    </div>
    {ads.length>0?(<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{ads.map((ad,i)=>(<motion.div key={ad.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}} className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
      <div className="flex items-center justify-between mb-3"><span className="text-xs font-bold px-2 py-1 rounded-lg" style={{background:t.faint,color:t.muted}}>{ad.platform}</span><span className="text-xs font-semibold" style={{color:V.green}}>{ad.trend} trending</span></div>
      <p className="text-sm font-bold mb-3 leading-snug" style={{color:t.text}}>"{ad.headline}"</p>
      <div className="grid grid-cols-3 gap-2 mb-3">{[{l:"Views",v:ad.views},{l:"Engagement",v:ad.engagement},{l:"Format",v:ad.format}].map(s=>(<div key={s.l} className="text-center p-2 rounded-xl" style={{background:t.faint}}><p className="text-xs font-bold" style={{color:t.text}}>{s.v}</p><p className="text-[10px]" style={{color:t.muted}}>{s.l}</p></div>))}</div>
      <Link href="/dashboard/tiktok-scripts"><button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold" style={{border:`1px solid ${t.border}`,color:V.v300}}><Zap size={11}/>Create similar script</button></Link>
    </motion.div>))}</div>):(
      <div className="rounded-2xl flex flex-col items-center justify-center py-20 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}><Eye size={36} style={{color:t.muted,opacity:0.3,marginBottom:14}}/><p className="font-bold text-sm mb-2" style={{color:t.text}}>Search for winning ads</p><p className="text-xs" style={{color:t.muted}}>Enter a niche or keyword to see what is working on each platform.</p></div>
    )}
  </div>);
}