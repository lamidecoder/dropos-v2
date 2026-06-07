import type { Metadata } from "next";

const API = process.env.NEXT_PUBLIC_API_URL?.replace("/api","") || "https://dropos-v2.onrender.com";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API}/api/stores/public/${params.slug}`, {
      next: { revalidate: 300 }, // cache 5 min
    });
    if (!res.ok) throw new Error("not found");
    const { data: store } = await res.json();

    const title       = store.name || "Online Store";
    const description = store.tagline || store.description || `Shop at ${store.name} — powered by DropOS`;
    const image       = store.logo || store.banner || `${API}/api/stores/public/${params.slug}/og-image`;
    const url         = `https://${params.slug}.droposhq.com`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        type:       "website",
        siteName:   store.name,
        images:     image ? [{ url:image, width:1200, height:630, alt:title }] : undefined,
        locale:     "en_NG",
      },
      twitter: {
        card:        "summary_large_image",
        title,
        description,
        images:      image ? [image] : undefined,
      },
      other: {
        // WhatsApp uses og: tags — these are the fallbacks
        "og:image":       image || "",
        "og:title":       title,
        "og:description": description,
      },
    };
  } catch {
    return {
      title:       "Online Store",
      description: "Shop online — powered by DropOS",
    };
  }
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth:"100vw", overflowX:"hidden" }}>
      {children}
    </div>
  );
}
