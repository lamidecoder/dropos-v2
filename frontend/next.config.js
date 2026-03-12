// next.config.js
const withPWA = require("next-pwa")({
  dest:        "public",
  register:    true,
  skipWaiting: true,
  disable:     process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https?.*\/api\/.*/i,
      handler:    "NetworkFirst",
      options: {
        cacheName:           "api-cache",
        networkTimeoutSeconds: 10,
        expiration:          { maxEntries: 64, maxAgeSeconds: 60 * 5 },
        cacheableResponse:   { statuses: [0, 200] },
      },
    },
    {
      urlPattern: /\.(?:js|css|woff2?|png|jpg|jpeg|gif|svg|ico|webp)$/i,
      handler:    "CacheFirst",
      options: {
        cacheName:  "static-assets",
        expiration: { maxEntries: 256, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      urlPattern: /^\/(?!api\/).*/i,
      handler:    "StaleWhileRevalidate",
      options: {
        cacheName:           "pages",
        expiration:          { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 },
        cacheableResponse:   { statuses: [0, 200] },
      },
    },
  ],
});

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "http",  hostname: "localhost" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    return config;
  },
};

module.exports = withPWA(nextConfig);
