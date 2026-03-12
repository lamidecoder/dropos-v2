"use client";

// src/components/store/CurrencyPicker.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Search, Check } from "lucide-react";
import { useCurrencyStore } from "@/store/currency.store";

interface CurrencyPickerProps {
  /** Currencies the store owner has enabled (empty = show all) */
  supportedCurrencies?: string[];
  /** Primary brand colour for active state */
  brand?: string;
  /** Dark or light style */
  variant?: "light" | "dark";
}

export function CurrencyPicker({
  supportedCurrencies = [],
  brand = "#7c3aed",
  variant = "light",
}: CurrencyPickerProps) {
  const { displayCurrency, setDisplayCurrency, available } = useCurrencyStore();
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currencies = supportedCurrencies.length > 0
    ? available.filter(c => supportedCurrencies.includes(c.code))
    : available;

  const filtered = currencies.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const current = available.find(c => c.code === displayCurrency);

  const isDark  = variant === "dark";
  const btnBg   = "var(--bg-secondary)";
  const btnBdr  = "var(--border)";
  const btnTxt  = "var(--text-primary)";
  const dropBg  = isDark ? "#0f0f1a"                : "#ffffff";
  const dropBdr = "var(--border)";
  const itemHov = "var(--bg-secondary)";
  const inputBg = "var(--bg-secondary)";
  const inputTxt= "var(--text-primary)";

  if (!available.length) return null;

  return (
    <div ref={ref} className="relative" style={{ zIndex: 50 }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
        style={{
          background: btnBg,
          border:     `1px solid ${btnBdr}`,
          color:      btnTxt,
        }}
      >
        <Globe size={12} style={{ color: btnTxt }} />
        <span>{current?.flag ?? "🌐"}</span>
        <span>{displayCurrency}</span>
        <ChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background:  dropBg,
            border:      `1px solid ${dropBdr}`,
            boxShadow:   "0 20px 60px rgba(0,0,0,0.2)",
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b" style={{ borderColor: dropBdr }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: btnTxt }}>
              Select Currency
            </p>
          </div>

          {/* Search */}
          <div className="px-3 py-2 border-b" style={{ borderColor: dropBdr }}>
            <div className="flex items-center gap-2 rounded-xl px-3 py-1.5"
              style={{ background: inputBg, border: `1px solid ${dropBdr}` }}>
              <Search size={11} style={{ color: btnTxt, opacity: 0.4 }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search currency…"
                className="flex-1 bg-transparent outline-none text-xs"
                style={{ color: inputTxt }}
                autoFocus
              />
            </div>
          </div>

          {/* Currency list */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs" style={{ color: btnTxt, opacity: 0.4 }}>
                No currencies found
              </p>
            ) : filtered.map(c => {
              const isActive = c.code === displayCurrency;
              return (
                <button
                  key={c.code}
                  onClick={() => { setDisplayCurrency(c.code); setOpen(false); setSearch(""); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left"
                  style={{ background: isActive ? `${brand}10` : "transparent" }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = itemHov; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isActive ? `${brand}10` : "transparent"; }}
                >
                  <span className="text-base flex-shrink-0">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold" style={{ color: isActive ? brand : inputTxt }}>
                        {c.code}
                      </span>
                      <span className="text-[10px]" style={{ color: btnTxt, opacity: 0.4 }}>
                        {c.symbol}
                      </span>
                    </div>
                    <div className="text-[10px] truncate" style={{ color: btnTxt, opacity: 0.4 }}>
                      {c.name}
                    </div>
                  </div>
                  {isActive && <Check size={12} style={{ color: brand, flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="px-4 py-2.5 border-t" style={{ borderColor: dropBdr }}>
            <p className="text-[10px] text-center" style={{ color: btnTxt, opacity: 0.3 }}>
              Prices shown in {displayCurrency} · Checkout in store currency
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
