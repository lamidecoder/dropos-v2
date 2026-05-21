"use client";
// Path: frontend/src/app/(public)/kiro/page.tsx
// KIRO Public Page — matches CEO's design (Image 2)
// Light mode default, dark mode toggle, mobile-first

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";

const BASE   = process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api";
const ACCENT = "#7C3AED";
const ACCENT_D = "#5B21B6";

const KIROChatFull = dynamic(() => import("../../../components/kai/KIROChat"), {
  ssr: false, loading: () => <Spinner />,
});

// ── Design tokens ─────────────────────────────────────────────
const TL = {
  bg:"#F7F6F3", s1:"#FFFFFF", s2:"#F0EFF9", s3:"#E8E6F4",
  text:"#111827", sub:"#6B7280", muted:"#9CA3AF",
  border:"rgba(0,0,0,0.07)", borderH:"rgba(124,58,237,0.2)",
  accent:ACCENT, accentD:ACCENT_D, accentBg:ACCENT+"12",
  green:"#059669", amber:"#D97706", red:"#DC2626",
  heroGrad:"linear-gradient(145deg,#EDE9FE 0%,#F5F3FF 50%,#EEF2FF 100%)",
  shadow:"0 1px 3px rgba(0,0,0,0.05),0 4px 16px rgba(0,0,0,0.04)",
  shadowMd:"0 4px 24px rgba(124,58,237,0.12)",
};
const TD = {
  bg:"#0D0D14", s1:"#13131F", s2:"#1A1A2A", s3:"#232338",
  text:"#F9F8FF", sub:"#A0A0C0", muted:"#606080",
  border:"rgba(255,255,255,0.07)", borderH:"rgba(144,97,249,0.3)",
  accent:"#9061F9", accentD:ACCENT, accentBg:ACCENT+"18",
  green:"#10B981", amber:"#F59E0B", red:"#EF4444",
  heroGrad:"linear-gradient(145deg,#1a0840 0%,#1e1040 50%,#141428 100%)",
  shadow:"0 1px 4px rgba(0,0,0,0.4)",
  shadowMd:"0 4px 24px rgba(124,58,237,0.25)",
};

function Spinner() {
  return (
    <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ width:24,height:24,borderRadius:"50%",border:`2px solid ${ACCENT}30`,borderTopColor:ACCENT,animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function KIROLogo({ size=32 }:{size?:number}) {
  return (
    <div style={{ width:size,height:size,borderRadius:Math.round(size*0.27),background:`linear-gradient(145deg,${ACCENT},${ACCENT_D})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 2px 10px ${ACCENT}45` }}>
      <svg width={size*0.44} height={size*0.44} viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white" fillOpacity={.95}/>
      </svg>
    </div>
  );
}

// ── Quick action card (Image 2 grid) ──────────────────────────
function ActionCard({ icon, label, sub, onClick, T }: any) {
  const [hov, setHov] = useState(false);
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        display:"flex", alignItems:"center", gap:14, padding:"16px 18px",
        borderRadius:16, border:`1.5px solid ${hov ? T.borderH : T.border}`,
        background: hov ? T.accentBg : T.s1,
        cursor:"pointer", textAlign:"left", width:"100%",
        transition:"all 0.18s", boxShadow: hov ? T.shadowMd : T.shadow,
        outline:"none",
      }}
    >
      <div style={{ width:48,height:48,borderRadius:14,background:icon.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:22 }}>
        {icon.emoji}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:14,fontWeight:700,color:T.text,marginBottom:3 }}>{label}</p>
        <p style={{ fontSize:12,color:T.sub,lineHeight:1.4 }}>{sub}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </motion.button>
  );
}

// ── Suggestion chip ───────────────────────────────────────────
function Chip({ label, onClick, T }: any) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding:"8px 14px",borderRadius:99,border:`1.5px solid ${hov ? T.borderH : T.border}`,background:hov ? T.accentBg : T.s1,color:T.sub,fontSize:13,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s",outline:"none" }}
    >
      {label}
    </button>
  );
}

// ── Auth modal ────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess, T }: { onClose:()=>void; onSuccess:(sid:string)=>void; T:typeof TL }) {
  const [mode, setMode] = useState<"register"|"login">("register");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pass, setPass] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const inp: React.CSSProperties = { width:"100%",padding:"11px 14px",borderRadius:10,border:`1.5px solid ${T.border}`,background:T.s2,color:T.text,fontSize:14,fontFamily:"inherit",outline:"none",transition:"border-color 0.15s",boxSizing:"border-box" };
  async function submit() {
    if (!email||!pass) return;
    setBusy(true); setErr("");
    try {
      const body = mode==="register" ? {name,email,password:pass} : {email,password:pass};
      const res  = await fetch(`${BASE}/auth/${mode}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const d    = await res.json();
      if (!res.ok) { setErr(d.message||"Something went wrong"); setBusy(false); return; }
      const token = d.data?.accessToken || d.accessToken || "";
      if (token) { localStorage.setItem("kiro_sid", token); onSuccess(token); }
    } catch { setErr("Network error"); }
    setBusy(false);
  }
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16 }}
      onClick={onClose}>
      <motion.div initial={{ scale:0.93,y:16 }} animate={{ scale:1,y:0 }} exit={{ scale:0.93,y:16 }}
        style={{ background:T.s1,borderRadius:20,padding:28,width:"100%",maxWidth:400,boxShadow:"0 24px 64px rgba(0,0,0,0.22)" }}
        onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"center",marginBottom:20 }}><KIROLogo size={44} /></div>
        <h2 style={{ textAlign:"center",fontSize:18,fontWeight:800,color:T.text,marginBottom:4 }}>
          {mode==="register" ? "Create your free account" : "Welcome back"}
        </h2>
        <p style={{ textAlign:"center",fontSize:13,color:T.sub,marginBottom:20 }}>
          {mode==="register" ? "Your store builder is almost ready" : "Continue building your store"}
        </p>
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {mode==="register" && <input style={inp} placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />}
          <input style={inp} type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} />
          <input style={inp} type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} />
        </div>
        {err && <p style={{ color:T.red,fontSize:12,marginTop:8,textAlign:"center" }}>{err}</p>}
        <button disabled={busy} onClick={submit}
          style={{ width:"100%",marginTop:16,padding:"12px 0",borderRadius:11,border:"none",background:`linear-gradient(135deg,${ACCENT},${ACCENT_D})`,color:"#fff",fontWeight:700,fontSize:14,cursor:busy?"wait":"pointer",opacity:busy?.7:1,boxShadow:`0 4px 16px ${ACCENT}40`,fontFamily:"inherit" }}>
          {busy ? "…" : mode==="register" ? "Create Account & Continue" : "Log In"}
        </button>
        <p style={{ textAlign:"center",fontSize:12,color:T.sub,marginTop:14 }}>
          {mode==="register" ? "Already have an account? " : "Don't have an account? "}
          <button onClick={()=>setMode(mode==="register"?"login":"register")} style={{ background:"none",border:"none",color:ACCENT,fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"inherit" }}>
            {mode==="register" ? "Log in" : "Sign up free"}
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function KiroPage() {
  const [mode, setMode] = useState<"light"|"dark">("light");
  const [sid, setSid] = useState<string|null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const T = mode==="light" ? TL : TD;

  useEffect(() => {
    const stored = localStorage.getItem("kiro_sid") || localStorage.getItem("accessToken");
    if (stored) setSid(stored);
  }, []);

  const handleSend = useCallback((text?: string) => {
    const msg = text || inputVal.trim();
    if (!msg) return;
    if (!sid) { setAuthOpen(true); return; }
    setChatStarted(true);
  }, [inputVal, sid]);

  const handleChip = (label: string) => {
    setInputVal(label);
    setTimeout(() => handleSend(label), 50);
  };

  // If logged in — show full KIROChat
  if (sid && chatStarted) {
    return (
      <div style={{ height:"100dvh",display:"flex",flexDirection:"column",background:T.bg,fontFamily:"'Inter',system-ui,sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box}`}</style>
        {/* slim header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",borderBottom:`1px solid ${T.border}`,background:T.s1,flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <KIROLogo size={30} />
            <span style={{ fontSize:15,fontWeight:800,color:T.text }}>KIRO</span>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <button onClick={()=>setMode(m=>m==="light"?"dark":"light")} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",cursor:"pointer",fontSize:14,color:T.sub }}>
              {mode==="light"?"🌙":"☀️"}
            </button>
            <Link href="/dashboard">
              <button style={{ padding:"7px 14px",borderRadius:8,border:`1.5px solid ${T.borderH}`,background:T.accentBg,color:T.accent,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>
                Dashboard →
              </button>
            </Link>
          </div>
        </div>
        <div style={{ flex:1,overflow:"hidden" }}>
          <KIROChatFull />
        </div>
      </div>
    );
  }

  const actions = [
    { icon:{ emoji:"🔥", bg:"rgba(239,68,68,0.1)"  }, label:"Trending products",  sub:"Live market research",                  prompt:"Find me trending products right now" },
    { icon:{ emoji:"🌐", bg:"rgba(6,182,212,0.1)"   }, label:"Import product",     sub:"Any URL — AliExpress, Temu, Amazon",    prompt:"Import a product for me" },
    { icon:{ emoji:"📣", bg:"rgba(124,58,237,0.12)" }, label:"Write ad copy",      sub:"TikTok · WhatsApp · Instagram",         prompt:"Write ad copy for my product" },
    { icon:{ emoji:"⚡", bg:"rgba(245,158,11,0.1)"  }, label:"Flash sale",         sub:"Drive sales right now",                 prompt:"Help me create a flash sale" },
    { icon:{ emoji:"🚀", bg:"rgba(16,185,129,0.1)"  }, label:"Growth plan",        sub:"Specific 5-step plan",                  prompt:"Create a growth plan for my store" },
    { icon:{ emoji:"📊", bg:"rgba(107,53,232,0.1)"  }, label:"Store pulse",        sub:"Revenue · Health · What needs action",  prompt:"Analyse my store performance" },
  ];

  const chips = [
    "✨ Find winning products",
    "🎯 Write a TikTok ad",
    "📈 Create growth plan",
  ];

  return (
    <div style={{ minHeight:"100dvh",background:T.bg,fontFamily:"'Inter',system-ui,sans-serif",display:"flex",flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        textarea{resize:none}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      `}</style>

      {/* ── Top bar ── */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",background:T.s1,borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,zIndex:50 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <KIROLogo size={32} />
          <span style={{ fontSize:16,fontWeight:800,color:T.text,letterSpacing:"-0.02em" }}>KIRO</span>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <button onClick={()=>setMode(m=>m==="light"?"dark":"light")}
            style={{ width:34,height:34,borderRadius:9,border:`1.5px solid ${T.border}`,background:"transparent",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",color:T.sub }}>
            {mode==="light"?"🌙":"☀️"}
          </button>
          {sid ? (
            <Link href="/dashboard">
              <button style={{ padding:"8px 16px",borderRadius:9,border:"none",background:`linear-gradient(135deg,${ACCENT},${ACCENT_D})`,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>
                Dashboard →
              </button>
            </Link>
          ) : (
            <button onClick={()=>setAuthOpen(true)}
              style={{ padding:"8px 16px",borderRadius:9,border:`1.5px solid ${T.borderH}`,background:T.accentBg,color:T.accent,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>
              Dashboard →
            </button>
          )}
        </div>
      </div>

      {/* ── Hero card ── */}
      <div style={{ padding:"20px 20px 0" }}>
        <motion.div
          initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}
          style={{ borderRadius:24,background:T.heroGrad,padding:"28px 24px",position:"relative",overflow:"hidden",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,marginBottom:4 }}
        >
          {/* Stars decoration */}
          {["top-right","bottom-left"].map((pos,i)=>(
            <div key={i} style={{ position:"absolute",[pos.includes("top")?"top":"bottom"]:20,[pos.includes("right")?"right":"left"]:16,fontSize:14,opacity:0.5,pointerEvents:"none" }}>✦</div>
          ))}

          <div style={{ flex:1 }}>
            <div style={{ fontSize:24,marginBottom:8 }}>👋</div>
            <h1 style={{ fontSize:26,fontWeight:900,color:T.text,letterSpacing:"-0.03em",lineHeight:1.2,marginBottom:8 }}>
              Good evening, {/* name will come from auth */}Tobi.
            </h1>
            <p style={{ fontSize:14,color:T.sub,lineHeight:1.5,marginBottom:20 }}>
              Your commerce AI is ready<br/>to help you grow.
            </p>
            {/* Store Health mini card */}
            <div style={{ display:"inline-flex",flexDirection:"column",gap:8,padding:"12px 16px",borderRadius:14,background:"rgba(255,255,255,0.8)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.6)",minWidth:180 }}>
              <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                <span style={{ fontSize:12,fontWeight:600,color:T.sub }}>Store Health</span>
                <span style={{ fontSize:10,color:T.muted,background:T.s3,borderRadius:99,padding:"1px 6px" }}>ⓘ</span>
              </div>
              <p style={{ fontSize:22,fontWeight:900,color:ACCENT,letterSpacing:"-0.04em" }}>82%</p>
              {/* block progress */}
              <div style={{ display:"flex",gap:4 }}>
                {[1,1,1,1,1,0,0,0].map((filled,i)=>(
                  <div key={i} style={{ flex:1,height:5,borderRadius:3,background:filled ? ACCENT : "rgba(124,58,237,0.15)" }} />
                ))}
              </div>
              <span style={{ fontSize:11,color:T.green,fontWeight:700 }}>● Excellent</span>
            </div>
          </div>

          {/* KIRO 3D icon */}
          <div style={{ flexShrink:0,animation:"float 3s ease-in-out infinite" }}>
            <div style={{ width:90,height:90,borderRadius:24,background:`linear-gradient(145deg,${ACCENT},${ACCENT_D})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 16px 40px ${ACCENT}50,0 4px 12px ${ACCENT}30`,position:"relative" }}>
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white" fillOpacity={.95}/>
              </svg>
              {/* bottom shadow/glow */}
              <div style={{ position:"absolute",bottom:-10,left:"50%",transform:"translateX(-50%)",width:60,height:12,borderRadius:"50%",background:`${ACCENT}30`,filter:"blur(6px)" }}/>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Quick actions grid ── */}
      <div style={{ padding:"20px 20px 0" }}>
        <p style={{ fontSize:14,fontWeight:700,color:T.text,marginBottom:12 }}>Quick actions</p>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          {actions.map((a,i) => (
            <motion.div key={a.label} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.08+i*0.05 }}>
              <ActionCard {...a} onClick={()=>handleChip(a.prompt)} T={T} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Try asking KIRO chips ── */}
      <div style={{ padding:"20px 20px 0" }}>
        <p style={{ fontSize:13,color:T.muted,marginBottom:10,fontWeight:500 }}>Try asking KIRO</p>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          {chips.map(c => <Chip key={c} label={c} onClick={()=>handleChip(c)} T={T} />)}
        </div>
      </div>

      {/* ── Input box ── */}
      <div style={{ padding:"16px 20px 24px",marginTop:"auto" }}>
        <div style={{ background:T.s1,border:`1.5px solid ${T.border}`,borderRadius:18,padding:"14px 16px",boxShadow:T.shadowMd }}>
          <textarea
            ref={inputRef}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); handleSend(); } }}
            placeholder="Message KIRO... paste a URL, describe a product, or ask"
            rows={2}
            style={{ width:"100%",border:"none",outline:"none",background:"transparent",color:T.text,fontSize:14,fontFamily:"inherit",lineHeight:1.5,color:T.sub }}
          />
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10 }}>
            <div style={{ display:"flex",gap:8 }}>
              {["🖼️","📎","🎤"].map((icon,i) => (
                <button key={i} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",color:T.muted }}>
                  {icon}
                </button>
              ))}
            </div>
            <button onClick={()=>handleSend()}
              style={{ width:38,height:38,borderRadius:10,border:"none",background:inputVal.trim() ? `linear-gradient(135deg,${ACCENT},${ACCENT_D})` : "rgba(124,58,237,0.15)",cursor:inputVal.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",boxShadow:inputVal.trim()?`0 4px 16px ${ACCENT}45`:"none" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={inputVal.trim()?"#fff":ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4z"/>
              </svg>
            </button>
          </div>
        </div>
        <p style={{ textAlign:"center",fontSize:11,color:T.muted,marginTop:10,fontWeight:500 }}>
          KIRO · Built by Darkweb & DropOS
        </p>
      </div>

      {/* Auth modal */}
      <AnimatePresence>
        {authOpen && <AuthModal onClose={()=>setAuthOpen(false)} onSuccess={token=>{ setSid(token); setAuthOpen(false); setChatStarted(true); }} T={T} />}
      </AnimatePresence>
    </div>
  );
}
