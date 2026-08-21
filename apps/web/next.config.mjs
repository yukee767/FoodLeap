import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  transpilePackages: ['@foodleap/shared-types'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
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
