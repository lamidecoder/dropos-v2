"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { PageHeader } from "../../../components/admin/AdminTable";
import { motion } from "framer-motion";
import { Send, Check, Megaphone } from "lucide-react";
import toast from "react-hot-toast";

const V = { accent:"#6B35E8", green:"#10B981" };
const t = { card:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.07)", text:"rgba(255,255,255,0.9)", muted:"rgba(255,255,255,0.4)" };
const inp: any = { width:"100%", padding:"11px 14px", borderRadius:12, border:"1px solid rgba(255,255,255,0.09)", background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.9)", fontSize:13, fontFamily:"inherit", outline:"none" };

export default function AdminBroadcastPage() {
  const [form, setForm] = useState({ title:"", message:"", type:"info", targetPlan:"" });
  const [sent, setSent] = useState(false);

  const sendMut = useMutation({
    mutationFn: () => adminAPI.post("/admin/broadcast", form),
    onSuccess: (res:any) => { toast.success(res.data?.message||"Sent!"); setSent(true); setTimeout(()=>{ setSent(false); setForm({ title:"", message:"", type:"info", targetPlan:"" }); },3000); },
    onError: () => toast.error("Failed to send"),
  });

  return (
    <div style={{ maxWidth:640 }}>
      <PageHeader title="Broadcast" sub="Send in-app notifications to all or targeted users"/>
      <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}
        style={{ background:t.card, borderRadius:20, padding:28, border:`1px solid ${t.border}`, display:"flex", flexDirection:"column", gap:16 }}>
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:7 }}>Type</label>
          <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
            {["info","success","warning","error"].map(tp => (
              <button key={tp} onClick={() => setForm(f=>({...f,type:tp}))}
                style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${form.type===tp?"rgba(107,53,232,0.4)":"rgba(255,255,255,0.08)"}`, background:form.type===tp?"rgba(107,53,232,0.1)":"transparent", color:form.type===tp?"#A78BFA":t.muted, cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit", textTransform:"capitalize" }}>
                {tp}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:7 }}>Target</label>
          <select value={form.targetPlan} onChange={e=>setForm(f=>({...f,targetPlan:e.target.value}))} style={inp}>
            <option value="">All users</option>
            <option value="FREE">Free plan only</option>
            <option value="GROWTH">Growth plan only</option>
            <option value="PRO">Pro plan only</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:7 }}>Title</label>
          <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Notification title" style={inp}/>
        </div>
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:7 }}>Message</label>
          <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} placeholder="Write your message..." rows={5} style={{ ...inp, resize:"vertical" }}/>
        </div>
        {form.title && form.message && (
          <div style={{ padding:14, borderRadius:12, background:"rgba(107,53,232,0.06)", border:"1px solid rgba(107,53,232,0.15)", display:"flex", gap:10 }}>
            <Megaphone size={16} color="#A78BFA" style={{ flexShrink:0, marginTop:1 }}/>
            <div><p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 3px" }}>{form.title}</p><p style={{ fontSize:12, color:t.muted, margin:0 }}>{form.message}</p></div>
          </div>
        )}
        <button onClick={() => sendMut.mutate()} disabled={!form.title||!form.message||sendMut.isPending}
          style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"13px 0", borderRadius:12, border:"none", cursor:"pointer", background:sent?"rgba(16,185,129,0.15)":V.accent, color:"#fff", fontSize:14, fontWeight:700, fontFamily:"inherit", opacity:(!form.title||!form.message)?0.5:1, transition:"all 0.2s" }}>
          {sent?<><Check size={15}/> Sent!</>:sendMut.isPending?"Sending...":<><Send size={14}/> Send broadcast</>}
        </button>
      </motion.div>
    </div>
  );
}
