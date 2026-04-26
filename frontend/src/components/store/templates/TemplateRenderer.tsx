"use client";
import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Heart, Package, ChevronDown, Star, Truck, Shield, RotateCcw, ArrowRight, Menu, X } from "lucide-react";
import { useCartStore } from "../../../store/cart.store";
import { useCurrencyStore } from "../../../store/currency.store";
import dynamic from "next/dynamic";
import CartDrawer from "../CartDrawer";

const AbandonedCartTracker = dynamic(() => import("../AbandonedCartTracker"), { ssr: false });

// ── Types ─────────────────────────────────────────────────────────────────────
export type TemplateProps = {
  store:             any;
  products?:         any[];
  product?:          any;
  cart?:             any;
  onAddToCart?:      (product: any) => void;
  onRemoveFromCart?: (productId: string) => void;
  onUpdateQuantity?: (productId: string, qty: number) => void;
  onCheckout?:       () => void;
  page?:             "home" | "product" | "cart" | "checkout" | "confirmation";
  search?:           string;
  onSearch?:         (q: string) => void;
  setSearch?:        (q: string) => void;
  category?:         string;
  onCategory?:       (c: string) => void;
  setCategory?:      (c: string) => void;
  categories?:       string[];
  sort?:             string;
  onSort?:           (s: string) => void;
  setSort?:          (s: string) => void;
  isLoading?:        boolean;
  [key: string]:     any;
};

// Normalize props — accept both setX and onX patterns
function normalize(props: TemplateProps) {
  return {
    ...props,
    onSearch:   props.onSearch   ?? props.setSearch   ?? (() => {}),
    onCategory: props.onCategory ?? props.setCategory ?? (() => {}),
    onSort:     props.onSort     ?? props.setSort     ?? (() => {}),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function useFmt(currency: string) {
  const { format, baseCurrency, setBaseCurrency } = useCurrencyStore();
  if (baseCurrency !== currency) setBaseCurrency(currency);
  return (v: number) => format(v, currency);
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, storeSlug, brand, dark, currency }: {
  product: any; storeSlug: string; brand: string; dark?: boolean; currency: string;
}) {
  const addItem = useCartStore(s => s.addItem);
  const fmt     = useFmt(currency);
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);

  const img      = product.images?.[0];
  const oos      = product.inventory === 0;
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (oos) return;
    addItem({ id: product.id, productId: product.id, name: product.name, price: product.price, image: img, storeId: product.storeId, storeSlug });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <Link href={`/store/${storeSlug}/product/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: dark ? "rgba(255,255,255,0.04)" : "#fff",
        border: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #f0f0f0",
        boxShadow: dark ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
      }}>

      {/* Image area */}
      <div className="relative aspect-square overflow-hidden"
        style={{ background: dark ? "rgba(255,255,255,0.03)" : "#f9f9f9" }}>
        {img
          ? <img src={img} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={28} style={{ color: `${brand}40` }} /></div>
        }

        {/* Badges */}
        {discount > 0 && !oos && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[11px] font-black text-white" style={{ background: "#EF4444" }}>
            -{discount}%
          </span>
        )}
        {oos && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
            <span className="text-xs font-bold text-white px-3 py-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.6)" }}>Sold Out</span>
          </div>
        )}

        {/* Wishlist */}
        <button onClick={e => { e.preventDefault(); setLiked(!liked); }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md"
          style={{ background: "rgba(255,255,255,0.95)" }}>
          <Heart size={13} className={liked ? "fill-red-500 text-red-500" : "text-slate-400"} />
        </button>

        {/* Add to cart — slides up on hover */}
        {!oos && (
          <div className="absolute bottom-2.5 inset-x-2.5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
            <button onClick={handleAdd}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-lg"
              style={{ background: added ? "#10B981" : `linear-gradient(135deg,${brand},${brand}cc)` }}>
              {added ? "Added!" : "Add to Cart"}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col gap-1.5">
        {product.category && (
          <span className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: dark ? "rgba(255,255,255,0.3)" : "#9ca3af" }}>
            {product.category}
          </span>
        )}
        <h3 className="font-semibold text-xs sm:text-sm leading-snug line-clamp-2 flex-1"
          style={{ color: dark ? "rgba(255,255,255,0.88)" : "#111827" }}>
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="font-black text-sm sm:text-base" style={{ color: dark ? "#fff" : "#111827" }}>
            {fmt(product.price ?? 0)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs line-through" style={{ color: dark ? "rgba(255,255,255,0.22)" : "#9ca3af" }}>
              {fmt(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Trust bar ─────────────────────────────────────────────────────────────────
function TrustBar({ dark }: { dark?: boolean }) {
  const items = [
    { icon: Truck,    label: "Free delivery over ₦30k" },
    { icon: Shield,   label: "Secure payment" },
    { icon: RotateCcw,label: "Easy returns" },
    { icon: Star,     label: "Verified seller" },
  ];
  return (
    <div className="border-y px-4 sm:px-6 py-3 overflow-x-auto"
      style={{ borderColor: dark ? "rgba(255,255,255,0.06)" : "#f0f0f0", scrollbarWidth: "none" }}>
      <div className="flex items-center gap-6 sm:gap-10 min-w-max mx-auto justify-center">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon size={13} style={{ color: dark ? "rgba(255,255,255,0.4)" : "#9ca3af", flexShrink: 0 }} />
            <span className="text-xs font-medium whitespace-nowrap" style={{ color: dark ? "rgba(255,255,255,0.45)" : "#6b7280" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Storefront Header ─────────────────────────────────────────────────────────
function StoreHeader({ store, search, onSearch, dark, brand, onCategory, categories, category }: {
  store: any; search?: string; onSearch: (q: string) => void;
  dark?: boolean; brand: string; onCategory: (c: string) => void;
  categories: string[]; category?: string;
}) {
  const cartCount  = useCartStore(s => s.items.reduce((a, i) => a + i.quantity, 0));
  const toggleCart = useCartStore(s => s.toggleCart);
  const [mobileMenu, setMobileMenu] = useState(false);
  const slug = store.slug;

  const bg      = dark ? "rgba(8,6,18,0.97)" : "rgba(255,255,255,0.97)";
  const border  = dark ? "rgba(255,255,255,0.07)" : "#f0f0f0";
  const textCol = dark ? "#fff" : "#111827";
  const mutedCol = dark ? "rgba(255,255,255,0.45)" : "#6b7280";

  return (
    <header className="sticky top-0 z-40" style={{ background: bg, backdropFilter: "blur(20px)", borderBottom: `1px solid ${border}` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center gap-3 sm:gap-4">

        {/* Logo */}
        <Link href={`/store/${slug}`} className="flex items-center gap-2.5 flex-shrink-0">
          {store.logo
            ? <img src={store.logo} alt={store.name} className="h-7 w-auto" />
            : <>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                  style={{ background: brand }}>{store.name?.[0]}</div>
                <span className="font-black text-sm sm:text-base tracking-tight" style={{ color: textCol }}>{store.name}</span>
              </>
          }
        </Link>

        {/* Search — desktop */}
        <div className="flex-1 max-w-xs hidden sm:block">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: mutedCol }} />
            <input value={search || ""} onChange={e => onSearch(e.target.value)} placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
              style={{ background: dark ? "rgba(255,255,255,0.06)" : "#f4f4f5", border: `1px solid ${border}`, color: textCol }} />
          </div>
        </div>

        <div className="flex-1" />

        {/* Nav links — desktop */}
        {categories.length > 1 && (
          <nav className="hidden sm:flex items-center gap-1">
            {categories.slice(0, 5).map(c => (
              <button key={c} onClick={() => onCategory(c)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={c === category
                  ? { background: brand, color: "#fff" }
                  : { color: mutedCol }}>
                {c}
              </button>
            ))}
          </nav>
        )}

        {/* Cart */}
        <button onClick={toggleCart}
          className="relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: brand }}>
          <ShoppingCart size={14} />
          <span className="hidden sm:inline">Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </button>

        {/* Mobile menu toggle */}
        <button onClick={() => setMobileMenu(!mobileMenu)} className="sm:hidden p-2 rounded-lg" style={{ color: mutedCol }}>
          {mobileMenu ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile search + nav */}
      {mobileMenu && (
        <div className="sm:hidden px-4 pb-3 pt-1 space-y-2" style={{ borderTop: `1px solid ${border}` }}>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: mutedCol }} />
            <input value={search || ""} onChange={e => onSearch(e.target.value)} placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: dark ? "rgba(255,255,255,0.06)" : "#f4f4f5", border: `1px solid ${border}`, color: textCol }} />
          </div>
          {categories.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {categories.map(c => (
                <button key={c} onClick={() => { onCategory(c); setMobileMenu(false); }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-all"
                  style={c === category ? { background: brand, color: "#fff" } : { background: dark ? "rgba(255,255,255,0.07)" : "#f4f4f5", color: mutedCol }}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}

// ── Sort bar ──────────────────────────────────────────────────────────────────
function SortBar({ sort, onSort, total, dark }: { sort?: string; onSort: (s: string) => void; total: number; dark?: boolean }) {
  const mutedCol = dark ? "rgba(255,255,255,0.38)" : "#9ca3af";
  const border   = dark ? "rgba(255,255,255,0.07)" : "#f0f0f0";

  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-3" style={{ borderBottom: `1px solid ${border}` }}>
      <span className="text-xs" style={{ color: mutedCol }}>{total} product{total !== 1 ? "s" : ""}</span>
      <div className="relative">
        <select value={sort || "newest"} onChange={e => onSort(e.target.value)}
          className="appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-medium outline-none cursor-pointer"
          style={{ background: dark ? "rgba(255,255,255,0.06)" : "#f4f4f5", border: `1px solid ${border}`, color: dark ? "rgba(255,255,255,0.7)" : "#374151" }}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popular">Popular</option>
        </select>
        <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: mutedCol }} />
      </div>
    </div>
  );
}

// ── Product grid ──────────────────────────────────────────────────────────────
function ProductGrid({ products, store, brand, dark, currency }: { products: any[]; store: any; brand: string; dark?: boolean; currency: string }) {
  const faint = dark ? "rgba(255,255,255,0.04)" : "#f9f9f9";
  const border = dark ? "rgba(255,255,255,0.06)" : "#f0f0f0";

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: faint, border: `1px solid ${border}` }}>
          <Package size={24} style={{ color: dark ? "rgba(255,255,255,0.2)" : "#d1d5db" }} />
        </div>
        <p className="font-semibold text-sm mb-1" style={{ color: dark ? "rgba(255,255,255,0.4)" : "#6b7280" }}>No products found</p>
        <p className="text-xs" style={{ color: dark ? "rgba(255,255,255,0.2)" : "#9ca3af" }}>Try a different search or category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {products.map(p => (
        <ProductCard key={p.id} product={p} storeSlug={store.slug} brand={brand} dark={dark} currency={currency} />
      ))}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ dark }: { dark?: boolean }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
          style={{ background: dark ? "rgba(255,255,255,0.04)" : "#f9f9f9" }}>
          <div className="aspect-square" style={{ background: dark ? "rgba(255,255,255,0.06)" : "#f0f0f0" }} />
          <div className="p-3 space-y-2">
            <div className="h-3 rounded-full w-2/3" style={{ background: dark ? "rgba(255,255,255,0.06)" : "#e5e7eb" }} />
            <div className="h-3 rounded-full w-1/2" style={{ background: dark ? "rgba(255,255,255,0.04)" : "#e5e7eb" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function StoreFooter({ store, dark, brand }: { store: any; dark?: boolean; brand: string }) {
  const mutedCol = dark ? "rgba(255,255,255,0.22)" : "#9ca3af";
  const border   = dark ? "rgba(255,255,255,0.06)" : "#f0f0f0";

  return (
    <footer className="px-4 sm:px-6 py-10 mt-12" style={{ borderTop: `1px solid ${border}` }}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-black flex-shrink-0" style={{ background: brand }}>{store.name?.[0]}</div>
          <span className="text-sm font-semibold" style={{ color: dark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>{store.name}</span>
        </div>
        <p className="text-xs" style={{ color: mutedCol }}>
          Powered by{" "}
          <a href="https://droposhq.com" target="_blank" rel="noopener noreferrer"
            className="font-bold hover:opacity-70 transition-opacity" style={{ color: mutedCol }}>
            DropOS
          </a>
        </p>
      </div>
    </footer>
  );
}

// ── CLASSIC template ──────────────────────────────────────────────────────────
function ClassicTemplate(raw: TemplateProps) {
  const props    = normalize(raw);
  const { store, products = [], search, onSearch, category, onCategory, categories = [], sort, onSort, isLoading } = props;
  const brand    = store.brandColor || store.primaryColor || "#6B35E8";
  const currency = store.currency || "NGN";
  const fmt      = useFmt(currency);

  return (
    <div className="min-h-screen" style={{ background: "#fafafa", fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <StoreHeader store={store} search={search} onSearch={onSearch} brand={brand}
        onCategory={onCategory} categories={categories} category={category} />

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg,${brand}06,transparent)` }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
          {store.bannerImage && (
            <div className="absolute inset-0 overflow-hidden">
              <img src={store.bannerImage} alt="" className="w-full h-full object-cover opacity-10" />
            </div>
          )}
          <div className="relative">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 mb-3 sm:mb-4">{store.name}</h1>
            {store.description && (
              <p className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto leading-relaxed mb-6">{store.description}</p>
            )}
            <button onClick={() => document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg,${brand},${brand}cc)` }}>
              Shop Now <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <TrustBar />

      {/* Products */}
      <div id="products-grid" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <SortBar sort={sort} onSort={onSort} total={products.length} />
        <div className="pt-6">
          {isLoading ? <Skeleton /> : <ProductGrid products={products} store={store} brand={brand} currency={currency} />}
        </div>
      </div>

      <StoreFooter store={store} brand={brand} />

      <CartDrawer storeSlug={store.slug} storeId={store.id} brand={brand} currency={currency}
        fmt={v => new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(v)} />
    </div>
  );
}

// ── DARK LUXE template ────────────────────────────────────────────────────────
function DarkLuxeTemplate(raw: TemplateProps) {
  const props    = normalize(raw);
  const { store, products = [], search, onSearch, category, onCategory, categories = [], sort, onSort, isLoading } = props;
  const brand    = store.brandColor || store.primaryColor || "#6B35E8";
  const currency = store.currency || "NGN";

  return (
    <div className="min-h-screen" style={{ background: "#07050F", fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <StoreHeader store={store} search={search} onSearch={onSearch} brand={brand} dark
        onCategory={onCategory} categories={categories} category={category} />

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20"
            style={{ background: `radial-gradient(ellipse, ${brand}, transparent 70%)`, filter: "blur(80px)" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h1 className="text-3xl sm:text-6xl font-black tracking-tight text-white mb-4 sm:mb-5"
            style={{ letterSpacing: "-2px" }}>
            {store.name}
          </h1>
          {store.description && (
            <p className="text-sm sm:text-lg max-w-md mx-auto leading-relaxed mb-8"
              style={{ color: "rgba(255,255,255,0.4)" }}>
              {store.description}
            </p>
          )}
          <button onClick={() => document.getElementById("products-grid-dark")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg,${brand},${brand}99)`, boxShadow: `0 8px 32px ${brand}40` }}>
            Explore Collection <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <TrustBar dark />

      {/* Products */}
      <div id="products-grid-dark" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <SortBar sort={sort} onSort={onSort} total={products.length} dark />
        <div className="pt-6">
          {isLoading ? <Skeleton dark /> : <ProductGrid products={products} store={store} brand={brand} dark currency={currency} />}
        </div>
      </div>

      <StoreFooter store={store} brand={brand} dark />

      <CartDrawer storeSlug={store.slug} storeId={store.id} brand={brand} currency={currency}
        fmt={v => new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(v)} />
    </div>
  );
}

// ── MINIMAL template ──────────────────────────────────────────────────────────
function MinimalTemplate(raw: TemplateProps) {
  const props    = normalize(raw);
  const { store, products = [], search, onSearch, category, onCategory, categories = [], sort, onSort, isLoading } = props;
  const brand    = store.brandColor || store.primaryColor || "#111827";
  const currency = store.currency || "NGN";

  return (
    <div className="min-h-screen" style={{ background: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <StoreHeader store={store} search={search} onSearch={onSearch} brand={brand}
        onCategory={onCategory} categories={categories} category={category} />

      {/* Minimal hero — just text, no background */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-gray-900 mb-2">{store.name}</h1>
          {store.description && <p className="text-sm text-gray-500 max-w-md leading-relaxed">{store.description}</p>}
        </div>

        {/* Sort */}
        <div className="flex items-center justify-between mb-5 pb-4" style={{ borderBottom: "1px solid #f0f0f0" }}>
          <span className="text-xs text-gray-400">{products.length} items</span>
          <div className="relative">
            <select value={sort || "newest"} onChange={e => onSort(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-medium outline-none cursor-pointer bg-gray-50 border border-gray-200 text-gray-600">
              <option value="newest">Newest</option>
              <option value="price_asc">Low to High</option>
              <option value="price_desc">High to Low</option>
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
          </div>
        </div>

        {isLoading ? <Skeleton /> : <ProductGrid products={products} store={store} brand={brand} currency={currency} />}
      </div>

      <StoreFooter store={store} brand={brand} />
      <CartDrawer storeSlug={store.slug} storeId={store.id} brand={brand} currency={currency}
        fmt={v => new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(v)} />
    </div>
  );
}

// ── Template registry ─────────────────────────────────────────────────────────
const TEMPLATES: Record<string, (props: TemplateProps) => JSX.Element> = {
  "classic":      ClassicTemplate,
  "dark-luxe":    DarkLuxeTemplate,
  "minimal":      MinimalTemplate,
  "minimal-pro":  MinimalTemplate,
  "bold":         ClassicTemplate,
  "editorial":    ClassicTemplate,
  "neon":         DarkLuxeTemplate,
  "boutique":     ClassicTemplate,
  "grid":         ClassicTemplate,
  "magazine":     ClassicTemplate,
  "split":        ClassicTemplate,
  "glassmorphic": DarkLuxeTemplate,
  "vintage":      ClassicTemplate,
  "ultra-dark":   DarkLuxeTemplate,
  "runway":       DarkLuxeTemplate,
  "elegant":      MinimalTemplate,
  "modern":       ClassicTemplate,
};

// ── Main export ───────────────────────────────────────────────────────────────
export function TemplateRenderer(props: TemplateProps) {
  const theme     = props.store?.theme || "classic";
  const Component = TEMPLATES[theme] || ClassicTemplate;
  return (
    <div className="template-root">
      <Component {...props} />
      <AbandonedCartTracker store={props.store} exitDiscount={10} idleMinutes={30} />
    </div>
  );
}
