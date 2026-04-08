// ============================================================
// KAI — Locale Engine
// Path: backend/src/utils/kai.locale.ts
//
// SINGLE SOURCE OF TRUTH for all country-specific context.
// Every KAI service imports from here.
// Never hardcode "Nigeria" or "UK" anywhere else.
// ============================================================

export interface KaiLocale {
  country: string;           // "NG" | "GH" | "KE" | "ZA" | "GB" | "US"
  countryName: string;       // "Nigeria"
  currency: string;          // "NGN"
  currencySymbol: string;    // "₦"
  exchangeRateToUSD: number; // 1580 (1 USD = 1580 NGN)
  language: string;          // "English (Nigerian)"
  tiktokRegion: string;      // "Nigeria TikTok" — used in search queries
  searchSuffix: string;      // appended to ALL web searches
  marketContext: string;     // injected into KAI system prompt
  paymentMethods: string[];  // ["Paystack", "Bank Transfer", "USSD", "OPay", "Kuda"]
  topCities: string[];       // ["Lagos", "Abuja", "Port Harcourt", "Kano"]
  majorMarkets: string[];    // ["Alaba Market", "Balogun", "Computer Village"]
  shoppingPlatforms: string[];// ["Jumia", "Konga", "Jiji"]
  socialPlatforms: string[]; // ["TikTok Nigeria", "Instagram Nigeria", "Twitter Nigeria"]
  seasonalEvents: Record<string, string>; // month → shopping event
  paydayContext: string;     // when customers have money
  trustSignals: string;      // what builds trust in this market
  typicalMargin: string;     // "50-70%"
  adPlatforms: string[];     // ["TikTok", "Instagram", "WhatsApp"]
  winningProductKeywords: string; // for search queries
}

const LOCALES: Record<string, KaiLocale> = {
  NG: {
    country: "NG",
    countryName: "Nigeria",
    currency: "NGN",
    currencySymbol: "₦",
    exchangeRateToUSD: 1580,
    language: "English (Nigerian)",
    tiktokRegion: "Nigeria TikTok",
    searchSuffix: "Nigeria 2026",
    marketContext: `
MARKET: NIGERIA
- Currency: ₦ (Naira). $1 = ~₦1,580. Always show prices in Naira.
- Payday: 25th-7th of each month. Customers have money then — push premium products.
  Mid-month (8th-24th): customers are budget-conscious — push value and bundles.
- Major markets: Alaba Market (electronics), Balogun Market (fashion), Computer Village (tech), Aba (manufacturing), Onitsha (wholesale)
- Trust is everything: Nigerians are cautious online. Social proof, reviews, and guarantees convert.
- Payment: Most customers pay by bank transfer or card. Paystack is the go-to. OPay/Kuda growing fast.
- Shopping platforms competitors: Jumia, Konga, Jiji
- Top cities for ecommerce: Lagos, Abuja, Port Harcourt, Kano, Ibadan
- Social media: Instagram is #1 for product discovery. TikTok Nigeria is exploding. WhatsApp for broadcasts.
- TikTok trends to watch: #Naijafashion #Lagosstyle #Nigerianfood #Abuja #NaijaBeauty
- Seasonal peaks: December (Christmas), November (Black Friday), August (back to school), Eid periods
- Language: Nigerian English. Can mix in Pidgin where appropriate. Never formal UK English.
- Typical buyer: 22-40 years old, urban, middle class, Instagram/TikTok user
- What sells: Hair products, fashion, beauty, electronics, kitchen gadgets, health supplements, baby products
- What doesn't sell: Very niche Western products with no local context
`,
    paymentMethods: ["Paystack", "Bank Transfer", "USSD", "OPay", "Kuda", "Flutterwave"],
    topCities: ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Benin City", "Enugu"],
    majorMarkets: ["Alaba Market", "Balogun Market", "Computer Village", "Aba", "Onitsha", "Trade Fair"],
    shoppingPlatforms: ["Jumia Nigeria", "Konga", "Jiji", "FairMoney Shop"],
    socialPlatforms: ["TikTok Nigeria", "Instagram Nigeria", "Twitter Nigeria (X)", "WhatsApp"],
    seasonalEvents: {
      "1": "New Year deals. January slump. Push budget products.",
      "2": "Valentine's Day (Feb 14). Gift sets, couples items trending.",
      "3": "End of Q1. Easter prep beginning. Seasonal fashion picks up.",
      "4": "Easter. Fashion, food, gifts trending. Post-Easter clearance.",
      "5": "Children's Day (May 27). Kids products trending late May.",
      "6": "Mid-year. School resumption in some states. Back-to-school supplies.",
      "7": "Summer vibes. Fashion and lifestyle strong.",
      "8": "School resumption. Bags, stationery, uniforms. Fashion also strong.",
      "9": "End of Q3. Sallah period — festive spending if applicable.",
      "10": "October. Tech products trending. Pre-Christmas planning begins.",
      "11": "BLACK FRIDAY (last Friday). Biggest shopping month. Start campaigns early.",
      "12": "CHRISTMAS AND NEW YEAR. Gifts, fashion, food peak. Highest revenue month.",
    },
    paydayContext: "Payday in Nigeria is typically 25th-31st and 1st-7th of the month. This is when customers have the most money to spend. Push premium products, new arrivals, and higher-ticket items during this window. Mid-month (8th-24th): customers are more budget-conscious — push bundles, value deals, and discounts.",
    trustSignals: "Nigerian buyers need: customer photos/videos, exact delivery timeline, clear return policy, payment security badge, WhatsApp contact number, and verified reviews. Trust is harder to earn here but once earned, customers are loyal.",
    typicalMargin: "50-70%",
    adPlatforms: ["TikTok Nigeria", "Instagram Nigeria", "Facebook Nigeria", "WhatsApp Broadcast"],
    winningProductKeywords: "trending products Nigeria Naija best selling 2026",
  },

  GH: {
    country: "GH",
    countryName: "Ghana",
    currency: "GHS",
    currencySymbol: "GH₵",
    exchangeRateToUSD: 15.2,
    language: "English (Ghanaian)",
    tiktokRegion: "Ghana TikTok",
    searchSuffix: "Ghana 2026",
    marketContext: `
MARKET: GHANA
- Currency: GH₵ (Cedi). $1 = ~GH₵15.20
- Capital: Accra (main market). Kumasi second biggest.
- Major platforms: Jumia Ghana, Tonaton, Meqasa
- Payment: Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo) is king in Ghana. Also bank cards.
- Social: TikTok Ghana, Instagram Ghana, Facebook Ghana
- Popular categories: Fashion, beauty, electronics, food items, baby products
- Events: Christmas, Easter, Independence Day (March 6), Homowo festival
- Language: Ghanaian English. Occasionally Twi references work well.
`,
    paymentMethods: ["MTN Mobile Money", "Vodafone Cash", "AirtelTigo Money", "Bank Card", "Paystack"],
    topCities: ["Accra", "Kumasi", "Takoradi", "Tamale"],
    majorMarkets: ["Makola Market", "Kejetia Market", "Kantamanto"],
    shoppingPlatforms: ["Jumia Ghana", "Tonaton", "Melcom"],
    socialPlatforms: ["TikTok Ghana", "Instagram Ghana", "Facebook Ghana", "WhatsApp"],
    seasonalEvents: {
      "3": "Independence Day (March 6). Patriotic products sell well.",
      "12": "Christmas. Biggest shopping period.",
    },
    paydayContext: "End of month (25th-5th) is peak spending. Mid-month is slower — push value products.",
    trustSignals: "Mobile Money payment option is a huge trust signal in Ghana. Reviews, delivery timeline, and WhatsApp contact also critical.",
    typicalMargin: "45-65%",
    adPlatforms: ["TikTok Ghana", "Instagram Ghana", "Facebook Ghana", "WhatsApp"],
    winningProductKeywords: "trending products Ghana Accra best selling 2026",
  },

  KE: {
    country: "KE",
    countryName: "Kenya",
    currency: "KES",
    currencySymbol: "KSh",
    exchangeRateToUSD: 130,
    language: "English (Kenyan)",
    tiktokRegion: "Kenya TikTok",
    searchSuffix: "Kenya Nairobi 2026",
    marketContext: `
MARKET: KENYA
- Currency: KSh (Kenyan Shilling). $1 = ~KSh130
- Capital: Nairobi (main market). Mombasa second.
- Payment: M-Pesa is KING in Kenya. Almost everyone uses it. Accept M-Pesa to maximise sales.
- Major platforms: Jumia Kenya, Kilimall, Jiji Kenya
- Social: TikTok Kenya, Instagram Kenya, Twitter Kenya
- Popular: Fashion, electronics, beauty, food, kitchen, baby
- Events: Jamhuri Day (Dec 12), Madaraka Day (June 1), Christmas
- Language: Kenyan English. Swahili greetings/phrases resonate.
`,
    paymentMethods: ["M-Pesa", "Airtel Money", "Bank Card", "Paystack"],
    topCities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
    majorMarkets: ["Gikomba Market", "Toi Market", "Eastleigh"],
    shoppingPlatforms: ["Jumia Kenya", "Kilimall", "Jiji Kenya"],
    socialPlatforms: ["TikTok Kenya", "Instagram Kenya", "Twitter Kenya", "WhatsApp"],
    seasonalEvents: {
      "6": "Madaraka Day (June 1). Mid-year promotions.",
      "12": "Jamhuri Day + Christmas. Biggest shopping period.",
    },
    paydayContext: "End of month is peak. M-Pesa transactions spike. Mid-month push value deals.",
    trustSignals: "M-Pesa payment option is critical trust signal in Kenya. Reviews, fast delivery, and return policy also important.",
    typicalMargin: "45-65%",
    adPlatforms: ["TikTok Kenya", "Instagram Kenya", "Facebook Kenya", "WhatsApp"],
    winningProductKeywords: "trending products Kenya Nairobi best selling 2026",
  },

  ZA: {
    country: "ZA",
    countryName: "South Africa",
    currency: "ZAR",
    currencySymbol: "R",
    exchangeRateToUSD: 18.5,
    language: "English (South African)",
    tiktokRegion: "South Africa TikTok",
    searchSuffix: "South Africa 2026",
    marketContext: `
MARKET: SOUTH AFRICA
- Currency: R (Rand). $1 = ~R18.50
- Main cities: Johannesburg, Cape Town, Durban
- Payment: Credit/debit cards, EFT, PayFast, Yoco
- Platforms: Takealot (dominant), Gumtree, OLX
- Social: TikTok SA, Instagram SA, Facebook SA
- Popular: Fashion, electronics, beauty, home, sports
- Events: Black Friday huge in SA, Christmas, Heritage Day (Sept 24)
`,
    paymentMethods: ["Credit Card", "EFT", "PayFast", "Yoco", "SnapScan"],
    topCities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth"],
    majorMarkets: ["Johannesburg CBD", "China Mall", "Durban Market"],
    shoppingPlatforms: ["Takealot", "Gumtree", "OLX South Africa", "Superbalist"],
    socialPlatforms: ["TikTok South Africa", "Instagram SA", "Facebook SA", "Twitter SA"],
    seasonalEvents: {
      "9": "Heritage Day (Sept 24). Cultural products sell well.",
      "11": "Black Friday. Biggest shopping event in SA.",
      "12": "Christmas and year-end holidays.",
    },
    paydayContext: "25th of month is main payday for most workers. Push premium products then.",
    trustSignals: "South African buyers are security-conscious. SSL badges, clear return policy, and established payment gateways (PayFast, Peach Payments) build trust.",
    typicalMargin: "40-60%",
    adPlatforms: ["TikTok SA", "Instagram SA", "Facebook SA", "Google Ads"],
    winningProductKeywords: "trending products South Africa Joburg Cape Town best selling 2026",
  },

  GB: {
    country: "GB",
    countryName: "United Kingdom",
    currency: "GBP",
    currencySymbol: "£",
    exchangeRateToUSD: 0.79,
    language: "English (British)",
    tiktokRegion: "UK TikTok",
    searchSuffix: "UK 2026",
    marketContext: `
MARKET: UNITED KINGDOM
- Currency: £ (Pound). £1 = ~$1.27
- Payment: Stripe, PayPal, Apple Pay, Google Pay, Klarna (BNPL popular)
- Major platforms: Amazon UK, eBay UK, ASOS, Etsy UK
- Social: TikTok UK, Instagram UK
- Popular: Fashion, beauty, tech, homeware, health
- Events: Black Friday, Boxing Day, Christmas, Valentine's, Mother's Day
`,
    paymentMethods: ["Stripe", "PayPal", "Apple Pay", "Google Pay", "Klarna"],
    topCities: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow"],
    majorMarkets: ["Amazon UK", "eBay UK"],
    shoppingPlatforms: ["Amazon UK", "ASOS", "eBay UK", "Etsy UK"],
    socialPlatforms: ["TikTok UK", "Instagram UK", "Pinterest UK"],
    seasonalEvents: {
      "2": "Valentine's Day. Gifts, flowers, experiences.",
      "3": "Mother's Day (3rd Sunday March in UK).",
      "11": "Black Friday and Cyber Monday.",
      "12": "Christmas and Boxing Day sales.",
    },
    paydayContext: "End of month is typical payday. Push premium items then. BNPL (Klarna, Clearpay) popular for higher-ticket items.",
    trustSignals: "UK buyers trust: Trustpilot reviews, clear returns (14-day minimum by law), secure payments, professional design. VAT compliance important.",
    typicalMargin: "35-55%",
    adPlatforms: ["TikTok UK", "Instagram UK", "Google Ads UK", "Facebook UK"],
    winningProductKeywords: "trending products UK dropshipping best selling 2026",
  },

  US: {
    country: "US",
    countryName: "United States",
    currency: "USD",
    currencySymbol: "$",
    exchangeRateToUSD: 1,
    language: "English (American)",
    tiktokRegion: "US TikTok Shop",
    searchSuffix: "USA 2026",
    marketContext: `
MARKET: UNITED STATES
- Currency: $ (Dollar)
- Payment: Stripe, PayPal, Apple Pay, Google Pay, Afterpay, Affirm
- Platforms: Amazon, Shopify stores, TikTok Shop US
- Social: TikTok Shop, Instagram Shopping, Pinterest
- Popular: Health & wellness, beauty, tech, fashion, home
- Events: Black Friday/Cyber Monday, Prime Day, Back to School, Christmas
`,
    paymentMethods: ["Stripe", "PayPal", "Apple Pay", "Google Pay", "Afterpay", "Affirm"],
    topCities: ["New York", "Los Angeles", "Chicago", "Houston", "Atlanta"],
    majorMarkets: ["Amazon", "Walmart"],
    shoppingPlatforms: ["Amazon", "eBay", "TikTok Shop", "Etsy"],
    socialPlatforms: ["TikTok Shop USA", "Instagram Shopping", "Pinterest USA"],
    seasonalEvents: {
      "7": "Amazon Prime Day. Discounts and deals.",
      "8": "Back to School season.",
      "11": "Black Friday and Cyber Monday. Biggest events of year.",
      "12": "Christmas holiday season.",
    },
    paydayContext: "Biweekly paychecks common (1st and 15th, or every other Friday). End-of-month also peak.",
    trustSignals: "US buyers need: fast shipping (2-5 days expected), easy returns (30 days minimum), reviews on Google/Trustpilot, clear sizing charts.",
    typicalMargin: "40-60%",
    adPlatforms: ["TikTok Shop", "Meta Ads", "Google Shopping", "Pinterest Ads"],
    winningProductKeywords: "trending products USA dropshipping TikTok shop best selling 2026",
  },
};

// ── Get locale for a country code ─────────────────────────────
export function getLocale(countryCode: string): KaiLocale {
  return LOCALES[countryCode?.toUpperCase()] || LOCALES.NG;
}

// ── Build country-specific search query ───────────────────────
// This is the KEY function — every search must use this
export function localiseQuery(baseQuery: string, countryCode: string): string {
  const locale = getLocale(countryCode);

  // Replace generic terms with localised ones
  let query = baseQuery
    .replace(/\btiktok\b/gi, locale.tiktokRegion)
    .replace(/\binstagram\b/gi, `Instagram ${locale.countryName}`)
    .replace(/\btrending\b/gi, `trending ${locale.countryName}`)
    .replace(/\bwinning products?\b/gi, `winning products ${locale.countryName}`)
    .replace(/\bbest sell(ing)?\b/gi, `best selling ${locale.countryName}`)
    .replace(/\bmarket\b/gi, `${locale.countryName} market`)
    .replace(/\bonline (store|shop)\b/gi, `online store ${locale.countryName}`);

  // Append country suffix if not already present
  const countryMentioned = new RegExp(locale.countryName, "i").test(query);
  if (!countryMentioned) {
    query = `${query} ${locale.searchSuffix}`;
  }

  return query;
}

// ── Get current seasonal context ─────────────────────────────
export function getSeasonalContext(countryCode: string): string {
  const locale = getLocale(countryCode);
  const month  = String(new Date().getMonth() + 1);
  const seasonal = locale.seasonalEvents[month] || "Standard trading period.";

  return `${seasonal} ${locale.paydayContext}`;
}

// ── Build complete market context for system prompt ───────────
export function buildMarketContext(countryCode: string): string {
  const locale = getLocale(countryCode);
  const seasonal = getSeasonalContext(countryCode);

  return `${locale.marketContext}

CURRENT SEASONAL CONTEXT:
${seasonal}

DEFAULT BEHAVIOUR:
- ALL product suggestions must be relevant to ${locale.countryName}
- ALL price examples must use ${locale.currencySymbol} (${locale.currency})
- ALL trend references must be from ${locale.countryName} social media
- Search queries automatically target ${locale.countryName}
- Ad copy must use ${locale.countryName} language/slang/references
- Shipping advice must reflect ${locale.countryName} carriers and timelines
- If owner asks about "trends" without specifying country → search ${locale.tiktokRegion}
- ONLY deviate from ${locale.countryName} context if owner explicitly requests another country

PAYMENT CONTEXT:
Recommended payment methods for ${locale.countryName}: ${locale.paymentMethods.join(", ")}

TRUST SIGNALS FOR ${locale.countryName.toUpperCase()}:
${locale.trustSignals}

TYPICAL MARGINS IN ${locale.countryName.toUpperCase()}:
${locale.typicalMargin} on most products

AD PLATFORMS THAT WORK IN ${locale.countryName.toUpperCase()}:
${locale.adPlatforms.join(", ")}`;
}
