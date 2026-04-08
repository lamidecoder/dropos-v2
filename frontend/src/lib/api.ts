"use client";

// src/lib/api.ts
import axios from "axios";
import { useAuthStore } from "../store/auth.store";

export const api = axios.create({
  baseURL:         process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers:         { "Content-Type": "application/json" },
  timeout:         30000,
});

// Public API - no auth, no redirects - for storefront use
export const publicApi = axios.create({
  baseURL:  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout:  30000,
  headers:  { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Refresh lock — prevents race condition ────────────────────
// Only ONE refresh call happens at a time.
// All other 401s queue up and wait for it.
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function processQueue(token: string) {
  refreshQueue.forEach(resolve => resolve(token));
  refreshQueue = [];
}

// ── Response interceptor ──────────────────────────────────────
api.interceptors.response.use(
  (res) => {
    // Store refresh token when login succeeds
    if (res.config.url?.includes("/auth/login") && res.data?.data?.refreshToken) {
      if (typeof window !== "undefined") {
        localStorage.setItem("dropos-refresh-token", res.data.data.refreshToken);
      }
      // Also set the access token immediately in store
      if (res.data?.data?.accessToken) {
        useAuthStore.getState().setAccessToken(res.data.data.accessToken);
      }
    }
    return res;
  },
  async (err) => {
    const original = err.config;

    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((newToken: string) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(original));
        });
      });
    }

    // Mark as retrying so this exact request doesn't loop
    original._retry = true;
    isRefreshing = true;

    try {
      const storedRefreshToken = typeof window !== "undefined"
        ? localStorage.getItem("dropos-refresh-token")
        : null;

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/refresh`,
        { refreshToken: storedRefreshToken },
        { withCredentials: true }
      );

      const newToken   = data.data?.accessToken;
      const newRefresh = data.data?.refreshToken;

      if (!newToken) throw new Error("No token in refresh response");

      // Save new tokens
      useAuthStore.getState().setAccessToken(newToken);
      if (newRefresh && typeof window !== "undefined") {
        localStorage.setItem("dropos-refresh-token", newRefresh);
      }

      // Update default header
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      // Release all queued requests
      processQueue(newToken);

      // Retry original request
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);

    } catch (refreshError) {
      // Refresh failed — clear everything and redirect
      refreshQueue = [];
      if (typeof window !== "undefined") {
        localStorage.removeItem("dropos-refresh-token");
      }
      useAuthStore.getState().logout();

      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (!path.startsWith("/store/") && !path.startsWith("/auth/")) {
          window.location.href = "/auth/login";
        }
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ── Namespaced API helpers ────────────────────────────────────
export const authAPI = {
  login:           (d: any) => api.post("/auth/login", d),
  register:        (d: any) => api.post("/auth/register", d),
  logout:          ()       => api.post("/auth/logout"),
  getMe:           ()       => api.get("/auth/me"),
  updateProfile:   (d: any) => api.put("/auth/profile", d),
  forgotPassword:  (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword:   (token: string, password: string) => api.post("/auth/reset-password", { token, password }),
};

export const storeAPI = {
  getAll:    ()           => api.get("/stores"),
  getOne:    (id: string) => api.get(`/stores/${id}`),
  create:    (d: any)     => api.post("/stores", d),
  update:    (id: string, d: any) => api.patch(`/stores/${id}`, d),
  delete:    (id: string) => api.delete(`/stores/${id}`),
  getPublic: (slug: string) => publicApi.get(`/stores/public/${slug}`),
};

export const productAPI = {
  getAll:    (storeId: string, p?: any) => api.get(`/products/${storeId}`, { params: p }),
  getOne:    (storeId: string, id: string) => api.get(`/products/${storeId}/${id}`),
  create:    (storeId: string, d: any) => api.post(`/products/${storeId}`, d),
  update:    (storeId: string, id: string, d: any) => api.put(`/products/${storeId}/${id}`, d),
  delete:    (storeId: string, id: string) => api.delete(`/products/${storeId}/${id}`),
  getPublicList: (storeId: string, p?: any) => publicApi.get(`/products/public/${storeId}`, { params: p }),
  getPublicOne:  (storeId: string, id: string) => publicApi.get(`/products/public/${storeId}/${id}`),
};

export const orderAPI = {
  getAll:  (storeId: string, p?: any) => api.get(`/orders/${storeId}`, { params: p }),
  getOne:  (storeId: string, id: string) => api.get(`/orders/${storeId}/${id}`),
  create:  (storeId: string, d: any) => publicApi.post(`/orders/${storeId}`, d),
  update:  (storeId: string, id: string, d: any) => api.patch(`/orders/${storeId}/${id}`, d),
};

export const notificationAPI = {
  getAll:   (p?: any) => api.get("/notifications", { params: p }),
  getCount: ()        => api.get("/notifications/count"),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: ()     => api.patch("/notifications/read-all"),
};

export const uploadAPI = {
  image:  (file: File, folder?: string) => {
    const fd = new FormData();
    fd.append("image", file);
    if (folder) fd.append("folder", folder);
    return api.post("/upload/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
  },
  images: (files: File[], folder?: string) => {
    const fd = new FormData();
    files.forEach(f => fd.append("images", f));
    if (folder) fd.append("folder", folder);
    return api.post("/upload/images", fd, { headers: { "Content-Type": "multipart/form-data" } });
  },
};

export const analyticsAPI = {
  getSummary:  (storeId: string, period?: string) => api.get(`/analytics/${storeId}`, { params: { period } }),
  getRevenue:  (storeId: string, period?: string) => api.get(`/analytics/${storeId}/revenue`, { params: { period } }),
  getOrders:   (storeId: string, period?: string) => api.get(`/analytics/${storeId}/orders`, { params: { period } }),
  getProducts: (storeId: string) => api.get(`/analytics/${storeId}/products`),
  getCustomers:(storeId: string) => api.get(`/analytics/${storeId}/customers`),
};

export const adminAPI = {
  getStats:    () => api.get("/admin/stats"),
  getUsers:    (p?: any) => api.get("/admin/users", { params: p }),
  getUser:     (id: string) => api.get(`/admin/users/${id}`),
  updateUser:  (id: string, d: any) => api.patch(`/admin/users/${id}`, d),
  deleteUser:  (id: string) => api.delete(`/admin/users/${id}`),
  getStores:   (p?: any) => api.get("/admin/stores", { params: p }),
  getOrders:   (p?: any) => api.get("/admin/orders", { params: p }),
  getRevenue:  () => api.get("/admin/revenue"),
};