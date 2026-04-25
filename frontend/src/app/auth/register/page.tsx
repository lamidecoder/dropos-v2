"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Zap, ArrowRight, Check } from "lucide-react";
import { useRegister } from "../../../hooks/useAuth";

const schema = z.object({
  name:     z.string().min(2, "Name is too short"),
  email:    z.string().email("Enter a valid email"),
  password: z.string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "One uppercase letter")
    .regex(/[a-z]/, "One lowercase letter")
    .regex(/\d/, "One number"),
});
type Form = z.infer<typeof schema>;

const pwChecks = [
  { label: "8+ characters",    test: (v: string) => v.length >= 8     },
  { label: "Uppercase",        test: (v: string) => /[A-Z]/.test(v)  },
  { label: "Number",           test: (v: string) => /\d/.test(v)      },
];

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
    <div className="min-h-screen flex" style={{ background: "#0C0A14", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .auth-input { transition: border-color 0.15s, box-shadow 0.15s; }
        .auth-input:focus { border-color: rgba(107,53,232,0.6) !important; box-shadow: 0 0 0 3px rgba(107,53,232,0.12); }
        .auth-input::placeholder { color: rgba(255,255,255,0.18); }
      `}</style>

      {/* Left visual panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col p-14"
        style={{ background: "linear-gradient(145deg, #130d26 0%, #0e0820 50%, #080612 100%)" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-100px] right-[-60px] w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(107,53,232,0.3) 0%, transparent 65%)", filter: "blur(70px)" }} />
          <div className="absolute bottom-[-60px] left-[-40px] w-[380px] h-[380px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(192,38,211,0.2) 0%, transparent 65%)", filter: "blur(60px)" }} />
        </div>
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6B35E8, #3D1C8A)", boxShadow: "0 4px 20px rgba(107,53,232,0.5)" }}>
            <Zap size={16} color="white" />
          </div>
          <span className="text-lg font-black text-white tracking-tight">
            Drop<span style={{ color: "#8B5CF6" }}>OS</span>
          </span>
        </div>

        <div className="relative z-10 mt-auto mb-10">
          <h1 className="font-black text-white leading-[0.95] tracking-tight mb-6"
            style={{ fontSize: "clamp(44px, 5vw, 62px)", letterSpacing: "-2px" }}>
            Start selling<br />
            <span style={{
              background: "linear-gradient(135deg, #A78BFA 0%, #C4B5FD 40%, #06B6D4 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              in 60 seconds.
            </span>
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: "rgba(255,255,255,0.4)", maxWidth: 340 }}>
            No experience needed. KIRO builds your store, writes your listings, and finds your first customers.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-3">
          {[
            { label: "Store live in under 60 seconds",           color: "#8B5CF6" },
            { label: "KIRO AI handles products and orders",      color: "#06B6D4" },
            { label: "Paystack payments built in",               color: "#10B981" },
            { label: "Free plan, no credit card needed",         color: "#F59E0B" },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${f.color}20`, border: `1px solid ${f.color}40` }}>
                <Check size={10} style={{ color: f.color }} strokeWidth={3} />
              </div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 lg:hidden pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #6B35E8, transparent 70%)", filter: "blur(70px)" }} />
        </div>

        <div className="w-full max-w-[380px] relative z-10">
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
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Create your account</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
              Already have one?{" "}
              <Link href="/auth/login" style={{ color: "#A78BFA", fontWeight: 600, textDecoration: "none" }}>
                Sign in
              </Link>
            </p>
          </div>

          {/* Google */}
          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold mb-5 transition-opacity hover:opacity-90 active:scale-[.98]"
            style={{ background: "#ffffff", color: "#111", boxShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>or with email</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* Name */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 6 }}>
                Full name
              </label>
              <input {...register("name")} type="text" placeholder="Your name"
                className="auth-input w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${errors.name ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.08)"}` }}
              />
              {errors.name && <p style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>{errors.name.message}</p>}
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 6 }}>
                Password
              </label>
              <div className="relative">
                <input {...register("password")} type={showPw ? "text" : "password"} placeholder="Min 8 characters"
                  onChange={e => setPw(e.target.value)}
                  className="auth-input w-full px-4 py-3 pr-11 rounded-xl text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${errors.password ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.08)"}` }}
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-60"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password strength */}
              {pw.length > 0 && (
                <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                  {pwChecks.map(c => {
                    const ok = c.test(pw);
                    return (
                      <div key={c.label} className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all"
                          style={{ background: ok ? "#10B981" : "rgba(255,255,255,0.08)", border: `1px solid ${ok ? "#10B981" : "rgba(255,255,255,0.12)"}` }}>
                          {ok && <Check size={8} color="white" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: 11, color: ok ? "#34d399" : "rgba(255,255,255,0.25)", fontWeight: ok ? 600 : 400 }}>
                          {c.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button type="submit" disabled={reg.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[.98] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #6B35E8 0%, #3D1C8A 100%)", boxShadow: "0 4px 20px rgba(107,53,232,0.4)", marginTop: 4 }}>
              {reg.isPending
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account</>
                : <>Create free account <ArrowRight size={15} /></>
              }
            </button>
          </form>

          <p className="text-center mt-6" style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
            By signing up you agree to our{" "}
            <Link href="/terms" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "underline" }}>Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "underline" }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
