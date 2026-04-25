"use client";
// ============================================================
// Auth Store - Bulletproof Session Persistence
// Path: frontend/src/store/auth.store.ts
// REPLACES existing auth.store.ts
//
// Access token: memory only (never in localStorage - XSS safe)
// User profile: localStorage (can rebuild from server)
// Refresh token: httpOnly cookie (set by server, invisible to JS)
// ============================================================
import { create }                      from "zustand";
import { persist, createJSONStorage }  from "zustand/middleware";
import { api }                         from "@/lib/api";

interface User {
  id:            string;
  name:          string;
  email:         string;
  role:          "SUPER_ADMIN" | "STORE_OWNER" | "CUSTOMER";
  status:        string;
  avatar?:       string;
  emailVerified: boolean;
  subscription?: { plan: string; status: string; currentPeriodEnd: string };
  stores?:       Array<{ id: string; name: string; slug: string; status: string }>;
}

interface AuthState {
  user:          User | null;
  accessToken:   string | null; // MEMORY ONLY - never persisted
  isLoading:     boolean;
  isHydrated:    boolean;
  lastRefresh:   number | null; // timestamp of last successful refresh

  setUser:          (user: User) => void;
  setAccessToken:   (token: string | null) => void;
  setLoading:       (v: boolean) => void;
  setHydrated:      (v: boolean) => void;
  updateUser:       (partial: Partial<User>) => void;
  logout:           () => void;
  refreshSession:   () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:        null,
      accessToken: null, // never persisted
      isLoading:   false,
      isHydrated:  false,
      lastRefresh: null,

      setUser:        (user)  => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setLoading:     (v)     => set({ isLoading: v }),
      setHydrated:    (v)     => set({ isHydrated: v }),
      updateUser:     (p)     => set((s) => ({ user: s.user ? { ...s.user, ...p } : null })),

      logout: async () => {
        try { await api.post("/auth/logout"); } catch {}
        set({ user: null, accessToken: null, lastRefresh: null });
      },

      // ── Refresh session using httpOnly cookie ───────────────
      refreshSession: async (): Promise<boolean> => {
        try {
          const res = await api.post("/auth/refresh"); // cookie sent automatically
          const { accessToken, user } = res.data.data;
          set({ accessToken, user, lastRefresh: Date.now() });
          return true;
        } catch {
          set({ user: null, accessToken: null });
          return false;
        }
      },
    }),
    {
      name:    "dropos-auth-v2",
      storage: createJSONStorage(() => localStorage),
      // ONLY persist user profile - never accessToken
      partialize: (s) => ({
        user:        s.user,
        lastRefresh: s.lastRefresh,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// ── Auto-refresh access token before it expires ───────────────
// Access tokens expire every 15 minutes.
// This refreshes every 13 minutes to stay ahead.
if (typeof window !== "undefined") {
  setInterval(async () => {
    const { user, refreshSession } = useAuthStore.getState();
    if (user) {
      await refreshSession();
    }
  }, 13 * 60 * 1000); // every 13 minutes
}

export const useUser      = () => useAuthStore((s) => s.user);
export const useIsAdmin   = () => useAuthStore((s) => s.user?.role === "SUPER_ADMIN");
export const useIsOwner   = () => useAuthStore((s) => s.user?.role === "STORE_OWNER" || s.user?.role === "SUPER_ADMIN");
export const useIsLoggedIn = () => useAuthStore((s) => !!s.user);
