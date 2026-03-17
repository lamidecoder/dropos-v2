"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, Package, CreditCard, BarChart2, Shield, Star } from "lucide-react";

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

const changelog = [
  {
    version: "v1.3.0", date: "March 2025", badge: "Latest",
    icon: Zap, color: "#c9a84c",
    updates: [
      { type: "new",  text: "Inventory management page with low-stock alerts" },
      { type: "new",  text: "Order invoice PDF — download from any order" },
      { type: "new",  text: "Customer reviews dashboard — approve or reject" },
      { type: "new",  text: "Deployment configs for Railway, Render and Vercel" },
      { type: "fix",  text: "Fixed duplicate ShippingZone model in Prisma schema" },
      { type: "fix",  text: "Fixed broken import causing backend crash on startup" },
    ],
  },
  {
    version: "v1.2.0", date: "February 2025", badge: "Stable",
    icon: Package, color: "#7c3aed",
    updates: [
      { type: "new",  text: "Store customization — fonts, colors, border radius" },
      { type: "new",  text: "Coupon engine with % and fixed discount types" },
      { type: "new",  text: "Shipping zones by country with free thresholds" },
      { type: "new",  text: "Sales reports with CSV export" },
      { type: "new",  text: "Product reviews with star ratings on storefronts" },
      { type: "impr", text: "Improved dashboard analytics with revenue charts" },
    ],
  },
  {
    version: "v1.1.0", date: "January 2025", badge: null,
    icon: CreditCard, color: "#10b981",
    updates: [
      { type: "new",  text: "Paystack and Flutterwave payment gateway support" },
      { type: "new",  text: "Payment confirmation and order status emails" },
      { type: "new",  text: "Store onboarding wizard for new users" },
      { type: "new",  text: "Subscription billing UI with plan comparison" },
      { type: "fix",  text: "Stripe webhook signature verification fixed" },
      { type: "impr", text: "Faster product image uploads with Cloudinary" },
    ],
  },
  {
    version: "v1.0.0", date: "December 2024", badge: "Launch",
    icon: Star, color: "#f59e0b",
    updates: [
      { type: "new",  text: "Initial public launch of DropOS" },
      { type: "new",  text: "Multi-tenant store management" },
      { type: "new",  text: "Product catalog with variants and inventory" },
      { type: "new",  text: "Order management with status tracking" },
      { type: "new",  text: "Stripe payments integration" },
      { type: "new",  text: "Admin panel for platform management" },
    ],
  },
];

const typeBadge: Record<string, string> = {
  new:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  fix:  "bg-red-500/10 text-red-400 border-red-500/20",
  impr: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};
const typeLabel: Record<string, string> = { new: "New", fix: "Fix", impr: "Improved" };

export default function ChangelogPage() {
  return (
    <>
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(196,168,76,0.05) 0%, transparent 70%)" }} />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Changelog</span>
            <h1 className="text-5xl md:text-6xl font-black text-[var(--text-primary)] tracking-tight mt-4 mb-4">
              What's{" "}
              <span style={{ background: "linear-gradient(135deg,#c9a84c,#f0c040)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                new
              </span>
            </h1>
            <p className="text-[var(--text-secondary)] text-lg">Every update, improvement and fix — in one place.</p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-amber-400/20 via-white/5 to-transparent" />

            <div className="space-y-12">
              {changelog.map((release, i) => (
                <FadeUp key={i} delay={i * 0.1}>
                  <div className="relative pl-16">
                    {/* Icon dot */}
                    <div className="absolute left-0 w-12 h-12 rounded-xl flex items-center justify-center border"
                      style={{ background: `${release.color}15`, borderColor: `${release.color}30` }}>
                      <release.icon size={18} style={{ color: release.color }} />
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[var(--text-primary)] font-black text-xl">{release.version}</span>
                      {release.badge && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full border"
                          style={{ color: release.color, background: `${release.color}15`, borderColor: `${release.color}30` }}>
                          {release.badge}
                        </span>
                      )}
                      <span className="text-[var(--text-tertiary)] text-sm ml-auto">{release.date}</span>
                    </div>

                    <div className="space-y-2.5">
                      {release.updates.map((u, j) => (
                        <div key={j} className="flex items-start gap-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex-shrink-0 mt-0.5 ${typeBadge[u.type]}`}>
                            {typeLabel[u.type]}
                          </span>
                          <span className="text-[var(--text-secondary)] text-sm leading-relaxed">{u.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
