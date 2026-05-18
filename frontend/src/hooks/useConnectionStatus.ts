// useConnectionStatus — global offline/reconnect hook
// Detects: internet loss, server unreachable, slow connection
// On reconnect: fires callbacks so pages can refresh stale data
"use client";
import { useState, useEffect, useCallback, useRef } from "react";

export type ConnectionState = "online" | "offline" | "slow" | "reconnecting";

interface UseConnectionStatusOptions {
  onReconnect?: () => void;
  onOffline?:   () => void;
  pingUrl?:     string;
  pingInterval?: number; // ms
}

export function useConnectionStatus(opts: UseConnectionStatusOptions = {}) {
  const {
    onReconnect,
    onOffline,
    pingUrl      = `${process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api"}/health`,
    pingInterval = 8000,
  } = opts;

  const [state,        setState]        = useState<ConnectionState>("online");
  const [lastOnline,   setLastOnline]   = useState<Date>(new Date());
  const [downFor,      setDownFor]      = useState(0); // seconds
  const wasOfflineRef  = useRef(false);
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  const ping = useCallback(async (): Promise<boolean> => {
    try {
      const start   = Date.now();
      const res     = await fetch(pingUrl, { method:"GET", cache:"no-store", signal: AbortSignal.timeout(5000) });
      const latency = Date.now() - start;
      if (!res.ok) return false;
      if (latency > 3000) { setState("slow"); return true; }
      return true;
    } catch {
      return false;
    }
  }, [pingUrl]);

  const handleOnline = useCallback(async () => {
    setState("reconnecting");
    const alive = await ping();
    if (alive) {
      setState("online");
      setLastOnline(new Date());
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        onReconnect?.();
      }
    }
  }, [ping, onReconnect]);

  const handleOffline = useCallback(() => {
    setState("offline");
    wasOfflineRef.current = true;
    setLastOnline(prev => prev); // keep timestamp
    onOffline?.();
  }, [onOffline]);

  useEffect(() => {
    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);

    // Active ping loop — catches cases where browser thinks it's online but server is down
    intervalRef.current = setInterval(async () => {
      if (!navigator.onLine) { handleOffline(); return; }
      const alive = await ping();
      if (!alive && state === "online") handleOffline();
      if (alive  && state === "offline") handleOnline();
    }, pingInterval);

    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [handleOnline, handleOffline, ping, pingInterval, state]);

  // Count seconds offline
  useEffect(() => {
    if (state !== "offline") { setDownFor(0); return; }
    const t = setInterval(() => setDownFor(p => p + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  return { state, lastOnline, downFor, isOnline: state === "online" || state === "slow" };
}
