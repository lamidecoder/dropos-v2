// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "../components/layout/Providers";
import Script from "next/script";

export const metadata: Metadata = {
  title:       { default: "DropOS", template: "%s | DropOS" },
  description: "KIRO builds your dropshipping store, finds winning products, and grows your revenue. Launch in 60 seconds. Free forever.",
  keywords:    ["dropshipping","ecommerce","saas","store builder","KIRO","AI"],
  authors:     [{ name: "DropOS" }],
  manifest:    "/manifest.json",
  appleWebApp: {
    capable:        true,
    statusBarStyle: "black-translucent",
    title:          "DropOS",
    startupImage:   "/icons/icon-512.png",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         process.env.NEXT_PUBLIC_APP_URL,
    siteName:    "DropOS",
    title:       "DropOS - Launch Your Store in 60 Seconds with KIRO",
    description: "KIRO builds your store, finds winning products, and grows your revenue. Launch in 60 seconds. Sell in 90+ countries.",
    images:      [{ url: "/icons/icon-512.png", width: 512, height: 512 }],
  },
  twitter: { card: "summary_large_image", title: "DropOS" },
  icons: {
    icon:  [
      { url: "/favicon.svg",        type: "image/svg+xml"                },
      { url: "/icons/icon-32.png",  sizes: "32x32",  type: "image/png"  },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png"  },
    ],
    apple: [
      { url: "/icons/icon-152.png", sizes: "152x152" },
      { url: "/icons/icon-192.png", sizes: "192x192" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#0F172A" },
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
  ],
  width:        "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit:  "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DropOS" />
        <meta name="application-name" content="DropOS" />
        <meta name="msapplication-TileColor" content="#7C3AED" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
        {/* Service Worker registration */}
        <Script id="sw-register" strategy="afterInteractive">{
          `if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw-custom.js', { scope: '/' })
                .then(r => console.log('[DropOS PWA] Service worker registered:', r.scope))
                .catch(e => console.log('[DropOS PWA] SW registration failed:', e));
            });
          }`
        }</Script>
      </body>
    </html>
  );
}
