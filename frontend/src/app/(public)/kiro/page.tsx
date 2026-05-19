"use client";
// /kiro — Smart public KIRO page (completely rewritten)
// Auth-aware: logged in → full KIRO at /kiro, visitor → live demo with auth wall
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const API = process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api";

// Lazy-load full KIRO — only for authed users
const KIROChat = dynamic(() => import("../../../components/kai/KIROChat"), { ssr: false });

// ── Try to restore auth session silently ─────────────────────────────────────
async function tryAutoLogin(): Promise<{ storeId: string; accessToken: string } | null> {
  if (typeof window === "undefined") return null;
  const refresh = localStorage.getItem("dropos-refresh-token");
  if (!refresh) return null;
  try {
    const res = await fetch(`${API}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const { accessToken, user, refreshToken: newR } = data.data || {};
    if (!accessToken) return null;
    if (newR) localStorage.setItem("dropos-refresh-token", newR);
    try {
      const { useAuthStore } = await import("../../../store/auth.store");
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setAccessToken(accessToken);
    } catch {}
    return { storeId: user?.stores?.[0]?.id || "", accessToken };
  } catch { return null; }
}

// ── Auth Modal ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (sid: string) => void }) {
  const [mode, setMode]   = useState<"register"|"login">("register");
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [err, setErr]     = useState("");
  const [busy, setBusy]   = useState(false);
  const router            = useRouter();

  const submit = async () => {
    if (!email || !pass) return;
    setBusy(true); setErr("");
    try {
      const body = mode === "register" ? { name, email, password: pass } : { email, password: pass };
      const res  = await fetch(`${API}/auth/${mode}`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setErr(data.message || "Something went wrong"); return; }
      const { accessToken, refreshToken, user } = data.data || {};
      if (refreshToken) localStorage.setItem("dropos-refresh-token", refreshToken);
      if (accessToken) {
        try {
          const { useAuthStore } = await import("../../../store/auth.store");
          useAuthStore.getState().setUser(user);
          useAuthStore.getState().setAccessToken(accessToken);
        } catch {}
        onSuccess(user?.stores?.[0]?.id || "");
      }
    } catch { setErr("Connection failed — try again"); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:16, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(12px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{opacity:0,scale:0.94,y:12}} animate={{opacity:1,scale:1,y:0}} transition={{type:"spring",stiffness:300,damping:26}}
        style={{ width:"100%", maxWidth:380, borderRadius:20, background:"#0D0918", border:"1px solid rgba(124,58,237,0.25)", padding:"24px 20px", boxShadow:"0 20px 60px rgba(0,0,0,0.6)" }}>
        {/* KIRO mark */}
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ width:42, height:42, borderRadius:13, background:"linear-gradient(135deg,#7C3AED,#4C1D95)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", boxShadow:"0 4px 16px rgba(124,58,237,0.5)" }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14l9 0-1 8 10-12-9 0L13 2z" fill="white"/></svg>
          </div>
          <h2 style={{ fontSize:18, fontWeight:800, color:"#F0ECFF", margin:"0 0 4px", letterSpacing:"-0.4px" }}>
            {mode === "register" ? "Create your free account" : "Welcome back"}
          </h2>
          <p style={{ fontSize:12, color:"rgba(200,190,255,0.5)", margin:0 }}>
            {mode === "register" ? "No card · 10 seconds · Full KIRO access" : "Sign in to continue"}
          </p>
        </div>
        {/* Toggle */}
        <div style={{ display:"flex", gap:3, padding:3, borderRadius:11, background:"rgba(255,255,255,0.05)", marginBottom:14 }}>
          {(["register","login"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setErr(""); }}
              style={{ flex:1, padding:"7px", borderRadius:9, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit", background:mode===m?"rgba(124,58,237,0.45)":"transparent", color:mode===m?"#fff":"rgba(255,255,255,0.4)", transition:"all 0.15s" }}>
              {m === "register" ? "Sign up" : "Sign in"}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {mode === "register" && (
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoFocus
              style={{ padding:"11px 14px", borderRadius:11, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:13, outline:"none", fontFamily:"inherit" }}/>
          )}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" autoFocus={mode==="login"}
            style={{ padding:"11px 14px", borderRadius:11, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:13, outline:"none", fontFamily:"inherit" }}/>
          <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password"
            onKeyDown={e=>e.key==="Enter"&&submit()}
            style={{ padding:"11px 14px", borderRadius:11, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:13, outline:"none", fontFamily:"inherit" }}/>
          {err && <p style={{ fontSize:12, color:"#F87171", margin:0, textAlign:"center" }}>{err}</p>}
          <button onClick={submit} disabled={busy||!email||!pass}
            style={{ padding:"12px", borderRadius:12, border:"none", background:busy||!email||!pass?"rgba(124,58,237,0.3)":"linear-gradient(135deg,#7C3AED,#4C1D95)", color:"#fff", fontSize:14, fontWeight:800, cursor:busy||!email||!pass?"not-allowed":"pointer", fontFamily:"inherit", marginTop:2, boxShadow:"0 4px 16px rgba(124,58,237,0.4)" }}>
            {busy ? "…" : mode === "register" ? "Create account →" : "Sign in →"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Demo Chat (for unauthenticated visitors) ─────────────────────────────────
const STARTERS = [
  "What can KIRO do?",
  "I sell hair extensions",
  "Help me import a product",
  "What's trending in Nigeria?",
  "How do I grow my store?",
];

function DemoChat({ onAuthSuccess }: { onAuthSuccess: (sid: string) => void }) {
  const [msgs,     setMsgs]     = useState<{ id:string; role:"user"|"kiro"; text:string }[]>([
    { id:"0", role:"kiro", text:"Hey — I'm KIRO. I help African dropshippers find products, write ad copy, and run their stores from a single chat. What do you want to sell?" }
  ]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [msgs]);

  const send = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const count = msgCount + 1;
    setMsgCount(count);
    if (count >= 5) {
      setMsgs(p => [...p, { id:`u${Date.now()}`, role:"user", text:msg }]);
      setTimeout(() => setShowAuth(true), 400);
      return;
    }
    const kid = `k${Date.now()}`;
    setMsgs(p => [...p,
      { id:`u${Date.now()}`, role:"user", text:msg },
      { id:kid, role:"kiro", text:"" },
    ]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/kai/public-chat`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ message:msg }),
      });
      if (!res.ok || !res.body) throw new Error();
      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value,{stream:true}).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const p = JSON.parse(line.slice(6));
            if (p.token) { full += p.token; setMsgs(prev => prev.map(m => m.id===kid ? {...m,text:full} : m)); bottomRef.current?.scrollIntoView({behavior:"smooth"}); }
          } catch {}
        }
      }
      setMsgs(prev => prev.map(m => m.id===kid ? {...m,text:full||"I'm ready to help. Create a free account to unlock the full experience."} : m));
    } catch {
      setMsgs(p => p.map(m => m.id===kid ? {...m,text:"I'm ready to help — create a free account to get started."} : m));
    } finally { setLoading(false); }
  }, [input, loading, msgCount]);

  const t = { bg:"#07050F", v500:"#7C3AED", v300:"#A78BFA", text:"#F0ECFF", muted:"rgba(200,190,255,0.5)" };

  return (
    <>
      {showAuth && <AuthModal onClose={()=>setShowAuth(false)} onSuccess={onAuthSuccess}/>}
      <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0 }}>
        {/* Messages — takes all available space */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 14px 8px", minHeight:0, WebkitOverflowScrolling:"touch" }}>
          {msgs.map(msg => (
            <motion.div key={msg.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
              style={{ display:"flex", flexDirection:msg.role==="user"?"row-reverse":"row", gap:8, alignItems:"flex-end", marginBottom:12 }}>
              {msg.role==="kiro" && (
                <div style={{ width:26, height:26, borderRadius:8, background:`linear-gradient(135deg,${t.v500},#4C1D95)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 2px 8px rgba(124,58,237,0.4)` }}>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14l9 0-1 8 10-12-9 0L13 2z" fill="white"/></svg>
                </div>
              )}
              <div style={{ maxWidth:"80%", padding:msg.role==="user"?"10px 14px":"8px 0",
                borderRadius:msg.role==="user"?"18px 18px 4px 18px":"0",
                background:msg.role==="user"?`linear-gradient(135deg,${t.v500},#5B21B6)`:"transparent",
                color:t.text, fontSize:14, lineHeight:1.65, boxShadow:msg.role==="user"?"0 3px 12px rgba(124,58,237,0.3)":"none" }}>
                {msg.text || (loading && msg.id===msgs[msgs.length-1]?.id && (
                  <span style={{display:"flex",gap:4}}>
                    {[0,1,2].map(i=><motion.span key={i} style={{width:5,height:5,borderRadius:"50%",background:"rgba(167,139,250,0.6)",display:"block"}} animate={{y:[0,-4,0]}} transition={{duration:0.6,repeat:Infinity,delay:i*0.12}}/>)}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Auth nudge after 2 messages */}
          {msgCount >= 2 && !showAuth && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
              style={{ margin:"10px 0 12px", padding:"12px 14px", borderRadius:14, background:"rgba(124,58,237,0.08)", border:"1px solid rgba(124,58,237,0.2)" }}>
              <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 3px" }}>KIRO is better with your store</p>
              <p style={{ fontSize:12, color:t.muted, margin:"0 0 10px" }}>Free account → full product import, analytics, AI copy, and more.</p>
              <button onClick={()=>setShowAuth(true)}
                style={{ padding:"7px 16px", borderRadius:9, border:"none", background:`linear-gradient(135deg,${t.v500},#4C1D95)`, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                Start free — 10 seconds
              </button>
            </motion.div>
          )}
          <div ref={bottomRef} style={{ height:1 }}/>
        </div>

        {/* Quick starters */}
        {msgs.length <= 1 && (
          <div style={{ padding:"0 14px 6px", display:"flex", gap:6, overflowX:"auto", flexShrink:0, WebkitOverflowScrolling:"touch" }}>
            {STARTERS.map(s => (
              <button key={s} onClick={()=>send(s)}
                style={{ padding:"6px 12px", borderRadius:99, border:"1px solid rgba(124,58,237,0.2)", background:"rgba(124,58,237,0.07)", color:"rgba(200,190,255,0.7)", fontSize:12, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", flexShrink:0 }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input — always at bottom, never pushes up */}
        <div style={{ padding:"8px 12px 12px", borderTop:"1px solid rgba(124,58,237,0.1)", flexShrink:0, background:"rgba(7,5,15,0.98)" }}>
          <div style={{ display:"flex", gap:8, alignItems:"flex-end", borderRadius:14, border:"1px solid rgba(124,58,237,0.18)", background:"rgba(124,58,237,0.05)", padding:"8px 10px" }}>
            <textarea ref={inputRef} value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
              }}
              onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
              placeholder="Ask KIRO anything..."
              rows={1}
              style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#F0ECFF", fontSize:14, fontFamily:"inherit", lineHeight:1.5, resize:"none", padding:"2px 0", maxHeight:100, overflowY:"auto" }}/>
            <motion.button onClick={()=>send()} whileTap={{scale:0.9}} disabled={loading||!input.trim()}
              style={{ width:30, height:30, borderRadius:9, border:"none", background:input.trim()?`linear-gradient(135deg,#7C3AED,#4C1D95)`:"rgba(124,58,237,0.12)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" }}>
              {loading
                ? <span style={{width:11,height:11,border:"2px solid rgba(124,58,237,0.4)",borderTopColor:"#8B5CF6",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"block"}}/>
                : <svg width={12} height={12} viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke={input.trim()?"#fff":"rgba(200,190,255,0.25)"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function PublicKIROPage() {
  const [authState, setAuthState] = useState<"checking"|"authed"|"guest">("checking");
  const [storeId,   setStoreId]   = useState("");

  useEffect(() => {
    tryAutoLogin().then(r => {
      if (r) { setStoreId(r.storeId); setAuthState("authed"); }
      else   { setAuthState("guest"); }
    });
  }, []);

  const handleAuthSuccess = (sid: string) => {
    setStoreId(sid);
    setAuthState("authed");
  };

  const C = {
    bg: "#07050F", v500:"#7C3AED", v300:"#A78BFA", text:"#F0ECFF", border:"rgba(124,58,237,0.1)",
  };

  // Loading
  if (authState === "checking") return (
    <div style={{ height:"100dvh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg }}>
      <motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:"linear"}}
        style={{width:30,height:30,border:"2px solid rgba(124,58,237,0.2)",borderTopColor:"#8B5CF6",borderRadius:"50%"}}/>
    </div>
  );

  // Authed — full KIRO, minimal chrome
  if (authState === "authed") return (
    <div style={{ height:"100dvh", display:"flex", flexDirection:"column", background:C.bg, overflow:"hidden" }}>
      <style>{`*{box-sizing:border-box}`}</style>
      {/* Slim top bar */}
      <div style={{ height:46, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px", borderBottom:`1px solid ${C.border}`, background:"rgba(7,5,15,0.98)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <div style={{ width:26, height:26, borderRadius:8, background:`linear-gradient(135deg,${C.v500},#4C1D95)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14l9 0-1 8 10-12-9 0L13 2z" fill="white"/></svg>
          </div>
          <span style={{ fontSize:14, fontWeight:900, color:C.text, letterSpacing:"-0.3px" }}>KIRO</span>
        </div>
        <Link href="/dashboard"
          style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 12px", borderRadius:9, background:`rgba(124,58,237,0.12)`, color:C.v300, fontSize:12, fontWeight:600, textDecoration:"none", border:`1px solid rgba(124,58,237,0.2)` }}>
          Dashboard →
        </Link>
      </div>
      {/* Full KIROChat — takes all remaining height */}
      <div style={{ flex:1, overflow:"hidden", minHeight:0 }}>
        <KIROChat storeId={storeId}/>
      </div>
    </div>
  );

  // Guest — demo + auth conversion
  return (
    <div style={{ height:"100dvh", display:"flex", flexDirection:"column", background:C.bg, overflow:"hidden", fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(124,58,237,0.25);border-radius:2px}
      `}</style>

      {/* Top bar */}
      <div style={{ height:50, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px", borderBottom:`1px solid ${C.border}`, background:"rgba(7,5,15,0.98)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:9, background:`linear-gradient(135deg,${C.v500},#4C1D95)`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 10px rgba(124,58,237,0.4)" }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14l9 0-1 8 10-12-9 0L13 2z" fill="white"/></svg>
          </div>
          <span style={{ fontSize:15, fontWeight:900, color:C.text, letterSpacing:"-0.4px" }}>KIRO</span>
          <span style={{ fontSize:9, padding:"2px 6px", borderRadius:99, background:"rgba(124,58,237,0.18)", color:C.v300, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>Demo</span>
        </div>
        <Link href="/auth/register"
          style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", borderRadius:10, background:`linear-gradient(135deg,${C.v500},#4C1D95)`, color:"#fff", fontSize:12, fontWeight:700, textDecoration:"none", boxShadow:"0 2px 10px rgba(124,58,237,0.35)" }}>
          ⚡ Free account
        </Link>
      </div>

      {/* Chat — fills everything between top bar and bottom pills */}
      <div style={{ flex:1, minHeight:0, overflow:"hidden" }}>
        <DemoChat onAuthSuccess={handleAuthSuccess}/>
      </div>

      {/* Feature pills — fixed at bottom */}
      <div style={{ padding:"8px 12px 10px", borderTop:`1px solid rgba(124,58,237,0.08)`, display:"flex", gap:6, overflowX:"auto", flexShrink:0, background:"rgba(7,5,15,0.98)", WebkitOverflowScrolling:"touch" }}>
        {["🌐 Import any product","📊 Live analytics","⚡ Flash sales","🎵 TikTok scripts","📈 Winning products"].map(f => (
          <span key={f} style={{ padding:"5px 10px", borderRadius:99, border:`1px solid rgba(124,58,237,0.15)`, background:"rgba(124,58,237,0.06)", color:"rgba(200,190,255,0.5)", fontSize:11, whiteSpace:"nowrap", flexShrink:0 }}>{f}</span>
        ))}
      </div>
    </div>
  );
}
