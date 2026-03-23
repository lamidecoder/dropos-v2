"use client";
import { useCurrencyStore } from "../../../../../store/currency.store";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../../../lib/api";
import { useCartStore } from "../../../../../store/cart.store";
import CartDrawer from "../../../../../components/store/CartDrawer";
import ProductReviews from "../../../../../components/store/ProductReviews";
import Link from "next/link";
import {
  ShoppingBag, ArrowLeft, Minus, Plus, Package,
  Star, Truck, ShieldCheck, RotateCcw, CheckCircle,
  ChevronRight, Share2
} from "lucide-react";

export default function ProductPage() {
  const { slug, productId } = useParams<{ slug: string; productId: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding]   = useState(false);
  const [added, setAdded]     = useState(false);
  const addItem    = useCartStore((s) => s.addItem);
  const cartCount  = useCartStore((s) => s.count);
  const toggleCart = useCartStore((s) => s.toggleCart);

  const { data: store } = useQuery({
    queryKey: ["public-store", slug],
    queryFn:  () => api.get(`/stores/public/${slug}`).then((r) => r.data.data),
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ["public-product", productId],
    queryFn:  () => api.get(`/products/public/${store?.id}/${productId}`).then((r) => r.data.data),
    enabled:  !!store?.id,
  });

  const brand    = store?.primaryColor || "#7c3aed";
  const images   = product?.images?.length ? product.images : [null];
  const price    = selectedVariant?.price ?? product?.price ?? 0;
  const { format: _fmt, setBaseCurrency } = useCurrencyStore();
  if (store?.currency) setBaseCurrency(store.currency);
  const fmt = (n: number) => _fmt(n, store?.currency || "USD");
  const compare  = selectedVariant?.comparePrice ?? product?.comparePrice;
  const stock    = selectedVariant?.inventory ?? product?.inventory ?? 0;
  const discount = compare ? Math.round(((compare - price) / compare) * 100) : 0;

  const handleAddToCart = () => {
    if (!product) return;
    setAdding(true);
    addItem({
      id: selectedVariant?.id || product.id,
      productId: product.id,
      name: product.name,
      price,
      image: images[0],
      quantity: qty,
      variantId: selectedVariant?.id,
      variantLabel: selectedVariant ? `${selectedVariant.name}: ${selectedVariant.value}` : undefined,
      storeId: store.id,
      storeSlug: slug,
    });
    setTimeout(() => { setAdding(false); setAdded(true); }, 400);
    setTimeout(() => setAdded(false), 2500);
  };

  if (isLoading) return <ProductSkeleton brand={brand} />;
  if (!product)  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Package size={48} className="mx-auto mb-4 text-slate-300" />
        <h2 className="text-xl font-black text-slate-700">Product not found</h2>
        <Link href={`/store/${slug}`} className="mt-4 inline-block text-violet-600 font-semibold">← Back to store</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-[var(--bg-base)]/95 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={`/store/${slug}`} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">{store?.name}</span>
            <span className="sm:hidden">Back</span>
          </Link>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
            <Link href={`/store/${slug}`} className="hover:text-slate-600">{store?.name}</Link>
            <ChevronRight size={12} />
            <span className="text-slate-600 font-semibold line-clamp-1 max-w-[200px]">{product.name}</span>
          </div>

          <button onClick={toggleCart}
            className="relative flex items-center gap-2 text-[var(--text-primary)] px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: `linear-gradient(135deg, ${brand}, ${brand}bb)` }}>
            <ShoppingBag size={16} />
            {cartCount() > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-[var(--text-primary)] text-xs font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Product layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Images ── */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 relative">
              {images[selectedImage] ? (
                <img src={images[selectedImage]} alt={product.name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: `${brand}10` }}>
                  <Package size={64} style={{ color: `${brand}40` }} />
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-sm font-black text-[var(--text-primary)] bg-red-500 shadow">
                  -{discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i ? "border-violet-500 shadow-md" : "border-slate-200 hover:border-slate-300"
                    }`}>
                    {img ? (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                        <Package size={16} className="text-slate-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details ── */}
          <div className="flex flex-col">
            {/* Category + share */}
            <div className="flex items-center justify-between mb-3">
              {product.category && (
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: `${brand}15`, color: brand }}>
                  {product.category}
                </span>
              )}
              <button onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <Share2 size={16} />
              </button>
            </div>

            {/* Name */}
            <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight mb-4">
              {product.name}
            </h1>

            {/* Rating (decorative) */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < 4 ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-600">4.8</span>
              <span className="text-sm text-slate-400">(48 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-black text-slate-900">
                {fmt(price)}
              </span>
              {compare && (
                <span className="text-xl text-slate-400 line-through">
                  {fmt(compare)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700">
                    {product.variants[0]?.name || "Options"}
                  </span>
                  {selectedVariant && (
                    <span className="text-sm text-slate-500">{selectedVariant.value}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button key={v.id} onClick={() => setSelectedVariant(v.id === selectedVariant?.id ? null : v)}
                      disabled={v.inventory === 0}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        selectedVariant?.id === v.id
                          ? "border-transparent text-[var(--text-primary)] shadow-md"
                          : "border-slate-200 text-slate-700 hover:border-slate-300 bg-white"
                      }`}
                      style={selectedVariant?.id === v.id ? { background: `linear-gradient(135deg, ${brand}, ${brand}bb)` } : {}}>
                      {v.value}
                      {v.inventory === 0 && " (sold out)"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-2 mb-6">
              {stock > 10 ? (
                <><CheckCircle size={16} className="text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-600">In Stock</span></>
              ) : stock > 0 ? (
                <><CheckCircle size={16} className="text-amber-500" />
                  <span className="text-sm font-semibold text-amber-600">Only {stock} left!</span></>
              ) : (
                <><Package size={16} className="text-red-500" />
                  <span className="text-sm font-semibold text-red-600">Out of Stock</span></>
              )}
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex gap-3 mb-8">
              {/* Qty */}
              <div className="flex items-center gap-2 rounded-xl border-2 border-slate-200 px-3 py-3 bg-white">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors">
                  <Minus size={14} className="text-slate-600" />
                </button>
                <span className="text-base font-black text-slate-900 w-8 text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(stock, q + 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors">
                  <Plus size={14} className="text-slate-600" />
                </button>
              </div>

              {/* Add to cart */}
              <button onClick={handleAddToCart}
                disabled={stock === 0 || adding}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[var(--text-primary)] font-black text-base shadow-lg transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{
                  background: added ? "linear-gradient(135deg,#10b981,#059669)" : `linear-gradient(135deg, ${brand}, ${brand}bb)`,
                  boxShadow: `0 8px 24px ${added ? "#10b98140" : brand + "40"}`,
                }}>
                {added ? <><CheckCircle size={18} /> Added to Cart!</>
                  : adding ? "Adding…"
                  : stock === 0 ? "Out of Stock"
                  : <><ShoppingBag size={18} /> Add to Cart</>}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: Truck,       label: "Fast Delivery" },
                { icon: ShieldCheck, label: "Secure Pay" },
                { icon: RotateCcw,   label: "Free Returns" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 text-center">
                  <Icon size={18} style={{ color: brand }} />
                  <span className="text-xs font-semibold text-slate-600">{label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-black text-slate-900 mb-3">About this product</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {store && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="border-t border-slate-100 pt-12">
            <ProductReviews productId={productId} storeId={store.id} brand={brand} />
          </div>
        </div>
      )}


      {/* Related Products */}
      {store && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <RelatedProducts storeId={store.id} productId={productId} slug={slug} brand={brand} />
        </div>
      )}

      <CartDrawer storeSlug={slug} storeId={store?.id || ""} brand={brand} fmt={(n) => `${store?.currency || "$"}${n.toLocaleString()}`} />
    </div>
  );
}


// ── Related Products ──────────────────────────────────────────────────────────
function RelatedProducts({ storeId, productId, slug, brand }: { storeId: string; productId: string; slug: string; brand: string }) {
  const addItem    = useCartStore(s => s.addItem);
  const toggleCart = useCartStore(s => s.toggleCart);

  const { data: relatedData } = useQuery({
    queryKey: ["related", productId],
    queryFn:  () => api.get(`/upsell/${storeId}/${productId}/related?limit=4`).then(r => r.data.data),
    enabled:  !!storeId && !!productId,
  });

  const { data: boughtData } = useQuery({
    queryKey: ["bought-together", productId],
    queryFn:  () => api.get(`/upsell/${storeId}/${productId}/bought-together?limit=3`).then(r => r.data.data),
    enabled:  !!storeId && !!productId,
  });

  const related = relatedData || [];
  const bought  = boughtData  || [];

  if (!related.length && !bought.length) return null;

  return (
    <div className="border-t border-slate-100 pt-12 space-y-12">
      {/* Frequently Bought Together */}
      {bought.length > 0 && (
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">🤝</span> Frequently Bought Together
          </h2>
          <div className="flex flex-wrap gap-4 items-center">
            {bought.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-4">
                {i > 0 && <span className="text-slate-300 text-2xl font-light">+</span>}
                <Link href={`/store/${slug}/product/${p.id}`}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-white">
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} className="w-14 h-14 object-cover rounded-xl" />
                    : <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center"><Package size={20} className="text-slate-300" /></div>
                  }
                  <div>
                    <p className="text-sm font-bold text-slate-900 line-clamp-1 max-w-[120px]">{p.name}</p>
                    <p className="text-sm font-black" style={{ color: brand }}>${p.price.toFixed(2)}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* You May Also Like */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">✨</span> You May Also Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p: any) => {
              const discount = p.comparePrice ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0;
              return (
                <div key={p.id} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-200">
                  <Link href={`/store/${slug}/product/${p.id}`} className="block relative">
                    <div className="aspect-square overflow-hidden bg-slate-50">
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full flex items-center justify-center"><Package size={32} className="text-slate-200" /></div>
                      }
                    </div>
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 text-[10px] font-black text-[var(--text-primary)] px-2 py-0.5 rounded-full" style={{ background: brand }}>
                        -{discount}%
                      </span>
                    )}
                  </Link>
                  <div className="p-3">
                    <Link href={`/store/${slug}/product/${p.id}`}>
                      <p className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-slate-600 transition-colors">{p.name}</p>
                    </Link>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <span className="text-sm font-black" style={{ color: brand }}>${p.price.toFixed(2)}</span>
                        {p.comparePrice && <span className="text-xs text-slate-400 line-through ml-1">${p.comparePrice.toFixed(2)}</span>}
                      </div>
                      <button
                        onClick={() => { addItem({ id: p.id, productId: p.id, name: p.name, price: p.price, image: p.images?.[0], quantity: 1, storeId, storeSlug: slug }); toggleCart(); }}
                        className="text-xs font-bold text-[var(--text-primary)] px-2.5 py-1.5 rounded-lg transition-opacity"
                        style={{ background: `linear-gradient(135deg,${brand},${brand}bb)` }}>
                        + Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductSkeleton({ brand }: { brand: string }) {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="h-16 border-b border-slate-100" />
      <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-2 gap-12">
        <div className="aspect-square rounded-3xl bg-slate-200" />
        <div className="space-y-4 pt-4">
          <div className="h-4 bg-slate-200 rounded w-24" />
          <div className="h-8 bg-slate-200 rounded w-3/4" />
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          <div className="h-12 bg-slate-200 rounded w-full" />
        </div>
      </div>
    </div>
  );
}