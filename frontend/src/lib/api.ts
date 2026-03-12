"use client";

// src/lib/api.ts
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

export const api = axios.create({
  baseURL:         process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers:         { "Content-Type": "application/json" },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      original._retry = true;
      isRefreshing     = true;

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue  = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") window.location.href = "/auth/login";
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

// ── API Helpers ──────────────────────────────────────────────────────────────
export const authAPI = {
  register:        (d: any) => api.post("/auth/register", d),
  login:           (d: any) => api.post("/auth/login", d),
  logout:          ()       => api.post("/auth/logout"),
  getMe:           ()       => api.get("/auth/me"),
  updateProfile:   (d: any) => api.patch("/auth/me", d),
  changePassword:  (d: any) => api.patch("/auth/me/password", d),
  forgotPassword:  (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword:   (token: string, password: string) => api.post("/auth/reset-password", { token, password }),
};

export const storeAPI = {
  create:     (d: any)       => api.post("/stores", d),
  getAll:     ()             => api.get("/stores"),
  getOne:     (id: string)   => api.get(`/stores/${id}`),
  update:     (id: string, d: any) => api.put(`/stores/${id}`, d),
  delete:     (id: string)   => api.delete(`/stores/${id}`),
  getPublic:  (slug: string) => api.get(`/stores/public/${slug}`),
};

export const productAPI = {
  create:     (storeId: string, d: any) => api.post(`/products/${storeId}`, d),
  getAll:     (storeId: string, p?: any)=> api.get(`/products/${storeId}`, { params: p }),
  getOne:     (storeId: string, id: string) => api.get(`/products/${storeId}/${id}`),
  update:     (storeId: string, id: string, d: any) => api.put(`/products/${storeId}/${id}`, d),
  delete:     (storeId: string, id: string) => api.delete(`/products/${storeId}/${id}`),
  bulk:        (storeId: string, d: any) => api.post(`/products/${storeId}/bulk`, d),
  bulkCreate:  (storeId: string, products: any[]) => api.post(`/products/${storeId}/bulk`, { products }),
};

export const orderAPI = {
  create:      (d: any)       => api.post("/orders", d),
  getAll:      (storeId: string, p?: any) => api.get(`/orders/${storeId}`, { params: p }),
  getOne:      (storeId: string, id: string) => api.get(`/orders/${storeId}/${id}`),
  updateStatus:(storeId: string, id: string, d: any) => api.patch(`/orders/${storeId}/${id}/status`, d),
  track:       (orderNumber: string) => api.get(`/orders/track/${orderNumber}`),
};

export const paymentAPI = {
  initialize:  (d: any) => api.post("/payments/initialize", d),
  verify:      (params: any) => api.get("/payments/verify", { params }),
  getAll:      (p?: any) => api.get("/payments/admin/all", { params: p }),
};

export const analyticsAPI = {
  getStore:   (storeId: string, p?: any) => api.get(`/analytics/${storeId}`, { params: p }),
};

export const adminAPI = {
  getDashboard:        () => api.get("/admin/dashboard"),
  getAnalytics:        (p?: any) => api.get("/admin/analytics", { params: p }),
  getUsers:            (p?: any) => api.get("/admin/users", { params: p }),
  getUser:             (id: string) => api.get(`/admin/users/${id}`),
  updateUser:          (id: string, d: any) => api.patch(`/admin/users/${id}`, d),
  updateSubscription:  (id: string, d: any) => api.patch(`/admin/users/${id}/subscription`, d),
  deleteUser:          (id: string) => api.delete(`/admin/users/${id}`),
  getSettings:         () => api.get("/admin/settings"),
  updateSettings:      (d: any) => api.patch("/admin/settings", d),
  getErrorLogs:        (p?: any) => api.get("/admin/error-logs", { params: p }),
  resolveError:        (id: string) => api.patch(`/admin/error-logs/${id}/resolve`),
  getAuditLogs:        (p?: any) => api.get("/admin/audit-logs", { params: p }),
};

export const supportAPI = {
  create:  (d: any) => api.post("/support", d),
  getAll:  (p?: any) => api.get("/support", { params: p }),
  update:  (id: string, d: any) => api.patch(`/support/${id}`, d),
};

export const notificationAPI = {
  getAll:      () => api.get("/notifications"),
  markRead:    (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/mark-all-read"),
  getCount:    () => api.get("/notifications/unread-count"),
};

export const uploadAPI = {
  single:   (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
  },
  multiple: (files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    return api.post("/upload/multiple", fd, { headers: { "Content-Type": "multipart/form-data" } });
  },
};

export const emailAPI = {
  status:        () => api.get("/email/status"),
  test:          () => api.post("/email/test"),
  lowStockCheck: (storeId: string) => api.post(`/email/low-stock-check/${storeId}`),
};

export const reviewAPI = {
  getAll:    (storeId: string, productId: string) => api.get(`/reviews/${storeId}/${productId}`),
  getDash:   (storeId: string)                    => api.get(`/reviews/${storeId}/all`),
  submit:    (storeId: string, productId: string, d: any) => api.post(`/reviews/${storeId}/${productId}`, d),
  approve:   (storeId: string, id: string)        => api.patch(`/reviews/${storeId}/${id}/approve`),
  delete:    (storeId: string, id: string)        => api.delete(`/reviews/${storeId}/${id}`),
  helpful:   (storeId: string, productId: string, id: string) => api.post(`/reviews/${storeId}/${productId}/${id}/helpful`),
};
