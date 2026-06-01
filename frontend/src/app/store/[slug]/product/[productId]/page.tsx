"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../../../../../lib/api";
import { useCartStore } from "../../../../../store/cart.store";
import { ShoppingCart, ArrowLeft, Star, Truck, Shield, RotateCcw, Plus, Minus, Check, Heart, Share2, ZoomIn, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

function fmt(n: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(n || 0);
}

// Template-specific product page styles
const TEMPLATE_STYLES: Record<string, {
  bg: string; text: string; muted: string; border: string;
  card: string; btnBg: string; btnText: string; font: string; dark: boolean;
}> = {
  obsidian: { bg:"#07050F", text:"#F0ECFF", muted:"rgba(240,236,255,0.45)", border:"rgba(255,255,255,0.07)", card:"#16122A", btnBg:"linear-gradient(135deg,#6B35E8,#4C1D95)", btnText:"#fff", font:"'Plus Jakarta Sans',sans-serif", dark:true },
  velvet:   { bg:"#0A0806", text:"#F5F0E8", muted:"rgba(245,240,232,0.45)", border:"rgba(201,168,76,0.12)", card:"#110E0B", btnBg:"linear-gradient(135deg,#C9A84C,#AA8B26)", btnText:"#0A0806", font:"'Playfair Display',serif", dark:true },
  street:   { bg:"#F2F0EB", text:"#111", muted:"rgba(17,17,17,0.5)", border:"#111", card:"#E8E4DC", btnBg:"#111", btnText:"#F2F0EB", font:"'Arial Black',sans-serif", dark:false },
  glow:     { bg:"#FFF0F8", text:"#1A1A2E", muted:"rgba(26,26,46,0.5)", border:"rgba(232,84,122,0.12)", card:"#fff", btnBg:"linear-gradient(135deg,#E8547A,#C84B6E)", btnText:"#fff", font:"'DM Sans',sans-serif", dark:false },
  terra:    { bg:"#FAF6F0", text:"#1A0F00", muted:"rgba(26,15,0,0.5)", border:"rgba(196,120,42,0.12)", card:"#F0EAE0", btnBg:"linear-gradient(135deg,#C4782A,#A86220)", btnText:"#FAF6F0", font:"'Inter',sans-serif", dark:false },
  ionic:    { bg:"#050A14", text:"#E8F4FF", muted:"rgba(232,244,255,0.45)", border:"rgba(0,212,255,0.1)", card:"rgba(0,212,255,0.04)", btnBg:"linear-gradient(135deg,#00D4FF,#0066CC)", btnText:"#050A14", font:"'Space Grotesk',monospace", dark:true },
  artisan:  { bg:"#FDF8F3", text:"#1A0F06", muted:"rgba(26,15,6,0.5)", border:"rgba(139,94,60,0.12)", card:"#fff", btnBg:"#8B5E3C", btnText:"#FDF8F3", font:"'Lora',serif", dark:false },
  apex:     { bg:"#0A0A0A", text:"#F5F5F5", muted:"rgba(245,245,245,0.4)", border:"rgba(57,255,20,0.08)", card:"rgba(57,255,20,0.02)", btnBg:"#39FF14", btnText:"#0A0A0A", font:"'Barlow Condensed',sans-serif", dark:true },
  sage:     { bg:"#F8F6F1", text:"#1C2820", muted:"rgba(28,40,32,0.45)", border:"rgba(91,123,92,0.1)", card:"#fff", btnBg:"#1C2820", btnText:"#F8F6F1", font:"'Jost',sans-serif", dark:false },
  diamond:  { bg:"#080608", text:"#F0EAD6", muted:"rgba(240,234,214,0.4)", border:"rgba(212,175,55,0.1)", card:"#110D0E", btnBg:"linear-gradient(135deg,#D4AF37,#AA8B26)", btnText:"#080608", font:"'Cormorant Garamond',serif", dark:true },
  kodiak:   { bg:"#EFEFEF", text:"#111", muted:"rgba(17,17,17,0.45)", border:"2px solid #111", card:"#E8E4DC", btnBg:"#111", btnText:"#EFEFEF", font:"'Helvetica Neue',sans-serif", dark:false },
  nova:     { bg:"#080012", text:"#E8E0FF", muted:"rgba(232,224,255,0.4)", border:"rgba(191,90,242,0.1)", card:"rgba(191,90,242,0.03)", btnBg:"linear-gradient(135deg,#BF5AF2,#7F33D3)", btnText:"#fff", font:"'Share Tech Mono',monospace", dark:true },
  dusk:     { bg:"#FDFAF5", text:"#1E1610", muted:"rgba(30,22,16,0.45)", border:"rgba(155,123,78,0.1)", card:"#fff", btnBg:"#9B7B4E", btnText:"#FDFAF5", font:"'Garamond',serif", dark:false },
  kids:     { bg:"#FFFEF5", text:"#1A1A2E", muted:"rgba(26,26,46,0.45)", border:"rgba(255,107,157,0.15)", card:"#fff", btnBg:"linear-gradient(135deg,#FF6B9D,#E84393)", btnText:"#fff", font:"'Nunito',sans-serif", dark:false },
};

const DEFAULT_STYLE = { bg:"#FAFAFA", text:"#111", muted:"rgba(17,17,17,0.5)", border:"rgba(0,0,0,0.08)", card:"#fff", btnBg:"linear-gradient(135deg,#6B35E8,#4C1D95)", btnText:"#fff", font:"'Inter',sans-serif", dark:false };

export default function ProductPage() {
  const { slug, productId } = useParams<{ slug: string; productId: string }>();
  const router = useRouter();
  const addItem    = useCartStore(s => s.addItem);
  const cartItems  = useCartStore(s => s.items);
  const toggleCart = useCartStore(s => s.toggleCart);
  const cartCount  = cartItems.reduce((a: number, i: any) => a + i.quantity, 0);

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [tab, setTab] = useState<"description"|"details"|"reviews">("description");
  const [zoom, setZoom] = useState(false);

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

  const { data: related } = useQuery({
    queryKey: ["pub-related", productId, product?.category],
    queryFn:  () => publicApi.get(`/products/public/${store?.id}`, {
      params: { category: product?.category, limit: 4 }
    }).then(r => (r.data?.products || r.data?.data || []).filter((p:any) => p.id !== productId).slice(0,4)),
    enabled: !!store?.id && !!product?.category,
    staleTime: 60 * 1000,
  });

  const brand    = store?.primaryColor || "#6B35E8";
  const currency = store?.currency || "NGN";
  const template = store?.theme || store?.templateId || "aurora";
  const s        = TEMPLATE_STYLES[template] || DEFAULT_STYLE;

  const images = product?.images?.length ? product.images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop"];
  const price  = selectedVariant?.price || product?.price || 0;
  const compare = selectedVariant?.comparePrice || product?.comparePrice;
  const discount = compare && compare > price ? Math.round((1 - price/compare)*100) : 0;
  const inStock  = (selectedVariant?.inventory ?? product?.inventory ?? 1) > 0;

  function handleAdd() {
    if (!product || !inStock) return;
    setAdding(true);
    addItem({
      productId: product.id, name: product.name,
      price, image: images[0], storeId: store.id,
      quantity: qty, variantId: selectedVariant?.id,
      variantLabel: selectedVariant?.name,
    } as any);
    setTimeout(() => { setAdding(false); setAdded(true); setTimeout(()=>setAdded(false),2000); }, 600);
    toast.success("Added to cart!");
  }

  function handleBuyNow() {
    handleAdd();
    setTimeout(() => router.push(`/store/${slug}/checkout`), 800);
  }

  if (isLoading || !product) return (
    <div style={{ minHeight:"100vh", background:s.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:40, height:40, borderRadius:"50%", border:`3px solid ${brand}30`, borderTopColor:brand, animation:"spin 0.8s linear infinite" }}/>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:s.bg, color:s.text, fontFamily:s.font }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:wght@300;400;600&family=Barlow+Condensed:wght@400;700;900&family=Space+Grotesk:wght@400;600;700&family=DM+Sans:wght@300;400;600&family=Lora:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&family=Nunito:wght@600;700;800&display=swap');
      `}</style>

      {/* Back nav */}
      <div style={{ padding:"14px clamp(16px,4vw,40px)", borderBottom:`1px solid ${s.border}`, display:"flex", alignItems:"center", gap:12, background:s.bg, position:"sticky", top:0, zIndex:10 }}>
        <button onClick={()=>router.back()} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:s.muted, fontSize:13, fontFamily:s.font }}>
          <ArrowLeft size={14}/> Back
        </button>
        <span style={{ color:s.muted, fontSize:12 }}>/</span>
        <span style={{ fontSize:12, color:s.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{product.name}</span>
        <div style={{ marginLeft:"auto", display:"flex", gap:12 }}>
          <button onClick={()=>setWishlisted(w=>!w)} style={{ background:"none", border:"none", cursor:"pointer", color:wishlisted?brand:s.muted }}>
            <Heart size={18} fill={wishlisted?brand:"none"}/>
          </button>
          <button onClick={()=>{ navigator.share?.({ title:product.name, url:window.location.href }) || navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }} style={{ background:"none", border:"none", cursor:"pointer", color:s.muted }}>
            <Share2 size={18}/>
          </button>
          {/* WhatsApp share */}
          <button onClick={()=>{
            const price = `₦${Number(product.price).toLocaleString()}`;
            const msg = encodeURIComponent(`🔥 *${product.name}*\n\n💰 *${price}*\n\n✅ Secure checkout\n✅ Fast delivery\n\n👇 Order here:\n${window.location.href}`);
            window.open(`https://wa.me/?text=${msg}`, "_blank");
          }} style={{ background:"#25D366", border:"none", cursor:"pointer", borderRadius:8, padding:"6px 10px", display:"flex", alignItems:"center", gap:5, color:"#fff", fontSize:12, fontWeight:700, fontFamily:"inherit" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </button>
          {/* Cart icon */}
          <button onClick={toggleCart} style={{ position:"relative", background:"none", border:"none", cursor:"pointer", color:s.text, display:"flex", alignItems:"center", justifyContent:"center", width:36, height:36, borderRadius:10, border:`1px solid ${s.border}` }}>
            <ShoppingBag size={16}/>
            {cartCount > 0 && (
              <span style={{ position:"absolute", top:-6, right:-6, width:18, height:18, borderRadius:"50%", background:brand, color:"#fff", fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"clamp(24px,4vw,48px) clamp(16px,4vw,40px)", display:"grid", gridTemplateColumns:"clamp(300px,50%,600px) 1fr", gap:"clamp(24px,5vw,64px)", alignItems:"start" }} className="prod-grid">

        {/* Images */}
        <div>
          {/* Main image */}
          <div style={{ position:"relative", borderRadius:template==="street"||template==="kodiak"?4:16, overflow:"hidden", background:s.card, marginBottom:12, cursor:"zoom-in", aspectRatio:"1" }}
            onClick={()=>setZoom(true)}>
            <AnimatePresence mode="wait">
              <motion.img key={activeImg} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}}
                src={images[activeImg]} alt={product.name}
                style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
            </AnimatePresence>
            {discount>0&&(
              <div style={{ position:"absolute", top:14, left:14, background:brand, borderRadius:template==="street"||template==="kodiak"?2:99, padding:"4px 12px" }}>
                <span style={{ fontSize:12, fontWeight:700, color:s.dark?"#111":"#fff" }}>-{discount}%</span>
              </div>
            )}
            <div style={{ position:"absolute", bottom:14, right:14, background:s.dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.06)", backdropFilter:"blur(8px)", borderRadius:8, padding:"6px 8px", display:"flex", alignItems:"center", gap:4 }}>
              <ZoomIn size={12} color={s.muted}/>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display:"flex", gap:8, overflowX:"auto" }}>
              {images.map((img:string, i:number) => (
                <button key={i} onClick={()=>setActiveImg(i)}
                  style={{ flexShrink:0, width:72, height:72, borderRadius:template==="street"||template==="kodiak"?2:10, overflow:"hidden", border:`2px solid ${i===activeImg?brand:"transparent"}`, padding:0, cursor:"pointer", background:"none" }}>
                  <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {/* Category + name */}
          <p style={{ fontSize:12, color:brand, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", margin:"0 0 8px" }}>
            {product.category || store.name}
          </p>
          <h1 style={{ fontSize:"clamp(22px,3.5vw,36px)", fontWeight:700, color:s.text, margin:"0 0 16px", lineHeight:1.2, letterSpacing:"-0.02em" }}>
            {product.name}
          </h1>

          {/* Rating */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
            <div style={{ display:"flex", gap:2 }}>
              {[1,2,3,4,5].map(i=><Star key={i} size={14} fill={i<=4?brand:"none"} color={brand}/>)}
            </div>
            <span style={{ fontSize:13, color:s.muted }}>(24 reviews)</span>
          </div>

          {/* Price */}
          <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:24 }}>
            <span style={{ fontSize:"clamp(28px,4vw,40px)", fontWeight:900, color:brand, letterSpacing:"-0.03em" }}>{fmt(price,currency)}</span>
            {compare && compare>price && (
              <span style={{ fontSize:18, color:s.muted, textDecoration:"line-through" }}>{fmt(compare,currency)}</span>
            )}
            {discount>0&&<span style={{ fontSize:13, fontWeight:700, color:"#10B981", background:"rgba(16,185,129,0.1)", padding:"3px 10px", borderRadius:99 }}>Save {discount}%</span>}
          </div>

          {/* Variants */}
          {product.variants?.length>0&&(
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:12, color:s.muted, fontWeight:600, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                {product.variants[0]?.type || "Option"}
              </p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {product.variants.map((v:any)=>(
                  <button key={v.id} onClick={()=>setSelectedVariant(v===selectedVariant?null:v)}
                    style={{ padding:"8px 16px", borderRadius:template==="street"||template==="kodiak"?4:99, border:`1.5px solid ${selectedVariant?.id===v.id?brand:s.border}`, background:selectedVariant?.id===v.id?brand:"transparent", color:selectedVariant?.id===v.id?(s.dark?"#111":"#fff"):s.text, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:s.font, transition:"all 0.15s" }}>
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
            <p style={{ fontSize:12, color:s.muted, fontWeight:600, margin:0, textTransform:"uppercase", letterSpacing:"0.06em" }}>Qty</p>
            <div style={{ display:"flex", alignItems:"center", border:`1px solid ${s.border}`, borderRadius:template==="street"||template==="kodiak"?4:10, overflow:"hidden" }}>
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{ width:36, height:36, border:"none", background:"transparent", cursor:"pointer", color:s.text, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Minus size={12}/>
              </button>
              <span style={{ width:40, textAlign:"center", fontSize:14, fontWeight:700, color:s.text }}>{qty}</span>
              <button onClick={()=>setQty(q=>q+1)} style={{ width:36, height:36, border:"none", background:"transparent", cursor:"pointer", color:s.text, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Plus size={12}/>
              </button>
            </div>
            <span style={{ fontSize:12, color:inStock?"#10B981":"#EF4444", fontWeight:600 }}>
              {inStock?"● In Stock":"● Out of Stock"}
            </span>
          </div>

          {/* CTAs */}
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
            <button onClick={handleAdd} disabled={!inStock||adding}
              style={{ padding:"15px 0", borderRadius:template==="street"||template==="kodiak"?4:12, background:added?"#10B981":s.btnBg, border:"none", color:s.btnText, fontSize:15, fontWeight:700, cursor:!inStock?"not-allowed":"pointer", fontFamily:s.font, display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 0.2s", boxShadow:`0 8px 24px ${brand}30` }}>
              {adding ? <div style={{ width:18, height:18, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"spin 0.7s linear infinite" }}/> : added ? <><Check size={16}/> Added!</> : <><ShoppingCart size={16}/> Add to Cart</>}
            </button>
            <button onClick={handleBuyNow} disabled={!inStock}
              style={{ padding:"15px 0", borderRadius:template==="street"||template==="kodiak"?4:12, background:"transparent", border:`1.5px solid ${s.dark?"rgba(255,255,255,0.15)":s.border}`, color:s.text, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:s.font }}>
              Buy Now
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display:"flex", gap:16, flexWrap:"wrap", padding:"16px 0", borderTop:`1px solid ${s.border}`, borderBottom:`1px solid ${s.border}`, marginBottom:24 }}>
            {[[Truck,"Free delivery over ₦50k"],[Shield,"Secure checkout"],[RotateCcw,"Easy returns"]].map(([Icon,label]:any)=>(
              <div key={label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <Icon size={14} color={brand}/>
                <span style={{ fontSize:12, color:s.muted }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${s.border}`, marginBottom:16 }}>
            {(["description","details","reviews"] as const).map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{ padding:"10px 20px", border:"none", borderBottom:`2px solid ${tab===t?brand:"transparent"}`, background:"transparent", color:tab===t?brand:s.muted, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:s.font, textTransform:"capitalize", transition:"color 0.15s" }}>
                {t}
              </button>
            ))}
          </div>
          {tab==="description"&&<p style={{ fontSize:14, color:s.muted, lineHeight:1.8, margin:0 }}>{product.description||"Premium quality product crafted with care. Perfect for everyday use."}</p>}
          {tab==="details"&&(
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[["SKU",product.sku||"N/A"],["Category",product.category||"General"],["Stock",`${product.inventory||0} units`],["Weight",product.weight||"—"]].map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${s.border}` }}>
                  <span style={{ fontSize:13, color:s.muted }}>{k}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:s.text }}>{v}</span>
                </div>
              ))}
            </div>
          )}
          {tab==="reviews"&&(
            <div style={{ textAlign:"center", padding:"24px 0" }}>
              <div style={{ fontSize:48, fontWeight:900, color:brand, letterSpacing:"-0.04em" }}>4.8</div>
              <div style={{ display:"flex", gap:2, justifyContent:"center", margin:"8px 0" }}>
                {[1,2,3,4,5].map(i=><Star key={i} size={16} fill={i<=5?brand:"none"} color={brand}/>)}
              </div>
              <p style={{ fontSize:13, color:s.muted }}>Based on 24 reviews</p>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related && related.length > 0 && (
        <div style={{ borderTop:`1px solid ${s.border}`, padding:"clamp(32px,5vw,56px) clamp(16px,4vw,40px)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto" }}>
            <h3 style={{ fontSize:"clamp(20px,3vw,28px)", fontWeight:700, color:s.text, margin:"0 0 24px", letterSpacing:"-0.02em" }}>You may also like</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16 }}>
              {related.map((p:any)=>(
                <Link key={p.id} href={`/store/${slug}/product/${p.id}`} style={{ textDecoration:"none" }}>
                  <motion.div whileHover={{ y:-4 }} style={{ borderRadius:12, overflow:"hidden", background:s.card, border:`1px solid ${s.border}` }}>
                    <img src={p.images?.[0]||"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"} alt={p.name} style={{ width:"100%", aspectRatio:"1", objectFit:"cover", display:"block" }}/>
                    <div style={{ padding:"10px 12px" }}>
                      <p style={{ fontSize:13, fontWeight:600, color:s.text, margin:"0 0 4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</p>
                      <p style={{ fontSize:14, fontWeight:700, color:brand, margin:0 }}>{fmt(p.price,currency)}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Zoom modal */}
      <AnimatePresence>
        {zoom && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={()=>setZoom(false)}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", cursor:"zoom-out", padding:20 }}>
            <img src={images[activeImg]} alt={product.name} style={{ maxWidth:"90vw", maxHeight:"90vh", objectFit:"contain", borderRadius:8 }}/>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media(max-width:768px){.prod-grid{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}
