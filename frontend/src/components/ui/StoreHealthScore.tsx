"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronRight, Check, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/auth.store";

interface HealthCheck {
  id:      string;
  label:   string;
  passed:  boolean;
  impact:  "high" | "medium" | "low";
  fix?:    string;
  href?:   string;
}

function deriveChecks(data: any, user: any): HealthCheck[] {
  const store = user?.stores?.[0];
  const products = data?.products || [];
  const orders   = data?.orders   || [];

  return [
    { id: "store_name",    label: "Store has a name",               passed: !!store?.name,                             impact: "high",   href: "/dashboard/stores" },
    { id: "logo",          label: "Logo uploaded",                  passed: !!store?.logo,                             impact: "medium", href: "/dashboard/customize" },
    { id: "products",      label: "At least 5 products",            passed: (data?.productCount || 0) >= 5,            impact: "high",   href: "/dashboard/products" },
    { id: "images",        label: "Products have images",           passed: products.filter((p: any) => p.images?.length > 0).length >= Math.min(products.length, 3), impact: "high", href: "/dashboard/products" },
    { id: "descriptions",  label: "Products have descriptions",     passed: products.filter((p: any) => p.description?.length > 20).length >= Math.min(products.length, 3), impact: "medium", href: "/dashboard/products" },
    { id: "shipping",      label: "Shipping zones configured",      passed: !!(data?.shippingZonesCount || 0),          impact: "high",   href: "/dashboard/shipping" },
    { id: "payment",       label: "Paystack connected",             passed: !!store?.paystackConnected,                 impact: "high",   href: "/dashboard/settings" },
    { id: "domain",        label: "Custom domain set up",           passed: !!store?.customDomain,                     impact: "medium", href: "/dashboard/settings" },
    { id: "social",        label: "Social links added",             passed: !!(store?.instagramUrl || store?.whatsappNumber), impact: "low", href: "/dashboard/stores" },
    { id: "first_sale",    label: "First sale made",                passed: (data?.orderCount || 0) > 0,               impact: "high",   href: "/dashboard/kiro" },
  ];
}

function scoreColor(score: number) {
  if (score >= 80) return "#10B981";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
}

function scoreLabel(score: number) {
  if (score >= 80) return "Great";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs work";
  return "Just starting";
}

export default function StoreHealthScore() {
  const user = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const [expanded, setExpanded] = useState(false);

  const { data } = useQuery({
    queryKey:  ["health-data", storeId],
    queryFn:   () => api.get("/dashboard/setup-progress").then(r => r.data.data),
    enabled:   !!storeId,
    staleTime: 120000,
  });

  const checks = deriveChecks(data || {}, user);
  const passed  = checks.filter(c => c.passed).length;
  const score   = Math.round((passed / checks.length) * 100);
  const color   = scoreColor(score);
  const failing = checks.filter(c => !c.passed && c.impact === "high");

  // Don't show if perfect
  if (score === 100) return null;

  return (
    <div className="rounded-2xl overflow-hidden mb-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      {/* Header */}
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-4 p-4 text-left">
        {/* Score ring */}
        <div className="relative flex-shrink-0" style={{ width: 52, height: 52 }}>
          <svg width="52" height="52" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
            <circle cx="26" cy="26" r="22" fill="none" stroke={color} strokeWidth="4"
              strokeDasharray={`${(score / 100) * 138.2} 138.2`}
              strokeLinecap="round"
              transform="rotate(-90 26 26)"
              style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-black text-sm leading-none" style={{ color }}>{score}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-sm text-white">Store Health</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${color}15`, color }}>{scoreLabel(score)}</span>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            {passed}/{checks.length} checks passed · {failing.length > 0 ? `${failing.length} high priority issues` : "Only minor gaps"}
          </p>
        </div>

        {/* KIRO fix button */}
        <Link href="/dashboard/kiro" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: "rgba(107,53,232,0.12)", color: "#A78BFA", border: "1px solid rgba(107,53,232,0.2)", whiteSpace: "nowrap" }}>
            <Zap size={10} /> Ask KIRO to fix
          </div>
        </Link>

        <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.3)", transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }} />
      </button>

      {/* Expanded checks */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden" }}>
            <div className="px-4 pb-4 space-y-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {checks.map(c => (
                <div key={c.id} className="flex items-center gap-3 py-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: c.passed ? "rgba(16,185,129,0.15)" : c.impact === "high" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)" }}>
                    {c.passed
                      ? <Check size={10} color="#10B981" strokeWidth={3} />
                      : c.impact === "high"
                        ? <AlertTriangle size={10} color="#EF4444" />
                        : <AlertTriangle size={10} color="#F59E0B" />
                    }
                  </div>
                  <span className="text-xs flex-1" style={{ color: c.passed ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.8)", textDecoration: c.passed ? "line-through" : "none" }}>
                    {c.label}
                  </span>
                  {!c.passed && c.href && (
                    <Link href={c.href} className="text-xs font-semibold" style={{ color: "#8B5CF6" }}>Fix</Link>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
