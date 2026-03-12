"use client";

// src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

export function useLogin() {
  const router     = useRouter();
  const { setUser, setAccessToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) => authAPI.login(data),
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setUser(user);
      setAccessToken(accessToken);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === "SUPER_ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Login failed");
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string; phone?: string }) =>
      authAPI.register(data),
    onSuccess: () => {
      toast.success("Account created! Check your email to verify.");
      router.push("/auth/login?registered=true");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Registration failed");
    },
  });
}

export function useLogout() {
  const router     = useRouter();
  const qc         = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => authAPI.logout(),
    onSettled: () => {
      logout();
      qc.clear();
      router.push("/auth/login");
    },
  });
}

export function useMe() {
  const { setUser, accessToken } = useAuthStore();
  return useQuery({
    queryKey: ["me"],
    queryFn:  async () => {
      const { data } = await authAPI.getMe();
      setUser(data.data);
      return data.data;
    },
    enabled: !!accessToken,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: any) => authAPI.updateProfile(data),
    onSuccess: (res) => {
      updateUser(res.data.data);
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Profile updated");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Update failed"),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) => authAPI.forgotPassword(data.email),
    onSuccess: () => toast.success("Reset link sent if that email exists"),
    onError:   (err: any) => toast.error(err.response?.data?.message || "Error"),
  });
}

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: { token: string; password: string }) => authAPI.resetPassword(data.token, data.password),
    onSuccess: () => {
      toast.success("Password reset successfully");
      router.push("/auth/login");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Reset failed"),
  });
}
