"use client";
/**
 * KIRO — AI Commerce Intelligence
 *
 * Award-level redesign. Light mode default, dark mode toggle.
 * Design language: "Obsidian on Ivory" — warmth meets precision.
 *
 * Light: Ivory #FAFAF8 surface, Ink #1A1A2E text, Violet #6D28D9 accent
 * Dark:  Onyx #0E0E16 surface, Pearl #F0EFFF text, same accent
 *
 * Typography: Instrument Serif (display, warm, editorial) + DM Sans (body, clean)
 * Motion: purposeful — only where it guides attention
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";

const API = process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api";
const KIROChatFull = dynamic(() => import("../../../components/kai/KIROChat"), {
  ssr: false,
  loading: () => <Spinner size={28}/>,
});

// ── Design tokens ─────────────────────────────────────────────────────────────
type Mode = "light" | "dark";
const tokens = {
  light: {
    bg:       "#FAFAF8",
    s1:       "#F4F4F0",
    s2:       "#EDEDEA",
    s3:       "#E5E5E0",
    text:     "#1A1A2E",
    t2:       "#4A4A6A",
    t3:       "#7A7A9A",
    t4:       "#AEAEC8",
    border:   "rgba(26,26,46,0.08)",
    borderH:  "rgba(26,26,46,0.16)",
    accent:   "#6D28D9",
    accentL:  "#7C3AED",
    accentD:  "#4C1D95",
    accentBg: "rgba(109,40,217,0.08)",
    accentBgH:"rgba(109,40,217,0.14)",
    green:    "#059669",
    amber:    "#B45309",
    red:      "#DC2626",
    shadow:   "0 1px 3px rgba(26,26,46,0.08), 0 4px 16px rgba(26,26,46,0.04)",
    shadowLg: "0 8px 32px rgba(26,26,46,0.12)",
    userBubble: "linear-gradient(145deg, #6D28D9, #4C1D95)",
    userText:   "#FFFFFF",
  },
  dark: {
    bg:       "#0E0E16",
    s1:       "#13131F",
    s2:       "#1A1A2A",
    s3:       "#232338",
    text:     "#F0EFFF",
    t2:       "rgba(240,239,255,0.65)",
    t3:       "rgba(240,239,255,0.38)",
    t4:       "rgba(240,239,255,0.18)",
    border:   "rgba(255,255,255,0.06)",
    borderH:  "rgba(255,255,255,0.12)",
    accent:   "#7C3AED",
    accentL:  "#8B5CF6",
    accentD:  "#6D28D9",
    accentBg: "rgba(124,58,237,0.1)",
    accentBgH:"rgba(124,58,237,0.18)",
    green:    "#10B981",
    amber:    "#F59E0B",
    red:      "#F87171",
    shadow:   "0 1px 3px rgba(0,0,0,0.3)",
    shadowLg: "0 8px 32px rgba(0,0,0,0.5)",
    userBubble: "linear-gradient(145deg, #7C3AED, #5B21B6)",
    userText:   "#FFFFFF",
  },
};

// ── Helper: system theme ──────────────────────────────────────────────────────
function getSystemMode(): Mode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// ── Fonts + global styles ─────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
  @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
  .kiro-fade-up { animation: fadeUp 0.3s ease forwards; }
  ::selection { background: rgba(109,40,217,0.2); }
`;

// ── Primitives ────────────────────────────────────────────────────────────────
function Spinner({ size=20, color="#7C3AED" }: { size?:number; color?:string }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%",
      border:`2px solid ${color}30`, borderTopColor:color,
      animation:"spin 0.8s linear infinite", flexShrink:0 }}/>
  );
}

function Logo({ size=28 }: { size?:number }) {
  return (
    <div style={{ width:size, height:size, borderRadius:Math.round(size*.26),
      background:"linear-gradient(145deg,#7C3AED,#4C1D95)",
      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
      boxShadow:"0 2px 8px rgba(109,40,217,0.4)" }}>
      <svg width={size*.44} height={size*.44} viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white" fillOpacity={.95}/>
      </svg>
    </div>
  );
}

function ModeToggle({ mode, onToggle, T }: { mode:Mode; onToggle:()=>void; T:typeof tokens.light }) {
  return (
    <button onClick={onToggle} title={`Switch to ${mode==="light"?"dark":"light"} mode`}
      style={{ width:34, height:34, borderRadius:9, border:`1px solid ${T.border}`,
        background:"transparent", cursor:"pointer", display:"flex", alignItems:"center",
        justifyContent:"center", fontSize:15, transition:"all 0.15s", color:T.t2 }}
      onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.background=T.accentBg; }}
      onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.background="transparent"; }}>
      {mode==="light" ? "🌙" : "☀️"}
    </button>
  );
}

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

// ── Auth Modal ────────────────────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess, T }: {
  onClose:()=>void; onSuccess:(sid:string)=>void; T:typeof tokens.light;
}) {
  const [mode, setMode]   = useState<"register"|"login">("register");
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [err, setErr]     = useState("");
  const [busy, setBusy]   = useState(false);

  const baseInp: React.CSSProperties = {
    width:"100%", padding:"10px 14px", borderRadius:9,
    border:`1px solid ${T.border}`, background:T.s2, color:T.text,
    fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none",
    transition:"border-color 0.15s, box-shadow 0.15s",
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
    } catch { setErr("Connection error — try again"); } finally { setBusy(false); }
  }

  return (
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",
      justifyContent:"center",padding:16,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(12px)"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <motion.div initial={{opacity:0,y:12,scale:0.97}} animate={{opacity:1,y:0,scale:1}}
        transition={{type:"spring",stiffness:320,damping:28}}
        style={{width:"100%",maxWidth:360,borderRadius:18,background:T.bg,
          border:`1px solid ${T.border}`,padding:"28px 24px",
          boxShadow:T.shadowLg}}>

        <div style={{textAlign:"center",marginBottom:22}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
            <Logo size={40}/>
          </div>
          <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:22,fontWeight:400,
            color:T.text,letterSpacing:"-0.3px",marginBottom:4}}>
            {mode==="register" ? "Create your account" : "Welcome back"}
          </h2>
          <p style={{fontSize:13,color:T.t3,fontFamily:"'DM Sans',sans-serif"}}>
            {mode==="register" ? "Free · No card required" : "Continue with KIRO"}
          </p>
        </div>

        <div style={{display:"flex",gap:2,padding:3,borderRadius:10,background:T.s1,marginBottom:16}}>
          {(["register","login"] as const).map(m=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}}
              style={{flex:1,padding:"7px",borderRadius:8,border:"none",cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,
                transition:"all 0.15s",
                background:mode===m?T.bg:"transparent",
                color:mode===m?T.text:T.t3,
                boxShadow:mode===m?T.shadow:"none"}}>
              {m==="register"?"Sign up":"Sign in"}
            </button>
          ))}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {mode==="register"&&(
            <input value={name} onChange={e=>setName(e.target.value)}
              placeholder="Full name" autoFocus style={baseInp}
              onFocus={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.boxShadow=`0 0 0 3px ${T.accentBg}`;}}
              onBlur={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.boxShadow="none";}}/>
          )}
          <input value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="Email" type="email" autoFocus={mode==="login"} style={baseInp}
            onFocus={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.boxShadow=`0 0 0 3px ${T.accentBg}`;}}
            onBlur={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.boxShadow="none";}}/>
          <input value={pass} onChange={e=>setPass(e.target.value)}
            placeholder="Password" type="password" style={baseInp}
            onFocus={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.boxShadow=`0 0 0 3px ${T.accentBg}`;}}
            onBlur={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.boxShadow="none";}}
            onKeyDown={e=>e.key==="Enter"&&submit()}/>
          {err&&<p style={{fontSize:12,color:T.red,fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>{err}</p>}
          <button onClick={submit} disabled={busy||!email||!pass}
            style={{padding:"12px",borderRadius:10,border:"none",
              cursor:busy||!email||!pass?"not-allowed":"pointer",
              fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,
              background:busy||!email||!pass?T.s3:`linear-gradient(135deg,${T.accentL},${T.accentD})`,
              color:busy||!email||!pass?T.t3:"#fff",
              transition:"all 0.2s", marginTop:2,
              boxShadow:!busy&&email&&pass?`0 4px 14px ${T.accentBg}`:"none"}}>
            {busy ? <Spinner size={16} color="#fff"/> : mode==="register" ? "Create account" : "Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Demo chat ─────────────────────────────────────────────────────────────────
type Msg = {id:string;role:"user"|"ai";text:string;streaming?:boolean};

const STARTERS = [
  "What can KIRO do for me?",
  "I sell fashion in Lagos",
  "Help me find trending products",
  "Import from AliExpress",
  "Write ad copy for my product",
];

function DemoChat({ T, onAuthNeeded }: { T:typeof tokens.light; onAuthNeeded:()=>void }) {
  const [msgs,    setMsgs]    = useState<Msg[]>([{
    id:"0", role:"ai",
    text:"I'm KIRO — your AI business partner. I help African dropshippers find winning products, write ads that convert, manage orders, and understand their customers. What do you sell?"
  }]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [count,   setCount]   = useState(0);
  const endRef   = useRef<HTMLDivElement>(null);
  const taRef    = useRef<HTMLTextAreaElement>(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  const send = useCallback(async (text?:string)=>{
    const msg = (text||input).trim();
    if (!msg||loading) return;
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
    const n = count+1; setCount(n);
    if (n>=5) {
      setMsgs(p=>[...p,{id:`u${Date.now()}`,role:"user",text:msg}]);
      setTimeout(onAuthNeeded,200);
      return;
    }
    const kid=`k${Date.now()}`;
    setMsgs(p=>[...p,{id:`u${Date.now()}`,role:"user",text:msg},{id:kid,role:"ai",text:"",streaming:true}]);
    setLoading(true);
    try {
      const res=await fetch(`${API}/kai/public-chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:msg})});
      if (!res.ok||!res.body) throw new Error();
      const reader=res.body.getReader(); const dec=new TextDecoder(); let full="";
      while(true){
        const{done,value}=await reader.read(); if(done)break;
        for(const line of dec.decode(value,{stream:true}).split("\n")){
          if(!line.startsWith("data: "))continue;
          try{const p=JSON.parse(line.slice(6));if(p.token){full+=p.token;setMsgs(m=>m.map(x=>x.id===kid?{...x,text:full}:x));endRef.current?.scrollIntoView({behavior:"smooth"});}}catch{}
        }
      }
      setMsgs(m=>m.map(x=>x.id===kid?{...x,streaming:false,text:full||"Create a free account to unlock the full KIRO experience."}:x));
    } catch {
      setMsgs(m=>m.map(x=>x.id===kid?{...x,streaming:false,text:"Create a free account to get started with KIRO."}:x));
    } finally { setLoading(false); }
  },[input,loading,count,onAuthNeeded]);

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",minHeight:0}}>
      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"20px 20px 8px",minHeight:0,
        scrollbarWidth:"thin",scrollbarColor:`${T.t4} transparent`}}>
        {msgs.map(msg=>(
          <motion.div key={msg.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
            transition={{duration:0.2}}
            style={{display:"flex",flexDirection:msg.role==="user"?"row-reverse":"row",
              gap:8,alignItems:"flex-end",marginBottom:14}}>
            {msg.role==="ai"&&<Logo size={24}/>}
            <div style={{
              maxWidth:"82%",
              padding:msg.role==="user"?"10px 15px":"0",
              borderRadius:msg.role==="user"?"16px 16px 4px 16px":"0",
              background:msg.role==="user"?T.userBubble:"transparent",
              border:msg.role==="user"?`none`:"none",
              color:msg.role==="user"?T.userText:T.text,
              fontSize:14,lineHeight:1.7,fontFamily:"'DM Sans',sans-serif",
              boxShadow:msg.role==="user"?"0 2px 10px rgba(109,40,217,0.25)":"none",
            }}>
              {msg.streaming&&!msg.text?(
                <div style={{display:"flex",gap:4,padding:"4px 0",alignItems:"center"}}>
                  {[0,1,2].map(i=>(
                    <motion.div key={i} style={{width:5,height:5,borderRadius:"50%",background:T.t3}}
                      animate={{y:[0,-4,0],opacity:[0.4,1,0.4]}}
                      transition={{duration:0.6,repeat:Infinity,delay:i*0.13}}/>
                  ))}
                </div>
              ):(
                <span>
                  {msg.text}
                  {msg.streaming&&<span style={{animation:"blink 0.8s ease infinite",display:"inline-block",width:2,height:14,background:T.t2,marginLeft:1,verticalAlign:"text-bottom"}}/>}
                </span>
              )}
            </div>
          </motion.div>
        ))}
        {count>=2&&(
          <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
            style={{margin:"4px 0 12px",padding:"14px 16px",borderRadius:12,
              background:T.accentBg,border:`1px solid ${T.border}`}}>
            <p style={{fontSize:13,fontWeight:600,color:T.text,fontFamily:"'DM Sans',sans-serif",marginBottom:3}}>
              KIRO is better with your store data
            </p>
            <p style={{fontSize:12,color:T.t3,fontFamily:"'DM Sans',sans-serif",marginBottom:10}}>
              Free account → product import, analytics, full AI actions.
            </p>
            <button onClick={onAuthNeeded}
              style={{padding:"6px 14px",borderRadius:7,border:"none",
                background:`linear-gradient(135deg,${T.accentL},${T.accentD})`,
                color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              Start free →
            </button>
          </motion.div>
        )}
        <div ref={endRef}/>
      </div>

      {/* Starters */}
      {msgs.length<=1&&(
        <div style={{padding:"0 20px 10px",display:"flex",gap:6,flexWrap:"wrap"}}>
          {STARTERS.map(s=>(
            <button key={s} onClick={()=>send(s)}
              style={{padding:"6px 12px",borderRadius:99,border:`1px solid ${T.border}`,
                background:"transparent",color:T.t2,fontSize:12,cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s",whiteSpace:"nowrap"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderH;e.currentTarget.style.color=T.text;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.t2;}}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{padding:"8px 16px 16px",flexShrink:0}}>
        <div style={{display:"flex",gap:8,alignItems:"flex-end",borderRadius:12,
          border:`1px solid ${T.border}`,background:T.s1,padding:"8px 10px",
          boxShadow:T.shadow,transition:"border-color 0.15s, box-shadow 0.15s"}}
          onFocusCapture={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor=T.accent;d.style.boxShadow=`0 0 0 3px ${T.accentBg}`;}}
          onBlurCapture={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor=T.border;d.style.boxShadow=T.shadow;}}>
          <textarea ref={taRef} value={input}
            onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,100)+"px";}}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Ask KIRO anything…" rows={1}
            style={{flex:1,background:"transparent",border:"none",outline:"none",color:T.text,
              fontSize:14,fontFamily:"'DM Sans',sans-serif",lineHeight:1.5,resize:"none",
              maxHeight:100,overflowY:"auto",padding:"2px 0"}}/>
          <motion.button onClick={()=>send()} whileTap={{scale:0.88}}
            disabled={loading||!input.trim()}
            style={{width:30,height:30,borderRadius:8,border:"none",
              cursor:input.trim()&&!loading?"pointer":"not-allowed",
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
              transition:"all 0.2s",
              background:input.trim()&&!loading?`linear-gradient(135deg,${T.accentL},${T.accentD})`:T.s3,
              opacity:input.trim()&&!loading?1:0.5}}>
            {loading?<Spinner size={12} color="#fff"/>:
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ── Capabilities list ─────────────────────────────────────────────────────────
const CAPS = [
  { icon:"🌐", label:"Import any product",    detail:"AliExpress · Temu · Jumia · Amazon · Any URL" },
  { icon:"📊", label:"Live store analytics",  detail:"Revenue · Orders · Customer insights" },
  { icon:"⚡", label:"Actions from chat",      detail:"Add products · Fulfill orders · Set prices" },
  { icon:"🔥", label:"Market intelligence",   detail:"Trending products · Ad spy · Saturation check" },
  { icon:"📣", label:"AI content creation",   detail:"TikTok · WhatsApp · Instagram · Facebook" },
  { icon:"🎯", label:"Goals & automation",    detail:"Track targets · Alerts · Background jobs" },
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function KIROPublicPage() {
  const [authStatus, setAuthStatus] = useState<"checking"|"authed"|"guest">("checking");
  const [storeId,    setStoreId]    = useState("");
  const [showAuth,   setShowAuth]   = useState(false);
  const [mode,       setMode]       = useState<Mode>("light");

  // Load mode from localStorage
  useEffect(()=>{
    const saved = localStorage.getItem("kiro-mode") as Mode|null;
    setMode(saved || "light");
  },[]);

  const toggleMode = ()=>{
    const next: Mode = mode==="light"?"dark":"light";
    setMode(next);
    localStorage.setItem("kiro-mode", next);
  };

  // Auth check
  useEffect(()=>{
    tryAutoLogin().then(r=>{
      if(r){setStoreId(r.storeId);setAuthStatus("authed");}
      else setAuthStatus("guest");
    });
  },[]);

  const T = tokens[mode];

  function handleAuth(sid:string){setStoreId(sid);setAuthStatus("authed");setShowAuth(false);}

  // ── Loading ────────────────────────────────────────────────────────────────
  if(authStatus==="checking") return (
    <div style={{height:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg}}>
      <style>{GLOBAL_CSS}</style>
      <Spinner size={28} color={T.accent}/>
    </div>
  );

  // ── Authenticated ──────────────────────────────────────────────────────────
  if(authStatus==="authed") return (
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",background:T.bg,overflow:"hidden"}}>
      <style>{GLOBAL_CSS + `body,html{background:${T.bg}}`}</style>
      <header style={{height:50,display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"0 18px",borderBottom:`1px solid ${T.border}`,background:T.s1,flexShrink:0,
        boxShadow:T.shadow}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <Logo size={26}/>
          <span style={{fontFamily:"'Instrument Serif',serif",fontSize:16,fontWeight:400,color:T.text,letterSpacing:"-0.2px"}}>KIRO</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <ModeToggle mode={mode} onToggle={toggleMode} T={T}/>
          <Link href="/dashboard"
            style={{padding:"5px 14px",borderRadius:8,border:`1px solid ${T.border}`,
              color:T.t2,fontSize:13,fontWeight:500,textDecoration:"none",
              fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderH;e.currentTarget.style.color=T.text;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.t2;}}>
            Dashboard →
          </Link>
        </div>
      </header>
      <div style={{flex:1,overflow:"hidden",minHeight:0}}>
        <KIROChatFull storeId={storeId}/>
      </div>
    </div>
  );

  // ── Guest ──────────────────────────────────────────────────────────────────
  return (
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",background:T.bg,overflow:"hidden",
      fontFamily:"'DM Sans',sans-serif",transition:"background 0.3s, color 0.3s"}}>
      <style>{GLOBAL_CSS + `body,html{background:${T.bg};color:${T.text}}`}</style>
      {showAuth&&<AuthModal T={T} onClose={()=>setShowAuth(false)} onSuccess={handleAuth}/>}

      {/* ── Navigation ── */}
      <nav style={{height:54,display:"flex",alignItems:"center",padding:"0 20px",
        borderBottom:`1px solid ${T.border}`,background:T.s1,flexShrink:0,boxShadow:T.shadow}}>
        <div style={{display:"flex",alignItems:"center",gap:9,flex:1}}>
          <Logo size={28}/>
          <span style={{fontFamily:"'Instrument Serif',serif",fontSize:16,fontWeight:400,color:T.text,letterSpacing:"-0.2px"}}>KIRO</span>
          <span style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:T.accentBg,
            color:T.accent,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",
            border:`1px solid ${T.border}`}}>
            Beta
          </span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <ModeToggle mode={mode} onToggle={toggleMode} T={T}/>
          <button onClick={()=>setShowAuth(true)}
            style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${T.border}`,
              background:"transparent",color:T.t2,fontSize:13,fontWeight:500,
              cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderH;e.currentTarget.style.color=T.text;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.t2;}}>
            Sign in
          </button>
          <button onClick={()=>setShowAuth(true)}
            style={{padding:"6px 16px",borderRadius:8,border:"none",
              background:`linear-gradient(135deg,${T.accentL},${T.accentD})`,
              color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif",
              boxShadow:`0 2px 10px ${T.accentBg},0 0 0 1px ${T.accentD}30`}}>
            Get started free
          </button>
        </div>
      </nav>

      {/* ── Content: two-panel on desktop, stacked on mobile ── */}
      <div style={{flex:1,display:"grid",gridTemplateColumns:"380px 1fr",minHeight:0,overflow:"hidden"}}
        className="kiro-grid">

        {/* Left panel */}
        <div style={{borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",
          justifyContent:"space-between",padding:"36px 28px",overflow:"hidden"}}
          className="kiro-left">

          <div>
            {/* Headline */}
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.05,duration:0.4}}>
              <p style={{fontSize:11,fontWeight:700,color:T.t3,letterSpacing:"0.1em",
                textTransform:"uppercase",marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>
                For African dropshippers
              </p>
              <h1 style={{fontFamily:"'Instrument Serif',serif",fontSize:34,fontWeight:400,
                color:T.text,lineHeight:1.15,letterSpacing:"-0.5px",marginBottom:14}}>
                Your AI<br/>commerce<br/>partner.
              </h1>
              <p style={{fontSize:15,color:T.t2,lineHeight:1.7,marginBottom:28,
                fontFamily:"'DM Sans',sans-serif",maxWidth:280}}>
                Import products, run flash sales, write ad copy, and analyze your store — all from one conversation.
              </p>
            </motion.div>

            {/* Capabilities */}
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2,duration:0.4}}>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {CAPS.map((c,i)=>(
                  <motion.div key={c.label} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}}
                    transition={{delay:0.25+i*0.06}}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",
                      borderRadius:9,background:T.s1,border:`1px solid ${T.border}`}}>
                    <span style={{fontSize:15,flexShrink:0}}>{c.icon}</span>
                    <div>
                      <p style={{fontSize:12,fontWeight:600,color:T.text,margin:0,fontFamily:"'DM Sans',sans-serif"}}>{c.label}</p>
                      <p style={{fontSize:11,color:T.t3,margin:0,fontFamily:"'DM Sans',sans-serif"}}>{c.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Social proof */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}
            style={{padding:"14px 16px",borderRadius:12,background:T.s1,border:`1px solid ${T.border}`,marginTop:20}}>
            <p style={{fontSize:13,color:T.t2,lineHeight:1.6,fontStyle:"italic",
              fontFamily:"'Instrument Serif',serif",marginBottom:8}}>
              "KIRO found me 3 winning products and wrote all my TikTok scripts. First ₦100k month done."
            </p>
            <p style={{fontSize:11,color:T.t3,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>
              Adaeze O. · Lagos, Nigeria
            </p>
          </motion.div>
        </div>

        {/* Right panel: live demo */}
        <div style={{display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
          {/* Chat header */}
          <div style={{height:44,display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"0 20px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:T.green,
                boxShadow:`0 0 6px ${T.green}`}}/>
              <span style={{fontSize:12,fontWeight:500,color:T.t2,fontFamily:"'DM Sans',sans-serif"}}>
                Live demo
              </span>
            </div>
            <button onClick={()=>setShowAuth(true)}
              style={{fontSize:12,fontWeight:600,color:T.accent,background:"transparent",
                border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
                padding:"4px 8px",borderRadius:6,transition:"background 0.15s"}}
              onMouseEnter={e=>(e.currentTarget.style.background=T.accentBg)}
              onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
              Get full access →
            </button>
          </div>

          {/* Chat */}
          <div style={{flex:1,minHeight:0,overflow:"hidden"}}>
            <DemoChat T={T} onAuthNeeded={()=>setShowAuth(true)}/>
          </div>
        </div>
      </div>

      {/* Mobile responsive styles */}
      <style>{`
        @media(max-width:680px){
          .kiro-grid { grid-template-columns: 1fr !important; }
          .kiro-left { display: none !important; }
        }
      `}</style>
    </div>
  );
}
