import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * PWA: manifest + icons já garantem instalabilidade (standalone, theme_color #ff6b00).
 * Para OFFLINE / Service Worker, descomente o bloco withPWA abaixo.
 *
 * 1) npm i @ducanh2912/next-pwa
 * 2) descomente import + wrapper:
 *
 * import withPWA from '@ducanh2912/next-pwa';
 * const pwa = withPWA({
 *   dest: 'public',
 *   register: true,
 *   disable: process.env.NODE_ENV === 'development',
 *   workboxOptions: {
 *     disableDevLogs: true,
 *   },
 * });
 * export default pwa(nextConfig);
 */
// import withPWA from '@ducanh2912/next-pwa'; // <- opcional, ver comentário acima

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
  async headers() {
    return [
      {
        source: '/manifest.webmanifest',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/apple-touch-icon.png',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  output: 'standalone',
};

export default nextConfig;
// Para habilitar Service Worker, troque a linha acima por:
// export default withPWA(nextConfig);
