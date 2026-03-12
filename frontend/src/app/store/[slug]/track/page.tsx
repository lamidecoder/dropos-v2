"use client";
import { useCurrencyStore } from "@/store/currency.store";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  CheckCircle, Package, Truck, MapPin, Clock,
  ArrowLeft, Search, ChevronRight, X
} from "lucide-react";

const STATUS_STEPS = [
  { key: "PENDING",    label: "Order Placed",   icon: CheckCircle },
  { key: "PROCESSING", label: "Processing",     icon: Package },
  { key: "SHIPPED",    label: "Shipped",        icon: Truck },
  { key: "DELIVERED",  label: "Delivered",      icon: MapPin },
  { key: "COMPLETED",  label: "Completed",      icon: CheckCircle },
];

function OrderTrackPageInner() {
  const { slug }       = useParams<{ slug: string }>();
  const searchParams   = useSearchParams();
  const success        = searchParams.get("success") === "true";
  const orderNumParam  = searchParams.get("order") || "";
  const [orderNum, setOrderNum] = useState(orderNumParam);
  const [search, setSearch]     = useState(orderNumParam);

  const { data: store } = useQuery({
    queryKey: ["public-store", slug],
    queryFn:  () => api.get(`/stores/public/${slug}`).then((r) => r.data.data),
  });

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ["track-order", orderNum],
    queryFn:  () => api.get(`/orders/track/${orderNum}`).then((r) => r.data.data),
    enabled:  !!orderNum && orderNum.length > 3,
    retry: false,
  });

  const brand     = store?.primaryColor || "#7c3aed";
  const currency  = store?.currency || "USD";
  const { format: _fmtT, setBaseCurrency: _sbT } = useCurrencyStore();
  if (store?.currency) _sbT(store.currency);
  const fmt = (n: number) => _fmtT(n, currency);

  const currentStep = STATUS_STEPS.findIndex((s) => s.key === order?.status);
  const progressPct = order ? Math.max(10, ((currentStep + 1) / STATUS_STEPS.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/store/${slug}`} className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <ArrowLeft size={16} /> Back to Shop
          </Link>
          <div className="font-black text-slate-900 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-primary)] text-sm"
              style={{ background: `linear-gradient(135deg, ${brand}, ${brand}bb)` }}>
              {store?.name?.charAt(0)}
            </div>
            {store?.name}
          </div>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Success banner */}
        {success && (
          <div className="rounded-2xl p-6 text-center shadow-lg border"
            style={{ background: `linear-gradient(135deg, ${brand}10, ${brand}05)`, borderColor: `${brand}20` }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${brand}, ${brand}bb)`, boxShadow: `0 8px 24px ${brand}40` }}>
              <CheckCircle size={28} className="text-[var(--text-primary)]" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Order Confirmed! 🎉</h1>
            <p className="text-slate-500 text-sm">
              Thank you for your order. Check your email for confirmation details.
            </p>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-black text-lg text-slate-900 mb-1">Track Your Order</h2>
          <p className="text-sm text-slate-400 mb-5">Enter your order number to see the latest status</p>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-3 focus-within:border-violet-500 transition-all bg-white">
              <Search size={15} className="text-slate-400 flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setOrderNum(search)}
                placeholder="e.g. ORD-2024-XXXXXX"
                className="outline-none text-sm text-slate-700 placeholder-slate-400 w-full bg-transparent"
              />
              {search && (
                <button onClick={() => { setSearch(""); setOrderNum(""); }}>
                  <X size={14} className="text-slate-400" />
                </button>
              )}
            </div>
            <button onClick={() => setOrderNum(search)}
              className="px-5 py-3 rounded-xl text-[var(--text-primary)] text-sm font-bold transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${brand}, ${brand}bb)` }}>
              Track
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Looking up your order…</p>
          </div>
        )}

        {/* Not found */}
        {error && !isLoading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <Package size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="font-black text-slate-700 mb-2">Order Not Found</h3>
            <p className="text-slate-400 text-sm">
              We couldn't find an order with that number. Please double-check and try again.
            </p>
          </div>
        )}

        {/* Order details */}
        {order && (
          <>
            {/* Status card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Order Number</div>
                  <div className="font-black text-lg text-slate-900">{order.orderNumber}</div>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-sm font-black ${
                  order.status === "COMPLETED" || order.status === "DELIVERED"
                    ? "bg-emerald-50 text-emerald-700"
                    : order.status === "CANCELLED"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
                }`}>
                  {order.status.replace("_", " ")}
                </span>
              </div>

              {/* Progress bar */}
              {order.status !== "CANCELLED" && (
                <div className="mb-6">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${brand}, ${brand}bb)` }} />
                  </div>
                </div>
              )}

              {/* Steps */}
              {order.status !== "CANCELLED" && (
                <div className="grid grid-cols-5 gap-1">
                  {STATUS_STEPS.map((step, i) => {
                    const isCompleted = i <= currentStep;
                    const isCurrent   = i === currentStep;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-2 text-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isCompleted
                            ? "text-[var(--text-primary)] shadow-md"
                            : "bg-slate-100 text-slate-400"
                        }`}
                          style={isCompleted ? {
                            background: `linear-gradient(135deg, ${brand}, ${brand}bb)`,
                            boxShadow: isCurrent ? `0 4px 12px ${brand}50` : "none",
                          } : {}}>
                          <Icon size={16} />
                        </div>
                        <span className={`text-xs font-semibold leading-tight ${
                          isCurrent ? "text-slate-900" : isCompleted ? "text-slate-600" : "text-slate-400"
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tracking number */}
              {order.trackingNumber && (
                <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck size={15} style={{ color: brand }} />
                    <span className="font-bold text-slate-700">Tracking Number:</span>
                    <span className="font-mono text-slate-600">{order.trackingNumber}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Customer & shipping */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-black text-slate-900 mb-4">Delivery Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Customer</div>
                  <div className="font-semibold text-slate-800 text-sm">{order.customerName}</div>
                  <div className="text-xs text-slate-500">{order.customerEmail}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Ship To</div>
                  {order.shippingAddress && (
                    <div className="text-sm text-slate-600 leading-relaxed">
                      {order.shippingAddress.address}, {order.shippingAddress.city}
                      <br />{order.shippingAddress.state}, {order.shippingAddress.country}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order items */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-black text-slate-900">Items Ordered</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={14} className="text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm text-slate-800">{item.name}</div>
                      <div className="text-xs text-slate-400">×{item.quantity} @ {fmt(item.price ?? 0)}</div>
                    </div>
                    <div className="font-black text-slate-900">{fmt(item.total ?? 0)}</div>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-slate-100 space-y-2">
                {[
                  { l: "Subtotal",  v: fmt(order.subtotal || 0) },
                  { l: "Shipping",  v: order.shippingCost === 0 ? "FREE" : fmt(order.shippingCost || 0) },
                  ...(order.taxAmount > 0 ? [{ l: "Tax", v: fmt(order.taxAmount) }] : []),
                ].map(({ l, v }) => (
                  <div key={l} className="flex justify-between text-sm text-slate-500">
                    <span>{l}</span><span className="font-semibold">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between font-black text-base text-slate-900 border-t border-slate-200 pt-2">
                  <span>Total</span>
                  <span style={{ color: brand }}>{fmt(order.total || 0)}</span>
                </div>
              </div>
            </div>

            {/* Estimated delivery */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${brand}15` }}>
                <Clock size={20} style={{ color: brand }} />
              </div>
              <div>
                <div className="font-bold text-slate-800">Estimated Delivery</div>
                <div className="text-sm text-slate-500">
                  {order.status === "COMPLETED" || order.status === "DELIVERED"
                    ? "Your order has been delivered!"
                    : "3–7 business days from shipping date"}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function OrderTrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" /></div>}>
      <OrderTrackPageInner />
    </Suspense>
  );
}
