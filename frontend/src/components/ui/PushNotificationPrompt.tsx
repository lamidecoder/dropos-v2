"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Zap } from "lucide-react";
import { api } from "../../lib/api";

export default function PushNotificationPrompt() {
  const [show, setShow]     = useState(false);
  const [status, setStatus] = useState<"idle"|"requesting"|"done">("idle");

  useEffect(() => {
    // Show after 60 seconds if not already granted
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    const shown = localStorage.getItem("dropos-push-prompted");
    if (shown) return;
    const t = setTimeout(() => setShow(true), 60000);
    return () => clearTimeout(t);
  }, []);

  const request = async () => {
    setStatus("requesting");
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        // Register push subscription
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          });
          await api.post("/notifications/push-subscribe", { subscription: sub });
        }
        localStorage.setItem("dropos-push-prompted", "granted");
      } else {
        localStorage.setItem("dropos-push-prompted", "denied");
      }
    } catch {
      // VAPID key not set — just mark as prompted
      localStorage.setItem("dropos-push-prompted", "skipped");
    } finally {
      setStatus("done");
      setShow(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem("dropos-push-prompted", "dismissed");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: 20 }}
          style={{
            position: "fixed", bottom: 88, right: 16, zIndex: 9990,
            width: 300, borderRadius: 16, overflow: "hidden",
            background: "#181230", border: "1px solid rgba(107,53,232,0.3)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
          }}>
          <div style={{ padding: "16px 16px 0", display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Zap size={16} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
                Get KIRO alerts instantly
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                New orders, low stock, and KIRO insights sent directly to your device.
              </p>
            </div>
            <button onClick={dismiss} style={{ color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer" }}>
              <X size={14} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, padding: 12 }}>
            <button onClick={dismiss}
              style={{ flex: 1, padding: "8px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer" }}>
              Not now
            </button>
            <button onClick={request} disabled={status === "requesting"}
              style={{ flex: 2, padding: "8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: status === "requesting" ? 0.7 : 1 }}>
              {status === "requesting" ? "Enabling..." : "Enable alerts"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
