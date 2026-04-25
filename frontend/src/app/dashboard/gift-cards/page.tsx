"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Gift,Plus,Copy,Check,X,Loader2}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const fmt=n=>new Intl.NumberFormat("en",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);
function Modal({storeId,onClose,t,isDark}){
  const qc=useQueryClient();
  const[amount,setAmount]=useState("5000");const[qty,setQty]=useState("1");const[exp,setExp]=useState("365");
  const mut=useMutation({mutationFn:()=>api.post(`/gift-cards/${storeId}`,{amount:parseFloat(amount),quantity:parseInt(qty),expiresInDays:parseInt(exp)}),onSuccess:()=>{toast.success("Gift card(s) created");qc.invalidateQueries({queryKey:["gift-cards"]});onClose();},onError:(e)=>toast.error(e.response?.data?.message||"Failed")});
  return(<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{background:"rgba(0,0,0,0.65)",backdropFilter:"blur(8px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden" style={{background:isDark?"#181230":"#fff",border:`1px solid ${t.border}`}}>
      <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:`1px solid ${t.border}`}}><h2 className="font-black text-base" style={{color:t.text}}>Create Gift Cards</h2><button onClick={onClose} style={{color:t.muted}}><X size={17}/></button></div>
      <div className="p-5 space-y-4">
        <div><label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Value (NGN)</label><input style={inp(t)} type="number" value={amount} onChange={e=>setAmount(e.target.value)}/><div className="flex gap-2 mt-2">{["2500","5000","10000","25000"].map(v=>(<button key={v} onClick={()=>setAmount(v)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold" style={{background:amount===v?"rgba(107,53,232,0.12)":t.faint,border:`1px solid ${amount===v?"rgba(107,53,232,0.3)":t.border}`,color:amount===v?V.v300:t.muted}}>{fmt(parseInt(v))}</button>))}</div></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Quantity</label><input style={inp(t)} type="number" value={qty} onChange={e=>setQty(e.target.value)} min="1" max="100"/></div>
          <div><label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Expires in</label><select style={{...inp(t),cursor:"pointer"}} value={exp} onChange={e=>setExp(e.target.value)}><option value="30">30 days</option><option value="90">90 days</option><option value="180">6 months</option><option value="365">1 year</option><option value="730">2 years</option></select></div>
        </div>
      </div>
      <div className="flex gap-3 px-5 py-4" style={{borderTop:`1px solid ${t.border}`}}>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm" style={{border:`1px solid ${t.border}`,color:t.muted}}>Cancel</button>
        <button onClick={()=>mut.mutate()} disabled={!amount||mut.isPending} className="flex-[2] py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}>{mut.isPending?<><Loader2 size={13} className="animate-spin"/>Creating</>:"Create Gift Cards"}</button>
      </div>
    </motion.div>
  </div>);
}
export default function GiftCardsPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);
  const[show,setShow]=useState(false);const[copied,setCopied]=useState("");
  const{data}=useQuery({queryKey:["gift-cards",storeId],queryFn:()=>api.get(`/gift-cards/${storeId}`).then(r=>r.data.data),enabled:!!storeId});
  const copy=(code)=>{navigator.clipboard.writeText(code);setCopied(code);setTimeout(()=>setCopied(""),2000);};
  const cards=data||[];
  return(<div className="max-w-5xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6">
      <div><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Gift Cards</h1><p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Create and manage store gift cards</p></div>
      <button onClick={()=>setShow(true)} className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}><Plus size={14}/><span className="hidden sm:inline">Create</span> Gift Card</button>
    </motion.div>
    <div className="grid grid-cols-3 gap-3 mb-5">
      {[{label:"Total",value:cards.length,color:t.text},{label:"Active",value:cards.filter(c=>!c.usedAt&&(!c.expiresAt||new Date(c.expiresAt)>new Date())).length,color:V.green},{label:"Redeemed",value:fmt(cards.filter(c=>c.usedAt).reduce((a,c)=>a+c.amount,0)),color:t.text}].map(s=>(<div key={s.label} className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}><p className="text-xl font-black mb-0.5" style={{color:s.color}}>{s.value}</p><p className="text-xs" style={{color:t.muted}}>{s.label}</p></div>))}
    </div>
    {cards.length===0?(<motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="rounded-2xl flex flex-col items-center justify-center py-20 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}>
      <Gift size={36} style={{color:t.muted,opacity:0.3,marginBottom:14}}/><h3 className="font-bold text-sm mb-2" style={{color:t.text}}>No gift cards yet</h3>
      <p className="text-xs mb-5" style={{color:t.muted,maxWidth:260,lineHeight:1.6}}>Create gift cards for customer rewards, promotions, and special occasions.</p>
      <button onClick={()=>setShow(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}><Plus size={13}/>Create First Gift Card</button>
    </motion.div>):(
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{cards.map((card,i)=>{const used=!!card.usedAt;const expired=card.expiresAt&&new Date(card.expiresAt)<new Date();const active=!used&&!expired;return(<motion.div key={card.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`,opacity:!active?0.6:1}}>
        <div className="flex items-center justify-between mb-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:active?"rgba(107,53,232,0.1)":t.faint}}><Gift size={18} style={{color:active?V.v400:t.muted}}/></div><span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{background:active?"rgba(16,185,129,0.12)":t.faint,color:active?V.green:t.muted}}>{active?"Active":used?"Used":"Expired"}</span></div>
        <p className="text-2xl font-black mb-2" style={{color:t.text}}>{fmt(card.amount)}</p>
        <div className="flex items-center gap-2"><code className="text-xs font-mono flex-1 truncate" style={{color:t.muted}}>{card.code}</code><button onClick={()=>copy(card.code)} className="p-1.5 rounded-lg flex-shrink-0" style={{border:`1px solid ${t.border}`,color:copied===card.code?V.green:t.muted}}>{copied===card.code?<Check size={11}/>:<Copy size={11}/>}</button></div>
        {card.expiresAt&&<p className="text-[10px] mt-2" style={{color:t.muted}}>Expires {new Date(card.expiresAt).toLocaleDateString("en",{day:"numeric",month:"short",year:"numeric"})}</p>}
      </motion.div>);})}</div>
    )}
    <AnimatePresence>{show&&<Modal storeId={storeId} onClose={()=>setShow(false)} t={t} isDark={isDark}/>}</AnimatePresence>
  </div>);
}