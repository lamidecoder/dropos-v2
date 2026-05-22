"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../../../../store/cart.store";
import { publicApi } from "../../../../lib/api";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Tag, ChevronRight, Truck } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

function fmt(n: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(n || 0);
}

export default function CartPage() {
  const { slug } = useParams<{ slug: string }>();
  const router   = useRouter();
  const { items, removeItem, updateQty, total } = useCartStore();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const { data: store } = useQuery({
    queryKey:  ["pub-store", slug],
    queryFn:   () => publicApi.get(`/stores/public/${slug}`).then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const brand     = store?.primaryColor || "#6B35E8";
  const currency  = store?.currency     || "NGN";
  const storeItems = items.filter(i => i.storeId === store?.id);
  const subtotal  = storeItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping  = subtotal > 50000 ? 0 : 2500;
  const discAmt   = Math.round(subtotal * (discount / 100));
  const orderTotal = subtotal - discAmt + shipping;

  async function applyCoupon() {
    if (!coupon.trim() || !store?.id) return;
    setApplyingCoupon(true);
    try {
      const res = await publicApi.post("/coupons/validate", { code: coupon, storeId: store.id, cartTotal: subtotal });
      setDiscount(res.data.data?.discountPercent || 0);
      setCouponApplied(coupon);
      toast.success(`Coupon applied! ${res.data.data?.discountPercent}% off`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Invalid coupon");
    } finally { setApplyingCoupon(false); }
  }

  if (!store) return null;

  if (storeItems.length === 0) return (
    <div style={{ minHeight:"100vh", background:"#fafafa", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, padding:24 }}>
      <ShoppingBag size={56} style={{ color:"#ddd" }}/>
      <h2 style={{ fontSize:22, fontWeight:800, color:"#111", margin:0 }}>Your cart is empty</h2>
      <p style={{ fontSize:14, color:"#888", margin:0 }}>Add some products and come back.</p>
      <Link href={`/store/${slug}`} style={{ padding:"12px 28px", borderRadius:12, background:brand, color:"#fff", textDecoration:"none", fontWeight:700, fontSize:14 }}>
        Continue Shopping
      </Link>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#F8F7FA", fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ background:"#fff", borderBottom:"1px solid rgba(0,0,0,0.06)", padding:"14px clamp(16px,4vw,32px)", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:50 }}>
        <Link href={`/store/${slug}`} style={{ display:"flex", alignItems:"center", gap:6, color:"#666", textDecoration:"none", fontSize:13 }}>
          <ArrowLeft size={14}/> Back
        </Link>
        <div style={{ flex:1, textAlign:"center", fontSize:15, fontWeight:700, color:"#111" }}>Your Cart</div>
        <div style={{ fontSize:13, color:brand, fontWeight:700 }}>{storeItems.reduce((s,i)=>s+i.quantity,0)} items</div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"24px clamp(16px,4vw,24px)", display:"grid", gridTemplateColumns:"1fr min(360px,100%)", gap:20, alignItems:"start" }} className="cart-grid">
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <AnimatePresence>
            {storeItems.map(item => (
              <motion.div key={`${item.productId}-${item.variantId}`}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-20 }}
                style={{ background:"#fff", borderRadius:16, padding:16, display:"flex", gap:14, border:"1px solid rgba(0,0,0,0.06)" }}>
                <img src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop"} alt={item.name}
                  style={{ width:80, height:80, borderRadius:12, objectFit:"cover", flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:"#111", margin:"0 0 4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</p>
                  {item.variantLabel && <p style={{ fontSize:12, color:"#888", margin:"0 0 8px" }}>{item.variantLabel}</p>}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
                    <div style={{ display:"flex", alignItems:"center", border:"1px solid rgba(0,0,0,0.1)", borderRadius:8, overflow:"hidden" }}>
                      <button onClick={()=>item.quantity>1?updateQty(item.productId,item.quantity-1,item.variantId):removeItem(item.productId,item.variantId)}
                        style={{ width:32, height:32, border:"none", background:"#f5f5f5", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Minus size={12}/>
                      </button>
                      <span style={{ width:36, textAlign:"center", fontSize:13, fontWeight:700 }}>{item.quantity}</span>
                      <button onClick={()=>updateQty(item.productId,item.quantity+1,item.variantId)}
                        style={{ width:32, height:32, border:"none", background:"#f5f5f5", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Plus size={12}/>
                      </button>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:15, fontWeight:800, color:brand }}>{fmt(item.price*item.quantity,currency)}</span>
                      <button onClick={()=>removeItem(item.productId,item.variantId)} style={{ background:"none", border:"none", cursor:"pointer", color:"#ccc" }}>
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div style={{ background:"#fff", borderRadius:20, padding:24, border:"1px solid rgba(0,0,0,0.06)", position:"sticky", top:70 }}>
          <h3 style={{ fontSize:16, fontWeight:800, color:"#111", margin:"0 0 18px" }}>Order Summary</h3>
          <div style={{ display:"flex", gap:8, marginBottom:18 }}>
            <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:10, border:"1px solid rgba(0,0,0,0.1)", background:"#fafafa" }}>
              <Tag size={13} color="#aaa"/>
              <input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="Coupon code" disabled={!!couponApplied}
                style={{ flex:1, border:"none", background:"transparent", outline:"none", fontSize:13, color:"#111", fontFamily:"inherit" }}/>
            </div>
            <button onClick={applyCoupon} disabled={applyingCoupon||!!couponApplied||!coupon}
              style={{ padding:"10px 14px", borderRadius:10, background:couponApplied?"#10B981":brand, border:"none", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              {couponApplied?"✓":applyingCoupon?"…":"Apply"}
            </button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16, paddingBottom:16, borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
            {[
              { label:"Subtotal", value:fmt(subtotal,currency) },
              ...(discAmt>0?[{ label:`Discount (${discount}%)`, value:`-${fmt(discAmt,currency)}`, color:"#10B981" }]:[]),
              { label:shipping===0?"Shipping (Free!)":"Shipping", value:shipping===0?"FREE":fmt(shipping,currency), color:shipping===0?"#10B981":undefined },
            ].map(row=>(
              <div key={row.label} style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                <span style={{ color:"#666" }}>{row.label}</span>
                <span style={{ fontWeight:600, color:(row as any).color||"#111" }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
            <span style={{ fontSize:16, fontWeight:800, color:"#111" }}>Total</span>
            <span style={{ fontSize:18, fontWeight:900, color:brand }}>{fmt(orderTotal,currency)}</span>
          </div>
          {shipping===0&&<div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:10, background:"rgba(16,185,129,0.06)", border:"1px solid rgba(16,185,129,0.15)", marginBottom:14 }}>
            <Truck size={13} color="#10B981"/>
            <span style={{ fontSize:12, color:"#10B981", fontWeight:600 }}>Free shipping unlocked!</span>
          </div>}
          <button onClick={()=>router.push(`/store/${slug}/checkout`)}
            style={{ width:"100%", padding:"14px 0", borderRadius:14, background:`linear-gradient(135deg,${brand},${brand}CC)`, border:"none", color:"#fff", fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:`0 8px 24px ${brand}35` }}>
            Checkout <ChevronRight size={16}/>
          </button>
          <div style={{ display:"flex", justifyContent:"center", gap:12, marginTop:14 }}>
            {["🔒 Secure","🚚 Fast delivery","↩ Easy returns"].map(t=>(
              <span key={t} style={{ fontSize:11, color:"#aaa" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.cart-grid{grid-template-columns:1fr!important}[style*="position: sticky; top: 70"]{position:static!important}}`}</style>
    </div>
  );
}
