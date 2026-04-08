# KAI Locale Engine — Country-Specific Intelligence
Unzip into `dropos-v2/` — files land correctly.

---

## What This Fixes

Before: KAI searched "trending products TikTok" → got UK/US results
After:  KAI searches "trending products Nigeria TikTok 2026" → gets Nigerian results

Before: Ad copy said "Buy now for £29.99"
After:  Ad copy says "Buy now for ₦35,000" with Lagos/Abuja references

Before: "What sells?" → Western product suggestions
After:  "What sells?" → Products trending on TikTok Nigeria, Jumia Nigeria

---

## What's In This ZIP

```
backend/src/
  utils/kai.locale.ts              ← Locale Engine (single source of truth)
  services/kai.service.ts          ← Updated — uses locale for all context
  services/kai.power.service.ts    ← Updated — all searches country-specific
  services/kai.market.service.ts   ← Updated — fetches per-country data daily
```

---

## How It Works

Every country has a complete profile:
- Currency + exchange rate
- TikTok region name (for searches)
- Search suffix (appended to all queries)
- Market context (injected into KAI prompt)
- Payment methods
- Top cities + markets
- Shopping platforms
- Seasonal events calendar
- Payday context
- Trust signals

### Countries Supported:
| Code | Country | Currency | TikTok |
|------|---------|----------|--------|
| NG | Nigeria | ₦ NGN | TikTok Nigeria |
| GH | Ghana | GH₵ GHS | TikTok Ghana |
| KE | Kenya | KSh KES | TikTok Kenya |
| ZA | South Africa | R ZAR | TikTok South Africa |
| GB | United Kingdom | £ GBP | TikTok UK |
| US | United States | $ USD | TikTok Shop |

---

## Integration

### Step 1 — Replace 3 service files
These 3 files REPLACE the versions from kai-complete.zip and kai-power.zip:
```
backend/src/services/kai.service.ts       → replaces kai-complete version
backend/src/services/kai.power.service.ts → replaces kai-power version
backend/src/services/kai.market.service.ts → replaces kai-complete version
```

### Step 2 — Add the locale utility
```
backend/src/utils/kai.locale.ts           → NEW file, add to project
```
No routes needed. No DB changes. No app.ts changes.

---

## The Rule KAI Now Follows

```
Default: ALWAYS ${store.country}
Override: ONLY if owner explicitly says
          "search UK" or "find US products" etc.

Example:
Owner in Nigeria asks: "What's trending on TikTok?"
KAI searches: "trending products Nigeria TikTok 2026"
                                 ↑ automatic

Owner in Nigeria asks: "What's trending on UK TikTok?"
KAI searches: "trending products UK TikTok 2026"
                               ↑ owner requested this
```

---

## Adding New Countries

Open `kai.locale.ts` and add to the LOCALES object:
```typescript
TZ: {
  country: "TZ",
  countryName: "Tanzania",
  currency: "TZS",
  currencySymbol: "TSh",
  exchangeRateToUSD: 2600,
  tiktokRegion: "Tanzania TikTok",
  searchSuffix: "Tanzania 2026",
  // ... rest of fields
}
```
That's it. KAI automatically uses it for stores with country = "TZ".
