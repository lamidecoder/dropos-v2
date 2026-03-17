"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import toast from "react-hot-toast";
import {
  Mail, CheckCircle, Send, Zap, ShoppingBag, Truck, CreditCard,
  Star, Package, AlertTriangle, RefreshCw, XCircle, TrendingUp, Gift
} from "lucide-react";

const ALL_EMAILS = [
  { icon: Mail,       color:"var(--accent)", trigger:"On register",       title:"Email Verification",     desc:"Sent when a user signs up. Secure link to verify their email." },
  { icon: Zap,        color:"#10b981", trigger:"After verification", title:"Welcome Email",          desc:"Sent after email verified. Guides user through store setup." },
  { icon: Mail,       color:"#3b82f6", trigger:"On request",         title:"Password Reset",         desc:"Sent when user requests reset. Link expires in 1 hour." },
  { icon: ShoppingBag,color:"#10b981", trigger:"On new order",       title:"Order Confirmation",     desc:"Sent to customer immediately after a successful order." },
  { icon: Zap,        color:"var(--accent)", trigger:"On new order",       title:"New Order Alert",        desc:"Sent to store owner when a new order arrives." },
  { icon: Truck,      color:"#3b82f6", trigger:"On status change",   title:"Order Status Updates",   desc:"Processing, Shipped, Delivered, Cancelled — all covered." },
  { icon: CreditCard, color:"var(--accent)", trigger:"On upgrade",         title:"Subscription Activated", desc:"Sent when user upgrades to Pro or Advanced plan." },
  { icon: AlertTriangle,color:"#f59e0b",trigger:"7 days before",     title:"Subscription Expiring",  desc:"Reminds user to renew before plan expires." },
  { icon: XCircle,    color:"#ef4444", trigger:"On cancellation",    title:"Subscription Cancelled", desc:"Sent when plan is cancelled. Includes access-until date." },
  { icon: Star,       color:"#f59e0b", trigger:"On new review",      title:"New Review Alert",       desc:"Notifies store owner when a customer submits a review." },
  { icon: Package,    color:"#ef4444", trigger:"Manual / auto",      title:"Low Stock Alert",        desc:"Emailed when products drop below 5 units." },
  { icon: XCircle,    color:"#ef4444", trigger:"On payment fail",    title:"Payment Failed",         desc:"Notifies customer when their payment couldn't be processed." },
  { icon: TrendingUp, color:"#10b981", trigger:"On refund",          title:"Refund Processed",       desc:"Confirms refund with amount and 3–5 day timeline." },
  { icon: TrendingUp, color:"#7c3aed", trigger:"Weekly (auto)",      title:"Weekly Digest",          desc:"Sends store owner a weekly revenue and orders summary." },
  { icon: Gift,       color:"var(--accent)", trigger:"On referral join",   title:"Referral Joined",        desc:"Notifies referrer when someone signs up with their link." },
];

export default function EmailsPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;

  const { data: status } = useQuery({
    queryKey: ["email-status"],
    queryFn: async () => (await api.get("/email/status")).data.data,
  });

  const testMutation = useMutation({
    mutationFn: () => api.post("/email/test"),
    onSuccess: (res) => toast.success(
      res.data.devMode
        ? "Dev mode — check backend terminal for preview"
        : "Test email sent! Check your inbox."
    ),
    onError: () => toast.error("Failed to send test email"),
  });

  const lowStockMutation = useMutation({
    mutationFn: () => api.post(`/email/low-stock-check/${storeId}`),
    onSuccess: (res) => toast.success(res.data.message),
    onError: () => toast.error("Failed to run low stock check"),
  });

  const configured = status?.configured;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Email System</h1>
        <p className="text-secondary text-sm mt-1">15 automated emails keeping your customers and yourself informed.</p>
      </div>

      {/* Status */}
      <div className="rounded-2xl p-5 flex items-start gap-4"
        style={{
          background: configured ? "rgba(16,185,129,0.05)" : "rgba(201,168,76,0.05)",
          border: `1px solid ${configured ? "rgba(16,185,129,0.2)" : "rgba(201,168,76,0.2)"}`,
        }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: configured ? "rgba(16,185,129,0.1)" : "rgba(201,168,76,0.1)" }}>
          {configured
            ? <CheckCircle size={18} className="text-emerald-400" />
            : <AlertTriangle size={18} className="[color:var(--accent)]" />}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm" style={{ color: configured ? "#10b981" : "var(--accent)" }}>
            {configured ? "Email active — sending real emails" : "Dev mode — emails logged to terminal"}
          </h3>
          <p className="text-secondary text-xs mt-1">
            {configured
              ? `From: ${status?.from}  ·  SMTP: ${status?.smtpHost}`
              : "Add SMTP credentials to backend/.env to send real emails."}
          </p>
          {!configured && (
            <div className="mt-3 p-3 rounded-xl font-mono text-xs space-y-0.5"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <div className="text-tertiary"># backend/.env</div>
              <div><span className="[color:var(--accent)]">SMTP_USER</span>=<span className="text-secondary">you@gmail.com</span></div>
              <div><span className="[color:var(--accent)]">SMTP_PASS</span>=<span className="text-secondary">your_app_password</span></div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          {
            icon: Send, color: "#7c3aed", label: "Send Test Email",
            sub: `Sends to ${user?.email}`,
            onClick: () => testMutation.mutate(),
            loading: testMutation.isPending,
          },
          ...(storeId ? [{
            icon: Package, color: "var(--accent)", label: "Check Low Stock",
            sub: "Email products under 5 units",
            onClick: () => lowStockMutation.mutate(),
            loading: lowStockMutation.isPending,
          }] : []),
        ].map((a, i) => (
          <button key={i} onClick={a.onClick} disabled={a.loading}
            className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${a.color}15`, border: `1px solid ${a.color}25` }}>
              {a.loading
                ? <RefreshCw size={15} style={{ color: a.color }} className="animate-spin" />
                : <a.icon size={15} style={{ color: a.color }} />}
            </div>
            <div>
              <div className="[color:var(--text-primary)] font-bold text-sm">{a.label}</div>
              <div className="text-secondary text-xs mt-0.5">{a.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* All emails */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="[color:var(--text-primary)] font-bold text-sm">All Automated Emails</h2>
          <span className="text-secondary text-xs">{ALL_EMAILS.length} emails active</span>
        </div>
        <div className="space-y-1.5">
          {ALL_EMAILS.map((e, i) => (
            <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl transition-all"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${e.color}12`, border: `1px solid ${e.color}20` }}>
                <e.icon size={13} style={{ color: e.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="[color:var(--text-primary)] font-semibold text-xs">{e.title}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${e.color}12`, color: e.color, border: `1px solid ${e.color}20` }}>
                    {e.trigger}
                  </span>
                </div>
                <p className="text-secondary text-[11px] mt-0.5 truncate">{e.desc}</p>
              </div>
              <CheckCircle size={13} className="flex-shrink-0" style={{ color: "rgba(16,185,129,0.4)" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Gmail guide */}
      <div className="p-5 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h3 className="[color:var(--text-primary)] font-bold text-sm mb-3">📧 Gmail SMTP setup (free)</h3>
        <ol className="space-y-2">
          {[
            ["Go to", "myaccount.google.com → Security → 2-Step Verification (enable it)"],
            ["Search", '"App passwords" → create one for Mail'],
            ["Copy", "the 16-character app password shown"],
            ["Paste", "into backend/.env as SMTP_PASS, your Gmail as SMTP_USER"],
            ["Restart", "the backend server — done!"],
          ].map(([step, text], i) => (
            <li key={i} className="flex gap-2.5 text-xs text-secondary">
              <span className="[color:var(--accent)] font-black flex-shrink-0">{i + 1}.</span>
              <span><span className="text-secondary font-semibold">{step}</span> {text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
