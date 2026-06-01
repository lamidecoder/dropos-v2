import Link from "next/link";
import { ArrowRight, Zap, Package, Store, BarChart3, MessageSquare, Globe, Shield, TrendingUp, Check, Sparkles, ShoppingCart, Mail, Tag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features — DropOS",
  description: "Every feature you need to build and run a successful online store. Powered by KIRO AI.",
};

const C = { navy:"#130D2E", purple:"#6B35E8", muted:"rgba(19,13,46,0.5)", border:"rgba(107,53,232,0.1)", faint:"rgba(107,53,232,0.04)" };

const FEATURES = [
  {
    icon: Sparkles, color:"#7C3AED",
    title:"KIRO AI — your commerce brain",
    desc:"22 slash commands, proactive opportunity alerts, daily brief, product description generator, flash sale automation, and abandoned cart recovery. All from a single chat.",
    highlights:["22 slash commands","Daily store brief","Opportunity engine","Writes your ad copy","Recovers abandoned carts"],
  },
  {
    icon: Package, color:"#0EA5E9",
    title:"One-click product import",
    desc:"Paste any URL from AliExpress, Temu, Amazon, or CJDropshipping. KIRO scores products A–F, rewrites descriptions, and sets prices with healthy margins automatically.",
    highlights:["AliExpress & Temu","Amazon import","A–F quality scoring","Auto-pricing","Bulk import"],
  },
  {
    icon: Store, color:"#10B981",
    title:"29 store templates",
    desc:"Beautiful, mobile-optimised templates for every niche — fashion, electronics, beauty, kids, food, and more. Customise colours and branding in seconds.",
    highlights:["29 templates","Fashion, beauty, tech","Mobile optimised","Custom domain","Full cart & checkout"],
  },
  {
    icon: ShoppingCart, color:"#F59E0B",
    title:"Complete checkout flow",
    desc:"Full buyer journey from product discovery to payment confirmation. Cart drawer with free shipping progress, variant selection, and order tracking built in.",
    highlights:["Cart with quantity controls","Free shipping progress bar","Variant badges","Order tracking page","Guest checkout"],
  },
  {
    icon: BarChart3, color:"#EF4444",
    title:"Smart analytics",
    desc:"Revenue, orders, conversion rate, top products, customer behaviour. KIRO reads your numbers and tells you exactly what to do about them — not just what happened.",
    highlights:["Revenue analytics","Product performance","Customer insights","Conversion tracking","KIRO-powered insights"],
  },
  {
    icon: Globe, color:"#8B5CF6",
    title:"Paystack + Stripe payments",
    desc:"Accept Naira via Paystack (card, bank transfer, USSD). Accept international cards via Stripe. Both fully integrated — no code, no configuration needed.",
    highlights:["Paystack (₦ payments)","Stripe (global cards)","Bank transfer & USSD","Instant settlement","0% transaction fee on Growth+"],
  },
  {
    icon: Tag, color:"#F97316",
    title:"Promotions engine",
    desc:"Flash sales with countdown timers, discount codes, BOGO offers, free shipping thresholds, and gift cards — all manageable from a single dashboard.",
    highlights:["Flash sale with countdown","Discount codes","BOGO offers","Free shipping threshold","Gift cards"],
  },
  {
    icon: Mail, color:"#14B8A6",
    title:"Email & marketing campaigns",
    desc:"KIRO writes your email campaigns. Send abandoned cart recovery, win-back campaigns, flash sale announcements, and product launches automatically.",
    highlights:["KIRO-written emails","Abandoned cart recovery","Win-back campaigns","Flash sale blasts","WhatsApp broadcasts"],
  },
  {
    icon: Shield, color:"#64748B",
    title:"Security & reliability",
    desc:"SSL on every store, encrypted payments, GDPR-compliant data handling, and 99.9% uptime backed by Vercel's global edge network.",
    highlights:["SSL everywhere","GDPR compliant","Vercel Edge network","Encrypted payments","Regular backups"],
  },
];

export default function FeaturesPage() {
  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Hero */}
      <section style={{ textAlign:"center", padding:"80px 24px 64px", maxWidth:700, margin:"0 auto" }}>
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:C.purple, marginBottom:12, textTransform:"uppercase" }}>FEATURES</p>
        <h1 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(36px,6vw,60px)", fontWeight:500, letterSpacing:"-0.04em", color:C.navy, margin:"0 0 18px", lineHeight:1.08 }}>
          Everything you need.<br/><em style={{ fontStyle:"italic", color:C.purple }}>Nothing you don't.</em>
        </h1>
        <p style={{ fontSize:17, color:C.muted, maxWidth:500, margin:"0 auto 32px", lineHeight:1.65 }}>
          One platform. No plugins. No extra fees for basic features. KIRO handles the work so you focus on selling.
        </p>
        <Link href="/auth/register" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"13px 28px", borderRadius:12, background:C.navy, color:"#fff", textDecoration:"none", fontSize:14, fontWeight:700, boxShadow:"0 6px 20px rgba(19,13,46,0.18)" }}>
          Start free <ArrowRight size={14}/>
        </Link>
      </section>

      {/* Feature grid */}
      <section style={{ maxWidth:1080, margin:"0 auto", padding:"0 24px 80px", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }} className="feat-grid">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={f.title} style={{ background:"#fff", borderRadius:20, padding:28, border:`1px solid ${C.border}`, boxShadow:"0 2px 16px rgba(107,53,232,0.04)" }}>
              <div style={{ width:44, height:44, borderRadius:13, background:`${f.color}10`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                <Icon size={20} color={f.color}/>
              </div>
              <h2 style={{ fontSize:15, fontWeight:800, color:C.navy, margin:"0 0 10px", letterSpacing:"-0.02em", lineHeight:1.3 }}>{f.title}</h2>
              <p style={{ fontSize:13, color:C.muted, lineHeight:1.65, margin:"0 0 16px" }}>{f.desc}</p>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {f.highlights.map(h => (
                  <div key={h} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <Check size={11} color={f.color} strokeWidth={2.5}/>
                    <span style={{ fontSize:12, color:C.muted, fontWeight:500 }}>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Comparison vs Shopify */}
      <section style={{ background:"#fff", borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:"72px 24px" }}>
        <div style={{ maxWidth:780, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(28px,4vw,44px)", fontWeight:500, color:C.navy, margin:"0 0 14px", letterSpacing:"-0.03em" }}>
              Why not <em style={{ fontStyle:"italic", color:C.purple }}>Shopify?</em>
            </h2>
            <p style={{ fontSize:15, color:C.muted, maxWidth:480, margin:"0 auto" }}>
              Shopify charges $79/month and then $5–$20 extra for every basic feature. DropOS includes everything from day one.
            </p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:2 }}>
            {/* Header */}
            {["Feature","Shopify","DropOS"].map((h, i) => (
              <div key={h} style={{ padding:"12px 20px", background: i===2?"rgba(107,53,232,0.06)":C.faint, borderRadius: i===0?"12px 0 0 0":i===2?"0 12px 0 0":"0", border:`1px solid ${C.border}`, textAlign:"center" }}>
                <span style={{ fontSize:12, fontWeight:800, color:i===2?C.purple:C.navy, letterSpacing:"-0.01em" }}>{h}</span>
              </div>
            ))}
            {[
              ["AI commerce assistant", "❌ None", "✅ KIRO — full AI"],
              ["Product import from suppliers", "💰 $9.99/mo app", "✅ Included"],
              ["Auto-fulfillment", "💰 $29/mo app", "✅ Included"],
              ["Abandoned cart recovery", "💰 $19/mo app", "✅ Included"],
              ["Email campaigns", "💰 $30/mo app", "✅ Included"],
              ["Analytics", "✅ Basic", "✅ + KIRO insights"],
              ["Custom domain", "💰 Extra", "✅ Included"],
              ["Price in local currency", "❌ USD only", "✅ NGN/GBP/USD/GHS"],
            ].map(([feat, shopify, dropos]) => (
              [feat, shopify, dropos].map((cell, ci) => (
                <div key={`${feat}-${ci}`} style={{ padding:"13px 20px", background:ci===2?"rgba(107,53,232,0.03)":"#fff", border:`1px solid ${C.border}`, textAlign:"center" }}>
                  <span style={{ fontSize:13, color:ci===0?C.navy:ci===2?C.purple:C.muted, fontWeight:ci===0?600:500 }}>{cell}</span>
                </div>
              ))
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"80px 24px", textAlign:"center", background:"linear-gradient(160deg,#2D1B69,#0D0625)" }}>
        <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(28px,5vw,48px)", fontWeight:500, color:"#fff", margin:"0 0 14px", letterSpacing:"-0.03em" }}>
          Ready to build?
        </h2>
        <p style={{ fontSize:16, color:"rgba(255,255,255,0.5)", marginBottom:36 }}>Free plan. No card needed. Launch in 60 seconds.</p>
        <Link href="/auth/register" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 32px", borderRadius:14, background:"#fff", color:C.navy, textDecoration:"none", fontSize:14, fontWeight:700, boxShadow:"0 8px 24px rgba(0,0,0,0.2)" }}>
          Start for free <ArrowRight size={14}/>
        </Link>
      </section>

      <style>{`@media(max-width:768px){ .feat-grid{grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
}
