"use client";

import { useState } from "react";
import { useCartStore } from "../../store/cart.store";
import { useMutation } from "@tanstack/react-query";
import { api, publicApi } from "../../lib/api";
import {
  X, Minus, Plus, ShoppingBag, Trash2, ArrowRight,
  Package, Tag, Loader2, CheckCircle, Gift,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Props {
  storeSlug: string;
  storeId:   string;
  brand:     string;
  currency?: string;
  fmt:       (n: number) => string;
}

export default function CartDrawer({ storeSlug, storeId, brand, currency = "USD", fmt }: Props) {
  const { items, isOpen, closeCart, removeItem, updateQty, total, count } = useCartStore();

  const [couponCode,    setCouponCode]    = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [couponError,   setCouponError]   = useState("");

  const couponMut = useMutation({
    mutationFn: () => publicApi.post("/coupons/validate", {
      code:       couponCode.trim().toUpperCase(),
      storeId,
      orderTotal: total(),
    }),
    onSuccess: (res) => {
      const { coupon, discount } = res.data.data;
      setCouponApplied({
        code:     coupon.code,
        discount,
        label:    coupon.type === "PERCENTAGE" ? `${coupon.value}% off` : `$${coupon.value} off`,
      });
      setCouponError("");
      toast.success(`Coupon applied: ${coupon.code}`);
    },
    onError: (e: any) => setCouponError(e.response?.data?.message || "Invalid coupon"),
  });

  const subtotal     = total();
  const discountAmt  = couponApplied?.discount || 0;
  const afterDiscount = Math.max(0, subtotal - discountAmt);

  return (
      <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
          onClick={closeCart} />
      )}

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-[400px] z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-primary)] shadow-sm"
              style={{ background: `linear-gradient(135deg,${brand},${brand}bb)` }}>
              <ShoppingBag size={15} />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-sm">Your Cart</h2>
              <p className="text-xs text-slate-400">{count()} item{count() !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button onClick={closeCart}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors">
            <X size={15} className="text-slate-600" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
                style={{ background: `${brand}10` }}>
                <Package size={32} style={{ color: brand }} />
              </div>
              <h3 className="font-black text-xl text-slate-900 mb-2">Your cart is empty</h3>
              <p className="text-slate-400 text-sm mb-6">Add some products to get started</p>
              <button onClick={closeCart}
                className="px-6 py-3 rounded-xl text-sm font-bold text-[var(--text-primary)]"
                style={{ background: `linear-gradient(135deg,${brand},${brand}bb)` }}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map(item => (
                <div key={`${item.productId}-${item.variantId || ""}`}
                  className="flex gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <Package size={18} className="text-slate-300" />
                        </div>}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 line-clamp-2 leading-snug">{item.name}</p>
                    {item.variantLabel && (
                      <p className="text-xs text-slate-400 mt-0.5">{item.variantLabel}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      {/* Qty stepper */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => item.quantity > 1
                            ? updateQty(item.productId, item.quantity - 1, item.variantId)
                            : removeItem(item.productId, item.variantId)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: `${brand}12`, color: brand }}>
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm font-black text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, item.quantity + 1, item.variantId)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: `${brand}12`, color: brand }}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm" style={{ color: brand }}>
                          {fmt(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - only show when items exist */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 bg-white">
            {/* Coupon field */}
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                    onKeyDown={e => e.key === "Enter" && couponMut.mutate()}
                    placeholder="Coupon code"
                    disabled={!!couponApplied}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-400 font-mono uppercase disabled:opacity-60 transition-colors"
                  />
                </div>
                {couponApplied ? (
                  <button
                    onClick={() => { setCouponApplied(null); setCouponCode(""); }}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-500 border border-red-200 flex items-center gap-1 hover:bg-red-100 transition-colors flex-shrink-0">
                    <X size={11} /> Remove
                  </button>
                ) : (
                  <button
                    onClick={() => couponMut.mutate()}
                    disabled={!couponCode.trim() || couponMut.isPending}
                    className="px-4 py-2 rounded-xl text-xs font-black text-[var(--text-primary)] disabled:opacity-50 transition-opacity flex-shrink-0"
                    style={{ background: brand }}>
                    {couponMut.isPending ? <Loader2 size={11} className="animate-spin" /> : "Apply"}
                  </button>
                )}
              </div>
              {couponError && <p className="text-[11px] text-red-500 mt-1.5">{couponError}</p>}
              {couponApplied && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-emerald-600 font-semibold">
                  <CheckCircle size={11} /> {couponApplied.code} - {couponApplied.label} applied!
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="px-4 py-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-700">{fmt(subtotal)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600 font-semibold">Discount</span>
                  <span className="font-bold text-emerald-600">−{fmt(discountAmt)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-400">
                <span>Shipping & taxes</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between font-black text-base border-t border-slate-100 pt-2">
                <span className="text-slate-900">Estimated Total</span>
                <span style={{ color: brand }}>{fmt(afterDiscount)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <div className="px-4 pb-5 space-y-2">
              <Link href={`/store/${storeSlug}/checkout${couponApplied ? `?coupon=${couponApplied.code}` : ""}`}
                onClick={closeCart}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-black text-[var(--text-primary)] transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg,${brand},${brand}cc)`,
                  boxShadow:  `0 8px 24px ${brand}40`,
                }}>
                Checkout · {fmt(afterDiscount)} <ArrowRight size={15} />
              </Link>
              <button onClick={closeCart}
                className="w-full py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
      </>
  );
}