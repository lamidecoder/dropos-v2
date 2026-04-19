"use client";

import { Suspense , useState} from "react";
import { Logo } from "../../../components/Logo";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "../../../lib/api";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, CheckCircle, Loader2, Zap } from "lucide-react";

const schema = z.object({
  password: z.string()
    .min(8,    "At least 8 characters")
    .regex(/[A-Z]/, "One uppercase letter")
    .regex(/[a-z]/, "One lowercase letter")
    .regex(/\d/,    "One number"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords don't match",
  path:    ["confirm"],
});

function Req({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs" style={{ color: ok ? "var(--success)" : "var(--text-tertiary)" }}>
      <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
        style={{
          background:   ok ? "var(--success)" : "transparent",
          border:       ok ? "none" : "1px solid var(--border-strong)",
        }}>
        {ok && <span className="text-[var(--text-primary)] text-[8px] font-black">✓</span>}
      </div>
      {label}
    </div>
  );
}

const inputCls = "w-full rounded-xl py-3 text-sm outline-none transition-all";
const inputStyle = { background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" };
const onFocus = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-dim)"; };
const onBlur  = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; };

function ResetPasswordPageInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token") || "";
  const [showPwd, setShowPwd] = useState(false);
  const [done, setDone]       = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const pwd = watch("password") || "";
  const checks = {
    length:    pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number:    /\d/.test(pwd),
  };

  const mutation = useMutation({
    mutationFn: ({ password }: any) => authAPI.resetPassword(token, password),
    onSuccess:  () => { setDone(true); setTimeout(() => router.push("/auth/login"), 3000); },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: "var(--bg-base)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(124,58,237,0.06),transparent 70%)" }} />
      </div>

      <div className="animate-fade w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg,#7C3AED,#8B5CF6)", boxShadow: "0 8px 32px rgba(124,58,237,0.35)" }}>
            <Zap size={24} color="white" fill="white" />
          </div>
          <Logo variant="light" size="lg" />
        </div>

        <div className="rounded-2xl p-7" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}>
          {!token ? (
            <div className="text-center py-4">
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Invalid or missing reset token.</p>
              <Link href="/auth/forgot-password" className="font-semibold" style={{ color: "var(--accent)" }}>
                Request a new link
              </Link>
            </div>
          ) : done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <CheckCircle size={28} style={{ color: "var(--success)" }} />
              </div>
              <h2 className="text-xl font-black mb-2" style={{ color: "var(--text-primary)" }}>Password Reset!</h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Redirecting you to login…</p>
            </div>
          ) : (
              <div className="mb-5">
                <h2 className="text-xl font-black mb-1" style={{ color: "var(--text-primary)" }}>New Password</h2>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Choose a strong password for your account</p>
              </div>

              <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>New Password</label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-tertiary)" }} />
                    <input {...register("password")} type={showPwd ? "text" : "password"}
                      className={inputCls + " pl-10 pr-11"} style={inputStyle}
                      onFocus={onFocus} onBlur={onBlur} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: "var(--text-tertiary)" }}>
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-3">
                    <Req ok={checks.length}    label="8+ characters" />
                    <Req ok={checks.uppercase} label="Uppercase letter" />
                    <Req ok={checks.lowercase} label="Lowercase letter" />
                    <Req ok={checks.number}    label="Number" />
                  </div>
                  {errors.password && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Confirm Password</label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-tertiary)" }} />
                    <input {...register("confirm")} type="password"
                      className={inputCls + " pl-10 pr-4"} style={inputStyle}
                      onFocus={onFocus} onBlur={onBlur} />
                  </div>
                  {errors.confirm && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.confirm.message}</p>}
                </div>

                <button type="submit" disabled={mutation.isPending}
                  className="w-full py-3 rounded-xl text-sm font-bold text-[var(--text-primary)] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-all"
                  style={{ background: "#10B981", boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}>
                  {mutation.isPending
                    ? <><Loader2 size={15} className="animate-spin" /> Resetting…</>
                    : "Reset Password"}
                </button>

                {mutation.isError && (
                  <p className="text-xs text-center" style={{ color: "var(--error)" }}>
                    {(mutation.error as any)?.response?.data?.message || "Reset failed. Link may have expired."}
                  </p>
                )}
              </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" /></div>}>
      <ResetPasswordPageInner />
    </Suspense>
  );
}