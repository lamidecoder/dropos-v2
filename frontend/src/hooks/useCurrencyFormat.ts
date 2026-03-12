"use client";

// src/hooks/useCurrencyFormat.ts
"use client";

import { useCallback } from "react";
import { useCurrencyStore } from "@/store/currency.store";

/**
 * Returns a `fmt(price)` function that converts from the store's base
 * currency into the visitor's display currency and formats it properly.
 *
 * Usage:
 *   const fmt = useCurrencyFormat("NGN");
 *   fmt(1500)  // → "US$0.97" if visitor chose USD
 */
export function useCurrencyFormat(baseCurrency: string = "USD") {
  const { format, setBaseCurrency } = useCurrencyStore();

  // Sync base currency when store changes
  if (useCurrencyStore.getState().baseCurrency !== baseCurrency) {
    setBaseCurrency(baseCurrency);
  }

  const fmt = useCallback(
    (amount: number, opts?: { compact?: boolean }) =>
      format(amount, baseCurrency, opts),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseCurrency, format]
  );

  return fmt;
}
