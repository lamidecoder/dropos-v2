"use client";

// src/components/providers/CurrencyProvider.tsx
import { useEffect, useRef } from "react";
import { api } from "../../lib/api";
import { useCurrencyStore } from "../../store/currency.store";

/**
 * Mount once in the root layout.
 * 1. Fetches available currencies + metadata
 * 2. Fetches live rates (cached 1h on backend)
 * 3. Auto-detects visitor currency from IP (runs once per session)
 */
export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const {
    setAvailable, setRates, setDetected, setDisplayCurrency,
    detected, displayCurrency,
  } = useCurrencyStore();

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      try {
        // Fetch metadata + rates in parallel
        const [metaRes, ratesRes] = await Promise.allSettled([
          api.get("/currency/available"),
          api.get("/currency/rates"),
        ]);

        if (metaRes.status === "fulfilled") {
          setAvailable(metaRes.value.data.data);
        }
        if (ratesRes.status === "fulfilled") {
          setRates(ratesRes.value.data.data.rates);
        }

        // Auto-detect visitor currency (only once per session)
        if (!detected) {
          const geoRes = await api.get("/currency/detect");
          const suggested = geoRes.data.data.currency;
          // Only auto-switch if user hasn't manually chosen
          if (suggested && displayCurrency === "USD") {
            setDisplayCurrency(suggested);
          }
          setDetected(true);
        }
      } catch {
        // Silent fail - storefront still works with store's base currency
      }
    };

    init();
  }, []);

  return <>{children}</>;
}
