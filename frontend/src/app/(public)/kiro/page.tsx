"use client";
/**
 * KIRO — The Commerce Intelligence
 * 
 * Design System: "Obsidian Commerce"
 * Direction: Stripe-meets-Linear for African markets. 
 * Typogaphy: Bricolage Grotesque (display) + DM Sans (body)
 * Surface hierarchy: #080811 → #0F0E1C → #141325
 * Accent: deep violet #6D28D9 used exactly where it matters, nowhere else
 * Premium = behavior density: every hover, focus, active state crafted
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";

const API = process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api";
const KIROChatFull = dynamic(() => import("../../../components/kai/KIROChat"), { ssr:false });

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:      "#080811",
  s1:      "#0F0E1C",
  s2:      "#141325",
  s3:      "#1A192E",
  accent:  "#6D28D9",
  accentL: "#7C3AED",
  accentD: "#4C1D95",
  green:   "#059669",
  amber:   "#D97706",
  red:     "#DC2626",
  text:    "#F8F7FF",
  t2:      "rgba(248,247,255,0.65)",
  t3:      "rgba(248,247,255,0.35)",
  t4:      "rgba(248,247,255,0.18)",
  border:  "rgba(255,255,255,0.055)",
  borderH: "rgba(255,255,255,0.1)",
} as const;

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; overflow: hidden; }
  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(109,40,217,0.25); border-radius: 99px; }
  ::selection { background: rgba(109,40,217,0.35); color: #F8F7FF; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

// ── Auto-login ────────────────────────────────────────────────────────────────
async function tryAutoLogin() {
  if (typeof window === "undefined") return null;
  const r = localStorage.getItem("dropos-refresh-token");
  if (!r) return null;
  try {
    const res = await fetch(`${API}/auth/refresh`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ refreshToken:r }),
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    if (!data?.accessToken) return null;
    if (data.refreshToken) localStorage.setItem("dropos-refresh-token", data.refreshToken);
    try {
      const { useAuthStore } = await import("../../../store/auth.store");
      useAuthStore.getState().setUser(data.user);
      useAuthStore.getState().setAccessToken(data.accessToken);
    } catch {}
    return { storeId: data.user?.stores?.[0]?.id || "", name: data.user?.name || "" };
  } catch { return null; }
}

// ── Logo mark ─────────────────────────────────────────────────────────────────
function KIROLogo({ size = 28 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.28),
      background: `linear-gradient(145deg, ${T.accentL}, ${T.accentD})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 0 0 1px rgba(109,40,217,0.4), 0 ${size/6}px ${size}px rgba(109,40,217,0.35)`,
      flexShrink: 0,
    }}>
      <svg width={size*0.44} height={size*0.44} viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h9l-1 8L21 10h-9L13 2z" fill="white" fillOpacity={0.95}/>
      </svg>
    </div>
  );
}

// ── Auth modal ────────────────────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess }: { onClose:()=>void; onSuccess:(sid:string)=>void }) {
  const [mode, setMode]   = useState<"login"|"register">("register");
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [err, setErr]     = useState("");
  const [busy, setBusy]   = useState(false);

  const inp: React.CSSProperties = {
    width:"100%", padding:"10px 14px", borderRadius:8,
    border:`1px solid ${T.border}`, background:T.s2, color:T.text,
    fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none",
    transition:"border-color 0.15s",
  };

  async function submit() {
    if (!email||!pass) return;
    setBusy(true); setErr("");
    try {
      const body = mode==="register" ? {name,email,password:pass} : {email,password:pass};
      const res  = await fetch(`${API}/auth/${mode}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const d    = await res.json();
      if (!res.ok) { setErr(d.message||"Something went wrong"); return; }
      const { accessToken, refreshToken: rt, user } = d.data||{};
      if (rt) localStorage.setItem("dropos-refresh-token", rt);
      if (accessToken) {
        try {
          const {useAuthStore} = await import("../../../store/auth.store");
          useAuthStore.getState().setUser(user);
          useAuthStore.getState().setAccessToken(accessToken);
        } catch {}
        onSuccess(user?.stores?.[0]?.id||"");
      }
    } catch { setErr("Connection error"); } finally { setBusy(false); }
  }

  return (
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"rgba(8,8,17,0.85)",backdropFilter:"blur(16px)"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <motion.div initial={{opacity:0,y:12,scale:0.97}} animate={{opacity:1,y:0,scale:1}}
        transition={{type:"spring",stiffness:320,damping:28}}
        style={{width:"100%",maxWidth:360,borderRadius:16,background:T.s1,border:`1px solid ${T.border}`,padding:"28px 24px",boxShadow:`0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${T.border}`}}>

        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
            <KIROLogo size={42}/>
          </div>
          <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:20,fontWeight:700,color:T.text,letterSpacing:"-0.4px",marginBottom:4}}>
            {mode==="register" ? "Create your free account" : "Welcome back"}
          </h2>
          <p style={{fontSize:13,color:T.t3,fontFamily:"'DM Sans',sans-serif"}}>
            {mode==="register" ? "No card required · Full KIRO access" : "Continue with KIRO"}
          </p>
        </div>

        {/* Tab */}
        <div style={{display:"flex",gap:2,padding:3,borderRadius:9,background:T.s2,marginBottom:16}}>
          {(["register","login"] as const).map(m=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}}
              style={{flex:1,padding:"7px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
                fontSize:13,fontWeight:500,transition:"all 0.15s",
                background:mode===m?T.s3:"transparent",
                color:mode===m?T.text:T.t3}}>
              {m==="register"?"Sign up":"Sign in"}
            </button>
          ))}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {mode==="register"&&(
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" autoFocus
              style={inp} onFocus={e=>(e.currentTarget.style.borderColor=T.borderH)}
              onBlur={e=>(e.currentTarget.style.borderColor=T.border)}/>
          )}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email"
            autoFocus={mode==="login"} style={inp}
            onFocus={e=>(e.currentTarget.style.borderColor=T.borderH)}
            onBlur={e=>(e.currentTarget.style.borderColor=T.border)}/>
          <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password"
            style={inp} onFocus={e=>(e.currentTarget.style.borderColor=T.borderH)}
            onBlur={e=>(e.currentTarget.style.borderColor=T.border)}
            onKeyDown={e=>e.key==="Enter"&&submit()}/>

          <AnimatePresence>
            {err&&(
              <motion.p initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                style={{fontSize:12,color:"#F87171",fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>
                {err}
              </motion.p>
            )}
          </AnimatePresence>

          <button onClick={submit} disabled={busy||!email||!pass}
            style={{padding:"11px",borderRadius:9,border:"none",cursor:busy||!email||!pass?"not-allowed":"pointer",
              fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,marginTop:2,transition:"all 0.2s",
              background:busy||!email||!pass?T.s3:`linear-gradient(135deg,${T.accentL},${T.accentD})`,
              color:T.text,opacity:busy||!email||!pass?0.5:1,
              boxShadow:!busy&&email&&pass?`0 4px 16px rgba(109,40,217,0.4)`:"none"}}>
            {busy?"…":mode==="register"?"Create account":"Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Demo conversation ─────────────────────────────────────────────────────────
type Msg = { id:string; role:"user"|"ai"; text:string; streaming?:boolean };

const OPENERS = [
  "What can KIRO do for my store?",
  "I sell fashion from Lagos",
  "Help me find trending products",
  "How do I import from AliExpress?",
];

function DemoConversation({ onAuthNeeded }: { onAuthNeeded:()=>void }) {
  const [msgs,    setMsgs]    = useState<Msg[]>([{
    id:"0", role:"ai",
    text:"I'm KIRO — your AI business partner for dropshipping. I find products, write your ads, analyze your sales, and manage your store from a single conversation. What do you sell?"
  }]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [count,   setCount]   = useState(0);
  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  const send = useCallback(async (override?:string)=>{
    const text = (override||input).trim();
    if (!text||loading) return;
    setInput("");
    const n = count+1; setCount(n);
    if (n>=5) { setMsgs(p=>[...p,{id:`u${Date.now()}`,role:"user",text}]); setTimeout(onAuthNeeded,300); return; }
    const kid = `k${Date.now()}`;
    setMsgs(p=>[...p,{id:`u${Date.now()}`,role:"user",text},{id:kid,role:"ai",text:"",streaming:true}]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/kai/public-chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text})});
      if (!res.ok||!res.body) throw new Error();
      const reader = res.body.getReader(); const dec = new TextDecoder(); let full="";
      while(true){
        const {done,value} = await reader.read(); if(done)break;
        for(const line of dec.decode(value,{stream:true}).split("\n")){
          if(!line.startsWith("data: "))continue;
          try{ const p=JSON.parse(line.slice(6)); if(p.token){full+=p.token;setMsgs(m=>m.map(x=>x.id===kid?{...x,text:full}:x));endRef.current?.scrollIntoView({behavior:"smooth"});} }catch{}
        }
      }
      setMsgs(m=>m.map(x=>x.id===kid?{...x,streaming:false,text:full||"Create a free account to unlock the full KIRO experience."}:x));
    } catch {
      setMsgs(m=>m.map(x=>x.id===kid?{...x,streaming:false,text:"Create a free account to chat with the full version of KIRO."}:x));
    } finally { setLoading(false); }
  },[input,loading,count,onAuthNeeded]);

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",minHeight:0}}>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"20px 0 8px",minHeight:0}}>
        {msgs.map(msg=>(
          <motion.div key={msg.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:0.22}}
            style={{display:"flex",flexDirection:msg.role==="user"?"row-reverse":"row",gap:10,alignItems:"flex-end",marginBottom:16,padding:"0 20px"}}>

            {msg.role==="ai"&&(
              <div style={{width:26,height:26,borderRadius:8,background:`linear-gradient(145deg,${T.accentL},${T.accentD})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 2px 8px rgba(109,40,217,0.4)`}}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8L21 10h-9L13 2z" fill="white"/></svg>
              </div>
            )}

            <div style={{
              maxWidth:"78%",
              padding:msg.role==="user"?"10px 15px":"0",
              borderRadius:msg.role==="user"?"14px 14px 3px 14px":"0",
              background:msg.role==="user"?T.s2:"transparent",
              border:msg.role==="user"?`1px solid ${T.borderH}`:"none",
              color:T.text, fontSize:14, lineHeight:1.7,
              fontFamily:"'DM Sans',sans-serif",
            }}>
              {msg.streaming&&!msg.text?(
                <div style={{display:"flex",gap:4,padding:"4px 0",alignItems:"center"}}>
                  {[0,1,2].map(i=>(
                    <motion.div key={i} style={{width:5,height:5,borderRadius:"50%",background:T.t3}}
                      animate={{y:[0,-4,0],opacity:[0.4,1,0.4]}}
                      transition={{duration:0.65,repeat:Infinity,delay:i*0.13}}/>
                  ))}
                </div>
              ):(
                <span>
                  {msg.text}
                  {msg.streaming&&<motion.span animate={{opacity:[1,0]}} transition={{duration:0.5,repeat:Infinity}}>▍</motion.span>}
                </span>
              )}
            </div>
          </motion.div>
        ))}

        {/* Conversion card */}
        <AnimatePresence>
          {count>=2&&(
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
              style={{margin:"4px 20px 16px",padding:"14px 16px",borderRadius:12,background:T.s2,border:`1px solid ${T.border}`}}>
              <p style={{fontSize:13,fontWeight:600,color:T.text,fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>
                KIRO is better with your store data
              </p>
              <p style={{fontSize:12,color:T.t3,fontFamily:"'DM Sans',sans-serif",marginBottom:10,lineHeight:1.5}}>
                Free account unlocks: product import, live analytics, full AI actions, and real-time market research.
              </p>
              <button onClick={onAuthNeeded}
                style={{padding:"7px 16px",borderRadius:8,border:"none",background:`linear-gradient(135deg,${T.accentL},${T.accentD})`,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:`0 2px 10px rgba(109,40,217,0.35)`}}>
                Start for free →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={endRef}/>
      </div>

      {/* Openers */}
      {msgs.length<=1&&(
        <div style={{padding:"0 20px 8px",display:"flex",gap:6,flexWrap:"wrap"}}>
          {OPENERS.map(o=>(
            <button key={o} onClick={()=>send(o)}
              style={{padding:"6px 12px",borderRadius:99,border:`1px solid ${T.border}`,background:"transparent",color:T.t2,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s",whiteSpace:"nowrap"}}
              onMouseEnter={e=>{(e.currentTarget.style.borderColor)=T.borderH;(e.currentTarget.style.color)=T.text;}}
              onMouseLeave={e=>{(e.currentTarget.style.borderColor)=T.border;(e.currentTarget.style.color)=T.t2;}}>
              {o}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{padding:"8px 16px 16px",flexShrink:0}}>
        <div style={{display:"flex",gap:8,alignItems:"flex-end",borderRadius:12,border:`1px solid ${T.border}`,background:T.s2,padding:"8px 10px",transition:"border-color 0.15s"}}
          onFocusCapture={e=>(e.currentTarget.style.borderColor=T.borderH)}
          onBlurCapture={e=>(e.currentTarget.style.borderColor=T.border)}>
          <textarea ref={inputRef} value={input}
            onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,96)+"px";}}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Ask KIRO anything…" rows={1}
            style={{flex:1,background:"transparent",border:"none",outline:"none",color:T.text,fontSize:14,fontFamily:"'DM Sans',sans-serif",lineHeight:1.5,resize:"none",maxHeight:96,overflowY:"auto",padding:"2px 0"}}/>
          <motion.button onClick={()=>send()} whileTap={{scale:0.9}} disabled={loading||!input.trim()}
            style={{width:30,height:30,borderRadius:8,border:"none",cursor:input.trim()&&!loading?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s",
              background:input.trim()&&!loading?`linear-gradient(135deg,${T.accentL},${T.accentD})`:T.s3,
              opacity:input.trim()&&!loading?1:0.4}}>
            {loading
              ?<div style={{width:12,height:12,border:`2px solid rgba(109,40,217,0.3)`,borderTopColor:T.accentL,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
              :<svg width={12} height={12} viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ── Capability pills ──────────────────────────────────────────────────────────
const CAPS = ["Import any URL","Live market research","AI product copy","Revenue analytics","Flash sales","WhatsApp broadcasts"];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PublicKIROPage() {
  const [state,   setState]   = useState<"checking"|"authed"|"guest">("checking");
  const [storeId, setStoreId] = useState("");
  const [showAuth,setShowAuth]= useState(false);

  useEffect(()=>{
    tryAutoLogin().then(r=>{
      if(r){setStoreId(r.storeId);setState("authed");}
      else setState("guest");
    });
  },[]);

  function handleAuth(sid:string){setStoreId(sid);setState("authed");setShowAuth(false);}

  // ── Loading ────────────────────────────────────────────────────────────────
  if(state==="checking") return (
    <div style={{height:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg}}>
      <style>{FONTS}</style>
      <div style={{width:28,height:28,border:`2px solid rgba(109,40,217,0.2)`,borderTopColor:T.accentL,borderRadius:"50%",animation:"spin 0.9s linear infinite"}}/>
    </div>
  );

  // ── Authenticated: full KIRO ───────────────────────────────────────────────
  if(state==="authed") return (
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",background:T.bg,overflow:"hidden"}}>
      <style>{FONTS}</style>
      {/* Header bar */}
      <header style={{height:48,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",borderBottom:`1px solid ${T.border}`,background:T.s1,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <KIROLogo size={26}/>
          <span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:14,fontWeight:700,color:T.text,letterSpacing:"-0.2px"}}>KIRO</span>
        </div>
        <Link href="/dashboard"
          style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:7,border:`1px solid ${T.border}`,color:T.t2,fontSize:12,fontWeight:500,textDecoration:"none",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"}}
          onMouseEnter={e=>{(e.currentTarget.style.borderColor)=T.borderH;(e.currentTarget.style.color)=T.text;}}
          onMouseLeave={e=>{(e.currentTarget.style.borderColor)=T.border;(e.currentTarget.style.color)=T.t2;}}>
          Dashboard →
        </Link>
      </header>
      {/* Full KIRO chat */}
      <div style={{flex:1,overflow:"hidden",minHeight:0}}>
        <KIROChatFull storeId={storeId}/>
      </div>
    </div>
  );

  // ── Guest: marketing + demo ────────────────────────────────────────────────
  return (
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",background:T.bg,overflow:"hidden",fontFamily:"'DM Sans',sans-serif"}}>
      <style>{FONTS}</style>
      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onSuccess={handleAuth}/>}

      {/* ── Top nav ── */}
      <nav style={{height:52,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",borderBottom:`1px solid ${T.border}`,flexShrink:0,background:T.s1}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <KIROLogo size={28}/>
          <span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:15,fontWeight:700,color:T.text,letterSpacing:"-0.3px"}}>KIRO</span>
          <span style={{fontSize:9,padding:"2px 6px",borderRadius:4,background:"rgba(109,40,217,0.18)",color:T.accentL,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>Beta</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setShowAuth(true)}
            style={{padding:"6px 14px",borderRadius:7,border:`1px solid ${T.border}`,background:"transparent",color:T.t2,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"}}
            onMouseEnter={e=>{(e.currentTarget.style.borderColor)=T.borderH;(e.currentTarget.style.color)=T.text;}}
            onMouseLeave={e=>{(e.currentTarget.style.borderColor)=T.border;(e.currentTarget.style.color)=T.t2;}}>
            Sign in
          </button>
          <button onClick={()=>setShowAuth(true)}
            style={{padding:"6px 16px",borderRadius:7,border:"none",background:`linear-gradient(135deg,${T.accentL},${T.accentD})`,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:`0 2px 12px rgba(109,40,217,0.4)`}}>
            Get started free
          </button>
        </div>
      </nav>

      {/* ── Main: two-column layout (desktop) or stacked (mobile) ── */}
      <div style={{flex:1,display:"flex",minHeight:0,overflow:"hidden"}}>

        {/* Left: Hero copy — hidden on mobile */}
        <div className="kiro-hero" style={{width:380,flexShrink:0,padding:"40px 32px",borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",justifyContent:"space-between",overflow:"hidden"}}>

          {/* Headline */}
          <div>
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1,duration:0.4}}>
              <p style={{fontSize:11,color:T.t3,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>For African dropshippers</p>
              <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:32,fontWeight:800,color:T.text,lineHeight:1.15,letterSpacing:"-0.8px",marginBottom:16}}>
                Your AI <br/>commerce partner
              </h1>
              <p style={{fontSize:15,color:T.t2,lineHeight:1.65,marginBottom:28,maxWidth:280}}>
                Import products, run your store, write ad copy, and find what's selling — all from one conversation.
              </p>
            </motion.div>

            {/* Capabilities */}
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.25,duration:0.4}}
              style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {CAPS.map((c,i)=>(
                <motion.span key={c} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:0.3+i*0.05}}
                  style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${T.border}`,background:T.s2,color:T.t2,fontSize:11,fontWeight:500}}>
                  {c}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Social proof */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}
            style={{padding:"14px",borderRadius:10,background:T.s2,border:`1px solid ${T.border}`}}>
            <p style={{fontSize:12,color:T.t2,lineHeight:1.5,fontStyle:"italic",marginBottom:8}}>
              "KIRO found me 3 winning products in 10 minutes that I've been selling for 2 months straight."
            </p>
            <p style={{fontSize:11,color:T.t3,fontWeight:600}}>Adaeze O. · Lagos, Nigeria</p>
          </motion.div>
        </div>

        {/* Right: Live demo chat */}
        <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,minWidth:0,overflow:"hidden"}}>
          {/* Chat header */}
          <div style={{height:44,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:T.green,boxShadow:`0 0 6px ${T.green}`}}/>
              <span style={{fontSize:12,fontWeight:500,color:T.t2,fontFamily:"'DM Sans',sans-serif"}}>KIRO · Live demo</span>
            </div>
            <button onClick={()=>setShowAuth(true)}
              style={{fontSize:12,fontWeight:600,color:T.accentL,background:"transparent",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",padding:"3px 8px",borderRadius:5,transition:"all 0.15s"}}
              onMouseEnter={e=>(e.currentTarget.style.background)="rgba(109,40,217,0.1)"}
              onMouseLeave={e=>(e.currentTarget.style.background)="transparent"}>
              Full version →
            </button>
          </div>

          {/* Demo chat */}
          <div style={{flex:1,minHeight:0,overflow:"hidden"}}>
            <DemoConversation onAuthNeeded={()=>setShowAuth(true)}/>
          </div>
        </div>
      </div>

      {/* Mobile responsive: hide hero panel */}
      <style>{`
        @media(max-width:640px){
          .kiro-hero { display: none !important; }
        }
      `}</style>
    </div>
  );
}
