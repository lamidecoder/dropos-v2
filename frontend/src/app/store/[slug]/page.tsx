"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { Package } from "lucide-react";
import { TemplateRenderer } from "../../../components/store/templates/TemplateRenderer";

export default function StorefrontPage() {
  const { slug } = useParams<{ slug: string }>();
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");
  const [sort,     setSort]     = useState("newest");

  const { data: store, isLoading } = useQuery({
    queryKey: ["public-store", slug],
    queryFn:  () => api.get(`/stores/public/${slug}`).then(r => r.data.data),
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["public-products", slug, search, category, sort],
    queryFn:  () => api.get(`/products/public/${store?.id}`, {
      params: { search, category: category === "All" ? "" : category, sort, limit: 48 },
    }).then(r => r.data),
    enabled: !!store?.id,
  });

  if (isLoading) return <StoreSkeleton />;
  if (!store)   return <StoreNotFound />;

  const products   = productsData?.data || [];
  const categories = ["All", ...new Set(products.map((p: any) => p.category).filter(Boolean))] as string[];

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
      <div className="h-16 bg-slate-100 border-b border-slate-200" />
      <div className="h-72 bg-slate-100" />
      <div className="max-w-7xl mx-auto px-8 py-14 grid grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden">
            <div className="aspect-square bg-slate-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-slate-200 rounded" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
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
      <div className="text-center">
        <Package size={48} className="mx-auto mb-4 text-slate-300" />
        <h1 className="text-2xl font-black text-slate-900 mb-2">Store Not Found</h1>
        <p className="text-slate-500">This store doesn't exist or has been removed.</p>
      </div>
    </div>
  );
}