"use client";
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
