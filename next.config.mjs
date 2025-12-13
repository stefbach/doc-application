/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Build trigger comment - Updated: 2025-12-13
  // This ensures Vercel detects the latest changes
}

export default nextConfig
