"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../../../lib/api";
import { Package } from "lucide-react";
import Link from "next/link";
import { TemplateRenderer } from "../../../components/store/templates/TemplateRenderer";

export default function StorefrontPage() {
  const { slug } = useParams<{ slug: string }>();
  const [search,   setSearch]   = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort,     setSort]     = useState("newest");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ["public-store", slug],
    queryFn:  () => publicApi.get(`/stores/public/${slug}`).then(r => r.data.data),
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["public-products", store?.id, debouncedSearch, category, sort],
    queryFn:  () => publicApi.get(`/products/public/${store.id}`, {
      params: {
        search:   debouncedSearch || undefined,
        category: category !== "All" ? category : undefined,
        sort,
        limit:    48,
      },
    }).then(r => r.data),
    enabled:   !!store?.id,
    staleTime: 2 * 60 * 1000,
  });

  if (storeLoading) return <StoreSkeleton />;
  if (storeError || !store) return <StoreNotFound />;

  const products: any[] = (productsData as any)?.data || [];
  const categories = ["All", ...Array.from(new Set(
    products.map((p: any) => p.category).filter(Boolean)
  ))] as string[];

  return (
    <TemplateRenderer
      store={store}
      products={products}
      slug={slug}
      search={search}
      setSearch={setSearch}
      category={category}
      setCategory={setCategory}
      sort={sort}
      setSort={setSort}
      categories={categories}
      isLoading={productsLoading}
    />
  );
}

function StoreSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-16 bg-white border-b border-slate-100" />
      <div className="h-64 bg-slate-50" />
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-2 sm:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden">
            <div className="aspect-square bg-slate-100" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-slate-100 rounded" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoreNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
          <Package size={36} className="text-slate-300" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Store Not Found</h1>
        <p className="text-slate-500 mb-6">This store doesn't exist or has been removed.</p>
        <Link href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold bg-violet-600 hover:bg-violet-700 transition-colors text-sm">
          Go to DropOS →
        </Link>
      </div>
    </div>
  );
}