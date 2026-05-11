"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../../../../../lib/api";
import { useCartStore } from "../../../../../store/cart.store";
import { ShoppingCart, ArrowLeft, Star, Truck, Shield, RotateCcw, Plus, Minus, Check, Share2, Heart } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

function fmt(n: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(n || 0);
}

export default function ProductPage() {
  const { slug, productId } = useParams<{ slug: string; productId: string }>();
  const router = useRouter();
  const addItem = useCartStore(s => s.addItem);
  const cartItems = useCartStore(s => s.items);

  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const { data: store } = useQuery({
    queryKey: ["pub-store", slug],
    queryFn:  () => publicApi.get(`/stores/public/${slug}`).then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ["pub-product", productId],
    queryFn:  () => publicApi.get(`/products/public/${store?.id}/${productId}`).then(r => r.data.data),
    enabled:  !!store?.id,
  });

  const primary   = store?.primaryColor || "#6B35E8";
  const inCart    = cartItems.some(i => i.productId === product?.id);
  const price     = selectedVariant?.price || product?.price || 0;
  const compare   = selectedVariant?.comparePrice || product?.comparePrice;
  const discount  = compare ? Math.round((1 - price / compare) * 100) : 0;
  const images    = product?.images?.length ? product.images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop"];

  const addToCart = async () => {
    if (!product) return;
    setAdding(true);
    addItem({
      productId:   product.id,
      name:        product.name,
      price:       price,
      image:       images[0],
      storeId:     store?.id,
      variantId:   selectedVariant?.id,
      variantName: selectedVariant?.name,
      quantity:    qty,
    });
    toast.success("Added to cart!");
    setTimeout(() => setAdding(false), 800);
  };

  const buyNow = () => {
    addToCart();
    setTimeout(() => router.push(`/store/${slug}/checkout`), 200);
  };

  if (isLoading || !product) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f7ff" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${primary}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7ff", fontFamily: "system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20 }}>
        <Link href={`/store/${slug}`} style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#333", fontSize: 14, fontWeight: 600 }}>
          <ArrowLeft size={16}/> {store?.name || "Back"}
        </Link>
        <Link href={`/store/${slug}/checkout`} style={{ position: "relative", textDecoration: "none" }}>
          <ShoppingCart size={22} color="#333"/>
          {cartItems.length > 0 && (
            <span style={{ position: "absolute", top: -6, right: -6, width: 16, height: 16, borderRadius: "50%", background: primary, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {cartItems.reduce((a, i) => a + i.quantity, 0)}
            </span>
          )}
        </Link>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }} className="product-grid">
          {/* Images */}
          <div>
            <div style={{ aspectRatio: "1", borderRadius: 20, overflow: "hidden", background: "#fff", marginBottom: 10, border: "1px solid rgba(0,0,0,0.06)" }}>
              <img src={images[selectedImg]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop"; }}/>
            </div>
            {images.length > 1 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {images.slice(0, 5).map((img: string, i: number) => (
                  <button key={i} onClick={() => setSelectedImg(i)}
                    style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", border: `2px solid ${selectedImg === i ? primary : "transparent"}`, padding: 0, cursor: "pointer", background: "#fff" }}>
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).src = images[0]; }}/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: primary, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
              {product.category || store?.name}
            </p>
            <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", color: "#0d0918", margin: "0 0 12px", lineHeight: 1.2 }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={13} fill={i<=4?"#F59E0B":"none"} color={i<=4?"#F59E0B":"#d1d5db"}/>)}
              </div>
              <span style={{ fontSize: 13, color: "#6b7280" }}>4.8 (124 reviews)</span>
            </div>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 30, fontWeight: 900, color: "#0d0918", letterSpacing: "-0.04em" }}>{fmt(price, store?.currency)}</span>
              {compare && compare > price && (
                <>
                  <span style={{ fontSize: 18, color: "#9ca3af", textDecoration: "line-through" }}>{fmt(compare, store?.currency)}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "3px 8px", borderRadius: 99 }}>-{discount}%</span>
                </>
              )}
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Select variant</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {product.variants.map((v: any) => (
                    <button key={v.id} onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                      style={{ padding: "8px 16px", borderRadius: 10, border: `2px solid ${selectedVariant?.id === v.id ? primary : "rgba(0,0,0,0.12)"}`, background: selectedVariant?.id === v.id ? `${primary}10` : "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: selectedVariant?.id === v.id ? primary : "#374151" }}>
                      {v.name || v.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: 0 }}>Quantity</p>
              <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12, overflow: "hidden" }}>
                <button onClick={() => setQty(Math.max(1, qty-1))} style={{ width: 40, height: 40, border: "none", background: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14}/></button>
                <span style={{ width: 40, textAlign: "center", fontSize: 15, fontWeight: 700, color: "#0d0918" }}>{qty}</span>
                <button onClick={() => setQty(qty+1)} style={{ width: 40, height: 40, border: "none", background: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={14}/></button>
              </div>
              <button onClick={() => setWishlisted(!wishlisted)} style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)", background: wishlisted ? "rgba(239,68,68,0.06)" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Heart size={16} fill={wishlisted ? "#EF4444" : "none"} color={wishlisted ? "#EF4444" : "#9ca3af"}/>
              </button>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              <button onClick={buyNow} style={{ padding: "14px 0", borderRadius: 14, border: "none", background: primary, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", letterSpacing: "-0.02em" }}>
                Buy Now — {fmt(price * qty, store?.currency)}
              </button>
              <button onClick={addToCart}
                style={{ padding: "13px 0", borderRadius: 14, border: `2px solid ${primary}`, background: "transparent", color: primary, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {adding ? <Check size={16}/> : <ShoppingCart size={16}/>}
                {adding ? "Added!" : inCart ? "In Cart — Add More" : "Add to Cart"}
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24, paddingTop: 20, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              {[
                { icon: Truck,   label: "Free delivery", sub: "Orders over ₦15,000" },
                { icon: Shield,  label: "Secure payment", sub: "Paystack protected" },
                { icon: RotateCcw, label: "Easy returns", sub: "7-day return policy" },
              ].map(b => (
                <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: `${primary}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <b.icon size={14} color={primary}/>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#0d0918", margin: 0 }}>{b.label}</p>
                    <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#0d0918", marginBottom: 8 }}>About this product</p>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#4b5563", margin: 0 }}>{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 700px) {
          .product-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
        }
      `}</style>
    </div>
  );
}
