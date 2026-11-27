import type { NextConfig } from "next";
import { legacyRedirects } from "./lib/redirects";

// The staff area and the API are kept out of search results with `noindex`, not with robots.txt: a
// crawler can only obey `noindex` on a page it is allowed to fetch (see app/robots.ts). The robots
// tag in the page covers the HTML; this header also covers a redirect and the JSON the API sends.
const NOINDEX = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Arena serves the app through an e2b.app preview origin; allow its dev HMR
  // and font resources instead of having Next.js block them as cross-origin.
  allowedDevOrigins: ["*.e2b.app"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "infeara.com" }],
        destination: "https://www.infeara.com/:path*",
        permanent: true,
      },
      ...legacyRedirects,
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      { source: "/admin/:path*", headers: NOINDEX },
      { source: "/api/:path*", headers: NOINDEX },
    ];
  },
};

export default nextConfig;
