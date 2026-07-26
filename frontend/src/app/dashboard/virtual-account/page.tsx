"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Building2, Copy, Check, Zap, RefreshCw, ExternalLink, Info } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500: "#6B35E8", v400: "#8B5CF6", green: "#10B981", amber: "#F59E0B" };

function CopyField({ label, value, t }: any) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true); toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: t.muted, margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 12, background: t.faint, border: `1px solid ${t.border}` }}>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: t.text, fontFamily: "monospace", letterSpacing: "0.04em" }}>{value}</span>
        <button onClick={copy} style={{ border: "none", background: "none", cursor: "pointer", padding: 4, color: copied ? V.green : t.muted }}>
          {copied ? <Check size={14}/> : <Copy size={14}/>}
        </button>
      </div>
    </div>
  );
}

export default function VirtualAccountPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const user = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;

  const t = {
    card: isDark ? "#181230" : "#fff", border: isDark ? "rgba(255,255,255,0.07)" : "rgba(107,53,232,0.08)",
    text: isDark ? "#F0ECFF" : "#130D2E", muted: isDark ? "rgba(240,236,255,0.45)" : "rgba(19,13,46,0.55)",
    faint: isDark ? "rgba(255,255,255,0.03)" : "rgba(107,53,232,0.03)",
  };

  const { data: va, isLoading, refetch } = useQuery({
    queryKey: ["virtual-account", storeId],
    queryFn: () => api.get(`/payments/virtual-account/${storeId}`).then(r => r.data.data),
    enabled: !!storeId,
    retry: 1,
  });

  const createMut = useMutation({
    mutationFn: () => api.post(`/payments/virtual-account/${storeId}`, { name: user?.name, email: user?.email }),
    onSuccess: () => { toast.success("Virtual account created!"); refetch(); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Could not create account — ensure your bank is connected in Settings → Payments"),
  });

  const steps = [
    { icon: "💳", title: "Share your account number", desc: "Customers pay directly to your dedicated account number — no checkout needed." },
    { icon: "⚡", title: "Instant confirmation", desc: "DropOS detects payment automatically. No manual marking required." },
    { icon: "📦", title: "Order created automatically", desc: "A new order is created for each payment received, with customer details." },
  ];

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: "linear-gradient(135deg,#2D1B69,#6B35E8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={20} color="#C4B5FD"/>
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: t.text, margin: 0, letterSpacing: "-0.03em" }}>Virtual Bank Account</h1>
            <p style={{ fontSize: 12, color: t.muted, margin: 0 }}>Receive payments without Paystack checkout</p>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div style={{ padding: 24, borderRadius: 18, background: t.card, border: `1px solid ${t.border}` }}>
          {[80, 60, 80].map((w, i) => (
            <div key={i} style={{ height: 16, borderRadius: 6, background: t.faint, width: `${w}%`, marginBottom: 12, animation: "pulse 1.5s ease-in-out infinite" }}/>
          ))}
          <style>{"@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}"}</style>
        </div>
      ) : va?.accountNumber ? (
        /* Active virtual account */
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Account details card */}
          <div style={{ padding: 24, borderRadius: 20, background: "linear-gradient(135deg,#2D1B69,#1A0B4A)", marginBottom: 16, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(167,139,250,0.15)", filter: "blur(40px)" }}/>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: V.green, boxShadow: `0 0 8px ${V.green}` }}/>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.08em" }}>ACTIVE ACCOUNT</span>
              </div>
              <div style={{ display: "grid", gap: 14 }}>
                {[
                  { label: "Account Number", value: va.accountNumber },
                  { label: "Bank Name", value: va.bankName || "Wema Bank" },
                  { label: "Account Name", value: va.accountName || user?.name },
                ].map(f => (
                  <div key={f.label}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", margin: "0 0 4px", letterSpacing: "0.08em" }}>{f.label.toUpperCase()}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: f.label === "Account Number" ? 22 : 14, fontWeight: 900, color: "#fff", letterSpacing: f.label === "Account Number" ? "0.06em" : 0, fontFamily: f.label === "Account Number" ? "monospace" : "inherit" }}>
                        {f.value}
                      </span>
                      <button onClick={() => { navigator.clipboard.writeText(f.value); toast.success(`${f.label} copied`); }}
                        style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6, padding: "3px 6px", cursor: "pointer", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center" }}>
                        <Copy size={11}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Payments received", value: va.totalReceived ?? "₦0" },
              { label: "This month", value: va.monthlyTotal ?? "₦0" },
              { label: "Transactions", value: va.transactionCount ?? 0 },
            ].map(s => (
              <div key={s.label} style={{ padding: "14px 16px", borderRadius: 14, background: t.card, border: `1px solid ${t.border}` }}>
                <p style={{ fontSize: 16, fontWeight: 900, color: t.text, margin: "0 0 2px" }}>{s.value}</p>
                <p style={{ fontSize: 10, color: t.muted, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>

          <button onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", color: t.muted, fontSize: 12, fontWeight: 600 }}>
            <RefreshCw size={12}/> Refresh balance
          </button>
        </motion.div>
      ) : (
        /* Create account CTA */
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ padding: 28, borderRadius: 20, background: t.card, border: `1px solid ${t.border}`, marginBottom: 16, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(107,53,232,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <Building2 size={28} color={V.v400}/>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: t.text, margin: "0 0 8px" }}>Get your account number</h2>
            <p style={{ fontSize: 14, color: t.muted, margin: "0 0 24px", lineHeight: 1.6 }}>
              A dedicated Nigerian bank account number your customers can transfer to directly — no payment link needed.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 11, background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)", marginBottom: 20, textAlign: "left" }}>
              <Info size={13} color={V.amber} style={{ flexShrink: 0 }}/>
              <p style={{ fontSize: 12, color: V.amber, margin: 0, lineHeight: 1.5 }}>
                Requires your bank account to be connected in <strong>Settings → Payments</strong> first.
              </p>
            </div>
            <button onClick={() => createMut.mutate()} disabled={createMut.isPending}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${V.v500},#3D1C8A)`, color: "#fff", fontSize: 14, fontWeight: 700, boxShadow: "0 6px 20px rgba(107,53,232,0.25)" }}>
              {createMut.isPending ? "Creating…" : <><Zap size={14}/> Create my account number</>}
            </button>
          </div>
        </motion.div>
      )}

      {/* How it works */}
      <div style={{ padding: 20, borderRadius: 18, background: t.faint, border: `1px solid ${t.border}` }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: t.muted, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.08em" }}>How it works</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: "0 0 2px" }}>{s.title}</p>
                <p style={{ fontSize: 12, color: t.muted, margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
