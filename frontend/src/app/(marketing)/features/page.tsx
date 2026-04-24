"use client";
import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Package, Globe, CreditCard, Truck, BarChart2, Palette, Shield, TrendingUp,
  Users, Bell, Tag, FileText, Star, Zap, ArrowRight, CheckCircle } from "lucide-react";

function FadeUp({ children, delay = 0, className = "" }: any) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const categories = [
  {
    title: "Store Management",
    desc: "Everything to run your store like a pro.",
    icon: Globe,
    color: "#c9a84c",
    features: [
      "Custom storefront with your own domain",
      "Multiple store templates (2 free, 8 Pro, 12 Advanced)",
      "Store branding — colors, fonts, layout",
      "SEO settings per store",
      "Mobile-optimized by default",
      "Store onboarding wizard",
    ],
  },
  {
    title: "Products",
    desc: "Manage your catalog with ease.",
    icon: Package,
    color: "#7c3aed",
    features: [
      "Unlimited products on paid plans",
      "Product variants (size, color, etc.)",
      "Inventory tracking with low-stock alerts",
      "Bulk CSV import",
      "Image gallery with drag & drop reorder",
      "Product categories and tags",
    ],
  },
  {
    title: "Payments",
    desc: "Get paid, no matter where your customers are.",
    icon: CreditCard,
    color: "#10b981",
    features: [
      "Stripe (global cards)",
      "Paystack (Nigeria, Ghana, Kenya, South Africa)",
      "Flutterwave (pan-Africa)",
      "Automatic currency detection",
      "Payment confirmation emails",
      "Webhook support for all gateways",
    ],
  },
  {
    title: "Orders & Shipping",
    desc: "From checkout to doorstep.",
    icon: Truck,
    color: "#3b82f6",
    features: [
      "Order management dashboard",
      "Status updates with customer notifications",
      "Shipping zones by country/region",
      "Free shipping thresholds",
      "Delivery time estimates",
      "Invoice PDF download",
    ],
  },
  {
    title: "Marketing & Discounts",
    desc: "Drive more sales with smart tools.",
    icon: Tag,
    color: "#ef4444",
    features: [
      "Coupon codes (% or fixed amount)",
      "Expiry dates and usage limits",
      "Minimum order requirements",
      "Customer reviews with star ratings",
      "Review approval system",
      "Referral system (coming soon)",
    ],
  },
  {
    title: "Analytics & Reports",
    desc: "Know your numbers, grow your business.",
    icon: BarChart2,
    color: "#f59e0b",
    features: [
      "Revenue charts (daily, weekly, monthly)",
      "Top products by sales",
      "Customer growth tracking",
      "Orders by status breakdown",
      "CSV export for all reports",
      "Platform-wide admin analytics",
    ],
  },
];

export default function FeaturesPage() {
  return (
      <>
      {/* Hero */}
      <section className="pt-40 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(196,168,76,0.05) 0%, transparent 70%)" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 max-w-3xl mx-auto">
          <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Features</span>
          <h1 className="text-5xl md:text-7xl font-black text-[var(--text-primary)] tracking-tight leading-tight mt-4 mb-6">
            Everything you need.{" "}
            <span style={{ background: "linear-gradient(135deg,#c9a84c,#f0c040)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Nothing you don't.
            </span>
          </h1>
          <p className="text-[var(--text-secondary)] text-xl leading-relaxed">A complete platform built for dropshippers who want results, not complexity.</p>
        </motion.div>
      </section>

      {/* Feature categories */}
      <section className="pb-24 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 pt-24 space-y-6">
          {categories.map((cat, i) => (
            <FadeUp key={i} delay={0.05}>
              <div className="p-8 md:p-10 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border)] transition-all">
                <div className="grid md:grid-cols-3 gap-8 items-start">
                  <div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}>
                      <cat.icon size={22} style={{ color: cat.color }} />
                    </div>
                    <h3 className="text-[var(--text-primary)] text-2xl font-black mb-2 tracking-tight">{cat.title}</h3>
                    <p className="text-[var(--text-tertiary)] text-sm leading-relaxed">{cat.desc}</p>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cat.features.map((f, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: cat.color }} />
                        <span className="text-[var(--text-secondary)] text-sm">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <FadeUp>
            <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tight mb-4">Ready to launch?</h2>
            <p className="text-[var(--text-tertiary)] mb-8">Everything above is ready for you right now. Free to start.</p>
            <Link href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-black bg-amber-400 hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/20">
              Start for free <ArrowRight size={16} />
            </Link>
          </FadeUp>
        </div>
      </section>
  </>

  );
}
