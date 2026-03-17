"use client";

// src/hooks/usePushNotifications.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import toast from "react-hot-toast";

function urlB64ToUint8Array(base64String: string): Uint8Array {
  const padding  = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64   = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData  = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export type PushState = "unsupported" | "denied" | "default" | "granted" | "loading";

export function usePushNotifications() {
  const [state, setState]       = useState<PushState>("loading");
  const [subscription, setSub]  = useState<PushSubscription | null>(null);
  const [vapidKey, setVapidKey] = useState<string | null>(null);

  // Fetch VAPID public key
  useEffect(() => {
    api.get("/push/vapid-public-key")
      .then(r => setVapidKey(r.data.data?.key || null))
      .catch(() => setVapidKey(null));
  }, []);

  // Check current state
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }

    const perm = Notification.permission;
    if (perm === "denied")  { setState("denied");  return; }
    if (perm === "granted") {
      // Check if actually subscribed
      navigator.serviceWorker.ready.then(reg =>
        reg.pushManager.getSubscription().then(sub => {
          setSub(sub);
          setState(sub ? "granted" : "default");
        })
      );
    } else {
      setState("default");
    }
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!vapidKey) {
      toast.error("Push notifications not configured on server");
      return false;
    }
    setState("loading");
    try {
      const reg    = await navigator.serviceWorker.ready;
      const perm   = await Notification.requestPermission();
      if (perm !== "granted") { setState("denied"); return false; }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(vapidKey),
      });

      const deviceName = `${navigator.userAgent.includes("iPhone") || navigator.userAgent.includes("iPad") ? "Safari" : "Chrome"} on ${navigator.platform}`;

      await api.post("/push/subscribe", {
        endpoint: sub.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("p256dh")!))),
          auth:   btoa(String.fromCharCode(...new Uint8Array(sub.getKey("auth")!))),
        },
        deviceName,
      });

      setSub(sub);
      setState("granted");
      return true;
    } catch (err: any) {
      console.error("Push subscribe error:", err);
      setState("default");
      return false;
    }
  }, [vapidKey]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!subscription) return;
    await api.delete("/push/unsubscribe", { data: { endpoint: subscription.endpoint } });
    await subscription.unsubscribe();
    setSub(null);
    setState("default");
  }, [subscription]);

  const sendTest = useCallback(async (): Promise<void> => {
    try {
      await api.post("/push/test");
      toast.success("Test notification sent!");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to send test");
    }
  }, []);

  return { state, subscription, vapidKey, subscribe, unsubscribe, sendTest };
}
