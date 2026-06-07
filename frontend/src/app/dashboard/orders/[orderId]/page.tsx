"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../../store/auth.store";
import { api } from "../../../../lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  ArrowLeft, Package, Truck, Check, Clock, X, RefreshCw,
  MapPin, Phone, Mail, User, Copy, ExternalLink, MessageSquare,
} from "lucide-react";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B", red:"#EF4444", cyan:"#06B6D4" };

const STATUS_CONFIG: Record<string,any> = {
  PENDING:    { label:"Pending",    color:V.amber,  bg:"rgba(245,158,11,0.1)",  icon:Clock,   next:"PAID" },
  PAID:       { label:"Paid",       color:V.green,  bg:"rgba(16,185,129,0.1)",  icon:Check,   next:"SHIPPED" },
  SHIPPED:    { label:"Shipped",    color:V.cyan,   bg:"rgba(6,182,212,0.1)",   icon:Truck,   next:"DELIVERED" },
  DELIVERED:  { label:"Delivered",  color:V.v400,   bg:"rgba(107,53,232,0.1)", icon:Package, next:null },
  CANCELLED:  { label:"Cancelled",  color:V.red,    bg:"rgba(239,68,68,0.1)",   icon:X,       next:null },
  REFUNDED:   { label:"Refunded",   color:V.v400,   bg:"rgba(139,92,246,0.1)", icon:RefreshCw,next:null },
};

const TIMELINE_STEPS = ["PENDING","PAID","SHIPPED","DELIVERED"];

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId:string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);

  const C = {
    card:   isDark ? "rgba(255,255,255,0.04)" : "#fff",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.45)" : "rgba(19,13,46,0.5)",
    border: isDark ? "rgba(107,53,232,0.15)" : "rgba(107,53,232,0.12)",
    faint:  isDark ? "rgba(107,53,232,0.06)" : "rgba(107,53,232,0.04)",
  };

  const [tracking, setTracking] = useState("");

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api.get(`/orders/${storeId}/${orderId}`).then(r => r.data.data),
    enabled: !!storeId && !!orderId,
  });

  const updateMut = useMutation({
    mutationFn: (status: string) => api.put(`/orders/${storeId}/${orderId}`, { status, trackingNumber: tracking || undefined }),
    onSuccess: (_, status) => { toast.success(`Order marked as ${status}`); qc.invalidateQueries({ queryKey:["order", orderId] }); qc.invalidateQueries({ queryKey:["orders"] }); },
    onError: () => toast.error("Update failed"),
  });

  if (isLoading || !order) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:400 }}>
      <RefreshCw size={24} color={V.v400} style={{ animation:"spin 0.7s linear infinite" }}/>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  const currentStep = TIMELINE_STEPS.indexOf(order.status);
  const fmt = (n: number) => `₦${Number(n||0).toLocaleString()}`;

  return (
    <div style={{ maxWidth:840, margin:"0 auto", fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Link href="/dashboard/orders" style={{ width:36, height:36, borderRadius:10, background:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", color:C.muted }}>
            <ArrowLeft size={16}/>
          </Link>
          <div>
            <h1 style={{ fontSize:18, fontWeight:900, color:C.text, margin:0 }}>Order #{order.orderNumber || orderId?.slice(-8).toUpperCase()}</h1>
            <p style={{ fontSize:12, color:C.muted, margin:0 }}>{new Date(order.createdAt).toLocaleString("en-NG", { day:"numeric", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit" })}</p>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 16px", borderRadius:99, background:cfg.bg, border:`1px solid ${cfg.color}30` }}>
          <Icon size={14} color={cfg.color}/>
          <span style={{ fontSize:13, fontWeight:700, color:cfg.color }}>{cfg.label}</span>
        </div>
      </div>

      {/* Timeline */}
      {!["CANCELLED","REFUNDED"].includes(order.status) && (
        <div style={{ background:C.card, borderRadius:16, padding:"20px 24px", border:`1px solid ${C.border}`, marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:0 }}>
            {TIMELINE_STEPS.map((step, i) => {
              const done = currentStep >= i;
              const active = currentStep === i;
              const stepCfg = STATUS_CONFIG[step];
              const StepIcon = stepCfg.icon;
              return (
                <div key={step} style={{ display:"flex", alignItems:"center", flex: i < TIMELINE_STEPS.length-1 ? 1 : 0 }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:done?V.v500:"transparent", border:`2px solid ${done?V.v500:C.border}`, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.3s", boxShadow:active?`0 0 0 4px ${V.v500}20`:undefined }}>
                      <StepIcon size={15} color={done?"#fff":C.muted as string}/>
                    </div>
                    <p style={{ fontSize:10, fontWeight:done?700:400, color:done?C.text:C.muted, margin:0, whiteSpace:"nowrap" }}>{stepCfg.label}</p>
                  </div>
                  {i < TIMELINE_STEPS.length-1 && (
                    <div style={{ flex:1, height:2, background:currentStep > i ? V.v500 : C.border, margin:"0 8px", marginBottom:18, transition:"all 0.3s" }}/>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:16 }} className="order-grid">
        {/* Left */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Items */}
          <div style={{ background:C.card, borderRadius:16, padding:20, border:`1px solid ${C.border}` }}>
            <p style={{ fontSize:13, fontWeight:700, color:C.text, margin:"0 0 14px" }}>{order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}</p>
            {(order.items || []).map((item: any, i: number) => (
              <div key={i} style={{ display:"flex", gap:12, marginBottom:i < order.items.length-1 ? 12 : 0, paddingBottom:i < order.items.length-1 ? 12 : 0, borderBottom:i < order.items.length-1 ? `1px solid ${C.border}` : "none" }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width:52, height:52, borderRadius:10, objectFit:"cover", flexShrink:0, background:C.faint }}/>
                ) : (
                  <div style={{ width:52, height:52, borderRadius:10, background:C.faint, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Package size={20} color={C.muted as string}/>
                  </div>
                )}
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:C.text, margin:"0 0 2px" }}>{item.name}</p>
                  {item.variant && <p style={{ fontSize:11, color:C.muted, margin:"0 0 4px" }}>{item.variant}</p>}
                  <p style={{ fontSize:12, color:C.muted, margin:0 }}>Qty: {item.quantity} × {fmt(item.price)}</p>
                </div>
                <p style={{ fontSize:14, fontWeight:700, color:C.text, flexShrink:0 }}>{fmt(item.quantity * item.price)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ background:C.card, borderRadius:16, padding:20, border:`1px solid ${C.border}` }}>
            {[
              { label:"Subtotal",  value:fmt(order.subtotal || order.total) },
              { label:"Shipping",  value:order.shippingCost ? fmt(order.shippingCost) : "Free" },
              { label:"Discount",  value:order.discount ? `-${fmt(order.discount)}` : null },
            ].filter(r => r.value).map(row => (
              <div key={row.label} style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:13, color:C.muted }}>{row.label}</span>
                <span style={{ fontSize:13, color:C.text }}>{row.value}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", paddingTop:12, borderTop:`1px solid ${C.border}`, marginTop:4 }}>
              <span style={{ fontSize:15, fontWeight:700, color:C.text }}>Total</span>
              <span style={{ fontSize:18, fontWeight:900, color:C.text, letterSpacing:"-0.03em" }}>{fmt(order.total)}</span>
            </div>
          </div>

          {/* Fulfillment actions */}
          {cfg.next && (
            <div style={{ background:C.card, borderRadius:16, padding:20, border:`1px solid ${C.border}` }}>
              <p style={{ fontSize:13, fontWeight:700, color:C.text, margin:"0 0 14px" }}>Fulfil this order</p>
              {cfg.next === "SHIPPED" && (
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:5 }}>Tracking number (optional)</label>
                  <input value={tracking} onChange={e => setTracking(e.target.value)}
                    placeholder="e.g. GIG-12345678" style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1px solid ${C.border}`, background:C.faint, color:C.text, fontSize:13, fontFamily:"inherit", outline:"none" }}/>
                </div>
              )}
              <button onClick={() => updateMut.mutate(cfg.next)} disabled={updateMut.isPending}
                style={{ width:"100%", padding:"13px 0", borderRadius:12, border:"none", cursor:"pointer", background:`linear-gradient(135deg,#2D1B69,${V.v500})`, color:"#fff", fontSize:14, fontWeight:700, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 4px 16px rgba(107,53,232,0.25)", opacity:updateMut.isPending?0.7:1 }}>
                {updateMut.isPending ? <><RefreshCw size={14} style={{ animation:"spin 0.7s linear infinite" }}/> Updating…</>
                  : cfg.next === "SHIPPED" ? <><Truck size={14}/> Mark as Shipped</>
                  : cfg.next === "DELIVERED" ? <><Check size={14}/> Mark as Delivered</>
                  : <><Check size={14}/> Mark as {STATUS_CONFIG[cfg.next]?.label}</>
                }
              </button>
              {!["CANCELLED","DELIVERED"].includes(order.status) && (
                <button onClick={() => updateMut.mutate("CANCELLED")}
                  style={{ width:"100%", marginTop:8, padding:"10px 0", borderRadius:10, border:`1px solid ${V.red}20`, background:"rgba(239,68,68,0.05)", color:V.red, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit" }}>
                  Cancel order
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Customer */}
          <div style={{ background:C.card, borderRadius:16, padding:18, border:`1px solid ${C.border}` }}>
            <p style={{ fontSize:12, fontWeight:700, color:C.muted, margin:"0 0 12px", textTransform:"uppercase", letterSpacing:"0.08em" }}>Customer</p>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:`${V.v500}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <User size={16} color={V.v400}/>
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:C.text, margin:0 }}>{order.customerName || "Guest"}</p>
                <p style={{ fontSize:11, color:C.muted, margin:0 }}>{order.customerEmail}</p>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {order.customerPhone && (
                <div style={{ display:"flex", gap:8 }}>
                  <Phone size={13} color={C.muted as string} style={{ flexShrink:0, marginTop:2 }}/>
                  <a href={`tel:${order.customerPhone}`} style={{ fontSize:13, color:C.text, textDecoration:"none" }}>{order.customerPhone}</a>
                </div>
              )}
              <div style={{ display:"flex", gap:8 }}>
                <Mail size={13} color={C.muted as string} style={{ flexShrink:0, marginTop:2 }}/>
                <a href={`mailto:${order.customerEmail}`} style={{ fontSize:13, color:V.v400, textDecoration:"none" }}>{order.customerEmail}</a>
              </div>
            </div>
            {order.customerPhone && (
              <a href={`https://wa.me/${order.customerPhone?.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:12, padding:"9px 0", borderRadius:10, background:"rgba(37,211,102,0.08)", border:"1px solid rgba(37,211,102,0.2)", color:"#25D366", textDecoration:"none", fontSize:13, fontWeight:700 }}>
                <MessageSquare size={13}/> WhatsApp customer
              </a>
            )}
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div style={{ background:C.card, borderRadius:16, padding:18, border:`1px solid ${C.border}` }}>
              <p style={{ fontSize:12, fontWeight:700, color:C.muted, margin:"0 0 12px", textTransform:"uppercase", letterSpacing:"0.08em" }}>Shipping address</p>
              <div style={{ display:"flex", gap:8 }}>
                <MapPin size={13} color={C.muted as string} style={{ flexShrink:0, marginTop:2 }}/>
                <div>
                  <p style={{ fontSize:13, color:C.text, margin:0, lineHeight:1.6 }}>
                    {order.shippingAddress.street}<br/>
                    {order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}<br/>
                    {order.shippingAddress.country || "Nigeria"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment */}
          <div style={{ background:C.card, borderRadius:16, padding:18, border:`1px solid ${C.border}` }}>
            <p style={{ fontSize:12, fontWeight:700, color:C.muted, margin:"0 0 12px", textTransform:"uppercase", letterSpacing:"0.08em" }}>Payment</p>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:12, color:C.muted }}>Method</span>
              <span style={{ fontSize:12, fontWeight:600, color:C.text }}>{order.paymentMethod || "Paystack"}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:12, color:C.muted }}>Status</span>
              <span style={{ fontSize:12, fontWeight:700, color:order.paymentStatus==="PAID"?V.green:V.amber }}>{order.paymentStatus || "Pending"}</span>
            </div>
          </div>

          {/* Tracking */}
          {order.trackingNumber && (
            <div style={{ padding:14, borderRadius:14, background:`${V.cyan}08`, border:`1px solid ${V.cyan}20` }}>
              <p style={{ fontSize:11, fontWeight:700, color:V.cyan, margin:"0 0 6px" }}>TRACKING</p>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <code style={{ fontSize:13, fontWeight:700, color:C.text, flex:1 }}>{order.trackingNumber}</code>
                <button onClick={() => { navigator.clipboard.writeText(order.trackingNumber); toast.success("Copied"); }}
                  style={{ background:"none", border:"none", cursor:"pointer", color:V.cyan, padding:4 }}>
                  <Copy size={13}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:768px){ .order-grid{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
}
