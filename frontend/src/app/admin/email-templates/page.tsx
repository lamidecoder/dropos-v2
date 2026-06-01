"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { motion } from "framer-motion";
import { Mail, Save, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "../../../components/admin/AdminTable";
import toast from "react-hot-toast";

const V = { accent:"#6B35E8", green:"#10B981" };
const t = { card:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.07)", text:"rgba(255,255,255,0.9)", muted:"rgba(255,255,255,0.4)" };

const TEMPLATE_LABELS: Record<string,{ label:string; desc:string; vars:string[] }> = {
  welcome:       { label:"Welcome email",        desc:"Sent when a new merchant signs up", vars:["{{name}}","{{storeName}}","{{ctaUrl}}"] },
  orderConfirm:  { label:"Order confirmed",       desc:"Sent to customer when order is placed", vars:["{{customerName}}","{{storeName}}","{{orderNumber}}","{{total}}","{{deliveryDate}}","{{trackingUrl}}"] },
  orderShipped:  { label:"Order shipped",         desc:"Sent when order status becomes SHIPPED", vars:["{{customerName}}","{{orderNumber}}","{{storeName}}","{{trackingUrl}}"] },
  passwordReset: { label:"Password reset",        desc:"Sent when merchant requests password reset", vars:["{{name}}","{{resetUrl}}"] },
  planUpgraded:  { label:"Plan upgrade",          desc:"Sent when merchant upgrades their plan", vars:["{{name}}","{{plan}}","{{dashboardUrl}}"] },
};

export default function AdminEmailTemplatesPage() {
  const qc = useQueryClient();
  const [active, setActive] = useState("welcome");
  const [preview, setPreview] = useState(false);
  const [form, setForm] = useState<Record<string,{subject:string;body:string}>>({});

  const { data:raw } = useQuery<any>({
    queryKey: ["admin-email-templates"],
    queryFn: () => adminAPI.get("/admin/email-templates").then((r:any) => r.data.data),
  });

  useEffect(() => { if (raw) setForm(raw); }, [raw]);

  const saveMut = useMutation({
    mutationFn: () => adminAPI.patch("/admin/email-templates", { key:active, ...form[active] }),
    onSuccess: () => { toast.success("Template saved"); qc.invalidateQueries({ queryKey:["admin-email-templates"] }); },
    onError:   () => toast.error("Save failed"),
  });

  const current = form[active] || { subject:"", body:"" };
  const meta    = TEMPLATE_LABELS[active];

  return (
    <div>
      <PageHeader title="Email Templates" sub="Edit the transactional emails sent to merchants and customers"
        action={
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => setPreview(p => !p)}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px", borderRadius:10, border:`1px solid ${t.border}`, background:"transparent", color:t.muted, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit" }}>
              {preview ? <EyeOff size={13}/> : <Eye size={13}/>} {preview?"Edit":"Preview"}
            </button>
            <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:10, border:"none", cursor:"pointer", background:V.accent, color:"#fff", fontSize:13, fontWeight:700, fontFamily:"inherit" }}>
              <Save size={13}/> {saveMut.isPending?"Saving...":"Save"}
            </button>
          </div>
        }/>

      <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:12 }} className="adm-2col">
        {/* Template list */}
        <div style={{ background:t.card, borderRadius:16, border:`1px solid ${t.border}`, padding:8, height:"fit-content" }}>
          {Object.entries(TEMPLATE_LABELS).map(([key, meta]) => (
            <button key={key} onClick={() => { setActive(key); setPreview(false); }}
              style={{ width:"100%", textAlign:"left", padding:"10px 12px", borderRadius:10, border:"none", cursor:"pointer", fontFamily:"inherit", background:active===key?"rgba(107,53,232,0.12)":"transparent", marginBottom:2, transition:"background 0.15s" }}>
              <p style={{ fontSize:13, fontWeight:active===key?700:500, color:active===key?"#fff":t.muted, margin:0 }}>{meta.label}</p>
            </button>
          ))}
        </div>

        {/* Editor / Preview */}
        <motion.div key={active+preview} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
          style={{ background:t.card, borderRadius:16, border:`1px solid ${t.border}`, padding:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, paddingBottom:16, borderBottom:`1px solid rgba(255,255,255,0.06)` }}>
            <div style={{ width:32, height:32, borderRadius:9, background:"rgba(107,53,232,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Mail size={14} color={V.accent}/>
            </div>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:t.text, margin:0 }}>{meta?.label}</p>
              <p style={{ fontSize:11, color:t.muted, margin:0 }}>{meta?.desc}</p>
            </div>
          </div>

          {preview ? (
            <div style={{ background:"#fff", borderRadius:12, padding:28, color:"#1a1a2e" }}>
              <div style={{ borderBottom:"1px solid #eee", paddingBottom:16, marginBottom:20 }}>
                <p style={{ fontSize:11, color:"#888", margin:"0 0 4px" }}>SUBJECT</p>
                <p style={{ fontSize:16, fontWeight:600, color:"#1a1a2e", margin:0 }}>{current.subject}</p>
              </div>
              <pre style={{ fontFamily:"system-ui,sans-serif", fontSize:14, color:"#333", whiteSpace:"pre-wrap", lineHeight:1.7, margin:0 }}>{current.body}</pre>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:7 }}>Subject line</label>
                <input value={current.subject} onChange={e => setForm(f => ({ ...f, [active]:{ ...f[active], subject:e.target.value } }))}
                  style={{ width:"100%", padding:"11px 14px", borderRadius:11, border:"1px solid rgba(255,255,255,0.09)", background:"rgba(255,255,255,0.05)", color:t.text, fontSize:13, fontFamily:"inherit", outline:"none" }}/>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:7 }}>Body</label>
                <textarea value={current.body} rows={14}
                  onChange={e => setForm(f => ({ ...f, [active]:{ ...f[active], body:e.target.value } }))}
                  style={{ width:"100%", padding:"11px 14px", borderRadius:11, border:"1px solid rgba(255,255,255,0.09)", background:"rgba(255,255,255,0.05)", color:t.text, fontSize:13, fontFamily:"monospace", outline:"none", resize:"vertical", lineHeight:1.7 }}/>
              </div>
              {meta?.vars && (
                <div style={{ padding:"12px 14px", borderRadius:10, background:"rgba(107,53,232,0.06)", border:"1px solid rgba(107,53,232,0.12)" }}>
                  <p style={{ fontSize:11, fontWeight:700, color:"rgba(167,139,250,0.7)", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.08em" }}>Available variables</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {meta.vars.map(v => (
                      <code key={v} style={{ fontSize:11, padding:"2px 8px", borderRadius:6, background:"rgba(107,53,232,0.15)", color:"#A78BFA" }}>{v}</code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
      <style>{`@media(max-width:768px){ .adm-2col{grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
}
