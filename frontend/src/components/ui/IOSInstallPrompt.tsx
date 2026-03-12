"use client";

// Shows an iOS-specific "Add to Home Screen" guide since iOS Safari
// doesn't support the beforeinstallprompt event.

import { useState, useEffect } from "react";
import { X, Share, Plus } from "lucide-react";

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (window.navigator as any).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;
}

export function IOSInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("ios-install-dismissed");
    if (isIOS() && !isInStandaloneMode() && !dismissed) {
      // Show after 30 seconds on page
      const t = setTimeout(() => setShow(true), 30_000);
      return () => clearTimeout(t);
    }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("ios-install-dismissed", "1");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4"
      style={{ background: "linear-gradient(to top, var(--bg-base) 90%, transparent)" }}>
      <div className="relative rounded-2xl p-5"
        style={{
          background: "var(--bg-card)",
          border:     "1px solid var(--border)",
          boxShadow:  "var(--shadow-xl)",
        }}>
        <button onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 rounded-lg"
          style={{ color: "var(--text-tertiary)" }}>
          <X size={14} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#7C3AED,#8B5CF6)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <div className="font-black text-sm" style={{ color: "var(--text-primary)" }}>
              Install DropOS
            </div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Add to your Home Screen for the best experience
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              step: 1,
              icon: Share,
              text: <>Tap the <strong>Share</strong> button in Safari's toolbar</>,
            },
            {
              step: 2,
              icon: Plus,
              text: <>Scroll down and tap <strong>Add to Home Screen</strong></>,
            },
          ].map(({ step, icon: Icon, text }) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ background: "var(--accent)", color: "#fff" }}>
                {step}
              </div>
              <div className="flex items-center gap-2">
                <Icon size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{text}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 text-center border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={dismiss}
            className="text-xs font-semibold"
            style={{ color: "var(--text-tertiary)" }}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
