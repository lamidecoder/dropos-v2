import Link from "next/link";

const C = { navy:"#130D2E", purple:"#6B35E8", muted:"rgba(19,13,46,0.55)", border:"rgba(107,53,232,0.1)" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize: 22, fontWeight: 500, color: C.navy, letterSpacing:"-0.02em", margin: "0 0 14px" }}>{title}</h2>
      <div style={{ fontSize: 15, color: C.muted, lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div style={{ background:"#F4F2FB", minHeight:"100vh", paddingTop:100, fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`}</style>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"0 24px 80px" }}>
        <div style={{ marginBottom:48 }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:C.purple, marginBottom:12, textTransform:"uppercase" }}>LEGAL</p>
          <h1 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(36px,6vw,52px)", fontWeight:500, letterSpacing:"-0.04em", color:C.navy, margin:"0 0 16px", lineHeight:1.08 }}>
            Terms of <em style={{ fontStyle:"italic", color:C.purple }}>Use</em>
          </h1>
          <p style={{ fontSize:14, color:C.muted }}>Last updated: 1 June 2026 · By using DropOS, you agree to these terms.</p>
        </div>

        <div style={{ background:"#fff", borderRadius:20, padding:"40px", border:`1px solid ${C.border}`, boxShadow:"0 2px 20px rgba(107,53,232,0.05)" }}>

          <Section title="1. Acceptance">
            <p>By creating an account or using DropOS ("the Platform"), you agree to these Terms of Use and our Privacy Policy. If you do not agree, do not use the Platform.</p>
          </Section>

          <Section title="2. The service">
            <p>DropOS provides a SaaS platform for dropshipping merchants, including store building tools, AI-assisted features (KIRO), product import, order management, and payment processing integrations.</p>
            <p style={{ marginTop:10 }}>We reserve the right to modify, suspend or discontinue any part of the service at any time with reasonable notice.</p>
          </Section>

          <Section title="3. Accounts">
            <p>You must be at least 16 years old to create an account. You are responsible for keeping your login credentials secure. You are responsible for all activity under your account.</p>
            <p style={{ marginTop:10 }}>One person or entity may not maintain more than one free account. Multiple accounts may be used within a paid plan's store limit.</p>
          </Section>

          <Section title="4. Acceptable use">
            <p>You may not use DropOS to:</p>
            <ul style={{ paddingLeft:20, margin:"10px 0 0" }}>
              {[
                "Sell counterfeit, illegal, or prohibited products",
                "Violate any applicable laws or regulations",
                "Infringe intellectual property rights",
                "Engage in fraudulent transactions",
                "Distribute malware or attempt to hack the platform",
                "Abuse the KIRO AI system with harmful or deceptive prompts",
                "Resell access to the platform without our written consent",
              ].map(i => <li key={i} style={{ marginBottom:8 }}>{i}</li>)}
            </ul>
            <p style={{ marginTop:12 }}>Violation may result in immediate account termination without refund.</p>
          </Section>

          <Section title="5. Payments and billing">
            <p>Paid plans are billed monthly or annually. Subscriptions renew automatically unless cancelled before the renewal date.</p>
            <p style={{ marginTop:10 }}>Refunds are available within 7 days of a new subscription starting if you have not processed any live orders. After 7 days or after live orders, no refunds are issued.</p>
            <p style={{ marginTop:10 }}>A 2% transaction fee applies to all orders processed through the platform on all plans. This is in addition to any fees charged by Paystack or Stripe.</p>
          </Section>

          <Section title="6. Your content">
            <p>You own the content (products, images, copy) you upload to DropOS. By uploading content, you grant us a licence to display and process it solely for providing the service to you.</p>
            <p style={{ marginTop:10 }}>You are solely responsible for ensuring your content does not infringe third-party rights.</p>
          </Section>

          <Section title="7. KIRO AI features">
            <p>KIRO is an AI assistant powered by third-party models. Responses are generated automatically and may not always be accurate. Do not rely on KIRO for legal, financial, or medical advice.</p>
            <p style={{ marginTop:10 }}>KIRO credits are consumed per message. Unused credits do not roll over between billing periods on monthly plans.</p>
          </Section>

          <Section title="8. Intellectual property">
            <p>DropOS, the KIRO brand, store templates, and all platform code are owned by DropOS Ltd. You may not copy, reproduce or distribute them without written permission.</p>
          </Section>

          <Section title="9. Liability limitation">
            <p>To the maximum extent permitted by law, DropOS is not liable for: loss of revenue or profits, loss of data, indirect or consequential damages, or any damages arising from third-party payment processor failures.</p>
            <p style={{ marginTop:10 }}>Our total liability to you in any 12-month period shall not exceed the amount you paid us in that period.</p>
          </Section>

          <Section title="10. Termination">
            <p>You may cancel your account at any time from your billing settings. We may terminate accounts that violate these terms, with or without notice.</p>
            <p style={{ marginTop:10 }}>On termination, you retain the right to export your data for 30 days before it is deleted.</p>
          </Section>

          <Section title="11. Governing law">
            <p>These terms are governed by the laws of the Federal Republic of Nigeria. Disputes shall be resolved in Nigerian courts, unless both parties agree to arbitration.</p>
          </Section>

          <Section title="12. Contact">
            <p>For terms-related questions: <a href="mailto:legal@droposhq.com" style={{ color:C.purple }}>legal@droposhq.com</a></p>
          </Section>
        </div>

        <div style={{ marginTop:32, display:"flex", gap:16, flexWrap:"wrap" }}>
          <Link href="/privacy" style={{ fontSize:13, color:C.purple, fontWeight:600, textDecoration:"none" }}>Privacy Policy →</Link>
          <Link href="/cookies" style={{ fontSize:13, color:C.purple, fontWeight:600, textDecoration:"none" }}>Cookie Policy →</Link>
        </div>
      </div>
    </div>
  );
}
