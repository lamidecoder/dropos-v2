"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../../../../lib/api";
import { useCartStore } from "../../../../store/cart.store";
import { Lock, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

function fmt(n: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(n || 0);
}

export default function PaymentPage() {
  const { slug }       = useParams<{ slug: string }>();
  const searchParams   = useSearchParams();
  const router         = useRouter();
  const orderId        = searchParams.get("orderId") || "";
  const clientSecret   = searchParams.get("clientSecret") || "";
  const { clearCart }  = useCartStore();

  const [paying, setPaying] = useState(false);
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry]   = useState("");
  const [cvv, setCvv]         = useState("");
  const [name, setName]       = useState("");
  const [error, setError]     = useState("");

  const { data: store } = useQuery({
    queryKey: ["pub-store", slug],
    queryFn: () => publicApi.get(`/stores/public/${slug}`).then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: order } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => publicApi.get(`/orders/track/${orderId}`).then(r => r.data.data),
    enabled: !!orderId,
  });

  const brand    = store?.primaryColor || "#6B35E8";
  const currency = store?.currency || "NGN";

  // Format card number with spaces
  const handleCardNum = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    setCardNum(digits.replace(/(.{4})/g, "$1 ").trim());
  };

  // Format expiry MM/YY
  const handleExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) setExpiry(digits.slice(0, 2) + "/" + digits.slice(2));
    else setExpiry(digits);
  };

  const handlePay = async () => {
    if (!cardNum || !expiry || !cvv || !name) { setError("Please fill in all card details"); return; }
    setError(""); setPaying(true);
    try {
      // For Stripe: confirm payment intent with card details
      // In production this would use Stripe.js confirmCardPayment
      const res = await publicApi.post("/payments/verify", {
        orderId,
        gateway: "STRIPE",
        clientSecret,
        paymentMethod: { card: { number: cardNum.replace(/\s/g, ""), exp_month: expiry.split("/")[0], exp_year: "20" + expiry.split("/")[1], cvc: cvv }, billing_details: { name } }
      });
      clearCart();
      router.push(`/store/${slug}/payment/callback?orderId=${orderId}`);
    } catch (e: any) {
      setError(e.response?.data?.message || "Payment failed. Please check your card details.");
      setPaying(false);
    }
  };

  if (!store || !order) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
      <Loader2 size={24} color={brand} style={{ animation: "spin 0.8s linear infinite" }}/>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FA", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      <header style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "14px clamp(16px,4vw,32px)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href={`/store/${slug}/cart`} style={{ display: "flex", alignItems: "center", gap: 6, color: "#666", textDecoration: "none", fontSize: 13 }}>
          <ArrowLeft size={14}/> Back to cart
        </Link>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{store.name}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#888" }}>
          <Lock size={12}/> Secure payment
        </div>
      </header>

      <div style={{ maxWidth: 480, margin: "40px auto", padding: "0 clamp(16px,4vw,24px)" }}>
        {/* Order summary */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", marginBottom: 16, border: "1px solid rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize: 12, color: "#888", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Order Summary</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "#111" }}>Order #{order.orderNumber}</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: brand }}>{fmt(order.total, currency)}</span>
          </div>
        </div>

        {/* Card form */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <CreditCard size={16} color={brand}/>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Card Details</span>
          </div>

          {[
            { label: "Cardholder Name", value: name, onChange: (v: string) => setName(v), placeholder: "John Doe", type: "text" },
            { label: "Card Number", value: cardNum, onChange: handleCardNum, placeholder: "1234 5678 9012 3456", type: "text", maxLength: 19 },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>{f.label}</label>
              <input value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder} type={f.type} maxLength={f.maxLength}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.1)", background: "#fafafa", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}/>
            </div>
          ))}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Expiry Date</label>
              <input value={expiry} onChange={e => handleExpiry(e.target.value)} placeholder="MM/YY" maxLength={5}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.1)", background: "#fafafa", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}/>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>CVV</label>
              <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="123" maxLength={4} type="password"
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.1)", background: "#fafafa", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}/>
            </div>
          </div>

          {error && <p style={{ fontSize: 13, color: "#EF4444", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>{error}</p>}

          <button onClick={handlePay} disabled={paying}
            style={{ width: "100%", padding: "14px 0", borderRadius: 12, background: `linear-gradient(135deg,${brand},${brand}CC)`, border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: paying ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 8px 24px ${brand}30` }}>
            {paying ? <><Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }}/> Processing…</> : <><Lock size={14}/> Pay {fmt(order.total, currency)}</>}
          </button>

          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14 }}>
            {["🔒 SSL Encrypted", "💳 Stripe Secured", "↩ Refundable"].map(t => (
              <span key={t} style={{ fontSize: 11, color: "#aaa" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
