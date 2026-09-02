import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Les photos produits / articles sont servies depuis /public/uploads en local.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    // Les Server Actions traitent les formulaires du site (RDV, SAV, candidature).
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
