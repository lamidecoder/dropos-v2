"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
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
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(107,53,232,0.12)" }}>
                <Mail size={24} style={{ color: "var(--violet-400)" }} />
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>Check your email</h1>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                We sent a reset link to <strong style={{ color: "var(--text-primary)" }}>{email}</strong>.
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-black tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>Reset password</h1>
              <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>Enter your email and we will send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Email address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
                <button type="submit" disabled={loading || !email}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--violet-500)" }}>
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
