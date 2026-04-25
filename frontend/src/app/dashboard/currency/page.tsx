"use client";
﻿"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import { Globe, CheckCircle, TrendingUp, RefreshCw, ToggleLeft, ToggleRight, Info } from "lucide-react";
import toast from "react-hot-toast";

const ALL_CURRENCIES = [
  { code: "USD", symbol: "$",    name: "US Dollar",           flag: "🇺🇸" },
  { code: "EUR", symbol: "€",    name: "Euro",                flag: "🇪🇺" },
  { code: "GBP", symbol: "£",    name: "British Pound",       flag: "🇬🇧" },
  { code: "NGN", symbol: "₦",    name: "Nigerian Naira",      flag: "🇳🇬" },
  { code: "KES", symbol: "KSh",  name: "Kenyan Shilling",     flag: "🇰🇪" },
  { code: "GHS", symbol: "GH₵",  name: "Ghanaian Cedi",       flag: "🇬🇭" },
  { code: "ZAR", symbol: "R",    name: "South African Rand",  flag: "🇿🇦" },
  { code: "CAD", symbol: "CA$",  name: "Canadian Dollar",     flag: "🇨🇦" },
  { code: "AUD", symbol: "A$",   name: "Australian Dollar",   flag: "🇦🇺" },
  { code: "JPY", symbol: "¥",    name: "Japanese Yen",        flag: "🇯🇵" },
  { code: "INR", symbol: "₹",    name: "Indian Rupee",        flag: "🇮🇳" },
  { code: "BRL", symbol: "R$",   name: "Brazilian Real",      flag: "🇧🇷" },
  { code: "MXN", symbol: "MX$",  name: "Mexican Peso",        flag: "🇲🇽" },
  { code: "AED", symbol: "د.إ",  name: "UAE Dirham",          flag: "🇦🇪" },
  { code: "SGD", symbol: "S$",   name: "Singapore Dollar",    flag: "🇸🇬" },
  { code: "CHF", symbol: "Fr",   name: "Swiss Franc",         flag: "🇨🇭" },
  { code: "SAR", symbol: "﷼",    name: "Saudi Riyal",         flag: "🇸🇦" },
  { code: "EGP", symbol: "£",    name: "Egyptian Pound",      flag: "🇪🇬" },
  { code: "MAD", symbol: "MAD",  name: "Moroccan Dirham",     flag: "🇲🇦" },
  { code: "TZS", symbol: "TSh",  name: "Tanzanian Shilling",  flag: "🇹🇿" },
  { code: "UGX", symbol: "USh",  name: "Ugandan Shilling",    flag: "🇺🇬" },
  { code: "XOF", symbol: "CFA",  name: "West African CFA",    flag: "🌍" },
  { code: "SEK", symbol: "kr",   name: "Swedish Krona",       flag: "🇸🇪" },
  { code: "PLN", symbol: "zł",   name: "Polish Zloty",        flag: "🇵🇱" },
  { code: "TRY", symbol: "₺",    name: "Turkish Lira",        flag: "🇹🇷" },
  { code: "PHP", symbol: "₱",    name: "Philippine Peso",     flag: "🇵🇭" },
  { code: "MYR", symbol: "RM",   name: "Malaysian Ringgit",   flag: "🇲🇾" },
  { code: "THB", symbol: "฿",    name: "Thai Baht",           flag: "🇹🇭" },
  { code: "IDR", symbol: "Rp",   name: "Indonesian Rupiah",   flag: "🇮🇩" },
  { code: "CNY", symbol: "¥",    name: "Chinese Yuan",        flag: "🇨🇳" },
];

export default function CurrencyPage() {
  const qc      = useQueryClient();
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;

  const tx   = "[color:var(--text-primary)]";
  const sub  = "text-secondary";
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";
  const inp  = "[background:var(--bg-secondary)] [border-color:var(--border)] [color:var(--text-primary)]";

  // Fetch store data
  const { data: store } = useQuery({
    queryKey: ["store", storeId],
    queryFn:  () => api.get(`/stores/${storeId}`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  // Fetch live exchange rates
  const { data: ratesData, isLoading: ratesLoading, refetch: refetchRates } = useQuery({
    queryKey: ["currency-rates"],
    queryFn:  () => api.get("/currency/rates").then(r => r.data.data),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const [baseCurrency,      setBaseCurrency]      = useState("USD");
  const [autoDetect,        setAutoDetect]         = useState(true);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(["USD", "EUR", "GBP", "NGN"]);

  // Sync from store on load
  useEffect(() => {
    if (store) {
      setBaseCurrency(store.currency || "USD");
      setAutoDetect(store.autoDetectCurrency ?? true);
      setSelectedCurrencies(
        Array.isArray(store.supportedCurrencies) && store.supportedCurrencies.length > 0
          ? store.supportedCurrencies
          : [store.currency || "USD"]
      );
    }
  }, [store]);

  const saveMut = useMutation({
    mutationFn: () => api.put(`/stores/${storeId}`, {
      currency:            baseCurrency,
      autoDetectCurrency:  autoDetect,
      supportedCurrencies: selectedCurrencies,
    }),
    onSuccess: () => {
      toast.success("Currency settings saved");
      qc.invalidateQueries({ queryKey: ["store"] });
    },
    onError: () => toast.error("Save failed"),
  });

  const toggleCurrency = (code: string) => {
    if (code === baseCurrency) return; // can't remove base
    setSelectedCurrencies(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const rates = ratesData?.rates ?? {};
  const baseRate = rates[baseCurrency] ?? 1;

  // How much 1 unit of base currency is worth in USD
  const toUSD = (amount: number) => amount / baseRate;

  return (
    
      <div className="space-y-6 max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Multi-Currency</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>Let customers browse prices in their local currency</p>
          </div>
          <button
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending}
            className="px-6 py-2.5 rounded-xl text-sm font-bold [color:var(--text-primary)] disabled:opacity-60 transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}
          >
            {saveMut.isPending ? "Saving…" : "Save Settings"}
          </button>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-2xl border [background:var(--accent-dim)] border-violet-500/20">
          <Info size={15} className="text-violet-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-violet-300">
            Prices are automatically converted using live exchange rates (updated hourly).
            Your store still charges customers in the <strong>base currency</strong> at checkout.
            The currency picker on your storefront lets visitors see indicative prices in their currency.
          </p>
        </div>

        {/* Base currency */}
        <div className={`rounded-2xl border p-6 ${card}`}>
          <h2 className={`font-black mb-1 ${tx}`}>Store Base Currency</h2>
          <p className={`text-sm mb-5 ${sub}`}>This is the currency your products are priced in and what customers pay at checkout.</p>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {["USD","EUR","GBP","NGN","KES","GHS","ZAR","CAD","AUD","JPY"].map(code => {
              const meta = ALL_CURRENCIES.find(c => c.code === code);
              const active = baseCurrency === code;
              return (
                <button
                  key={code}
                  onClick={() => {
                    setBaseCurrency(code);
                    if (!selectedCurrencies.includes(code)) {
                      setSelectedCurrencies(prev => [code, ...prev]);
                    }
                  }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: active ? "#f59e0b" : "var(--border)",
                    background:  active ? "rgba(245,158,11,0.08)" : "transparent",
                  }}
                >
                  <span className="text-xl">{meta?.flag ?? "🌐"}</span>
                  <span className={`text-xs font-black ${active ? "[color:var(--accent)]" : sub}`}>{code}</span>
                  <span className={`text-[10px] ${sub}`}>{meta?.symbol}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Auto-detect toggle */}
        <div className={`rounded-2xl border p-5 ${card}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`font-black ${tx}`}>Auto-Detect Visitor Currency</h2>
              <p className={`text-sm mt-0.5 ${sub}`}>
                Automatically show prices in the visitor's local currency based on their IP location.
              </p>
            </div>
            <button
              onClick={() => setAutoDetect(v => !v)}
              className="flex-shrink-0 transition-all"
              style={{ color: autoDetect ? "#f59e0b" : "var(--text-disabled)" }}
            >
              {autoDetect
                ? <ToggleRight size={40} />
                : <ToggleLeft  size={40} />}
            </button>
          </div>
        </div>

        {/* Supported currencies grid */}
        <div className={`rounded-2xl border p-6 ${card}`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className={`font-black ${tx}`}>Supported Display Currencies</h2>
              <p className={`text-sm mt-0.5 ${sub}`}>
                {selectedCurrencies.length} selected · These appear in the currency picker on your storefront.
              </p>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full [background:var(--accent-dim)] [color:var(--accent)]`}>
              {selectedCurrencies.length} active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_CURRENCIES.map(({ code, symbol, name, flag }) => {
              const isBase   = code === baseCurrency;
              const isActive = selectedCurrencies.includes(code);

              // Convert 1 unit of base to this currency
              const rate = baseRate > 0 && rates[code]
                ? (rates[code] / baseRate)
                : null;

              return (
                <button
                  key={code}
                  onClick={() => toggleCurrency(code)}
                  disabled={isBase}
                  className="flex items-center gap-3 p-3 rounded-xl border transition-all text-left disabled:cursor-default"
                  style={{
                    borderColor: isActive ? (isBase ? "#f59e0b" : "rgba(124,58,237,0.4)") : "var(--bg-card)",
                    background:  isActive ? (isBase ? "rgba(245,158,11,0.06)" : "rgba(124,58,237,0.06)") : "transparent",
                  }}
                >
                  <span className="text-xl flex-shrink-0">{flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-black ${isActive ? (isBase ? "[color:var(--accent)]" : "text-violet-400") : sub}`}>
                        {code}
                      </span>
                      {isBase && (
                        <span className="text-[9px] font-black [color:var(--accent)] [background:var(--accent-dim)] px-1.5 py-0.5 rounded-full">BASE</span>
                      )}
                    </div>
                    <div className={`text-[10px] truncate ${sub}`}>{name}</div>
                  </div>
                  {rate !== null && (
                    <div className={`text-[10px] text-right flex-shrink-0 ${sub}`}>
                      <div className="font-bold">{symbol}</div>
                      <div>{rate >= 1 ? rate.toFixed(1) : rate.toFixed(3)}</div>
                    </div>
                  )}
                  {!isBase && isActive && (
                    <CheckCircle size={12} className="text-violet-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live rates preview */}
        <div className={`rounded-2xl border p-6 ${card}`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className={`font-black ${tx}`}>Live Exchange Rates</h2>
              <p className={`text-sm mt-0.5 ${sub}`}>
                Rates relative to {baseCurrency} · Updated hourly via open.er-api.com
              </p>
            </div>
            <button
              onClick={() => refetchRates()}
              disabled={ratesLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${sub} [border-color:var(--border)] hover:[background:var(--bg-secondary)]`}
            >
              <RefreshCw size={11} className={ratesLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {ratesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl animate-pulse [background:var(--bg-secondary)]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {selectedCurrencies
                .filter(c => c !== baseCurrency)
                .map(code => {
                  const meta = ALL_CURRENCIES.find(c => c.code === code);
                  const rate = baseRate > 0 && rates[code]
                    ? (rates[code] / baseRate)
                    : null;
                  return (
                    <div key={code} className="rounded-xl border [border-color:var(--border)] p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base">{meta?.flag ?? "🌐"}</span>
                        <span className={`text-xs font-black ${tx}`}>{code}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-lg font-black ${tx}`}>
                          {rate !== null
                            ? rate >= 100
                              ? rate.toFixed(0)
                              : rate >= 1
                              ? rate.toFixed(2)
                              : rate.toFixed(4)
                            : "-"
                          }
                        </span>
                        <span className={`text-[10px] ${sub}`}>{meta?.symbol}</span>
                      </div>
                      <div className={`text-[10px] ${sub}`}>per 1 {baseCurrency}</div>
                    </div>
                  );
                })}
              {selectedCurrencies.filter(c => c !== baseCurrency).length === 0 && (
                <div className={`col-span-4 text-center py-8 ${sub} text-sm`}>
                  <Globe size={28} className="mx-auto mb-2 opacity-20" />
                  Select currencies above to see exchange rates
                </div>
              )}
            </div>
          )}

          {ratesData?.updatedAt && (
            <p className={`text-[10px] mt-4 text-right ${sub}`}>
              Last updated: {new Date(ratesData.updatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* How it works */}
        <div className={`rounded-2xl border p-6 ${card}`}>
          <h2 className={`font-black mb-4 ${tx}`}>How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                title: "Set base currency",
                desc: "Your product prices are in your base currency. This is what customers pay at checkout.",
                icon: "💰",
              },
              {
                step: "2",
                title: "Visitor detects location",
                desc: "When a customer visits your store, their currency is detected from their IP automatically.",
                icon: "📍",
              },
              {
                step: "3",
                title: "Prices convert in real-time",
                desc: "Product prices are shown in their local currency. They can change it via the globe icon in the nav.",
                icon: "🔄",
              },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 [background:var(--accent-dim)]">
                  {icon}
                </div>
                <div>
                  <p className={`text-xs font-black ${tx} mb-0.5`}>{title}</p>
                  <p className={`text-xs leading-relaxed ${sub}`}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    
  );
}
