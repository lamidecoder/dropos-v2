import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — DropOS",
  description: "How DropOS collects, uses and protects your data.",
};

const C = { navy:"#130D2E", purple:"#6B35E8", muted:"rgba(19,13,46,0.55)" };

const SECTIONS = [
  { title:"What we collect", body:"Name, email, phone, country on registration. Store settings, products, orders, customer information you enter. KIRO chat messages (to generate responses only — never sold or used for AI training without consent). Customer payment details go directly to Paystack/Stripe and are never stored on our servers." },
  { title:"How we use it", body:"To run your account and store. To send transactional emails (order confirmations, password resets). To improve the platform. To manage your subscription. We do not sell your data. We do not use your customer data for advertising." },
  { title:"Your customers' data", body:"You are the data controller for your customers' personal information. You are responsible for your own store privacy policy and for complying with applicable privacy laws. We act as your data processor." },
  { title:"Security", body:"Data stored on Railway (PostgreSQL) and Vercel — both SOC 2 compliant. HTTPS everywhere. Passwords hashed with bcrypt. API keys encrypted at rest. We never log your Paystack or Stripe secret keys in plain text." },
  { title:"Cookies", body:"Essential cookies only — for keeping you logged in. No tracking cookies. No Google Analytics. No Facebook Pixel on the DropOS dashboard." },
  { title:"Retention", body:"Data kept while your account is active. Permanently deleted within 30 days of account deletion, except where we are legally required to retain records. Export all your data from Settings at any time." },
  { title:"Your rights", body:"Access, correct, export, or delete your data at any time. Email privacy@droposhq.com. We respond within 30 days." },
  { title:"NDPR", body:"We comply with Nigeria's Data Protection Regulation (NDPR) 2019. As your data processor we support your NDPR compliance obligations." },
  { title:"Changes", body:"We notify you by email at least 14 days before material changes." },
  { title:"Contact", body:"privacy@droposhq.com · DropOS, Lagos, Nigeria" },
];

export default function PrivacyPage() {
  return (
    <div style={{ background:"#F4F2FB", minHeight:"100vh", padding:"80px 24px", fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      <div style={{ maxWidth:680, margin:"0 auto" }}>
        <div style={{ marginBottom:40 }}>
          <p style={{ fontSize:11, fontWeight:700, color:C.purple, letterSpacing:"0.1em", textTransform:"uppercase", margin:"0 0 10px" }}>Legal</p>
          <h1 style={{ fontSize:"clamp(28px,5vw,40px)", fontWeight:800, color:C.navy, letterSpacing:"-0.04em", margin:"0 0 8px" }}>Privacy Policy</h1>
          <p style={{ fontSize:13, color:C.muted }}>Last updated: June 2026</p>
        </div>
        <p style={{ fontSize:15, color:C.muted, lineHeight:1.7, marginBottom:32 }}>
          Your data belongs to you. Here is exactly what we collect, why, and what we do with it.
        </p>
        {SECTIONS.map((s,i) => (
          <div key={i} style={{ padding:"22px 0", borderTop:i>0?"1px solid rgba(19,13,46,0.08)":"none" }}>
            <h2 style={{ fontSize:15, fontWeight:700, color:C.navy, margin:"0 0 8px" }}>{s.title}</h2>
            <p style={{ fontSize:14, color:C.muted, lineHeight:1.75, margin:0 }}>{s.body}</p>
          </div>
        ))}
        <div style={{ marginTop:40, padding:20, borderRadius:14, background:"#fff", border:"1px solid rgba(19,13,46,0.08)", textAlign:"center" }}>
          <p style={{ fontSize:13, color:C.muted, margin:0 }}>
            Privacy questions: <a href="mailto:privacy@droposhq.com" style={{ color:C.purple, textDecoration:"none", fontWeight:600 }}>privacy@droposhq.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
