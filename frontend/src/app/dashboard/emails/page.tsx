"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Mail,Plus,Send,Users,Zap,Check}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444",fuchsia:"#C026D3"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const TEMPLATES=[{id:"welcome",label:"Welcome Email",desc:"Sent to new customers automatically"},{id:"abandoned",label:"Abandoned Cart",desc:"Recover customers who left without buying"},{id:"reorder",label:"Reorder Reminder",desc:"Remind past customers to reorder"},{id:"promotion",label:"Promotional Blast",desc:"Send deals to all your customers"},{id:"review",label:"Review Request",desc:"Ask customers to leave a review"}];
export default function EmailsPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);const[selected,setSelected]=useState(null);
  const{data}=useQuery({queryKey:["campaigns",storeId],queryFn:()=>api.get(`/emails/${storeId}/campaigns`).then(r=>r.data.data),enabled:!!storeId});
  const sendMut=useMutation({mutationFn:(tpl)=>api.post(`/emails/${storeId}/campaigns`,{template:tpl}),onSuccess:()=>{toast.success("Campaign sending now...");setSelected(null);},onError:()=>toast.error("Backend offline")});
  const campaigns=data||[];
  return(<div className="max-w-4xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6">
      <div><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Email Campaigns</h1><p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Reach your customers at the right moment</p></div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{background:"rgba(107,53,232,0.1)",color:V.v300,border:"1px solid rgba(107,53,232,0.2)"}}><Zap size={12}/>KIRO writes the copy</div>
    </motion.div>
    <div className="grid sm:grid-cols-2 gap-3 mb-6">{TEMPLATES.map((tpl,i)=>(<motion.button key={tpl.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}} onClick={()=>setSelected(tpl.id)} className="p-5 rounded-2xl text-left transition-all hover:opacity-90" style={{background:t.card,border:`1px solid ${selected===tpl.id?V.v500:t.border}`}}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{background:selected===tpl.id?"rgba(107,53,232,0.15)":t.faint}}><Mail size={15} style={{color:selected===tpl.id?V.v400:t.muted}}/></div>
      <h3 className="font-bold text-sm mb-1" style={{color:t.text}}>{tpl.label}</h3>
      <p className="text-xs leading-relaxed" style={{color:t.muted}}>{tpl.desc}</p>
    </motion.button>))}</div>
    <AnimatePresence>{selected&&(<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="p-5 rounded-2xl mb-5" style={{background:t.card,border:`1px solid ${V.v500}`}}>
      <h3 className="font-bold text-sm mb-3" style={{color:t.text}}>Send: {TEMPLATES.find(tp=>tp.id===selected)?.label}</h3>
      <div className="flex gap-3"><button onClick={()=>sendMut.mutate(selected)} disabled={sendMut.isPending} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}><Send size={13}/>{sendMut.isPending?"Sending...":"Send Now"}</button><button onClick={()=>setSelected(null)} className="px-4 py-2 rounded-xl text-sm" style={{border:`1px solid ${t.border}`,color:t.muted}}>Cancel</button></div>
    </motion.div>)}</AnimatePresence>
    {campaigns.length>0&&(<div><h3 className="font-bold text-sm mb-3" style={{color:t.text}}>Recent Campaigns</h3><div className="space-y-2">{campaigns.map((c)=>(<div key={c.id} className="flex items-center gap-4 p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}><Mail size={14} style={{color:t.muted}}/><div className="flex-1"><p className="text-sm font-semibold" style={{color:t.text}}>{c.subject||c.template}</p><p className="text-xs" style={{color:t.muted}}>{c.sentCount||0} sent</p></div><span className="text-xs px-2.5 py-1 rounded-full" style={{background:"rgba(16,185,129,0.1)",color:V.green}}>Sent</span></div>))}</div></div>)}
  </div>);
}