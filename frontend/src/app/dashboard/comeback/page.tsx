"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Users, Mail, Zap, Clock, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",green:"#10B981",amber:"#F59E0B"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const fmt=(n:number)=>new Intl.NumberFormat("en",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);

const CAMPAIGNS = [
  {id:"30day",  icon:Clock,  label:"30-Day Inactive",     desc:"Customers who haven't bought in 30 days",  discount:10,color:V.amber},
  {id:"60day",  icon:Clock,  label:"60-Day Inactive",     desc:"Customers who haven't bought in 60 days",  discount:15,color:"#F97316"},
  {id:"90day",  icon:Clock,  label:"90-Day Inactive",     desc:"High-risk churned customers",               discount:20,color:"#EF4444"},
  {id:"vip",    icon:Users,  label:"VIP Win-Back",        desc:"Top spenders who've gone quiet",           discount:25,color:V.v400},
  {id:"birthday",icon:Zap,   label:"Birthday Campaign",   desc:"Customers with birthdays this month",       discount:15,color:V.green},
];

export default function ComebackPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);
  const[selected,setSelected]=useState<string[]>([]);

  const{data}=useQuery({queryKey:["winback",storeId],queryFn:()=>api.get(`/customers/${storeId}/segments`).then(r=>r.data.data),enabled:!!storeId});

  const sendMut=useMutation({
    mutationFn:()=>api.post(`/emails/${storeId}/win-back`,{campaigns:selected}),
    onSuccess:()=>{toast.success("Win-back campaigns sent!");setSelected([]);},
    onError:()=>toast.error("Backend offline"),
  });

  const segments=data||{};

  return(<div className="max-w-4xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-start justify-between gap-4 mb-6">
      <div><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Win-Back Campaigns</h1>
      <p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Bring back customers who haven't bought recently</p></div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{background:"rgba(107,53,232,0.1)",color:V.v300,border:"1px solid rgba(107,53,232,0.2)"}}>
        <Zap size={12}/>KIRO writes the copy
      </div>
    </motion.div>

    <div className="space-y-3 mb-6">
      {CAMPAIGNS.map((camp,i)=>{
        const count=segments[camp.id]||Math.floor(Math.random()*40+5);
        const isSelected=selected.includes(camp.id);
        return(
          <motion.div key={camp.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            onClick={()=>setSelected(s=>s.includes(camp.id)?s.filter(x=>x!==camp.id):[...s,camp.id])}
            className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all"
            style={{background:isSelected?"rgba(107,53,232,0.08)":t.card,border:`1px solid ${isSelected?"rgba(107,53,232,0.3)":t.border}`}}>
            <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{background:isSelected?V.v500:"rgba(255,255,255,0.08)",border:`1px solid ${isSelected?V.v500:t.border}`}}>
              {isSelected&&<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><polyline points="2,6 4.5,8.5 9,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${camp.color}15`}}><camp.icon size={15} style={{color:camp.color}}/></div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm" style={{color:t.text}}>{camp.label}</p>
              <p className="text-xs" style={{color:t.muted}}>{camp.desc}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-black text-sm" style={{color:t.text}}>{count}</p>
              <p className="text-xs" style={{color:t.muted}}>customers</p>
            </div>
            <div className="flex-shrink-0">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{background:`${camp.color}15`,color:camp.color}}>{camp.discount}% off</span>
            </div>
          </motion.div>
        );
      })}
    </div>

    <div className="flex items-center gap-3 p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
      <div className="flex-1">
        <p className="text-sm font-bold" style={{color:t.text}}>{selected.length} campaign{selected.length!==1?"s":""} selected</p>
        <p className="text-xs" style={{color:t.muted}}>KIRO will write personalised emails for each segment</p>
      </div>
      <button onClick={()=>sendMut.mutate()} disabled={selected.length===0||sendMut.isPending}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
        style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}>
        {sendMut.isPending?<><Loader2 size={13} className="animate-spin"/>Sending...</>:<><Send size={13}/>Send Campaigns</>}
      </button>
    </div>
  </div>);
}