"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Package, MapPin, Clock, Truck, Check, ChevronRight, ArrowRight, RefreshCw } from "lucide-react";

const V = { v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };

const PROVIDERS = [
  { id:"gig",     name:"GIG Logistics",        eta:"3-4 hrs",  icon:"🚚", desc:"Nationwide. Lagos, Abuja, Kano, PH, and 200+ cities." },
  { id:"kwik",    name:"Kwik (Same-day)",       eta:"1-2 hrs",  icon:"⚡", desc:"Lagos only. Fastest option for same-day delivery." },
  { id:"sendbox", name:"Sendbox",               eta:"4-8 hrs",  icon:"📦", desc:"Nationwide coverage with tracking." },
];

export default function DeliveryPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card:   isDark ? "rgba(255,255,255,0.03)" : "#fff",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.5)" : "rgba(19,13,46,0.5)",
    border: isDark ? "rgba(107,53,232,0.12)" : "rgba(107,53,232,0.1)",
    faint:  isDark ? "rgba(107,53,232,0.06)" : "rgba(107,53,232,0.04)",
    input:  isDark ? "rgba(255,255,255,0.04)" : "rgba(107,53,232,0.02)",
  };

  const user = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const [step, setStep] = useState<"orders" | "book" | "success">("orders");
  const [selected, setSelected] = useState<any>(null);
  const [provider, setProvider] = useState("gig");
  const [form, setForm] = useState({ deliveryAddress:"", deliveryPhone:"", recipientName:"" });
  const [bookingResult, setBookingResult] = useState<any>(null);

  const { data: orders = [] } = useQuery({
    queryKey: ["unfulfilled-orders", storeId],
    queryFn: () => api.get(`/orders/${storeId}?fulfillmentStatus=UNFULFILLED&limit=20`).then(r => r.data.data?.orders || r.data.data || []),
    enabled: !!storeId,
  });

  const bookMut = useMutation({
    mutationFn: (data: any) => api.post("/delivery/book", data),
    onSuccess: (res) => {
      setBookingResult(res.data.data);
      setStep("success");
    },
  });

  const book = () => {
    if (!selected) return;
    bookMut.mutate({
      orderId: selected.id,
      storeId,
      pickupAddress: user?.stores?.[0]?.address || "Lagos, Nigeria",
      pickupPhone: user?.phone || user?.email,
      deliveryAddress: form.deliveryAddress || selected.shippingAddress,
      deliveryPhone: form.deliveryPhone || selected.customerPhone,
      recipientName: form.recipientName || selected.customerName,
      packageValue: selected.total,
      provider,
    });
  };

  if (step === "success" && bookingResult) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", paddingTop: 60 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Check size={28} color={V.green}/>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: t.text, margin: "0 0 8px", letterSpacing: "-0.03em" }}>Rider booked!</h2>
        <p style={{ fontSize: 14, color: t.muted, marginBottom: 28 }}>Booking ID: <strong style={{ color: t.text }}>{bookingResult.bookingId}</strong></p>
        {bookingResult.trackingUrl && (
          <a href={bookingResult.trackingUrl} target="_blank" rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 24px", borderRadius: 12, background: V.v400, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
            Track delivery <ArrowRight size={13}/>
          </a>
        )}
        <br/>
        <button onClick={() => { setStep("orders"); setSelected(null); setBookingResult(null); }}
          style={{ fontSize: 13, color: t.muted, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          Book another delivery
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: t.text, marginBottom: 4, letterSpacing: "-0.03em" }}>Delivery</h1>
        <p style={{ fontSize: 13, color: t.muted }}>Book riders for your unfulfilled orders — GIG, Kwik, or Sendbox</p>
      </motion.div>

      {step === "orders" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {orders.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <Package size={32} style={{ color: t.muted, margin: "0 auto 12px" }}/>
              <p style={{ fontSize: 14, color: t.muted }}>No unfulfilled orders right now.</p>
            </div>
          )}
          {orders.map((order: any) => (
            <motion.div key={order.id} whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}
              onClick={() => { setSelected(order); setStep("book"); }}
              style={{ padding: "16px 20px", borderRadius: 14, background: t.card, border: `1px solid ${t.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: t.faint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Package size={16} color={V.v400}/>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: 0 }}>{order.customerName || order.customerEmail}</p>
                <p style={{ fontSize: 11, color: t.muted, margin: "2px 0 0" }}>#{order.orderNumber} · ₦{Number(order.total).toLocaleString()}</p>
              </div>
              <ChevronRight size={14} style={{ color: t.muted }}/>
            </motion.div>
          ))}
        </div>
      )}

      {step === "book" && selected && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={() => setStep("orders")} style={{ fontSize: 12, color: t.muted, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", marginBottom: 16 }}>
            ← Back
          </button>

          {/* Order info */}
          <div style={{ padding: 20, borderRadius: 14, background: t.card, border: `1px solid ${t.border}`, marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: t.muted, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Order Details</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: 0 }}>{selected.customerName || selected.customerEmail}</p>
            <p style={{ fontSize: 12, color: t.muted, margin: "4px 0" }}>#{selected.orderNumber} · ₦{Number(selected.total).toLocaleString()}</p>
            {selected.shippingAddress && <p style={{ fontSize: 12, color: t.muted, margin: 0 }}>📍 {selected.shippingAddress}</p>}
          </div>

          {/* Provider selection */}
          <p style={{ fontSize: 12, fontWeight: 700, color: t.muted, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Choose Courier</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {PROVIDERS.map(p => (
              <div key={p.id} onClick={() => setProvider(p.id)}
                style={{ padding: "16px 20px", borderRadius: 14, background: provider === p.id ? "rgba(107,53,232,0.08)" : t.card, border: `1px solid ${provider === p.id ? "rgba(107,53,232,0.3)" : t.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 22 }}>{p.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: 0 }}>{p.name}</p>
                  <p style={{ fontSize: 11, color: t.muted, margin: "2px 0 0" }}>{p.desc}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: V.v400, margin: 0 }}>{p.eta}</p>
                </div>
                {provider === p.id && <Check size={14} color={V.v400}/>}
              </div>
            ))}
          </div>

          {/* Delivery details */}
          <div style={{ padding: 20, borderRadius: 14, background: t.card, border: `1px solid ${t.border}`, marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: t.muted, margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>Delivery Details</p>
            {[
              { key:"recipientName",    label:"Recipient Name",    placeholder: selected.customerName  },
              { key:"deliveryPhone",    label:"Phone Number",      placeholder: selected.customerPhone || "+234..." },
              { key:"deliveryAddress",  label:"Delivery Address",  placeholder: selected.shippingAddress || "Full delivery address" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 11, fontWeight: 600, color: t.muted, display: "block", marginBottom: 5 }}>{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.input, fontSize: 13, color: t.text, fontFamily: "inherit", outline: "none" }}
                />
              </div>
            ))}
          </div>

          <button onClick={book} disabled={bookMut.isPending}
            style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", cursor: "pointer", background: V.v400, color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {bookMut.isPending ? <><RefreshCw size={14} style={{ animation: "spin 0.7s linear infinite" }}/> Booking...</> : <><Truck size={14}/> Book Rider Now</>}
            <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
          </button>
        </motion.div>
      )}
    </div>
  );
}
