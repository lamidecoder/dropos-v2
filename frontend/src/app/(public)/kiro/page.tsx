"use client";
/**
 * /kiro — KIRO public page (fresh, no conflicts)
 *
 * Auth-aware:
 *   Logged in  → full KIROChat with slim header
 *   Visitor    → two-column marketing + live demo
 *
 * Light mode default. Dark mode toggle.
 * Responsive: single column on mobile.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuthStore } from "../../../store/auth.store";

const BASE = process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api";
const ACCENT = "#7C3AED";
const ACCENT_D = "#5B21B6";

const KIROChatFull = dynamic(() => import("../../../components/kai/KIROChat"), {
  ssr: false, loading: () => <Loader/>,
});

// ── tokens ───────────────────────────────────────────────────────────────────
const TL = {
  bg:"#F7F6F3",s1:"#FFFFFF",s2:"#EFEEEA",s3:"#E5E4DF",
  text:"#111827",sub:"#6B7280",muted:"#9CA3AF",
  border:"rgba(0,0,0,0.08)",borderH:"rgba(0,0,0,0.15)",
  accent:ACCENT,accentD:ACCENT_D,accentBg:ACCENT+"12",
  shadow:"0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)",
  green:"#059669",amber:"#D97706",
};
const TD = {
  bg:"#0D0D14",s1:"#13131F",s2:"#1A1A2A",s3:"#232338",
  text:"#F9F8FF",sub:"#A0A0C0",muted:"#606080",
  border:"rgba(255,255,255,0.07)",borderH:"rgba(255,255,255,0.13)",
  accent:"#9061F9",accentD:ACCENT,accentBg:ACCENT+"18",
  shadow:"0 1px 4px rgba(0,0,0,0.4)",
  green:"#10B981",amber:"#F59E0B",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
*{box-sizing:border-box}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:rgba(124,58,237,0.2);border-radius:2px}
::selection{background:rgba(124,58,237,0.18)}`;


// ── history helpers
const MAX_HIST=20;
function genId(){return Math.random().toString(36).slice(2,10)}
function timeAgo(ts){const d=(Date.now()-ts)/1000;if(d<60)return"just now";if(d<3600)return Math.floor(d/60)+"m ago";if(d<86400)return Math.floor(d/3600)+"h ago";return Math.floor(d/86400)+"d ago";}
function loadHist(){try{return JSON.parse(localStorage.getItem("kiro_hist")||"[]")}catch{return[]}}
function pushHist(id,title){const h=loadHist().filter(x=>x.id!==id);h.unshift({id,title:title.slice(0,52),ts:Date.now()});localStorage.setItem("kiro_hist",JSON.stringify(h.slice(0,20)))}
function deleteHist(id){localStorage.setItem("kiro_hist",JSON.stringify(loadHist().filter(x=>x.id!==id)))}

// ── primitives ───────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:"#F7F6F3"}}>
      <div style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${ACCENT}30`,borderTopColor:ACCENT,animation:"spin 0.8s linear infinite"}}/>
    </div>
  );
}

function Logo({size=28}:{size?:number}) {
  return (
    <div style={{width:size,height:size,borderRadius:Math.round(size*.27),background:`linear-gradient(145deg,${ACCENT},${ACCENT_D})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 2px 8px ${ACCENT}40`}}>
      <svg width={size*.44} height={size*.44} viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white" fillOpacity={.95}/>
      </svg>
    </div>
  );
}

function Btn({children,variant="ghost",onClick,style={},disabled=false}:{children:React.ReactNode;variant?:"ghost"|"primary"|"outline";onClick?:()=>void;style?:React.CSSProperties;disabled?:boolean}) {
  const T = TL;
  const base: React.CSSProperties = {padding:"7px 16px",borderRadius:8,fontSize:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",transition:"all 0.15s",opacity:disabled?.5:1,...style};
  if (variant==="primary") return <button onClick={onClick} disabled={disabled} style={{...base,border:"none",background:`linear-gradient(135deg,${ACCENT},${ACCENT_D})`,color:"#fff",boxShadow:`0 2px 10px ${ACCENT}35`}}>{children}</button>;
  if (variant==="outline") return <button onClick={onClick} disabled={disabled} style={{...base,border:`1px solid ${T.border}`,background:"transparent",color:T.sub}}>{children}</button>;
  return <button onClick={onClick} disabled={disabled} style={{...base,border:"none",background:"transparent",color:T.sub}}>{children}</button>;
}

function ModeBtn({mode,toggle,T}:{mode:"light"|"dark";toggle:()=>void;T:typeof TL}) {
  return (
    <button onClick={toggle} title="Toggle theme"
      style={{width:32,height:32,borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:T.sub,transition:"all 0.15s"}}
      onMouseEnter={e=>(e.currentTarget.style.background=T.accentBg)}
      onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
      {mode==="light"?"🌙":"☀️"}
    </button>
  );
}


// ── pulse dot
function PulseDot(){return(<span style={{position:"relative",display:"inline-flex",width:8,height:8,flexShrink:0}}><span style={{position:"absolute",inset:0,borderRadius:"50%",background:"#10B981",animation:"kping 1.6s ease-in-out infinite"}}/><span style={{width:8,height:8,borderRadius:"50%",background:"#10B981",position:"relative"}}/><style>{"@keyframes kping{0%,100%{transform:scale(1);opacity:.5}60%{transform:scale(2.4);opacity:0}}"}</style></span>);}


// ── auth nav dropdown
function AuthNavDropdown({T, onLogin}) {
  const {user, logout} = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  async function handleLogout() {
    setOpen(false);
    await logout();
    ["kiro_sid","accessToken","dropos-refresh-token"].forEach(k=>localStorage.removeItem(k));
  }
  if (!user) {
    return (
      <button onClick={onLogin}
        style={{padding:"6px 16px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#7C3AED,#5B21B6)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
        Get started free
      </button>
    );
  }
  const initials = (user.name||user.email||"U").slice(0,2).toUpperCase();
  const first = user.name?.split(" ")[0] || user.email?.split("@")[0] || "User";
  const accent = T.accent || "#7C3AED";
  const accentBg = T.accentBg || "rgba(124,58,237,0.1)";
  return (
    <div ref={ref} style={{position:"relative",flexShrink:0}}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{display:"flex",alignItems:"center",gap:7,padding:"4px 10px 4px 4px",borderRadius:9,border:"1px solid "+T.border,background:T.s2,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}
        onMouseEnter={e=>(e.currentTarget.style.borderColor=T.borderH)}
        onMouseLeave={e=>(e.currentTarget.style.borderColor=T.border)}>
        <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#7C3AED,#5B21B6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",flexShrink:0}}>{initials}</div>
        <span style={{fontSize:12,fontWeight:600,color:T.text,maxWidth:72,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{first}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0,y:5,scale:.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:4,scale:.96}} transition={{duration:.13}}
            style={{position:"absolute",right:0,top:"calc(100% + 7px)",minWidth:180,borderRadius:13,background:T.s1,border:"1px solid "+T.border,boxShadow:"0 10px 36px rgba(0,0,0,0.16)",overflow:"hidden",zIndex:300}}>
            <div style={{padding:"11px 14px",borderBottom:"1px solid "+T.border}}>
              <p style={{fontSize:12,fontWeight:700,color:T.text}}>{user.name||"User"}</p>
              <p style={{fontSize:11,color:T.muted,marginTop:1}}>{user.email}</p>
            </div>
            <Link href="/dashboard" style={{textDecoration:"none"}}>
              <button style={{width:"100%",padding:"10px 14px",display:"flex",alignItems:"center",gap:9,background:"none",border:"none",cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}
                onMouseEnter={e=>(e.currentTarget.style.background=accentBg)}
                onMouseLeave={e=>(e.currentTarget.style.background="none")}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
                <span style={{fontSize:13,fontWeight:600,color:T.text}}>Dashboard</span>
              </button>
            </Link>
            <button onClick={handleLogout}
              style={{width:"100%",padding:"10px 14px",display:"flex",alignItems:"center",gap:9,background:"none",border:"none",borderTop:"1px solid "+T.border,cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}
              onMouseEnter={e=>(e.currentTarget.style.background="rgba(220,38,38,.07)")}
              onMouseLeave={e=>(e.currentTarget.style.background="none")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span style={{fontSize:13,fontWeight:600,color:"#DC2626"}}>Log out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ── history sidebar
function HistorySidebar({history, activeId, onSelect, onNew, onDelete, open, onClose, T}) {
  return (
    <>
      <AnimatePresence>
        {open && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",zIndex:90,backdropFilter:"blur(2px)"}}
          onClick={onClose}/>}
      </AnimatePresence>
      <motion.div animate={{x:open?0:-280}} initial={{x:-280}} transition={{type:"spring",stiffness:340,damping:34}}
        style={{position:"fixed",left:0,top:0,bottom:0,width:260,background:T.s1,borderRight:"1px solid "+T.border,zIndex:100,display:"flex",flexDirection:"column",boxShadow:"4px 0 24px rgba(0,0,0,0.1)"}}>
        <div style={{padding:"13px 14px",borderBottom:"1px solid "+T.border,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><Logo size={24}/><span style={{fontSize:14,fontWeight:700,color:T.text}}>Chat history</span></div>
          <button onClick={onClose}
            style={{width:26,height:26,borderRadius:6,border:"1px solid "+T.border,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.muted}}
            onMouseEnter={e=>(e.currentTarget.style.background=T.s2)} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{padding:"10px 10px 6px",flexShrink:0}}>
          <button onClick={onNew}
            style={{width:"100%",padding:"8px 0",borderRadius:9,border:"1.5px dashed "+T.borderH,background:T.accentBg,color:T.accent,fontWeight:600,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:7,justifyContent:"center",fontFamily:"inherit"}}
            onMouseEnter={e=>(e.currentTarget.style.opacity="0.8")} onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            New chat
          </button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"4px 8px 16px"}}>
          {history.length===0 && <p style={{fontSize:12,color:T.muted,textAlign:"center",marginTop:28,lineHeight:1.7}}>No chats yet.<br/>Start a conversation.</p>}
          {history.map(s => (
            <div key={s.id} onClick={()=>onSelect(s.id)}
              style={{display:"flex",alignItems:"center",gap:7,padding:"8px 10px",borderRadius:9,marginBottom:2,background:s.id===activeId?T.accentBg:"transparent",cursor:"pointer",transition:"background .14s",position:"relative"}}
              onMouseEnter={e=>{if(s.id!==activeId)(e.currentTarget).style.background=T.s2;}}
              onMouseLeave={e=>{if(s.id!==activeId)(e.currentTarget).style.background="transparent";}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={s.id===activeId?T.accent:T.muted} strokeWidth="2" strokeLinecap="round" style={{flexShrink:0}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:12,fontWeight:600,color:s.id===activeId?T.accent:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.title||"New conversation"}</p>
                <p style={{fontSize:10,color:T.muted,marginTop:1}}>{timeAgo(s.ts)}</p>
              </div>
              <button onClick={e=>{e.stopPropagation();onDelete(s.id);}} className="ksdel"
                style={{flexShrink:0,width:19,height:19,borderRadius:5,border:"none",background:"rgba(220,38,38,.1)",color:"#DC2626",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity .15s"}}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          ))}
          <style>{"div:hover > .ksdel { opacity: 1 !important; }"}</style>
        </div>
      </motion.div>
    </>
  );
}

// ── auth modal ────────────────────────────────────────────────────────────────
function AuthModal({onClose,onSuccess,T}:{onClose:()=>void;onSuccess:(sid:string)=>void;T:typeof TL}) {
  const [mode,setMode]=useState<"register"|"login">("register");
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [pass,setPass]=useState("");
  const [err,setErr]=useState(""); const [busy,setBusy]=useState(false);
  const inp:React.CSSProperties={width:"100%",padding:"10px 14px",borderRadius:9,border:`1px solid ${T.border}`,background:T.s2,color:T.text,fontSize:14,fontFamily:"'Inter',sans-serif",outline:"none",transition:"border-color 0.15s,box-shadow 0.15s"};
  async function submit(){
    if(!email||!pass)return; setBusy(true); setErr("");
    try{
      const body=mode==="register"?{name,email,password:pass}:{email,password:pass};
      const res=await fetch(`${BASE}/auth/${mode}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const d=await res.json();
      if(!res.ok){setErr(d.message||"Something went wrong");return;}
      const{accessToken,refreshToken:rt,user}=d.data||{};
      if(rt)localStorage.setItem("dropos-refresh-token",rt);
      if(accessToken){
        try{const{useAuthStore}=await import("../../../store/auth.store");useAuthStore.getState().setUser(user);useAuthStore.getState().setAccessToken(accessToken);}catch{}
        onSuccess(user?.stores?.[0]?.id||"");
      }
    }catch{setErr("Connection error");}finally{setBusy(false);}
  }
  return (
    <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"rgba(0,0,0,0.45)",backdropFilter:"blur(10px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <motion.div initial={{opacity:0,y:10,scale:.97}} animate={{opacity:1,y:0,scale:1}} transition={{type:"spring",stiffness:320,damping:28}}
        style={{width:"100%",maxWidth:350,borderRadius:18,background:T.s1,border:`1px solid ${T.border}`,padding:"26px 22px",boxShadow:`0 24px 60px rgba(0,0,0,0.2)`}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Logo size={38}/></div>
          <h2 style={{fontSize:19,fontWeight:700,color:T.text,margin:"0 0 4px",letterSpacing:"-0.3px"}}>{mode==="register"?"Create account":"Welcome back"}</h2>
          <p style={{fontSize:12,color:T.muted}}>{mode==="register"?"Free · No card":"Sign in to KIRO"}</p>
        </div>
        <div style={{display:"flex",gap:2,padding:3,borderRadius:9,background:T.s2,marginBottom:14}}>
          {(["register","login"] as const).map(m=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,padding:"6px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:500,transition:"all 0.15s",background:mode===m?T.s1:"transparent",color:mode===m?T.text:T.muted,boxShadow:mode===m?T.shadow:"none"}}>
              {m==="register"?"Sign up":"Sign in"}
            </button>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {mode==="register"&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" autoFocus style={inp} onFocus={e=>{e.currentTarget.style.borderColor=ACCENT;e.currentTarget.style.boxShadow=`0 0 0 3px ${ACCENT}15`;}} onBlur={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.boxShadow="none";}}/>}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" autoFocus={mode==="login"} style={inp} onFocus={e=>{e.currentTarget.style.borderColor=ACCENT;e.currentTarget.style.boxShadow=`0 0 0 3px ${ACCENT}15`;}} onBlur={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.boxShadow="none";}}/>
          <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password" style={inp} onFocus={e=>{e.currentTarget.style.borderColor=ACCENT;e.currentTarget.style.boxShadow=`0 0 0 3px ${ACCENT}15`;}} onBlur={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.boxShadow="none";}} onKeyDown={e=>e.key==="Enter"&&submit()}/>
          {err&&<p style={{fontSize:12,color:"#DC2626",textAlign:"center",margin:0}}>{err}</p>}
          <button onClick={submit} disabled={busy||!email||!pass} style={{padding:"11px",borderRadius:9,border:"none",cursor:busy||!email||!pass?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",fontSize:14,fontWeight:600,marginTop:2,background:busy||!email||!pass?T.s3:`linear-gradient(135deg,${ACCENT},${ACCENT_D})`,color:busy||!email||!pass?T.muted:"#fff",transition:"all 0.2s",boxShadow:!busy&&email&&pass?`0 4px 14px ${ACCENT}30`:"none"}}>
            {busy?"…":mode==="register"?"Create account →":"Sign in →"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── demo chat ─────────────────────────────────────────────────────────────────
type Msg={id:string;role:"user"|"ai";text:string;streaming?:boolean};
const STARTERS=["What can KIRO do?","I sell fashion in Lagos","Find trending products","How to import from AliExpress?"];

function DemoChat({T,onAuthNeeded}:{T:typeof TL;onAuthNeeded:()=>void}) {
  const [msgs,setMsgs]=useState<Msg[]>([{id:"0",role:"ai",text:"I'm KIRO — your AI business partner. I help African dropshippers source products, write ads, fulfill orders, and understand their market. What do you sell?"}]);
  const [input,setInput]=useState(""); const [loading,setLoading]=useState(false); const [count,setCount]=useState(0);
  const endRef=useRef<HTMLDivElement>(null); const taRef=useRef<HTMLTextAreaElement>(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  const send=useCallback(async(text?:string)=>{
    const msg=(text||input).trim(); if(!msg||loading)return;
    setInput(""); if(taRef.current)taRef.current.style.height="auto";
    const n=count+1; setCount(n);
    if(n>=5){setMsgs(p=>[...p,{id:`u${Date.now()}`,role:"user",text:msg}]);setTimeout(onAuthNeeded,200);return;}
    const kid=`k${Date.now()}`;
    setMsgs(p=>[...p,{id:`u${Date.now()}`,role:"user",text:msg},{id:kid,role:"ai",text:"",streaming:true}]);
    setLoading(true);
    try{
      const res=await fetch(`${BASE}/kai/public-chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:msg})});
      if(!res.ok||!res.body)throw new Error();
      const reader=res.body.getReader();const dec=new TextDecoder();let full="";
      while(true){const{done,value}=await reader.read();if(done)break;for(const line of dec.decode(value,{stream:true}).split("\n")){if(!line.startsWith("data: "))continue;try{const p=JSON.parse(line.slice(6));if(p.token){full+=p.token;setMsgs(m=>m.map(x=>x.id===kid?{...x,text:full}:x));endRef.current?.scrollIntoView({behavior:"smooth"});}}catch{}}}
      setMsgs(m=>m.map(x=>x.id===kid?{...x,streaming:false,text:full||"Create a free account to unlock the full KIRO experience."}:x));
    }catch{setMsgs(m=>m.map(x=>x.id===kid?{...x,streaming:false,text:"Create a free account to get started with KIRO."}:x));}
    finally{setLoading(false);}
  },[input,loading,count,onAuthNeeded]);

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",minHeight:0}}>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 8px",minHeight:0}}>
        {msgs.map(msg=>(
          <motion.div key={msg.id} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{duration:0.2}}
            style={{display:"flex",flexDirection:msg.role==="user"?"row-reverse":"row",gap:7,alignItems:"flex-end",marginBottom:12}}>
            {msg.role==="ai"&&<Logo size={22}/>}
            <div style={{maxWidth:"82%",padding:msg.role==="user"?"9px 14px":"0",borderRadius:msg.role==="user"?"16px 16px 4px 16px":"0",background:msg.role==="user"?`linear-gradient(145deg,${ACCENT},${ACCENT_D})`:"transparent",color:msg.role==="user"?"#fff":T.text,fontSize:14,lineHeight:1.68,boxShadow:msg.role==="user"?`0 2px 8px ${ACCENT}28`:"none"}}>
              {msg.streaming&&!msg.text?(
                <div style={{display:"flex",gap:4,padding:"3px 0"}}>
                  {[0,1,2].map(i=><motion.div key={i} style={{width:5,height:5,borderRadius:"50%",background:T.muted}} animate={{y:[0,-4,0],opacity:[0.4,1,0.4]}} transition={{duration:0.6,repeat:Infinity,delay:i*0.12}}/>)}
                </div>
              ):(
                <span>{msg.text}{msg.streaming&&<motion.span animate={{opacity:[1,0]}} transition={{duration:0.5,repeat:Infinity}} style={{display:"inline-block",width:2,height:13,background:T.muted,marginLeft:1,verticalAlign:"text-bottom"}}/>}</span>
              )}
            </div>
          </motion.div>
        ))}
        {count>=2&&(
          <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} style={{margin:"4px 0 10px",padding:"12px 14px",borderRadius:11,background:T.accentBg,border:`1px solid ${T.border}`}}>
            <p style={{fontSize:13,fontWeight:600,color:T.text,margin:"0 0 3px"}}>KIRO is better with your store</p>
            <p style={{fontSize:12,color:T.muted,margin:"0 0 8px"}}>Free account unlocks full product import, analytics, and AI actions.</p>
            <button onClick={onAuthNeeded} style={{padding:"6px 14px",borderRadius:7,border:"none",background:`linear-gradient(135deg,${ACCENT},${ACCENT_D})`,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>Start free →</button>
          </motion.div>
        )}
        <div ref={endRef}/>
      </div>
      {msgs.length<=1&&(
        <div style={{padding:"0 16px 8px",display:"flex",gap:6,flexWrap:"wrap"}}>
          {STARTERS.map(s=><button key={s} onClick={()=>send(s)} style={{padding:"5px 11px",borderRadius:99,border:`1px solid ${T.border}`,background:"transparent",color:T.sub,fontSize:12,cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"all 0.15s",whiteSpace:"nowrap"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderH;e.currentTarget.style.color=T.text;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.sub;}}>{s}</button>)}
        </div>
      )}
      <div style={{padding:"8px 14px 14px",flexShrink:0}}>
        <div style={{display:"flex",gap:8,alignItems:"flex-end",borderRadius:12,border:`1px solid ${T.border}`,background:T.s1,padding:"7px 9px",boxShadow:T.shadow,transition:"border-color 0.15s"}} onFocusCapture={e=>(e.currentTarget as HTMLDivElement).style.borderColor=ACCENT} onBlurCapture={e=>(e.currentTarget as HTMLDivElement).style.borderColor=T.border}>
          <textarea ref={taRef} value={input} onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,90)+"px";}} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Ask KIRO anything…" rows={1} style={{flex:1,background:"transparent",border:"none",outline:"none",color:T.text,fontSize:14,fontFamily:"'Inter',sans-serif",lineHeight:1.5,resize:"none",maxHeight:90,overflowY:"auto",padding:"2px 0"}}/>
          <motion.button onClick={()=>send()} whileTap={{scale:.88}} disabled={loading||!input.trim()} style={{width:28,height:28,borderRadius:8,border:"none",cursor:input.trim()&&!loading?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.18s",background:input.trim()&&!loading?`linear-gradient(135deg,${ACCENT},${ACCENT_D})`:T.s3,opacity:input.trim()&&!loading?1:0.45}}>
            {loading?<div style={{width:11,height:11,borderRadius:"50%",border:`2px solid ${ACCENT}30`,borderTopColor:ACCENT,animation:"spin 0.7s linear infinite"}}/>:<svg width={11} height={11} viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────
async function tryAutoLogin(){
  if(typeof window==="undefined")return null;
  const r=localStorage.getItem("dropos-refresh-token"); if(!r)return null;
  try{
    const res=await fetch(`${BASE}/auth/refresh`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refreshToken:r})});
    if(!res.ok)return null;
    const{data}=await res.json(); if(!data?.accessToken)return null;
    if(data.refreshToken)localStorage.setItem("dropos-refresh-token",data.refreshToken);
    try{const{useAuthStore}=await import("../../../store/auth.store");useAuthStore.getState().setUser(data.user);useAuthStore.getState().setAccessToken(data.accessToken);}catch{}
    return{storeId:data.user?.stores?.[0]?.id||""};
  }catch{return null;}
}

const CAPS=[
  {icon:"🌐",text:"Import from any website"},
  {icon:"📊",text:"Live store analytics"},
  {icon:"⚡",text:"Actions from chat"},
  {icon:"🔥",text:"Market intelligence"},
  {icon:"📣",text:"AI ad copy"},
  {icon:"🎯",text:"Goals & pulse alerts"},
];

export default function KIROPage() {
  const{user}=useAuthStore();
  const[authState,setAuthState]=useState("checking");
  const[history,setHistory]=useState([]);
  const[activeSession,setActiveSession]=useState("");
  const[sidebarOpen,setSidebarOpen]=useState(false);
  function refreshHist(){setHistory(loadHist());}
  function startNew(){const id=genId();setActiveSession(id);setSidebarOpen(false);}
  function pickSession(id){setActiveSession(id);setSidebarOpen(false);}
  function removeSession(id){deleteHist(id);refreshHist();if(id===activeSession)startNew();}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{refreshHist();setActiveSession(genId());},[]);
  const[storeId,  setStoreId]  =useState("");
  const[showAuth, setShowAuth] =useState(false);
  const[mode,     setMode]     =useState<"light"|"dark">("light");
  const T=mode==="light"?TL:TD;

  useEffect(()=>{
    const saved=localStorage.getItem("kiro-mode") as "light"|"dark"|null;
    if(saved)setMode(saved);
    tryAutoLogin().then(r=>{if(r){setStoreId(r.storeId);setAuthState("authed");}else setAuthState("guest");});
  },[]);

  const toggleMode=()=>{const n=mode==="light"?"dark":"light";setMode(n);localStorage.setItem("kiro-mode",n);};
  const handleAuth=(sid:string)=>{setStoreId(sid);setAuthState("authed");setShowAuth(false);};

  if(authState==="checking") return(
    <div style={{height:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:TL.bg}}>
      <style>{FONTS}</style>
      <div style={{width:26,height:26,borderRadius:"50%",border:`2px solid ${ACCENT}30`,borderTopColor:ACCENT,animation:"spin 0.8s linear infinite"}}/>
    </div>
  );

  if(authState==="authed") return(
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",background:T.bg,overflow:"hidden",fontFamily:"'Inter',sans-serif"}}>
      <style>{FONTS+"body,html{background:"+T.bg+"}"}</style>
      <HistorySidebar history={history} activeId={activeSession} onSelect={pickSession} onNew={startNew} onDelete={removeSession} open={sidebarOpen} onClose={()=>setSidebarOpen(false)} T={T}/>
      <header style={{height:48,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",borderBottom:"1px solid "+T.border,background:T.s1,flexShrink:0,boxShadow:T.shadow,gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
          <button onClick={()=>setSidebarOpen(o=>!o)} style={{width:30,height:30,borderRadius:7,border:"1px solid "+T.border,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.sub,flexShrink:0}} onMouseEnter={e=>(e.currentTarget.style.background=T.s2)} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg></button>
          <Logo size={24}/><span style={{fontSize:14,fontWeight:700,color:T.text,flexShrink:0}}>KIRO</span><PulseDot/>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
          <ModeBtn mode={mode} toggle={toggleMode} T={T}/>
          <AuthNavDropdown T={T} onLogin={()=>setShowAuth(true)}/>
        </div>
      </header>
      <div style={{flex:1,overflow:"hidden",minHeight:0}}><KIROChatFull storeId={storeId}/></div>
    </div>
  );

  return(
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",background:T.bg,overflow:"hidden",fontFamily:"'Inter',sans-serif",transition:"background 0.25s"}}>
      <style>{FONTS+`body,html{background:${T.bg}}`}</style>
      {showAuth&&<AuthModal T={T} onClose={()=>setShowAuth(false)} onSuccess={handleAuth}/>}

      {/* Nav */}
      <nav style={{height:52,display:"flex",alignItems:"center",padding:"0 20px",borderBottom:`1px solid ${T.border}`,background:T.s1,flexShrink:0,boxShadow:T.shadow}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
          <Logo size={26}/>
          <span style={{fontSize:15,fontWeight:700,color:T.text}}>KIRO</span>
          <span style={{fontSize:9,padding:"2px 6px",borderRadius:4,background:T.accentBg,color:T.accent,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",border:`1px solid ${T.border}`}}>Beta</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <ModeBtn mode={mode} toggle={toggleMode} T={T}/>
          <button onClick={()=>setShowAuth(true)} style={{padding:"6px 14px",borderRadius:8,border:"1px solid "+T.border,background:"transparent",color:T.sub,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"all 0.15s",whiteSpace:"nowrap"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderH;e.currentTarget.style.color=T.text;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.sub;}}>Sign in</button>
          <button onClick={()=>setShowAuth(true)} style={{padding:"6px 16px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#7C3AED,#5B21B6)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif",whiteSpace:"nowrap"}}>Get started free</button>
        </div>
      </nav>

      {/* Content */}
      <div style={{flex:1,display:"grid",gridTemplateColumns:"360px 1fr",minHeight:0,overflow:"hidden"}} className="kiro-grid">

        {/* Left */}
        <div style={{borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"32px 24px",overflow:"hidden"}} className="kiro-left">
          <div>
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.05}}>
              <p style={{fontSize:10,fontWeight:700,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>For African dropshippers</p>
              <h1 style={{fontSize:30,fontWeight:700,color:T.text,lineHeight:1.18,letterSpacing:"-0.5px",marginBottom:12}}>Your AI<br/>commerce<br/>partner.</h1>
              <p style={{fontSize:14,color:T.sub,lineHeight:1.7,marginBottom:24,maxWidth:270}}>Import products, write ad copy, manage orders, and understand your market — all from one conversation.</p>
            </motion.div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {CAPS.map((c,i)=>(
                <motion.div key={c.text} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:.15+i*.05}}
                  style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:9,background:T.s1,border:`1px solid ${T.border}`}}>
                  <span style={{fontSize:14,flexShrink:0}}>{c.icon}</span>
                  <span style={{fontSize:12,fontWeight:500,color:T.text}}>{c.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.5}}
            style={{padding:"13px 14px",borderRadius:11,background:T.s1,border:`1px solid ${T.border}`,marginTop:20}}>
            <p style={{fontSize:13,color:T.sub,lineHeight:1.6,fontStyle:"italic",marginBottom:6}}>"KIRO found me 3 winning products and wrote all my TikTok scripts. First ₦100k month done."</p>
            <p style={{fontSize:11,color:T.muted,fontWeight:600}}>Adaeze O. · Lagos, Nigeria</p>
          </motion.div>
        </div>

        {/* Right: live demo */}
        <div style={{display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
          <div style={{height:42,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 18px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:T.green,boxShadow:`0 0 6px ${T.green}`}}/>
              <span style={{fontSize:12,fontWeight:500,color:T.sub}}>Live demo</span>
            </div>
            <button onClick={()=>setShowAuth(true)} style={{fontSize:12,fontWeight:600,color:T.accent,background:"transparent",border:"none",cursor:"pointer",fontFamily:"'Inter',sans-serif",padding:"3px 8px",borderRadius:5,transition:"background 0.15s"}} onMouseEnter={e=>(e.currentTarget.style.background=T.accentBg)} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
              Get full access →
            </button>
          </div>
          <div style={{flex:1,minHeight:0,overflow:"hidden"}}>
            <DemoChat T={T} onAuthNeeded={()=>setShowAuth(true)}/>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:660px){.kiro-grid{grid-template-columns:1fr!important}.kiro-left{display:none!important}}`}</style>
    </div>
  );
}
