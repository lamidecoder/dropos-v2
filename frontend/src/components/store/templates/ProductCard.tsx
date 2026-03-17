"use client";

// src/components/store/templates/ProductCard.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Heart, Package, ShoppingBag, Check } from "lucide-react";
import { useCartStore } from "../../../store/cart.store";
import { useCurrencyStore } from "../../../store/currency.store";

interface ProductCardProps {
  product:   any;
  storeSlug: string;
  brand:     string;
  variant?:  "classic" | "dark" | "minimal" | "boutique" | "editorial" | "glass" | "vintage";
  currency?: string;
}

export function ProductCard({ product, storeSlug, brand, variant = "classic", currency = "USD" }: ProductCardProps) {
  const addItem = useCartStore(s => s.addItem);
  const { format, baseCurrency, setBaseCurrency } = useCurrencyStore();

  // Ensure base currency is set to this store's currency
  if (baseCurrency !== currency) setBaseCurrency(currency);

  const fmt = (amount: number) => format(amount, currency);
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ id: product.id, productId: product.id, name: product.name, price: product.price, image: product.images?.[0], storeId: product.storeId, storeSlug });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const img = product.images?.[0];
  const outOfStock = product.inventory === 0;

  // ── DARK variant ────────────────────────────────────────────────────────────
  if (variant === "dark") return (
    <Link href={`/store/${storeSlug}/product/${product.id}`}
      className="group relative rounded-2xl overflow-hidden flex flex-col"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="relative aspect-square overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
        {img ? <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={32} style={{ color: `${brand}50` }} /></div>}
        {discount > 0 && <span className="absolute top-3 left-3 px-2 py-1 rounded-lg text-[10px] font-black text-black" style={{ background: brand }}>-{discount}%</span>}
        <button onClick={e => { e.preventDefault(); setLiked(!liked); }} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}>
          <Heart size={13} className={liked ? "fill-red-400 text-red-400" : "text-[var(--text-secondary)]"} />
        </button>
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
          <button onClick={handleAdd} disabled={outOfStock} className="w-full py-2.5 rounded-xl text-xs font-bold text-black transition-all disabled:opacity-40" style={{ background: added ? "#10b981" : brand }}>
            {added ? "✓ Added" : outOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
      <div className="p-4">
        {product.category && <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: `${brand}90` }}>{product.category}</div>}
        <h3 className="text-[var(--text-primary)] text-sm font-semibold leading-snug line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="font-black text-[var(--text-primary)]">{fmt(product.price ?? 0)}</span>
          {product.comparePrice && <span className="text-sm text-white/25 line-through">{fmt(product.comparePrice ?? 0)}</span>}
        </div>
      </div>
    </Link>
  );

  // ── MINIMAL variant ─────────────────────────────────────────────────────────
  if (variant === "minimal") return (
    <Link href={`/store/${storeSlug}/product/${product.id}`} className="group flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50 mb-4">
        {img ? <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={28} className="text-slate-300" /></div>}
        {discount > 0 && <span className="absolute top-3 left-3 px-2 py-0.5 text-xs font-black" style={{ color: brand }}>-{discount}%</span>}
        <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={handleAdd} disabled={outOfStock} className="w-full py-2 rounded-xl text-sm font-bold text-[var(--text-primary)]" style={{ background: brand }}>
            {added ? "Added ✓" : "Add to Cart"}
          </button>
        </div>
      </div>
      <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">{product.category || " "}</div>
      <h3 className="text-slate-900 font-semibold text-sm leading-snug line-clamp-2 mb-2">{product.name}</h3>
      <div className="flex items-baseline gap-2">
        <span className="font-black text-slate-900">{fmt(product.price ?? 0)}</span>
        {product.comparePrice && <span className="text-sm text-slate-400 line-through">{fmt(product.comparePrice ?? 0)}</span>}
      </div>
    </Link>
  );

  // ── BOUTIQUE variant ────────────────────────────────────────────────────────
  if (variant === "boutique") return (
    <Link href={`/store/${storeSlug}/product/${product.id}`} className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl mb-3" style={{ background: "#fdf6f0" }}>
        {img ? <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={32} className="text-rose-200" /></div>}
        <button onClick={e => { e.preventDefault(); setLiked(!liked); }} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-sm">
          <Heart size={13} className={liked ? "fill-rose-500 text-rose-500" : "text-rose-300"} />
        </button>
        {discount > 0 && <span className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold" style={{ background: brand, color: "white" }}>-{discount}%</span>}
      </div>
      <div className="text-center px-1">
        <h3 className="text-slate-800 font-semibold text-sm line-clamp-1 mb-1">{product.name}</h3>
        <div className="font-black text-slate-900">{fmt(product.price ?? 0)}</div>
      </div>
    </Link>
  );

  // ── GLASS variant ───────────────────────────────────────────────────────────
  if (variant === "glass") return (
    <Link href={`/store/${storeSlug}/product/${product.id}`}
      className="group relative rounded-3xl overflow-hidden flex flex-col"
      style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <div className="relative aspect-square overflow-hidden">
        {img ? <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center bg-[var(--bg-elevated)]"><Package size={32} className="text-[var(--text-tertiary)]" /></div>}
        {discount > 0 && <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[11px] font-black text-[var(--text-primary)] backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.15)" }}>-{discount}%</span>}
      </div>
      <div className="p-4">
        <h3 className="text-white/90 text-sm font-bold line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="font-black text-[var(--text-primary)]">{fmt(product.price ?? 0)}</span>
          <button onClick={handleAdd} className="w-8 h-8 rounded-xl flex items-center justify-center text-black transition-all" style={{ background: brand }}>
            {added ? <Check size={13} /> : <ShoppingBag size={13} />}
          </button>
        </div>
      </div>
    </Link>
  );

  // ── VINTAGE variant ─────────────────────────────────────────────────────────
  if (variant === "vintage") return (
    <Link href={`/store/${storeSlug}/product/${product.id}`} className="group flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-2xl mb-3" style={{ background: "#f5ede0" }}>
        {img ? <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 mix-blend-multiply" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={32} className="text-amber-300" /></div>}
        {discount > 0 && <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-black" style={{ background: "#2d1a0e", color: "#f5ede0" }}>-{discount}%</span>}
      </div>
      <div className="px-1">
        {product.category && <div className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: "#8b6914" }}>{product.category}</div>}
        <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-1.5" style={{ color: "#2d1a0e", fontFamily: "Georgia, serif" }}>{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="font-bold" style={{ color: "#2d1a0e" }}>{fmt(product.price ?? 0)}</span>
          {product.comparePrice && <span className="text-sm line-through" style={{ color: "#8b6914" }}>{fmt(product.comparePrice ?? 0)}</span>}
        </div>
      </div>
    </Link>
  );

  // ── EDITORIAL variant ───────────────────────────────────────────────────────
  if (variant === "editorial") return (
    <Link href={`/store/${storeSlug}/product/${product.id}`} className="group flex flex-col">
      <div className="relative overflow-hidden rounded-2xl mb-3" style={{ aspectRatio: "4/5", background: "#f8f8f8" }}>
        {img ? <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={32} className="text-slate-300" /></div>}
        {discount > 0 && <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-black text-[var(--text-primary)]" style={{ background: brand }}>SALE -{discount}%</span>}
        <div className="absolute inset-x-3 bottom-12 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={handleAdd} disabled={outOfStock} className="w-full py-2 rounded-xl text-xs font-bold text-[var(--text-primary)]" style={{ background: brand }}>
            + Quick Add
          </button>
        </div>
      </div>
      <div className="px-1">
        <div className="text-[9px] tracking-[0.25em] uppercase text-slate-400 mb-1">{product.category || "Product"}</div>
        <h3 className="text-slate-900 font-bold text-sm line-clamp-2 mb-1 leading-snug">{product.name}</h3>
        <div className="font-black text-slate-900">{fmt(product.price ?? 0)}</div>
      </div>
    </Link>
  );

  // ── DEFAULT / CLASSIC ───────────────────────────────────────────────────────
  return (
    <Link href={`/store/${storeSlug}/product/${product.id}`}
      className="group rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 bg-white flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {img ? <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center" style={{ background: `${brand}10` }}><Package size={32} style={{ color: `${brand}60` }} /></div>}
        {discount > 0 && <span className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-black text-[var(--text-primary)] bg-red-500">-{discount}%</span>}
        {outOfStock && <span className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold text-[var(--text-primary)] bg-slate-500">Sold Out</span>}
        <button onClick={e => { e.preventDefault(); setLiked(!liked); }} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all">
          <Heart size={14} className={liked ? "fill-red-500 text-red-500" : "text-slate-400"} />
        </button>
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
          <button onClick={handleAdd} disabled={outOfStock} className="w-full py-2.5 rounded-xl text-sm font-bold text-[var(--text-primary)] shadow-lg" style={{ background: added ? "#10b981" : `linear-gradient(135deg, ${brand}, ${brand}bb)` }}>
            {added ? "✓ Added!" : outOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        {product.category && <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{product.category}</span>}
        <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2 line-clamp-2">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-lg font-black text-slate-900">{fmt(product.price ?? 0)}</span>
            {product.comparePrice && <span className="ml-1.5 text-sm text-slate-400 line-through">{fmt(product.comparePrice ?? 0)}</span>}
          </div>
          {product.inventory > 0 && product.inventory <= 5 && (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{product.inventory} left</span>
          )}
        </div>
      </div>
    </Link>
  );
}
