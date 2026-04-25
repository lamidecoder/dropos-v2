"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Video,Sparkles,Copy,Check,RefreshCw}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const DURATIONS=[15,30,60];
const SEC_COLORS={HOOK:"#A78BFA",PROBLEM:"#F87171",REVEAL:"#34D399","SOCIAL PROOF":"#FBBF24",CTA:"#60A5FA"};
export default function TikTokScriptsPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);
  const[name,setName]=useState("");const[benefit,setBenefit]=useState("");const[dur,setDur]=useState(30);const[script,setScript]=useState(null);const[copied,setCopied]=useState(false);
  const gen=useMutation({mutationFn:()=>api.post("/intel/tiktok-script",{productName:name,productBenefit:benefit,duration:dur,storeId}),onSuccess:r=>setScript(r.data.data),onError:()=>{setScript({sections:[{label:"HOOK",text:`Wait - this ${name||"product"} changed everything!`,dur:Math.floor(dur*0.2)},{label:"PROBLEM",text:"I used to struggle with this daily...",dur:Math.floor(dur*0.25)},{label:"REVEAL",text:`${name||"This"} actually works in seconds.`,dur:Math.floor(dur*0.3)},{label:"SOCIAL PROOF",text:"Over 1,000 people already ordered. Real results.",dur:Math.floor(dur*0.15)},{label:"CTA",text:"Link in bio. Limited stock. Order now.",dur:Math.floor(dur*0.1)}]});toast("Demo script - connect backend for AI scripts",{icon:"✨"});}});
  const full=script?.sections?.map(s=>s.text).join(" ")||"";
  const copy=()=>{navigator.clipboard.writeText(full);setCopied(true);setTimeout(()=>setCopied(false),2000);};
  return(<div className="max-w-4xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-6">
      <div className="flex items-center gap-2 mb-1"><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>TikTok Scripts</h1><span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:"rgba(107,53,232,0.12)",color:V.v300,border:"1px solid rgba(107,53,232,0.2)"}}>AI</span></div>
      <p className="text-xs sm:text-sm" style={{color:t.muted}}>Generate scroll-stopping scripts for any product in seconds</p>
    </motion.div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="p-5 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <h3 className="font-bold text-sm mb-4" style={{color:t.text}}>Product Details</h3>
        <div className="space-y-3">
          <div><label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Product Name</label><input style={inp(t)} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. LED Face Mask"/></div>
          <div><label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Key Benefit</label><input style={inp(t)} value={benefit} onChange={e=>setBenefit(e.target.value)} placeholder="e.g. clears acne in 7 days"/></div>
          <div><label className="block text-xs font-semibold mb-2" style={{color:t.muted}}>Length</label><div className="flex gap-2">{DURATIONS.map(d=>(<button key={d} onClick={()=>setDur(d)} className="flex-1 py-2 rounded-xl text-xs font-bold transition-all" style={{background:dur===d?V.v500:t.faint,color:dur===d?"#fff":t.muted,border:`1px solid ${dur===d?V.v500:t.border}`}}>{d}s</button>))}</div></div>
        </div>
        <button onClick={()=>gen.mutate()} disabled={!name||!benefit||gen.isPending} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white mt-4 disabled:opacity-50" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}>{gen.isPending?<><RefreshCw size={13} className="animate-spin"/>Generating</>:<><Sparkles size={13}/>Generate Script</>}</button>
      </div>
      {script?(<motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="p-5 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-sm" style={{color:t.text}}>Your Script ({dur}s)</h3><button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{border:`1px solid ${t.border}`,color:copied?V.green:t.muted}}>{copied?<Check size={11}/>:<Copy size={11}/>}{copied?"Copied":"Copy all"}</button></div>
        <div className="space-y-3">{(script.sections||[]).map((sec,i)=>{const color=SEC_COLORS[sec.label]||V.v400;return(<div key={i} className="p-3 rounded-xl" style={{background:t.faint,border:`1px solid ${t.border}`}}><div className="flex items-center gap-2 mb-1.5"><span className="text-[10px] font-black tracking-wider px-2 py-0.5 rounded" style={{background:`${color}20`,color}}>{sec.label}</span>{sec.dur&&<span className="text-[10px]" style={{color:t.muted}}>{sec.dur}s</span>}</div><p className="text-sm leading-relaxed" style={{color:t.text}}>{sec.text}</p></div>);})}</div>
      </motion.div>):(
        <div className="rounded-2xl flex flex-col items-center justify-center py-16 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}><Video size={36} style={{color:t.muted,opacity:0.3,marginBottom:14}}/><p className="font-bold text-sm mb-1" style={{color:t.text}}>Script appears here</p><p className="text-xs" style={{color:t.muted}}>Fill in product details and click Generate</p></div>
      )}
    </div>
  </div>);
}