"use client";
// ============================================================
// KAI — Dashboard Page (10/10)
// Path: frontend/src/app/dashboard/kai/page.tsx
// ============================================================
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { KAIChat } from "@/components/kai/KAIChat";
import { KAISidebar } from "@/components/kai/KAISidebar";
import { useKaiStore } from "@/store/kai.store";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";

export default function KAIPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const { setGreeting, setUnreadCount, setPulseAlerts, setSkills, setGoals, setMemories } = useKaiStore();

  // Pre-fetch all KAI data
  useQuery({
    queryKey: ["kai-greeting", storeId],
    queryFn: async () => { const r = await api.get(`/kai/greeting?storeId=${storeId}`); return r.data.data; },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
    onSuccess: (d: any) => { if (d) { setGreeting(d.greeting, d.contextLine, d.quickActions || []); setUnreadCount(d.unreadAlerts || 0); } },
  });

  useQuery({
    queryKey: ["kai-pulse", storeId],
    queryFn: async () => { const r = await api.get(`/kai/pulse?storeId=${storeId}`); return r.data.data; },
    enabled: !!storeId,
    refetchInterval: 5 * 60 * 1000,
    onSuccess: (d: any) => { setPulseAlerts(d || []); setUnreadCount((d || []).filter((a: any) => !a.read).length); },
  });

  useQuery({
    queryKey: ["kai-skills", storeId],
    queryFn: async () => { const r = await api.get(`/kai/skills?storeId=${storeId}`); return r.data.data; },
    enabled: !!storeId,
    onSuccess: (d: any) => setSkills(d?.storeSkills || [], d?.globalSkills || []),
  });

  useQuery({
    queryKey: ["kai-goals", storeId],
    queryFn: async () => { const r = await api.get(`/kai/goals?storeId=${storeId}`); return r.data.data; },
    enabled: !!storeId,
    onSuccess: (d: any) => setGoals(d || []),
  });

  useQuery({
    queryKey: ["kai-memories", storeId],
    queryFn: async () => { const r = await api.get(`/kai/memories?storeId=${storeId}`); return r.data.data; },
    enabled: !!storeId,
    onSuccess: (d: any) => setMemories(d || []),
  });

  return (
    <DashboardLayout>
      <div className="flex overflow-hidden" style={{ height: "calc(100vh - 64px)", background: "#07070e" }}>
        <KAISidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <KAIChat />
        </div>
      </div>
    </DashboardLayout>
  );
}
