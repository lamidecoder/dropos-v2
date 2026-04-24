// dropos-apply-fixes.js
// Run from project root: node dropos-apply-fixes.js

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join('frontend', 'src');

const files = {};

// ── 1. about/page.tsx ─────────────────────────────────────────────────────
files[`app/(marketing)/about/page.tsx`] = `"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
  const team = [
    { name: "Olamide", role: "Co-founder & CTO", bio: "Builds everything technical. Full-stack engineer obsessed with AI and developer experience." },
    { name: "Tobi Bamidele", role: "Co-founder & CEO", bio: "Drives growth and partnerships. Former operator who understands commerce from the ground up." },
  ];
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(107,53,232,0.08) 0%, transparent 70%)" }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6"
              style={{ background: "rgba(107,53,232,0.12)", color: "var(--violet-400)", border: "1px solid rgba(107,53,232,0.2)" }}>
              Our Story
            </span>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6" style={{ color: "var(--text-primary)" }}>
              Built for the next generation of commerce
            </h1>
            <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              DropOS started with a simple frustration. Running an online store required too many tools, too much manual work, and too much expertise. We decided to fix that.
            </p>
          </motion.div>
        </div>
      </section>
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <h2 className="text-3xl font-black tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>Our mission</h2>
            <p className="text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              To give every entrepreneur an AI-powered business partner that builds their store, finds winning products, and grows their revenue automatically.
            </p>
          </div>
        </div>
      </section>
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black tracking-tight text-center mb-16" style={{ color: "var(--text-primary)" }}>The team</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {team.map((member) => (
              <div key={member.name} className="rounded-3xl p-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black mb-6"
                  style={{ background: "rgba(107,53,232,0.15)", color: "var(--violet-400)" }}>
                  {member.name[0]}
                </div>
                <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{member.name}</h3>
                <p className="text-sm font-medium mb-4" style={{ color: "var(--violet-400)" }}>{member.role}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black tracking-tight mb-6" style={{ color: "var(--text-primary)" }}>Ready to start?</h2>
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all hover:opacity-90"
            style={{ background: "var(--violet-500)" }}>
            Create your free store
          </Link>
        </div>
      </section>
    </div>
  );
}
`;

// ── 2. features/page.tsx ──────────────────────────────────────────────────
files[`app/(marketing)/features/page.tsx`] = `"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, BarChart3, Globe, ShoppingCart, Shield, Truck, Tag, Users } from "lucide-react";

const FEATURES = [
  { icon: Zap,          title: "KIRO AI Co-pilot",      desc: "Your AI business partner that builds your store, finds products, fulfils orders, and grows revenue automatically." },
  { icon: ShoppingCart, title: "One-click store setup",  desc: "Tell KIRO what you want to sell. Your store is live in 60 seconds. No design skills required." },
  { icon: BarChart3,    title: "Real-time analytics",    desc: "Revenue charts, conversion funnels, and product performance updated live as orders come in." },
  { icon: Globe,        title: "Global payments",        desc: "Paystack for Nigeria and Africa. Stripe for the world. Accept any currency, from anywhere." },
  { icon: Truck,        title: "Automated fulfilment",   desc: "Connect AliExpress and CJDropshipping. KIRO places orders with suppliers the moment a customer pays." },
  { icon: Tag,          title: "Smart promotions",       desc: "Flash sales, coupons, abandoned cart recovery, and volume discounts. KIRO runs them for you." },
  { icon: Shield,       title: "Enterprise security",    desc: "End-to-end encryption, rate limiting, 2FA, and automatic fraud detection on every transaction." },
  { icon: Users,        title: "Affiliate programme",    desc: "Turn your customers into a sales team. KIRO tracks referrals and pays commissions automatically." },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <section className="pt-40 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(107,53,232,0.08) 0%, transparent 70%)" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(107,53,232,0.12)", color: "var(--violet-400)", border: "1px solid rgba(107,53,232,0.2)" }}>
            Everything you need
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6" style={{ color: "var(--text-primary)" }}>
            Every tool your store needs. Run by AI.
          </h1>
          <p className="text-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Stop stitching together 10 different apps. DropOS gives you everything in one place, powered by KIRO.
          </p>
        </motion.div>
      </section>
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(107,53,232,0.12)" }}>
                <f.icon size={18} style={{ color: "var(--violet-400)" }} />
              </div>
              <h3 className="font-bold mb-2 text-sm" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black tracking-tight mb-6" style={{ color: "var(--text-primary)" }}>Start building your store today</h2>
          <Link href="/auth/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all hover:opacity-90" style={{ background: "var(--violet-500)" }}>
            Get started free
          </Link>
        </div>
      </section>
    </div>
  );
}
`;

// ── 3. pricing/page.tsx ───────────────────────────────────────────────────
files[`app/(marketing)/pricing/page.tsx`] = `"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Free", price: "Free", period: "",
    desc: "Start selling today. No credit card required.",
    color: "var(--text-secondary)", featured: false, cta: "Start free", href: "/auth/register",
    features: ["1 store","Up to 10 products","KIRO basic chat","Paystack checkout","2% transaction fee","Community support"],
  },
  {
    name: "Growth", price: "9,500", period: "/mo",
    desc: "For serious sellers ready to scale.",
    color: "var(--violet-400)", featured: true, cta: "Start Growth", href: "/auth/register?plan=growth",
    features: ["3 stores","Unlimited products","KIRO full actions","Abandoned cart recovery","Flash sales & coupons","Analytics dashboard","1% transaction fee","Priority support"],
  },
  {
    name: "Pro", price: "25,000", period: "/mo",
    desc: "For high-volume stores and agencies.",
    color: "#C026D3", featured: false, cta: "Start Pro", href: "/auth/register?plan=pro",
    features: ["Unlimited stores","Unlimited products","KIRO extended thinking","KIRO vision","Custom domain","Affiliate programme","API access","0.5% transaction fee","Dedicated support"],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <section className="pt-40 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(107,53,232,0.08) 0%, transparent 70%)" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(107,53,232,0.12)", color: "var(--violet-400)", border: "1px solid rgba(107,53,232,0.2)" }}>
            Pricing
          </span>
          <h1 className="text-5xl font-black tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>Simple, honest pricing</h1>
          <p className="text-xl" style={{ color: "var(--text-secondary)" }}>Start free. Upgrade when you are ready to scale.</p>
        </motion.div>
      </section>
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-3xl p-8 flex flex-col relative"
              style={{ background: plan.featured ? "rgba(107,53,232,0.08)" : "var(--bg-card)", border: plan.featured ? "2px solid var(--violet-500)" : "1px solid var(--border)" }}>
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold tracking-widest uppercase px-4 py-1 rounded-full text-white" style={{ background: "var(--violet-500)" }}>
                  Most popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-sm font-bold tracking-widest uppercase mb-2" style={{ color: plan.color }}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  {plan.price !== "Free" && <span className="text-xl font-bold" style={{ color: "var(--text-secondary)" }}>N</span>}
                  <span className="text-4xl font-black" style={{ color: "var(--text-primary)" }}>{plan.price}</span>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{plan.period}</span>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{plan.desc}</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: plan.color }} />{f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className="block text-center py-3.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
                style={plan.featured ? { background: "var(--violet-500)", color: "#fff" } : { background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
`;

// ── 4. admin/settings/page.tsx ────────────────────────────────────────────
files[`app/admin/settings/page.tsx`] = `"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { Save, DollarSign, Package, Shield, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const qc   = useQueryClient();
  const card = "bg-[var(--bg-card)] border-[var(--border)]";
  const inp  = "bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-primary)]";
  const tx   = "text-[var(--text-primary)]";
  const sub  = "text-[var(--text-tertiary)]";

  const [fee, setFee]                 = useState<number>(2);
  const [maintenance, setMaintenance] = useState(false);
  const [allowReg, setAllowReg]       = useState(true);
  const [feeEditing, setFeeEditing]   = useState(false);

  const PLANS = [
    { key: "freePrice",   name: "Free",   color: "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]", value: 0 },
    { key: "growthPrice", name: "Growth", color: "bg-amber-400/10 text-amber-400",                       value: 9500 },
    { key: "proPrice",    name: "Pro",    color: "bg-violet-400/10 text-violet-400",                     value: 25000 },
  ];

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const r = await adminAPI.getSettings();
      const s = r.data.data;
      if (s.platformFeePercent !== undefined) setFee(s.platformFeePercent);
      if (s.maintenanceMode   !== undefined) setMaintenance(s.maintenanceMode);
      if (s.allowRegistration !== undefined) setAllowReg(s.allowRegistration);
      return s;
    },
  });

  const save = useMutation({
    mutationFn: (data: any) => adminAPI.updateSettings(data),
    onSuccess: () => { toast.success("Settings saved"); qc.invalidateQueries({ queryKey: ["admin-settings"] }); },
    onError:   () => toast.error("Save failed"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={\`text-2xl font-black tracking-tight \${tx}\`}>Platform Settings</h1>
          <p className={\`text-sm mt-0.5 \${sub}\`}>Changes apply platform-wide instantly</p>
        </div>
        <button
          onClick={() => save.mutate({ platformFeePercent: fee, maintenanceMode: maintenance, allowRegistration: allowReg })}
          disabled={save.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all hover:opacity-90"
          style={{ background: "var(--violet-500)" }}>
          <Save size={14} />
          {save.isPending ? "Saving..." : "Save changes"}
        </button>
      </div>

      <div className={\`rounded-2xl border p-6 \${card}\`}>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={16} className="text-violet-500" />
          <h3 className={\`font-bold \${tx}\`}>Platform Fee</h3>
        </div>
        <div className="flex items-center justify-between">
          <p className={\`text-sm \${sub}\`}>Transaction fee charged on all orders</p>
          {feeEditing ? (
            <div className="flex items-center gap-2">
              <input type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))} min={0} max={10} step={0.5}
                className={\`w-20 px-3 py-1.5 rounded-lg text-sm border outline-none \${inp}\`} />
              <span className={\`text-sm \${sub}\`}>%</span>
              <button onClick={() => setFeeEditing(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "var(--violet-500)" }}>Done</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className={\`text-lg font-black \${tx}\`}>{fee}%</span>
              <button onClick={() => setFeeEditing(true)} className={\`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:bg-[var(--bg-secondary)] border-[var(--border)] \${sub}\`}>Edit</button>
            </div>
          )}
        </div>
      </div>

      <div className={\`rounded-2xl border p-6 \${card}\`}>
        <div className="flex items-center gap-2 mb-4">
          <Package size={16} className="text-violet-500" />
          <h3 className={\`font-bold \${tx}\`}>Subscription Plans</h3>
        </div>
        <div className="space-y-3">
          {PLANS.map((plan) => (
            <div key={plan.key} className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)]">
              <span className={\`text-xs font-bold px-2.5 py-1 rounded-full \${plan.color}\`}>{plan.name}</span>
              <span className={\`font-bold \${tx}\`}>{plan.value === 0 ? "Free" : \`N\${plan.value.toLocaleString()}/mo\`}</span>
            </div>
          ))}
        </div>
        <p className={\`text-xs mt-3 \${sub}\`}>Plan prices are managed in your Paystack dashboard.</p>
      </div>

      <div className={\`rounded-2xl border p-6 \${card}\`}>
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-violet-500" />
          <h3 className={\`font-bold \${tx}\`}>User Registration</h3>
        </div>
        <div className="flex items-center justify-between">
          <p className={\`text-sm \${sub}\`}>Allow new users to register</p>
          <button onClick={() => setAllowReg(!allowReg)} className={\`relative w-11 h-6 rounded-full transition-all \${allowReg ? "bg-violet-500" : "bg-[var(--bg-secondary)]"}\`}>
            <span className={\`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform \${allowReg ? "translate-x-5" : "translate-x-0"}\`} />
          </button>
        </div>
      </div>

      <div className={\`rounded-2xl border p-6 \${card}\`}>
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-violet-500" />
          <h3 className={\`font-bold \${tx}\`}>Maintenance Mode</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className={\`text-sm \${sub}\`}>Take the platform offline for maintenance</p>
            {maintenance && <p className="text-xs mt-1 text-amber-400">Platform is currently in maintenance mode</p>}
          </div>
          <button onClick={() => setMaintenance(!maintenance)} className={\`relative w-11 h-6 rounded-full transition-all \${maintenance ? "bg-amber-500" : "bg-[var(--bg-secondary)]"}\`}>
            <span className={\`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform \${maintenance ? "translate-x-5" : "translate-x-0"}\`} />
          </button>
        </div>
      </div>
    </div>
  );
}
`;

// ── 5. forgot-password/page.tsx ───────────────────────────────────────────
files[`app/auth/forgot-password/page.tsx`] = `"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: "var(--bg-base)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(107,53,232,0.06),transparent 70%)" }} />
      </div>
      <div className="w-full max-w-sm relative z-10">
        <div className="rounded-3xl p-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>
            <ArrowLeft size={14} /> Back to login
          </Link>
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(107,53,232,0.12)" }}>
                <Mail size={24} style={{ color: "var(--violet-400)" }} />
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>Check your email</h1>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                We sent a reset link to <strong style={{ color: "var(--text-primary)" }}>{email}</strong>.
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-black tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>Reset password</h1>
              <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>Enter your email and we will send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Email address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
                <button type="submit" disabled={loading || !email}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--violet-500)" }}>
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;

// ── 6. reset-password/page.tsx ────────────────────────────────────────────
files[`app/auth/reset-password/page.tsx`] = `"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const valid = password.length >= 8 && password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch {
      toast.error("Link expired or invalid. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: "var(--bg-base)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(107,53,232,0.06),transparent 70%)" }} />
      </div>
      <div className="w-full max-w-sm relative z-10">
        <div className="rounded-3xl p-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>
            <ArrowLeft size={14} /> Back to login
          </Link>
          {success ? (
            <div className="text-center py-4">
              <h1 className="text-2xl font-black tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>Password updated</h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Redirecting you to login...</p>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-black tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>New password</h1>
              <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>Choose a strong password for your account.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>New password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters" required className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-10"
                      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70">
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Confirm password</label>
                  <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your password" required className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                  {confirm && !valid && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>Passwords do not match</p>}
                </div>
                <button type="submit" disabled={loading || !valid}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--violet-500)" }}>
                  {loading ? "Updating..." : "Update password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg-base)" }} />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
`;

// ── 7. verify-email/page.tsx ──────────────────────────────────────────────
files[`app/auth/verify-email/page.tsx`] = `"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    api.post("/auth/verify-email", { token })
      .then(() => { setStatus("success"); setTimeout(() => router.push("/dashboard"), 2500); })
      .catch(() => setStatus("error"));
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-base)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl" style={{ background: "rgba(107,53,232,0.08)" }} />
      </div>
      <div className="text-center relative z-10 max-w-sm w-full">
        <div className="rounded-3xl p-10" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          {status === "loading" && (
            <div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(107,53,232,0.12)" }}>
                <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
              </div>
              <h1 className="text-xl font-black mb-2" style={{ color: "var(--text-primary)" }}>Verifying your email</h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Just a moment...</p>
            </div>
          )}
          {status === "success" && (
            <div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl" style={{ background: "rgba(16,185,129,0.12)" }}>✓</div>
              <h1 className="text-xl font-black mb-2" style={{ color: "var(--text-primary)" }}>Email verified!</h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Redirecting you to your dashboard...</p>
            </div>
          )}
          {status === "error" && (
            <div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl" style={{ background: "rgba(239,68,68,0.1)" }}>x</div>
              <h1 className="text-xl font-black mb-2" style={{ color: "var(--text-primary)" }}>Link expired</h1>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>This verification link has expired or already been used.</p>
              <Link href="/auth/login" className="inline-block px-6 py-3 rounded-xl font-bold text-sm text-white" style={{ background: "var(--violet-500)" }}>
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg-base)" }} />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
`;

// ── 8. AbandonedCartTracker.tsx ───────────────────────────────────────────
files[`components/store/AbandonedCartTracker.tsx`] = `"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { X, ShoppingCart, Zap } from "lucide-react";

interface Props { store: any; exitDiscount?: number; idleMinutes?: number; }

export default function AbandonedCartTracker({ store, exitDiscount = 10, idleMinutes = 30 }: Props) {
  const [showPopup, setShowPopup] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const hasShown  = useRef(false);

  const resetTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (hasShown.current || dismissed) return;
    idleTimer.current = setTimeout(() => {
      const cart = JSON.parse(localStorage.getItem(\`dropos_cart_\${store?.id}\`) || "[]");
      if (cart.length > 0) { setShowPopup(true); hasShown.current = true; }
    }, idleMinutes * 60 * 1000);
  }, [idleMinutes, dismissed, store?.id]);

  useEffect(() => {
    const events = ["mousemove","keydown","scroll","click","touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [resetTimer]);

  useEffect(() => {
    if (hasShown.current || dismissed) return;
    const handler = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        const cart = JSON.parse(localStorage.getItem(\`dropos_cart_\${store?.id}\`) || "[]");
        if (cart.length > 0) { setShowPopup(true); hasShown.current = true; }
      }
    };
    document.addEventListener("mouseleave", handler);
    return () => document.removeEventListener("mouseleave", handler);
  }, [dismissed, store?.id]);

  const dismissPopup = () => { setShowPopup(false); setDismissed(true); };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} onClick={dismissPopup} />
      <div className="relative w-full max-w-sm rounded-3xl p-8 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", zIndex: 9999 }}>
        <button onClick={dismissPopup} className="absolute top-4 right-4 opacity-40 hover:opacity-70 transition-opacity"><X size={16} /></button>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(107,53,232,0.12)" }}>
          <ShoppingCart size={24} style={{ color: "var(--violet-400)" }} />
        </div>
        <h2 className="text-xl font-black tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>Wait, do not leave yet</h2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
          You still have items in your cart. Complete your order now and get{" "}
          <strong style={{ color: "var(--violet-400)" }}>{exitDiscount}% off</strong>.
        </p>
        <div className="space-y-3">
          <button onClick={dismissPopup} className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90" style={{ background: "var(--violet-500)" }}>
            <Zap size={14} /> Claim {exitDiscount}% discount
          </button>
          <button onClick={dismissPopup} className="w-full py-2.5 text-sm transition-opacity hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
            No thanks, I will leave
          </button>
        </div>
      </div>
    </div>
  );
}
`;

// ── 9. TemplateRenderer.tsx ───────────────────────────────────────────────
files[`components/store/templates/TemplateRenderer.tsx`] = `"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ClassicTemplate  = dynamic(() => import("./ClassicTemplate"),  { ssr: false });
const ModernTemplate   = dynamic(() => import("./ModernTemplate"),   { ssr: false });
const MinimalTemplate  = dynamic(() => import("./MinimalTemplate"),  { ssr: false });
const BoldTemplate     = dynamic(() => import("./BoldTemplate"),     { ssr: false });
const ElegantTemplate  = dynamic(() => import("./ElegantTemplate"),  { ssr: false });
const AbandonedCartTracker = dynamic(() => import("../AbandonedCartTracker"), { ssr: false });

export type TemplateProps = {
  store: any;
  products?: any[];
  product?: any;
  cart?: any;
  onAddToCart?: (product: any) => void;
  onRemoveFromCart?: (productId: string) => void;
  onUpdateQuantity?: (productId: string, qty: number) => void;
  onCheckout?: () => void;
  page?: "home" | "product" | "cart" | "checkout" | "confirmation";
  [key: string]: any;
};

const TEMPLATE_MAP: Record<string, any> = {
  classic: ClassicTemplate,
  modern:  ModernTemplate,
  minimal: MinimalTemplate,
  bold:    BoldTemplate,
  elegant: ElegantTemplate,
};

export function TemplateRenderer(props: TemplateProps) {
  const theme     = props.store?.theme || "classic";
  const Component = TEMPLATE_MAP[theme] || ClassicTemplate;
  return (
    <div className="template-root">
      <Suspense fallback={<div className="min-h-screen" style={{ background: "#06040D" }} />}>
        <Component {...props} />
      </Suspense>
      <AbandonedCartTracker store={props.store} exitDiscount={10} idleMinutes={30} />
    </div>
  );
}
`;

// ── WRITE ALL FILES ───────────────────────────────────────────────────────
console.log('\n DropOS — Writing fixed files\n' + '='.repeat(40));

let written = 0, errors = 0;

for (const [rel, content] of Object.entries(files)) {
  const fullPath = path.join(ROOT, rel.replace(/\//g, path.sep));
  const dir      = path.dirname(fullPath);

  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`  OK  ${rel}`);
    written++;
  } catch (e) {
    console.log(`  ERR ${rel}: ${e.message}`);
    errors++;
  }
}

console.log(`\nWritten: ${written}  Errors: ${errors}\n`);

// ── GIT PUSH ──────────────────────────────────────────────────────────────
try {
  execSync('git add .', { stdio: 'inherit' });
  const status = execSync('git status --short', { encoding: 'utf8' }).trim();
  if (status) {
    execSync('git commit -m "fix: replace all broken JSX pages with clean versions"', { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('\nPushed. Watch Vercel build now.\n');
  } else {
    console.log('Nothing new to commit — already pushed.\n');
  }
} catch (e) {
  console.log('Git error:', e.message);
}
