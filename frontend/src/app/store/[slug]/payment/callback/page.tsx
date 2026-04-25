"use client";

import { Suspense , useState, useEffect} from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery }    from "@tanstack/react-query";
import { api, publicApi }         from "../../../../../lib/api";
import { useCartStore } from "../../../../../store/cart.store";
import { useCurrencyStore } from "../../../../../store/currency.store";
import Link from "next/link";
import {
  CheckCircle, XCircle, Loader2, Package, Truck, MapPin,
  Home, Star, Share2, Copy, Check,
} from "lucide-react";

// ── Confetti ─────────────────────────────────────────────────────────────────
function Confetti({ brand }: { brand: string }) {
  const colors = [brand, "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899"];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {Array.from({ length: 24 }, (_, i) => (
        <div key={i} className="absolute w-2.5 h-2.5 rounded-sm opacity-80"
          style={{
            left:       `${4 + (i * 4.1) % 92}%`,
            top:        `-${8 + (i * 6) % 24}px`,
            background:  colors[i % colors.length],
            animation:  `drop ${1.4 + (i % 4) * 0.35}s ease-in ${(i % 9) * 0.12}s forwards`,
            transform:  `rotate(${i * 17}deg)`,
          }} />
      ))}
      <style>{`
        @keyframes drop {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0.9; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── Order status timeline ─────────────────────────────────────────────────────
const STEPS = [
  { key: "PENDING",    label: "Order Placed",  icon: CheckCircle },
  { key: "PROCESSING", label: "Processing",    icon: Package },
  { key: "SHIPPED",    label: "Shipped",        icon: Truck },
  { key: "DELIVERED",  label: "Delivered",      icon: MapPin },
];

function Timeline({ status, brand }: { status: string; brand: string }) {
  const cur = STEPS.findIndex(s => s.key === status);
  return (
    <div className="flex items-start gap-0 w-full">
      {STEPS.map((step, i) => {
        const done   = i <= cur;
        const active = i === cur;
        const Icon   = step.icon;
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500"
                style={{
                  background: done ? brand : "#F1F5F9",
                  boxShadow:  active ? `0 0 0 5px ${brand}22` : "none",
                  border:     done ? "none" : "2px solid #E2E8F0",
                }}>
                <Icon size={15} color={done ? "#fff" : "#CBD5E1"} />
              </div>
              <span className="text-[10px] font-bold text-center leading-tight max-w-[60px]"
                style={{ color: done ? "#0F172A" : "#94A3B8" }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 -mt-5 transition-all duration-700"
                style={{ background: i < cur ? brand : "#E2E8F0" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Inner page ────────────────────────────────────────────────────────────────
function CallbackInner() {
  const { slug }      = useParams<{ slug: string }>();
  const searchParams  = useSearchParams();
  const { clearCart, pendingOrderId, clearPending } = useCartStore();
  const { format: fmt, setBaseCurrency } = useCurrencyStore();

  const [phase,   setPhase]   = useState<"loading" | "success" | "failed">("loading");
  const [order,   setOrder]   = useState<any>(null);
  const [copied,  setCopied]  = useState(false);

  // ── Resolve the real order UUID ───────────────────────────────────────────
  // Priority: ?orderId= (Stripe + manual), then Zustand pendingOrderId (Paystack/Flutterwave)
  const orderId = searchParams.get("orderId") || pendingOrderId || "";

  // Gateway-specific reference params for re-verification if needed
  const reference      = searchParams.get("reference") || searchParams.get("trxref") || "";
  const transaction_id = searchParams.get("transaction_id") || "";

  // ── Fetch store for branding ──────────────────────────────────────────────
  const { data: store } = useQuery({
    queryKey: ["public-store", slug],
    queryFn:  () => publicApi.get(`/stores/public/${slug}`).then(r => r.data.data),
  });
  const brand    = store?.primaryColor || "#7c3aed";
  const currency = store?.currency     || "USD";

  useEffect(() => { if (store?.currency) setBaseCurrency(store.currency); }, [store]);
  const f = (n: number) => fmt(n, currency);

  // ── Verify payment once orderId is known ─────────────────────────────────
  useEffect(() => {
    if (!orderId) {
      setPhase("failed");
      return;
    }

    // Build verify URL - pass all params the backend might need
    const params = new URLSearchParams({ orderId });
    if (reference)      params.set("reference",      reference);
    if (transaction_id) params.set("transaction_id", transaction_id);

    api.get(`/payments/verify?${params.toString()}`)
      .then(res => {
        const data = res.data.data;
        // payment.status SUCCESS or order already PROCESSING means paid
        if (data?.status === "SUCCESS" || data?.order?.status === "PROCESSING"
            || data?.order?.status === "SHIPPED" || data?.order?.status === "DELIVERED"
            || data?.order?.status === "COMPLETED") {
          setOrder(data.order);
          setPhase("success");
          clearCart();
          clearPending();
        } else {
          setPhase("failed");
        }
      })
      .catch(() => setPhase("failed"));
  }, [orderId]);

  const copyOrder = () => {
    if (!order?.orderNumber) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (phase === "loading") return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse"
          style={{ background: `${brand}18` }}>
          <Loader2 size={32} className="animate-spin" style={{ color: brand }} />
        </div>
        <h2 className="font-black text-xl text-slate-900 mb-2">Confirming your payment…</h2>
        <p className="text-slate-400 text-sm">This only takes a moment. Please don't close this page.</p>
      </div>
    </div>
  );

  // ── Failed ────────────────────────────────────────────────────────────────
  if (phase === "failed") return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-10 max-w-sm w-full text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <XCircle size={36} className="text-red-400" />
        </div>
        <h2 className="font-black text-2xl text-slate-900 mb-3">Payment Failed</h2>
        <p className="text-slate-500 mb-8 leading-relaxed text-sm">
          Something went wrong with your payment. You have not been charged.
        </p>
        <div className="flex flex-col gap-3">
          <Link href={`/store/${slug}/checkout`}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white"
            style={{ background: brand, boxShadow: `0 8px 24px ${brand}35` }}>
            Try Again
          </Link>
          <Link href={`/store/${slug}`}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
            <Home size={14} /> Back to Store
          </Link>
        </div>
      </div>
    </div>
  );

  // ── Success ───────────────────────────────────────────────────────────────
  const items = order?.items || [];

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <Confetti brand={brand} />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={`/store/${slug}`}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            <Home size={15} /> Store
          </Link>
          <span className="font-black text-slate-900">{store?.name}</span>
          <div />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 relative z-10">

        {/* ── Hero ── */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center mb-5">
            <div className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl"
              style={{ background: `linear-gradient(135deg,${brand},${brand}bb)` }}>
              <CheckCircle size={52} color="white" strokeWidth={2} />
            </div>
            <div className="absolute -top-2 -right-2 text-3xl animate-bounce">🎉</div>
          </div>
          <h1 className="font-black text-3xl text-slate-900 mb-2">Order Confirmed!</h1>
          <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
            Thanks{order?.customerName ? `, ${order.customerName.split(" ")[0]}` : ""}!
            Your order is placed and we're getting it ready.
          </p>
        </div>

        {/* ── Order number card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4 text-center">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-2">Order Number</p>
          <button onClick={copyOrder}
            className="inline-flex items-center gap-2.5 font-black text-2xl tracking-wide transition-opacity hover:opacity-75"
            style={{ color: brand }}>
            {order?.orderNumber}
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
              {copied ? <><Check size={12} className="text-emerald-500" /> Copied!</> : <><Copy size={12} /> Copy</>}
            </span>
          </button>
          <p className="text-xs text-slate-400 mt-3">
            A confirmation email was sent to{" "}
            <strong className="text-slate-700">{order?.customerEmail}</strong>
          </p>
        </div>

        {/* ── Status timeline ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
          <h3 className="font-black text-slate-900 mb-6 text-sm uppercase tracking-wide">Order Status</h3>
          <Timeline status={order?.status || "PROCESSING"} brand={brand} />
        </div>

        {/* ── Items + totals ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-900">Order Summary</h3>
            <span className="text-xs font-semibold text-slate-400">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="divide-y divide-slate-50">
            {items.map((item: any) => (
              <div key={item.id} className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-slate-300" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 line-clamp-1">{item.name}</p>
                  {item.variantLabel && <p className="text-xs text-slate-400 mt-0.5">{item.variantLabel}</p>}
                  <p className="text-xs text-slate-400 mt-0.5">Qty {item.quantity}</p>
                </div>
                <span className="font-black text-sm text-slate-900">{f(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-700">{f(order?.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Shipping</span>
              <span className={`font-semibold ${(order?.shippingCost || 0) === 0 ? "text-emerald-600" : "text-slate-700"}`}>
                {(order?.shippingCost || 0) === 0 ? "Free 🎉" : f(order?.shippingCost)}
              </span>
            </div>
            {(order?.taxAmount || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax</span>
                <span className="font-semibold text-slate-700">{f(order.taxAmount)}</span>
              </div>
            )}
            {(order?.discountAmount || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600 font-semibold">Discount</span>
                <span className="font-bold text-emerald-600">−{f(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-base text-slate-900 border-t border-slate-200 pt-3 mt-2">
              <span>Total Paid</span>
              <span style={{ color: brand }}>{f(order?.total || 0)}</span>
            </div>
          </div>
        </div>

        {/* ── Shipping address ── */}
        {order?.shippingAddress && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Truck size={14} className="text-slate-400" />
              <h3 className="font-bold text-slate-900 text-sm">Shipping to</h3>
            </div>
            <div className="text-sm text-slate-600 leading-6">
              <p className="font-semibold text-slate-900">{order.customerName}</p>
              <p>{order.shippingAddress.address || order.shippingAddress.line1}</p>
              <p>
                {order.shippingAddress.city}
                {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}
                {order.shippingAddress.postalCode ? ` ${order.shippingAddress.postalCode}` : ""}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        )}

        {/* ── CTAs ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <Link href={`/store/${slug}/track?order=${order?.orderNumber}`}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black text-white"
            style={{ background: `linear-gradient(135deg,${brand},${brand}bb)`, boxShadow: `0 8px 24px ${brand}30` }}>
            <Truck size={14} /> Track Order
          </Link>
          <Link href={`/store/${slug}`}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
            <Home size={14} /> Continue Shopping
          </Link>
          <button
            onClick={() => navigator.share?.({
              title: `My order from ${store?.name}`,
              text:  `Just ordered from ${store?.name}! 🎉`,
              url:   window.location.href,
            })}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
            <Share2 size={14} /> Share
          </button>
        </div>

        {/* ── Review nudge ── */}
        <div className="text-center py-6 border-t border-slate-200">
          <p className="text-sm text-slate-400 mb-3">Enjoying your purchase? Leave us a review!</p>
          <div className="flex items-center justify-center gap-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={22} fill="#F59E0B" style={{ color: "#F59E0B" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Loader2 size={24} className="animate-spin text-violet-500" />
          </div>
          <p className="text-sm text-slate-400 font-medium">Loading…</p>
        </div>
      </div>
    }>
      <CallbackInner />
    </Suspense>
  );
}