"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, AlertCircle, Mail, Lock, ArrowRight, Zap, ShieldCheck, TrendingUp, Package } from "lucide-react";
import { useLogin } from "../../../hooks/useAuth";
import { useSearchParams } from "next/navigation";

const schema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
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

function LoginPageInner() {
  const [show, setShow] = useState(false);
  const login = useLogin();
  const params = useSearchParams();
  const registered = params.get("registered");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => login.mutate(data);
  const fillDemo = (email: string, password: string) => { setValue("email", email); setValue("password", password); };
  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "https://dropos-v2.onrender.com";
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#07070e" }}>
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
            style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#c4b5fd" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Africa's #1 Dropshipping Platform
          </div>
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            Your store.<br />Your rules.<br />
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Your empire.
            </span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm mb-10">
            Launch a dropshipping store in minutes. Accept Paystack and Flutterwave, manage suppliers, track every order.
          </p>
          <div className="flex flex-wrap gap-3 mb-12">
            {[
              { icon: ShieldCheck, label: "Secure Payments", color: "#10b981" },
              { icon: TrendingUp,  label: "Live Analytics",  color: "#3b82f6" },
              { icon: Package,     label: "Auto-Fulfillment", color: "#8b5cf6" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}>
                <Icon size={12} />{label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6 mb-12">
            {[{ value: "10K+", label: "Active Stores" }, { value: "₦2B+", label: "GMV Processed" }, { value: "99.9%", label: "Uptime" }].map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-black text-white mb-0.5">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 p-5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex gap-1 mb-3">{[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-sm">★</span>)}</div>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            "I launched my store in one afternoon and made my first ₦50,000 sale within a week. DropOS is a game changer."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>A</div>
            <div>
              <div className="text-sm font-bold text-white">Adaeze Okonkwo</div>
              <div className="text-xs text-slate-500">Fashion Store Owner · Lagos</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 lg:hidden pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)", filter: "blur(60px)" }} />
        </div>
        <div className="w-full max-w-[400px] relative z-10">
          <div className="flex justify-center mb-10 lg:hidden"><DropOSLogo /></div>
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2">Welcome back 👋</h2>
            <p className="text-sm text-slate-500">Sign in to continue to your dashboard</p>
          </div>
          {registered && (
            <div className="mb-5 flex items-center gap-2.5 text-xs text-emerald-400 rounded-xl px-4 py-3"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <AlertCircle size={14} /> Account created! Check your email to verify.
            </div>
          )}

          {/* Google Button */}
          <button onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[.98] mb-5"
            style={{ background: "#ffffff", color: "#1f1f1f", boxShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
            <GoogleIcon /> Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-xs text-slate-600 font-medium">or continue with email</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 text-slate-400">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                <input {...register("email")} type="email" placeholder="you@example.com"
                  className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all text-white placeholder-slate-700"
                  style={{ background: "rgba(255,255,255,0.05)", border: errors.email ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.09)" }} />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-400">Password</label>
                <Link href="/auth/forgot-password" className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                <input {...register("password")} type={show ? "text" : "password"} placeholder="••••••••"
                  className="w-full rounded-2xl pl-11 pr-12 py-3.5 text-sm outline-none transition-all text-white placeholder-slate-700"
                  style={{ background: "rgba(255,255,255,0.05)", border: errors.password ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.09)" }} />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={login.isPending}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-50 mt-2"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 8px 32px rgba(124,58,237,0.4)" }}>
              {login.isPending
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-7 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-3">⚡ Quick demo access</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Super Admin", e: "admin@dropos.io", p: "Admin123!", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
                { label: "Store Owner", e: "owner@dropos.io", p: "Owner123!", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
              ].map((d) => (
                <button key={d.e} onClick={() => fillDemo(d.e, d.p)}
                  className="flex flex-col px-3 py-2.5 rounded-xl text-left transition-all hover:opacity-80 active:scale-[.98]"
                  style={{ background: d.bg, border: `1px solid ${d.color}25` }}>
                  <span className="text-xs font-bold" style={{ color: d.color }}>{d.label}</span>
                  <span className="text-[10px] font-mono mt-0.5 truncate text-slate-600">{d.e}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs mt-6 text-slate-600">
            Don't have an account?{" "}
            <Link href="/auth/register" className="font-bold text-violet-400 hover:text-violet-300 transition-colors">
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#07070e" }}>
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}