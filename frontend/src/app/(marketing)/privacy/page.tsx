import Link from "next/link";

const C = { navy:"#130D2E", purple:"#6B35E8", muted:"rgba(19,13,46,0.55)", border:"rgba(107,53,232,0.1)" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize: 22, fontWeight: 500, color: C.navy, letterSpacing:"-0.02em", margin: "0 0 14px" }}>
        {title}
      </h2>
      <div style={{ fontSize: 15, color: C.muted, lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div style={{ background: "#F4F2FB", minHeight: "100vh", paddingTop: 100, fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: C.purple, marginBottom: 12, textTransform:"uppercase" }}>LEGAL</p>
          <h1 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize: "clamp(36px,6vw,52px)", fontWeight: 500, letterSpacing:"-0.04em", color: C.navy, margin:"0 0 16px", lineHeight:1.08 }}>
            Privacy <em style={{ fontStyle:"italic", color: C.purple }}>Policy</em>
          </h1>
          <p style={{ fontSize: 14, color: C.muted }}>Last updated: 1 June 2026 · Effective immediately</p>
        </div>

        <div style={{ background:"#fff", borderRadius: 20, padding: "40px 40px", border:`1px solid ${C.border}`, boxShadow:"0 2px 20px rgba(107,53,232,0.05)" }}>
          <Section title="Who we are">
            <p>DropOS ("we", "us", "our") is a SaaS dropshipping platform operated by DropOS Ltd. Our registered address and contact email is <a href="mailto:hello@droposhq.com" style={{ color: C.purple }}>hello@droposhq.com</a>.</p>
            <p style={{ marginTop: 12 }}>This privacy policy explains how we collect, use, store and protect your personal data when you use our platform at <strong>droposhq.com</strong> and related services.</p>
          </Section>

          <Section title="What data we collect">
            <p><strong>Account data:</strong> Name, email address, phone number, and password hash when you create an account.</p>
            <p style={{ marginTop: 10 }}><strong>Store data:</strong> Products, orders, customers, and store settings you create on the platform.</p>
            <p style={{ marginTop: 10 }}><strong>Payment data:</strong> We do not store card numbers. Payments are processed by Paystack and Stripe — please review their privacy policies.</p>
            <p style={{ marginTop: 10 }}><strong>Usage data:</strong> Pages visited, features used, browser type, IP address, and device information via analytics tools.</p>
            <p style={{ marginTop: 10 }}><strong>Communications:</strong> Any messages you send to our support team.</p>
          </Section>

          <Section title="How we use your data">
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              {["Provide, operate and improve the DropOS platform", "Process payments and prevent fraud", "Send transactional emails (receipts, order confirmations)", "Send product updates and news (you can opt out anytime)", "Respond to support requests", "Comply with legal obligations"].map(i => (
                <li key={i} style={{ marginBottom: 8 }}>{i}</li>
              ))}
            </ul>
          </Section>

          <Section title="Legal basis for processing (GDPR)">
            <p>We process your data on the following legal bases:</p>
            <ul style={{ paddingLeft: 20, margin: "10px 0 0" }}>
              <li style={{ marginBottom: 8 }}><strong>Contract:</strong> Processing necessary to fulfil our agreement with you</li>
              <li style={{ marginBottom: 8 }}><strong>Legitimate interests:</strong> Analytics and fraud prevention</li>
              <li style={{ marginBottom: 8 }}><strong>Consent:</strong> Marketing communications and optional cookies</li>
              <li style={{ marginBottom: 8 }}><strong>Legal obligation:</strong> Compliance with applicable laws</li>
            </ul>
          </Section>

          <Section title="Data sharing">
            <p>We do not sell your data. We share it only with:</p>
            <ul style={{ paddingLeft: 20, margin: "10px 0 0" }}>
              <li style={{ marginBottom: 8 }}><strong>Paystack / Stripe</strong> — payment processing</li>
              <li style={{ marginBottom: 8 }}><strong>Resend</strong> — transactional emails</li>
              <li style={{ marginBottom: 8 }}><strong>Anthropic</strong> — AI features (KIRO) — messages are processed but not stored for training</li>
              <li style={{ marginBottom: 8 }}><strong>Railway / Render</strong> — infrastructure hosting</li>
              <li style={{ marginBottom: 8 }}><strong>Law enforcement</strong> — when legally required</li>
            </ul>
          </Section>

          <Section title="Data retention">
            <p>We retain your account data for as long as your account is active. If you delete your account, your personal data is deleted within 30 days. Order and transaction records may be retained for up to 7 years for legal and accounting purposes.</p>
          </Section>

          <Section title="Your rights">
            <p>Under GDPR and applicable data protection laws, you have the right to:</p>
            <ul style={{ paddingLeft: 20, margin: "10px 0 0" }}>
              {["Access your personal data", "Correct inaccurate data", "Delete your data ('right to be forgotten')", "Export your data in a portable format", "Object to or restrict certain processing", "Withdraw consent at any time"].map(r => (
                <li key={r} style={{ marginBottom: 8 }}>{r}</li>
              ))}
            </ul>
            <p style={{ marginTop: 12 }}>To exercise any of these rights, email <a href="mailto:privacy@droposhq.com" style={{ color: C.purple }}>privacy@droposhq.com</a>.</p>
          </Section>

          <Section title="Cookies">
            <p>We use essential cookies to keep you logged in and remember your preferences. We also use optional analytics cookies to understand how the platform is used. See our <Link href="/cookies" style={{ color: C.purple }}>Cookie Policy</Link> for full details.</p>
          </Section>

          <Section title="Security">
            <p>We use industry-standard security measures including encryption in transit (TLS), hashed passwords, and access controls. No system is 100% secure — please use a strong, unique password.</p>
          </Section>

          <Section title="Children">
            <p>DropOS is not intended for users under 16 years old. If you believe a child has provided us with personal data, please contact us immediately.</p>
          </Section>

          <Section title="Changes to this policy">
            <p>We may update this policy periodically. We will notify you of significant changes by email or a prominent notice on the platform.</p>
          </Section>

          <Section title="Contact us">
            <p>For any privacy-related questions: <a href="mailto:privacy@droposhq.com" style={{ color: C.purple }}>privacy@droposhq.com</a><br/>
            For general queries: <a href="mailto:hello@droposhq.com" style={{ color: C.purple }}>hello@droposhq.com</a></p>
          </Section>
        </div>

        <div style={{ marginTop: 32, display:"flex", gap: 16, flexWrap:"wrap" }}>
          <Link href="/terms" style={{ fontSize:13, color: C.purple, fontWeight:600, textDecoration:"none" }}>Terms of Use →</Link>
          <Link href="/cookies" style={{ fontSize:13, color: C.purple, fontWeight:600, textDecoration:"none" }}>Cookie Policy →</Link>
        </div>
      </div>
    </div>
  );
}
