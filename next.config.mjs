/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['firebase-admin'],
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
