"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const valid = password.length >= 8 && password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch {
      toast.error("Link expired or invalid. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: "var(--bg-base)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(107,53,232,0.06),transparent 70%)" }} />
      </div>
      <div className="w-full max-w-sm relative z-10">
        <div className="rounded-3xl p-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>
            <ArrowLeft size={14} /> Back to login
          </Link>
          {success ? (
            <div className="text-center py-4">
              <h1 className="text-2xl font-black tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>Password updated</h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Redirecting you to login...</p>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-black tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>New password</h1>
              <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>Choose a strong password for your account.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>New password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters" required className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-10"
                      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70">
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Confirm password</label>
                  <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your password" required className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                  {confirm && !valid && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>Passwords do not match</p>}
                </div>
                <button type="submit" disabled={loading || !valid}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--violet-500)" }}>
                  {loading ? "Updating..." : "Update password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg-base)" }} />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
