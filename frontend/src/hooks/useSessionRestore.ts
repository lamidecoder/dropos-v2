"use client";
import { useEffect, useRef } from "react";
import { useAuthStore }      from "@/store/auth.store";
import { api }               from "@/lib/api";

export function useSessionRestore() {
  const { accessToken, setUser, setAccessToken, setLoading, setHydrated } = useAuthStore();
  const didRestore = useRef(false);

  useEffect(() => {
    if (didRestore.current) return;
    didRestore.current = true;

    const restore = async () => {
      // Already have token in memory - just mark hydrated
      if (accessToken) {
        setHydrated(true);
        return;
      }

      try {
        setLoading(true);
        const storedRefresh = typeof window !== "undefined"
          ? localStorage.getItem("dropos-refresh-token") : null;

        // Single call: refresh returns both new token AND user data
        const res = await api.post(
          "/auth/refresh",
          storedRefresh ? { refreshToken: storedRefresh } : {},
          { withCredentials: true }
        );

        const { accessToken: newToken, refreshToken: newRefresh, user } = res.data?.data || {};

        if (newToken) {
          setAccessToken(newToken);
          if (newRefresh && typeof window !== "undefined") {
            localStorage.setItem("dropos-refresh-token", newRefresh);
          }
          if (user) setUser(user);
        }
      } catch {
        // No valid session - clear stale refresh token
        if (typeof window !== "undefined") {
          localStorage.removeItem("dropos-refresh-token");
        }
      } finally {
        setLoading(false);
        setHydrated(true);
      }
    };

    restore();
  }, []);
}
