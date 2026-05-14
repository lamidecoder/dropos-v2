"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Gift, Plus, Copy, Check, Trash2, X, Loader2, DollarSign, Tag } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B" };

function generateCode() {
  return `GIFT-${Math.random().toString(36).slice(2,6).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
}

const fmt = (n: number) => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);

export default function GiftCardsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card: isDark?"#181230":"#fff", border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text: isDark?"#F0ECFF":"#130D2E", muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint: isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
    input: isDark?"rgba(255,255,255,0.05)":"#F0EDFF",
  };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [copied, setCopied] = useState<string|null>(null);
  const [form, setForm] = useState({ amount: 5000, code: generateCode(), expiresInDays: 365, recipientEmail: "", message: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["gift-cards", storeId],
    queryFn: () => api.get(`/gift-cards/${storeId}`).then(r => r.data.data || []),
    enabled: !!storeId,
  });

  const createMut = useMutation({
    mutationFn: () => api.post(`/gift-cards/${storeId}`, {
      ...form,
      expiresAt: new Date(Date.now() + form.expiresInDays * 86400000),
    }),
    onSuccess: () => { toast.success("Gift card created!"); qc.invalidateQueries({queryKey:["gift-cards"]}); setShowNew(false); setForm({amount:5000,code:generateCode(),expiresInDays:365,recipientEmail:"",message:""}); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/gift-cards/${storeId}/${id}`),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({queryKey:["gift-cards"]}); },
  });

  const copy = (code: string) => { navigator.clipboard.writeText(code); setCopied(code); toast.success("Copied!"); setTimeout(()=>setCopied(null),2000); };

  const cards = data || [];
  const totalValue = cards.reduce((a:number, c:any) => a+(c.balance||c.amount||0), 0);
  const redeemed  = cards.filter((c:any) => c.redeemed || (c.balance||0)<(c.amount||0)).length;

  const inp = { width:"100%", padding:"10px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" as const };

  return (
    <div style={{ maxWidth:800, margin:"0 auto" }}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.04em", color:t.text, margin:"0 0 4px" }}>Gift Cards</h1>
          <p style={{ fontSize:13, color:t.muted, margin:0 }}>{cards.length} cards · {fmt(totalValue)} total value · {redeemed} redeemed</p>
        </div>
        <button onClick={()=>setShowNew(true)}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:12, background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, border:"none", cursor:"pointer", color:"#fff", fontSize:13, fontWeight:700 }}>
          <Plus size={14}/> Create Gift Card
        </button>
      </motion.div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        {[
          { label:"Total Cards", value:cards.length,   color:V.v400,  icon:Gift      },
          { label:"Total Value", value:fmt(totalValue), color:V.green, icon:DollarSign},
          { label:"Redeemed",    value:redeemed,        color:V.amber, icon:Tag       },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            style={{ padding:16, borderRadius:16, background:t.card, border:`1px solid ${t.border}` }}>
            <div style={{ width:32, height:32, borderRadius:10, background:`${s.color}15`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
              <s.icon size={14} color={s.color}/>
            </div>
            <p style={{ fontSize:20, fontWeight:900, color:t.text, margin:"0 0 2px" }}>{s.value}</p>
            <p style={{ fontSize:12, color:t.muted, margin:0 }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Cards list */}
      {isLoading ? (
        <div style={{ textAlign:"center", padding:"60px 0", color:t.muted }}>Loading...</div>
      ) : cards.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px", borderRadius:16, background:t.faint, border:`1px solid ${t.border}` }}>
          <Gift size={36} style={{ color:t.muted, margin:"0 auto 12px" }}/>
          <p style={{ fontWeight:700, fontSize:15, color:t.text, margin:"0 0 6px" }}>No gift cards yet</p>
          <p style={{ fontSize:13, color:t.muted, margin:"0 0 20px" }}>Create gift cards for your customers or as promotions</p>
          <button onClick={()=>setShowNew(true)}
            style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 20px", borderRadius:12, background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, border:"none", cursor:"pointer", color:"#fff", fontSize:13, fontWeight:700 }}>
            <Plus size={13}/> Create First Card
          </button>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {cards.map((c:any, i:number) => {
            const used = (c.amount||0) - (c.balance||c.amount||0);
            const pct  = c.amount ? (used / c.amount) * 100 : 0;
            const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
            return (
              <motion.div key={c.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                style={{ padding:16, borderRadius:16, background:t.card, border:`1px solid ${expired?"rgba(239,68,68,0.25)":t.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:10 }}>
                  {/* Gift card visual */}
                  <div style={{ width:56, height:36, borderRadius:8, background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Gift size={16} color="rgba(255,255,255,0.8)"/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                      <code style={{ fontSize:13, fontWeight:800, color:t.text, fontFamily:"monospace", letterSpacing:"0.05em" }}>{c.code}</code>
                      <button onClick={()=>copy(c.code)} style={{ border:"none", background:"none", cursor:"pointer", color:t.muted, padding:2 }}>
                        {copied===c.code ? <Check size={12} color={V.green}/> : <Copy size={12}/>}
                      </button>
                      {expired && <span style={{ fontSize:10, fontWeight:700, color:"#EF4444", background:"rgba(239,68,68,0.1)", padding:"2px 8px", borderRadius:99 }}>EXPIRED</span>}
                    </div>
                    <p style={{ fontSize:12, color:t.muted, margin:0 }}>
                      {fmt(c.balance||c.amount)} remaining of {fmt(c.amount)}
                      {c.expiresAt && ` · Expires ${new Date(c.expiresAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <p style={{ fontSize:16, fontWeight:900, color:t.text, margin:"0 0 2px" }}>{fmt(c.amount)}</p>
                    <p style={{ fontSize:11, color:c.redeemed?V.amber:V.green, margin:0 }}>{c.redeemed?"Redeemed":"Active"}</p>
                  </div>
                  <button onClick={()=>deleteMut.mutate(c.id)}
                    style={{ width:28, height:28, borderRadius:8, border:"none", background:"rgba(239,68,68,0.08)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Trash2 size={12} color="#EF4444"/>
                  </button>
                </div>
                {/* Usage bar */}
                <div style={{ height:4, borderRadius:99, background:t.faint }}>
                  <div style={{ width:`${Math.min(pct,100)}%`, height:"100%", borderRadius:99, background:pct>80?`#EF4444`:V.v400, transition:"width 0.5s" }}/>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {showNew && (
          <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:16, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)" }}
            onClick={e=>e.target===e.currentTarget&&setShowNew(false)}>
            <motion.div initial={{opacity:0,scale:0.95,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95}}
              style={{ width:"100%", maxWidth:460, borderRadius:20, overflow:"hidden", background:isDark?"#181230":"#fff", border:`1px solid ${t.border}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:`1px solid ${t.border}` }}>
                <h3 style={{ fontSize:15, fontWeight:800, color:t.text, margin:0 }}>Create Gift Card</h3>
                <button onClick={()=>setShowNew(false)} style={{ border:"none", background:"none", cursor:"pointer", color:t.muted }}><X size={18}/></button>
              </div>
              <div style={{ padding:20 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:t.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>Amount (₦)</label>
                    <input type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:Number(e.target.value)}))} style={inp}/>
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:t.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>Expires In (days)</label>
                    <select value={form.expiresInDays} onChange={e=>setForm(f=>({...f,expiresInDays:Number(e.target.value)}))} style={inp}>
                      <option value={30}>30 days</option>
                      <option value={90}>90 days</option>
                      <option value={180}>6 months</option>
                      <option value={365}>1 year</option>
                      <option value={0}>Never</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom:12 }}>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:t.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>Code</label>
                  <div style={{ display:"flex", gap:8 }}>
                    <input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} style={{...inp, fontFamily:"monospace", flex:1}}/>
                    <button onClick={()=>setForm(f=>({...f,code:generateCode()}))}
                      style={{ padding:"10px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:t.faint, cursor:"pointer", color:t.muted, fontSize:12, fontWeight:600, whiteSpace:"nowrap", fontFamily:"inherit" }}>
                      Regenerate
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom:12 }}>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:t.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>Recipient Email (optional)</label>
                  <input type="email" value={form.recipientEmail} onChange={e=>setForm(f=>({...f,recipientEmail:e.target.value}))} placeholder="customer@email.com" style={inp}/>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:t.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>Personal Message (optional)</label>
                  <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} rows={3} placeholder="Happy Birthday! Enjoy shopping..." style={{...inp, resize:"none", display:"block"}}/>
                </div>
              </div>
              <div style={{ padding:16, display:"flex", gap:10, borderTop:`1px solid ${t.border}` }}>
                <button onClick={()=>setShowNew(false)} style={{ flex:1, padding:"10px 0", borderRadius:12, border:`1px solid ${t.border}`, background:"transparent", cursor:"pointer", color:t.muted, fontSize:13, fontWeight:600, fontFamily:"inherit" }}>Cancel</button>
                <button onClick={()=>createMut.mutate()} disabled={!form.amount||createMut.isPending}
                  style={{ flex:1, padding:"10px 0", borderRadius:12, border:"none", background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, cursor:"pointer", color:"#fff", fontSize:13, fontWeight:700, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, opacity:!form.amount?0.6:1 }}>
                  {createMut.isPending ? <Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/> : <Plus size={13}/>}
                  Create Card
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
