"use client";
import { useState } from "react";
import Link from "next/link";
import { Zap, Mail, MessageSquare, ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";

const C = { navy:"#130D2E", purple:"#6B35E8", muted:"rgba(19,13,46,0.5)", border:"rgba(107,53,232,0.1)", faint:"rgba(107,53,232,0.04)" };
const API = process.env.NEXT_PUBLIC_API_URL || "";

export default function ContactPage() {
  const [form, setForm]     = useState({ name:"", email:"", subject:"general", message:"" });
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");

  const submit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setStatus("loading");
    try {
      await fetch(`${API}/contact`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify(form),
      });
      setStatus("success");
    } catch { setStatus("error"); }
  };

  const Input = ({ label, value, onChange, placeholder, type="text" }: any) => (
    <div>
      <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.navy, marginBottom:6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1px solid ${C.border}`, background:"#fff", color:C.navy, fontSize:14, fontFamily:"inherit", outline:"none", transition:"border-color 0.15s" }}
        onFocus={e => e.target.style.borderColor=C.purple}
        onBlur={e => e.target.style.borderColor="rgba(107,53,232,0.1)"}
      />
    </div>
  );

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      <section style={{ padding:"80px 24px 60px", textAlign:"center", maxWidth:600, margin:"0 auto" }}>
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:C.purple, marginBottom:12, textTransform:"uppercase" }}>CONTACT</p>
        <h1 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(36px,6vw,56px)", fontWeight:500, letterSpacing:"-0.04em", color:C.navy, margin:"0 0 16px", lineHeight:1.08 }}>
          Get in <em style={{ fontStyle:"italic", color:C.purple }}>touch.</em>
        </h1>
        <p style={{ fontSize:15, color:C.muted, margin:0, lineHeight:1.6 }}>
          We reply within 24 hours. For urgent issues, message KIRO directly in your dashboard.
        </p>
      </section>

      <section style={{ maxWidth:880, margin:"0 auto", padding:"0 24px 100px", display:"grid", gridTemplateColumns:"1fr 1.8fr", gap:32, alignItems:"start" }} className="contact-grid">
        {/* Left — contact options */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { icon:MessageSquare, label:"General questions", desc:"Pricing, plans, features",  color:"#8B5CF6" },
            { icon:Zap,           label:"Support",          desc:"Bugs, errors, help",         color:"#06B6D4" },
            { icon:Mail,          label:"Enterprise",       desc:"Custom plans, partnerships", color:"#10B981" },
          ].map(c => (
            <div key={c.label} style={{ padding:18, borderRadius:16, background:"#fff", border:`1px solid ${C.border}` }}>
              <div style={{ width:36, height:36, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10, background:`${c.color}12` }}>
                <c.icon size={16} style={{ color:c.color }}/>
              </div>
              <h3 style={{ fontSize:14, fontWeight:700, color:C.navy, margin:"0 0 4px" }}>{c.label}</h3>
              <p style={{ fontSize:12, color:C.muted, margin:0 }}>{c.desc}</p>
            </div>
          ))}

          {/* KIRO fastest */}
          <div style={{ padding:18, borderRadius:16, background:"linear-gradient(135deg,#2D1B69,#1A0B4A)", border:"1px solid rgba(167,139,250,0.2)" }}>
            <p style={{ fontSize:11, fontWeight:700, color:"#C4B5FD", margin:"0 0 6px", letterSpacing:"0.06em" }}>⚡ FASTEST RESPONSE</p>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)", margin:"0 0 10px", lineHeight:1.55 }}>
              Message KIRO in your dashboard. It can fix most issues instantly.
            </p>
            <Link href="/auth/login"
              style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, fontWeight:700, color:"#C4B5FD", textDecoration:"none" }}>
              Open KIRO <ArrowRight size={11}/>
            </Link>
          </div>
        </div>

        {/* Right — form */}
        {status === "success" ? (
          <div style={{ padding:48, borderRadius:20, background:"#fff", border:`1px solid ${C.border}`, textAlign:"center" }}>
            <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(16,185,129,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <Check size={24} color="#10B981"/>
            </div>
            <h3 style={{ fontSize:20, fontWeight:800, color:C.navy, margin:"0 0 8px" }}>Message sent!</h3>
            <p style={{ fontSize:14, color:C.muted }}>We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <div style={{ background:"#fff", borderRadius:20, padding:32, border:`1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Input label="Name" value={form.name} onChange={(v:string)=>setForm(f=>({...f,name:v}))} placeholder="Your name"/>
              <Input label="Email" type="email" value={form.email} onChange={(v:string)=>setForm(f=>({...f,email:v}))} placeholder="you@example.com"/>
            </div>

            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.navy, marginBottom:6 }}>Subject</label>
              <select value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))}
                style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1px solid ${C.border}`, background:"#fff", color:C.navy, fontSize:14, fontFamily:"inherit", outline:"none" }}>
                <option value="general">General question</option>
                <option value="support">Technical support</option>
                <option value="billing">Billing</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.navy, marginBottom:6 }}>Message</label>
              <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}
                placeholder="How can we help?" rows={5}
                style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1px solid ${C.border}`, background:"#fff", color:C.navy, fontSize:14, fontFamily:"inherit", outline:"none", resize:"vertical" }}
                onFocus={e=>e.target.style.borderColor=C.purple}
                onBlur={e=>e.target.style.borderColor="rgba(107,53,232,0.1)"}
              />
            </div>

            {status === "error" && (
              <p style={{ fontSize:13, color:"#EF4444", margin:0 }}>Something went wrong — please try again.</p>
            )}

            <button onClick={submit} disabled={status==="loading" || !form.name || !form.email || !form.message}
              style={{ width:"100%", padding:"14px 0", borderRadius:12, border:"none", cursor:"pointer", background:C.navy, color:"#fff", fontSize:14, fontWeight:700, fontFamily:"inherit", opacity:(!form.name||!form.email||!form.message)?0.5:1, transition:"all 0.15s" }}>
              {status==="loading" ? "Sending…" : "Send message"}
            </button>
          </div>
        )}
      </section>

      <style>{`@media(max-width:768px){ .contact-grid{grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
}
