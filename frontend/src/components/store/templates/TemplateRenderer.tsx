"use client";
import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Heart, Package } from "lucide-react";
import { useCartStore } from "../../../store/cart.store";
import { useCurrencyStore } from "../../../store/currency.store";
import dynamic from "next/dynamic";

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
  [key: string]:     any;
};

function ProductCard({ product, storeSlug, brand, dark }: { product: any; storeSlug: string; brand: string; dark?: boolean }) {
  const addItem = useCartStore(s => s.addItem);
  const { format, baseCurrency, setBaseCurrency } = useCurrencyStore();
  if (baseCurrency !== (product.currency || "NGN")) setBaseCurrency(product.currency || "NGN");
  const fmt = (v: number) => format(v, product.currency || "NGN");
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const img = product.images?.[0];
  const oos = product.inventory === 0;
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ id: product.id, productId: product.id, name: product.name, price: product.price, image: img, storeId: product.storeId, storeSlug });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/store/${storeSlug}/product/${product.id}`}
      className="group relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
      style={{ background: dark ? "rgba(255,255,255,0.04)" : "#fff", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #f0f0f0", boxShadow: dark ? "none" : "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div className="relative aspect-square overflow-hidden" style={{ background: dark ? "rgba(255,255,255,0.03)" : "#f8f8f8" }}>
        {img
          ? <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={32} style={{ color: `${brand}50` }} /></div>
        }
        {discount > 0 && (
          <span className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-black text-white bg-red-500">
            -{discount}%
          </span>
        )}
        {oos && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
            <span className="text-xs font-bold text-white px-3 py-1.5 rounded-full bg-black/60">Sold Out</span>
          </div>
        )}
        <button onClick={e => { e.preventDefault(); setLiked(!liked); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
          style={{ background: "rgba(255,255,255,0.9)" }}>
          <Heart size={13} className={liked ? "fill-red-500 text-red-500" : "text-slate-400"} />
        </button>
        {!oos && (
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
            <button onClick={handleAdd}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all"
              style={{ background: added ? "#10b981" : `linear-gradient(135deg,${brand},${brand}bb)` }}>
              {added ? "Added!" : "Add to Cart"}
            </button>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        {product.category && (
          <span className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: dark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>
            {product.category}
          </span>
        )}
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-2 flex-1"
          style={{ color: dark ? "rgba(255,255,255,0.9)" : "#1e293b" }}>
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-black" style={{ color: dark ? "#fff" : "#0f172a" }}>{fmt(product.price ?? 0)}</span>
          {product.comparePrice && (
            <span className="text-sm line-through" style={{ color: dark ? "rgba(255,255,255,0.25)" : "#94a3b8" }}>
              {fmt(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function StoreHeader({ store, search, onSearch, dark }: { store: any; search?: string; onSearch?: (q: string) => void; dark?: boolean }) {
  const cartCount = useCartStore(s => s.items.reduce((a, i) => a + i.quantity, 0));
  const brand = store.brandColor || "#6B35E8";
  const slug  = store.slug;

  return (
    <header className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between gap-4"
      style={{ background: dark ? "rgba(6,4,13,0.95)" : "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #f0f0f0" }}>
      <Link href={`/store/${slug}`} className="flex items-center gap-2.5 flex-shrink-0">
        {store.logo
          ? <img src={store.logo} alt={store.name} className="h-8 w-auto" />
          : <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black" style={{ background: brand }}>{store.name?.[0]}</div>
        }
        <span className="font-black text-lg tracking-tight" style={{ color: dark ? "#fff" : "#0f172a" }}>{store.name}</span>
      </Link>

      {onSearch && (
        <div className="flex-1 max-w-md relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: dark ? "rgba(255,255,255,0.3)" : "#94a3b8" }} />
          <input value={search || ""} onChange={e => onSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: dark ? "rgba(255,255,255,0.06)" : "#f8fafc", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0", color: dark ? "#fff" : "#0f172a" }} />
        </div>
      )}

      <Link href={`/store/${slug}/checkout`}
        className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
        style={{ background: brand }}>
        <ShoppingCart size={15} />
        Cart
        {cartCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </Link>
    </header>
  );
}

function ClassicTemplate(props: TemplateProps) {
  const { store, products = [], search, onSearch, category, onCategory, categories = [] } = props;
  const brand = store.brandColor || "#6B35E8";

  return (
    <div className="min-h-screen bg-white">
      <StoreHeader store={store} search={search} onSearch={onSearch} />
      <div className="px-6 py-16 text-center" style={{ background: `linear-gradient(135deg,${brand}08,${brand}04)` }}>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3">{store.name}</h1>
        {store.description && <p className="text-slate-500 max-w-xl mx-auto text-lg">{store.description}</p>}
      </div>
      {categories.length > 1 && (
        <div className="px-6 py-4 flex gap-2 overflow-x-auto border-b border-slate-100" style={{ scrollbarWidth: "none" }}>
          {categories.map(c => (
            <button key={c} onClick={() => onCategory?.(c)}
              className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all"
              style={c === category ? { background: brand, color: "#fff" } : { background: "#f8fafc", color: "#64748b" }}>
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {products.length === 0
          ? <div className="text-center py-24 text-slate-400"><Package size={48} className="mx-auto mb-4 opacity-30" /><p className="font-semibold">No products yet</p></div>
          : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{products.map(p => <ProductCard key={p.id} product={p} storeSlug={store.slug} brand={brand} />)}</div>
        }
      </div>
    </div>
  );
}

function DarkLuxeTemplate(props: TemplateProps) {
  const { store, products = [], search, onSearch, category, onCategory, categories = [] } = props;
  const brand = store.brandColor || "#6B35E8";

  return (
    <div className="min-h-screen" style={{ background: "#06040D" }}>
      <StoreHeader store={store} search={search} onSearch={onSearch} dark />
      <div className="px-6 py-16 text-center">
        <h1 className="text-5xl font-black tracking-tight text-white mb-3">{store.name}</h1>
        {store.description && <p className="max-w-xl mx-auto text-lg" style={{ color: "rgba(255,255,255,0.45)" }}>{store.description}</p>}
      </div>
      {categories.length > 1 && (
        <div className="px-6 py-4 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {categories.map(c => (
            <button key={c} onClick={() => onCategory?.(c)}
              className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all"
              style={c === category ? { background: brand, color: "#fff" } : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {products.length === 0
          ? <div className="text-center py-24" style={{ color: "rgba(255,255,255,0.2)" }}><Package size={48} className="mx-auto mb-4 opacity-30" /><p>No products yet</p></div>
          : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{products.map(p => <ProductCard key={p.id} product={p} storeSlug={store.slug} brand={brand} dark />)}</div>
        }
      </div>
    </div>
  );
}

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
