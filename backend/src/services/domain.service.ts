// DropOS Domain Service
// Powered by Namecheap Reseller API
// Merchants search, buy, and connect domains — all inside DropOS
// We handle payment (Paystack) + registration + DNS config automatically

import axios from "axios";
import { prisma } from "../config/database";

const NC_API  = process.env.NAMECHEAP_API_URL  || "https://api.namecheap.com/xml.response";
const NC_USER = process.env.NAMECHEAP_USERNAME  || "";
const NC_KEY  = process.env.NAMECHEAP_API_KEY   || "";
const NC_IP   = process.env.NAMECHEAP_CLIENT_IP || ""; // your server's IP

// Exchange rates (keep updated or fetch from API)
const USD_TO_NGN = 1600;

// Search for available domains
export async function searchDomains(keyword: string): Promise<any[]> {
  // Clean keyword
  const clean = keyword.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 63);

  // If Namecheap keys not configured, return mock data
  if (!NC_KEY || !NC_USER) {
    return generateMockResults(clean);
  }

  try {
    const tlds = [".com", ".store", ".shop", ".ng", ".co", ".net", ".org", ".io"];
    const domains = tlds.map(t => `${clean}${t}`).join(",");

    const res = await axios.get(NC_API, {
      params: {
        ApiUser: NC_USER, ApiKey: NC_KEY, UserName: NC_USER,
        ClientIp: NC_IP, Command: "namecheap.domains.check",
        DomainList: domains,
      },
    });

    // Parse XML response
    const xml   = res.data;
    const items = parseNamecheapDomainCheck(xml, clean);
    return items;
  } catch (e) {
    console.error("Namecheap API error:", e);
    return generateMockResults(clean);
  }
}

// Get pricing for a domain
export async function getDomainPrice(domain: string): Promise<{
  usd: number; ngn: number; yearsAvailable: number[];
}> {
  const tld = domain.split(".").slice(1).join(".");
  const pricing: Record<string, number> = {
    "com": 12.98, "store": 4.98, "shop": 4.98, "ng": 14.98,
    "co": 29.98,  "net": 11.98, "org": 10.98, "io": 39.98,
    "com.ng": 8.00,
  };
  const usd = pricing[tld] || 12.98;
  return { usd, ngn: Math.round(usd * USD_TO_NGN), yearsAvailable:[1,2,3] };
}

// Register a domain and auto-configure DNS
export async function registerDomain(params: {
  storeId:    string;
  domain:     string;
  years:      number;
  firstName:  string;
  lastName:   string;
  email:      string;
  phone:      string;
  address:    string;
  city:       string;
  country:    string;
  postalCode: string;
}): Promise<{ success: boolean; registrarOrderId?: string; error?: string }> {

  if (!NC_KEY || !NC_USER) {
    // Mock success for dev/testing
    await saveDomainToStore(params.storeId, params.domain, `mock_${Date.now()}`, params.years);
    return { success:true, registrarOrderId:`mock_${Date.now()}` };
  }

  try {
    // Set DNS to Vercel for auto-routing to store
    const dns1 = "ns1.vercel-dns.com";
    const dns2 = "ns2.vercel-dns.com";

    const res = await axios.get(NC_API, {
      params: {
        ApiUser:    NC_USER, ApiKey: NC_KEY, UserName: NC_USER,
        ClientIp:   NC_IP,  Command: "namecheap.domains.create",
        DomainName: params.domain, Years: params.years,
        // Registrant info
        RegistrantFirstName: params.firstName, RegistrantLastName: params.lastName,
        RegistrantEmailAddress: params.email,   RegistrantPhone: params.phone,
        RegistrantAddress1: params.address,     RegistrantCity: params.city,
        RegistrantStateProvince: params.city,   RegistrantPostalCode: params.postalCode,
        RegistrantCountry: params.country || "NG",
        // Tech, admin = same person
        TechFirstName: params.firstName,        TechLastName: params.lastName,
        TechEmailAddress: params.email,         TechPhone: params.phone,
        TechAddress1: params.address,           TechCity: params.city,
        TechStateProvince: params.city,         TechPostalCode: params.postalCode,
        TechCountry: params.country || "NG",
        AdminFirstName: params.firstName,       AdminLastName: params.lastName,
        AdminEmailAddress: params.email,        AdminPhone: params.phone,
        AdminAddress1: params.address,          AdminCity: params.city,
        AdminStateProvince: params.city,        AdminPostalCode: params.postalCode,
        AdminCountry: params.country || "NG",
        // Custom nameservers → Vercel
        Nameservers: `${dns1},${dns2}`,
      },
    });

    const xml = res.data;
    if (xml.includes("IsSuccess=\"true\"")) {
      const orderId = extractXmlValue(xml, "OrderID");
      await saveDomainToStore(params.storeId, params.domain, orderId, params.years);
      return { success:true, registrarOrderId:orderId };
    }
    const error = extractXmlValue(xml, "Error") || "Registration failed";
    return { success:false, error };
  } catch (e: any) {
    return { success:false, error:e.message };
  }
}

// Renew a domain
export async function renewDomain(domain: string, years: number) {
  if (!NC_KEY) return { success:false, error:"Not configured" };
  const res = await axios.get(NC_API, {
    params: { ApiUser:NC_USER, ApiKey:NC_KEY, UserName:NC_USER, ClientIp:NC_IP, Command:"namecheap.domains.renew", DomainName:domain, Years:years },
  });
  return { success: res.data.includes("IsSuccess=\"true\"") };
}

// Get domains for a store
export async function getStoreDomains(storeId: string) {
  const store = await prisma.store.findUnique({
    where:  { id:storeId },
    select: { customDomain:true, domain:true },
  });
  return {
    customDomain: store?.customDomain || null,
    subdomain:    store?.domain || null,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function saveDomainToStore(storeId: string, domain: string, orderId: string, years: number) {
  await prisma.store.update({
    where: { id:storeId },
    data:  { customDomain:domain },
  });
}

function extractXmlValue(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`));
  return m ? m[1] : "";
}

function parseNamecheapDomainCheck(xml: string, base: string): any[] {
  const results: any[] = [];
  const matches = xml.matchAll(/DomainCheckResult Domain="([^"]+)" Available="([^"]+)"[^\/]*\/>/g);
  for (const m of matches) {
    const domain    = m[1];
    const available = m[2] === "true";
    const tld       = domain.replace(base, "");
    const prices: Record<string,number> = { ".com":12.98, ".store":4.98, ".shop":4.98, ".ng":14.98, ".co":29.98, ".net":11.98, ".io":39.98, ".org":10.98 };
    const usd = prices[tld] || 12.98;
    results.push({ domain, available, usd, ngn:Math.round(usd * USD_TO_NGN), tld });
  }
  return results;
}

function generateMockResults(base: string): any[] {
  const tlds = [
    { tld:".com",   usd:12.98, popular:true  },
    { tld:".store", usd:4.98,  popular:true  },
    { tld:".shop",  usd:4.98,  popular:false },
    { tld:".ng",    usd:14.98, popular:false },
    { tld:".co",    usd:29.98, popular:false },
    { tld:".net",   usd:11.98, popular:false },
    { tld:".io",    usd:39.98, popular:false },
  ];
  return tlds.map(t => ({
    domain:    `${base}${t.tld}`,
    available: Math.random() > 0.25,
    usd:       t.usd,
    ngn:       Math.round(t.usd * USD_TO_NGN),
    tld:       t.tld,
    popular:   t.popular,
  }));
}
