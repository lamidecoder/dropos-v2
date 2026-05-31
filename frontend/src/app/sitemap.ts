import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://droposhq.com";
  const now = new Date();

  return [
    { url: base,                    lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/pricing`,       lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/features`,      lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/how-it-works`,  lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`,         lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`,       lastModified: now, changeFrequency: "yearly",  priority: 0.6 },
    { url: `${base}/security`,      lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${base}/privacy`,       lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${base}/terms`,         lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${base}/cookies`,       lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/auth/login`,    lastModified: now, changeFrequency: "yearly",  priority: 0.7 },
    { url: `${base}/auth/register`, lastModified: now, changeFrequency: "yearly",  priority: 0.8 },
    { url: `${base}/kiro`,          lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
