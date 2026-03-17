"use client";

// src/app/auth/login/page.tsx
import { Suspense, useState } from "react";
import { Logo } from "../../../components/Logo";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Zap, AlertCircle } from "lucide-react";
import { useLogin } from "../../../hooks/useAuth";
import { useSearchParams } from "next/navigation";

const schema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});
type FormData = z.infer<typeof schema>;

function LoginPageInner() {
  const [show, setShow] = useState(false);
  const login = useLogin();
  const params = useSearchParams();
  const registered = params.get("registered");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => login.mutate(data);

  const fillDemo = (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[.07]"
          style={{ background: "radial-gradient(circle,#7c3aed,transparent 70%)" }} />
      </div>

      <div className="animate-fade w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-2xl shadow-violet-500/40 [background:linear-gradient(135deg,#7C3AED,#8B5CF6)]">
            <Zap size={24} className="[color:var(--text-primary)]" />
          </div>
          <Logo variant="light" size="lg" />
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {registered && (
          <div className="mb-4 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-800/40 rounded-xl px-3 py-2.5">
            <AlertCircle size={13} /> Account created! Check your email to verify.
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email address</label>
              <input
                {...register("email")}
                type="email" placeholder="you@example.com"
                className="w-full [background:var(--bg-elevated)] border [border-color:var(--border)] rounded-xl px-4 py-3 text-sm [color:var(--text-primary)] placeholder-slate-500 outline-none focus:border-violet-500 transition-all"
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={show ? "text" : "password"} placeholder="••••••••"
                  className="w-full [background:var(--bg-elevated)] border [border-color:var(--border)] rounded-xl px-4 py-3 pr-11 text-sm [color:var(--text-primary)] placeholder-slate-500 outline-none focus:border-violet-500 transition-all"
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs text-violet-400 hover:text-violet-300">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={login.isPending}
              className="w-full py-3 rounded-xl text-sm font-bold [color:var(--text-primary)] shadow-lg shadow-violet-500/30 hover:opacity-90 active:scale-[.98] disabled:opacity-60 transition-all [background:linear-gradient(135deg,#7C3AED,#8B5CF6)]">
              {login.isPending ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-xs text-slate-500 font-semibold mb-3">Quick fill demo accounts</p>
            <div className="space-y-2">
              {[
                { label: "Super Admin",  e: "admin@dropos.io", p: "Admin123!", c: "text-violet-400" },
                { label: "Store Owner",  e: "owner@dropos.io", p: "Owner123!", c: "text-emerald-400" },
              ].map((d) => (
                <button key={d.e} onClick={() => fillDemo(d.e, d.p)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl [background:var(--bg-elevated)] hover:[background:var(--bg-card)] transition-all text-left">
                  <span className={`text-xs font-bold ${d.c}`}>{d.label}</span>
                  <span className="text-xs text-slate-500 font-mono">{d.e}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 mt-5">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-violet-400 font-semibold hover:text-violet-300">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" /></div>}>
      <LoginPageInner />
    </Suspense>
  );
}