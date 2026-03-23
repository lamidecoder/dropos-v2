"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../../lib/api";
import { publicApi } from "../../../../lib/api";
import { useCartStore } from "../../../../store/cart.store";
import { useCurrencyStore } from "../../../../store/currency.store";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft, Package, ShieldCheck, Lock, CreditCard,
  Loader2, ChevronDown, ChevronUp, Tag, CheckCircle,
  Truck, Zap, X, Globe, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  name:       z.string().min(2, "Name is required"),
  email:      z.string().email("Valid email required"),
  phone:      z.string().min(7, "Phone is required"),
  address:    z.string().min(5, "Address is required"),
  city:       z.string().min(2, "City is required"),
  state:      z.string().min(2, "State / province is required"),
  country:    z.string().min(2, "Country is required"),
  postalCode: z.string().optional(),
  notes:      z.string().optional(),
});
type CheckoutForm = z.infer<typeof schema>;

// ── Shipping options ─────────────────────────────────────────────────────────
const SHIPPING_OPTIONS = [
  { id: "standard", label: "Standard Shipping",  desc: "5–10 business days", price: 5.99, icon: Truck },
  { id: "express",  label: "Express Shipping",   desc: "2–3 business days",  price: 14.99,icon: Zap   },
  { id: "free",     label: "Free Shipping",       desc: "7–14 business days", price: 0,    icon: Globe },
];

// ── Trust badges ─────────────────────────────────────────────────────────────
const TRUST = [
  { icon: "🔒", label: "SSL Encrypted" },
  { icon: "✅", label: "Secure Checkout" },
  { icon: "🔄", label: "Easy Returns" },
  { icon: "🚚", label: "Fast Delivery" },
];

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBadge({ n, label, brand }: { n: number; label: string; brand: string }) {
  return (
    <h2 className="font-black text-lg text-slate-900 mb-5 flex items-center gap-2.5">
      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-primary)] text-xs font-black flex-shrink-0"
        style={{ background: `linear-gradient(135deg,${brand},${brand}bb)` }}>
        {n}
      </span>
      {label}
    </h2>
  );
}

// ── Input style ───────────────────────────────────────────────────────────────
const inp = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all";
const lbl = "block text-xs font-semibold text-slate-600 mb-1.5";

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { slug }   = useParams<{ slug: string }>();
  const router     = useRouter();
  const { items, total, clearCart, setCaptured, setPendingOrder } = useCartStore();

  const [summaryOpen,   setSummaryOpen]   = useState(false);
  const [couponCode,    setCouponCode]    = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [couponError,   setCouponError]   = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [shipping,      setShipping]      = useState(SHIPPING_OPTIONS[0]);
  const [step,          setStep]          = useState<1|2>(1); // 1=info, 2=review

  const { data: store } = useQuery({
    queryKey: ["public-store", slug],
    queryFn:  () => publicApi.get(`/stores/public/${slug}`).then(r => r.data.data),
  });

  const brand    = store?.primaryColor || "#7c3aed";
  const currency = store?.currency     || "USD";
  const { format: fmtCurrency, displayCurrency, setBaseCurrency } = useCurrencyStore();
  useEffect(() => { if (store?.currency) setBaseCurrency(store.currency); }, [store]);
  const fmt = (n: number) => fmtCurrency(n, currency);

  // Totals
  const taxRate    = (store?.taxRate || 0) / 100;
  const subtotal   = total();
  const freeShip   = subtotal >= (store?.freeShippingThreshold || 50);
  const shipCost   = freeShip ? 0 : shipping.price;
  const tax        = subtotal * taxRate;
  const discount   = couponApplied?.discount ?? 0;
  const grandTotal = Math.max(0, subtotal + shipCost + tax - discount);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(schema),
  });

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0) router.replace(`/store/${slug}`);
  }, [items.length, slug, router]);

  // ── Coupon validation ─────────────────────────────────────────────────────
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await publicApi.post("/coupons/validate", {
        code:       couponCode.trim().toUpperCase(),
        storeId:    store?.id,
        orderTotal: subtotal,
      });
      const { coupon, discount: d } = res.data.data;
      setCouponApplied({ code: coupon.code, discount: d, label: coupon.type === "PERCENTAGE" ? `${coupon.value}% off` : `$${coupon.value} off` });
      toast.success(`Coupon applied: ${coupon.type === "PERCENTAGE" ? coupon.value + "% off" : "$" + coupon.value + " off"}`);
    } catch (e: any) {
      setCouponError(e.response?.data?.message || "Invalid coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  // ── Also check automatic discounts ───────────────────────────────────────
  const { data: autoDiscounts } = useQuery({
    queryKey: ["auto-discounts", store?.id, subtotal],
    queryFn:  () => publicApi.post("/discounts/evaluate", {
      storeId:    store?.id,
      cartItems:  items.map(i => ({ productId: i.productId, qty: i.quantity, price: i.price })),
      subtotal,
    }).then(r => r.data.data),
    enabled: !!store?.id && subtotal > 0,
  });

  const autoDiscountTotal = autoDiscounts?.totalDiscount || 0;
  const autoFreeShipping  = autoDiscounts?.freeShipping || false;
  const effectiveShipCost = autoFreeShipping || freeShip ? 0 : shipCost;
  const effectiveTotal    = Math.max(0, subtotal + effectiveShipCost + tax - discount - autoDiscountTotal);

  // ── Place order ───────────────────────────────────────────────────────────
  const checkoutMut = useMutation({
    mutationFn: async (d: CheckoutForm) => {
      const orderRes = await publicApi.post("/orders", {
        storeId:       store.id,
        customerName:  d.name,
        customerEmail: d.email,
        customerPhone: d.phone,
        shippingAddress: {
          address:    d.address,
          city:       d.city,
          state:      d.state,
          country:    d.country,
          postalCode: d.postalCode,
        },
        shippingCost:   effectiveShipCost,
        taxAmount:      tax,
        discountAmount: discount + autoDiscountTotal,
        couponCode:     couponApplied?.code,
        shippingMethod: shipping.id,
        notes:        d.notes,
        items:        items.map(i => ({
          productId: i.productId, variantId: i.variantId,
          quantity:  i.quantity,  price: i.price, name: i.name,
        })),
        subtotal,
        taxAmount:    tax,
        shippingCost: effectiveShipCost,
        total:        effectiveTotal,
        couponCode:   couponApplied?.code,
        discountAmount: discount + autoDiscountTotal,
        shippingMethod: shipping.id,
      });
      const order = orderRes.data.data;

      // Init payment
      const payRes = await publicApi.post("/payments/initialize", {
        orderId: order.id,
        country: d.country,
      });

      return { order, payment: payRes.data.data };
    },
    onSuccess: ({ order, payment }) => {
      // Stripe: don't clear cart yet — user may abandon the Stripe page
      if (payment?.clientSecret) {
        router.push(`/store/${slug}/payment?clientSecret=${payment.clientSecret}&orderId=${order.id}`);
        return;
      }
      // External gateways (Paystack / Flutterwave): store orderId before leaving the app
      // so the callback page can pass the real UUID to /payments/verify
      if (payment?.authorizationUrl || payment?.paymentLink) {
        setPendingOrder(order.id, slug);
        clearCart();
        window.location.href = payment.authorizationUrl || payment.paymentLink;
        return;
      }
      // Cash on delivery / manual payment
      clearCart();
      router.push(`/store/${slug}/payment/callback?orderId=${order.id}&manual=true`);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Something went wrong"),
  });

  if (items.length === 0) return null;

  const showConversionNote = displayCurrency !== currency;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={`/store/${slug}`}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft size={16} /> Continue shopping
          </Link>
          <div className="flex items-center gap-2">
            {store?.logo ? (
              <img src={store.logo} alt={store.name} className="h-8 w-auto" />
            ) : (
              <span className="font-black text-lg text-slate-900">{store?.name}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Lock size={12} /> Secure Checkout
          </div>
        </div>
      </header>

      {/* ── Progress bar (mobile) ── */}
      <div className="bg-white border-b border-slate-100 px-4 py-2 sm:hidden">
        <div className="flex items-center gap-2">
          {[{n:1,l:"Information"},{n:2,l:"Review & Pay"}].map(({n,l}) => (
            <div key={n} className="flex items-center gap-1.5 flex-1">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-[var(--text-primary)] flex-shrink-0"
                style={{ background: step >= n ? brand : "#CBD5E1" }}>
                {step > n ? "✓" : n}
              </span>
              <span className="text-xs font-semibold truncate"
                style={{ color: step >= n ? "var(--slate-900, #0F172A)" : "#94A3B8" }}>
                {l}
              </span>
              {n < 2 && <ChevronRight size={12} className="text-slate-300 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── LEFT: Form ── */}
          <div className="lg:col-span-3 space-y-5">
            <form onSubmit={handleSubmit(d => checkoutMut.mutate(d))} className="space-y-5">

              {/* Contact */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <StepBadge n={1} label="Contact Information" brand={brand} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={lbl}>Full Name</label>
                    <input {...register("name")} placeholder="John Doe" className={inp} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className={lbl}>Email address</label>
                    <input {...register("email")}
                      onBlur={e => { if (e.target.value.includes("@")) setCaptured(e.target.value, getValues("name")); }}
                      type="email" placeholder="john@email.com" className={inp} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className={lbl}>Phone</label>
                    <input {...register("phone")} type="tel" placeholder="+1 234 567 8900" className={inp} />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping address */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <StepBadge n={2} label="Shipping Address" brand={brand} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={lbl}>Street address</label>
                    <input {...register("address")} placeholder="123 Main Street, Apt 4B" className={inp} />
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
                  </div>
                  <div>
                    <label className={lbl}>City</label>
                    <input {...register("city")} placeholder="New York" className={inp} />
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className={lbl}>State / Province</label>
                    <input {...register("state")} placeholder="NY" className={inp} />
                    {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className={lbl}>Country</label>
                    <input {...register("country")} placeholder="United States" className={inp} />
                    {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country.message}</p>}
                  </div>
                  <div>
                    <label className={lbl}>Postal / ZIP code</label>
                    <input {...register("postalCode")} placeholder="10001" className={inp} />
                  </div>
                </div>
              </div>

              {/* Shipping method */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <StepBadge n={3} label="Shipping Method" brand={brand} />
                <div className="space-y-2">
                  {SHIPPING_OPTIONS.map(opt => {
                    const isActive = shipping.id === opt.id;
                    const isFreeByStore = freeShip && opt.id === "free";
                    return (
                      <button key={opt.id} type="button" onClick={() => setShipping(opt)}
                        className="w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left"
                        style={{
                          borderColor: isActive ? brand : "#E2E8F0",
                          background:  isActive ? brand + "06" : "#F8FAFC",
                        }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: isActive ? brand + "15" : "#F1F5F9" }}>
                            <opt.icon size={15} style={{ color: isActive ? brand : "#94A3B8" }} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{opt.label}</div>
                            <div className="text-xs text-slate-500">{opt.desc}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black"
                            style={{ color: (opt.price === 0 || isFreeByStore || autoFreeShipping) ? "#10B981" : "#0F172A" }}>
                            {opt.price === 0 || isFreeByStore || autoFreeShipping ? "FREE" : fmt(opt.price)}
                          </span>
                          <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                            style={{ borderColor: isActive ? brand : "#CBD5E1" }}>
                            {isActive && <div className="w-2 h-2 rounded-full" style={{ background: brand }} />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {(freeShip || autoFreeShipping) && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                    <CheckCircle size={13} /> You qualify for free shipping!
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <StepBadge n={4} label={<>Order Notes <span className="text-sm text-slate-400 font-normal">(Optional)</span></> as any} brand={brand} />
                <textarea {...register("notes")} rows={2}
                  placeholder="Special delivery instructions, gift message, etc."
                  className={`${inp} resize-none`} />
              </div>

              {/* Payment notice */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <StepBadge n={5} label="Payment" brand={brand} />
                <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <CreditCard size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-700">Secure Payment</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      After placing your order you'll complete payment on our secure payment page.
                      We accept Visa, Mastercard, Amex, Apple Pay, and Google Pay.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      {["VISA","MC","AMEX","🍎 Pay","G Pay"].map(c => (
                        <span key={c} className="px-2 py-1 rounded-md text-[10px] font-bold bg-white border border-slate-200 text-slate-600">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={checkoutMut.isPending}
                className="w-full py-4 rounded-2xl text-[var(--text-primary)] font-black text-base shadow-xl flex items-center justify-center gap-3 transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                style={{ background: `linear-gradient(135deg,${brand},${brand}cc)`, boxShadow: `0 12px 32px ${brand}35` }}>
                {checkoutMut.isPending
                  ? <><Loader2 size={18} className="animate-spin" /> Processing…</>
                  : <><Lock size={16} /> Place Order · {fmt(effectiveTotal)}</>}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={13} /> Your information is encrypted and secure
              </div>
            </form>
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm sticky top-24">

              {/* Mobile toggle */}
              <button className="lg:hidden w-full flex items-center justify-between p-5 font-black text-slate-900"
                onClick={() => setSummaryOpen(!summaryOpen)}>
                <span>Order Summary ({items.length} item{items.length !== 1 ? "s" : ""})</span>
                {summaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <div className={`lg:block ${summaryOpen ? "block" : "hidden"}`}>
                {/* Header */}
                <div className="p-5 hidden lg:block border-b border-slate-100">
                  <h3 className="font-black text-slate-900">Order Summary</h3>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Items */}
                <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                  {items.map(item => (
                    <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-13 h-13 w-[52px] h-[52px] rounded-xl overflow-hidden bg-slate-100">
                          {item.image
                            ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Package size={14} className="text-slate-400" /></div>}
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-700 text-[var(--text-primary)] text-[10px] font-black flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">{item.name}</p>
                        {item.variantLabel && <p className="text-xs text-slate-400 mt-0.5">{item.variantLabel}</p>}
                      </div>
                      <span className="text-sm font-black text-slate-900 flex-shrink-0">
                        {fmt(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon field */}
                <div className="px-4 pb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={couponCode}
                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                        placeholder="Coupon code"
                        disabled={!!couponApplied}
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-400 font-mono uppercase disabled:opacity-60"
                      />
                    </div>
                    {couponApplied ? (
                      <button onClick={() => { setCouponApplied(null); setCouponCode(""); }}
                        className="px-3 py-2.5 rounded-xl text-xs font-bold bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1">
                        <X size={12} /> Remove
                      </button>
                    ) : (
                      <button onClick={applyCoupon} disabled={!couponCode || couponLoading}
                        className="px-4 py-2.5 rounded-xl text-xs font-black text-[var(--text-primary)] disabled:opacity-50 transition-colors"
                        style={{ background: brand }}>
                        {couponLoading ? <Loader2 size={12} className="animate-spin" /> : "Apply"}
                      </button>
                    )}
                  </div>
                  {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
                  {couponApplied && (
                    <p className="text-xs text-emerald-600 mt-1.5 font-semibold">
                      ✓ {couponApplied.code} — {couponApplied.label} applied
                    </p>
                  )}
                </div>

                {/* Totals */}
                <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold text-slate-700">{fmt(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Shipping</span>
                    <span className={`font-semibold ${effectiveShipCost === 0 ? "text-emerald-600" : "text-slate-700"}`}>
                      {effectiveShipCost === 0 ? "FREE 🎉" : fmt(effectiveShipCost)}
                    </span>
                  </div>

                  {tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Tax ({store?.taxRate}%)</span>
                      <span className="font-semibold text-slate-700">{fmt(tax)}</span>
                    </div>
                  )}

                  {/* Auto discounts */}
                  {autoDiscountTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600 font-semibold">
                        {autoDiscounts?.autoDiscounts?.[0]?.discount?.name || "Auto discount"}
                      </span>
                      <span className="font-bold text-emerald-600">−{fmt(autoDiscountTotal)}</span>
                    </div>
                  )}

                  {/* Coupon discount */}
                  {couponApplied && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600 font-semibold">Coupon ({couponApplied.label})</span>
                      <span className="font-bold text-emerald-600">−{fmt(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-black text-base text-slate-900 border-t border-slate-200 pt-2.5">
                    <span>Total</span>
                    <div className="text-right">
                      <span style={{ color: brand }}>{fmt(effectiveTotal)}</span>
                      {showConversionNote && (
                        <div className="text-xs text-slate-400 mt-0.5 font-normal">
                          Charged in {currency}
                        </div>
                      )}
                    </div>
                  </div>

                  {subtotal < (store?.freeShippingThreshold || 50) && !autoFreeShipping && (
                    <div className="mt-1 text-xs text-center text-slate-400">
                      Add {fmt((store?.freeShippingThreshold || 50) - subtotal)} more for free shipping
                    </div>
                  )}
                </div>

                {/* Trust badges */}
                <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                  {TRUST.map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>{icon}</span> {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}