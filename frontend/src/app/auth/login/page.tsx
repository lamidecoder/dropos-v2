"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Zap, ArrowRight } from "lucide-react";
import { useLogin } from "../../../hooks/useAuth";
import { useSearchParams } from "next/navigation";

const schema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password required"),
});
type Form = z.infer<typeof schema>;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function LoginInner() {
  const [show, setShow] = useState(false);
  const login  = useLogin();
  const params = useSearchParams();
  const justRegistered = params.get("registered");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: Form) => login.mutate(data);

  const handleGoogle = () => {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "https://dropos-v2.onrender.com";
    window.location.href = `${base}/api/auth/google`;
  };

  const fillDemo = (email: string, pw: string) => {
    setValue("email", email);
    setValue("password", pw);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0C0A14", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .auth-input { transition: border-color 0.15s, box-shadow 0.15s; }
        .auth-input:focus { border-color: rgba(107,53,232,0.6) !important; box-shadow: 0 0 0 3px rgba(107,53,232,0.12); }
        .auth-input::placeholder { color: rgba(255,255,255,0.18); }
      `}</style>

      {/* Left panel - desktop only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col p-14"
        style={{ background: "linear-gradient(145deg, #130d26 0%, #0e0820 50%, #080612 100%)" }}>

        {/* Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-120px] left-[-80px] w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(107,53,232,0.35) 0%, transparent 65%)", filter: "blur(60px)" }} />
          <div className="absolute bottom-[-80px] right-[-60px] w-[400px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(192,38,211,0.2) 0%, transparent 65%)", filter: "blur(70px)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 60%)", filter: "blur(40px)" }} />
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 mb-auto">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6B35E8, #3D1C8A)", boxShadow: "0 4px 20px rgba(107,53,232,0.5)" }}>
            <Zap size={16} color="white" />
          </div>
          <span className="text-lg font-black text-white tracking-tight">
            Drop<span style={{ color: "#8B5CF6" }}>OS</span>
          </span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 mt-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{ background: "rgba(107,53,232,0.15)", border: "1px solid rgba(107,53,232,0.3)", color: "#A78BFA" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse inline-block" />
            Live on Vercel
          </div>
          <h1 className="font-black text-white leading-[0.95] tracking-tight mb-6"
            style={{ fontSize: "clamp(44px, 5vw, 64px)", letterSpacing: "-2px" }}>
            Your store.<br />
            <span style={{
              background: "linear-gradient(135deg, #A78BFA 0%, #C4B5FD 40%, #06B6D4 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              Runs itself.
            </span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.4)", maxWidth: 360 }}>
            Launch a dropshipping store in minutes. KIRO handles everything while you sleep.
          </p>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 p-5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(10px)" }}>
          <div className="flex gap-0.5 mb-3">
            {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400" style={{ fontSize: 13 }}>★</span>)}
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.55)", marginBottom: 14 }}>
            I launched my store in one afternoon and made my first sale within a week. KIRO does the heavy lifting.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
              style={{ background: "linear-gradient(135deg, #6B35E8, #C026D3)" }}>A</div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>Adaeze Okonkwo</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Fashion Store Owner, Lagos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative">
        {/* Mobile bg glow */}
        <div className="absolute inset-0 lg:hidden pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #6B35E8, transparent 70%)", filter: "blur(70px)" }} />
        </div>

        <div className="w-full max-w-[380px] relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6B35E8, #3D1C8A)" }}>
              <Zap size={14} color="white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              Drop<span style={{ color: "#8B5CF6" }}>OS</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Welcome back</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
              No account yet?{" "}
              <Link href="/auth/register" style={{ color: "#A78BFA", fontWeight: 600, textDecoration: "none" }}>
                Create one free
              </Link>
            </p>
          </div>

          {justRegistered && (
            <div className="mb-5 px-4 py-3 rounded-xl text-xs font-medium text-emerald-400"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
              Account created. Check your email to verify.
            </div>
          )}

          {/* Google */}
          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold mb-5 transition-opacity hover:opacity-90 active:scale-[.98]"
            style={{ background: "#ffffff", color: "#111", boxShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>or sign in with email</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 6 }}>
                Email address
              </label>
              <input {...register("email")} type="email" placeholder="you@example.com"
                className="auth-input w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${errors.email ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.08)"}` }}
              />
              {errors.email && <p style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>Password</label>
                <Link href="/auth/forgot-password" style={{ fontSize: 12, color: "#8B5CF6", fontWeight: 500, textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input {...register("password")} type={show ? "text" : "password"} placeholder="Your password"
                  className="auth-input w-full px-4 py-3 pr-11 rounded-xl text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${errors.password ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.08)"}` }}
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-60"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={login.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[.98] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #6B35E8 0%, #3D1C8A 100%)", boxShadow: "0 4px 20px rgba(107,53,232,0.4)", marginTop: 4 }}>
              {login.isPending
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in</>
                : <>Sign in <ArrowRight size={15} /></>
              }
            </button>
          </form>

          {/* Demo */}
          <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.2)", marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Quick demo
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Admin",  email: "admin@dropos.io", pw: "Admin123!", color: "#8B5CF6" },
                { label: "Owner",  email: "owner@dropos.io", pw: "Owner123!", color: "#10B981" },
              ].map(d => (
                <button key={d.label} onClick={() => fillDemo(d.email, d.pw)}
                  className="px-3 py-2.5 rounded-xl text-left transition-opacity hover:opacity-80 active:scale-[.97]"
                  style={{ background: `${d.color}12`, border: `1px solid ${d.color}22` }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{d.label}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>{d.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0C0A14" }}>
        <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    }>
      <LoginInner />
    </Suspense>
  );
}
