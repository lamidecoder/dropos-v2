"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Search, Heart, Package, Star, Truck, Shield,
  RotateCcw, ArrowRight, Menu, X, ChevronDown, Instagram,
  Play, Zap, Clock, TrendingUp, ChevronLeft, ChevronRight
} from "lucide-react";
import { useCartStore } from "../../../store/cart.store";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface TemplateProps {
  store: any; products?: any[]; slug?: string;
  search?: string; onSearch?: (q: string) => void;
  category?: string; onCategory?: (c: string) => void;
  categories?: string[]; sort?: string; onSort?: (s: string) => void;
  isLoading?: boolean; flashSales?: any[];
  [key: string]: any;
}

// ── Utilities ──────────────────────────────────────────────────────────────────
const fmtPrice = (n: number, currency = "NGN") => {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(n || 0);
  } catch { return `₦${(n || 0).toLocaleString()}`; }
};

function useWindowSize() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

// ── Shared: Cart ──────────────────────────────────────────────────────────────
function useCart(storeId: string, currency: string) {
  const addItem  = useCartStore(s => s.addItem);
  const items    = useCartStore(s => s.items);
  const _total   = useCartStore(s => s.total);
  const total    = typeof _total === "function" ? _total() : (_total as any);
  const isOpen   = useCartStore(s => s.isOpen);
  const toggle   = useCartStore(s => s.toggleCart);
  const count    = items.reduce((a, i) => a + i.quantity, 0);

  const add = (p: any) => {
    addItem({ productId: p.id, name: p.name, price: p.price, image: p.images?.[0], storeId, quantity: 1 } as any);
  };

  return { add, items, total, isOpen, toggle, count };
}

// ── Shared: Product Card variants ────────────────────────────────────────────

type CardVariant = "default" | "minimal" | "dark" | "boutique" | "editorial" | "glassmorphic";

function ProductCard({
  p, store, variant = "default", brand, currency
}: { p: any; store: any; variant?: CardVariant; brand: string; currency: string }) {
  const { add } = useCart(store.id, currency);
  const [wish, setWish] = useState(false);
  const [added, setAdded] = useState(false);
  const [hover, setHover] = useState(false);

  const img  = p.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop";
  const img2 = p.images?.[1] || img;
  const fmt  = (n: number) => fmtPrice(n, currency);
  const disc = p.comparePrice && p.comparePrice > p.price ? Math.round((1 - p.price / p.comparePrice) * 100) : 0;
  const slug = store.slug;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    add(p); setAdded(true); setTimeout(() => setAdded(false), 1600);
  };

  if (variant === "minimal") return (
    <Link href={`/store/${slug}/product/${p.id}`} style={{ textDecoration: "none", display: "block" }}>
      <motion.div whileHover={{ y: -2 }} style={{ cursor: "pointer" }}>
        <div style={{ aspectRatio: "1", overflow: "hidden", borderRadius: 4, background: "#f5f5f5", marginBottom: 12, position: "relative" }}>
          <img src={hover ? img2 : img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.4s" }}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} />
          {disc > 0 && <span style={{ position: "absolute", top: 8, left: 8, background: "#111", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 2 }}>-{disc}%</span>}
        </div>
        <p style={{ fontSize: 13, color: "#888", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.category || store.name}</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#111", margin: "0 0 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#111" }}>{fmt(p.price)}</span>
            {p.comparePrice && <span style={{ fontSize: 12, color: "#bbb", textDecoration: "line-through", marginLeft: 6 }}>{fmt(p.comparePrice)}</span>}
          </div>
          <button onClick={handleAdd} style={{ padding: "5px 12px", borderRadius: 4, border: `1px solid #111`, background: added ? "#111" : "transparent", color: added ? "#fff" : "#111", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>
            {added ? "✓" : "+ CART"}
          </button>
        </div>
      </motion.div>
    </Link>
  );

  if (variant === "dark") return (
    <Link href={`/store/${slug}/product/${p.id}`} style={{ textDecoration: "none" }}>
      <motion.div whileHover={{ scale: 1.02 }} style={{ borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>
        <div style={{ aspectRatio: "1", overflow: "hidden", position: "relative" }}>
          <img src={hover ? img2 : img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} />
          {disc > 0 && <span style={{ position: "absolute", top: 10, left: 10, background: brand, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99 }}>-{disc}%</span>}
          <button onClick={handleAdd} style={{ position: "absolute", bottom: 10, right: 10, width: 36, height: 36, borderRadius: "50%", background: brand, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }}>
            <ShoppingCart size={14} color="#fff" />
          </button>
        </div>
        <div style={{ padding: "12px 14px 14px" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>{p.name}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{fmt(p.price)}</span>
            {p.comparePrice && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "line-through" }}>{fmt(p.comparePrice)}</span>}
          </div>
        </div>
      </motion.div>
    </Link>
  );

  if (variant === "boutique") return (
    <Link href={`/store/${slug}/product/${p.id}`} style={{ textDecoration: "none" }}>
      <motion.div whileHover={{ y: -4 }} style={{ cursor: "pointer" }}>
        <div style={{ aspectRatio: "3/4", overflow: "hidden", borderRadius: 2, background: "#f0ece6", marginBottom: 14, position: "relative" }}>
          <img src={hover ? img2 : img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "all 0.5s" }}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 16px", opacity: hover ? 1 : 0, transition: "opacity 0.3s" }}>
            <button onClick={handleAdd} style={{ padding: "10px 24px", background: "rgba(255,255,255,0.95)", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", fontFamily: "inherit" }}>
              {added ? "ADDED ✓" : "ADD TO BAG"}
            </button>
          </div>
        </div>
        <p style={{ fontSize: 11, color: "#999", margin: "0 0 4px", letterSpacing: "0.08em", textTransform: "uppercase" as const, fontFamily: "inherit" }}>{p.category || ""}</p>
        <p style={{ fontSize: 15, color: "#1a1a1a", margin: "0 0 6px", lineHeight: 1.3 }}>{p.name}</p>
        <p style={{ fontSize: 15, color: "#1a1a1a" }}>{fmt(p.price)}</p>
      </motion.div>
    </Link>
  );

  if (variant === "editorial") return (
    <Link href={`/store/${slug}/product/${p.id}`} style={{ textDecoration: "none" }}>
      <motion.div whileHover={{ y: -3 }} style={{ cursor: "pointer" }}>
        <div style={{ aspectRatio: "4/5", overflow: "hidden", marginBottom: 12, position: "relative", background: "#f8f8f8" }}>
          <img src={hover ? img2 : img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s", transform: hover ? "scale(1.06)" : "scale(1)" }}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} />
          {disc > 0 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "8px 12px", background: brand, color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textAlign: "center" }}>SAVE {disc}%</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: "0 0 3px", maxWidth: "80%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
            <p style={{ fontSize: 13, color: "#666", margin: 0 }}>{fmt(p.price)}</p>
          </div>
          <button onClick={handleAdd} style={{ width: 34, height: 34, borderRadius: "50%", background: added ? brand : "#f0f0f0", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
            <ShoppingCart size={13} color={added ? "#fff" : "#333"} />
          </button>
        </div>
      </motion.div>
    </Link>
  );

  if (variant === "glassmorphic") return (
    <Link href={`/store/${slug}/product/${p.id}`} style={{ textDecoration: "none" }}>
      <motion.div whileHover={{ scale: 1.03, y: -4 }} style={{ borderRadius: 20, overflow: "hidden", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}>
        <div style={{ aspectRatio: "1", overflow: "hidden", position: "relative" }}>
          <img src={img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)" }} />
          <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: "0 0 2px", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{p.name}</p>
              <p style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{fmt(p.price)}</p>
            </div>
            <button onClick={handleAdd} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {added ? <span style={{ fontSize: 14, color: "#fff" }}>✓</span> : <ShoppingCart size={14} color="#fff" />}
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );

  // Default classic card
  return (
    <Link href={`/store/${slug}/product/${p.id}`} style={{ textDecoration: "none" }}>
      <motion.div whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}
        style={{ borderRadius: 16, overflow: "hidden", background: "#fff", border: "1px solid #f0f0f0", cursor: "pointer", transition: "box-shadow 0.2s" }}>
        <div style={{ aspectRatio: "1", overflow: "hidden", position: "relative", background: "#f8f8f8" }}>
          <img src={hover ? img2 : img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s", transform: hover ? "scale(1.06)" : "scale(1)" }}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} />
          {disc > 0 && <span style={{ position: "absolute", top: 10, left: 10, background: "#EF4444", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99 }}>-{disc}%</span>}
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); setWish(w => !w); }} style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Heart size={14} fill={wish ? "#EF4444" : "none"} color={wish ? "#EF4444" : "#999"} />
          </button>
          <AnimatePresence>
            {hover && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                style={{ position: "absolute", bottom: 10, left: 10, right: 10 }}>
                <button onClick={handleAdd} style={{ width: "100%", padding: "10px 0", borderRadius: 10, background: added ? brand : "rgba(255,255,255,0.95)", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: added ? "#fff" : "#111", transition: "all 0.2s", fontFamily: "inherit" }}>
                  {added ? "✓ Added!" : "+ Add to cart"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div style={{ padding: "12px 14px 14px" }}>
          <p style={{ fontSize: 12, color: "#888", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.category || store.name}</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: "0 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 900, color: "#111", margin: 0 }}>{fmt(p.price)}</p>
              {p.comparePrice && <p style={{ fontSize: 11, color: "#bbb", textDecoration: "line-through", margin: 0 }}>{fmt(p.comparePrice)}</p>}
            </div>
            {p.inventory !== undefined && p.inventory < 10 && p.inventory > 0 && (
              <span style={{ fontSize: 10, color: "#F59E0B", fontWeight: 700 }}>Only {p.inventory} left</span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ── Shared: Sticky Nav ────────────────────────────────────────────────────────
function StoreNav({ store, brand, dark, count, toggle, search, onSearch }: any) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const bg = dark
    ? scrolled ? "rgba(7,5,15,0.97)" : "rgba(7,5,15,0.8)"
    : scrolled ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.85)";
  const text = dark ? "#fff" : "#111";
  const border = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(16px)", background: bg, borderBottom: `1px solid ${border}`, transition: "background 0.3s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,32px)", height: 60, display: "flex", alignItems: "center", gap: 16 }}>
        <Link href={`/store/${store.slug}`} style={{ fontWeight: 900, fontSize: "clamp(16px,3vw,20px)", letterSpacing: "-0.04em", color: brand, textDecoration: "none", flexShrink: 0 }}>
          {store.name}
        </Link>
        <div style={{ flex: 1, maxWidth: 360, display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 12, background: dark ? "rgba(255,255,255,0.06)" : "#f5f5f5", border: `1px solid ${border}` }}>
          <Search size={13} style={{ color: dark ? "rgba(255,255,255,0.4)" : "#888", flexShrink: 0 }} />
          <input value={search || ""} onChange={e => onSearch?.(e.target.value)} placeholder="Search products..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: text, fontFamily: "inherit" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
          <button onClick={toggle} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
            <ShoppingCart size={22} color={text} />
            {count > 0 && <span style={{ position: "absolute", top: -6, right: -6, width: 17, height: 17, borderRadius: "50%", background: brand, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{count}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Shared: Cart Drawer ───────────────────────────────────────────────────────
function CartDrawer({ store, brand, currency }: any) {
  const { items, total, isOpen, toggle } = useCart(store.id, currency);
  const fmt = (n: number) => fmtPrice(n, currency);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={toggle} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100 }} />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(400px,100vw)", background: "#fff", zIndex: 101, display: "flex", flexDirection: "column", boxShadow: "-8px 0 32px rgba(0,0,0,0.12)" }}>
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111", margin: 0 }}>Your Cart ({items.reduce((a,i)=>a+i.quantity,0)})</h2>
              <button onClick={toggle} style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}><X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              {items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <ShoppingCart size={40} style={{ color: "#ddd", margin: "0 auto 12px" }} />
                  <p style={{ color: "#999", fontSize: 14 }}>Your cart is empty</p>
                </div>
              ) : items.map(item => (
                <div key={`${item.productId}-${item.variantId}`} style={{ display: "flex", gap: 12, marginBottom: 16, padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                  {item.image && <img src={item.image} alt={item.name} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#111", margin: "0 0 4px" }}>{item.name}</p>
                    <p style={{ fontSize: 13, color: "#888", margin: 0 }}>Qty: {item.quantity} · {fmt(item.price)}</p>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{fmt(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            {items.length > 0 && (
              <div style={{ padding: 20, borderTop: "1px solid #f0f0f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "#111" }}>{fmt(total)}</span>
                </div>
                <Link href={`/store/${store.slug}/checkout`}
                  style={{ display: "block", width: "100%", padding: "14px 0", borderRadius: 14, background: `linear-gradient(135deg,${brand},${brand}cc)`, color: "#fff", fontSize: 15, fontWeight: 800, textAlign: "center", textDecoration: "none" }}>
                  Checkout →
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Shared: Trust Bar ─────────────────────────────────────────────────────────
function TrustBar({ brand, dark }: { brand: string; dark?: boolean }) {
  const items = [
    { icon: "🚚", label: "Free Delivery", sub: "Orders over ₦15k" },
    { icon: "🔒", label: "Secure Checkout", sub: "Paystack protected" },
    { icon: "↩️", label: "Easy Returns", sub: "7-day policy" },
    { icon: "⭐", label: "5-Star Service", sub: "1,000+ reviews" },
  ];
  const bg     = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const border = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const text   = dark ? "rgba(255,255,255,0.85)" : "#222";
  const sub    = dark ? "rgba(255,255,255,0.4)" : "#888";

  return (
    <div style={{ background: bg, borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px clamp(16px,4vw,32px)", display: "flex", gap: "clamp(16px,4vw,40px)", justifyContent: "center", flexWrap: "wrap" }}>
        {items.map(i => (
          <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{i.icon}</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: text, margin: 0 }}>{i.label}</p>
              <p style={{ fontSize: 11, color: sub, margin: 0 }}>{i.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Shared: Newsletter ────────────────────────────────────────────────────────
function Newsletter({ brand, dark }: { brand: string; dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [done,  setDone]  = useState(false);
  const bg   = dark ? "rgba(255,255,255,0.04)" : "#f7f5ff";
  const text = dark ? "#fff" : "#111";
  const sub  = dark ? "rgba(255,255,255,0.5)" : "#666";

  return (
    <div style={{ background: bg, padding: "clamp(40px,8vw,72px) clamp(16px,4vw,32px)" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 900, color: text, margin: "0 0 8px", letterSpacing: "-0.03em" }}>Get 10% off your first order</p>
        <p style={{ fontSize: 15, color: sub, margin: "0 0 24px" }}>Subscribe for exclusive deals, new arrivals, and style inspiration.</p>
        {done ? (
          <p style={{ fontSize: 15, fontWeight: 700, color: brand }}>🎉 Thanks! Check your inbox for your discount code.</p>
        ) : (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email"
              style={{ flex: "1 1 220px", padding: "12px 16px", borderRadius: 12, border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#ddd"}`, background: dark ? "rgba(255,255,255,0.06)" : "#fff", color: text, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
            <button onClick={() => email && setDone(true)}
              style={{ padding: "12px 24px", borderRadius: 12, background: `linear-gradient(135deg,${brand},${brand}cc)`, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", flexShrink: 0, fontFamily: "inherit" }}>
              Subscribe
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared: Footer ────────────────────────────────────────────────────────────
function StoreFooter({ store, brand, dark }: any) {
  const text   = dark ? "rgba(255,255,255,0.85)" : "#111";
  const muted  = dark ? "rgba(255,255,255,0.35)" : "#888";
  const border = dark ? "rgba(255,255,255,0.08)" : "#f0f0f0";

  return (
    <footer style={{ borderTop: `1px solid ${border}`, padding: "clamp(32px,6vw,56px) clamp(16px,4vw,32px) clamp(20px,4vw,32px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "clamp(24px,4vw,48px)", marginBottom: 40 }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 900, color: brand, margin: "0 0 10px", letterSpacing: "-0.03em" }}>{store.name}</p>
            <p style={{ fontSize: 13, color: muted, lineHeight: 1.6, margin: 0 }}>{store.description || "Quality products, fast delivery across Nigeria."}</p>
          </div>
          {[
            { title: "Shop", links: ["All Products", "New Arrivals", "Best Sellers", "Sale"] },
            { title: "Help", links: ["Track Order", "Returns", "Shipping Info", "Contact Us"] },
            { title: "Company", links: ["About Us", "Blog", "Careers", "Privacy Policy"] },
          ].map(col => (
            <div key={col.title}>
              <p style={{ fontSize: 12, fontWeight: 700, color: text, margin: "0 0 12px", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{col.title}</p>
              {col.links.map(l => (
                <p key={l} style={{ fontSize: 13, color: muted, margin: "0 0 8px", cursor: "pointer" }}>{l}</p>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${border}`, paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 12, color: muted, margin: 0 }}>© {new Date().getFullYear()} {store.name}. Powered by DropOS.</p>
          <div style={{ display: "flex", gap: 8 }}>
            {["💳", "🏦", "📱"].map((icon, i) => (
              <span key={i} style={{ fontSize: 18, opacity: 0.6 }}>{icon}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Shared: Product Grid ──────────────────────────────────────────────────────
function ProductGrid({ products, store, brand, currency, variant, cols = "auto-fill,minmax(200px,1fr)", gap = 16 }: any) {
  if (!products?.length) return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <Package size={40} style={{ color: "#ccc", margin: "0 auto 12px" }} />
      <p style={{ color: "#999", fontSize: 14, margin: 0 }}>No products yet. Check back soon!</p>
    </div>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols})`, gap }}>
      {products.map((p: any) => (
        <ProductCard key={p.id} p={p} store={store} brand={brand} currency={currency} variant={variant} />
      ))}
    </div>
  );
}

// ── Shared: Section header ────────────────────────────────────────────────────
function SectionHead({ title, sub, action, dark, center = true }: any) {
  const text = dark ? "#fff" : "#111";
  const muted = dark ? "rgba(255,255,255,0.4)" : "#888";
  return (
    <div style={{ textAlign: center ? "center" : "left", marginBottom: "clamp(24px,4vw,40px)" }}>
      {sub && <p style={{ fontSize: 12, fontWeight: 700, color: "#8B5CF6", margin: "0 0 6px", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>{sub}</p>}
      <div style={{ display: "flex", alignItems: center ? "center" : "flex-start", justifyContent: center ? "center" : "space-between", gap: 16, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, color: text, margin: 0, letterSpacing: "-0.04em" }}>{title}</h2>
        {action && <a href={action.href} style={{ fontSize: 13, fontWeight: 700, color: "#8B5CF6", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" as const }}>
          {action.label} <ArrowRight size={13} />
        </a>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 1: AURORA — Premium classic with scroll animations
// ══════════════════════════════════════════════════════════════════════════════
function AuroraTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], sort, onSort, isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#6B35E8";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);
  const w = useWindowSize();

  const hero_products = products.slice(0, 3);
  const featured      = products.slice(0, 8);

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'Inter','Plus Jakarta Sans',system-ui" }}>
      <StoreNav store={store} brand={brand} dark={false} count={count} toggle={toggle} search={search} onSearch={onSearch} />

      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg,#f8f5ff 0%,#f0eaff 50%,#e8f0ff 100%)`, padding: "clamp(48px,10vw,96px) clamp(16px,4vw,32px)", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "50vw", height: "50vw", borderRadius: "50%", background: `radial-gradient(circle,${brand}15,transparent 60%)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: w > 768 ? "1fr 1fr" : "1fr", gap: "clamp(32px,6vw,64px)", alignItems: "center" }}>
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: brand, textTransform: "uppercase" as const, letterSpacing: "0.12em", marginBottom: 12 }}>New Collection</p>
            <h1 style={{ fontSize: "clamp(36px,6vw,64px)", fontWeight: 900, color: "#111", letterSpacing: "-0.04em", lineHeight: 1.0, margin: "0 0 20px" }}>
              {store.name}<br /><span style={{ color: brand }}>Store</span>
            </h1>
            <p style={{ fontSize: "clamp(15px,2vw,18px)", color: "#666", lineHeight: 1.7, margin: "0 0 32px", maxWidth: 480 }}>
              {store.description || "Discover premium products crafted with quality and care. Fast delivery across Nigeria."}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="#products" style={{ padding: "14px 28px", borderRadius: 14, background: `linear-gradient(135deg,${brand},${brand}cc)`, color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: `0 8px 24px ${brand}40` }}>
                Shop Now →
              </Link>
              <Link href="#collections" style={{ padding: "14px 28px", borderRadius: 14, border: "2px solid rgba(0,0,0,0.1)", color: "#333", fontSize: 15, fontWeight: 600, textDecoration: "none", background: "rgba(255,255,255,0.8)" }}>
                Browse Categories
              </Link>
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 32, flexWrap: "wrap" }}>
              {[["500+", "Products"], ["10K+", "Happy Customers"], ["4.9★", "Rating"]].map(([num, label]) => (
                <div key={label}>
                  <p style={{ fontSize: 22, fontWeight: 900, color: "#111", margin: 0 }}>{num}</p>
                  <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {w > 768 && hero_products.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 12, height: 420 }}>
              {hero_products[0] && (
                <Link href={`/store/${store.slug}/product/${hero_products[0].id}`} style={{ gridColumn: "1", gridRow: "1 / 3", borderRadius: 20, overflow: "hidden", textDecoration: "none" }}>
                  <img src={hero_products[0].images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=600&fit=crop"} alt={hero_products[0].name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </Link>
              )}
              {hero_products.slice(1, 3).map((p: any) => (
                <Link key={p.id} href={`/store/${store.slug}/product/${p.id}`} style={{ borderRadius: 16, overflow: "hidden", textDecoration: "none" }}>
                  <img src={p.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop"} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <TrustBar brand={brand} />

      {/* Categories */}
      {categories.filter(c => c !== "All").length > 0 && (
        <div id="collections" style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(40px,6vw,64px) clamp(16px,4vw,32px)" }}>
          <SectionHead title="Shop by Category" sub="Browse" />
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
            {categories.map(c => (
              <button key={c} onClick={() => onCategory?.(c)}
                style={{ padding: "10px 20px", borderRadius: 12, border: `2px solid ${category === c ? brand : "rgba(0,0,0,0.08)"}`, background: category === c ? `${brand}10` : "#fff", color: category === c ? brand : "#333", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const, flexShrink: 0, fontFamily: "inherit" }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div id="products" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,32px) clamp(48px,8vw,80px)" }}>
        <SectionHead title="Our Collection" sub="Products" action={{ label: "View all", href: "#" }} />
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 16, background: "#f0f0f0", aspectRatio: "1", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : (
          <ProductGrid products={featured} store={store} brand={brand} currency={currency} variant="default" />
        )}
      </div>

      <Newsletter brand={brand} />
      <StoreFooter store={store} brand={brand} />
      <CartDrawer store={store} brand={brand} currency={currency} />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} html{scroll-behavior:smooth}`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 2: OBSIDIAN — Dark luxury cinematic
// ══════════════════════════════════════════════════════════════════════════════
function ObsidianTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#A78BFA";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);

  return (
    <div style={{ minHeight: "100vh", background: "#07050F", fontFamily: "'Inter',system-ui", color: "#fff" }}>
      <StoreNav store={store} brand={brand} dark count={count} toggle={toggle} search={search} onSearch={onSearch} />

      {/* Cinematic hero */}
      <div style={{ position: "relative", height: "clamp(420px,60vh,680px)", display: "flex", alignItems: "center", overflow: "hidden", background: `linear-gradient(135deg,#0d0520,#1a0d3c)` }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 60% 50%,${brand}20,transparent 60%)` }} />
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,32px)", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: brand, textTransform: "uppercase" as const, letterSpacing: "0.2em", marginBottom: 16 }}>Exclusive Collection</p>
          <h1 style={{ fontSize: "clamp(40px,8vw,80px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.92, margin: "0 0 24px", maxWidth: "80vw" }}>
            {store.name}
          </h1>
          <p style={{ fontSize: "clamp(14px,2vw,18px)", color: "rgba(255,255,255,0.5)", maxWidth: 480, lineHeight: 1.7, margin: "0 0 36px" }}>
            {store.description || "Premium products. Delivered with purpose."}
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href="#products" style={{ padding: "14px 32px", borderRadius: 14, background: `linear-gradient(135deg,${brand},${brand}80)`, color: "#fff", fontSize: 14, fontWeight: 800, textDecoration: "none", letterSpacing: "-0.01em", boxShadow: `0 8px 32px ${brand}40` }}>
              Shop Now →
            </Link>
            <Link href="#products" style={{ padding: "14px 32px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              View All
            </Link>
          </div>
        </motion.div>
      </div>

      <TrustBar brand={brand} dark />

      {/* Category pills */}
      {categories.filter(c => c !== "All").length > 0 && (
        <div style={{ maxWidth: 1200, margin: "40px auto 0", padding: "0 clamp(16px,4vw,32px)" }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
            {categories.map(c => (
              <button key={c} onClick={() => onCategory?.(c)}
                style={{ padding: "8px 18px", borderRadius: 99, border: `1px solid ${category === c ? brand : "rgba(255,255,255,0.1)"}`, background: category === c ? `${brand}20` : "transparent", color: category === c ? brand : "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const, flexShrink: 0, fontFamily: "inherit" }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div id="products" style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(40px,6vw,64px) clamp(16px,4vw,32px) clamp(48px,8vw,80px)" }}>
        <SectionHead title="The Collection" dark action={{ label: "See all", href: "#" }} />
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 16, background: "rgba(255,255,255,0.05)", aspectRatio: "1", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : (
          <ProductGrid products={products} store={store} brand={brand} currency={currency} variant="dark" />
        )}
      </div>

      <Newsletter brand={brand} dark />
      <StoreFooter store={store} brand={brand} dark />
      <CartDrawer store={store} brand={brand} currency={currency} />
      <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}} html{scroll-behavior:smooth}`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 3: VERDANT — Minimal Swiss precision
// ══════════════════════════════════════════════════════════════════════════════
function VerdantTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], sort, onSort, isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#111";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
      {/* Ultra-minimal header */}
      <header style={{ borderBottom: "1px solid #eee", position: "sticky", top: 0, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)", zIndex: 50 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.04em", color: "#111", margin: 0 }}>{store.name}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 8, background: "#f5f5f5" }}>
              <Search size={12} style={{ color: "#888" }} />
              <input value={search || ""} onChange={e => onSearch?.(e.target.value)} placeholder="Search"
                style={{ background: "transparent", border: "none", outline: "none", fontSize: 12, color: "#111", width: 120, fontFamily: "inherit" }} />
            </div>
            <button onClick={toggle} style={{ position: "relative", background: "none", border: "none", cursor: "pointer" }}>
              <ShoppingCart size={18} color="#111" />
              {count > 0 && <span style={{ position: "absolute", top: -5, right: -5, width: 14, height: 14, borderRadius: "50%", background: brand, color: "#fff", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{count}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Minimal hero */}
      <div style={{ borderBottom: "1px solid #eee", padding: "clamp(40px,8vw,80px) clamp(16px,4vw,40px)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(40px,8vw,96px)", fontWeight: 900, letterSpacing: "-0.06em", color: "#111", margin: "0 0 16px", lineHeight: 0.9 }}>
            {store.name}
          </h1>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <p style={{ fontSize: "clamp(14px,2vw,18px)", color: "#888", maxWidth: 400, margin: 0, lineHeight: 1.6 }}>
              {store.description || "Thoughtfully made. Carefully chosen."}
            </p>
            <Link href="#products" style={{ padding: "11px 24px", borderRadius: 8, background: "#111", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", letterSpacing: "0.02em" }}>
              SHOP ALL
            </Link>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ borderBottom: "1px solid #eee", padding: "0 clamp(16px,4vw,40px)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 44, overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 0 }}>
            {categories.map(c => (
              <button key={c} onClick={() => onCategory?.(c)}
                style={{ padding: "0 16px", height: 44, border: "none", borderBottom: category === c ? "2px solid #111" : "2px solid transparent", background: "transparent", fontSize: 12, fontWeight: category === c ? 700 : 400, color: category === c ? "#111" : "#888", cursor: "pointer", letterSpacing: "0.04em", fontFamily: "inherit", whiteSpace: "nowrap" as const }}>
                {c.toUpperCase()}
              </button>
            ))}
          </div>
          <select value={sort || "newest"} onChange={e => onSort?.(e.target.value)}
            style={{ fontSize: 11, color: "#888", background: "transparent", border: "none", outline: "none", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.04em" }}>
            <option value="newest">NEWEST</option>
            <option value="price_asc">PRICE ↑</option>
            <option value="price_desc">PRICE ↓</option>
          </select>
        </div>
      </div>

      {/* Product grid - dense */}
      <div id="products" style={{ maxWidth: 1400, margin: "0 auto", padding: "clamp(24px,4vw,40px) clamp(16px,4vw,40px) clamp(48px,8vw,80px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(clamp(140px,20vw,220px),1fr))", gap: "clamp(16px,3vw,28px)" }}>
          {isLoading ? Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ aspectRatio: "1", background: "#f5f5f5", animation: "pulse 1.5s ease-in-out infinite" }} />
          )) : products.map((p: any) => (
            <ProductCard key={p.id} p={p} store={store} brand={brand} currency={currency} variant="minimal" />
          ))}
        </div>
      </div>

      <Newsletter brand={brand} />
      <StoreFooter store={store} brand={brand} />
      <CartDrawer store={store} brand={brand} currency={currency} />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} html{scroll-behavior:smooth}`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 4: ATELIER — Boutique fashion/beauty
// ══════════════════════════════════════════════════════════════════════════════
function AtelierTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#C084FC";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);

  return (
    <div style={{ minHeight: "100vh", background: "#fdf9f6", fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap'); @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} html{scroll-behavior:smooth}`}</style>
      <StoreNav store={store} brand={brand} dark={false} count={count} toggle={toggle} search={search} onSearch={onSearch} />

      {/* Editorial hero */}
      <div style={{ padding: "clamp(48px,10vw,96px) clamp(16px,4vw,40px)", textAlign: "center", borderBottom: "1px solid #e8e0d8" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.2em", color: brand, fontFamily: "'Inter',sans-serif", fontWeight: 600, margin: "0 0 16px", textTransform: "uppercase" as const }}>Est. 2024</p>
        <h1 style={{ fontSize: "clamp(40px,8vw,80px)", fontWeight: 600, letterSpacing: "-0.02em", color: "#1a1a1a", margin: "0 0 20px", lineHeight: 0.95 }}>{store.name}</h1>
        <p style={{ fontSize: "clamp(15px,2vw,19px)", color: "#888", maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>
          {store.description || "Curated pieces for the discerning taste."}
        </p>
        <Link href="#products" style={{ display: "inline-block", padding: "12px 32px", border: "1px solid #1a1a1a", color: "#1a1a1a", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textDecoration: "none", fontFamily: "'Inter',sans-serif", textTransform: "uppercase" as const, transition: "all 0.3s" }}>
          Discover the Collection
        </Link>
      </div>

      {/* Category row */}
      {categories.filter(c => c !== "All").length > 0 && (
        <div style={{ padding: "clamp(24px,4vw,40px) clamp(16px,4vw,40px)", borderBottom: "1px solid #e8e0d8" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: "clamp(16px,3vw,32px)", justifyContent: "center", overflowX: "auto", flexWrap: "wrap" }}>
            {categories.map(c => (
              <button key={c} onClick={() => onCategory?.(c)}
                style={{ background: "none", border: "none", fontSize: "clamp(11px,1.5vw,13px)", letterSpacing: "0.1em", color: category === c ? "#1a1a1a" : "#aaa", fontWeight: category === c ? 600 : 400, cursor: "pointer", borderBottom: category === c ? "1px solid #1a1a1a" : "1px solid transparent", padding: "4px 0", textTransform: "uppercase" as const, fontFamily: "'Inter',sans-serif", flexShrink: 0 }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Boutique product grid */}
      <div id="products" style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(40px,6vw,64px) clamp(16px,4vw,40px) clamp(48px,8vw,80px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(clamp(160px,22vw,240px),1fr))", gap: "clamp(24px,4vw,40px)" }}>
          {isLoading ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ aspectRatio: "3/4", background: "#f0ece6", animation: "pulse 1.5s ease-in-out infinite" }} />
          )) : products.map((p: any) => (
            <ProductCard key={p.id} p={p} store={store} brand={brand} currency={currency} variant="boutique" />
          ))}
        </div>
      </div>

      {/* Brand story */}
      <div style={{ background: "#1a1a1a", color: "#fff", padding: "clamp(48px,8vw,80px) clamp(16px,4vw,40px)", textAlign: "center" }}>
        <p style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 500, maxWidth: 640, margin: "0 auto 24px", lineHeight: 1.4 }}>
          "Fashion is the art of expression, and every piece tells your story."
        </p>
        <p style={{ fontSize: 12, letterSpacing: "0.15em", color: "#888", fontFamily: "'Inter',sans-serif", textTransform: "uppercase" as const }}>— {store.name}</p>
      </div>

      <Newsletter brand={brand} />
      <StoreFooter store={store} brand={brand} />
      <CartDrawer store={store} brand={brand} currency={currency} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 5: VOLTAGE — Bold streetwear / hype
// ══════════════════════════════════════════════════════════════════════════════
function VoltageTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#EF4444";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Impact','Arial Black',system-ui" }}>
      <StoreNav store={store} brand={brand} dark={false} count={count} toggle={toggle} search={search} onSearch={onSearch} />

      {/* Full bleed bold hero */}
      <div style={{ background: brand, padding: "clamp(40px,8vw,80px) clamp(16px,4vw,32px)", textAlign: "center" }}>
        <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          style={{ fontSize: "clamp(56px,14vw,140px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.05em", margin: "0 0 12px", lineHeight: 0.85, textTransform: "uppercase" as const }}>
          {store.name}
        </motion.h1>
        <p style={{ fontSize: "clamp(14px,2vw,20px)", color: "rgba(255,255,255,0.75)", fontFamily: "'Inter',system-ui", fontWeight: 400, margin: "0 0 28px" }}>
          {store.description || "No limits. Only style."}
        </p>
        <Link href="#products" style={{ display: "inline-block", padding: "14px 36px", borderRadius: 0, background: "#fff", color: brand, fontSize: 13, fontWeight: 700, textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase" as const, fontFamily: "'Inter',system-ui" }}>
          SHOP THE DROP
        </Link>
      </div>

      <TrustBar brand={brand} />

      {/* Category strips */}
      {categories.filter(c => c !== "All").length > 0 && (
        <div style={{ background: "#111", padding: "12px clamp(16px,4vw,32px)", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 0, maxWidth: 1200, margin: "0 auto" }}>
            {categories.map(c => (
              <button key={c} onClick={() => onCategory?.(c)}
                style={{ padding: "8px 20px", border: "none", background: category === c ? brand : "transparent", color: category === c ? "#fff" : "#666", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const, fontFamily: "'Inter',system-ui" }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div id="products" style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(24px,4vw,40px) clamp(16px,4vw,32px) clamp(48px,8vw,80px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(clamp(160px,22vw,260px),1fr))", gap: "clamp(12px,2vw,20px)" }}>
          {isLoading ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ aspectRatio: "1", background: "#f0f0f0", animation: "pulse 1.5s ease-in-out infinite" }} />
          )) : products.map((p: any) => (
            <ProductCard key={p.id} p={p} store={store} brand={brand} currency={currency} variant="editorial" />
          ))}
        </div>
      </div>

      <Newsletter brand={brand} />
      <StoreFooter store={store} brand={brand} />
      <CartDrawer store={store} brand={brand} currency={currency} />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} html{scroll-behavior:smooth}`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 6: PRISM — Glassmorphic gradient luxury
// ══════════════════════════════════════════════════════════════════════════════
function PrismTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#7C3AED";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg,#0d0524 0%,#1a0d3c 50%,#0d1a3c 100%)`, fontFamily: "'Inter',system-ui" }}>
      <StoreNav store={store} brand={brand} dark count={count} toggle={toggle} search={search} onSearch={onSearch} />

      {/* Gradient hero */}
      <div style={{ position: "relative", padding: "clamp(60px,12vw,100px) clamp(16px,4vw,32px)", textAlign: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50%", left: "10%", width: "60vw", height: "60vw", borderRadius: "50%", background: `radial-gradient(circle,${brand}25,transparent 60%)`, filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-30%", right: "5%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(6,182,212,0.15),transparent 60%)", filter: "blur(50px)", pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: brand, textTransform: "uppercase" as const, letterSpacing: "0.2em", margin: "0 0 16px" }}>Premium Store</p>
          <h1 style={{ fontSize: "clamp(40px,8vw,80px)", fontWeight: 900, letterSpacing: "-0.05em", color: "#fff", margin: "0 0 20px", lineHeight: 0.92 }}>{store.name}</h1>
          <p style={{ fontSize: "clamp(14px,2vw,18px)", color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto 36px", lineHeight: 1.7 }}>
            {store.description || "Where luxury meets innovation."}
          </p>
          <Link href="#products" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 16, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            Explore Collection →
          </Link>
        </motion.div>
      </div>

      {/* Categories */}
      {categories.filter(c => c !== "All").length > 0 && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,32px) 32px" }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
            {categories.map(c => (
              <button key={c} onClick={() => onCategory?.(c)}
                style={{ padding: "8px 18px", borderRadius: 99, border: `1px solid ${category === c ? brand : "rgba(255,255,255,0.1)"}`, background: category === c ? `${brand}25` : "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)", color: category === c ? "#fff" : "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const, flexShrink: 0, fontFamily: "inherit" }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Glassmorphic product grid */}
      <div id="products" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,32px) clamp(48px,8vw,80px)" }}>
        <SectionHead title="The Collection" dark action={{ label: "View all", href: "#" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(clamp(160px,22vw,240px),1fr))", gap: 16 }}>
          {isLoading ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 20, background: "rgba(255,255,255,0.05)", aspectRatio: "1", animation: "pulse 1.5s ease-in-out infinite" }} />
          )) : products.map((p: any) => (
            <ProductCard key={p.id} p={p} store={store} brand={brand} currency={currency} variant="glassmorphic" />
          ))}
        </div>
      </div>

      <Newsletter brand={brand} dark />
      <StoreFooter store={store} brand={brand} dark />
      <CartDrawer store={store} brand={brand} currency={currency} />
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:.7}} html{scroll-behavior:smooth}`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 7: EMBER — Warm organic handmade / artisan
// ══════════════════════════════════════════════════════════════════════════════
function EmberTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#D97706";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2", fontFamily: "'Georgia','Palatino',serif" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} html{scroll-behavior:smooth}`}</style>
      <header style={{ borderBottom: "1px solid #e8dfd0", position: "sticky", top: 0, background: "rgba(250,247,242,0.97)", backdropFilter: "blur(10px)", zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,32px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#2d1b00", margin: 0, letterSpacing: "-0.02em" }}>{store.name}</p>
            <p style={{ fontSize: 10, color: "#a08060", margin: 0, letterSpacing: "0.15em", fontFamily: "'Inter',sans-serif" }}>HANDCRAFTED WITH LOVE</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={toggle} style={{ position: "relative", background: "none", border: "none", cursor: "pointer" }}>
              <ShoppingCart size={20} color="#2d1b00" />
              {count > 0 && <span style={{ position: "absolute", top: -5, right: -5, width: 14, height: 14, borderRadius: "50%", background: brand, color: "#fff", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{count}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Warm hero */}
      <div style={{ background: `linear-gradient(135deg,#fdf3e3,#fae8cc)`, padding: "clamp(48px,10vw,96px) clamp(16px,4vw,32px)", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: brand, letterSpacing: "0.2em", fontFamily: "'Inter',sans-serif", fontWeight: 600, margin: "0 0 16px", textTransform: "uppercase" as const }}>Handmade & Curated</p>
        <h1 style={{ fontSize: "clamp(36px,6vw,64px)", fontWeight: 700, color: "#2d1b00", letterSpacing: "-0.02em", lineHeight: 1.1, margin: "0 0 20px" }}>
          {store.name}
        </h1>
        <p style={{ fontSize: "clamp(15px,2vw,18px)", color: "#7a5c3c", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.8, fontFamily: "'Inter',sans-serif" }}>
          {store.description || "Every piece made with intention. Shop our curated collection of artisan products."}
        </p>
        <Link href="#products" style={{ display: "inline-block", padding: "13px 28px", borderRadius: 8, background: brand, color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", fontFamily: "'Inter',sans-serif" }}>
          Explore the Shop →
        </Link>
      </div>

      {/* Story strip */}
      <div style={{ background: "#2d1b00", color: "#fff", padding: "clamp(28px,4vw,40px) clamp(16px,4vw,32px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: "clamp(24px,4vw,48px)", justifyContent: "center", flexWrap: "wrap" }}>
          {["🌿 Natural Materials", "✋ Handcrafted", "🌍 Ethically Sourced", "💚 Sustainable"].map(tag => (
            <p key={tag} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0, fontFamily: "'Inter',sans-serif" }}>{tag}</p>
          ))}
        </div>
      </div>

      {/* Categories */}
      {categories.filter(c => c !== "All").length > 0 && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(28px,4vw,40px) clamp(16px,4vw,32px) 0" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map(c => (
              <button key={c} onClick={() => onCategory?.(c)}
                style={{ padding: "8px 18px", borderRadius: 99, border: `1px solid ${category === c ? brand : "#d4c4a8"}`, background: category === c ? `${brand}15` : "transparent", color: category === c ? brand : "#7a5c3c", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products - boutique style */}
      <div id="products" style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(32px,4vw,48px) clamp(16px,4vw,32px) clamp(48px,8vw,80px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(clamp(160px,22vw,240px),1fr))", gap: "clamp(20px,3vw,36px)" }}>
          {isLoading ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ aspectRatio: "3/4", background: "#ede5d8", animation: "pulse 1.5s ease-in-out infinite", borderRadius: 8 }} />
          )) : products.map((p: any) => (
            <ProductCard key={p.id} p={p} store={store} brand={brand} currency={currency} variant="boutique" />
          ))}
        </div>
      </div>

      <Newsletter brand={brand} />
      <StoreFooter store={store} brand={brand} />
      <CartDrawer store={store} brand={brand} currency={currency} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 8: NEXUS — Tech / electronics futuristic
// ══════════════════════════════════════════════════════════════════════════════
function NexusTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#06B6D4";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);

  return (
    <div style={{ minHeight: "100vh", background: "#060c14", fontFamily: "'Inter','DM Sans',system-ui", color: "#fff" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:.7}} @keyframes scan{0%{transform:translateY(-100%)}100%{transform:translateY(200vh)}} html{scroll-behavior:smooth}`}</style>
      <StoreNav store={store} brand={brand} dark count={count} toggle={toggle} search={search} onSearch={onSearch} />

      {/* Futuristic hero */}
      <div style={{ position: "relative", padding: "clamp(60px,12vw,100px) clamp(16px,4vw,32px)", overflow: "hidden" }}>
        {/* Grid lines */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(6,182,212,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.05) 1px,transparent 1px)`, backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "20%", right: "5%", width: "40vw", height: "40vw", borderRadius: "50%", background: `radial-gradient(circle,${brand}15,transparent 60%)`, filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 99, background: `${brand}15`, border: `1px solid ${brand}30`, marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: brand, animation: "none" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: brand, letterSpacing: "0.1em" }}>NEW ARRIVALS LIVE</span>
          </div>
          <h1 style={{ fontSize: "clamp(40px,8vw,80px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.92, margin: "0 0 24px" }}>
            {store.name}<br />
            <span style={{ color: brand }}>STORE</span>
          </h1>
          <p style={{ fontSize: "clamp(14px,2vw,17px)", color: "rgba(255,255,255,0.45)", maxWidth: 480, lineHeight: 1.7, margin: "0 0 36px" }}>
            {store.description || "Next-generation products. Engineered for the future."}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="#products" style={{ padding: "13px 28px", borderRadius: 10, background: brand, color: "#000", fontSize: 14, fontWeight: 800, textDecoration: "none", letterSpacing: "-0.01em" }}>
              Shop Now →
            </Link>
            <Link href="#products" style={{ padding: "13px 28px", borderRadius: 10, border: `1px solid ${brand}40`, color: brand, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              Browse All
            </Link>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      {categories.filter(c => c !== "All").length > 0 && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,32px)", display: "flex", gap: 0, overflowX: "auto" }}>
            {categories.map(c => (
              <button key={c} onClick={() => onCategory?.(c)}
                style={{ padding: "14px 20px", border: "none", borderBottom: category === c ? `2px solid ${brand}` : "2px solid transparent", background: "transparent", color: category === c ? brand : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.06em", whiteSpace: "nowrap" as const, fontFamily: "inherit" }}>
                {c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div id="products" style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(36px,5vw,56px) clamp(16px,4vw,32px) clamp(48px,8vw,80px)" }}>
        <SectionHead title="Products" dark action={{ label: "View all", href: "#" }} center={false} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(clamp(160px,22vw,240px),1fr))", gap: 16 }}>
          {isLoading ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 12, background: "rgba(255,255,255,0.04)", aspectRatio: "1", animation: "pulse 1.5s ease-in-out infinite" }} />
          )) : products.map((p: any) => (
            <ProductCard key={p.id} p={p} store={store} brand={brand} currency={currency} variant="dark" />
          ))}
        </div>
      </div>

      <Newsletter brand={brand} dark />
      <StoreFooter store={store} brand={brand} dark />
      <CartDrawer store={store} brand={brand} currency={currency} />
    </div>
  );
}

// ── TEMPLATE REGISTRY ──────────────────────────────────────────────────────────
const REGISTRY: Record<string, (props: TemplateProps) => JSX.Element> = {
  // Classic / Aurora variants
  "aurora":       AuroraTemplate,
  "classic":      AuroraTemplate,
  "modern":       AuroraTemplate,
  "split":        AuroraTemplate,
  "magazine":     AuroraTemplate,

  // Dark luxury
  "obsidian":     ObsidianTemplate,
  "dark-luxe":    ObsidianTemplate,
  "ultra-dark":   ObsidianTemplate,
  "neon":         ObsidianTemplate,

  // Minimal
  "verdant":      VerdantTemplate,
  "minimal":      VerdantTemplate,
  "minimal-pro":  VerdantTemplate,
  "grid":         VerdantTemplate,

  // Boutique / Atelier
  "atelier":      AtelierTemplate,
  "boutique":     AtelierTemplate,
  "vintage":      AtelierTemplate,
  "runway":       AtelierTemplate,

  // Bold / Voltage
  "voltage":      VoltageTemplate,
  "bold":         VoltageTemplate,
  "editorial":    VoltageTemplate,

  // Glassmorphic / Prism
  "prism":        PrismTemplate,
  "glassmorphic": PrismTemplate,

  // Artisan / Ember
  "ember":        EmberTemplate,

  // Tech / Nexus
  "nexus":        NexusTemplate,
};

export function TemplateRenderer(props: TemplateProps) {
  const templateId = props.store?.templateId || props.store?.theme || "aurora";
  const Component  = REGISTRY[templateId] || AuroraTemplate;
  return <Component {...props} />;
}
