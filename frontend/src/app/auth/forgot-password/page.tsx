"use client";

import { useState } from "react";
import { Logo } from "../../../components/Logo";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "../../../lib/api";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

const schema = z.object({ email: z.string().email("Enter a valid email") });

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: ({ email }: { email: string }) => authAPI.forgotPassword(email),
    onSuccess:  () => setSent(true),
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
            <Mail size={22} color="white" />
          </div>
          <Logo variant="light" size="lg" />
        </div>

        <div className="rounded-2xl p-7" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}>
          {!sent ? (
              <div className="mb-6">
                <h2 className="text-xl font-black mb-1" style={{ color: "var(--text-primary)" }}>Reset Password</h2>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-tertiary)" }} />
                    <input {...register("email")} type="email" placeholder="you@example.com"
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                      onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-dim)"; }}
                      onBlur={e  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                  {errors.email && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.email.message}</p>}
                </div>

                <button type="submit" disabled={mutation.isPending}
                  className="w-full py-3 rounded-xl text-sm font-bold text-[var(--text-primary)] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-all"
                  style={{ background: "#10B981", boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}>
                  {mutation.isPending
                    ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
                    : "Send Reset Link"}
                </button>

                {mutation.isError && (
                  <p className="text-xs text-center" style={{ color: "var(--error)" }}>
                    {(mutation.error as any)?.response?.data?.message || "Something went wrong"}
                  </p>
                )}
              </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <CheckCircle size={28} style={{ color: "var(--success)" }} />
              </div>
              <h2 className="text-xl font-black mb-2" style={{ color: "var(--text-primary)" }}>Check Your Email</h2>
              <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>We sent a reset link to</p>
              <p className="font-bold text-sm mb-5" style={{ color: "var(--accent)" }}>{getValues("email")}</p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Didn't get it? Check spam or wait a few minutes.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/auth/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
              style={{ color: "var(--text-secondary)" }}>
              <ArrowLeft size={13} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
