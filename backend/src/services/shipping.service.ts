// Shipping Service — DHL + Local Carriers
// Calculates rates based on weight, zone, and carrier

interface RateRequest {
  origin:      string; // e.g. "Lagos"
  destination: string; // e.g. "Abuja"
  weightKg:    number;
  valueNGN:    number;
  storeId:     string;
}

interface ShippingRate {
  carrier:      string;
  service:      string;
  price:        number;
  currency:     string;
  estimatedDays: string;
  trackable:    boolean;
  logo:         string;
}

// Nigerian zones with realistic rates
const NG_ZONES: Record<string, Record<string, number>> = {
  "Lagos": {
    "Lagos":       500,
    "Ogun":        800,
    "Oyo":         1200,
    "Abuja":       2500,
    "Rivers":      3000,
    "Kano":        3500,
    "Nationwide":  2000,
  },
  "DEFAULT": {
    "Same State":   800,
    "Nearby State": 1500,
    "Nationwide":   2500,
  },
};

export async function calculateShippingRates(req: RateRequest): Promise<ShippingRate[]> {
  const rates: ShippingRate[] = [];
  const weight = Math.max(req.weightKg || 0.5, 0.1);
  const isSameCity = req.origin === req.destination;
  const isLagos = req.origin?.includes("Lagos") || req.destination?.includes("Lagos");

  // GIG Logistics (most popular in Nigeria)
  const gigBase = isSameCity ? 700 : (isLagos ? 1800 : 2500);
  const gigRate = gigBase + (weight > 1 ? (weight - 1) * 500 : 0);
  rates.push({
    carrier: "GIG Logistics", service: isSameCity ? "Same Day" : "Express",
    price: Math.round(gigRate), currency: "NGN",
    estimatedDays: isSameCity ? "Same day" : "1-2 days",
    trackable: true, logo: "🚚",
  });

  // DHL Express Nigeria
  const dhlBase = 4500;
  const dhlRate = dhlBase + (weight * 1200);
  rates.push({
    carrier: "DHL Express", service: "Economy Select",
    price: Math.round(dhlRate), currency: "NGN",
    estimatedDays: "2-3 days",
    trackable: true, logo: "✈️",
  });

  // Fedex / Aramex
  const fedexRate = 5500 + (weight * 1500);
  rates.push({
    carrier: "Aramex", service: "Express",
    price: Math.round(fedexRate), currency: "NGN",
    estimatedDays: "2-4 days",
    trackable: true, logo: "📦",
  });

  // Kwik (Lagos only)
  if (isLagos) {
    rates.push({
      carrier: "Kwik", service: isSameCity ? "Instant (30min)" : "Same Day",
      price: isSameCity ? 900 : 1500, currency: "NGN",
      estimatedDays: isSameCity ? "30-60 minutes" : "Same day",
      trackable: true, logo: "⚡",
    });
  }

  // Budget / Standard
  const stdRate = isSameCity ? 400 : 1200 + (weight * 200);
  rates.push({
    carrier: "Standard Delivery", service: "Economy",
    price: Math.round(stdRate), currency: "NGN",
    estimatedDays: isSameCity ? "1-2 days" : "3-5 days",
    trackable: false, logo: "📮",
  });

  // Free shipping if order value is high enough
  if (req.valueNGN >= 50000) {
    rates.unshift({
      carrier: "Free Shipping", service: "Standard",
      price: 0, currency: "NGN",
      estimatedDays: "3-5 days",
      trackable: false, logo: "🎁",
    });
  }

  return rates.sort((a, b) => a.price - b.price);
}

export function estimateDeliveryDate(days: string): string {
  const match = days.match(/(\d+)/);
  if (!match) return "TBD";
  const d = new Date();
  d.setDate(d.getDate() + parseInt(match[1]) + 1); // +1 for processing
  return d.toLocaleDateString("en-NG", { weekday:"short", day:"numeric", month:"short" });
}
