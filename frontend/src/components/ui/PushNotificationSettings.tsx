"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, BellOff, BellRing, Smartphone, Check, X, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function PushNotificationSettings() {
  const { state, subscribe, unsubscribe, sendTest } = usePushNotifications();
  const [subscribing, setSubscribing] = useState(false);

  const { data: devices = [] } = useQuery({
    queryKey: ["push-subscriptions"],
    queryFn:  () => api.get("/push/subscriptions").then(r => r.data.data),
    enabled:  state === "granted",
  });

  const handleSubscribe = async () => {
    setSubscribing(true);
    await subscribe();
    setSubscribing(false);
  };

  const stateConfig = {
    loading:     { icon: Loader2, color: "var(--text-tertiary)",  label: "Checking…",         spin: true  },
    unsupported: { icon: BellOff, color: "var(--text-tertiary)",  label: "Not supported",       spin: false },
    denied:      { icon: BellOff, color: "var(--error)",          label: "Blocked by browser",  spin: false },
    default:     { icon: Bell,    color: "var(--text-secondary)", label: "Not enabled",         spin: false },
    granted:     { icon: BellRing,color: "var(--success)",        label: "Notifications active",spin: false },
  }[state] || { icon: Bell, color: "var(--text-secondary)", label: state, spin: false };

  const StatusIcon = stateConfig.icon;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      {/* Header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: state === "granted" ? "rgba(16,185,129,0.1)" : "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <StatusIcon
                size={16}
                style={{ color: stateConfig.color }}
                className={stateConfig.spin ? "animate-spin" : ""}
              />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                Push Notifications
              </div>
              <div className="text-xs" style={{ color: stateConfig.color }}>
                {stateConfig.label}
              </div>
            </div>
          </div>

          {/* Toggle */}
          {state === "default" && (
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-[var(--text-primary)] transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "#10B981", boxShadow: "0 3px 10px rgba(16,185,129,0.25)" }}
            >
              {subscribing ? <Loader2 size={13} className="animate-spin" /> : <Bell size={13} />}
              {subscribing ? "Enabling…" : "Enable"}
            </button>
          )}

          {state === "granted" && (
            <div className="flex items-center gap-2">
              <button
                onClick={sendTest}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ color: "var(--accent)", background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}
              >
                <Send size={11} /> Test
              </button>
              <button
                onClick={unsubscribe}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ color: "var(--error)", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <BellOff size={11} /> Disable
              </button>
            </div>
          )}
        </div>
      </div>

      {/* What you'll receive */}
      {state !== "unsupported" && (
        <div className="px-5 py-4">
          <div className="text-xs font-bold mb-3" style={{ color: "var(--text-secondary)" }}>
            You'll be notified for:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "New orders",       emoji: "💰", active: true  },
              { label: "Low stock alerts", emoji: "⚠️", active: true  },
              { label: "New reviews",      emoji: "⭐", active: true  },
              { label: "Abandoned carts",  emoji: "🛒", active: true  },
              { label: "Flash sales live", emoji: "🔥", active: true  },
              { label: "Daily summary",    emoji: "📊", active: false },
            ].map(({ label, emoji, active }) => (
              <div key={label}
                className="flex items-center gap-2 p-2.5 rounded-xl"
                style={{ background: "var(--bg-secondary)", opacity: active ? 1 : 0.5 }}>
                <span className="text-base">{emoji}</span>
                <div>
                  <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{label}</div>
                  {!active && <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Coming soon</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Registered devices */}
          {devices.length > 0 && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="text-xs font-bold mb-2" style={{ color: "var(--text-secondary)" }}>
                Active Devices ({devices.length})
              </div>
              <div className="space-y-2">
                {devices.map((d: any) => (
                  <div key={d.id} className="flex items-center gap-2.5">
                    <Smartphone size={12} style={{ color: "var(--text-tertiary)" }} />
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {d.deviceName || "Unknown device"}
                    </span>
                    <span className="text-[10px] ml-auto" style={{ color: "var(--text-tertiary)" }}>
                      {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {state === "denied" && (
            <div className="mt-4 p-3 rounded-xl"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <p className="text-xs" style={{ color: "var(--error)" }}>
                Notifications are blocked. To re-enable, click the lock icon in your browser address bar and allow notifications for this site.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
