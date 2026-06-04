"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { Search, Globe, Check, X, ShoppingCart, RefreshCw, Star, Lock, ExternalLink } from "lucide-react";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };

type DomainResult = { domain:string; available:boolean; usd:number; ngn:number; tld:string; popular?:boolean };

export default function DomainsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card:   isDark ? "rgba(255,255,255,0.03)" : "#fff",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.5)" : "rgba(19,13,46,0.5)",
    border: isDark ? "rgba(107,53,232,0.12)" : "rgba(107,53,232,0.1)",
    faint:  isDark ? "rgba(107,53,232,0.06)" : "rgba(107,53,232,0.04)",
    input:  isDark ? "rgba(255,255,255,0.05)" : "#fff",
  };

  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const [q, setQ]               = useState("");
  const [results, setResults]   = useState<DomainResult[]>([]);
  const [selected, setSelected] = useState<DomainResult|null>(null);
  const [step, setStep]         = useState<"search"|"checkout"|"success">("search");
  const [years, setYears]       = useState(1);
  const [buyForm, setBuyForm]   = useState({ firstName:"", lastName:"", email:user?.email||"", phone:"", address:"", city:"", country:"NG" });

  const { data: currentDomains } = useQuery({
    queryKey: ["store-domains", storeId],
    queryFn:  () => api.get(`/domains/store/${storeId}`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  const searchMut = useMutation({
    mutationFn: () => api.get("/domains/search", { params:{ q } }).then(r => r.data.data),
    onSuccess:  (data) => setResults(data),
    onError:    () => toast.error("Search failed"),
  });

  const buyMut = useMutation({
    mutationFn: () => api.post("/domains/register", {
      storeId, domain: selected?.domain, years, ...buyForm,
    }),
    onSuccess: () => { setStep("success"); toast.success("Domain registered! DNS will connect in 24-48 hours."); },
    onError:   (e:any) => toast.error(e.response?.data?.error || "Purchase failed"),
  });

  const inp = { width:"100%", padding:"10px 14px", borderRadius:10, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, fontFamily:"inherit", outline:"none" };

  if (step === "success") {
    return (
      <motion.div initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
        style={{ maxWidth:500, margin:"80px auto 0", textAlign:"center", padding:"0 24px" }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(16,185,129,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <Check size={28} color={V.green}/>
        </div>
        <h1 style={{ fontSize:24, fontWeight:900, color:t.text, margin:"0 0 10px", letterSpacing:"-0.04em" }}>Domain registered! 🎉</h1>
        <p style={{ fontSize:15, color:t.muted, margin:"0 0 8px", lineHeight:1.6 }}>
          <strong style={{ color:t.text }}>{selected?.domain}</strong> is now yours.
        </p>
        <p style={{ fontSize:13, color:t.muted, margin:"0 0 28px", lineHeight:1.6 }}>
          Your store's DNS is being configured automatically. It will be live at your domain within 24-48 hours — no action needed.
        </p>
        <button onClick={() => { setStep("search"); setResults([]); setQ(""); setSelected(null); }}
          style={{ padding:"12px 24px", borderRadius:12, border:`1px solid ${t.border}`, background:t.card, color:t.text, cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:"inherit" }}>
          Buy another domain
        </button>
      </motion.div>
    );
  }

  return (
    <div style={{ maxWidth:780, margin:"0 auto" }}>
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:900, color:t.text, margin:"0 0 4px", letterSpacing:"-0.03em" }}>Domain Manager</h1>
        <p style={{ fontSize:13, color:t.muted }}>Buy a domain and connect it to your store — all in one place, no technical setup</p>
      </motion.div>

      {/* Current domain */}
      {currentDomains?.customDomain && (
        <div style={{ padding:"14px 18px", borderRadius:14, background:"rgba(16,185,129,0.05)", border:"1px solid rgba(16,185,129,0.15)", display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <Check size={16} color={V.green}/>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:0 }}>Connected: <strong>{currentDomains.customDomain}</strong></p>
            <p style={{ fontSize:11, color:t.muted, margin:0 }}>Your store is live at this domain</p>
          </div>
          <a href={`https://${currentDomains.customDomain}`} target="_blank" rel="noreferrer"
            style={{ marginLeft:"auto", color:V.green, textDecoration:"none" }}>
            <ExternalLink size={14}/>
          </a>
        </div>
      )}

      {step === "search" && (
        <>
          {/* Search */}
          <div style={{ background:t.card, borderRadius:20, padding:24, border:`1px solid ${t.border}`, marginBottom:16 }}>
            <div style={{ display:"flex", gap:10 }}>
              <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, padding:"12px 16px", borderRadius:12, border:`1px solid ${q?`rgba(107,53,232,0.3)`:t.border}`, background:t.input }}>
                <Globe size={15} color={t.muted as string}/>
                <input value={q} onChange={e => setQ(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))}
                  placeholder="Find the perfect domain... e.g. fashionhaven"
                  onKeyDown={e => { if (e.key==="Enter" && q) searchMut.mutate(); }}
                  style={{ flex:1, background:"transparent", border:"none", outline:"none", color:t.text, fontSize:14, fontFamily:"inherit" }}/>
              </div>
              <button onClick={() => searchMut.mutate()} disabled={!q || searchMut.isPending}
                style={{ padding:"12px 22px", borderRadius:12, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", fontSize:14, fontWeight:700, fontFamily:"inherit", display:"flex", alignItems:"center", gap:8, opacity:!q?0.5:1 }}>
                {searchMut.isPending ? <RefreshCw size={14} style={{ animation:"spin 0.7s linear infinite" }}/> : <Search size={14}/>}
                Search
              </button>
            </div>
            {results.length === 0 && !searchMut.isPending && (
              <p style={{ fontSize:12, color:t.muted, margin:"12px 0 0", textAlign:"center" }}>
                Try your brand name, business name, or a catchy word
              </p>
            )}
          </div>

          {/* Results */}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                style={{ background:t.card, borderRadius:20, border:`1px solid ${t.border}`, overflow:"hidden" }}>
                {results.map((r, i) => (
                  <div key={r.domain} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 20px", borderBottom:i<results.length-1?`1px solid rgba(255,255,255,0.04)`:"none", opacity:r.available?1:0.45 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <p style={{ fontSize:15, fontWeight:700, color:t.text, margin:0 }}>{r.domain}</p>
                        {r.popular && <span style={{ fontSize:9, fontWeight:800, color:V.amber, background:"rgba(245,158,11,0.12)", padding:"2px 7px", borderRadius:99, letterSpacing:"0.06em" }}>POPULAR</span>}
                        {!r.available && <span style={{ fontSize:9, fontWeight:700, color:t.muted, background:t.faint, padding:"2px 7px", borderRadius:99 }}>TAKEN</span>}
                      </div>
                    </div>
                    <div style={{ textAlign:"right", marginRight:14 }}>
                      <p style={{ fontSize:15, fontWeight:800, color:r.available?t.text:t.muted, margin:0 }}>₦{r.ngn.toLocaleString()}</p>
                      <p style={{ fontSize:10, color:t.muted, margin:0 }}>per year</p>
                    </div>
                    {r.available ? (
                      <button onClick={() => { setSelected(r); setStep("checkout"); }}
                        style={{ padding:"8px 18px", borderRadius:10, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", fontSize:13, fontWeight:700, fontFamily:"inherit", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6 }}>
                        <ShoppingCart size={12}/> Buy
                      </button>
                    ) : (
                      <div style={{ width:64, height:34, borderRadius:10, background:t.faint, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Lock size={13} color={t.muted as string}/>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginTop:20 }} className="info-grid">
            {[
              { emoji:"🔒", title:"Secured instantly", desc:"DNS is auto-configured to your DropOS store in minutes" },
              { emoji:"🇳🇬", title:"Pay in Naira",     desc:"No dollar card needed. Pay through your usual payment method" },
              { emoji:"🔄", title:"Auto-renewal",       desc:"We remind you before expiry. Never lose your domain" },
            ].map(c => (
              <div key={c.title} style={{ padding:16, borderRadius:14, background:t.card, border:`1px solid ${t.border}`, textAlign:"center" }}>
                <p style={{ fontSize:24, margin:"0 0 8px" }}>{c.emoji}</p>
                <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 4px" }}>{c.title}</p>
                <p style={{ fontSize:11, color:t.muted, margin:0, lineHeight:1.5 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {step === "checkout" && selected && (
        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}>
          <button onClick={() => setStep("search")} style={{ fontSize:12, color:t.muted, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", marginBottom:16 }}>
            ← Back to search
          </button>

          {/* Summary */}
          <div style={{ padding:20, borderRadius:16, background:"linear-gradient(135deg,rgba(107,53,232,0.1),rgba(107,53,232,0.05))", border:`1px solid rgba(107,53,232,0.2)`, marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <Globe size={28} color={V.v400}/>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:18, fontWeight:900, color:t.text, margin:0, letterSpacing:"-0.02em" }}>{selected.domain}</p>
                <p style={{ fontSize:13, color:t.muted, margin:"2px 0 0" }}>Will connect to your store automatically</p>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:16 }}>
              <p style={{ fontSize:13, color:t.muted, margin:0 }}>Registration period:</p>
              {[1,2,3].map(y => (
                <button key={y} onClick={() => setYears(y)}
                  style={{ padding:"5px 14px", borderRadius:8, border:`1px solid ${years===y?"rgba(107,53,232,0.4)":t.border}`, background:years===y?`${V.v500}12`:"transparent", color:years===y?V.v400:t.muted, cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit" }}>
                  {y}yr — ₦{(selected.ngn*y).toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Contact details */}
          <div style={{ background:t.card, borderRadius:18, padding:24, border:`1px solid ${t.border}`, marginBottom:16 }}>
            <p style={{ fontSize:14, fontWeight:700, color:t.text, margin:"0 0 16px" }}>Registration details</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }} className="form-grid">
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:t.muted, display:"block", marginBottom:5 }}>First name</label>
                <input value={buyForm.firstName} onChange={e=>setBuyForm(f=>({...f,firstName:e.target.value}))} style={inp} placeholder="Olamide"/>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:t.muted, display:"block", marginBottom:5 }}>Last name</label>
                <input value={buyForm.lastName} onChange={e=>setBuyForm(f=>({...f,lastName:e.target.value}))} style={inp} placeholder="Sotunde"/>
              </div>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={{ fontSize:12, fontWeight:600, color:t.muted, display:"block", marginBottom:5 }}>Email</label>
                <input type="email" value={buyForm.email} onChange={e=>setBuyForm(f=>({...f,email:e.target.value}))} style={inp}/>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:t.muted, display:"block", marginBottom:5 }}>Phone</label>
                <input value={buyForm.phone} onChange={e=>setBuyForm(f=>({...f,phone:e.target.value}))} style={inp} placeholder="+2348012345678"/>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:t.muted, display:"block", marginBottom:5 }}>City</label>
                <input value={buyForm.city} onChange={e=>setBuyForm(f=>({...f,city:e.target.value}))} style={inp} placeholder="Lagos"/>
              </div>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={{ fontSize:12, fontWeight:600, color:t.muted, display:"block", marginBottom:5 }}>Address</label>
                <input value={buyForm.address} onChange={e=>setBuyForm(f=>({...f,address:e.target.value}))} style={inp} placeholder="123 Anywhere Street"/>
              </div>
            </div>
          </div>

          {/* Total + buy */}
          <div style={{ padding:18, borderRadius:14, background:t.faint, border:`1px solid ${t.border}`, marginBottom:14, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <p style={{ fontSize:12, color:t.muted, margin:0 }}>Total for {years} year{years>1?"s":""}</p>
              <p style={{ fontSize:22, fontWeight:900, color:t.text, margin:0, letterSpacing:"-0.04em" }}>₦{(selected.ngn*years).toLocaleString()}</p>
            </div>
            <p style={{ fontSize:11, color:V.green, background:"rgba(16,185,129,0.1)", padding:"4px 12px", borderRadius:99, fontWeight:700 }}>
              ✅ Auto DNS setup included
            </p>
          </div>

          <button onClick={() => buyMut.mutate()}
            disabled={!buyForm.firstName||!buyForm.lastName||!buyForm.email||!buyForm.phone||!buyForm.address||!buyForm.city||buyMut.isPending}
            style={{ width:"100%", padding:"15px 0", borderRadius:14, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", fontSize:15, fontWeight:800, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:(!buyForm.firstName||!buyForm.email||!buyForm.phone)?0.5:1, boxShadow:"0 6px 24px rgba(107,53,232,0.25)" }}>
            {buyMut.isPending ? <><RefreshCw size={15} style={{ animation:"spin 0.7s linear infinite" }}/> Registering…</> : <><ShoppingCart size={15}/> Complete purchase — ₦{(selected.ngn*years).toLocaleString()}</>}
          </button>
        </motion.div>
      )}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:640px){ .info-grid{grid-template-columns:1fr!important;} .form-grid{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
}
