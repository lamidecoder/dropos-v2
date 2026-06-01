import Link from "next/link";
import { ArrowRight, Zap, Globe, TrendingUp, Heart } from "lucide-react";
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
      <section style={{ padding:"80px 24px 64px", textAlign:"center", maxWidth:720, margin:"0 auto" }}>
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:C.purple, marginBottom:12, textTransform:"uppercase" }}>ABOUT DROPOS</p>
        <h1 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(36px,6vw,60px)", fontWeight:500, letterSpacing:"-0.04em", color:C.navy, margin:"0 0 20px", lineHeight:1.08 }}>
          Commerce should be<br/><em style={{ fontStyle:"italic", color:C.purple }}>easy for everyone.</em>
        </h1>
        <p style={{ fontSize:17, color:C.muted, lineHeight:1.7, maxWidth:540, margin:"0 auto" }}>
          We built DropOS because starting an online business should be about ideas and hustle — not tech knowledge or expensive subscriptions.
        </p>
      </section>

      {/* Story */}
      <section style={{ maxWidth:1040, margin:"0 auto", padding:"0 24px 80px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }} className="about-grid">
        <div>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:C.purple, marginBottom:14, textTransform:"uppercase" }}>Our Story</p>
          <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(26px,4vw,38px)", fontWeight:500, color:C.navy, margin:"0 0 18px", letterSpacing:"-0.03em", lineHeight:1.15 }}>
            We watched too many great sellers quit because of the tools.
          </h2>
          <p style={{ fontSize:15, color:C.muted, lineHeight:1.7, marginBottom:14 }}>
            In markets across Lagos, Accra, Nairobi and London — talented people with great products were losing to sellers with better software. Not better products. Not more hustle. Just better tools.
          </p>
          <p style={{ fontSize:15, color:C.muted, lineHeight:1.7 }}>
            DropOS started as a question: what if the software did the work? What if instead of learning 47 settings, you just described your business and your store was ready in 60 seconds? That's KIRO. That's DropOS.
          </p>
        </div>

        {/* Visual story */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {[
            { emoji:"🌍", title:"Built global from day one", desc:"Designed for sellers everywhere. Naira, Pounds, Dollars — all native." },
            { emoji:"🤖", title:"AI does the hard work", desc:"KIRO writes, prices, fulfils and grows. You sell." },
            { emoji:"💸", title:"Prices that make sense", desc:"Not $79/month. Plans that work whether you're starting out or scaling." },
            { emoji:"🔒", title:"Your data stays yours", desc:"We never sell it, share it, or use it to train anything without you." },
          ].map(v => (
            <div key={v.title} style={{ padding:20, borderRadius:16, background:"#fff", border:`1px solid ${C.border}`, display:"flex", gap:14, alignItems:"flex-start" }}>
              <span style={{ fontSize:24, lineHeight:1, flexShrink:0 }}>{v.emoji}</span>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:C.navy, margin:"0 0 4px" }}>{v.title}</p>
                <p style={{ fontSize:13, color:C.muted, margin:0, lineHeight:1.5 }}>{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission stat strip */}
      <section style={{ background:"#fff", borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:"64px 24px" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:40, textAlign:"center" }} className="mission-grid">
          {[
            { n:"60s",  l:"To launch a store",       sub:"From signup to live" },
            { n:"50+",  l:"Currencies accepted",      sub:"Sell to anyone, anywhere" },
            { n:"24/7", l:"KIRO never sleeps",        sub:"Your store always has support" },
          ].map(s => (
            <div key={s.l}>
              <p style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(36px,5vw,52px)", fontWeight:500, color:C.navy, margin:"0 0 6px", letterSpacing:"-0.04em" }}>{s.n}</p>
              <p style={{ fontSize:14, fontWeight:700, color:C.navy, margin:"0 0 4px" }}>{s.l}</p>
              <p style={{ fontSize:12, color:C.muted, margin:0 }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section style={{ padding:"72px 24px", maxWidth:1040, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:C.purple, marginBottom:12, textTransform:"uppercase" }}>What We Believe</p>
          <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(28px,4vw,42px)", fontWeight:500, color:C.navy, margin:0, letterSpacing:"-0.03em" }}>
            Three things that<br/><em style={{ fontStyle:"italic", color:C.purple }}>drive everything we build.</em>
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }} className="values-grid">
          {[
            { icon:Globe,      color:"#6B35E8", n:"01", title:"Commerce should be accessible", desc:"The barrier to starting an online business should be zero — not an expensive monthly bill and a design degree." },
            { icon:Zap,        color:"#0EA5E9", n:"02", title:"AI should do the work",          desc:"You should never have to write a product description or figure out abandoned carts manually. KIRO handles it." },
            { icon:Heart,      color:"#EF4444", n:"03", title:"Sellers deserve honesty",         desc:"No hidden fees. No confusing tiers. No dark patterns. What you see is exactly what you pay." },
          ].map(v => (
            <div key={v.n} style={{ padding:28, borderRadius:20, background:"#fff", border:`1px solid ${C.border}` }}>
              <div style={{ width:40, height:40, borderRadius:11, background:`${v.color}10`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                <v.icon size={18} color={v.color}/>
              </div>
              <span style={{ fontSize:11, fontWeight:800, color:C.purple, letterSpacing:"0.1em", display:"block", marginBottom:10 }}>{v.n}</span>
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
        <p style={{ fontSize:16, color:"rgba(255,255,255,0.5)", marginBottom:36, maxWidth:380, margin:"0 auto 36px" }}>
          Build the business you always wanted. Start today, grow at your own pace.
        </p>
        <Link href="/auth/register" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 32px", borderRadius:14, background:"#fff", color:C.navy, textDecoration:"none", fontSize:14, fontWeight:700, boxShadow:"0 8px 24px rgba(0,0,0,0.2)" }}>
          Start for free <ArrowRight size={14}/>
        </Link>
      </section>

      <style>{`
        @media(max-width:768px){ .about-grid,.mission-grid,.values-grid{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
}
