// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "../components/layout/Providers";

export const metadata: Metadata = {
  title:       { default: "DropOS", template: "%s | DropOS" },
  description: "The complete SaaS dropshipping platform. Launch your store in minutes.",
  keywords:    ["dropshipping","ecommerce","saas","store builder"],
  authors:     [{ name: "DropOS" }],
  manifest:    "/manifest.json",
  appleWebApp: {
    capable:        true,
    statusBarStyle: "black-translucent",
    title:          "DropOS",
    startupImage:   "/icons/icon-512.png",
  },
  formatDetection:  { telephone: false },
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         process.env.NEXT_PUBLIC_APP_URL,
    siteName:    "DropOS",
    title:       "DropOS — Build Your Dropshipping Empire",
    description: "The complete SaaS dropshipping platform.",
    images:      [{ url: "/icons/icon-512.png", width: 512, height: 512 }],
  },
  twitter: {
    card:  "summary",
    title: "DropOS",
  },
  icons: {
    icon:    [
      { url: "/icons/icon-32.png",  sizes: "32x32",  type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192",type: "image/png" },
    ],
    apple:   [
      { url: "/icons/icon-152.png", sizes: "152x152" },
      { url: "/icons/icon-192.png", sizes: "192x192" },
    ],
    other:   [
      { rel: "mask-icon", url: "/icons/icon.svg", color: "#7C3AED" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor:         [
    { media: "(prefers-color-scheme: dark)",  color: "#0F172A" },
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
  ],
  width:              "device-width",
  initialScale:       1,
  maximumScale:       1,
  userScalable:       false,
  viewportFit:        "cover",  // safe-area insets (iPhone notch)
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
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
