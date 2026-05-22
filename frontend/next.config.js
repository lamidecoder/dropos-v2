/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint:     { ignoreDuringBuilds: true },
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

  // Subdomain → store path rewrites
  // Runs at CDN edge, no middleware needed
  async rewrites() {
    return {
      beforeFiles: [
        // midelymah320.droposhq.com/* → /store/midelymah320/*
        // Vercel wildcard: :store matches the subdomain label
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "(?<store>.+)\\.droposhq\\.com",
            },
          ],
          destination: "/store/:store/:path*",
        },
      ],
    };
  },
};

module.exports = nextConfig;
