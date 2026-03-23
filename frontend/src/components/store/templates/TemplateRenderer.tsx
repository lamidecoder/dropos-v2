"use client";

// src/components/store/templates/TemplateRenderer.tsx
import Link from "next/link";
import { ShoppingBag, Search, Package, Truck, ShieldCheck, RotateCcw, Star, X, ArrowRight, Instagram, Twitter, User } from "lucide-react";
import { useEffect } from "react";
import { useCartStore } from "../../../store/cart.store";
import CartDrawer from "../CartDrawer";
import AbandonedCartTracker from "../AbandonedCartTracker";
import { ProductCard } from "./ProductCard";
import { CurrencyPicker } from "../CurrencyPicker";
import { useCurrencyStore } from "../../../store/currency.store";

interface TemplateProps {
  store:         any;
  products:      any[];
  slug:          string;
  storeId?:      string;
  storeSlug?:    string;
  brand?:        any;
  fmt?:          (amount: number) => string;
  search:        string;
  setSearch:     (v: string) => void;
  category:      string;
  setCategory:   (v: string) => void;
  sort:          string;
  setSort:       (v: string) => void;
  categories:    string[];
  isLoading:     boolean;
}

// Default formatter
const defaultFmt = (amount: number) => `$${amount.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;


// ── Live Chat Widget injector ─────────────────────────────────────────────────
function LiveChatWidget({ store }: { store: any }) {
  useEffect(() => {
    if (!store?.liveChatEnabled || !store?.liveChatId) return;
    const id = store.liveChatId;
    const provider = store.liveChatProvider;

    if (provider === "tawk") {
      const s = document.createElement("script"); s.async = true;
      s.src = `https://embed.tawk.to/${id}`; s.charset = "UTF-8";
      s.setAttribute("crossorigin", "*");
      document.head.appendChild(s);
    } else if (provider === "crisp") {
      (window as any).$crisp = [];
      (window as any).CRISP_WEBSITE_ID = id;
      const s = document.createElement("script"); s.src = "https://client.crisp.chat/l.js"; s.async = true;
      document.head.appendChild(s);
    } else if (provider === "tidio") {
      const s = document.createElement("script"); s.src = `//code.tidio.co/${id}.js`; s.async = true;
      document.head.appendChild(s);
    }
  }, [store?.liveChatEnabled, store?.liveChatId, store?.liveChatProvider]);

  if (!store?.liveChatEnabled || !store?.liveChatId) return null;

  // WhatsApp floating button
  if (store.liveChatProvider === "whatsapp") {
    const num = store.liveChatId.replace(/[^0-9]/g, "");
    return (
      <a href={`https://wa.me/${num}`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-[var(--text-primary)] text-2xl hover:scale-110 transition-transform"
        style={{ background: "#25d366" }} title="Chat on WhatsApp">
        💬
      </a>
    );
  }

  return null; // Other providers inject their own widgets via script
}

// ── Shared nav for dark templates ─────────────────────────────────────────────
function DarkNav({ store, slug, brand, textColor = "white" }: any) {
  const cartCount  = useCartStore(s => s.count);
  const toggleCart = useCartStore(s => s.toggleCart);
  const customerName = typeof window !== "undefined" ? (() => { try { return JSON.parse(localStorage.getItem("customer_data") || "null")?.name; } catch { return null; } })() : null;
  return (
    <nav className="sticky top-0 z-40 border-b" style={{ background: "rgba(10,10,20,0.95)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.07)" }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link href={`/store/${slug}`} className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-lg" style={{ background: `linear-gradient(135deg,${brand},${brand}cc)` }}>
            {store.name?.charAt(0)?.toUpperCase()}
          </div>
          <span className="font-black text-base text-white tracking-tight">{store.name}</span>
        </Link>
        <div className="flex items-center gap-2">
          <CurrencyPicker supportedCurrencies={store.supportedCurrencies ?? []} brand={brand} variant="dark" />
          <Link href={`/store/${slug}/track`} className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Package size={14} /> Track Order
          </Link>
          <Link href={`/store/${slug}/account`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <User size={14} /> {customerName ? customerName.split(" ")[0] : "Account"}
          </Link>
          <button onClick={toggleCart} className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-lg" style={{ background: `linear-gradient(135deg,${brand},${brand}cc)` }}>
            <ShoppingBag size={15} />
            <span className="hidden sm:inline">Cart</span>
            {cartCount() > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">{cartCount()}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── Shared nav for light templates ────────────────────────────────────────────
function LightNav({ store, slug, brand, search, setSearch }: any) {
  const cartCount  = useCartStore(s => s.count);
  const toggleCart = useCartStore(s => s.toggleCart);
  const customerName = typeof window !== "undefined" ? (() => { try { return JSON.parse(localStorage.getItem("customer_data") || "null")?.name; } catch { return null; } })() : null;
  return (
    <nav className="sticky top-0 z-40 bg-white/98 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link href={`/store/${slug}`} className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md" style={{ background: `linear-gradient(135deg,${brand},${brand}cc)` }}>
            {store.name?.charAt(0)?.toUpperCase()}
          </div>
          <span className="font-black text-slate-900 text-base tracking-tight">{store.name}</span>
        </Link>
        <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-2xl px-4 py-2.5 flex-1 max-w-xs">
          <Search size={14} className="text-slate-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 w-full" />
          {search && <button onClick={() => setSearch("")}><X size={12} className="text-slate-400" /></button>}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/store/${slug}/track`} className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all">
            <Package size={14} /> Track
          </Link>
          <Link href={`/store/${slug}/account`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all border border-slate-200">
            <User size={14} /> {customerName ? customerName.split(" ")[0] : "Account"}
          </Link>
          <CurrencyPicker supportedCurrencies={store.supportedCurrencies ?? []} brand={brand} variant="light" />
          <button onClick={toggleCart} className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-md" style={{ background: `linear-gradient(135deg,${brand},${brand}cc)` }}>
            <ShoppingBag size={15} />
            <span className="hidden sm:inline">Cart</span>
            {cartCount() > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">{cartCount()}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── Trust badges ──────────────────────────────────────────────────────────────
function TrustBadges({ brand, dark = false }: { brand: string; dark?: boolean }) {
  const items = [
    { icon: Truck,       label: "Free Shipping",   sub: "Orders over $50"       },
    { icon: ShieldCheck, label: "Secure Checkout", sub: "256-bit encrypted"      },
    { icon: RotateCcw,   label: "Easy Returns",    sub: "30-day policy"          },
    { icon: Star,        label: "Top Rated",       sub: "4.9★ reviews"           },
  ];
  return (
    <section className={`border-y border-[var(--border)]`}>
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${brand}18` }}>
                <Icon size={16} style={{ color: brand }} />
              </div>
              <div>
                <div className={`font-bold text-xs text-[var(--text-primary)]`}>{label}</div>
                <div className={`text-[11px] text-[var(--text-tertiary)]`}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Shared light footer ───────────────────────────────────────────────────────
function LightFooter({ store, slug, brand }: any) {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-8 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-[var(--text-primary)]" style={{ background: `linear-gradient(135deg,${brand},${brand}bb)` }}>{store.name?.charAt(0)}</div>
              <span className="font-black text-slate-900 text-sm">{store.name}</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{store.description || "Quality products."}</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-widest mb-3">Quick Links</h4>
            <div className="space-y-1.5">
              <a href="#products" className="block text-xs text-slate-500 hover:text-slate-800">All Products</a>
              <Link href={`/store/${slug}/track`} className="block text-xs text-slate-500 hover:text-slate-800">Track Order</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-widest mb-3">Contact</h4>
            {store.supportEmail && <p className="text-xs text-slate-500">📧 {store.supportEmail}</p>}
          </div>
        </div>
        <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-[11px] text-slate-400">
          <span>© {new Date().getFullYear()} {store.name}</span>
          <span>Powered by <strong className="text-slate-600">DropOS</strong></span>
        </div>
      </div>
    </footer>
  );
}

function DarkFooter({ store, slug, brand }: any) {
  return (
    <footer className="border-t mt-16" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.4)" }}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs" style={{ background: brand }}>{store.name?.charAt(0)}</div>
            <span className="font-black text-[var(--text-primary)] text-sm">{store.name}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
            <a href="#products" className="hover:text-[var(--text-primary)] transition-colors">Products</a>
            <Link href={`/store/${slug}/track`} className="hover:text-[var(--text-primary)] transition-colors">Track Order</Link>
            {store.supportEmail && <span>{store.supportEmail}</span>}
          </div>
        </div>
        <div className="border-t pt-4 flex items-center justify-between text-[11px] text-[var(--text-disabled)]" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <span>© {new Date().getFullYear()} {store.name}</span>
          <span>Powered by <strong className="text-[var(--text-tertiary)]">DropOS</strong></span>
        </div>
      </div>
    </footer>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 1: CLASSIC (Free)
// ════════════════════════════════════════════════════════════════════════════
function ClassicTemplate(p: TemplateProps) {
  const { store, products, slug, search, setSearch, category, setCategory, sort, setSort, categories } = p;
  const brand = store?.primaryColor || "#7c3aed";
  return (
    <div className="min-h-screen bg-white">
      <LightNav store={store} slug={slug} brand={brand} search={search} setSearch={setSearch} />
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${brand}12, transparent)` }}>
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-5" style={{ background: `${brand}15`, color: brand }}>✦ {store.name}</div>
            <h1 className="text-5xl font-black text-slate-900 leading-tight tracking-tight mb-5">{store.tagline || `Shop the best from ${store.name}`}</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">{store.description || "Discover premium products, delivered to your door."}</p>
            <a href="#products" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[var(--text-primary)] font-bold shadow-xl hover:-translate-y-0.5 transition-all" style={{ background: `linear-gradient(135deg,${brand},${brand}cc)`, boxShadow: `0 8px 24px ${brand}40` }}>
              Shop Now <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>
      <TrustBadges brand={brand} />
      {/* Products */}
      <section id="products" className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black text-slate-900">Products <span className="text-slate-400 text-lg font-semibold">({products.length})</span></h2>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all" style={category === cat ? { background: brand, color: "white" } : { background: "#f1f5f9", color: "#64748b" }}>{cat}</button>
          ))}
          <select value={sort} onChange={e => setSort(e.target.value)} className="ml-auto px-4 py-1.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white outline-none">
            <option value="newest">Newest</option><option value="price_asc">Price ↑</option><option value="price_desc">Price ↓</option>
          </select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map(product => <ProductCard key={product.id} product={product} storeSlug={slug} brand={brand} variant="classic" currency={store.currency || "$"} />)}
        </div>
      </section>
      <LightFooter store={store} slug={slug} brand={brand} />
      <CartDrawer storeSlug={slug} storeId={store?.id || ""} brand={brand} fmt={(n) => `${store?.currency || "$"}${n.toLocaleString()}`} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 2: DARK LUXE (Free)
// ════════════════════════════════════════════════════════════════════════════
function DarkLuxeTemplate(p: TemplateProps) {
  const { store, products, slug, category, setCategory, sort, setSort, categories } = p;
  const brand = store?.primaryColor || "#7C3AED";
  return (
    <div className="min-h-screen" style={{ background: "#08080f", color: "white" }}>
      <DarkNav store={store} slug={slug} brand={brand} />
      {/* Hero */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 30% 50%, ${brand}15, transparent 70%)` }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="max-w-7xl mx-auto relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-6" style={{ border: `1px solid ${brand}30`, color: brand, background: `${brand}10` }}>✦ {store.name}</div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight mb-5" style={{ background: "linear-gradient(135deg,#fff 60%,rgba(255,255,255,0.5))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {store.tagline || `Shop the best from ${store.name}`}
          </h1>
          <p className="text-[var(--text-tertiary)] mb-8 leading-relaxed text-lg">{store.description || "Premium products, delivered."}</p>
          <a href="#products" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-black shadow-xl transition-all hover:-translate-y-0.5" style={{ background: `linear-gradient(135deg,${brand},#A78BFA)`, boxShadow: `0 8px 24px ${brand}40` }}>
            Shop Now <ArrowRight size={15} />
          </a>
        </div>
      </section>
      <TrustBadges brand={brand} dark />
      <section id="products" className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all" style={category === cat ? { background: brand, color: "black" } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>{cat}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => <ProductCard key={product.id} product={product} storeSlug={slug} brand={brand} variant="dark" currency={store.currency || "$"} />)}
        </div>
      </section>
      <DarkFooter store={store} slug={slug} brand={brand} />
      <CartDrawer storeSlug={slug} storeId={store?.id || ""} brand={brand} fmt={(n) => `${store?.currency || "$"}${n.toLocaleString()}`} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 3: BOLD (Pro)
// ════════════════════════════════════════════════════════════════════════════
function BoldTemplate(p: TemplateProps) {
  const { store, products, slug, category, setCategory, categories } = p;
  const brand = store?.primaryColor || "#e11d48";
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-40 bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/store/${slug}`} className="font-black text-2xl tracking-tighter text-black uppercase">{store.name}</Link>
          <button onClick={() => useCartStore.getState().toggleCart()} className="flex items-center gap-2 px-5 py-2 font-black text-sm uppercase text-[var(--text-primary)]" style={{ background: "black" }}>
            <ShoppingBag size={15} /> Cart ({0})
          </button>
        </div>
      </nav>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-2 text-xs font-black uppercase tracking-[0.3em]" style={{ color: brand }}>New Collection</div>
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none text-black mb-6 uppercase">
          {store.tagline || store.name}
        </h1>
        <div className="h-1 w-32 mb-8" style={{ background: brand }} />
        <a href="#products" className="inline-flex items-center gap-3 px-8 py-4 font-black text-[var(--text-primary)] text-sm uppercase tracking-wider" style={{ background: brand }}>
          Shop Now <ArrowRight size={16} />
        </a>
      </section>
      <section id="products" className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map(cat => <button key={cat} onClick={() => setCategory(cat)} className="px-5 py-2 font-black text-sm uppercase tracking-wider border-2 whitespace-nowrap transition-all" style={category === cat ? { borderColor: brand, background: brand, color: "white" } : { borderColor: "black", color: "black" }}>{cat}</button>)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => <ProductCard key={product.id} product={product} storeSlug={slug} brand={brand} variant="classic" currency={store.currency || "$"} />)}
        </div>
      </section>
      <LightFooter store={store} slug={slug} brand={brand} />
      <CartDrawer storeSlug={slug} storeId={store?.id || ""} brand={brand} fmt={(n) => `${store?.currency || "$"}${n.toLocaleString()}`} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 4: EDITORIAL (Pro)
// ════════════════════════════════════════════════════════════════════════════
function EditorialTemplate(p: TemplateProps) {
  const _fmt = useCurrencyStore(s => s.format);
  const fmt = (n: number) => _fmt(n, p.store?.currency || "USD");
  const { store, products, slug, category, setCategory, categories } = p;
  const brand = store?.primaryColor || "#1a1a2e";
  const featured = products[0];
  const rest = products.slice(1);
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-black text-lg tracking-tight text-slate-900">{store.name}</span>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            {categories.slice(0, 4).map(c => <button key={c} onClick={() => setCategory(c)} className={`hover:text-black transition-colors ${category === c ? "text-black font-bold" : ""}`}>{c}</button>)}
          </div>
          <button onClick={() => useCartStore.getState().toggleCart()} className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <ShoppingBag size={16} /> Bag ({0})
          </button>
        </div>
      </nav>
      {featured && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Featured</div>
              <h1 className="text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">{featured.name}</h1>
              <p className="text-slate-500 mb-6 leading-relaxed">{featured.description || store.description}</p>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-black text-slate-900">{fmt(featured.price ?? 0)}</span>
                {featured.comparePrice && <span className="text-xl text-slate-400 line-through">{fmt(featured.comparePrice ?? 0)}</span>}
              </div>
              <Link href={`/store/${slug}/product/${featured.id}`} className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[var(--text-primary)] font-bold" style={{ background: `linear-gradient(135deg,${brand},${brand}cc)` }}>
                View Product <ArrowRight size={15} />
              </Link>
            </div>
            <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100">
              {featured.images?.[0] ? <img src={featured.images[0]} alt={featured.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={48} className="text-slate-300" /></div>}
            </div>
          </div>
        </section>
      )}
      <section id="products" className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">All Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {rest.map(product => <ProductCard key={product.id} product={product} storeSlug={slug} brand={brand} variant="editorial" currency={store.currency || "$"} />)}
        </div>
      </section>
      <LightFooter store={store} slug={slug} brand={brand} />
      <CartDrawer storeSlug={slug} storeId={store?.id || ""} brand={brand} fmt={(n) => `${store?.currency || "$"}${n.toLocaleString()}`} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 5: NEON (Pro)
// ════════════════════════════════════════════════════════════════════════════
function NeonTemplate(p: TemplateProps) {
  const { store, products, slug, category, setCategory, categories } = p;
  const brand = store?.primaryColor || "#a855f7";
  return (
    <div className="min-h-screen" style={{ background: "#050508" }}>
      <nav className="sticky top-0 z-40 border-b" style={{ background: "rgba(5,5,8,0.95)", backdropFilter: "blur(20px)", borderColor: `${brand}30` }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-black text-xl" style={{ color: brand, textShadow: `0 0 20px ${brand}` }}>{store.name}</span>
          <button onClick={() => useCartStore.getState().toggleCart()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border" style={{ color: brand, borderColor: `${brand}50`, background: `${brand}10`, boxShadow: `0 0 12px ${brand}20` }}>
            <ShoppingBag size={15} /> Cart ({0})
          </button>
        </div>
      </nav>
      <section className="max-w-7xl mx-auto px-6 py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${brand}20, transparent 60%)` }} />
        <div className="relative z-10">
          <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tight mb-6 text-[var(--text-primary)]" style={{ textShadow: `0 0 60px ${brand}60` }}>
            {store.tagline || store.name}
          </h1>
          <p className="text-[var(--text-tertiary)] text-xl mb-8 max-w-xl mx-auto">{store.description || "Premium products."}</p>
          <a href="#products" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold border text-[var(--text-primary)]" style={{ borderColor: `${brand}60`, background: `${brand}15`, boxShadow: `0 0 24px ${brand}30` }}>
            Explore <ArrowRight size={15} />
          </a>
        </div>
      </section>
      <section id="products" className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex gap-2 mb-8 flex-wrap">
          {categories.map(cat => <button key={cat} onClick={() => setCategory(cat)} className="px-4 py-1.5 rounded-full text-sm font-bold border transition-all" style={category === cat ? { background: brand, color: "white", borderColor: brand, boxShadow: `0 0 12px ${brand}40` } : { borderColor: `${brand}25`, color: "rgba(255,255,255,0.4)" }}>{cat}</button>)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => <ProductCard key={product.id} product={product} storeSlug={slug} brand={brand} variant="dark" currency={store.currency || "$"} />)}
        </div>
      </section>
      <DarkFooter store={store} slug={slug} brand={brand} />
      <CartDrawer storeSlug={slug} storeId={store?.id || ""} brand={brand} fmt={(n) => `${store?.currency || "$"}${n.toLocaleString()}`} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 6: BOUTIQUE (Pro)
// ════════════════════════════════════════════════════════════════════════════
function BoutiqueTemplate(p: TemplateProps) {
  const { store, products, slug, category, setCategory, categories } = p;
  const brand = store?.primaryColor || "#e879a0";
  return (
    <div className="min-h-screen" style={{ background: "#fdf8f5" }}>
      <nav className="sticky top-0 z-40 border-b" style={{ background: "rgba(253,248,245,0.95)", backdropFilter: "blur(12px)", borderColor: "#f0e6dc" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-black text-xl tracking-tight" style={{ color: "#2d1a0e", fontFamily: "Georgia, serif" }}>{store.name}</span>
          <div className="hidden md:flex gap-8 text-sm font-medium" style={{ color: "#8b6914" }}>
            {categories.slice(0, 4).map(c => <button key={c} onClick={() => setCategory(c)} className="hover:opacity-70 transition-opacity">{c}</button>)}
          </div>
          <button onClick={() => useCartStore.getState().toggleCart()} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-[var(--text-primary)]" style={{ background: brand }}>
            <ShoppingBag size={14} /> Bag ({0})
          </button>
        </div>
      </nav>
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="inline-block text-xs tracking-[0.3em] uppercase px-4 py-1 rounded-full mb-5" style={{ background: `${brand}15`, color: brand }}>{store.name} · New Arrivals</div>
        <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight" style={{ color: "#2d1a0e", fontFamily: "Georgia, serif" }}>{store.tagline || `Discover ${store.name}`}</h1>
        <p className="text-lg mb-8 max-w-md mx-auto leading-relaxed" style={{ color: "#8b6914" }}>{store.description || "Curated with love."}</p>
        <a href="#products" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-[var(--text-primary)] font-bold" style={{ background: brand }}>Shop Collection <ArrowRight size={15} /></a>
      </section>
      <section id="products" className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex gap-2 flex-wrap justify-center mb-8">
          {categories.map(cat => <button key={cat} onClick={() => setCategory(cat)} className="px-5 py-2 rounded-full text-sm font-semibold border transition-all" style={category === cat ? { background: brand, color: "white", borderColor: brand } : { borderColor: "#e0d4cc", color: "#8b6914", background: "transparent" }}>{cat}</button>)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map(product => <ProductCard key={product.id} product={product} storeSlug={slug} brand={brand} variant="boutique" currency={store.currency || "$"} />)}
        </div>
      </section>
      <LightFooter store={store} slug={slug} brand={brand} />
      <CartDrawer storeSlug={slug} storeId={store?.id || ""} brand={brand} fmt={(n) => `${store?.currency || "$"}${n.toLocaleString()}`} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 7: MINIMAL PRO (Pro)
// ════════════════════════════════════════════════════════════════════════════
function MinimalProTemplate(p: TemplateProps) {
  const { store, products, slug, category, setCategory, categories } = p;
  const brand = store?.primaryColor || "#111";
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-sm font-black tracking-widest uppercase text-slate-900">{store.name}</span>
          <div className="hidden md:flex gap-8 text-xs font-medium tracking-widest uppercase text-slate-400">
            {categories.slice(0, 4).map(c => <button key={c} onClick={() => setCategory(c)} className="hover:text-slate-900 transition-colors">{c}</button>)}
          </div>
          <button onClick={() => useCartStore.getState().toggleCart()} className="text-xs font-medium tracking-widest uppercase text-slate-600 flex items-center gap-2">
            <ShoppingBag size={14} /> ({0})
          </button>
        </div>
      </nav>
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-xs tracking-[0.4em] uppercase text-slate-400 mb-4">{store.name}</div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight max-w-md mb-8">{store.tagline || "New Collection"}</h1>
        <a href="#products" className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-[var(--text-primary)] px-8 py-3 hover:opacity-80 transition-opacity" style={{ background: brand }}>
          Shop Now <ArrowRight size={13} />
        </a>
      </section>
      <section id="products" className="max-w-5xl mx-auto px-6 pb-20">
        <div className="h-px bg-slate-100 mb-12" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
          {products.map(product => <ProductCard key={product.id} product={product} storeSlug={slug} brand={brand} variant="minimal" currency={store.currency || "$"} />)}
        </div>
      </section>
      <LightFooter store={store} slug={slug} brand={brand} />
      <CartDrawer storeSlug={slug} storeId={store?.id || ""} brand={brand} fmt={(n) => `${store?.currency || "$"}${n.toLocaleString()}`} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 8: GLASSMORPHIC (Advanced)
// ════════════════════════════════════════════════════════════════════════════
function GlassmorphicTemplate(p: TemplateProps) {
  const { store, products, slug, category, setCategory, categories } = p;
  const brand = store?.primaryColor || "#6366f1";
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: brand }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl" style={{ background: "#ec4899" }} />
      </div>
      <nav className="sticky top-0 z-40 border-b" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-black text-[var(--text-primary)] text-lg">{store.name}</span>
          <button onClick={() => useCartStore.getState().toggleCart()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border text-[var(--text-primary)]" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
            <ShoppingBag size={14} /> Cart ({0})
          </button>
        </div>
      </nav>
      <section className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10">
        <h1 className="text-6xl font-black text-[var(--text-primary)] leading-tight tracking-tight mb-5">{store.tagline || store.name}</h1>
        <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-md mx-auto">{store.description || "Premium products."}</p>
        <a href="#products" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-[var(--text-primary)] border" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", borderColor: "rgba(255,255,255,0.2)" }}>
          View Collection <ArrowRight size={15} />
        </a>
      </section>
      <section id="products" className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map(cat => <button key={cat} onClick={() => setCategory(cat)} className="px-4 py-1.5 rounded-full text-sm font-semibold border transition-all" style={category === cat ? { background: `${brand}40`, color: "white", borderColor: `${brand}80`, backdropFilter: "blur(8px)" } : { borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>{cat}</button>)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => <ProductCard key={product.id} product={product} storeSlug={slug} brand={brand} variant="glass" currency={store.currency || "$"} />)}
        </div>
      </section>
      <DarkFooter store={store} slug={slug} brand={brand} />
      <CartDrawer storeSlug={slug} storeId={store?.id || ""} brand={brand} fmt={(n) => `${store?.currency || "$"}${n.toLocaleString()}`} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 9: VINTAGE (Advanced)
// ════════════════════════════════════════════════════════════════════════════
function VintageTemplate(p: TemplateProps) {
  const { store, products, slug, category, setCategory, categories } = p;
  const brand = "#8b6914";
  return (
    <div className="min-h-screen" style={{ background: "#fdf6ed", fontFamily: "Georgia, serif" }}>
      <nav className="sticky top-0 z-40 border-b-2" style={{ background: "#fdf6ed", borderColor: "#2d1a0e" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-2xl tracking-tight" style={{ color: "#2d1a0e" }}>{store.name}</span>
          <button onClick={() => useCartStore.getState().toggleCart()} className="flex items-center gap-2 px-5 py-2 text-sm font-bold" style={{ background: "#2d1a0e", color: "#fdf6ed", borderRadius: "4px" }}>
            <ShoppingBag size={14} /> Cart ({0})
          </button>
        </div>
      </nav>
      <section className="max-w-7xl mx-auto px-6 py-16 text-center border-b-2" style={{ borderColor: "#2d1a0e" }}>
        <div className="text-xs tracking-[0.4em] uppercase mb-4" style={{ color: brand }}>Est. {new Date().getFullYear()}</div>
        <h1 className="text-5xl font-bold leading-tight mb-4" style={{ color: "#2d1a0e" }}>{store.tagline || store.name}</h1>
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px flex-1 max-w-24" style={{ background: "#2d1a0e" }} />
          <span className="text-xs tracking-widest uppercase" style={{ color: brand }}>Collection</span>
          <div className="h-px flex-1 max-w-24" style={{ background: "#2d1a0e" }} />
        </div>
        <a href="#products" className="inline-flex items-center gap-2 px-7 py-3 text-sm font-bold tracking-widest uppercase" style={{ background: "#2d1a0e", color: "#fdf6ed" }}>
          Browse <ArrowRight size={13} />
        </a>
      </section>
      <section id="products" className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex gap-3 flex-wrap mb-8 justify-center">
          {categories.map(cat => <button key={cat} onClick={() => setCategory(cat)} className="px-5 py-2 text-sm border-2 tracking-widest uppercase transition-all" style={category === cat ? { background: "#2d1a0e", color: "#fdf6ed", borderColor: "#2d1a0e" } : { borderColor: "#2d1a0e", color: "#2d1a0e", background: "transparent" }}>{cat}</button>)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => <ProductCard key={product.id} product={product} storeSlug={slug} brand={brand} variant="vintage" currency={store.currency || "$"} />)}
        </div>
      </section>
      <LightFooter store={store} slug={slug} brand={brand} />
      <CartDrawer storeSlug={slug} storeId={store?.id || ""} brand={brand} fmt={(n) => `${store?.currency || "$"}${n.toLocaleString()}`} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 10: ULTRA DARK (Advanced)
// ════════════════════════════════════════════════════════════════════════════
function UltraDarkTemplate(p: TemplateProps) {
  const { store, products, slug, category, setCategory, categories } = p;
  const brand = store?.primaryColor || "#f0f0f0";
  return (
    <div className="min-h-screen" style={{ background: "#030303" }}>
      <nav className="sticky top-0 z-40 border-b" style={{ background: "#030303", borderColor: "#1a1a1a" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-black text-[var(--text-primary)] text-lg tracking-tighter">{store.name}</span>
          <button onClick={() => useCartStore.getState().toggleCart()} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[var(--text-primary)] border" style={{ borderColor: "#333" }}>
            <ShoppingBag size={14} /> {0}
          </button>
        </div>
      </nav>
      <section className="max-w-7xl mx-auto px-6 py-28">
        <div className="h-px w-16 mb-8" style={{ background: "#333" }} />
        <h1 className="text-6xl md:text-8xl font-black text-[var(--text-primary)] leading-none tracking-tighter mb-8">{store.tagline || store.name}</h1>
        <p className="text-white/25 text-lg max-w-sm mb-8 leading-relaxed">{store.description || "Curated products."}</p>
        <a href="#products" className="inline-flex items-center gap-2 px-7 py-3 text-sm font-bold text-black bg-white hover:opacity-80 transition-opacity">
          Shop <ArrowRight size={14} />
        </a>
      </section>
      <section id="products" className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex gap-4 flex-wrap mb-8">
          {categories.map(cat => <button key={cat} onClick={() => setCategory(cat)} className="text-sm font-semibold transition-all pb-1 border-b" style={category === cat ? { color: "white", borderColor: "white" } : { color: "rgba(255,255,255,0.2)", borderColor: "transparent" }}>{cat}</button>)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map(product => <ProductCard key={product.id} product={product} storeSlug={slug} brand="white" variant="dark" currency={store.currency || "$"} />)}
        </div>
      </section>
      <DarkFooter store={store} slug={slug} brand="white" />
      <CartDrawer storeSlug={slug} storeId={store?.id || ""} brand="white" fmt={(n) => `${store?.currency || "$"}${n.toLocaleString()}`} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  REMAINING TEMPLATES: Grid, Magazine, Split, Runway → reuse base components
// ════════════════════════════════════════════════════════════════════════════
function GridTemplate(p: TemplateProps) {
  const { store, products, slug, category, setCategory, categories } = p;
  const brand = store?.primaryColor || "#0ea5e9";
  return (
    <div className="min-h-screen bg-white">
      <LightNav store={store} slug={slug} brand={brand} search={p.search} setSearch={p.setSearch} />
      <section className="py-12 px-6 text-center" style={{ background: `${brand}08` }}>
        <h1 className="text-4xl font-black text-slate-900 mb-2">{store.tagline || store.name}</h1>
        <p className="text-slate-500">{store.description || "Browse our full collection."}</p>
      </section>
      <section id="products" className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {categories.map(cat => <button key={cat} onClick={() => setCategory(cat)} className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all" style={category === cat ? { background: brand, color: "white" } : { background: "#f1f5f9", color: "#64748b" }}>{cat}</button>)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.map(product => <ProductCard key={product.id} product={product} storeSlug={slug} brand={brand} variant="minimal" currency={store.currency || "$"} />)}
        </div>
      </section>
      <LightFooter store={store} slug={slug} brand={brand} />
      <CartDrawer storeSlug={slug} storeId={store?.id || ""} brand={brand} fmt={(n) => `${store?.currency || "$"}${n.toLocaleString()}`} />
    </div>
  );
}

function MagazineTemplate(p: TemplateProps) { return <EditorialTemplate {...p} />; }

function SplitTemplate(p: TemplateProps) {
  const _defaultFmt = useCurrencyStore(s => s.format);
  const defaultFmt = (n: number) => _defaultFmt(n, p.store?.currency || "USD");
  const { store, products, slug, category, setCategory, categories } = p;
  const brand = store?.primaryColor || "#1a1a2e";
  const featured = products[0];
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-black text-slate-900 text-lg">{store.name}</span>
          <button onClick={() => useCartStore.getState().toggleCart()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[var(--text-primary)]" style={{ background: brand }}>
            <ShoppingBag size={14} /> Cart ({0})
          </button>
        </div>
      </nav>
      {featured && (
        <section className="grid md:grid-cols-2 min-h-[60vh]">
          <div className="flex flex-col justify-center px-12 py-16" style={{ background: brand }}>
            <div className="text-xs tracking-[0.3em] uppercase mb-4 text-[var(--text-secondary)]">Featured</div>
            <h1 className="text-5xl font-black text-[var(--text-primary)] leading-tight mb-4">{featured.name}</h1>
            <div className="text-3xl font-black text-[var(--text-primary)] mb-6">{defaultFmt(featured.price ?? 0)}</div>
            <Link href={`/store/${slug}/product/${featured.id}`} className="inline-flex items-center gap-2 px-7 py-3 bg-white font-bold text-sm w-fit" style={{ color: brand }}>
              Shop Now <ArrowRight size={14} />
            </Link>
          </div>
          <div className="bg-slate-100 overflow-hidden">
            {featured.images?.[0] ? <img src={featured.images[0]} alt={featured.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={56} className="text-slate-300" /></div>}
          </div>
        </section>
      )}
      <section id="products" className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.slice(1).map(product => <ProductCard key={product.id} product={product} storeSlug={slug} brand={brand} variant="classic" currency={store.currency || "$"} />)}
        </div>
      </section>
      <LightFooter store={store} slug={slug} brand={brand} />
      <CartDrawer storeSlug={slug} storeId={store?.id || ""} brand={brand} fmt={(n) => `${store?.currency || "$"}${n.toLocaleString()}`} />
    </div>
  );
}

function RunwayTemplate(p: TemplateProps) {
  const _fmtR = useCurrencyStore(s => s.format);
  const fmtR = (n: number) => _fmtR(n, p.store?.currency || "USD");
  const { store, products, slug } = p;
  const brand = store?.primaryColor || "#7C3AED";
  const hero = products[0];
  return (
    <div className="min-h-screen bg-black text-[var(--text-primary)]">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5">
        <span className="font-black text-[var(--text-primary)] text-xl tracking-tight">{store.name}</span>
        <button onClick={() => useCartStore.getState().toggleCart()} className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Bag ({0})</button>
      </nav>
      {hero && hero.images?.[0] && (
        <section className="relative h-screen flex items-end overflow-hidden">
          <img src={hero.images[0]} alt={hero.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)" }} />
          <div className="relative z-10 px-8 pb-16 max-w-xl">
            <div className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: brand }}>{store.name}</div>
            <h1 className="text-5xl font-black leading-tight mb-4">{hero.name}</h1>
            <div className="text-2xl font-bold text-[var(--text-secondary)] mb-6">{fmtR(hero.price ?? 0)}</div>
            <Link href={`/store/${slug}/product/${hero.id}`} className="inline-flex items-center gap-2 px-8 py-3.5 font-bold text-black" style={{ background: brand }}>
              Shop Now <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}
      <section id="products" className="px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.slice(hero ? 1 : 0).map(product => <ProductCard key={product.id} product={product} storeSlug={slug} brand={brand} variant="dark" currency={store.currency || "$"} />)}
        </div>
      </section>
      <DarkFooter store={store} slug={slug} brand={brand} />
      <CartDrawer storeSlug={slug} storeId={store?.id || ""} brand={brand} fmt={(n) => `${store?.currency || "$"}${n.toLocaleString()}`} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT: renders the correct template
// ════════════════════════════════════════════════════════════════════════════
const TEMPLATE_MAP: Record<string, (p: TemplateProps) => JSX.Element> = {
  "classic":       ClassicTemplate,
  "dark-luxe":     DarkLuxeTemplate,
  "bold":          BoldTemplate,
  "editorial":     EditorialTemplate,
  "neon":          NeonTemplate,
  "boutique":      BoutiqueTemplate,
  "minimal-pro":   MinimalProTemplate,
  "grid":          GridTemplate,
  "magazine":      MagazineTemplate,
  "split":         SplitTemplate,
  "glassmorphic":  GlassmorphicTemplate,
  "vintage":       VintageTemplate,
  "ultra-dark":    UltraDarkTemplate,
  "runway":        RunwayTemplate,
};

export function TemplateRenderer(props: TemplateProps) {
  const theme     = props.store?.theme || "classic";
  const Component = TEMPLATE_MAP[theme] || ClassicTemplate;
  return (
    <>
      <Component {...props} />
      <AbandonedCartTracker store={props.store} exitDiscount={10} idleMinutes={30} />
    </>
  );
}