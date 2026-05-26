/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router sudah default di Next.js 14, tidak perlu experimental.appDir
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
