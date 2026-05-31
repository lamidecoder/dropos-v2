import Link from "next/link";
import { ArrowRight, Globe, Users, TrendingUp, Shield, Code2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — DropOS",
  description: "We are building the AI commerce platform. DropOS lets anyone launch a store in 60 seconds.",
};

const C = { navy:"#130D2E", purple:"#6B35E8", muted:"rgba(19,13,46,0.5)", border:"rgba(107,53,232,0.1)", faint:"rgba(107,53,232,0.04)" };

export default function AboutPage() {
  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Hero */}
      <section style={{ textAlign:"center", padding:"80px 24px 64px", maxWidth:780, margin:"0 auto" }}>
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:C.purple, marginBottom:12, textTransform:"uppercase" }}>ABOUT DROPOS</p>
        <h1 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(36px,6vw,60px)", fontWeight:500, letterSpacing:"-0.04em", color:C.navy, margin:"0 0 20px", lineHeight:1.08 }}>
          We are building the<br/><em style={{ fontStyle:"italic", color:C.purple }}>AI commerce platform.</em>
        </h1>
        <p style={{ fontSize:17, color:C.muted, lineHeight:1.7, maxWidth:540, margin:"0 auto" }}>
          Most people who want to start an online business spend more time fighting tools than actually selling. KIRO fixes that.
        </p>
      </section>

      {/* Mission */}
      <section style={{ maxWidth:1040, margin:"0 auto", padding:"0 24px 80px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }} className="about-grid">
        <div>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:C.purple, marginBottom:14, textTransform:"uppercase" }}>Our Mission</p>
          <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(26px,4vw,38px)", fontWeight:500, color:C.navy, margin:"0 0 18px", letterSpacing:"-0.03em", lineHeight:1.15 }}>
            Give every seller the tools big brands take for granted.
          </h2>
          <p style={{ fontSize:15, color:C.muted, lineHeight:1.7, marginBottom:14 }}>
            A seller in Lagos, London, or Nairobi should have access to the same quality of AI, analytics, and automation that enterprise companies have — at a price that makes sense for an independent seller.
          </p>
          <p style={{ fontSize:15, color:C.muted, lineHeight:1.7 }}>
            We are not competing with Shopify on features. We are building something fundamentally different: a platform where the AI does the work, and you do the selling.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[
            { icon:Globe,      label:"Global First",    desc:"Built for sellers worldwide. Naira, Pounds, Dollars — all supported natively." },
            { icon:Users,      label:"Seller-Centric",  desc:"Every decision is made with the seller's success in mind, not advertisers." },
            { icon:TrendingUp, label:"Growth Focused",  desc:"KIRO spots opportunities and tells you what to do, not just what happened." },
            { icon:Shield,     label:"Privacy First",   desc:"Your store data is yours. We never sell it, share it, or use it to train models." },
          ].map(v => (
            <div key={v.label} style={{ padding:20, borderRadius:16, background:"#fff", border:`1px solid ${C.border}`, boxShadow:"0 2px 12px rgba(107,53,232,0.04)" }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"rgba(107,53,232,0.08)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
                <v.icon size={16} color={C.purple}/>
              </div>
              <h3 style={{ fontSize:14, fontWeight:700, color:C.navy, margin:"0 0 6px" }}>{v.label}</h3>
              <p style={{ fontSize:12, color:C.muted, lineHeight:1.6, margin:0 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ background:"#fff", borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:"72px 24px" }}>
        <div style={{ maxWidth:760, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:C.purple, marginBottom:12, textTransform:"uppercase" }}>The Team</p>
            <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(28px,4vw,42px)", fontWeight:500, color:C.navy, margin:0, letterSpacing:"-0.03em" }}>
              Built by <em style={{ fontStyle:"italic", color:C.purple }}>builders.</em>
            </h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }} className="team-grid">
            {[
              {
                name:"Olamide A.", role:"CTO & Co-founder", avatar:"O",
                bio:"Full-stack engineer. Sole technical architect of DropOS. Built the entire platform from zero — AI integration, SaaS infrastructure, and all 29 store templates.",
              },
              {
                name:"Tobi B.", role:"CEO & Co-founder", avatar:"T",
                bio:"Business and growth. Spent years watching sellers struggle with tools built for Silicon Valley. DropOS is the platform he wished existed when he started.",
              },
            ].map(m => (
              <div key={m.name} style={{ padding:28, borderRadius:20, background:C.faint, border:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
                  <div style={{ width:48, height:48, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:20, color:"#fff", background:"linear-gradient(145deg,#2D1B69,#0D0625)", flexShrink:0 }}>
                    {m.avatar}
                  </div>
                  <div>
                    <p style={{ fontSize:15, fontWeight:800, color:C.navy, margin:0, letterSpacing:"-0.01em" }}>{m.name}</p>
                    <p style={{ fontSize:12, color:C.purple, margin:0, fontWeight:600 }}>{m.role}</p>
                  </div>
                </div>
                <p style={{ fontSize:13, color:C.muted, lineHeight:1.65, margin:0 }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding:"72px 24px", maxWidth:1040, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:C.purple, marginBottom:12, textTransform:"uppercase" }}>What We Believe</p>
          <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(28px,4vw,42px)", fontWeight:500, color:C.navy, margin:0, letterSpacing:"-0.03em" }}>
            Our <em style={{ fontStyle:"italic", color:C.purple }}>values.</em>
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }} className="values-grid">
          {[
            { n:"01", title:"Commerce should be accessible", desc:"The barrier to starting an online business should be zero — not a $300/month Shopify bill and a design degree." },
            { n:"02", title:"AI should do the work", desc:"You should not have to write product descriptions, optimize prices, or figure out abandoned carts manually. KIRO handles it." },
            { n:"03", title:"Sellers deserve transparency", desc:"No hidden fees. No confusing tiers. No bait-and-switch. What you see is what you pay." },
          ].map(v => (
            <div key={v.n} style={{ padding:28, borderRadius:20, background:"#fff", border:`1px solid ${C.border}` }}>
              <span style={{ fontSize:11, fontWeight:800, color:C.purple, letterSpacing:"0.1em", display:"block", marginBottom:12 }}>{v.n}</span>
              <h3 style={{ fontSize:16, fontWeight:700, color:C.navy, margin:"0 0 10px", letterSpacing:"-0.02em", lineHeight:1.3 }}>{v.title}</h3>
              <p style={{ fontSize:13, color:C.muted, lineHeight:1.65, margin:0 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"80px 24px", textAlign:"center", background:"linear-gradient(160deg,#2D1B69,#0D0625)" }}>
        <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(28px,5vw,48px)", fontWeight:500, color:"#fff", margin:"0 0 14px", letterSpacing:"-0.03em" }}>
          Join us.
        </h2>
        <p style={{ fontSize:16, color:"rgba(255,255,255,0.5)", marginBottom:36, maxWidth:400, margin:"0 auto 36px" }}>
          Thousands of merchants are launching stores with DropOS every week. Be next.
        </p>
        <Link href="/auth/register" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 32px", borderRadius:14, background:"#fff", color:C.navy, textDecoration:"none", fontSize:14, fontWeight:700, boxShadow:"0 8px 24px rgba(0,0,0,0.2)" }}>
          Start for free <ArrowRight size={14}/>
        </Link>
      </section>

      <style>{`
        @media(max-width:768px){
          .about-grid,.team-grid{grid-template-columns:1fr!important;}
          .values-grid{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
}
