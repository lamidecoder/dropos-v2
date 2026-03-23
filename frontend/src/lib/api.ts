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

// Auto-refresh on 401 - ONLY redirect to login for dashboard pages
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data?.accessToken;
        if (newToken) {
          useAuthStore.getState().setAccessToken(newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch {
        useAuthStore.getState().logout();
      }
      // Only redirect to login if on dashboard pages, NOT store pages
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        const isStorePage = path.startsWith("/store/");
        if (!isStorePage) {
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(err);
  }
);

// ── Namespaced API helpers ────────────────────────────────────────────────────
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