import Link from "next/link";
import { ArrowRight, Check, Zap, ShoppingBag, BarChart3, Truck, Globe, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features — DropOS",
  description: "Everything you need to launch, run and grow a successful online store. Powered by KIRO AI.",
};

const C = { navy:"#130D2E", purple:"#6B35E8", muted:"rgba(19,13,46,0.5)", border:"rgba(107,53,232,0.1)", faint:"rgba(107,53,232,0.04)" };

const SECTIONS = [
  {
    icon: Zap, color:"#7C3AED",
    eyebrow: "AI that works for you",
    title: "KIRO handles the work.\nYou handle the growth.",
    desc: "Most platforms give you tools and leave you to figure it out. KIRO actually does things — it writes your product descriptions, spots which products are selling before you notice, runs your flash sales, and tells you exactly what to do every morning.",
    points: [
      "Build a complete store from one sentence",
      "Write product descriptions and ad copy",
      "Find trending products before they peak",
      "Manage orders and customer messages",
      "Revenue forecasting and daily insights",
      "Generate TikTok and Instagram scripts",
    ],
    cta: "Try KIRO free",
    ctaHref: "/auth/register",
    reverse: false,
  },
  {
    icon: ShoppingBag, color:"#0EA5E9",
    eyebrow: "Source from anywhere",
    title: "Import any product.\nFrom any supplier.",
    desc: "See something selling on AliExpress, Temu, or Amazon? Paste the link. KIRO imports the product, rewrites the description in your brand voice, and sets a price that makes you money. No spreadsheets, no supplier calls.",
    points: [
      "Import from AliExpress, Temu, Amazon",
      "Automatic product description rewrite",
      "Smart margin pricing suggestions",
      "Bulk import entire supplier catalogues",
      "Automatic stock monitoring",
    ],
    cta: "Start importing",
    ctaHref: "/auth/register",
    reverse: true,
  },
  {
    icon: Globe, color:"#10B981",
    eyebrow: "Get paid, always",
    title: "Accept payments\nanywhere in the world.",
    desc: "Your customers can pay by card, bank transfer, or USSD in Naira. International customers pay in their own currency via card. All of it just works — no technical setup, no payment processor drama.",
    points: [
      "Card, bank transfer, USSD in Naira",
      "International card payments",
      "50+ currencies supported",
      "Instant settlement to your account",
      "No hidden gateway fees",
    ],
    cta: "See pricing",
    ctaHref: "/pricing",
    reverse: false,
  },
  {
    icon: BarChart3, color:"#F59E0B",
    eyebrow: "Know your numbers",
    title: "Analytics that tell you\nwhat to actually do.",
    desc: "Other platforms show you charts. KIRO reads the numbers and gives you a verdict: this product is dying, raise this price, these customers haven't bought in 45 days — and then offers to fix it for you with one click.",
    points: [
      "Revenue, orders, and conversion tracking",
      "KIRO-powered daily store brief",
      "Top and bottom performing products",
      "Abandoned cart value recovery",
      "Customer lifetime value insights",
    ],
    cta: "See it in action",
    ctaHref: "/auth/register",
    reverse: true,
  },
  {
    icon: Truck, color:"#EF4444",
    eyebrow: "Sell everywhere",
    title: "Your store.\nYour brand. Everywhere.",
    desc: "29 professional templates built for every niche. Custom domain. WhatsApp chat bubble. Announcement bars. Free shipping progress. Your store looks like a brand from day one, not a template.",
    points: [
      "29 professional store templates",
      "Custom domain support",
      "WhatsApp chat bubble for buyers",
      "Announcement bars and flash banners",
      "Free shipping progress bar in cart",
      "Mobile-optimised storefront",
    ],
    cta: "Browse templates",
    ctaHref: "/auth/register",
    reverse: false,
  },
];

export default function FeaturesPage() {
  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Hero */}
      <section style={{ padding:"80px 24px 56px", textAlign:"center", maxWidth:680, margin:"0 auto" }}>
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:C.purple, marginBottom:12, textTransform:"uppercase" }}>FEATURES</p>
        <h1 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(36px,6vw,60px)", fontWeight:500, letterSpacing:"-0.04em", color:C.navy, margin:"0 0 18px", lineHeight:1.08 }}>
          Everything you need.<br/>
          <em style={{ fontStyle:"italic", color:C.purple }}>Nothing you don't.</em>
        </h1>
        <p style={{ fontSize:17, color:C.muted, maxWidth:520, margin:"0 auto 32px", lineHeight:1.65 }}>
          One platform. No plugins. No extra fees. KIRO handles the hard parts so you can focus on selling.
        </p>
        <Link href="/auth/register" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:12, background:C.navy, color:"#fff", textDecoration:"none", fontSize:14, fontWeight:700, boxShadow:"0 6px 20px rgba(19,13,46,0.18)" }}>
          Start free <ArrowRight size={14}/>
        </Link>
      </section>

      {/* Feature sections — alternating layout */}
      {SECTIONS.map((s, i) => {
        const Icon = s.icon;
        return (
          <section key={s.eyebrow} style={{ maxWidth:1040, margin:"0 auto", padding:"72px 24px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center", direction:s.reverse?"rtl":"ltr" }} className="feat-row">
            {/* Text */}
            <div style={{ direction:"ltr" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`${s.color}12`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon size={16} color={s.color}/>
                </div>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:"0.1em", color:s.color, textTransform:"uppercase" }}>{s.eyebrow}</p>
              </div>
              <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(26px,3.5vw,40px)", fontWeight:500, color:C.navy, margin:"0 0 16px", letterSpacing:"-0.03em", lineHeight:1.15, whiteSpace:"pre-line" }}>
                {s.title}
              </h2>
              <p style={{ fontSize:15, color:C.muted, lineHeight:1.7, margin:"0 0 24px" }}>{s.desc}</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
                {s.points.map(p => (
                  <div key={p} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Check size={14} color={s.color} strokeWidth={2.5}/>
                    <span style={{ fontSize:14, color:C.navy, fontWeight:500 }}>{p}</span>
                  </div>
                ))}
              </div>
              <Link href={s.ctaHref} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 22px", borderRadius:12, background:C.navy, color:"#fff", textDecoration:"none", fontSize:13, fontWeight:700 }}>
                {s.cta} <ArrowRight size={13}/>
              </Link>
            </div>

            {/* Visual */}
            <div style={{ direction:"ltr" }}>
              <div style={{
                aspectRatio:"4/3", borderRadius:20,
                background:`linear-gradient(135deg,${s.color}06,${s.color}14)`,
                border:`1px solid ${s.color}18`,
                display:"flex", alignItems:"center", justifyContent:"center",
                position:"relative", overflow:"hidden",
              }}>
                <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:`${s.color}08`, filter:"blur(40px)" }}/>
                <div style={{ textAlign:"center", position:"relative", zIndex:1 }}>
                  <div style={{ width:72, height:72, borderRadius:22, background:`${s.color}18`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                    <Icon size={32} color={s.color}/>
                  </div>
                  <p style={{ fontSize:11, fontWeight:700, color:`${s.color}80`, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                    {s.eyebrow}
                  </p>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Final CTA */}
      <section style={{ padding:"80px 24px", textAlign:"center", background:"linear-gradient(160deg,#2D1B69,#0D0625)", margin:"40px 0 0" }}>
        <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(28px,5vw,48px)", fontWeight:500, color:"#fff", margin:"0 0 14px", letterSpacing:"-0.03em" }}>
          Ready to start?
        </h2>
        <p style={{ fontSize:16, color:"rgba(255,255,255,0.55)", marginBottom:36 }}>
          Free forever. No card needed.
        </p>
        <Link href="/auth/register" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 32px", borderRadius:14, background:"#fff", color:C.navy, textDecoration:"none", fontSize:14, fontWeight:700, boxShadow:"0 8px 24px rgba(0,0,0,0.2)" }}>
          Launch your store free <ArrowRight size={14}/>
        </Link>
      </section>

      <style>{`
        @media(max-width:768px){ .feat-row{grid-template-columns:1fr!important;direction:ltr!important;padding:48px 24px!important;gap:32px!important;} }
      `}</style>
    </div>
  );
}
