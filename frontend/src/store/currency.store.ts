// src/store/currency.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CurrencyMeta {
  code:   string;
  symbol: string;
  name:   string;
  flag:   string;
  locale: string;
}

interface CurrencyState {
  // The currency the visitor has selected / detected
  displayCurrency: string;
  // Rates relative to USD (fetched once per session)
  rates:           Record<string, number>;
  // All supported currencies with metadata
  available:       CurrencyMeta[];
  // Whether auto-detect has run this session
  detected:        boolean;
  // Store base currency (set when entering a storefront)
  baseCurrency:    string;

  setDisplayCurrency: (code: string) => void;
  setRates:           (rates: Record<string, number>) => void;
  setAvailable:       (list: CurrencyMeta[]) => void;
  setDetected:        (v: boolean) => void;
  setBaseCurrency:    (code: string) => void;
  convert:            (amount: number, from?: string) => number;
  format:             (amount: number, from?: string, opts?: { compact?: boolean }) => string;
  reset:              () => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      displayCurrency: "USD",
      rates:           {},
      available:       [],
      detected:        false,
      baseCurrency:    "USD",

      setDisplayCurrency: (code) => set({ displayCurrency: code }),
      setRates:           (rates) => set({ rates }),
      setAvailable:       (list)  => set({ available: list }),
      setDetected:        (v)     => set({ detected: v }),
      setBaseCurrency:    (code)  => set({ baseCurrency: code }),

      convert: (amount, from) => {
        const { rates, displayCurrency, baseCurrency } = get();
        const fromCurrency = from ?? baseCurrency;
        const toCurrency   = displayCurrency;
        if (fromCurrency === toCurrency) return amount;
        if (!rates[fromCurrency] || !rates[toCurrency]) return amount;
        const usd = amount / rates[fromCurrency];
        return usd * rates[toCurrency];
      },

      format: (amount, from, opts) => {
        const { rates, displayCurrency, available, baseCurrency } = get();
        const fromCurrency = from ?? baseCurrency;
        const toCurrency   = displayCurrency;

        let converted = amount;
        if (fromCurrency !== toCurrency && rates[fromCurrency] && rates[toCurrency]) {
          const usd = amount / rates[fromCurrency];
          converted  = usd * rates[toCurrency];
        }

        const meta = available.find(c => c.code === toCurrency);
        const locale = meta?.locale ?? "en-US";

        if (opts?.compact && converted >= 1000) {
          const sym = meta?.symbol ?? toCurrency;
          if (converted >= 1_000_000) return `${sym}${(converted / 1_000_000).toFixed(1)}M`;
          if (converted >= 1_000)     return `${sym}${(converted / 1_000).toFixed(1)}K`;
        }

        try {
          return new Intl.NumberFormat(locale, {
            style:    "currency",
            currency: toCurrency,
            minimumFractionDigits: ["JPY","VND","IDR","UGX","RWF","XOF","XAF"].includes(toCurrency) ? 0 : 2,
            maximumFractionDigits: ["JPY","VND","IDR","UGX","RWF","XOF","XAF"].includes(toCurrency) ? 0 : 2,
          }).format(converted);
        } catch {
          const sym = meta?.symbol ?? toCurrency;
          return `${sym}${converted.toFixed(2)}`;
        }
      },

      reset: () => set({ displayCurrency: "USD", detected: false }),
    }),
    {
      name: "dropos-currency",
      partialize: (state) => ({
        displayCurrency: state.displayCurrency,
        detected:        state.detected,
      }),
    }
  )
);
