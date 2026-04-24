"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { X, ShoppingCart, Zap } from "lucide-react";

interface AbandonedCartTrackerProps {
  store: any;
  exitDiscount?: number;
  idleMinutes?: number;
}

export default function AbandonedCartTracker({
  store,
  exitDiscount = 10,
  idleMinutes = 30,
}: AbandonedCartTrackerProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const hasShown  = useRef(false);

  const resetTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (hasShown.current || dismissed) return;
    idleTimer.current = setTimeout(() => {
      // Only show if there are items in cart (check localStorage)
      const cartKey = `dropos_cart_${store?.id}`;
      const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
      if (cart.length > 0) {
        setShowPopup(true);
        hasShown.current = true;
      }
    }, idleMinutes * 60 * 1000);
  }, [idleMinutes, dismissed, store?.id]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [resetTimer]);

  // Exit intent on desktop
  useEffect(() => {
    if (hasShown.current || dismissed) return;
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        const cartKey = `dropos_cart_${store?.id}`;
        const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
        if (cart.length > 0) {
          setShowPopup(true);
          hasShown.current = true;
        }
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [dismissed, store?.id]);

  const dismissPopup = () => {
    setShowPopup(false);
    setDismissed(true);
  };

  const handleClaim = () => {
    if (exitDiscount && store?.id) {
      const code = `EXIT${exitDiscount}`;
      localStorage.setItem(`dropos_exit_code_${store.id}`, code);
    }
    dismissPopup();
    window.location.href = "/cart";
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
        onClick={dismissPopup}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-3xl p-8 text-center"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", zIndex: 9999 }}
      >
        <button
          onClick={dismissPopup}
          className="absolute top-4 right-4 opacity-40 hover:opacity-70 transition-opacity"
        >
          <X size={16} />
        </button>

        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(107,53,232,0.12)" }}
        >
          <ShoppingCart size={24} style={{ color: "var(--violet-400)" }} />
        </div>

        <h2 className="text-xl font-black tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
          Wait — don't leave yet
        </h2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
          You still have items in your cart. Complete your order now and get{" "}
          <strong style={{ color: "var(--violet-400)" }}>{exitDiscount}% off</strong> your purchase.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleClaim}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: "var(--violet-500)" }}
          >
            <Zap size={14} />
            Claim {exitDiscount}% discount
          </button>
          <button
            onClick={dismissPopup}
            className="w-full py-2.5 text-sm transition-opacity hover:opacity-70"
            style={{ color: "var(--text-secondary)" }}
          >
            No thanks, I'll leave
          </button>
        </div>
      </div>
    </div>
  );
}
