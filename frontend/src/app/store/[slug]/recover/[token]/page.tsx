"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../../lib/api";
import { useCartStore } from "../../../../../store/cart.store";
import { ShoppingBag, CheckCircle, Loader2, ArrowRight, Package } from "lucide-react";

export default function CartRecoveryPage() {
  const { slug, token } = useParams<{ slug: string; token: string }>();
  const router = useRouter();
  const { addItem, clearCart } = useCartStore();
  const [state, setState] = useState<"loading" | "success" | "already" | "error">("loading");
  const [storeName, setStoreName] = useState("the store");

  useEffect(() => {
    const recover = async () => {
      try {
        const res = await api.get(`/abandoned-carts/recover/${token}`);
        const { items, storeSlug, storeName: sName, recovered } = res.data;

        setStoreName(sName || storeName);

        if (recovered) {
          setState("already");
          setTimeout(() => router.push(`/store/${storeSlug}`), 3000);
          return;
        }

        // Restore items to cart store
        clearCart();
        for (const item of items || []) {
          addItem({
            id:           item.productId,
            productId:    item.productId,
            name:         item.name,
            price:        item.price,
            image:        item.image,
            storeId:      item.storeId,
            storeSlug:    storeSlug,
            variantId:    item.variantId,
            variantLabel: item.variantLabel,
            quantity:     item.quantity,
          });
        }

        setState("success");
        // Redirect to store with cart open
        setTimeout(() => router.push(`/store/${storeSlug}`), 2500);

      } catch (err) {
        setState("error");
      }
    };
    recover();
  }, [token]);

  const config = {
    loading: {
      icon: <Loader2 size={32} className="text-amber-400 animate-spin" />,
      bg:   "rgba(201,168,76,0.1)",
      border: "rgba(201,168,76,0.2)",
      title: "Restoring your cart…",
      desc:  "Just a moment while we load your items.",
    },
    success: {
      icon: <CheckCircle size={32} className="text-emerald-400" />,
      bg:   "rgba(16,185,129,0.1)",
      border: "rgba(16,185,129,0.25)",
      title: "Your cart is back! 🎉",
      desc:  `Redirecting you to ${storeName} to complete your order…`,
    },
    already: {
      icon: <ShoppingBag size={32} className="text-amber-400" />,
      bg:   "rgba(201,168,76,0.1)",
      border: "rgba(201,168,76,0.2)",
      title: "Already recovered",
      desc:  "Looks like this cart was already restored. Taking you to the store…",
    },
    error: {
      icon: <Package size={32} className="text-red-400" />,
      bg:   "rgba(239,68,68,0.1)",
      border: "rgba(239,68,68,0.2)",
      title: "Link expired",
      desc:  "This recovery link is no longer valid. Head back to the store to continue shopping.",
    },
  }[state];

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#08080f" }}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.08), transparent 60%)" }} />

      <div className="relative z-10 text-center max-w-sm w-full">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-black text-sm"
            style={{ background: "linear-gradient(135deg,#c9a84c,#f0c040)" }}>
            D
          </div>
          <span className="font-black text-[var(--text-primary)] tracking-tight">DropOS</span>
        </div>

        {/* Status card */}
        <div className="rounded-3xl p-8 mb-6"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: config.bg, border: `1px solid ${config.border}` }}>
            {config.icon}
          </div>
          <h1 className="text-[var(--text-primary)] font-black text-xl mb-3">{config.title}</h1>
          <p className="text-[var(--text-tertiary)] text-sm leading-relaxed">{config.desc}</p>

          {/* Progress bar for loading/success */}
          {(state === "loading" || state === "success") && (
            <div className="mt-5 h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
              <div
                className="h-full rounded-full transition-all duration-2000"
                style={{
                  width: state === "success" ? "100%" : "40%",
                  background: "linear-gradient(90deg,#c9a84c,#f0c040)",
                  transition: "width 2.5s ease",
                }}
              />
            </div>
          )}
        </div>

        {/* Error CTA */}
        {state === "error" && (
          <button
            onClick={() => router.push(`/store/${slug}`)}
            className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl font-bold text-black text-sm"
            style={{ background: "linear-gradient(135deg,#c9a84c,#f0c040)" }}>
            Go to Store <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
