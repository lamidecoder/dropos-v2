"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { AppLoader } from "../../components/AppLoader";

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const { user, isHydrated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated || isLoading) return;
    if (!user) {
      router.replace("/auth/login");
    }
  }, [user, isHydrated, isLoading]);

  // Single source of truth: AppLoader shows during session restore
  if (!isHydrated || isLoading) {
    return <AppLoader show={true} />;
  }

  // Not logged in — redirecting, show nothing
  if (!user) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
