/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  // Additional Next.js config options
  typescript: {
    // Dangerously allow production builds to succeed even with errors (for now)
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; 