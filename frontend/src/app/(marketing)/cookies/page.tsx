"use client";
import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";

const C = { navy:"#130D2E", purple:"#6B35E8", muted:"rgba(19,13,46,0.55)", border:"rgba(107,53,232,0.1)" };

const COOKIE_TYPES = [
  {
    id: "essential",
    name: "Essential cookies",
    required: true,
    desc: "These cookies are required for the platform to function. They keep you logged in and remember your session. They cannot be disabled.",
    examples: ["Session token (auth-token)", "CSRF protection token", "Theme preference (dropos-theme)", "Cart state"],
  },
  {
    id: "analytics",
    name: "Analytics cookies",
    required: false,
    desc: "Help us understand how merchants use the platform so we can improve it. No personal data is shared with third parties.",
    examples: ["Page views", "Feature usage", "Error tracking (Sentry)"],
  },
  {
    id: "marketing",
    name: "Marketing cookies",
    required: false,
    desc: "Used to measure the effectiveness of our marketing campaigns. Only active if you came via an ad or referral link.",
    examples: ["UTM parameters", "Referral source", "Campaign attribution"],
  },
];

function Section({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:36 }}>
      <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:22, fontWeight:500, color:C.navy, letterSpacing:"-0.02em", margin:"0 0 14px" }}>{title}</h2>
      <div style={{ fontSize:15, color:C.muted, lineHeight:1.75 }}>{children}</div>
    </div>
  );
}

export default function CookiesPage() {
  const [consent, setConsent] = useState<Record<string,boolean>>({ essential:true, analytics:true, marketing:false });
  const [saved, setSaved] = useState(false);

  const save = () => {
    try { localStorage.setItem("dropos-cookie-consent", JSON.stringify(consent)); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ background:"#F4F2FB", minHeight:"100vh", paddingTop:100, fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`}</style>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"0 24px 80px" }}>
        <div style={{ marginBottom:48 }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:C.purple, marginBottom:12, textTransform:"uppercase" }}>LEGAL</p>
          <h1 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(36px,6vw,52px)", fontWeight:500, letterSpacing:"-0.04em", color:C.navy, margin:"0 0 16px", lineHeight:1.08 }}>
            Cookie <em style={{ fontStyle:"italic", color:C.purple }}>Policy</em>
          </h1>
          <p style={{ fontSize:14, color:C.muted }}>Last updated: 1 June 2026</p>
        </div>

        <div style={{ background:"#fff", borderRadius:20, padding:"40px", border:`1px solid ${C.border}`, boxShadow:"0 2px 20px rgba(107,53,232,0.05)", marginBottom:24 }}>

          <Section title="What are cookies?">
            <p>Cookies are small text files stored on your device when you visit a website. They help the site remember information about your visit — like whether you are logged in, your preferences, and how you use the site.</p>
          </Section>

          <Section title="How we use cookies">
            <p>DropOS uses cookies to: keep you securely logged in, remember your theme preference (light or dark mode), maintain your shopping cart state on storefronts, and understand how merchants use the platform so we can improve it.</p>
          </Section>

          <Section title="Types of cookies we use">
            <div style={{ display:"flex", flexDirection:"column", gap:16, marginTop:4 }}>
              {COOKIE_TYPES.map(ct => (
                <div key={ct.id} style={{ padding:20, borderRadius:14, border:`1px solid ${C.border}`, background:"rgba(107,53,232,0.02)" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <div>
                      <p style={{ fontSize:15, fontWeight:700, color:C.navy, margin:0 }}>{ct.name}</p>
                      {ct.required && <span style={{ fontSize:10, fontWeight:700, color:C.purple, background:"rgba(107,53,232,0.08)", padding:"2px 8px", borderRadius:99, marginTop:4, display:"inline-block", letterSpacing:"0.05em" }}>ALWAYS ON</span>}
                    </div>
                    {!ct.required && (
                      <button onClick={() => setConsent(c => ({ ...c, [ct.id]: !c[ct.id] }))}
                        style={{
                          width:44, height:24, borderRadius:12, border:"none", cursor:"pointer",
                          background: consent[ct.id] ? C.purple : "rgba(19,13,46,0.12)",
                          position:"relative", transition:"background 0.2s",
                          flexShrink:0,
                        }}>
                        <div style={{
                          position:"absolute", top:3, left: consent[ct.id] ? 23 : 3,
                          width:18, height:18, borderRadius:"50%",
                          background:"#fff", transition:"left 0.2s",
                          boxShadow:"0 1px 4px rgba(0,0,0,0.15)",
                        }}/>
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize:13, color:C.muted, margin:"0 0 10px", lineHeight:1.6 }}>{ct.desc}</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {ct.examples.map(e => (
                      <span key={e} style={{ fontSize:11, fontFamily:"monospace", background:"rgba(107,53,232,0.06)", color:C.purple, padding:"3px 9px", borderRadius:6, border:`1px solid ${C.border}` }}>{e}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Save preferences */}
          <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:24, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <p style={{ fontSize:13, color:C.muted, margin:0 }}>Your preferences are saved in your browser.</p>
            <button onClick={save} style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"10px 20px", borderRadius:10, border:"none", cursor:"pointer",
              background: saved ? "#10B981" : C.navy, color:"#fff",
              fontSize:13, fontWeight:700, fontFamily:"inherit",
              transition:"background 0.2s",
            }}>
              {saved ? <><Check size={13}/>Saved!</> : "Save preferences"}
            </button>
          </div>
        </div>

        <div style={{ background:"#fff", borderRadius:20, padding:"32px 40px", border:`1px solid ${C.border}` }}>
          <Section title="Third-party cookies">
            <p>Some third-party services we use may set their own cookies:</p>
            <ul style={{ paddingLeft:20, margin:"10px 0 0" }}>
              <li style={{ marginBottom:8 }}><strong>Paystack</strong> — payment processing (their own cookie policy applies)</li>
              <li style={{ marginBottom:8 }}><strong>Stripe</strong> — payment processing (their own cookie policy applies)</li>
              <li style={{ marginBottom:8 }}><strong>Vercel</strong> — infrastructure and performance monitoring</li>
            </ul>
          </Section>

          <Section title="Managing cookies">
            <p>You can also control cookies through your browser settings. Note that disabling essential cookies will prevent you from logging into DropOS.</p>
            <p style={{ marginTop:10 }}>Most browsers allow you to: view cookies, delete individual or all cookies, block cookies from specific sites, or block third-party cookies.</p>
          </Section>

          <Section title="Contact">
            <p>Questions about our cookie practices? Email <a href="mailto:privacy@droposhq.com" style={{ color:C.purple }}>privacy@droposhq.com</a></p>
          </Section>
        </div>

        <div style={{ marginTop:32, display:"flex", gap:16, flexWrap:"wrap" }}>
          <Link href="/privacy" style={{ fontSize:13, color:C.purple, fontWeight:600, textDecoration:"none" }}>Privacy Policy →</Link>
          <Link href="/terms" style={{ fontSize:13, color:C.purple, fontWeight:600, textDecoration:"none" }}>Terms of Use →</Link>
        </div>
      </div>
    </div>
  );
}
