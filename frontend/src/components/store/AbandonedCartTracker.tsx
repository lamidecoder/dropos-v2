"use client";

/**
 * AbandonedCartTracker
 * ─────────────────────
 * Drop this once inside any storefront template. It:
 *
 * 1. EXIT INTENT — fires when the mouse leaves the viewport heading upward
 *    (toward the browser chrome/tabs). Shows a retention popup with a
 *    discount offer.
 *
 * 2. IDLE TIMER — after 30 minutes of cart inactivity AND an email has been
 *    captured (from checkout form), saves the cart to the backend so a
 *    recovery email can be sent.
 *
 * 3. POST-CHECKOUT EMAIL CAPTURE — when the user starts filling the checkout
 *    form and types their email, we capture it. If they abandon before
 *    completing, we have it.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useCartStore } from "@/store/cart.store";
import { api } from "@/lib/api";
import { X, Gift, ArrowRight, ShoppingBag, Zap } from "lucide-react";

interface Props {
  store:         any;
  exitDiscount?: number;   // % discount shown in exit popup, 0 to disable
  idleMinutes?:  number;   // minutes before saving abandoned cart (default 30)
}

const POPUP_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h between popups

export default function AbandonedCartTracker({
  store,
  exitDiscount = 10,
  idleMinutes  = 30,
}: Props) {
  const { items, total, capturedEmail, capturedName, lastActivity } = useCartStore();

  const [showExitPopup, setShowExitPopup]   = useState(false);
  const [emailInput,    setEmailInput]       = useState("");
  const [submitted,     setSubmitted]        = useState(false);
  const [savedToBackend,setSavedToBackend]   = useState(false);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupShownRef = useRef(false);

  const brand     = store?.primaryColor || "#7C3AED";
  const storeName = store?.name || "Our Store";
  const storeId   = store?.id;
  const storeSlug = store?.slug;
  const currency  = store?.currency || "$";

  // ── Save cart to backend ──────────────────────────────────────────────────
  const saveCartToBackend = useCallback(async (email: string, name?: string) => {
    if (!storeId || items.length === 0 || savedToBackend) return;
    try {
      await api.post("/abandoned-carts/save", {
        storeId,
        email,
        name: name || undefined,
        items: items.map(i => ({
          productId: i.productId, name: i.name, price: i.price,
          quantity:  i.quantity,  image: i.image,
          variantId: i.variantId, variantLabel: i.variantLabel,
          storeId:   i.storeId,   storeSlug:    i.storeSlug,
        })),
        total:    total(),
        currency: store?.currency || "USD",
      });
      setSavedToBackend(true);
    } catch (err) {
      // Silent fail — don't disrupt UX
      console.error("[AbandonedCart] Save failed:", err);
    }
  }, [storeId, items, total, savedToBackend, store?.currency]);

  // ── Idle timer — reset whenever cart changes ──────────────────────────────
  useEffect(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    if (items.length === 0) return;
    const email = capturedEmail;
    if (!email) return; // can't send email if we don't have address yet

    idleTimerRef.current = setTimeout(() => {
      saveCartToBackend(email, capturedName || undefined);
    }, idleMinutes * 60 * 1000);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [lastActivity, items.length, capturedEmail, capturedName, saveCartToBackend, idleMinutes]);

  // ── Exit intent detection ─────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (items.length === 0) return;          // no cart = no need
    if (exitDiscount === 0) return;          // feature disabled

    // Check 24h cooldown
    const lastShown = localStorage.getItem(`dropos-exit-popup-${storeId}`);
    if (lastShown && Date.now() - Number(lastShown) < POPUP_COOLDOWN_MS) return;

    let armed = false;
    const ARM_DELAY = 3000; // wait 3s before arming (avoids instant trigger on load)
    const armTimer = setTimeout(() => { armed = true; }, ARM_DELAY);

    const handleMouseLeave = (e: MouseEvent) => {
      if (!armed) return;
      if (popupShownRef.current) return;
      // Only trigger when leaving from the top 20px (toward browser chrome)
      if (e.clientY <= 20) {
        setShowExitPopup(true);
        popupShownRef.current = true;
        localStorage.setItem(`dropos-exit-popup-${storeId}`, String(Date.now()));
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      clearTimeout(armTimer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [items.length, exitDiscount, storeId]);

  // ── Exit popup email submit ───────────────────────────────────────────────
  const handleExitSubmit = async () => {
    if (!emailInput || !emailInput.includes("@")) return;
    useCartStore.getState().setCaptured(emailInput);
    await saveCartToBackend(emailInput);
    setSubmitted(true);
    // Auto-close after 3s
    setTimeout(() => setShowExitPopup(false), 3000);
  };

  // ── Dismiss popup ─────────────────────────────────────────────────────────
  const dismissPopup = () => {
    setShowExitPopup(false);
    // Save cart if we have email
    if (capturedEmail) saveCartToBackend(capturedEmail, capturedName || undefined);
  };

  if (!showExitPopup) return null;

  // ── Item count info ───────────────────────────────────────────────────────
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = total();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
        onClick={dismissPopup}
      />

      {/* Popup */}
      <div
        className="fixed z-[9999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
        style={{ animation: "popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both" }}
      >
        <style>{`
          @keyframes popIn {
            from { opacity: 0; transform: translate(-50%,-50%) scale(0.88); }
            to   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
          }
        `}</style>

        <div className="rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>

          {/* Dismiss button */}
          <button
            onClick={dismissPopup}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10"
            style={{ background: "var(--bg-secondary)" }}>
            <X size={14} className="text-[var(--text-secondary)]" />
          </button>

          {/* Top accent bar */}
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${brand}, #A78BFA)` }} />

          <div className="p-8">
            {!submitted ? (
              <>
                {/* Icon + heading */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                    style={{ background: `${brand}15`, border: `1px solid ${brand}30` }}>
                    <Gift size={28} style={{ color: brand }} />
                  </div>
                  <h2 className="text-[var(--text-primary)] text-2xl font-black tracking-tight mb-2">
                    Wait! Don't leave yet
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                    You have <strong className="text-[var(--text-secondary)]">{itemCount} item{itemCount !== 1 ? "s" : ""}</strong> worth{" "}
                    <strong style={{ color: brand }}>{currency}{cartTotal.toFixed(2)}</strong> in your cart.
                  </p>
                </div>

                {/* Offer card */}
                {exitDiscount > 0 && (
                  <div className="rounded-2xl p-4 mb-5 text-center"
                    style={{ background: `${brand}0d`, border: `1px solid ${brand}25` }}>
                    <div className="text-4xl font-black mb-1" style={{ color: brand }}>
                      {exitDiscount}% OFF
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm">
                      Enter your email to get a discount code for your cart
                    </p>
                  </div>
                )}

                {/* Email capture */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleExitSubmit()}
                      placeholder="your@email.com"
                      className="flex-1 px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-disabled)] outline-none"
                      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
                    />
                    <button
                      onClick={handleExitSubmit}
                      className="px-4 py-3 rounded-xl font-black text-black text-sm flex items-center gap-1.5 flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${brand}, #A78BFA)` }}>
                      Get {exitDiscount > 0 ? `${exitDiscount}%` : "Deal"} <ArrowRight size={14} />
                    </button>
                  </div>
                  <p className="text-[var(--text-disabled)] text-[10px] text-center">
                    We'll also send your cart so you can finish anytime. No spam, ever.
                  </p>
                </div>

                {/* Or continue shopping */}
                <div className="flex items-center gap-3 mt-5">
                  <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                  <span className="text-[var(--text-disabled)] text-xs">or</span>
                  <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                </div>
                <button
                  onClick={dismissPopup}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ color: "var(--text-tertiary)" }}>
                  <ShoppingBag size={14} /> Continue shopping
                </button>
              </>
            ) : (
              /* Success state */
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                  style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>
                  <Zap size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-[var(--text-primary)] text-xl font-black mb-2">You're all set!</h3>
                {exitDiscount > 0 ? (
                  <p className="text-[var(--text-secondary)] text-sm mb-4">
                    Check your inbox — your <strong style={{ color: brand }}>{exitDiscount}% off</strong> code is on its way.
                  </p>
                ) : (
                  <p className="text-[var(--text-secondary)] text-sm mb-4">
                    We've saved your cart. Check your email to pick up where you left off.
                  </p>
                )}
                <div className="inline-block px-4 py-2 rounded-xl text-sm font-bold text-[var(--text-tertiary)]"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  This window will close shortly...
                </div>
              </div>
            )}
          </div>

          {/* Cart preview strip */}
          {items.length > 0 && !submitted && (
            <div className="border-t px-6 py-3 flex items-center gap-3"
              style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
              <div className="flex -space-x-2">
                {items.slice(0, 3).map((item, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg overflow-hidden ring-2"
                    style={{ ringColor: "#0c0c18", background: `${brand}20`, zIndex: 3 - i }}>
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-[8px]" style={{ color: brand }}>📦</div>}
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[var(--text-secondary)] text-xs truncate">
                  {items[0].name}{items.length > 1 ? ` +${items.length - 1} more` : ""}
                </p>
              </div>
              <span className="text-xs font-black flex-shrink-0" style={{ color: brand }}>
                {currency}{cartTotal.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
