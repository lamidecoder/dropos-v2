"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { motion } from "framer-motion";
import { Megaphone, Send, Check } from "lucide-react";
import toast from "react-hot-toast";

const V = { accent:"#6B35E8", green:"#10B981" };
const t = { card:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.07)", text:"rgba(255,255,255,0.9)", muted:"rgba(255,255,255,0.4)", input:"rgba(255,255,255,0.05)" };

const inp = { width:"100%", padding:"11px 14px", borderRadius:12, border:`1px solid rgba(255,255,255,0.09)`, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.9)", fontSize:13, fontFamily:"inherit", outline:"none" };

export default function AdminBroadcastPage() {
  const [form, setForm] = useState({ title:"", message:"", type:"info", targetPlan:"" });
  const [sent, setSent] = useState(false);

  const sendMut = useMutation({
    mutationFn: () => adminAPI.post("/admin/broadcast", form),
    onSuccess: (res: any) => {
      toast.success(res.data?.message || "Broadcast sent!");
      setSent(true);
      setTimeout(() => { setSent(false); setForm({ title:"", message:"", type:"info", targetPlan:"" }); }, 3000);
    },
    onError: () => toast.error("Failed to send broadcast"),
  });

  return (
    <div style={{ maxWidth:680 }}>
      <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:900, color:t.text, margin:"0 0 4px", letterSpacing:"-0.04em" }}>Broadcast Message</h1>
        <p style={{ fontSize:13, color:t.muted }}>Send an in-app notification to all or selected users</p>
      </motion.div>

      <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}
        style={{ background:t.card, borderRadius:20, padding:28, border:`1px solid ${t.border}`, display:"flex", flexDirection:"column", gap:16 }}>

        <div>
          <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:7 }}>Message type</label>
          <div style={{ display:"flex", gap:8 }}>
            {["info","success","warning","error"].map(tp => (
              <button key={tp} onClick={() => setForm(f => ({ ...f, type:tp }))}
                style={{ padding:"7px 16px", borderRadius:9, border:`1px solid ${form.type===tp?"rgba(107,53,232,0.4)":"rgba(255,255,255,0.08)"}`, background:form.type===tp?"rgba(107,53,232,0.1)":"transparent", color:form.type===tp?"#A78BFA":t.muted, cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit", textTransform:"capitalize" }}>
                {tp}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:7 }}>Target audience</label>
          <select value={form.targetPlan} onChange={e => setForm(f => ({ ...f, targetPlan:e.target.value }))}
            style={{ ...inp }}>
            <option value="">All users</option>
            <option value="FREE">Free plan only</option>
            <option value="GROWTH">Growth plan only</option>
            <option value="PRO">Pro plan only</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:7 }}>Title</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title:e.target.value }))}
            placeholder="e.g. New feature available!" style={{ ...inp }}/>
        </div>

        <div>
          <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:7 }}>Message</label>
          <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message:e.target.value }))}
            placeholder="Write your message to users..."
            rows={5} style={{ ...inp, resize:"vertical" as any }}/>
          <p style={{ fontSize:11, color:t.muted, marginTop:4, textAlign:"right" }}>{form.message.length} chars</p>
        </div>

        {/* Preview */}
        {form.title && form.message && (
          <div style={{ padding:16, borderRadius:14, background:"rgba(107,53,232,0.06)", border:"1px solid rgba(107,53,232,0.15)" }}>
            <p style={{ fontSize:11, fontWeight:700, color:"rgba(167,139,250,0.6)", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.08em" }}>Preview</p>
            <div style={{ display:"flex", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(145deg,#2D1B69,#0D0625)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Megaphone size={14} color="#C4B5FD"/>
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 3px" }}>{form.title}</p>
                <p style={{ fontSize:12, color:t.muted, margin:0, lineHeight:1.5 }}>{form.message}</p>
              </div>
            </div>
          </div>
        )}

        <button onClick={() => sendMut.mutate()} disabled={!form.title || !form.message || sendMut.isPending}
          style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"14px 0", borderRadius:12, border:"none", cursor:"pointer", background:sent?"rgba(16,185,129,0.15)":V.accent, color:"#fff", fontSize:14, fontWeight:700, fontFamily:"inherit", opacity:(!form.title||!form.message)?0.5:1, transition:"all 0.2s", boxShadow:sent?"none":"0 4px 20px rgba(107,53,232,0.25)" }}>
          {sent ? <><Check size={16}/> Sent!</> : sendMut.isPending ? "Sending..." : <><Send size={14}/> Send broadcast</>}
        </button>
      </motion.div>

      {/* Tips */}
      <div style={{ marginTop:16, padding:"14px 18px", borderRadius:14, background:"rgba(255,255,255,0.02)", border:`1px solid ${t.border}` }}>
        <p style={{ fontSize:12, color:t.muted, lineHeight:1.6, margin:0 }}>
          💡 Broadcasts appear as in-app notifications for all targeted users when they next open their dashboard. Use for feature announcements, maintenance notices, or promotional messages.
        </p>
      </div>
    </div>
  );
}
