"use client";

import { useState, useEffect } from "react";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import { Smartphone, X, Download, Zap } from "lucide-react";

export function PWAInstallBanner() {
  const { canInstall, isInstalled, isInstalling, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDismissed(localStorage.getItem("pwa-banner-dismissed") === "1");
  }, []);

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem("pwa-banner-dismissed", "1");
  };

  const handleInstall = async () => {
    const result = await install();
    if (result === "accepted") dismiss();
  };

  if (!mounted || !canInstall || isInstalled || dismissed) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-5 sm:w-80 rounded-2xl p-4 animate-slide"
      style={{
        background:  "var(--bg-card)",
        border:      "1px solid var(--accent-border)",
        boxShadow:   "var(--shadow-xl), 0 0 0 1px var(--accent-dim)",
      }}
    >
      {/* Close */}
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 p-1 rounded-lg transition-colors"
        style={{ color: "var(--text-tertiary)" }}
      >
        <X size={14} />
      </button>

      {/* Content */}
      <div className="flex items-start gap-3 pr-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#7C3AED,#8B5CF6)", boxShadow: "0 4px 12px rgba(124,58,237,0.3)" }}
        >
          <Zap size={18} color="white" fill="white" />
        </div>
        <div>
          <div className="text-sm font-black" style={{ color: "var(--text-primary)" }}>
            Install DropOS App
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Manage your store from your home screen - works offline too.
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-[var(--text-primary)] transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#7C3AED,#8B5CF6)", boxShadow: "0 3px 12px rgba(124,58,237,0.3)" }}
        >
          <Download size={13} />
          {isInstalling ? "Installing…" : "Install Now"}
        </button>
        <button
          onClick={dismiss}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
        >
          Later
        </button>
      </div>
    </div>
  );
}
