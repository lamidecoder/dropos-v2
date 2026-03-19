"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Zap, CheckCircle, Mail, Lock, User, Phone, ArrowRight, Store, BarChart3, Shield } from "lucide-react";
import { useRegister } from "../../../hooks/useAuth";

const schema = z.object({
  name:     z.string().min(2, "Name too short"),
  email:    z.string().email("Invalid email"),
  password: z.string()
    .min(8,    "Min 8 characters")
    .regex(/[A-Z]/, "Need one uppercase")
    .regex(/[a-z]/, "Need one lowercase")
    .regex(/\d/,    "Need one number"),
  phone: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function DropOSLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: "linear-gradient(135deg, #7C3AED, #8B5CF6)", boxShadow: "0 8px 20px rgba(124,58,237,0.4)" }}>
        <Zap size={20} color="white" fill="white" />
      </div>
      <span className="text-2xl font-black tracking-tight text-white">DropOS</span>
    </div>
  );
}

export default function RegisterPage() {
  const [show, setShow] = useState(false);
  const [phonePlaceholder, setPhonePlaceholder] = useState("+1 234 567 8900");

  // Detect user location and set phone placeholder
  useState(() => {
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(data => {
        const dialCode = data.country_calling_code || "+1";
        const examples: Record<string, string> = {
          "+234": "+234 801 234 5678",
          "+1":   "+1 234 567 8900",
          "+44":  "+44 7700 900000",
          "+27":  "+27 71 234 5678",
          "+254": "+254 712 345 678",
          "+233": "+233 24 123 4567",
          "+256": "+256 700 123456",
          "+255": "+255 712 345 678",
          "+20":  "+20 100 123 4567",
          "+91":  "+91 98765 43210",
        };
        setPhonePlaceholder(examples[dialCode] || `${dialCode} 123 456 789`);
      })
      .catch(() => {});
  });
  const registerMutation = useRegister();

  const { register: reg, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const pwd = watch("password") || "";
  const checks = [
    { label: "8+ characters", ok: pwd.length >= 8 },
    { label: "Uppercase",     ok: /[A-Z]/.test(pwd) },
    { label: "Lowercase",     ok: /[a-z]/.test(pwd) },
    { label: "Number",        ok: /\d/.test(pwd) },
  ];

  const handleGoogleSignup = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "https://dropos-v2.onrender.com";
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#07070e" }}>

      {/* ── Left Branding Panel ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-14"
        style={{ background: "linear-gradient(135deg, #0c0c1d 0%, #160a2e 60%, #0c0c1d 100%)" }}>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.4), transparent 65%)", filter: "blur(60px)" }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.5), transparent 65%)", filter: "blur(60px)" }} />
        </div>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

        <div className="relative z-10"><DropOSLogo /></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-8"
            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#6ee7b7" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Free 14-day trial · No credit card
          </div>

          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            Start selling<br />in minutes.<br />
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Not weeks.
            </span>
          </h1>

          <p className="text-slate-400 text-base leading-relaxed max-w-sm mb-10">
            Join thousands of African entrepreneurs already using DropOS to run their dropshipping business.
          </p>

          {/* Steps */}
          <div className="space-y-5 mb-12">
            {[
              { step: "01", icon: Store,    color: "#8b5cf6", title: "Create your store",     desc: "Set up your branded store in under 2 minutes" },
              { step: "02", icon: BarChart3, color: "#3b82f6", title: "Add products",          desc: "Import from AliExpress or add manually" },
              { step: "03", icon: Shield,    color: "#10b981", title: "Start accepting orders", desc: "Paystack & Flutterwave ready out of the box" },
            ].map(({ step, icon: Icon, color, title, desc }) => (
              <div key={step} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 p-5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex gap-1 mb-3">{[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-sm">★</span>)}</div>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            "Setting up my store took less than 10 minutes. I had my first order the same day!"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white"
              style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)" }}>K</div>
            <div>
              <div className="text-sm font-bold text-white">Kemi Adeleke</div>
              <div className="text-xs text-slate-500">Electronics Store · Abuja</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 relative overflow-y-auto">
        <div className="absolute inset-0 lg:hidden pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)", filter: "blur(60px)" }} />
        </div>

        <div className="w-full max-w-[400px] relative z-10 py-8">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden"><DropOSLogo /></div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2">Create your account 🚀</h2>
            <p className="text-sm text-slate-500">Start your free trial today — no card needed</p>
          </div>

          {/* Google Button */}
          <button onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[.98] mb-5"
            style={{ background: "#ffffff", color: "#1f1f1f", boxShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
            <GoogleIcon /> Sign up with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-xs text-slate-600 font-medium">or sign up with email</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          <form onSubmit={handleSubmit((d) => registerMutation.mutate(d))} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold mb-2 text-slate-400">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                <input {...reg("name")} type="text" placeholder="John Doe"
                  className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all text-white placeholder-slate-700"
                  style={{ background: "rgba(255,255,255,0.05)", border: errors.name ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.09)" }} />
              </div>
              {errors.name && <p className="text-xs text-red-400 mt-1.5">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-2 text-slate-400">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                <input {...reg("email")} type="email" placeholder="you@example.com"
                  className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all text-white placeholder-slate-700"
                  style={{ background: "rgba(255,255,255,0.05)", border: errors.email ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.09)" }} />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold mb-2 text-slate-400">Phone <span className="text-slate-600">(optional)</span></label>
              <div className="relative">
                <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                <input {...reg("phone")} type="tel" placeholder={phonePlaceholder}
                  className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all text-white placeholder-slate-700"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-2 text-slate-400">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                <input {...reg("password")} type={show ? "text" : "password"} placeholder="••••••••"
                  className="w-full rounded-2xl pl-11 pr-12 py-3.5 text-sm outline-none transition-all text-white placeholder-slate-700"
                  style={{ background: "rgba(255,255,255,0.05)", border: errors.password ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.09)" }} />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password strength */}
              {pwd && (
                <div className="grid grid-cols-2 gap-1.5 mt-3">
                  {checks.map((c) => (
                    <div key={c.label} className="flex items-center gap-1.5 text-xs transition-colors"
                      style={{ color: c.ok ? "#10b981" : "#4b5563" }}>
                      <CheckCircle size={11} style={{ color: c.ok ? "#10b981" : "#374151" }} />
                      {c.label}
                    </div>
                  ))}
                </div>
              )}
              {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>}
            </div>

            {/* Terms */}
            <p className="text-xs text-slate-600 leading-relaxed">
              By creating an account you agree to our{" "}
              <span className="text-violet-400 cursor-pointer hover:text-violet-300">Terms of Service</span>
              {" "}and{" "}
              <span className="text-violet-400 cursor-pointer hover:text-violet-300">Privacy Policy</span>.
            </p>

            {/* Submit */}
            <button type="submit" disabled={registerMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 8px 32px rgba(124,58,237,0.4)" }}>
              {registerMutation.isPending
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account…</>
                : <>Create Free Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-xs mt-6 text-slate-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold text-violet-400 hover:text-violet-300 transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}