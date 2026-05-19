"use client";
// ─────────────────────────────────────────────────────────────
// /kiro — Smart public KIRO page
// • Logged-in users get the full dashboard KIRO experience
// • Visitors get a live streaming demo → auth wall at 3 messages
// ─────────────────────────────────────────────────────────────
import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Zap, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";

const API = process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api";

// Lazy-load the full dashboard KIRO (heavy component, only for authed users)
const KIROChat = dynamic(() => import("../../../components/kai/KIROChat"), {
  loading: () => (
    <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:"#07050F" }}>
      <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }}
        style={{ width:32, height:32, border:"2px solid rgba(107,53,232,0.3)", borderTopColor:"#8B5CF6", borderRadius:"50%" }}/>
    </div>
  ),
  ssr: false,
});

// ── Auth detection ──────────────────────────────────────────────────────────
async function tryAutoLogin(): Promise<{ user: any; storeId: string; accessToken: string } | null> {
  const refresh = typeof window !== "undefined" && localStorage.getItem("dropos-refresh-token");
  if (!refresh) return null;
  try {
    const res = await fetch(`${API}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.data?.accessToken) {
      const { accessToken, user, refreshToken: newRefresh } = data.data;
      if (newRefresh) localStorage.setItem("dropos-refresh-token", newRefresh);
      return { user, storeId: user?.stores?.[0]?.id || "", accessToken };
    }
  } catch {}
  return null;
}

// ── Auth Modal ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (token: string, storeId: string) => void }) {
  const [mode, setMode]   = useState<"register"|"login">("register");
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !pass) return;
    setLoading(true); setErr("");
    try {
      const body = mode === "register" ? { name, email, password: pass } : { email, password: pass };
      const res  = await fetch(`${API}/auth/${mode}`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setErr(data.message || "Something went wrong"); return; }
      if (data.data?.accessToken) {
        if (data.data.refreshToken) localStorage.setItem("dropos-refresh-token", data.data.refreshToken);
        onSuccess(data.data.accessToken, data.data.user?.stores?.[0]?.id || "");
      }
    } catch { setErr("Connection failed — try again"); }
    finally { setLoading(false); }
  };

  const inp: React.CSSProperties = { width:"100%", padding:"12px 16px", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box" };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:16, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(10px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{opacity:0,scale:0.95,y:16}} animate={{opacity:1,scale:1,y:0}}
        style={{ width:"100%", maxWidth:400, borderRadius:24, background:"#0D0918", border:"1px solid rgba(107,53,232,0.25)", padding:"28px 24px" }}>

        {/* KIRO logo */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:44, height:44, borderRadius:14, background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", boxShadow:"0 4px 20px rgba(107,53,232,0.4)" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14l9 0-1 8 10-12-9 0L13 2z" fill="white" fillOpacity={0.95}/></svg>
          </div>
          <h2 style={{ fontSize:20, fontWeight:900, color:"#F0ECFF", margin:"0 0 6px", letterSpacing:"-0.5px" }}>
            {mode === "register" ? "Save your progress" : "Welcome back"}
          </h2>
          <p style={{ fontSize:13, color:"rgba(200,190,255,0.5)", margin:0 }}>
            {mode === "register" ? "Free account · No card · 10 seconds" : "Sign in to continue with KIRO"}
          </p>
        </div>

        {/* Toggle */}
        <div style={{ display:"flex", gap:4, padding:4, borderRadius:12, background:"rgba(255,255,255,0.05)", marginBottom:18 }}>
          {(["register","login"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ flex:1, padding:"8px", borderRadius:9, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background:mode===m?"rgba(107,53,232,0.4)":"transparent", color:mode===m?"#fff":"rgba(255,255,255,0.4)", transition:"all 0.15s", fontFamily:"inherit" }}>
              {m === "register" ? "Create account" : "Sign in"}
            </button>
          ))}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {mode === "register" && (
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={inp} autoFocus/>
          )}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email" style={inp} autoFocus={mode==="login"}/>
          <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password" style={inp}
            onKeyDown={e=>e.key==="Enter"&&submit()}/>
          {err && <p style={{ fontSize:12, color:"#EF4444", textAlign:"center", margin:0 }}>{err}</p>}
          <button onClick={submit} disabled={loading||!email||!pass}
            style={{ padding:"14px", borderRadius:13, border:"none", background:loading||!email||!pass?"rgba(107,53,232,0.3)":"linear-gradient(135deg,#6B35E8,#3D1C8A)", color:"#fff", fontSize:15, fontWeight:800, cursor:loading||!email||!pass?"not-allowed":"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 4px 20px rgba(107,53,232,0.3)" }}>
            {loading ? <Loader2 size={16} style={{animation:"spin 1s linear infinite"}}/> : <Zap size={16}/>}
            {loading ? "Signing in..." : mode==="register" ? "Start free →" : "Sign in →"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Demo chat (public, unauthenticated) ──────────────────────────────────────
const STARTERS = [
  "What can KIRO do?",
  "I sell hair extensions",
  "How do I import products?",
  "What's trending in Nigeria now?",
  "Help me set up a store",
];

function DemoChat({ onAuthSuccess }: { onAuthSuccess: (token: string, storeId: string) => void }) {
  const [msgs,      setMsgs]      = useState<{ id:string; role:"user"|"kiro"; text:string; streaming?:boolean }[]>([
    { id:"0", role:"kiro", text:"Hey — I'm KIRO. I help African dropshippers find winning products, write ad copy, and run their stores from a single chat. What do you want to sell?" }
  ]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [showAuth,  setShowAuth]  = useState(false);
  const [msgCount,  setMsgCount]  = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const send = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const count = msgCount + 1;
    setMsgCount(count);

    // Auth wall after 4 messages
    if (count >= 4) {
      setMsgs(p => [...p, { id:Date.now().toString(), role:"user", text:msg }]);
      setTimeout(() => setShowAuth(true), 600);
      return;
    }

    const kid = `k${Date.now()}`;
    setMsgs(p => [...p, { id:`u${Date.now()}`, role:"user", text:msg }, { id:kid, role:"kiro", text:"", streaming:true }]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/kai/public-chat`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ message:msg }),
      });
      if (!res.ok || !res.body) throw new Error();
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value,{stream:true}).split("\n").filter(l=>l.startsWith("data: "))) {
          try {
            const p = JSON.parse(line.slice(6));
            if (p.token) { full += p.token; setMsgs(prev => prev.map(m => m.id===kid ? {...m, text:full} : m)); bottomRef.current?.scrollIntoView({behavior:"smooth"}); }
            if (p.done) setMsgs(prev => prev.map(m => m.id===kid ? {...m, streaming:false} : m));
          } catch {}
        }
      }
    } catch {
      setMsgs(p => p.map(m => m.id===kid ? {...m, text:"I'm ready to help. Create a free account to unlock the full experience.", streaming:false} : m));
    } finally { setLoading(false); }
  }, [input, loading, msgCount]);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", position:"relative" }}>
      {showAuth && <AuthModal onClose={()=>setShowAuth(false)} onSuccess={onAuthSuccess}/>}

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"20px 16px 8px", scrollbarWidth:"thin" }}>
        {msgs.map(msg => (
          <motion.div key={msg.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
            style={{ display:"flex", flexDirection:msg.role==="user"?"row-reverse":"row", gap:8, alignItems:"flex-end", marginBottom:14 }}>
            {msg.role==="kiro" && (
              <div style={{ width:28, height:28, borderRadius:9, background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 2px 8px rgba(107,53,232,0.4)" }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14l9 0-1 8 10-12-9 0L13 2z" fill="white" fillOpacity={0.95}/></svg>
              </div>
            )}
            <div style={{ maxWidth:"80%", padding:"10px 14px", borderRadius:msg.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",
              background:msg.role==="user"?"linear-gradient(135deg,#6B35E8,#4C1D95)":"rgba(255,255,255,0.07)",
              color:"#F0ECFF", fontSize:14, lineHeight:1.65 }}>
              {msg.text || (msg.streaming && (
                <span style={{display:"flex",alignItems:"center",gap:5}}>
                  {[0,1,2].map(i=><motion.span key={i} style={{width:5,height:5,borderRadius:"50%",background:"rgba(167,139,250,0.6)",display:"block"}} animate={{y:[0,-4,0]}} transition={{duration:0.6,repeat:Infinity,delay:i*0.12}}/>)}
                </span>
              ))}
              {msg.streaming && msg.text && <motion.span animate={{opacity:[1,0]}} transition={{duration:0.5,repeat:Infinity}}>▋</motion.span>}
            </div>
          </motion.div>
        ))}

        {/* Auth nudge card after 2 messages */}
        {msgCount >= 2 && !showAuth && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
            style={{ margin:"12px 0 16px", padding:"14px 16px", borderRadius:16, background:"rgba(107,53,232,0.1)", border:"1px solid rgba(107,53,232,0.25)" }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#F0ECFF", margin:"0 0 4px" }}>KIRO is better with your store</p>
            <p style={{ fontSize:12, color:"rgba(200,190,255,0.6)", margin:"0 0 10px" }}>Free account unlocks: product import, sales analytics, AI ad copy, and the full commerce OS.</p>
            <button onClick={()=>setShowAuth(true)}
              style={{ padding:"8px 18px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#6B35E8,#4C1D95)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
              <Zap size={13}/> Start free — takes 10 seconds
            </button>
          </motion.div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Starters */}
      {msgs.length <= 1 && (
        <div style={{ padding:"0 16px 8px", display:"flex", gap:6, flexWrap:"wrap" }}>
          {STARTERS.map(s => (
            <button key={s} onClick={()=>send(s)}
              style={{ padding:"6px 12px", borderRadius:99, border:"1px solid rgba(107,53,232,0.25)", background:"rgba(107,53,232,0.08)", color:"rgba(200,190,255,0.7)", fontSize:12, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding:"10px 14px 16px", borderTop:"1px solid rgba(107,53,232,0.1)" }}>
        <div style={{ display:"flex", gap:8, alignItems:"flex-end", borderRadius:16, border:"1px solid rgba(107,53,232,0.2)", background:"rgba(107,53,232,0.05)", padding:"10px 12px" }}>
          <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Ask KIRO anything..."
            rows={1}
            style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#F0ECFF", fontSize:14, fontFamily:"inherit", lineHeight:1.5, resize:"none", padding:"2px 0" }}/>
          <motion.button onClick={()=>send()} whileTap={{scale:0.9}} disabled={loading||!input.trim()}
            style={{ width:32, height:32, borderRadius:10, border:"none", background:input.trim()?"linear-gradient(135deg,#6B35E8,#4C1D95)":"rgba(107,53,232,0.15)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {loading
              ? <span style={{width:12,height:12,border:"2px solid rgba(107,53,232,0.4)",borderTopColor:"#8B5CF6",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"block"}}/>
              : <svg width={13} height={13} viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke={input.trim()?"#fff":"rgba(200,190,255,0.3)"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </motion.button>
        </div>
        <p style={{ fontSize:10, color:"rgba(200,190,255,0.2)", textAlign:"center", margin:"6px 0 0" }}>
          KIRO · Built by Darkweb & DropOS
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PublicKIROPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<"checking"|"authed"|"guest">("checking");
  const [storeId,   setStoreId]   = useState("");
  const [accessToken, setAccessToken] = useState("");

  // On mount: try to restore session
  useEffect(() => {
    tryAutoLogin().then(result => {
      if (result) {
        setStoreId(result.storeId);
        setAccessToken(result.accessToken);
        // Also sync into zustand store so KIROChat can use it
        try {
          const { useAuthStore } = require("../../../store/auth.store");
          useAuthStore.getState().setUser(result.user);
          useAuthStore.getState().setAccessToken(result.accessToken);
        } catch {}
        setAuthState("authed");
      } else {
        setAuthState("guest");
      }
    });
  }, []);

  const handleAuthSuccess = (token: string, sid: string) => {
    setAccessToken(token);
    setStoreId(sid);
    setAuthState("authed");
    // Sync into auth store
    try {
      const { useAuthStore } = require("../../../store/auth.store");
      useAuthStore.getState().setAccessToken(token);
    } catch {}
  };

  // Loading
  if (authState === "checking") {
    return (
      <div style={{ height:"100dvh", display:"flex", alignItems:"center", justifyContent:"center", background:"#07050F" }}>
        <motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:"linear"}}
          style={{width:36,height:36,border:"2px solid rgba(107,53,232,0.2)",borderTopColor:"#8B5CF6",borderRadius:"50%"}}/>
      </div>
    );
  }

  // ── Authenticated: show full KIRO dashboard ──────────────────────────────
  if (authState === "authed") {
    return (
      <div style={{ height:"100dvh", background:"#07050F", display:"flex", flexDirection:"column" }}>
        {/* Minimal top bar with link to full dashboard */}
        <div style={{ height:48, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", borderBottom:"1px solid rgba(107,53,232,0.1)", background:"rgba(7,5,15,0.95)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:9, background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14l9 0-1 8 10-12-9 0L13 2z" fill="white"/></svg>
            </div>
            <span style={{ fontSize:15, fontWeight:800, color:"#F0ECFF", letterSpacing:"-0.3px" }}>KIRO</span>
          </div>
          <Link href="/dashboard" style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", borderRadius:10, background:"rgba(107,53,232,0.15)", color:"#A78BFA", fontSize:12, fontWeight:600, textDecoration:"none", border:"1px solid rgba(107,53,232,0.2)" }}>
            Full dashboard <ArrowRight size={12}/>
          </Link>
        </div>
        {/* Full KIROChat */}
        <div style={{ flex:1, overflow:"hidden" }}>
          <KIROChat storeId={storeId}/>
        </div>
      </div>
    );
  }

  // ── Guest: demo chat + social proof ─────────────────────────────────────
  return (
    <div style={{ height:"100dvh", background:"#07050F", display:"flex", flexDirection:"column", fontFamily:"'Inter',-apple-system,sans-serif", overflow:"hidden" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(107,53,232,0.3);border-radius:2px}
        * { box-sizing: border-box; }
      `}</style>

      {/* Top bar */}
      <div style={{ height:52, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", borderBottom:"1px solid rgba(107,53,232,0.1)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:10, background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 10px rgba(107,53,232,0.4)" }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14l9 0-1 8 10-12-9 0L13 2z" fill="white"/></svg>
          </div>
          <span style={{ fontSize:16, fontWeight:900, color:"#F0ECFF", letterSpacing:"-0.5px" }}>KIRO</span>
          <span style={{ fontSize:10, padding:"2px 7px", borderRadius:99, background:"rgba(107,53,232,0.2)", color:"#A78BFA", fontWeight:700, letterSpacing:"0.05em" }}>DEMO</span>
        </div>
        <Link href="/auth/register"
          style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", color:"#fff", fontSize:13, fontWeight:700, textDecoration:"none", boxShadow:"0 2px 10px rgba(107,53,232,0.3)" }}>
          <Zap size={12}/> Get started free
        </Link>
      </div>

      {/* Demo chat */}
      <div style={{ flex:1, overflow:"hidden" }}>
        <DemoChat onAuthSuccess={handleAuthSuccess}/>
      </div>

      {/* Bottom feature pills */}
      <div style={{ padding:"8px 16px 12px", borderTop:"1px solid rgba(107,53,232,0.08)", display:"flex", gap:8, overflowX:"auto", flexShrink:0 }}>
        {["🌐 Import any product","📊 Live analytics","⚡ Flash sales","🎵 TikTok scripts","📈 Winning products"].map(f => (
          <span key={f} style={{ padding:"5px 10px", borderRadius:99, border:"1px solid rgba(107,53,232,0.15)", background:"rgba(107,53,232,0.06)", color:"rgba(200,190,255,0.55)", fontSize:11, whiteSpace:"nowrap", flexShrink:0 }}>{f}</span>
        ))}
      </div>
    </div>
  );
}
