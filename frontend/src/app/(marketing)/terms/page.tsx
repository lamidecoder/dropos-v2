import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — DropOS",
  description: "DropOS Terms of Service. Read before using our platform.",
};

const C = { navy:"#130D2E", purple:"#6B35E8", muted:"rgba(19,13,46,0.55)" };

const SECTIONS = [
  { title:"1. Acceptance", body:"By creating a DropOS account you agree to these terms. If you disagree, do not use the platform. We may update these terms with 14 days notice by email." },
  { title:"2. What DropOS is", body:"DropOS is software that helps you build and operate an online store. You run your business — we provide the tools. You are responsible for your store, products, customers, and legal compliance in your jurisdiction." },
  { title:"3. Your account", body:"Provide accurate registration information. Protect your password. Email support@droposhq.com immediately if you suspect unauthorised access. One person per account." },
  { title:"4. Payments", body:"DropOS charges a monthly subscription. You connect your own Paystack or Stripe account to receive customer payments. Money from your customers goes directly to your connected payment account — DropOS does not hold or custody your funds. Free plan merchants pay a transaction fee per sale as shown on the pricing page." },
  { title:"5. Prohibited use", body:"You may not sell illegal products, counterfeit goods, weapons, narcotics, or anything that violates applicable Nigerian or international law. You may not run scams, engage in fraud, or use DropOS to harm your customers. Violations result in immediate termination with no refund." },
  { title:"6. Your content", body:"You own your product listings and store content. By uploading to DropOS, you grant us a licence to store, display and transmit that content to operate the service. You warrant that your content does not infringe anyone else's rights." },
  { title:"7. Intellectual property", body:"DropOS, KIRO, and all platform trademarks and software are our property. Do not copy, resell, or reverse-engineer the platform. Your store data and customer data belong to you." },
  { title:"8. Liability", body:"DropOS is provided 'as is'. We are not liable for indirect, incidental, or consequential damages including lost sales or data. Our maximum liability to you in any 12-month period equals the fees you paid us in that period." },
  { title:"9. Termination", body:"Either party may terminate at any time. We may suspend immediately for violations. On termination your store goes offline; you have 30 days to export your data." },
  { title:"10. Law", body:"These terms are governed by the laws of the Federal Republic of Nigeria. Disputes are resolved by the courts of Lagos State." },
  { title:"11. Contact", body:"Questions: legal@droposhq.com · DropOS, Lagos, Nigeria" },
];

export default function TermsPage() {
  return (
    <div style={{ background:"#F4F2FB", minHeight:"100vh", padding:"80px 24px", fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      <div style={{ maxWidth:680, margin:"0 auto" }}>
        <div style={{ marginBottom:40 }}>
          <p style={{ fontSize:11, fontWeight:700, color:C.purple, letterSpacing:"0.1em", textTransform:"uppercase", margin:"0 0 10px" }}>Legal</p>
          <h1 style={{ fontSize:"clamp(28px,5vw,40px)", fontWeight:800, color:C.navy, letterSpacing:"-0.04em", margin:"0 0 8px" }}>Terms of Service</h1>
          <p style={{ fontSize:13, color:C.muted }}>Last updated: June 2026</p>
        </div>
        {SECTIONS.map((s,i) => (
          <div key={i} style={{ padding:"22px 0", borderTop:i>0?"1px solid rgba(19,13,46,0.08)":"none" }}>
            <h2 style={{ fontSize:15, fontWeight:700, color:C.navy, margin:"0 0 8px" }}>{s.title}</h2>
            <p style={{ fontSize:14, color:C.muted, lineHeight:1.75, margin:0 }}>{s.body}</p>
          </div>
        ))}
        <div style={{ marginTop:40, padding:20, borderRadius:14, background:"#fff", border:"1px solid rgba(19,13,46,0.08)", textAlign:"center" }}>
          <p style={{ fontSize:13, color:C.muted, margin:0 }}>
            Questions? <a href="mailto:legal@droposhq.com" style={{ color:C.purple, textDecoration:"none", fontWeight:600 }}>legal@droposhq.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
