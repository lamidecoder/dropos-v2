"use client";

// src/store/auth.store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  user:         User | null;
  accessToken:  string | null;
  isLoading:    boolean;
  isHydrated:   boolean;

  setUser:         (user: User) => void;
  setAccessToken:  (token: string) => void;
  setLoading:      (v: boolean) => void;
  setHydrated:     (v: boolean) => void;
  logout:          () => void;
  updateUser:      (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:        null,
      accessToken: null,
      isLoading:   false,
      isHydrated:  false,

      setUser:        (user)  => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setLoading:     (v)     => set({ isLoading: v }),
      setHydrated:    (v)     => set({ isHydrated: v }),
      updateUser:     (p)     => set((s) => ({ user: s.user ? { ...s.user, ...p } : null })),
      logout:         ()      => set({ user: null, accessToken: null }),
    }),
    {
      name:    "dropos-auth",
      storage: createJSONStorage(() => localStorage),
      // Only persist user profile — NOT the access token (security: XSS can't steal it)
      // Access token lives in memory only; refresh happens via httpOnly cookie
      partialize: (s) => ({ user: s.user }),
      onRehydrateStorage: () => (state) => { state?.setHydrated(true); },
    }
  )
);

// Selectors
export const useUser  = () => useAuthStore((s) => s.user);
export const useIsAdmin = () => useAuthStore((s) => s.user?.role === "SUPER_ADMIN");
export const useIsOwner = () => useAuthStore((s) => s.user?.role === "STORE_OWNER" || s.user?.role === "SUPER_ADMIN");
