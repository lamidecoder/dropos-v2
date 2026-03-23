"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../../../../../lib/api";
import { useCartStore } from "../../../../../store/cart.store";
import CartDrawer from "../../../../../components/store/CartDrawer";
import Link from "next/link";
import {
  ShoppingBag, ArrowLeft, Minus, Plus, Package,
  Star, Truck, ShieldCheck, RotateCcw, CheckCircle, Share2,
} from "lucide-react";

function fmt(price: number, currency = "NGN") {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString()}`;
  }
}

export default function ProductPage() {
  const { slug, productId } = useParams<{ slug: string; productId: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore(s => s.addItem);
  const cartCount = useCartStore(s => s.count);
  const toggleCart = useCartStore(s => s.toggleCart);

  const { data: store } = useQuery({
    queryKey: ["public-store", slug],
    queryFn: () => publicApi.get(`/stores/public/${slug}`).then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ["public-product", productId, store?.id],
    queryFn: () => publicApi.get(`/products/public/${store.id}/${productId}`).then(r => r.data.data),
    enabled: !!store?.id,
    staleTime: 2 * 60 * 1000,
  });

  const brand = store?.primaryColor || "#7c3aed";
  const images = product?.images?.length ? product.images : [null];
  const price = selectedVariant?.price ?? product?.price ?? 0;
  const compare = selectedVariant?.comparePrice ?? product?.comparePrice;
  const stock = selectedVariant?.inventory ?? product?.inventory ?? 0;
  const discount = compare ? Math.round(((compare - price) / compare) * 100) : 0;
  const currency = store?.currency || "NGN";

  const handleAdd = () => {
    if (!product || !store) return;
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
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading || !store) return <ProductSkeleton brand={brand} />;
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Package size={48} className="mx-auto mb-4 text-slate-200" />
        <h2 className="text-xl font-black text-slate-700 mb-2">Product not found</h2>
        <Link href={`/store/${slug}`} className="text-sm font-bold" style={{ color: brand }}>
          ← Back to {store.name}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href={`/store/${slug}`}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft size={16} />
            <span>{store.name}</span>
          </Link>
          <button onClick={toggleCart}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${brand}, ${brand}cc)` }}>
            <ShoppingBag size={16} />
            {cartCount() > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                {cartCount()}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 relative">
              {images[selectedImage] ? (
                <img src={images[selectedImage]} alt={product.name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: `${brand}08` }}>
                  <Package size={64} style={{ color: `${brand}30` }} />
                </div>
              )}
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                  -{discount}% OFF
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img: string | null, i: number) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-18 h-18 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i ? "border-violet-500" : "border-slate-200"
                    }`}
                    style={{ width: 72, height: 72 }}>
                    {img ? (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <Package size={16} className="text-slate-300" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                {product.category && (
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-3"
                    style={{ background: `${brand}15`, color: brand }}>
                    {product.category}
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h1>
              </div>
              <button onClick={handleShare}
                className="flex-shrink-0 p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
                <Share2 size={16} />
              </button>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} className={i < 4 ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"} />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-600">4.8</span>
              <span className="text-sm text-slate-400">(48 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">
                {fmt(price, currency)}
              </span>
              {compare && (
                <span className="text-lg text-slate-400 line-through">{fmt(compare, currency)}</span>
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
                <p className="text-sm font-bold text-slate-700 mb-2">
                  {product.variants[0]?.name || "Options"}
                  {selectedVariant && <span className="text-slate-400 font-normal ml-2">— {selectedVariant.value}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button key={v.id}
                      onClick={() => setSelectedVariant(v.id === selectedVariant?.id ? null : v)}
                      disabled={v.inventory === 0}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all disabled:opacity-40 ${
                        selectedVariant?.id === v.id
                          ? "text-white border-transparent"
                          : "border-slate-200 text-slate-700 bg-white hover:border-slate-300"
                      }`}
                      style={selectedVariant?.id === v.id ? { background: brand, borderColor: brand } : {}}>
                      {v.value}{v.inventory === 0 ? " (sold out)" : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              {stock > 10 ? (
                <><CheckCircle size={15} className="text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-600">In Stock</span></>
              ) : stock > 0 ? (
                <><CheckCircle size={15} className="text-amber-500" />
                  <span className="text-sm font-semibold text-amber-600">Only {stock} left!</span></>
              ) : (
                <><Package size={15} className="text-red-400" />
                  <span className="text-sm font-semibold text-red-500">Out of Stock</span></>
              )}
            </div>

            {/* Qty + Add to cart */}
            <div className="flex gap-3 mb-6">
              <div className="flex items-center gap-2 rounded-xl border-2 border-slate-200 px-3">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-black">{qty}</span>
                <button onClick={() => setQty(q => Math.min(stock || 99, q + 1))}
                  className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <button onClick={handleAdd}
                disabled={stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-black text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: added ? "linear-gradient(135deg,#10b981,#059669)" : `linear-gradient(135deg, ${brand}, ${brand}cc)`,
                  boxShadow: `0 8px 24px ${added ? "#10b98140" : brand + "40"}`,
                }}>
                {added ? <><CheckCircle size={16} /> Added!</> : stock === 0 ? "Out of Stock" : <><ShoppingBag size={16} /> Add to Cart</>}
              </button>
            </div>

            {/* Buy now */}
            {stock > 0 && (
              <Link href={`/store/${slug}/checkout`}
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm border-2 transition-all hover:bg-slate-50 mb-6 block text-center"
                style={{ borderColor: brand, color: brand }}>
                Buy Now →
              </Link>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: "Fast Delivery" },
                { icon: ShieldCheck, label: "Secure Pay" },
                { icon: RotateCcw, label: "Easy Returns" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 text-center">
                  <Icon size={16} style={{ color: brand }} />
                  <span className="text-xs font-semibold text-slate-500">{label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="font-black text-slate-900 mb-3">About this product</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CartDrawer
        storeSlug={slug}
        storeId={store?.id || ""}
        brand={brand}
        fmt={(n) => fmt(n, currency)}
      />
    </div>
  );
}

function ProductSkeleton({ brand }: { brand: string }) {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="h-16 border-b border-slate-100" />
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-2 gap-12">
        <div className="aspect-square rounded-2xl bg-slate-100" />
        <div className="space-y-4 pt-4">
          <div className="h-4 bg-slate-100 rounded w-24" />
          <div className="h-8 bg-slate-100 rounded w-3/4" />
          <div className="h-10 bg-slate-100 rounded w-1/3" />
          <div className="h-14 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
}