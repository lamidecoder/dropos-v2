"use client";
import { useQuery } from "@tanstack/react-query";
import { analyticsAPI, orderAPI, storeAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { StoreStatCards } from "@/components/dashboard/StatCards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { PaymentSplit } from "@/components/dashboard/PaymentSplit";
import { TopProducts } from "@/components/dashboard/TopProducts";
import Link from "next/link";
import { Zap } from "lucide-react";

export default function DashboardPage() {
  const user       = useAuthStore(s => s.user);
  const firstStore = user?.stores?.[0];
  const storeId    = firstStore?.id;

  const { data: analytics , isLoading } = useQuery({
    queryKey: ["analytics", storeId, "30d"],
    queryFn:  () => analyticsAPI.getStore(storeId!, { period: "30d" }).then(r => r.data.data),
    enabled:  !!storeId,
  });

  const { data: ordersData } = useQuery({
    queryKey: ["orders", storeId],
    queryFn:  () => orderAPI.getAll(storeId!, { limit: 5 }).then(r => r.data),
    enabled:  !!storeId,
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
              {greeting}, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-secondary text-xs mt-1">
              {firstStore?.name || "No store yet"} · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          {firstStore && (
            <Link href={`/store/${firstStore.slug}`} target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ color: "rgba(201,168,76,0.7)", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }}>
              View Store ↗
            </Link>
          )}
        </div>

        {!storeId ? (
          /* Empty state */
          <div className="rounded-3xl p-12 text-center" style={{ background: "var(--bg-secondary)", border: "1px dashed rgba(201,168,76,0.2)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 [background:linear-gradient(135deg,#7C3AED,#8B5CF6)] shadow-lg ">
              <Zap size={22} className="text-black" fill="black" />
            </div>
            <h2 className="[color:var(--text-primary)] text-xl font-black mb-2">Create your first store</h2>
            <p className="text-secondary text-sm mb-6 max-w-xs mx-auto">Set up your dropshipping store in minutes. No code required.</p>
            <Link href="/dashboard/stores"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-black [background:linear-gradient(135deg,#7C3AED,#8B5CF6)] shadow-lg ">
              + Create Store
            </Link>
          </div>
        ) : (
          <>
            <StoreStatCards analytics={analytics} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <RevenueChart storeId={storeId} />
              </div>
              <div className="space-y-4">
                <PaymentSplit analytics={analytics} />
                <TopProducts analytics={analytics} />
              </div>
            </div>
            <RecentOrdersTable orders={ordersData?.data?.slice(0, 5)} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
