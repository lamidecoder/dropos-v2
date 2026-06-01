"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, ArrowRight, Package, Zap, Store, CreditCard, Check, ChevronRight } from "lucide-react";

interface OnboardingTipsProps {
  isDark: boolean;
  completedSteps: string[];
  storeSlug?: string;
}

const STEPS = [
  {
    id: "store",
    icon: Store,
    color: "#6B35E8",
    title: "Your store is live",
    desc: "Share your store link and start taking orders.",
    action: "View store",
    href: null, // dynamic
    done: (completed: string[]) => completed.includes("store"),
  },
  {
    id: "product",
    icon: Package,
    color: "#0EA5E9",
    title: "Add your first product",
    desc: "Import from AliExpress, Temu, or add manually.",
    action: "Import a product",
    href: "/kiro",
    done: (completed: string[]) => completed.includes("product"),
  },
  {
    id: "kiro",
    icon: Zap,
    color: "#7C3AED",
    title: "Ask KIRO anything",
    desc: "Describe your business — KIRO sets up your store.",
    action: "Chat with KIRO",
    href: "/kiro",
    done: (completed: string[]) => completed.includes("kiro"),
  },
  {
    id: "payment",
    icon: CreditCard,
    color: "#10B981",
    title: "Set up payments",
    desc: "Enable Paystack to start receiving money.",
    action: "Set up now",
    href: "/dashboard/settings",
    done: (completed: string[]) => completed.includes("payment"),
  },
];

export function OnboardingTips({ isDark, completedSteps, storeSlug }: OnboardingTipsProps) {
  const [dismissed, setDismissed] = useState(false);
  const t = {
    card:   isDark ? "rgba(255,255,255,0.03)" : "#fff",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.5)" : "rgba(19,13,46,0.5)",
    border: isDark ? "rgba(107,53,232,0.12)" : "rgba(107,53,232,0.1)",
    faint:  isDark ? "rgba(107,53,232,0.06)" : "rgba(107,53,232,0.04)",
  };

  const allDone = STEPS.every(s => s.done(completedSteps));
  if (dismissed || allDone) return null;

  const done = STEPS.filter(s => s.done(completedSteps)).length;
  const pct  = Math.round((done / STEPS.length) * 100);

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
        style={{ marginBottom:20, borderRadius:18, background:t.card, border:`1px solid ${t.border}`, overflow:"hidden", boxShadow:"0 2px 16px rgba(107,53,232,0.06)" }}>
        {/* Header */}
        <div style={{ padding:"16px 18px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <p style={{ fontSize:13, fontWeight:800, color:t.text, margin:0 }}>
                Get your store ready — {done}/{STEPS.length} done
              </p>
              <span style={{ fontSize:10, fontWeight:700, color:"#6B35E8", background:"rgba(107,53,232,0.08)", padding:"2px 8px", borderRadius:99 }}>
                {pct}%
              </span>
            </div>
            {/* Progress bar */}
            <div style={{ height:4, background:isDark?"rgba(255,255,255,0.06)":"rgba(107,53,232,0.08)", borderRadius:99, overflow:"hidden" }}>
              <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.6, ease:"easeOut" }}
                style={{ height:"100%", background:"linear-gradient(90deg,#6B35E8,#8B5CF6)", borderRadius:99 }}/>
            </div>
          </div>
          <button onClick={() => setDismissed(true)}
            style={{ marginLeft:14, background:"none", border:"none", cursor:"pointer", color:t.muted, padding:4, flexShrink:0 }}>
            <X size={14}/>
          </button>
        </div>

        {/* Steps */}
        <div style={{ padding:"12px 12px 14px", display:"flex", flexDirection:"column", gap:4 }}>
          {STEPS.map(step => {
            const Icon  = step.icon;
            const isDone = step.done(completedSteps);
            const href  = step.id === "store" && storeSlug ? `/store/${storeSlug}` : step.href;
            return (
              <div key={step.id} style={{
                display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:12,
                background: isDone ? "rgba(16,185,129,0.04)" : t.faint,
                border: `1px solid ${isDone ? "rgba(16,185,129,0.12)" : t.border}`,
                opacity: isDone ? 0.7 : 1,
              }}>
                <div style={{
                  width:32, height:32, borderRadius:9, flexShrink:0,
                  background: isDone ? "rgba(16,185,129,0.1)" : `${step.color}12`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  {isDone
                    ? <Check size={14} color="#10B981" strokeWidth={2.5}/>
                    : <Icon size={14} color={step.color}/>
                  }
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:isDone?"#10B981":t.text, margin:0, textDecoration:isDone?"line-through":"none" }}>
                    {step.title}
                  </p>
                  {!isDone && <p style={{ fontSize:11, color:t.muted, margin:"1px 0 0" }}>{step.desc}</p>}
                </div>
                {!isDone && href && (
                  <Link href={href}
                    style={{ fontSize:11, fontWeight:700, color:"#6B35E8", textDecoration:"none", display:"flex", alignItems:"center", gap:3, whiteSpace:"nowrap", flexShrink:0 }}>
                    {step.action} <ChevronRight size={11}/>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
