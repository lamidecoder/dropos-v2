"use client";
// Path: frontend/src/app/admin/waitlist/page.tsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { Trash2, RefreshCw, Download, Search, Mail, Users, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface Entry {
  id: string; name: string; email: string;
  whatsapp?: string; source?: string; createdAt: string;
}

export default function AdminWaitlistPage() {
  const [entries,   setEntries]  = useState<Entry[]>([]);
  const [total,     setTotal]    = useState(0);
  const [loading,   setLoading]  = useState(true);
  const [search,    setSearch]   = useState("");
  const [deleting,  setDeleting] = useState<string|null>(null);
  const [resending, setResending]= useState<string|null>(null);
  const [confirm,   setConfirm]  = useState<Entry|null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/waitlist/admin");
      setEntries(r.data.data.entries);
      setTotal(r.data.data.total);
    } catch { toast.error("Failed to load waitlist"); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = entries.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    (e.whatsapp||"").includes(search)
  );

  const del = async (entry: Entry) => {
    setDeleting(entry.id);
    try {
      await api.delete(`/waitlist/admin/${entry.id}`);
      setEntries(p => p.filter(e => e.id !== entry.id));
      setTotal(t => t - 1); setConfirm(null);
      toast.success(`${entry.name} removed`);
    } catch { toast.error("Failed to delete"); }
    finally  { setDeleting(null); }
  };

  const resend = async (entry: Entry) => {
    setResending(entry.id);
    try {
      await api.post(`/waitlist/admin/${entry.id}/resend`);
      toast.success(`Email resent to ${entry.email}`);
    } catch { toast.error("Failed to resend email"); }
    finally  { setResending(null); }
  };

  const exportCSV = () => {
    const rows = ["Name,Email,WhatsApp,Source,Joined",
      ...entries.map(e => `"${e.name}","${e.email}","${e.whatsapp||""}","${e.source||"direct"}","${new Date(e.createdAt).toLocaleDateString("en-GB")}"`)
    ];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.join("\n")], {type:"text/csv"}));
    a.download = `waitlist-${Date.now()}.csv`; a.click();
    toast.success("CSV exported");
  };

  const today = entries.filter(e => new Date(e.createdAt).toDateString() === new Date().toDateString()).length;
  const withWA = entries.filter(e => e.whatsapp).length;

  return (
      <>
      <div className="dash-page">
        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"28px"}}>
          <div>
            <h1 style={{fontSize:"20px",fontWeight:700,color:"#fff",marginBottom:"4px"}}>Waitlist</h1>
            <p style={{fontSize:"13px",color:"rgba(255,255,255,0.38)"}}>Everyone who signed up for early access</p>
          </div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={load} style={{display:"flex",alignItems:"center",gap:"6px",padding:"9px 14px",borderRadius:"10px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.5)",fontSize:"13px",cursor:"pointer"}}>
              <RefreshCw size={13}/> Refresh
            </button>
            <button onClick={exportCSV} style={{display:"flex",alignItems:"center",gap:"6px",padding:"9px 16px",borderRadius:"10px",background:"rgba(124,58,237,0.18)",border:"1px solid rgba(124,58,237,0.3)",color:"#a78bfa",fontSize:"13px",fontWeight:600,cursor:"pointer"}}>
              <Download size={13}/> Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"24px"}}>
          {[
            { icon:<Users size={14}/>, label:"Total Signups", val:total, col:"#a78bfa" },
            { icon:<Mail size={14}/>, label:"With WhatsApp", val:withWA, col:"#34d399" },
            { icon:<Clock size={14}/>, label:"Joined Today",  val:today, col:"#60a5fa" },
          ].map(s => (
            <div key={s.label} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px",padding:"18px 22px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
                <div style={{width:"28px",height:"28px",borderRadius:"8px",background:`${s.col}20`,display:"flex",alignItems:"center",justifyContent:"center",color:s.col}}>{s.icon}</div>
                <span style={{fontSize:"11px",fontWeight:600,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:"0.1em"}}>{s.label}</span>
              </div>
              <div style={{fontSize:"26px",fontWeight:800,color:"#fff",letterSpacing:"-1px"}}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{position:"relative",marginBottom:"14px"}}>
          <Search size={13} style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,0.28)"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search name, email or WhatsApp..."
            style={{width:"100%",padding:"11px 14px 11px 36px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"11px",color:"rgba(255,255,255,0.85)",fontSize:"14px",fontFamily:"inherit",outline:"none"}}/>
        </div>

        {/* Table */}
        <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"14px",overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 2.5fr 1.5fr 1fr 100px",padding:"11px 18px",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.02)"}}>
            {["Name","Email","WhatsApp","Joined","Actions"].map(h=>(
              <span key={h} style={{fontSize:"10px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.14em",color:"rgba(255,255,255,0.25)"}}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{padding:"60px",textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:"14px"}}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{padding:"70px",textAlign:"center"}}>
              <p style={{color:"rgba(255,255,255,0.22)",fontSize:"14px"}}>
                {search ? "No results found" : "No signups yet — post those flyers! 🚀"}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((e,i) => (
                <motion.div key={e.id}
                  initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,height:0}}
                  style={{display:"grid",gridTemplateColumns:"2fr 2.5fr 1.5fr 1fr 100px",padding:"13px 18px",borderBottom:i<filtered.length-1?"1px solid rgba(255,255,255,0.04)":"none",alignItems:"center"}}>

                  <div style={{display:"flex",alignItems:"center",gap:"9px"}}>
                    <div style={{width:"28px",height:"28px",borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,color:"#fff",flexShrink:0}}>
                      {e.name[0].toUpperCase()}
                    </div>
                    <span style={{fontSize:"13px",fontWeight:500,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name}</span>
                  </div>

                  <span style={{fontSize:"13px",color:"rgba(255,255,255,0.55)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.email}</span>

                  {e.whatsapp ? (
                    <a href={`https://wa.me/${e.whatsapp.replace(/\D/g,"")}`} target="_blank"
                      style={{fontSize:"13px",color:"#34d399",textDecoration:"none"}}>{e.whatsapp}</a>
                  ) : (
                    <span style={{fontSize:"11px",color:"rgba(255,255,255,0.18)"}}>Not provided</span>
                  )}

                  <span style={{fontSize:"12px",color:"rgba(255,255,255,0.35)"}}>
                    {new Date(e.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
                  </span>

                  <div style={{display:"flex",gap:"5px"}}>
                    <button onClick={()=>resend(e)} disabled={resending===e.id} title="Resend email"
                      style={{width:"28px",height:"28px",borderRadius:"8px",border:"none",background:"rgba(96,165,250,0.12)",color:"#60a5fa",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                      <Mail size={12}/>
                    </button>
                    <button onClick={()=>setConfirm(e)} title="Delete"
                      style={{width:"28px",height:"28px",borderRadius:"8px",border:"none",background:"rgba(248,113,113,0.12)",color:"#f87171",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                      <Trash2 size={12}/>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {!loading && total > 0 && (
          <p style={{fontSize:"12px",color:"rgba(255,255,255,0.22)",marginTop:"10px",textAlign:"right"}}>
            {filtered.length} of {total} signups
          </p>
        )}
      </div>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {confirm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}
            onClick={()=>setConfirm(null)}>
            <motion.div initial={{scale:0.93,y:14}} animate={{scale:1,y:0}} exit={{scale:0.93}}
              onClick={e=>e.stopPropagation()}
              style={{background:"#0e0c1e",border:"1px solid rgba(248,113,113,0.22)",borderRadius:"20px",padding:"32px",maxWidth:"380px",width:"100%",boxShadow:"0 40px 80px rgba(0,0,0,0.6)"}}>
              <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"rgba(248,113,113,0.12)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"18px"}}>
                <Trash2 size={20} style={{color:"#f87171"}}/>
              </div>
              <h3 style={{fontSize:"17px",fontWeight:700,color:"#fff",marginBottom:"8px"}}>Remove from waitlist?</h3>
              <p style={{fontSize:"14px",color:"rgba(255,255,255,0.45)",lineHeight:1.6,marginBottom:"24px"}}>
                This will permanently remove <strong style={{color:"#fff"}}>{confirm.name}</strong> from the waitlist.
              </p>
              <div style={{display:"flex",gap:"10px"}}>
                <button onClick={()=>setConfirm(null)} style={{flex:1,padding:"12px",borderRadius:"11px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.6)",fontSize:"14px",fontWeight:600,fontFamily:"inherit",cursor:"pointer"}}>
                  Cancel
                </button>
                <button onClick={()=>del(confirm)} disabled={deleting===confirm.id}
                  style={{flex:1,padding:"12px",borderRadius:"11px",background:"#f87171",border:"none",color:"#fff",fontSize:"14px",fontWeight:700,fontFamily:"inherit",cursor:"pointer"}}>
                  {deleting===confirm.id ? "Removing..." : "Remove"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`input::placeholder{color:rgba(255,255,255,0.28);}button:disabled{opacity:0.6;cursor:not-allowed;}`}</style>
      </>
  );
}