"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Share2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Props {
  orderAmount?: number;
  customerName?: string;
  onDismiss: () => void;
}

function Particle({ x, y, color, delay }: { x: number; y: number; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ x: "50%", y: "50%", opacity: 1, scale: 1 }}
      animate={{ x: `${x}%`, y: `${y}%`, opacity: 0, scale: 0.2 }}
      transition={{ duration: 1.2 + Math.random() * 0.5, delay, ease: "easeOut" }}
      style={{ position: "absolute", width: 8, height: 8, borderRadius: 2, background: color, pointerEvents: "none" }}
    />
  );
}

const CONFETTI_COLORS = ["#6B35E8","#A78BFA","#10B981","#F59E0B","#EF4444","#06B6D4","#EC4899","#fff"];

export default function FirstSaleCelebration({ orderAmount, customerName, onDismiss }: Props) {
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x:  Math.random() * 200 - 50,
    y:  Math.random() * 200 - 50,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 0.3,
  }));

  const fmt = (n: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}>
      {/* Particles */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {particles.map(p => <Particle key={p.id} {...p} />)}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 380, borderRadius: 28, background: "#181230", border: "1px solid rgba(107,53,232,0.3)", overflow: "hidden", textAlign: "center", padding: "40px 32px 32px" }}>

        {/* Glow */}
        <div style={{ position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(107,53,232,0.5), transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }} />

        <button onClick={onDismiss} style={{ position: "absolute", top: 16, right: 16, color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer" }}>
          <X size={18} />
        </button>

        {/* Icon */}
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{ fontSize: 56, marginBottom: 16, display: "block" }}>
          🔥
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", marginBottom: 8 }}>
          FIRST SALE!
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ marginBottom: 24 }}>
          {orderAmount && (
            <p style={{ fontSize: 32, fontWeight: 900, color: "#10B981", letterSpacing: "-1px", marginBottom: 4 }}>
              {fmt(orderAmount)}
            </p>
          )}
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
            {customerName ? `${customerName} just bought from your store.` : "Someone just bought from your store."}
            {" "}This is your first step to financial freedom.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ display: "flex", gap: 10 }}>
          <Link href="/dashboard/orders" style={{ flex: 1, textDecoration: "none" }}>
            <button style={{ width: "100%", padding: "12px", borderRadius: 14, background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 8px 24px rgba(107,53,232,0.4)" }}>
              View Order <ArrowRight size={14} />
            </button>
          </Link>
          <button
            onClick={() => {
              navigator.share?.({ title: "I just made my first sale on DropOS! 🔥", text: "I launched my store and got my first sale in days. You should try DropOS!", url: "https://droposhq.com" })
                .catch(() => navigator.clipboard.writeText("I just made my first sale on DropOS! 🔥 Try it: https://droposhq.com"));
              toast?.success?.("Copied to share!");
            }}
            style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>
            <Share2 size={16} />
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 16 }}>
          KIRO is already working on getting you the next one
        </motion.p>
      </motion.div>
    </div>
  );
}
