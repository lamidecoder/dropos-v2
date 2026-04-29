import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "How it Works  -  DropOS",
  description: "See exactly how DropOS works. Your store live in 60 seconds, powered by KIRO.",
};

const STEPS = [
  {
    n:"01", emoji:"💬", color:"#8B5CF6",
    title:"Tell KIRO what you sell",
    desc:"Type one sentence. 'I want to sell hair products' is enough. KIRO handles everything from there.",
    detail:"No forms. No onboarding checklist. Just a conversation  -  the same way you describe your business to a friend.",
    bullets:["Works in English, French, Yoruba and 20+ languages","Understands niche and target market from context","Takes 15 seconds"],
  },
  {
    n:"02", emoji:"🏪", color:"#06B6D4",
    title:"KIRO builds your store",
    desc:"KIRO picks the right template, imports trending products, writes your descriptions, and configures payments.",
    detail:"Your store is live at yourname.droposhq.com within 60 seconds. Payments ready. Products loaded. Nothing to set up.",
    bullets:["20+ templates auto-selected for your niche","Products imported from AliExpress, CJ, Zendrop","Paystack and Stripe connected in one click"],
  },
  {
    n:"03", emoji:"📣", color:"#10B981",
    title:"Share your store",
    desc:"KIRO writes your first caption, TikTok script, and WhatsApp broadcast message. You just share it.",
    detail:"No marketing team needed. KIRO knows what works in your market and writes content that converts.",
    bullets:["TikTok scripts written in 10 seconds","Instagram captions with hashtags included","WhatsApp messages ready to paste"],
  },
  {
    n:"04", emoji:"📦", color:"#F59E0B",
    title:"Orders come in. KIRO handles them.",
    desc:"When a customer orders, KIRO places the order with your supplier, sends tracking, and keeps you updated.",
    detail:"You get paid instantly. The supplier ships to your customer. You never touch the product.",
    bullets:["Auto-fulfilment with AliExpress, CJ, Zendrop, Spocket","Customer gets tracking link automatically","Refunds and returns fully managed"],
  },
  {
    n:"05", emoji:"📊", color:"#EC4899",
    title:"KIRO grows your revenue",
    desc:"Every morning, KIRO briefs you on what happened and what to do next. In plain English.",
    detail:"Not charts you have to interpret. 'Your LED mask is trending  -  3 competitors are out of stock. Want me to run a flash sale?'",
    bullets:["Daily briefings via push notification or WhatsApp","Competitor monitoring and price alerts","Revenue forecasting 30 days ahead"],
  },
];

const HOW_PAID = [
  { emoji:"💳", title:"Customer pays you", desc:"Your customer pays via Paystack, Stripe, bank transfer, or Pay on Delivery. Money goes straight to your account  -  not held by DropOS." },
  { emoji:"📦", title:"KIRO orders from supplier", desc:"KIRO automatically places the order with your supplier using the supplier price  -  which is less than what your customer paid." },
  { emoji:"💰", title:"You keep the difference", desc:"Your profit is the gap between customer price and supplier cost. DropOS charges a small monthly subscription, not a cut of your sales." },
  { emoji:"🏦", title:"Payouts are instant", desc:"Paystack pays out to your Nigerian bank account within 1-3 business days. Stripe handles international payouts globally." },
];

export default function HowItWorksPage() {
  return (
    <div>
      <section className="text-center px-6 pb-16">
        <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color:"#8B5CF6" }}>How it Works</p>
        <h1 className="font-black mb-5" style={{ fontSize:"clamp(32px,5vw,56px)", letterSpacing:"-2px", color:"var(--text-primary)" }}>
          From idea to first sale.
        </h1>
        <p className="text-base max-w-xl mx-auto mb-8" style={{ color:"var(--text-secondary)" }}>
          No experience. No tech skills. No inventory. KIRO handles everything.
        </p>
        <Link href="/auth/register">
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", boxShadow:"0 8px 24px rgba(107,53,232,0.35)" }}>
            Start free now <ArrowRight size={14}/>
          </button>
        </Link>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20 space-y-14">
        {STEPS.map((step, i) => (
          <div key={step.n} className={`grid md:grid-cols-2 gap-10 items-center ${i%2===1?"md:[direction:rtl]":""}`}>
            <div style={{ direction:"ltr" }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black mb-4"
                style={{ background:`${step.color}15`, color:step.color }}>Step {step.n}</div>
              <h2 className="font-black text-2xl mb-3" style={{ letterSpacing:"-1px", color:"var(--text-primary)" }}>{step.title}</h2>
              <p className="text-sm leading-relaxed mb-3" style={{ color:"var(--text-secondary)" }}>{step.desc}</p>
              <p className="text-sm leading-relaxed mb-4" style={{ color:"var(--text-tertiary)" }}>{step.detail}</p>
              <div className="space-y-2">
                {step.bullets.map(b => (
                  <div key={b} className="flex items-center gap-2.5">
                    <Check size={12} style={{ color:step.color, flexShrink:0 }} strokeWidth={3}/>
                    <span className="text-sm" style={{ color:"var(--text-secondary)" }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-10 text-center" style={{ background:`${step.color}08`, border:`1px solid ${step.color}20`, direction:"ltr" }}>
              <div className="text-6xl mb-3">{step.emoji}</div>
              <p className="text-sm font-bold" style={{ color:step.color }}>{step.title}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="px-6 py-20" style={{ borderTop:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color:"#8B5CF6" }}>Money</p>
            <h2 className="font-black text-3xl mb-3" style={{ letterSpacing:"-1.5px", color:"var(--text-primary)" }}>How you get paid</h2>
            <p className="text-sm" style={{ color:"var(--text-secondary)" }}>Simple, transparent, instant. DropOS never holds your money.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {HOW_PAID.map(item => (
              <div key={item.title} className="p-5 rounded-2xl" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}>
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-bold text-sm mb-2" style={{ color:"var(--text-primary)" }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color:"var(--text-secondary)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-5 rounded-2xl text-center" style={{ background:"rgba(107,53,232,0.06)", border:"1px solid rgba(107,53,232,0.15)" }}>
            <p className="text-sm font-semibold mb-1" style={{ color:"#A78BFA" }}>Example: You sell a wig for ₦45,000</p>
            <p className="text-sm" style={{ color:"var(--text-secondary)" }}>
              You buy it from supplier for ₦22,000. You keep ₦23,000 profit. DropOS charges ₦9,500/month flat  -  not a percentage of your sales.
            </p>
          </div>
        </div>
      </section>

      <section className="text-center px-6 py-20">
        <h2 className="font-black text-3xl mb-4" style={{ letterSpacing:"-1.5px", color:"var(--text-primary)" }}>Ready to start?</h2>
        <p className="text-sm mb-8" style={{ color:"var(--text-secondary)" }}>Free forever. No credit card. No setup fee.</p>
        <Link href="/auth/register">
          <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base"
            style={{ background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", boxShadow:"0 12px 40px rgba(107,53,232,0.35)" }}>
            Launch your store <ArrowRight size={16}/>
          </button>
        </Link>
      </section>
    </div>
  );
}
