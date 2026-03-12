"use client";

// src/hooks/usePWAInstall.ts
"use client";

import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWAInstall() {
  const [prompt, setPrompt]         = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setInstalled] = useState(false);
  const [isInstalling, setInstalling] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const mq = window.matchMedia("(display-mode: standalone)");
    setInstalled(mq.matches || (window.navigator as any).standalone === true);
    mq.onchange = e => setInstalled(e.matches);

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = useCallback(async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
    if (!prompt) return "unavailable";
    setInstalling(true);
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setPrompt(null);
      return outcome;
    } finally {
      setInstalling(false);
    }
  }, [prompt]);

  return {
    canInstall:  !!prompt && !isInstalled,
    isInstalled,
    isInstalling,
    install,
  };
}
