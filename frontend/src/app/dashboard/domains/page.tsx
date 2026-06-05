"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { Globe, Search, Check, Lock, ShoppingCart, RefreshCw, ChevronDown, Star, ExternalLink, Shield } from "lucide-react";

type Domain = { domain:string; available:boolean; ngn:number; usd:number; tld:string; popular?:boolean };
type Step = "search"|"checkout"|"done";

export default function DomainsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;

  const C = {
    card:   isDark ? "rgba(255,255,255,0.04)" : "#fff",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.45)" : "rgba(19,13,46,0.5)",
    border: isDark ? "rgba(107,53,232,0.15)" : "rgba(107,53,232,0.12)",
    input:  isDark ? "rgba(255,255,255,0.06)" : "#fff",
    faint:  isDark ? "rgba(107,53,232,0.06)" : "rgba(107,53,232,0.04)",
  };

  const inp: any = { width:"100%", padding:"11px 14px", borderRadius:11, border:`1px solid ${C.border}`, background:C.input, color:C.text, fontSize:13, fontFamily:"inherit", outline:"none" };

  const [q, setQ]               = useState("");
  const [results, setResults]   = useState<Domain[]>([]);
  const [selected, setSelected] = useState<Domain|null>(null);
  const [step, setStep]         = useState<Step>("search");
  const [years, setYears]       = useState(1);
  const [form, setForm]         = useState({ firstName:"", lastName:"", email:user?.email||"", phone:"", address:"", city:"", country:"NG" });

  const { data: existingDomain } = useQuery({
    queryKey: ["store-domain", storeId],
    queryFn: () => api.get(`/domains/store/${storeId}`).then(r => r.data.data),
    enabled: !!storeId,
  });

  const searchMut = useMutation({
    mutationFn: () => api.get("/domains/search", { params:{ q:q.trim() } }).then(r => r.data.data),
    onSuccess: (data) => setResults(data || []),
    onError: () => toast.error("Search failed"),
  });

  const buyMut = useMutation({
    mutationFn: () => api.post("/domains/register", { storeId, domain:selected?.domain, years, ...form }),
    onSuccess: () => setStep("done"),
    onError: (e: any) => toast.error(e.response?.data?.error || "Purchase failed"),
  });

  const canBuy = form.firstName && form.lastName && form.email && form.phone && form.address && form.city;

  if (step === "done") return (
    <div style={{ maxWidth:480, margin:"80px auto 0", textAlign:"center", padding:"0 24px" }}>
      <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", duration:0.5 }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(16,185,129,0.12)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <Check size={32} color="#10B981"/>
        </div>
      </motion.div>
      <h2 style={{ fontSize:24, fontWeight:900, color:C.text, margin:"0 0 10px", letterSpacing:"-0.04em" }}>Domain registered! 🎉</h2>
      <p style={{ fontSize:14, color:C.muted, margin:"0 0 6px" }}>
        <strong style={{ color:C.text }}>{selected?.domain}</strong> is yours.
      </p>
      <p style={{ fontSize:13, color:C.muted, margin:"0 0 28px", lineHeight:1.65 }}>
        DNS is being configured to point to your store automatically. Live within 24-48 hours.
      </p>
      <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
        <button onClick={() => { setStep("search"); setResults([]); setQ(""); setSelected(null); }}
          style={{ padding:"11px 22px", borderRadius:12, border:`1px solid ${C.border}`, background:C.card, color:C.text, cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:"inherit" }}>
          Buy another
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:760, margin:"0 auto", fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#2D1B69,#6B35E8)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Globe size={18} color="#C4B5FD"/>
        </div>
        <div>
          <h1 style={{ fontSize:20, fontWeight:900, color:C.text, margin:0, letterSpacing:"-0.03em" }}>Domain Manager</h1>
          <p style={{ fontSize:12, color:C.muted, margin:0 }}>Buy a domain and connect it to your store — automatic DNS setup</p>
        </div>
      </div>

      {/* Connected domain */}
      {existingDomain?.customDomain && (
        <div style={{ padding:"14px 18px", borderRadius:14, background:"rgba(16,185,129,0.05)", border:"1px solid rgba(16,185,129,0.15)", display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <Check size={16} color="#10B981"/>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#10B981", margin:0 }}>Connected: {existingDomain.customDomain}</p>
            <p style={{ fontSize:11, color:C.muted, margin:0 }}>Your store is live at this domain</p>
          </div>
          <a href={`https://${existingDomain.customDomain}`} target="_blank" rel="noreferrer" style={{ color:"#10B981", textDecoration:"none" }}>
            <ExternalLink size={14}/>
          </a>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === "search" && (
          <motion.div key="search" initial={{ opacity:0 }} animate={{ opacity:1 }}>
            {/* Search */}
            <div style={{ background:C.card, borderRadius:20, padding:24, border:`1px solid ${C.border}`, marginBottom:16 }}>
              <div style={{ display:"flex", gap:10 }}>
                <div style={{ flex:1, display:"flex", alignItems:"center", gap:10, padding:"13px 16px", borderRadius:14, border:`1px solid ${q ? "rgba(107,53,232,0.4)" : C.border}`, background:C.input, transition:"border 0.15s" }}>
                  <Globe size={16} color={C.muted as string}/>
                  <input value={q} onChange={e => setQ(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))}
                    placeholder="Search for your perfect domain…"
                    onKeyDown={e => { if (e.key==="Enter" && q.trim()) searchMut.mutate(); }}
                    style={{ flex:1, background:"transparent", border:"none", outline:"none", color:C.text, fontSize:14, fontFamily:"inherit" }}/>
                </div>
                <button onClick={() => searchMut.mutate()} disabled={!q.trim() || searchMut.isPending}
                  style={{ padding:"13px 22px", borderRadius:14, border:"none", cursor:"pointer",
                    background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff",
                    fontSize:14, fontWeight:700, fontFamily:"inherit", display:"flex", alignItems:"center", gap:8,
                    opacity:!q.trim()?0.5:1, boxShadow:"0 4px 16px rgba(107,53,232,0.25)" }}>
                  {searchMut.isPending ? <RefreshCw size={14} style={{ animation:"spin 0.7s linear infinite" }}/> : <Search size={14}/>}
                  Search
                </button>
              </div>
              <p style={{ fontSize:12, color:C.muted, margin:"10px 0 0", textAlign:"center" }}>
                Try your brand name — we'll check .com, .store, .shop, .ng and more
              </p>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                style={{ background:C.card, borderRadius:20, border:`1px solid ${C.border}`, overflow:"hidden" }}>
                {results.map((r, i) => (
                  <div key={r.domain} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 20px",
                    borderBottom: i < results.length-1 ? `1px solid rgba(255,255,255,0.04)` : "none",
                    opacity: r.available ? 1 : 0.45 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <p style={{ fontSize:15, fontWeight:700, color:C.text, margin:0 }}>{r.domain}</p>
                        {r.popular && (
                          <span style={{ fontSize:9, fontWeight:800, color:"#F59E0B", background:"rgba(245,158,11,0.12)", padding:"2px 7px", borderRadius:99, display:"flex", alignItems:"center", gap:3 }}>
                            <Star size={8} fill="#F59E0B"/> POPULAR
                          </span>
                        )}
                        {!r.available && <span style={{ fontSize:10, color:C.muted, background:C.faint, padding:"2px 8px", borderRadius:99 }}>Taken</span>}
                      </div>
                    </div>
                    <div style={{ textAlign:"right", minWidth:90 }}>
                      <p style={{ fontSize:15, fontWeight:800, color:r.available?C.text:C.muted, margin:0 }}>₦{r.ngn?.toLocaleString()}</p>
                      <p style={{ fontSize:10, color:C.muted, margin:0 }}>per year</p>
                    </div>
                    {r.available ? (
                      <button onClick={() => { setSelected(r); setStep("checkout"); }}
                        style={{ padding:"8px 18px", borderRadius:10, border:"none", cursor:"pointer",
                          background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff",
                          fontSize:13, fontWeight:700, fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
                        <ShoppingCart size={12}/> Buy
                      </button>
                    ) : (
                      <div style={{ width:68, height:34, borderRadius:10, background:C.faint, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Lock size={13} color={C.muted as string}/>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Features */}
            {results.length === 0 && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginTop:20 }} className="feat-grid">
                {[
                  { icon:"🔒", title:"Instant DNS setup",    desc:"Automatically points to your DropOS store. No technical setup." },
                  { icon:"₦",  title:"Pay in Naira",         desc:"No dollar card needed. Pay through Paystack." },
                  { icon:"🔄", title:"Auto-renewal alerts",  desc:"We remind you before it expires. Never lose your domain." },
                ].map(f => (
                  <div key={f.title} style={{ padding:16, borderRadius:14, background:C.card, border:`1px solid ${C.border}`, textAlign:"center" }}>
                    <p style={{ fontSize:24, margin:"0 0 8px" }}>{f.icon}</p>
                    <p style={{ fontSize:13, fontWeight:700, color:C.text, margin:"0 0 4px" }}>{f.title}</p>
                    <p style={{ fontSize:11, color:C.muted, margin:0, lineHeight:1.5 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {step === "checkout" && selected && (
          <motion.div key="checkout" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}>
            <button onClick={() => setStep("search")} style={{ fontSize:12, color:C.muted, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", marginBottom:16, display:"flex", alignItems:"center", gap:6 }}>
              ← Back to search
            </button>

            {/* Summary */}
            <div style={{ padding:20, borderRadius:18, background:"linear-gradient(135deg,rgba(107,53,232,0.1),rgba(107,53,232,0.05))", border:`1px solid rgba(107,53,232,0.2)`, marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:13, background:"linear-gradient(135deg,#2D1B69,#6B35E8)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Globe size={20} color="#C4B5FD"/>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:20, fontWeight:900, color:C.text, margin:0, letterSpacing:"-0.03em" }}>{selected.domain}</p>
                  <p style={{ fontSize:12, color:C.muted, margin:"2px 0 0" }}>Will auto-connect to your DropOS store</p>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  {[1,2,3].map(y => (
                    <button key={y} onClick={() => setYears(y)}
                      style={{ padding:"5px 12px", borderRadius:8, border:`1px solid ${years===y?"rgba(107,53,232,0.4)":C.border}`, background:years===y?"rgba(107,53,232,0.12)":"transparent", color:years===y?"#A78BFA":C.muted, cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit" }}>
                      {y}yr
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{ background:C.card, borderRadius:18, padding:22, border:`1px solid ${C.border}`, marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
                <Shield size={14} color="#8B5CF6"/>
                <p style={{ fontSize:13, fontWeight:700, color:C.text, margin:0 }}>Registration details</p>
                <span style={{ fontSize:11, color:C.muted, marginLeft:"auto" }}>Required by ICANN</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }} className="form-cols">
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:5 }}>First name *</label>
                  <input value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} style={inp} placeholder="Olamide"/>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:5 }}>Last name *</label>
                  <input value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))} style={inp} placeholder="Sotunde"/>
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:5 }}>Email *</label>
                  <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} style={inp}/>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:5 }}>Phone *</label>
                  <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} style={inp} placeholder="+2348012345678"/>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:5 }}>City *</label>
                  <input value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} style={inp} placeholder="Lagos"/>
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:5 }}>Address *</label>
                  <input value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} style={inp} placeholder="123 Anywhere Street, Victoria Island"/>
                </div>
              </div>
            </div>

            {/* Total */}
            <div style={{ padding:"16px 20px", borderRadius:14, background:C.faint, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <div>
                <p style={{ fontSize:11, color:C.muted, margin:0 }}>{years} year registration</p>
                <p style={{ fontSize:24, fontWeight:900, color:C.text, margin:0, letterSpacing:"-0.04em" }}>₦{((selected.ngn||0)*years).toLocaleString()}</p>
              </div>
              <div style={{ fontSize:12, color:"#10B981", background:"rgba(16,185,129,0.08)", padding:"6px 14px", borderRadius:99, fontWeight:700 }}>
                ✅ DNS auto-configured
              </div>
            </div>

            <button onClick={() => buyMut.mutate()} disabled={!canBuy || buyMut.isPending}
              style={{ width:"100%", padding:"15px 0", borderRadius:14, border:"none", cursor:"pointer",
                background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff",
                fontSize:15, fontWeight:800, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                opacity:(!canBuy)?0.5:1, boxShadow:"0 6px 24px rgba(107,53,232,0.3)" }}>
              {buyMut.isPending ? <><RefreshCw size={15} style={{ animation:"spin 0.7s linear infinite" }}/> Registering…</>
                : <><ShoppingCart size={15}/> Purchase · ₦{((selected.ngn||0)*years).toLocaleString()}</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:640px){ .feat-grid{grid-template-columns:1fr!important;} .form-cols{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
}
