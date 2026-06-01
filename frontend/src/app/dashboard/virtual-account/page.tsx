"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { CreditCard, Copy, Check, Building2, Zap, RefreshCw, ArrowRight, AlertCircle } from "lucide-react";

const V = { v400:"#8B5CF6", v300:"#A78BFA", green:"#10B981", amber:"#F59E0B" };

export default function VirtualAccountPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    bg:     isDark ? "#06040D" : "#F4F2FB",
    card:   isDark ? "rgba(255,255,255,0.03)" : "#fff",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.5)" : "rgba(19,13,46,0.5)",
    border: isDark ? "rgba(107,53,232,0.12)" : "rgba(107,53,232,0.1)",
    faint:  isDark ? "rgba(107,53,232,0.06)" : "rgba(107,53,232,0.04)",
  };

  const user = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const [copied, setCopied] = useState<string | null>(null);

  const { data: va, isLoading, refetch } = useQuery({
    queryKey: ["virtual-account", storeId],
    queryFn: () => api.get(`/virtual-account/${storeId}`).then(r => r.data.data),
    enabled: !!storeId,
  });

  const createMut = useMutation({
    mutationFn: () => api.post(`/virtual-account/${storeId}/create`),
    onSuccess: () => refetch(),
  });

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const paymentInstructions = `Bank: ${va?.bankName || "Titan Bank"}
Account: ${va?.accountNumber || "—"}
Name: ${va?.accountName || "—"}

Transfer your order amount to this account.
Your order will be confirmed automatically.`;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: t.text, marginBottom: 4, letterSpacing:"-0.03em" }}>
          Virtual Bank Account
        </h1>
        <p style={{ fontSize: 13, color: t.muted }}>
          Your dedicated store account number — customers pay directly via bank transfer
        </p>
      </motion.div>

      {/* Main account card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{
          borderRadius: 20, padding: 28, marginBottom: 16,
          background: va?.accountNumber
            ? "linear-gradient(135deg, #2D1B69, #1A0B4A)"
            : t.card,
          border: `1px solid ${va?.accountNumber ? "rgba(167,139,250,0.3)" : t.border}`,
        }}>
        {va?.accountNumber ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Building2 size={18} color="#C4B5FD"/>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#C4B5FD", margin: 0 }}>{va.bankName}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0 }}>Dedicated Store Account</p>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "rgba(16,185,129,0.15)", padding: "4px 10px", borderRadius: 99 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: V.green }}/>
                <span style={{ fontSize: 10, fontWeight: 700, color: V.green }}>ACTIVE</span>
              </div>
            </div>

            {[
              { label: "Account Number", value: va.accountNumber, key: "num" },
              { label: "Account Name",   value: va.accountName,   key: "name" },
              { label: "Bank",           value: va.bankName,       key: "bank" },
            ].map(f => (
              <div key={f.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0 }}>{f.label}</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: "2px 0 0", letterSpacing: f.key === "num" ? "0.1em" : "normal" }}>
                    {f.value}
                  </p>
                </div>
                <button onClick={() => copy(f.value, f.key)}
                  style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", borderRadius: 8, padding: "8px 12px", color: "#fff", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
                  {copied === f.key ? <><Check size={12}/> Copied</> : <><Copy size={12}/> Copy</>}
                </button>
              </div>
            ))}

            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <button onClick={() => copy(paymentInstructions, "all")}
                style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {copied === "all" ? <><Check size={13}/> Copied!</> : <><Copy size={13}/> Copy Payment Instructions</>}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: t.faint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Building2 size={24} color={V.v400}/>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: "0 0 8px" }}>Get your store's bank account</h3>
            <p style={{ fontSize: 13, color: t.muted, maxWidth: 360, margin: "0 auto 24px", lineHeight: 1.6 }}>
              Generate a dedicated account number for your store. Customers pay via bank transfer — money arrives instantly.
            </p>
            <button onClick={() => createMut.mutate()}
              disabled={createMut.isPending || !storeId}
              style={{ padding: "13px 28px", borderRadius: 12, border: "none", cursor: "pointer", background: V.v400, color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 8 }}>
              {createMut.isPending ? <><RefreshCw size={14} style={{ animation: "spin 0.7s linear infinite" }}/> Generating...</> : <><Zap size={14}/> Generate Account Number</>}
            </button>
            <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
          </div>
        )}
      </motion.div>

      {/* How it works */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ borderRadius: 16, padding: 24, background: t.card, border: `1px solid ${t.border}`, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: "0 0 16px" }}>How it works</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { n: "01", title: "Share your account number", desc: "Post it on WhatsApp Status, Instagram bio, or include it in your checkout page." },
            { n: "02", title: "Customer pays directly", desc: "They transfer the order amount to your account via their banking app. No Paystack popup." },
            { n: "03", title: "Order confirmed automatically", desc: "Webhook matches the payment to the order. Fulfillment starts immediately." },
          ].map(s => (
            <div key={s.n} style={{ display: "flex", gap: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: V.v400, minWidth: 24 }}>{s.n}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: "0 0 3px" }}>{s.title}</p>
                <p style={{ fontSize: 12, color: t.muted, margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Alert */}
      <div style={{ borderRadius: 14, padding: "14px 18px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", display: "flex", gap: 10 }}>
        <AlertCircle size={15} color={V.amber} style={{ flexShrink: 0, marginTop: 1 }}/>
        <p style={{ fontSize: 12, color: t.muted, margin: 0, lineHeight: 1.6 }}>
          Requires Paystack KYC verification to be complete. If generation fails, ensure your Paystack business account is fully verified in your <strong>Settings → Payments</strong>.
        </p>
      </div>
    </div>
  );
}
