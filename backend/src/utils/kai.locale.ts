// ── KIRO Global Locale Intelligence Engine ────────────────────────────────────
// Single source of truth for every country's ecommerce context.
// KIRO uses this to feel native in every market — not just translated.

export interface KaiLocale {
  country: string;
  countryName: string;
  currency: string;
  currencySymbol: string;
  exchangeRateToUSD: number;
  language: string;
  timezone: string;
  tiktokRegion: string;
  searchSuffix: string;
  paymentMethods: string[];
  topCities: string[];
  majorMarkets: string[];
  shoppingPlatforms: string[];
  socialPlatforms: string[];
  adPlatforms: string[];
  seasonalEvents: Record<string, string>;
  paydayContext: string;
  trustSignals: string;
  typicalMargin: string;
  winningProductKeywords: string;
  codEnabled: boolean;         // Cash on Delivery is common
  mobileFirst: boolean;        // Majority mobile shoppers
  whatsappCommerce: boolean;   // WhatsApp is a sales channel
  influencerCulture: string;   // how influencer marketing works here
  pricingPsychology: string;   // how buyers think about prices
  topProductCategories: string[];
  shippingReality: string;     // what delivery actually looks like
  ecommerceMaturity: "emerging" | "growing" | "mature" | "advanced";
  marketIntelligence: string;  // full market briefing for KIRO
}

const LOCALES: Record<string, KaiLocale> = {

  // ── NIGERIA ────────────────────────────────────────────────────────────────
  NG: {
    country: "NG", countryName: "Nigeria",
    currency: "NGN", currencySymbol: "₦", exchangeRateToUSD: 1600,
    language: "English (Nigerian Pidgin blend)", timezone: "Africa/Lagos",
    tiktokRegion: "Nigeria TikTok", searchSuffix: "Nigeria 2026",
    paymentMethods: ["Paystack", "Flutterwave", "Bank Transfer", "USSD", "OPay", "Kuda", "PalmPay"],
    topCities: ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Benin City"],
    majorMarkets: ["Alaba Market (electronics)", "Balogun (fashion)", "Computer Village", "Aba (manufacturing)", "Onitsha (wholesale)", "Lagos Island"],
    shoppingPlatforms: ["Jumia", "Konga", "Jiji", "Payporte"],
    socialPlatforms: ["Instagram", "TikTok", "WhatsApp", "Twitter/X"],
    adPlatforms: ["Instagram", "TikTok", "Facebook", "WhatsApp Broadcast", "Google"],
    seasonalEvents: {
      "Jan": "New Year deals, school resumption prep",
      "Feb": "Valentine's Day — beauty, gifts, accessories",
      "Mar": "Q1 slump — push value offers",
      "Apr": "Easter/Eid shopping window",
      "May": "Children's Day (May 27) — toys, school items; Eid season",
      "Jun": "Mid-year sales, rainy season products",
      "Jul": "Rainy season, indoor products",
      "Aug": "Back to school — stationery, bags, uniforms",
      "Sep": "Post-school rush slows, prep for Q4",
      "Oct": "Pre-Christmas stockpiling, Black Friday prep",
      "Nov": "Black Friday (biggest Nigerian online shopping day)",
      "Dec": "Christmas — highest month, premium products, hampers, fashion"
    },
    paydayContext: "Nigerian salaries hit 25th–28th monthly. Push premium and aspirational products then. Mid-month (8th–24th) = budget mode — push bundles and value.",
    trustSignals: "Reviews from real Nigerians, WhatsApp testimonials, 'confirmed order' screenshots, return policy, money-back guarantee, known payment methods",
    typicalMargin: "40-80% depending on niche",
    winningProductKeywords: "hair, wigs, beauty, skincare, fashion, native fabric, electronics, phone accessories, kitchen gadgets, baby products, health supplements",
    codEnabled: false, mobileFirst: true, whatsappCommerce: true,
    influencerCulture: "Micro-influencers (10k–100k followers) have highest trust and conversion. Skit makers on TikTok. Instagram fashion/beauty creators. Avoid big celebrities — too expensive and low conversion.",
    pricingPsychology: "₦9,999 feels much cheaper than ₦10,000. Nigerians compare with Jumia prices — price within 10-15% to beat them. Bundles with perceived savings convert very well. Free shipping above a threshold works well.",
    topProductCategories: ["Hair & Wigs", "Beauty & Skincare", "Fashion & Clothing", "Phone Accessories", "Kitchen Gadgets", "Baby Products", "Health Supplements", "Men's Native Wear"],
    shippingReality: "Lagos: 24–48hrs via GIG, Kwik, Sendbox. Abuja: 2–4 days. Other states: 3–7 days. COD rare — trust issues. Customers expect tracking. Door delivery standard in major cities.",
    ecommerceMaturity: "growing",
    marketIntelligence: `NIGERIA MARKET INTELLIGENCE:
Ecommerce is exploding but trust is the #1 barrier. Buyers fear scams — overcome with reviews, guarantees, known payment gateways.
WhatsApp is the most effective sales channel. An Instagram post drives awareness; WhatsApp closes the sale.
Payday (25th–28th) = spend mode. Mid-month = value-hunting mode. Plan campaigns around this.
TikTok Nigeria is the fastest-growing discovery platform. Short product demos under 60 seconds convert.
Jumia and Konga are competitors but have trust from consumers — beat them on service and story.
Top categories right now: hair, beauty, fashion (especially Gen Z styles), kitchen gadgets (air fryers huge), phone accessories, health & wellness.
Children's Day (May 27) is a massive gifting event. Eid is significant for fashion. December is biggest month.
Nigerian buyers need to see "proof" — reviews, unboxings, before/after. Social proof is everything.
Currency sensitivity: NGN devaluation means customers compare USD prices. Position quality over price.`
  },

  // ── GHANA ──────────────────────────────────────────────────────────────────
  GH: {
    country: "GH", countryName: "Ghana",
    currency: "GHS", currencySymbol: "₵", exchangeRateToUSD: 14.5,
    language: "English (Ghanaian)", timezone: "Africa/Accra",
    tiktokRegion: "Ghana TikTok", searchSuffix: "Ghana 2026",
    paymentMethods: ["MTN Mobile Money (MoMo)", "Vodafone Cash", "AirtelTigo Money", "Hubtel", "Paystack"],
    topCities: ["Accra", "Kumasi", "Tamale", "Takoradi"],
    majorMarkets: ["Makola Market", "Kejetia Market (Kumasi)", "Madina Market"],
    shoppingPlatforms: ["Jumia Ghana", "Tonaton", "Jiji Ghana"],
    socialPlatforms: ["Instagram", "TikTok", "WhatsApp", "Facebook"],
    adPlatforms: ["Facebook", "Instagram", "TikTok", "WhatsApp"],
    seasonalEvents: {
      "Jan": "New Year",
      "Feb": "Valentine's",
      "Mar": "Independence Day (Mar 6) — patriotic products",
      "Jun": "VGMA season — fashion peaks",
      "Aug": "GUBA Awards, fashion events",
      "Dec": "Christmas + Homowo festival — highest month"
    },
    paydayContext: "Government workers paid end of month. Private sector varies. Push premium products last week of month.",
    trustSignals: "MoMo payment confirmation, real customer photos, delivery proof",
    typicalMargin: "40-70%",
    winningProductKeywords: "kente, fashion, beauty, electronics, phone accessories, kitchen",
    codEnabled: false, mobileFirst: true, whatsappCommerce: true,
    influencerCulture: "Instagram and TikTok influencers growing fast. Ghanaian diaspora influence is strong.",
    pricingPsychology: "MoMo payments make small amounts feel easier. Bundle pricing popular.",
    topProductCategories: ["Fashion & Kente", "Beauty & Skincare", "Electronics", "Phone Accessories", "Kitchen Gadgets"],
    shippingReality: "Accra: 24–48hrs. Kumasi: 2–3 days. Other regions: 4–7 days. Delivery verification common.",
    ecommerceMaturity: "emerging",
    marketIntelligence: `GHANA MARKET INTELLIGENCE:
MoMo (Mobile Money) is king — MTN MoMo is how most people pay. Not card. Not bank transfer.
WhatsApp selling is mainstream. Sellers post on WhatsApp status, buyers DM to buy.
Accra is the primary market (50% of ecommerce). Kumasi is growing fast.
Fashion (especially Kente and African prints) and beauty are top categories.
Trust is built through repeat purchases, not just reviews. Word-of-mouth is powerful.`
  },

  // ── KENYA ──────────────────────────────────────────────────────────────────
  KE: {
    country: "KE", countryName: "Kenya",
    currency: "KES", currencySymbol: "KSh", exchangeRateToUSD: 130,
    language: "English/Swahili blend", timezone: "Africa/Nairobi",
    tiktokRegion: "Kenya TikTok", searchSuffix: "Kenya 2026",
    paymentMethods: ["M-Pesa", "Airtel Money", "Visa/Mastercard", "Pesapal"],
    topCities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru"],
    majorMarkets: ["Gikomba Market", "City Market", "Marikiti Market"],
    shoppingPlatforms: ["Jumia Kenya", "Jiji Kenya", "Masoko"],
    socialPlatforms: ["Twitter/X", "Instagram", "TikTok", "Facebook", "WhatsApp"],
    adPlatforms: ["Facebook", "Instagram", "Google", "Twitter/X"],
    seasonalEvents: {
      "Feb": "Valentine's",
      "Jun": "Madaraka Day (Jun 1)",
      "Oct": "Mashujaa Day",
      "Dec": "Christmas + Jamhuri Day (Dec 12)"
    },
    paydayContext: "Most Kenyans paid last working day of month. M-Pesa payments spike then.",
    trustSignals: "M-Pesa payment confirmation, real reviews, till number verification",
    typicalMargin: "35-65%",
    winningProductKeywords: "fashion, electronics, beauty, shoes, baby products, kitchen",
    codEnabled: false, mobileFirst: true, whatsappCommerce: true,
    influencerCulture: "Twitter/X highly influential in Kenya. Instagram and TikTok growing fast.",
    pricingPsychology: "M-Pesa makes micropayments easy. Installment buying common for big items.",
    topProductCategories: ["Fashion & Shoes", "Electronics", "Beauty", "Baby Products", "Kitchen Gadgets"],
    shippingReality: "Nairobi: same-day to 24hrs. Mombasa: 1–2 days. Upcountry: 3–5 days. M-Pesa payment before dispatch is standard.",
    ecommerceMaturity: "growing",
    marketIntelligence: `KENYA MARKET INTELLIGENCE:
M-Pesa is the default payment method — not cards. If you can't accept M-Pesa, you lose most customers.
Twitter/X is Kenya's most active social platform for brands and conversation. Very different from other African markets.
Nairobi is tech-forward — young professionals, heavy smartphone users, price-conscious but quality-aware.
Delivery speed matters more than in other markets. Same-day delivery in Nairobi is competitive advantage.`
  },

  // ── SOUTH AFRICA ───────────────────────────────────────────────────────────
  ZA: {
    country: "ZA", countryName: "South Africa",
    currency: "ZAR", currencySymbol: "R", exchangeRateToUSD: 18.5,
    language: "English (SA)", timezone: "Africa/Johannesburg",
    tiktokRegion: "South Africa TikTok", searchSuffix: "South Africa 2026",
    paymentMethods: ["Credit/Debit Card", "PayFast", "Peach Payments", "SnapScan", "Zapper", "Ozow EFT"],
    topCities: ["Johannesburg", "Cape Town", "Durban", "Pretoria"],
    majorMarkets: ["Sandton City", "V&A Waterfront", "Canal Walk"],
    shoppingPlatforms: ["Takealot", "Superbalist", "Checkers Sixty60", "Bidorbuy"],
    socialPlatforms: ["Instagram", "TikTok", "Facebook", "Twitter/X"],
    adPlatforms: ["Facebook", "Instagram", "Google", "TikTok"],
    seasonalEvents: {
      "Apr": "Easter deals",
      "Jun": "Mandela Day build-up, mid-year sales",
      "Jul": "Winter sale (SA is southern hemisphere)",
      "Nov": "Black Friday (massive in SA)",
      "Dec": "Christmas + Reconciliation Day"
    },
    paydayContext: "Most SA workers paid 25th–last working day. Government grants paid early month. Push accordingly.",
    trustSignals: "Trusted payment badges, Takealot-style guarantees, returns policy, SA business registration",
    typicalMargin: "30-60%",
    winningProductKeywords: "fashion, beauty, electronics, home decor, fitness, outdoor",
    codEnabled: false, mobileFirst: true, whatsappCommerce: false,
    influencerCulture: "Instagram influencers very effective. SA TikTok growing fast. Brand authenticity matters.",
    pricingPsychology: "R99 vs R100 effective. Installment options (PayJustNow, Payflex) convert high-ticket. Free shipping above R500–R750 standard expectation.",
    topProductCategories: ["Fashion & Apparel", "Beauty & Personal Care", "Electronics", "Home & Living", "Sports & Fitness"],
    shippingReality: "CPT/JHB: 1–3 days via The Courier Guy, Aramex, Pudo. Other areas: 3–5 days. Pudo lockers growing fast. Tracking expected.",
    ecommerceMaturity: "mature",
    marketIntelligence: `SOUTH AFRICA MARKET INTELLIGENCE:
Takealot is the Amazon of SA — your primary competitor and benchmark. Beat them on niche and service.
Black Friday is the single biggest shopping day in SA — plan 6 weeks ahead.
Payment instalments (PayJustNow, Payflex) significantly increase average order value.
Cape Town and Johannesburg are main markets. Township ecommerce growing fast via mobile.
Load-shedding (power cuts) affects delivery logistics — plan buffer time.`
  },

  // ── UNITED KINGDOM ─────────────────────────────────────────────────────────
  GB: {
    country: "GB", countryName: "United Kingdom",
    currency: "GBP", currencySymbol: "£", exchangeRateToUSD: 0.79,
    language: "English (British)", timezone: "Europe/London",
    tiktokRegion: "UK TikTok Shop", searchSuffix: "UK 2026",
    paymentMethods: ["Stripe", "PayPal", "Klarna", "Clearpay", "Apple Pay", "Google Pay", "Bank Transfer"],
    topCities: ["London", "Manchester", "Birmingham", "Edinburgh", "Leeds"],
    majorMarkets: ["Oxford Street", "Westfield", "Trafford Centre"],
    shoppingPlatforms: ["Amazon UK", "ASOS", "eBay UK", "Etsy", "TikTok Shop UK"],
    socialPlatforms: ["TikTok", "Instagram", "Facebook", "Pinterest"],
    adPlatforms: ["Google", "Facebook", "Instagram", "TikTok", "Pinterest"],
    seasonalEvents: {
      "Jan": "January sales — massive clearance buying",
      "Feb": "Valentine's Day",
      "Mar": "Mother's Day UK (3rd Sunday March)",
      "Apr": "Easter",
      "Jun": "Father's Day",
      "Oct": "Halloween (growing fast)",
      "Nov": "Black Friday + Cyber Monday (biggest)",
      "Dec": "Christmas (peak) + Boxing Day sales"
    },
    paydayContext: "UK salaries typically paid last Friday or 28th. Spending spikes immediately after. Christmas bonus in December = highest discretionary spend.",
    trustSignals: "Secure payment badges, GDPR compliance, Royal Mail tracking, returns within 30 days, UK company number, Trustpilot reviews",
    typicalMargin: "25-55%",
    winningProductKeywords: "homeware, fashion, beauty, pets, sustainable, gifting, health & wellness",
    codEnabled: false, mobileFirst: true, whatsappCommerce: false,
    influencerCulture: "TikTok UK is the biggest influencer commerce platform. Instagram for aspirational lifestyle. YouTubers for reviews. Authenticity beats polish.",
    pricingPsychology: "£9.99 psychological pricing works. Free shipping above £25–£50 is expected. Klarna/Clearpay converts high-ticket items. VAT must be included in displayed price.",
    topProductCategories: ["Fashion & Apparel", "Beauty & Skincare", "Home & Living", "Health & Wellness", "Pet Products", "Sustainable Products", "Gifts"],
    shippingReality: "Next-day delivery expected for premium. Royal Mail 2nd class (2–3 days) is minimum. Click & Collect popular. Free returns expected.",
    ecommerceMaturity: "advanced",
    marketIntelligence: `UK MARKET INTELLIGENCE:
TikTok Shop is the fastest-growing ecommerce channel in UK — product demos go viral and convert directly.
BNPL (Klarna, Clearpay) is not optional for high-ticket items — it's expected.
Sustainability matters more than anywhere else — eco-friendly positioning converts.
Amazon UK is dominant but niche stores win on service, story, and community.
VAT (20%) must be included in all prices displayed to UK consumers — legal requirement.
Black Friday and Christmas are the two seasons that make or break UK ecommerce businesses.
Reviews on Trustpilot, Google, and product pages are critical. UK shoppers research before buying.`
  },

  // ── UNITED STATES ──────────────────────────────────────────────────────────
  US: {
    country: "US", countryName: "United States",
    currency: "USD", currencySymbol: "$", exchangeRateToUSD: 1,
    language: "English (American)", timezone: "America/New_York",
    tiktokRegion: "TikTok Shop US", searchSuffix: "USA 2026",
    paymentMethods: ["Stripe", "PayPal", "Shopify Payments", "Apple Pay", "Google Pay", "Affirm", "Klarna", "Afterpay"],
    topCities: ["New York", "Los Angeles", "Chicago", "Houston", "Miami", "Atlanta"],
    majorMarkets: ["Amazon", "Walmart", "Target"],
    shoppingPlatforms: ["Amazon", "Shopify stores", "Etsy", "TikTok Shop", "Walmart Marketplace"],
    socialPlatforms: ["TikTok", "Instagram", "Pinterest", "YouTube", "Facebook"],
    adPlatforms: ["Google", "Meta (Facebook/Instagram)", "TikTok", "Pinterest", "YouTube"],
    seasonalEvents: {
      "Feb": "Valentine's Day",
      "Mar": "St Patrick's Day, Spring sales",
      "May": "Mother's Day (2nd Sunday May), Memorial Day sales",
      "Jun": "Father's Day, Pride Month",
      "Jul": "Independence Day (4th July) sales",
      "Sep": "Labor Day sales",
      "Oct": "Halloween",
      "Nov": "Black Friday + Cyber Monday (biggest events)",
      "Dec": "Christmas, Hanukkah, end-of-year gifting"
    },
    paydayContext: "US workers paid weekly, bi-weekly, or monthly depending on employer. No single payday spike. Focus on seasonal events instead.",
    trustSignals: "Secure checkout badges, BBB accreditation, fast shipping promises, free returns, real reviews on Google/Amazon/Trustpilot",
    typicalMargin: "20-60% depending on niche — US market very competitive",
    winningProductKeywords: "wellness, fitness, beauty, home decor, pet, sustainable, tech accessories, personalized gifts",
    codEnabled: false, mobileFirst: true, whatsappCommerce: false,
    influencerCulture: "TikTok Shop is transforming ecommerce — products go viral overnight. Instagram for premium/lifestyle. YouTube for reviews and tutorials. Nano-influencers (1k–10k) often higher ROI.",
    pricingPsychology: "$X.99 pricing standard. Free shipping (or Prime-like) is expected. BNPL growing fast especially Gen Z. Email coupon codes convert well.",
    topProductCategories: ["Health & Wellness", "Beauty & Skincare", "Home & Kitchen", "Pet Products", "Fitness", "Sustainable Products", "Tech Accessories", "Personalized Gifts"],
    shippingReality: "2-day shipping is Amazon standard — you need 3–5 day minimum to compete. USPS, UPS, FedEx. Free shipping above $35–$50 is standard expectation.",
    ecommerceMaturity: "advanced",
    marketIntelligence: `US MARKET INTELLIGENCE:
Amazon is the benchmark — if you can't match their speed, win on niche, story, and community.
TikTok Shop is the biggest opportunity right now — product demos and reviews convert at 3–5× Instagram.
BFCM (Black Friday/Cyber Monday) can make 20–30% of annual revenue in 4 days. Plan months ahead.
Email marketing has highest ROI of any channel in US ecommerce. Build the list from day one.
DTC (Direct-to-Consumer) brands win by building communities, not just selling products.
Subscription models (subscribe & save) create predictable revenue and reduce CAC.
US customers expect fast, free shipping and easy returns — factor this into pricing.`
  },

  // ── INDIA ──────────────────────────────────────────────────────────────────
  IN: {
    country: "IN", countryName: "India",
    currency: "INR", currencySymbol: "₹", exchangeRateToUSD: 84,
    language: "Hindi/English blend (Hinglish)", timezone: "Asia/Kolkata",
    tiktokRegion: "Instagram Reels India", searchSuffix: "India 2026",
    paymentMethods: ["UPI (GPay, PhonePe, Paytm)", "Debit/Credit Card", "NetBanking", "COD", "EMI", "Razorpay"],
    topCities: ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata"],
    majorMarkets: ["Sarojini Nagar (Delhi)", "Colaba (Mumbai)", "Commercial Street (Bengaluru)"],
    shoppingPlatforms: ["Flipkart", "Amazon India", "Meesho", "Myntra", "Nykaa", "Snapdeal"],
    socialPlatforms: ["Instagram", "YouTube", "WhatsApp", "Facebook", "Moj", "Josh"],
    adPlatforms: ["Google", "Meta (Facebook/Instagram)", "YouTube", "ShareChat"],
    seasonalEvents: {
      "Jan": "Republic Day (Jan 26) sales",
      "Mar": "Holi — colors, sweets, fashion",
      "Apr": "Gudi Padwa / Ugadi / Ram Navami — gifting",
      "Aug": "Independence Day (Aug 15), Raksha Bandhan — gifting",
      "Sep": "Navratri — fashion, jewelry",
      "Oct": "Dussehra → Diwali (BIGGEST) — gifting, fashion, electronics, gold",
      "Nov": "Post-Diwali + Bhai Dooj, Big Billion Days (Flipkart)",
      "Dec": "Christmas + year-end sales"
    },
    paydayContext: "Indian salaries paid 1st–7th of month. Government employees on 1st. Large purchase decisions often at month start.",
    trustSignals: "COD option (huge trust builder), easy returns, brand name, customer reviews in Indian languages, GST invoice",
    typicalMargin: "30-65%",
    winningProductKeywords: "ethnic wear, kurta, saree, beauty, skincare, electronics, home decor, fitness, baby products, books",
    codEnabled: true, mobileFirst: true, whatsappCommerce: true,
    influencerCulture: "YouTube review culture is massive. Instagram for fashion/beauty. WhatsApp for viral sharing. Regional language influencers often outperform Hindi ones.",
    pricingPsychology: "₹999 vs ₹1000 very effective. EMI options critical for items above ₹5000. COD increases conversion but also return rate. Offer GST invoice for business buyers.",
    topProductCategories: ["Ethnic Wear & Fashion", "Beauty & Skincare", "Electronics & Accessories", "Home & Kitchen", "Baby & Kids", "Books & Stationery", "Fitness & Health"],
    shippingReality: "Metro cities: 1–3 days via Blue Dart, Delhivery, Xpressbees. Tier 2/3 cities: 4–7 days. COD available through major courier partners. Returns expected within 7–30 days.",
    ecommerceMaturity: "growing",
    marketIntelligence: `INDIA MARKET INTELLIGENCE:
COD (Cash on Delivery) is still 50%+ of orders — if you don't offer it, you lose half your market.
UPI (Google Pay, PhonePe, Paytm) is the fastest-growing payment method — instant and trusted.
Diwali season (Oct–Nov) is the single biggest ecommerce event — equivalent to US BFCM but bigger emotionally.
Regional language content converts significantly better than English-only. Hindi, Tamil, Telugu matter.
Meesho is a reseller platform that drives volume in Tier 2/3 cities. WhatsApp resellers are a growth channel.
Flipkart Big Billion Days and Amazon Great Indian Festival are the competitive benchmarks.
Reviews in Hindi and regional languages build trust faster than English reviews.
Price sensitivity is high — but premium positioning works in metro cities for the right products.`
  },

  // ── UAE ─────────────────────────────────────────────────────────────────────
  AE: {
    country: "AE", countryName: "United Arab Emirates",
    currency: "AED", currencySymbol: "د.إ", exchangeRateToUSD: 0.27,
    language: "English/Arabic", timezone: "Asia/Dubai",
    tiktokRegion: "UAE TikTok", searchSuffix: "UAE Dubai 2026",
    paymentMethods: ["Credit/Debit Card", "Apple Pay", "PayPal", "Cash on Delivery", "Tabby (BNPL)", "Tamara"],
    topCities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman"],
    majorMarkets: ["Dubai Mall", "Mall of the Emirates", "Gold Souk", "Deira"],
    shoppingPlatforms: ["Amazon.ae", "Noon", "Namshi", "Carrefour UAE"],
    socialPlatforms: ["Instagram", "TikTok", "Snapchat", "YouTube"],
    adPlatforms: ["Instagram", "Google", "TikTok", "Snapchat", "YouTube"],
    seasonalEvents: {
      "Jan": "DSF (Dubai Shopping Festival) — massive",
      "Feb": "Valentine's Day — luxury gifts",
      "Mar": "Ramadan (date varies) — BIGGEST for food, fashion, gifts",
      "Apr": "Eid Al-Fitr — premium gifting",
      "Jun": "Dubai Summer Surprises — deals",
      "Jun-Jul": "Eid Al-Adha — luxury, fashion",
      "Nov": "White Friday (UAE Black Friday equivalent)",
      "Dec": "Christmas (expat market) + Year-end sales"
    },
    paydayContext: "Government employees paid 25th. Private sector varies. Expat community (80% of UAE) sends remittances at month end — disposable income timing varies.",
    trustSignals: "Brand recognition, luxury packaging, fast delivery, COD option, bilingual content (Arabic/English), easy returns",
    typicalMargin: "35-70%",
    winningProductKeywords: "luxury, perfume, abaya, fashion, skincare, electronics, home decor, gifting",
    codEnabled: true, mobileFirst: true, whatsappCommerce: false,
    influencerCulture: "Instagram is primary. Luxury influencers have massive reach. Arab influencers for local audience, expat influencers for English-speaking community. Snapchat effective for Arabic-speaking Emiratis.",
    pricingPsychology: "Price is secondary to quality and brand in UAE. Premium positioning works well. Tabby/Tamara (BNPL) converts high-ticket items. Gold and luxury products command huge premiums.",
    topProductCategories: ["Luxury & Premium Products", "Perfume & Oud", "Fashion & Abayas", "Skincare & Beauty", "Electronics", "Home Decor", "Gifting & Hampers"],
    shippingReality: "Dubai: same-day to next-day expected. Abu Dhabi: 1–2 days. COD available and popular. Premium packaging expected — it's part of the product experience.",
    ecommerceMaturity: "mature",
    marketIntelligence: `UAE MARKET INTELLIGENCE:
Dubai Shopping Festival (January) is the biggest retail event — plan massive promotions.
Ramadan is a critical selling period — product demand shifts to dates, sweets, fashion, home decor, gifting. Night shopping peaks.
UAE is 80% expat — you're marketing to a multicultural audience. English AND Arabic content required.
Luxury positioning works extremely well. UAE customers associate price with quality.
Noon is UAE's homegrown marketplace and a direct competitor. Amazon.ae is dominant but growing.
Snapchat has unusually high usage in UAE/Gulf — important for reaching Emiratis.
Free returns and exchange is expected — factor into pricing.`
  },

  // ── BRAZIL ─────────────────────────────────────────────────────────────────
  BR: {
    country: "BR", countryName: "Brazil",
    currency: "BRL", currencySymbol: "R$", exchangeRateToUSD: 5.0,
    language: "Portuguese (Brazilian)", timezone: "America/Sao_Paulo",
    tiktokRegion: "Brazil TikTok", searchSuffix: "Brasil 2026",
    paymentMethods: ["Pix", "Boleto Bancário", "Credit Card (12x installments)", "Mercado Pago", "PicPay"],
    topCities: ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Brasília", "Salvador"],
    majorMarkets: ["Brás (SP)", "CEASA", "Mercado Livre"],
    shoppingPlatforms: ["Mercado Livre", "Amazon Brazil", "Shopee Brazil", "Magazine Luiza", "Americanas"],
    socialPlatforms: ["Instagram", "TikTok", "WhatsApp", "YouTube", "Facebook"],
    adPlatforms: ["Meta (Facebook/Instagram)", "Google", "TikTok", "YouTube"],
    seasonalEvents: {
      "Feb": "Carnival — beauty, fashion, accessories",
      "May": "Mother's Day (2nd Sunday May) — #1 gifting event in Brazil",
      "Jun": "Festa Junina — regional products",
      "Aug": "Father's Day — electronics, fashion",
      "Oct": "Children's Day (Oct 12) — toys, games",
      "Nov": "Black Friday (huge in Brazil)",
      "Dec": "Christmas — biggest month"
    },
    paydayContext: "Brazilian workers paid by CLT rules: salary by 5th of month, bonus (13th salary) in November/December. Holiday bonuses create huge spending spike.",
    trustSignals: "Mercado Livre seller rating, Reclame Aqui reputation, clear installment pricing, fast shipping guarantee, 30-day return",
    typicalMargin: "30-60%",
    winningProductKeywords: "moda, beleza, eletrônicos, fitness, casa, bebê, pets",
    codEnabled: false, mobileFirst: true, whatsappCommerce: true,
    influencerCulture: "YouTube is dominant for reviews. Instagram for fashion/beauty. TikTok growing fast. Brazilians trust influencers highly — authenticity key.",
    pricingPsychology: "Installments are everything — 12x sem juros (12x no interest) is the magic phrase. Pix instant payment getting popular. R$X,99 pricing standard.",
    topProductCategories: ["Fashion & Clothing", "Beauty & Makeup", "Electronics", "Fitness & Sports", "Baby Products", "Pets", "Home & Kitchen"],
    shippingReality: "São Paulo/Rio: 1–3 days via Correios, Jadlog, Total Express. Other states: 5–15 days. Brazil is huge — shipping costs can exceed product cost. Retirada (pickup) popular in larger cities.",
    ecommerceMaturity: "growing",
    marketIntelligence: `BRAZIL MARKET INTELLIGENCE:
Pix (instant payment) launched by central bank — now fastest-growing payment method. Zero fees, instant, trusted.
Installments (parcelamento) are non-negotiable for items above R$100. "12x sem juros" converts.
Mercado Livre is the dominant marketplace — treat it as your main competitor.
Mother's Day is the biggest gifting event in Brazil — larger than Christmas for many categories.
WhatsApp Business is used heavily for customer service and sales. Brazilians expect WhatsApp contact.
13th salary (December) creates massive year-end spending surge.
Portuguese content only — Brazilians don't respond to Portuguese (Portugal) or Spanish.`
  },

  // ── CANADA ─────────────────────────────────────────────────────────────────
  CA: {
    country: "CA", countryName: "Canada",
    currency: "CAD", currencySymbol: "CA$", exchangeRateToUSD: 1.38,
    language: "English (Canadian) / French (Quebec)", timezone: "America/Toronto",
    tiktokRegion: "Canada TikTok", searchSuffix: "Canada 2026",
    paymentMethods: ["Credit Card", "Interac e-Transfer", "PayPal", "Apple Pay", "Shopify Payments", "Afterpay"],
    topCities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
    majorMarkets: ["Eaton Centre (Toronto)", "Pacific Centre (Vancouver)", "Carrefour Laval (Montreal)"],
    shoppingPlatforms: ["Amazon Canada", "Walmart Canada", "Shopify stores", "Etsy"],
    socialPlatforms: ["Instagram", "TikTok", "Facebook", "Pinterest", "YouTube"],
    adPlatforms: ["Google", "Facebook/Instagram", "TikTok", "Pinterest"],
    seasonalEvents: {
      "Feb": "Valentine's Day + Family Day (Ontario)",
      "May": "Victoria Day long weekend — outdoor products",
      "Jul": "Canada Day (Jul 1) — patriotic, summer",
      "Sep": "Labour Day — back to school peak",
      "Oct": "Thanksgiving Canada (2nd Monday Oct)",
      "Nov": "Black Friday + Cyber Monday",
      "Dec": "Christmas (biggest month)"
    },
    paydayContext: "Canadian workers paid bi-weekly or semi-monthly. Child benefit payments on 20th of month. Spending peaks mid-month.",
    trustSignals: "Canadian business registration, secure checkout, fast domestic shipping, bilingual site (French for Quebec), easy returns",
    typicalMargin: "25-55%",
    winningProductKeywords: "outdoor, winter gear, sustainable, beauty, home, health, fitness, Canadian-made",
    codEnabled: false, mobileFirst: false, whatsappCommerce: false,
    influencerCulture: "Instagram and TikTok growing. Canadian shoppers trust reviews. 'Canadian-made' is a conversion trigger.",
    pricingPsychology: "CA$X.99 pricing standard. Free shipping above CA$50–$75 expected. Transparency about taxes and duties important.",
    topProductCategories: ["Outdoor & Winter Gear", "Health & Wellness", "Beauty & Skincare", "Home & Decor", "Sustainable Products", "Pet Products"],
    shippingReality: "Toronto/Vancouver/Montreal: 2–5 days via Canada Post, UPS, FedEx. Rural areas: 5–14 days. Cross-border from US common but duties create friction.",
    ecommerceMaturity: "mature",
    marketIntelligence: `CANADA MARKET INTELLIGENCE:
Quebec requires French language options — bilingual is required legally for Canadian businesses.
'Canadian-made' products command premium pricing and strong customer loyalty.
Shopify is Canadian-born — strong ecosystem with local payment and shipping integrations.
Extreme weather (harsh winters) means outdoor, winter sports, and home products are year-round categories.
Free shipping expectation is very similar to US — factor into pricing or offer threshold.`
  },

  // ── AUSTRALIA ──────────────────────────────────────────────────────────────
  AU: {
    country: "AU", countryName: "Australia",
    currency: "AUD", currencySymbol: "A$", exchangeRateToUSD: 1.54,
    language: "English (Australian)", timezone: "Australia/Sydney",
    tiktokRegion: "Australia TikTok", searchSuffix: "Australia 2026",
    paymentMethods: ["Credit/Debit Card", "PayPal", "Afterpay", "Zip", "Apple Pay", "Google Pay"],
    topCities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
    majorMarkets: ["Queen Victoria Market (Melbourne)", "Paddy's Markets (Sydney)"],
    shoppingPlatforms: ["Amazon Australia", "eBay Australia", "Catch", "Kogan", "The Iconic"],
    socialPlatforms: ["Instagram", "TikTok", "Facebook", "Pinterest", "YouTube"],
    adPlatforms: ["Google", "Facebook/Instagram", "TikTok", "Pinterest"],
    seasonalEvents: {
      "Feb": "Valentine's Day",
      "Mar": "Mardi Gras (Sydney) — inclusive brands",
      "Apr": "Easter + Anzac Day",
      "Jun": "End of Financial Year (EOFY) sales — massive",
      "Sep": "AFL Grand Final — sports",
      "Oct": "Melbourne Cup — fashion, racing",
      "Nov": "Click Frenzy + Black Friday",
      "Dec": "Christmas + Boxing Day (huge sales)"
    },
    paydayContext: "Australians typically paid weekly or fortnightly. Government welfare payments fortnightly. EOFY (June 30) creates a huge buying spike for tax-deductible items.",
    trustSignals: "Australian Business Number (ABN), ACCC compliance, Afterpay availability, fast shipping promise, 30-day returns",
    typicalMargin: "30-60%",
    winningProductKeywords: "sustainable, outdoor, beach, beauty, fashion, health, pet, home",
    codEnabled: false, mobileFirst: true, whatsappCommerce: false,
    influencerCulture: "Instagram and TikTok are primary. Australians are skeptical of overt ads — authenticity converts. Micro-influencers very effective.",
    pricingPsychology: "Afterpay is expected for items above A$50. 'Free shipping over A$X' standard. Boxing Day sales are price-competitive — plan discounts ahead.",
    topProductCategories: ["Outdoor & Beach Products", "Sustainable & Eco", "Beauty & Skincare", "Health & Wellness", "Pet Products", "Fashion & Activewear", "Home & Garden"],
    shippingReality: "Sydney/Melbourne/Brisbane: 2–5 days. Perth is very remote — 5–10 days extra. Australia Post is primary. StarTrack for express.",
    ecommerceMaturity: "mature",
    marketIntelligence: `AUSTRALIA MARKET INTELLIGENCE:
EOFY (End of Financial Year, June 30) is a massive spending event for business buyers — tax deductions drive purchases.
Afterpay is Australian-born and widely expected. Not offering it is a competitive disadvantage.
Boxing Day (Dec 26) sales can rival Black Friday — Australians love post-Christmas bargains.
Sustainability is increasingly important — eco-friendly positioning commands premium prices.
Perth and Darwin are geographically isolated — factor in higher shipping costs and longer times.`
  },

  // ── PAKISTAN ───────────────────────────────────────────────────────────────
  PK: {
    country: "PK", countryName: "Pakistan",
    currency: "PKR", currencySymbol: "₨", exchangeRateToUSD: 278,
    language: "Urdu/English blend", timezone: "Asia/Karachi",
    tiktokRegion: "Pakistan TikTok", searchSuffix: "Pakistan 2026",
    paymentMethods: ["Easypaisa", "JazzCash", "Bank Transfer", "COD", "Credit Card (limited)"],
    topCities: ["Karachi", "Lahore", "Islamabad", "Faisalabad", "Rawalpindi"],
    majorMarkets: ["Liberty Market (Lahore)", "Zainab Market (Karachi)", "Aabpara (Islamabad)"],
    shoppingPlatforms: ["Daraz", "Amazon (limited)", "OLX Pakistan"],
    socialPlatforms: ["TikTok", "Facebook", "Instagram", "YouTube", "WhatsApp"],
    adPlatforms: ["Facebook", "TikTok", "Google", "YouTube"],
    seasonalEvents: {
      "Feb": "Valentine's Day (growing)",
      "Mar": "Ramadan prep",
      "Apr": "Eid Al-Fitr — BIGGEST shopping event",
      "Jun": "Eid Al-Adha — second biggest",
      "Aug": "Independence Day (Aug 14) — patriotic",
      "Nov": "Daraz 11.11 — biggest sale",
      "Dec": "Year-end deals"
    },
    paydayContext: "Government sector paid 1st. Private sector varies. Eid bonuses drive massive spending spikes.",
    trustSignals: "COD option (critical), Daraz seller rating, real customer reviews, brand recognition",
    typicalMargin: "40-70%",
    winningProductKeywords: "clothes, fabric, beauty, electronics, mobile phones, appliances",
    codEnabled: true, mobileFirst: true, whatsappCommerce: true,
    influencerCulture: "TikTok is exploding in Pakistan. Facebook pages drive commerce. WhatsApp groups for sharing deals.",
    pricingPsychology: "COD is king — customers don't trust paying upfront. Price sensitivity very high. Bundle offers work well.",
    topProductCategories: ["Clothing & Fashion", "Mobile Phones & Accessories", "Beauty & Personal Care", "Home Appliances", "Kids & Baby"],
    shippingReality: "Karachi/Lahore/Islamabad: 2–4 days via TCS, Leopard, M&P. Other cities: 5–10 days. COD with return option expected.",
    ecommerceMaturity: "emerging",
    marketIntelligence: `PAKISTAN MARKET INTELLIGENCE:
COD is over 60% of orders — not offering it means losing majority of customers.
Daraz.pk is the dominant marketplace (owned by Alibaba) — benchmark for Pakistani ecommerce.
Eid Al-Fitr is the single biggest shopping event — fashion, clothing, and gifting explode.
Daraz 11.11 (November 11) is Pakistan's biggest sale day — comparable to Black Friday.
Mobile commerce dominates — everything is done on smartphones.
Urdu content converts better than English for most product categories outside major cities.`
  },

  // ── EGYPT ──────────────────────────────────────────────────────────────────
  EG: {
    country: "EG", countryName: "Egypt",
    currency: "EGP", currencySymbol: "E£", exchangeRateToUSD: 49,
    language: "Arabic (Egyptian dialect)", timezone: "Africa/Cairo",
    tiktokRegion: "Egypt TikTok", searchSuffix: "Egypt 2026",
    paymentMethods: ["Fawry", "Vodafone Cash", "Bank Card", "COD", "InstaPay", "ValU (BNPL)"],
    topCities: ["Cairo", "Alexandria", "Giza", "Sharm El-Sheikh", "Aswan"],
    majorMarkets: ["Khan El-Khalili (Cairo)", "El-Attaba Market"],
    shoppingPlatforms: ["Jumia Egypt", "Noon Egypt", "Amazon Egypt", "Souq (Amazon)"],
    socialPlatforms: ["Facebook", "TikTok", "Instagram", "YouTube"],
    adPlatforms: ["Facebook", "TikTok", "Google", "Instagram", "YouTube"],
    seasonalEvents: {
      "Jan": "New Year deals",
      "Mar": "Ramadan prep — big",
      "Apr": "Eid Al-Fitr — BIGGEST",
      "Jun": "Eid Al-Adha",
      "Aug": "Back to school",
      "Nov": "White Friday (Black Friday equivalent)",
      "Dec": "Christmas (Christian community)"
    },
    paydayContext: "Government workers paid 1st. Private sector mid-month or end. Eid bonuses are massive spending triggers.",
    trustSignals: "COD option, Fawry payment, Arabic reviews, known brand, easy return guarantee",
    typicalMargin: "40-75%",
    winningProductKeywords: "ملابس, جمال, إلكترونيات, مطبخ, أطفال (fashion, beauty, electronics, kitchen, kids)",
    codEnabled: true, mobileFirst: true, whatsappCommerce: true,
    influencerCulture: "Facebook is #1 in Egypt. TikTok growing fast. Arabic content essential. Celebrity endorsements convert well.",
    pricingPsychology: "COD builds massive trust. E£99 vs E£100 effective. VAT (14%) affects pricing. Bundling popular.",
    topProductCategories: ["Fashion & Clothing", "Beauty & Personal Care", "Electronics", "Kitchen & Home", "Baby Products"],
    shippingReality: "Cairo/Alexandria/Giza: 1–3 days via Aramex, MylerBox, Bosta. Upper Egypt: 5–10 days. COD standard.",
    ecommerceMaturity: "emerging",
    marketIntelligence: `EGYPT MARKET INTELLIGENCE:
Facebook dominates in Egypt — Facebook shops and Facebook ads are primary commerce channels.
COD is still the default expectation — trust in online payment is still developing.
Ramadan is the biggest commercial season — spending on fashion, food, gifts spikes dramatically.
Arabic content is essential — English-only stores lose most of the market.
Fawry (payment kiosk network) is a trusted offline payment method — very Egyptian-specific.
Egypt has one of fastest-growing ecommerce markets in MENA region.`
  },

  // ── INDONESIA ──────────────────────────────────────────────────────────────
  ID: {
    country: "ID", countryName: "Indonesia",
    currency: "IDR", currencySymbol: "Rp", exchangeRateToUSD: 15800,
    language: "Bahasa Indonesia", timezone: "Asia/Jakarta",
    tiktokRegion: "TikTok Shop Indonesia", searchSuffix: "Indonesia 2026",
    paymentMethods: ["GoPay", "OVO", "Dana", "BCA Transfer", "COD", "Kredivo (BNPL)", "Shopee Pay"],
    topCities: ["Jakarta", "Surabaya", "Bandung", "Medan", "Makassar", "Bali"],
    majorMarkets: ["Tanah Abang (Jakarta)", "Kapasan (Surabaya)"],
    shoppingPlatforms: ["Tokopedia", "Shopee Indonesia", "Lazada Indonesia", "TikTok Shop"],
    socialPlatforms: ["TikTok", "Instagram", "YouTube", "WhatsApp", "Facebook"],
    adPlatforms: ["TikTok", "Meta (Facebook/Instagram)", "Google", "YouTube"],
    seasonalEvents: {
      "Mar": "Ramadan begins — massive shopping",
      "Apr": "Lebaran (Eid Al-Fitr) — BIGGEST — fashion, food, gifts, travel",
      "Jun": "Eid Al-Adha",
      "Aug": "Independence Day (Aug 17)",
      "Sep": "Harbolnas 9.9",
      "Oct": "Harbolnas 10.10",
      "Nov": "Harbolnas 11.11 (biggest sale day)",
      "Dec": "Harbolnas 12.12 + Christmas"
    },
    paydayContext: "Indonesian workers paid monthly (last working day). THR (religious bonus) before Lebaran is massive — 1 month salary paid to all workers.",
    trustSignals: "Tokopedia/Shopee seller rating, OS (Official Store) badge, free return, COD option, review photos",
    typicalMargin: "30-65%",
    winningProductKeywords: "fashion, hijab, batik, skincare, elektronik, dapur (kitchen), anak-anak (kids)",
    codEnabled: true, mobileFirst: true, whatsappCommerce: true,
    influencerCulture: "TikTok Shop Indonesia is the world's most advanced TikTok commerce market. Live selling on TikTok converts extremely well. Beauty and fashion influencers dominate.",
    pricingPsychology: "Rp X9.000 pricing effective. Free ongkir (shipping) is expected on most platforms. Flash sale pricing creates urgency. BNPL growing fast.",
    topProductCategories: ["Fashion & Hijab", "Skincare & Beauty", "Electronics", "Kitchen Gadgets", "Baby & Kids", "Health Supplements", "Home Decor"],
    shippingReality: "Java: 1–3 days via JNE, J&T, SiCepat. Outer islands: 5–14 days. COD widely available. Free shipping is standard expectation on marketplace.",
    ecommerceMaturity: "advanced",
    marketIntelligence: `INDONESIA MARKET INTELLIGENCE:
TikTok Shop Indonesia is the most developed TikTok commerce market globally — live selling converts at incredible rates.
Lebaran (Eid Al-Fitr) is Indonesia's biggest commercial event — THR bonuses mean everyone has money. Plan 6 weeks ahead.
Harbolnas (national online shopping days) 11.11 and 12.12 are massive — prepare big discounts.
Tokopedia and Shopee dominate — you're competing with their marketplace. Win on brand and story.
Free shipping (gratis ongkir) is non-negotiable on Indonesian platforms.
Islamic fashion (hijab, modest wear) is a massive and growing category.`
  },
};

// ── Fallback default ────────────────────────────────────────────────────────
const DEFAULT_LOCALE: KaiLocale = LOCALES.NG;

// ── Main export functions ───────────────────────────────────────────────────
export function getLocale(countryCode: string): KaiLocale {
  return LOCALES[countryCode?.toUpperCase()] || DEFAULT_LOCALE;
}

// Detect country from timezone (for frontend use)
export function getLocaleFromTimezone(timezone: string): KaiLocale {
  const map: Record<string, string> = {
    "Africa/Lagos": "NG", "Africa/Accra": "GH", "Africa/Nairobi": "KE",
    "Africa/Johannesburg": "ZA", "Africa/Cairo": "EG",
    "Europe/London": "GB", "America/New_York": "US", "America/Chicago": "US",
    "America/Los_Angeles": "US", "America/Toronto": "CA", "America/Vancouver": "CA",
    "America/Sao_Paulo": "BR", "Australia/Sydney": "AU", "Australia/Melbourne": "AU",
    "Asia/Kolkata": "IN", "Asia/Dubai": "AE", "Asia/Karachi": "PK",
    "Asia/Jakarta": "ID", "Asia/Bangkok": "ID",
  };
  const code = map[timezone] || "NG";
  return getLocale(code);
}

export function localiseQuery(baseQuery: string, countryCode: string): string {
  const loc = getLocale(countryCode);
  return `${baseQuery} ${loc.searchSuffix}`;
}

export function getSeasonalContext(countryCode: string): string {
  const loc = getLocale(countryCode);
  const month = new Date().toLocaleString("en-US", { month: "long" });
  const shortMonth = new Date().toLocaleString("en-US", { month: "short" });
  const monthKey = Object.keys(loc.seasonalEvents).find(k =>
    month.startsWith(k) || k.startsWith(shortMonth)
  );
  return monthKey ? `${loc.countryName} seasonal opportunity: ${loc.seasonalEvents[monthKey]}` : "";
}

export function buildMarketContext(countryCode: string): string {
  const loc = getLocale(countryCode);
  const seasonal = getSeasonalContext(countryCode);

  return `
MARKET: ${loc.countryName} (${loc.currency} ${loc.currencySymbol})
${loc.marketIntelligence}

PAYMENT METHODS: ${loc.paymentMethods.join(", ")}
TOP CITIES: ${loc.topCities.join(", ")}
SHOPPING PLATFORMS: ${loc.shoppingPlatforms.join(", ")}
AD PLATFORMS: ${loc.adPlatforms.join(", ")}
COD EXPECTED: ${loc.codEnabled ? "YES — not offering COD will lose significant sales" : "No"}
WHATSAPP COMMERCE: ${loc.whatsappCommerce ? "YES — WhatsApp is a key sales channel" : "Not primary"}
MOBILE FIRST: ${loc.mobileFirst ? "YES — majority on mobile" : "Balanced desktop/mobile"}
TYPICAL MARGIN: ${loc.typicalMargin}
${seasonal ? `\nCURRENT SEASON: ${seasonal}` : ""}
PRICING PSYCHOLOGY: ${loc.pricingPsychology}
TRUST SIGNALS: ${loc.trustSignals}
INFLUENCER CULTURE: ${loc.influencerCulture}
TOP CATEGORIES: ${loc.topProductCategories.join(", ")}
SHIPPING REALITY: ${loc.shippingReality}
PAYDAY CONTEXT: ${loc.paydayContext}
`.trim();
}
