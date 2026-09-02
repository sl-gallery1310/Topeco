/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // les photos produits/articles sont servies depuis /public/uploads en local
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    // les Server Actions traitent les 3 formulaires du site
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
