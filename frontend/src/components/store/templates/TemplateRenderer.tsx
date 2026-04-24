"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Heart, Package, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useCartStore } from "../../../store/cart.store";
import { useCurrencyStore } from "../../../store/currency.store";
import dynamic from "next/dynamic";
import CartDrawer from "../CartDrawer";

const AbandonedCartTracker = dynamic(() => import("../AbandonedCartTracker"), { ssr: false });

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
  category?:         string;
  onCategory?:       (c: string) => void;
  categories?:       string[];
  sort?:             string;
  onSort?:           (s: string) => void;
  isLoading?:        boolean;
  [key: string]:     any;
};

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, storeSlug, brand, dark, currency }: {
  product: any; storeSlug: string; brand: string; dark?: boolean; currency: string;
}) {
  const addItem = useCartStore(s => s.addItem);
  const { format, baseCurrency, setBaseCurrency } = useCurrencyStore();
  if (baseCurrency !== currency) setBaseCurrency(currency);
  const fmt = (v: number) => format(v, currency);
  const [added, setAdded]   = useState(false);
  const [liked, setLiked]   = useState(false);
  const img = product.images?.[0];
  const oos = product.inventory === 0;
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (oos) return;
    addItem({ id: product.id, productId: product.id, name: product.name, price: product.price, image: img, storeId: product.storeId, storeSlug });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/store/${storeSlug}/product/${product.id}`}
      className="group relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{
        background: dark ? "rgba(255,255,255,0.04)" : "#fff",
        border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #f0f0f0",
        boxShadow: dark ? "none" : "0 2px 8px rgba(0,0,0,0.06)",
      }}>
      <div className="relative aspect-square overflow-hidden"
        style={{ background: dark ? "rgba(255,255,255,0.03)" : "#f8f8f8" }}>
        {img
          ? <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={32} style={{ color: `${brand}50` }} /></div>
        }
        {discount > 0 && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-1 rounded-lg text-xs font-black text-white bg-red-500">
            -{discount}%
          </span>
        )}
        {oos && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
            <span className="text-xs font-bold text-white px-3 py-1.5 rounded-full bg-black/60">Sold Out</span>
          </div>
        )}
        <button onClick={e => { e.preventDefault(); setLiked(!liked); }}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
          style={{ background: "rgba(255,255,255,0.95)" }}>
          <Heart size={12} className={liked ? "fill-red-500 text-red-500" : "text-slate-400"} />
        </button>
        {!oos && (
          <div className="absolute inset-x-2 sm:inset-x-3 bottom-2 sm:bottom-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
            <button onClick={handleAdd}
              className="w-full py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg transition-all"
              style={{ background: added ? "#10b981" : `linear-gradient(135deg,${brand},${brand}bb)` }}>
              {added ? "✓ Added!" : "Add to Cart"}
            </button>
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        {product.category && (
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide mb-1"
            style={{ color: dark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>
            {product.category}
          </span>
        )}
        <h3 className="font-semibold text-xs sm:text-sm leading-snug line-clamp-2 mb-2 flex-1"
          style={{ color: dark ? "rgba(255,255,255,0.9)" : "#1e293b" }}>
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-black text-sm sm:text-base" style={{ color: dark ? "#fff" : "#0f172a" }}>
            {fmt(product.price ?? 0)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs line-through" style={{ color: dark ? "rgba(255,255,255,0.25)" : "#94a3b8" }}>
              {fmt(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Store Header ──────────────────────────────────────────────────────────────
function StoreHeader({ store, search, onSearch, dark, brand }: {
  store: any; search?: string; onSearch?: (q: string) => void; dark?: boolean; brand: string;
}) {
  const cartCount  = useCartStore(s => s.items.reduce((a, i) => a + i.quantity, 0));
  const toggleCart = useCartStore(s => s.toggleCart);
  const slug       = store.slug;

  return (
    <header className="sticky top-0 z-40 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3"
      style={{
        background: dark ? "rgba(6,4,13,0.96)" : "rgba(255,255,255,0.96)",
        backdropFilter: "blur(16px)",
        borderBottom: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #f0f0f0",
      }}>
      {/* Logo */}
      <Link href={`/store/${slug}`} className="flex items-center gap-2 flex-shrink-0">
        {store.logo
          ? <img src={store.logo} alt={store.name} className="h-7 sm:h-8 w-auto" />
          : (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-black"
                style={{ background: brand }}>{store.name?.[0]}</div>
              <span className="font-black text-sm sm:text-lg tracking-tight hidden sm:block"
                style={{ color: dark ? "#fff" : "#0f172a" }}>{store.name}</span>
            </div>
          )
        }
      </Link>

      {/* Search — desktop */}
      {onSearch && (
        <div className="flex-1 max-w-md relative hidden sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: dark ? "rgba(255,255,255,0.3)" : "#94a3b8" }} />
          <input
            value={search || ""}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: dark ? "rgba(255,255,255,0.06)" : "#f8fafc",
              border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
              color: dark ? "#fff" : "#0f172a",
            }}
          />
        </div>
      )}

      {/* Cart */}
      <button onClick={toggleCart}
        className="relative flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white transition-all hover:opacity-90"
        style={{ background: brand }}>
        <ShoppingCart size={14} />
        <span className="hidden sm:inline">Cart</span>
        {cartCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 text-white text-[9px] sm:text-[10px] font-black flex items-center justify-center">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}
      </button>
    </header>
  );
}

// ── Category Filters ──────────────────────────────────────────────────────────
function CategoryBar({ categories, category, onCategory, brand, dark, sort, onSort }: {
  categories: string[]; category?: string; onCategory?: (c: string) => void;
  brand: string; dark?: boolean; sort?: string; onSort?: (s: string) => void;
}) {
  if (categories.length <= 1 && !onSort) return null;

  return (
    <div className="px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto"
      style={{ borderBottom: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #f0f0f0", scrollbarWidth: "none" }}>
      {categories.map(c => (
        <button key={c} onClick={() => onCategory?.(c)}
          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all"
          style={c === category
            ? { background: brand, color: "#fff" }
            : { background: dark ? "rgba(255,255,255,0.06)" : "#f8fafc", color: dark ? "rgba(255,255,255,0.5)" : "#64748b", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0" }
          }>
          {c}
        </button>
      ))}
      {onSort && (
        <div className="relative ml-auto flex-shrink-0">
          <select value={sort || "newest"} onChange={e => onSort(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium outline-none cursor-pointer"
            style={{
              background: dark ? "rgba(255,255,255,0.06)" : "#f8fafc",
              border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
              color: dark ? "rgba(255,255,255,0.7)" : "#374151",
            }}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="popular">Popular</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: dark ? "rgba(255,255,255,0.4)" : "#94a3b8" }} />
        </div>
      )}
    </div>
  );
}

// ── Mobile Search ─────────────────────────────────────────────────────────────
function MobileSearch({ search, onSearch, dark }: { search?: string; onSearch?: (q: string) => void; dark?: boolean }) {
  if (!onSearch) return null;
  return (
    <div className="px-4 py-3 sm:hidden" style={{ background: dark ? "#06040D" : "#fff", borderBottom: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #f0f0f0" }}>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: dark ? "rgba(255,255,255,0.3)" : "#94a3b8" }} />
        <input
          value={search || ""}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: dark ? "rgba(255,255,255,0.06)" : "#f8fafc",
            border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
            color: dark ? "#fff" : "#0f172a",
          }}
        />
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ dark, search }: { dark?: boolean; search?: string }) {
  return (
    <div className="text-center py-16 sm:py-24 px-4">
      <Package size={40} className="mx-auto mb-4 opacity-20" style={{ color: dark ? "#fff" : "#64748b" }} />
      <p className="font-semibold text-sm" style={{ color: dark ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
        {search ? `No products matching "${search}"` : "No products yet"}
      </p>
    </div>
  );
}

// ── Skeleton Grid ─────────────────────────────────────────────────────────────
function SkeletonGrid({ dark }: { dark?: boolean }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
          style={{ background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc" }}>
          <div className="aspect-square" style={{ background: dark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }} />
          <div className="p-3 sm:p-4 space-y-2">
            <div className="h-3 rounded-full w-3/4" style={{ background: dark ? "rgba(255,255,255,0.06)" : "#e2e8f0" }} />
            <div className="h-3 rounded-full w-1/2" style={{ background: dark ? "rgba(255,255,255,0.06)" : "#e2e8f0" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── CLASSIC Template ──────────────────────────────────────────────────────────
function ClassicTemplate(props: TemplateProps) {
  const { store, products = [], search, onSearch, category, onCategory, categories = [], sort, onSort, isLoading } = props;
  const brand    = store.brandColor || store.primaryColor || "#6B35E8";
  const currency = store.currency   || "NGN";

  return (
    <div className="min-h-screen" style={{ background: "#fff" }}>
      <StoreHeader store={store} search={search} onSearch={onSearch} brand={brand} />
      <MobileSearch search={search} onSearch={onSearch} />

      {/* Hero */}
      <div className="px-4 sm:px-6 py-10 sm:py-16 text-center"
        style={{ background: `linear-gradient(135deg,${brand}08,${brand}04)` }}>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2 sm:mb-3">{store.name}</h1>
        {store.description && (
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">{store.description}</p>
        )}
      </div>

      <CategoryBar categories={categories} category={category} onCategory={onCategory} brand={brand} sort={sort} onSort={onSort} />

      {/* Grid */}
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
        {isLoading
          ? <SkeletonGrid />
          : products.length === 0
            ? <EmptyState search={search} />
            : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {products.map(p => <ProductCard key={p.id} product={p} storeSlug={store.slug} brand={brand} currency={currency} />)}
              </div>
        }
      </div>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-8 mt-8 text-center border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Powered by <a href="https://droposhq.com" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-slate-600">DropOS</a>
        </p>
      </footer>

      <CartDrawer storeSlug={store.slug} storeId={store.id} brand={brand} currency={currency}
        fmt={v => new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(v)} />
    </div>
  );
}

// ── DARK LUXE Template ────────────────────────────────────────────────────────
function DarkLuxeTemplate(props: TemplateProps) {
  const { store, products = [], search, onSearch, category, onCategory, categories = [], sort, onSort, isLoading } = props;
  const brand    = store.brandColor || store.primaryColor || "#6B35E8";
  const currency = store.currency   || "NGN";

  return (
    <div className="min-h-screen" style={{ background: "#06040D" }}>
      <StoreHeader store={store} search={search} onSearch={onSearch} dark brand={brand} />
      <MobileSearch search={search} onSearch={onSearch} dark />

      {/* Hero */}
      <div className="px-4 sm:px-6 py-10 sm:py-16 text-center">
        <h1 className="text-2xl sm:text-5xl font-black tracking-tight text-white mb-2 sm:mb-3">{store.name}</h1>
        {store.description && (
          <p className="text-sm sm:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{store.description}</p>
        )}
      </div>

      <CategoryBar categories={categories} category={category} onCategory={onCategory} brand={brand} dark sort={sort} onSort={onSort} />

      {/* Grid */}
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
        {isLoading
          ? <SkeletonGrid dark />
          : products.length === 0
            ? <EmptyState dark search={search} />
            : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {products.map(p => <ProductCard key={p.id} product={p} storeSlug={store.slug} brand={brand} dark currency={currency} />)}
              </div>
        }
      </div>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-8 mt-8 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          Powered by <a href="https://droposhq.com" target="_blank" rel="noopener noreferrer" className="font-bold hover:opacity-70">DropOS</a>
        </p>
      </footer>

      <CartDrawer storeSlug={store.slug} storeId={store.id} brand={brand} currency={currency}
        fmt={v => new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(v)} />
    </div>
  );
}

// ── Template Map ──────────────────────────────────────────────────────────────
const TEMPLATE_MAP: Record<string, (props: TemplateProps) => JSX.Element> = {
  "classic":      ClassicTemplate,
  "dark-luxe":    DarkLuxeTemplate,
  "bold":         ClassicTemplate,
  "editorial":    ClassicTemplate,
  "neon":         DarkLuxeTemplate,
  "boutique":     ClassicTemplate,
  "minimal-pro":  ClassicTemplate,
  "grid":         ClassicTemplate,
  "magazine":     ClassicTemplate,
  "split":        ClassicTemplate,
  "glassmorphic": DarkLuxeTemplate,
  "vintage":      ClassicTemplate,
  "ultra-dark":   DarkLuxeTemplate,
  "runway":       DarkLuxeTemplate,
  "modern":       ClassicTemplate,
  "minimal":      ClassicTemplate,
  "elegant":      ClassicTemplate,
};

// ── Main Export ───────────────────────────────────────────────────────────────
export function TemplateRenderer(props: TemplateProps) {
  const theme     = props.store?.theme || "classic";
  const Component = TEMPLATE_MAP[theme] || ClassicTemplate;

  return (
    <div className="template-root">
      <Component {...props} />
      <AbandonedCartTracker store={props.store} exitDiscount={10} idleMinutes={30} />
    </div>
  );
}
