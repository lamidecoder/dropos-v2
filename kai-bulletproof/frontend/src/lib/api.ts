"use client";
// ============================================================
// API Client — Bulletproof with Auto-Refresh
// Path: frontend/src/lib/api.ts
// REPLACES existing api.ts
// ============================================================
import axios, { AxiosError } from "axios";
import { useAuthStore }      from "@/store/auth.store";

export const api = axios.create({
  baseURL:         process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // CRITICAL — sends httpOnly cookie on every request
  headers:         { "Content-Type": "application/json" },
  timeout:         30000, // 30 second timeout
});

// ── Attach access token ───────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auto-refresh on 401 ───────────────────────────────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null) => {
  refreshQueue.forEach(cb => cb(token));
  refreshQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as any;

    // Only retry 401s once, and not on the refresh endpoint itself
    if (err.response?.status === 401 && !original._retry && !original.url?.includes("/auth/refresh")) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (token) {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            } else {
              reject(err);
            }
          });
        });
      }

      original._retry = true;
      isRefreshing    = true;

      try {
        const success = await useAuthStore.getState().refreshSession();
        if (success) {
          const newToken = useAuthStore.getState().accessToken;
          processQueue(newToken);
          if (newToken) original.headers.Authorization = `Bearer ${newToken}`;
          isRefreshing = false;
          return api(original);
        } else {
          processQueue(null);
          isRefreshing = false;
          // Session truly expired — redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login?reason=session_expired";
          }
          return Promise.reject(err);
        }
      } catch {
        processQueue(null);
        isRefreshing = false;
        return Promise.reject(err);
      }
    }

    // Transform error response for consistent handling
    const data = (err.response?.data as any);
    const message = data?.message || getNetworkErrorMessage(err);

    // Attach friendly message to error
    (err as any).friendlyMessage = message;
    (err as any).errorCode       = data?.code;

    return Promise.reject(err);
  }
);

function getNetworkErrorMessage(err: AxiosError): string {
  if (!err.response) {
    if (err.code === "ERR_NETWORK")  return "Can't connect to server — check your internet";
    if (err.code === "ECONNABORTED") return "Request timed out — please try again";
    return "Network error — check your connection";
  }
  switch (err.response.status) {
    case 400: return "Invalid request — check your inputs";
    case 401: return "Please log in to continue";
    case 403: return "You don't have permission to do that";
    case 404: return "Not found";
    case 409: return "Already exists";
    case 413: return "File too large";
    case 429: return "Too many requests — please wait a moment";
    case 500: return "Server error — please try again in a moment";
    case 503: return "Service temporarily unavailable — try again soon";
    default:  return "Something went wrong — please try again";
  }
}

// ── Separate API for storefront (no auth required) ───────────
export const storeApi = axios.create({
  baseURL:         process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers:         { "Content-Type": "application/json" },
  timeout:         15000,
});
