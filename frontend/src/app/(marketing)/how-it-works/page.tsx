import Link from "next/link";
import { ArrowRight, Zap, Package, Store, TrendingUp, Check } from "lucide-react";

const C = { bg:"#F4F2FB", navy:"#130D2E", purple:"#6B35E8", muted:"rgba(19,13,46,0.5)", border:"rgba(107,53,232,0.1)", faint:"rgba(107,53,232,0.04)" };

const STEPS = [
  {
    n:1, icon:Store, color:"#6B35E8",
    title:"Create your account",
    desc:"Sign up in 30 seconds. Pick your niche, choose a store template, and your store is live immediately — no design skills needed.",
    details:["Choose from 29 industry templates","Custom domain (your own brand)","Mobile-optimised storefront","Full KIRO AI from day one"],
  },
  {
    n:2, icon:Package, color:"#0EA5E9",
    title:"Import products instantly",
    desc:"Paste any product URL from AliExpress, Temu, Amazon, or CJDropshipping. KIRO scores it A–F, rewrites the description, and sets a profitable price.",
    details:["Paste any supplier URL","KIRO grades every product A–F","Auto-pricing for healthy margins","Bulk import entire stores"],
  },
  {
    n:3, icon:Zap, color:"#10B981",
    title:"KIRO runs your store",
    desc:"KIRO monitors your store 24/7. It alerts you to opportunities, writes your marketing copy, and handles customer queries — automatically.",
    details:["Daily revenue insights","Flash sale automation","Abandoned cart recovery","Product description writing"],
  },
  {
    n:4, icon:TrendingUp, color:"#F59E0B",
    title:"Get paid, grow fast",
    desc:"Accept payments via Paystack (card, bank transfer, USSD) and Stripe. Money hits your account directly — no middleman, no delay.",
    details:["Paystack for local payments","Stripe for international orders","Automatic order fulfilment via CJ","Real-time revenue tracking"],
  },
];

export default function HowItWorksPage() {
  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Hero */}
      <section style={{ padding:"80px 24px 60px", textAlign:"center", maxWidth:680, margin:"0 auto" }}>
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:C.purple, marginBottom:12, textTransform:"uppercase" }}>HOW IT WORKS</p>
        <h1 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(36px,6vw,56px)", fontWeight:500, letterSpacing:"-0.04em", color:C.navy, margin:"0 0 16px", lineHeight:1.08 }}>
          From zero to<br/><em style={{ fontStyle:"italic", color:C.purple }}>first sale.</em>
        </h1>
        <p style={{ fontSize:16, color:C.muted, margin:"0 auto", lineHeight:1.6, maxWidth:460 }}>
          Four steps. Sixty seconds to launch. Everything else runs itself.
        </p>
      </section>

      {/* Steps */}
      <section style={{ maxWidth:900, margin:"0 auto", padding:"0 24px 80px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.n} style={{
                display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, alignItems:"center",
                padding:"56px 48px", background:"#fff", borderRadius:24,
                border:`1px solid ${C.border}`, boxShadow:"0 2px 16px rgba(107,53,232,0.04)",
                direction: idx%2===1?"rtl":"ltr",
              }} className="step-row">
                {/* Text */}
                <div style={{ direction:"ltr" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:`${step.color}12`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon size={18} color={step.color}/>
                    </div>
                    <span style={{ fontSize:11, fontWeight:800, letterSpacing:"0.1em", color:step.color, textTransform:"uppercase" }}>Step {step.n}</span>
                  </div>
                  <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(24px,3.5vw,34px)", fontWeight:500, color:C.navy, margin:"0 0 14px", letterSpacing:"-0.03em", lineHeight:1.15 }}>
                    {step.title}
                  </h2>
                  <p style={{ fontSize:15, color:C.muted, lineHeight:1.65, margin:"0 0 24px" }}>{step.desc}</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {step.details.map(d => (
                      <div key={d} style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <Check size={13} color={step.color} strokeWidth={2.5}/>
                        <span style={{ fontSize:13, color:C.muted, fontWeight:500 }}>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual */}
                <div style={{ direction:"ltr" }}>
                  <div style={{
                    aspectRatio:"4/3", borderRadius:20,
                    background:`linear-gradient(135deg,${step.color}08,${step.color}18)`,
                    border:`1px solid ${step.color}20`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ width:80, height:80, borderRadius:24, background:`${step.color}15`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                        <Icon size={36} color={step.color}/>
                      </div>
                      <span style={{ fontSize:32, fontWeight:900, color:step.color, display:"block", lineHeight:1 }}>0{step.n}</span>
                      <span style={{ fontSize:12, color:`${step.color}80`, fontWeight:600, marginTop:4, display:"block" }}>{step.title}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section style={{ background:"#fff", padding:"64px 24px", borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:800, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:32, textAlign:"center" }} className="stats-g">
          {[
            { n:"60s",   l:"To launch a store"   },
            { n:"29",    l:"Store templates"      },
            { n:"22",    l:"KIRO commands"         },
            { n:"50+",   l:"Payment currencies"   },
          ].map(s => (
            <div key={s.l}>
              <p style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(32px,5vw,48px)", fontWeight:500, color:C.navy, margin:"0 0 6px", letterSpacing:"-0.04em" }}>{s.n}</p>
              <p style={{ fontSize:13, color:C.muted, margin:0 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"80px 24px", textAlign:"center", background:"linear-gradient(160deg,#2D1B69,#0D0625)" }}>
        <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(28px,5vw,48px)", fontWeight:500, color:"#fff", margin:"0 0 14px", letterSpacing:"-0.03em" }}>
          Ready to see it live?
        </h2>
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", marginBottom:36 }}>Your store is 60 seconds away. Free forever.</p>
        <Link href="/auth/register" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 32px", borderRadius:14, background:"#fff", color:C.navy, textDecoration:"none", fontSize:14, fontWeight:700, boxShadow:"0 8px 24px rgba(0,0,0,0.2)" }}>
          Launch your store free <ArrowRight size={14}/>
        </Link>
      </section>

      <style>{`
        @media(max-width:768px){ .step-row{grid-template-columns:1fr!important;direction:ltr!important;padding:32px 24px!important;} .stats-g{grid-template-columns:1fr 1fr!important;} }
      `}</style>
    </div>
  );
}
