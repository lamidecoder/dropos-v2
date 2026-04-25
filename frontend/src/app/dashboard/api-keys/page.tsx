"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Key,Plus,Trash2,Copy,Check,X,Shield,Eye,EyeOff}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const PERMS=["orders:read","orders:write","products:read","products:write","customers:read","analytics:read","webhooks:write"];
export default function ApiKeysPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);const qc=useQueryClient();
  const[name,setName]=useState("");const[perms,setPerms]=useState(["orders:read"]);
  const[newKey,setNewKey]=useState(null);const[copied,setCopied]=useState("");const[revealed,setRevealed]=useState([]);
  const{data}=useQuery({queryKey:["api-keys",storeId],queryFn:()=>api.get(`/api-keys/${storeId}`).then(r=>r.data.data),enabled:!!storeId});
  const createMut=useMutation({mutationFn:()=>api.post(`/api-keys/${storeId}`,{name,permissions:perms}),onSuccess:r=>{setNewKey(r.data.data?.key||r.data.key);qc.invalidateQueries({queryKey:["api-keys"]});setName("");},onError:(e)=>toast.error(e.response?.data?.message||"Backend offline")});
  const delMut=useMutation({mutationFn:(id)=>api.delete(`/api-keys/${storeId}/${id}`),onSuccess:()=>{toast.success("Key revoked");qc.invalidateQueries({queryKey:["api-keys"]});}});
  const copy=(val,id)=>{navigator.clipboard.writeText(val);setCopied(id);setTimeout(()=>setCopied(""),2000);};
  const keys=data||[];
  return(<div className="max-w-4xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-6">
      <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>API Keys</h1>
      <p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Authenticate your integrations with the DropOS API</p>
    </motion.div>
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="p-5 rounded-2xl mb-5" style={{background:t.card,border:`1px solid ${t.border}`}}>
      <h3 className="font-bold text-sm mb-4" style={{color:t.text}}>Create New Key</h3>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input style={{...inp(t),flex:1}} value={name} onChange={e=>setName(e.target.value)} placeholder="Key name, e.g. Zapier Integration"/>
        <button onClick={()=>createMut.mutate()} disabled={!name||createMut.isPending} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex-shrink-0" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}><Plus size={13}/>{createMut.isPending?"Creating...":"Create Key"}</button>
      </div>
      <p className="text-xs font-semibold mb-2" style={{color:t.muted}}>Permissions</p>
      <div className="flex flex-wrap gap-1.5">
        {PERMS.map(p=>{const on=perms.includes(p);return(<button key={p} onClick={()=>setPerms(prev=>on?prev.filter(x=>x!==p):[...prev,p])} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all" style={{background:on?"rgba(107,53,232,0.12)":t.faint,border:`1px solid ${on?"rgba(107,53,232,0.3)":t.border}`,color:on?V.v300:t.muted}}>{on&&<Check size={9} strokeWidth={3}/>}{p}</button>);})}
      </div>
    </motion.div>
    <AnimatePresence>{newKey&&(<motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="p-4 rounded-2xl mb-5" style={{background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.25)"}}>
      <div className="flex items-center gap-2 mb-2"><Shield size={14} style={{color:V.green}}/><p className="text-sm font-bold" style={{color:V.green}}>Copy now - never shown again</p></div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs px-3 py-2 rounded-lg font-mono break-all" style={{background:t.faint,color:t.text}}>{newKey}</code>
        <button onClick={()=>copy(newKey,"new")} className="p-2 rounded-lg flex-shrink-0" style={{border:`1px solid ${t.border}`,color:copied==="new"?V.green:t.muted}}>{copied==="new"?<Check size={13}/>:<Copy size={13}/>}</button>
        <button onClick={()=>setNewKey(null)} className="p-2 rounded-lg flex-shrink-0" style={{border:`1px solid ${t.border}`,color:t.muted}}><X size={13}/></button>
      </div>
    </motion.div>)}</AnimatePresence>
    {keys.length===0&&!newKey?(<div className="rounded-2xl flex flex-col items-center justify-center py-16 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}><Key size={36} style={{color:t.muted,opacity:0.3,marginBottom:14}}/><p className="font-bold text-sm mb-1" style={{color:t.text}}>No API keys</p><p className="text-xs" style={{color:t.muted}}>Create a key above to integrate with DropOS</p></div>):(
      <div className="space-y-3">{keys.map((k,i)=>(<motion.div key={k.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="flex items-center gap-3 p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"rgba(107,53,232,0.08)"}}><Key size={15} style={{color:V.v400}}/></div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{color:t.text}}>{k.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-xs font-mono" style={{color:t.muted}}>{revealed.includes(k.id)?k.key||"dropos_sk_live_...":k.maskedKey||"dropos_sk_live_••••••••"}</code>
            <button onClick={()=>setRevealed(p=>p.includes(k.id)?p.filter(x=>x!==k.id):[...p,k.id])} style={{color:t.muted,background:"none",border:"none",cursor:"pointer"}}>{revealed.includes(k.id)?<EyeOff size={11}/>:<Eye size={11}/>}</button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] px-2 py-1 rounded-full font-semibold" style={{background:"rgba(16,185,129,0.1)",color:V.green}}>Active</span>
          <button onClick={()=>copy(k.key||k.maskedKey,k.id)} className="p-2 rounded-lg" style={{border:`1px solid ${t.border}`,color:copied===k.id?V.green:t.muted}}>{copied===k.id?<Check size={12}/>:<Copy size={12}/>}</button>
          <button onClick={()=>delMut.mutate(k.id)} className="p-2 rounded-lg" style={{border:`1px solid ${t.border}`,color:V.red}}><Trash2 size={12}/></button>
        </div>
      </motion.div>))}</div>
    )}
  </div>);
}