"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Shield, Plus, X, Check, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };

const ACTIONS = [
  { id:"alert",          label:"Alert me only",         emoji:"🔔" },
  { id:"pause_product",  label:"Pause the product",      emoji:"⏸️" },
  { id:"reduce_ad_spend",label:"Cut ad spend",           emoji:"📉" },
  { id:"increase_price", label:"Auto raise price 5%",    emoji:"💰" },
];

export default function ProfitRulesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card: isDark?"#181230":"#fff", border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text: isDark?"#F0ECFF":"#130D2E", muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint: isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
    input: isDark?"rgba(255,255,255,0.05)":"#F5F3FF",
  };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", minMargin:20, action:"alert", trigger:"margin_drop" });

  const { data } = useQuery({
    queryKey: ["profit-rules", storeId],
    queryFn: () => api.get(`/analytics/${storeId}/profit-rules`).then(r => r.data.data || []),
    enabled: !!storeId,
  });

  const createMut = useMutation({
    mutationFn: () => api.post(`/analytics/${storeId}/profit-rules`, { ...form, storeId }),
    onSuccess: () => { toast.success("Rule created!"); qc.invalidateQueries({queryKey:["profit-rules"]}); setShowAdd(false); setForm({name:"",minMargin:20,action:"alert",trigger:"margin_drop"}); },
    onError: (e:any) => toast.error(e.response?.data?.message||"Failed"),
  });

  const toggleMut = useMutation({
    mutationFn: (r:any) => api.patch(`/analytics/${storeId}/profit-rules/${r.id}`, { active: !r.active }),
    onSuccess: () => qc.invalidateQueries({queryKey:["profit-rules"]}),
  });

  const deleteMut = useMutation({
    mutationFn: (id:string) => api.delete(`/analytics/${storeId}/profit-rules/${id}`),
    onSuccess: () => { toast.success("Rule deleted"); qc.invalidateQueries({queryKey:["profit-rules"]}); },
  });

  const rules = data || [];
  const inp = { width:"100%", padding:"10px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" as const };

  return (
    <div style={{maxWidth:700,margin:"0 auto"}}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:t.text,margin:"0 0 4px"}}>Profit Protection</h1>
          <p style={{fontSize:13,color:t.muted,margin:0}}>Auto-protect your margins with intelligent rules</p>
        </div>
        <button onClick={()=>setShowAdd(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 18px",borderRadius:12,background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:"pointer",color:"#fff",fontSize:13,fontWeight:700}}>
          <Plus size={14}/> Add Rule
        </button>
      </motion.div>

      {/* Info banner */}
      <div style={{padding:"12px 16px",borderRadius:12,background:"rgba(107,53,232,0.06)",border:"1px solid rgba(107,53,232,0.15)",marginBottom:20,display:"flex",gap:10,alignItems:"flex-start"}}>
        <Shield size={14} color={V.v400} style={{flexShrink:0,marginTop:1}}/>
        <p style={{fontSize:12,color:t.muted,margin:0,lineHeight:1.5}}>
          KIRO monitors your products in real time. When a rule triggers, KIRO takes the action automatically or alerts you — your choice.
        </p>
      </div>

      {rules.length===0&&!showAdd ? (
        <div style={{textAlign:"center",padding:"60px 20px",borderRadius:16,background:t.faint,border:`1px solid ${t.border}`}}>
          <Shield size={36} style={{color:t.muted,margin:"0 auto 12px"}}/>
          <p style={{fontWeight:700,fontSize:15,color:t.text,margin:"0 0 6px"}}>No profit rules yet</p>
          <p style={{fontSize:13,color:t.muted,margin:"0 0 20px"}}>Set minimum margins and KIRO will protect them automatically.</p>
          <button onClick={()=>setShowAdd(true)} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 20px",borderRadius:12,background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:"pointer",color:"#fff",fontSize:13,fontWeight:700}}>
            <Plus size={13}/> Create First Rule
          </button>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {rules.map((r:any,i:number)=>{
            const action = ACTIONS.find(a=>a.id===r.action)||ACTIONS[0];
            return (
              <motion.div key={r.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                style={{display:"flex",alignItems:"center",gap:14,padding:16,borderRadius:16,background:t.card,border:`1px solid ${t.border}`,opacity:r.active?1:0.6}}>
                <div style={{width:40,height:40,borderRadius:12,background:"rgba(107,53,232,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>
                  {action.emoji}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:700,color:t.text,margin:"0 0 3px"}}>{r.name}</p>
                  <p style={{fontSize:12,color:t.muted,margin:0}}>Min margin {r.minMargin}% → {action.label}</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                  <button onClick={()=>toggleMut.mutate(r)} style={{border:"none",background:"none",cursor:"pointer",color:r.active?V.v400:t.muted,display:"flex"}}>
                    {r.active?<ToggleRight size={22}/>:<ToggleLeft size={22}/>}
                  </button>
                  <button onClick={()=>deleteMut.mutate(r.id)} style={{width:28,height:28,borderRadius:8,border:"none",background:"rgba(239,68,68,0.08)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <X size={13} color={V.red}/>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} style={{marginTop:16,padding:20,borderRadius:16,background:t.card,border:`1px solid ${t.border}`}}>
          <p style={{fontSize:14,fontWeight:800,color:t.text,margin:"0 0 16px"}}>New Profit Rule</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:600,color:t.muted,marginBottom:6}}>Rule Name</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Protect Hair Products" style={inp}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:600,color:t.muted,marginBottom:6}}>Minimum Margin (%)</label>
              <input type="number" value={form.minMargin} min={5} max={90} onChange={e=>setForm(f=>({...f,minMargin:Number(e.target.value)}))} style={inp}/>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:11,fontWeight:600,color:t.muted,marginBottom:6}}>When margin drops below {form.minMargin}%, KIRO should:</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {ACTIONS.map(a=>(
                <button key={a.id} onClick={()=>setForm(f=>({...f,action:a.id}))}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:10,border:`1px solid ${form.action===a.id?"rgba(107,53,232,0.4)":t.border}`,background:form.action===a.id?"rgba(107,53,232,0.08)":t.faint,cursor:"pointer"}}>
                  <span style={{fontSize:16}}>{a.emoji}</span>
                  <span style={{fontSize:12,fontWeight:600,color:form.action===a.id?V.v300:t.text}}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setShowAdd(false)} style={{flex:1,padding:"9px 0",borderRadius:10,border:`1px solid ${t.border}`,background:"transparent",cursor:"pointer",color:t.muted,fontSize:13,fontWeight:600}}>Cancel</button>
            <button onClick={()=>createMut.mutate()} disabled={!form.name||createMut.isPending}
              style={{flex:1,padding:"9px 0",borderRadius:10,border:"none",background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,cursor:"pointer",color:"#fff",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:!form.name?0.6:1}}>
              {createMut.isPending?<Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>:<Check size={13}/>} Save Rule
            </button>
          </div>
        </motion.div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
