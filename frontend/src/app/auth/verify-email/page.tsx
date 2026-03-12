"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

function VerifyEmailPageInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "notoken">(
    token ? "loading" : "notoken"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    api.get(`/auth/verify-email/${token}`)
      .then(() => { setStatus("success"); setTimeout(() => router.push("/auth/login?verified=true"), 3000); })
      .catch((e) => { setStatus("error"); setMessage(e.response?.data?.message || "Verification failed"); });
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="[background:var(--bg-elevated)]/80 backdrop-blur rounded-3xl border [border-color:var(--border)]/50 p-10 shadow-2xl text-center">

          {status === "loading" && (
            <>
              <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-6">
                <Loader2 size={36} className="text-violet-400 animate-spin" />
              </div>
              <h1 className="text-2xl font-black [color:var(--text-primary)] mb-3">Verifying Your Email</h1>
              <p className="text-slate-400">Please wait a moment…</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle size={40} className="text-emerald-400" />
              </div>
              <h1 className="text-2xl font-black [color:var(--text-primary)] mb-3">Email Verified! 🎉</h1>
              <p className="text-slate-400 mb-6">Your account is now active. Redirecting you to login…</p>
              <div className="w-full [background:var(--bg-card)] rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full animate-[grow_3s_linear_forwards]" />
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <XCircle size={40} className="text-red-400" />
              </div>
              <h1 className="text-2xl font-black [color:var(--text-primary)] mb-3">Verification Failed</h1>
              <p className="text-slate-400 mb-6">{message || "This link may have expired or already been used."}</p>
              <Link href="/auth/login"
                className="w-full inline-block py-3 rounded-xl [color:var(--text-primary)] text-sm font-bold"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                Back to Login
              </Link>
            </>
          )}

          {status === "notoken" && (
            <>
              <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-6">
                <Mail size={40} className="text-violet-400" />
              </div>
              <h1 className="text-2xl font-black [color:var(--text-primary)] mb-3">Check Your Email</h1>
              <p className="text-slate-400 mb-6">
                We sent a verification link to your email. Click it to activate your account.
              </p>
              <p className="text-xs text-slate-500 mb-6">
                Didn't get it? Check your spam folder or contact support.
              </p>
              <Link href="/auth/login"
                className="w-full inline-block py-3 rounded-xl text-slate-300 text-sm font-bold border [border-color:var(--border-strong)] hover:[background:var(--bg-card)] transition-all">
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" /></div>}>
      <VerifyEmailPageInner />
    </Suspense>
  );
}
