"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Zap,Plus,Trash2,X,Check}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const TRIGGERS=[{id:"margin_below",l:"Margin drops below",s:"%",actions:["alert","auto_reprice","hide_product"]},{id:"out_of_stock",l:"Product goes out of stock",s:"",actions:["alert","hide_product"]},{id:"price_rise",l:"Supplier price rises",s:"%",actions:["alert","auto_reprice"]},{id:"price_drop",l:"Supplier price drops by",s:"%",actions:["alert"]}];
const AL={alert:"Alert me in KIRO",auto_reprice:"Auto-adjust price",hide_product:"Hide from store"};
export default function ProfitRulesPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);const qc=useQueryClient();
  const[showCreate,setShowCreate]=useState(false);const[trigger,setTrigger]=useState(TRIGGERS[0].id);const[threshold,setThreshold]=useState("20");const[action,setAction]=useState("alert");
  const{data}=useQuery({queryKey:["profit-rules",storeId],queryFn:()=>api.get(`/profit-rules/${storeId}`).then(r=>r.data.data),enabled:!!storeId});
  const createMut=useMutation({mutationFn:()=>api.post(`/profit-rules/${storeId}`,{trigger,threshold:parseFloat(threshold),action}),onSuccess:()=>{toast.success("Rule created");qc.invalidateQueries({queryKey:["profit-rules"]});setShowCreate(false);},onError:(e)=>toast.error(e.response?.data?.message||"Backend offline")});
  const delMut=useMutation({mutationFn:(id)=>api.delete(`/profit-rules/${storeId}/${id}`),onSuccess:()=>{toast.success("Deleted");qc.invalidateQueries({queryKey:["profit-rules"]});}});
  const toggleMut=useMutation({mutationFn:({id,active})=>api.patch(`/profit-rules/${storeId}/${id}`,{active}),onSuccess:()=>qc.invalidateQueries({queryKey:["profit-rules"]})});
  const rules=data||[];const selTrig=TRIGGERS.find(t=>t.id===trigger)||TRIGGERS[0];
  return(<div className="max-w-4xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6">
      <div><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Profit Rules</h1><p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Automate pricing decisions to protect your margins</p></div>
      <button onClick={()=>setShowCreate(!showCreate)} className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}><Plus size={14}/>Add Rule</button>
    </motion.div>
    <AnimatePresence>{showCreate&&(<motion.div initial={{opacity:0,y:-8,height:0}} animate={{opacity:1,y:0,height:"auto"}} exit={{opacity:0,y:-8,height:0}} className="overflow-hidden mb-5">
      <div className="p-5 rounded-2xl" style={{background:t.card,border:`1px solid ${V.v500}40`}}>
        <h3 className="font-bold text-sm mb-4" style={{color:t.text}}>New Rule</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div><label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>When</label><select style={{...inp(t),cursor:"pointer"}} value={trigger} onChange={e=>setTrigger(e.target.value)}>{TRIGGERS.map(tr=>(<option key={tr.id} value={tr.id}>{tr.l}</option>))}</select></div>
          {selTrig.s&&<div><label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Threshold {selTrig.s}</label><input style={inp(t)} type="number" value={threshold} onChange={e=>setThreshold(e.target.value)}/></div>}
          <div><label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Then</label><select style={{...inp(t),cursor:"pointer"}} value={action} onChange={e=>setAction(e.target.value)}>{selTrig.actions.map(a=>(<option key={a} value={a}>{AL[a]}</option>))}</select></div>
        </div>
        <div className="flex gap-2"><button onClick={()=>setShowCreate(false)} className="px-4 py-2 rounded-xl text-sm" style={{border:`1px solid ${t.border}`,color:t.muted}}>Cancel</button><button onClick={()=>createMut.mutate()} disabled={createMut.isPending} className="px-6 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}>{createMut.isPending?"Creating...":"Create Rule"}</button></div>
      </div>
    </motion.div>)}</AnimatePresence>
    {rules.length===0?(<div className="rounded-2xl flex flex-col items-center justify-center py-20 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}><Zap size={36} style={{color:t.muted,opacity:0.3,marginBottom:14}}/><p className="font-bold text-sm mb-2" style={{color:t.text}}>No rules yet</p><p className="text-xs mb-5" style={{color:t.muted,maxWidth:300,lineHeight:1.6}}>Set rules to automatically protect your margins. Example: if margin drops below 20%, alert me in KIRO and auto-adjust price.</p></div>):(
      <div className="space-y-3">{rules.map((rule,i)=>(<motion.div key={rule.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="flex items-center gap-3 p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:rule.active?"rgba(107,53,232,0.1)":t.faint}}><Zap size={14} style={{color:rule.active?V.v400:t.muted}}/></div>
        <div className="flex-1 min-w-0"><p className="text-sm font-semibold" style={{color:t.text}}>{TRIGGERS.find(tr=>tr.id===rule.trigger)?.l} {rule.threshold}{TRIGGERS.find(tr=>tr.id===rule.trigger)?.s}</p><p className="text-xs mt-0.5" style={{color:t.muted}}>{AL[rule.action]}</p></div>
        <button onClick={()=>toggleMut.mutate({id:rule.id,active:!rule.active})} style={{width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",background:rule.active?V.v500:"rgba(128,128,128,0.2)",flexShrink:0,position:"relative"}}><div style={{position:"absolute",top:2,left:rule.active?18:2,width:16,height:16,borderRadius:"50%",background:"white",transition:"left 0.2s"}}/></button>
        <button onClick={()=>delMut.mutate(rule.id)} className="p-2 rounded-lg flex-shrink-0" style={{border:`1px solid ${t.border}`,color:V.red}}><Trash2 size={12}/></button>
      </motion.div>))}</div>
    )}
  </div>);
}