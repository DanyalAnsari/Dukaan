/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Transpile packages that need it
  transpilePackages: ['lucide-react'],

  // Vercel optimization: trailing slash for better caching
  trailingSlash: false,

  // Increase max file size for PDF generation
  // maxInitialBodySize: 2mb (default)

  // Skip TypeScript type checking during build (use pnpm typecheck separately)
  // TypeScript errors will still fail the build when running tsc
  ignoreBuildErrors: false,
};

export default nextConfig;