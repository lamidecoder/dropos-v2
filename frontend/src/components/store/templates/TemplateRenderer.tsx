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


// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE: VELVET — Luxury Fashion (Black & Gold, editorial serif)
// ══════════════════════════════════════════════════════════════════════════════
function VelvetTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#C9A84C";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);
  const w = useWindowSize();
  const [heroIdx, setHeroIdx] = useState(0);
  const heroProds = products.slice(0,3);

  useEffect(() => {
    if (!heroProds.length) return;
    const t = setInterval(() => setHeroIdx(i => (i+1) % heroProds.length), 4000);
    return () => clearInterval(t);
  }, [heroProds.length]);

  return (
    <div style={{ minHeight:"100vh", background:"#0A0806", color:"#F5F0E8", fontFamily:"'Playfair Display',Georgia,serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Cormorant+Garamond:wght@300;400;600&display=swap');
        .velvet-nav a{text-decoration:none;color:rgba(245,240,232,0.55);font-family:"Cormorant Garamond",serif;font-size:14px;letter-spacing:0.12em;text-transform:uppercase;transition:color 0.2s}
        .velvet-nav a:hover{color:#C9A84C}
        .velvet-btn{padding:14px 36px;background:transparent;border:1px solid #C9A84C;color:#C9A84C;font-family:"Cormorant Garamond",serif;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;cursor:pointer;transition:all 0.3s}
        .velvet-btn:hover{background:#C9A84C;color:#0A0806}
        .velvet-card:hover .velvet-overlay{opacity:1!important}
        .velvet-card:hover img{transform:scale(1.06)!important}
      `}</style>

      {/* Nav */}
      <header style={{position:"sticky",top:0,zIndex:50,background:"rgba(10,8,6,0.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(201,168,76,0.12)"}}>
        <div style={{maxWidth:1400,margin:"0 auto",padding:"0 clamp(20px,4vw,48px)",height:72,display:"flex",alignItems:"center",justifyContent:"space-between"}} className="velvet-nav">
          <div style={{display:"flex",gap:"clamp(20px,3vw,40px)"}}>
            <a href="#products">Collection</a>
            <a href="#about">Maison</a>
          </div>
          <div style={{fontSize:"clamp(18px,3vw,26px)",fontWeight:900,letterSpacing:"-0.02em",color:"#F5F0E8",textAlign:"center"}}>{store.name}</div>
          <div style={{display:"flex",gap:"clamp(20px,3vw,40px)",alignItems:"center"}}>
            <a href="#contact">Contact</a>
            <button onClick={toggle} style={{background:"none",border:"none",cursor:"pointer",position:"relative"}}>
              <ShoppingCart size={18} color="#F5F0E8"/>
              {count>0&&<span style={{position:"absolute",top:-5,right:-5,width:14,height:14,borderRadius:"50%",background:brand,color:"#0A0806",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{count}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero — full bleed cinematic */}
      <div style={{position:"relative",height:"100svh",overflow:"hidden",display:"flex",alignItems:"center"}}>
        <AnimatePresence mode="wait">
          {heroProds[heroIdx] && (
            <motion.div key={heroIdx} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:1.2}}
              style={{position:"absolute",inset:0}}>
              <img src={heroProds[heroIdx].images?.[0]||"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop"} alt=""
                style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.4)"}}/>
            </motion.div>
          )}
        </AnimatePresence>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(10,8,6,0.85) 40%,transparent)"}}/>
        <div style={{position:"relative",zIndex:1,maxWidth:1400,margin:"0 auto",padding:"0 clamp(20px,4vw,48px)",width:"100%"}}>
          <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:1,delay:0.3}}>
            <p style={{fontSize:11,letterSpacing:"0.3em",color:brand,textTransform:"uppercase",marginBottom:16,fontFamily:"'Cormorant Garamond',serif"}}>The New Season</p>
            <h1 style={{fontSize:"clamp(48px,8vw,96px)",fontWeight:900,lineHeight:0.9,margin:"0 0 24px",letterSpacing:"-0.02em"}}>
              Exquisite<br/><em style={{fontStyle:"italic",color:brand}}>Luxury</em><br/>Awaits
            </h1>
            <p style={{fontSize:"clamp(14px,2vw,17px)",color:"rgba(245,240,232,0.6)",lineHeight:1.8,maxWidth:440,margin:"0 0 40px",fontFamily:"'Cormorant Garamond',serif",fontWeight:300}}>
              {store.description||"Rare craftsmanship. Timeless elegance. Each piece a testament to the art of luxury."}
            </p>
            <button className="velvet-btn">Explore Collection</button>
          </motion.div>
        </div>
        {/* Gold line */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:"linear-gradient(to right,transparent,#C9A84C40,transparent)"}}/>
        {/* Slide indicators */}
        {heroProds.length>1&&(
          <div style={{position:"absolute",bottom:32,right:48,display:"flex",gap:8}}>
            {heroProds.map((_,i)=>(<div key={i} onClick={()=>setHeroIdx(i)} style={{width:i===heroIdx?24:8,height:2,background:i===heroIdx?brand:"rgba(255,255,255,0.3)",cursor:"pointer",transition:"width 0.3s"}}/>))}
          </div>
        )}
      </div>

      {/* Gold divider */}
      <div style={{textAlign:"center",padding:"40px 0",borderBottom:"1px solid rgba(201,168,76,0.12)"}}>
        <p style={{fontSize:11,letterSpacing:"0.4em",color:"rgba(245,240,232,0.3)",textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif"}}>The House of {store.name}</p>
      </div>

      {/* Products */}
      <div id="products" style={{maxWidth:1400,margin:"0 auto",padding:"clamp(48px,8vw,96px) clamp(20px,4vw,48px)"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <p style={{fontSize:11,letterSpacing:"0.3em",color:brand,textTransform:"uppercase",marginBottom:12,fontFamily:"'Cormorant Garamond',serif"}}>The Collection</p>
          <h2 style={{fontSize:"clamp(32px,5vw,56px)",fontWeight:900,letterSpacing:"-0.02em",margin:0}}>New Arrivals</h2>
        </div>

        {/* Category filter */}
        {categories.filter(c=>c!=="All").length>0&&(
          <div style={{display:"flex",gap:0,justifyContent:"center",borderBottom:"1px solid rgba(201,168,76,0.15)",marginBottom:48,overflowX:"auto"}}>
            {categories.map(c=>(
              <button key={c} onClick={()=>onCategory?.(c)}
                style={{padding:"12px 24px",border:"none",borderBottom:category===c?`2px solid ${brand}`:"2px solid transparent",background:"transparent",color:category===c?brand:"rgba(245,240,232,0.4)",fontSize:11,fontWeight:600,cursor:"pointer",letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",whiteSpace:"nowrap"}}>
                {c}
              </button>
            ))}
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${w<640?"45vw":"280px"},1fr))`,gap:2}}>
          {isLoading?Array.from({length:6}).map((_,i)=>(
            <div key={i} style={{aspectRatio:"2/3",background:"rgba(255,255,255,0.03)",animation:"pulse 1.5s infinite"}}/>
          )):products.map(p=>{
            const img=p.images?.[0]||"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=900&fit=crop";
            const fmt=(n:number)=>fmtPrice(n,currency);
            const{add}=useCart(store.id,currency);
            const[hover,setHov]=useState(false);
            const[added,setAdded]=useState(false);
            return(
              <Link key={p.id} href={`/store/${store.slug}/product/${p.id}`} style={{textDecoration:"none",display:"block"}} className="velvet-card">
                <div style={{position:"relative",aspectRatio:"2/3",overflow:"hidden",background:"#0E0B08"}}>
                  <img src={img} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)"}}
                    onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}/>
                  <div className="velvet-overlay" style={{position:"absolute",inset:0,background:"rgba(10,8,6,0.6)",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:24,opacity:0,transition:"opacity 0.3s"}}>
                    <button onClick={e=>{e.preventDefault();e.stopPropagation();add(p);setAdded(true);setTimeout(()=>setAdded(false),1600)}}
                      className="velvet-btn" style={{width:"100%",textAlign:"center"}}>
                      {added?"ADDED ✓":"ADD TO BAG"}
                    </button>
                  </div>
                  {p.comparePrice&&p.comparePrice>p.price&&(
                    <div style={{position:"absolute",top:16,left:16,background:brand,color:"#0A0806",fontSize:9,fontWeight:700,padding:"4px 10px",letterSpacing:"0.12em"}}>SALE</div>
                  )}
                </div>
                <div style={{padding:"16px 0 24px",borderBottom:"1px solid rgba(201,168,76,0.1)"}}>
                  <p style={{fontSize:11,color:"rgba(245,240,232,0.4)",letterSpacing:"0.1em",textTransform:"uppercase",margin:"0 0 6px",fontFamily:"'Cormorant Garamond',serif"}}>{p.category||store.name}</p>
                  <p style={{fontSize:16,color:"#F5F0E8",margin:"0 0 8px",lineHeight:1.3}}>{p.name}</p>
                  <p style={{fontSize:15,color:brand,fontWeight:600}}>{fmt(p.price)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Brand story */}
      <div style={{borderTop:"1px solid rgba(201,168,76,0.12)",padding:"clamp(48px,8vw,96px) clamp(20px,4vw,48px)"}}>
        <div style={{maxWidth:680,margin:"0 auto",textAlign:"center"}}>
          <div style={{width:1,height:60,background:"linear-gradient(to bottom,transparent,#C9A84C,transparent)",margin:"0 auto 32px"}}/>
          <h3 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:400,fontStyle:"italic",lineHeight:1.3,margin:"0 0 20px"}}>
            "Where craftsmanship meets<br/>modern luxury."
          </h3>
          <p style={{fontSize:14,color:"rgba(245,240,232,0.5)",lineHeight:1.8,fontFamily:"'Cormorant Garamond',serif",fontWeight:300}}>
            {store.description||"Each piece in our collection represents a commitment to excellence, quality, and timeless style."}
          </p>
        </div>
      </div>

      <Newsletter brand={brand} dark/>
      <StoreFooter store={store} brand={brand} dark/>
      <CartDrawer store={store} brand={brand} currency={currency}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE: STREET — Streetwear/Hype (Neo-brutalist, bold typography)
// ══════════════════════════════════════════════════════════════════════════════
function StreetTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#FF3B00";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);
  const w = useWindowSize();
  const [marqueePos, setMarqueePos] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setMarqueePos(p => p - 1), 20);
    return () => clearInterval(t);
  }, []);

  const marqueeText = `${store.name.toUpperCase()} · NEW DROP · LIMITED · SOLD OUT FAST · `;

  return (
    <div style={{minHeight:"100vh",background:"#F2F0EB",fontFamily:"'Arial Black','Impact',sans-serif",overflowX:"hidden"}}>
      <style>{`
        .str-card{transition:transform 0.15s;cursor:pointer}
        .str-card:hover{transform:rotate(-1deg) scale(1.02)}
        .str-btn{background:${brand};color:#fff;border:none;padding:14px 32px;font-family:inherit;font-size:12px;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;cursor:pointer;transition:all 0.15s}
        .str-btn:hover{background:#111;transform:translate(-2px,-2px);box-shadow:4px 4px 0 ${brand}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
      `}</style>

      {/* Nav — raw bold */}
      <header style={{background:"#111",borderBottom:`4px solid ${brand}`}}>
        <div style={{maxWidth:1400,margin:"0 auto",padding:"0 clamp(16px,3vw,32px)",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:"clamp(16px,3vw,24px)",fontWeight:900,color:"#F2F0EB",letterSpacing:"-0.02em"}}>{store.name.toUpperCase()}</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{padding:"8px 16px",border:`2px solid ${brand}`,background:"transparent",color:brand,fontSize:10,fontWeight:900,letterSpacing:"0.16em",cursor:"pointer"}} onClick={()=>onSearch?.("")}>SEARCH</div>
            <button onClick={toggle} style={{background:brand,border:"none",padding:"8px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:"#fff",fontWeight:900,fontSize:10,letterSpacing:"0.1em"}}>
              BAG ({count})
            </button>
          </div>
        </div>
      </header>

      {/* Marquee */}
      <div style={{background:brand,overflow:"hidden",borderBottom:"3px solid #111"}}>
        <div style={{display:"flex",whiteSpace:"nowrap",transform:`translateX(${marqueePos % (marqueeText.length*8)}px)`,padding:"10px 0"}}>
          {Array.from({length:8}).map((_,i)=>(
            <span key={i} style={{fontSize:13,fontWeight:900,color:"#111",letterSpacing:"0.08em",paddingRight:40}}>
              {marqueeText}
            </span>
          ))}
        </div>
      </div>

      {/* Hero — brutalist */}
      <div style={{background:"#111",padding:"clamp(40px,8vw,80px) clamp(16px,3vw,32px)"}}>
        <div style={{maxWidth:1400,margin:"0 auto",display:"grid",gridTemplateColumns:w>768?"1fr 1fr":"1fr",gap:24,alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,fontWeight:900,color:brand,letterSpacing:"0.2em",marginBottom:16}}>SS25 COLLECTION</div>
            <h1 style={{fontSize:"clamp(52px,10vw,120px)",fontWeight:900,lineHeight:0.85,color:"#F2F0EB",margin:"0 0 24px",letterSpacing:"-0.04em"}}>
              NO<br/>RULES<br/><span style={{WebkitTextStroke:`2px ${brand}`,color:"transparent"}}>APPLY</span>
            </h1>
            <p style={{fontSize:14,color:"rgba(242,240,235,0.5)",lineHeight:1.7,maxWidth:400,margin:"0 0 32px",fontFamily:"Arial,sans-serif",fontWeight:400}}>
              {store.description||"For those who set trends, not follow them. Drop-exclusive pieces. Cop before they're gone."}
            </p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <a href="#products" className="str-btn" style={{textDecoration:"none",color:"#fff"}}>SHOP THE DROP →</a>
              <button style={{background:"transparent",border:"2px solid rgba(242,240,235,0.3)",color:"rgba(242,240,235,0.6)",padding:"14px 32px",fontFamily:"inherit",fontSize:12,fontWeight:900,letterSpacing:"0.15em",cursor:"pointer"}}>
                LOOKBOOK
              </button>
            </div>
          </div>
          {w>768&&products[0]&&(
            <div style={{position:"relative"}}>
              <div style={{position:"absolute",inset:-8,border:`3px solid ${brand}`,transform:"rotate(2deg)"}}/> 
              <img src={products[0].images?.[0]||"https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&h=800&fit=crop"} alt=""
                style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block",position:"relative",zIndex:1}}/>
              <div style={{position:"absolute",bottom:-16,left:-16,background:brand,padding:"8px 16px",zIndex:2}}>
                <p style={{fontSize:10,fontWeight:900,color:"#111",letterSpacing:"0.2em",margin:0}}>NEW DROP</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category pills */}
      {categories.filter(c=>c!=="All").length>0&&(
        <div style={{background:"#F2F0EB",padding:"16px clamp(16px,3vw,32px)",borderBottom:"3px solid #111",overflowX:"auto"}}>
          <div style={{display:"flex",gap:8,maxWidth:1400,margin:"0 auto"}}>
            {categories.map(c=>(
              <button key={c} onClick={()=>onCategory?.(c)}
                style={{padding:"10px 20px",border:"2px solid #111",background:category===c?"#111":"transparent",color:category===c?"#F2F0EB":"#111",fontFamily:"inherit",fontSize:11,fontWeight:900,cursor:"pointer",letterSpacing:"0.12em",textTransform:"uppercase",whiteSpace:"nowrap",transition:"all 0.15s"}}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products — brutalist grid */}
      <div id="products" style={{maxWidth:1400,margin:"0 auto",padding:"clamp(32px,5vw,56px) clamp(16px,3vw,32px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:24,borderBottom:"3px solid #111",paddingBottom:12}}>
          <h2 style={{fontSize:"clamp(28px,5vw,52px)",fontWeight:900,margin:0,letterSpacing:"-0.03em"}}>THE DROP</h2>
          <span style={{fontSize:12,fontWeight:900,color:"rgba(0,0,0,0.4)",letterSpacing:"0.1em"}}>{products.length} STYLES</span>
        </div>

        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${w<640?"44vw":"220px"},1fr))`,gap:3}}>
          {isLoading?Array.from({length:8}).map((_,i)=>(
            <div key={i} style={{aspectRatio:"3/4",background:"#E0DDD8",animation:"pulse 1.5s infinite"}}/>
          )):products.map((p,idx)=>{
            const img=p.images?.[0]||"https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=800&fit=crop";
            const{add}=useCart(store.id,currency);
            const[added,setAdded]=useState(false);
            const fmt=(n:number)=>fmtPrice(n,currency);
            const isSoldOut=(p.inventory||0)===0;
            return(
              <div key={p.id} className="str-card" style={{position:"relative"}}>
                <Link href={`/store/${store.slug}/product/${p.id}`} style={{textDecoration:"none",display:"block"}}>
                  <div style={{position:"relative",aspectRatio:"3/4",overflow:"hidden",background:"#E8E5E0"}}>
                    <img src={img} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    {isSoldOut&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <span style={{fontSize:14,fontWeight:900,color:"#F2F0EB",letterSpacing:"0.1em"}}>SOLD OUT</span>
                    </div>}
                    {idx<3&&!isSoldOut&&<div style={{position:"absolute",top:8,left:8,background:brand,padding:"4px 8px"}}>
                      <span style={{fontSize:9,fontWeight:900,color:"#111",letterSpacing:"0.12em"}}>NEW</span>
                    </div>}
                  </div>
                </Link>
                <div style={{padding:"10px 0 16px",borderBottom:"2px solid #111"}}>
                  <p style={{fontSize:12,fontWeight:900,color:"#111",margin:"0 0 4px",letterSpacing:"-0.01em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name.toUpperCase()}</p>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:14,fontWeight:900,color:brand}}>{fmtPrice(p.price,currency)}</span>
                    {!isSoldOut&&<button onClick={()=>{add(p);setAdded(true);setTimeout(()=>setAdded(false),1500)}}
                      style={{background:added?"#111":brand,border:"none",color:added?"#F2F0EB":"#111",padding:"5px 10px",fontFamily:"inherit",fontSize:9,fontWeight:900,cursor:"pointer",letterSpacing:"0.1em"}}>
                      {added?"✓ COPPED":"COP IT"}
                    </button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Newsletter brand={brand} dark={false}/>
      <StoreFooter store={store} brand={brand} dark={false}/>
      <CartDrawer store={store} brand={brand} currency={currency}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE: GLOW — Beauty/Cosmetics (Pink glassmorphism, soft luxury)
// ══════════════════════════════════════════════════════════════════════════════
function GlowTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#E8547A";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);
  const w = useWindowSize();

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(145deg,#FFF0F5 0%,#FEF0FB 40%,#F5F0FF 100%)",fontFamily:"'DM Sans','Helvetica Neue',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Playfair+Display:ital,wght@1,400;1,700&display=swap');
        .glow-card{transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1)}
        .glow-card:hover{transform:translateY(-8px)}
        .glow-glass{background:rgba(255,255,255,0.65);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.8);box-shadow:0 4px 24px rgba(232,84,122,0.08)}
      `}</style>

      {/* Nav */}
      <header style={{position:"sticky",top:0,zIndex:50,background:"rgba(255,240,245,0.8)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(232,84,122,0.1)"}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)",height:64,display:"flex",alignItems:"center",gap:16}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:10,padding:"8px 14px",borderRadius:99,background:"rgba(255,255,255,0.7)",border:`1px solid rgba(232,84,122,0.15)`,maxWidth:300}}>
            <Search size={13} color={brand}/>
            <input value={search||""} onChange={e=>onSearch?.(e.target.value)} placeholder="Search products..." style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:13,color:"#333",fontFamily:"inherit"}}/>
          </div>
          <div style={{flex:0,fontSize:"clamp(18px,3vw,22px)",fontWeight:600,color:"#1A1A2E",letterSpacing:"-0.03em",textAlign:"center",flexGrow:1}}>{store.name}</div>
          <div style={{flex:1,display:"flex",justifyContent:"flex-end",alignItems:"center",gap:16}}>
            <button onClick={toggle} style={{position:"relative",background:brand,border:"none",borderRadius:99,padding:"8px 18px",display:"flex",alignItems:"center",gap:8,cursor:"pointer",color:"#fff",fontSize:13,fontWeight:600}}>
              <ShoppingCart size={14}/><span>{count>0?`${count} items`:"Cart"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div style={{padding:"clamp(48px,8vw,96px) clamp(16px,4vw,32px) 0"}}>
        <div style={{maxWidth:1280,margin:"0 auto",display:"grid",gridTemplateColumns:w>768?"1fr 1fr":"1fr",gap:32,alignItems:"center"}}>
          <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{duration:0.7}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:99,background:"rgba(232,84,122,0.1)",marginBottom:20}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:brand,animation:"pulse 2s infinite"}}/>
              <span style={{fontSize:12,color:brand,fontWeight:600,letterSpacing:"0.06em"}}>New Season Drop</span>
            </div>
            <h1 style={{fontSize:"clamp(40px,6vw,72px)",fontWeight:300,color:"#1A1A2E",lineHeight:1.1,margin:"0 0 8px",letterSpacing:"-0.03em"}}>
              Glow Up,<br/>
              <em style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:400,color:brand}}>Every Day.</em>
            </h1>
            <p style={{fontSize:16,color:"#666",lineHeight:1.8,maxWidth:440,margin:"0 0 32px",fontWeight:300}}>
              {store.description||"Discover beauty that empowers. Clean formulas, luxurious textures, and results that speak for themselves."}
            </p>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              <a href="#products" style={{padding:"14px 32px",borderRadius:99,background:`linear-gradient(135deg,${brand},#C84B6E)`,color:"#fff",fontSize:14,fontWeight:600,textDecoration:"none",boxShadow:`0 8px 24px ${brand}40`}}>
                Shop Collection
              </a>
              <a href="#about" style={{padding:"14px 32px",borderRadius:99,border:`1px solid rgba(232,84,122,0.25)`,color:brand,fontSize:14,fontWeight:500,textDecoration:"none",background:"rgba(255,255,255,0.6)"}}>
                Our Story
              </a>
            </div>

            {/* Mini social proof */}
            <div style={{display:"flex",alignItems:"center",gap:16,marginTop:32}}>
              <div style={{display:"flex"}}>
                {["😊","😍","🌟","💄","✨"].map((e,i)=>(
                  <div key={i} style={{width:32,height:32,borderRadius:"50%",background:`hsl(${330+i*15},80%,85%)`,border:"2px solid white",marginLeft:i?-10:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{e}</div>
                ))}
              </div>
              <div>
                <p style={{fontSize:13,fontWeight:700,color:"#1A1A2E",margin:0}}>50,000+ happy customers</p>
                <p style={{fontSize:12,color:"#888",margin:0}}>⭐⭐⭐⭐⭐ 4.9/5 average rating</p>
              </div>
            </div>
          </motion.div>

          {w>768&&(
            <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:0.7,delay:0.2}} style={{position:"relative"}}>
              <div style={{position:"absolute",top:-20,right:-20,width:"70%",height:"70%",borderRadius:"50%",background:"rgba(232,84,122,0.08)",zIndex:0}}/>
              <div style={{position:"relative",zIndex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {products.slice(0,4).map((p,i)=>{
                  const img=p.images?.[0]||"https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop";
                  return(
                    <div key={p.id||i} className="glow-glass" style={{borderRadius:20,overflow:"hidden",marginTop:i%2===1?24:0}}>
                      <img src={img} alt={p.name} style={{width:"100%",aspectRatio:"1",objectFit:"cover"}}/>
                      <div style={{padding:"10px 12px"}}>
                        <p style={{fontSize:11,fontWeight:600,color:"#333",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</p>
                        <p style={{fontSize:12,color:brand,fontWeight:700,margin:0}}>{fmtPrice(p.price,currency)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Categories strip */}
      {categories.filter(c=>c!=="All").length>0&&(
        <div style={{padding:"40px clamp(16px,4vw,32px) 0",overflowX:"auto"}}>
          <div style={{maxWidth:1280,margin:"0 auto",display:"flex",gap:10}}>
            {categories.map(c=>(
              <button key={c} onClick={()=>onCategory?.(c)}
                style={{padding:"10px 22px",borderRadius:99,border:`1px solid ${category===c?brand:"rgba(232,84,122,0.2)"}`,background:category===c?brand:"rgba(255,255,255,0.7)",color:category===c?"#fff":brand,fontSize:13,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s",fontFamily:"inherit"}}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div id="products" style={{maxWidth:1280,margin:"0 auto",padding:"clamp(40px,6vw,64px) clamp(16px,4vw,32px)"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:300,color:"#1A1A2E",margin:"0 0 8px",letterSpacing:"-0.03em"}}>
            Our Bestsellers
          </h2>
          <p style={{fontSize:14,color:"#888",margin:0}}>Loved by thousands, perfected for you.</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${w<640?"44vw":"230px"},1fr))`,gap:20}}>
          {isLoading?Array.from({length:8}).map((_,i)=>(
            <div key={i} style={{borderRadius:24,aspectRatio:"3/4",background:"rgba(255,255,255,0.6)",animation:"pulse 1.5s infinite"}}/>
          )):products.map(p=>{
            const img=p.images?.[0]||"https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=500&fit=crop";
            const{add}=useCart(store.id,currency);
            const[added,setAdded]=useState(false);
            const[wish,setWish]=useState(false);
            const disc=p.comparePrice&&p.comparePrice>p.price?Math.round((1-p.price/p.comparePrice)*100):0;
            return(
              <div key={p.id} className="glow-card" style={{position:"relative"}}>
                <Link href={`/store/${store.slug}/product/${p.id}`} style={{textDecoration:"none"}}>
                  <div className="glow-glass" style={{borderRadius:24,overflow:"hidden"}}>
                    <div style={{position:"relative",aspectRatio:"3/4",overflow:"hidden"}}>
                      <img src={img} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.5s"}}/>
                      {disc>0&&<div style={{position:"absolute",top:12,left:12,background:brand,borderRadius:99,padding:"3px 10px"}}>
                        <span style={{fontSize:10,color:"#fff",fontWeight:700}}>-{disc}%</span>
                      </div>}
                      <button onClick={e=>{e.preventDefault();e.stopPropagation();setWish(w=>!w)}}
                        style={{position:"absolute",top:12,right:12,width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.9)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>
                        <Heart size={14} fill={wish?brand:"none"} color={wish?brand:"#999"}/>
                      </button>
                    </div>
                    <div style={{padding:"14px 16px 16px"}}>
                      <p style={{fontSize:12,color:"#999",margin:"0 0 4px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.category||store.name}</p>
                      <p style={{fontSize:15,fontWeight:500,color:"#1A1A2E",margin:"0 0 8px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</p>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <span style={{fontSize:16,fontWeight:700,color:brand}}>{fmtPrice(p.price,currency)}</span>
                          {p.comparePrice&&<span style={{fontSize:12,color:"#ccc",textDecoration:"line-through",marginLeft:6}}>{fmtPrice(p.comparePrice,currency)}</span>}
                        </div>
                        <button onClick={e=>{e.preventDefault();e.stopPropagation();add(p);setAdded(true);setTimeout(()=>setAdded(false),1600)}}
                          style={{padding:"7px 14px",borderRadius:99,background:added?"#1A1A2E":brand,border:"none",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.2s",fontFamily:"inherit"}}>
                          {added?"✓":"Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <TrustBar brand={brand}/>
      <Newsletter brand={brand}/>
      <StoreFooter store={store} brand={brand}/>
      <CartDrawer store={store} brand={brand} currency={currency}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE: TERRA — African Fashion (Earthy bold, Ankara aesthetic)
// ══════════════════════════════════════════════════════════════════════════════
function TerraTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#C4782A";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);
  const w = useWindowSize();

  return (
    <div style={{minHeight:"100vh",background:"#FAF6F0",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,100;0,400;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap');
        .terra-card:hover{transform:translateY(-6px)!important}
        .terra-card{transition:transform 0.3s ease}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      `}</style>

      {/* Announcement bar */}
      <div style={{background:brand,padding:"8px clamp(16px,4vw,32px)",textAlign:"center"}}>
        <p style={{fontSize:12,color:"#FAF6F0",margin:0,fontWeight:500,letterSpacing:"0.05em"}}>
          🌍 Free delivery on orders over ₦25,000 · Celebrating African excellence
        </p>
      </div>

      {/* Nav */}
      <header style={{position:"sticky",top:0,zIndex:50,background:"rgba(250,246,240,0.95)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(196,120,42,0.1)"}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:"clamp(18px,3vw,24px)",fontWeight:900,color:"#1A0F00",letterSpacing:"-0.02em"}}>{store.name}</div>
          <div style={{display:"flex",alignItems:"center",gap:12,flex:1,justifyContent:"center",maxWidth:400}}>
            <div style={{display:"flex",flex:1,alignItems:"center",gap:8,padding:"8px 14px",borderRadius:10,background:"rgba(196,120,42,0.06)",border:"1px solid rgba(196,120,42,0.12)"}}>
              <Search size={13} color={brand}/>
              <input value={search||""} onChange={e=>onSearch?.(e.target.value)} placeholder="Search..." style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:13,color:"#333",fontFamily:"inherit"}}/>
            </div>
          </div>
          <button onClick={toggle} style={{background:brand,border:"none",borderRadius:10,padding:"8px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:"#FAF6F0",fontSize:13,fontWeight:600}}>
            <ShoppingCart size={15}/>{count>0?`(${count})`:"Cart"}
          </button>
        </div>
      </header>

      {/* Hero — rich visual */}
      <div style={{background:"linear-gradient(135deg,#1A0F00 0%,#2D1A00 100%)",padding:"clamp(48px,8vw,96px) clamp(16px,4vw,32px)",overflow:"hidden",position:"relative"}}>
        {/* Pattern overlay */}
        <div style={{position:"absolute",inset:0,backgroundImage:`repeating-linear-gradient(45deg,rgba(196,120,42,0.04) 0px,rgba(196,120,42,0.04) 2px,transparent 2px,transparent 20px)`,pointerEvents:"none"}}/>

        <div style={{maxWidth:1280,margin:"0 auto",display:"grid",gridTemplateColumns:w>768?"1fr 1fr":"1fr",gap:32,alignItems:"center",position:"relative",zIndex:1}}>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 14px",borderRadius:99,border:"1px solid rgba(196,120,42,0.4)",marginBottom:24}}>
              <span style={{fontSize:11,color:brand,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase"}}>New Collection</span>
            </div>
            <h1 style={{fontFamily:"'Fraunces',serif",fontSize:"clamp(44px,7vw,80px)",fontWeight:900,color:"#FAF6F0",lineHeight:0.95,margin:"0 0 20px",letterSpacing:"-0.02em"}}>
              Rooted in<br/><span style={{color:brand,fontStyle:"italic"}}>Culture.</span><br/>Worn with Pride.
            </h1>
            <p style={{fontSize:15,color:"rgba(250,246,240,0.55)",lineHeight:1.8,maxWidth:460,margin:"0 0 36px",fontWeight:300}}>
              {store.description||"Authentic African fashion celebrating our heritage. Bold prints, quality fabrics, modern silhouettes."}
            </p>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              <a href="#products" style={{padding:"14px 32px",borderRadius:10,background:`linear-gradient(135deg,${brand},#A86220)`,color:"#FAF6F0",fontSize:14,fontWeight:600,textDecoration:"none",boxShadow:`0 8px 24px ${brand}40`}}>
                Explore Collection
              </a>
              <a href="#story" style={{padding:"14px 32px",borderRadius:10,border:"1px solid rgba(250,246,240,0.2)",color:"rgba(250,246,240,0.7)",fontSize:14,fontWeight:500,textDecoration:"none"}}>
                Our Story ↗
              </a>
            </div>
          </motion.div>

          {w>768&&(
            <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{duration:0.8,delay:0.2}} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {products.slice(0,4).map((p,i)=>{
                const img=p.images?.[0]||`https://images.unsplash.com/photo-${["1441986300917-64674bd600d8","1576566588028-4147f3842f27","1594938298603-a3554582741d","1559056199-641a0ac8b55e"][i]||"1441986300917-64674bd600d8"}?w=400&h=500&fit=crop`;
                return(
                  <div key={p.id||i} style={{borderRadius:16,overflow:"hidden",marginTop:i%2===1?24:0,border:"1px solid rgba(196,120,42,0.2)"}}>
                    <img src={img} alt={p.name} style={{width:"100%",aspectRatio:i%2===0?"3/4":"1",objectFit:"cover"}}/>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Categories */}
      {categories.filter(c=>c!=="All").length>0&&(
        <div style={{padding:"24px clamp(16px,4vw,32px)",background:"#FAF6F0",borderBottom:"1px solid rgba(196,120,42,0.1)",overflowX:"auto"}}>
          <div style={{display:"flex",gap:8,maxWidth:1280,margin:"0 auto"}}>
            {categories.map(c=>(
              <button key={c} onClick={()=>onCategory?.(c)}
                style={{padding:"9px 20px",borderRadius:99,border:`1px solid ${category===c?brand:"rgba(196,120,42,0.2)"}`,background:category===c?brand:"transparent",color:category===c?"#FAF6F0":"rgba(26,15,0,0.6)",fontSize:13,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",transition:"all 0.2s"}}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div id="products" style={{maxWidth:1280,margin:"0 auto",padding:"clamp(40px,6vw,64px) clamp(16px,4vw,32px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#1A0F00",margin:0,letterSpacing:"-0.02em"}}>The Collection</h2>
          <span style={{fontSize:13,color:brand,fontWeight:600}}>{products.length} Styles</span>
        </div>

        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${w<640?"44vw":"240px"},1fr))`,gap:20}}>
          {isLoading?Array.from({length:8}).map((_,i)=>(
            <div key={i} style={{borderRadius:16,background:"rgba(196,120,42,0.06)",aspectRatio:"3/4",animation:"pulse 1.5s infinite"}}/>
          )):products.map(p=>{
            const img=p.images?.[0]||"https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=700&fit=crop";
            const{add}=useCart(store.id,currency);
            const[added,setAdded]=useState(false);
            const[hover,setHover]=useState(false);
            return(
              <div key={p.id} className="terra-card">
                <Link href={`/store/${store.slug}/product/${p.id}`} style={{textDecoration:"none"}}>
                  <div style={{borderRadius:16,overflow:"hidden",background:"#F0EAE0",position:"relative"}}>
                    <div style={{aspectRatio:"3/4",overflow:"hidden"}} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
                      <img src={img} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.6s",transform:hover?"scale(1.08)":"scale(1)"}}/>
                    </div>
                    <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"16px",background:"linear-gradient(to top,rgba(26,15,0,0.85),transparent)",opacity:hover?1:0,transition:"opacity 0.3s"}}>
                      <button onClick={e=>{e.preventDefault();e.stopPropagation();add(p);setAdded(true);setTimeout(()=>setAdded(false),1600)}}
                        style={{width:"100%",padding:"10px 0",borderRadius:8,background:brand,border:"none",color:"#FAF6F0",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                        {added?"Added ✓":"Add to Cart"}
                      </button>
                    </div>
                  </div>
                  <div style={{padding:"12px 4px 16px"}}>
                    <p style={{fontSize:11,color:brand,margin:"0 0 4px",fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase"}}>{p.category||"Fashion"}</p>
                    <p style={{fontSize:15,fontWeight:500,color:"#1A0F00",margin:"0 0 6px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</p>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:16,fontWeight:700,color:brand}}>{fmtPrice(p.price,currency)}</span>
                      {p.comparePrice&&<span style={{fontSize:12,color:"#aaa",textDecoration:"line-through"}}>{fmtPrice(p.comparePrice,currency)}</span>}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <TrustBar brand={brand}/>
      <Newsletter brand={brand}/>
      <StoreFooter store={store} brand={brand}/>
      <CartDrawer store={store} brand={brand} currency={currency}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE: IONIC — Tech/Gadgets (Clean dark tech, cyan/blue neon)
// ══════════════════════════════════════════════════════════════════════════════
function IonicTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#00D4FF";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);
  const w = useWindowSize();

  return (
    <div style={{minHeight:"100vh",background:"#050A14",color:"#E8F4FF",fontFamily:"'Space Grotesk','Inter',monospace"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        .ion-card{transition:all 0.25s;border:1px solid rgba(0,212,255,0.1);border-radius:16px;overflow:hidden}
        .ion-card:hover{border-color:rgba(0,212,255,0.4);transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,212,255,0.12)}
        .ion-btn{background:linear-gradient(135deg,${brand||"#00D4FF"},#0066CC);border:none;color:#050A14;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.2s}
        .ion-btn:hover{opacity:0.9;transform:translateY(-1px)}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
      `}</style>

      {/* Scanline effect */}
      <div style={{position:"fixed",top:0,left:0,right:0,height:"2px",background:`linear-gradient(to right,transparent,${brand},transparent)`,animation:"scanline 4s linear infinite",zIndex:999,opacity:0.4,pointerEvents:"none"}}/>

      {/* Nav */}
      <header style={{position:"sticky",top:0,zIndex:50,background:"rgba(5,10,20,0.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,212,255,0.1)"}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)",height:64,display:"flex",alignItems:"center",gap:16}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
            <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${brand},#0066CC)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Zap size={16} color="#050A14"/>
            </div>
            <span style={{fontSize:"clamp(15px,2.5vw,20px)",fontWeight:700,letterSpacing:"-0.03em"}}>{store.name}</span>
          </div>
          <div style={{display:"flex",flex:1,maxWidth:320,alignItems:"center",gap:8,padding:"8px 14px",borderRadius:10,background:"rgba(0,212,255,0.05)",border:"1px solid rgba(0,212,255,0.12)"}}>
            <Search size={13} color={brand}/>
            <input value={search||""} onChange={e=>onSearch?.(e.target.value)} placeholder="Search products..." style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:13,color:"#E8F4FF",fontFamily:"inherit"}}/>
          </div>
          <button onClick={toggle} className="ion-btn" style={{padding:"8px 18px",borderRadius:10,display:"flex",alignItems:"center",gap:8,fontSize:13}}>
            <ShoppingCart size={14}/>{count>0?`${count} items`:"Cart"}
          </button>
        </div>
      </header>

      {/* Hero */}
      <div style={{padding:"clamp(60px,10vw,120px) clamp(16px,4vw,32px)",position:"relative",overflow:"hidden"}}>
        {/* Grid lines */}
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"}}/>

        <div style={{maxWidth:1280,margin:"0 auto",display:"grid",gridTemplateColumns:w>768?"1fr 1fr":"1fr",gap:48,alignItems:"center",position:"relative",zIndex:1}}>
          <motion.div initial={{opacity:0,x:-24}} animate={{opacity:1,x:0}} transition={{duration:0.8}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 14px",borderRadius:6,background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.2)",marginBottom:24}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:brand}}/>
              <span style={{fontSize:11,color:brand,fontWeight:600,letterSpacing:"0.1em",fontFamily:"monospace"}}>NEXT GEN TECH</span>
            </div>
            <h1 style={{fontSize:"clamp(40px,7vw,80px)",fontWeight:700,lineHeight:0.95,margin:"0 0 20px",letterSpacing:"-0.04em"}}>
              The Future<br/>Is <span style={{color:brand}}>Here.</span>
            </h1>
            <p style={{fontSize:15,color:"rgba(232,244,255,0.5)",lineHeight:1.8,maxWidth:480,margin:"0 0 36px",fontWeight:300}}>
              {store.description||"Cutting-edge technology. Precision engineering. Products that change how you live, work, and create."}
            </p>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              <a href="#products" className="ion-btn" style={{padding:"14px 32px",borderRadius:10,textDecoration:"none",color:"#050A14",fontSize:14}}>
                Shop Now →
              </a>
              <a href="#specs" style={{padding:"14px 32px",borderRadius:10,border:"1px solid rgba(0,212,255,0.3)",color:brand,fontSize:14,fontWeight:500,textDecoration:"none"}}>
                View Specs
              </a>
            </div>
            <div style={{display:"flex",gap:32,marginTop:40}}>
              {[["99.9%","Uptime"],["50K+","Units sold"],["4.9★","Rating"]].map(([n,l])=>(
                <div key={l}>
                  <p style={{fontSize:22,fontWeight:700,color:brand,margin:0}}>{n}</p>
                  <p style={{fontSize:11,color:"rgba(232,244,255,0.4)",margin:0,fontFamily:"monospace",letterSpacing:"0.06em"}}>{l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {w>768&&products[0]&&(
            <motion.div initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} transition={{duration:0.8,delay:0.2}} style={{position:"relative"}}>
              <div style={{position:"absolute",inset:-2,borderRadius:20,background:`linear-gradient(135deg,${brand}20,transparent 60%)`,zIndex:0}}/>
              <img src={products[0].images?.[0]||"https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=700&h=700&fit=crop"} alt={products[0].name}
                style={{width:"100%",borderRadius:18,position:"relative",zIndex:1,border:"1px solid rgba(0,212,255,0.15)"}}/>
              <div style={{position:"absolute",bottom:24,left:24,right:24,background:"rgba(5,10,20,0.9)",backdropFilter:"blur(16px)",borderRadius:12,padding:"14px 18px",border:"1px solid rgba(0,212,255,0.15)",zIndex:2}}>
                <p style={{fontSize:13,fontWeight:600,margin:"0 0 2px"}}>{products[0].name}</p>
                <p style={{fontSize:16,fontWeight:700,color:brand,margin:0}}>{fmtPrice(products[0].price,currency)}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Categories */}
      {categories.filter(c=>c!=="All").length>0&&(
        <div style={{borderTop:"1px solid rgba(0,212,255,0.08)",borderBottom:"1px solid rgba(0,212,255,0.08)",overflowX:"auto"}}>
          <div style={{maxWidth:1280,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)",display:"flex",gap:0}}>
            {categories.map(c=>(
              <button key={c} onClick={()=>onCategory?.(c)}
                style={{padding:"14px 20px",border:"none",borderBottom:category===c?`2px solid ${brand}`:"2px solid transparent",background:"transparent",color:category===c?brand:"rgba(232,244,255,0.35)",fontSize:12,fontWeight:600,cursor:"pointer",letterSpacing:"0.06em",whiteSpace:"nowrap",fontFamily:"inherit",transition:"color 0.2s"}}>
                {c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div id="products" style={{maxWidth:1280,margin:"0 auto",padding:"clamp(40px,6vw,64px) clamp(16px,4vw,32px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
          <h2 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:700,margin:0,letterSpacing:"-0.03em"}}>Products</h2>
          <div style={{fontSize:11,color:brand,fontFamily:"monospace",letterSpacing:"0.08em"}}>{products.length} RESULTS</div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${w<640?"44vw":"220px"},1fr))`,gap:16}}>
          {isLoading?Array.from({length:8}).map((_,i)=>(
            <div key={i} style={{borderRadius:16,background:"rgba(0,212,255,0.03)",aspectRatio:"1",animation:"pulse 1.5s infinite"}}/>
          )):products.map(p=>{
            const img=p.images?.[0]||"https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&h=500&fit=crop";
            const{add}=useCart(store.id,currency);
            const[added,setAdded]=useState(false);
            return(
              <div key={p.id} className="ion-card">
                <Link href={`/store/${store.slug}/product/${p.id}`} style={{textDecoration:"none",display:"block"}}>
                  <div style={{position:"relative",background:"rgba(0,212,255,0.04)"}}>
                    <img src={img} alt={p.name} style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block"}}/>
                    <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 60%,rgba(5,10,20,0.8))"}}/>
                  </div>
                  <div style={{padding:"14px 16px 16px",background:"rgba(0,212,255,0.02)"}}>
                    <p style={{fontSize:12,color:"rgba(232,244,255,0.4)",margin:"0 0 4px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"monospace"}}>{p.category||"TECH"}</p>
                    <p style={{fontSize:14,fontWeight:600,color:"#E8F4FF",margin:"0 0 10px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</p>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:16,fontWeight:700,color:brand}}>{fmtPrice(p.price,currency)}</span>
                      <button onClick={e=>{e.preventDefault();e.stopPropagation();add(p);setAdded(true);setTimeout(()=>setAdded(false),1500)}}
                        className="ion-btn" style={{padding:"6px 14px",borderRadius:8,fontSize:11}}>
                        {added?"✓":"+ Add"}
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <Newsletter brand={brand} dark/>
      <StoreFooter store={store} brand={brand} dark/>
      <CartDrawer store={store} brand={brand} currency={currency}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE: ARTISAN — Food/Bakery (Warm organic, hand-crafted feel)
// ══════════════════════════════════════════════════════════════════════════════
function ArtisanTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#8B5E3C";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);
  const w = useWindowSize();

  return (
    <div style={{minHeight:"100vh",background:"#FDF8F3",fontFamily:"'Lora',Georgia,serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,700;1,400;1,600&family=Inter:wght@300;400;500&display=swap');
        .art-card:hover{transform:translateY(-4px)!important}
        .art-card{transition:transform 0.3s ease}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
      `}</style>

      {/* Top strip */}
      <div style={{background:"#1A0F06",padding:"8px",textAlign:"center"}}>
        <span style={{fontSize:12,color:"rgba(253,248,243,0.7)",fontFamily:"Inter,sans-serif",letterSpacing:"0.08em"}}>
          🥐 Baked fresh daily · Order by 5pm for next-day delivery
        </span>
      </div>

      {/* Nav */}
      <header style={{position:"sticky",top:0,zIndex:50,background:"rgba(253,248,243,0.96)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(139,94,60,0.12)"}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)",height:68,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
          <div style={{fontSize:"clamp(18px,3vw,26px)",fontWeight:700,color:"#1A0F06",letterSpacing:"-0.01em",fontStyle:"italic"}}>{store.name}</div>
          <nav style={{display:"flex",gap:"clamp(20px,3vw,36px)",fontFamily:"Inter,sans-serif",fontSize:14,color:"rgba(26,15,6,0.6)"}}>
            {w>640&&<>
              <a href="#menu" style={{textDecoration:"none",color:"inherit"}}>Menu</a>
              <a href="#about" style={{textDecoration:"none",color:"inherit"}}>Our Story</a>
              <a href="#contact" style={{textDecoration:"none",color:"inherit"}}>Order</a>
            </>}
          </nav>
          <button onClick={toggle} style={{background:brand,border:"none",borderRadius:99,padding:"9px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:"#FDF8F3",fontFamily:"Inter,sans-serif",fontSize:13,fontWeight:500}}>
            <ShoppingCart size={14}/>{count>0?`${count}`:"Bag"}
          </button>
        </div>
      </header>

      {/* Hero */}
      <div style={{background:"linear-gradient(135deg,#FDF0E0 0%,#F5E5CC 100%)",padding:"clamp(56px,10vw,112px) clamp(16px,4vw,32px)"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:w>768?"1fr 1fr":"1fr",gap:40,alignItems:"center"}}>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.8}}>
            <p style={{fontSize:11,fontWeight:400,color:brand,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:16,fontFamily:"Inter,sans-serif"}}>Est. 2019 · Handcrafted</p>
            <h1 style={{fontSize:"clamp(44px,7vw,80px)",fontWeight:700,color:"#1A0F06",lineHeight:1.0,margin:"0 0 20px",letterSpacing:"-0.02em"}}>
              Made with<br/><em style={{color:brand}}>Love</em><br/>& Flour.
            </h1>
            <p style={{fontSize:16,color:"rgba(26,15,6,0.55)",lineHeight:1.9,maxWidth:440,margin:"0 0 32px",fontWeight:400}}>
              {store.description||"Every bite tells a story. Our recipes, handed down through generations, made fresh every morning."}
            </p>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              <a href="#menu" style={{padding:"14px 32px",borderRadius:99,background:brand,color:"#FDF8F3",fontSize:14,fontWeight:500,textDecoration:"none",boxShadow:`0 6px 20px ${brand}35`,fontFamily:"Inter,sans-serif"}}>
                Order Now
              </a>
              <a href="#story" style={{padding:"14px 32px",borderRadius:99,border:`1px solid rgba(139,94,60,0.25)`,color:brand,fontSize:14,fontWeight:500,textDecoration:"none",fontFamily:"Inter,sans-serif"}}>
                Our Story
              </a>
            </div>
          </motion.div>

          {w>768&&(
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{duration:0.8,delay:0.2}} style={{position:"relative"}}>
              <div style={{position:"absolute",top:"10%",right:"-5%",width:200,height:200,borderRadius:"50%",background:"rgba(139,94,60,0.08)"}}/>
              {products[0]&&(
                <img src={products[0].images?.[0]||"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=600&fit=crop"} alt=""
                  style={{width:"100%",borderRadius:"40% 60% 60% 40%/40% 40% 60% 60%",objectFit:"cover",aspectRatio:"1",position:"relative",zIndex:1}}/>
              )}
              <div style={{position:"absolute",bottom:-20,left:20,background:"#FDF8F3",borderRadius:16,padding:"14px 20px",boxShadow:"0 8px 32px rgba(139,94,60,0.12)",border:`1px solid rgba(139,94,60,0.1)`,zIndex:2}}>
                <p style={{fontSize:12,color:brand,margin:"0 0 2px",fontFamily:"Inter,sans-serif",fontWeight:500}}>Today's Special</p>
                <p style={{fontSize:14,fontWeight:700,color:"#1A0F06",margin:0}}>{products[0]?.name||"Sourdough Croissant"}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Category tags */}
      {categories.filter(c=>c!=="All").length>0&&(
        <div style={{background:"#FDF8F3",padding:"20px clamp(16px,4vw,32px)",borderBottom:"1px solid rgba(139,94,60,0.1)",overflowX:"auto"}}>
          <div style={{display:"flex",gap:8,maxWidth:1200,margin:"0 auto"}}>
            {categories.map(c=>(
              <button key={c} onClick={()=>onCategory?.(c)}
                style={{padding:"8px 20px",borderRadius:99,border:`1px solid ${category===c?brand:"rgba(139,94,60,0.2)"}`,background:category===c?brand:"transparent",color:category===c?"#FDF8F3":"rgba(26,15,6,0.6)",fontSize:13,fontWeight:400,cursor:"pointer",fontFamily:"Inter,sans-serif",whiteSpace:"nowrap",transition:"all 0.2s"}}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu/Products */}
      <div id="menu" style={{maxWidth:1200,margin:"0 auto",padding:"clamp(40px,6vw,64px) clamp(16px,4vw,32px)"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <p style={{fontSize:11,color:brand,letterSpacing:"0.2em",textTransform:"uppercase",margin:"0 0 8px",fontFamily:"Inter,sans-serif"}}>Fresh Daily</p>
          <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:700,color:"#1A0F06",margin:"0 0 8px"}}>Today's Menu</h2>
          <p style={{fontSize:14,color:"rgba(26,15,6,0.5)",margin:0,fontFamily:"Inter,sans-serif"}}>Made fresh every morning</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${w<640?"44vw":"240px"},1fr))`,gap:20}}>
          {isLoading?Array.from({length:6}).map((_,i)=>(
            <div key={i} style={{borderRadius:20,background:"rgba(139,94,60,0.06)",aspectRatio:"4/5",animation:"pulse 1.5s infinite"}}/>
          )):products.map(p=>{
            const img=p.images?.[0]||"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=600&fit=crop";
            const{add}=useCart(store.id,currency);
            const[added,setAdded]=useState(false);
            return(
              <div key={p.id} className="art-card" style={{borderRadius:20,overflow:"hidden",background:"#fff",boxShadow:"0 2px 16px rgba(139,94,60,0.06)",border:"1px solid rgba(139,94,60,0.08)"}}>
                <Link href={`/store/${store.slug}/product/${p.id}`} style={{textDecoration:"none"}}>
                  <div style={{position:"relative",overflow:"hidden"}}>
                    <img src={img} alt={p.name} style={{width:"100%",aspectRatio:"4/3",objectFit:"cover",transition:"transform 0.5s"}}/>
                    {p.inventory!==undefined&&p.inventory<5&&p.inventory>0&&(
                      <div style={{position:"absolute",top:12,left:12,background:"#EF4444",borderRadius:99,padding:"4px 10px"}}>
                        <span style={{fontSize:10,color:"#fff",fontWeight:600,fontFamily:"Inter,sans-serif"}}>Almost Gone</span>
                      </div>
                    )}
                  </div>
                  <div style={{padding:"16px"}}>
                    <p style={{fontSize:12,color:brand,margin:"0 0 4px",fontFamily:"Inter,sans-serif",fontWeight:500}}>{p.category||"Freshly Baked"}</p>
                    <p style={{fontSize:16,fontWeight:500,color:"#1A0F06",margin:"0 0 4px"}}>{p.name}</p>
                    <p style={{fontSize:12,color:"rgba(26,15,6,0.45)",margin:"0 0 12px",fontFamily:"Inter,sans-serif",lineHeight:1.5}}>{(p.description||"").slice(0,60)||"Made fresh daily with the finest ingredients."}{p.description?.length>60?"…":""}</p>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:17,fontWeight:700,color:brand}}>{fmtPrice(p.price,currency)}</span>
                      <button onClick={e=>{e.preventDefault();e.stopPropagation();add(p);setAdded(true);setTimeout(()=>setAdded(false),1500)}}
                        style={{padding:"8px 16px",borderRadius:99,background:added?brand:"rgba(139,94,60,0.1)",border:`1px solid ${added?brand:"rgba(139,94,60,0.2)"}`,color:added?"#FDF8F3":brand,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"Inter,sans-serif",transition:"all 0.2s"}}>
                        {added?"Added ✓":"Add to Bag"}
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <TrustBar brand={brand}/>
      <Newsletter brand={brand}/>
      <StoreFooter store={store} brand={brand}/>
      <CartDrawer store={store} brand={brand} currency={currency}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE: APEX — Fitness/Supplements (High intensity, bold green/black)
// ══════════════════════════════════════════════════════════════════════════════
function ApexTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#39FF14";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);
  const w = useWindowSize();

  return (
    <div style={{minHeight:"100vh",background:"#0A0A0A",color:"#F5F5F5",fontFamily:"'Barlow Condensed','Impact','Arial Narrow',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&display=swap');
        .apex-card{transition:all 0.2s;border:1px solid rgba(57,255,20,0.08)}
        .apex-card:hover{border-color:${brand||"#39FF14"};transform:translateY(-4px);box-shadow:0 16px 32px rgba(57,255,20,0.1)}
        .apex-btn{background:${brand||"#39FF14"};color:#0A0A0A;font-weight:900;font-family:inherit;cursor:pointer;border:none;letter-spacing:0.06em;text-transform:uppercase;transition:all 0.2s}
        .apex-btn:hover{opacity:0.9;box-shadow:0 0 24px rgba(57,255,20,0.4)}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>

      {/* Nav */}
      <header style={{position:"sticky",top:0,zIndex:50,background:"rgba(10,10,10,0.97)",backdropFilter:"blur(20px)",borderBottom:`1px solid rgba(57,255,20,0.1)`}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
          <div style={{fontSize:"clamp(18px,3vw,24px)",fontWeight:900,letterSpacing:"-0.01em",textTransform:"uppercase"}}>{store.name}</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",borderRadius:8,background:"rgba(57,255,20,0.05)",border:"1px solid rgba(57,255,20,0.12)"}}>
              <Search size={13} color={brand}/>
              <input value={search||""} onChange={e=>onSearch?.(e.target.value)} placeholder="Search..." style={{background:"transparent",border:"none",outline:"none",fontSize:13,color:"#F5F5F5",fontFamily:"inherit",width:160}}/>
            </div>
            <button onClick={toggle} className="apex-btn" style={{padding:"8px 18px",borderRadius:8,display:"flex",alignItems:"center",gap:8,fontSize:13}}>
              <ShoppingCart size={13}/>{count>0?`(${count})`:""} BAG
            </button>
          </div>
        </div>
      </header>

      {/* Hero — aggressive */}
      <div style={{background:"#0A0A0A",padding:"clamp(48px,8vw,96px) clamp(16px,4vw,32px)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,right:0,width:"50%",height:"100%",background:`linear-gradient(to left,${brand}06,transparent)`,pointerEvents:"none"}}/>
        <div style={{maxWidth:1280,margin:"0 auto",display:"grid",gridTemplateColumns:w>768?"1fr 1fr":"1fr",gap:32,alignItems:"center",position:"relative",zIndex:1}}>
          <motion.div initial={{opacity:0,x:-24}} animate={{opacity:1,x:0}} transition={{duration:0.6}}>
            <div style={{display:"inline-block",padding:"4px 12px",background:`${brand}15`,border:`1px solid ${brand}30`,marginBottom:16,borderRadius:4}}>
              <span style={{fontSize:11,color:brand,fontWeight:700,letterSpacing:"0.16em"}}>NEW FORMULA</span>
            </div>
            <h1 style={{fontSize:"clamp(52px,10vw,112px)",fontWeight:900,lineHeight:0.85,margin:"0 0 20px",textTransform:"uppercase",letterSpacing:"-0.03em"}}>
              NO<br/>LIMITS<br/><span style={{WebkitTextStroke:`2px ${brand}`,color:"transparent"}}>SET</span>
            </h1>
            <p style={{fontSize:"clamp(14px,2vw,17px)",color:"rgba(245,245,245,0.5)",lineHeight:1.7,maxWidth:440,margin:"0 0 32px",fontFamily:"Arial,sans-serif",fontWeight:400}}>
              {store.description||"Fuel your potential. Science-backed nutrition and training gear for those who never settle."}
            </p>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <a href="#products" className="apex-btn" style={{padding:"14px 36px",borderRadius:8,fontSize:16,textDecoration:"none",color:"#0A0A0A"}}>
                SHOP NOW →
              </a>
              <a href="#programs" style={{padding:"14px 36px",borderRadius:8,border:"1px solid rgba(245,245,245,0.15)",color:"rgba(245,245,245,0.6)",fontSize:16,textDecoration:"none",fontFamily:"inherit"}}>
                OUR STORY
              </a>
            </div>
            <div style={{display:"flex",gap:32,marginTop:40,borderTop:"1px solid rgba(57,255,20,0.1)",paddingTop:24}}>
              {[["10K+","Athletes"],["94%","Success Rate"],["30D","Money Back"]].map(([n,l])=>(
                <div key={l}>
                  <p style={{fontSize:28,fontWeight:900,color:brand,margin:0}}>{n}</p>
                  <p style={{fontSize:11,color:"rgba(245,245,245,0.4)",margin:0,fontFamily:"Arial,sans-serif"}}>{l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {w>768&&products[0]&&(
            <motion.div initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} transition={{duration:0.6,delay:0.2}} style={{position:"relative"}}>
              <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at center,${brand}12,transparent 60%)`,pointerEvents:"none"}}/>
              <img src={products[0].images?.[0]||"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop"} alt={products[0].name}
                style={{width:"100%",borderRadius:4,filter:"contrast(1.1) saturate(1.1)"}}/>
            </motion.div>
          )}
        </div>
      </div>

      {/* Categories */}
      {categories.filter(c=>c!=="All").length>0&&(
        <div style={{borderTop:`1px solid rgba(57,255,20,0.08)`,borderBottom:`1px solid rgba(57,255,20,0.08)`,overflowX:"auto"}}>
          <div style={{maxWidth:1280,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)",display:"flex",gap:0}}>
            {categories.map(c=>(
              <button key={c} onClick={()=>onCategory?.(c)}
                style={{padding:"14px 20px",border:"none",borderBottom:category===c?`3px solid ${brand}`:"3px solid transparent",background:"transparent",color:category===c?brand:"rgba(245,245,245,0.35)",fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:"0.1em",whiteSpace:"nowrap",textTransform:"uppercase",fontFamily:"inherit",transition:"color 0.2s"}}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div id="products" style={{maxWidth:1280,margin:"0 auto",padding:"clamp(40px,6vw,64px) clamp(16px,4vw,32px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:32}}>
          <h2 style={{fontSize:"clamp(32px,5vw,56px)",fontWeight:900,margin:0,textTransform:"uppercase",letterSpacing:"-0.02em"}}>The Stack</h2>
          <span style={{fontSize:11,color:brand,fontWeight:700,letterSpacing:"0.1em"}}>{products.length} PRODUCTS</span>
        </div>

        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${w<640?"44vw":"220px"},1fr))`,gap:12}}>
          {isLoading?Array.from({length:8}).map((_,i)=>(
            <div key={i} style={{borderRadius:8,background:"rgba(57,255,20,0.03)",aspectRatio:"1",animation:"pulse 1.5s infinite"}}/>
          )):products.map(p=>{
            const img=p.images?.[0]||"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop";
            const{add}=useCart(store.id,currency);
            const[added,setAdded]=useState(false);
            const disc=p.comparePrice&&p.comparePrice>p.price?Math.round((1-p.price/p.comparePrice)*100):0;
            return(
              <div key={p.id} className="apex-card" style={{borderRadius:8,overflow:"hidden",background:"rgba(255,255,255,0.02)"}}>
                <Link href={`/store/${store.slug}/product/${p.id}`} style={{textDecoration:"none",display:"block"}}>
                  <div style={{position:"relative",background:"rgba(57,255,20,0.03)"}}>
                    <img src={img} alt={p.name} style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block",filter:"contrast(1.05)"}}/>
                    {disc>0&&<div style={{position:"absolute",top:10,left:10,background:brand,padding:"3px 8px"}}>
                      <span style={{fontSize:10,color:"#0A0A0A",fontWeight:900}}>-{disc}%</span>
                    </div>}
                  </div>
                  <div style={{padding:"14px"}}>
                    <p style={{fontSize:11,color:"rgba(245,245,245,0.3)",margin:"0 0 4px",letterSpacing:"0.08em",textTransform:"uppercase"}}>{p.category||"SUPPLEMENT"}</p>
                    <p style={{fontSize:14,fontWeight:700,color:"#F5F5F5",margin:"0 0 10px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textTransform:"uppercase",letterSpacing:"0.02em"}}>{p.name}</p>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <span style={{fontSize:16,fontWeight:900,color:brand}}>{fmtPrice(p.price,currency)}</span>
                        {p.comparePrice&&<span style={{fontSize:11,color:"rgba(245,245,245,0.25)",textDecoration:"line-through",marginLeft:6}}>{fmtPrice(p.comparePrice,currency)}</span>}
                      </div>
                      <button onClick={e=>{e.preventDefault();e.stopPropagation();add(p);setAdded(true);setTimeout(()=>setAdded(false),1500)}}
                        className="apex-btn" style={{padding:"6px 12px",borderRadius:4,fontSize:10}}>
                        {added?"✓":"ADD"}
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <Newsletter brand={brand} dark/>
      <StoreFooter store={store} brand={brand} dark/>
      <CartDrawer store={store} brand={brand} currency={currency}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE: SAGE — Home/Interior Decor (Earthy minimal, nature-inspired)
// ══════════════════════════════════════════════════════════════════════════════
function SageTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#5B7B5C";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);
  const w = useWindowSize();

  return (
    <div style={{minHeight:"100vh",background:"#F8F6F1",fontFamily:"'Jost','Helvetica Neue',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,200;0,300;0,400;0,500;1,300&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
        .sage-card:hover .sage-img{transform:scale(1.06)!important}
        .sage-card:hover{box-shadow:0 16px 48px rgba(91,123,92,0.12)!important}
        .sage-card{transition:box-shadow 0.4s ease;border-radius:4px;overflow:hidden;background:#fff}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
      `}</style>

      {/* Nav */}
      <header style={{position:"sticky",top:0,zIndex:50,background:"rgba(248,246,241,0.97)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(91,123,92,0.08)"}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
          <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:"clamp(17px,2.5vw,22px)",fontWeight:400,color:"#1C2820",letterSpacing:"0.02em"}}>{store.name}</div>
          <nav style={{display:"flex",gap:"clamp(20px,3vw,40px)",fontSize:13,color:"rgba(28,40,32,0.5)",fontWeight:300,letterSpacing:"0.05em"}}>
            {w>768&&<>
              <a href="#products" style={{textDecoration:"none",color:"inherit"}}>Shop</a>
              <a href="#about" style={{textDecoration:"none",color:"inherit"}}>About</a>
              <a href="#contact" style={{textDecoration:"none",color:"inherit"}}>Contact</a>
            </>}
          </nav>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <Search size={16} color="rgba(28,40,32,0.5)" style={{cursor:"pointer"}}/>
            <button onClick={toggle} style={{position:"relative",background:"none",border:"none",cursor:"pointer"}}>
              <ShoppingCart size={18} color="rgba(28,40,32,0.7)"/>
              {count>0&&<span style={{position:"absolute",top:-5,right:-5,width:14,height:14,borderRadius:"50%",background:brand,color:"#fff",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{count}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero — architectural photography */}
      <div style={{display:"grid",gridTemplateColumns:w>900?"1fr 1fr":"1fr",minHeight:w>900?"600px":"auto"}}>
        <div style={{background:"#EFE9DF",display:"flex",flexDirection:"column",justifyContent:"center",padding:"clamp(40px,8vw,80px) clamp(24px,5vw,64px)"}}>
          <motion.div initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{duration:0.9}}>
            <p style={{fontSize:11,letterSpacing:"0.3em",color:brand,textTransform:"uppercase",marginBottom:20,fontWeight:300}}>New Season · {new Date().getFullYear()}</p>
            <h1 style={{fontFamily:"'Libre Baskerville',serif",fontSize:"clamp(36px,5vw,64px)",fontWeight:400,color:"#1C2820",lineHeight:1.15,margin:"0 0 20px",letterSpacing:"-0.01em"}}>
              Where<br/>Beauty<br/><em>Meets</em><br/>Function.
            </h1>
            <p style={{fontSize:15,color:"rgba(28,40,32,0.55)",lineHeight:1.9,maxWidth:380,margin:"0 0 36px",fontWeight:300}}>
              {store.description||"Thoughtfully curated furniture and decor for homes that inspire. Sustainable materials, timeless design."}
            </p>
            <div style={{display:"flex",gap:12}}>
              <a href="#products" style={{padding:"13px 28px",borderRadius:2,background:"#1C2820",color:"#F8F6F1",fontSize:13,fontWeight:300,textDecoration:"none",letterSpacing:"0.08em"}}>
                EXPLORE
              </a>
              <a href="#about" style={{padding:"13px 28px",borderRadius:2,border:"1px solid rgba(28,40,32,0.2)",color:"rgba(28,40,32,0.7)",fontSize:13,fontWeight:300,textDecoration:"none",letterSpacing:"0.08em"}}>
                LEARN MORE
              </a>
            </div>
          </motion.div>
        </div>
        {w>900&&products[0]&&(
          <div style={{overflow:"hidden",position:"relative"}}>
            <img src={products[0].images?.[0]||"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=700&fit=crop"} alt=""
              style={{width:"100%",height:"100%",objectFit:"cover"}} className="sage-img"/>
          </div>
        )}
      </div>

      {/* Categories */}
      {categories.filter(c=>c!=="All").length>0&&(
        <div style={{padding:"20px clamp(16px,4vw,32px)",background:"#F0ECDF",overflowX:"auto"}}>
          <div style={{display:"flex",gap:0,maxWidth:1200,margin:"0 auto",borderBottom:"1px solid rgba(91,123,92,0.15)"}}>
            {categories.map(c=>(
              <button key={c} onClick={()=>onCategory?.(c)}
                style={{padding:"12px 24px",border:"none",borderBottom:category===c?`1px solid ${brand}`:"1px solid transparent",background:"transparent",color:category===c?brand:"rgba(28,40,32,0.45)",fontSize:12,fontWeight:300,cursor:"pointer",letterSpacing:"0.1em",whiteSpace:"nowrap",textTransform:"uppercase",fontFamily:"inherit",transition:"all 0.2s"}}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products — editorial grid */}
      <div id="products" style={{maxWidth:1200,margin:"0 auto",padding:"clamp(40px,6vw,64px) clamp(16px,4vw,32px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:40}}>
          <h2 style={{fontFamily:"'Libre Baskerville',serif",fontSize:"clamp(26px,4vw,40px)",fontWeight:400,color:"#1C2820",margin:0}}>Collection</h2>
          <span style={{fontSize:12,color:"rgba(28,40,32,0.35)",fontWeight:300,letterSpacing:"0.08em"}}>{products.length} PIECES</span>
        </div>

        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${w<640?"44vw":"260px"},1fr))`,gap:24}}>
          {isLoading?Array.from({length:6}).map((_,i)=>(
            <div key={i} style={{borderRadius:4,background:"rgba(91,123,92,0.06)",aspectRatio:"4/5",animation:"pulse 1.5s infinite"}}/>
          )):products.map(p=>{
            const img=p.images?.[0]||"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=600&fit=crop";
            const{add}=useCart(store.id,currency);
            const[added,setAdded]=useState(false);
            const[hover,setHover]=useState(false);
            return(
              <div key={p.id} className="sage-card">
                <Link href={`/store/${store.slug}/product/${p.id}`} style={{textDecoration:"none",display:"block"}}>
                  <div style={{aspectRatio:"4/5",overflow:"hidden",background:"#F0ECDF"}}>
                    <img src={img} alt={p.name} className="sage-img"
                      style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.7s ease"}}
                      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}/>
                  </div>
                  <div style={{padding:"14px 16px 16px"}}>
                    <p style={{fontSize:11,color:brand,margin:"0 0 4px",fontWeight:300,letterSpacing:"0.1em",textTransform:"uppercase"}}>{p.category||"Decor"}</p>
                    <p style={{fontFamily:"'Libre Baskerville',serif",fontSize:15,color:"#1C2820",margin:"0 0 10px"}}>{p.name}</p>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:16,fontWeight:400,color:"#1C2820"}}>{fmtPrice(p.price,currency)}</span>
                      <button onClick={e=>{e.preventDefault();e.stopPropagation();add(p);setAdded(true);setTimeout(()=>setAdded(false),1500)}}
                        style={{padding:"7px 14px",borderRadius:2,background:added?"#1C2820":"transparent",border:`1px solid ${added?"#1C2820":"rgba(28,40,32,0.2)"}`,color:added?"#F8F6F1":"rgba(28,40,32,0.6)",fontSize:11,fontWeight:300,cursor:"pointer",letterSpacing:"0.06em",fontFamily:"inherit",transition:"all 0.2s"}}>
                        {added?"ADDED":"ADD"}
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <TrustBar brand={brand}/>
      <Newsletter brand={brand}/>
      <StoreFooter store={store} brand={brand}/>
      <CartDrawer store={store} brand={brand} currency={currency}/>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE: DIAMOND — Jewelry (Black velvet, diamond sparkle, ultra-luxury)
// ══════════════════════════════════════════════════════════════════════════════
function DiamondTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#D4AF37";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);
  const w = useWindowSize();
  const [sparkles] = useState(() => Array.from({length:20}).map((_,i) => ({
    x:Math.random()*100, y:Math.random()*100,
    size:Math.random()*3+1, delay:Math.random()*3
  })));

  return (
    <div style={{minHeight:"100vh",background:"#080608",color:"#F0EAD6",fontFamily:"'Cormorant Garamond','Times New Roman',serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&display=swap');
        @keyframes sparkle{0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .diam-card:hover{transform:translateY(-6px)!important}
        .diam-card{transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1)}
        .diam-btn{background:linear-gradient(135deg,${brand||"#D4AF37"},#AA8B26);border:none;color:#080608;cursor:pointer;font-family:inherit;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;font-size:11px;transition:all 0.3s}
        .diam-btn:hover{box-shadow:0 0 24px rgba(212,175,55,0.4);transform:translateY(-1px)}
      `}</style>

      {/* Sparkles */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        {sparkles.map((s,i)=>(
          <div key={i} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:s.size,height:s.size,borderRadius:"50%",background:brand,animation:`sparkle ${2+s.delay}s ease-in-out ${s.delay}s infinite`,opacity:0}}/>
        ))}
      </div>

      {/* Nav */}
      <header style={{position:"sticky",top:0,zIndex:50,background:"rgba(8,6,8,0.97)",backdropFilter:"blur(20px)",borderBottom:`1px solid rgba(212,175,55,0.12)`}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 clamp(20px,4vw,48px)",height:72,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button style={{background:"none",border:"none",cursor:"pointer",color:"rgba(240,234,214,0.5)"}}><Search size={16}/></button>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"clamp(16px,2.5vw,22px)",fontWeight:300,letterSpacing:"0.2em",textTransform:"uppercase"}}>{store.name}</div>
            <div style={{fontSize:9,letterSpacing:"0.4em",color:brand,marginTop:2,fontStyle:"italic"}}>Fine Jewellery</div>
          </div>
          <button onClick={toggle} style={{background:"none",border:"none",cursor:"pointer",position:"relative"}}>
            <ShoppingCart size={16} color="rgba(240,234,214,0.7)"/>
            {count>0&&<span style={{position:"absolute",top:-4,right:-4,width:12,height:12,borderRadius:"50%",background:brand,color:"#080608",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{count}</span>}
          </button>
        </div>
      </header>

      {/* Hero */}
      <div style={{position:"relative",minHeight:"90vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"clamp(48px,8vw,96px) clamp(20px,4vw,48px)",background:"radial-gradient(ellipse at center,#120D10 0%,#080608 70%)"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:`repeating-linear-gradient(45deg,rgba(212,175,55,0.015) 0px,rgba(212,175,55,0.015) 1px,transparent 1px,transparent 60px)`,pointerEvents:"none"}}/>
        <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:1,ease:"easeOut"}} style={{textAlign:"center",maxWidth:640,position:"relative",zIndex:1}}>
          <div style={{width:1,height:60,background:`linear-gradient(to bottom,transparent,${brand},transparent)`,margin:"0 auto 32px"}}/>
          <p style={{fontSize:11,letterSpacing:"0.4em",color:brand,textTransform:"uppercase",marginBottom:20,fontWeight:300}}>The New Collection</p>
          <h1 style={{fontSize:"clamp(48px,8vw,96px)",fontWeight:300,lineHeight:0.92,margin:"0 0 24px",letterSpacing:"-0.01em"}}>
            Eternal<br/><em style={{fontStyle:"italic",color:brand}}>Beauty,</em><br/>Timeless<br/>Grace.
          </h1>
          <p style={{fontSize:"clamp(14px,2vw,16px)",color:"rgba(240,234,214,0.45)",lineHeight:1.9,margin:"0 0 40px",fontWeight:300}}>
            {store.description||"Each piece is a masterwork of craftsmanship. Rare gemstones, precious metals, extraordinary design."}
          </p>
          <a href="#collection" className="diam-btn" style={{display:"inline-block",padding:"14px 40px",textDecoration:"none"}}>
            Explore Collection
          </a>
          <div style={{width:1,height:60,background:`linear-gradient(to bottom,transparent,${brand},transparent)`,margin:"32px auto 0"}}/>
        </motion.div>
      </div>

      {/* Categories */}
      {categories.filter(c=>c!=="All").length>0&&(
        <div style={{borderTop:`1px solid rgba(212,175,55,0.08)`,borderBottom:`1px solid rgba(212,175,55,0.08)`,padding:"0 clamp(20px,4vw,48px)",overflowX:"auto"}}>
          <div style={{maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"center",gap:0}}>
            {categories.map(c=>(
              <button key={c} onClick={()=>onCategory?.(c)}
                style={{padding:"16px 24px",border:"none",borderBottom:category===c?`1px solid ${brand}`:"1px solid transparent",background:"transparent",color:category===c?brand:"rgba(240,234,214,0.3)",fontSize:11,fontWeight:300,cursor:"pointer",letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:"inherit",whiteSpace:"nowrap",transition:"color 0.2s"}}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div id="collection" style={{maxWidth:1200,margin:"0 auto",padding:"clamp(48px,8vw,96px) clamp(20px,4vw,48px)"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <h2 style={{fontSize:"clamp(32px,5vw,52px)",fontWeight:300,margin:"0 0 8px"}}>The Collection</h2>
          <div style={{width:60,height:1,background:`linear-gradient(to right,transparent,${brand},transparent)`,margin:"0 auto"}}/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${w<640?"44vw":"240px"},1fr))`,gap:32}}>
          {isLoading?Array.from({length:6}).map((_,i)=>(
            <div key={i} style={{borderRadius:4,background:"rgba(212,175,55,0.04)",aspectRatio:"2/3",animation:"pulse 1.5s infinite"}}/>
          )):products.map(p=>{
            const img=p.images?.[0]||"https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=700&fit=crop";
            const{add}=useCart(store.id,currency);
            const[added,setAdded]=useState(false);
            const[hover,setHov]=useState(false);
            return(
              <div key={p.id} className="diam-card">
                <Link href={`/store/${store.slug}/product/${p.id}`} style={{textDecoration:"none"}}>
                  <div style={{position:"relative",aspectRatio:"2/3",overflow:"hidden",background:"#110D0E"}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
                    <img src={img} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.8s ease",transform:hover?"scale(1.08)":"scale(1)"}}/>
                    <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(8,6,8,0.8),transparent 50%)"}}/> 
                    <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"20px",opacity:hover?1:0,transition:"opacity 0.3s"}}>
                      <button onClick={e=>{e.preventDefault();e.stopPropagation();add(p);setAdded(true);setTimeout(()=>setAdded(false),1600)}}
                        className="diam-btn" style={{width:"100%",padding:"12px 0"}}>
                        {added?"ADDED TO BAG ✓":"ADD TO BAG"}
                      </button>
                    </div>
                    <button onClick={e=>{e.preventDefault();e.stopPropagation();}} style={{position:"absolute",top:14,right:14,width:32,height:32,borderRadius:"50%",background:"rgba(8,6,8,0.6)",backdropFilter:"blur(8px)",border:`1px solid rgba(212,175,55,0.2)`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Heart size={13} color={brand}/>
                    </button>
                  </div>
                  <div style={{padding:"16px 0 24px",borderBottom:`1px solid rgba(212,175,55,0.08)`}}>
                    <p style={{fontSize:11,color:"rgba(240,234,214,0.35)",letterSpacing:"0.12em",textTransform:"uppercase",margin:"0 0 6px",fontWeight:300}}>{p.category||"Fine Jewellery"}</p>
                    <p style={{fontSize:16,fontWeight:300,color:"#F0EAD6",margin:"0 0 8px",lineHeight:1.3}}>{p.name}</p>
                    <p style={{fontSize:15,color:brand,fontWeight:600,margin:0}}>{fmtPrice(p.price,currency)}</p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <Newsletter brand={brand} dark/>
      <StoreFooter store={store} brand={brand} dark/>
      <CartDrawer store={store} brand={brand} currency={currency}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE: KODIAK — Sneakers/Kicks (Urban editorial, black/white bold)
// ══════════════════════════════════════════════════════════════════════════════
function KodiakTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#FF6B35";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);
  const w = useWindowSize();
  const [featIdx, setFeatIdx] = useState(0);

  return (
    <div style={{minHeight:"100vh",background:"#EFEFEF",fontFamily:"'Neue Haas Grotesk','Helvetica Neue','Arial',sans-serif",overflowX:"hidden"}}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .kod-card{transition:all 0.2s;cursor:pointer}
        .kod-card:hover{transform:scale(1.02)}
        .kod-btn{border:none;cursor:pointer;font-family:inherit;font-weight:700;letter-spacing:-0.01em;transition:all 0.15s}
      `}</style>

      {/* Nav */}
      <header style={{position:"sticky",top:0,zIndex:50,background:"rgba(239,239,239,0.97)",backdropFilter:"blur(20px)",borderBottom:"2px solid #111"}}>
        <div style={{maxWidth:1400,margin:"0 auto",padding:"0 clamp(16px,3vw,32px)",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
          <div style={{fontSize:"clamp(16px,2.5vw,22px)",fontWeight:900,letterSpacing:"-0.04em",color:"#111"}}>{store.name.toUpperCase()}</div>
          <div style={{display:"flex",alignItems:"center",gap:16,flex:1,maxWidth:320,padding:"8px 14px",borderRadius:4,border:"2px solid #111",background:"transparent"}}>
            <Search size={13} color="#111"/>
            <input value={search||""} onChange={e=>onSearch?.(e.target.value)} placeholder="Search kicks..." style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:13,color:"#111",fontFamily:"inherit",fontWeight:500}}/>
          </div>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <button onClick={toggle} className="kod-btn" style={{background:"#111",color:"#EFEFEF",padding:"9px 18px",borderRadius:4,fontSize:13,display:"flex",alignItems:"center",gap:8}}>
              <ShoppingCart size={13}/> BAG ({count})
            </button>
          </div>
        </div>
      </header>

      {/* Hero — split asymmetric */}
      <div style={{display:"grid",gridTemplateColumns:w>768?"55% 45%":"1fr",minHeight:w>768?"90vh":"auto",borderBottom:"2px solid #111"}}>
        <div style={{background:"#111",padding:"clamp(48px,8vw,80px) clamp(24px,5vw,56px)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
          <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.7}}>
            <div style={{display:"inline-block",background:brand,padding:"4px 12px",marginBottom:20}}>
              <span style={{fontSize:11,fontWeight:900,color:"#111",letterSpacing:"0.12em"}}>DROP SS25</span>
            </div>
            <h1 style={{fontSize:"clamp(52px,9vw,108px)",fontWeight:900,color:"#EFEFEF",lineHeight:0.88,margin:"0 0 24px",letterSpacing:"-0.05em"}}>
              STEP<br/>INTO<br/><span style={{color:brand}}>LEGEND</span>
            </h1>
            <p style={{fontSize:15,color:"rgba(239,239,239,0.5)",lineHeight:1.7,maxWidth:400,margin:"0 0 36px",fontWeight:400}}>
              {store.description||"Limited drops. Exclusive colorways. Footwear that defines your moment."}
            </p>
            <div style={{display:"flex",gap:10}}>
              <a href="#products" className="kod-btn" style={{padding:"14px 32px",background:brand,color:"#111",fontSize:14,textDecoration:"none",borderRadius:4}}>
                SHOP DROP →
              </a>
              <a href="#releases" className="kod-btn" style={{padding:"14px 32px",background:"transparent",color:"rgba(239,239,239,0.6)",fontSize:14,textDecoration:"none",border:"1px solid rgba(239,239,239,0.2)",borderRadius:4}}>
                RELEASES
              </a>
            </div>
          </motion.div>
        </div>
        {w>768&&products[0]&&(
          <div style={{background:"#E8E4DC",display:"flex",alignItems:"center",justifyContent:"center",padding:32,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:-20,background:`repeating-linear-gradient(-45deg,rgba(0,0,0,0.02) 0px,rgba(0,0,0,0.02) 1px,transparent 1px,transparent 20px)`}}/>
            <motion.img initial={{opacity:0,x:20,rotate:5}} animate={{opacity:1,x:0,rotate:-3}} transition={{duration:0.8,delay:0.3}}
              src={products[featIdx].images?.[0]||"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"} alt={products[featIdx].name}
              style={{width:"90%",maxWidth:400,filter:"drop-shadow(0 24px 48px rgba(0,0,0,0.2))",position:"relative",zIndex:1}}/>
          </div>
        )}
      </div>

      {/* Category tabs */}
      {categories.filter(c=>c!=="All").length>0&&(
        <div style={{borderBottom:"2px solid #111",overflowX:"auto",background:"#EFEFEF"}}>
          <div style={{maxWidth:1400,margin:"0 auto",padding:"0 clamp(16px,3vw,32px)",display:"flex",gap:0}}>
            {categories.map(c=>(
              <button key={c} onClick={()=>onCategory?.(c)}
                style={{padding:"14px 20px",border:"none",borderBottom:category===c?`4px solid ${brand}`:"4px solid transparent",background:"transparent",color:category===c?"#111":"rgba(17,17,17,0.4)",fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:"0.06em",whiteSpace:"nowrap",textTransform:"uppercase",fontFamily:"inherit",transition:"all 0.15s"}}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div id="products" style={{maxWidth:1400,margin:"0 auto",padding:"clamp(32px,5vw,56px) clamp(16px,3vw,32px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:24}}>
          <h2 style={{fontSize:"clamp(28px,5vw,52px)",fontWeight:900,margin:0,letterSpacing:"-0.04em",color:"#111"}}>ALL STYLES</h2>
          <span style={{fontSize:12,color:"rgba(17,17,17,0.4)",fontWeight:700,letterSpacing:"0.06em"}}>{products.length} PAIRS</span>
        </div>

        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${w<640?"44vw":"220px"},1fr))`,gap:16}}>
          {isLoading?Array.from({length:8}).map((_,i)=>(
            <div key={i} style={{background:"#E8E4DC",aspectRatio:"1",borderRadius:4,animation:"pulse 1.5s infinite"}}/>
          )):products.map((p,idx)=>{
            const img=p.images?.[0]||"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop";
            const{add}=useCart(store.id,currency);
            const[added,setAdded]=useState(false);
            return(
              <div key={p.id} className="kod-card" onClick={()=>setFeatIdx(idx%products.length)}>
                <Link href={`/store/${store.slug}/product/${p.id}`} style={{textDecoration:"none",display:"block"}}>
                  <div style={{background:"#E8E4DC",borderRadius:4,overflow:"hidden",position:"relative",marginBottom:12}}>
                    <img src={img} alt={p.name} style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block"}}/>
                    {idx<4&&<div style={{position:"absolute",top:10,left:10,background:brand,padding:"3px 8px"}}>
                      <span style={{fontSize:9,fontWeight:900,color:"#111",letterSpacing:"0.1em"}}>NEW</span>
                    </div>}
                    <button onClick={e=>{e.preventDefault();e.stopPropagation();add(p);setAdded(true);setTimeout(()=>setAdded(false),1500)}}
                      className="kod-btn" style={{position:"absolute",bottom:10,right:10,padding:"6px 14px",background:added?"#111":"rgba(239,239,239,0.95)",color:added?"#EFEFEF":"#111",fontSize:11,borderRadius:4}}>
                      {added?"COPPED ✓":"COP"}
                    </button>
                  </div>
                  <div>
                    <p style={{fontSize:11,color:"rgba(17,17,17,0.4)",margin:"0 0 3px",fontWeight:700,letterSpacing:"0.06em"}}>{p.category||"FOOTWEAR"}</p>
                    <p style={{fontSize:14,fontWeight:700,color:"#111",margin:"0 0 4px",letterSpacing:"-0.01em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</p>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:15,fontWeight:900,color:brand}}>{fmtPrice(p.price,currency)}</span>
                      {p.comparePrice&&<span style={{fontSize:12,color:"rgba(17,17,17,0.3)",textDecoration:"line-through"}}>{fmtPrice(p.comparePrice,currency)}</span>}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <Newsletter brand={brand}/>
      <StoreFooter store={store} brand={brand}/>
      <CartDrawer store={store} brand={brand} currency={currency}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE: NOVA — Futuristic/Cyberpunk (Neon purple/pink, dark, immersive)
// ══════════════════════════════════════════════════════════════════════════════
function NovaTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#BF5AF2";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);
  const w = useWindowSize();
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const t = setInterval(() => { setGlitch(true); setTimeout(()=>setGlitch(false), 100); }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{minHeight:"100vh",background:"#080012",color:"#E8E0FF",fontFamily:"'Share Tech Mono','Courier New',monospace",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Exo+2:wght@300;400;600;700;800;900&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes flicker{0%,100%{opacity:1}92%{opacity:1}94%{opacity:0.3}96%{opacity:1}98%{opacity:0.5}}
        @keyframes scan{0%{background-position:0 0}100%{background-position:0 100vh}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px ${brand},0 0 24px ${brand}30}50%{box-shadow:0 0 16px ${brand},0 0 48px ${brand}50}}
        .nova-card{transition:all 0.3s;border:1px solid rgba(191,90,242,0.1)}
        .nova-card:hover{border-color:${brand};transform:translateY(-4px);animation:glow 2s ease-in-out infinite}
        .nova-btn{background:linear-gradient(135deg,${brand},#7F33D3);border:none;color:#fff;cursor:pointer;font-family:inherit;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;transition:all 0.2s}
        .nova-btn:hover{opacity:0.9;box-shadow:0 0 32px rgba(191,90,242,0.5)}
        .glitch{animation:flicker 0.1s 2}
      `}</style>

      {/* Scanline overlay */}
      <div style={{position:"fixed",inset:0,backgroundImage:"repeating-linear-gradient(transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",pointerEvents:"none",zIndex:999,opacity:0.3}}/>

      {/* Nav */}
      <header style={{position:"sticky",top:0,zIndex:50,background:"rgba(8,0,18,0.97)",backdropFilter:"blur(20px)",borderBottom:`1px solid rgba(191,90,242,0.15)`}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)",height:60,display:"flex",alignItems:"center",gap:16}}>
          <div style={{fontSize:"clamp(15px,2.5vw,20px)",fontWeight:900,letterSpacing:"0.06em",fontFamily:"'Exo 2',sans-serif",color:"#E8E0FF",textTransform:"uppercase"}} className={glitch?"glitch":""}>{store.name}</div>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8,padding:"7px 14px",borderRadius:6,background:"rgba(191,90,242,0.06)",border:"1px solid rgba(191,90,242,0.15)",maxWidth:300,marginLeft:"auto"}}>
            <Search size={12} color={brand}/>
            <input value={search||""} onChange={e=>onSearch?.(e.target.value)} placeholder="SEARCH_" style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:12,color:"#E8E0FF",fontFamily:"inherit"}}/>
          </div>
          <button onClick={toggle} className="nova-btn" style={{padding:"7px 16px",borderRadius:6,display:"flex",alignItems:"center",gap:8,fontSize:12}}>
            BAG [{count}]
          </button>
        </div>
      </header>

      {/* Hero */}
      <div style={{padding:"clamp(60px,10vw,120px) clamp(16px,4vw,32px)",position:"relative",overflow:"hidden"}}>
        {/* Grid */}
        <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(rgba(191,90,242,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(191,90,242,0.04) 1px,transparent 1px)`,backgroundSize:"60px 60px",pointerEvents:"none"}}/>
        {/* Glow orb */}
        <div style={{position:"absolute",top:"20%",right:"10%",width:400,height:400,borderRadius:"50%",background:`radial-gradient(circle,${brand}20,transparent 70%)`,pointerEvents:"none"}}/>

        <div style={{maxWidth:1280,margin:"0 auto",display:"grid",gridTemplateColumns:w>768?"1fr 1fr":"1fr",gap:48,alignItems:"center",position:"relative",zIndex:1}}>
          <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.8}}>
            <div style={{fontSize:11,color:brand,fontFamily:"'Share Tech Mono',monospace",marginBottom:16,letterSpacing:"0.08em"}}>
              &gt; LOADING_COLLECTION_2025.exe
            </div>
            <h1 style={{fontSize:"clamp(44px,8vw,88px)",fontWeight:900,lineHeight:0.9,margin:"0 0 20px",letterSpacing:"-0.04em",fontFamily:"'Exo 2',sans-serif"}}>
              THE<br/><span style={{color:brand,textShadow:`0 0 24px ${brand}`}}>FUTURE</span><br/>DROPS<br/>NOW.
            </h1>
            <p style={{fontSize:14,color:"rgba(232,224,255,0.45)",lineHeight:1.8,maxWidth:440,margin:"0 0 36px",fontFamily:"'Share Tech Mono',monospace"}}>
              {store.description||"Next-gen products for a next-gen world. Cutting-edge design meets unmatched performance."}
            </p>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              <a href="#products" className="nova-btn" style={{padding:"14px 32px",borderRadius:8,textDecoration:"none",color:"#fff",fontSize:13}}>
                INITIALIZE SHOP →
              </a>
              <a href="#genesis" style={{padding:"14px 32px",borderRadius:8,border:`1px solid rgba(191,90,242,0.3)`,color:brand,fontSize:13,textDecoration:"none",fontFamily:"inherit",fontWeight:600}}>
                [GENESIS DROP]
              </a>
            </div>
          </motion.div>

          {w>768&&products[0]&&(
            <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{duration:0.8,delay:0.3}} style={{position:"relative"}}>
              <div style={{position:"absolute",inset:-1,borderRadius:16,background:`linear-gradient(135deg,${brand},transparent 60%)`,zIndex:0}}/>
              <img src={products[0].images?.[0]||"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=600&fit=crop"} alt={products[0].name}
                style={{width:"100%",borderRadius:15,filter:"saturate(1.2) contrast(1.1)",position:"relative",zIndex:1,display:"block"}}/>
            </motion.div>
          )}
        </div>
      </div>

      {/* Categories */}
      {categories.filter(c=>c!=="All").length>0&&(
        <div style={{borderTop:`1px solid rgba(191,90,242,0.08)`,overflowX:"auto"}}>
          <div style={{maxWidth:1280,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)",display:"flex",gap:0}}>
            {categories.map(c=>(
              <button key={c} onClick={()=>onCategory?.(c)}
                style={{padding:"14px 20px",border:"none",borderBottom:category===c?`2px solid ${brand}`:"2px solid transparent",background:"transparent",color:category===c?brand:"rgba(232,224,255,0.3)",fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:"0.1em",whiteSpace:"nowrap",textTransform:"uppercase",fontFamily:"inherit",transition:"color 0.2s"}}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div id="products" style={{maxWidth:1280,margin:"0 auto",padding:"clamp(40px,6vw,64px) clamp(16px,4vw,32px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
          <h2 style={{fontSize:"clamp(24px,4vw,40px)",fontWeight:900,margin:0,fontFamily:"'Exo 2',sans-serif",letterSpacing:"-0.03em"}}>
            &gt; CATALOG_
          </h2>
          <span style={{fontSize:11,color:brand,fontFamily:"monospace",letterSpacing:"0.08em"}}>[{products.length} ITEMS]</span>
        </div>

        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${w<640?"44vw":"220px"},1fr))`,gap:16}}>
          {isLoading?Array.from({length:8}).map((_,i)=>(
            <div key={i} style={{borderRadius:12,background:"rgba(191,90,242,0.04)",aspectRatio:"1",animation:"pulse 1.5s infinite",border:"1px solid rgba(191,90,242,0.08)"}}/>
          )):products.map(p=>{
            const img=p.images?.[0]||"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&h=500&fit=crop";
            const{add}=useCart(store.id,currency);
            const[added,setAdded]=useState(false);
            return(
              <div key={p.id} className="nova-card" style={{borderRadius:12,overflow:"hidden",background:"rgba(191,90,242,0.02)"}}>
                <Link href={`/store/${store.slug}/product/${p.id}`} style={{textDecoration:"none",display:"block"}}>
                  <div style={{position:"relative",background:"rgba(191,90,242,0.04)"}}>
                    <img src={img} alt={p.name} style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block",filter:"saturate(1.1)"}}/>
                    <div style={{position:"absolute",inset:0,background:`linear-gradient(to top,rgba(8,0,18,0.7),transparent 50%)`}}/>
                  </div>
                  <div style={{padding:"14px 16px 16px"}}>
                    <p style={{fontSize:10,color:"rgba(232,224,255,0.3)",margin:"0 0 4px",letterSpacing:"0.1em",fontFamily:"monospace"}}>{p.category?.toUpperCase()||"// PRODUCT"}</p>
                    <p style={{fontSize:14,fontWeight:700,color:"#E8E0FF",margin:"0 0 10px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Exo 2',sans-serif"}}>{p.name}</p>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:16,fontWeight:900,color:brand,textShadow:`0 0 12px ${brand}60`}}>{fmtPrice(p.price,currency)}</span>
                      <button onClick={e=>{e.preventDefault();e.stopPropagation();add(p);setAdded(true);setTimeout(()=>setAdded(false),1500)}}
                        className="nova-btn" style={{padding:"6px 14px",borderRadius:6,fontSize:11}}>
                        {added?"[OK]":"BUY"}
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <Newsletter brand={brand} dark/>
      <StoreFooter store={store} brand={brand} dark/>
      <CartDrawer store={store} brand={brand} currency={currency}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE: DUSK — Hotel/Travel/Hospitality (Warm luxury, booking-focused)
// ══════════════════════════════════════════════════════════════════════════════
function DuskTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#9B7B4E";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);
  const w = useWindowSize();
  const [activeRoom, setActiveRoom] = useState(0);
  const rooms = products.slice(0,4);

  return (
    <div style={{minHeight:"100vh",background:"#FDFAF5",fontFamily:"'Garamond','Georgia',serif",color:"#1E1610"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Garamond:ital,wght@0,400;0,700;1,400&family=Quattrocento+Sans:wght@400;700&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .dusk-card:hover{box-shadow:0 24px 64px rgba(155,123,78,0.15)!important;transform:translateY(-6px)!important}
        .dusk-card{transition:all 0.4s ease!important}
      `}</style>

      {/* Nav */}
      <header style={{position:"sticky",top:0,zIndex:50,background:"rgba(253,250,245,0.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(155,123,78,0.1)"}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"0 clamp(20px,4vw,48px)",height:72,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
          <div style={{fontSize:"clamp(18px,2.5vw,24px)",fontWeight:700,color:"#1E1610",fontStyle:"italic",letterSpacing:"0.02em"}}>{store.name}</div>
          <nav style={{display:"flex",gap:"clamp(20px,3vw,40px)",fontSize:13,color:"rgba(30,22,16,0.5)",fontFamily:"'Quattrocento Sans',sans-serif",letterSpacing:"0.04em"}}>
            {w>768&&<>
              <a href="#rooms" style={{textDecoration:"none",color:"inherit"}}>Rooms</a>
              <a href="#experience" style={{textDecoration:"none",color:"inherit"}}>Experience</a>
              <a href="#contact" style={{textDecoration:"none",color:"inherit"}}>Contact</a>
            </>}
          </nav>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <button onClick={toggle} style={{background:brand,border:"none",borderRadius:4,padding:"10px 20px",cursor:"pointer",color:"#FDFAF5",fontFamily:"'Quattrocento Sans',sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:8}}>
              <ShoppingCart size={12}/>{count>0?`(${count})`:"BOOK"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero — full bleed landscape */}
      <div style={{position:"relative",height:"90vh",overflow:"hidden"}}>
        <AnimatePresence mode="wait">
          <motion.img key={activeRoom} initial={{opacity:0,scale:1.05}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:1.2}}
            src={rooms[activeRoom]?.images?.[0]||"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=900&fit=crop"} alt=""
            style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.65)"}}/>
        </AnimatePresence>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(30,22,16,0.6) 30%,transparent)",display:"flex",alignItems:"flex-end",padding:"clamp(40px,6vw,80px) clamp(20px,4vw,48px)"}}>
          <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.9,delay:0.3}} style={{maxWidth:600}}>
            <p style={{fontSize:11,letterSpacing:"0.3em",color:`rgba(253,250,245,0.6)`,textTransform:"uppercase",marginBottom:16,fontFamily:"'Quattrocento Sans',sans-serif"}}>Premium Hospitality</p>
            <h1 style={{fontSize:"clamp(44px,7vw,80px)",fontWeight:700,color:"#FDFAF5",lineHeight:1.0,margin:"0 0 20px",letterSpacing:"-0.01em"}}>
              Where Every<br/>Moment<br/><em style={{color:brand}}>Becomes</em><br/>a Memory.
            </h1>
            <div style={{display:"flex",gap:12}}>
              <a href="#rooms" style={{padding:"14px 28px",borderRadius:2,background:brand,color:"#FDFAF5",fontSize:13,fontWeight:700,textDecoration:"none",fontFamily:"'Quattrocento Sans',sans-serif",letterSpacing:"0.04em",textTransform:"uppercase"}}>
                BOOK YOUR STAY
              </a>
            </div>
          </motion.div>
        </div>
        {/* Room selector dots */}
        <div style={{position:"absolute",bottom:24,right:48,display:"flex",gap:8}}>
          {rooms.map((_,i)=>(<button key={i} onClick={()=>setActiveRoom(i)} style={{width:i===activeRoom?32:8,height:4,borderRadius:99,background:i===activeRoom?"#FDFAF5":"rgba(253,250,245,0.4)",border:"none",cursor:"pointer",transition:"width 0.3s"}}/>))}
        </div>
      </div>

      {/* Products/Rooms */}
      <div id="rooms" style={{maxWidth:1280,margin:"0 auto",padding:"clamp(48px,8vw,96px) clamp(20px,4vw,48px)"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <p style={{fontSize:11,letterSpacing:"0.3em",color:brand,textTransform:"uppercase",marginBottom:12,fontFamily:"'Quattrocento Sans',sans-serif"}}>Our Offerings</p>
          <h2 style={{fontSize:"clamp(32px,5vw,52px)",fontWeight:700,margin:0,color:"#1E1610"}}>Rooms & Suites</h2>
        </div>

        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${w<640?"100%":"320px"},1fr))`,gap:24}}>
          {isLoading?Array.from({length:4}).map((_,i)=>(
            <div key={i} style={{borderRadius:4,background:"rgba(155,123,78,0.06)",aspectRatio:"3/2",animation:"pulse 1.5s infinite"}}/>
          )):products.map(p=>{
            const img=p.images?.[0]||"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop";
            const{add}=useCart(store.id,currency);
            const[added,setAdded]=useState(false);
            return(
              <div key={p.id} className="dusk-card" style={{borderRadius:4,overflow:"hidden",background:"#fff",boxShadow:"0 4px 24px rgba(155,123,78,0.06)",border:"1px solid rgba(155,123,78,0.08)"}}>
                <div style={{position:"relative",overflow:"hidden"}}>
                  <img src={img} alt={p.name} style={{width:"100%",aspectRatio:"3/2",objectFit:"cover",transition:"transform 0.6s ease",display:"block"}}/>
                  <div style={{position:"absolute",top:16,right:16,background:"rgba(253,250,245,0.95)",borderRadius:2,padding:"4px 10px"}}>
                    <span style={{fontSize:12,color:brand,fontWeight:700,fontFamily:"'Quattrocento Sans',sans-serif"}}>{p.category||"Deluxe"}</span>
                  </div>
                </div>
                <div style={{padding:"20px"}}>
                  <h3 style={{fontSize:20,fontWeight:700,color:"#1E1610",margin:"0 0 8px",fontStyle:"italic"}}>{p.name}</h3>
                  <p style={{fontSize:13,color:"rgba(30,22,16,0.5)",margin:"0 0 16px",lineHeight:1.6,fontFamily:"'Quattrocento Sans',sans-serif"}}>{(p.description||"Experience unparalleled luxury and comfort.").slice(0,80)}</p>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <span style={{fontSize:22,fontWeight:700,color:brand}}>{fmtPrice(p.price,currency)}</span>
                      <span style={{fontSize:12,color:"rgba(30,22,16,0.4)",fontFamily:"'Quattrocento Sans',sans-serif"}}>/night</span>
                    </div>
                    <button onClick={()=>{add(p);setAdded(true);setTimeout(()=>setAdded(false),1500)}}
                      style={{padding:"10px 20px",background:added?"#1E1610":brand,border:"none",color:"#FDFAF5",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Quattrocento Sans',sans-serif",letterSpacing:"0.04em",textTransform:"uppercase",borderRadius:2,transition:"all 0.2s"}}>
                      {added?"BOOKED ✓":"BOOK NOW"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TrustBar brand={brand}/>
      <Newsletter brand={brand}/>
      <StoreFooter store={store} brand={brand}/>
      <CartDrawer store={store} brand={brand} currency={currency}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE: KIDS — Children's Store (Playful, colorful, rounded, joyful)
// ══════════════════════════════════════════════════════════════════════════════
function KidsTemplate({ store, products = [], search, onSearch, category, onCategory, categories = [], isLoading }: TemplateProps) {
  const brand    = store.primaryColor || "#FF6B9D";
  const currency = store.currency || "NGN";
  const { count, toggle } = useCart(store.id, currency);
  const w = useWindowSize();
  const colors = ["#FF6B9D","#FFC107","#4ECDC4","#95E1D3","#F38181","#8BC34A"];

  return (
    <div style={{minHeight:"100vh",background:"#FFFEF5",fontFamily:"'Nunito','Comic Sans MS',cursive,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&display=swap');
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes wiggle{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
        .kids-card:hover{transform:scale(1.04) rotate(-1deg)!important}
        .kids-card{transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1)!important}
        .kids-btn{cursor:pointer;font-family:inherit;font-weight:800;border:none;transition:all 0.15s}
        .kids-btn:hover{transform:scale(1.05)!important}
      `}</style>

      {/* Nav */}
      <header style={{position:"sticky",top:0,zIndex:50,background:"rgba(255,254,245,0.97)",backdropFilter:"blur(16px)",borderBottom:`3px solid ${brand}`,boxShadow:`0 4px 0 ${brand}20`}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
          <div style={{fontSize:"clamp(18px,3vw,26px)",fontWeight:900,color:brand,letterSpacing:"-0.01em",display:"flex",alignItems:"center",gap:8}}>
            <span style={{animation:"wiggle 2s ease-in-out infinite",display:"inline-block"}}>🌈</span>
            {store.name}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:99,background:"rgba(255,107,157,0.08)",border:`2px solid ${brand}20`,flex:1,maxWidth:280}}>
            <Search size={14} color={brand}/>
            <input value={search||""} onChange={e=>onSearch?.(e.target.value)} placeholder="Find something fun..." style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:13,color:"#333",fontFamily:"inherit"}}/>
          </div>
          <button onClick={toggle} className="kids-btn" style={{background:brand,color:"#fff",padding:"9px 18px",borderRadius:99,fontSize:13,display:"flex",alignItems:"center",gap:8,boxShadow:`0 4px 12px ${brand}40`}}>
            🛒 ({count})
          </button>
        </div>
      </header>

      {/* Hero */}
      <div style={{background:`linear-gradient(135deg,#FFF5FB 0%,#F5FFFD 50%,#FFFDF5 100%)`,padding:"clamp(40px,7vw,80px) clamp(16px,4vw,32px)",position:"relative",overflow:"hidden"}}>
        {/* Floating emojis */}
        {["🎈","⭐","🌟","🎁","🦋","🌸"].map((e,i)=>(
          <div key={i} style={{position:"absolute",fontSize:24,opacity:0.3,animation:`bounce ${2+i*0.4}s ease-in-out ${i*0.5}s infinite`,left:`${10+i*15}%`,top:`${20+i%3*30}%`,pointerEvents:"none"}}>
            {e}
          </div>
        ))}

        <div style={{maxWidth:1280,margin:"0 auto",display:"grid",gridTemplateColumns:w>768?"1fr 1fr":"1fr",gap:32,alignItems:"center",position:"relative",zIndex:1}}>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:99,background:`${brand}15`,marginBottom:16}}>
              <span style={{fontSize:14}}>✨</span>
              <span style={{fontSize:12,color:brand,fontWeight:700}}>New Arrivals Just In!</span>
            </div>
            <h1 style={{fontSize:"clamp(40px,6vw,72px)",fontWeight:900,color:"#1A1A2E",lineHeight:1.1,margin:"0 0 16px"}}>
              Fun Stuff<br/>for Little<br/><span style={{color:brand}}>Explorers! 🚀</span>
            </h1>
            <p style={{fontSize:16,color:"rgba(26,26,46,0.55)",lineHeight:1.7,maxWidth:440,margin:"0 0 32px",fontWeight:600}}>
              {store.description||"Quality toys, clothes and accessories that spark imagination and bring big smiles."}
            </p>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              <a href="#products" className="kids-btn" style={{padding:"14px 32px",borderRadius:99,background:`linear-gradient(135deg,${brand},#E84393)`,color:"#fff",fontSize:15,textDecoration:"none",boxShadow:`0 8px 24px ${brand}40`}}>
                Shop Now! 🎉
              </a>
              <a href="#categories" className="kids-btn" style={{padding:"14px 32px",borderRadius:99,border:`2px solid ${brand}`,color:brand,fontSize:15,textDecoration:"none",background:"rgba(255,107,157,0.06)"}}>
                By Age 👶
              </a>
            </div>
          </motion.div>
          {w>768&&(
            <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:0.7,delay:0.2}} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {products.slice(0,4).map((p,i)=>{
                const img=p.images?.[0]||`https://images.unsplash.com/photo-${["1558618666-fcd25c85cd64","1587654780291-39c9404d746b","1603988492906-4a8c1cc68fe4","1555252333-9f8e92e65df9"][i]||"1558618666-fcd25c85cd64"}?w=300&h=300&fit=crop`;
                return(
                  <div key={p.id||i} style={{borderRadius:20,overflow:"hidden",marginTop:i%2===1?20:0,border:`3px solid ${colors[i%colors.length]}40`,boxShadow:`0 4px 16px ${colors[i%colors.length]}20`}}>
                    <img src={img} alt={p.name} style={{width:"100%",aspectRatio:"1",objectFit:"cover"}}/>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Category bubbles */}
      {categories.filter(c=>c!=="All").length>0&&(
        <div style={{padding:"24px clamp(16px,4vw,32px)",overflowX:"auto",background:"#FFFEF5"}}>
          <div style={{display:"flex",gap:10,maxWidth:1280,margin:"0 auto",justifyContent:"center",flexWrap:"wrap"}}>
            {categories.map((c,i)=>(
              <button key={c} onClick={()=>onCategory?.(c)} className="kids-btn"
                style={{padding:"10px 20px",borderRadius:99,border:`2px solid ${category===c?colors[i%colors.length]:"rgba(0,0,0,0.1)"}`,background:category===c?colors[i%colors.length]:"transparent",color:category===c?"#fff":"rgba(0,0,0,0.5)",fontSize:13,fontWeight:700}}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div id="products" style={{maxWidth:1280,margin:"0 auto",padding:"clamp(32px,5vw,56px) clamp(16px,4vw,32px)"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#1A1A2E",margin:"0 0 8px"}}>
            🎪 Our Goodies
          </h2>
          <p style={{fontSize:14,color:"rgba(26,26,46,0.5)",margin:0,fontWeight:600}}>Kids go crazy for these!</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${w<640?"44vw":"220px"},1fr))`,gap:20}}>
          {isLoading?Array.from({length:8}).map((_,i)=>(
            <div key={i} style={{borderRadius:20,background:"rgba(255,107,157,0.06)",aspectRatio:"1",animation:"pulse 1.5s infinite"}}/>
          )):products.map((p,idx)=>{
            const img=p.images?.[0]||"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop";
            const{add}=useCart(store.id,currency);
            const[added,setAdded]=useState(false);
            const c=colors[idx%colors.length];
            return(
              <div key={p.id} className="kids-card" style={{position:"relative"}}>
                <Link href={`/store/${store.slug}/product/${p.id}`} style={{textDecoration:"none",display:"block"}}>
                  <div style={{borderRadius:20,overflow:"hidden",background:`${c}12`,border:`2px solid ${c}30`,boxShadow:`0 4px 16px ${c}20`}}>
                    <div style={{position:"relative",padding:"12px",background:`${c}10`}}>
                      <img src={img} alt={p.name} style={{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:14,display:"block"}}/>
                      {idx<3&&<div style={{position:"absolute",top:20,left:20,background:c,borderRadius:99,padding:"4px 10px",boxShadow:`0 2px 8px ${c}50`}}>
                        <span style={{fontSize:10,color:"#fff",fontWeight:800}}>⭐ TOP PICK</span>
                      </div>}
                    </div>
                    <div style={{padding:"12px 14px 14px"}}>
                      <p style={{fontSize:14,fontWeight:800,color:"#1A1A2E",margin:"0 0 4px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</p>
                      <p style={{fontSize:12,color:"rgba(26,26,46,0.45)",margin:"0 0 12px",fontWeight:600}}>{p.category||"For Kids"}</p>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:17,fontWeight:900,color:c}}>{fmtPrice(p.price,currency)}</span>
                        <button onClick={e=>{e.preventDefault();e.stopPropagation();add(p);setAdded(true);setTimeout(()=>setAdded(false),1500)}}
                          className="kids-btn" style={{padding:"7px 14px",borderRadius:99,background:added?c:`${c}20`,border:`2px solid ${c}`,color:added?"#fff":c,fontSize:11}}>
                          {added?"Got it! 🎉":"Add 🛒"}
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <TrustBar brand={brand}/>
      <Newsletter brand={brand}/>
      <StoreFooter store={store} brand={brand}/>
      <CartDrawer store={store} brand={brand} currency={currency}/>
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

  // Luxury / Velvet
  "velvet":     VelvetTemplate,
  "luxury":     VelvetTemplate,
  "black-gold": VelvetTemplate,
  "fashion-lux":VelvetTemplate,

  // Streetwear / Street
  "street":     StreetTemplate,
  "streetwear": StreetTemplate,
  "hype":       StreetTemplate,
  "hypebeast":  StreetTemplate,
  "urban":      StreetTemplate,

  // Beauty / Glow
  "glow":       GlowTemplate,
  "beauty":     GlowTemplate,
  "cosmetics":  GlowTemplate,
  "skincare":   GlowTemplate,
  "pink":       GlowTemplate,

  // African Fashion / Terra
  "terra":      TerraTemplate,
  "african":    TerraTemplate,
  "ankara":     TerraTemplate,
  "cultural":   TerraTemplate,

  // Tech / Ionic
  "ionic":      IonicTemplate,
  "tech":       IonicTemplate,
  "gadgets":    IonicTemplate,
  "electronics":IonicTemplate,

  // Artisan / Food
  "artisan":    ArtisanTemplate,
  "bakery":     ArtisanTemplate,
  "food":       ArtisanTemplate,
  "cafe":       ArtisanTemplate,
  "restaurant": ArtisanTemplate,
  "organic":    ArtisanTemplate,

  // Fitness / Apex
  "apex":       ApexTemplate,
  "fitness":    ApexTemplate,
  "gym":        ApexTemplate,
  "supplements":ApexTemplate,
  "sports":     ApexTemplate,

  // Home / Sage
  "sage":       SageTemplate,
  "home":       SageTemplate,
  "interior":   SageTemplate,
  "furniture":  SageTemplate,
  "decor":      SageTemplate,

  // Jewelry / Diamond
  "diamond":    DiamondTemplate,
  "jewelry":    DiamondTemplate,
  "jewellery":  DiamondTemplate,
  "watches":    DiamondTemplate,
  "gems":       DiamondTemplate,

  // Sneakers / Kodiak
  "kodiak":     KodiakTemplate,
  "sneakers":   KodiakTemplate,
  "kicks":      KodiakTemplate,
  "footwear":   KodiakTemplate,

  // Digital/Gaming / Nova
  "nova":       NovaTemplate,
  "cyberpunk":  NovaTemplate,
  "gaming":     NovaTemplate,
  "digital":    NovaTemplate,
  "futuristic": NovaTemplate,
  "sci-fi":     NovaTemplate,

  // Hotel/Travel / Dusk
  "dusk":       DuskTemplate,
  "hotel":      DuskTemplate,
  "travel":     DuskTemplate,
  "hospitality":DuskTemplate,
  "booking":    DuskTemplate,

  // Kids / KidsTemplate
  "kids":       KidsTemplate,
  "children":   KidsTemplate,
  "toys":       KidsTemplate,
  "playful":    KidsTemplate,

};

export function TemplateRenderer(props: TemplateProps) {
  const templateId = props.store?.templateId || props.store?.theme || "aurora";
  const Component  = REGISTRY[templateId] || AuroraTemplate;
  return <Component {...props} />;
}
