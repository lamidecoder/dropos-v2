"use client";
// ============================================================
// Session Restore Hook
// Path: frontend/src/hooks/useSessionRestore.ts
//
// On every page load, tries to restore session from cookie.
// User stays logged in even after server restart.
// ============================================================
import { useEffect, useRef } from "react";
import { useAuthStore }      from "@/store/auth.store";
import { api }               from "@/lib/api";

export function useSessionRestore() {
  const { user, accessToken, setUser, setAccessToken, setLoading, setHydrated } = useAuthStore();
  const didRestore = useRef(false);

  useEffect(() => {
    if (didRestore.current) return;
    didRestore.current = true;

    const restore = async () => {
      // Already have a valid access token in memory - no need to restore
      if (accessToken) {
        setHydrated(true);
        return;
      }

      // Try to restore from httpOnly cookie
      // If server is restarted, cookie still exists → restores session
      try {
        setLoading(true);
        const res = await api.get("/auth/me");
        if (res.data.success) {
          const { accessToken: newToken, user: restoredUser } = res.data.data;
          setAccessToken(newToken);
          setUser(restoredUser);
        }
      } catch {
        // No valid session - user needs to log in
        // Don't redirect - let each page decide what to do
      } finally {
        setLoading(false);
        setHydrated(true);
      }
    };

    restore();
  }, []);
}

// ── Provider component - wrap in root layout ──────────────────
export function SessionProvider({ children }: { children: React.ReactNode }) {
  useSessionRestore();
  return <>{children}</>;
}
