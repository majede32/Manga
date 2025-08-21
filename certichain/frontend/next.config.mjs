/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  async rewrites() {
    const backend = process.env.BACKEND_URL
    if (!backend) return []
    return [
      {
        source: '/api/_proxy/:path*',
        destination: `${backend}/:path*`,
      },
    ]
  },
}

export default nextConfig

