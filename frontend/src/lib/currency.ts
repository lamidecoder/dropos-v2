// ── Currency & Locale Detection ───────────────────────────────────────────────
// Detects user's location and returns appropriate currency, symbol, and formatter

export interface CurrencyConfig {
  code:     string;   // ISO 4217: NGN, USD, GBP, GHS, KES, ZAR ...
  symbol:   string;   // ₦ $ £ ₵ KSh R
  name:     string;   // Nigerian Naira, US Dollar ...
  locale:   string;   // en-NG, en-US, en-GB ...
  flag:     string;   // 🇳🇬
  timezone: string;   // Africa/Lagos
}

// Country → currency mapping (prioritising African markets)
const COUNTRY_CURRENCY: Record<string, CurrencyConfig> = {
  NG: { code:"NGN", symbol:"₦",   name:"Nigerian Naira",    locale:"en-NG", flag:"🇳🇬", timezone:"Africa/Lagos"      },
  GH: { code:"GHS", symbol:"₵",   name:"Ghanaian Cedi",     locale:"en-GH", flag:"🇬🇭", timezone:"Africa/Accra"      },
  KE: { code:"KES", symbol:"KSh", name:"Kenyan Shilling",   locale:"en-KE", flag:"🇰🇪", timezone:"Africa/Nairobi"    },
  ZA: { code:"ZAR", symbol:"R",   name:"South African Rand",locale:"en-ZA", flag:"🇿🇦", timezone:"Africa/Johannesburg"},
  EG: { code:"EGP", symbol:"£",   name:"Egyptian Pound",    locale:"ar-EG", flag:"🇪🇬", timezone:"Africa/Cairo"      },
  ET: { code:"ETB", symbol:"Br",  name:"Ethiopian Birr",    locale:"am-ET", flag:"🇪🇹", timezone:"Africa/Addis_Ababa" },
  TZ: { code:"TZS", symbol:"TSh", name:"Tanzanian Shilling",locale:"sw-TZ", flag:"🇹🇿", timezone:"Africa/Dar_es_Salaam"},
  UG: { code:"UGX", symbol:"USh", name:"Ugandan Shilling",  locale:"en-UG", flag:"🇺🇬", timezone:"Africa/Kampala"    },
  SN: { code:"XOF", symbol:"CFA", name:"West African CFA",  locale:"fr-SN", flag:"🇸🇳", timezone:"Africa/Dakar"      },
  CI: { code:"XOF", symbol:"CFA", name:"West African CFA",  locale:"fr-CI", flag:"🇨🇮", timezone:"Africa/Abidjan"    },
  CM: { code:"XAF", symbol:"CFA", name:"Central African CFA",locale:"fr-CM",flag:"🇨🇲", timezone:"Africa/Douala"     },
  GB: { code:"GBP", symbol:"£",   name:"British Pound",     locale:"en-GB", flag:"🇬🇧", timezone:"Europe/London"     },
  US: { code:"USD", symbol:"$",   name:"US Dollar",         locale:"en-US", flag:"🇺🇸", timezone:"America/New_York"  },
  CA: { code:"CAD", symbol:"$",   name:"Canadian Dollar",   locale:"en-CA", flag:"🇨🇦", timezone:"America/Toronto"   },
  EU: { code:"EUR", symbol:"€",   name:"Euro",              locale:"de-DE", flag:"🇪🇺", timezone:"Europe/Berlin"     },
  DE: { code:"EUR", symbol:"€",   name:"Euro",              locale:"de-DE", flag:"🇩🇪", timezone:"Europe/Berlin"     },
  FR: { code:"EUR", symbol:"€",   name:"Euro",              locale:"fr-FR", flag:"🇫🇷", timezone:"Europe/Paris"      },
  AE: { code:"AED", symbol:"د.إ", name:"UAE Dirham",        locale:"ar-AE", flag:"🇦🇪", timezone:"Asia/Dubai"        },
  SA: { code:"SAR", symbol:"﷼",   name:"Saudi Riyal",       locale:"ar-SA", flag:"🇸🇦", timezone:"Asia/Riyadh"       },
  IN: { code:"INR", symbol:"₹",   name:"Indian Rupee",      locale:"en-IN", flag:"🇮🇳", timezone:"Asia/Kolkata"      },
  BR: { code:"BRL", symbol:"R$",  name:"Brazilian Real",    locale:"pt-BR", flag:"🇧🇷", timezone:"America/Sao_Paulo"  },
  AU: { code:"AUD", symbol:"A$",  name:"Australian Dollar", locale:"en-AU", flag:"🇦🇺", timezone:"Australia/Sydney"   },
  PK: { code:"PKR", symbol:"₨",   name:"Pakistani Rupee",   locale:"ur-PK", flag:"🇵🇰", timezone:"Asia/Karachi"       },
  ID: { code:"IDR", symbol:"Rp",  name:"Indonesian Rupiah", locale:"id-ID", flag:"🇮🇩", timezone:"Asia/Jakarta"       },
  PH: { code:"PHP", symbol:"₱",   name:"Philippine Peso",   locale:"en-PH", flag:"🇵🇭", timezone:"Asia/Manila"        },
  MY: { code:"MYR", symbol:"RM",  name:"Malaysian Ringgit", locale:"ms-MY", flag:"🇲🇾", timezone:"Asia/Kuala_Lumpur"  },
};

const DEFAULT: CurrencyConfig = COUNTRY_CURRENCY.NG;

// ── Detect country from timezone (works offline, no API needed) ───────────────
function detectFromTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    for (const [country, cfg] of Object.entries(COUNTRY_CURRENCY)) {
      if (cfg.timezone === tz) return country;
    }
    // Partial match on region
    if (tz.startsWith("Africa/Lagos"))       return "NG";
    if (tz.startsWith("Africa/"))            return "GH"; // fallback for unknown African zones
    if (tz.startsWith("America/"))           return "US";
    if (tz.startsWith("Europe/"))            return "GB";
  } catch { /* ignore */ }
  return null;
}

// ── Detect country from browser language ─────────────────────────────────────
function detectFromLanguage(): string | null {
  try {
    const lang = navigator.language || "en";
    const region = lang.split("-")[1]?.toUpperCase();
    if (region && COUNTRY_CURRENCY[region]) return region;
  } catch { /* ignore */ }
  return null;
}

// ── Main detection (cached in sessionStorage) ─────────────────────────────────
export function detectCurrency(): CurrencyConfig {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const cached = sessionStorage.getItem("dropos_currency");
    if (cached) return JSON.parse(cached);
  } catch { /* ignore */ }

  const country =
    detectFromTimezone() ||
    detectFromLanguage()  ||
    "NG"; // default to Nigeria

  const config = COUNTRY_CURRENCY[country] || DEFAULT;
  try { sessionStorage.setItem("dropos_currency", JSON.stringify(config)); } catch { /* ignore */ }
  return config;
}

// ── Format a number as currency ───────────────────────────────────────────────
export function formatCurrency(amount: number, config?: CurrencyConfig): string {
  const cfg = config || detectCurrency();
  try {
    return new Intl.NumberFormat(cfg.locale, {
      style:                 "currency",
      currency:              cfg.code,
      minimumFractionDigits: cfg.code === "JPY" ? 0 : 0,
      maximumFractionDigits: cfg.code === "JPY" ? 0 : 0,
    }).format(amount || 0);
  } catch {
    return `${cfg.symbol}${(amount || 0).toLocaleString()}`;
  }
}

// ── Convert from NGN to detected currency (approximate) ──────────────────────
// Exchange rates against NGN (approximate, refresh monthly)
const NGN_RATES: Record<string, number> = {
  NGN: 1,       GHS: 0.006,  KES: 0.095,  ZAR: 0.013,
  USD: 0.00065, GBP: 0.00052,EUR: 0.00060, CAD: 0.00089,
  AED: 0.0024,  SAR: 0.0024, INR: 0.054,  EGP: 0.032,
  XOF: 0.39,    XAF: 0.39,   ETB: 0.036,  TZS: 1.67,
  UGX: 2.37,   BRL: 0.0032,  AUD: 0.00097,
  PKR: 0.18,   IDR: 2550,    PHP: 0.092,
};

export function convertFromNGN(ngnAmount: number, targetCurrency: string): number {
  const rate = NGN_RATES[targetCurrency] || 1;
  return Math.round(ngnAmount * rate);
}

// ── Hook for use in React components ─────────────────────────────────────────
import { useMemo } from "react";

export function useCurrency(storeCurrency?: string) {
  const detected = useMemo(() => detectCurrency(), []);

  // Use store's configured currency if available, else detected
  const config = useMemo(() => {
    if (storeCurrency && storeCurrency !== "NGN" && COUNTRY_CURRENCY[storeCurrency.slice(0,2)]) {
      return COUNTRY_CURRENCY[storeCurrency.slice(0,2)];
    }
    return detected;
  }, [storeCurrency, detected]);

  const fmt = useMemo(() => (amount: number, fromNGN = false) => {
    const val = fromNGN ? convertFromNGN(amount, config.code) : amount;
    return formatCurrency(val, config);
  }, [config]);

  return { config, fmt, symbol: config.symbol, code: config.code, locale: config.locale };
}
