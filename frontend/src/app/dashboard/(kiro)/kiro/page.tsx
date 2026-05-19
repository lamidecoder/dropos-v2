"use client";
// ─────────────────────────────────────────────────────────────────────────────
// KIRO Full-Screen — completely separate from the dashboard nav
// Architecture: Left history sidebar (240px) + Right chat (flex-1)
// No tab bar. No dashboard nav bleeding in. Full immersion like Claude.ai
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../../lib/api";
import { useAuthStore } from "../../../../store/auth.store";
import { useRouter } from "next/navigation";
import KIROChat from "../../../../components/kai/KIROChat";
import { KIROOnboarding, useKIROOnboarding } from "../../../../components/kai/KIROOnboarding";
import Link from "next/link";

// ── Theme ─────────────────────────────────────────────────────────────────────
const BG    = "#07050F";
const PANEL = "#0D0918";
const BORDER= "rgba(107,53,232,0.1)";
const V400  = "#8B5CF6";
const V500  = "#6B35E8";
const V300  = "#A78BFA";
const TEXT  = "#F0ECFF";
const MUTED = "rgba(200,190,255,0.45)";

// ── Group conversations by date ───────────────────────────────────────────────
function groupByDate(convs: any[]) {
  const now   = Date.now();
  const DAY   = 86400000;
  const today = new Date().toDateString();
  const yest  = new Date(now - DAY).toDateString();
  const g: Record<string,any[]> = { Today:[], Yesterday:[], "This week":[], Older:[] };
  convs.forEach(c => {
    const d = new Date(c.updatedAt||c.createdAt).toDateString();
    if (d===today)            g.Today.push(c);
    else if (d===yest)        g.Yesterday.push(c);
    else if (now - new Date(c.updatedAt||c.createdAt).getTime() < 7*DAY) g["This week"].push(c);
    else                      g.Older.push(c);
  });
  return g;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ activeId, setActiveId, conversations, loading, onDelete, onRename, onPin, onNew, onClose, isMobile }: any) {
  const [search, setSearch]   = useState("");
  const [editing, setEditing] = useState<string|null>(null);
  const [editVal, setEditVal] = useState("");

  const filtered = conversations.filter((c: any) =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase())
  );
  const pinned  = filtered.filter((c: any) => c.pinned);
  const rest    = filtered.filter((c: any) => !c.pinned);
  const groups  = groupByDate(rest);

  function ConvItem({ c }: { c: any }) {
    const active = activeId === c.id;
    const [hover, setHover]  = useState(false);
    const [menu,  setMenu]   = useState(false);

    if (editing === c.id) return (
      <div style={{ padding:"3px 8px" }}>
        <input autoFocus value={editVal}
          onChange={e => setEditVal(e.target.value)}
          onKeyDown={e => { if(e.key==="Enter"){onRename(c.id,editVal);setEditing(null);} if(e.key==="Escape")setEditing(null); }}
          style={{ width:"100%", padding:"5px 10px", borderRadius:8, border:`1px solid ${V400}`, background:"rgba(107,53,232,0.1)", color:TEXT, fontSize:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
      </div>
    );

    return (
      <div
        onMouseEnter={()=>setHover(true)} onMouseLeave={()=>{setHover(false);setMenu(false);}}
        onClick={()=>{setActiveId(c.id);onClose?.();}}
        style={{ margin:"1px 8px", padding:"8px 10px", borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s",
          background:active?"rgba(107,53,232,0.15)":hover?"rgba(107,53,232,0.06)":"transparent",
          border:`1px solid ${active?"rgba(107,53,232,0.25)":"transparent"}` }}>
        {c.pinned && <span style={{fontSize:8,color:V400,flexShrink:0}}>📌</span>}
        <p style={{ flex:1, fontSize:12, fontWeight:active?600:400, color:active?V300:MUTED, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", lineHeight:1.3 }}>
          {c.title || "New conversation"}
        </p>
        <AnimatePresence>
          {(hover||active) && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              style={{display:"flex",gap:2,flexShrink:0}}
              onClick={e=>e.stopPropagation()}>
              <button onClick={()=>{setEditing(c.id);setEditVal(c.title||"");}}
                title="Rename"
                style={{width:20,height:20,borderRadius:5,border:"none",background:"transparent",color:MUTED,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}>
                ✎
              </button>
              <button onClick={()=>onPin(c.id,!c.pinned)} title={c.pinned?"Unpin":"Pin"}
                style={{width:20,height:20,borderRadius:5,border:"none",background:"transparent",color:MUTED,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}>
                📌
              </button>
              <button onClick={()=>onDelete(c.id)} title="Delete"
                style={{width:20,height:20,borderRadius:5,border:"none",background:"transparent",color:"rgba(239,68,68,0.6)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}>
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:PANEL, borderRight:`1px solid ${BORDER}` }}>

      {/* Logo + Back to dashboard */}
      <div style={{ padding:"16px 14px 12px", borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <motion.div animate={{scale:[1,1.05,1]}} transition={{duration:3,repeat:Infinity,ease:"easeInOut"}}
              style={{width:30,height:30,borderRadius:10,background:`linear-gradient(135deg,${V500},#3D1C8A)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 2px 10px rgba(107,53,232,0.4)`}}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14l9 0-1 8 10-12-9 0L13 2z" fill="white"/></svg>
            </motion.div>
            <div>
              <p style={{fontSize:14,fontWeight:900,color:TEXT,margin:0,letterSpacing:"-0.3px"}}>KIRO</p>
              <p style={{fontSize:9,color:MUTED,margin:0,letterSpacing:"0.08em",fontWeight:700,textTransform:"uppercase"}}>Commerce AI</p>
            </div>
          </div>
          {/* Back to dashboard */}
          <Link href="/dashboard" title="Back to dashboard"
            style={{width:28,height:28,borderRadius:8,border:`1px solid ${BORDER}`,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:MUTED,fontSize:14,transition:"all 0.15s"}}
            onMouseEnter={e=>(e.currentTarget.style.background="rgba(107,53,232,0.1)")}
            onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
            ←
          </Link>
        </div>

        {/* New chat button */}
        <button onClick={onNew}
          style={{width:"100%",padding:"9px",borderRadius:11,border:`1px solid rgba(107,53,232,0.25)`,background:"rgba(107,53,232,0.08)",color:V300,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all 0.15s"}}
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(107,53,232,0.16)";}}
          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(107,53,232,0.08)";}}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"/></svg>
          New conversation
        </button>
      </div>

      {/* Search */}
      <div style={{padding:"8px 10px 4px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 10px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${BORDER}`}}>
          <span style={{fontSize:11,color:MUTED,flexShrink:0}}>⌕</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."
            style={{flex:1,background:"transparent",border:"none",outline:"none",color:TEXT,fontSize:12,fontFamily:"inherit"}}/>
        </div>
      </div>

      {/* Conversation list */}
      <div style={{flex:1,overflowY:"auto",paddingBottom:8,scrollbarWidth:"thin",scrollbarColor:`rgba(107,53,232,0.2) transparent`}}>
        {pinned.length > 0 && (
          <div style={{marginBottom:4}}>
            <p style={{padding:"6px 16px 2px",fontSize:9,fontWeight:800,color:MUTED,textTransform:"uppercase",letterSpacing:"0.1em",margin:0}}>Pinned</p>
            {pinned.map((c:any)=><ConvItem key={c.id} c={c}/>)}
          </div>
        )}
        {Object.entries(groups).map(([label,convs])=>
          convs.length > 0 ? (
            <div key={label} style={{marginBottom:4}}>
              <p style={{padding:"6px 16px 2px",fontSize:9,fontWeight:800,color:MUTED,textTransform:"uppercase",letterSpacing:"0.1em",margin:0}}>{label}</p>
              {convs.map((c:any)=><ConvItem key={c.id} c={c}/>)}
            </div>
          ) : null
        )}
        {loading && (
          <div style={{padding:"16px",textAlign:"center"}}>
            <motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:"linear"}}
              style={{width:16,height:16,border:`2px solid rgba(107,53,232,0.2)`,borderTopColor:V400,borderRadius:"50%",margin:"0 auto"}}/>
          </div>
        )}
        {!loading && filtered.length===0 && (
          <div style={{padding:"32px 16px",textAlign:"center"}}>
            <p style={{fontSize:32,margin:"0 0 8px"}}>💬</p>
            <p style={{fontSize:12,fontWeight:700,color:TEXT,margin:"0 0 4px"}}>{search?"No results":"No conversations yet"}</p>
            <p style={{fontSize:11,color:MUTED,margin:0}}>Start a conversation to see it here</p>
          </div>
        )}
      </div>

      {/* Plan indicator */}
      <div style={{padding:"10px 12px",borderTop:`1px solid ${BORDER}`,flexShrink:0}}>
        <Link href="/dashboard/billing" style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:10,textDecoration:"none",background:"rgba(107,53,232,0.06)",border:`1px solid ${BORDER}`,transition:"all 0.15s"}}
          onMouseEnter={e=>(e.currentTarget.style.background="rgba(107,53,232,0.12)")}
          onMouseLeave={e=>(e.currentTarget.style.background="rgba(107,53,232,0.06)")}>
          <div style={{width:28,height:28,borderRadius:8,background:"rgba(107,53,232,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>⚡</div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:11,fontWeight:700,color:TEXT,margin:0}}>Upgrade KIRO</p>
            <p style={{fontSize:10,color:MUTED,margin:0}}>More sessions + all features</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function KIROPage() {
  const router = useRouter();
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const qc      = useQueryClient();

  const [activeId,     setActiveId]     = useState<string|null>(null);
  const [showMobSide,  setShowMobSide]  = useState(false);
  const { show: showOnboarding, complete: completeOnboarding } = useKIROOnboarding(storeId);

  // Load conversations
  const { data: conversations=[], isLoading } = useQuery({
    queryKey: ["kiro-conversations", storeId],
    queryFn:  () => api.get(`/kai/conversations?storeId=${storeId}`).then(r => r.data.data||[]),
    enabled:  !!storeId,
    staleTime: 30000,
  });

  // Morning brief (shown once per session in the empty state, not a banner)
  const { data: briefData } = useQuery({
    queryKey: ["morning-brief", storeId],
    queryFn:  () => api.get(`/kai/morning-brief?storeId=${storeId}`).then(r => r.data.data),
    enabled:  !!storeId,
    staleTime: 600000,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/kai/conversations/${id}`),
    onSuccess:  (_,id) => { qc.invalidateQueries({queryKey:["kiro-conversations"]}); if(activeId===id)setActiveId(null); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...data }: any) => api.patch(`/kai/conversations/${id}`, data),
    onSuccess:  () => qc.invalidateQueries({queryKey:["kiro-conversations"]}),
  });

  // ⌘K shortcut
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey||e.ctrlKey) && e.key==="k") { e.preventDefault(); setActiveId(null); }};
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div style={{ display:"flex", height:"100dvh", background:BG, fontFamily:"'Inter',-apple-system,sans-serif", overflow:"hidden" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(107,53,232,0.2);border-radius:2px}
      `}</style>

      {/* Onboarding */}
      {showOnboarding && storeId && <KIROOnboarding storeId={storeId} onComplete={completeOnboarding}/>}

      {/* ── DESKTOP sidebar ── */}
      <div style={{ width:240, flexShrink:0, display:"none" }} className="kiro-sidebar-desktop">
        <Sidebar
          activeId={activeId} setActiveId={setActiveId}
          conversations={conversations} loading={isLoading}
          onDelete={(id: string) => deleteMut.mutate(id)}
          onRename={(id: string, title: string) => updateMut.mutate({id,title})}
          onPin={(id: string, pinned: boolean) => updateMut.mutate({id,pinned})}
          onNew={() => setActiveId(null)}
        />
      </div>

      {/* Desktop sidebar via CSS (next doesn't support inline flex for server components) */}
      <style>{`
        @media(min-width:768px){ .kiro-sidebar-desktop{display:block!important} .kiro-mob-bar{display:none!important} }
      `}</style>

      {/* ── MOBILE sidebar overlay ── */}
      <AnimatePresence>
        {showMobSide && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              onClick={()=>setShowMobSide(false)}
              style={{position:"fixed",inset:0,zIndex:40,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}}/>
            <motion.div initial={{x:"-100%"}} animate={{x:0}} exit={{x:"-100%"}} transition={{type:"spring",damping:28,stiffness:300}}
              style={{position:"fixed",left:0,top:0,bottom:0,zIndex:50,width:260}}>
              <Sidebar
                activeId={activeId} setActiveId={setActiveId}
                conversations={conversations} loading={isLoading}
                onDelete={(id: string) => deleteMut.mutate(id)}
                onRename={(id: string, t: string) => updateMut.mutate({id,title:t})}
                onPin={(id: string, pinned: boolean) => updateMut.mutate({id,pinned})}
                onNew={() => { setActiveId(null); setShowMobSide(false); }}
                onClose={() => setShowMobSide(false)}
                isMobile
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN AREA ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>

        {/* Mobile top bar */}
        <div className="kiro-mob-bar" style={{ height:48, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px", borderBottom:`1px solid ${BORDER}`, background:PANEL, flexShrink:0 }}>
          <button onClick={()=>setShowMobSide(true)}
            style={{width:34,height:34,borderRadius:10,border:`1px solid ${BORDER}`,background:"transparent",color:MUTED,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
            ☰
          </button>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:22,height:22,borderRadius:7,background:`linear-gradient(135deg,${V500},#3D1C8A)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14l9 0-1 8 10-12-9 0L13 2z" fill="white"/></svg>
            </div>
            <span style={{fontSize:14,fontWeight:900,color:TEXT,letterSpacing:"-0.3px"}}>KIRO</span>
          </div>
          <button onClick={()=>setActiveId(null)}
            style={{padding:"5px 12px",borderRadius:8,border:`1px solid rgba(107,53,232,0.25)`,background:"rgba(107,53,232,0.1)",color:V300,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            + New
          </button>
        </div>

        {/* KIROChat — takes all remaining space */}
        <div style={{ flex:1, overflow:"hidden" }}>
          <KIROChat
            key={activeId || "new"}
            storeId={storeId}
            conversationId={activeId || undefined}
            briefMessage={!activeId && briefData?.opportunity ? briefData.opportunity : undefined}
            onConversationCreated={(id) => {
              setActiveId(id);
              qc.invalidateQueries({queryKey:["kiro-conversations",storeId]});
            }}
          />
        </div>
      </div>
    </div>
  );
}
