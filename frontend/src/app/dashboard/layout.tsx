"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";
import DashboardLayout from "../../components/layout/DashboardLayout";

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const { user, isHydrated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Wait for session restore to complete before redirecting
    if (!isHydrated || isLoading) return;
    if (!user) {
      router.replace("/auth/login");
    }
  }, [user, isHydrated, isLoading]);

  // Show loading state while session restores
  if (!isHydrated || isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#080612" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(107,53,232,0.2)", borderTopColor: "#6B35E8", animation: "spin 0.8s linear infinite" }}/>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "system-ui" }}>Loading DropOS...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Not logged in - router.replace is happening, show nothing
  if (!user) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
