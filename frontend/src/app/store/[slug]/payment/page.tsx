"use client";

import { Suspense , useState, useEffect} from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api, publicApi } from "../../../../lib/api";
import { Lock, ShieldCheck, ArrowLeft, CreditCard, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

// Stripe Elements loaded dynamically (avoids SSR issues)
let stripePromise: any = null;
function getStripe(pubKey: string) {
  if (!stripePromise) {
    stripePromise = import("@stripe/stripe-js").then(m => m.loadStripe(pubKey));
  }
  return stripePromise;
}

// ── Card input styling helpers ────────────────────────────────────────────────
const cardStyle = {
  style: {
    base: {
      fontSize:        "15px",
      fontFamily:      "Inter, sans-serif",
      color:           "#0F172A",
      "::placeholder": { color: "#94A3B8" },
    },
    invalid: { color: "#EF4444" },
  },
};

// ── StripeForm (rendered only client-side after Elements load) ────────────────
function StripePaymentForm({
  clientSecret, orderId, brand, onSuccess, onError,
}: {
  clientSecret: string; orderId: string; brand: string;
  onSuccess: () => void; onError: (msg: string) => void;
}) {
  const [elements, setElements]   = useState<any>(null);
  const [stripe,   setStripe]     = useState<any>(null);
  const [ready,    setReady]       = useState(false);
  const [paying,   setPaying]     = useState(false);
  const [cardErr,  setCardErr]     = useState("");
  const [mounted,  setMounted]     = useState(false);

  useEffect(() => {
    setMounted(true);
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "";
    if (!pk) { onError("Stripe public key not configured"); return; }

    getStripe(pk).then((s: any) => {
      if (!s) { onError("Failed to load Stripe"); return; }
      setStripe(s);

      const els = s.elements({ clientSecret });
      setElements(els);

      // Mount card element
      setTimeout(() => {
        const cardEl = els.create("payment", {
          layout: "tabs",
          defaultValues: {},
        });
        const container = document.getElementById("stripe-payment-element");
        if (container) {
          cardEl.mount(container);
          cardEl.on("ready", () => setReady(true));
          cardEl.on("change", (e: any) => setCardErr(e.error?.message || ""));
        }
      }, 100);
    });
  }, [clientSecret]);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setPaying(true);
    setCardErr("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/store/${window.location.pathname.split("/")[2]}/payment/callback?orderId=${orderId}`,
      },
    });

    if (error) {
      setCardErr(error.message || "Payment failed");
      onError(error.message || "Payment failed");
      setPaying(false);
    }
    // On success, Stripe redirects to return_url
  };

  if (!mounted) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={24} className="animate-spin text-slate-400" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Stripe Payment Element */}
      <div className="min-h-[200px] relative">
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-white rounded-xl">
            <Loader2 size={20} className="animate-spin text-slate-400" />
          </div>
        )}
        <div id="stripe-payment-element" className="min-h-[200px]" />
      </div>

      {cardErr && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-600">{cardErr}</p>
        </div>
      )}

      <button onClick={handlePay} disabled={!ready || paying}
        className="w-full py-4 rounded-2xl text-[var(--text-primary)] font-black text-base flex items-center justify-center gap-3 transition-all hover:opacity-90 disabled:opacity-60"
        style={{
          background: `linear-gradient(135deg,${brand},${brand}cc)`,
          boxShadow:  `0 12px 32px ${brand}35`,
        }}>
        {paying
          ? <><Loader2 size={18} className="animate-spin" /> Processing payment…</>
          : <><Lock size={16} /> Pay Now</>}
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function PaymentPageInner() {
  const { slug }       = useParams<{ slug: string }>();
  const searchParams   = useSearchParams();
  const router         = useRouter();
  const clientSecret   = searchParams.get("clientSecret") || "";
  const orderId        = searchParams.get("orderId")      || "";

  const [error, setError] = useState("");

  const { data: store } = useQuery({
    queryKey: ["public-store", slug],
    queryFn:  () => publicApi.get(`/stores/public/${slug}`).then(r => r.data.data),
  });

  const { data: order } = useQuery({
    queryKey: ["order-detail", orderId],
    queryFn:  () => api.get(`/orders/track/${orderId}`).then(r => r.data.data),
    enabled:  !!orderId,
  });

  const brand    = store?.primaryColor || "#7c3aed";
  const currency = store?.currency     || "USD";

  if (!clientSecret || !orderId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertCircle size={40} className="mx-auto mb-4 text-red-400" />
          <h2 className="font-black text-xl text-slate-900 mb-2">Invalid payment session</h2>
          <p className="text-slate-500 mb-5">This payment link is invalid or has expired.</p>
          <Link href={`/store/${slug}`}
            className="px-6 py-3 rounded-xl text-sm font-bold text-[var(--text-primary)] inline-flex items-center gap-2"
            style={{ background: brand }}>
            <ArrowLeft size={14} /> Back to store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={`/store/${slug}`}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft size={16} /> Back to store
          </Link>
          <span className="font-black text-lg text-slate-900">{store?.name}</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Lock size={12} /> Secure Payment
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Order summary pill */}
        {order && (
          <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium">Order</div>
              <div className="font-black text-slate-900">{order.orderNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Total</div>
              <div className="font-black text-lg" style={{ color: brand }}>
                {currency} {Number(order.total).toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Payment form card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${brand}12` }}>
                <CreditCard size={16} style={{ color: brand }} />
              </div>
              <div>
                <h2 className="font-black text-slate-900">Complete Payment</h2>
                <p className="text-xs text-slate-400">All transactions are encrypted & secure</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {error ? (
              <div className="text-center py-8">
                <AlertCircle size={32} className="mx-auto mb-3 text-red-400" />
                <p className="text-sm font-semibold text-red-600">{error}</p>
                <button onClick={() => setError("")}
                  className="mt-4 text-xs text-slate-400 hover:text-slate-600">
                  Try again
                </button>
              </div>
            ) : (
              <StripePaymentForm
                clientSecret={clientSecret}
                orderId={orderId}
                brand={brand}
                onSuccess={() => router.push(`/store/${slug}/payment/callback?orderId=${orderId}&payment_intent=success`)}
                onError={setError}
              />
            )}

            <div className="mt-5 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-center gap-4">
                {[
                  <ShieldCheck size={14} key="shield" className="text-slate-300" />,
                  <span key="ssl" className="text-xs text-slate-400">SSL Encrypted</span>,
                  <span key="dot" className="text-slate-200">·</span>,
                  <span key="stripe" className="text-xs text-slate-400">Powered by Stripe</span>,
                ]}
              </div>
            </div>
          </div>
        </div>

        {/* Accepted cards */}
        <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
          {["Visa", "Mastercard", "American Express", "Apple Pay", "Google Pay"].map(c => (
            <span key={c}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 shadow-sm">
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" /></div>}>
      <PaymentPageInner />
    </Suspense>
  );
}