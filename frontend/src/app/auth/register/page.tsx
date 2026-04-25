"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Zap, ArrowRight, Mail, Lock, User, Check } from "lucide-react";
import { useRegister } from "../../../hooks/useAuth";

const schema = z.object({
  name:     z.string().min(2, "Name is too short"),
  email:    z.string().email("Enter a valid email"),
  password: z.string()
    .min(8,       "At least 8 characters")
    .regex(/[A-Z]/, "One uppercase letter")
    .regex(/[a-z]/, "One lowercase letter")
    .regex(/\d/,    "One number"),
});
type Form = z.infer<typeof schema>;

const checks = [
  { label: "8+ characters",    test: (v: string) => v.length >= 8      },
  { label: "Uppercase letter", test: (v: string) => /[A-Z]/.test(v)   },
  { label: "Number",           test: (v: string) => /\d/.test(v)       },
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw]         = useState("");
  const reg = useRegister();

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: Form) => reg.mutate(data);

  const handleGoogle = () => {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "https://dropos-v2.onrender.com";
    window.location.href = `${base}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#0A0812" }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, #6B35E8, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="w-full max-w-[380px] relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6B35E8, #3D1C8A)", boxShadow: "0 4px 16px rgba(107,53,232,0.4)" }}>
            <Zap size={16} color="white" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            Drop<span style={{ color: "#8B5CF6" }}>OS</span>
          </span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-black text-white mb-1.5 tracking-tight">Create your account</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Already have one?{" "}
            <Link href="/auth/login" className="font-semibold transition-opacity hover:opacity-70" style={{ color: "#A78BFA" }}>
              Sign in
            </Link>
          </p>
        </div>

        {/* Google */}
        <button onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[.98] mb-5"
          style={{ background: "#fff", color: "#0f172a", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
          <GoogleIcon /> Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.25)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Full name</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }} />
              <input {...register("name")} type="text" placeholder="Your name"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none text-white placeholder-stone-600"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${errors.name ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"}` }}
              />
            </div>
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }} />
              <input {...register("email")} type="email" placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none text-white placeholder-stone-600"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${errors.email ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"}` }}
              />
            </div>
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }} />
              <input {...register("password")} type={showPw ? "text" : "password"} placeholder="Min 8 characters"
                onChange={e => setPw(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none text-white placeholder-stone-600"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${errors.password ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"}` }}
              />
              <button type="button" onClick={() => setShowPw(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                style={{ color: "rgba(255,255,255,0.3)", border: "none", background: "none", cursor: "pointer" }}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {/* Password strength */}
            {pw.length > 0 && (
              <div className="flex gap-2 mt-2">
                {checks.map(c => {
                  const ok = c.test(pw);
                  return (
                    <div key={c.label} className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 ${ok ? "bg-emerald-500" : "bg-white/10"}`}>
                        {ok && <Check size={8} color="white" strokeWidth={3} />}
                      </div>
                      <span className="text-[10px]" style={{ color: ok ? "#34d399" : "rgba(255,255,255,0.25)" }}>{c.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button type="submit" disabled={reg.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-50 mt-1"
            style={{ background: "linear-gradient(135deg, #6B35E8, #3D1C8A)", boxShadow: "0 4px 20px rgba(107,53,232,0.4)" }}>
            {reg.isPending
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account</>
              : <>Create account <ArrowRight size={15} /></>
            }
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.2)" }}>
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline hover:opacity-70" style={{ color: "rgba(255,255,255,0.35)" }}>Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:opacity-70" style={{ color: "rgba(255,255,255,0.35)" }}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
