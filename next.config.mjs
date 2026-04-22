/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Transpile packages that need it
  transpilePackages: ["lucide-react"],

  // Vercel optimization: trailing slash for better caching
  trailingSlash: false,

  // Increase max file size for PDF generation
  // maxInitialBodySize: 2mb (default)
};

export default nextConfig;
