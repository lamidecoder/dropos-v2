"use client";
import { useEffect, useRef } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function useSessionRestore() {
  const { accessToken, setUser, setAccessToken, setLoading, setHydrated } = useAuthStore();
  const ran = useRef(false);

  useEffect(() => {
    // Already ran — never run twice
    if (ran.current) return;
    ran.current = true;

    // Already have a token in memory — nothing to restore
    if (accessToken) {
      setHydrated(true);
      return;
    }

    const restore = async () => {
      setLoading(true);
      try {
        const stored = typeof window !== "undefined"
          ? localStorage.getItem("dropos-refresh-token") : null;

        // Use RAW axios (not api) to avoid response interceptor catching this 401
        // and trying to refresh again (infinite loop)
        const res = await axios.post(
          `${BASE}/auth/refresh`,
          stored ? { refreshToken: stored } : {},
          { withCredentials: true, timeout: 10000 }
        );

        const d = res.data?.data;
        if (d?.accessToken) {
          setAccessToken(d.accessToken);
          if (d.refreshToken && typeof window !== "undefined") {
            localStorage.setItem("dropos-refresh-token", d.refreshToken);
          }
          if (d.user) setUser(d.user);
        }
      } catch {
        // No valid session — clear stale token
        if (typeof window !== "undefined") {
          localStorage.removeItem("dropos-refresh-token");
        }
        // Don't redirect here — let auth guards on each page handle it
      } finally {
        setLoading(false);
        setHydrated(true);
      }
    };

    restore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
