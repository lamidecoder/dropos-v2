"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../../../lib/api";
import { Package } from "lucide-react";
import Link from "next/link";
import { TemplateRenderer } from "../../../components/store/templates/TemplateRenderer";

export default function StorefrontPage() {
  const { slug } = useParams<{ slug: string }>();
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category,        setCategory]        = useState("All");
  const [sort,            setSort]            = useState("newest");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: store, isLoading: storeLoading, error } = useQuery({
    queryKey:  ["public-store", slug],
    queryFn:   () => publicApi.get(`/stores/public/${slug}`).then(r => r.data.data),
    retry:     2,
    staleTime: 5 * 60 * 1000,
    enabled:   !!slug,
    retryDelay: 1000,
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
    staleTime: 30 * 1000,
  });

  const { data: flashSales } = useQuery({
    queryKey: ["public-flash-sales", store?.id],
    queryFn:  () => publicApi.get(`/stores/${store.id}/flash-sales/active`).then(r => r.data.data || []),
    enabled:   !!store?.id,
    staleTime: 60 * 1000,
  });

  if (storeLoading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #8B5CF630", borderTopColor: "#8B5CF6", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }}/>
        <p style={{ fontSize: 14, color: "#888" }}>Loading store…</p>
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      </div>
    </div>
  );

  if (error || !store) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa", flexDirection: "column", gap: 16, padding: 24 }}>
      <Package size={40} style={{ color: "#ddd" }}/>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: 0 }}>Store Not Found</h1>
      <p style={{ color: "#888", fontSize: 14, textAlign: "center", maxWidth: 360 }}>
        This store doesn't exist or may have been removed.
      </p>
      <Link href="/" style={{ padding: "10px 24px", borderRadius: 10, background: "#8B5CF6", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
        Go to DropOS
      </Link>
    </div>
  );

  const products   = productsData?.products || productsData?.data || [];
  const categories = ["All", ...new Set(products.map((p: any) => p.category).filter(Boolean))] as string[];

  return (
    <TemplateRenderer
      store={store}
      products={products}
      categories={categories}
      search={search}
      onSearch={setSearch}
      category={category}
      onCategory={setCategory}
      sort={sort}
      onSort={setSort}
      isLoading={productsLoading}
      flashSales={flashSales || []}
    />
  );
}
