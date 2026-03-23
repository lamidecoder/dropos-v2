"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../../../lib/api";
import {
  Package, Search, ShoppingBag, Star, Truck,
  ShieldCheck, RotateCcw, ChevronUp, Phone,
  Mail, Instagram, Twitter, Facebook, X, Filter,
  Heart, Zap, Tag, Clock
} from "lucide-react";
import Link from "next/link";
import { useCartStore } from "../../../store/cart.store";
import CartDrawer from "../../../components/store/CartDrawer";

function fmt(price: number, currency = "NGN") {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency", currency,
      maximumFractionDigits: 0
    }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString()}`;
  }
}

// ── Back to top button ────────────────────────────────────────────────────────
function BackToTop({ brand }: { brand: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-24 right-4 z-40 w-10 h-10 rounded-full text-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
      style={{ background: brand }}>
      <ChevronUp size={18} />
    </button>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, slug, brand, store, view = "grid" }: any) {
  const addItem = useCartStore(s => s.addItem);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const outOfStock = product.inventory === 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem({
      id: product.id, productId: product.id,
      name: product.name, price: product.price,
      image: product.images?.[0], quantity: 1,
      storeId: store.id, storeSlug: slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(w => !w);
  };

  if (view === "list") {
    return (
      <Link href={`/store/${slug}/product/${product.id}`}
        className="flex gap-4 bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-all p-3">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-50">
          {product.images?.[0]
            ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-slate-200" /></div>
          }
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900 line-clamp-2">{product.name}</p>
            {product.category && <p className="text-xs text-slate-400 mt-0.5">{product.category}</p>}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-black text-sm" style={{ color: brand }}>{fmt(product.price, store.currency)}</span>
              {product.comparePrice && <span className="text-xs text-slate-400 line-through ml-1">{fmt(product.comparePrice, store.currency)}</span>}
            </div>
            <button onClick={handleAdd} disabled={outOfStock}
              className="text-xs font-bold text-white px-3 py-1.5 rounded-lg disabled:opacity-40 transition-all active:scale-95"
              style={{ background: added ? "#10b981" : brand }}>
              {added ? "✓ Added" : outOfStock ? "Sold Out" : "+ Cart"}
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/store/${slug}/product/${product.id}`}
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 block">
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={40} className="text-slate-200" /></div>
        }
        {discount > 0 && (
          <span className="absolute top-2 left-2 text-[10px] font-black text-white px-2 py-1 rounded-lg bg-red-500">
            -{discount}%
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-8 text-[10px] font-black text-white px-2 py-1 rounded-lg"
            style={{ background: brand }}>⚡ Hot</span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-black text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200">
              Sold Out
            </span>
          </div>
        )}
        <button onClick={handleWishlist}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
          <Heart size={13} className={wishlisted ? "fill-red-500 text-red-500" : "text-slate-400"} />
        </button>
      </div>
      <div className="p-3 sm:p-4">
        {product.category && (
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: `${brand}80` }}>
            {product.category}
          </p>
        )}
        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-2 leading-tight">{product.name}</h3>
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-sm font-black" style={{ color: brand }}>{fmt(product.price, store.currency)}</span>
            {product.comparePrice && (
              <span className="text-xs text-slate-400 line-through ml-1">{fmt(product.comparePrice, store.currency)}</span>
            )}
          </div>
          <button onClick={handleAdd} disabled={outOfStock}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm transition-all active:scale-95 disabled:opacity-40"
            style={{ background: added ? "#10b981" : brand }}>
            {added ? "✓" : "+"}
          </button>
        </div>
      </div>
    </Link>
  );
}

// ── Main Store Page ───────────────────────────────────────────────────────────
export default function StorefrontPage() {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const cartCount = useCartStore(s => s.count);
  const toggleCart = useCartStore(s => s.toggleCart);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [debouncedSearch, category, sort]);

  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ["public-store", slug],
    queryFn: () => publicApi.get(`/stores/public/${slug}`).then(r => r.data.data),
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["public-products", store?.id, debouncedSearch, category, sort, page],
    queryFn: () => publicApi.get(`/products/public/${store.id}`, {
      params: {
        search: debouncedSearch || undefined,
        category: category !== "All" ? category : undefined,
        sort,
        limit: 20,
        page,
      },
    }).then(r => r.data),
    enabled: !!store?.id,
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true,
  });

  const brand = store?.primaryColor || "#7c3aed";
  const products: any[] = productsData?.data || [];
  const totalProducts: number = productsData?.pagination?.total || 0;
  const totalPages: number = productsData?.pagination?.totalPages || 1;
  const categories = ["All", ...Array.from(new Set(products.map((p: any) => p.category).filter(Boolean)))] as string[];

  if (storeLoading) return <StoreSkeleton />;
  if (storeError || !store) return <StoreNotFound />;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Announcement bar ── */}
      {store.announcement && (
        <div className="text-center text-xs font-semibold text-white py-2 px-4"
          style={{ background: brand }}>
          {store.announcement}
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link href={`/store/${slug}`} className="flex items-center gap-2.5 flex-shrink-0">
            {store.logo
              ? <img src={store.logo} alt={store.name} className="h-9 w-9 rounded-xl object-cover" />
              : <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${brand}, ${brand}cc)` }}>
                  {store.name?.[0]?.toUpperCase()}
                </div>
            }
            <span className="font-black text-slate-900 text-lg hidden sm:block truncate max-w-[160px]">
              {store.name}
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-auto hidden sm:block">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${store.name}...`}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all" />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Cart */}
          <button onClick={toggleCart}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold flex-shrink-0 transition-all hover:opacity-90 active:scale-95 ml-auto sm:ml-0"
            style={{ background: `linear-gradient(135deg, ${brand}, ${brand}cc)` }}>
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">Cart</span>
            {cartCount() > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                {cartCount()}
              </span>
            )}
          </button>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-violet-400 transition-all" />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      {!debouncedSearch && (
        <section className="relative overflow-hidden py-14 sm:py-20 px-4"
          style={{ background: `linear-gradient(135deg, ${brand}12, ${brand}05, white)` }}>
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-5"
                style={{ background: `${brand}15`, color: brand }}>
                <Zap size={11} fill="currentColor" /> {store.name}
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
                {store.tagline || `Shop the best from ${store.name}`}
              </h1>
              {store.description && (
                <p className="text-slate-500 leading-relaxed mb-8 text-base sm:text-lg">{store.description}</p>
              )}
              <div className="flex flex-wrap gap-3">
                <a href="#products"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                  style={{ background: `linear-gradient(135deg, ${brand}, ${brand}cc)`, boxShadow: `0 8px 24px ${brand}40` }}>
                  Shop Now →
                </a>
                <Link href={`/store/${slug}/track`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold border-2 transition-all text-sm hover:bg-slate-50"
                  style={{ borderColor: `${brand}40`, color: brand }}>
                  Track Order
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Trust bar ── */}
      <div className="border-y border-slate-100 bg-slate-50/80">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-4 sm:gap-10 flex-wrap">
          {[
            { icon: Truck, label: "Fast Delivery" },
            { icon: ShieldCheck, label: "Secure Payment" },
            { icon: RotateCcw, label: "Easy Returns" },
            { icon: Star, label: "Quality Products" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Icon size={13} style={{ color: brand }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Products Section ── */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap"
                style={category === cat
                  ? { background: brand, color: "white" }
                  : { background: "#f1f5f9", color: "#64748b" }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white outline-none cursor-pointer">
              <option value="newest">Newest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="popular">Popular</option>
            </select>
            <div className="flex border border-slate-200 rounded-xl overflow-hidden">
              {(["grid", "list"] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-2 text-xs font-bold transition-all ${view === v ? "text-white" : "text-slate-400 bg-white"}`}
                  style={view === v ? { background: brand } : {}}>
                  {v === "grid" ? "⊞" : "☰"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-400 font-medium">
            {productsLoading
              ? "Loading..."
              : debouncedSearch
                ? `${totalProducts} result${totalProducts !== 1 ? "s" : ""} for "${debouncedSearch}"`
                : `${totalProducts} product${totalProducts !== 1 ? "s" : ""}`}
          </p>
          {debouncedSearch && (
            <button onClick={() => setSearch("")}
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: `${brand}15`, color: brand }}>
              Clear ×
            </button>
          )}
        </div>

        {/* Grid/List */}
        {productsLoading ? (
          <div className={`grid gap-4 sm:gap-5 ${view === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                <div className={view === "grid" ? "aspect-square bg-slate-100" : "h-24 bg-slate-100"} />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-100 rounded" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <Package size={48} className="mx-auto mb-4 text-slate-200" />
            <h3 className="text-lg font-black text-slate-700 mb-2">No products found</h3>
            <p className="text-slate-400 text-sm mb-6">
              {debouncedSearch ? `Nothing matches "${debouncedSearch}"` : "No products in this category yet"}
            </p>
            {(debouncedSearch || category !== "All") && (
              <button
                onClick={() => { setSearch(""); setCategory("All"); }}
                className="text-sm font-bold px-5 py-2.5 rounded-xl text-white"
                style={{ background: brand }}>
                View All Products
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={`grid gap-4 sm:gap-5 ${view === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 max-w-2xl"}`}>
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} slug={slug} brand={brand} store={store} view={view} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-all">
                  ← Prev
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = page <= 3 ? i + 1 : page - 2 + i;
                    if (p > totalPages) return null;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className="w-9 h-9 rounded-xl text-sm font-bold transition-all"
                        style={page === p ? { background: brand, color: "white" } : { color: "#64748b" }}>
                        {p}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-all">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 bg-slate-50 mt-10">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
                  style={{ background: `linear-gradient(135deg, ${brand}, ${brand}cc)` }}>
                  {store.name?.[0]}
                </div>
                <span className="font-black text-slate-800">{store.name}</span>
              </div>
              {store.description && (
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{store.description}</p>
              )}
            </div>

            {/* Quick links */}
            <div>
              <h4 className="font-black text-slate-800 mb-3 text-sm">Quick Links</h4>
              <div className="space-y-2">
                {[
                  { label: "All Products", href: "#products" },
                  { label: "Track Order", href: `/store/${slug}/track` },
                  { label: "My Account", href: `/store/${slug}/account` },
                ].map(({ label, href }) => (
                  <Link key={label} href={href}
                    className="block text-sm text-slate-500 hover:text-slate-800 transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-black text-slate-800 mb-3 text-sm">Contact</h4>
              <div className="space-y-2">
                {store.email && (
                  <a href={`mailto:${store.email}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                    <Mail size={13} /> {store.email}
                  </a>
                )}
                {store.phone && (
                  <a href={`tel:${store.phone}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                    <Phone size={13} /> {store.phone}
                  </a>
                )}
                {store.whatsapp && (
                  <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-bold"
                    style={{ color: "#25D366" }}>
                    💬 WhatsApp Us
                  </a>
                )}
              </div>
              {/* Social */}
              {(store.instagram || store.twitter || store.facebook) && (
                <div className="flex gap-2 mt-4">
                  {store.instagram && (
                    <a href={`https://instagram.com/${store.instagram}`} target="_blank" rel="noreferrer"
                      className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center hover:opacity-80 transition-all">
                      <Instagram size={14} className="text-slate-600" />
                    </a>
                  )}
                  {store.twitter && (
                    <a href={`https://twitter.com/${store.twitter}`} target="_blank" rel="noreferrer"
                      className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center hover:opacity-80 transition-all">
                      <Twitter size={14} className="text-slate-600" />
                    </a>
                  )}
                  {store.facebook && (
                    <a href={store.facebook} target="_blank" rel="noreferrer"
                      className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center hover:opacity-80 transition-all">
                      <Facebook size={14} className="text-slate-600" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} {store.name}. All rights reserved.
            </p>
            <p className="text-xs text-slate-400">
              Powered by <span className="font-bold text-slate-600">DropOS</span>
            </p>
          </div>
        </div>
      </footer>

      <BackToTop brand={brand} />
      <CartDrawer storeSlug={slug} storeId={store.id} brand={brand} fmt={(n) => fmt(n, store.currency)} />
    </div>
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