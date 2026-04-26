"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Truck,Plus,Edit2,Trash2,X}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444",fuchsia:"#C026D3"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const SAMPLE=[{id:"1",name:"Lagos",states:["Lagos"],rate:1500,estimatedDays:"1-2"},{id:"2",name:"South West",states:["Oyo","Ogun","Osun","Ondo","Ekiti"],rate:2500,estimatedDays:"2-3"},{id:"3",name:"Nationwide",states:["All other states"],rate:3500,estimatedDays:"3-5"}];
export default function ShippingPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);const qc=useQueryClient();
  const[threshold,setThreshold]=useState("50000");const[saving,setSaving]=useState(false);
  const{data}=useQuery({queryKey:["shipping",storeId],queryFn:()=>api.get(`/shipping/${storeId}/zones`).then(r=>r.data.data),enabled:!!storeId});
  const zones=data||SAMPLE;
  const saveThreshold=async()=>{setSaving(true);try{await api.put(`/shipping/${storeId}/free-threshold`,{amount:parseFloat(threshold)});toast.success("Saved");}catch{toast.error("Backend offline");}finally{setSaving(false);}};
  return(<div className="max-w-4xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6">
      <div><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Shipping</h1><p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Delivery zones and rates for your store</p></div>
      <button className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}><Plus size={14}/>Add Zone</button>
    </motion.div>
    <div className="space-y-3 mb-6">{zones.map((zone,i)=>(<motion.div key={zone.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}} className="flex items-center gap-4 p-5 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"rgba(6,182,212,0.1)"}}><Truck size={18} color={V.cyan}/></div>
      <div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-0.5"><h3 className="font-bold text-sm" style={{color:t.text}}>{zone.name}</h3><span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{background:"rgba(16,185,129,0.1)",color:V.green}}>Active</span></div><p className="text-xs" style={{color:t.muted}}>{Array.isArray(zone.states)?zone.states.join(", "):zone.states} · {zone.estimatedDays} days</p></div>
      <div className="text-right flex-shrink-0"><p className="font-black text-sm" style={{color:t.text}}>NGN {zone.rate?.toLocaleString()}</p><p className="text-xs" style={{color:t.muted}}>per order</p></div>
      <div className="flex gap-2 flex-shrink-0"><button className="p-2 rounded-lg" style={{border:`1px solid ${t.border}`,color:t.muted}}><Edit2 size={13}/></button><button className="p-2 rounded-lg" style={{border:`1px solid ${t.border}`,color:V.red}}><Trash2 size={13}/></button></div>
    </motion.div>))}</div>
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="p-5 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
      <h3 className="font-bold text-sm mb-1" style={{color:t.text}}>Free Shipping Threshold</h3>
      <p className="text-xs mb-4" style={{color:t.muted}}>Orders above this amount get free shipping automatically</p>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1" style={{border:`1px solid ${t.border}`,background:t.faint}}><span className="text-sm font-bold" style={{color:t.muted}}>NGN</span><input type="number" value={threshold} onChange={e=>setThreshold(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm" style={{color:t.text,fontFamily:"inherit"}}/></div>
        <button onClick={saveThreshold} disabled={saving} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{background:V.v500}}>{saving?"Saving...":"Save"}</button>
      </div>
    </motion.div>
  </div>);
}