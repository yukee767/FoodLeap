/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  // Decisão: remover Ignite, cache via Redis com prefixos cache_used: / cache_adm:
  // Rewrites: ordem específica primeiro (evita /api/:path* engolir /api/search)
  async rewrites() {
    return [
      {
        source: '/api/search/:path*',
        destination: `${process.env.SEARCH_SERVICE_URL || 'http://localhost:3002'}/api/search/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${process.env.API_MAIN_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
  output: 'standalone',
};

export default nextConfig;
