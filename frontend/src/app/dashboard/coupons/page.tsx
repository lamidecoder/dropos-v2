"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Tag,Plus,Copy,Check,Percent,Trash2,X,Loader2}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444",fuchsia:"#C026D3"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

function Modal({storeId,coupon,onClose,t,isDark}){
  const qc=useQueryClient();const isEdit=!!coupon;
  const[form,setForm]=useState({code:coupon?.code||"",type:coupon?.type||"PERCENTAGE",value:coupon?.value?.toString()||"",minOrder:coupon?.minOrder?.toString()||"",maxUses:coupon?.maxUses?.toString()||"",expiresAt:coupon?.expiresAt?coupon.expiresAt.split("T")[0]:"",active:coupon?.active??true});
  const mut=useMutation({mutationFn:async()=>{const p={code:form.code.toUpperCase(),type:form.type,value:parseFloat(form.value),minOrder:form.minOrder?parseFloat(form.minOrder):null,maxUses:form.maxUses?parseInt(form.maxUses):null,expiresAt:form.expiresAt||null,active:form.active};return isEdit?api.patch(`/coupons/${storeId}/${coupon.id}`,p):api.post(`/coupons/${storeId}`,p);},onSuccess:()=>{toast.success(isEdit?"Coupon updated":"Coupon created");qc.invalidateQueries({queryKey:["coupons"]});onClose();},onError:(e)=>toast.error(e.response?.data?.message||"Failed")});
  return(<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{background:"rgba(0,0,0,0.65)",backdropFilter:"blur(8px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden" style={{background:isDark?"#181230":"#fff",border:`1px solid ${t.border}`}}>
      <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:`1px solid ${t.border}`}}><h2 className="font-black text-base" style={{color:t.text}}>{isEdit?"Edit Coupon":"Create Coupon"}</h2><button onClick={onClose} style={{color:t.muted}}><X size={17}/></button></div>
      <div className="p-5 space-y-3" style={{maxHeight:"65vh",overflowY:"auto"}}>
        <div><label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Coupon Code</label><input style={inp(t)} value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="SAVE20"/></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Type</label><select style={{...inp(t),cursor:"pointer"}} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}><option value="PERCENTAGE">Percentage %</option><option value="FIXED">Fixed Amount</option></select></div>
          <div><label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Value</label><input style={inp(t)} type="number" value={form.value} onChange={e=>setForm(f=>({...f,value:e.target.value}))} placeholder={form.type==="PERCENTAGE"?"20":"5000"}/></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Min Order (NGN)</label><input style={inp(t)} type="number" value={form.minOrder} onChange={e=>setForm(f=>({...f,minOrder:e.target.value}))} placeholder="Optional"/></div>
          <div><label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Max Uses</label><input style={inp(t)} type="number" value={form.maxUses} onChange={e=>setForm(f=>({...f,maxUses:e.target.value}))} placeholder="Unlimited"/></div>
        </div>
        <div><label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Expires</label><input style={inp(t)} type="date" value={form.expiresAt} onChange={e=>setForm(f=>({...f,expiresAt:e.target.value}))}/></div>
      </div>
      <div className="flex gap-3 px-5 py-4" style={{borderTop:`1px solid ${t.border}`}}>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm" style={{border:`1px solid ${t.border}`,color:t.muted}}>Cancel</button>
        <button onClick={()=>mut.mutate()} disabled={!form.code||!form.value||mut.isPending} className="flex-[2] py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}>{mut.isPending?<><Loader2 size={13} className="animate-spin"/>Saving</>:isEdit?"Save Changes":"Create Coupon"}</button>
      </div>
    </motion.div>
  </div>);
}
export default function CouponsPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);const qc=useQueryClient();
  const[show,setShow]=useState(false);const[editing,setEditing]=useState(null);const[copied,setCopied]=useState("");
  const{data,isLoading}=useQuery({queryKey:["coupons",storeId],queryFn:()=>api.get(`/coupons/${storeId}`).then(r=>r.data.data),enabled:!!storeId});
  const delMut=useMutation({mutationFn:(id)=>api.delete(`/coupons/${storeId}/${id}`),onSuccess:()=>{toast.success("Deleted");qc.invalidateQueries({queryKey:["coupons"]});}});
  const copy=(code)=>{navigator.clipboard.writeText(code);setCopied(code);setTimeout(()=>setCopied(""),2000);};
  const coupons=data||[];
  return(<div className="max-w-4xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6">
      <div><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Coupons</h1><p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Discount codes for your customers</p></div>
      <button onClick={()=>{setEditing(null);setShow(true);}} className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}><Plus size={14}/><span className="hidden sm:inline">New</span> Coupon</button>
    </motion.div>
    {isLoading?Array.from({length:3}).map((_,i)=><div key={i} className="h-16 rounded-2xl mb-3 animate-pulse" style={{background:t.card}}/>):coupons.length===0?(
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="rounded-2xl flex flex-col items-center justify-center py-20 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <Tag size={36} style={{color:t.muted,opacity:0.3,marginBottom:14}}/><h3 className="font-bold text-sm mb-2" style={{color:t.text}}>No coupons yet</h3>
        <p className="text-xs mb-5" style={{color:t.muted,maxWidth:280,lineHeight:1.6}}>Create discount codes to reward customers and drive more sales.</p>
        <button onClick={()=>setShow(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}><Plus size={13}/>Create Coupon</button>
      </motion.div>
    ):(
      <div className="space-y-3">{coupons.map((c,i)=>(<motion.div key={c.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="flex items-center gap-4 p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"rgba(107,53,232,0.08)"}}>{c.type==="PERCENTAGE"?<Percent size={16} style={{color:V.v400}}/>:<Tag size={16} style={{color:V.v400}}/>}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-black text-sm font-mono" style={{color:t.text}}>{c.code}</span>
            <button onClick={()=>copy(c.code)} style={{color:copied===c.code?V.green:t.muted}}>{copied===c.code?<Check size={11}/>:<Copy size={11}/>}</button>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{background:c.active?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",color:c.active?V.green:V.red}}>{c.active?"Active":"Inactive"}</span>
          </div>
          <p className="text-xs" style={{color:t.muted}}>{c.type==="PERCENTAGE"?`${c.value}% off`:`NGN ${c.value?.toLocaleString()} off`}{c.minOrder?" · Min NGN "+c.minOrder?.toLocaleString():""}{c.usedCount!==undefined?" · "+c.usedCount+(c.maxUses?"/"+c.maxUses:"")+" uses":""}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={()=>{setEditing(c);setShow(true);}} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{border:`1px solid ${t.border}`,color:t.muted}}>Edit</button>
          <button onClick={()=>delMut.mutate(c.id)} className="p-1.5 rounded-lg" style={{border:`1px solid ${t.border}`,color:V.red}}><Trash2 size={12}/></button>
        </div>
      </motion.div>))}</div>
    )}
    <AnimatePresence>{show&&<Modal storeId={storeId} coupon={editing} onClose={()=>{setShow(false);setEditing(null);}} t={t} isDark={isDark}/>}</AnimatePresence>
  </div>);
}