"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Plus, Trash2, X, Check } from "lucide-react";
import { PageHeader, DataTable, Badge, Pagination } from "../../../components/admin/AdminTable";
import toast from "react-hot-toast";

const V = { accent:"#6B35E8", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };
const t = { card:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.07)", text:"rgba(255,255,255,0.9)", muted:"rgba(255,255,255,0.4)" };
const inp: any = { width:"100%", padding:"10px 14px", borderRadius:11, border:"1px solid rgba(255,255,255,0.09)", background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.9)", fontSize:13, fontFamily:"inherit", outline:"none" };

export default function AdminCouponsPage() {
  const qc = useQueryClient();
  const [page, setPage]   = useState(1);
  const [showing, setShowing] = useState(false);
  const [form, setForm] = useState({ code:"", type:"PERCENTAGE", value:"", maxUses:"", expiresAt:"", description:"", targetPlan:"" });

  const { data, isLoading } = useQuery<any>({
    queryKey: ["admin-coupons", page],
    queryFn: () => adminAPI.get("/admin/coupons", { params:{ page, limit:20 } }).then((r:any) => r.data),
  });

  const createMut = useMutation({
    mutationFn: () => adminAPI.post("/admin/coupons", form),
    onSuccess: () => { toast.success("Coupon created!"); qc.invalidateQueries({ queryKey:["admin-coupons"] }); setShowing(false); setForm({ code:"", type:"PERCENTAGE", value:"", maxUses:"", expiresAt:"", description:"", targetPlan:"" }); },
    onError: (e:any) => toast.error(e.response?.data?.error||"Failed"),
  });
  const deleteMut = useMutation({
    mutationFn: (id:string) => adminAPI.delete(`/admin/coupons/${id}`),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey:["admin-coupons"] }); },
  });

  const coupons = data?.data || [];
  const meta    = data?.pagination || { total:0, pages:1 };

  const rows = coupons.map((c: any) => ({
    code:        <span style={{ fontSize:13, fontWeight:800, fontFamily:"monospace", color:"#A78BFA", letterSpacing:"0.05em" }}>{c.code}</span>,
    type:        <Badge label={c.type} color={c.type==="PERCENTAGE"?V.amber:V.green} bg={c.type==="PERCENTAGE"?"rgba(245,158,11,0.1)":"rgba(16,185,129,0.1)"}/>,
    value:       <span style={{ fontSize:13, fontWeight:700, color:t.text }}>{c.type==="PERCENTAGE"?`${c.value}%`:`₦${Number(c.value).toLocaleString()}`} off</span>,
    usage:       <span style={{ fontSize:12, color:t.muted }}>{c.usedCount||0}{c.maxUses?`/${c.maxUses}`:""} uses</span>,
    target:      <span style={{ fontSize:12, color:t.muted }}>{c.targetPlan||"All plans"}</span>,
    expires:     <span style={{ fontSize:11, color:c.expiresAt&&new Date(c.expiresAt)<new Date()?V.red:t.muted }}>{c.expiresAt?new Date(c.expiresAt).toLocaleDateString("en-NG",{day:"numeric",month:"short",year:"2-digit"}):"Never"}</span>,
    status:      <Badge label={c.isActive?"ACTIVE":"INACTIVE"} color={c.isActive?V.green:"rgba(255,255,255,0.3)"} bg={c.isActive?"rgba(16,185,129,0.1)":"rgba(255,255,255,0.05)"}/>,
    del:         (
      <button onClick={() => { if(confirm(`Delete ${c.code}?`)) deleteMut.mutate(c.id); }}
        style={{ padding:"5px 8px", borderRadius:7, background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.12)", color:V.red, cursor:"pointer", display:"flex", alignItems:"center" }}>
        <Trash2 size={11}/>
      </button>
    ),
  }));

  return (
    <div>
      <PageHeader title="Platform Coupons" sub="Promo codes for merchant onboarding and campaigns"
        action={
          <button onClick={() => setShowing(true)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:10, border:"none", cursor:"pointer", background:V.accent, color:"#fff", fontSize:13, fontWeight:700, fontFamily:"inherit" }}>
            <Plus size={13}/> New coupon
          </button>
        }/>

      <DataTable loading={isLoading}
        cols={[
          { key:"code",    label:"Code",     width:"130px"         },
          { key:"type",    label:"Type",     width:"110px"         },
          { key:"value",   label:"Value",    width:"100px"         },
          { key:"usage",   label:"Usage",    width:"90px", hide:"sm" },
          { key:"target",  label:"Target",   width:"90px", hide:"md" },
          { key:"expires", label:"Expires",  width:"90px", hide:"sm" },
          { key:"status",  label:"Status",   width:"90px"          },
          { key:"del",     label:"",         width:"40px"          },
        ]}
        rows={rows} empty="No coupons yet — create your first one"/>
      <Pagination page={page} pages={meta.pages||1} total={meta.total||0} onPage={setPage}/>

      {/* Create modal */}
      <AnimatePresence>
        {showing && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
            <motion.div initial={{ scale:0.95,y:20 }} animate={{ scale:1,y:0 }} exit={{ scale:0.95,y:20 }}
              style={{ background:"#0d0a1a", borderRadius:20, padding:28, border:`1px solid ${t.border}`, width:"100%", maxWidth:500, maxHeight:"90vh", overflowY:"auto" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
                <h2 style={{ fontSize:18, fontWeight:800, color:t.text, margin:0, letterSpacing:"-0.03em" }}>Create coupon</h2>
                <button onClick={() => setShowing(false)} style={{ background:"none", border:"none", cursor:"pointer", color:t.muted, padding:4 }}><X size={16}/></button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:6 }}>Code</label>
                    <input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="LAUNCH50" style={inp}/>
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:6 }}>Type</label>
                    <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={{ ...inp }}>
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed amount (₦)</option>
                    </select>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:6 }}>Value ({form.type==="PERCENTAGE"?"%":"₦"})</label>
                    <input type="number" value={form.value} onChange={e=>setForm(f=>({...f,value:e.target.value}))} placeholder={form.type==="PERCENTAGE"?"30":"5000"} style={inp}/>
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:6 }}>Max uses</label>
                    <input type="number" value={form.maxUses} onChange={e=>setForm(f=>({...f,maxUses:e.target.value}))} placeholder="Unlimited" style={inp}/>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:6 }}>Target plan</label>
                    <select value={form.targetPlan} onChange={e=>setForm(f=>({...f,targetPlan:e.target.value}))} style={{ ...inp }}>
                      <option value="">All plans</option>
                      <option value="FREE">Free only</option>
                      <option value="GROWTH">Growth only</option>
                      <option value="PRO">Pro only</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:6 }}>Expires</label>
                    <input type="date" value={form.expiresAt} onChange={e=>setForm(f=>({...f,expiresAt:e.target.value}))} style={inp}/>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:6 }}>Description (internal)</label>
                  <input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Launch campaign Q2 2026" style={inp}/>
                </div>
                <div style={{ display:"flex", gap:10, marginTop:4 }}>
                  <button onClick={() => setShowing(false)}
                    style={{ flex:1, padding:"11px 0", borderRadius:11, border:`1px solid ${t.border}`, background:"transparent", color:t.muted, cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:"inherit" }}>
                    Cancel
                  </button>
                  <button onClick={() => createMut.mutate()} disabled={!form.code||!form.value||createMut.isPending}
                    style={{ flex:1, padding:"11px 0", borderRadius:11, border:"none", cursor:"pointer", background:V.accent, color:"#fff", fontSize:13, fontWeight:700, fontFamily:"inherit", opacity:(!form.code||!form.value)?0.5:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    {createMut.isPending?"Creating...":<><Check size={13}/> Create coupon</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
