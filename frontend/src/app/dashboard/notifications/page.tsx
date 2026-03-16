"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { PushNotificationSettings } from "@/components/ui/PushNotificationSettings";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import { Bell, Mail, MessageSquare, Zap, ShoppingBag, Package, Star, CreditCard } from "lucide-react";

// ── Toggle row ────────────────────────────────────────────────────────────────
function ToggleRow({
  icon: Icon, label, description, value, color, onChange,
}: {
  icon: any; label: string; description: string;
  value: boolean; color: string; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl transition-all"
      style={{ background: value ? color + "08" : "var(--bg-secondary)", border: `1px solid ${value ? color + "25" : "var(--border)"}` }}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: color + "18", border: `1px solid ${color}30` }}>
          <Icon size={14} style={{ color }} />
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{label}</div>
          <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>{description}</div>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
        style={{ background: value ? "#10B981" : "var(--border-strong)" }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
          style={{ left: value ? "calc(100% - 22px)" : "2px" }}
        />
      </button>
    </div>
  );
}

// ── Channel pill ──────────────────────────────────────────────────────────────
function ChannelPill({
  icon: Icon, label, active, onClick,
}: {
  icon: any; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={{
        background: active ? "var(--accent-dim)"  : "var(--bg-secondary)",
        color:      active ? "var(--accent)"      : "var(--text-secondary)",
        border:     `1px solid ${active ? "var(--accent-border)" : "var(--border)"}`,
      }}>
      <Icon size={11} />
      {label}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const qc      = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["notif-settings", storeId],
    queryFn:  () => api.get(`/notification-settings/${storeId}`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  const saveMut = useMutation({
    mutationFn: (d: any) => api.put(`/notification-settings/${storeId}`, d),
    onSuccess:  () => { toast.success("Settings saved"); qc.invalidateQueries({ queryKey: ["notif-settings"] });
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed")) },
  });

  const [channel, setChannel] = useState<"push"|"email"|"sms">("push");

  const notifRows = [
    { key: "newOrder",      icon: ShoppingBag, label: "New orders",          description: "When a customer places an order",             color: "#10B981" },
    { key: "lowStock",      icon: Package,     label: "Low stock alerts",     description: "When inventory drops below threshold",        color: "#F59E0B" },
    { key: "newReview",     icon: Star,        label: "New reviews",          description: "When a customer leaves a product review",     color: "#7C3AED" },
    { key: "abandonedCart", icon: ShoppingBag, label: "Abandoned carts",      description: "Carts idle for more than 1 hour",             color: "#EF4444" },
    { key: "payout",        icon: CreditCard,  label: "Payouts & billing",    description: "Affiliate payouts, subscription renewals",    color: "#3B82F6" },
    { key: "orderUpdate",   icon: Zap,         label: "Order status updates", description: "Shipping events, delivery confirmations",     color: "#06B6D4" },
  ];

  const toggle = (key: string, val: boolean) => {
    if (!settings) return;
    const updated = { ...settings, [`${channel}_${key}`]: val };
    saveMut.mutate(updated);
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Notifications</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
            Choose how and when you want to be notified about your store activity.
          </p>
        </div>

        {/* Push notification panel */}
        <PushNotificationSettings />

        {/* Channel tabs */}
        <div>
          <div className="text-xs font-bold mb-3" style={{ color: "var(--text-secondary)" }}>
            Notification preferences by channel
          </div>
          <div className="flex gap-2">
            <ChannelPill icon={Bell}         label="Push"  active={channel === "push"}  onClick={() => setChannel("push")}  />
            <ChannelPill icon={Mail}         label="Email" active={channel === "email"} onClick={() => setChannel("email")} />
            <ChannelPill icon={MessageSquare}label="SMS"   active={channel === "sms"}   onClick={() => setChannel("sms")}   />
          </div>
        </div>

        {/* Toggle rows */}
        <div className="space-y-2">
          {notifRows.map(({ key, icon, label, description, color }) => (
            <ToggleRow
              key={key}
              icon={icon}
              label={label}
              description={description}
              color={color}
              value={settings?.[`${channel}_${key}`] ?? true}
              onChange={val => toggle(key, val)}
            />
          ))}
        </div>

        {/* Daily digest */}
        <div className="rounded-2xl p-5"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Daily Digest</div>
              <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Morning summary of yesterday's performance
              </div>
            </div>
            <span className="text-[11px] px-2 py-1 rounded-full font-bold"
              style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
              Coming soon
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM"].map(t => (
              <button key={t}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold opacity-50 cursor-not-allowed"
                style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {saveMut.isPending && (
          <div className="text-xs text-center" style={{ color: "var(--text-tertiary)" }}>Saving…</div>
        )}
      </div>
    </DashboardLayout>
  );
}
