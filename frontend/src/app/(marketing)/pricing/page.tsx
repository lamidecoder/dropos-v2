"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, X, ArrowRight, Zap } from "lucide-react";

const C = { bg:"#F4F2FB", navy:"#130D2E", purple:"#6B35E8", muted:"rgba(19,13,46,0.5)", border:"rgba(107,53,232,0.1)", faint:"rgba(107,53,232,0.04)" };

const CURRENCIES: Record<string,{symbol:string;growth:number;pro:number;locale:string}> = {
  NGN: { symbol:"₦", growth:9500,   pro:25000,  locale:"en-NG" },
  USD: { symbol:"$", growth:6,      pro:16,     locale:"en-US" },
  GBP: { symbol:"£", growth:5,      pro:14,     locale:"en-GB" },
  GHS: { symbol:"₵", growth:89,     pro:240,    locale:"en-GH" },
  KES: { symbol:"KSh",growth:1300,  pro:3500,   locale:"en-KE" },
};

function detectCurrency(): string {
  if(typeof window==="undefined") return "USD";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if(tz.includes("Lagos")||tz.includes("Abuja")) return "NGN";
    if(tz.includes("Accra")) return "GHS";
    if(tz.includes("Nairobi")) return "KES";
    if(tz.includes("London")) return "GBP";
  } catch {}
  return "USD";
}

function fmt(n:number, code:string) {
  const c = CURRENCIES[code];
  return `${c.symbol}${n.toLocaleString()}`;
}

export default function PricingPage() {
  const [currency, setCurrency] = useState("USD");
  const [annual, setAnnual] = useState(false);
  useEffect(()=>{ setCurrency(detectCurrency()); },[]);

  const cur = CURRENCIES[currency];
  const mult = annual ? 0.8 : 1;

  const plans = [
    {
      name:"Free", tag:"Try it, no commitment.",
      price:"0", period:"/mo",
      cta:"Start free", ctaHref:"/auth/register", highlight:false,
      features:[
        {t:"1 store",ok:true},{t:"20 products",ok:true},
        {t:"KIRO — 10 messages/day",ok:true},{t:"Basic analytics",ok:true},
        {t:"Paystack payments",ok:true},{t:"2% transaction fee",ok:false},
        {t:"Custom domain",ok:false},{t:"Email campaigns",ok:false},
      ],
    },
    {
      name:"Growth", tag:"For serious sellers.",
      price:Math.round(cur.growth*mult).toLocaleString(), period:"/mo",
      trial:"14-day free trial",
      cta:"Start 14-day trial", ctaHref:"/auth/register", highlight:true,
      features:[
        {t:"5 stores",ok:true},{t:"Unlimited products",ok:true},
        {t:"Full KIRO — unlimited",ok:true},{t:"Full analytics",ok:true},
        {t:"Paystack + Stripe",ok:true},{t:"0% transaction fee",ok:true},
        {t:"Custom domain",ok:true},{t:"Coupons & flash sales",ok:true},
        {t:"Abandoned cart recovery",ok:true},{t:"Email campaigns",ok:true},
      ],
    },
    {
      name:"Pro", tag:"Fully automated business.",
      price:Math.round(cur.pro*mult).toLocaleString(), period:"/mo",
      cta:"Start Pro", ctaHref:"/auth/register", highlight:false,
      features:[
        {t:"Unlimited stores",ok:true},{t:"Everything in Growth",ok:true},
        {t:"KIRO Pro intelligence",ok:true},{t:"API access",ok:true},
        {t:"3 staff accounts",ok:true},{t:"Priority support (2hr)",ok:true},
        {t:"20% referral commissions",ok:true},{t:"White label option",ok:true},
      ],
    },
  ];

  const faqs = [
    ["Can I change plans anytime?","Yes. Upgrade or downgrade any time from your billing settings. Changes take effect immediately."],
    ["Is there a free trial?","The Growth plan comes with a 14-day free trial. No card required to start."],
    ["What is the 2% transaction fee?","On the Free plan, DropOS takes 2% of every order value. Growth and Pro plans have 0% transaction fees — you keep everything."],
    ["Do you support currencies other than NGN?","Yes. DropOS supports 50+ currencies. Accept Naira, Pounds, Dollars, Cedis, and more."],
    ["Can I cancel anytime?","Yes. Cancel from your dashboard with no penalties. You keep access until the end of your billing period."],
    ["What payment methods do you support?","Paystack (card, bank transfer, USSD) for African payments. Stripe for international card payments."],
  ];

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Hero */}
      <section style={{ padding:"80px 24px 60px", textAlign:"center", maxWidth:700, margin:"0 auto" }}>
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:C.purple, marginBottom:12, textTransform:"uppercase" }}>PRICING</p>
        <h1 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(36px,6vw,56px)", fontWeight:500, letterSpacing:"-0.04em", color:C.navy, margin:"0 0 16px", lineHeight:1.08 }}>
          Simple, honest<br/><em style={{ fontStyle:"italic", color:C.purple }}>pricing.</em>
        </h1>
        <p style={{ fontSize:16, color:C.muted, maxWidth:420, margin:"0 auto 32px", lineHeight:1.6 }}>
          No hidden fees. No lock-in. Start free and grow at your pace.
        </p>

        {/* Toggles */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, flexWrap:"wrap" }}>
          {/* Currency selector */}
          <div style={{ display:"flex", background:"#fff", borderRadius:10, padding:4, border:`1px solid ${C.border}`, gap:2 }}>
            {Object.keys(CURRENCIES).map(c => (
              <button key={c} onClick={()=>setCurrency(c)}
                style={{ padding:"6px 12px", borderRadius:7, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit", background:currency===c ? C.navy : "transparent", color:currency===c ? "#fff" : C.muted, transition:"all 0.15s" }}>
                {c}
              </button>
            ))}
          </div>
          {/* Annual toggle */}
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", borderRadius:10, padding:"8px 14px", border:`1px solid ${C.border}` }}>
            <span style={{ fontSize:12, fontWeight:600, color:C.muted }}>Monthly</span>
            <button onClick={()=>setAnnual(!annual)}
              style={{ width:40, height:22, borderRadius:11, border:"none", cursor:"pointer", background:annual?C.purple:"rgba(19,13,46,0.12)", position:"relative", transition:"background 0.2s", padding:0 }}>
              <div style={{ position:"absolute", top:3, left:annual?21:3, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.15)" }}/>
            </button>
            <span style={{ fontSize:12, fontWeight:600, color:annual?C.purple:C.muted }}>Annual <span style={{ background:"rgba(107,53,232,0.1)", color:C.purple, padding:"1px 6px", borderRadius:4, fontSize:10, fontWeight:700 }}>-20%</span></span>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section style={{ maxWidth:1040, margin:"0 auto", padding:"0 24px 80px", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }} className="plans-grid">
        {plans.map(plan => (
          <div key={plan.name} style={{
            background:plan.highlight?"linear-gradient(160deg,#2D1B69,#1A0B4A)":"#fff",
            borderRadius:20, padding:"32px 28px",
            border:plan.highlight?"1px solid rgba(196,181,253,0.3)":`1px solid ${C.border}`,
            position:"relative",
            boxShadow:plan.highlight?"0 20px 60px rgba(45,27,105,0.25)":"0 2px 16px rgba(107,53,232,0.06)",
          }}>
            {plan.highlight && (
              <div style={{ position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)", background:"#C4B5FD", color:"#130D2E", fontSize:10, fontWeight:800, padding:"4px 16px", borderRadius:99, whiteSpace:"nowrap", letterSpacing:"0.06em" }}>
                MOST POPULAR
              </div>
            )}
            <p style={{ fontSize:20, fontWeight:800, color:plan.highlight?"#fff":C.navy, margin:"0 0 4px", letterSpacing:"-0.02em" }}>{plan.name}</p>
            <p style={{ fontSize:13, color:plan.highlight?"rgba(255,255,255,0.55)":C.muted, margin:"0 0 20px" }}>{plan.tag}</p>
            <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:4 }}>
              <span style={{ fontSize:13, fontWeight:700, color:plan.highlight?"rgba(255,255,255,0.6)":C.muted }}>{cur.symbol}</span>
              <span style={{ fontSize:40, fontWeight:900, color:plan.highlight?"#fff":C.navy, letterSpacing:"-0.04em" }}>{plan.price}</span>
              <span style={{ fontSize:13, color:plan.highlight?"rgba(255,255,255,0.4)":C.muted }}>{plan.period}</span>
            </div>
            {plan.trial && <p style={{ fontSize:12, color:"#A78BFA", fontWeight:700, margin:"0 0 20px" }}>{plan.trial}</p>}
            {!plan.trial && <div style={{ height:20, marginBottom:20 }}/>}

            <div style={{ borderTop:`1px solid ${plan.highlight?"rgba(255,255,255,0.1)":C.border}`, paddingTop:20, marginBottom:24 }}>
              {plan.features.map(f => (
                <div key={f.t} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  {f.ok
                    ? <Check size={13} color={plan.highlight?"#A78BFA":C.purple} strokeWidth={2.5}/>
                    : <X size={13} color={plan.highlight?"rgba(255,255,255,0.2)":"rgba(19,13,46,0.2)"} strokeWidth={2}/>
                  }
                  <span style={{ fontSize:13, color:f.ok?(plan.highlight?"rgba(255,255,255,0.85)":C.navy):(plan.highlight?"rgba(255,255,255,0.3)":"rgba(19,13,46,0.3)"), textDecoration:f.ok?"none":"line-through" }}>
                    {f.t}
                  </span>
                </div>
              ))}
            </div>

            <Link href={plan.ctaHref} style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              padding:"13px 0", borderRadius:12, textDecoration:"none",
              fontSize:14, fontWeight:700,
              background:plan.highlight?"#fff":"transparent",
              color:plan.highlight?C.navy:C.navy,
              border:plan.highlight?"none":`1px solid ${C.border}`,
            }}>
              {plan.cta} {plan.highlight && <ArrowRight size={14}/>}
            </Link>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section style={{ maxWidth:720, margin:"0 auto", padding:"0 24px 100px" }}>
        <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(28px,4vw,40px)", fontWeight:500, color:C.navy, textAlign:"center", margin:"0 0 48px", letterSpacing:"-0.03em" }}>
          Common <em style={{ fontStyle:"italic", color:C.purple }}>questions</em>
        </h2>
        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
          {faqs.map(([q, a]) => (
            <details key={q} style={{ background:"#fff", borderRadius:14, border:`1px solid ${C.border}`, overflow:"hidden" }}>
              <summary style={{ padding:"18px 20px", fontSize:14, fontWeight:700, color:C.navy, cursor:"pointer", listStyle:"none", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                {q}
                <span style={{ color:C.purple, fontSize:18, fontWeight:400, flexShrink:0, marginLeft:12 }}>+</span>
              </summary>
              <div style={{ padding:"0 20px 18px", fontSize:14, color:C.muted, lineHeight:1.65 }}>{a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:"linear-gradient(160deg,#2D1B69,#0D0625)", padding:"80px 24px", textAlign:"center" }}>
        <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(28px,5vw,48px)", fontWeight:500, color:"#fff", margin:"0 0 16px", letterSpacing:"-0.03em" }}>
          Ready to start?
        </h2>
        <p style={{ fontSize:16, color:"rgba(255,255,255,0.55)", marginBottom:36 }}>Free forever. No card needed.</p>
        <Link href="/auth/register" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 32px", borderRadius:14, background:"#fff", color:C.navy, textDecoration:"none", fontSize:14, fontWeight:700, boxShadow:"0 8px 24px rgba(0,0,0,0.2)" }}>
          Start free <ArrowRight size={14}/>
        </Link>
      </section>

      <style>{`
        @media(max-width:768px){ .plans-grid{grid-template-columns:1fr!important;} }
        details summary::-webkit-details-marker{display:none}
        details[open] summary span{transform:rotate(45deg);}
        details summary span{transition:transform 0.2s;display:inline-block;}
      `}</style>
    </div>
  );
}
