"use client";
// Progressive nav level detection
// Returns 0-4 based on how far the user has progressed
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth.store";
import { api } from "../../lib/api";

export interface NavLevel {
  level: number; // 0=new, 1=has products, 2=has orders, 3=growing, 4=advanced
  productCount: number;
  orderCount: number;
  hasPaystack: boolean;
  label: string;
}

export function useNavLevel(): NavLevel {
  const user   = useAuthStore(s => s.user);
  const store  = user?.stores?.[0];

  const { data } = useQuery({
    queryKey:  ["nav-level", store?.id],
    queryFn:   () => api.get(`/dashboard/${store?.id}/nav-level`).then(r => r.data.data),
    enabled:   !!store?.id,
    staleTime: 300000,
    retry:     false,
  });

  const productCount = data?.productCount ?? 0;
  const orderCount   = data?.orderCount   ?? 0;
  const hasPaystack  = data?.hasPaystack  ?? false;

  let level = 0;
  if (productCount >= 1)  level = 1;
  if (orderCount  >= 1)   level = 2;
  if (orderCount  >= 10)  level = 3;
  if (orderCount  >= 50)  level = 4;

  const labels = ["Just starting", "Getting set up", "First orders in", "Growing fast", "Power seller"];

  return { level, productCount, orderCount, hasPaystack, label: labels[level] };
}

// Which nav groups to show at each level
export function getVisibleGroups(level: number): string[] {
  if (level === 0) return ["top", "store-core", "account"];
  if (level === 1) return ["top", "store", "sales-core", "account"];
  if (level === 2) return ["top", "store", "sales", "marketing-core", "account"];
  if (level === 3) return ["top", "store", "sales", "marketing", "studio", "account"];
  return ["top", "store", "sales", "marketing", "studio", "intelligence", "tools", "developers", "account"];
}
