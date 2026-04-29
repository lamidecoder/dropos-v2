import Link from "next/link";
import { Zap, Globe, ShoppingCart, BarChart2, Package, Cpu, Shield, Truck, Image, Video, Users, ArrowRight, Check } from "lucide-react";

export const metadata = { title: "Features — DropOS", description: "Everything you need to build and run a successful online store." };

const SECTIONS = [
  {
    tag: "AI POWERED",
    title: "KIRO — Your AI Business Partner",
    desc: "Not a chatbot. A full business operator that builds, manages, and grows your store.",
    color: "#8B5CF6",
    features: [
      "Build a complete store from one sentence",
      "Write product descriptions and ad copy",
      "Find trending products before they peak",
      "Manage orders and customer messages",
      "Monitor competitor prices and alert you",
      "Generate TikTok scripts for any product",
      "Revenue forecasting and anomaly detection",
      "Morning briefings with actionable insights",
    ],
  },
  {
    tag: "COMMERCE",
    title: "Everything built in. Nothing to install.",
    desc: "Shopify charges extra for every feature. DropOS includes it all.",
    color: "#06B6D4",
    features: [
      "Unlimited products and variants",
      "20+ professional store templates",
      "Custom domain connection",
      "Coupons, flash sales, gift cards",
      "Loyalty points programme",
      "Abandoned cart recovery",
      "Customer reviews and ratings",
      "Affiliate programme for your store",
    ],
  },
  {
    tag: "PAYMENTS",
    title: "Accept payment anywhere in the world.",
    desc: "Every major payment method. No friction. No lost sales.",
    color: "#10B981",
    features: [
      "Paystack (Nigeria, Ghana, South Africa)",
      "Stripe (Global, 135+ currencies)",
      "Flutterwave (Africa-wide)",
      "Apple Pay and Google Pay",
      "Pay on Delivery",
      "Buy now, pay later (Klarna, Carbon)",
      "Cryptocurrency (USDT, USDC)",
      "Automatic currency conversion",
    ],
  },
  {
    tag: "FULFILMENT",
    title: "Orders fulfilled automatically.",
    desc: "KIRO connects to suppliers, places orders, and tracks shipments. You do nothing.",
    color: "#F59E0B",
    features: [
      "AliExpress auto-import and order",
      "CJDropshipping integration",
      "Zendrop and Spocket connect",
      "Auto tracking number import",
      "Customer shipping notifications",
      "Delay detection and alerts",
      "DHL, FedEx, UPS, Royal Mail",
      "GIG Logistics, Sendbox (Nigeria)",
    ],
  },
  {
    tag: "CONTENT STUDIO",
    title: "Professional content. No team needed.",
    desc: "AI-generated images, videos, and ads that actually convert.",
    color: "#EC4899",
    features: [
      "Background removal in one click",
      "Lifestyle scene generation",
      "TikTok and Reels video scripts",
      "AI-generated ad creatives",
      "Auto-caption for all platforms",
      "Smart crop for every format",
      "Social media scheduling",
      "30-day content calendar",
    ],
  },
  {
    tag: "ANALYTICS",
    title: "Know exactly what drives your sales.",
    desc: "Real data. Plain English. KIRO overlaid on every chart.",
    color: "#6B35E8",
    features: [
      "Revenue, orders, and customer LTV",
      "Cohort and retention analysis",
      "Geographic heat map",
      "Revenue attribution by source",
      "Product return rate tracking",
      "Ad spend ROI tracking",
      "Funnel analysis",
      "KIRO insights on every chart",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div style={{ background: "#07050F", color: "#fff", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Nav */}
{/* Hero */}
      <div className="text-center px-6 py-24">
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#8B5CF6" }}>Features</p>
        <h1 className="font-black mb-4" style={{ fontSize: "clamp(36px,5vw,64px)", letterSpacing: "-2px" }}>
          One platform.<br />Everything included.
        </h1>
        <p className="text-base max-w-xl mx-auto mb-8" style={{ color: "rgba(255,255,255,0.45)" }}>
          Shopify charges $79/month then nickels and dimes you for every feature. DropOS includes everything — powered by KIRO so it actually runs itself.
        </p>
        <Link href="/auth/register">
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", boxShadow: "0 8px 32px rgba(107,53,232,0.4)" }}>
            Start free — no credit card <ArrowRight size={14} />
          </button>
        </Link>
      </div>

      {/* Feature sections */}
      <div className="max-w-5xl mx-auto px-6 space-y-20 pb-24">
        {SECTIONS.map((section, i) => (
          <div key={section.tag} className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "md:[direction:rtl]" : ""}`}>
            <div style={{ direction: "ltr" }}>
              <span className="text-xs font-black tracking-widest uppercase mb-3 block" style={{ color: section.color }}>{section.tag}</span>
              <h2 className="font-black text-2xl sm:text-3xl mb-4 text-white" style={{ letterSpacing: "-1px" }}>{section.title}</h2>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{section.desc}</p>
              <Link href="/auth/register">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(135deg,${section.color},${section.color}99)` }}>
                  Get started <ArrowRight size={13} />
                </button>
              </Link>
            </div>
            <div className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${section.color}25`, direction: "ltr" }}>
              <div className="grid grid-cols-1 gap-2.5">
                {section.features.map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${section.color}20` }}>
                      <Check size={10} style={{ color: section.color }} strokeWidth={3} />
                    </div>
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center px-6 py-20" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 className="font-black text-3xl sm:text-5xl mb-4" style={{ letterSpacing: "-2px" }}>Ready to start?</h2>
        <p className="text-base mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>Free forever. No credit card. Launch in 60 seconds.</p>
        <Link href="/auth/register">
          <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", boxShadow: "0 12px 40px rgba(107,53,232,0.4)" }}>
            Launch your store <ArrowRight size={16} />
          </button>
        </Link>
      </div>
    </div>
  );
}
