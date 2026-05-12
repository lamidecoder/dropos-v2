"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Heart, Package, ChevronDown, Star, Truck, Shield, RotateCcw, ArrowRight, Menu, X, Zap, Filter } from "lucide-react";
import { useCartStore } from "../../../store/cart.store";
import dynamic from "next/dynamic";
import CartDrawer from "../CartDrawer";
import FlashSaleBanner from "../FlashSaleBanner";

const AbandonedCartTracker = dynamic(() => import("../AbandonedCartTracker"), { ssr: false });

export type TemplateProps = {
  store: any; products?: any[]; product?: any; cart?: any;
  onAddToCart?: (p: any) => void; onRemoveFromCart?: (id: string) => void;
  onUpdateQuantity?: (id: string, qty: number) => void; onCheckout?: () => void;
  page?: "home"|"product"|"cart"|"checkout"|"confirmation";
  search?: string; onSearch?: (q: string) => void; setSearch?: (q: string) => void;
  category?: string; onCategory?: (c: string) => void; setCategory?: (c: string) => void;
  categories?: string[]; sort?: string; onSort?: (s: string) => void; setSort?: (s: string) => void;
  isLoading?: boolean; flashSales?: any[]; [key: string]: any;
};

function normalize(p: TemplateProps) {
  return { ...p, onSearch: p.onSearch??p.setSearch??(() =>{}), onCategory: p.onCategory??p.setCategory??(() =>{}), onSort: p.onSort??p.setSort??(() =>{}) };
}

function useFmt(currency: string) {
  return (n: number) => new Intl.NumberFormat("en-NG", { style:"currency", currency: currency||"NGN", maximumFractionDigits: 0 }).format(n||0);
}

// ── Shared components ──────────────────────────────────────────────────────────
function StoreHeader({ store, search, onSearch, brand, dark, onCategory, categories=[], category }: any) {
  const cartCount = useCartStore(s => s.items.reduce((a,i) => a+i.quantity, 0));
  const toggleCart = useCartStore(s => s.toggleCart);
  const [open, setOpen] = useState(false);
  const bg = dark ? "#07050F" : "#fff";
  const border = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const text = dark ? "#fff" : "#111";
  const muted = dark ? "rgba(255,255,255,0.4)" : "#666";

  return (
    <header style={{ background: bg, borderBottom: `1px solid ${border}`, position:"sticky", top:0, zIndex:30 }}>
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 16px", height:60, display:"flex", alignItems:"center", gap:16 }}>
        <Link href={`/store/${store.slug}`} style={{ fontWeight:900, fontSize:18, letterSpacing:"-0.04em", color: brand, textDecoration:"none", flexShrink:0 }}>
          {store.name}
        </Link>
        {/* Search */}
        <div style={{ flex:1, maxWidth:400, display:"flex", alignItems:"center", gap:8, padding:"7px 12px", borderRadius:12, background: dark?"rgba(255,255,255,0.06)":"#f5f5f5", border:`1px solid ${border}` }}>
          <Search size={13} style={{ color:muted, flexShrink:0 }}/>
          <input value={search||""} onChange={e=>onSearch(e.target.value)} placeholder="Search products..."
            style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:13, color:text, fontFamily:"inherit" }}/>
        </div>
        <button onClick={toggleCart} style={{ position:"relative", background:"none", border:"none", cursor:"pointer", flexShrink:0 }}>
          <ShoppingCart size={22} color={text}/>
          {cartCount > 0 && (
            <span style={{ position:"absolute", top:-6, right:-6, width:17, height:17, borderRadius:"50%", background:brand, color:"#fff", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{cartCount}</span>
          )}
        </button>
      </div>
      {/* Category bar */}
      {categories.length > 1 && (
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 16px 0", overflowX:"auto", display:"flex", gap:6, paddingBottom:10 }}>
          {categories.map((c:string) => (
            <button key={c} onClick={() => onCategory(c)}
              style={{ padding:"4px 12px", borderRadius:99, fontSize:12, fontWeight:600, whiteSpace:"nowrap", border:`1px solid ${category===c?brand:border}`, background:category===c?`${brand}15`:"transparent", color:category===c?brand:muted, cursor:"pointer" }}>
              {c}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function ProductCard({ p, store, brand, dark, currency, variant="default" }: any) {
  const addItem = useCartStore(s => s.addItem);
  const [wish, setWish] = useState(false);
  const [added, setAdded] = useState(false);
  const img = p.images?.[0] || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80`;
  const fmt = useFmt(currency);
  const discount = p.comparePrice && p.comparePrice > p.price ? Math.round((1-p.price/p.comparePrice)*100) : 0;

  const add = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    addItem({ productId:p.id, name:p.name, price:p.price, image:img, storeId:store.id, quantity:1 });
    setAdded(true); setTimeout(()=>setAdded(false), 1500);
  };

  if (variant === "minimal") return (
    <Link href={`/store/${store.slug}/product/${p.id}`} style={{ textDecoration:"none", display:"block" }}>
      <div style={{ cursor:"pointer" }}>
        <div style={{ aspectRatio:"1", borderRadius:4, overflow:"hidden", marginBottom:10, background:"#f5f5f5" }}>
          <img src={img} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{(e.target as HTMLImageElement).src=`https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop`}}/>
        </div>
        <p style={{ fontSize:13, fontWeight:600, color:"#111", margin:"0 0 4px", lineHeight:1.3 }}>{p.name}</p>
        <p style={{ fontSize:13, fontWeight:800, color:"#111", margin:0 }}>{fmt(p.price)}</p>
      </div>
    </Link>
  );

  if (variant === "boutique") return (
    <Link href={`/store/${store.slug}/product/${p.id}`} style={{ textDecoration:"none", display:"block" }}>
      <div style={{ cursor:"pointer", fontFamily:"'Playfair Display', Georgia, serif" }}>
        <div style={{ aspectRatio:"3/4", borderRadius:2, overflow:"hidden", marginBottom:12, background:"#f9f6f3", position:"relative" }}>
          <img src={img} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{(e.target as HTMLImageElement).src=`https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop`}}/>
          <button onClick={add} style={{ position:"absolute", bottom:12, left:"50%", transform:"translateX(-50%)", padding:"8px 20px", borderRadius:2, background:"rgba(255,255,255,0.95)", border:"none", cursor:"pointer", fontSize:11, fontWeight:600, letterSpacing:"0.1em", whiteSpace:"nowrap" }}>
            {added ? "ADDED ✓" : "ADD TO CART"}
          </button>
        </div>
        <p style={{ fontSize:13, color:"#555", margin:"0 0 4px", fontFamily:"'Inter',system-ui" }}>{p.category||""}</p>
        <p style={{ fontSize:15, fontWeight:700, color:"#111", margin:"0 0 4px" }}>{p.name}</p>
        <p style={{ fontSize:14, color:"#111", margin:0 }}>{fmt(p.price)}</p>
      </div>
    </Link>
  );

  if (variant === "dark") return (
    <Link href={`/store/${store.slug}/product/${p.id}`} style={{ textDecoration:"none", display:"block" }}>
      <div style={{ borderRadius:16, overflow:"hidden", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)", cursor:"pointer", transition:"transform 0.2s" }}>
        <div style={{ aspectRatio:"1", overflow:"hidden", position:"relative", background:"rgba(255,255,255,0.02)" }}>
          <img src={img} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{(e.target as HTMLImageElement).src=`https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop`}}/>
          {discount>0&&<span style={{ position:"absolute", top:10, left:10, background:brand, color:"#fff", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99 }}>-{discount}%</span>}
          <button onClick={add} style={{ position:"absolute", bottom:10, right:10, width:36, height:36, borderRadius:"50%", background:brand, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <ShoppingCart size={14} color="#fff"/>
          </button>
        </div>
        <div style={{ padding:"12px 14px" }}>
          <p style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.85)", margin:"0 0 4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</p>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <p style={{ fontSize:15, fontWeight:800, color:"#fff", margin:0 }}>{fmt(p.price)}</p>
            {p.comparePrice&&<p style={{ fontSize:12, color:"rgba(255,255,255,0.3)", textDecoration:"line-through", margin:0 }}>{fmt(p.comparePrice)}</p>}
          </div>
        </div>
      </div>
    </Link>
  );

  // default/classic card
  return (
    <Link href={`/store/${store.slug}/product/${p.id}`} style={{ textDecoration:"none", display:"block" }}>
      <div style={{ borderRadius:16, overflow:"hidden", background:"#fff", border:"1px solid #f0f0f0", cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", transition:"box-shadow 0.2s" }}>
        <div style={{ aspectRatio:"1", overflow:"hidden", position:"relative", background:"#f8f8f8" }}>
          <img src={img} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{(e.target as HTMLImageElement).src=`https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop`}}/>
          {discount>0&&<span style={{ position:"absolute", top:10, left:10, background:"#EF4444", color:"#fff", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99 }}>-{discount}%</span>}
          <div style={{ position:"absolute", top:10, right:10 }}>
            <button onClick={e=>{e.preventDefault();e.stopPropagation();setWish(w=>!w)}} style={{ width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,0.9)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Heart size={14} fill={wish?"#EF4444":"none"} color={wish?"#EF4444":"#999"}/>
            </button>
          </div>
        </div>
        <div style={{ padding:"12px 14px 14px" }}>
          <p style={{ fontSize:13, color:"#888", margin:"0 0 3px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.category||store.name}</p>
          <p style={{ fontSize:14, fontWeight:700, color:"#111", margin:"0 0 6px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <p style={{ fontSize:16, fontWeight:900, color:"#111", margin:0, letterSpacing:"-0.03em" }}>{fmt(p.price)}</p>
              {p.comparePrice&&<p style={{ fontSize:11, color:"#bbb", textDecoration:"line-through", margin:0 }}>{fmt(p.comparePrice)}</p>}
            </div>
            <button onClick={add} style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${brand},${brand}cc)`, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {added?<span style={{fontSize:14}}>✓</span>:<ShoppingCart size={14} color="#fff"/>}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProductGrid({ products, store, brand, dark, currency, variant="default" }: any) {
  if (!products?.length) return (
    <div style={{ textAlign:"center", padding:"60px 20px" }}>
      <Package size={36} style={{ color:"#ccc", margin:"0 auto 12px" }}/>
      <p style={{ color:"#999", fontSize:14 }}>No products found</p>
    </div>
  );
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:variant==="minimal"?24:16 }}>
      {products.map((p:any) => <ProductCard key={p.id} p={p} store={store} brand={brand} dark={dark} currency={currency} variant={variant}/>)}
    </div>
  );
}

function TrustBar({ dark, brand }: any) {
  const items = [
    { icon:"🚚", label:"Free Delivery", sub:"Orders over ₦15k" },
    { icon:"🔒", label:"Secure Payment", sub:"Paystack protected" },
    { icon:"↩️", label:"Easy Returns", sub:"7-day policy" },
  ];
  return (
    <div style={{ borderBottom:`1px solid ${dark?"rgba(255,255,255,0.06)":"#f0f0f0"}`, borderTop:`1px solid ${dark?"rgba(255,255,255,0.06)":"#f0f0f0"}` }}>
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"14px 16px", display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
        {items.map(i => (
          <div key={i.label} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:18 }}>{i.icon}</span>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:dark?"rgba(255,255,255,0.8)":"#333", margin:0 }}>{i.label}</p>
              <p style={{ fontSize:11, color:dark?"rgba(255,255,255,0.35)":"#999", margin:0 }}>{i.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SortBar({ sort, onSort, total, dark }: any) {
  const text = dark ? "rgba(255,255,255,0.4)" : "#888";
  const bg = dark ? "rgba(255,255,255,0.05)" : "#f5f5f5";
  const border = dark ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const col = dark ? "rgba(255,255,255,0.7)" : "#333";
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4, flexWrap:"wrap", gap:8 }}>
      <span style={{ fontSize:13, color:text }}>{total} products</span>
      <select value={sort||"newest"} onChange={e=>onSort(e.target.value)}
        style={{ padding:"6px 12px", borderRadius:10, border:`1px solid ${border}`, background:bg, color:col, fontSize:12, fontWeight:600, outline:"none", cursor:"pointer", fontFamily:"inherit" }}>
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="popular">Most Popular</option>
      </select>
    </div>
  );
}

function StoreFooter({ store, brand, dark }: any) {
  const text = dark ? "rgba(255,255,255,0.3)" : "#999";
  const border = dark ? "rgba(255,255,255,0.06)" : "#f0f0f0";
  return (
    <footer style={{ borderTop:`1px solid ${border}`, marginTop:48, padding:"32px 16px", textAlign:"center" }}>
      <p style={{ fontWeight:900, fontSize:18, letterSpacing:"-0.03em", color:brand, marginBottom:8 }}>{store.name}</p>
      <p style={{ fontSize:12, color:text, marginBottom:16 }}>{store.description||"Quality products, fast delivery"}</p>
      <p style={{ fontSize:11, color:text }}>© {new Date().getFullYear()} {store.name} · Powered by DropOS</p>
    </footer>
  );
}

function Skeleton({ dark, count=8 }: any) {
  const bg = dark ? "rgba(255,255,255,0.06)" : "#f0f0f0";
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:16 }}>
      {Array.from({length:count}).map((_,i)=>(
        <div key={i} style={{ borderRadius:16, overflow:"hidden", background:bg }}>
          <div style={{ aspectRatio:"1", background:dark?"rgba(255,255,255,0.04)":"#e8e8e8", animation:"pulse 1.5s ease-in-out infinite" }}/>
          <div style={{ padding:14 }}>
            <div style={{ height:12, background:dark?"rgba(255,255,255,0.06)":"#e8e8e8", borderRadius:6, marginBottom:8 }}/>
            <div style={{ height:16, background:dark?"rgba(255,255,255,0.04)":"#f0f0f0", borderRadius:6, width:"60%" }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── TEMPLATE 1: CLASSIC ───────────────────────────────────────────────────────
function ClassicTemplate(raw: TemplateProps) {
  const props = normalize(raw);
  const { store, products=[], search, onSearch, category, onCategory, categories=[], sort, onSort, isLoading } = props;
  const brand = store.brandColor||store.primaryColor||"#6B35E8";
  const currency = store.currency||"NGN";
  const fmt = useFmt(currency);
  return (
    <div style={{ minHeight:"100vh", background:"#fafafa", fontFamily:"'Inter','Plus Jakarta Sans',system-ui" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      {(props.flashSales||[]).filter((s:any)=>s.active&&new Date(s.endsAt)>new Date()).slice(0,1).map((s:any)=><FlashSaleBanner key={s.id} sale={s} brand={brand}/>)}
      <StoreHeader store={store} search={search} onSearch={onSearch} brand={brand} onCategory={onCategory} categories={categories} category={category}/>
      <div style={{ background:"#fff", borderBottom:"1px solid #f0f0f0" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"clamp(40px,8vw,80px) 16px", textAlign:"center" }}>
          <h1 style={{ fontSize:"clamp(28px,6vw,56px)", fontWeight:900, letterSpacing:"-0.04em", color:"#111", margin:"0 0 12px" }}>{store.name}</h1>
          {store.description&&<p style={{ fontSize:"clamp(14px,2.5vw,17px)", color:"#777", maxWidth:480, margin:"0 auto 24px", lineHeight:1.6 }}>{store.description}</p>}
          <button onClick={()=>document.getElementById("pg")?.scrollIntoView({behavior:"smooth"})} style={{ padding:"12px 28px", borderRadius:12, background:`linear-gradient(135deg,${brand},${brand}cc)`, border:"none", cursor:"pointer", color:"#fff", fontSize:14, fontWeight:700 }}>
            Shop Now →
          </button>
        </div>
      </div>
      <TrustBar/>
      <div id="pg" style={{ maxWidth:1280, margin:"0 auto", padding:"24px 16px 48px" }}>
        <SortBar sort={sort} onSort={onSort} total={products.length}/>
        <div style={{ paddingTop:16 }}>{isLoading?<Skeleton/>:<ProductGrid products={products} store={store} brand={brand} currency={currency}/>}</div>
      </div>
      <StoreFooter store={store} brand={brand}/>
      <CartDrawer storeSlug={store.slug} storeId={store.id} brand={brand} currency={currency} fmt={fmt}/>
    </div>
  );
}

// ── TEMPLATE 2: DARK LUXE ─────────────────────────────────────────────────────
function DarkLuxeTemplate(raw: TemplateProps) {
  const props = normalize(raw);
  const { store, products=[], search, onSearch, category, onCategory, categories=[], sort, onSort, isLoading } = props;
  const brand = store.brandColor||store.primaryColor||"#8B5CF6";
  const currency = store.currency||"NGN";
  const fmt = useFmt(currency);
  return (
    <div style={{ minHeight:"100vh", background:"#07050F", fontFamily:"'Inter','Plus Jakarta Sans',system-ui" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      {(props.flashSales||[]).filter((s:any)=>s.active&&new Date(s.endsAt)>new Date()).slice(0,1).map((s:any)=><FlashSaleBanner key={s.id} sale={s} brand={brand}/>)}
      <StoreHeader store={store} search={search} onSearch={onSearch} brand={brand} dark onCategory={onCategory} categories={categories} category={category}/>
      <div style={{ position:"relative", overflow:"hidden", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"min(700px,100%)", height:400, borderRadius:"50%", background:`radial-gradient(ellipse,${brand}30,transparent 70%)`, filter:"blur(80px)", pointerEvents:"none" }}/>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"clamp(48px,10vw,96px) 16px", textAlign:"center", position:"relative", zIndex:1 }}>
          <h1 style={{ fontSize:"clamp(32px,7vw,72px)", fontWeight:900, letterSpacing:"-0.05em", color:"#fff", margin:"0 0 16px", lineHeight:0.95 }}>{store.name}</h1>
          {store.description&&<p style={{ fontSize:"clamp(14px,2.5vw,18px)", color:"rgba(255,255,255,0.4)", maxWidth:440, margin:"0 auto 28px", lineHeight:1.6 }}>{store.description}</p>}
          <button onClick={()=>document.getElementById("pg-dark")?.scrollIntoView({behavior:"smooth"})} style={{ padding:"12px 28px", borderRadius:12, background:`linear-gradient(135deg,${brand},${brand}99)`, border:"none", cursor:"pointer", color:"#fff", fontSize:14, fontWeight:700, boxShadow:`0 8px 32px ${brand}40` }}>
            Explore Collection →
          </button>
        </div>
      </div>
      <TrustBar dark brand={brand}/>
      <div id="pg-dark" style={{ maxWidth:1280, margin:"0 auto", padding:"24px 16px 48px" }}>
        <SortBar sort={sort} onSort={onSort} total={products.length} dark/>
        <div style={{ paddingTop:16 }}>{isLoading?<Skeleton dark/>:<ProductGrid products={products} store={store} brand={brand} dark currency={currency} variant="dark"/>}</div>
      </div>
      <StoreFooter store={store} brand={brand} dark/>
      <CartDrawer storeSlug={store.slug} storeId={store.id} brand={brand} currency={currency} fmt={fmt}/>
    </div>
  );
}

// ── TEMPLATE 3: MINIMAL ───────────────────────────────────────────────────────
function MinimalTemplate(raw: TemplateProps) {
  const props = normalize(raw);
  const { store, products=[], search, onSearch, category, onCategory, categories=[], sort, onSort, isLoading } = props;
  const brand = store.brandColor||store.primaryColor||"#111";
  const currency = store.currency||"NGN";
  const fmt = useFmt(currency);
  return (
    <div style={{ minHeight:"100vh", background:"#fff", fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      {(props.flashSales||[]).filter((s:any)=>s.active&&new Date(s.endsAt)>new Date()).slice(0,1).map((s:any)=><FlashSaleBanner key={s.id} sale={s} brand={brand}/>)}
      <StoreHeader store={store} search={search} onSearch={onSearch} brand={brand} onCategory={onCategory} categories={categories} category={category}/>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"clamp(32px,6vw,64px) 16px 0" }}>
        <h1 style={{ fontSize:"clamp(22px,5vw,42px)", fontWeight:900, color:"#111", margin:"0 0 6px", letterSpacing:"-0.04em" }}>{store.name}</h1>
        {store.description&&<p style={{ fontSize:14, color:"#888", maxWidth:400, margin:"0 0 32px", lineHeight:1.6 }}>{store.description}</p>}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderTop:"1px solid #111", borderBottom:"1px solid #eee", marginBottom:32 }}>
          <span style={{ fontSize:12, color:"#888", fontWeight:500 }}>{products.length} ITEMS</span>
          <select value={sort||"newest"} onChange={e=>onSort(e.target.value)} style={{ fontSize:12, color:"#111", background:"none", border:"none", outline:"none", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            <option value="newest">NEWEST</option>
            <option value="price_asc">PRICE ↑</option>
            <option value="price_desc">PRICE ↓</option>
          </select>
        </div>
        {isLoading?<Skeleton count={8}/>:<ProductGrid products={products} store={store} brand={brand} currency={currency} variant="minimal"/>}
      </div>
      <StoreFooter store={store} brand={brand}/>
      <CartDrawer storeSlug={store.slug} storeId={store.id} brand={brand} currency={currency} fmt={fmt}/>
    </div>
  );
}

// ── TEMPLATE 4: BOUTIQUE ──────────────────────────────────────────────────────
function BoutiqueTemplate(raw: TemplateProps) {
  const props = normalize(raw);
  const { store, products=[], search, onSearch, category, onCategory, categories=[], sort, onSort, isLoading } = props;
  const brand = store.brandColor||store.primaryColor||"#c084fc";
  const currency = store.currency||"NGN";
  const fmt = useFmt(currency);
  return (
    <div style={{ minHeight:"100vh", background:"#fdf9f6", fontFamily:"Georgia,'Playfair Display',serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@400;500;600&display=swap');@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      {(props.flashSales||[]).filter((s:any)=>s.active&&new Date(s.endsAt)>new Date()).slice(0,1).map((s:any)=><FlashSaleBanner key={s.id} sale={s} brand={brand}/>)}
      <StoreHeader store={store} search={search} onSearch={onSearch} brand={brand} onCategory={onCategory} categories={categories} category={category}/>
      {/* Elegant serif hero */}
      <div style={{ textAlign:"center", padding:"clamp(48px,8vw,80px) 16px", background:"#fdf9f6", borderBottom:"1px solid #ede9e3" }}>
        <p style={{ fontSize:11, letterSpacing:"0.2em", color:brand, fontFamily:"'Inter',sans-serif", fontWeight:600, margin:"0 0 16px", textTransform:"uppercase" }}>New Collection</p>
        <h1 style={{ fontSize:"clamp(36px,7vw,72px)", fontWeight:900, letterSpacing:"-0.02em", color:"#1a1a1a", margin:"0 0 16px", lineHeight:0.9, fontFamily:"'Playfair Display',Georgia,serif" }}>{store.name}</h1>
        {store.description&&<p style={{ fontSize:"clamp(14px,2vw,16px)", color:"#888", maxWidth:440, margin:"0 auto", lineHeight:1.7, fontFamily:"'Inter',sans-serif" }}>{store.description}</p>}
      </div>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 16px 64px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28, fontFamily:"'Inter',sans-serif" }}>
          <span style={{ fontSize:11, letterSpacing:"0.15em", color:"#aaa", textTransform:"uppercase" }}>{products.length} pieces</span>
          <select value={sort||"newest"} onChange={e=>onSort(e.target.value)} style={{ fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color:"#555", background:"none", border:"none", outline:"none", fontWeight:600, cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>
            <option value="newest">Latest</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
          </select>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:28 }}>
          {isLoading?<Skeleton count={8}/>:products.map((p:any)=><ProductCard key={p.id} p={p} store={store} brand={brand} currency={currency} variant="boutique"/>)}
        </div>
      </div>
      <StoreFooter store={store} brand={brand}/>
      <CartDrawer storeSlug={store.slug} storeId={store.id} brand={brand} currency={currency} fmt={fmt}/>
    </div>
  );
}

// ── TEMPLATE 5: BOLD ─────────────────────────────────────────────────────────
function BoldTemplate(raw: TemplateProps) {
  const props = normalize(raw);
  const { store, products=[], search, onSearch, category, onCategory, categories=[], sort, onSort, isLoading } = props;
  const brand = store.brandColor||store.primaryColor||"#EF4444";
  const currency = store.currency||"NGN";
  const fmt = useFmt(currency);
  return (
    <div style={{ minHeight:"100vh", background:"#fff", fontFamily:"'Impact','Arial Black',system-ui" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      {(props.flashSales||[]).filter((s:any)=>s.active&&new Date(s.endsAt)>new Date()).slice(0,1).map((s:any)=><FlashSaleBanner key={s.id} sale={s} brand={brand}/>)}
      <StoreHeader store={store} search={search} onSearch={onSearch} brand={brand} onCategory={onCategory} categories={categories} category={category}/>
      <div style={{ background:brand, color:"#fff", padding:"clamp(32px,8vw,80px) 16px", textAlign:"center" }}>
        <h1 style={{ fontSize:"clamp(48px,12vw,120px)", fontWeight:900, letterSpacing:"-0.05em", margin:"0 0 8px", textTransform:"uppercase", lineHeight:0.85 }}>{store.name}</h1>
        {store.description&&<p style={{ fontSize:"clamp(14px,2vw,18px)", opacity:0.8, fontFamily:"'Inter',sans-serif", fontWeight:400, maxWidth:480, margin:"16px auto 0", lineHeight:1.5 }}>{store.description}</p>}
      </div>
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"24px 16px 64px" }}>
        <SortBar sort={sort} onSort={onSort} total={products.length}/>
        <div style={{ paddingTop:16 }}>{isLoading?<Skeleton/>:<ProductGrid products={products} store={store} brand={brand} currency={currency}/>}</div>
      </div>
      <StoreFooter store={store} brand={brand}/>
      <CartDrawer storeSlug={store.slug} storeId={store.id} brand={brand} currency={currency} fmt={fmt}/>
    </div>
  );
}

// ── TEMPLATE 6: NEON ─────────────────────────────────────────────────────────
function NeonTemplate(raw: TemplateProps) {
  const props = normalize(raw);
  const { store, products=[], search, onSearch, category, onCategory, categories=[], sort, onSort, isLoading } = props;
  const brand = store.brandColor||store.primaryColor||"#00ff88";
  const currency = store.currency||"NGN";
  const fmt = useFmt(currency);
  return (
    <div style={{ minHeight:"100vh", background:"#000", fontFamily:"'Inter','Plus Jakarta Sans',system-ui" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} @keyframes glow{0%,100%{text-shadow:0 0 20px ${brand}80}50%{text-shadow:0 0 40px ${brand}}}`}</style>
      {(props.flashSales||[]).filter((s:any)=>s.active&&new Date(s.endsAt)>new Date()).slice(0,1).map((s:any)=><FlashSaleBanner key={s.id} sale={s} brand={brand}/>)}
      <StoreHeader store={store} search={search} onSearch={onSearch} brand={brand} dark onCategory={onCategory} categories={categories} category={category}/>
      <div style={{ textAlign:"center", padding:"clamp(48px,10vw,96px) 16px", borderBottom:`1px solid ${brand}20` }}>
        <h1 style={{ fontSize:"clamp(36px,9vw,96px)", fontWeight:900, letterSpacing:"-0.05em", color:brand, margin:"0 0 16px", animation:"glow 3s ease-in-out infinite", lineHeight:0.9 }}>{store.name}</h1>
        {store.description&&<p style={{ fontSize:"clamp(13px,2vw,16px)", color:"rgba(255,255,255,0.4)", maxWidth:420, margin:"0 auto", lineHeight:1.6 }}>{store.description}</p>}
      </div>
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"24px 16px 64px" }}>
        <SortBar sort={sort} onSort={onSort} total={products.length} dark/>
        <div style={{ paddingTop:16 }}>{isLoading?<Skeleton dark/>:<ProductGrid products={products} store={store} brand={brand} dark currency={currency} variant="dark"/>}</div>
      </div>
      <StoreFooter store={store} brand={brand} dark/>
      <CartDrawer storeSlug={store.slug} storeId={store.id} brand={brand} currency={currency} fmt={fmt}/>
    </div>
  );
}

// ── TEMPLATE 7: GRID (dense magazine grid) ────────────────────────────────────
function GridTemplate(raw: TemplateProps) {
  const props = normalize(raw);
  const { store, products=[], search, onSearch, category, onCategory, categories=[], sort, onSort, isLoading } = props;
  const brand = store.brandColor||store.primaryColor||"#3B82F6";
  const currency = store.currency||"NGN";
  const fmt = useFmt(currency);
  const addItem = useCartStore(s => s.addItem);
  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"'Inter',system-ui" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      {(props.flashSales||[]).filter((s:any)=>s.active&&new Date(s.endsAt)>new Date()).slice(0,1).map((s:any)=><FlashSaleBanner key={s.id} sale={s} brand={brand}/>)}
      <StoreHeader store={store} search={search} onSearch={onSearch} brand={brand} onCategory={onCategory} categories={categories} category={category}/>
      <div style={{ background:brand, color:"#fff", padding:"20px 16px", textAlign:"center" }}>
        <h1 style={{ fontSize:"clamp(20px,4vw,36px)", fontWeight:900, letterSpacing:"-0.03em", margin:0 }}>{store.name}</h1>
        {store.description&&<p style={{ fontSize:13, opacity:0.8, margin:"6px 0 0", maxWidth:400, marginLeft:"auto", marginRight:"auto" }}>{store.description}</p>}
      </div>
      <div style={{ maxWidth:1400, margin:"0 auto", padding:"16px" }}>
        <SortBar sort={sort} onSort={onSort} total={products.length}/>
        <div style={{ paddingTop:12, display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:8 }}>
          {isLoading?<Skeleton count={12}/>:products.map((p:any)=><ProductCard key={p.id} p={p} store={store} brand={brand} currency={currency}/>)}
        </div>
      </div>
      <StoreFooter store={store} brand={brand}/>
      <CartDrawer storeSlug={store.slug} storeId={store.id} brand={brand} currency={currency} fmt={fmt}/>
    </div>
  );
}

// ── Template registry ──────────────────────────────────────────────────────────
const TEMPLATE_MAP: Record<string, (p: TemplateProps) => JSX.Element> = {
  "classic":      ClassicTemplate,
  "dark-luxe":    DarkLuxeTemplate,
  "minimal":      MinimalTemplate,
  "minimal-pro":  MinimalTemplate,
  "boutique":     BoutiqueTemplate,
  "bold":         BoldTemplate,
  "editorial":    BoldTemplate,
  "neon":         NeonTemplate,
  "grid":         GridTemplate,
  "magazine":     GridTemplate,
  "split":        ClassicTemplate,
  "glassmorphic": DarkLuxeTemplate,
  "vintage":      BoutiqueTemplate,
  "ultra-dark":   DarkLuxeTemplate,
  "runway":       BoutiqueTemplate,
  "modern":       ClassicTemplate,
};

export function TemplateRenderer(props: TemplateProps) {
  const theme = props.store?.templateId || props.store?.theme || "classic";
  const Component = TEMPLATE_MAP[theme] || ClassicTemplate;
  return <Component {...props}/>;
}
