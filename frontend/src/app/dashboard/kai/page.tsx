"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Send, Zap, Plus, Trash2, MessageSquare, Store, Package,
  BarChart3, ShoppingCart, Tag, Megaphone, Palette, ArrowRight,
  Loader2, Copy, Check, RefreshCw, X, Home, ChevronLeft,
  TrendingUp, Truck, Users, Sparkles, Star, PenLine,
  ChevronDown, AlertTriangle, ShoppingBag, Eye, Edit2,
  ToggleLeft, ToggleRight, Boxes, Wallet, Bell, Settings,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Msg {
  id:         string;
  role:       "user" | "assistant";
  content:    string;
  action?:    string | null;
  actionData?: any;
  createdAt:  string;
  isLoading?: boolean;
  isDemo?:    boolean;
}

interface Conv {
  id:        string;
  title:     string;
  updatedAt: string;
  messages?: { content: string }[];
}

// ─── Action map ───────────────────────────────────────────────────────────────
const ACTS: Record<string, { label: string; href: string; icon: any; bg: string; fg: string }> = {
  add_product:         { label: "Add Product",      href: "/dashboard/products",   icon: Package,    bg: "rgba(139,92,246,.15)",  fg: "#a78bfa" },
  list_products:       { label: "View Products",    href: "/dashboard/products",   icon: Package,    bg: "rgba(139,92,246,.15)",  fg: "#a78bfa" },
  view_orders:         { label: "View Orders",      href: "/dashboard/orders",     icon: ShoppingCart,bg:"rgba(59,130,246,.15)",  fg: "#60a5fa" },
  view_analytics:      { label: "Analytics",        href: "/dashboard/analytics",  icon: BarChart3,  bg: "rgba(16,185,129,.15)",  fg: "#34d399" },
  customize:           { label: "Customize",        href: "/dashboard/customize",  icon: Palette,    bg: "rgba(245,158,11,.15)",  fg: "#fbbf24" },
  create_coupon:       { label: "Create Coupon",    href: "/dashboard/coupons",    icon: Tag,        bg: "rgba(236,72,153,.15)",  fg: "#f472b6" },
  flash_sale:          { label: "Flash Sale",       href: "/dashboard/discounts",  icon: Megaphone,  bg: "rgba(249,115,22,.15)",  fg: "#fb923c" },
  create_store:        { label: "Create Store",     href: "/dashboard/stores",     icon: Store,      bg: "rgba(124,58,237,.15)",  fg: "#8b5cf6" },
  view_customers:      { label: "Customers",        href: "/dashboard/customers",  icon: Users,      bg: "rgba(20,184,166,.15)",  fg: "#2dd4bf" },
  build_store:         { label: "Build a Store",    href: "#build",                icon: Sparkles,   bg: "rgba(124,58,237,.15)",  fg: "#a78bfa" },
  low_stock:           { label: "Check Inventory",  href: "/dashboard/inventory",  icon: Boxes,      bg: "rgba(239,68,68,.15)",   fg: "#f87171" },
  update_store:        { label: "Store Settings",   href: "/dashboard/customize",  icon: Settings,   bg: "rgba(99,102,241,.15)",  fg: "#818cf8" },
};

const QUICK = [
  { e: "📊", t: "Show me my sales analytics" },
  { e: "📦", t: "Show all my products" },
  { e: "🛒", t: "Show my recent orders" },
  { e: "🏪", t: "Build me a store from scratch" },
  { e: "🎯", t: "Create an Instagram ad" },
  { e: "⚠️", t: "Which products are low on stock?" },
  { e: "👥", t: "Show my customers" },
  { e: "💡", t: "How can I increase my sales?" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtCurrency(n: number, currency = "NGN") {
  const symbol = currency === "NGN" ? "₦" : "$";
  return `${symbol}${n.toLocaleString()}`;
}

function timeAgo(date: string) {
  const d   = new Date(date);
  const now = Date.now();
  const s   = Math.floor((now - d.getTime()) / 1000);
  if (s < 60)   return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400)return `${Math.floor(s/3600)}h ago`;
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}

// ─── KAI Orb ──────────────────────────────────────────────────────────────────
function KAIOrb({ size = 36, glow = true }: { size?: number; glow?: boolean }) {
  return (
    <div className="flex-shrink-0 relative" style={{ width: size, height: size }}>
      {glow && <div className="absolute inset-0 rounded-2xl opacity-40 animate-pulse"
        style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", filter: "blur(6px)", transform: "scale(1.1)" }} />}
      <div className="absolute inset-0 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: glow ? `0 ${size/5}px ${size}px rgba(124,58,237,.5)` : "none" }}>
        <Zap size={size * .45} color="white" fill="white" />
      </div>
    </div>
  );
}

// ─── Data Cards (shown inline in chat) ───────────────────────────────────────
function DataCard({ data, router }: { data: any; router: any }) {
  if (!data) return null;

  if (data.type === "orders_list" && data.data?.length) {
    return (
      <div className="mt-3 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(59,130,246,.2)" }}>
        <div className="px-4 py-2.5 text-xs font-bold text-blue-400 flex items-center gap-2"
          style={{ background: "rgba(59,130,246,.08)" }}>
          <ShoppingCart size={12} /> Recent Orders
        </div>
        {data.data.slice(0, 5).map((o: any, i: number) => (
          <div key={i} className="px-4 py-3 flex items-center justify-between border-t text-xs"
            style={{ borderColor: "rgba(255,255,255,.05)" }}>
            <div>
              <p className="font-bold text-white">#{o.orderNumber} — {o.customerName}</p>
              <p className="text-slate-600 mt-0.5">{timeAgo(o.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-white">{fmtCurrency(o.total || 0)}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                o.status === "DELIVERED" ? "bg-emerald-500/15 text-emerald-400" :
                o.status === "SHIPPED"   ? "bg-blue-500/15 text-blue-400" :
                o.status === "CANCELLED" ? "bg-red-500/15 text-red-400" :
                "bg-amber-500/15 text-amber-400"
              }`}>{o.status}</span>
            </div>
          </div>
        ))}
        <button onClick={() => router.push("/dashboard/orders")}
          className="w-full py-2.5 text-xs font-bold text-blue-400 flex items-center justify-center gap-1.5 hover:bg-blue-500/5 transition-colors"
          style={{ borderTop: "1px solid rgba(255,255,255,.05)" }}>
          View all orders <ArrowRight size={11} />
        </button>
      </div>
    );
  }

  if (data.type === "products_list" && data.data?.length) {
    return (
      <div className="mt-3 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(139,92,246,.2)" }}>
        <div className="px-4 py-2.5 text-xs font-bold text-violet-400 flex items-center gap-2"
          style={{ background: "rgba(139,92,246,.08)" }}>
          <Package size={12} /> Products
        </div>
        {data.data.slice(0, 5).map((p: any, i: number) => (
          <div key={i} className="px-4 py-3 flex items-center justify-between border-t text-xs"
            style={{ borderColor: "rgba(255,255,255,.05)" }}>
            <div>
              <p className="font-bold text-white">{p.name}</p>
              <p className="text-slate-600 mt-0.5">{p.category || "No category"}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-white">{fmtCurrency(p.price || 0)}</p>
              <p className={`text-[10px] font-bold ${p.inventory < 5 ? "text-red-400" : "text-slate-600"}`}>
                {p.inventory} in stock
              </p>
            </div>
          </div>
        ))}
        <button onClick={() => router.push("/dashboard/products")}
          className="w-full py-2.5 text-xs font-bold text-violet-400 flex items-center justify-center gap-1.5 hover:bg-violet-500/5 transition-colors"
          style={{ borderTop: "1px solid rgba(255,255,255,.05)" }}>
          Manage products <ArrowRight size={11} />
        </button>
      </div>
    );
  }

  if (data.type === "analytics_summary" && data.data) {
    const d = data.data;
    return (
      <div className="mt-3 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(16,185,129,.2)" }}>
        <div className="px-4 py-2.5 text-xs font-bold text-emerald-400 flex items-center gap-2"
          style={{ background: "rgba(16,185,129,.08)" }}>
          <BarChart3 size={12} /> This Week
        </div>
        <div className="grid grid-cols-3 divide-x" style={{ divideColor: "rgba(255,255,255,.05)" }}>
          {[
            { label: "Revenue", value: fmtCurrency(d.weekRevenue || 0) },
            { label: "Orders",  value: d.weekOrders || 0 },
            { label: "Customers", value: d.customers || 0 },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-3 text-center">
              <p className="text-sm font-black text-white">{value}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.type === "customers_list" && data.data?.length) {
    return (
      <div className="mt-3 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(20,184,166,.2)" }}>
        <div className="px-4 py-2.5 text-xs font-bold text-teal-400 flex items-center gap-2"
          style={{ background: "rgba(20,184,166,.08)" }}>
          <Users size={12} /> Top Customers
        </div>
        {data.data.slice(0, 4).map((c: any, i: number) => (
          <div key={i} className="px-4 py-3 flex items-center justify-between border-t text-xs"
            style={{ borderColor: "rgba(255,255,255,.05)" }}>
            <div>
              <p className="font-bold text-white">{c.name}</p>
              <p className="text-slate-600">{c.email}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-white">{fmtCurrency(c.totalSpent || 0)}</p>
              <p className="text-slate-600 text-[10px]">{c.orderCount} orders</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.type === "low_stock" && data.data?.length) {
    return (
      <div className="mt-3 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(239,68,68,.2)" }}>
        <div className="px-4 py-2.5 text-xs font-bold text-red-400 flex items-center gap-2"
          style={{ background: "rgba(239,68,68,.08)" }}>
          <AlertTriangle size={12} /> Low Stock Alert
        </div>
        {data.data.map((p: any, i: number) => (
          <div key={i} className="px-4 py-3 flex items-center justify-between border-t text-xs"
            style={{ borderColor: "rgba(255,255,255,.05)" }}>
            <p className="font-bold text-white">{p.name}</p>
            <span className="font-black text-red-400">{p.inventory} left</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function Bubble({ msg, user, router, onAction, animate }: any) {
  const [copied, setCopied] = useState(false);
  const [typed,  setTyped]  = useState(false);
  const isUser = msg.role === "user";
  const act    = msg.action ? ACTS[msg.action] : null;

  const copy = () => { navigator.clipboard.writeText(msg.content); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className={`flex gap-3 group mb-5 ${isUser ? "flex-row-reverse" : ""}`}>
      {isUser ? (
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 mt-0.5"
          style={{ background: "linear-gradient(135deg,#1e293b,#0f172a)", border: "1px solid rgba(255,255,255,.08)" }}>
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
      ) : (
        <div className="mt-0.5"><KAIOrb size={32} glow={false} /></div>
      )}

      <div className={`flex flex-col gap-1.5 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`px-5 py-3.5 text-sm leading-relaxed shadow-lg ${isUser ? "rounded-3xl rounded-tr-lg" : "rounded-3xl rounded-tl-lg"}`}
          style={isUser
            ? { background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff" }
            : { background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", color: "#e2e8f0" }}>
          {msg.isLoading ? (
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full" style={{ background:"#7c3aed", animation:`bounce 1.2s ${i*.2}s infinite` }} />)}
              </div>
              <span className="text-slate-500 text-xs">KAI is thinking…</span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          )}
        </div>

        {/* Inline data cards */}
        {!isUser && !msg.isLoading && msg.actionData && (
          <div className="w-full max-w-sm">
            <DataCard data={msg.actionData} router={router} />
          </div>
        )}

        {/* Action button */}
        {act && !msg.isLoading && (
          <button onClick={() => act.href === "#build" ? onAction("#build") : router.push(act.href)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: act.bg, border: `1px solid ${act.fg}30`, color: act.fg }}>
            <act.icon size={12} />{act.label}<ArrowRight size={11} />
          </button>
        )}

        {/* Demo badge */}
        {msg.isDemo && !msg.isLoading && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,.2)" }}>
            Demo • Add API key for full AI
          </span>
        )}

        {!isUser && !msg.isLoading && (
          <button onClick={copy} className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 text-[10px] text-slate-700 hover:text-slate-400 ml-1">
            {copied ? <><Check size={10} />Copied</> : <><Copy size={10} />Copy</>}
          </button>
        )}

        <span className="text-[10px] text-slate-800 mx-1">{timeAgo(msg.createdAt)}</span>
      </div>
    </div>
  );
}

// ─── Add Product Form (in-chat) ───────────────────────────────────────────────
function AddProductForm({ storeId, onDone }: { storeId: string; onDone: (result: string) => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [inv, setInv] = useState("10");
  const [cat, setCat] = useState("");

  const mut = useMutation({
    mutationFn: () => api.post("/kai/action", { type: "add_product", payload: { name, price: Number(price), inventory: Number(inv), category: cat } }),
    onSuccess:  r => onDone(r.data.data?.message || `✅ "${name}" added!`),
    onError:    (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  return (
    <div className="rounded-2xl p-4 space-y-3 mt-2" style={{ background: "rgba(139,92,246,.08)", border: "1px solid rgba(139,92,246,.2)" }}>
      <p className="text-xs font-bold text-violet-400 flex items-center gap-1.5"><Package size={12} />Quick Add Product</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Product Name", value: name, set: setName, placeholder: "e.g. Straight Hair 16\"", full: true },
          { label: "Price (₦)", value: price, set: setPrice, placeholder: "e.g. 28000" },
          { label: "Stock", value: inv, set: setInv, placeholder: "10" },
          { label: "Category", value: cat, set: setCat, placeholder: "e.g. Hair" },
        ].map(({ label, value, set, placeholder, full }) => (
          <div key={label} className={full ? "col-span-2" : ""}>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">{label}</label>
            <input value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
              className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-700 outline-none"
              style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }} />
          </div>
        ))}
      </div>
      <button onClick={() => mut.mutate()} disabled={!name || !price || mut.isPending}
        className="w-full py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-40 flex items-center justify-center gap-1.5"
        style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
        {mut.isPending ? <><Loader2 size={12} className="animate-spin" />Adding…</> : <><Plus size={12} />Add Product</>}
      </button>
    </div>
  );
}

// ─── Coupon Form ──────────────────────────────────────────────────────────────
function CouponForm({ storeId, onDone }: { storeId: string; onDone: (result: string) => void }) {
  const [code,  setCode]  = useState("");
  const [type,  setType]  = useState("PERCENTAGE");
  const [value, setValue] = useState("");

  const mut = useMutation({
    mutationFn: () => api.post("/kai/action", { type: "create_coupon", payload: { code, type, value: Number(value) } }),
    onSuccess:  r => onDone(r.data.data?.message || `✅ Coupon ${code.toUpperCase()} created!`),
    onError:    (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  return (
    <div className="rounded-2xl p-4 space-y-3 mt-2" style={{ background: "rgba(236,72,153,.08)", border: "1px solid rgba(236,72,153,.2)" }}>
      <p className="text-xs font-bold text-pink-400 flex items-center gap-1.5"><Tag size={12} />Create Coupon</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-slate-600 mb-1">Coupon Code</label>
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. SAVE20"
            className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-700 outline-none font-mono"
            style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-600 mb-1">Type</label>
          <select value={type} onChange={e => setType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs text-white outline-none"
            style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}>
            <option value="PERCENTAGE">% Off</option>
            <option value="FIXED">₦ Off</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-600 mb-1">Value</label>
          <input value={value} onChange={e => setValue(e.target.value)} placeholder={type === "PERCENTAGE" ? "20" : "2000"}
            className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-700 outline-none"
            style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }} />
        </div>
      </div>
      <button onClick={() => mut.mutate()} disabled={!code || !value || mut.isPending}
        className="w-full py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-40 flex items-center justify-center gap-1.5"
        style={{ background: "linear-gradient(135deg,#db2777,#ec4899)" }}>
        {mut.isPending ? <><Loader2 size={12} className="animate-spin" />Creating…</> : <><Tag size={12} />Create Coupon</>}
      </button>
    </div>
  );
}

// ─── Store Builder Modal ──────────────────────────────────────────────────────
function BuilderModal({ convId, onClose, onSuccess }: any) {
  const [desc, setDesc] = useState("");
  const [loc,  setLoc]  = useState("Nigeria");
  const [step, setStep] = useState(0);
  const STEPS = ["🧠 Analyzing your business…","🔍 Finding products…","✍️ Writing descriptions…","🎨 Designing store…","💳 Connecting payments…","🚀 Launching…"];

  const mut = useMutation({
    mutationFn: () => api.post("/kai/build-store", { description: desc, location: loc, conversationId: convId }),
    onSuccess:  r => onSuccess(r.data.data),
    onError:    (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  useEffect(() => {
    if (!mut.isPending) { setStep(0); return; }
    const t = setInterval(() => setStep(i => Math.min(i+1, STEPS.length-1)), 1100);
    return () => clearInterval(t);
  }, [mut.isPending]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.85)", backdropFilter: "blur(12px)" }}>
      <div className="w-full max-w-md relative" style={{ background:"#0c0c1a", border:"1px solid rgba(124,58,237,.3)", borderRadius:28, padding:36, boxShadow:"0 32px 80px rgba(124,58,237,.25)" }}>
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all"><X size={16}/></button>
        <div className="flex flex-col items-center mb-8">
          <KAIOrb size={56} />
          <h2 className="text-xl font-black text-white mt-5 mb-1">AI Store Builder</h2>
          <p className="text-slate-500 text-sm">Describe your business — KAI does everything</p>
        </div>
        {!mut.isPending && !mut.isSuccess ? (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">What do you sell?</label>
              <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="e.g. I want to sell human hair wigs and accessories targeting women in Lagos"
                className="w-full px-4 py-3.5 text-sm text-white placeholder-slate-700 outline-none resize-none leading-relaxed"
                style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, minHeight:100 }}/>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Location</label>
              <select value={loc} onChange={e=>setLoc(e.target.value)} className="w-full px-4 py-3.5 text-sm text-white outline-none" style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16 }}>
                {["Nigeria","Ghana","Kenya","South Africa","United Kingdom","United States"].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={()=>mut.mutate()} disabled={desc.trim().length<10}
              className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-30"
              style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow:"0 8px 32px rgba(124,58,237,.4)" }}>
              <Sparkles size={16}/> Build My Store in 60 Seconds
            </button>
          </div>
        ) : mut.isPending ? (
          <div className="text-center space-y-6 py-2">
            <div className="w-16 h-16 rounded-full mx-auto relative">
              <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"/>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin"/>
              <div className="absolute inset-0 flex items-center justify-center"><Zap size={20} className="text-violet-400" fill="currentColor"/></div>
            </div>
            <div className="space-y-2 text-left">
              {STEPS.map((s,i)=>(
                <div key={i} className={`flex items-center gap-3 text-sm font-medium transition-all duration-300 ${i<step?"text-emerald-400":i===step?"text-white":"text-slate-700"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] ${i<step?"bg-emerald-500/20 text-emerald-400":i===step?"bg-violet-500/20":"bg-white/5"}`}>
                    {i<step?"✓":i===step?<Loader2 size={10} className="animate-spin"/>:<span className="text-slate-700">{i+1}</span>}
                  </div>
                  {s}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-5 py-2">
            <div className="text-6xl animate-bounce">🎉</div>
            <div>
              <h3 className="text-xl font-black text-white mb-2">Your store is LIVE!</h3>
              <p className="text-slate-400 text-sm">{(mut.data?.data as any)?.productsCreated || 0} products added automatically</p>
            </div>
            <button onClick={()=>onSuccess((mut.data?.data as any)||{})} className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2" style={{ background:"linear-gradient(135deg,#10b981,#059669)" }}>
              <Store size={16}/> Visit My Store →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Ad Generator Modal ───────────────────────────────────────────────────────
function AdModal({ storeId, onClose }: any) {
  const [product, setProduct] = useState("");
  const [price,   setPrice]   = useState("");
  const [platform,setPlatform]= useState("instagram");
  const [result,  setResult]  = useState<any>(null);
  const [copied,  setCopied]  = useState(false);
  const PLATFORMS = [
    {id:"instagram",e:"📸",l:"Instagram"},
    {id:"tiktok",   e:"🎵",l:"TikTok"},
    {id:"whatsapp", e:"💬",l:"WhatsApp"},
    {id:"facebook", e:"📘",l:"Facebook"},
    {id:"twitter",  e:"🐦",l:"Twitter/X"},
  ];
  const mut = useMutation({
    mutationFn: ()=>api.post("/kai/generate-ad",{productName:product,price,platform,storeId}),
    onSuccess:  r=>setResult(r.data.data),
    onError:    (e:any)=>toast.error(e.response?.data?.message||"Failed"),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,.85)", backdropFilter:"blur(12px)" }}>
      <div className="w-full max-w-lg relative" style={{ background:"#0c0c1a", border:"1px solid rgba(245,158,11,.25)", borderRadius:28, padding:32, maxHeight:"90vh", overflowY:"auto" }}>
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all"><X size={16}/></button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"rgba(245,158,11,.15)" }}><Megaphone size={18} className="text-amber-400"/></div>
          <div><h2 className="text-xl font-black text-white">AI Ad Generator</h2><p className="text-slate-500 text-xs">Viral ads in seconds</p></div>
        </div>
        {!result ? (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Product Name</label>
              <input value={product} onChange={e=>setProduct(e.target.value)} placeholder="e.g. Brazilian Hair 16 inch"
                className="w-full px-4 py-3.5 text-sm text-white placeholder-slate-700 outline-none" style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16 }}/>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Price (optional)</label>
              <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="e.g. 28000"
                className="w-full px-4 py-3.5 text-sm text-white placeholder-slate-700 outline-none" style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16 }}/>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Platform</label>
              <div className="grid grid-cols-5 gap-1.5">
                {PLATFORMS.map(p=>(
                  <button key={p.id} onClick={()=>setPlatform(p.id)}
                    className="py-2.5 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-1"
                    style={platform===p.id?{background:"rgba(245,158,11,.2)",border:"1px solid rgba(245,158,11,.5)",color:"#fbbf24"}:{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",color:"#475569"}}>
                    <span className="text-base">{p.e}</span><span className="text-[10px]">{p.l}</span>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={()=>mut.mutate()} disabled={!product.trim()||mut.isPending}
              className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-30 transition-all hover:opacity-90"
              style={{ background:"linear-gradient(135deg,#d97706,#f59e0b)" }}>
              {mut.isPending?<><Loader2 size={16} className="animate-spin"/>Generating…</>:<><Sparkles size={16}/>Generate Ad</>}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl p-5 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed" style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)" }}>{result.fullPost}</div>
            <div className="flex gap-2">
              <button onClick={()=>{navigator.clipboard.writeText(result.fullPost);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
                className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                style={copied?{background:"rgba(16,185,129,.15)",border:"1px solid rgba(16,185,129,.3)",color:"#34d399"}:{background:"rgba(245,158,11,.15)",border:"1px solid rgba(245,158,11,.3)",color:"#fbbf24"}}>
                {copied?<><Check size={14}/>Copied!</>:<><Copy size={14}/>Copy Post</>}
              </button>
              <button onClick={()=>{setResult(null);setProduct("");setPrice("");}}
                className="px-4 py-3 rounded-2xl text-slate-500 hover:text-slate-300 transition-colors" style={{ border:"1px solid rgba(255,255,255,.07)" }}>
                <RefreshCw size={14}/>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Product Description Modal ────────────────────────────────────────────────
function DescModal({ onClose }: any) {
  const [name, setName] = useState("");
  const [cat,  setCat]  = useState("");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState("");
  const mut = useMutation({
    mutationFn: ()=>api.post("/kai/product-description",{productName:name,category:cat}),
    onSuccess:  r=>setResult(r.data.data),
    onError:    (e:any)=>toast.error(e.response?.data?.message||"Failed"),
  });
  const copy = (text:string, key:string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(()=>setCopied(""),2000); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,.85)", backdropFilter:"blur(12px)" }}>
      <div className="w-full max-w-lg relative" style={{ background:"#0c0c1a", border:"1px solid rgba(59,130,246,.25)", borderRadius:28, padding:32, maxHeight:"90vh", overflowY:"auto" }}>
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all"><X size={16}/></button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"rgba(59,130,246,.15)" }}><PenLine size={18} className="text-blue-400"/></div>
          <div><h2 className="text-xl font-black text-white">Product Writer</h2><p className="text-slate-500 text-xs">AI descriptions that sell</p></div>
        </div>
        {!result ? (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Product Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Peruvian Body Wave Hair"
                className="w-full px-4 py-3.5 text-sm text-white placeholder-slate-700 outline-none" style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16 }}/>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Category (optional)</label>
              <input value={cat} onChange={e=>setCat(e.target.value)} placeholder="e.g. Hair Extensions"
                className="w-full px-4 py-3.5 text-sm text-white placeholder-slate-700 outline-none" style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16 }}/>
            </div>
            <button onClick={()=>mut.mutate()} disabled={!name.trim()||mut.isPending}
              className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-30 transition-all hover:opacity-90"
              style={{ background:"linear-gradient(135deg,#2563eb,#3b82f6)" }}>
              {mut.isPending?<><Loader2 size={16} className="animate-spin"/>Writing…</>:<><PenLine size={16}/>Write Description</>}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {[{label:"Short Hook",key:"s",text:result.shortDescription},{label:"Full Description",key:"f",text:result.fullDescription}].map(({label,key,text})=>(
              <div key={key} className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,.07)" }}>
                <div className="flex items-center justify-between px-4 py-2.5" style={{ background:"rgba(255,255,255,.04)" }}>
                  <span className="text-xs font-bold text-slate-400">{label}</span>
                  <button onClick={()=>copy(text,key)} className="text-[10px] font-bold flex items-center gap-1" style={{ color:copied===key?"#34d399":"#64748b" }}>
                    {copied===key?<><Check size={10}/>Copied</>:<><Copy size={10}/>Copy</>}
                  </button>
                </div>
                <p className="px-4 py-3 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{text}</p>
              </div>
            ))}
            {result.bulletPoints?.length>0&&(
              <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,.07)" }}>
                <div className="flex items-center justify-between px-4 py-2.5" style={{ background:"rgba(255,255,255,.04)" }}>
                  <span className="text-xs font-bold text-slate-400">Bullet Points</span>
                  <button onClick={()=>copy(result.bulletPoints.map((b:string)=>`• ${b}`).join("\n"),"b")} className="text-[10px] font-bold flex items-center gap-1" style={{ color:copied==="b"?"#34d399":"#64748b" }}>
                    {copied==="b"?<><Check size={10}/>Copied</>:<><Copy size={10}/>Copy</>}
                  </button>
                </div>
                <ul className="px-4 py-3 space-y-1.5">
                  {result.bulletPoints.map((b:string,i:number)=>(
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <Star size={11} className="text-violet-400 mt-0.5 flex-shrink-0" fill="currentColor"/>{b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={()=>{setResult(null);setName("");setCat("");}} className="w-full py-3 rounded-2xl text-sm font-bold text-slate-500 hover:text-slate-300 flex items-center justify-center gap-2" style={{ border:"1px solid rgba(255,255,255,.07)" }}>
              <RefreshCw size={13}/> Write Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function KAIPage() {
  const router = useRouter();
  const qc     = useQueryClient();
  const user   = useAuthStore(s => s.user);

  const [messages,    setMessages]    = useState<Msg[]>([]);
  const [input,       setInput]       = useState("");
  const [convId,      setConvId]      = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modal,       setModal]       = useState<"builder"|"ad"|"desc"|null>(null);
  const [busy,        setBusy]        = useState(false);
  const [inlineForm,  setInlineForm]  = useState<"product"|"coupon"|null>(null);
  const [newMsgId,    setNewMsgId]    = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  const { data: ctx, refetch: refetchCtx } = useQuery({
    queryKey: ["kai-context"],
    queryFn:  () => api.get("/kai/context").then(r => r.data.data),
    staleTime: 60_000,
  });

  const { data: convs = [], refetch: refetchConvs } = useQuery<Conv[]>({
    queryKey: ["kai-conversations"],
    queryFn:  () => api.get("/kai/conversations").then(r => r.data.data),
    staleTime: 30_000,
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Welcome
  useEffect(() => {
    if (messages.length || convId) return;
    const h = new Date().getHours();
    const g = h<12?"Good morning":h<17?"Good afternoon":"Good evening";
    const n = user?.name?.split(" ")[0] || "there";
    let body = "";
    if (ctx?.store) {
      const rev = ctx.revenue?.week || 0;
      body = rev > 0
        ? `**${ctx.store.name}** made ₦${rev.toLocaleString()} this week 🔥 — ${ctx.store.orders} orders, ${ctx.store.customers} customers.`
        : `I can see **${ctx.store.name}** with ${ctx.store.products} products. Time to start selling!`;
      if (ctx.lowStock?.length) body += `\n\n⚠️ Low stock: ${ctx.lowStock.map((p:any)=>`${p.name} (${p.inventory} left)`).join(", ")}`;
    } else {
      body = "You don't have a store yet! Want me to build one for you in 60 seconds? Just describe what you sell! 🚀";
    }
    const wid = "w-" + Date.now();
    setNewMsgId(wid);
    setMessages([{ id:wid, role:"assistant", content:`${g}, ${n}! 👋 I'm KAI, your DropOS business partner.\n\n${body}\n\nWhat can I help you with today?`, createdAt:new Date().toISOString() }]);
  }, [ctx, user]);

  // Smart chat mutation
  const chatMut = useMutation({
    mutationFn: (p:{message:string;conversationId:string|null}) =>
      api.post("/kai/smart-chat", { message:p.message, conversationId:p.conversationId, context:ctx }),
    onSuccess: (res) => {
      const { message, action, actionData, conversationId, demo } = res.data.data;
      if (!convId) { setConvId(conversationId); refetchConvs(); }
      const rid = Date.now().toString() + "-r";
      setNewMsgId(rid);
      setMessages(prev => prev.map(m =>
        m.isLoading ? { ...m, id:rid, content:message, action, actionData, isLoading:false, isDemo:demo } : m
      ));
      setBusy(false);

      // Auto-show inline forms based on action
      if (action === "add_product") setInlineForm("product");
      if (action === "create_coupon") setInlineForm("coupon");
    },
    onError: () => {
      setMessages(prev => prev.map(m =>
        m.isLoading ? { ...m, content:"Sorry, I had a moment. Try again! 🔄", isLoading:false } : m
      ));
      setBusy(false);
    },
  });

  const send = useCallback((text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    const userMsg: Msg = { id:Date.now().toString(), role:"user", content:t, createdAt:new Date().toISOString() };
    const loadMsg: Msg = { id:Date.now().toString()+"-l", role:"assistant", content:"", createdAt:new Date().toISOString(), isLoading:true };
    setMessages(prev => [...prev, userMsg, loadMsg]);
    setInput("");
    setBusy(true);
    setInlineForm(null);
    if (inputRef.current) inputRef.current.style.height = "auto";
    chatMut.mutate({ message:t, conversationId:convId });
  }, [busy, convId, chatMut]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const loadConv = async (id: string) => {
    try {
      const r = await api.get(`/kai/conversations/${id}`);
      setConvId(id);
      setMessages(r.data.data.messages.map((m:any)=>({ id:m.id, role:m.role, content:m.content, action:m.action, createdAt:m.createdAt })));
    } catch { toast.error("Failed to load"); }
  };

  const deleteConv = async (id:string, e:React.MouseEvent) => {
    e.stopPropagation();
    await api.delete(`/kai/conversations/${id}`);
    if (convId===id) newChat();
    refetchConvs();
  };

  const newChat = () => { setConvId(null); setMessages([]); setBusy(false); setInlineForm(null); };

  const handleBuilderSuccess = (data: any) => {
    setModal(null);
    if (data?.store) {
      const rid = Date.now().toString()+"-r";
      setNewMsgId(rid);
      setMessages(prev=>[...prev,{ id:rid, role:"assistant", createdAt:new Date().toISOString(), content:`🎉 "${data.store.name}" is LIVE with ${data.productsCreated} products!\n\nYour store: /store/${data.store.slug}\n\nWant me to create your first Instagram ad for it?`, action:"view_analytics" }]);
      refetchCtx();
      refetchConvs();
    }
  };

  const handleInlineFormDone = (msg: string) => {
    setInlineForm(null);
    const rid = Date.now().toString()+"-r";
    setNewMsgId(rid);
    setMessages(prev=>[...prev,{ id:rid, role:"assistant", content:msg, createdAt:new Date().toISOString() }]);
    refetchCtx();
  };

  const storeId  = ctx?.store?.id;
  const currency = ctx?.store?.currency || "NGN";
  const sym      = currency === "NGN" ? "₦" : "$";

  const grouped = useMemo(() => {
    const today = new Date().toDateString();
    const yest  = new Date(Date.now()-86400000).toDateString();
    const map: Record<string, Conv[]> = {};
    (convs as Conv[]).forEach(c => {
      const d = new Date(c.updatedAt).toDateString();
      const lbl = d===today?"Today":d===yest?"Yesterday":new Date(c.updatedAt).toLocaleDateString("en",{month:"short",day:"numeric"});
      if(!map[lbl]) map[lbl]=[];
      map[lbl].push(c);
    });
    return Object.entries(map).map(([label,items])=>({label,items}));
  }, [convs]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:"#07070e" }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════════ */}
      <div className={`flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden ${sidebarOpen?"w-[260px]":"w-0"}`}
        style={{ background:"#0b0b18", borderRight:"1px solid rgba(255,255,255,.06)" }}>

        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <KAIOrb size={30} glow={false} />
            <div>
              <p className="font-black text-white text-sm leading-none">KAI</p>
              <p className="text-[10px] text-slate-700 leading-none mt-0.5">DropOS AI</p>
            </div>
          </Link>
          <button onClick={newChat} className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/5 transition-all"><Plus size={15}/></button>
        </div>

        {/* Tools */}
        <div className="px-3 pb-3 border-b" style={{ borderColor:"rgba(255,255,255,.06)" }}>
          <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest px-2 mb-2">AI Tools</p>
          {[
            { icon:Sparkles, label:"Build a Store",       color:"#a78bfa", action:()=>setModal("builder") },
            { icon:Megaphone,label:"Generate Ad Copy",     color:"#fbbf24", action:()=>setModal("ad")      },
            { icon:PenLine,  label:"Write Product Desc",   color:"#60a5fa", action:()=>setModal("desc")    },
            { icon:Tag,      label:"Create Coupon",        color:"#f472b6", action:()=>setInlineForm("coupon") },
            { icon:Package,  label:"Add Product",          color:"#a78bfa", action:()=>setInlineForm("product") },
          ].map(({icon:Icon,label,color,action})=>(
            <button key={label} onClick={action}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 text-left mb-0.5">
              <Icon size={13} style={{ color }}/><span className="text-slate-400">{label}</span>
            </button>
          ))}
        </div>

        {/* Store snapshot */}
        {ctx?.store && (
          <div className="px-3 py-3 border-b" style={{ borderColor:"rgba(255,255,255,.06)" }}>
            <div className="rounded-2xl px-3 py-3" style={{ background:"rgba(124,58,237,.07)", border:"1px solid rgba(124,58,237,.12)" }}>
              <p className="text-[11px] font-black text-violet-400 mb-2 truncate">{ctx.store.name}</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {[
                  {label:"Today",    value:`${sym}${(ctx.revenue?.today||0).toLocaleString()}`},
                  {label:"This Week",value:`${sym}${(ctx.revenue?.week||0).toLocaleString()}`},
                  {label:"Products", value:ctx.store.products},
                  {label:"Orders",   value:ctx.store.orders},
                ].map(({label,value})=>(
                  <div key={label}>
                    <p className="text-xs font-black text-white">{value}</p>
                    <p className="text-[10px] text-slate-700">{label}</p>
                  </div>
                ))}
              </div>
              {ctx.lowStock?.length>0&&(
                <div className="mt-2 pt-2 border-t flex items-start gap-1.5" style={{ borderColor:"rgba(255,255,255,.05)" }}>
                  <AlertTriangle size={11} className="text-amber-400 flex-shrink-0 mt-0.5"/>
                  <p className="text-[10px] text-amber-400 leading-tight">⚠️ Low stock: {ctx.lowStock[0].name}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          {grouped.length===0?(
            <div className="px-2 py-4 text-center">
              <MessageSquare size={20} className="text-slate-800 mx-auto mb-2"/>
              <p className="text-xs text-slate-700">No conversations yet</p>
            </div>
          ):grouped.map(g=>(
            <div key={g.label} className="mb-3">
              <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest px-2 mb-1">{g.label}</p>
              {g.items.map(conv=>(
                <button key={conv.id} onClick={()=>loadConv(conv.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all group mb-0.5 ${convId===conv.id?"bg-violet-500/12":"hover:bg-white/4"}`}>
                  <MessageSquare size={12} className="flex-shrink-0" style={{ color:convId===conv.id?"#8b5cf6":"#334155" }}/>
                  <span className="flex-1 text-xs truncate font-medium" style={{ color:convId===conv.id?"#a78bfa":"#475569" }}>{conv.title}</span>
                  <button onClick={e=>deleteConv(conv.id,e)} className="opacity-0 group-hover:opacity-100 transition-all text-slate-700 hover:text-red-400 flex-shrink-0">
                    <Trash2 size={11}/>
                  </button>
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="px-3 pb-4 pt-2 border-t" style={{ borderColor:"rgba(255,255,255,.06)" }}>
          <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-400 hover:bg-white/5 transition-all">
            <Home size={14}/> Back to Dashboard
          </Link>
        </div>
      </div>

      {/* ══ MAIN ════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="flex-shrink-0 h-14 flex items-center px-5 gap-3 border-b" style={{ borderColor:"rgba(255,255,255,.06)", background:"rgba(7,7,14,.95)", backdropFilter:"blur(16px)" }}>
          <button onClick={()=>setSidebarOpen(s=>!s)} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all">
            <ChevronLeft size={16} className={`transition-transform duration-200 ${!sidebarOpen?"rotate-180":""}`}/>
          </button>
          <div className="flex items-center gap-2.5">
            <KAIOrb size={28} glow={false}/>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-sm">KAI</span>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:"rgba(16,185,129,.12)", color:"#34d399", border:"1px solid rgba(16,185,129,.2)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>Online
              </span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={()=>setModal("desc")} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-80" style={{ background:"rgba(59,130,246,.12)", color:"#60a5fa", border:"1px solid rgba(59,130,246,.2)" }}>
              <PenLine size={12}/> Write
            </button>
            <button onClick={()=>setModal("ad")} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-80" style={{ background:"rgba(245,158,11,.12)", color:"#fbbf24", border:"1px solid rgba(245,158,11,.2)" }}>
              <Megaphone size={12}/> Create Ad
            </button>
            <button onClick={()=>setModal("builder")} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95" style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow:"0 4px 14px rgba(124,58,237,.35)" }}>
              <Sparkles size={12}/> Build Store
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth:"thin", scrollbarColor:"rgba(255,255,255,.05) transparent" }}>
          <div className="max-w-2xl mx-auto px-5 pt-8 pb-4">

            {messages.map(msg=>(
              <Bubble key={msg.id} msg={msg} user={user} router={router} animate={msg.id===newMsgId}
                onAction={(href:string)=>{ if(href==="#build")setModal("builder"); else router.push(href); }}/>
            ))}

            {/* Inline forms */}
            {inlineForm==="product" && storeId && (
              <div className="mb-5 max-w-sm">
                <AddProductForm storeId={storeId} onDone={handleInlineFormDone}/>
              </div>
            )}
            {inlineForm==="coupon" && storeId && (
              <div className="mb-5 max-w-sm">
                <CouponForm storeId={storeId} onDone={handleInlineFormDone}/>
              </div>
            )}

            {/* Quick prompts */}
            {messages.length<=1 && !busy && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {QUICK.map(({e,t})=>(
                  <button key={t} onClick={()=>send(t)}
                    className="flex items-start gap-2.5 px-4 py-3.5 rounded-2xl text-left text-xs font-medium transition-all hover:bg-white/6 active:scale-[.98] group"
                    style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", color:"#475569" }}>
                    <span className="text-base flex-shrink-0 leading-none mt-0.5">{e}</span>
                    <span className="leading-snug group-hover:text-slate-400 transition-colors">{t}</span>
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} className="h-4"/>
          </div>
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-5 py-4 border-t" style={{ borderColor:"rgba(255,255,255,.06)", background:"rgba(7,7,14,.95)" }}>
          <div className="max-w-2xl mx-auto">
            <div className="flex items-end gap-3 rounded-3xl px-4 py-3" style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.09)", boxShadow:"0 4px 24px rgba(0,0,0,.3)" }}>
              <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey}
                placeholder="Ask KAI anything — add products, view orders, check analytics, create ads…"
                rows={1}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-700 outline-none resize-none leading-relaxed"
                style={{ maxHeight:120 }}
                onInput={e=>{ const t=e.target as HTMLTextAreaElement; t.style.height="auto"; t.style.height=Math.min(t.scrollHeight,120)+"px"; }}/>
              <button onClick={()=>send(input)} disabled={!input.trim()||busy}
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-white flex-shrink-0 transition-all hover:opacity-90 active:scale-90 disabled:opacity-25"
                style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow:"0 4px 12px rgba(124,58,237,.5)" }}>
                {busy?<Loader2 size={16} className="animate-spin"/>:<Send size={15}/>}
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-800 mt-2">
              Try: "Add iPhone case at ₦3500" · "Show my orders" · "Create coupon SAVE20" · "Show analytics"
            </p>
          </div>
        </div>
      </div>

      {modal==="builder"&&<BuilderModal convId={convId} onClose={()=>setModal(null)} onSuccess={handleBuilderSuccess}/>}
      {modal==="ad"&&<AdModal storeId={storeId} onClose={()=>setModal(null)}/>}
      {modal==="desc"&&<DescModal onClose={()=>setModal(null)}/>}

      <style>{`
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.06);border-radius:999px}
      `}</style>
    </div>
  );
}