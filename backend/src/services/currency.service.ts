// src/services/currency.service.ts
/**
 * CurrencyService
 * ───────────────
 * Fetches live exchange rates from the free open.er-api.com endpoint.
 * Rates are cached in-memory for 1 hour to avoid hammering the API.
 *
 * Fallback table is used when the network is unavailable (dev / offline).
 */

import axios from "axios";
import { logger } from "../utils/logger";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface RatesMap { [currency: string]: number }

// ── Fallback rates (relative to USD) — updated periodically ──────────────────
const FALLBACK: RatesMap = {
  USD: 1,    EUR: 0.92,  GBP: 0.79,  NGN: 1550, KES: 130,
  GHS: 15.2, ZAR: 18.7,  CAD: 1.36,  AUD: 1.53, JPY: 149,
  CNY: 7.24, INR: 83.1,  BRL: 4.97,  MXN: 17.2, AED: 3.67,
  SGD: 1.34, CHF: 0.89,  SEK: 10.4,  NOK: 10.6, DKK: 6.88,
  PLN: 3.96, CZK: 23.2,  HUF: 356,   RON: 4.57, BGN: 1.80,
  TRY: 32.1, RUB: 89.5,  UAH: 38.2,  ILS: 3.69, SAR: 3.75,
  QAR: 3.64, KWD: 0.308, EGP: 30.9,  MAD: 10.1, TZS: 2530,
  UGX: 3790, RWF: 1280,  XOF: 603,   XAF: 603,  COP: 3930,
  PEN: 3.73, CLP: 920,   ARS: 860,   VND: 24600,THB: 35.7,
  MYR: 4.72, IDR: 15600, PHP: 56.4,  PKR: 278,  BDT: 110,
};

// ── Currency metadata ─────────────────────────────────────────────────────────
export const CURRENCY_META: Record<string, { symbol: string; name: string; flag: string; locale: string }> = {
  USD: { symbol: "$",    name: "US Dollar",       flag: "🇺🇸", locale: "en-US" },
  EUR: { symbol: "€",    name: "Euro",             flag: "🇪🇺", locale: "de-DE" },
  GBP: { symbol: "£",    name: "British Pound",    flag: "🇬🇧", locale: "en-GB" },
  NGN: { symbol: "₦",    name: "Nigerian Naira",   flag: "🇳🇬", locale: "en-NG" },
  KES: { symbol: "KSh",  name: "Kenyan Shilling",  flag: "🇰🇪", locale: "sw-KE" },
  GHS: { symbol: "GH₵",  name: "Ghanaian Cedi",   flag: "🇬🇭", locale: "en-GH" },
  ZAR: { symbol: "R",    name: "South African Rand",flag: "🇿🇦",locale: "en-ZA" },
  CAD: { symbol: "CA$",  name: "Canadian Dollar",  flag: "🇨🇦", locale: "en-CA" },
  AUD: { symbol: "A$",   name: "Australian Dollar",flag: "🇦🇺", locale: "en-AU" },
  JPY: { symbol: "¥",    name: "Japanese Yen",     flag: "🇯🇵", locale: "ja-JP" },
  CNY: { symbol: "¥",    name: "Chinese Yuan",     flag: "🇨🇳", locale: "zh-CN" },
  INR: { symbol: "₹",    name: "Indian Rupee",     flag: "🇮🇳", locale: "en-IN" },
  BRL: { symbol: "R$",   name: "Brazilian Real",   flag: "🇧🇷", locale: "pt-BR" },
  MXN: { symbol: "MX$",  name: "Mexican Peso",     flag: "🇲🇽", locale: "es-MX" },
  AED: { symbol: "د.إ",  name: "UAE Dirham",       flag: "🇦🇪", locale: "ar-AE" },
  SGD: { symbol: "S$",   name: "Singapore Dollar", flag: "🇸🇬", locale: "en-SG" },
  CHF: { symbol: "Fr",   name: "Swiss Franc",      flag: "🇨🇭", locale: "de-CH" },
  SAR: { symbol: "﷼",    name: "Saudi Riyal",      flag: "🇸🇦", locale: "ar-SA" },
  EGP: { symbol: "£",    name: "Egyptian Pound",   flag: "🇪🇬", locale: "ar-EG" },
  MAD: { symbol: "MAD",  name: "Moroccan Dirham",  flag: "🇲🇦", locale: "fr-MA" },
  TZS: { symbol: "TSh",  name: "Tanzanian Shilling",flag:"🇹🇿", locale: "sw-TZ" },
  UGX: { symbol: "USh",  name: "Ugandan Shilling", flag: "🇺🇬", locale: "en-UG" },
  XOF: { symbol: "CFA",  name: "West African CFA", flag: "🌍",  locale: "fr-SN" },
  SEK: { symbol: "kr",   name: "Swedish Krona",    flag: "🇸🇪", locale: "sv-SE" },
  NOK: { symbol: "kr",   name: "Norwegian Krone",  flag: "🇳🇴", locale: "nb-NO" },
  PLN: { symbol: "zł",   name: "Polish Zloty",     flag: "🇵🇱", locale: "pl-PL" },
  TRY: { symbol: "₺",    name: "Turkish Lira",     flag: "🇹🇷", locale: "tr-TR" },
  VND: { symbol: "₫",    name: "Vietnamese Dong",  flag: "🇻🇳", locale: "vi-VN" },
  THB: { symbol: "฿",    name: "Thai Baht",        flag: "🇹🇭", locale: "th-TH" },
  MYR: { symbol: "RM",   name: "Malaysian Ringgit",flag: "🇲🇾", locale: "ms-MY" },
  PHP: { symbol: "₱",    name: "Philippine Peso",  flag: "🇵🇭", locale: "en-PH" },
  IDR: { symbol: "Rp",   name: "Indonesian Rupiah",flag: "🇮🇩", locale: "id-ID" },
};

// ── Country → currency mapping (ISO 3166-1 alpha-2) ──────────────────────────
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: "USD", GB: "GBP", DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR",
  NL: "EUR", BE: "EUR", AT: "EUR", PT: "EUR", FI: "EUR", IE: "EUR",
  GR: "EUR", NG: "NGN", KE: "KES", GH: "GHS", ZA: "ZAR", CA: "CAD",
  AU: "AUD", JP: "JPY", CN: "CNY", IN: "INR", BR: "BRL", MX: "MXN",
  AE: "AED", SG: "SGD", CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK",
  PL: "PLN", TR: "TRY", SA: "SAR", EG: "EGP", MA: "MAD", TZ: "TZS",
  UG: "UGX", SN: "XOF", CI: "XOF", CM: "XAF", PH: "PHP", MY: "MYR",
  TH: "THB", VN: "VND", ID: "IDR", NZ: "NZD", HK: "HKD", TW: "TWD",
  KR: "KRW", RW: "RWF", ET: "ETB", TN: "TND", DZ: "DZD", ZM: "ZMW",
  MW: "MWK", MZ: "MZN", ZW: "ZWL", BW: "BWP", NA: "NAD", SZ: "SZL",
  AR: "ARS", CL: "CLP", CO: "COP", PE: "PEN", PK: "PKR", BD: "BDT",
};

// ── Cache ─────────────────────────────────────────────────────────────────────
let cachedRates: RatesMap | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export class CurrencyService {

  async getRates(): Promise<RatesMap> {
    if (cachedRates && Date.now() < cacheExpiry) {
      return cachedRates;
    }

    try {
      // Free tier — no API key required, 1500 requests/month
      const { data } = await axios.get(
        "https://open.er-api.com/v6/latest/USD",
        { timeout: 5000 }
      );
      if (data?.rates) {
        cachedRates = data.rates as RatesMap;
        cacheExpiry = Date.now() + CACHE_TTL;
        logger.info("[Currency] Rates refreshed from open.er-api.com");
        return cachedRates;
      }
    } catch (err: any) {
      logger.warn(`[Currency] Could not fetch live rates: ${err.message} — using fallback`);
    }

    // Fallback
    cachedRates = FALLBACK;
    cacheExpiry = Date.now() + CACHE_TTL;
    return FALLBACK;
  }

  /** Convert amount from baseCurrency to targetCurrency */
  async convert(amount: number, from: string, to: string): Promise<number> {
    if (from === to) return amount;
    const rates = await this.getRates();
    const fromRate = rates[from] ?? 1;
    const toRate   = rates[to]   ?? 1;
    // All rates are relative to USD
    const usd = amount / fromRate;
    return usd * toRate;
  }

  /** Detect suggested currency from country code */
  suggestFromCountry(countryCode: string): string {
    return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] ?? "USD";
  }

  getCurrencyMeta(code: string) {
    return CURRENCY_META[code] ?? { symbol: code, name: code, flag: "🌐", locale: "en-US" };
  }

  getAvailableCurrencies() {
    return Object.entries(CURRENCY_META).map(([code, meta]) => ({ code, ...meta }));
  }
}

export const currencyService = new CurrencyService();
